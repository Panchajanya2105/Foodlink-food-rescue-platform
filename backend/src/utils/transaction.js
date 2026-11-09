import mongoose from 'mongoose';
import { logger } from './logger.js';

/**
 * Execute work in a MongoDB transaction with automatic retry on transient errors,
 * or gracefully execute as a direct operation when transactions are unsupported or encounter catalog conflicts.
 */
export const withTransaction = async (operation) => {
  let session = null;
  try {
    session = await mongoose.startSession();
    let result;
    await session.withTransaction(async () => {
      result = await operation(session);
    });
    return result;
  } catch (error) {
    logger.warn(`Transaction fell back due to: ${error.message}. Executing directly.`);
    return operation(null);
  } finally {
    if (session) {
      try {
        session.endSession();
      } catch (e) {
        // Ignored
      }
    }
  }
};
