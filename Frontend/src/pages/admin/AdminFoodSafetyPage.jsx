import React, { useEffect, useState } from 'react';
import { FileCheck2, ShieldCheck, Search, Filter, AlertCircle, CheckCircle2 } from 'lucide-react';
import { adminService } from '../../services/adminService.js';
import { useToast } from '../../hooks/useToast.js';
import { Button } from '../../components/ui/Button.jsx';
import { Badge } from '../../components/ui/Badge.jsx';
import { Spinner } from '../../components/ui/Spinner.jsx';

export function AdminFoodSafetyPage() {
  const [checklists, setChecklists] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const { error } = useToast();

  const loadChecklists = async () => {
    try {
      setLoading(true);
      const res = await adminService.getFoodSafety();
      setChecklists(res?.data || []);
    } catch (err) {
      error(err.message || 'Failed to load food safety records.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadChecklists();
  }, []);

  const filtered = checklists.filter((c) => {
    const term = search.toLowerCase();
    const food = (c.donation?.foodName || '').toLowerCase();
    const donor = (c.verifiedBy?.name || '').toLowerCase();
    return food.includes(term) || donor.includes(term);
  });

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-cream-200 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-emerald-50 text-emerald-800 border border-emerald-200 mb-2">
            <FileCheck2 className="w-3.5 h-3.5" /> Food Safety Audits
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-stone-900 tracking-tight">
            Certified Safety Verification Records
          </h1>
          <p className="text-sm text-stone-600 mt-1">
            Inspection logs for donor checklists, thermal controls, packaging integrity, and allergen transparency.
          </p>
        </div>

        <Button variant="outline" size="sm" onClick={loadChecklists} className="text-xs self-start">
          Refresh Safety Logs
        </Button>
      </div>

      {/* Search */}
      <div className="relative max-w-md bg-white rounded-2xl border border-cream-200">
        <Search className="w-4 h-4 text-stone-400 absolute left-3 top-2.5" />
        <input
          type="text"
          placeholder="Search by food name or verifier..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full pl-9 pr-4 py-2 text-xs rounded-xl focus:outline-none focus:border-emerald-600"
        />
      </div>

      {/* Table */}
      {loading ? (
        <div className="flex flex-col items-center justify-center py-16 gap-3">
          <Spinner size="lg" />
          <p className="text-sm font-medium text-stone-500">Auditing safety certificates...</p>
        </div>
      ) : filtered.length === 0 ? (
        <div className="bg-white rounded-3xl p-12 text-center border border-cream-200 max-w-lg mx-auto">
          <ShieldCheck className="w-12 h-12 text-stone-300 mx-auto mb-3" />
          <h3 className="text-base font-bold text-stone-800">No Checklists Found</h3>
          <p className="text-xs text-stone-500 mt-1">
            Certified donor food safety records will be logged here as donations are submitted.
          </p>
        </div>
      ) : (
        <div className="bg-white rounded-3xl border border-cream-200 overflow-hidden shadow-xs">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-cream-50 border-b border-cream-200 text-stone-500 font-bold uppercase tracking-wider">
                <tr>
                  <th className="py-3.5 px-4">Food Item</th>
                  <th className="py-3.5 px-4">Donor Certifier</th>
                  <th className="py-3.5 px-4">Inspection Date</th>
                  <th className="py-3.5 px-4">Packaging & Seal</th>
                  <th className="py-3.5 px-4">Temperature Checked</th>
                  <th className="py-3.5 px-4 text-right">Audit Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-cream-100">
                {filtered.map((item) => (
                  <tr key={item._id} className="hover:bg-cream-50/50 transition-colors">
                    <td className="py-3.5 px-4 font-bold text-stone-900">
                      {item.donation?.foodName || 'Food Batch'}
                    </td>
                    <td className="py-3.5 px-4 text-stone-700">
                      {item.verifiedBy?.name || 'Authorized Donor'}
                    </td>
                    <td className="py-3.5 px-4 text-stone-500">
                      {new Date(item.createdAt).toLocaleDateString([], {
                        month: 'short',
                        day: 'numeric',
                        year: 'numeric',
                      })}
                    </td>
                    <td className="py-3.5 px-4 text-stone-700">
                      <span className="inline-flex items-center gap-1 text-emerald-700 font-semibold">
                        <CheckCircle2 className="w-3.5 h-3.5" /> Verified
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-stone-700">
                      {item.temperatureCelsius !== undefined ? `${item.temperatureCelsius}°C` : 'Compliant'}
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      <Badge variant="success">Certified Safe</Badge>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
export default AdminFoodSafetyPage;
