import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import {
  Mail,
  Phone,
  MapPin,
  Clock,
  Send,
  HelpCircle,
  ChevronDown,
  Sparkles,
  CheckCircle2,
  AlertCircle,
} from 'lucide-react';
import { Card } from '../components/ui/Card.jsx';
import { Input } from '../components/ui/Input.jsx';
import { Button } from '../components/ui/Button.jsx';
import { useToast } from '../hooks/useToast.js';

const contactSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Please enter a valid email address'),
  organizationType: z.string().min(1, 'Please select your role / inquiry type'),
  subject: z.string().min(4, 'Subject must be at least 4 characters'),
  message: z.string().min(10, 'Message must be at least 10 characters'),
});

const FAQS = [
  {
    q: 'How quickly does Foodlink match surplus food with local charities?',
    a: 'Our smart recommendation engine matches surplus food within minutes of a donor completing the safety checklist, prioritizing NGOs within a 15 km radius with active meal schedules.',
  },
  {
    q: 'Is there any fee for charities or donors to use Foodlink?',
    a: 'No. Foodlink is completely free for food donors, nonprofit charities, and community beneficiaries. Our platform is funded through philanthropic grants and food waste mitigation initiatives.',
  },
  {
    q: 'How does Foodlink protect donors from liability?',
    a: 'All donations are protected under the Food Safety and Standards (Recovery and Distribution of Surplus Food) Regulations, 2019 and the Food Safety and Standards Act, 2006 (Government of Karnataka and Government of India), providing legal protection to food business operators donating wholesome surplus food in good faith.',
  },
  {
    q: 'Who transports the food from donor to shelter?',
    a: 'Rescues are transported by Foodlink verified volunteer couriers or by the recipient NGO’s own logistics team, utilizing insulated thermal containers with real-time temperature logs.',
  },
  {
    q: 'What types of food can be donated?',
    a: 'We accept prepared meals, commercial catering surplus, artisan baked goods, dairy, fresh farm produce, and packaged foods that have been maintained under continuous temperature control.',
  },
];

