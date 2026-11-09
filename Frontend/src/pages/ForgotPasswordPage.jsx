import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Mail, ArrowRight, ArrowLeft, KeyRound } from 'lucide-react';
import { useAuth } from '../hooks/useAuth.js';
import { useToast } from '../hooks/useToast.js';
import { ROUTES } from '../constants/routes.js';
import { Button } from '../components/ui/Button.jsx';
import { Input } from '../components/ui/Input.jsx';
import { Card } from '../components/ui/Card.jsx';

const forgotSchema = z.object({
  email: z.string().email('Please enter a valid email address'),
});

export function ForgotPasswordPage() {
  const { forgotPassword } = useAuth();
  const { success, error } = useToast();
  const [devToken, setDevToken] = useState(null);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: zodResolver(forgotSchema),
  });

  const onSubmit = async (data) => {
    try {
      const res = await forgotPassword(data.email);
      success(res.message, 'Instructions Dispatched');
      if (res.resetToken) {
        setDevToken(res.resetToken);
      }
    } catch (err) {
      error(err.response?.data?.message || 'Could not initiate reset. Please try again.');
    }
  };

  return (
    <div className="min-h-[70vh] flex items-center justify-center px-4 py-12">
      <Card className="max-w-md w-full p-8 bg-white border-cream-300 shadow-card space-y-5">
        <div className="text-center space-y-1">
          <div className="w-12 h-12 rounded-2xl bg-forest-50 text-forest-700 flex items-center justify-center mx-auto mb-2 border border-forest-200">
            <KeyRound className="w-6 h-6" />
          </div>
          <h1 className="text-2xl font-extrabold text-stone-900 tracking-tight">Forgot Password?</h1>
          <p className="text-xs text-stone-500">
            Enter your official account email to generate password reset credentials
          </p>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <Input
            label="Email Address"
            type="email"
            icon={Mail}
            placeholder="name@organization.org"
            error={errors.email?.message}
            {...register('email')}
          />

          <Button type="submit" variant="primary" className="w-full" loading={isSubmitting} icon={ArrowRight}>
            Request Password Reset
          </Button>
        </form>

        {devToken && (
          <div className="p-4 bg-emerald-50 rounded-2xl border border-emerald-200 text-xs text-emerald-900 space-y-2">
            <p className="font-bold">Development Mode Reset Token Generated:</p>
            <p className="font-mono bg-white p-2 rounded-lg border border-emerald-300 break-all select-all">
              {devToken}
            </p>
            <Link to={`/reset-password/${devToken}`}>
              <Button variant="secondary" size="sm" className="w-full mt-1">
                Proceed to Reset Password Screen
              </Button>
            </Link>
          </div>
        )}

        <div className="pt-2 text-center border-t border-cream-200">
          <Link to={ROUTES.LOGIN} className="text-xs font-semibold text-stone-600 hover:text-forest-700 flex items-center justify-center gap-1">
            <ArrowLeft className="w-3.5 h-3.5" /> Back to Sign In
          </Link>
        </div>
      </Card>
    </div>
  );
}

