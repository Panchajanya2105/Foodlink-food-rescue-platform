import React, { useState } from 'react';
import { Settings, ShieldCheck, Save, Clock, Compass, Bell, AlertTriangle } from 'lucide-react';
import { useToast } from '../../hooks/useToast.js';
import { Button } from '../../components/ui/Button.jsx';

export function AdminSettingsPage() {
  const { success } = useToast();
  const [gracePeriodHours, setGracePeriodHours] = useState(2);
  const [maxCourierRadiusKm, setMaxCourierRadiusKm] = useState(25);
  const [autoExpireEnabled, setAutoExpireEnabled] = useState(true);
  const [maintenanceMode, setMaintenanceMode] = useState(false);
  const [saving, setSaving] = useState(false);

  const handleSave = (e) => {
    e.preventDefault();
    setSaving(true);
    setTimeout(() => {
      setSaving(false);
      success('Platform configuration updated and broadcast across clusters.', 'Settings Saved');
    }, 400);
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      {/* Header */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-cream-200 shadow-sm">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-forest-50 text-forest-800 border border-forest-200 mb-2">
          <Settings className="w-3.5 h-3.5" /> Platform Configuration
        </div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-stone-900 tracking-tight">
          System Governance & Parameters
        </h1>
        <p className="text-sm text-stone-600 mt-1">
          Adjust global food safety thresholds, dispatch matching limits, and operational rules.
        </p>
      </div>

      <form onSubmit={handleSave} className="space-y-6">
        {/* Thresholds */}
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-cream-200 shadow-xs space-y-4">
          <h2 className="text-base font-bold text-stone-900 flex items-center gap-2">
            <Clock className="w-4 h-4 text-forest-700" />
            Food Safety & Expiration Rules
          </h2>

          <div className="grid sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-stone-700 mb-1">
                Pickup Grace Period (Hours)
              </label>
              <input
                type="number"
                min="1"
                max="12"
                value={gracePeriodHours}
                onChange={(e) => setGracePeriodHours(e.target.value)}
                className="w-full px-3 py-2 text-xs rounded-xl border border-cream-300 focus:outline-none focus:border-forest-600 bg-white"
              />
              <p className="text-[11px] text-stone-400 mt-1">
                Minimum hours before expiry an NGO can schedule a pickup.
              </p>
            </div>

            <div>
              <label className="block text-xs font-bold text-stone-700 mb-1">
                Max Courier Match Radius (km)
              </label>
              <input
                type="number"
                min="5"
                max="100"
                value={maxCourierRadiusKm}
                onChange={(e) => setMaxCourierRadiusKm(e.target.value)}
                className="w-full px-3 py-2 text-xs rounded-xl border border-cream-300 focus:outline-none focus:border-forest-600 bg-white"
              />
              <p className="text-[11px] text-stone-400 mt-1">
                Distance radius for broadcast delivery notifications.
              </p>
            </div>
          </div>

          <div className="p-4 bg-cream-50 rounded-2xl border border-cream-200 space-y-3">
            <label className="flex items-center gap-3 cursor-pointer text-xs font-semibold text-stone-800">
              <input
                type="checkbox"
                checked={autoExpireEnabled}
                onChange={(e) => setAutoExpireEnabled(e.target.checked)}
                className="w-4 h-4 rounded text-forest-600 focus:ring-forest-500"
              />
              <span>
                Automated Expiry Sweeper: Mark unclaimed batches as 'expired' once pickup deadline elapses
              </span>
            </label>

            <label className="flex items-center gap-3 cursor-pointer text-xs font-semibold text-stone-800">
              <input
                type="checkbox"
                checked={maintenanceMode}
                onChange={(e) => setMaintenanceMode(e.target.checked)}
                className="w-4 h-4 rounded text-forest-600 focus:ring-forest-500"
              />
              <span className="text-red-700">
                Platform Maintenance Mode: Prevent new donations from being posted during maintenance
              </span>
            </label>
          </div>
        </div>

        <div className="flex justify-end">
          <Button type="submit" variant="primary" loading={saving} className="gap-2 text-xs">
            <Save className="w-4 h-4" /> Save Configuration
          </Button>
        </div>
      </form>
    </div>
  );
}
export default AdminSettingsPage;
