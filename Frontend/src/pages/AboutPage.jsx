import React from 'react';
import { Link } from 'react-router-dom';
import {
  HeartHandshake,
  ShieldCheck,
  Leaf,
  Scale,
  Users,
  Award,
  ArrowRight,
  CheckCircle2,
  Sparkles,
} from 'lucide-react';
import { ROUTES } from '../constants/routes.js';
import { Button } from '../components/ui/Button.jsx';
import { Card } from '../components/ui/Card.jsx';

export function AboutPage() {
  return (
    <div className="py-12 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto space-y-16">
      {/* Hero Mission */}
      <div className="text-center max-w-3xl mx-auto space-y-4">
        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-forest-50 text-forest-700 border border-forest-200">
          <Sparkles className="w-3.5 h-3.5 text-forest-600" />
          Our Mission & Vision
        </span>
        <h1 className="text-4xl sm:text-5xl font-black text-stone-900 tracking-tight leading-tight">
          Bridging the Divide Between <span className="text-forest-700">Surplus Food</span> and{' '}
          <span className="text-terracotta-600">Community Need</span>
        </h1>
        <p className="text-lg text-stone-600 leading-relaxed">
          Over 30% of wholesome food is lost or discarded while millions experience nutritional insecurity. Foodlink
          is a smart logistics and food rescue platform engineered to safely redirect surplus meals to verified
          charities and community kitchens in real time.
        </p>
      </div>

      {/* Core Pillars */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        <Card className="p-8 space-y-4 border-t-4 border-t-forest-600 shadow-sm hover:shadow-md transition-shadow">
          <div className="w-12 h-12 rounded-2xl bg-forest-50 flex items-center justify-center text-forest-700 border border-forest-200">
            <ShieldCheck className="w-6 h-6" />
          </div>
          <h2 className="text-xl font-bold text-stone-900">Safety First, Always</h2>
          <p className="text-sm text-stone-600 leading-relaxed">
            Every rescue is governed by stringent digital food safety checklists, temperature compliance tracking, and
            transparent preparation records compliant with public health guidelines.
          </p>
        </Card>

        <Card className="p-8 space-y-4 border-t-4 border-t-terracotta-500 shadow-sm hover:shadow-md transition-shadow">
          <div className="w-12 h-12 rounded-2xl bg-terracotta-50 flex items-center justify-center text-terracotta-600 border border-terracotta-200">
            <HeartHandshake className="w-6 h-6" />
          </div>
          <h2 className="text-xl font-bold text-stone-900">Verified Partnerships</h2>
          <p className="text-sm text-stone-600 leading-relaxed">
            We vet 100% of recipient NGOs and shelters to guarantee that donated food directly nourishes vulnerable
            families without commercial diversion or misuse.
          </p>
        </Card>

        <Card className="p-8 space-y-4 border-t-4 border-t-amber-500 shadow-sm hover:shadow-md transition-shadow">
          <div className="w-12 h-12 rounded-2xl bg-amber-50 flex items-center justify-center text-amber-700 border border-amber-200">
            <Leaf className="w-6 h-6" />
          </div>
          <h2 className="text-xl font-bold text-stone-900">Environmental Impact</h2>
          <p className="text-sm text-stone-600 leading-relaxed">
            Preventing edible food from decaying in landfills directly halts methane emissions and saves water. Each meal
            rescued prevents approximately 2.5 kg of greenhouse emissions.
          </p>
        </Card>
      </div>

      {/* Legal Protection / Good Samaritan Act */}
      <div className="bg-forest-900 text-cream-50 rounded-3xl p-8 sm:p-12 relative overflow-hidden shadow-xl">
        <div className="absolute top-0 right-0 w-96 h-96 bg-forest-800/40 rounded-full blur-3xl pointer-events-none" />
        <div className="relative z-10 grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
          <div className="space-y-4">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-forest-800/80 text-forest-200 border border-forest-700">
              <Scale className="w-3.5 h-3.5 text-forest-400" />
              Legal Protection for Donors
            </div>
            <h2 className="text-3xl font-black tracking-tight text-white">
              FSSAI Surplus Food Regulations & Indian Legal Protections
            </h2>
            <p className="text-forest-200 text-sm leading-relaxed">
              Donating food is protected under the Food Safety and Standards (Recovery and Distribution of Surplus Food)
              Regulations, 2019 under Section 16(5) of the Food Safety and Standards Act, 2006. Food Business Operators (FBOs),
              caterers, and restaurants across Karnataka donating wholesome surplus food in good faith to registered food recovery
              agencies are legally shielded.
            </p>
            <ul className="space-y-2 text-sm text-forest-100">
              <li className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                Protects bona fide Karnataka restaurants, caterers, and food establishments.
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                Covers cooked meals, traditional foods, dairy, bakery items, and fresh farm produce.
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                Enforces Karnataka State Health Directorate & FSSAI hygienic handling protocols.
              </li>
            </ul>
          </div>

          <div className="bg-white/10 backdrop-blur-md p-6 rounded-2xl border border-white/10 space-y-4">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-white/20 rounded-xl">
                <Award className="w-6 h-6 text-cream-100" />
              </div>
              <div>
                <h3 className="font-bold text-white text-base">Platform Integrity</h3>
                <p className="text-xs text-forest-200">End-to-end chain of custody accountability</p>
              </div>
            </div>
            <p className="text-xs text-forest-200 leading-relaxed">
              Foodlink's digital custody transfer records timestamps, transport temperatures, and verified digital
              signatures, establishing a clear audit trail for compliance and peace of mind.
            </p>
            <Link to={ROUTES.FOOD_SAFETY}>
              <Button variant="outline" size="sm" className="w-full text-white border-white/20 hover:bg-white/10">
                Explore Food Safety Resources
              </Button>
            </Link>
          </div>
        </div>
      </div>

      {/* Call to action */}
      <div className="text-center space-y-6 pt-4">
        <h2 className="text-2xl sm:text-3xl font-extrabold text-stone-900">
          Ready to join the food rescue movement?
        </h2>
        <div className="flex flex-wrap items-center justify-center gap-4">
          <Link to={ROUTES.REGISTER}>
            <Button variant="primary" size="lg" icon={ArrowRight}>
              Register as Donor or NGO
            </Button>
          </Link>
          <Link to={ROUTES.AVAILABLE_FOOD}>
            <Button variant="outline" size="lg">
              Browse Available Food
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}

