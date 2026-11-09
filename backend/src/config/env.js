import dotenv from 'dotenv';
dotenv.config();

export const config = Object.freeze({
  env: process.env.NODE_ENV || 'development',
  port: parseInt(process.env.PORT || '5000', 10),
  mongoUri: process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/foodlink',
  jwtSecret: process.env.JWT_SECRET || 'dev_jwt_secret_foodlink_safe_default_key_change_in_production',
  jwtExpiresIn: process.env.JWT_EXPIRES_IN || '15m',
  jwtRefreshSecret: process.env.JWT_REFRESH_SECRET || 'dev_jwt_refresh_secret_foodlink_safe_default_key',
  jwtRefreshExpiresIn: process.env.JWT_REFRESH_EXPIRES_IN || '7d',
  clientUrl: process.env.CLIENT_URL || 'http://localhost:5173',
  adminSeedPassword: process.env.ADMIN_SEED_PASSWORD || 'FoodlinkAdmin2026!',
});
