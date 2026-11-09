import React, { useState, useEffect } from 'react';
import {
  Building2,
  ShieldCheck,
  AlertCircle,
  MapPin,
  Thermometer,
  Layers,
  Save,
  CheckCircle2,
  FileText,
} from 'lucide-react';
import { useAuth } from '../../hooks/useAuth.js';
import { useToast } from '../../hooks/useToast.js';
import { ngoService } from '../../services/ngoService.js';
import { Badge } from '../../components/ui/Badge.jsx';
import { Button } from '../../components/ui/Button.jsx';
import { FOOD_CATEGORIES, FOOD_CATEGORY_LABELS } from '../../constants/donationEnums.js';

export function NgoProfilePage() {
  const { user } = useAuth();
  const { success, error: toastError } = useToast();

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // Form State
  const [formData, setFormData] = useState({
    organizationName: '',
    registrationNumber: '',
    organizationType: 'shelter',
    contactPerson: '',
    phone: '',
    email: '',
    capacity: 100,
    foodCategoriesAccepted: [],
    storageCapabilities: {
      hasRefrigeration: false,
      hasFreezer: false,
      hasHotHolding: false,
      storageSquareFootage: 0,
      specialNotes: '',
    },
    address: {
      street: '',
      city: 'Bengaluru',
      state: 'Karnataka',
      postalCode: '',
      country: 'India',
    },
  });

  const [verificationStatus, setVerificationStatus] = useState('pending');

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      setLoading(true);
      const data = await ngoService.getNgoProfile();
      if (data) {
        setFormData({
          organizationName: data.organizationName || '',
          registrationNumber: data.registrationNumber || '',
          organizationType: data.organizationType || 'shelter',
          contactPerson: data.contactPerson || '',
          phone: data.phone || '',
          email: data.email || '',
          capacity: data.capacity || 100,
          foodCategoriesAccepted: data.foodCategoriesAccepted || [],
          storageCapabilities: {
            hasRefrigeration: Boolean(data.storageCapabilities?.hasRefrigeration),
            hasFreezer: Boolean(data.storageCapabilities?.hasFreezer),
            hasHotHolding: Boolean(data.storageCapabilities?.hasHotHolding),
            storageSquareFootage: data.storageCapabilities?.storageSquareFootage || 0,
            specialNotes: data.storageCapabilities?.specialNotes || '',
          },
          address: {
            street: data.address?.street || '',
            city: data.address?.city || '',
            state: data.address?.state || 'Karnataka',
            postalCode: data.address?.postalCode || '',
            country: data.address?.country || 'India',
          },
        });
        setVerificationStatus(data.verificationStatus || 'pending');
      }
    } catch (err) {
      console.error('Failed to load profile', err);
    } finally {
      setLoading(false);
    }
  };

  const handleCategoryToggle = (category) => {
    setFormData((prev) => {
      const exists = prev.foodCategoriesAccepted.includes(category);
      return {
        ...prev,
        foodCategoriesAccepted: exists
          ? prev.foodCategoriesAccepted.filter((c) => c !== category)
          : [...prev.foodCategoriesAccepted, category],
      };
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setSaving(true);
      await ngoService.updateNgoProfile(formData);
      success('Organization profile updated successfully!', 'Profile Saved');
    } catch (err) {
      const msg = err.response?.data?.message || 'Failed to update profile.';
      toastError(msg, 'Update Error');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-8 max-w-5xl mx-auto pb-12">
      {/* Header */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-cream-200 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-stone-900 tracking-tight">
            Organization Profile & Capabilities
          </h1>
          <p className="text-stone-600 text-sm mt-1">
            Maintain your legal registration, receiving capacity, and cold-chain storage equipment for smart matching.
          </p>
        </div>

        <div>
          {verificationStatus === 'verified' ? (
            <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-800 border border-emerald-300">
              <ShieldCheck className="w-4 h-4 text-emerald-700" /> Verified 501(c)(3) Partner
            </span>
          ) : (
            <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold bg-amber-100 text-amber-800 border border-amber-300">
              <AlertCircle className="w-4 h-4 text-amber-700" /> Verification In Review
            </span>
          )}
        </div>
      </div>

      {loading ? (
        <div className="bg-white rounded-2xl border border-cream-200 p-12 text-center text-stone-500 text-sm">
          Loading organization profile...
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-8">
          {/* Section 1: General Organization Info */}
          <div className="bg-white rounded-3xl border border-cream-200 p-6 sm:p-8 shadow-sm space-y-6">
            <h3 className="text-lg font-bold text-stone-900 flex items-center gap-2">
              <Building2 className="w-5 h-5 text-emerald-700" />
              General Organization Details
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-stone-700 mb-1">
                  Organization Legal Name
                </label>
                <input
                  type="text"
                  value={formData.organizationName}
                  onChange={(e) => setFormData({ ...formData, organizationName: e.target.value })}
                  required
                  className="w-full px-3 py-2 text-sm border border-stone-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-stone-700 mb-1">
                  Registration / Tax-Exempt Number (EIN)
                </label>
                <input
                  type="text"
                  value={formData.registrationNumber}
                  onChange={(e) => setFormData({ ...formData, registrationNumber: e.target.value })}
                  required
                  className="w-full px-3 py-2 text-sm border border-stone-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-stone-700 mb-1">
                  Organization Type
                </label>
                <select
                  value={formData.organizationType}
                  onChange={(e) => setFormData({ ...formData, organizationType: e.target.value })}
                  className="w-full px-3 py-2 text-sm border border-stone-300 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                >
                  <option value="shelter">Emergency Shelter / Refuge</option>
                  <option value="soup_kitchen">Soup Kitchen / Hot Meals Center</option>
                  <option value="food_bank">Community Food Bank</option>
                  <option value="community_center">Community Outreach Center</option>
                  <option value="charity">Charity / Religious Outreach</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-stone-700 mb-1">
                  Daily Intake Capacity (Meals / Day)
                </label>
                <input
                  type="number"
                  min="1"
                  value={formData.capacity}
                  onChange={(e) => setFormData({ ...formData, capacity: Number(e.target.value) })}
                  required
                  className="w-full px-3 py-2 text-sm border border-stone-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-stone-700 mb-1">
                  Primary Contact Person
                </label>
                <input
                  type="text"
                  value={formData.contactPerson}
                  onChange={(e) => setFormData({ ...formData, contactPerson: e.target.value })}
                  required
                  className="w-full px-3 py-2 text-sm border border-stone-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-stone-700 mb-1">
                  Official Phone Number
                </label>
                <input
                  type="text"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  required
                  className="w-full px-3 py-2 text-sm border border-stone-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>
            </div>
          </div>

          {/* Section 2: Address & Logistics */}
          <div className="bg-white rounded-3xl border border-cream-200 p-6 sm:p-8 shadow-sm space-y-6">
            <h3 className="text-lg font-bold text-stone-900 flex items-center gap-2">
              <MapPin className="w-5 h-5 text-emerald-700" />
              Facility Address & Destination Site
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="sm:col-span-2">
                <label className="block text-xs font-semibold text-stone-700 mb-1">
                  Street Address
                </label>
                <input
                  type="text"
                  value={formData.address.street}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      address: { ...formData.address, street: e.target.value },
                    })
                  }
                  required
                  className="w-full px-3 py-2 text-sm border border-stone-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-stone-700 mb-1">
                  City
                </label>
                <input
                  type="text"
                  value={formData.address.city}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      address: { ...formData.address, city: e.target.value },
                    })
                  }
                  required
                  className="w-full px-3 py-2 text-sm border border-stone-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-stone-700 mb-1">
                  State / Province
                </label>
                <input
                  type="text"
                  value={formData.address.state}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      address: { ...formData.address, state: e.target.value },
                    })
                  }
                  className="w-full px-3 py-2 text-sm border border-stone-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-stone-700 mb-1">
                  Postal Code
                </label>
                <input
                  type="text"
                  value={formData.address.postalCode}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      address: { ...formData.address, postalCode: e.target.value },
                    })
                  }
                  required
                  className="w-full px-3 py-2 text-sm border border-stone-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>
            </div>
          </div>

          {/* Section 3: Food Categories Accepted */}
          <div className="bg-white rounded-3xl border border-cream-200 p-6 sm:p-8 shadow-sm space-y-4">
            <h3 className="text-lg font-bold text-stone-900 flex items-center gap-2">
              <Layers className="w-5 h-5 text-emerald-700" />
              Accepted Food Categories
            </h3>
            <p className="text-xs text-stone-500">
              Select all categories your organization has facilities to store and distribute safely.
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 pt-2">
              {Object.entries(FOOD_CATEGORY_LABELS).map(([k, label]) => {
                const isSelected = formData.foodCategoriesAccepted.includes(k);
                return (
                  <label
                    key={k}
                    className={`p-3.5 rounded-2xl border text-xs font-semibold flex items-center gap-3 cursor-pointer transition-all ${
                      isSelected
                        ? 'bg-emerald-50 border-emerald-300 text-emerald-900'
                        : 'bg-white border-cream-200 text-stone-600 hover:border-stone-300'
                    }`}
                  >
                    <input
                      type="checkbox"
                      checked={isSelected}
                      onChange={() => handleCategoryToggle(k)}
                      className="rounded border-stone-300 text-emerald-600 focus:ring-emerald-500"
                    />
                    <span>{label}</span>
                  </label>
                );
              })}
            </div>
          </div>

          {/* Section 4: Storage & Handling Capabilities */}
          <div className="bg-white rounded-3xl border border-cream-200 p-6 sm:p-8 shadow-sm space-y-4">
            <h3 className="text-lg font-bold text-stone-900 flex items-center gap-2">
              <Thermometer className="w-5 h-5 text-emerald-700" />
              Storage & Handling Capabilities
            </h3>
            <p className="text-xs text-stone-500">
              Our smart recommendation engine uses these verified storage parameters to guarantee cold-chain compliance.
            </p>

            <div className="space-y-3 pt-2">
              <label className="flex items-center gap-3 p-3.5 rounded-2xl border border-cream-200 bg-cream-50/50 cursor-pointer">
                <input
                  type="checkbox"
                  checked={formData.storageCapabilities.hasRefrigeration}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      storageCapabilities: {
                        ...formData.storageCapabilities,
                        hasRefrigeration: e.target.checked,
                      },
                    })
                  }
                  className="rounded border-stone-300 text-emerald-600 focus:ring-emerald-500"
                />
                <span className="text-xs font-semibold text-stone-800">
                  Commercial Walk-in or Standalone Refrigeration (0°C to 4°C)
                </span>
              </label>

              <label className="flex items-center gap-3 p-3.5 rounded-2xl border border-cream-200 bg-cream-50/50 cursor-pointer">
                <input
                  type="checkbox"
                  checked={formData.storageCapabilities.hasFreezer}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      storageCapabilities: {
                        ...formData.storageCapabilities,
                        hasFreezer: e.target.checked,
                      },
                    })
                  }
                  className="rounded border-stone-300 text-emerald-600 focus:ring-emerald-500"
                />
                <span className="text-xs font-semibold text-stone-800">
                  Commercial Deep Freezer Capabilities (≤ -18°C)
                </span>
              </label>

              <label className="flex items-center gap-3 p-3.5 rounded-2xl border border-cream-200 bg-cream-50/50 cursor-pointer">
                <input
                  type="checkbox"
                  checked={formData.storageCapabilities.hasHotHolding}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      storageCapabilities: {
                        ...formData.storageCapabilities,
                        hasHotHolding: e.target.checked,
                      },
                    })
                  }
                  className="rounded border-stone-300 text-emerald-600 focus:ring-emerald-500"
                />
                <span className="text-xs font-semibold text-stone-800">
                  Thermal Hot Holding Food Cabinets (≥ 60°C)
                </span>
              </label>
            </div>
          </div>

          {/* Save Action Bar */}
          <div className="flex items-center justify-end gap-3 pt-4">
            <Button type="submit" variant="primary" size="md" disabled={saving}>
              <Save className="w-4 h-4 mr-2" />
              {saving ? 'Saving Changes...' : 'Save Organization Profile'}
            </Button>
          </div>
        </form>
      )}
    </div>
  );
}

