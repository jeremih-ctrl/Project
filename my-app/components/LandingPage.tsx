'use client';

import React, { useState } from 'react';
import {
  StoreIcon,
  ShieldCheckIcon,
  TrendingUpIcon,
  DollarSignIcon,
  PackageIcon,
  SparklesIcon,
  ArrowRightIcon,
  CheckCircleIcon,
  UsersIcon,
  GlobeIcon,
  MapPinIcon,
} from './Icons';
import { VendorAccount, isVerifiedLocalVendor } from '../types/vendor';

interface LandingPageProps {
  onRegisterClick: () => void;
  onSignInClick: () => void;
  onExploreDemo: (vendor: VendorAccount) => void;
  demoVendors: VendorAccount[];
}

export function LandingPage({
  onRegisterClick,
  onSignInClick,
  onExploreDemo,
  demoVendors,
}: LandingPageProps) {
  const [calcMonthlySales, setCalcMonthlySales] = useState<number>(35000);

  // Traditional 15% marketplace commission vs Merchanta 2.9% flat rate
  const traditionalFee = calcMonthlySales * 0.15;
  const merchantaFee = calcMonthlySales * 0.029;
  const annualSavings = (traditionalFee - merchantaFee) * 12;

  return (
    <div className="min-h-screen bg-white dark:bg-zinc-950 text-zinc-900 dark:text-zinc-100 selection:bg-indigo-500 selection:text-white">
      {/* Hero Section */}
      <section className="relative overflow-hidden pt-12 pb-20 sm:pt-20 sm:pb-28">
        {/* Glow ambient background gradients */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-7xl h-96 bg-gradient-to-tr from-indigo-500/10 via-blue-500/10 to-teal-500/10 blur-3xl pointer-events-none -z-10" />

        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 text-center">
          <div className="inline-flex items-center gap-2 rounded-full border border-indigo-200 dark:border-indigo-800 bg-indigo-50/80 dark:bg-indigo-950/60 px-4 py-1.5 text-xs font-semibold text-indigo-700 dark:text-indigo-300 mb-6 backdrop-blur-sm shadow-sm">
            <SparklesIcon className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
            <span>0% Commission for First 30 Days • Instant Automated KYB Approval</span>
          </div>

          <h1 className="text-4xl sm:text-6xl lg:text-7xl font-black tracking-tight text-zinc-900 dark:text-white max-w-4xl mx-auto leading-[1.1]">
            Grow your brand with the next-generation{' '}
            <span className="bg-gradient-to-r from-indigo-600 via-blue-600 to-teal-500 bg-clip-text text-transparent">
              Vendor Network
            </span>
          </h1>

          <p className="mt-6 text-base sm:text-lg text-zinc-600 dark:text-zinc-400 max-w-2xl mx-auto leading-relaxed">
            Register your enterprise or artisan business in under 3 minutes. Unlock instant ACH settlements, nationwide 3PL fulfillment, and a high-converting storefront.
          </p>

          <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-3">
            <button
              onClick={onRegisterClick}
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2.5 rounded-2xl bg-gradient-to-r from-indigo-600 via-blue-600 to-indigo-700 hover:from-indigo-500 hover:to-indigo-600 px-8 py-3.5 text-sm font-bold text-white shadow-xl shadow-indigo-600/25 transition-all hover:scale-[1.02] active:scale-[0.98]"
            >
              <span>Register Business Account</span>
              <ArrowRightIcon className="w-4 h-4" />
            </button>

            {demoVendors.length > 0 && (
              <button
                onClick={() => onExploreDemo(demoVendors[0])}
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-2xl border border-zinc-300 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900 hover:bg-zinc-100 dark:hover:bg-zinc-800 px-6 py-3.5 text-sm font-bold text-zinc-800 dark:text-zinc-200 transition-all"
              >
                <span>Explore Live Vendor Portal ({demoVendors[0].businessName})</span>
              </button>
            )}
          </div>

          {/* Trust badges */}
          <div className="mt-12 flex flex-wrap items-center justify-center gap-6 sm:gap-10 text-xs font-semibold text-zinc-500 dark:text-zinc-400">
            <div className="flex items-center gap-2">
              <ShieldCheckIcon className="w-4 h-4 text-emerald-500" />
              <span>FDIC-Insured Settlements</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircleIcon className="w-4 h-4 text-indigo-500" />
              <span>Instant EIN / Tax ID Verification</span>
            </div>
            <div className="flex items-center gap-2">
              <GlobeIcon className="w-4 h-4 text-blue-500" />
              <span>Global Multi-Currency Payouts</span>
            </div>
          </div>
        </div>
      </section>

      {/* Interactive Savings Calculator */}
      <section className="py-16 bg-zinc-50 dark:bg-zinc-900/60 border-y border-zinc-200 dark:border-zinc-800">
        <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-10">
            <span className="text-xs font-bold uppercase tracking-wider text-indigo-600 dark:text-indigo-400">
              Transparent Merchant Economics
            </span>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-zinc-900 dark:text-white mt-2">
              Calculate your annual revenue retention
            </h2>
            <p className="text-xs sm:text-sm text-zinc-500 dark:text-zinc-400 mt-1">
              Traditional marketplaces take 15% to 22% of every sale. Merchanta charges only a 2.9% payment processing fee.
            </p>
          </div>

          <div className="rounded-3xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 p-6 sm:p-10 shadow-lg grid grid-cols-1 md:grid-cols-12 gap-8 items-center">
            <div className="md:col-span-7 space-y-6">
              <div>
                <div className="flex justify-between items-center mb-2">
                  <label className="text-xs font-bold uppercase text-zinc-500 dark:text-zinc-400">
                    Your Estimated Monthly Sales
                  </label>
                  <span className="text-xl font-extrabold text-indigo-600 dark:text-indigo-400 font-mono">
                    ${calcMonthlySales.toLocaleString()} / mo
                  </span>
                </div>
                <input
                  type="range"
                  min="5000"
                  max="250000"
                  step="5000"
                  value={calcMonthlySales}
                  onChange={(e) => setCalcMonthlySales(Number(e.target.value))}
                  className="w-full h-2.5 bg-zinc-200 dark:bg-zinc-700 rounded-lg appearance-none cursor-pointer accent-indigo-600"
                />
                <div className="flex justify-between text-[11px] text-zinc-400 mt-1">
                  <span>$5,000/mo</span>
                  <span>$100,000/mo</span>
                  <span>$250,000+/mo</span>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 pt-2">
                <div className="rounded-2xl bg-zinc-50 dark:bg-zinc-800/60 p-4 border border-zinc-200 dark:border-zinc-750">
                  <span className="text-[11px] text-zinc-400 font-semibold block">
                    Traditional Marketplace (15%)
                  </span>
                  <span className="text-lg font-bold text-red-500 dark:text-red-400">
                    -${traditionalFee.toLocaleString(undefined, { maximumFractionDigits: 0 })}/mo
                  </span>
                </div>
                <div className="rounded-2xl bg-indigo-50 dark:bg-indigo-950/40 p-4 border border-indigo-200 dark:border-indigo-800">
                  <span className="text-[11px] text-indigo-600 dark:text-indigo-400 font-semibold block">
                    Merchanta Flat Fee (2.9%)
                  </span>
                  <span className="text-lg font-bold text-indigo-600 dark:text-indigo-400">
                    -${merchantaFee.toLocaleString(undefined, { maximumFractionDigits: 0 })}/mo
                  </span>
                </div>
              </div>
            </div>

            <div className="md:col-span-5 rounded-2xl bg-gradient-to-br from-indigo-600 to-blue-700 p-6 sm:p-8 text-white text-center flex flex-col justify-between">
              <div>
                <span className="text-xs uppercase font-bold tracking-wider text-indigo-200">
                  Estimated Annual Savings
                </span>
                <div className="text-3xl sm:text-4xl font-black mt-2 font-mono">
                  +${annualSavings.toLocaleString(undefined, { maximumFractionDigits: 0 })}
                </div>
                <p className="text-xs text-indigo-100 mt-2 leading-relaxed">
                  More margin retained to reinvest into inventory, marketing, and product development.
                </p>
              </div>

              <button
                onClick={onRegisterClick}
                className="mt-6 w-full rounded-xl bg-white text-indigo-700 hover:bg-indigo-50 py-3 text-xs font-extrabold shadow-md transition-all active:scale-[0.98]"
              >
                Claim 0% Introductory Rate
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* 4 Pillars of Merchanta */}
      <section className="py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <h2 className="text-2xl sm:text-4xl font-extrabold text-zinc-900 dark:text-white">
              Built for high-performing modern merchants
            </h2>
            <p className="text-sm text-zinc-600 dark:text-zinc-400 mt-2">
              Everything you need to scale from your first product listing to multi-million dollar annual catalog turnover.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="rounded-3xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-8 hover:shadow-lg transition-shadow">
              <div className="w-12 h-12 rounded-2xl bg-indigo-100 dark:bg-indigo-950/80 text-indigo-600 dark:text-indigo-400 flex items-center justify-center mb-5">
                <StoreIcon className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-zinc-900 dark:text-white">
                Custom Branded Storefront
              </h3>
              <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-2 leading-relaxed">
                Enjoy your own verified vendor domain (<code className="text-indigo-600 dark:text-indigo-400">yourbrand.merchanta.market</code>), customizable brand accent palette, logo, and rich media product showpieces.
              </p>
            </div>

            <div className="rounded-3xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-8 hover:shadow-lg transition-shadow">
              <div className="w-12 h-12 rounded-2xl bg-emerald-100 dark:bg-emerald-950/80 text-emerald-600 dark:text-emerald-400 flex items-center justify-center mb-5">
                <DollarSignIcon className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-zinc-900 dark:text-white">
                Daily ACH Automated Payouts
              </h3>
              <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-2 leading-relaxed">
                Never wait weeks for marketplace payouts. Choose daily or weekly automated deposits direct to your commercial checking account with zero wire fees.
              </p>
            </div>

            <div className="rounded-3xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-8 hover:shadow-lg transition-shadow">
              <div className="w-12 h-12 rounded-2xl bg-blue-100 dark:bg-blue-950/80 text-blue-600 dark:text-blue-400 flex items-center justify-center mb-5">
                <PackageIcon className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-zinc-900 dark:text-white">
                Hybrid 3PL Logistics
              </h3>
              <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-2 leading-relaxed">
                Store inventory in our automated nationwide fulfillment network for 2-day delivery, or fulfill directly from your own facilities with our discounted shipping labels.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Verified Brands Showcase */}
      {demoVendors.length > 0 && (
        <section className="py-16 bg-zinc-50 dark:bg-zinc-900/60 border-t border-zinc-200 dark:border-zinc-800">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
              <div>
                <h3 className="text-xl font-bold text-zinc-900 dark:text-white">
                  Verified Merchant Showcase
                </h3>
                <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-0.5">
                  Browse real merchant accounts already active on the Merchanta network.
                </p>
              </div>
              <span className="text-xs font-semibold text-zinc-500">
                Click any brand to inspect their seller dashboard
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {demoVendors.map((vendor) => (
                <div
                  key={vendor.id}
                  onClick={() => onExploreDemo(vendor)}
                  className="rounded-3xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-6 hover:border-indigo-500 dark:hover:border-indigo-500 hover:shadow-xl transition-all cursor-pointer group flex flex-col justify-between"
                >
                  <div>
                    <div className="flex items-center justify-between mb-4">
                      <div
                        className="w-12 h-12 rounded-2xl flex items-center justify-center text-white font-extrabold text-sm shadow-md"
                        style={{ backgroundColor: vendor.brandColor || '#6366f1' }}
                      >
                        {vendor.businessName.substring(0, 2).toUpperCase()}
                      </div>
                      <div className="flex items-center gap-1.5 flex-wrap justify-end">
                        {isVerifiedLocalVendor(vendor) && (
                          <span className="inline-flex items-center gap-1 rounded-full bg-amber-50 dark:bg-amber-950/70 border border-amber-200 dark:border-amber-800 px-2 py-0.5 text-[10px] font-bold text-amber-700 dark:text-amber-300">
                            <MapPinIcon className="w-3 h-3 text-amber-500" />
                            Butuan Verified
                          </span>
                        )}
                        <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 dark:bg-emerald-950/70 border border-emerald-200 dark:border-emerald-800 px-2.5 py-0.5 text-[10px] font-bold text-emerald-700 dark:text-emerald-300">
                          <ShieldCheckIcon className="w-3 h-3 text-emerald-500" />
                          {vendor.sellerTier}
                        </span>
                      </div>
                    </div>

                    <h4 className="text-base font-extrabold text-zinc-900 dark:text-white group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
                      {vendor.businessName}
                    </h4>
                    <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1 line-clamp-2">
                      {vendor.storeHeadline}
                    </p>
                    <p className="text-[11px] text-zinc-400 dark:text-zinc-500 mt-1 flex items-center gap-1">
                      <MapPinIcon className="w-3 h-3" />
                      <span>{vendor.businessAddress.city}, {vendor.businessAddress.country}</span>
                    </p>

                    <div className="mt-4 pt-4 border-t border-zinc-100 dark:border-zinc-800 grid grid-cols-2 gap-2 text-xs">
                      <div>
                        <span className="text-[10px] text-zinc-400 block">Total Sales</span>
                        <span className="font-bold text-zinc-900 dark:text-white">
                          ${vendor.metrics.totalRevenue.toLocaleString()}
                        </span>
                      </div>
                      <div>
                        <span className="text-[10px] text-zinc-400 block">Active Items</span>
                        <span className="font-bold text-zinc-900 dark:text-white">
                          {vendor.products.length} listed
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="mt-4 pt-3 flex items-center justify-between text-xs font-semibold text-indigo-600 dark:text-indigo-400">
                    <span>View Vendor Portal</span>
                    <ArrowRightIcon className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* CTA Footer */}
      <section className="py-20 text-center">
        <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl sm:text-4xl font-extrabold text-zinc-900 dark:text-white">
            Ready to start selling your products?
          </h2>
          <p className="mt-3 text-sm text-zinc-500 dark:text-zinc-400 max-w-xl mx-auto">
            Take 3 minutes to register your business, connect your bank account, and launch your merchant storefront today.
          </p>
          <div className="mt-8">
            <button
              onClick={onRegisterClick}
              className="inline-flex items-center gap-2 rounded-2xl bg-indigo-600 hover:bg-indigo-700 px-8 py-3.5 text-sm font-bold text-white shadow-xl shadow-indigo-600/25 transition-all hover:scale-105 active:scale-[0.98]"
            >
              <span>Get Started Now — Register Business</span>
              <ArrowRightIcon className="w-4 h-4" />
            </button>
          </div>
        </div>
      </section>
    </div>
  );
}
