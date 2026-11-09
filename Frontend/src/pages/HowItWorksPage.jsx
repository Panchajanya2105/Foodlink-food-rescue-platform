import React from 'react';
import { Link } from 'react-router-dom';
import {
  PackagePlus,
  ShieldCheck,
  Cpu,
  CheckCircle2,
  Truck,
  HeartHandshake,
  BarChart3,
  ArrowRight,
  Sparkles,
  Clock,
  Thermometer,
} from 'lucide-react';
import { ROUTES } from '../constants/routes.js';
import { Button } from '../components/ui/Button.jsx';
import { Card } from '../components/ui/Card.jsx';
import { Badge } from '../components/ui/Badge.jsx';

export function HowItWorksPage() {
  const steps = [
    {
      num: '01',
      title: 'Donor Registration & Surplus Listing',
      role: 'Donor',
      roleBadge: 'bg-emerald-50 text-emerald-700 border-emerald-200',
      icon: PackagePlus,
      description:
        'Food businesses, bakeries, caterers, and restaurants list excess wholesome food in seconds, specifying item name, category, quantity, allergens, storage criteria, and pickup window.',
      detail: 'Includes photo documentation, allergen disclosures, and dietary flags (Halal, Vegan, Gluten-Free).',
    },
    {
      num: '02',
      title: 'Mandatory Food Safety Checklist',
      role: 'Quality Control',
      roleBadge: 'bg-blue-50 text-blue-700 border-blue-200',
      icon: ShieldCheck,
      description:
        'Donors complete a mandatory food safety verification covering commercial kitchen preparation, non-buffet contact, sanitized packaging, temperature recording, and digital signatory confirmation.',
      detail: 'Listings cannot be requested by NGOs until the safety checklist has been completed and verified.',
    },
    {
      num: '03',
      title: 'Smart Matching & Urgency Evaluation',
      role: 'Automated Engine',
      roleBadge: 'bg-purple-50 text-purple-700 border-purple-200',
      icon: Cpu,
      description:
        'Foodlink continuously evaluates shelf-life urgency (Critical, Urgent, Moderate, Normal) and matches available surplus with nearby verified NGOs based on intake capacity and dietary acceptance.',
      detail: 'Expired food is automatically transitioned and locked to ensure only safe items reach the community.',
    },
    {
      num: '04',
      title: 'NGO Claim & Donor Approval',
      role: 'NGO & Donor',
      roleBadge: 'bg-amber-50 text-amber-700 border-amber-200',
      icon: HeartHandshake,
      description:
        'Verified NGOs review matching food donations and request portions matching their meal service capacity. The donating chef or manager approves the claim with one tap.',
      detail: 'Ensures portion precision so no surplus goes unclaimed or requested beyond intake capabilities.',
    },
    {
      num: '05',
      title: 'Delivery Assignment & Temperature Logging',
      role: 'Delivery Courier',
      roleBadge: 'bg-sky-50 text-sky-700 border-sky-200',
      icon: Truck,
      description:
        'A verified delivery volunteer or partner is assigned. The courier verifies insulated containers, logs food temperature upon custody transfer, and delivers directly to the community shelter.',
      detail: 'Safe transit protocols ensure cold food stays below 4°C and hot food stays above 60°C.',
    },
    {
      num: '06',
      title: 'Delivery Confirmation & Impact Analytics',
      role: 'All Stakeholders',
      roleBadge: 'bg-forest-50 text-forest-700 border-forest-200',
      icon: BarChart3,
      description:
        'Shelter staff confirm receipt with digital verification. The platform logs rescued meal counts, carbon emissions averted, and facilitates mutual donor-NGO feedback ratings.',
      detail: 'Real-time impact dashboards calculate community meals served and equivalent greenhouse gas offsets.',
    },
  ];

  return (
    <div className="py-12 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto space-y-16">
      {/* Title */}
      <div className="text-center max-w-3xl mx-auto space-y-4">
        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-forest-50 text-forest-700 border border-forest-200">
          <Sparkles className="w-3.5 h-3.5 text-forest-600" />
          The Foodlink Lifecycle
        </span>
        <h1 className="text-4xl sm:text-5xl font-black text-stone-900 tracking-tight leading-tight">
          How Food Rescue Works from <span className="text-forest-700">Kitchen</span> to{' '}
          <span className="text-terracotta-600">Community</span>
        </h1>
        <p className="text-lg text-stone-600 leading-relaxed">
          Our automated platform coordinates food safety, real-time urgency deadlines, NGO matching, and custody
          tracking in six transparent stages.
        </p>
      </div>

      {/* Step by step timeline */}
      <div className="space-y-8 relative">
        <div className="hidden lg:block absolute left-1/2 top-4 bottom-4 w-0.5 bg-cream-300 -translate-x-1/2" />

        {steps.map((step, idx) => {
          const Icon = step.icon;
          const isEven = idx % 2 === 1;

          return (
            <div
              key={step.num}
              className={`flex flex-col lg:flex-row items-center gap-8 ${
                isEven ? 'lg:flex-row-reverse' : ''
              }`}
            >
              {/* Content Card */}
              <div className="w-full lg:w-1/2">
                <Card className="p-6 sm:p-8 hover:shadow-lg transition-shadow border-cream-200">
                  <div className="flex items-center justify-between mb-4">
                    <span className="text-3xl font-black text-stone-300 tracking-tighter">{step.num}</span>
                    <span
                      className={`px-2.5 py-0.5 rounded-full text-xs font-bold border uppercase tracking-wider ${step.roleBadge}`}
                    >
                      {step.role}
                    </span>
                  </div>
                  <h2 className="text-xl font-bold text-stone-900 mb-2 flex items-center gap-2">
                    <Icon className="w-5 h-5 text-forest-700 shrink-0" />
                    {step.title}
                  </h2>
                  <p className="text-sm text-stone-600 leading-relaxed mb-4">{step.description}</p>
                  <div className="pt-3 border-t border-cream-200 flex items-start gap-2 text-xs text-stone-500 font-medium">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                    <span>{step.detail}</span>
                  </div>
                </Card>
              </div>

              {/* Center icon indicator */}
              <div className="hidden lg:flex w-12 h-12 rounded-full bg-forest-700 text-cream-50 items-center justify-center border-4 border-white shadow-md z-10 shrink-0">
                <span className="text-xs font-black">{step.num}</span>
              </div>

              {/* Empty placeholder spacer for alternating side */}
              <div className="hidden lg:block w-1/2" />
            </div>
          );
        })}
      </div>

      {/* Roles Section */}
      <div className="bg-cream-100 rounded-3xl p-8 sm:p-12 border border-cream-300 space-y-8">
        <div className="text-center max-w-2xl mx-auto space-y-2">
          <h2 className="text-2xl sm:text-3xl font-bold text-stone-900">Choose Your Role in Food Rescue</h2>
          <p className="text-sm text-stone-600">
            Everyone has an essential responsibility in reducing waste and nourishing neighborhoods.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card className="p-6 space-y-3 bg-white">
            <Badge variant="success" size="sm">Food Donor</Badge>
            <h3 className="font-bold text-stone-900 text-base">Bakeries & Restaurants</h3>
            <p className="text-xs text-stone-600 leading-relaxed">
              Donate excess wholesome batches, track positive environmental impact, and claim tax deductions safely.
            </p>
            <Link to={ROUTES.REGISTER} className="block pt-2">
              <span className="text-xs font-bold text-forest-700 hover:underline flex items-center gap-1">
                Register as Donor <ArrowRight className="w-3 h-3" />
              </span>
            </Link>
          </Card>

          <Card className="p-6 space-y-3 bg-white">
            <Badge variant="warning" size="sm">NGO Partner</Badge>
            <h3 className="font-bold text-stone-900 text-base">Shelters & Food Banks</h3>
            <p className="text-xs text-stone-600 leading-relaxed">
              Get matched with nearby nutritious surplus matching your kitchen capacity and dining schedule.
            </p>
            <Link to={ROUTES.REGISTER} className="block pt-2">
              <span className="text-xs font-bold text-amber-700 hover:underline flex items-center gap-1">
                Apply for Verification <ArrowRight className="w-3 h-3" />
              </span>
            </Link>
          </Card>

          <Card className="p-6 space-y-3 bg-white">
            <Badge variant="info" size="sm">Delivery Courier</Badge>
            <h3 className="font-bold text-stone-900 text-base">Volunteer Fleet</h3>
            <p className="text-xs text-stone-600 leading-relaxed">
              Pick up sealed containers, log temperature safety, and transport meals to shelters in your area.
            </p>
            <Link to={ROUTES.REGISTER} className="block pt-2">
              <span className="text-xs font-bold text-sky-700 hover:underline flex items-center gap-1">
                Join Volunteer Fleet <ArrowRight className="w-3 h-3" />
              </span>
            </Link>
          </Card>

          <Card className="p-6 space-y-3 bg-white">
            <Badge variant="outline" size="sm">Beneficiary</Badge>
            <h3 className="font-bold text-stone-900 text-base">Community Members</h3>
            <p className="text-xs text-stone-600 leading-relaxed">
              Browse public surplus meal availability, distribution locations, and safe pickup guidelines without an account.
            </p>
            <Link to={ROUTES.AVAILABLE_FOOD} className="block pt-2">
              <span className="text-xs font-bold text-forest-700 hover:underline flex items-center gap-1">
                View Food Board <ArrowRight className="w-3 h-3" />
              </span>
            </Link>
          </Card>
        </div>
      </div>
    </div>
  );
}

