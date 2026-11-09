import { donationRepository } from '../repositories/donationRepository.js';
import { notificationRepository } from '../repositories/notificationRepository.js';
import { Donation } from '../models/Donation.js';
import { DonationRequest } from '../models/DonationRequest.js';
import { StatusHistory } from '../models/StatusHistory.js';
import { withTransaction } from '../utils/transaction.js';
import { AppError } from '../utils/AppError.js';
import { HTTP_STATUS } from '../constants/statusCodes.js';
import { DONATION_STATUS, NOTIFICATION_TYPES } from '../constants/donationEnums.js';

export const calculateUrgency = (donation) => {
  const now = new Date();
  const deadline = new Date(donation.pickupDeadline);
  const expiry = new Date(donation.expiryDate);
  const msRemaining = Math.min(deadline.getTime() - now.getTime(), expiry.getTime() - now.getTime());
  const hoursRemaining = Math.max(0, parseFloat((msRemaining / (1000 * 60 * 60)).toFixed(1)));
  const isExpired = msRemaining <= 0 || donation.status === DONATION_STATUS.EXPIRED;

  let urgency = 'normal';
  if (isExpired) {
    urgency = 'expired';
  } else if (hoursRemaining < 2) {
    urgency = 'critical';
  } else if (hoursRemaining < 6) {
    urgency = 'urgent';
  } else if (hoursRemaining < 24) {
    urgency = 'moderate';
  }

  return {
    urgency,
    hoursRemaining,
    isExpired,
    deadlineISO: deadline.toISOString(),
    expiryISO: expiry.toISOString(),
  };
};

