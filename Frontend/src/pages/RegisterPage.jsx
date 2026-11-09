import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Utensils, HeartHandshake, Truck, ArrowRight, ShieldCheck, Check } from 'lucide-react';
import { ROLES, ROLE_LABELS } from '../constants/roles.js';
import { ROUTES } from '../constants/routes.js';
import { useAuth } from '../hooks/useAuth.js';
import { useToast } from '../hooks/useToast.js';
import { Button } from '../components/ui/Button.jsx';
import { Input } from '../components/ui/Input.jsx';
import { Select } from '../components/ui/Select.jsx';
import { Card } from '../components/ui/Card.jsx';
import { cn } from '../utils/cn.js';

const registerSchema = z.object({
  role: z.enum([ROLES.DONOR, ROLES.NGO, ROLES.DELIVERY]),
  name: z.string().min(2, 'Contact / Full Name must be at least 2 characters'),
  email: z.string().email('Please enter a valid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  phone: z.string().min(8, 'Phone number must be at least 8 digits'),
  organizationName: z.string().optional(),
  address: z.string().min(5, 'Physical operating address is required for safety verification'),
  // Role-specific fields
  capacity: z.string().optional(),
  vehicleType: z.string().optional(),
});

export function RegisterPage() {
  const [selectedRole, setSelectedRole] = useState(ROLES.DONOR);
  const { register: registerAuth } = useAuth();
  const { success, error } = useToast();
  const navigate = useNavigate();

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      role: ROLES.DONOR,
      name: '',
      email: '',
      password: '',
      phone: '',
      organizationName: '',
      address: '',
      capacity: '100',
      vehicleType: 'car',
    },
  });

  const handleRoleSelect = (role) => {
    setSelectedRole(role);
    setValue('role', role);
  };

  const onSubmit = async (data) => {
    try {
      const user = await registerAuth({
        name: data.name,
        email: data.email,
        password: data.password,
        phone: data.phone,
        role: data.role,
        organizationName: data.organizationName || data.name,
        address: data.address,
      });

      success(
        `Welcome to Foodlink, ${user.name}! Your account has been initialized.`,
        'Account Registered'
      );

      const dest =
        user.role === ROLES.DONOR
          ? ROUTES.DONOR_DASHBOARD
          : user.role === ROLES.NGO
          ? ROUTES.NGO_DASHBOARD
          : ROUTES.DELIVERY_DASHBOARD;

      navigate(dest);
    } catch (err) {
      error(err.response?.data?.message || 'Registration failed. Please check inputs.');
    }
  };

  return (
    <div className="max-w-3xl mx-auto px-4 py-12">
      <div className="text-center space-y-2 mb-8">
        <h1 className="text-3xl font-extrabold text-stone-900 tracking-tight">Join the Foodlink Rescue Network</h1>
        <p className="text-sm text-stone-600 max-w-lg mx-auto">
          Every partner is verified under municipal food safety standards to eliminate hunger and waste responsibly.
        </p>
      </div>

      {/* Role Picker Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        {[
          {
            role: ROLES.DONOR,
            title: 'Food Donor',
            icon: Utensils,
            desc: 'Commercial kitchens, bakeries, cafes, and caterers with safe surplus food.',
          },
          {
            role: ROLES.NGO,
            title: 'NGO / Shelter',
            icon: HeartHandshake,
            desc: 'Verified non-profit shelters, pantries, and kitchens feeding local families.',
          },
          {
            role: ROLES.DELIVERY,
            title: 'Delivery Courier',
            icon: Truck,
            desc: 'Certified volunteers and transport fleets with thermal transit containers.',
          },
        ].map((item) => {
          const Icon = item.icon;
          const isSelected = selectedRole === item.role;
          return (
            <button
              key={item.role}
              type="button"
              onClick={() => handleRoleSelect(item.role)}
              className={cn(
                'p-4 rounded-2xl border text-left transition-all duration-200 cursor-pointer',
                isSelected
                  ? 'bg-forest-50 border-forest-600 ring-2 ring-forest-500/30'
                  : 'bg-white border-cream-300 hover:border-forest-300'
              )}
            >
              <div
                className={cn(
                  'w-9 h-9 rounded-xl flex items-center justify-center mb-3',
                  isSelected ? 'bg-forest-600 text-white' : 'bg-cream-100 text-stone-600'
                )}
              >
                <Icon className="w-5 h-5" />
              </div>
              <h3 className="text-sm font-bold text-stone-900">{item.title}</h3>
              <p className="text-xs text-stone-500 mt-1 leading-relaxed">{item.desc}</p>
            </button>
          );
        })}
      </div>

      {/* Registration & Onboarding Form */}
      <Card className="border-cream-300 p-6 sm:p-8 bg-white shadow-card">
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <input type="hidden" {...register('role')} />

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input
              label={selectedRole === ROLES.DELIVERY ? 'Full Legal Name' : 'Organization / Business Name'}
              placeholder={selectedRole === ROLES.DELIVERY ? 'Marcus Vance' : 'Artisan Bakery Co.'}
              error={errors.organizationName?.message}
              {...register('organizationName')}
            />

            <Input
              label="Contact Representative Name"
              placeholder="Primary contact person"
              error={errors.name?.message}
              {...register('name')}
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input
              label="Official Contact Email"
              type="email"
              placeholder="contact@organization.org"
              error={errors.email?.message}
              {...register('email')}
            />

            <Input
              label="Emergency Contact Phone"
              placeholder="+1 (555) 000-0000"
              error={errors.phone?.message}
              {...register('phone')}
            />
          </div>

          <Input
            label="Operating Premises / Depot Address"
            placeholder="Street address, City, State, Postal Code"
            error={errors.address?.message}
            {...register('address')}
          />

          <Input
            label="Account Password"
            type="password"
            placeholder="Minimum 6 characters"
            error={errors.password?.message}
            {...register('password')}
          />

          {/* Role-Specific Onboarding Block */}
          {selectedRole === ROLES.NGO && (
            <div className="p-4 rounded-xl bg-amber-50/70 border border-amber-200 space-y-3">
              <span className="text-xs font-bold uppercase tracking-wider text-amber-800 block">
                Shelter Intake Specifications
              </span>
              <Input
                label="Daily Intake Capacity (Meals/Persons)"
                type="number"
                placeholder="100"
                {...register('capacity')}
              />
              <p className="text-[11px] text-stone-500">
                Storage capabilities (Refrigeration/Freezers) can be customized anytime in your NGO Console.
              </p>
            </div>
          )}

          {selectedRole === ROLES.DELIVERY && (
            <div className="p-4 rounded-xl bg-sky-50/70 border border-sky-200 space-y-3">
              <span className="text-xs font-bold uppercase tracking-wider text-sky-800 block">
                Vehicle & Transit Specifications
              </span>
              <Select
                label="Primary Rescue Vehicle"
                options={[
                  { value: 'car', label: 'Passenger Car (Insulated Trunk/Boxes)' },
                  { value: 'van', label: 'Cargo Van / Insulated Van' },
                  { value: 'motorcycle', label: 'Motorcycle with Thermal Carrier' },
                  { value: 'bicycle', label: 'Cargo Bicycle (Local Radius)' },
                  { value: 'insulated_truck', label: 'Refrigerated Transport Truck' },
                ]}
                {...register('vehicleType')}
              />
            </div>
          )}

          <div className="pt-2">
            <Button type="submit" variant="primary" className="w-full" loading={isSubmitting} icon={ArrowRight}>
              Complete Onboarding as {ROLE_LABELS[selectedRole]}
            </Button>
          </div>
        </form>

        <div className="mt-6 pt-4 border-t border-cream-200 text-center">
          <p className="text-xs text-stone-500">
            Already registered?{' '}
            <Link to={ROUTES.LOGIN} className="text-forest-700 font-bold hover:underline">
              Sign In to your terminal
            </Link>
          </p>
        </div>
      </Card>
    </div>
  );
}
