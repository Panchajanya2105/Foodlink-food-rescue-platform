import { recommendationService } from '../services/recommendationService.js';
import { sendSuccess } from '../utils/apiResponse.js';

export const getNgoRecommendations = async (req, res, next) => {
  try {
    const recommendations = await recommendationService.getRecommendationsForNgo(req.user);
    return sendSuccess(res, recommendations, 'Recommended surplus food listings');
  } catch (err) {
    next(err);
  }
};

export const getDonationMatches = async (req, res, next) => {
  try {
    const matches = await recommendationService.getRecommendedNgosForDonation(req.params.id);
    return sendSuccess(res, matches, 'Matched nearby NGOs');
  } catch (err) {
    next(err);
  }
};

