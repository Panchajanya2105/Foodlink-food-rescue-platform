import { config } from '../config/env.js';

export const getCookieOptions = (isRefresh = false) => {
  const isProd = config.env === 'production';
  return {
    httpOnly: true,
    secure: isProd,
    sameSite: isProd ? 'strict' : 'lax',
    path: isRefresh ? '/api/v1/auth' : '/',
    maxAge: isRefresh ? 7 * 24 * 60 * 60 * 1000 : 15 * 60 * 1000, // 7 days or 15 minutes
  };
};

export const clearCookieOptions = (isRefresh = false) => {
  const isProd = config.env === 'production';
  return {
    httpOnly: true,
    secure: isProd,
    sameSite: isProd ? 'strict' : 'lax',
    path: isRefresh ? '/api/v1/auth' : '/',
  };
};

