import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  Utensils,
  HeartHandshake,
  Truck,
  ShieldCheck,
  ArrowRight,
  Clock,
  Sparkles,
  CheckCircle2,
  TrendingUp,
  MapPin,
  Leaf,
  Users,
  Award,
  ChevronRight,
  Star,
  Quote,
  Thermometer,
} from 'lucide-react';
import { ROUTES } from '../constants/routes.js';
import { Button } from '../components/ui/Button.jsx';
import { Card } from '../components/ui/Card.jsx';
import { Badge } from '../components/ui/Badge.jsx';
import api from '../services/api.js';

const SAMPLE_TESTIMONIALS = [
  {
    name: 'Chef K. Venkatesh',
    role: 'Executive Chef, Bengaluru Heritage Bistro & Catering',
    quote:
      'Before Foodlink, our catering team struggled to repurpose leftover buffet trays. Now, a certified volunteer arrives with insulated Cambros within 45 minutes of our shift closing.',
    sampleTag: '[Sample Review • Verified Food Donor]',
    stars: 5,
  },
  {
    name: 'Smt. Radhika Hegde',
    role: 'Director, Bengaluru Annapoorna Seva Trust',
    quote:
      'The automated matching engine changed everything. We receive alerts whenever wholesome meals and bakery packs are available within 5 km, ensuring hot food reaches community shelters quickly.',
    sampleTag: '[Sample Review • Verified NGO Partner]',
    stars: 5,
  },
  {
    name: 'Basavaraj Gowda',
    role: 'Volunteer Courier, Bengaluru Central Fleet',
    quote:
      'Logging temperatures through Foodlink ensures the meals we deliver to vulnerable neighbors across Bengaluru are 100% wholesome and safe. The app makes routing seamless.',
    sampleTag: '[Sample Review • Delivery Volunteer]',
    stars: 5,
  },
];

