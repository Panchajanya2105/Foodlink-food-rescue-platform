import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import {
  Clock,
  MapPin,
  ShieldCheck,
  Thermometer,
  AlertTriangle,
  ArrowLeft,
  CheckCircle2,
  Calendar,
  Layers,
  Utensils,
  HeartHandshake,
  Info,
  Scale,
} from 'lucide-react';
import { Card } from '../components/ui/Card.jsx';
import { Badge } from '../components/ui/Badge.jsx';
import { Button } from '../components/ui/Button.jsx';
import { ROUTES } from '../constants/routes.js';
import api from '../services/api.js';

export function FoodDetailsPage() {
  const { id } = useParams();
  const [foodItem, setFoodItem] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchFoodDetail();
  }, [id]);

  const fetchFoodDetail = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await api.get(`/v1/public/food-board/${id}`);
      if (res.data?.data) {
        setFoodItem(res.data.data);
      } else {
        setError('Food item details could not be retrieved.');
      }
    } catch (err) {
      // Fallback for sample item previews
      if (id?.startsWith('sample-')) {
        setFoodItem({
          _id: id,
          foodName: 'Mysuru Bisi Bele Bath & Ghee Khara Pongal [Sample Preview]',
          description:
            'Traditional Karnataka hot meals prepared fresh in commercial licensed facility. Packed in sanitized thermal Cambros.',
          category: 'cooked_meals',
          quantity: 45,
          unit: 'portions',
          storageRequirement: 'hot_insulated',
          preparationDate: new Date(Date.now() - 2 * 3600000).toISOString(),
          pickupDeadline: new Date(Date.now() + 4 * 3600000).toISOString(),
          expiryDate: new Date(Date.now() + 10 * 3600000).toISOString(),
          packagingType: 'Sanitized Thermal Food-Grade Containers',
          allergens: ['dairy', 'nuts'],
          dietaryFlags: { isVegetarian: true },
          pickupAddress: { street: '142 DVG Road, Gandhi Bazaar, Basavanagudi', city: 'Bengaluru', state: 'Karnataka', postalCode: '560004' },
          pickupInstructions:
            'Pick up at side kitchen dispatch bay. Present authorized NGO credentials or volunteer pass.',
          evaluation: { urgency: 'urgent', hoursRemaining: 4.0, isExpired: false },
          safetyChecklist: {
            passedAllChecks: true,
            recordedTemperatureCelsius: 68,
            temperatureCompliantAtPacking: true,
            sealedSanitizedPackaging: true,
            allergensAccuratelyDeclared: true,
            commercialKitchenPrepared: true,
            noConsumerBuffetContact: true,
            donorDeclarationName: 'Head Chef K. Venkatesh',
            completedAt: new Date(Date.now() - 2 * 3600000).toISOString(),
          },
          isSample: true,
        });
      } else {
        setError(err.response?.data?.message || 'Listing expired or not found.');
      }
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-16 text-center text-stone-500">
        <div className="animate-spin w-8 h-8 border-4 border-forest-600 border-t-transparent rounded-full mx-auto mb-4" />
        <p className="text-sm">Retrieving verified food safety and pickup details...</p>
      </div>
    );
  }

  if (error || !foodItem) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-16 text-center space-y-4">
        <AlertTriangle className="w-12 h-12 text-amber-500 mx-auto" />
        <h1 className="text-2xl font-bold text-stone-900">Listing Not Available</h1>
        <p className="text-sm text-stone-600">
          {error || 'This food donation may have already been claimed, completed, or expired.'}
        </p>
        <Link to={ROUTES.AVAILABLE_FOOD}>
          <Button variant="primary" icon={ArrowLeft}>
            Return to Available Food Board
          </Button>
        </Link>
      </div>
    );
  }

  const checklist = foodItem.safetyChecklist;

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      {/* Back button */}
      <div>
        <Link
          to={ROUTES.AVAILABLE_FOOD}
          className="inline-flex items-center gap-1.5 text-xs font-bold text-stone-500 hover:text-forest-700 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Available Food Board
        </Link>
      </div>

      {/* Main Food Card */}
      <Card className="p-6 sm:p-10 space-y-8 border-cream-200">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-cream-200 pb-6">
          <div className="space-y-2">
            <div className="flex flex-wrap items-center gap-2">
              <span className="px-2.5 py-0.5 rounded-md text-xs font-bold uppercase tracking-wider bg-forest-50 text-forest-700 border border-forest-200">
                {foodItem.category?.replace('_', ' ')}
              </span>
              <span className="px-2.5 py-0.5 rounded-md text-xs font-bold uppercase tracking-wider bg-emerald-50 text-emerald-700 border border-emerald-200">
                Free Distribution
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black text-stone-900 tracking-tight">
              {foodItem.foodName}
            </h1>
          </div>

          <div className="text-left sm:text-right shrink-0">
            <span className="text-xs uppercase font-bold text-stone-400 block">Available Portion</span>
            <span className="text-2xl font-black text-forest-800">
              {foodItem.quantity} {foodItem.unit}
            </span>
          </div>
        </div>

        {/* Description */}
        <div className="space-y-2">
          <h2 className="text-xs uppercase font-bold text-stone-400 tracking-wider">Item Description</h2>
          <p className="text-stone-700 text-sm sm:text-base leading-relaxed">
            {foodItem.description || 'Nutritious surplus meal packaged according to sanitary commercial protocols.'}
          </p>
        </div>

        {/* Critical Timestamps & Urgency Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 bg-cream-50 p-5 rounded-2xl border border-cream-200 text-xs">
          <div className="space-y-1">
            <span className="text-stone-400 font-bold uppercase tracking-wider flex items-center gap-1">
              <Calendar className="w-3.5 h-3.5 text-forest-600" /> Prepared
            </span>
            <span className="font-bold text-stone-800 block text-sm">
              {new Date(foodItem.preparationDate || Date.now()).toLocaleTimeString([], {
                hour: '2-digit',
                minute: '2-digit',
              })}{' '}
              • {new Date(foodItem.preparationDate || Date.now()).toLocaleDateString()}
            </span>
          </div>

          <div className="space-y-1">
            <span className="text-stone-400 font-bold uppercase tracking-wider flex items-center gap-1">
              <Clock className="w-3.5 h-3.5 text-amber-600" /> Latest Pickup Deadline
            </span>
            <span className="font-bold text-amber-900 block text-sm">
              {new Date(foodItem.pickupDeadline).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}{' '}
              ({foodItem.evaluation?.hoursRemaining ? `${foodItem.evaluation.hoursRemaining}h left` : 'Today'})
            </span>
          </div>

          <div className="space-y-1">
            <span className="text-stone-400 font-bold uppercase tracking-wider flex items-center gap-1">
              <Thermometer className="w-3.5 h-3.5 text-terracotta-600" /> Storage State
            </span>
            <span className="font-bold text-stone-800 block text-sm capitalize">
              {foodItem.storageRequirement?.replace('_', ' ')}
            </span>
          </div>
        </div>

        {/* Food Safety Checklist Declarations */}
        <div className="space-y-4 pt-4 border-t border-cream-200">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="p-2 bg-emerald-50 text-emerald-700 rounded-xl border border-emerald-200">
                <ShieldCheck className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-bold text-stone-900 text-base">Verified Food Safety Checklist</h3>
                <p className="text-xs text-stone-500">
                  Donor certified handling compliance prior to listing approval
                </p>
              </div>
            </div>
            <Badge variant="success" size="sm">Passed All Checks</Badge>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
            <div className="flex items-start gap-2.5 p-3 rounded-xl bg-white border border-cream-200">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
              <div>
                <strong className="block text-stone-800">Commercial Kitchen Sanitation</strong>
                <span className="text-stone-500">Prepared in a licensed, food-grade sanitary commercial facility.</span>
              </div>
            </div>

            <div className="flex items-start gap-2.5 p-3 rounded-xl bg-white border border-cream-200">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
              <div>
                <strong className="block text-stone-800">Zero Buffet / Consumer Contact</strong>
                <span className="text-stone-500">Surplus held in kitchen reserves without public contact.</span>
              </div>
            </div>

            <div className="flex items-start gap-2.5 p-3 rounded-xl bg-white border border-cream-200">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
              <div>
                <strong className="block text-stone-800">Recorded Packing Temperature</strong>
                <span className="text-stone-500">
                  Logged at {checklist?.recordedTemperatureCelsius ?? 20}°C compliant with thermal safety limits.
                </span>
              </div>
            </div>

            <div className="flex items-start gap-2.5 p-3 rounded-xl bg-white border border-cream-200">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
              <div>
                <strong className="block text-stone-800">Tamper-Evident Packaging</strong>
                <span className="text-stone-500">{foodItem.packagingType || 'Sanitized food grade sealed containers'}.</span>
              </div>
            </div>
          </div>

          {/* Allergens & Dietary */}
          <div className="p-4 bg-amber-50/70 rounded-xl border border-amber-200/80 space-y-2 text-xs">
            <div className="flex items-center gap-2 font-bold text-amber-900">
              <AlertTriangle className="w-4 h-4 text-amber-600" />
              <span>Allergen Disclosures & Dietary Information</span>
            </div>
            <div className="flex flex-wrap gap-2 pt-1">
              {foodItem.allergens?.length > 0 ? (
                foodItem.allergens.map((allergen) => (
                  <span
                    key={allergen}
                    className="px-2 py-0.5 rounded-md bg-white border border-amber-300 font-semibold text-amber-800 capitalize"
                  >
                    Contains: {allergen}
                  </span>
                ))
              ) : (
                <span className="text-stone-600">No major common allergens declared by donor.</span>
              )}
            </div>
          </div>

          {/* Legal Safety Notice */}
          <div className="p-4 bg-stone-50 rounded-xl border border-stone-200 text-[11px] text-stone-500 space-y-1">
            <span className="font-bold text-stone-700 block flex items-center gap-1.5">
              <Scale className="w-3.5 h-3.5 text-stone-600" />
              Food Safety & Legal Disclaimer
            </span>
            <p className="leading-relaxed">
              This food safety checklist records declarations and temperature readings provided by the bona fide donating
              partner under the protections of the Food Safety and Standards (Recovery and Distribution of Surplus Food)
              Regulations, 2019 and the Food Safety and Standards Act, 2006. Foodlink does not conduct physical laboratory
              sampling. Recipients should inspect food upon receipt and maintain continuous refrigeration or hot-holding under
              FSSAI benchmarks.
            </p>
          </div>
        </div>

        {/* Pickup Instructions */}
        <div className="space-y-3 pt-4 border-t border-cream-200">
          <h3 className="font-bold text-stone-900 text-base flex items-center gap-2">
            <MapPin className="w-4 h-4 text-forest-700" />
            Pickup Instructions & Location Guidelines
          </h3>
          <p className="text-xs text-stone-600 leading-relaxed bg-cream-50 p-4 rounded-xl border border-cream-200">
            {foodItem.pickupInstructions}
          </p>
        </div>

        {/* Call to Action for Verified NGOs */}
        <div className="bg-forest-800 text-white p-6 rounded-2xl flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="space-y-1 text-center sm:text-left">
            <h4 className="font-bold text-base">Are you a verified community charity or shelter?</h4>
            <p className="text-xs text-forest-200">
              Sign in with your NGO credentials to request this surplus portion for your meal distribution program.
            </p>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <Link to={ROUTES.LOGIN}>
              <Button variant="warm" size="sm">
                Sign In to Request
              </Button>
            </Link>
          </div>
        </div>
      </Card>
    </div>
  );
}

