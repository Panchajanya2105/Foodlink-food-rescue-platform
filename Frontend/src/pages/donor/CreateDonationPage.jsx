import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import {
  PackagePlus,
  Clock,
  MapPin,
  ShieldCheck,
  AlertTriangle,
  ArrowRight,
  ArrowLeft,
  CheckCircle2,
  CheckCheck,
  Sparkles,
  Thermometer,
  Layers,
  Scale,
  Calendar,
} from 'lucide-react';
import { useToast } from '../../hooks/useToast.js';
import { useAuth } from '../../hooks/useAuth.js';
import { ROUTES } from '../../constants/routes.js';
import { Card } from '../../components/ui/Card.jsx';
import { Button } from '../../components/ui/Button.jsx';
import { Input } from '../../components/ui/Input.jsx';
import { Badge } from '../../components/ui/Badge.jsx';
import api from '../../services/api.js';

const createDonationSchema = z
  .object({
    // Step 1: Food Details
    foodName: z.string().min(3, 'Food item name must be at least 3 characters'),
    description: z.string().max(1000).optional(),
    category: z.enum(['cooked_meals', 'raw_ingredients', 'packaged_food', 'bakery', 'dairy', 'produce', 'beverages']),
    mealType: z.string().optional(),
    quantity: z.coerce.number().min(1, 'Quantity must be at least 1'),
    unit: z.enum(['meals', 'portions', 'kg', 'boxes', 'trays', 'litres', 'packages']),
    storageRequirement: z.enum(['ambient', 'refrigerated', 'frozen', 'hot_insulated']),
    packagingType: z.string().min(2, 'Packaging type is required'),
    allergens: z.array(z.string()).default([]),
    dietaryFlags: z
      .object({
        isVegetarian: z.boolean().default(false),
        isVegan: z.boolean().default(false),
        isHalal: z.boolean().default(false),
        isGlutenFree: z.boolean().default(false),
      })
      .default({}),

    // Step 2: Critical Timestamps
    preparationDate: z.string().min(1, 'Preparation date & time is required'),
    pickupDeadline: z.string().min(1, 'Pickup deadline is required'),
    expiryDate: z.string().min(1, 'Expiry date & time is required'),

    // Step 3: Location
    pickupAddress: z.object({
      street: z.string().min(3, 'Street address is required'),
      city: z.string().min(2, 'City is required'),
      state: z.string().optional(),
      postalCode: z.string().min(3, 'Postal code is required'),
      instructions: z.string().optional(),
    }),

    // Step 4: Food Safety Checklist
    commercialKitchenPrepared: z.boolean().default(true),
    noConsumerBuffetContact: z.boolean().default(true),
    sealedSanitizedPackaging: z.boolean().default(true),
    labeledWithPreparationTime: z.boolean().default(true),
    temperatureCompliantAtPacking: z.boolean().default(true),
    recordedTemperatureCelsius: z.coerce.number().default(4),
    allergensAccuratelyDeclared: z.boolean().default(true),
    donorConfirmation: z.boolean().refine((val) => val === true, {
      message: 'Please confirm the food safety declaration checkbox',
    }),
    donorDeclarationName: z.string().min(2, 'Signatory full name is required for legal record'),
    checklistNotes: z.string().optional(),
  })
  .refine(
    (data) => {
      const prep = new Date(data.preparationDate);
      const expiry = new Date(data.expiryDate);
      return expiry > prep;
    },
    {
      message: 'Expiry date must be after preparation date',
      path: ['expiryDate'],
    }
  )
  .refine(
    (data) => {
      const pickup = new Date(data.pickupDeadline);
      const expiry = new Date(data.expiryDate);
      return pickup <= expiry;
    },
    {
      message: 'Pickup deadline cannot be later than expiry date',
      path: ['pickupDeadline'],
    }
  )
  .refine(
    (data) => {
      const pickup = new Date(data.pickupDeadline);
      // Allow 5 minutes buffer so form completion duration does not invalidate pickup
      return pickup.getTime() > Date.now() - 5 * 60 * 1000;
    },
    {
      message: 'Pickup deadline must be set in the future',
      path: ['pickupDeadline'],
    }
  );

