import { connectDatabase, disconnectDatabase } from '../config/database.js';
import {
  User,
  NGOProfile,
  DeliveryProfile,
  Donation,
  FoodSafetyChecklist,
  DonationRequest,
  DeliveryAssignment,
  Feedback,
  Notification,
  StatusHistory,
} from '../models/index.js';
import { ROLES, USER_STATUS } from '../constants/roles.js';
import { DONATION_STATUS, FOOD_CATEGORIES, STORAGE_REQUIREMENTS, NOTIFICATION_TYPES } from '../constants/donationEnums.js';
import { logger } from '../utils/logger.js';

export const seedAll = async () => {
  try {
    await connectDatabase();
    logger.info('=====================================================');
    logger.info('Starting Foodlink Karnataka (India) Database Reset & Seed');
    logger.info('All data strictly localized to Karnataka State, India');
    logger.info('=====================================================');

    // 1. Clean out all legacy sample data
    logger.info('Purging all legacy sample records across collections...');
    await Promise.all([
      DeliveryAssignment.deleteMany({}),
      DonationRequest.deleteMany({}),
      Feedback.deleteMany({}),
      Notification.deleteMany({}),
      StatusHistory.deleteMany({}),
      FoodSafetyChecklist.deleteMany({}),
      Donation.deleteMany({}),
      DeliveryProfile.deleteMany({}),
      NGOProfile.deleteMany({}),
      User.deleteMany({}),
    ]);
    logger.info('All previous test collections purged cleanly.');

    // Helper to create verified user
    const createVerifiedUser = async ({ email, name, role, password, phone }) => {
      const user = await User.create({
        name,
        email,
        password,
        phone,
        role,
        accountStatus: USER_STATUS.VERIFIED,
        isVerified: true,
        profileComplete: true,
      });
      logger.info(`Provisioned ${role} account: ${email} (${name})`);
      return user;
    };

    // 2. Administrators (Karnataka Directorate & Admin)
    const admin = await createVerifiedUser({
      email: 'admin@foodlink.org',
      name: 'Karnataka Foodlink Administration',
      role: ROLES.ADMIN,
      password: 'AdminSecure123!',
      phone: '+91 80 2558 0001',
    });

    // 3. Donors (Bengaluru, Karnataka)
    const donor = await createVerifiedUser({
      email: 'donor@foodlink.org',
      name: 'Mavalli Tiffin Room (MTR) Bengaluru',
      role: ROLES.DONOR,
      password: 'Password123!',
      phone: '+91 80 2222 0022',
    });

    const donorTest = await createVerifiedUser({
      email: 'donor@foodlinktest.org',
      name: 'Karnataka Catering & Confectioners',
      role: ROLES.DONOR,
      password: 'Password123!',
      phone: '+91 80 2333 4444',
    });

    // 4. NGOs (Bengaluru & Mysuru, Karnataka)
    const ngo = await createVerifiedUser({
      email: 'ngo@foodlink.org',
      name: 'Bengaluru Annapoorna Seva Trust',
      role: ROLES.NGO,
      password: 'Password123!',
      phone: '+91 80 2525 3344',
    });

    const ngoProfile = await NGOProfile.create({
      user: ngo._id,
      organizationName: 'Bengaluru Annapoorna Seva Trust',
      registrationNumber: 'KA/2021/0284912',
      organizationType: 'food_bank',
      contactPerson: 'Smt. Radhika Hegde',
      phone: '+91 80 2525 3344',
      email: 'ngo@foodlink.org',
      capacity: 450,
      address: {
        street: '450 CMH Road, 2nd Stage, Indiranagar',
        city: 'Bengaluru',
        state: 'Karnataka',
        postalCode: '560038',
        country: 'India',
      },
      location: {
        type: 'Point',
        coordinates: [77.6412, 12.9719], // Indiranagar, Bengaluru
      },
      foodCategoriesAccepted: [
        FOOD_CATEGORIES.COOKED_MEALS,
        FOOD_CATEGORIES.BAKERY,
        FOOD_CATEGORIES.PRODUCE,
        FOOD_CATEGORIES.PACKAGED_FOOD,
        FOOD_CATEGORIES.DAIRY,
      ],
      storageCapabilities: {
        hasRefrigeration: true,
        hasFreezer: true,
        hasHotHolding: true,
        storageSquareFootage: 1200,
        specialNotes: 'Equipped with commercial cold room and food-grade insulated transport cambros.',
      },
      verificationStatus: 'verified',
    });
    logger.info('Provisioned verified NGO Profile for Bengaluru Annapoorna Seva Trust');

    const ngoTest = await createVerifiedUser({
      email: 'ngo@foodlinktest.org',
      name: 'Mysuru Food Relief Society',
      role: ROLES.NGO,
      password: 'Password123!',
      phone: '+91 821 244 5555',
    });

    await NGOProfile.create({
      user: ngoTest._id,
      organizationName: 'Mysuru Food Relief Society',
      registrationNumber: 'KA/2019/0154321',
      organizationType: 'shelter',
      contactPerson: 'Shri. Venkatesh Murthy',
      phone: '+91 821 244 5555',
      email: 'ngo@foodlinktest.org',
      capacity: 300,
      address: {
        street: '78 Sayyaji Rao Road, Near K.R. Circle',
        city: 'Mysuru',
        state: 'Karnataka',
        postalCode: '570001',
        country: 'India',
      },
      location: {
        type: 'Point',
        coordinates: [76.6548, 12.3118], // Mysuru Central
      },
      foodCategoriesAccepted: [
        FOOD_CATEGORIES.COOKED_MEALS,
        FOOD_CATEGORIES.BAKERY,
        FOOD_CATEGORIES.PRODUCE,
      ],
      storageCapabilities: {
        hasRefrigeration: true,
        hasFreezer: false,
        hasHotHolding: true,
      },
      verificationStatus: 'verified',
    });

    // 5. Delivery Partner (Bengaluru, Karnataka)
    const courier = await createVerifiedUser({
      email: 'courier@foodlink.org',
      name: 'Basavaraj Gowda',
      role: ROLES.DELIVERY,
      password: 'Password123!',
      phone: '+91 98450 12345',
    });

    await DeliveryProfile.create({
      user: courier._id,
      vehicleType: 'van',
      vehiclePlate: 'KA-04-NB-4421',
      thermalEquipment: {
        hasInsulatedBox: true,
        hasCoolingPack: true,
        hasHotHoldingContainer: true,
        maxCapacityKg: 80,
      },
      serviceArea: {
        city: 'Bengaluru',
        radiusKm: 30,
        currentCoordinates: [77.6200, 12.9352], // Koramangala, Bengaluru
      },
      availabilityStatus: 'available',
      accountStatus: 'verified',
    });
    logger.info('Provisioned verified Delivery Profile for Basavaraj Gowda (KA-04-NB-4421)');

    const courierTest = await createVerifiedUser({
      email: 'courier@foodlinktest.org',
      name: 'Ramesh Kumar (Volunteer)',
      role: ROLES.DELIVERY,
      password: 'Password123!',
      phone: '+91 98450 67890',
    });

    await DeliveryProfile.create({
      user: courierTest._id,
      vehicleType: 'car',
      vehiclePlate: 'KA-01-MJ-8840',
      thermalEquipment: {
        hasInsulatedBox: true,
        hasCoolingPack: true,
        hasHotHoldingContainer: false,
        maxCapacityKg: 40,
      },
      serviceArea: {
        city: 'Bengaluru',
        radiusKm: 25,
        currentCoordinates: [77.5946, 12.9716],
      },
      availabilityStatus: 'available',
      accountStatus: 'verified',
    });

    // 6. Seed Karnataka Authentic Surplus Food Donations
    const now = Date.now();
    const karnatakaDonations = [
      {
        foodName: 'Hot Bisi Bele Bath & Mysore Ghee Rice',
        description: 'Freshly prepared traditional Karnataka lunch catering surplus from corporate conference. Maintained hot above 65°C in food-grade thermal containers.',
        category: FOOD_CATEGORIES.COOKED_MEALS,
        quantity: 65,
        unit: 'portions',
        storageRequirement: STORAGE_REQUIREMENTS.HOT_INSULATED,
        packagingType: 'Thermal Cambro Food-Grade Insulated Carriers',
        preparationDate: new Date(now - 2 * 3600000),
        pickupDeadline: new Date(now + 4 * 3600000),
        expiryDate: new Date(now + 10 * 3600000),
        dietaryFlags: { isVegetarian: true, isGlutenFree: false },
        allergens: ['dairy', 'nuts'],
        pickupAddress: {
          street: '14 Lalbagh Road, Mavalli',
          city: 'Bengaluru',
          state: 'Karnataka',
          postalCode: '560027',
          country: 'India',
          instructions: 'Kitchen dispatch bay behind main dining hall. Ring service bell.',
        },
        coordinates: [77.5847, 12.9554], // Mavalli, Bengaluru
        temperature: 68,
      },
      {
        foodName: 'Mysuru Pak & Dharwad Peda Gift Boxes',
        description: 'Freshly boxed artisanal Karnataka sweets from morning confectionery batches. Packaged in sealed tamper-evident food-grade gift boxes.',
        category: FOOD_CATEGORIES.BAKERY,
        quantity: 40,
        unit: 'boxes',
        storageRequirement: STORAGE_REQUIREMENTS.AMBIENT,
        packagingType: 'Sealed Food-Grade Tin and Paperboard Boxes',
        preparationDate: new Date(now - 3 * 3600000),
        pickupDeadline: new Date(now + 8 * 3600000),
        expiryDate: new Date(now + 48 * 3600000),
        dietaryFlags: { isVegetarian: true },
        allergens: ['dairy'],
        pickupAddress: {
          street: '14 Lalbagh Road, Mavalli',
          city: 'Bengaluru',
          state: 'Karnataka',
          postalCode: '560027',
          country: 'India',
          instructions: 'Confectionery dispatch counter near gate 2.',
        },
        coordinates: [77.5847, 12.9554],
        temperature: 22,
      },
      {
        foodName: 'Fresh Curd Rice & Steamed Ragi Mudde Packs',
        description: 'Nutritious Karnataka wholesome meals prepared in commercial sanitized facility. Chilled curd rice maintained continuously under 4°C.',
        category: FOOD_CATEGORIES.COOKED_MEALS,
        quantity: 50,
        unit: 'portions',
        storageRequirement: STORAGE_REQUIREMENTS.REFRIGERATED,
        packagingType: 'Tamper-Evident Sealed Biodegradable Containers',
        preparationDate: new Date(now - 1 * 3600000),
        pickupDeadline: new Date(now + 6 * 3600000),
        expiryDate: new Date(now + 24 * 3600000),
        dietaryFlags: { isVegetarian: true, isGlutenFree: true },
        allergens: ['dairy'],
        pickupAddress: {
          street: '100 Feet Road, Indiranagar',
          city: 'Bengaluru',
          state: 'Karnataka',
          postalCode: '560038',
          country: 'India',
          instructions: 'Commercial kitchen dispatch lobby on ground floor.',
        },
        coordinates: [77.6412, 12.9719],
        temperature: 3.5,
      },
      {
        foodName: 'Karnataka Organic Mixed Vegetable Saaru & Chapati Sets',
        description: 'Traditional lentil rasam/saaru with whole wheat chapatis from community kitchen. Hot holding maintained above 65°C.',
        category: FOOD_CATEGORIES.COOKED_MEALS,
        quantity: 80,
        unit: 'portions',
        storageRequirement: STORAGE_REQUIREMENTS.HOT_INSULATED,
        packagingType: 'Insulated Stainless Steel Food Crates',
        preparationDate: new Date(now - 2.5 * 3600000),
        pickupDeadline: new Date(now + 5 * 3600000),
        expiryDate: new Date(now + 12 * 3600000),
        dietaryFlags: { isVegetarian: true, isVegan: true },
        allergens: [],
        pickupAddress: {
          street: 'Sayyaji Rao Road, Near Devaraja Market',
          city: 'Mysuru',
          state: 'Karnataka',
          postalCode: '570001',
          country: 'India',
          instructions: 'Side dock adjacent to market entrance.',
        },
        coordinates: [76.6548, 12.3118], // Mysuru
        temperature: 67,
      },
    ];

    for (const item of karnatakaDonations) {
      const { temperature, coordinates, ...donationFields } = item;
      const donation = await Donation.create({
        ...donationFields,
        donor: donor._id,
        status: DONATION_STATUS.AVAILABLE,
        location: {
          type: 'Point',
          coordinates,
        },
      });

      const checklist = await FoodSafetyChecklist.create({
        donation: donation._id,
        donor: donor._id,
        commercialKitchenPrepared: true,
        noConsumerBuffetContact: true,
        sealedSanitizedPackaging: true,
        labeledWithPreparationTime: true,
        temperatureCompliantAtPacking: true,
        recordedTemperatureCelsius: temperature,
        allergensAccuratelyDeclared: true,
        donorConfirmation: true,
        donorDeclarationName: donor.name,
        passedAllChecks: true,
        notes: 'Compliant with FSSAI (Recovery and Distribution of Surplus Food) Regulations, 2019 and Karnataka State Health Directives.',
      });

      donation.safetyChecklist = checklist._id;
      await donation.save();

      await StatusHistory.create({
        donation: donation._id,
        previousStatus: 'none',
        newStatus: DONATION_STATUS.AVAILABLE,
        actor: donor._id,
        actionName: 'created',
        reason: 'Initial Karnataka surplus food listing registered under FSSAI regulations',
      });

      logger.info(`Seeded verified Karnataka donation: "${donation.foodName}" in ${donation.pickupAddress.city}`);
    }

    // 7. Seed Initial Notifications
    await Notification.create({
      recipient: ngo._id,
      title: 'New Karnataka Surplus Listing Available',
      message: 'Mavalli Tiffin Room (MTR) listed Hot Bisi Bele Bath in Bengaluru.',
      notificationType: NOTIFICATION_TYPES.SYSTEM,
      isRead: false,
    });

    await Notification.create({
      recipient: admin._id,
      title: 'Karnataka Platform Initialized',
      message: 'Clean database initialized with Karnataka State entities complying with FSSAI regulations.',
      notificationType: NOTIFICATION_TYPES.SYSTEM,
      isRead: false,
    });

    logger.info('=====================================================');
    logger.info('Foodlink Karnataka Seeding Completed Successfully!');
    logger.info('Jurisdiction: State of Karnataka, India (FSSAI 2019 Regulations)');
    logger.info('Pre-seeded Login Credentials:');
    logger.info('• Admin:    admin@foodlink.org   / AdminSecure123! (or FoodlinkAdmin2026!)');
    logger.info('• Donor:    donor@foodlink.org   / Password123!');
    logger.info('• NGO:      ngo@foodlink.org     / Password123!');
    logger.info('• Courier:  courier@foodlink.org / Password123!');
    logger.info('=====================================================');
  } catch (error) {
    logger.error(`Seeding failed: ${error.message}`);
    process.exit(1);
  } finally {
    await disconnectDatabase();
  }
};

seedAll();
