import React, { useState } from 'react';
import {
  Settings,
  Truck,
  ShieldCheck,
  Save,
  CheckCircle2,
  Thermometer,
  Compass,
  User,
  Phone,
  Mail,
} from 'lucide-react';
import { useAuth } from '../../hooks/useAuth.js';
import { useToast } from '../../hooks/useToast.js';
import { deliveryService } from '../../services/deliveryService.js';
import { Button } from '../../components/ui/Button.jsx';

export function DeliveryProfilePage() {
  const { user, updateUser } = useAuth();
  const { success, error } = useToast();
  const [submitting, setSubmitting] = useState(false);

  // Form fields
  const [name, setName] = useState(user?.name || '');
  const [phone, setPhone] = useState(user?.phone || '');
  const [vehicleType, setVehicleType] = useState(user?.deliveryProfile?.vehicleType || 'car');
  const [maxCapacityKg, setMaxCapacityKg] = useState(user?.deliveryProfile?.maxCapacityKg || 25);
  const [serviceRadiusKm, setServiceRadiusKm] = useState(user?.deliveryProfile?.serviceRadiusKm || 15);
  const [hasThermalBag, setHasThermalBag] = useState(user?.deliveryProfile?.hasThermalBag ?? true);
  const [isAvailable, setIsAvailable] = useState(user?.deliveryProfile?.isAvailable ?? true);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setSubmitting(true);
      const updated = await deliveryService.updateDeliveryProfile({
        name,
        phone,
        vehicleType,
        maxCapacityKg: Number(maxCapacityKg),
        serviceRadiusKm: Number(serviceRadiusKm),
        hasThermalBag,
        isAvailable,
      });

      if (updateUser) {
        updateUser(updated);
      }
      success('Courier logistics profile updated successfully.', 'Profile Saved');
    } catch (err) {
      error(err.message || 'Failed to update courier profile.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      {/* Header */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-cream-200 shadow-sm">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-forest-50 text-forest-800 border border-forest-200 mb-2">
          <Truck className="w-3.5 h-3.5" /> Courier Logistics
        </div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-stone-900 tracking-tight">
          Delivery Partner Profile & Fleet Settings
        </h1>
        <p className="text-sm text-stone-600 mt-1">
          Configure your vehicle specifications, temperature-controlled gear, and dispatch operating radius.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Contact Info Card */}
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-cream-200 shadow-xs space-y-4">
          <h2 className="text-base font-bold text-stone-900 flex items-center gap-2">
            <User className="w-4 h-4 text-forest-700" />
            Contact & Identification
          </h2>

          <div className="grid sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-stone-700 mb-1">Full Name</label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full px-3 py-2 text-xs rounded-xl border border-cream-300 focus:outline-none focus:border-forest-600 bg-white"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-stone-700 mb-1">Contact Phone</label>
              <input
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="+1 (555) 000-0000"
                className="w-full px-3 py-2 text-xs rounded-xl border border-cream-300 focus:outline-none focus:border-forest-600 bg-white"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-stone-700 mb-1">Email Address</label>
            <input
              type="email"
              disabled
              value={user?.email || ''}
              className="w-full px-3 py-2 text-xs rounded-xl border border-cream-200 bg-cream-50 text-stone-500 cursor-not-allowed"
            />
            <p className="text-[11px] text-stone-400 mt-1">Email cannot be modified directly.</p>
          </div>
        </div>

        {/* Vehicle & Equipment */}
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-cream-200 shadow-xs space-y-4">
          <h2 className="text-base font-bold text-stone-900 flex items-center gap-2">
            <Truck className="w-4 h-4 text-forest-700" />
            Vehicle & Thermal Safety Equipment
          </h2>

          <div className="grid sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-bold text-stone-700 mb-1">Vehicle Type</label>
              <select
                value={vehicleType}
                onChange={(e) => setVehicleType(e.target.value)}
                className="w-full px-3 py-2 text-xs rounded-xl border border-cream-300 focus:outline-none focus:border-forest-600 bg-white capitalize"
              >
                <option value="bicycle">Bicycle</option>
                <option value="motorcycle">Motorcycle / Scooter</option>
                <option value="car">Personal Car</option>
                <option value="van">Cargo Van</option>
                <option value="refrigerated_van">Refrigerated Van</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-stone-700 mb-1">
                Max Capacity (kg)
              </label>
              <input
                type="number"
                min="1"
                max="1000"
                value={maxCapacityKg}
                onChange={(e) => setMaxCapacityKg(e.target.value)}
                className="w-full px-3 py-2 text-xs rounded-xl border border-cream-300 focus:outline-none focus:border-forest-600 bg-white"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-stone-700 mb-1">
                Operating Radius (km)
              </label>
              <input
                type="number"
                min="1"
                max="100"
                value={serviceRadiusKm}
                onChange={(e) => setServiceRadiusKm(e.target.value)}
                className="w-full px-3 py-2 text-xs rounded-xl border border-cream-300 focus:outline-none focus:border-forest-600 bg-white"
              />
            </div>
          </div>

          <div className="p-4 bg-cream-50 rounded-2xl border border-cream-200 space-y-3">
            <label className="flex items-center gap-3 cursor-pointer text-xs font-semibold text-stone-800">
              <input
                type="checkbox"
                checked={hasThermalBag}
                onChange={(e) => setHasThermalBag(e.target.checked)}
                className="w-4 h-4 rounded text-forest-600 focus:ring-forest-500"
              />
              <span className="flex items-center gap-1.5">
                <Thermometer className="w-3.5 h-3.5 text-terracotta-600" />
                I possess an insulated thermal bag / commercial temperature-retention box
              </span>
            </label>

            <label className="flex items-center gap-3 cursor-pointer text-xs font-semibold text-stone-800">
              <input
                type="checkbox"
                checked={isAvailable}
                onChange={(e) => setIsAvailable(e.target.checked)}
                className="w-4 h-4 rounded text-forest-600 focus:ring-forest-500"
              />
              <span>
                Account is marked Available for automated rescue dispatch notifications
              </span>
            </label>
          </div>
        </div>

        <div className="flex justify-end">
          <Button type="submit" variant="primary" loading={submitting} className="gap-2 text-xs">
            <Save className="w-4 h-4" /> Save Logistics Profile
          </Button>
        </div>
      </form>
    </div>
  );
}
export default DeliveryProfilePage;
