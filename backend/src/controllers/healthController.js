import mongoose from 'mongoose';
import { sendSuccess } from '../utils/apiResponse.js';

export const getHealth = (req, res) => {
  const dbStateMap = {
    0: 'disconnected',
    1: 'connected',
    2: 'connecting',
    3: 'disconnecting',
  };

  const dbStatus = dbStateMap[mongoose.connection.readyState] || 'unknown';

  return sendSuccess(res, {
    service: 'Foodlink API',
    status: 'healthy',
    uptime: process.uptime(),
    timestamp: new Date().toISOString(),
    database: dbStatus,
    version: '1.0.0',
  }, 'Service health status');
};

