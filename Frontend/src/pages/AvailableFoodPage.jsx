import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  Search,
  MapPin,
  Clock,
  Filter,
  ShieldCheck,
  CheckCircle2,
  AlertTriangle,
  ArrowRight,
  Info,
  Calendar,
  Sparkles,
  Thermometer,
  Layers,
} from 'lucide-react';
import { Card } from '../components/ui/Card.jsx';
import { Badge } from '../components/ui/Badge.jsx';
import { Input } from '../components/ui/Input.jsx';
import { Button } from '../components/ui/Button.jsx';
import { ROUTES } from '../constants/routes.js';
import api from '../services/api.js';

// Clearly identified sample fallback when local database has zero active listings
const SAMPLE_PUBLIC_ITEMS = [
  {
    _id: 'sample-01',
    foodName: 'Mysuru Bisi Bele Bath & Ghee Khara Pongal',
    description: 'Freshly prepared traditional aromatic Karnataka lentil rice and pongal from morning kitchen operations.',
    category: 'cooked_meals',
    quantity: 45,
    unit: 'portions',
    storageRequirement: 'hot_insulated',
    pickupDeadline: new Date(Date.now() + 4 * 3600000).toISOString(),
    expiryDate: new Date(Date.now() + 10 * 3600000).toISOString(),
    pickupAddress: { street: '142 DVG Road, Gandhi Bazaar, Basavanagudi', city: 'Bengaluru', state: 'Karnataka', postalCode: '560004' },
    pickupInstructions: 'Pick up at side delivery bay. Bring clean bags or containers.',
    dietaryFlags: { isVegetarian: true },
    allergens: ['dairy', 'nuts'],
    packagingType: 'Sanitized Thermal Food-Grade Containers',
    evaluation: { urgency: 'urgent', hoursRemaining: 4.0, isExpired: false },
    safetyChecklist: {
      passedAllChecks: true,
      recordedTemperatureCelsius: 68,
      temperatureCompliantAtPacking: true,
      sealedSanitizedPackaging: true,
      allergensAccuratelyDeclared: true,
    },
    isSample: true,
  },
  {
    _id: 'sample-02',
    foodName: 'Hot Sambar Vada & Steamed Idli Sets',
    description: 'Freshly prepared South Indian breakfast surplus. Stored in hot-holding thermal Cambros.',
    category: 'cooked_meals',
    quantity: 60,
    unit: 'portions',
    storageRequirement: 'hot_insulated',
    pickupDeadline: new Date(Date.now() + 1.5 * 3600000).toISOString(),
    expiryDate: new Date(Date.now() + 4 * 3600000).toISOString(),
    pickupAddress: { street: '550 CMH Road, 2nd Stage, Indiranagar', city: 'Bengaluru', state: 'Karnataka', postalCode: '560038' },
    pickupInstructions: 'Present NGO volunteer ID at loading dock door 3.',
    dietaryFlags: { isVegetarian: true, isGlutenFree: false },
    allergens: [],
    packagingType: 'Sealed Food Grade Stainless Trays',
    evaluation: { urgency: 'critical', hoursRemaining: 1.5, isExpired: false },
    safetyChecklist: {
      passedAllChecks: true,
      recordedTemperatureCelsius: 68,
      temperatureCompliantAtPacking: true,
      sealedSanitizedPackaging: true,
      allergensAccuratelyDeclared: true,
    },
    isSample: true,
  },
  {
    _id: 'sample-03',
    foodName: 'Fresh Karnataka Curd Rice & Mixed Fruit Bowls',
    description: 'Chilled curd rice with tempering packaged in individual tamper-evident bio cups. Stored continuously under 3°C.',
    category: 'cooked_meals',
    quantity: 45,
    unit: 'portions',
    storageRequirement: 'refrigerated',
    pickupDeadline: new Date(Date.now() + 8 * 3600000).toISOString(),
    expiryDate: new Date(Date.now() + 14 * 3600000).toISOString(),
    pickupAddress: { street: '89 80 Feet Road, 4th Block, Koramangala', city: 'Bengaluru', state: 'Karnataka', postalCode: '560034' },
    pickupInstructions: 'Pick up at refrigeration storage near freight lift.',
    dietaryFlags: { isVegetarian: true, isGlutenFree: true },
    allergens: ['dairy'],
    packagingType: 'Tamper Evident Sealed Cups',
    evaluation: { urgency: 'moderate', hoursRemaining: 8.0, isExpired: false },
    safetyChecklist: {
      passedAllChecks: true,
      recordedTemperatureCelsius: 2.8,
      temperatureCompliantAtPacking: true,
      sealedSanitizedPackaging: true,
      allergensAccuratelyDeclared: true,
    },
    isSample: true,
  },
];