export const donationService = {
  evaluateExpiry: async () => {
    const now = new Date();
    const expiredDonations = await Donation.find({
      status: { $in: [DONATION_STATUS.AVAILABLE, DONATION_STATUS.REQUESTED] },
      $or: [{ pickupDeadline: { $lte: now } }, { expiryDate: { $lte: now } }],
    });

    if (expiredDonations.length === 0) {
      return { expiredCount: 0, expiredIds: [] };
    }

    const expiredIds = expiredDonations.map((d) => d._id);

    await Donation.updateMany({ _id: { $in: expiredIds } }, { status: DONATION_STATUS.EXPIRED });

    const historyDocs = expiredIds.map((id) => ({
      donation: id,
      previousStatus: 'available',
      newStatus: DONATION_STATUS.EXPIRED,
      actionName: 'expired',
      reason: 'Automatic expiry: pickup deadline or expiry threshold reached',
    }));
    await StatusHistory.insertMany(historyDocs).catch(() => {});

    // Notify donors of expired listings
    for (const d of expiredDonations) {
      if (d.donor) {
        await notificationRepository.create({
          recipient: d.donor,
          notificationType: NOTIFICATION_TYPES.SAFETY_ALERT,
          title: 'Donation Listing Expired',
          message: `Your donation "${d.foodName}" has exceeded its pickup deadline or expiry threshold and has been retired.`,
          relatedResource: { resourceType: 'Donation', resourceId: d._id },
        }).catch(() => {});
      }
    }

    return { expiredCount: expiredIds.length, expiredIds };
  },

  createDonation: async (donorUser, donationData) => {
    const prepDate = new Date(donationData.preparationDate);
    const expiryDate = new Date(donationData.expiryDate);
    const pickupDeadline = new Date(donationData.pickupDeadline);

    if (expiryDate <= prepDate) {
      throw new AppError('Expiry date must be after preparation date.', HTTP_STATUS.BAD_REQUEST);
    }

    if (pickupDeadline > expiryDate) {
      throw new AppError('Pickup deadline cannot be later than expiry date.', HTTP_STATUS.BAD_REQUEST);
    }

    if (pickupDeadline <= new Date()) {
      throw new AppError('Pickup deadline must be in the future.', HTTP_STATUS.BAD_REQUEST);
    }

    const { safetyChecklist, coordinates: providedCoords, ...cleanDonationData } = donationData;
    const coordinates = providedCoords || [77.5946, 12.9716];

    return withTransaction(async (session) => {
      const donation = await donationRepository.create(
        {
          ...cleanDonationData,
          donor: donorUser._id,
          location: {
            type: 'Point',
            coordinates,
          },
          status: DONATION_STATUS.AVAILABLE,
        },
        session
      );

      // Support inline food safety checklist submission
      if (safetyChecklist) {
        const checklist = await donationRepository.createChecklist(
          {
            ...safetyChecklist,
            donation: donation._id,
            donor: donorUser._id,
          },
          session
        );
        donation.safetyChecklist = checklist._id;
        await donation.save({ session });
      }

      await donationRepository.recordStatusHistory(
        {
          donation: donation._id,
          previousStatus: 'none',
          newStatus: DONATION_STATUS.AVAILABLE,
          actor: donorUser._id,
          actionName: 'created',
          reason: 'Initial surplus listing creation',
        },
        session
      );

      return donation;
    });
  },

  submitSafetyChecklist: async (donorUser, donationId, checklistData) => {
    const donation = await donationRepository.findById(donationId);
    if (!donation) {
      throw new AppError('Donation listing not found.', HTTP_STATUS.NOT_FOUND);
    }

    if (donation.donor._id.toString() !== donorUser._id.toString()) {
      throw new AppError('Only the donating owner can submit the food safety checklist.', HTTP_STATUS.FORBIDDEN);
    }

    return withTransaction(async (session) => {
      const checklist = await donationRepository.createChecklist(
        {
          ...checklistData,
          donation: donation._id,
          donor: donorUser._id,
        },
        session
      );

      await donationRepository.updateById(
        donation._id,
        {
          safetyChecklist: checklist._id,
        },
        session
      );

      return checklist;
    });
  },

  getDonations: async (filter, pagination) => {
    await donationService.evaluateExpiry();
    const [donations, total] = await donationRepository.findPaginated(filter, pagination);
    const enriched = donations.map((d) => {
      const doc = d.toObject();
      doc.evaluation = calculateUrgency(d);
      return doc;
    });
    return { donations: enriched, total };
  },

  getMyDonations: async (donorUser, filter = {}, pagination = { skip: 0, limit: 10 }) => {
    await donationService.evaluateExpiry();

    const query = { donor: donorUser._id };
    if (filter.status && filter.status !== 'all') {
      query.status = filter.status;
    }
    if (filter.category) {
      query.category = filter.category;
    }
    if (filter.search) {
      query.foodName = { $regex: filter.search, $options: 'i' };
    }

    const [donations, total, allDonorDonations, allDonorDonationIds] = await Promise.all([
      Donation.find(query)
        .populate('safetyChecklist')
        .populate('recipientNGO', 'name email phone')
        .skip(pagination.skip)
        .limit(pagination.limit)
        .sort({ createdAt: -1 }),
      Donation.countDocuments(query),
      Donation.find({ donor: donorUser._id }).select('status quantity'),
      Donation.find({ donor: donorUser._id }).distinct('_id'),
    ]);

    const pendingRequestsCount = await DonationRequest.countDocuments({
      donation: { $in: allDonorDonationIds },
      status: 'pending',
    });

    const totalDonations = allDonorDonations.length;
    const activeDonations = allDonorDonations.filter((d) =>
      ['available', 'requested', 'accepted', 'in_transit'].includes(d.status)
    ).length;
    const completedDonations = allDonorDonations.filter((d) => d.status === 'completed').length;
    const totalRescuedQuantity = allDonorDonations
      .filter((d) => d.status === 'completed')
      .reduce((sum, d) => sum + (d.quantity || 0), 0);

    const enriched = donations.map((d) => {
      const doc = d.toObject();
      doc.evaluation = calculateUrgency(d);
      return doc;
    });

    return {
      donations: enriched,
      total,
      metrics: {
        totalDonations,
        activeDonations,
        completedDonations,
        pendingRequestsCount,
        totalRescuedQuantity,
      },
    };
  },

  getDonationById: async (id) => {
    const donation = await donationRepository.findById(id);
    if (!donation) {
      throw new AppError('Donation not found.', HTTP_STATUS.NOT_FOUND);
    }
    const history = await donationRepository.getStatusHistoryByDonationId(id);
    const doc = donation.toObject();
    doc.evaluation = calculateUrgency(donation);
    return { donation: doc, history };
  },

  updateDonation: async (donationId, donorUser, updateData) => {
    const donation = await donationRepository.findById(donationId);
    if (!donation) {
      throw new AppError('Donation listing not found.', HTTP_STATUS.NOT_FOUND);
    }

    if (donorUser.role !== 'admin' && donation.donor._id.toString() !== donorUser._id.toString()) {
      throw new AppError("Forbidden. You cannot modify another donor's listing.", HTTP_STATUS.FORBIDDEN);
    }

    if (!['available', 'draft'].includes(donation.status)) {
      throw new AppError(
        `Cannot edit a donation with status '${donation.status}'. Only active available listings can be modified.`,
        HTTP_STATUS.BAD_REQUEST
      );
    }

    const allowedFields = [
      'foodName',
      'description',
      'category',
      'quantity',
      'unit',
      'storageRequirement',
      'packagingType',
      'allergens',
      'dietaryFlags',
      'pickupAddress',
      'foodImages',
    ];

    const updates = {};
    for (const key of allowedFields) {
      if (updateData[key] !== undefined) {
        updates[key] = updateData[key];
      }
    }

    const updated = await donationRepository.updateById(donationId, updates);
    return updated;
  },

  cancelDonation: async (donationId, donorUser, reason = 'Cancelled by donor') => {
    const donation = await donationRepository.findById(donationId);
    if (!donation) {
      throw new AppError('Donation listing not found.', HTTP_STATUS.NOT_FOUND);
    }

    if (donorUser.role !== 'admin' && donation.donor._id.toString() !== donorUser._id.toString()) {
      throw new AppError("Forbidden. You cannot cancel another donor's listing.", HTTP_STATUS.FORBIDDEN);
    }

    if (['completed', 'in_transit'].includes(donation.status)) {
      throw new AppError(`Cannot cancel donation that is already ${donation.status}.`, HTTP_STATUS.BAD_REQUEST);
    }

    return donationService.updateStatus(donationId, donorUser, DONATION_STATUS.CANCELLED, reason);
  },

  updateStatus: async (donationId, actorUser, newStatus, reason = '') => {
    const donation = await donationRepository.findById(donationId);
    if (!donation) {
      throw new AppError('Donation not found.', HTTP_STATUS.NOT_FOUND);
    }

    if (actorUser.role === 'donor' && donation.donor._id.toString() !== actorUser._id.toString()) {
      throw new AppError("Forbidden. You cannot modify another donor's listing.", HTTP_STATUS.FORBIDDEN);
    }

    const previousStatus = donation.status;

    return withTransaction(async (session) => {
      const updated = await donationRepository.updateById(donationId, { status: newStatus }, session);

      await donationRepository.recordStatusHistory(
        {
          donation: donationId,
          previousStatus,
          newStatus,
          actor: actorUser._id,
          reason,
        },
        session
      );

      return updated;
    });
  },
};
