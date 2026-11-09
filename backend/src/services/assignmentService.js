import { assignmentRepository } from '../repositories/assignmentRepository.js';
import { donationRepository } from '../repositories/donationRepository.js';
import { notificationRepository } from '../repositories/notificationRepository.js';
import { userRepository } from '../repositories/userRepository.js';
import { DeliveryAssignment } from '../models/DeliveryAssignment.js';
import { Donation } from '../models/Donation.js';
import { NGOProfile } from '../models/NGOProfile.js';
import { withTransaction } from '../utils/transaction.js';
import { AppError } from '../utils/AppError.js';
import { HTTP_STATUS } from '../constants/statusCodes.js';
import { DONATION_STATUS, ASSIGNMENT_STATUS, NOTIFICATION_TYPES } from '../constants/donationEnums.js';
import { calculateDistanceKm } from './recommendationService.js';

export const assignmentService = {
  /**
   * List open available delivery tasks for volunteer couriers to claim
   */
  getAvailableTasks: async (pagination = { skip: 0, limit: 10, sort: { createdAt: -1 } }) => {
    const filter = {
      status: ASSIGNMENT_STATUS.PENDING,
      deliveryPartner: null,
    };

    const [tasks, total] = await Promise.all([
      DeliveryAssignment.find(filter)
        .populate('donation')
        .populate('request')
        .skip(pagination.skip)
        .limit(pagination.limit)
        .sort(pagination.sort),
      DeliveryAssignment.countDocuments(filter),
    ]);

    return { tasks, total };
  },

  /**
   * Volunteer courier accepts/claims an open rescue delivery task
   */
  claimAssignment: async (assignmentId, courierUser) => {
    if (courierUser.role !== 'delivery') {
      throw new AppError('Only registered delivery partners can accept rescue tasks.', HTTP_STATUS.FORBIDDEN);
    }

    if (courierUser.accountStatus === 'suspended') {
      throw new AppError('Suspended delivery accounts cannot accept tasks.', HTTP_STATUS.FORBIDDEN);
    }

    const assignment = await DeliveryAssignment.findById(assignmentId);
    if (!assignment) {
      throw new AppError('Delivery task not found.', HTTP_STATUS.NOT_FOUND);
    }

    if (assignment.status !== ASSIGNMENT_STATUS.PENDING || assignment.deliveryPartner) {
      throw new AppError(
        'This rescue assignment has already been accepted by another volunteer courier.',
        HTTP_STATUS.CONFLICT
      );
    }

    const donation = await Donation.findById(assignment.donation);
    if (!donation) {
      throw new AppError('Associated donation listing not found.', HTTP_STATUS.NOT_FOUND);
    }

    return withTransaction(async (session) => {
      const updatedAssignment = await DeliveryAssignment.findOneAndUpdate(
        { _id: assignment._id, status: ASSIGNMENT_STATUS.PENDING, deliveryPartner: null },
        {
          status: ASSIGNMENT_STATUS.ACCEPTED,
          deliveryPartner: courierUser._id,
        },
        { new: true, session }
      ).populate('donation');

      if (!updatedAssignment) {
        throw new AppError(
          'Concurrency conflict: Task was claimed by another partner moments ago.',
          HTTP_STATUS.CONFLICT
        );
      }

      await donationRepository.updateById(
        donation._id,
        { status: DONATION_STATUS.ASSIGNED },
        session
      );

      await donationRepository.recordStatusHistory(
        {
          donation: donation._id,
          previousStatus: donation.status,
          newStatus: DONATION_STATUS.ASSIGNED,
          actor: courierUser._id,
          actionName: 'delivery_claimed',
          reason: `Volunteer courier ${courierUser.name} accepted transport assignment.`,
        },
        session
      );

      // Notify donor and NGO
      await notificationRepository.create({
        recipient: donation.donor,
        notificationType: NOTIFICATION_TYPES.DELIVERY_ASSIGNED,
        title: 'Volunteer Courier Assigned',
        message: `${courierUser.name} has accepted the transport task for "${donation.foodName}".`,
        relatedResource: { resourceType: 'DeliveryAssignment', resourceId: assignment._id },
      });

      if (donation.recipientNGO) {
        await notificationRepository.create({
          recipient: donation.recipientNGO,
          notificationType: NOTIFICATION_TYPES.DELIVERY_ASSIGNED,
          title: 'Courier En Route Soon',
          message: `Volunteer courier ${courierUser.name} is handling delivery of "${donation.foodName}".`,
          relatedResource: { resourceType: 'DeliveryAssignment', resourceId: assignment._id },
        });
      }

      return updatedAssignment;
    });
  },

  /**
   * Direct manual assignment by donor, NGO, or administrator
   */
  createAssignment: async (assignData, actorUser) => {
    const donation = await donationRepository.findById(assignData.donationId);
    if (!donation) {
      throw new AppError('Donation listing not found.', HTTP_STATUS.NOT_FOUND);
    }

    const courier = await userRepository.findById(assignData.deliveryPartnerId);
    if (!courier || courier.role !== 'delivery') {
      throw new AppError('Valid delivery partner user required.', HTTP_STATUS.BAD_REQUEST);
    }

    const ngoProfile = donation.recipientNGO
      ? await userRepository.findNgoProfileByUserId(donation.recipientNGO._id)
      : null;

    const destinationAddress = ngoProfile?.address
      ? `${ngoProfile.address.street}, ${ngoProfile.address.city}`
      : 'Shelter Hub';
    const destinationCoords = ngoProfile?.location?.coordinates || [-73.9851, 40.7488];

    const distKm = calculateDistanceKm(donation.location.coordinates, destinationCoords);

    return withTransaction(async (session) => {
      const assignment = await assignmentRepository.create(
        {
          donation: donation._id,
          request: assignData.requestId || null,
          deliveryPartner: courier._id,
          pickupLocation: {
            address: `${donation.pickupAddress.street}, ${donation.pickupAddress.city}`,
            city: donation.pickupAddress.city,
            coordinates: donation.location.coordinates,
          },
          destination: {
            address: destinationAddress,
            city: ngoProfile?.address?.city || donation.pickupAddress.city,
            ngoName: ngoProfile?.organizationName || 'Recipient Shelter',
            coordinates: destinationCoords,
          },
          estimatedDistanceKm: distKm,
          status: ASSIGNMENT_STATUS.ACCEPTED,
        },
        session
      );

      await donationRepository.updateById(
        donation._id,
        { status: DONATION_STATUS.ASSIGNED },
        session
      );

      await donationRepository.recordStatusHistory(
        {
          donation: donation._id,
          previousStatus: donation.status,
          newStatus: DONATION_STATUS.ASSIGNED,
          actor: actorUser._id,
          actionName: 'delivery_assigned',
          reason: `Assigned to courier ${courier.name}`,
        },
        session
      );

      await notificationRepository.create({
        recipient: courier._id,
        notificationType: NOTIFICATION_TYPES.DELIVERY_ASSIGNED,
        title: 'New Rescue Task Assigned',
        message: `You have been assigned to rescue "${donation.foodName}" from ${donation.pickupAddress.city}.`,
        relatedResource: {
          resourceType: 'DeliveryAssignment',
          resourceId: assignment._id,
        },
      });

      return assignment;
    });
  },

  /**
   * Volunteer cancels / aborts assignment before pickup
   */
  cancelAssignment: async (assignmentId, courierUser, reason = '') => {
    const assignment = await DeliveryAssignment.findById(assignmentId);
    if (!assignment) {
      throw new AppError('Delivery assignment not found.', HTTP_STATUS.NOT_FOUND);
    }

    const isAssignedCourier = assignment.deliveryPartner?.toString() === courierUser._id.toString();
    const isAdmin = courierUser.role === 'admin';

    if (!isAssignedCourier && !isAdmin) {
      throw new AppError('Only the assigned courier or an admin can drop this assignment.', HTTP_STATUS.FORBIDDEN);
    }

    if (assignment.status !== ASSIGNMENT_STATUS.ACCEPTED) {
      throw new AppError(
        `Cannot cancel assignment with status '${assignment.status}'. Only pre-pickup assignments can be released.`,
        HTTP_STATUS.BAD_REQUEST
      );
    }

    return withTransaction(async (session) => {
      // Revert assignment back to pending and clear courier
      const updatedAssignment = await DeliveryAssignment.findByIdAndUpdate(
        assignment._id,
        {
          status: ASSIGNMENT_STATUS.PENDING,
          deliveryPartner: null,
        },
        { new: true, session }
      );

      await donationRepository.updateById(
        assignment.donation,
        { status: DONATION_STATUS.MATCHED },
        session
      );

      await donationRepository.recordStatusHistory(
        {
          donation: assignment.donation,
          previousStatus: DONATION_STATUS.ASSIGNED,
          newStatus: DONATION_STATUS.MATCHED,
          actor: courierUser._id,
          actionName: 'delivery_released',
          reason: `Courier ${courierUser.name} released task: ${reason || 'Emergency drop'}`,
        },
        session
      );

      return updatedAssignment;
    });
  },

  /**
   * Courier confirms pickup at donor facility
   */
  confirmPickup: async (assignmentId, courierUser, pickupData) => {
    const assignment = await assignmentRepository.findById(assignmentId);
    if (!assignment) {
      throw new AppError('Delivery assignment not found.', HTTP_STATUS.NOT_FOUND);
    }

    const isAssigned = assignment.deliveryPartner?._id?.toString() === courierUser._id.toString();
    const isAdmin = courierUser.role === 'admin';

    if (!isAssigned && !isAdmin) {
      throw new AppError('Only the assigned courier can confirm pickup.', HTTP_STATUS.FORBIDDEN);
    }

    if (assignment.status !== ASSIGNMENT_STATUS.ACCEPTED) {
      throw new AppError(
        `Cannot confirm pickup. Current task status is '${assignment.status}'.`,
        HTTP_STATUS.BAD_REQUEST
      );
    }

    return withTransaction(async (session) => {
      const updatedAssignment = await assignmentRepository.updateById(
        assignment._id,
        {
          status: ASSIGNMENT_STATUS.IN_TRANSIT,
          pickupConfirmation: {
            isConfirmed: true,
            confirmedAt: new Date(),
            temperatureCelsius: pickupData.temperatureCelsius ?? 20,
            sealIntact: pickupData.sealIntact !== false,
            donorSignoffName: pickupData.donorSignoffName || 'Donor Staff',
            notes: pickupData.notes || '',
          },
        },
        session
      );

      await donationRepository.updateById(
        assignment.donation._id,
        {
          status: DONATION_STATUS.PICKED_UP,
          pickedUpAt: new Date(),
        },
        session
      );

      await donationRepository.recordStatusHistory(
        {
          donation: assignment.donation._id,
          previousStatus: DONATION_STATUS.ASSIGNED,
          newStatus: DONATION_STATUS.PICKED_UP,
          actor: courierUser._id,
          actionName: 'food_picked_up',
          reason: `Pickup confirmed by courier ${courierUser.name}. Seal verified.`,
        },
        session
      );

      // Notify donor and NGO that food was picked up
      if (assignment.donation?.donor) {
        await notificationRepository.create({
          recipient: assignment.donation.donor._id || assignment.donation.donor,
          notificationType: NOTIFICATION_TYPES.PICKED_UP,
          title: 'Food Picked Up by Courier',
          message: `Courier ${courierUser.name} has picked up "${assignment.donation.foodName}" and is in transit.`,
          relatedResource: { resourceType: 'DeliveryAssignment', resourceId: assignment._id },
        });
      }
      if (assignment.donation?.recipientNGO) {
        await notificationRepository.create({
          recipient: assignment.donation.recipientNGO._id || assignment.donation.recipientNGO,
          notificationType: NOTIFICATION_TYPES.PICKED_UP,
          title: 'Food Is In Transit',
          message: `Courier ${courierUser.name} picked up the donation and is heading towards your facility.`,
          relatedResource: { resourceType: 'DeliveryAssignment', resourceId: assignment._id },
        });
      }

      return updatedAssignment;
    });
  },

  /**
   * Courier confirms delivery at destination shelter
   */
  confirmDelivery: async (assignmentId, courierUser, dropoffData) => {
    const assignment = await assignmentRepository.findById(assignmentId);
    if (!assignment) {
      throw new AppError('Delivery assignment not found.', HTTP_STATUS.NOT_FOUND);
    }

    const isAssigned = assignment.deliveryPartner?._id?.toString() === courierUser._id.toString();
    const isAdmin = courierUser.role === 'admin';

    if (!isAssigned && !isAdmin) {
      throw new AppError('Only the assigned courier can confirm delivery.', HTTP_STATUS.FORBIDDEN);
    }

    if (assignment.status !== ASSIGNMENT_STATUS.IN_TRANSIT) {
      throw new AppError(
        `Cannot confirm delivery. Assignment must be 'in_transit' (currently '${assignment.status}').`,
        HTTP_STATUS.BAD_REQUEST
      );
    }

    return withTransaction(async (session) => {
      const updatedAssignment = await assignmentRepository.updateById(
        assignment._id,
        {
          status: ASSIGNMENT_STATUS.COMPLETED,
          completedAt: new Date(),
          deliveryConfirmation: {
            isConfirmed: true,
            confirmedAt: new Date(),
            temperatureCelsius: dropoffData.temperatureCelsius ?? 20,
            packagingIntact: dropoffData.packagingIntact !== false,
            ngoReceiverName: dropoffData.ngoReceiverName || 'Shelter Receiver',
            notes: dropoffData.notes || '',
          },
        },
        session
      );

      await donationRepository.updateById(
        assignment.donation._id,
        {
          status: DONATION_STATUS.DELIVERED,
          deliveredAt: new Date(),
        },
        session
      );

      await donationRepository.recordStatusHistory(
        {
          donation: assignment.donation._id,
          previousStatus: DONATION_STATUS.PICKED_UP,
          newStatus: DONATION_STATUS.DELIVERED,
          actor: courierUser._id,
          actionName: 'food_delivered',
          reason: `Delivery confirmed at shelter by ${dropoffData.ngoReceiverName || 'staff'}.`,
        },
        session
      );

      // Notify donor and NGO that food was safely delivered
      if (assignment.donation?.donor) {
        await notificationRepository.create({
          recipient: assignment.donation.donor._id || assignment.donation.donor,
          notificationType: NOTIFICATION_TYPES.DELIVERED,
          title: 'Food Donation Delivered!',
          message: `"${assignment.donation.foodName}" was safely delivered to the shelter. Thank you for your impact!`,
          relatedResource: { resourceType: 'DeliveryAssignment', resourceId: assignment._id },
        });
      }
      if (assignment.donation?.recipientNGO) {
        await notificationRepository.create({
          recipient: assignment.donation.recipientNGO._id || assignment.donation.recipientNGO,
          notificationType: NOTIFICATION_TYPES.DELIVERED,
          title: 'Delivery Receipt Confirmed',
          message: `Delivery of "${assignment.donation.foodName}" is complete. Please leave feedback for donor & courier.`,
          relatedResource: { resourceType: 'DeliveryAssignment', resourceId: assignment._id },
        });
      }

      await userRepository.updateDeliveryProfileByUserId(courierUser._id, {
        $inc: { totalCompletedDeliveries: 1 },
      });

      return updatedAssignment;
    });
  },

  getAssignmentById: async (id) => {
    const assignment = await DeliveryAssignment.findById(id)
      .populate('donation')
      .populate('deliveryPartner', 'name email phone')
      .populate('request');
    if (!assignment) {
      throw new AppError('Delivery assignment not found.', HTTP_STATUS.NOT_FOUND);
    }
    return assignment;
  },

  getAssignments: async (filter, pagination) => {
    const [assignments, total] = await assignmentRepository.findPaginated(filter, pagination);
    return { assignments, total };
  },

  getCourierAnalytics: async (courierUserId) => {
    const [allCourierAssignments, profile] = await Promise.all([
      DeliveryAssignment.find({ deliveryPartner: courierUserId }).populate('donation'),
      userRepository.findDeliveryProfileByUserId(courierUserId),
    ]);

    const completed = allCourierAssignments.filter((a) => a.status === ASSIGNMENT_STATUS.COMPLETED);
    const inTransit = allCourierAssignments.filter((a) => a.status === ASSIGNMENT_STATUS.IN_TRANSIT);
    const accepted = allCourierAssignments.filter((a) => a.status === ASSIGNMENT_STATUS.ACCEPTED);

    const totalMealsRescued = completed.reduce(
      (sum, a) => sum + (a.donation?.servingsEstimate || a.donation?.quantity || 1),
      0
    );

    const totalDistanceKm = completed.reduce((sum, a) => sum + (a.estimatedDistanceKm || 5.0), 0);
    const co2OffsetKg = Math.round(totalMealsRescued * 0.4 * 2.5);

    return {
      totalTasks: allCourierAssignments.length,
      completedTasks: completed.length,
      completedCount: completed.length,
      activeTasks: inTransit.length + accepted.length,
      activeCount: inTransit.length + accepted.length,
      totalMealsRescued,
      mealsRescued: totalMealsRescued,
      totalDistanceKm: Math.round(totalDistanceKm * 10) / 10,
      co2OffsetKg,
      co2SavedKg: co2OffsetKg,
      rating: profile?.rating || 5.0,
      vehicleType: profile?.vehicleType || 'car',
      availabilityStatus: profile?.availabilityStatus || 'available',
    };
  },
};
