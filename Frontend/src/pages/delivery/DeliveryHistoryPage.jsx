import React, { useEffect, useState } from 'react';
import {
  History,
  CheckCircle2,
  Calendar,
  MapPin,
  TrendingUp,
  Search,
  Download,
  Thermometer,
} from 'lucide-react';
import { deliveryService } from '../../services/deliveryService.js';
import { useToast } from '../../hooks/useToast.js';
import { Button } from '../../components/ui/Button.jsx';
import { Badge } from '../../components/ui/Badge.jsx';
import { Spinner } from '../../components/ui/Spinner.jsx';

export function DeliveryHistoryPage() {
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const { error } = useToast();

  const loadHistory = async () => {
    try {
      setLoading(true);
      const res = await deliveryService.getHistory();
      setHistory(res?.data || []);
    } catch (err) {
      error(err.message || 'Failed to load delivery history.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadHistory();
  }, []);

  const filteredHistory = history.filter((item) => {
    const term = search.toLowerCase();
    const foodName = (item.donation?.foodName || '').toLowerCase();
    const city = (item.pickupAddress?.city || '').toLowerCase();
    const ngo = (item.deliveryAddress?.city || '').toLowerCase();
    return foodName.includes(term) || city.includes(term) || ngo.includes(term);
  });

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-cream-200 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-forest-50 text-forest-800 border border-forest-200 mb-2">
            <History className="w-3.5 h-3.5" /> Rescue Log
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-stone-900 tracking-tight">
            Completed Food Deliveries
          </h1>
          <p className="text-sm text-stone-600 mt-1">
            Complete record of your completed food rescue trips and social impact.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="relative">
            <Search className="w-4 h-4 text-stone-400 absolute left-3 top-2.5" />
            <input
              type="text"
              placeholder="Search past trips..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9 pr-4 py-2 text-xs rounded-xl border border-cream-300 focus:outline-none focus:border-forest-600 bg-white"
            />
          </div>
          <Button variant="outline" size="sm" onClick={loadHistory} className="text-xs">
            Refresh
          </Button>
        </div>
      </div>

      {/* Trip List */}
      {loading ? (
        <div className="flex flex-col items-center justify-center py-16 gap-3">
          <Spinner size="lg" />
          <p className="text-sm font-medium text-stone-500">Retrieving trip archive...</p>
        </div>
      ) : filteredHistory.length === 0 ? (
        <div className="bg-white rounded-3xl p-12 text-center border border-cream-200 max-w-lg mx-auto">
          <CheckCircle2 className="w-12 h-12 text-stone-300 mx-auto mb-3" />
          <h3 className="text-base font-bold text-stone-800">No Completed Trips Yet</h3>
          <p className="text-xs text-stone-500 mt-1">
            Once you pick up surplus food and complete NGO delivery sign-offs, your rescue history will be permanently logged here.
          </p>
        </div>
      ) : (
        <div className="bg-white rounded-3xl border border-cream-200 overflow-hidden shadow-xs">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-cream-50 border-b border-cream-200 text-stone-500 font-bold uppercase tracking-wider">
                <tr>
                  <th className="py-3.5 px-4">Trip Date</th>
                  <th className="py-3.5 px-4">Rescued Food</th>
                  <th className="py-3.5 px-4">Quantity</th>
                  <th className="py-3.5 px-4">Route</th>
                  <th className="py-3.5 px-4">Temp (°C)</th>
                  <th className="py-3.5 px-4">Receiver Signoff</th>
                  <th className="py-3.5 px-4 text-right">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-cream-100">
                {filteredHistory.map((item) => (
                  <tr key={item._id} className="hover:bg-cream-50/50 transition-colors">
                    <td className="py-3.5 px-4 text-stone-600">
                      {new Date(item.deliveredAt || item.updatedAt).toLocaleDateString([], {
                        month: 'short',
                        day: 'numeric',
                        year: 'numeric',
                      })}
                    </td>
                    <td className="py-3.5 px-4 font-bold text-stone-900">
                      {item.donation?.foodName || 'Food Surplus'}
                    </td>
                    <td className="py-3.5 px-4 font-semibold text-forest-800">
                      {item.donation?.quantity} {item.donation?.unit}
                    </td>
                    <td className="py-3.5 px-4 text-stone-600">
                      <span className="truncate block max-w-[200px]">
                        {item.pickupAddress?.city || 'Origin'} → {item.deliveryAddress?.city || 'NGO'}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-stone-700">
                      {item.proofOfDelivery?.temperatureCelsius !== undefined
                        ? `${item.proofOfDelivery.temperatureCelsius}°C`
                        : 'Verified'}
                    </td>
                    <td className="py-3.5 px-4 text-stone-700">
                      {item.proofOfDelivery?.ngoReceiverName || 'NGO Representative'}
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      <Badge variant="success">Completed</Badge>
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
export default DeliveryHistoryPage;
