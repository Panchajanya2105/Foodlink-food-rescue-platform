import React from 'react';
import { Link } from 'react-router-dom';
import { Utensils, Heart, Shield, Sparkles } from 'lucide-react';
import { ROUTES } from '../constants/routes.js';

export function Footer() {
  return (
    <footer className="bg-cream-200/60 border-t border-cream-300/80 text-stone-600 mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand Col */}
          <div className="md:col-span-2 space-y-4">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-forest-600 flex items-center justify-center text-white">
                <Utensils className="w-4 h-4 text-cream-50" />
              </div>
              <span className="text-xl font-extrabold text-forest-800">
                Food<span className="text-terracotta-600">link</span>
              </span>
            </div>
            <p className="text-sm text-stone-600 max-w-md leading-relaxed">
              Foodlink is a Smart Food Donation, NGO Matching, and Food Rescue Management Platform connecting
              compassionate donors with verified community shelters and certified delivery volunteers to eliminate food
              waste and feed vulnerable families.
            </p>
            <div className="flex items-center gap-2 text-xs text-stone-500">
              <Shield className="w-4 h-4 text-forest-600" />
              <span>Full compliance with safe food handling standards and expiry tracking.</span>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-xs font-bold text-stone-900 uppercase tracking-wider mb-3">Public Access</h4>
            <ul className="space-y-2 text-sm">
              <li>
                <Link to={ROUTES.HOME} className="hover:text-forest-700 transition-colors">
                  Platform Overview
                </Link>
              </li>
              <li>
                <Link to={ROUTES.FOOD_DISCOVERY} className="hover:text-forest-700 transition-colors">
                  Public Food Board (Free Access)
                </Link>
              </li>
              <li>
                <Link to={ROUTES.FOOD_SAFETY} className="hover:text-forest-700 transition-colors">
                  Food Safety Guidelines
                </Link>
              </li>
              <li>
                <Link to={ROUTES.LOGIN} className="hover:text-forest-700 transition-colors">
                  Partner Portal Sign In
                </Link>
              </li>
            </ul>
          </div>

          {/* Role Portals */}
          <div>
            <h4 className="text-xs font-bold text-stone-900 uppercase tracking-wider mb-3">Partner Portals</h4>
            <ul className="space-y-2 text-sm">
              <li>
                <Link to={ROUTES.DONOR_DASHBOARD} className="hover:text-forest-700 transition-colors">
                  Food Donor Hub
                </Link>
              </li>
              <li>
                <Link to={ROUTES.NGO_DASHBOARD} className="hover:text-forest-700 transition-colors">
                  NGO Request Manager
                </Link>
              </li>
              <li>
                <Link to={ROUTES.DELIVERY_DASHBOARD} className="hover:text-forest-700 transition-colors">
                  Volunteer Delivery Fleet
                </Link>
              </li>
              <li>
                <Link to={ROUTES.ADMIN_DASHBOARD} className="hover:text-forest-700 transition-colors">
                  Administrator Console
                </Link>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-12 pt-6 border-t border-cream-300 flex flex-col sm:flex-row items-center justify-between text-xs text-stone-500 gap-4">
          <p>© {new Date().getFullYear()} Foodlink Platform. All rights reserved.</p>
          <p className="flex items-center gap-1">
            Built with care for a zero-waste future <Heart className="w-3.5 h-3.5 text-red-500 fill-red-500 inline" />
          </p>
        </div>
      </div>
    </footer>
  );
}

