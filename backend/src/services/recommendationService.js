import { NGOProfile } from '../models/NGOProfile.js';
import { Donation } from '../models/Donation.js';
import { AppError } from '../utils/AppError.js';
import { HTTP_STATUS } from '../constants/statusCodes.js';

/**
 * Calculate Great-Circle distance using Haversine formula
 * @param {[number, number]} coord1 - [longitude, latitude]
 * @param {[number, number]} coord2 - [longitude, latitude]
 * @returns {number} distance in kilometers rounded to 1 decimal place
 */
export const calculateDistanceKm = (coord1, coord2) => {
  if (!coord1 || !coord2 || coord1.length < 2 || coord2.length < 2) return 5.0;
  const [lon1, lat1] = coord1;
  const [lon2, lat2] = coord2;
  const R = 6371; // Earth radius in km
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return Math.round(R * c * 10) / 10;
};

/**
 * Format storage requirement into human-readable label
 */
const formatStorage = (storage) => {
  switch (storage) {
    case 'refrigerated':
      return 'Cold-chain refrigeration (0°C to 4°C)';
    case 'frozen':
      return 'Deep freezer (≤ -18°C)';
    case 'hot_holding':
    case 'hot_insulated':
      return 'Thermal hot holding (≥ 60°C)';
    default:
      return 'Ambient room temperature';
  }
};

/**
 * Format food category into human-readable label
 */
const formatCategory = (category) => {
  return String(category || '')
    .split('_')
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(' ');
};

/**
 * Explainable multi-factor evaluation of an NGO for a specific donation
 * Factors:
 * 1. NGO verification status
 * 2. Geographic distance
 * 3. Food category compatibility
 * 4. Storage capability compatibility
 * 5. Receiving capacity
 * 6. Pickup deadline feasibility
 */
export const evaluateMatch = (ngoProfile, donation) => {
  const explanations = [];
  const factors = {
    verification: { score: 0, max: 10, passed: false },
    distance: { score: 0, max: 30, passed: false },
    category: { score: 0, max: 25, passed: false },
    storage: { score: 0, max: 20, passed: false },
    capacity: { score: 0, max: 10, passed: false },
    deadlineFeasibility: { score: 0, max: 5, passed: false },
  };

  // 1. Verification Check
  if (ngoProfile.verificationStatus !== 'verified') {
    return {
      eligible: false,
      reason: 'NGO is unverified by administrators. Verification is mandatory for food rescues.',
      matchScore: 0,
      factors,
      explanations: ['Excluded: NGO verification is pending or rejected.'],
    };
  }
  factors.verification = { score: 10, max: 10, passed: true };
  explanations.push('[Verified Partner] Certified 501(c)(3) / registered non-profit organization.');

  // Coordinates & Distance
  const ngoCoords = ngoProfile.location?.coordinates || [-73.9851, 40.7488];
  const donationCoords = donation.location?.coordinates || [-73.9851, 40.7488];
  const distanceKm = calculateDistanceKm(ngoCoords, donationCoords);

  // 2. Distance Scoring (up to 30 pts)
  const estTransitMinutes = Math.max(10, Math.round((distanceKm / 25) * 60)); // assume 25 km/h urban speed
  if (distanceKm <= 2.0) {
    factors.distance = { score: 30, max: 30, passed: true };
    explanations.push(`[Proximity: High Priority] Located within ${distanceKm} km (approx. ${estTransitMinutes} mins transit).`);
  } else if (distanceKm <= 5.0) {
    factors.distance = { score: 25, max: 30, passed: true };
    explanations.push(`[Proximity: Local] Located ${distanceKm} km away (approx. ${estTransitMinutes} mins transit).`);
  } else if (distanceKm <= 10.0) {
    factors.distance = { score: 18, max: 30, passed: true };
    explanations.push(`[Proximity: Metropolitan] Located ${distanceKm} km away (approx. ${estTransitMinutes} mins transit).`);
  } else if (distanceKm <= 20.0) {
    factors.distance = { score: 12, max: 30, passed: true };
    explanations.push(`[Proximity: Regional] Located ${distanceKm} km away (approx. ${estTransitMinutes} mins transit).`);
  } else {
    factors.distance = { score: 5, max: 30, passed: true };
    explanations.push(`[Proximity: Extended] Located ${distanceKm} km away.`);
  }

  // 3. Food Category Compatibility (up to 25 pts)
  const acceptedCategories = ngoProfile.foodCategoriesAccepted || [];
  const categoryMatches =
    acceptedCategories.length === 0 || acceptedCategories.includes(donation.category);

  if (categoryMatches) {
    factors.category = { score: 25, max: 25, passed: true };
    explanations.push(`[Category Match] Explicitly certified to receive ${formatCategory(donation.category)}.`);
  } else {
    factors.category = { score: 0, max: 25, passed: false };
    explanations.push(`[Category Caution] Does not actively list ${formatCategory(donation.category)} in primary preferences.`);
  }

  // 4. Storage Capability Compatibility (up to 20 pts)
  const storageReq = donation.storageRequirement;
  const storageCaps = ngoProfile.storageCapabilities || {};
  let storageCompatible = true;
  let storageScore = 20;

  if (storageReq === 'refrigerated') {
    if (storageCaps.hasRefrigeration) {
      explanations.push(`[Storage Match] Cold-chain certified: Has active commercial refrigeration units.`);
    } else {
      storageCompatible = false;
      storageScore = 0;
      explanations.push(`[Storage Mismatch] Lacks refrigeration required for perishable food.`);
    }
  } else if (storageReq === 'frozen') {
    if (storageCaps.hasFreezer) {
      explanations.push(`[Storage Match] Freezer equipped: Has commercial deep freezer capabilities.`);
    } else {
      storageCompatible = false;
      storageScore = 0;
      explanations.push(`[Storage Mismatch] Lacks deep freezer required for frozen food.`);
    }
  } else if (storageReq === 'hot_holding' || storageReq === 'hot_insulated') {
    if (storageCaps.hasHotHolding) {
      explanations.push(`[Storage Match] Thermal holding: Has hot food warming units.`);
    } else {
      storageScore = 8;
      explanations.push(`[Storage Note] Immediate distribution required; lacking dedicated hot holding cabinets.`);
    }
  } else {
    // Ambient food
    explanations.push(`[Storage Match] Universal ambient storage compatible.`);
  }
  factors.storage = { score: storageScore, max: 20, passed: storageCompatible };

  // 5. Receiving Capacity (up to 10 pts)
  const ngoCapacity = ngoProfile.capacity || 50;
  const donationQty = donation.quantity || 1;
  if (ngoCapacity >= donationQty * 2) {
    factors.capacity = { score: 10, max: 10, passed: true };
    explanations.push(
      `[Capacity Margin] Daily capacity of ${ngoCapacity} meals comfortably accommodates ${donationQty} portions.`
    );
  } else if (ngoCapacity >= donationQty) {
    factors.capacity = { score: 8, max: 10, passed: true };
    explanations.push(
      `[Capacity Fit] Daily capacity of ${ngoCapacity} meals meets the requested ${donationQty} portions.`
    );
  } else {
    factors.capacity = { score: 3, max: 10, passed: false };
    explanations.push(
      `[Capacity Alert] Listing quantity (${donationQty}) exceeds typical daily capacity (${ngoCapacity}). Partial allocation recommended.`
    );
  }

  // 6. Pickup Deadline Feasibility (up to 5 pts)
  const now = new Date();
  const deadline = new Date(donation.pickupDeadline);
  const minutesToDeadline = Math.max(0, (deadline - now) / (1000 * 60));
  const bufferNeededMinutes = estTransitMinutes + 30; // transit + 30 min packaging window

  if (minutesToDeadline < bufferNeededMinutes) {
    factors.deadlineFeasibility = { score: 1, max: 5, passed: false };
    explanations.push(
      `[Feasibility Alert] Only ${Math.round(minutesToDeadline)} mins until pickup deadline. Urgent direct pickup required.`
    );
  } else {
    factors.deadlineFeasibility = { score: 5, max: 5, passed: true };
    const hoursLeft = (minutesToDeadline / 60).toFixed(1);
    explanations.push(
      `[Feasibility Confirmed] Ample pickup window: ${hoursLeft} hours remaining (estimated transit ${estTransitMinutes} mins).`
    );
  }

  // Calculate total score
  const totalScore = Math.min(
    100,
    Math.max(
      15,
      factors.verification.score +
        factors.distance.score +
        factors.category.score +
        factors.storage.score +
        factors.capacity.score +
        factors.deadlineFeasibility.score
    )
  );

  return {
    eligible: storageCompatible,
    matchScore: totalScore,
    distanceKm,
    estTransitMinutes,
    factors,
    explanations,
  };
};

