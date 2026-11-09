import app from './app.js';
import { config } from './config/env.js';
import { connectDatabase } from './config/database.js';
import { User } from './models/User.js';
import { NGOProfile } from './models/NGOProfile.js';
import { DeliveryProfile } from './models/DeliveryProfile.js';
import { ROLES, USER_STATUS } from './constants/roles.js';
import { logger } from './utils/logger.js';

const autoSeedIfEmpty = async () => {
  try {
    const count = await User.countDocuments();
    if (count > 0) return;

    logger.info('Empty database detected. Auto-provisioning initial Foodlink demo accounts...');

    // 1. Admin
    await User.create({
      name: 'Karnataka Foodlink Administration',
      email: 'admin@foodlink.org',
      password: 'AdminSecure123!',
      phone: '+91 80 2558 0001',
      role: ROLES.ADMIN,
      accountStatus: USER_STATUS.VERIFIED,
      isVerified: true,
      profileComplete: true,
    });

    // 2. Donor
    await User.create({
      name: 'Mavalli Tiffin Room (MTR) Bengaluru',
      email: 'donor@foodlink.org',
      password: 'Password123!',
      phone: '+91 80 2222 0022',
      role: ROLES.DONOR,
      accountStatus: USER_STATUS.VERIFIED,
      isVerified: true,
      profileComplete: true,
    });

    // 3. NGO
    const ngo = await User.create({
      name: 'Bengaluru Annapoorna Seva Trust',
      email: 'ngo@foodlink.org',
      password: 'Password123!',
      phone: '+91 80 2525 3344',
      role: ROLES.NGO,
      accountStatus: USER_STATUS.VERIFIED,
      isVerified: true,
      profileComplete: true,
    });

    await NGOProfile.create({
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
        coordinates: [77.6412, 12.9719],
      },
      foodCategoriesAccepted: ['cooked_meals', 'bakery', 'produce', 'packaged_food', 'dairy'],
      storageCapabilities: {
        hasRefrigeration: true,
        hasFreezer: true,
        hasHotHolding: true,
      },
      verificationStatus: 'verified',
    });

    // 4. Delivery Courier
    const courier = await User.create({
      name: 'Basavaraj Gowda',
      email: 'courier@foodlink.org',
      password: 'Password123!',
      phone: '+91 98450 12345',
      role: ROLES.DELIVERY,
      accountStatus: USER_STATUS.VERIFIED,
      isVerified: true,
      profileComplete: true,
    });

    await DeliveryProfile.create({
      user: courier._id,
      vehicleType: 'van',
      vehiclePlate: 'KA-04-NB-4421',
      serviceArea: {
        city: 'Bengaluru',
        radiusKm: 30,
        currentCoordinates: [77.6200, 12.9352],
      },
      availabilityStatus: 'available',
      accountStatus: 'verified',
    });

    logger.info('Auto-provisioned default demo accounts: admin, donor, ngo, and courier (@foodlink.org).');
  } catch (seedErr) {
    logger.warn(`Auto-seed non-fatal notice: ${seedErr.message}`);
  }
};

const startServer = async () => {
  try {
    // Attempt database connection (graceful fallback in dev if mongo is not yet running)
    try {
      await connectDatabase();
      await autoSeedIfEmpty();
    } catch (dbErr) {
      logger.warn(`Initial MongoDB connection failed: ${dbErr.message}. Server starting in offline-db mode.`);
    }

    const server = app.listen(config.port, () => {
      logger.info(`Foodlink Server listening on port ${config.port} (${config.env} mode)`);
      logger.info(`Health check available at http://localhost:${config.port}/api/health`);
    });

    // Graceful shutdown
    const handleShutdown = (signal) => {
      logger.info(`Received ${signal}. Shutting down gracefully...`);
      server.close(() => {
        logger.info('HTTP server closed.');
        process.exit(0);
      });
    };

    process.on('SIGTERM', () => handleShutdown('SIGTERM'));
    process.on('SIGINT', () => handleShutdown('SIGINT'));
  } catch (err) {
    logger.error(`Failed to start server: ${err.message}`);
    process.exit(1);
  }
};

startServer();

