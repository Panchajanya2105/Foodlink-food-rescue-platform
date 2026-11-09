import { connectDatabase, disconnectDatabase } from '../config/database.js';
import { User } from '../models/User.js';
import { config } from '../config/env.js';
import { ROLES, USER_STATUS } from '../constants/roles.js';
import { logger } from '../utils/logger.js';

const seedAdmin = async () => {
  try {
    await connectDatabase();

    const adminEmail = process.env.ADMIN_EMAIL || 'admin@foodlink.org';
    const adminPassword = config.adminSeedPassword;

    const existingAdmin = await User.findOne({ email: adminEmail });
    if (existingAdmin) {
      logger.info(`Admin account already exists: ${adminEmail}`);
      process.exit(0);
    }

    const admin = await User.create({
      name: 'Foodlink System Administrator',
      email: adminEmail,
      password: adminPassword,
      phone: '+1 (555) 000-0001',
      role: ROLES.ADMIN,
      accountStatus: USER_STATUS.VERIFIED,
      isVerified: true,
      profileComplete: true,
    });

    logger.info(`Initial Administrator seeded successfully:`);
    logger.info(`Email: ${admin.email}`);
    logger.info(`Role: ${admin.role}`);
    logger.info(`Account Status: ${admin.accountStatus}`);
  } catch (error) {
    logger.error(`Failed to seed administrator: ${error.message}`);
    process.exit(1);
  } finally {
    await disconnectDatabase();
  }
};

seedAdmin();

