import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Settings, User, Building, Phone, Mail, Lock, ShieldCheck, CheckCircle2 } from 'lucide-react';
import { useAuth } from '../../hooks/useAuth.js';
import { useToast } from '../../hooks/useToast.js';
import { Card } from '../../components/ui/Card.jsx';
import { Input } from '../../components/ui/Input.jsx';
import { Button } from '../../components/ui/Button.jsx';
import api from '../../services/api.js';

const passwordSchema = z
  .object({
    currentPassword: z.string().min(1, 'Current password is required'),
    newPassword: z.string().min(6, 'New password must be at least 6 characters'),
    confirmPassword: z.string().min(6, 'Confirm password must match'),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: 'Passwords do not match',
    path: ['confirmPassword'],
  });

export function DonorProfilePage() {
  const { user } = useAuth();
  const { success, error: toastError } = useToast();

  const [savingProfile, setSavingProfile] = useState(false);
  const [profileName, setProfileName] = useState(user?.name || '');
  const [profilePhone, setProfilePhone] = useState(user?.phone || '');

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: zodResolver(passwordSchema),
  });

  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    setSavingProfile(true);
    try {
      await api.patch('/v1/users/profile', {
        name: profileName,
        phone: profilePhone,
      });
      success('Donor profile updated successfully.');
    } catch (err) {
      toastError(err.response?.data?.message || 'Failed to update profile.');
    } finally {
      setSavingProfile(false);
    }
  };

  const handleChangePassword = async (data) => {
    try {
      await api.post('/v1/auth/change-password', {
        currentPassword: data.currentPassword,
        newPassword: data.newPassword,
      });
      success('Password changed successfully. Please keep it safe.', 'Security Updated');
      reset();
    } catch (err) {
      toastError(err.response?.data?.message || 'Failed to change password.');
    }
  };

  return (
    <div className="space-y-8 max-w-4xl">
      <div>
        <h1 className="text-2xl font-black text-stone-900 tracking-tight flex items-center gap-2">
          <Settings className="w-6 h-6 text-forest-700" />
          Donor Profile & Operational Settings
        </h1>
        <p className="text-xs sm:text-sm text-stone-500">
          Manage your culinary business information, default pickup location, and account credentials.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Profile Details */}
        <Card className="p-6 border-cream-200 bg-white space-y-5">
          <h2 className="text-base font-bold text-stone-900 flex items-center gap-2">
            <Building className="w-4 h-4 text-forest-700" />
            Culinary Business Profile
          </h2>

          <form onSubmit={handleUpdateProfile} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-stone-700 mb-1">Contact Person Name</label>
              <Input
                value={profileName}
                onChange={(e) => setProfileName(e.target.value)}
                placeholder="e.g. Chef Marcus Vance"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-stone-700 mb-1">Registered Email (Read Only)</label>
              <Input value={user?.email || ''} disabled className="bg-cream-50 text-stone-500" />
            </div>

            <div>
              <label className="block text-xs font-bold text-stone-700 mb-1">Phone Number</label>
              <Input
                value={profilePhone}
                onChange={(e) => setProfilePhone(e.target.value)}
                placeholder="+1 555-0100"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-stone-700 mb-1">Business Organization</label>
              <Input
                value={user?.organizationName || 'Artisan Food Partner'}
                disabled
                className="bg-cream-50 text-stone-500"
              />
            </div>

            <Button type="submit" variant="primary" size="sm" disabled={savingProfile} className="w-full">
              {savingProfile ? 'Saving Changes...' : 'Save Profile Changes'}
            </Button>
          </form>
        </Card>

        {/* Change Password */}
        <Card className="p-6 border-cream-200 bg-white space-y-5">
          <h2 className="text-base font-bold text-stone-900 flex items-center gap-2">
            <Lock className="w-4 h-4 text-forest-700" />
            Update Password & Security
          </h2>

          <form onSubmit={handleSubmit(handleChangePassword)} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-stone-700 mb-1">Current Password</label>
              <Input type="password" {...register('currentPassword')} placeholder="••••••••" />
              {errors.currentPassword && (
                <p className="text-[11px] text-red-600 mt-1">{errors.currentPassword.message}</p>
              )}
            </div>

            <div>
              <label className="block text-xs font-bold text-stone-700 mb-1">New Password</label>
              <Input type="password" {...register('newPassword')} placeholder="At least 6 characters" />
              {errors.newPassword && (
                <p className="text-[11px] text-red-600 mt-1">{errors.newPassword.message}</p>
              )}
            </div>

            <div>
              <label className="block text-xs font-bold text-stone-700 mb-1">Confirm New Password</label>
              <Input type="password" {...register('confirmPassword')} placeholder="Re-enter new password" />
              {errors.confirmPassword && (
                <p className="text-[11px] text-red-600 mt-1">{errors.confirmPassword.message}</p>
              )}
            </div>

            <Button type="submit" variant="outline" size="sm" disabled={isSubmitting} className="w-full">
              {isSubmitting ? 'Updating...' : 'Change Password'}
            </Button>
          </form>
        </Card>
      </div>
    </div>
  );
}

