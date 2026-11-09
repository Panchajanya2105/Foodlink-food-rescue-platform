import React from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Lock, ArrowRight } from 'lucide-react';
import { useAuth } from '../hooks/useAuth.js';
import { useToast } from '../hooks/useToast.js';
import { ROUTES } from '../constants/routes.js';
import { Button } from '../components/ui/Button.jsx';
import { Input } from '../components/ui/Input.jsx';
import { Card } from '../components/ui/Card.jsx';

const resetSchema = z
  .object({
    password: z.string().min(6, 'Password must be at least 6 characters'),
    confirmPassword: z.string().min(6, 'Please confirm your password'),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: 'Passwords do not match',
    path: ['confirmPassword'],
  });

export function ResetPasswordPage() {
  const { token } = useParams();
  const { resetPassword } = useAuth();
  const { success, error } = useToast();
  const navigate = useNavigate();

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: zodResolver(resetSchema),
  });

  const onSubmit = async (data) => {
    try {
      const res = await resetPassword(token, data.password);
      success(res.message, 'Password Reset Complete');
      navigate(ROUTES.LOGIN);
    } catch (err) {
      error(err.response?.data?.message || 'Invalid or expired reset token.');
    }
  };

  return (
    <div className="min-h-[70vh] flex items-center justify-center px-4 py-12">
      <Card className="max-w-md w-full p-8 bg-white border-cream-300 shadow-card space-y-5">
        <div className="text-center space-y-1">
          <div className="w-12 h-12 rounded-2xl bg-forest-50 text-forest-700 flex items-center justify-center mx-auto mb-2 border border-forest-200">
            <Lock className="w-6 h-6" />
          </div>
          <h1 className="text-2xl font-extrabold text-stone-900 tracking-tight">Set New Password</h1>
          <p className="text-xs text-stone-500">
            Please enter your new secure password (minimum 6 characters)
          </p>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <Input
            label="New Password"
            type="password"
            icon={Lock}
            placeholder="••••••••"
            error={errors.password?.message}
            {...register('password')}
          />

          <Input
            label="Confirm New Password"
            type="password"
            icon={Lock}
            placeholder="••••••••"
            error={errors.confirmPassword?.message}
            {...register('confirmPassword')}
          />

          <Button type="submit" variant="primary" className="w-full mt-2" loading={isSubmitting} icon={ArrowRight}>
            Confirm Password Change
          </Button>
        </form>
      </Card>
    </div>
  );
}