// Helper to format dates in local timezone for <input type="datetime-local">
const toLocalDatetimeString = (dateInput) => {
  const d = new Date(dateInput);
  const pad = (n) => String(n).padStart(2, '0');
  const year = d.getFullYear();
  const month = pad(d.getMonth() + 1);
  const day = pad(d.getDate());
  const hours = pad(d.getHours());
  const minutes = pad(d.getMinutes());
  return `${year}-${month}-${day}T${hours}:${minutes}`;
};

export function CreateDonationPage() {
  const { user } = useAuth();
  const { success, error: toastError } = useToast();
  const navigate = useNavigate();

  const [step, setStep] = useState(1);

  // Default initial timestamp values in local timezone: 1h ago prep, 4h future pickup, 24h future expiry
  const defaultPrep = toLocalDatetimeString(Date.now() - 3600000);
  const defaultPickup = toLocalDatetimeString(Date.now() + 4 * 3600000);
  const defaultExpiry = toLocalDatetimeString(Date.now() + 24 * 3600000);

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    trigger,
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: zodResolver(createDonationSchema),
    defaultValues: {
      foodName: '',
      category: 'cooked_meals',
      unit: 'portions',
      quantity: 30,
      storageRequirement: 'ambient',
      packagingType: 'Sanitized Stainless Food Cambros',
      allergens: [],
      preparationDate: defaultPrep,
      pickupDeadline: defaultPickup,
      expiryDate: defaultExpiry,
      commercialKitchenPrepared: true,
      noConsumerBuffetContact: true,
      sealedSanitizedPackaging: true,
      labeledWithPreparationTime: true,
      temperatureCompliantAtPacking: true,
      allergensAccuratelyDeclared: true,
      donorConfirmation: true,
      recordedTemperatureCelsius: 4,
      pickupAddress: {
        street: '100 Feet Road, Indiranagar',
        city: 'Bengaluru',
        postalCode: '560038',
        state: 'Karnataka',
      },
      donorDeclarationName: user?.name || 'Authorized Food Donor',
      dietaryFlags: {
        isVegetarian: false,
        isVegan: false,
        isHalal: false,
        isGlutenFree: false,
      },
    },
  });

  const watchPickupDeadline = watch('pickupDeadline');
  const watchExpiryDate = watch('expiryDate');

  const calculatePreviewUrgency = () => {
    if (!watchPickupDeadline) return null;
    const now = new Date();
    const deadline = new Date(watchPickupDeadline);
    const hours = (deadline - now) / 3600000;
    if (hours <= 0) return { label: 'Expired', variant: 'danger' };
    if (hours < 2) return { label: 'Critical (< 2h Remaining)', variant: 'danger' };
    if (hours < 6) return { label: 'Urgent (< 6h Remaining)', variant: 'warning' };
    if (hours < 24) return { label: 'Moderate (< 24h Remaining)', variant: 'info' };
    return { label: 'Normal Window', variant: 'success' };
  };

  useEffect(() => {
    if (user?.name && !watch('donorDeclarationName')) {
      setValue('donorDeclarationName', user.name);
    }
  }, [user]);

  const handleCheckAll = () => {
    setValue('commercialKitchenPrepared', true, { shouldValidate: true });
    setValue('noConsumerBuffetContact', true, { shouldValidate: true });
    setValue('sealedSanitizedPackaging', true, { shouldValidate: true });
    setValue('labeledWithPreparationTime', true, { shouldValidate: true });
    setValue('temperatureCompliantAtPacking', true, { shouldValidate: true });
    setValue('allergensAccuratelyDeclared', true, { shouldValidate: true });
    setValue('donorConfirmation', true, { shouldValidate: true });
    setValue('donorDeclarationName', watch('donorDeclarationName') || user?.name || 'Authorized Food Donor', {
      shouldValidate: true,
    });
  };

  const handleNextStep = async () => {
    let fieldsToValidate = [];
    if (step === 1) {
      fieldsToValidate = ['foodName', 'category', 'quantity', 'unit', 'storageRequirement', 'packagingType'];
    } else if (step === 2) {
      fieldsToValidate = ['preparationDate', 'pickupDeadline', 'expiryDate'];
    } else if (step === 3) {
      fieldsToValidate = ['pickupAddress.street', 'pickupAddress.city', 'pickupAddress.postalCode'];
    }

    const isValid = await trigger(fieldsToValidate);
    if (isValid) {
      setStep((prev) => prev + 1);
    }
  };

  const onFormError = (formErrors) => {
    console.warn('Donation submission validation errors:', formErrors);
    const errorKeys = Object.keys(formErrors);
    if (errorKeys.length === 0) return;

    const firstKey = errorKeys[0];
    const firstError = formErrors[firstKey];
    const msg = firstError?.message || 'Please check and complete all required fields.';
    toastError(msg, 'Form Incomplete');

    // Automatically navigate to the step with the error so the user sees it immediately
    if (['foodName', 'category', 'quantity', 'unit', 'storageRequirement', 'packagingType'].includes(firstKey)) {
      setStep(1);
    } else if (['preparationDate', 'pickupDeadline', 'expiryDate'].includes(firstKey)) {
      setStep(2);
    } else if (firstKey.startsWith('pickupAddress')) {
      setStep(3);
    } else {
      setStep(4);
    }
  };

  const onSubmit = async (data) => {
    try {
      const payload = {
        foodName: data.foodName,
        description: data.description || '',
        category: data.category,
        quantity: Number(data.quantity) || 1,
        unit: data.unit || 'portions',
        storageRequirement: data.storageRequirement || 'ambient',
        packagingType: data.packagingType || 'Sanitized Food Grade Containers',
        allergens: data.allergens || [],
        dietaryFlags: data.dietaryFlags || {},
        preparationDate: new Date(data.preparationDate).toISOString(),
        pickupDeadline: new Date(data.pickupDeadline).toISOString(),
        expiryDate: new Date(data.expiryDate).toISOString(),
        pickupAddress: {
          street: data.pickupAddress.street,
          city: data.pickupAddress.city,
          state: data.pickupAddress.state || 'Karnataka',
          postalCode: data.pickupAddress.postalCode,
          country: 'India',
        },
        coordinates: [77.6412, 12.9719], // default Karnataka geo coordinate anchor
        safetyChecklist: {
          commercialKitchenPrepared: data.commercialKitchenPrepared ?? true,
          noConsumerBuffetContact: data.noConsumerBuffetContact ?? true,
          sealedSanitizedPackaging: data.sealedSanitizedPackaging ?? true,
          labeledWithPreparationTime: data.labeledWithPreparationTime ?? true,
          temperatureCompliantAtPacking: data.temperatureCompliantAtPacking ?? true,
          recordedTemperatureCelsius: Number(data.recordedTemperatureCelsius) || 4,
          allergensAccuratelyDeclared: data.allergensAccuratelyDeclared ?? true,
          donorConfirmation: Boolean(data.donorConfirmation),
          donorDeclarationName: data.donorDeclarationName || user?.name || 'Authorized Food Donor',
          notes: data.checklistNotes || '',
        },
      };

      await api.post('/v1/donations', payload);
      success('Surplus food listed and verified. NGO matching initiated!', 'Donation Published');
      navigate(ROUTES.DONOR_DONATIONS);
    } catch (err) {
      const errorMsg =
        err.response?.data?.message ||
        err.response?.data?.error ||
        err.message ||
        'Failed to publish donation listing.';
      toastError(errorMsg, 'Publish Failed');
    }
  };

  const urgencyPreview = calculatePreviewUrgency();

  return (
    <div className="max-w-4xl mx-auto space-y-8 pb-12">
      {/* Top Header */}
      <div className="flex items-center justify-between">
        <div>
          <Link
            to={ROUTES.DONOR_DASHBOARD}
            className="inline-flex items-center gap-1.5 text-xs font-bold text-stone-500 hover:text-forest-700 transition-colors mb-2"
          >
            <ArrowLeft className="w-4 h-4" /> Back to Dashboard
          </Link>
          <h1 className="text-2xl sm:text-3xl font-black text-stone-900 tracking-tight">
            Create Surplus Food Donation
          </h1>
          <p className="text-xs sm:text-sm text-stone-500">
            Complete the 4-step wizard to list wholesome surplus for verified community shelter pickup.
          </p>
        </div>

        {urgencyPreview && (
          <div className="hidden sm:block text-right">
            <span className="text-[10px] uppercase font-bold text-stone-400 block">Projected Urgency</span>
            <Badge variant={urgencyPreview.variant} size="sm">{urgencyPreview.label}</Badge>
          </div>
        )}
      </div>

      {/* Step Indicator */}
      <div className="grid grid-cols-4 gap-2 text-center text-xs font-bold">
        {[
          { num: 1, label: 'Food Details' },
          { num: 2, label: 'Time & Expiry' },
          { num: 3, label: 'Location' },
          { num: 4, label: 'Safety Checklist' },
        ].map((s) => (
          <div
            key={s.num}
            className={`p-2.5 rounded-xl border transition-all ${
              step === s.num
                ? 'bg-forest-700 text-white border-forest-800 shadow-sm'
                : step > s.num
                ? 'bg-forest-50 text-forest-800 border-forest-200'
                : 'bg-white text-stone-400 border-cream-200'
            }`}
          >
            <span className="block text-[10px] uppercase tracking-wider">Step {s.num}</span>
            <span className="truncate block">{s.label}</span>
          </div>
        ))}
      </div>

      {/* Form Container */}
      <Card className="p-6 sm:p-10 border-cream-200 shadow-sm">
        <form onSubmit={handleSubmit(onSubmit, onFormError)} className="space-y-6">
          {/* STEP 1: Food Details */}
          {step === 1 && (
            <div className="space-y-5">
              <div className="border-b border-cream-200 pb-3">
                <h2 className="text-lg font-bold text-stone-900">Step 1: Food Details & Specifications</h2>
                <p className="text-xs text-stone-500">Describe the food items, portion size, and storage requirements.</p>
              </div>

              <div>
                <label className="block text-xs font-bold text-stone-700 mb-1">
                  Food Item Name <span className="text-red-500">*</span>
                </label>
                <Input
                  {...register('foodName')}
                  placeholder="e.g. Fresh Artisan Sourdough Rolls & Loaves"
                />
                {errors.foodName && <p className="text-[11px] text-red-600 mt-1">{errors.foodName.message}</p>}
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-stone-700 mb-1">Food Category</label>
                  <select
                    {...register('category')}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-cream-300 bg-white text-stone-900 text-sm focus:outline-none focus:ring-2 focus:ring-forest-500/20"
                  >
                    <option value="cooked_meals">Cooked Prepared Meals</option>
                    <option value="bakery">Artisan Bakery & Breads</option>
                    <option value="dairy">Dairy & Cheeses</option>
                    <option value="produce">Fresh Fruits & Vegetables</option>
                    <option value="packaged_food">Packaged / Canned Goods</option>
                    <option value="raw_ingredients">Raw Kitchen Ingredients</option>
                    <option value="beverages">Healthy Beverages</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-stone-700 mb-1">Meal / Serving Type</label>
                  <Input {...register('mealType')} placeholder="e.g. Lunch Catering Buffet Surplus" />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-stone-700 mb-1">
                    Quantity <span className="text-red-500">*</span>
                  </label>
                  <Input type="number" {...register('quantity')} min="1" />
                  {errors.quantity && <p className="text-[11px] text-red-600 mt-1">{errors.quantity.message}</p>}
                </div>

                <div>
                  <label className="block text-xs font-bold text-stone-700 mb-1">Portion Unit</label>
                  <select
                    {...register('unit')}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-cream-300 bg-white text-stone-900 text-sm focus:outline-none focus:ring-2 focus:ring-forest-500/20"
                  >
                    <option value="portions">Individual Portions</option>
                    <option value="meals">Complete Meals</option>
                    <option value="boxes">Boxes / Crates</option>
                    <option value="trays">Full Catering Trays</option>
                    <option value="kg">Kilograms (kg)</option>
                    <option value="packages">Packages</option>
                    <option value="litres">Litres</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-stone-700 mb-1">Storage Requirement</label>
                  <select
                    {...register('storageRequirement')}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-cream-300 bg-white text-stone-900 text-sm focus:outline-none focus:ring-2 focus:ring-forest-500/20"
                  >
                    <option value="ambient">Ambient (Room Temperature)</option>
                    <option value="refrigerated">Refrigerated (&lt; 4°C)</option>
                    <option value="hot_insulated">Hot Insulated (&gt; 60°C)</option>
                    <option value="frozen">Frozen (&lt; -18°C)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-stone-700 mb-1">Packaging Enclosure</label>
                  <Input
                    {...register('packagingType')}
                    placeholder="e.g. Sealed Single-Use Thermal Trays"
                  />
                  {errors.packagingType && <p className="text-[11px] text-red-600 mt-1">{errors.packagingType.message}</p>}
                </div>
              </div>

              {/* Dietary Flags */}
              <div className="space-y-2 pt-2">
                <label className="block text-xs font-bold text-stone-700">Dietary Flags</label>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
                  <label className="flex items-center gap-2 p-2.5 rounded-xl border border-cream-200 bg-cream-50/50 cursor-pointer">
                    <input type="checkbox" {...register('dietaryFlags.isVegetarian')} className="rounded text-forest-600" />
                    <span>Vegetarian</span>
                  </label>
                  <label className="flex items-center gap-2 p-2.5 rounded-xl border border-cream-200 bg-cream-50/50 cursor-pointer">
                    <input type="checkbox" {...register('dietaryFlags.isVegan')} className="rounded text-forest-600" />
                    <span>Vegan</span>
                  </label>
                  <label className="flex items-center gap-2 p-2.5 rounded-xl border border-cream-200 bg-cream-50/50 cursor-pointer">
                    <input type="checkbox" {...register('dietaryFlags.isHalal')} className="rounded text-forest-600" />
                    <span>Halal</span>
                  </label>
                  <label className="flex items-center gap-2 p-2.5 rounded-xl border border-cream-200 bg-cream-50/50 cursor-pointer">
                    <input type="checkbox" {...register('dietaryFlags.isGlutenFree')} className="rounded text-forest-600" />
                    <span>Gluten-Free</span>
                  </label>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-stone-700 mb-1">Additional Food Description</label>
                <textarea
                  {...register('description')}
                  rows={2}
                  placeholder="Notes regarding heating instructions, contents, or handling..."
                  className="w-full px-3.5 py-2.5 rounded-xl border border-cream-300 text-sm focus:outline-none focus:ring-2 focus:ring-forest-500/20"
                />
              </div>
            </div>
          )}

          {/* STEP 2: Critical Timestamps */}
          {step === 2 && (
            <div className="space-y-5">
              <div className="border-b border-cream-200 pb-3">
                <h2 className="text-lg font-bold text-stone-900">Step 2: Time Criticals & Expiry Windows</h2>
                <p className="text-xs text-stone-500">
                  Strictly enforces safety windows. Foodlink automatically marks listings as expired once the pickup
                  deadline or expiry threshold passes.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-bold text-stone-700 mb-1">
                    Preparation Date & Time <span className="text-red-500">*</span>
                  </label>
                  <Input type="datetime-local" {...register('preparationDate')} />
                  {errors.preparationDate && (
                    <p className="text-[11px] text-red-600 mt-1">{errors.preparationDate.message}</p>
                  )}
                </div>

                <div>
                  <label className="block text-xs font-bold text-stone-700 mb-1">
                    Latest Pickup Deadline <span className="text-red-500">*</span>
                  </label>
                  <Input type="datetime-local" {...register('pickupDeadline')} />
                  {errors.pickupDeadline && (
                    <p className="text-[11px] text-red-600 mt-1">{errors.pickupDeadline.message}</p>
                  )}
                </div>

                <div>
                  <label className="block text-xs font-bold text-stone-700 mb-1">
                    Strict Expiry Date & Time <span className="text-red-500">*</span>
                  </label>
                  <Input type="datetime-local" {...register('expiryDate')} />
                  {errors.expiryDate && (
                    <p className="text-[11px] text-red-600 mt-1">{errors.expiryDate.message}</p>
                  )}
                </div>
              </div>

              {/* Informational Box */}
              <div className="p-4 bg-cream-50 rounded-2xl border border-cream-200 space-y-2 text-xs text-stone-600">
                <strong className="block text-stone-800 font-bold flex items-center gap-1.5">
                  <Clock className="w-4 h-4 text-forest-700" />
                  Automated Urgency Scoring Rule
                </strong>
                <p>
                  • Listings with &lt; 2 hours remaining are automatically marked <strong>Critical</strong> and prioritized in dispatch.<br />
                  • Listings with &lt; 6 hours remaining are marked <strong>Urgent</strong>.<br />
                  • Expired donations are locked and cannot be claimed by NGOs under any circumstances.
                </p>
              </div>
            </div>
          )}

          {/* STEP 3: Location */}
          {step === 3 && (
            <div className="space-y-5">
              <div className="border-b border-cream-200 pb-3">
                <h2 className="text-lg font-bold text-stone-900">Step 3: Pickup Location & Instructions</h2>
                <p className="text-xs text-stone-500">
                  Where should volunteer couriers or NGO vehicles arrive to collect the food?
                </p>
              </div>

              <div>
                <label className="block text-xs font-bold text-stone-700 mb-1">
                  Street Address <span className="text-red-500">*</span>
                </label>
                <Input {...register('pickupAddress.street')} placeholder="e.g. 450 Broadway, Kitchen Door 2" />
                {errors.pickupAddress?.street && (
                  <p className="text-[11px] text-red-600 mt-1">{errors.pickupAddress.street.message}</p>
                )}
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-bold text-stone-700 mb-1">
                    City <span className="text-red-500">*</span>
                  </label>
                  <Input {...register('pickupAddress.city')} placeholder="e.g. Bengaluru" />
                  {errors.pickupAddress?.city && (
                    <p className="text-[11px] text-red-600 mt-1">{errors.pickupAddress.city.message}</p>
                  )}
                </div>

                <div>
                  <label className="block text-xs font-bold text-stone-700 mb-1">State</label>
                  <Input {...register('pickupAddress.state')} placeholder="e.g. Karnataka" />
                </div>

                <div>
                  <label className="block text-xs font-bold text-stone-700 mb-1">
                    Postal Code <span className="text-red-500">*</span>
                  </label>
                  <Input {...register('pickupAddress.postalCode')} placeholder="e.g. 10001" />
                  {errors.pickupAddress?.postalCode && (
                    <p className="text-[11px] text-red-600 mt-1">{errors.pickupAddress.postalCode.message}</p>
                  )}
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-stone-700 mb-1">Courier Pickup Instructions</label>
                <textarea
                  {...register('pickupAddress.instructions')}
                  rows={2}
                  placeholder="e.g. Pull into the loading bay behind the restaurant; ring bell marked Kitchen Dispatch."
                  className="w-full px-3.5 py-2.5 rounded-xl border border-cream-300 text-sm focus:outline-none focus:ring-2 focus:ring-forest-500/20"
                />
              </div>
            </div>
          )}

          {/* STEP 4: Simplified Food Safety Checklist */}
          {step === 4 && (
            <div className="space-y-4">
              <div className="border-b border-cream-200 pb-3 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <h2 className="text-lg font-bold text-stone-900 flex items-center gap-2">
                    <ShieldCheck className="w-5 h-5 text-emerald-600" />
                    Step 4: Food Safety Verification
                  </h2>
                  <p className="text-xs text-stone-500">
                    Quick certification that surplus was handled safely and packaged properly.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={handleCheckAll}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold text-emerald-800 bg-emerald-50 hover:bg-emerald-100 border border-emerald-300 rounded-xl transition-colors cursor-pointer self-start sm:self-auto"
                >
                  <CheckCheck className="w-4 h-4 text-emerald-600" />
                  Select All Checks
                </button>
              </div>

              {/* Clean 2-column checklist grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                <label className="flex items-start gap-3 p-3 rounded-xl border border-cream-200 bg-cream-50/50 hover:bg-cream-50 cursor-pointer transition-colors">
                  <input
                    type="checkbox"
                    {...register('commercialKitchenPrepared')}
                    className="mt-0.5 rounded text-forest-600 focus:ring-forest-500"
                  />
                  <div className="text-xs">
                    <strong className="text-stone-900 block font-bold">Commercial Kitchen Prep</strong>
                    <span className="text-stone-500 text-[11px]">Prepared in an authorized, sanitized food facility.</span>
                  </div>
                </label>

                <label className="flex items-start gap-3 p-3 rounded-xl border border-cream-200 bg-cream-50/50 hover:bg-cream-50 cursor-pointer transition-colors">
                  <input
                    type="checkbox"
                    {...register('noConsumerBuffetContact')}
                    className="mt-0.5 rounded text-forest-600 focus:ring-forest-500"
                  />
                  <div className="text-xs">
                    <strong className="text-stone-900 block font-bold">Zero Buffet Contact</strong>
                    <span className="text-stone-500 text-[11px]">Untouched surplus held safely back-of-house.</span>
                  </div>
                </label>

                <label className="flex items-start gap-3 p-3 rounded-xl border border-cream-200 bg-cream-50/50 hover:bg-cream-50 cursor-pointer transition-colors">
                  <input
                    type="checkbox"
                    {...register('sealedSanitizedPackaging')}
                    className="mt-0.5 rounded text-forest-600 focus:ring-forest-500"
                  />
                  <div className="text-xs">
                    <strong className="text-stone-900 block font-bold">Sanitized Packaging</strong>
                    <span className="text-stone-500 text-[11px]">Sealed in clean, food-grade containers.</span>
                  </div>
                </label>

                <label className="flex items-start gap-3 p-3 rounded-xl border border-cream-200 bg-cream-50/50 hover:bg-cream-50 cursor-pointer transition-colors">
                  <input
                    type="checkbox"
                    {...register('labeledWithPreparationTime')}
                    className="mt-0.5 rounded text-forest-600 focus:ring-forest-500"
                  />
                  <div className="text-xs">
                    <strong className="text-stone-900 block font-bold">Proper Labeling</strong>
                    <span className="text-stone-500 text-[11px]">Marked with prep time and handling info.</span>
                  </div>
                </label>

                <label className="flex items-start gap-3 p-3 rounded-xl border border-cream-200 bg-cream-50/50 hover:bg-cream-50 cursor-pointer transition-colors">
                  <input
                    type="checkbox"
                    {...register('temperatureCompliantAtPacking')}
                    className="mt-0.5 rounded text-forest-600 focus:ring-forest-500"
                  />
                  <div className="text-xs">
                    <strong className="text-stone-900 block font-bold">Safe Temperature</strong>
                    <span className="text-stone-500 text-[11px]">Kept outside danger zone (chilled or safe room temp).</span>
                  </div>
                </label>

                <label className="flex items-start gap-3 p-3 rounded-xl border border-cream-200 bg-cream-50/50 hover:bg-cream-50 cursor-pointer transition-colors">
                  <input
                    type="checkbox"
                    {...register('allergensAccuratelyDeclared')}
                    className="mt-0.5 rounded text-forest-600 focus:ring-forest-500"
                  />
                  <div className="text-xs">
                    <strong className="text-stone-900 block font-bold">Truthful Declaration</strong>
                    <span className="text-stone-500 text-[11px]">All ingredients and handling declared truthfully.</span>
                  </div>
                </label>
              </div>

              {/* Validation errors summary if any */}
              {(errors.commercialKitchenPrepared ||
                errors.noConsumerBuffetContact ||
                errors.sealedSanitizedPackaging ||
                errors.labeledWithPreparationTime ||
                errors.temperatureCompliantAtPacking ||
                errors.allergensAccuratelyDeclared) && (
                <p className="text-[11px] text-red-600 font-medium bg-red-50 p-2 rounded-lg border border-red-200">
                  Please verify and check all 6 food safety requirements above (or click "Select All Checks").
                </p>
              )}

              {/* Temperature & Signatory in 1 concise row */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                <div className="p-3 bg-cream-50/70 rounded-xl border border-cream-200">
                  <label className="block text-xs font-bold text-stone-700 mb-1">
                    Packing Temperature (°C)
                  </label>
                  <div className="flex items-center gap-2">
                    <Input
                      type="number"
                      step="0.5"
                      {...register('recordedTemperatureCelsius')}
                      placeholder="e.g. 4"
                      className="bg-white"
                    />
                    <span className="text-xs font-bold text-stone-500">°C</span>
                  </div>
                </div>

                <div className="p-3 bg-cream-50/70 rounded-xl border border-cream-200">
                  <label className="block text-xs font-bold text-stone-700 mb-1">
                    Donor Signatory Name <span className="text-red-500">*</span>
                  </label>
                  <Input
                    {...register('donorDeclarationName')}
                    placeholder="Your full name"
                    className="bg-white"
                  />
                  {errors.donorDeclarationName && (
                    <p className="text-[11px] text-red-600 mt-1">{errors.donorDeclarationName.message}</p>
                  )}
                </div>
              </div>

              {/* Simplified Certification Sign-off */}
              <div className="p-3.5 bg-forest-50/70 rounded-xl border border-forest-200">
                <label className="flex items-start gap-2.5 cursor-pointer">
                  <input
                    type="checkbox"
                    {...register('donorConfirmation')}
                    className="mt-0.5 rounded text-forest-700 focus:ring-forest-500"
                  />
                  <span className="text-xs font-medium text-forest-900 leading-snug">
                    I certify that this food donation was handled according to hygienic food safety standards and is safe and wholesome for consumption.
                  </span>
                </label>
                {errors.donorConfirmation && (
                  <p className="text-[11px] text-red-600 mt-1">{errors.donorConfirmation.message}</p>
                )}
              </div>
            </div>
          )}

          {/* Wizard Navigation Actions */}
          <div className="flex items-center justify-between pt-6 border-t border-cream-200">
            {step > 1 ? (
              <Button
                type="button"
                variant="outline"
                size="md"
                icon={ArrowLeft}
                onClick={() => setStep((prev) => prev - 1)}
              >
                Back
              </Button>
            ) : (
              <div />
            )}

            {step < 4 ? (
              <Button type="button" variant="primary" size="md" icon={ArrowRight} onClick={handleNextStep}>
                Continue to Step {step + 1}
              </Button>
            ) : (
              <Button
                type="submit"
                variant="warm"
                size="lg"
                disabled={isSubmitting}
                icon={PackagePlus}
              >
                {isSubmitting ? 'Verifying & Publishing...' : 'Certify & Publish Donation'}
              </Button>
            )}
          </div>
        </form>
      </Card>
    </div>
  );
}