export const recommendationService = {
  /**
   * Recommend surplus food for an authenticated NGO based on location, storage & preferences
   */
  getRecommendationsForNgo: async (ngoUser) => {
    const ngoProfile = await NGOProfile.findOne({ user: ngoUser._id });
    if (!ngoProfile) {
      throw new AppError('NGO profile not found. Please complete onboarding.', HTTP_STATUS.NOT_FOUND);
    }

    if (ngoProfile.verificationStatus !== 'verified') {
      return [];
    }

    const now = new Date();
    const availableDonations = await Donation.find({
      status: 'available',
      pickupDeadline: { $gt: now },
      expiryDate: { $gt: now },
    })
      .populate('donor', 'name email phone')
      .populate('safetyChecklist');

    const recommendations = [];

    for (const donation of availableDonations) {
      const evaluation = evaluateMatch(ngoProfile, donation);
      if (evaluation.eligible) {
        recommendations.push({
          donation,
          matchScore: evaluation.matchScore,
          distanceKm: evaluation.distanceKm,
          estTransitMinutes: evaluation.estTransitMinutes,
          explanations: evaluation.explanations,
          factors: evaluation.factors,
        });
      }
    }

    // Sort by highest match score
    return recommendations.sort((a, b) => b.matchScore - a.matchScore);
  },

  /**
   * Recommend verified NGOs for a specific donation listing
   */
  getRecommendedNgosForDonation: async (donationId) => {
    const donation = await Donation.findById(donationId).populate('safetyChecklist');
    if (!donation) {
      throw new AppError('Donation listing not found.', HTTP_STATUS.NOT_FOUND);
    }

    const verifiedNgos = await NGOProfile.find({
      verificationStatus: 'verified',
    }).populate('user', 'name email phone accountStatus');

    const scoredNgos = [];

    for (const ngo of verifiedNgos) {
      const evaluation = evaluateMatch(ngo, donation);
      if (evaluation.eligible) {
        scoredNgos.push({
          ngo,
          matchScore: evaluation.matchScore,
          distanceKm: evaluation.distanceKm,
          estTransitMinutes: evaluation.estTransitMinutes,
          explanations: evaluation.explanations,
          factors: evaluation.factors,
        });
      }
    }

    return scoredNgos.sort((a, b) => b.matchScore - a.matchScore);
  },
};
