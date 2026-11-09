import React from 'react';
import {
  ShieldCheck,
  Thermometer,
  Clock,
  AlertTriangle,
  CheckCircle,
  Award,
  Package,
  Info,
  Scale,
  Sparkles,
  Layers,
  FileCheck2,
} from 'lucide-react';
import { Card, CardTitle, CardDescription, CardContent } from '../components/ui/Card.jsx';
import { Badge } from '../components/ui/Badge.jsx';

export function FoodSafetyResourcesPage() {
  const allergens = [
    { name: 'Milk & Dairy', icon: '🥛', desc: 'Butter, cheese, milk powder, cream' },
    { name: 'Eggs', icon: '🥚', desc: 'Whole eggs, albumin, mayonnaise, baked goods' },
    { name: 'Fish', icon: '🐟', desc: 'Bass, flounder, cod, salmon, anchovy paste' },
    { name: 'Crustacean Shellfish', icon: '🦐', desc: 'Crab, lobster, shrimp, prawns' },
    { name: 'Tree Nuts', icon: '🌰', desc: 'Almonds, walnuts, pecans, cashews, pistachios' },
    { name: 'Peanuts', icon: '🥜', desc: 'Peanut butter, peanut flour, ground nuts' },
    { name: 'Wheat & Gluten', icon: '🌾', desc: 'Bread, pasta, flour, couscous, semolina' },
    { name: 'Soybeans', icon: '🌱', desc: 'Tofu, soy sauce, edamame, soy protein' },
    { name: 'Sesame', icon: '🥯', desc: 'Tahini, sesame oil, sesame seeds, hummus' },
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-12">
      {/* 1. Page Header */}
      <div className="text-center max-w-3xl mx-auto space-y-4">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-forest-100 text-forest-800 border border-forest-200">
          <ShieldCheck className="w-3.5 h-3.5" /> Foodlink Standard Operating Procedures
        </div>
        <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black text-stone-900 tracking-tight">
          Food Safety & Surplus Handling Guide
        </h1>
        <p className="text-base sm:text-lg text-stone-600 leading-relaxed">
          Safeguarding vulnerable communities is the core foundation of Foodlink. All donors, logistics volunteers,
          and recipient community shelters must follow these mandatory food safety benchmarks throughout the rescue lifecycle.
        </p>
      </div>

      {/* 2. Statutory Legal & Regulatory Disclaimer */}
      <div className="p-6 rounded-3xl bg-amber-50 border border-amber-200 shadow-sm flex flex-col sm:flex-row items-start gap-4">
        <div className="w-10 h-10 rounded-2xl bg-amber-100 border border-amber-300 flex items-center justify-center shrink-0 text-amber-800">
          <Scale className="w-5 h-5" />
        </div>
        <div className="space-y-2 text-xs sm:text-sm text-stone-700 leading-relaxed">
          <h2 className="text-sm sm:text-base font-bold text-amber-950 flex items-center gap-2">
            <span>Statutory Compliance Notice & Legal Disclaimer</span>
          </h2>
          <p>
            The food safety protocols, checklists, and guidelines provided across the Foodlink platform are strictly for
            <strong> educational and operational support</strong>. Completing a Foodlink verification checklist does
            <strong> NOT</strong> constitute a statutory health certificate, nor does it substitute for statutory
            municipal health department compliance, food business licensing, or applicable legal liability requirements
            (such as the Food Safety and Standards Act, 2006, the Food Safety and Standards (Recovery and Distribution of Surplus Food) Regulations, 2019, or Karnataka State Public Health and BBMP sanitary mandates).
          </p>
          <p className="text-stone-500 text-xs">
            Participating food establishments and NGOs remain solely responsible for upholding standard commercial health code
            mandates, sanitization routines, and local regulatory criteria.
          </p>
        </div>
      </div>

      {/* 3. Safe Food Handling Principles */}
      <Card className="border-cream-200 bg-white">
        <div className="flex items-center gap-2.5 mb-6">
          <Sparkles className="w-5 h-5 text-forest-700" />
          <h2 className="text-2xl font-bold text-stone-900">1. Safe Food Handling Principles</h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="p-5 rounded-2xl bg-cream-50/70 border border-cream-200 space-y-2">
            <h3 className="font-bold text-stone-900 text-base">Cleanliness & Hygiene</h3>
            <p className="text-xs sm:text-sm text-stone-600 leading-relaxed">
              Food handlers must wash hands thoroughly with soap for at least 20 seconds before packaging surplus.
              Hair coverings, sanitized food-safe gloves, and clean preparation aprons are mandatory in commercial kitchens.
            </p>
          </div>
          <div className="p-5 rounded-2xl bg-cream-50/70 border border-cream-200 space-y-2">
            <h3 className="font-bold text-stone-900 text-base">Cross-Contamination Prevention</h3>
            <p className="text-xs sm:text-sm text-stone-600 leading-relaxed">
              Keep raw proteins, unwashed produce, and ready-to-eat cooked foods strictly separated. Use dedicated cutting boards
              and sanitized stainless steel equipment to prevent microbiological transfer.
            </p>
          </div>
          <div className="p-5 rounded-2xl bg-cream-50/70 border border-cream-200 space-y-2">
            <h3 className="font-bold text-stone-900 text-base">Safe Chilling & Reheating</h3>
            <p className="text-xs sm:text-sm text-stone-600 leading-relaxed">
              Cool hot surplus from 60°C to 20°C within 2 hours, and to 4°C within an additional 4 hours.
              Recipient kitchens reheating cooked meals must reach an internal temperature of at least 74°C (165°F).
            </p>
          </div>
        </div>
      </Card>

      {/* 4. Critical Storage Guidance & Temperature Danger Zone */}
      <Card className="border-cream-200 bg-white">
        <div className="flex items-center gap-2.5 mb-4">
          <Thermometer className="w-5 h-5 text-terracotta-600" />
          <h2 className="text-2xl font-bold text-stone-900">2. Storage Guidance & Danger Zone</h2>
        </div>
        <p className="text-sm text-stone-600 mb-6">
          Microbiological pathogens multiply most rapidly between <strong>5°C (41°F)</strong> and <strong>60°C (140°F)</strong>.
          Perishable items held in this danger zone for more than 2 hours are strictly unrescuable.
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="p-4 rounded-2xl bg-blue-50 border border-blue-200">
            <span className="text-[11px] font-bold uppercase tracking-wider text-blue-700">Deep Frozen</span>
            <p className="text-2xl font-black text-blue-950 mt-1">&le; -18°C (0°F)</p>
            <p className="text-xs text-stone-600 mt-2">
              Frozen meat, prepared meal trays, vacuum-sealed bread. No signs of freezer burn or thawing ice crystals.
            </p>
          </div>

          <div className="p-4 rounded-2xl bg-sky-50 border border-sky-200">
            <span className="text-[11px] font-bold uppercase tracking-wider text-sky-700">Cold Holding</span>
            <p className="text-2xl font-black text-sky-950 mt-1">0°C to 4°C</p>
            <p className="text-xs text-stone-600 mt-2">
              Fresh dairy, cut vegetables, salads, cooked meats. Must remain refrigerated up until volunteer pickup.
            </p>
          </div>

          <div className="p-4 rounded-2xl bg-amber-50 border border-amber-200">
            <span className="text-[11px] font-bold uppercase tracking-wider text-amber-700">Ambient / Dry</span>
            <p className="text-2xl font-black text-amber-950 mt-1">15°C to 22°C</p>
            <p className="text-xs text-stone-600 mt-2">
              Canned provisions, dry grains, whole uncut produce, bakery items stored away from direct sunlight & pests.
            </p>
          </div>

          <div className="p-4 rounded-2xl bg-red-50 border border-red-200">
            <span className="text-[11px] font-bold uppercase tracking-wider text-red-700">Hot Holding</span>
            <p className="text-2xl font-black text-red-950 mt-1">&ge; 60°C (140°F)</p>
            <p className="text-xs text-stone-600 mt-2">
              Hot buffet pans, stews, warm catering trays kept in insulated thermal Cambro carriers until distribution.
            </p>
          </div>
        </div>
      </Card>

      {/* 5. Major Food Allergens Breakdown */}
      <Card className="border-cream-200 bg-white">
        <div className="flex items-center justify-between mb-4 flex-wrap gap-2">
          <div className="flex items-center gap-2.5">
            <AlertTriangle className="w-5 h-5 text-amber-600" />
            <h2 className="text-2xl font-bold text-stone-900">3. The 9 Major Food Allergens</h2>
          </div>
          <Badge variant="amber" size="sm">Mandatory Labeling</Badge>
        </div>
        <p className="text-sm text-stone-600 mb-6">
          Allergens account for the majority of severe adverse food reactions. Donors must declare every potential allergen
          present in the donation listing to ensure NGOs can safely allocate meals.
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
          {allergens.map((item, idx) => (
            <div key={idx} className="p-4 rounded-2xl bg-stone-50 border border-cream-200 flex items-start gap-3">
              <span className="text-2xl">{item.icon}</span>
              <div>
                <p className="font-bold text-stone-900 text-sm">{item.name}</p>
                <p className="text-xs text-stone-500 mt-0.5">{item.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </Card>

      {/* 6. Expiry Date Awareness: Best Before vs Use By */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <Card className="border-cream-200 bg-emerald-50/50">
          <div className="flex items-center gap-2.5 mb-3">
            <CheckCircle className="w-5 h-5 text-emerald-600" />
            <h3 className="text-xl font-bold text-stone-900">Best Before Date (Quality Standard)</h3>
          </div>
          <p className="text-xs sm:text-sm text-stone-700 leading-relaxed mb-4">
            Relates to food quality, crispness, and flavor rather than safety. Food past its "Best Before" date
            (such as canned beans, pasta, dry crackers, and cereals) is legally safe to rescue and distribute,
            provided packaging is intact and sealed.
          </p>
          <ul className="text-xs text-stone-600 space-y-1.5 list-disc list-inside">
            <li>Safe for intake if container is not dented, swollen, or punctured.</li>
            <li>Helps prevent unnecessary discarding of shelf-stable pantry items.</li>
          </ul>
        </Card>

        <Card className="border-cream-200 bg-red-50/50">
          <div className="flex items-center gap-2.5 mb-3">
            <AlertTriangle className="w-5 h-5 text-red-600" />
            <h3 className="text-xl font-bold text-stone-900">Use By Date (Safety Deadline)</h3>
          </div>
          <p className="text-xs sm:text-sm text-stone-700 leading-relaxed mb-4">
            Relates directly to microbiological safety. Highly perishable foods such as prepared dairy dishes,
            cooked seafood, deli meats, and unpasteurized juices <strong>must NOT</strong> be donated or consumed
            after their "Use By" date.
          </p>
          <ul className="text-xs text-stone-600 space-y-1.5 list-disc list-inside">
            <li>Foodlink auto-retires listings when their pickup deadline or Use By time passes.</li>
            <li>Never attempt to rescue or serve past-due perishable foods.</li>
          </ul>
        </Card>
      </div>

      {/* 7. Packaging & Handover Guidelines */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <Card className="border-cream-200">
          <div className="flex items-center gap-2 mb-4">
            <Package className="w-5 h-5 text-forest-700" />
            <h3 className="text-lg font-bold text-stone-900">Packaging Guidelines</h3>
          </div>
          <ul className="space-y-3 text-xs sm:text-sm text-stone-700">
            {[
              'Use only virgin food-grade aluminum pans, BPA-free plastic lids, or commercial deli trays.',
              'Apply tamper-evident tape or adhesive seals over container lids.',
              'Write clear indelible labels detailing preparation timestamp, donor name, and storage requirement.',
              'Never reuse cardboard boxes previously used for raw poultry or unwashed root vegetables.',
              'Group similar temperature categories together (never stack hot trays directly on cold salads).',
            ].map((rule, idx) => (
              <li key={idx} className="flex items-start gap-2.5">
                <CheckCircle className="w-4 h-4 text-forest-600 mt-0.5 shrink-0" />
                <span>{rule}</span>
              </li>
            ))}
          </ul>
        </Card>

        <Card className="border-cream-200">
          <div className="flex items-center gap-2 mb-4">
            <FileCheck2 className="w-5 h-5 text-terracotta-600" />
            <h3 className="text-lg font-bold text-stone-900">Pickup & Handover Checklist</h3>
          </div>
          <ul className="space-y-3 text-xs sm:text-sm text-stone-700">
            {[
              'Inspect food containers for structural integrity and intact seals before loading.',
              'Courier records food temperature and takes donor staff signoff name in the Foodlink courier app.',
              'Place in clean, pre-conditioned thermal bags or insulated coolers during transit.',
              'Transit point-to-point without unnecessary detours or unattended pauses.',
              'NGO intake receiver verifies seal condition and confirms temperature before shelter acceptance.',
            ].map((rule, idx) => (
              <li key={idx} className="flex items-start gap-2.5">
                <CheckCircle className="w-4 h-4 text-terracotta-600 mt-0.5 shrink-0" />
                <span>{rule}</span>
              </li>
            ))}
          </ul>
        </Card>
      </div>
    </div>
  );
}

export default FoodSafetyResourcesPage;