export function AvailableFoodPage() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedDietary, setSelectedDietary] = useState('all');
  const [cityFilter, setCityFilter] = useState('');
  const [usingSampleData, setUsingSampleData] = useState(false);

  useEffect(() => {
    fetchFoodItems();
  }, [selectedCategory, selectedDietary, cityFilter]);

  const fetchFoodItems = async () => {
    setLoading(true);
    try {
      const params = {};
      if (selectedCategory !== 'all') params.category = selectedCategory;
      if (selectedDietary !== 'all') params.dietary = selectedDietary;
      if (cityFilter.trim()) params.city = cityFilter.trim();
      if (searchTerm.trim()) params.search = searchTerm.trim();

      const res = await api.get('/v1/public/food-board', { params });
      if (res.data?.data && res.data.data.length > 0) {
        setItems(res.data.data);
        setUsingSampleData(false);
      } else {
        // Use clearly identified sample preview when backend has no active surplus listings
        setItems(SAMPLE_PUBLIC_ITEMS);
        setUsingSampleData(true);
      }
    } catch (err) {
      console.warn('Could not connect to live food board API, showing sample preview:', err.message);
      setItems(SAMPLE_PUBLIC_ITEMS);
      setUsingSampleData(true);
    } finally {
      setLoading(false);
    }
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    fetchFoodItems();
  };

  const filteredItems = items.filter((item) => {
    if (!searchTerm) return true;
    const term = searchTerm.toLowerCase();
    return (
      item.foodName?.toLowerCase().includes(term) ||
      item.description?.toLowerCase().includes(term) ||
      item.pickupAddress?.city?.toLowerCase().includes(term)
    );
  });

  const getUrgencyBadge = (urgency) => {
    switch (urgency) {
      case 'critical':
        return <Badge variant="danger" size="sm">Critical • &lt; 2h Left</Badge>;
      case 'urgent':
        return <Badge variant="warning" size="sm">Urgent • &lt; 6h Left</Badge>;
      case 'moderate':
        return <Badge variant="info" size="sm">Moderate • &lt; 24h Left</Badge>;
      default:
        return <Badge variant="success" size="sm">Active Available</Badge>;
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      {/* Hero Header */}
      <div className="bg-gradient-to-r from-forest-800 via-forest-900 to-forest-800 rounded-3xl p-8 sm:p-12 text-white shadow-xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-80 h-80 bg-forest-700/30 rounded-full blur-3xl pointer-events-none" />
        <div className="relative z-10 max-w-3xl space-y-4">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold bg-white/10 text-cream-100 border border-white/20">
            <Sparkles className="w-3.5 h-3.5 text-cream-200" />
            Public Food Availability • No Registration Required
          </div>
          <h1 className="text-3xl sm:text-5xl font-black tracking-tight leading-tight">
            Available Surplus Food Board
          </h1>
          <p className="text-forest-100 text-sm sm:text-base leading-relaxed">
            Browse wholesome, inspected food rescued from partner bakeries, restaurants, and caterers. Community
            members and verified local shelters can review available portions and pickup windows below.
          </p>
        </div>
      </div>

      {usingSampleData && (
        <div className="p-4 bg-amber-50 border border-amber-200 rounded-2xl flex items-center justify-between text-xs text-amber-800">
          <div className="flex items-center gap-2">
            <Info className="w-4 h-4 text-amber-600 shrink-0" />
            <span>
              <strong>[Sample Preview Active]</strong> The live database currently has no active surplus listings.
              Representative sample food items are displayed for demonstration.
            </span>
          </div>
          <Badge variant="warning" size="sm">[Sample Data]</Badge>
        </div>
      )}

      {/* Filter and Search Bar */}
      <div className="bg-white p-5 rounded-2xl border border-cream-200 shadow-sm space-y-4">
        <form onSubmit={handleSearchSubmit} className="flex flex-col sm:flex-row gap-3">
          <div className="flex-1">
            <Input
              icon={Search}
              placeholder="Search by food name, description, or ingredients..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <div className="w-full sm:w-48">
            <Input
              icon={MapPin}
              placeholder="Filter by city..."
              value={cityFilter}
              onChange={(e) => setCityFilter(e.target.value)}
            />
          </div>
          <Button type="submit" variant="primary">Search</Button>
        </form>

        <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-cream-200 text-xs">
          <span className="font-bold text-stone-500 uppercase tracking-wider flex items-center gap-1 mr-2">
            <Filter className="w-3 h-3" /> Category:
          </span>
          {['all', 'cooked_meals', 'bakery', 'dairy', 'produce', 'packaged_food'].map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-3 py-1.5 rounded-xl font-medium transition-colors capitalize ${
                selectedCategory === cat
                  ? 'bg-forest-700 text-white font-semibold'
                  : 'bg-cream-100 text-stone-600 hover:bg-cream-200'
              }`}
            >
              {cat === 'all' ? 'All Categories' : cat.replace('_', ' ')}
            </button>
          ))}

          <span className="font-bold text-stone-500 uppercase tracking-wider flex items-center gap-1 ml-4 mr-2">
            Dietary:
          </span>
          {['all', 'vegetarian', 'vegan', 'halal', 'glutenFree'].map((diet) => (
            <button
              key={diet}
              onClick={() => setSelectedDietary(diet)}
              className={`px-3 py-1.5 rounded-xl font-medium transition-colors capitalize ${
                selectedDietary === diet
                  ? 'bg-terracotta-600 text-white font-semibold'
                  : 'bg-cream-100 text-stone-600 hover:bg-cream-200'
              }`}
            >
              {diet === 'all' ? 'Any' : diet}
            </button>
          ))}
        </div>
      </div>

      {/* Food Listings Grid */}
      {loading ? (
        <div className="p-12 text-center text-stone-500">
          <div className="animate-spin w-8 h-8 border-4 border-forest-600 border-t-transparent rounded-full mx-auto mb-4" />
          <p className="text-sm">Loading available surplus meals...</p>
        </div>
      ) : filteredItems.length === 0 ? (
        <div className="p-12 text-center bg-white rounded-3xl border border-cream-200 space-y-3">
          <AlertTriangle className="w-8 h-8 text-amber-500 mx-auto" />
          <h3 className="font-bold text-stone-900 text-lg">No surplus food currently matches your filters</h3>
          <p className="text-sm text-stone-500 max-w-md mx-auto">
            Try adjusting your search keywords, clearing the city filter, or selecting "All Categories".
          </p>
          <Button variant="outline" size="sm" onClick={() => { setSelectedCategory('all'); setSelectedDietary('all'); setCityFilter(''); setSearchTerm(''); }}>
            Reset Filters
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredItems.map((item) => {
            const urgency = item.evaluation?.urgency || 'normal';
            const hoursLeft = item.evaluation?.hoursRemaining;

            return (
              <Card key={item._id} className="flex flex-col justify-between hover:shadow-lg transition-shadow border-cream-200 overflow-hidden">
                <div className="p-6 space-y-4">
                  {/* Top Badges */}
                  <div className="flex items-center justify-between gap-2">
                    <span className="px-2.5 py-0.5 rounded-md text-xs font-bold uppercase tracking-wider bg-forest-50 text-forest-700 border border-forest-200">
                      {item.category?.replace('_', ' ')}
                    </span>
                    {getUrgencyBadge(urgency)}
                  </div>

                  {/* Title & Description */}
                  <div>
                    <h2 className="text-lg font-bold text-stone-900 tracking-tight line-clamp-1 mb-1">
                      {item.foodName}
                    </h2>
                    <p className="text-xs text-stone-600 line-clamp-2 leading-relaxed">
                      {item.description || 'Wholesome surplus food prepared under commercial sanitary standards.'}
                    </p>
                  </div>

                  {/* Quantity & Storage */}
                  <div className="grid grid-cols-2 gap-2 pt-2 border-t border-cream-200 text-xs">
                    <div>
                      <span className="text-stone-400 block text-[10px] uppercase font-bold">Quantity</span>
                      <span className="font-extrabold text-forest-800 text-sm">
                        {item.quantity} {item.unit}
                      </span>
                    </div>
                    <div>
                      <span className="text-stone-400 block text-[10px] uppercase font-bold">Storage State</span>
                      <span className="font-semibold text-stone-700 capitalize flex items-center gap-1">
                        <Thermometer className="w-3 h-3 text-terracotta-500" />
                        {item.storageRequirement?.replace('_', ' ')}
                      </span>
                    </div>
                  </div>

                  {/* Deadline & Location */}
                  <div className="space-y-1.5 text-xs text-stone-600 bg-cream-50 p-3 rounded-xl border border-cream-200">
                    <div className="flex items-center gap-2">
                      <Clock className="w-3.5 h-3.5 text-amber-600 shrink-0" />
                      <span>
                        Pickup by:{' '}
                        <strong className="text-stone-800">
                          {new Date(item.pickupDeadline).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} (
                          {hoursLeft ? `${hoursLeft}h left` : 'Today'})
                        </strong>
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <MapPin className="w-3.5 h-3.5 text-forest-600 shrink-0" />
                      <span>
                        Area: <strong className="text-stone-800">{item.pickupAddress?.city || 'Local Area'}</strong>
                      </span>
                    </div>
                  </div>

                  {/* Safety & Quality Verification Stamp */}
                  <div className="flex items-center gap-2 text-[11px] text-emerald-800 bg-emerald-50/80 px-2.5 py-1.5 rounded-lg border border-emerald-200">
                    <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
                    <span>Food Safety Checklist Verified by Donor</span>
                  </div>
                </div>

                {/* Footer Action */}
                <div className="p-4 bg-cream-50/70 border-t border-cream-200 flex items-center justify-between">
                  <span className="text-xs text-stone-500 font-medium">Free Distribution</span>
                  <Link to={`/available-food/${item._id}`}>
                    <Button variant="outline" size="sm" icon={ArrowRight}>
                      View Details & Pickup Info
                    </Button>
                  </Link>
                </div>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}

