import { requestRepository } from '../repositories/requestRepository.js';
import { donationRepository } from '../repositories/donationRepository.js';
import { notificationRepository } from '../repositories/notificationRepository.js';
import { NGOProfile } from '../models/NGOProfile.js';
import { DonationRequest } from '../models/DonationRequest.js';
import { Donation } from '../models/Donation.js';
import { withTransaction } from '../utils/transaction.js';
import { AppError } from '../utils/AppError.js';
import { HTTP_STATUS } from '../constants/statusCodes.js';
import { DONATION_STATUS, REQUEST_STATUS, NOTIFICATION_TYPES } from '../constants/donationEnums.js';

export const requestService = {
  createRequest: async (ngoUser, requestData) => {
    const donation = await donationRepository.findById(requestData.donationId);
    if (!donation) {
      throw new AppError('Donation listing not found.', HTTP_STATUS.NOT_FOUND);
    }

    if (!['available', 'requested'].includes(donation.status)) {
      throw new AppError(`Cannot request donation with status: ${donation.status}`, HTTP_STATUS.BAD_REQUEST);
    }

    const now = new Date();
    if (new Date(donation.expiryDate) <= now || new Date(donation.pickupDeadline) <= now) {
      throw new AppError(
        'This food donation has expired or passed its pickup deadline and can no longer be requested.',
        HTTP_STATUS.BAD_REQUEST
      );
    }

    // Mandatory verification check
    const ngoProfile = await NGOProfile.findOne({ user: ngoUser._id });
    const isVerifiedNgo =
      ngoUser.role === 'admin' ||
      ngoUser.isVerified === true ||
      ngoUser.verificationStatus === 'verified' ||
      ngoProfile?.verificationStatus === 'verified';

    if (!isVerifiedNgo) {
      throw new AppError(
        'Only verified NGOs are permitted to submit food rescue requests. Please complete verification onboarding.',
        HTTP_STATUS.FORBIDDEN
      );
    }

    if (!donation.safetyChecklist || !donation.safetyChecklist.passedAllChecks) {
      throw new AppError(
        'This donation requires a completed and verified food safety checklist before requests can be accepted.',
        HTTP_STATUS.BAD_REQUEST
      );
    }

    if (requestData.requestedQuantity > donation.quantity) {
      throw new AppError(
        `Requested quantity (${requestData.requestedQuantity}) exceeds available quantity (${donation.quantity}).`,
        HTTP_STATUS.BAD_REQUEST
      );
    }

    const existing = await requestRepository.findByDonationAndNgo(donation._id, ngoUser._id);
    if (existing && existing.status === REQUEST_STATUS.PENDING) {
      throw new AppError('You already have an active pending request for this donation.', HTTP_STATUS.CONFLICT);
    }

    return withTransaction(async (session) => {
      const request = await requestRepository.create(
        {
          donation: donation._id,
          ngo: ngoUser._id,
          requestedQuantity: requestData.requestedQuantity,
          deliveryPreference: requestData.deliveryPreference || 'volunteer_delivery',
          intakeReason: requestData.intakeReason || '',
          beneficiariesCount: requestData.beneficiariesCount || 1,
          status: REQUEST_STATUS.PENDING,
        },
        session
      );

      await donationRepository.updateById(
        donation._id,
        { status: DONATION_STATUS.REQUESTED },
        session
      );

      await donationRepository.recordStatusHistory(
        {
          donation: donation._id,
          previousStatus: donation.status,
          newStatus: DONATION_STATUS.REQUESTED,
          actor: ngoUser._id,
          actionName: 'request_created',
          reason: `Requested ${requestData.requestedQuantity} portions by ${ngoUser.name}`,
        },
        session
      );

      await notificationRepository.create({
        recipient: donation.donor._id,
        notificationType: NOTIFICATION_TYPES.REQUEST_RECEIVED,
        title: 'New Donation Request',
        message: `${ngoUser.name} requested ${requestData.requestedQuantity} portions of "${donation.foodName}".`,
        relatedResource: {
          resourceType: 'DonationRequest',
          resourceId: request._id,
        },
      });

      return request;
    });
  },

  withdrawRequest: async (ngoUser, requestId) => {
    const request = await requestRepository.findById(requestId);
    if (!request) {
      throw new AppError('Request not found.', HTTP_STATUS.NOT_FOUND);
    }

    if (request.ngo._id.toString() !== ngoUser._id.toString()) {
      throw new AppError('You can only withdraw your own requests.', HTTP_STATUS.FORBIDDEN);
    }

    if (request.status !== REQUEST_STATUS.PENDING) {
      throw new AppError(`Cannot withdraw request with status: ${request.status}`, HTTP_STATUS.BAD_REQUEST);
    }

    return withTransaction(async (session) => {
      const updatedRequest = await requestRepository.updateById(
        request._id,
        {
          status: REQUEST_STATUS.WITHDRAWN,
          rejectionReason: 'Withdrawn by NGO requester',
        },
        session
      );

      // Check if any remaining pending requests exist for this donation
      const remainingPending = await DonationRequest.countDocuments({
        donation: request.donation._id,
        _id: { $ne: request._id },
        status: REQUEST_STATUS.PENDING,
      }).session(session);

      if (remainingPending === 0) {
        await donationRepository.updateById(
          request.donation._id,
          { status: DONATION_STATUS.AVAILABLE },
          session
        );
      }

      await donationRepository.recordStatusHistory(
        {
          donation: request.donation._id,
          previousStatus: DONATION_STATUS.REQUESTED,
          newStatus: remainingPending === 0 ? DONATION_STATUS.AVAILABLE : DONATION_STATUS.REQUESTED,
          actor: ngoUser._id,
          actionName: 'request_withdrawn',
          reason: `Request withdrawn by ${ngoUser.name}`,
        },
        session
      );

      return updatedRequest;
    });
  },

  decideRequest: async (donorUser, requestId, decision, rejectionReason = '') => {
    const request = await requestRepository.findById(requestId);
    if (!request) {
      throw new AppError('Request not found.', HTTP_STATUS.NOT_FOUND);
    }

    if (request.status !== REQUEST_STATUS.PENDING) {
      throw new AppError(`Cannot decide on request that is already ${request.status}.`, HTTP_STATUS.BAD_REQUEST);
    }

    const donation = await donationRepository.findById(request.donation._id);
    if (!donation) {
      throw new AppError('Associated donation listing not found.', HTTP_STATUS.NOT_FOUND);
    }

    if (donation.donor._id.toString() !== donorUser._id.toString()) {
      throw new AppError('Only the donor who posted this surplus can decide on requests.', HTTP_STATUS.FORBIDDEN);
    }

    if (decision === 'approved' && ['matched', 'assigned', 'delivered', 'cancelled', 'expired'].includes(donation.status)) {
      throw new AppError(`Cannot approve request. Donation is already ${donation.status}.`, HTTP_STATUS.BAD_REQUEST);
    }

    const isApproved = decision === 'approved';

    return withTransaction(async (session) => {
      const updatedRequest = await requestRepository.updateById(
        request._id,
        {
          status: isApproved ? REQUEST_STATUS.APPROVED : REQUEST_STATUS.REJECTED,
          rejectionReason: isApproved ? '' : rejectionReason,
          donorDecision: {
            decision,
            decidedAt: new Date(),
            decidedBy: donorUser._id,
          },
        },
        session
      );

      // If approved, lock the donation to this NGO and resolve other conflicting pending requests
      if (isApproved) {
        await donationRepository.updateById(
          donation._id,
          {
            status: DONATION_STATUS.MATCHED,
            recipientNGO: request.ngo._id,
            claimedAt: new Date(),
          },
          session
        );

        // Auto-create pending DeliveryAssignment if volunteer courier is requested
        if (request.deliveryPreference === 'volunteer_delivery') {
          const ngoProfile = await NGOProfile.findOne({ user: request.ngo._id }).session(session);
          const { DeliveryAssignment } = await import('../models/DeliveryAssignment.js');
          await DeliveryAssignment.create(
            [
              {
                donation: donation._id,
                request: request._id,
                deliveryPartner: null,
                pickupLocation: {
                  address: `${donation.pickupAddress.street}, ${donation.pickupAddress.city}`,
                  city: donation.pickupAddress.city,
                  coordinates: donation.location.coordinates,
                },
                destination: {
                  address: ngoProfile?.address ? `${ngoProfile.address.street}, ${ngoProfile.address.city}` : 'Shelter Hub',
                  city: ngoProfile?.address?.city || donation.pickupAddress.city,
                  ngoName: ngoProfile?.organizationName || 'Recipient Shelter',
                  coordinates: ngoProfile?.location?.coordinates || [-73.9851, 40.7488],
                },
                status: 'pending',
              },
            ],
            { session }
          );
        }

        // Concurrency-safe: Auto-reject other pending requests for the same donation
        const otherPending = await DonationRequest.find({
          donation: donation._id,
          _id: { $ne: request._id },
          status: REQUEST_STATUS.PENDING,
        }).session(session);

        if (otherPending.length > 0) {
          await DonationRequest.updateMany(
            {
              donation: donation._id,
              _id: { $ne: request._id },
              status: REQUEST_STATUS.PENDING,
            },
            {
              status: REQUEST_STATUS.REJECTED,
              rejectionReason: 'Surplus listing has been allocated to another NGO partner.',
              donorDecision: {
                decision: 'rejected',
                decidedAt: new Date(),
                decidedBy: donorUser._id,
              },
            },
            { session }
          );

          // Notify other NGOs
          for (const otherReq of otherPending) {
            await notificationRepository.create({
              recipient: otherReq.ngo,
              notificationType: NOTIFICATION_TYPES.REQUEST_REJECTED,
              title: 'Donation Listing Claimed',
              message: `The donation "${donation.foodName}" has been allocated to another partner.`,
              relatedResource: {
                resourceType: 'Donation',
                resourceId: donation._id,
              },
            });
          }
        }
      } else {
        // If rejected, check if other pending requests exist
        const otherPendingCount = await DonationRequest.countDocuments({
          donation: donation._id,
          _id: { $ne: request._id },
          status: REQUEST_STATUS.PENDING,
        }).session(session);

        if (otherPendingCount === 0) {
          await donationRepository.updateById(
            donation._id,
            { status: DONATION_STATUS.AVAILABLE },
            session
          );
        }
      }

      await donationRepository.recordStatusHistory(
        {
          donation: donation._id,
          previousStatus: donation.status,
          newStatus: isApproved ? DONATION_STATUS.MATCHED : (donation.status),
          actor: donorUser._id,
          actionName: isApproved ? 'request_approved' : 'request_rejected',
          reason: isApproved
            ? `Approved request from ${request.ngo.name}`
            : `Rejected request: ${rejectionReason || 'No reason provided'}`,
        },
        session
      );

      await notificationRepository.create({
        recipient: request.ngo._id,
        notificationType: isApproved ? NOTIFICATION_TYPES.REQUEST_APPROVED : NOTIFICATION_TYPES.REQUEST_REJECTED,
        title: isApproved ? 'Rescue Request Approved!' : 'Rescue Request Declined',
        message: isApproved
          ? `Your request for "${donation.foodName}" has been approved! Prepare for delivery or pickup.`
          : `Your request for "${donation.foodName}" was not approved: ${rejectionReason}`,
        relatedResource: {
          resourceType: 'Donation',
          resourceId: donation._id,
        },
      });

      return updatedRequest;
    });
  },

  getRequests: async (filter, pagination) => {
    const [requests, total] = await requestRepository.findPaginated(filter, pagination);
    return { requests, total };
  },

  getAcceptedDonations: async (ngoUserId, pagination = { skip: 0, limit: 10, sort: { claimedAt: -1 } }) => {
    const filter = {
      recipientNGO: ngoUserId,
      status: { $in: [DONATION_STATUS.MATCHED, DONATION_STATUS.ASSIGNED, DONATION_STATUS.PICKED_UP, DONATION_STATUS.DELIVERED] },
    };

    const [donations, total] = await Promise.all([
      Donation.find(filter)
        .populate('donor', 'name email phone')
        .populate('safetyChecklist')
        .skip(pagination.skip)
        .limit(pagination.limit)
        .sort(pagination.sort),
      Donation.countDocuments(filter),
    ]);

    return { donations, total };
  },
};
