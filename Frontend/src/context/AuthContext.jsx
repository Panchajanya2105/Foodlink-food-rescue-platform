import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import api from '../services/api.js';
import { ROLES } from '../constants/roles.js';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  // Check existing session via HttpOnly cookie on initial mount
  const checkAuthStatus = useCallback(async () => {
    try {
      const res = await api.get('/v1/auth/me');
      if (res.data?.data?.user) {
        setUser(res.data.data.user);
        setProfile(res.data.data.profile || null);
      }
    } catch (err) {
      // 401 or network error simply means unauthenticated guest
      setUser(null);
      setProfile(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    checkAuthStatus();
  }, [checkAuthStatus]);

  const login = async (email, password) => {
    setLoading(true);
    try {
      const res = await api.post('/v1/auth/login', { email, password });
      const authenticatedUser = res.data.data.user;
      setUser(authenticatedUser);
      // Fetch full role profile
      await checkAuthStatus();
      return authenticatedUser;
    } finally {
      setLoading(false);
    }
  };

  const register = async (userData) => {
    setLoading(true);
    try {
      const res = await api.post('/v1/auth/register', userData);
      const registeredUser = res.data.data.user;
      setUser(registeredUser);
      await checkAuthStatus();
      return registeredUser;
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    try {
      await api.post('/v1/auth/logout');
    } catch (err) {
      // Continue client cleanup even if request fails
    } finally {
      setUser(null);
      setProfile(null);
    }
  };

  const changePassword = async (currentPassword, newPassword) => {
    const res = await api.post('/v1/auth/change-password', {
      currentPassword,
      newPassword,
    });
    setUser(null);
    setProfile(null);
    return res.data;
  };

  const forgotPassword = async (email) => {
    const res = await api.post('/v1/auth/forgot-password', { email });
    return res.data;
  };

  const resetPassword = async (token, newPassword) => {
    const res = await api.post(`/v1/auth/reset-password/${token}`, { newPassword });
    return res.data;
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        profile,
        isAuthenticated: !!user,
        loading,
        login,
        register,
        logout,
        checkAuthStatus,
        changePassword,
        forgotPassword,
        resetPassword,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
