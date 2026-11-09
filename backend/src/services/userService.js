import { userRepository } from '../repositories/userRepository.js';
import { notificationRepository } from '../repositories/notificationRepository.js';
import { NGOProfile } from '../models/NGOProfile.js';
import { AppError } from '../utils/AppError.js';
import { HTTP_STATUS } from '../constants/statusCodes.js';
import { NOTIFICATION_TYPES } from '../constants/donationEnums.js';

export const userService = {
  updateProfile: async (userId, updateData) => {
    const user = await userRepository.updateById(userId, updateData);
    if (!user) {
      throw new AppError('User not found.', HTTP_STATUS.NOT_FOUND);
    }
    return user;
  },

  updateNgoProfile: async (userId, profileData) => {
    let profile = await userRepository.findNgoProfileByUserId(userId);
    if (!profile) {
      profile = await userRepository.createNgoProfile({ user: userId, ...profileData });
    } else {
      profile = await userRepository.updateNgoProfileByUserId(userId, profileData);
    }
    return profile;
  },

  updateDeliveryProfile: async (userId, profileData) => {
    let profile = await userRepository.findDeliveryProfileByUserId(userId);
    if (!profile) {
      profile = await userRepository.createDeliveryProfile({ user: userId, ...profileData });
    } else {
      profile = await userRepository.updateDeliveryProfileByUserId(userId, profileData);
    }
    return profile;
  },

  getNgoProfile: async (idOrUserId) => {
    let profile = await userRepository.findNgoProfileByUserId(idOrUserId);
    if (!profile) {
      profile = await NGOProfile.findById(idOrUserId).populate('user', 'name email phone accountStatus isVerified verificationStatus');
    }
    if (!profile) {
      throw new AppError('NGO profile not found.', HTTP_STATUS.NOT_FOUND);
    }
    return profile;
  },

  listUsers: async (filter, pagination) => {
    const [users, total] = await userRepository.findUsers(filter, pagination);
    return { users, total };
  },

  verifyNgo: async (targetId, adminUser, status, rejectionReason = '') => {
    let ngoUser = await userRepository.findById(targetId);
    let profile = null;
    if (ngoUser && ngoUser.role === 'ngo') {
      profile = await userRepository.findNgoProfileByUserId(targetId);
    } else {
      profile = await NGOProfile.findById(targetId);
      if (profile) {
        ngoUser = await userRepository.findById(profile.user);
      }
    }

    if (!ngoUser) {
      throw new AppError('NGO account not found.', HTTP_STATUS.NOT_FOUND);
    }

    const isVerified = status === 'verified';
    await userRepository.updateById(ngoUser._id, {
      verificationStatus: status,
      isVerified,
      accountStatus: isVerified ? 'verified' : 'rejected',
    });

    profile = await userRepository.updateNgoProfileByUserId(ngoUser._id, {
      verificationStatus: status,
      verifiedAt: isVerified ? new Date() : null,
      verifiedBy: adminUser._id,
      rejectionReason: isVerified ? '' : rejectionReason,
    });

    await notificationRepository.create({
      recipient: ngoUser._id,
      notificationType: NOTIFICATION_TYPES.VERIFICATION_UPDATE,
      title: isVerified ? 'NGO Verification Approved!' : 'NGO Verification Rejected',
      message: isVerified
        ? 'Congratulations! Your NGO profile has been officially verified by Foodlink Administration. You can now request surplus donations.'
        : `Your NGO verification application was not approved. Reason: ${rejectionReason || 'Incomplete documentation'}.`,
      relatedResource: {
        resourceType: 'NGOProfile',
        resourceId: profile._id,
      },
    });

    return profile;
  },
};
