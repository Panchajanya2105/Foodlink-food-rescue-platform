import React, { useState } from 'react';
import { Search, MapPin, Clock, Heart, Filter, AlertCircle, CheckCircle2, Utensils } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '../components/ui/Card.jsx';
import { Badge } from '../components/ui/Badge.jsx';
import { Input } from '../components/ui/Input.jsx';
import { Button } from '../components/ui/Button.jsx';

const samplePublicFood = [
  {
    id: 'food-01',
    title: 'Hot Bisi Bele Bath & Mysore Ghee Rice',
    ngoName: 'Bengaluru Annapoorna Seva Trust',
    address: '452 CMH Road, 2nd Stage, Indiranagar, Bengaluru',
    distance: '1.2 km away',
    servingsAvailable: 45,
    dietary: 'Vegetarian',
    pickupTime: 'Today, until 8:00 PM',
    status: 'Available Now',
    temperature: 'Hot Insulated (>65°C)',
  },
  {
    id: 'food-02',
    title: 'Warm Vegetable Sambar & Steamed Rice Sets',
    ngoName: 'Koramangala Community Food Relief',
    address: '810 80 Feet Road, Koramangala, Bengaluru',
    distance: '2.4 km away',
    servingsAvailable: 65,
    dietary: 'Vegetarian',
    pickupTime: 'Today, until 6:30 PM',
    status: 'Available Now',
    temperature: 'Hot Packaged (>65°C)',
  },
  {
    id: 'food-03',
    title: 'Mysuru Pak & Dharwad Peda Gift Boxes',
    ngoName: 'Basavanagudi Seva Samithi',
    address: '120 DVG Road, Basavanagudi, Bengaluru',
    distance: '3.1 km away',
    servingsAvailable: 35,
    dietary: 'Vegetarian',
    pickupTime: 'Today, until 9:00 PM',
    status: 'Available Now',
    temperature: 'Ambient (Sealed)',
  },
  {
    id: 'food-04',
    title: 'Fresh Karnataka Curd Rice & Fruit Bowls',
    ngoName: 'Mysuru Food Relief Society',
    address: '78 Sayyaji Rao Road, Mysuru',
    distance: '4.0 km away',
    servingsAvailable: 50,
    dietary: 'Vegetarian',
    pickupTime: 'Today, until 7:00 PM',
    status: 'Limited Portions Left',
    temperature: 'Refrigerated (<4°C)',
  },
];

export function PublicFoodDiscoveryPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedFilter, setSelectedFilter] = useState('all');

  const filteredItems = samplePublicFood.filter((item) => {
    const matchesSearch =
      item.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.ngoName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.address.toLowerCase().includes(searchTerm.toLowerCase());
    if (selectedFilter === 'all') return matchesSearch;
    return matchesSearch && item.dietary.toLowerCase().includes(selectedFilter.toLowerCase());
  });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Page Title & Mission */}
      <div className="bg-gradient-to-r from-forest-700 to-forest-900 rounded-3xl p-6 sm:p-10 text-white shadow-floating">
        <div className="max-w-3xl space-y-4">
          <Badge variant="forest" size="sm" className="bg-white/10 text-cream-100 border-white/20">
            Free Community Access • No Login Required
          </Badge>
          <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight">
            Public Food Discovery Board
          </h1>
          <p className="text-sm sm:text-base text-cream-100/90 leading-relaxed">
            Nutritious, verified food rescued from partner restaurants and bakeries is distributed free of charge
            through verified local community shelters. Anyone in need is welcome to walk in during the listed pickup windows.
          </p>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white p-4 rounded-2xl border border-cream-200 shadow-subtle flex flex-col sm:flex-row gap-4 items-center justify-between">
        <div className="w-full sm:w-80">
          <Input
            icon={Search}
            placeholder="Search food, shelter name, or neighborhood..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        {/* Dietary Filters */}
        <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto">
          <span className="text-xs font-bold text-stone-500 uppercase tracking-wider">Filter:</span>
          {['all', 'Vegetarian', 'Vegan', 'Halal'].map((filter) => (
            <button
              key={filter}
              onClick={() => setSelectedFilter(filter)}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-colors ${
                selectedFilter === filter
                  ? 'bg-forest-600 text-white'
                  : 'bg-cream-100 text-stone-700 hover:bg-cream-200'
              }`}
            >
              {filter === 'all' ? 'All Diets' : filter}
            </button>
          ))}
        </div>
      </div>

      {/* Grid of Available Food Packs */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-6">
        {filteredItems.map((item) => (
          <Card key={item.id} hover className="border-cream-200">
            <div className="flex items-start justify-between gap-4">
              <div>
                <span className="text-xs font-bold text-terracotta-600 uppercase tracking-wider">{item.dietary}</span>
                <CardTitle className="mt-0.5">{item.title}</CardTitle>
              </div>
              <Badge variant="success" dot size="sm">
                {item.status}
              </Badge>
            </div>

            <div className="mt-4 p-3 bg-cream-50 rounded-xl space-y-1.5 text-xs text-stone-700">
              <div className="flex items-center gap-2 font-semibold text-stone-900">
                <Utensils className="w-4 h-4 text-forest-700" />
                <span>{item.ngoName}</span>
              </div>
              <div className="flex items-center gap-2 text-stone-600">
                <MapPin className="w-4 h-4 text-stone-400" />
                <span>{item.address} ({item.distance})</span>
              </div>
              <div className="flex items-center gap-2 text-stone-600">
                <Clock className="w-4 h-4 text-amber-600" />
                <span className="font-medium text-stone-800">Pickup window: {item.pickupTime}</span>
              </div>
            </div>

            <div className="mt-4 pt-3 border-t border-cream-200 flex items-center justify-between">
              <div>
                <span className="text-xs text-stone-500">Available portions</span>
                <p className="text-base font-extrabold text-forest-700">{item.servingsAvailable} meals</p>
              </div>
              <Button variant="secondary" size="sm">
                Get Directions
              </Button>
            </div>
          </Card>
        ))}
      </div>

      {/* Safety Notice Callout */}
      <div className="p-4 rounded-2xl bg-amber-50/80 border border-amber-200 flex items-start gap-3">
        <AlertCircle className="w-5 h-5 text-amber-700 shrink-0 mt-0.5" />
        <div className="text-xs text-stone-700 leading-relaxed">
          <strong className="text-stone-900 font-semibold block mb-0.5">Community Beneficiary Notice:</strong>
          All food offered through Foodlink partner shelters complies with strict local food hygiene standards. Meals
          are inspected upon donor departure and again at delivery. Please consume freshly distributed hot food within
          2 hours of receipt or refrigerate promptly.
        </div>
      </div>
    </div>
  );
}