export function ContactPage() {
  const { success } = useToast();
  const [openFaq, setOpenFaq] = useState(null);
  const [submitted, setSubmitted] = useState(false);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: zodResolver(contactSchema),
  });

  const onSubmit = async (data) => {
    // Simulate contact form submission
    await new Promise((r) => setTimeout(r, 600));
    setSubmitted(true);
    success('Thank you! Your message has been routed to our food rescue coordination team.', 'Message Dispatched');
    reset();
  };

  const toggleFaq = (idx) => {
    setOpenFaq(openFaq === idx ? null : idx);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-16">
      {/* Header */}
      <div className="text-center max-w-3xl mx-auto space-y-4">
        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-forest-50 text-forest-700 border border-forest-200">
          <Sparkles className="w-3.5 h-3.5 text-forest-600" />
          Get in Touch
        </span>
        <h1 className="text-4xl sm:text-5xl font-black text-stone-900 tracking-tight leading-tight">
          We are Here to Accelerate <span className="text-forest-700">Food Rescue</span>
        </h1>
        <p className="text-lg text-stone-600 leading-relaxed">
          Have questions about donor onboarding, NGO verification, volunteer fleets, or urgent food salvage? Reach out
          to our team below.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Contact Information & Emergency Hotline */}
        <div className="lg:col-span-5 space-y-6">
          <div className="p-8 space-y-6 rounded-3xl bg-white border-2 border-stone-200 shadow-md">
            <div className="space-y-2">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-forest-100 text-forest-800 border border-forest-200">
                Direct Dispatch Hotline
              </span>
              <h2 className="text-2xl font-black text-stone-900">Emergency Food Rescue</h2>
              <p className="text-xs text-stone-600 leading-relaxed">
                For time-critical restaurant surplus (&gt; 50 servings expiring within 4 hours), contact our urgent
                rescue dispatch desk immediately.
              </p>
            </div>

            <div className="space-y-4 pt-4 border-t border-stone-200 text-sm">
              <div className="flex items-start gap-3">
                <div className="p-2 rounded-xl bg-terracotta-50 text-terracotta-700 border border-terracotta-200 shrink-0 mt-0.5">
                  <Phone className="w-5 h-5" />
                </div>
                <div>
                  <strong className="block text-stone-900 font-bold text-base">+91 80 2558 0001</strong>
                  <span className="text-xs text-stone-600 font-medium">Mon-Sun: 6:00 AM – 11:00 PM IST</span>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="p-2 rounded-xl bg-forest-50 text-forest-700 border border-forest-200 shrink-0 mt-0.5">
                  <Mail className="w-5 h-5" />
                </div>
                <div>
                  <strong className="block text-stone-900 font-bold text-base">dispatch@foodlink.org</strong>
                  <span className="text-xs text-stone-600 font-medium">Monitored 24/7 by Karnataka rescue coordinators</span>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="p-2 rounded-xl bg-forest-50 text-forest-700 border border-forest-200 shrink-0 mt-0.5">
                  <MapPin className="w-5 h-5" />
                </div>
                <div>
                  <strong className="block text-stone-900 font-bold text-base">Foodlink Karnataka Operations Hub</strong>
                  <span className="text-xs text-stone-600 font-medium">100 Feet Road, Indiranagar, Bengaluru, Karnataka 560038, India</span>
                </div>
              </div>
            </div>
          </div>

          {/* Verification Advice Card */}
          <Card className="p-6 space-y-3 border-cream-200 bg-cream-50/70">
            <h3 className="font-bold text-stone-900 text-sm flex items-center gap-2">
              <Clock className="w-4 h-4 text-forest-700" />
              NGO Verification Turnaround
            </h3>
            <p className="text-xs text-stone-600 leading-relaxed">
              Charity and food pantry registrations are reviewed within 24 hours. To expedite approval, ensure your
              organization tax ID and commercial storage capabilities are accurately entered during registration.
            </p>
          </Card>
        </div>

        {/* Contact Form */}
        <div className="lg:col-span-7">
          <Card className="p-8 space-y-6 border-cream-200 shadow-sm">
            <div>
              <h2 className="text-xl font-bold text-stone-900">Send an Inquiry</h2>
              <p className="text-xs text-stone-500">
                Fill in the details below and a regional coordinator will respond within 4 business hours.
              </p>
            </div>

            {submitted && (
              <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-2xl flex items-center gap-3 text-xs text-emerald-800">
                <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
                <span>Your message was received! Our coordinators will be in touch shortly.</span>
              </div>
            )}

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-stone-700 mb-1">Your Full Name</label>
                  <Input {...register('name')} placeholder="e.g. Chef Sarah Miller" />
                  {errors.name && <p className="text-[11px] text-red-600 mt-1">{errors.name.message}</p>}
                </div>

                <div>
                  <label className="block text-xs font-bold text-stone-700 mb-1">Email Address</label>
                  <Input {...register('email')} type="email" placeholder="sarah@bakery.com" />
                  {errors.email && <p className="text-[11px] text-red-600 mt-1">{errors.email.message}</p>}
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-stone-700 mb-1">I am representing a...</label>
                <select
                  {...register('organizationType')}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-cream-300 bg-white text-stone-900 text-sm focus:outline-none focus:ring-2 focus:ring-forest-500/20 focus:border-forest-600"
                >
                  <option value="">Select your role / organization type</option>
                  <option value="donor">Food Donor (Restaurant / Bakery / Caterer / Hotel)</option>
                  <option value="ngo">Charity / Food Bank / Shelter / Soup Kitchen</option>
                  <option value="volunteer">Delivery Volunteer / Courier Fleet</option>
                  <option value="press">Media / Philanthropic Partner</option>
                  <option value="other">General Community Member</option>
                </select>
                {errors.organizationType && (
                  <p className="text-[11px] text-red-600 mt-1">{errors.organizationType.message}</p>
                )}
              </div>

              <div>
                <label className="block text-xs font-bold text-stone-700 mb-1">Subject</label>
                <Input {...register('subject')} placeholder="e.g. Onboarding commercial bakery branches" />
                {errors.subject && <p className="text-[11px] text-red-600 mt-1">{errors.subject.message}</p>}
              </div>

              <div>
                <label className="block text-xs font-bold text-stone-700 mb-1">Message</label>
                <textarea
                  {...register('message')}
                  rows={4}
                  placeholder="Tell us about your donation frequency, storage equipment, or questions..."
                  className="w-full px-3.5 py-2.5 rounded-xl border border-cream-300 bg-white text-stone-900 text-sm focus:outline-none focus:ring-2 focus:ring-forest-500/20 focus:border-forest-600"
                />
                {errors.message && <p className="text-[11px] text-red-600 mt-1">{errors.message.message}</p>}
              </div>

              <Button type="submit" variant="primary" size="lg" className="w-full" disabled={isSubmitting} icon={Send}>
                {isSubmitting ? 'Dispatching Message...' : 'Send Message'}
              </Button>
            </form>
          </Card>
        </div>
      </div>

      {/* Frequently Asked Questions Accordion */}
      <div className="space-y-6 pt-8 border-t border-cream-300">
        <div className="text-center max-w-2xl mx-auto space-y-2">
          <h2 className="text-2xl sm:text-3xl font-black text-stone-900 flex items-center justify-center gap-2">
            <HelpCircle className="w-6 h-6 text-forest-700" />
            Frequently Asked Questions
          </h2>
          <p className="text-sm text-stone-600">
            Quick answers to common questions about safety, logistics, and verification.
          </p>
        </div>

        <div className="max-w-3xl mx-auto space-y-3">
          {FAQS.map((faq, idx) => (
            <Card
              key={idx}
              className="p-4 sm:p-5 cursor-pointer border-cream-200 hover:border-cream-300 transition-colors"
              onClick={() => toggleFaq(idx)}
            >
              <div className="flex items-center justify-between gap-4">
                <h3 className="font-bold text-stone-900 text-sm sm:text-base">{faq.q}</h3>
                <ChevronDown
                  className={`w-5 h-5 text-stone-400 transition-transform ${
                    openFaq === idx ? 'rotate-180 text-forest-700' : ''
                  }`}
                />
              </div>
              {openFaq === idx && (
                <p className="text-xs sm:text-sm text-stone-600 leading-relaxed mt-3 pt-3 border-t border-cream-200">
                  {faq.a}
                </p>
              )}
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}

