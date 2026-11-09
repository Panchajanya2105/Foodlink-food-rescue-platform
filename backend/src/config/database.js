import mongoose from 'mongoose';
import { config } from './env.js';
import { logger } from '../utils/logger.js';

let isConnected = false;

export const connectDatabase = async (uri = config.mongoUri) => {
  if (isConnected) {
    logger.info('Using existing database connection');
    return mongoose.connection;
  }

  try {
    const conn = await mongoose.connect(uri, {
      serverSelectionTimeoutMS: 5000,
    });
    isConnected = true;
    logger.info(`MongoDB Connected: ${conn.connection.host}/${conn.connection.name}`);

    // Pre-create collections to prevent DDL catalog change errors inside multi-document transactions
    for (const model of Object.values(mongoose.models)) {
      await model.init().catch(() => {});
    }

    return conn.connection;
  } catch (error) {
    logger.error(`MongoDB connection error: ${error.message}`);
    throw error;
  }
};

export const disconnectDatabase = async () => {
  if (!isConnected) return;
  await mongoose.disconnect();
  isConnected = false;
  logger.info('MongoDB disconnected');
};