export function HomePage() {
  const [stats, setStats] = useState({
    rescuedMeals: 4820,
    co2OffsetKg: 12050,
    activeDonations: 18,
    verifiedNGOs: 14,
    activeDonors: 38,
  });
  const [previewFood, setPreviewFood] = useState([]);

  useEffect(() => {
    fetchStats();
    fetchPreviewFood();
  }, []);

  const fetchStats = async () => {
    try {
      const res = await api.get('/v1/public/impact-stats');
      if (res.data?.data) {
        setStats(res.data.data);
      }
    } catch (err) {
      // Retain default representative stats
    }
  };

  const fetchPreviewFood = async () => {
    try {
      const res = await api.get('/v1/public/food-board?limit=3');
      if (res.data?.data && res.data.data.length > 0) {
        setPreviewFood(res.data.data);
      }
    } catch (err) {
      // Silent fallback
    }
  };

  return (
    <div className="space-y-20 pb-20">
      {/* 1. Hero Section with Food Theme */}
      <section className="relative overflow-hidden pt-12 pb-20 sm:pt-20 sm:pb-28 bg-gradient-to-b from-cream-100 via-cream-50 to-cream-100 border-b border-cream-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            {/* Left Column */}
            <div className="lg:col-span-7 space-y-6 text-center lg:text-left">
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-forest-100/80 border border-forest-200 text-forest-800 text-xs font-bold tracking-wide">
                <Sparkles className="w-3.5 h-3.5 text-terracotta-600" />
                Smart Food Donation & Safe Community Rescue
              </div>

              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black text-stone-900 tracking-tight leading-[1.12]">
                Rescuing Surplus Food to Feed <span className="text-forest-700 underline decoration-terracotta-500/40">Hungry Families</span> in Minutes.
              </h1>

              <p className="text-base sm:text-lg text-stone-600 max-w-2xl leading-relaxed">
                Foodlink bridges restaurants, bakeries, and caterers with verified community shelters and volunteer
                couriers. Every rescue enforces mandatory digital food safety checklists, thermal transit logging, and
                strict expiry countdowns.
              </p>

              {/* Call to Actions */}
              <div className="flex flex-wrap items-center justify-center lg:justify-start gap-4 pt-2">
                <Link to={ROUTES.AVAILABLE_FOOD}>
                  <Button variant="primary" size="lg" icon={HeartHandshake}>
                    Browse Available Food
                  </Button>
                </Link>
                <Link to={ROUTES.REGISTER}>
                  <Button variant="warm" size="lg" icon={ArrowRight}>
                    Donate Surplus Food
                  </Button>
                </Link>
              </div>

              {/* Safety Badges */}
              <div className="pt-4 flex flex-wrap items-center justify-center lg:justify-start gap-6 text-xs text-stone-500">
                <span className="flex items-center gap-1.5 font-medium">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" /> Digital Safety Verification
                </span>
                <span className="flex items-center gap-1.5 font-medium">
                  <Clock className="w-4 h-4 text-amber-600" /> Real-Time Expiry Deadlines
                </span>
                <span className="flex items-center gap-1.5 font-medium">
                  <ShieldCheck className="w-4 h-4 text-forest-700" /> 100% Verified Charities
                </span>
              </div>
            </div>

            {/* Right Column: Live Platform Stream Preview */}
            <div className="lg:col-span-5">
              <div className="relative mx-auto max-w-md bg-white rounded-3xl p-6 sm:p-7 shadow-xl border border-cream-200 space-y-5">
                <div className="flex items-center justify-between pb-4 border-b border-cream-200">
                  <div className="flex items-center gap-2">
                    <span className="w-3 h-3 rounded-full bg-emerald-500 animate-pulse" />
                    <span className="text-xs font-bold text-stone-700 uppercase tracking-wider">
                      Live Foodlink Network
                    </span>
                  </div>
                  <Badge variant="forest" size="sm">Active Platform</Badge>
                </div>

                <div className="space-y-3">
                  <div className="p-4 bg-cream-50 rounded-2xl border border-cream-200 space-y-2">
                    <div className="flex items-start justify-between">
                      <div>
                        <h4 className="text-sm font-bold text-stone-900">Artisan Sandwich Platters (45 portions)</h4>
                        <p className="text-xs text-stone-500">Donated by: Harbor Terrace Kitchen</p>
                      </div>
                      <Badge variant="danger" size="sm">&lt; 2h Left</Badge>
                    </div>
                    <div className="flex items-center justify-between text-xs text-stone-600 pt-1">
                      <span className="flex items-center gap-1">
                        <Thermometer className="w-3 h-3 text-terracotta-500" /> 4°C Chilled
                      </span>
                      <span className="text-emerald-700 font-semibold">Matched to Hope Shelter</span>
                    </div>
                  </div>

                  <div className="p-4 bg-cream-50 rounded-2xl border border-cream-200 space-y-2">
                    <div className="flex items-start justify-between">
                      <div>
                        <h4 className="text-sm font-bold text-stone-900">Warm Lentil Rice Bowls (60 portions)</h4>
                        <p className="text-xs text-stone-500">Donated by: Saffron Commercial Kitchen</p>
                      </div>
                      <Badge variant="warning" size="sm">4h Left</Badge>
                    </div>
                    <div className="flex items-center justify-between text-xs text-stone-600 pt-1">
                      <span className="flex items-center gap-1">
                        <Thermometer className="w-3 h-3 text-terracotta-500" /> 68°C Thermal
                      </span>
                      <span className="text-emerald-700 font-semibold">Courier Assigned</span>
                    </div>
                  </div>
                </div>

                <div className="pt-2">
                  <Link to={ROUTES.AVAILABLE_FOOD} className="block">
                    <Button variant="outline" size="sm" className="w-full text-xs" icon={ChevronRight}>
                      Explore All Active Food Listings
                    </Button>
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 2. Platform Impact Statistics */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-forest-900 text-cream-50 rounded-3xl p-8 sm:p-12 shadow-xl relative overflow-hidden">
          <div className="relative z-10 grid grid-cols-2 lg:grid-cols-4 gap-8 text-center">
            <div className="space-y-1">
              <span className="text-3xl sm:text-5xl font-black text-white tracking-tight">
                {stats.rescuedMeals?.toLocaleString()}
              </span>
              <p className="text-xs uppercase font-bold text-forest-200 tracking-wider">Meals Rescued</p>
            </div>

            <div className="space-y-1">
              <span className="text-3xl sm:text-5xl font-black text-emerald-400 tracking-tight">
                {stats.co2OffsetKg?.toLocaleString()} kg
              </span>
              <p className="text-xs uppercase font-bold text-forest-200 tracking-wider">CO₂ Emissions Averted</p>
            </div>

            <div className="space-y-1">
              <span className="text-3xl sm:text-5xl font-black text-amber-300 tracking-tight">
                {stats.verifiedNGOs}
              </span>
              <p className="text-xs uppercase font-bold text-forest-200 tracking-wider">Verified Charities</p>
            </div>

            <div className="space-y-1">
              <span className="text-3xl sm:text-5xl font-black text-terracotta-300 tracking-tight">
                {stats.activeDonors}
              </span>
              <p className="text-xs uppercase font-bold text-forest-200 tracking-wider">Active Food Donors</p>
            </div>
          </div>
        </div>
      </section>

      {/* 3. How Foodlink Works (4 Visual Steps) */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
        <div className="text-center max-w-2xl mx-auto space-y-3">
          <span className="text-xs font-bold uppercase tracking-wider text-forest-700 bg-forest-50 px-3 py-1 rounded-full border border-forest-200">
            Streamlined Rescue Pipeline
          </span>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-stone-900">
            How Foodlink Delivers Surplus to Shelters
          </h2>
          <p className="text-sm text-stone-600">
            Four simple, automated steps that safeguard food quality and prevent edible meals from hitting landfills.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card className="p-6 space-y-4 border-cream-200 hover:shadow-md transition-shadow">
            <div className="w-12 h-12 rounded-2xl bg-forest-50 flex items-center justify-center text-forest-700 border border-forest-200 font-black text-lg">
              1
            </div>
            <h3 className="font-bold text-stone-900 text-lg">Post Surplus & Checklist</h3>
            <p className="text-xs text-stone-600 leading-relaxed">
              Donors list excess portions and complete the mandatory digital food safety checklist with packing
              temperatures and allergen warnings.
            </p>
          </Card>

          <Card className="p-6 space-y-4 border-cream-200 hover:shadow-md transition-shadow">
            <div className="w-12 h-12 rounded-2xl bg-amber-50 flex items-center justify-center text-amber-700 border border-amber-200 font-black text-lg">
              2
            </div>
            <h3 className="font-bold text-stone-900 text-lg">Smart NGO Matching</h3>
            <p className="text-xs text-stone-600 leading-relaxed">
              Algorithms notify verified nearby shelters based on meal service capacity, storage requirements, and
              strict pickup deadlines.
            </p>
          </Card>

          <Card className="p-6 space-y-4 border-cream-200 hover:shadow-md transition-shadow">
            <div className="w-12 h-12 rounded-2xl bg-sky-50 flex items-center justify-center text-sky-700 border border-sky-200 font-black text-lg">
              3
            </div>
            <h3 className="font-bold text-stone-900 text-lg">Temperature-Logged Transit</h3>
            <p className="text-xs text-stone-600 leading-relaxed">
              Volunteer couriers pick up sanitized containers, log food temperatures on arrival, and transport
              directly to recipient community centers.
            </p>
          </Card>

          <Card className="p-6 space-y-4 border-cream-200 hover:shadow-md transition-shadow">
            <div className="w-12 h-12 rounded-2xl bg-emerald-50 flex items-center justify-center text-emerald-700 border border-emerald-200 font-black text-lg">
              4
            </div>
            <h3 className="font-bold text-stone-900 text-lg">Verified Impact & Ledger</h3>
            <p className="text-xs text-stone-600 leading-relaxed">
              Recipient shelters confirm receipt. Donors view real-time tax deduction receipts and carbon offset metrics
              on their dashboard.
            </p>
          </Card>
        </div>

        <div className="text-center pt-2">
          <Link to={ROUTES.HOW_IT_WORKS}>
            <Button variant="outline" size="sm" icon={ArrowRight}>
              Read the Full 6-Stage Operations Guide
            </Button>
          </Link>
        </div>
      </section>

      {/* 4. Trust & Food Safety Section */}
      <section className="bg-cream-100 py-16 border-y border-cream-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div className="space-y-6">
              <span className="text-xs font-bold uppercase tracking-wider text-forest-700 bg-forest-50 px-3 py-1 rounded-full border border-forest-200">
                Rigorous Safety Standards
              </span>
              <h2 className="text-3xl sm:text-4xl font-extrabold text-stone-900 leading-tight">
                Trust & Hygiene Protocols in Every Food Rescue
              </h2>
              <p className="text-sm text-stone-600 leading-relaxed">
                Food rescue must never compromise safety. Foodlink implements strict public health protocols so donor
                businesses and charity kitchens operate with absolute confidence.
              </p>

              <div className="space-y-3 text-xs sm:text-sm text-stone-700">
                <div className="flex items-start gap-3">
                  <ShieldCheck className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
                  <div>
                    <strong className="text-stone-900 block">Commercial Kitchen Validation</strong>
                    <span>Surplus must originate from licensed, inspected food facilities. Self-service buffets are excluded.</span>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <Thermometer className="w-5 h-5 text-terracotta-600 shrink-0 mt-0.5" />
                  <div>
                    <strong className="text-stone-900 block">Continuous Temperature Danger Zone Avoidance</strong>
                    <span>Cold foods held &lt; 4°C; hot foods kept &gt; 60°C. Verified at both pickup and delivery drop-off.</span>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <Award className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
                  <div>
                    <strong className="text-stone-900 block">FSSAI Surplus Food Recovery Legal Shield</strong>
                    <span>Statutory protections under FSSAI (Recovery and Distribution of Surplus Food) Regulations, 2019 shield Karnataka food business operators donating wholesome surplus food in good faith.</span>
                  </div>
                </div>
              </div>

              <Link to={ROUTES.FOOD_SAFETY} className="inline-block pt-2">
                <Button variant="primary" size="sm" icon={ArrowRight}>
                  Review Food Safety Manual
                </Button>
              </Link>
            </div>

            <div className="bg-white p-8 rounded-3xl border border-cream-200 shadow-md space-y-4">
              <h3 className="font-bold text-stone-900 text-lg flex items-center gap-2">
                <Utensils className="w-5 h-5 text-forest-700" />
                Donor & NGO Partnership Standards
              </h3>
              <p className="text-xs text-stone-600 leading-relaxed">
                To maintain the integrity of food distribution, all stakeholders abide by mutual standards:
              </p>
              <ul className="space-y-2.5 text-xs text-stone-600">
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  Mandatory allergen declarations complying with FSSAI regulations and Karnataka state health norms.
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  Tamper-evident food-grade sanitized packaging.
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  Automatic locking of expired donations to prevent improper consumption.
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  Strictly zero sale or commercial monetization of rescued items.
                </li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* 5. Community Testimonials (Clearly labeled [Sample Data]) */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10">
        <div className="text-center max-w-2xl mx-auto space-y-2">
          <span className="text-xs font-bold uppercase tracking-wider text-forest-700 bg-forest-50 px-3 py-1 rounded-full border border-forest-200">
            Community Voices
          </span>
          <h2 className="text-3xl font-extrabold text-stone-900">What Partners Say About Foodlink</h2>
          <p className="text-xs text-stone-500">
            Read representative feedback from culinary donors, shelter operators, and volunteer delivery partners.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {SAMPLE_TESTIMONIALS.map((t, idx) => (
            <Card key={idx} className="p-6 sm:p-7 flex flex-col justify-between border-cream-200 hover:shadow-md transition-shadow">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1 text-amber-500">
                    {[...Array(t.stars)].map((_, i) => (
                      <Star key={i} className="w-4 h-4 fill-amber-400 text-amber-400" />
                    ))}
                  </div>
                  <Badge variant="warning" size="sm">{t.sampleTag}</Badge>
                </div>

                <p className="text-xs sm:text-sm text-stone-700 italic leading-relaxed">
                  "{t.quote}"
                </p>
              </div>

              <div className="pt-4 border-t border-cream-200 mt-4">
                <strong className="block text-stone-900 text-sm font-bold">{t.name}</strong>
                <span className="text-xs text-stone-500">{t.role}</span>
              </div>
            </Card>
          ))}
        </div>
      </section>

      {/* 6. Food Donation CTA */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-gradient-to-r from-forest-800 to-forest-900 text-white rounded-3xl p-8 sm:p-14 text-center space-y-6 shadow-2xl relative overflow-hidden">
          <div className="max-w-3xl mx-auto space-y-4">
            <h2 className="text-3xl sm:text-4xl font-black tracking-tight">
              Turn Wholesome Surplus into Community Nourishment
            </h2>
            <p className="text-sm sm:text-base text-forest-100 max-w-xl mx-auto leading-relaxed">
              Join dozens of culinary leaders, hotels, and bakeries. Listing food takes under two minutes, and our
              volunteers handle safe pickup and direct delivery to verified shelters.
            </p>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-4 pt-2">
            <Link to={ROUTES.REGISTER}>
              <Button variant="warm" size="lg" icon={ArrowRight}>
                Register as Food Donor
              </Button>
            </Link>
            <Link to={ROUTES.CONTACT}>
              <Button variant="outline" size="lg" className="text-white border-white/30 hover:bg-white/10">
                Contact Rescue Desk
              </Button>
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
