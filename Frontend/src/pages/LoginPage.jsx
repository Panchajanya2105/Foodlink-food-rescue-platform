import React, { useState } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Utensils, Lock, Mail, ArrowRight, Sparkles } from 'lucide-react';
import { ROLES, ROLE_LABELS } from '../constants/roles.js';
import { ROUTES } from '../constants/routes.js';
import { useAuth } from '../hooks/useAuth.js';
import { useToast } from '../hooks/useToast.js';
import { Button } from '../components/ui/Button.jsx';
import { Input } from '../components/ui/Input.jsx';
import { Card } from '../components/ui/Card.jsx';
import { cn } from '../utils/cn.js';

const loginSchema = z.object({
  email: z.string().email('Please enter a valid email address'),
  password: z.string().min(1, 'Password is required'),
});

const DEMO_CREDENTIALS = {
  [ROLES.DONOR]: {
    email: 'donor@foodlink.org',
    password: 'Password123!',
    label: 'Donor Demo',
  },
  [ROLES.NGO]: {
    email: 'ngo@foodlink.org',
    password: 'Password123!',
    label: 'NGO Demo',
  },
  [ROLES.DELIVERY]: {
    email: 'courier@foodlink.org',
    password: 'Password123!',
    label: 'Courier Demo',
  },
  [ROLES.ADMIN]: {
    email: 'admin@foodlink.org',
    password: 'AdminSecure123!',
    label: 'Admin Master',
  },
};

export function LoginPage() {
  const [selectedRole, setSelectedRole] = useState(ROLES.DONOR);
  const { login } = useAuth();
  const { success, error } = useToast();
  const navigate = useNavigate();
  const location = useLocation();

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: DEMO_CREDENTIALS[ROLES.DONOR].email,
      password: DEMO_CREDENTIALS[ROLES.DONOR].password,
    },
  });

  const handleRoleTabChange = (role) => {
    setSelectedRole(role);
    const creds = DEMO_CREDENTIALS[role];
    if (creds) {
      setValue('email', creds.email, { shouldValidate: true, shouldDirty: true, shouldTouch: true });
      setValue('password', creds.password, { shouldValidate: true, shouldDirty: true, shouldTouch: true });
    }
  };

  const onSubmit = async (data) => {
    try {
      const user = await login(data.email, data.password);
      success(`Welcome back, ${user.name}!`, 'Signed In Successfully');

      // Determine redirect destination
      const destination =
        location.state?.from?.pathname ||
        (user.role === ROLES.DONOR
          ? ROUTES.DONOR_DASHBOARD
          : user.role === ROLES.NGO
          ? ROUTES.NGO_DASHBOARD
          : user.role === ROLES.DELIVERY
          ? ROUTES.DELIVERY_DASHBOARD
          : ROUTES.ADMIN_DASHBOARD);

      navigate(destination, { replace: true });
    } catch (err) {
      error(err.response?.data?.message || 'Authentication failed. Please verify your credentials.');
    }
  };

  return (
    <div className="min-h-[calc(100vh-10rem)] flex items-center justify-center px-4 py-12">
      <div className="max-w-md w-full space-y-6">
        <div className="text-center space-y-2">
          <div className="inline-flex w-12 h-12 rounded-2xl bg-forest-600 items-center justify-center text-white mb-2 shadow-sm">
            <Utensils className="w-6 h-6" />
          </div>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-stone-900 tracking-tight">Partner Portal Sign In</h2>
          <p className="text-xs sm:text-sm text-stone-500">
            Sign in to access your role-based operations console
          </p>
        </div>

        {/* Quick Demo Pre-fill Tabs */}
        <div className="bg-cream-200/70 p-1.5 rounded-2xl">
          <div className="flex items-center justify-between px-2 py-1 mb-1 text-[11px] font-bold uppercase tracking-wider text-stone-500">
            <span className="flex items-center gap-1">
              <Sparkles className="w-3.5 h-3.5 text-amber-500" /> Demo Accounts Pre-fill:
            </span>
          </div>
          <div className="grid grid-cols-4 gap-1 text-xs font-semibold">
            {Object.values(ROLES).map((role) => (
              <button
                key={role}
                type="button"
                onClick={() => handleRoleTabChange(role)}
                className={cn(
                  'py-2 px-1 rounded-xl transition-all text-center truncate cursor-pointer',
                  selectedRole === role
                    ? 'bg-white text-stone-900 shadow-sm font-bold border border-cream-300'
                    : 'text-stone-600 hover:text-stone-900 hover:bg-cream-100/50'
                )}
              >
                {role === ROLES.DELIVERY ? 'Courier' : ROLE_LABELS[role].split(' ')[0]}
              </button>
            ))}
          </div>
        </div>

        <Card className="border-cream-300 shadow-floating p-6 sm:p-8 bg-white">
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <Input
              label="Official Email Address"
              type="email"
              icon={Mail}
              placeholder="name@organization.org"
              error={errors.email?.message}
              {...register('email')}
            />

            <Input
              label="Account Password"
              type="password"
              icon={Lock}
              placeholder="••••••••"
              error={errors.password?.message}
              {...register('password')}
            />

            <div className="flex items-center justify-between text-xs pt-1">
              <label className="flex items-center gap-2 cursor-pointer text-stone-600">
                <input type="checkbox" defaultChecked className="rounded text-forest-600 focus:ring-forest-500" />
                <span>Keep session active</span>
              </label>
              <Link to="/forgot-password" className="text-forest-700 hover:underline font-semibold">
                Forgot password?
              </Link>
            </div>

            <Button type="submit" variant="primary" className="w-full mt-2" loading={isSubmitting} icon={ArrowRight}>
              Sign In to Foodlink
            </Button>
          </form>

          <div className="mt-6 pt-5 border-t border-cream-200 text-center">
            <p className="text-xs text-stone-500">
              Need a partner account?{' '}
              <Link to={ROUTES.REGISTER} className="text-forest-700 font-bold hover:underline">
                Register as Donor, NGO or Courier
              </Link>
            </p>
          </div>
        </Card>
      </div>
    </div>
  );
}
