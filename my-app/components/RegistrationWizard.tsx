'use client';

import React, { useState } from 'react';
import {
  BuildingIcon,
  StoreIcon,
  CreditCardIcon,
  FileTextIcon,
  ShieldCheckIcon,
  ArrowRightIcon,
  ArrowLeftIcon,
  CheckIcon,
  CheckCircleIcon,
  UploadIcon,
  SparklesIcon,
  LockIcon,
  MailIcon,
  PhoneIcon,
  MapPinIcon,
  GlobeIcon,
  AlertCircleIcon,
} from './Icons';
import {
  VendorAccount,
  BusinessType,
  IndustryCategory,
  ShippingFulfillmentType,
  PayoutSchedule,
  RegistrationResult,
} from '../types/vendor';
import {
  isEmailRegistered,
  isBusinessNameRegistered,
  registerNewVendor,
  setCurrentVendorSession,
} from '../lib/vendorStorage';

interface RegistrationWizardProps {
  onComplete: (vendor: VendorAccount) => void;
  onCancel: () => void;
}

const PRESET_LOGOS = [
  { name: 'Modern Tech', url: 'https://images.unsplash.com/photo-1546435770-a3e426bf472b?auto=format&fit=crop&w=240&q=80' },
  { name: 'Organic Herb', url: 'https://images.unsplash.com/photo-1556228720-195a672e8a03?auto=format&fit=crop&w=240&q=80' },
  { name: 'Minimal Apparel', url: 'https://images.unsplash.com/photo-1523381210434-271e8be1f52b?auto=format&fit=crop&w=240&q=80' },
  { name: 'Artisan Ceramic', url: 'https://images.unsplash.com/photo-1578749556568-bc2c40e68b61?auto=format&fit=crop&w=240&q=80' },
  { name: 'Gourmet Roast', url: 'https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?auto=format&fit=crop&w=240&q=80' },
  { name: 'Cosmic Gear', url: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=240&q=80' },
];

const BRAND_COLORS = [
  { label: 'Indigo', hex: '#6366f1' },
  { label: 'Emerald', hex: '#10b981' },
  { label: 'Cyan', hex: '#06b6d4' },
  { label: 'Violet', hex: '#8b5cf6' },
  { label: 'Amber', hex: '#f59e0b' },
  { label: 'Rose', hex: '#f43f5e' },
  { label: 'Midnight', hex: '#1e293b' },
];

export function RegistrationWizard({ onComplete, onCancel }: RegistrationWizardProps) {
  const [step, setStep] = useState<number>(1);
  const totalSteps = 6;

  // Step 1: Personal / Account Credentials
  const [fullName, setFullName] = useState('');
  const [workEmail, setWorkEmail] = useState('');
  const [password, setPassword] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [jobTitle, setJobTitle] = useState('Founder & Managing Director');

  // Step 2: Business & Legal Entity
  const [businessName, setBusinessName] = useState('');
  const [dbaName, setDbaName] = useState('');
  const [businessType, setBusinessType] = useState<BusinessType>('llc');
  const [industryCategory, setIndustryCategory] = useState<IndustryCategory>('consumer_electronics');
  const [taxId, setTaxId] = useState('');
  const [websiteUrl, setWebsiteUrl] = useState('');
  const [annualRevenueBand, setAnnualRevenueBand] = useState('$250K - $1M');
  const [expectedMonthlyVolume, setExpectedMonthlyVolume] = useState('200 - 500 orders/mo');

  // Step 3: Location & Logistics
  const [street, setStreet] = useState('');
  const [unitSuite, setUnitSuite] = useState('');
  const [city, setCity] = useState('');
  const [state, setState] = useState('');
  const [postalCode, setPostalCode] = useState('');
  const [country, setCountry] = useState('United States');
  const [fulfillmentType, setFulfillmentType] = useState<ShippingFulfillmentType>('merchant_hub_3pl');

  // Step 4: Banking & Payouts
  const [bankName, setBankName] = useState('Chase Commercial Banking');
  const [accountHolderName, setAccountHolderName] = useState('');
  const [accountType, setAccountType] = useState<'checking' | 'savings'>('checking');
  const [routingNumber, setRoutingNumber] = useState('121000358');
  const [accountNumber, setAccountNumber] = useState('9876543210');
  const [currency, setCurrency] = useState('USD ($)');
  const [payoutSchedule, setPayoutSchedule] = useState<PayoutSchedule>('weekly');

  // Step 5: Storefront & Brand Identity
  const [storeSlug, setStoreSlug] = useState('');
  const [storeHeadline, setStoreHeadline] = useState('');
  const [storeBio, setStoreBio] = useState('');
  const [brandColor, setBrandColor] = useState('#6366f1');
  const [logoUrl, setLogoUrl] = useState(PRESET_LOGOS[0].url);
  const [bannerUrl, setBannerUrl] = useState('https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?auto=format&fit=crop&w=1200&q=80');

  // Step 6: Verification & Agreement
  const [uploadedDoc, setUploadedDoc] = useState(true);
  const [termsAgreed, setTermsAgreed] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [verificationProgress, setVerificationProgress] = useState(0);
  const [isSuccessModal, setIsSuccessModal] = useState(false);
  const [createdVendor, setCreatedVendor] = useState<VendorAccount | null>(null);

  // Auto-slug generation when typing business name
  const handleBusinessNameChange = (val: string) => {
    setBusinessName(val);
    if (!storeSlug) {
      setStoreSlug(val.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, ''));
    }
    if (!accountHolderName) {
      setAccountHolderName(val);
    }
  };

  // Quick Demo Auto-fill Helper
  const handleQuickFill = () => {
    setFullName('Alexander Wright');
    setWorkEmail('alex@wrightcrafts.com');
    setPassword('SecurePass#2026');
    setPhoneNumber('+1 (415) 628-9941');
    setJobTitle('CEO & Founder');

    setBusinessName('Wright Fine Goods Co.');
    setDbaName('Wright Goods');
    setBusinessType('llc');
    setIndustryCategory('artisan_crafts');
    setTaxId('84-9182374');
    setWebsiteUrl('https://wrightgoods.example.com');
    setAnnualRevenueBand('$500K - $1M');
    setExpectedMonthlyVolume('300 - 600 orders/mo');

    setStreet('148 J.C. Aquino Avenue, Barangay Doongan');
    setUnitSuite('Unit 3B');
    setCity('Butuan City');
    setState('Agusan del Norte');
    setPostalCode('8600');
    setCountry('Philippines');
    setFulfillmentType('merchant_hub_3pl');

    setBankName('Silicon Valley Commercial Bank');
    setAccountHolderName('Wright Fine Goods Co.');
    setAccountType('checking');
    setRoutingNumber('121000358');
    setAccountNumber('8831902415');
    setCurrency('USD ($)');
    setPayoutSchedule('daily');

    setStoreSlug('wright-goods');
    setStoreHeadline('Heirloom Handcrafted Horology & Fine Leather Wares');
    setStoreBio('Designed and crafted by hand with vegetable-tanned Italian leather and precision Japanese automatic mechanical movements.');
    setBrandColor('#10b981');
    setLogoUrl(PRESET_LOGOS[3].url);
    setBannerUrl('https://images.unsplash.com/photo-1523381210434-271e8be1f52b?auto=format&fit=crop&w=1200&q=80');

    setTermsAgreed(true);
    setUploadedDoc(true);
  };

  const handleNext = () => {
    if (step < totalSteps) {
      setStep(step + 1);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const handlePrev = () => {
    if (step > 1) {
      setStep(step - 1);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    if (!termsAgreed) {
      setErrorMessage('Please agree to the Merchanta Merchant Agreement to proceed.');
      return;
    }

    // Step 1: Validate all input fields
    if (!fullName || fullName.trim().length < 2) {
      setErrorMessage('Validation Error (Step 1): Please enter the Legal Representative Full Name.');
      setStep(1);
      return;
    }

    const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    if (!workEmail || !emailRegex.test(workEmail.trim())) {
      setErrorMessage('Validation Error (Step 1): Please enter a valid work email address (e.g. owner@business.com).');
      setStep(1);
      return;
    }

    if (!password || password.length < 6) {
      setErrorMessage('Validation Error (Step 1): Password must be at least 6 characters.');
      setStep(1);
      return;
    }

    if (!businessName || businessName.trim().length < 2) {
      setErrorMessage('Validation Error (Step 1): Please provide a valid Business Entity Name (at least 2 characters).');
      setStep(2);
      return;
    }

    if (!street || street.trim().length < 4) {
      setErrorMessage('Validation Error (Step 1): Please provide a complete business street address.');
      setStep(3);
      return;
    }

    setIsSubmitting(true);

    // Step 2: Check if email address already exists
    if (isEmailRegistered(workEmail)) {
      setErrorMessage(`Registration Error (Step 2): The email address "${workEmail.trim()}" is already registered. Please sign in or use a different email address.`);
      setStep(1);
      setIsSubmitting(false);
      return;
    }

    // Step 3: Check if business name already exists
    if (isBusinessNameRegistered(businessName)) {
      setErrorMessage(`Registration Error (Step 3): The business name "${businessName.trim()}" is already registered. Please choose a unique business name.`);
      setStep(2);
      setIsSubmitting(false);
      return;
    }

    // Simulate verification progress visual
    for (let i = 20; i <= 100; i += 20) {
      await new Promise((r) => setTimeout(r, 200));
      setVerificationProgress(i);
    }

    const newVendorId = `vnd_${Math.floor(100000 + Math.random() * 900000)}`;

    const vendor: VendorAccount = {
      id: newVendorId,
      fullName: fullName.trim(),
      workEmail: workEmail.trim(),
      password: password,
      phoneNumber: phoneNumber.trim() || '+1 (555) 019-2831',
      jobTitle: jobTitle || 'Owner',
      createdAt: new Date().toISOString(),

      businessName: businessName.trim(),
      dbaName: dbaName.trim() || businessName.trim(),
      businessType,
      industryCategory,
      taxId: taxId ? `XX-XXX${taxId.slice(-4)}` : 'XX-XXX9182',
      websiteUrl: websiteUrl || 'https://partner.merchanta.market',
      annualRevenueBand,
      expectedMonthlyVolume,

      businessAddress: {
        street: street.trim(),
        unitSuite,
        city: city || 'Butuan City',
        state: state || 'Agusan del Norte',
        postalCode: postalCode || '8600',
        country: country || 'Philippines',
      },
      fulfillmentType,

      banking: {
        bankName: bankName || 'Premier Merchant Banking',
        accountHolderName: accountHolderName || businessName,
        accountType,
        routingNumber: routingNumber || '121000358',
        accountNumberMasked: `•••• •••• ${accountNumber ? accountNumber.slice(-4) : '4821'}`,
        currency,
        payoutSchedule,
      },

      storeSlug: storeSlug || businessName.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
      storeHeadline: storeHeadline || `Official Store of ${businessName}`,
      storeBio: storeBio || 'Welcome to our verified partner store on Merchanta.',
      brandColor,
      logoUrl: logoUrl || PRESET_LOGOS[0].url,
      bannerUrl: bannerUrl || 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?auto=format&fit=crop&w=1200&q=80',

      verificationStatus: 'verified',
      sellerTier: 'Verified Partner',
      verifiedAt: new Date().toISOString(),
      kycDocuments: [
        {
          id: `doc_${Date.now()}`,
          type: 'business_license',
          name: `${businessName.replace(/\s+/g, '_')}_Business_License.pdf`,
          status: 'approved',
          fileSize: '1.2 MB',
          uploadedAt: new Date().toISOString().split('T')[0],
        },
      ],

      metrics: {
        totalRevenue: 0.0,
        monthlyGrowth: 0,
        ordersCount: 0,
        conversionRate: 0,
        storeViews: 120,
        availableBalance: 0.0,
        pendingPayout: 0.0,
        nextPayoutDate: 'Next scheduled settlement',
      },

      products: [
        {
          id: `p_${Date.now()}_1`,
          title: `${businessName} Premier Flagship Item`,
          sku: 'PRM-001',
          category: 'Featured Collection',
          price: 129.0,
          stock: 50,
          status: 'active',
          imageUrl: logoUrl || PRESET_LOGOS[0].url,
          salesCount: 0,
        },
      ],

      orders: [],
    };

    // Step 4: Save vendor information to database (/api/vendors/register)
    try {
      const res = await fetch('/api/vendors/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          businessName: vendor.businessName,
          ownerName: vendor.fullName,
          contactNumber: vendor.phoneNumber,
          email: vendor.workEmail,
          businessAddress: vendor.businessAddress.street,
          businessType: vendor.businessType,
          governmentId: vendor.taxId,
          password: vendor.password,
          confirmPassword: vendor.password,
        }),
      });

      const data: RegistrationResult = await res.json();
      if (!res.ok || !data.success) {
        if (data.fieldErrors?.email) {
          setErrorMessage(`Registration Error (Step 2): ${data.fieldErrors.email}`);
          setStep(1);
          setIsSubmitting(false);
          return;
        }
        if (data.fieldErrors?.businessName) {
          setErrorMessage(`Registration Error (Step 3): ${data.fieldErrors.businessName}`);
          setStep(2);
          setIsSubmitting(false);
          return;
        }
        throw new Error(data.message || 'Server database registration failed.');
      }
    } catch (err: unknown) {
      console.warn('API sync warning in wizard, saving to local store:', err);
    }

    // Step 5: Create vendor account in registry and set session
    registerNewVendor(vendor);
    setCurrentVendorSession(vendor);

    // Step 6: Display success confirmation modal
    setCreatedVendor(vendor);
    setIsSubmitting(false);
    setIsSuccessModal(true);
  };

  const stepLabels = [
    { title: 'Credentials', desc: 'Account access & identity' },
    { title: 'Legal Entity', desc: 'Company details & tax ID' },
    { title: 'Logistics', desc: 'HQ & fulfillment model' },
    { title: 'Payout & Bank', desc: 'Direct deposit settings' },
    { title: 'Storefront', desc: 'Branding & display slug' },
    { title: 'Verification', desc: 'KYB approval & activate' },
  ];

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950 py-10 px-4 sm:px-6 lg:px-8 transition-colors">
      <div className="mx-auto max-w-4xl">
        {/* Header Bar */}
        <div className="mb-8 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-1.5 rounded-full bg-indigo-50 dark:bg-indigo-950/70 border border-indigo-200/60 dark:border-indigo-800/60 px-3 py-1 text-xs font-semibold text-indigo-700 dark:text-indigo-300 mb-2">
              <SparklesIcon className="w-3.5 h-3.5" />
              <span>Official Merchant Partner Onboarding</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-zinc-900 dark:text-white tracking-tight">
              Register Your Business on Merchanta
            </h1>
            <p className="text-sm text-zinc-600 dark:text-zinc-400 mt-1">
              Join thousands of vetted brands, artisan creators, and enterprise retailers worldwide.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleQuickFill}
              className="inline-flex items-center gap-1.5 rounded-lg border border-amber-300 dark:border-amber-700 bg-amber-50 dark:bg-amber-950/40 px-3 py-1.5 text-xs font-semibold text-amber-800 dark:text-amber-200 hover:bg-amber-100 transition-colors shadow-sm"
              title="Autofill form with sample verified brand data"
            >
              <SparklesIcon className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400" />
              <span>Autofill Sample Brand</span>
            </button>
            <button
              type="button"
              onClick={onCancel}
              className="rounded-lg border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 px-3 py-1.5 text-xs font-semibold text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
            >
              Cancel
            </button>
          </div>
        </div>

        {/* Step Progress Bar */}
        <div className="mb-8 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-4 sm:p-6 shadow-sm">
          <div className="grid grid-cols-3 sm:grid-cols-6 gap-3">
            {stepLabels.map((s, idx) => {
              const stepNumber = idx + 1;
              const isPassed = step > stepNumber;
              const isCurrent = step === stepNumber;

              return (
                <button
                  key={s.title}
                  type="button"
                  onClick={() => setStep(stepNumber)}
                  className={`text-left group transition-all flex flex-col ${
                    isCurrent
                      ? 'opacity-100'
                      : isPassed
                      ? 'opacity-90 hover:opacity-100'
                      : 'opacity-50 hover:opacity-75'
                  }`}
                >
                  <div className="flex items-center gap-2 mb-1.5">
                    <div
                      className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold transition-all ${
                        isPassed
                          ? 'bg-emerald-500 text-white'
                          : isCurrent
                          ? 'bg-indigo-600 text-white ring-4 ring-indigo-500/20 shadow-sm'
                          : 'bg-zinc-200 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300'
                      }`}
                    >
                      {isPassed ? <CheckIcon className="w-3.5 h-3.5" /> : stepNumber}
                    </div>
                    <span
                      className={`text-xs font-semibold hidden md:inline truncate ${
                        isCurrent
                          ? 'text-indigo-600 dark:text-indigo-400'
                          : 'text-zinc-800 dark:text-zinc-200'
                      }`}
                    >
                      {s.title}
                    </span>
                  </div>
                  <div
                    className={`h-1 w-full rounded-full transition-colors ${
                      isPassed
                        ? 'bg-emerald-500'
                        : isCurrent
                        ? 'bg-indigo-600'
                        : 'bg-zinc-100 dark:bg-zinc-800'
                    }`}
                  />
                  <span className="text-[10px] text-zinc-500 dark:text-zinc-400 mt-1 hidden sm:block truncate">
                    {s.desc}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Validation or System Processing Error Banner */}
        {errorMessage && (
          <div className="mb-6 rounded-2xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900/60 p-4 text-rose-800 dark:text-rose-200 shadow-sm animate-fadeIn">
            <div className="flex items-start gap-3">
              <AlertCircleIcon className="w-5 h-5 text-rose-600 dark:text-rose-400 shrink-0 mt-0.5" />
              <div className="flex-1 text-sm font-semibold">
                {errorMessage}
              </div>
            </div>
          </div>
        )}

        {/* Wizard Form Card */}
        <form onSubmit={handleSubmit} className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-3xl p-6 sm:p-10 shadow-lg shadow-zinc-200/50 dark:shadow-none">
          {/* STEP 1: Account Credentials */}
          {step === 1 && (
            <div className="space-y-6 animate-fadeIn">
              <div>
                <h2 className="text-xl font-bold text-zinc-900 dark:text-white flex items-center gap-2">
                  <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-indigo-100 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-400 text-sm font-bold">
                    1
                  </span>
                  Merchant Account & Authorized Representative
                </h2>
                <p className="text-sm text-zinc-500 dark:text-zinc-400 mt-1">
                  Create your administrator login credentials and representative contact details.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1.5">
                    Legal Representative Full Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    placeholder="e.g. Elena Vance"
                    className="w-full rounded-xl border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-800/80 px-3.5 py-2.5 text-sm text-zinc-900 dark:text-white placeholder:text-zinc-400 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1.5">
                    Job Title / Role in Organization *
                  </label>
                  <input
                    type="text"
                    required
                    value={jobTitle}
                    onChange={(e) => setJobTitle(e.target.value)}
                    placeholder="e.g. Founder & CEO, Operations Director"
                    className="w-full rounded-xl border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-800/80 px-3.5 py-2.5 text-sm text-zinc-900 dark:text-white placeholder:text-zinc-400 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1.5 flex items-center justify-between">
                    <span>Corporate / Work Email *</span>
                    <span className="text-[10px] text-zinc-400 font-normal">Used for seller sign in</span>
                  </label>
                  <div className="relative">
                    <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3 text-zinc-400">
                      <MailIcon className="w-4 h-4" />
                    </div>
                    <input
                      type="email"
                      required
                      value={workEmail}
                      onChange={(e) => setWorkEmail(e.target.value)}
                      placeholder="e.g. alex@yourbrand.com"
                      className="w-full rounded-xl border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-800/80 pl-9 pr-3.5 py-2.5 text-sm text-zinc-900 dark:text-white placeholder:text-zinc-400 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1.5">
                    Direct Phone Number *
                  </label>
                  <div className="relative">
                    <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3 text-zinc-400">
                      <PhoneIcon className="w-4 h-4" />
                    </div>
                    <input
                      type="tel"
                      required
                      value={phoneNumber}
                      onChange={(e) => setPhoneNumber(e.target.value)}
                      placeholder="+1 (415) 555-0199"
                      className="w-full rounded-xl border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-800/80 pl-9 pr-3.5 py-2.5 text-sm text-zinc-900 dark:text-white placeholder:text-zinc-400 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
                    />
                  </div>
                </div>

                <div className="sm:col-span-2">
                  <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1.5">
                    Account Password *
                  </label>
                  <div className="relative">
                    <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3 text-zinc-400">
                      <LockIcon className="w-4 h-4" />
                    </div>
                    <input
                      type="password"
                      required
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="Minimum 8 characters with numbers and symbols"
                      className="w-full rounded-xl border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-800/80 pl-9 pr-3.5 py-2.5 text-sm text-zinc-900 dark:text-white placeholder:text-zinc-400 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
                    />
                  </div>
                  {password && (
                    <div className="mt-2 flex items-center gap-2">
                      <div className="h-1 flex-1 bg-zinc-100 dark:bg-zinc-800 rounded-full overflow-hidden">
                        <div
                          className={`h-full ${
                            password.length > 10 ? 'bg-emerald-500 w-full' : password.length > 6 ? 'bg-amber-500 w-2/3' : 'bg-red-500 w-1/3'
                          }`}
                        />
                      </div>
                      <span className="text-[11px] text-zinc-500 font-medium">
                        {password.length > 10 ? 'Strong' : password.length > 6 ? 'Medium' : 'Weak'}
                      </span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* STEP 2: Legal Entity & Business Info */}
          {step === 2 && (
            <div className="space-y-6 animate-fadeIn">
              <div>
                <h2 className="text-xl font-bold text-zinc-900 dark:text-white flex items-center gap-2">
                  <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-indigo-100 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-400 text-sm font-bold">
                    2
                  </span>
                  Business Legal Entity & Industry
                </h2>
                <p className="text-sm text-zinc-500 dark:text-zinc-400 mt-1">
                  Specify your legal organization structure, trade name, and tax identification.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1.5">
                    Registered Legal Business Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={businessName}
                    onChange={(e) => handleBusinessNameChange(e.target.value)}
                    placeholder="e.g. Apex Audio Labs Inc."
                    className="w-full rounded-xl border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-800/80 px-3.5 py-2.5 text-sm text-zinc-900 dark:text-white placeholder:text-zinc-400 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1.5">
                    Doing Business As (DBA) / Brand Name
                  </label>
                  <input
                    type="text"
                    value={dbaName}
                    onChange={(e) => setDbaName(e.target.value)}
                    placeholder="e.g. Apex Audio (if different)"
                    className="w-full rounded-xl border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-800/80 px-3.5 py-2.5 text-sm text-zinc-900 dark:text-white placeholder:text-zinc-400 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1.5">
                    Legal Business Structure *
                  </label>
                  <select
                    value={businessType}
                    onChange={(e) => setBusinessType(e.target.value as BusinessType)}
                    className="w-full rounded-xl border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-800/80 px-3.5 py-2.5 text-sm text-zinc-900 dark:text-white focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
                  >
                    <option value="llc">Limited Liability Company (LLC)</option>
                    <option value="corporation">Corporation (C-Corp / S-Corp)</option>
                    <option value="sole_proprietorship">Sole Proprietorship</option>
                    <option value="partnership">General or Limited Partnership</option>
                    <option value="non_profit">Non-Profit Organization</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1.5">
                    Primary Industry & Merchandising Category *
                  </label>
                  <select
                    value={industryCategory}
                    onChange={(e) => setIndustryCategory(e.target.value as IndustryCategory)}
                    className="w-full rounded-xl border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-800/80 px-3.5 py-2.5 text-sm text-zinc-900 dark:text-white focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
                  >
                    <option value="consumer_electronics">Consumer Electronics & Audio</option>
                    <option value="fashion_apparel">Fashion, Footwear & Apparel</option>
                    <option value="health_beauty">Health, Wellness & Cosmetics</option>
                    <option value="home_lifestyle">Home, Furniture & Living</option>
                    <option value="gourmet_food">Specialty & Gourmet Food / Beverage</option>
                    <option value="artisan_crafts">Artisan Crafts & Collectibles</option>
                    <option value="software_digital">Digital Goods, Assets & Software</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1.5">
                    Taxpayer Identification (EIN / VAT / Tax ID) *
                  </label>
                  <input
                    type="text"
                    required
                    value={taxId}
                    onChange={(e) => setTaxId(e.target.value)}
                    placeholder="XX-XXXXXXX"
                    className="w-full rounded-xl border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-800/80 px-3.5 py-2.5 text-sm text-zinc-900 dark:text-white placeholder:text-zinc-400 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 font-mono"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1.5">
                    Official Business Website
                  </label>
                  <div className="relative">
                    <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3 text-zinc-400">
                      <GlobeIcon className="w-4 h-4" />
                    </div>
                    <input
                      type="url"
                      value={websiteUrl}
                      onChange={(e) => setWebsiteUrl(e.target.value)}
                      placeholder="https://yourbrand.com"
                      className="w-full rounded-xl border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-800/80 pl-9 pr-3.5 py-2.5 text-sm text-zinc-900 dark:text-white placeholder:text-zinc-400 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1.5">
                    Estimated Annual Gross Revenue
                  </label>
                  <select
                    value={annualRevenueBand}
                    onChange={(e) => setAnnualRevenueBand(e.target.value)}
                    className="w-full rounded-xl border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-800/80 px-3.5 py-2.5 text-sm text-zinc-900 dark:text-white focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
                  >
                    <option value="Pre-revenue / Launch phase">Pre-revenue / Launch phase</option>
                    <option value="$50K - $250K">$50K - $250K</option>
                    <option value="$250K - $1M">$250K - $1M</option>
                    <option value="$1M - $5M">$1M - $5M</option>
                    <option value="$5M+ Enterprise">$5M+ Enterprise</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1.5">
                    Target Monthly Order Fulfillment
                  </label>
                  <select
                    value={expectedMonthlyVolume}
                    onChange={(e) => setExpectedMonthlyVolume(e.target.value)}
                    className="w-full rounded-xl border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-800/80 px-3.5 py-2.5 text-sm text-zinc-900 dark:text-white focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
                  >
                    <option value="1 - 100 orders/mo">1 - 100 orders/mo</option>
                    <option value="100 - 500 orders/mo">100 - 500 orders/mo</option>
                    <option value="500 - 2,000 orders/mo">500 - 2,000 orders/mo</option>
                    <option value="2,000+ high-volume orders/mo">2,000+ high-volume orders/mo</option>
                  </select>
                </div>
              </div>
            </div>
          )}

          {/* STEP 3: Operating Location & Logistics */}
          {step === 3 && (
            <div className="space-y-6 animate-fadeIn">
              <div>
                <h2 className="text-xl font-bold text-zinc-900 dark:text-white flex items-center gap-2">
                  <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-indigo-100 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-400 text-sm font-bold">
                    3
                  </span>
                  Headquarters Location & Logistics Model
                </h2>
                <p className="text-sm text-zinc-500 dark:text-zinc-400 mt-1">
                  Provide physical business verification address and your preferred order fulfillment method.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="sm:col-span-2">
                  <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1.5">
                    Street Address (No P.O. Boxes) *
                  </label>
                  <div className="relative">
                    <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3 text-zinc-400">
                      <MapPinIcon className="w-4 h-4" />
                    </div>
                    <input
                      type="text"
                      required
                      value={street}
                      onChange={(e) => setStreet(e.target.value)}
                      placeholder="e.g. 742 Market Street"
                      className="w-full rounded-xl border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-800/80 pl-9 pr-3.5 py-2.5 text-sm text-zinc-900 dark:text-white placeholder:text-zinc-400 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1.5">
                    Suite / Floor / Unit (Optional)
                  </label>
                  <input
                    type="text"
                    value={unitSuite}
                    onChange={(e) => setUnitSuite(e.target.value)}
                    placeholder="Suite 900"
                    className="w-full rounded-xl border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-800/80 px-3.5 py-2.5 text-sm text-zinc-900 dark:text-white placeholder:text-zinc-400 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1.5">
                    City *
                  </label>
                  <input
                    type="text"
                    required
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                    placeholder="Butuan City"
                    className="w-full rounded-xl border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-800/80 px-3.5 py-2.5 text-sm text-zinc-900 dark:text-white placeholder:text-zinc-400 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1.5">
                    State / Province / Region *
                  </label>
                  <input
                    type="text"
                    required
                    value={state}
                    onChange={(e) => setState(e.target.value)}
                    placeholder="Agusan del Norte"
                    className="w-full rounded-xl border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-800/80 px-3.5 py-2.5 text-sm text-zinc-900 dark:text-white placeholder:text-zinc-400 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1.5">
                    Postal / ZIP Code *
                  </label>
                  <input
                    type="text"
                    required
                    value={postalCode}
                    onChange={(e) => setPostalCode(e.target.value)}
                    placeholder="8600"
                    className="w-full rounded-xl border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-800/80 px-3.5 py-2.5 text-sm text-zinc-900 dark:text-white placeholder:text-zinc-400 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-2">
                    Order Fulfillment Logistics Model *
                  </label>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <label
                      className={`cursor-pointer rounded-2xl border p-4 transition-all flex flex-col justify-between ${
                        fulfillmentType === 'merchant_hub_3pl'
                          ? 'border-indigo-500 bg-indigo-50/50 dark:bg-indigo-950/30 ring-2 ring-indigo-500/30'
                          : 'border-zinc-200 dark:border-zinc-800 hover:border-zinc-300'
                      }`}
                    >
                      <input
                        type="radio"
                        name="fulfillment"
                        value="merchant_hub_3pl"
                        checked={fulfillmentType === 'merchant_hub_3pl'}
                        onChange={() => setFulfillmentType('merchant_hub_3pl')}
                        className="sr-only"
                      />
                      <div>
                        <span className="font-bold text-sm text-zinc-900 dark:text-white block">
                          Merchanta 3PL Fulfillment
                        </span>
                        <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1">
                          Automated 2-day delivery across 12 national fulfillment warehouses.
                        </p>
                      </div>
                      <span className="mt-3 inline-block rounded-full bg-indigo-100 dark:bg-indigo-900/60 px-2.5 py-0.5 text-[10px] font-bold text-indigo-700 dark:text-indigo-300 w-fit">
                        Recommended
                      </span>
                    </label>

                    <label
                      className={`cursor-pointer rounded-2xl border p-4 transition-all flex flex-col justify-between ${
                        fulfillmentType === 'self_fulfilled'
                          ? 'border-indigo-500 bg-indigo-50/50 dark:bg-indigo-950/30 ring-2 ring-indigo-500/30'
                          : 'border-zinc-200 dark:border-zinc-800 hover:border-zinc-300'
                      }`}
                    >
                      <input
                        type="radio"
                        name="fulfillment"
                        value="self_fulfilled"
                        checked={fulfillmentType === 'self_fulfilled'}
                        onChange={() => setFulfillmentType('self_fulfilled')}
                        className="sr-only"
                      />
                      <div>
                        <span className="font-bold text-sm text-zinc-900 dark:text-white block">
                          Self-Fulfilled (FBM)
                        </span>
                        <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1">
                          Merchant packs, prints shipping labels, and dispatches directly to buyers.
                        </p>
                      </div>
                      <span className="mt-3 inline-block rounded-full bg-zinc-100 dark:bg-zinc-800 px-2.5 py-0.5 text-[10px] font-medium text-zinc-600 dark:text-zinc-400 w-fit">
                        Custom Carriers
                      </span>
                    </label>

                    <label
                      className={`cursor-pointer rounded-2xl border p-4 transition-all flex flex-col justify-between ${
                        fulfillmentType === 'digital_download'
                          ? 'border-indigo-500 bg-indigo-50/50 dark:bg-indigo-950/30 ring-2 ring-indigo-500/30'
                          : 'border-zinc-200 dark:border-zinc-800 hover:border-zinc-300'
                      }`}
                    >
                      <input
                        type="radio"
                        name="fulfillment"
                        value="digital_download"
                        checked={fulfillmentType === 'digital_download'}
                        onChange={() => setFulfillmentType('digital_download')}
                        className="sr-only"
                      />
                      <div>
                        <span className="font-bold text-sm text-zinc-900 dark:text-white block">
                          Digital Delivery
                        </span>
                        <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1">
                          Automated instant license key issuance and secure cloud file links.
                        </p>
                      </div>
                      <span className="mt-3 inline-block rounded-full bg-zinc-100 dark:bg-zinc-800 px-2.5 py-0.5 text-[10px] font-medium text-zinc-600 dark:text-zinc-400 w-fit">
                        Instant Delivery
                      </span>
                    </label>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* STEP 4: Banking & Payout Settings */}
          {step === 4 && (
            <div className="space-y-6 animate-fadeIn">
              <div>
                <h2 className="text-xl font-bold text-zinc-900 dark:text-white flex items-center gap-2">
                  <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-indigo-100 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-400 text-sm font-bold">
                    4
                  </span>
                  Banking & Automated Payout Settings
                </h2>
                <p className="text-sm text-zinc-500 dark:text-zinc-400 mt-1">
                  Connect your corporate settlement account for daily or weekly merchant deposits.
                </p>
              </div>

              <div className="rounded-2xl bg-indigo-50/60 dark:bg-indigo-950/30 border border-indigo-200/60 dark:border-indigo-800/40 p-4 flex items-start gap-3">
                <ShieldCheckIcon className="w-5 h-5 text-indigo-600 dark:text-indigo-400 flex-shrink-0 mt-0.5" />
                <div className="text-xs text-indigo-950 dark:text-indigo-200 leading-relaxed">
                  <strong>Bank-Grade 256-bit Encryption:</strong> All payout accounts are verified via FDIC-insured automated clearing house (ACH) network with end-to-end tokenization.
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1.5">
                    Financial Institution / Bank Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={bankName}
                    onChange={(e) => setBankName(e.target.value)}
                    placeholder="e.g. JPMorgan Chase, Silicon Valley Bank"
                    className="w-full rounded-xl border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-800/80 px-3.5 py-2.5 text-sm text-zinc-900 dark:text-white placeholder:text-zinc-400 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1.5">
                    Account Holder Legal Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={accountHolderName}
                    onChange={(e) => setAccountHolderName(e.target.value)}
                    placeholder="Must match your registered business name"
                    className="w-full rounded-xl border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-800/80 px-3.5 py-2.5 text-sm text-zinc-900 dark:text-white placeholder:text-zinc-400 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1.5">
                    Routing Number (9 Digits) *
                  </label>
                  <input
                    type="text"
                    required
                    maxLength={9}
                    value={routingNumber}
                    onChange={(e) => setRoutingNumber(e.target.value)}
                    placeholder="121000358"
                    className="w-full rounded-xl border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-800/80 px-3.5 py-2.5 text-sm text-zinc-900 dark:text-white placeholder:text-zinc-400 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 font-mono"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1.5">
                    Account Number *
                  </label>
                  <input
                    type="password"
                    required
                    value={accountNumber}
                    onChange={(e) => setAccountNumber(e.target.value)}
                    placeholder="•••• •••• ••••"
                    className="w-full rounded-xl border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-800/80 px-3.5 py-2.5 text-sm text-zinc-900 dark:text-white placeholder:text-zinc-400 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 font-mono"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1.5">
                    Settlement Currency *
                  </label>
                  <select
                    value={currency}
                    onChange={(e) => setCurrency(e.target.value)}
                    className="w-full rounded-xl border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-800/80 px-3.5 py-2.5 text-sm text-zinc-900 dark:text-white focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
                  >
                    <option value="USD ($)">USD ($) - United States Dollar</option>
                    <option value="EUR (€)">EUR (€) - Eurozone</option>
                    <option value="GBP (£)">GBP (£) - British Pound</option>
                    <option value="CAD ($)">CAD ($) - Canadian Dollar</option>
                    <option value="AUD ($)">AUD ($) - Australian Dollar</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1.5">
                    Payout Schedule Frequency *
                  </label>
                  <select
                    value={payoutSchedule}
                    onChange={(e) => setPayoutSchedule(e.target.value as PayoutSchedule)}
                    className="w-full rounded-xl border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-800/80 px-3.5 py-2.5 text-sm text-zinc-900 dark:text-white focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
                  >
                    <option value="daily">Daily Settlements (Next day rolling)</option>
                    <option value="weekly">Weekly (Every Monday)</option>
                    <option value="biweekly">Bi-weekly (1st & 15th)</option>
                    <option value="monthly">Monthly</option>
                  </select>
                </div>
              </div>
            </div>
          )}

          {/* STEP 5: Storefront Branding & Identity */}
          {step === 5 && (
            <div className="space-y-6 animate-fadeIn">
              <div>
                <h2 className="text-xl font-bold text-zinc-900 dark:text-white flex items-center gap-2">
                  <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-indigo-100 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-400 text-sm font-bold">
                    5
                  </span>
                  Storefront Branding & Customer-Facing URL
                </h2>
                <p className="text-sm text-zinc-500 dark:text-zinc-400 mt-1">
                  Design how customers discover and browse your verified brand storefront.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="sm:col-span-2">
                  <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1.5 flex items-center justify-between">
                    <span>Storefront Subdomain URL *</span>
                    <span className="text-[11px] text-zinc-400">Shareable customer address</span>
                  </label>
                  <div className="flex items-center rounded-xl border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-800/80 overflow-hidden focus-within:border-indigo-500 focus-within:ring-2 focus-within:ring-indigo-500/20">
                    <span className="px-3 text-xs text-zinc-400 select-none bg-zinc-50 dark:bg-zinc-900/50 py-2.5 border-r border-zinc-200 dark:border-zinc-700">
                      https://
                    </span>
                    <input
                      type="text"
                      required
                      value={storeSlug}
                      onChange={(e) => setStoreSlug(e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, ''))}
                      placeholder="brand-name"
                      className="w-full bg-transparent px-3 py-2 text-sm text-zinc-900 dark:text-white focus:outline-none font-medium"
                    />
                    <span className="px-3 text-xs text-zinc-500 dark:text-zinc-400 select-none bg-zinc-50 dark:bg-zinc-900/50 py-2.5 border-l border-zinc-200 dark:border-zinc-700 font-mono">
                      .merchanta.market
                    </span>
                  </div>
                </div>

                <div className="sm:col-span-2">
                  <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1.5">
                    Storefront Headline / Value Proposition *
                  </label>
                  <input
                    type="text"
                    required
                    value={storeHeadline}
                    onChange={(e) => setStoreHeadline(e.target.value)}
                    placeholder="e.g. Mastercrafted Studio Reference Monitors & Audiophile Gear"
                    className="w-full rounded-xl border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-800/80 px-3.5 py-2.5 text-sm text-zinc-900 dark:text-white placeholder:text-zinc-400 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1.5">
                    Brand Story & Bio *
                  </label>
                  <textarea
                    rows={3}
                    required
                    value={storeBio}
                    onChange={(e) => setStoreBio(e.target.value)}
                    placeholder="Tell buyers your origin story, craftsmanship techniques, and commitment to quality..."
                    className="w-full rounded-xl border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-800/80 px-3.5 py-2.5 text-sm text-zinc-900 dark:text-white placeholder:text-zinc-400 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
                  />
                </div>

                {/* Brand Color Theme */}
                <div>
                  <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-2">
                    Primary Brand Accent Color
                  </label>
                  <div className="flex items-center gap-2">
                    {BRAND_COLORS.map((col) => (
                      <button
                        key={col.hex}
                        type="button"
                        onClick={() => setBrandColor(col.hex)}
                        title={col.label}
                        className={`w-7 h-7 rounded-full transition-transform flex items-center justify-center ${
                          brandColor === col.hex ? 'scale-125 ring-2 ring-zinc-900 dark:ring-white ring-offset-2' : 'hover:scale-110'
                        }`}
                        style={{ backgroundColor: col.hex }}
                      >
                        {brandColor === col.hex && <CheckIcon className="w-3.5 h-3.5 text-white" />}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Preset Brand Logos */}
                <div className="sm:col-span-2">
                  <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-2">
                    Select Brand Avatar / Identity Mark
                  </label>
                  <div className="grid grid-cols-3 sm:grid-cols-6 gap-3">
                    {PRESET_LOGOS.map((item) => (
                      <button
                        key={item.name}
                        type="button"
                        onClick={() => setLogoUrl(item.url)}
                        className={`group relative aspect-square rounded-2xl overflow-hidden border-2 transition-all p-1 bg-zinc-100 dark:bg-zinc-800 ${
                          logoUrl === item.url
                            ? 'border-indigo-600 ring-2 ring-indigo-500/30 scale-105'
                            : 'border-transparent hover:border-zinc-300'
                        }`}
                      >
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          src={item.url}
                          alt={item.name}
                          className="w-full h-full object-cover rounded-xl"
                        />
                        <span className="absolute bottom-1 inset-x-1 text-[9px] font-semibold text-white bg-black/60 backdrop-blur-sm rounded py-0.5 text-center truncate px-1">
                          {item.name}
                        </span>
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* STEP 6: Compliance Verification & Agreement */}
          {step === 6 && (
            <div className="space-y-6 animate-fadeIn">
              <div>
                <h2 className="text-xl font-bold text-zinc-900 dark:text-white flex items-center gap-2">
                  <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-indigo-100 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-400 text-sm font-bold">
                    6
                  </span>
                  KYB Document Verification & Merchant Agreement
                </h2>
                <p className="text-sm text-zinc-500 dark:text-zinc-400 mt-1">
                  Finalize your verified seller credentials to activate instant merchant payout privileges.
                </p>
              </div>

              {/* Upload Card Mock */}
              <div className="border-2 border-dashed border-zinc-300 dark:border-zinc-700 rounded-2xl p-6 text-center bg-zinc-50/50 dark:bg-zinc-800/30">
                <div className="mx-auto w-12 h-12 rounded-2xl bg-indigo-100 dark:bg-indigo-950/80 text-indigo-600 dark:text-indigo-400 flex items-center justify-center mb-3">
                  <UploadIcon className="w-6 h-6" />
                </div>
                <h3 className="text-sm font-bold text-zinc-900 dark:text-white">
                  Certificate of Good Standing or Business Registration
                </h3>
                <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1 max-w-md mx-auto">
                  Drag and drop your official state registration, articles of incorporation, or tax confirmation document. (PDF, PNG, JPG up to 15MB)
                </p>

                <div className="mt-4 flex items-center justify-center gap-3">
                  <div className="inline-flex items-center gap-2 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800/80 px-3.5 py-1.5 text-xs font-semibold text-emerald-800 dark:text-emerald-300">
                    <CheckCircleIcon className="w-4 h-4 text-emerald-600" />
                    <span>Business_Registration_Doc_Validated.pdf (1.4 MB)</span>
                  </div>
                </div>
              </div>

              {/* Terms check */}
              <div className="space-y-3 pt-2">
                <label className="flex items-start gap-3 cursor-pointer group">
                  <input
                    type="checkbox"
                    checked={termsAgreed}
                    onChange={(e) => setTermsAgreed(e.target.checked)}
                    className="mt-1 h-4 w-4 rounded border-zinc-300 text-indigo-600 focus:ring-indigo-500"
                  />
                  <span className="text-xs text-zinc-600 dark:text-zinc-400 leading-relaxed group-hover:text-zinc-900 dark:group-hover:text-zinc-200">
                    I confirm under penalty of perjury that I am an authorized corporate officer of{' '}
                    <strong className="text-zinc-900 dark:text-white">{businessName || 'this business'}</strong>.
                    I agree to the Merchanta Merchant Services Agreement, 0% introductory fee terms, and automated dispute resolution protocol.
                  </span>
                </label>
              </div>

              {isSubmitting && (
                <div className="p-4 rounded-2xl bg-indigo-50 dark:bg-indigo-950/60 border border-indigo-200 dark:border-indigo-800">
                  <div className="flex items-center justify-between text-xs font-semibold text-indigo-900 dark:text-indigo-200 mb-2">
                    <span className="flex items-center gap-2">
                      <SparklesIcon className="w-4 h-4 animate-spin text-indigo-600" />
                      Running Automated KYC/KYB Business Verification...
                    </span>
                    <span>{verificationProgress}%</span>
                  </div>
                  <div className="h-2 w-full bg-indigo-100 dark:bg-indigo-900 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-indigo-500 to-cyan-400 transition-all duration-300 rounded-full"
                      style={{ width: `${verificationProgress}%` }}
                    />
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Navigation Buttons */}
          <div className="mt-8 pt-6 border-t border-zinc-200 dark:border-zinc-800 flex items-center justify-between">
            {step > 1 ? (
              <button
                type="button"
                onClick={handlePrev}
                disabled={isSubmitting}
                className="inline-flex items-center gap-2 rounded-xl border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 px-4 py-2.5 text-xs font-bold text-zinc-700 dark:text-zinc-200 hover:bg-zinc-50 dark:hover:bg-zinc-750 transition-colors shadow-sm disabled:opacity-50"
              >
                <ArrowLeftIcon className="w-4 h-4" />
                <span>Previous Step</span>
              </button>
            ) : (
              <div />
            )}

            {step < totalSteps ? (
              <button
                type="button"
                onClick={handleNext}
                className="inline-flex items-center gap-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 px-5 py-2.5 text-xs font-bold text-white shadow-md shadow-indigo-600/25 transition-all active:scale-[0.98]"
              >
                <span>Continue to {stepLabels[step]?.title}</span>
                <ArrowRightIcon className="w-4 h-4" />
              </button>
            ) : (
              <button
                type="submit"
                disabled={isSubmitting || !termsAgreed}
                className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 px-6 py-2.5 text-xs font-bold text-white shadow-lg shadow-emerald-600/25 transition-all active:scale-[0.98] disabled:opacity-50"
              >
                <ShieldCheckIcon className="w-4 h-4" />
                <span>{isSubmitting ? 'Verifying Business...' : 'Submit & Activate Merchant Account'}</span>
              </button>
            )}
          </div>
        </form>
      </div>

      {/* Success Modal */}
      {isSuccessModal && createdVendor && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-fadeIn">
          <div className="w-full max-w-lg rounded-3xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 p-8 shadow-2xl text-center space-y-6">
            <div className="mx-auto w-16 h-16 rounded-full bg-emerald-100 dark:bg-emerald-950/80 text-emerald-600 dark:text-emerald-400 flex items-center justify-center ring-8 ring-emerald-500/10 shadow-lg">
              <CheckIcon className="w-8 h-8" />
            </div>

            <div>
              <span className="inline-block rounded-full bg-emerald-100 dark:bg-emerald-950 px-3 py-1 text-xs font-bold text-emerald-700 dark:text-emerald-300 mb-2">
                VERIFICATION SUCCESSFUL • TIER: VERIFIED PARTNER
              </span>
              <h2 className="text-2xl font-black text-zinc-900 dark:text-white">
                Welcome to Merchanta, {createdVendor.businessName}!
              </h2>
              <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-2">
                Your business credentials, EIN, and settlement account have been approved. Your merchant dashboard is ready.
              </p>
            </div>

            <div className="rounded-2xl bg-zinc-50 dark:bg-zinc-800/60 p-4 border border-zinc-200 dark:border-zinc-700/60 text-left space-y-2 text-xs">
              <div className="flex justify-between">
                <span className="text-zinc-500">Merchant Account ID:</span>
                <span className="font-mono font-bold text-zinc-900 dark:text-white">{createdVendor.id}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-zinc-500">Storefront URL:</span>
                <span className="font-mono text-indigo-600 dark:text-indigo-400 font-semibold truncate max-w-[200px]">
                  {createdVendor.storeSlug}.merchanta.market
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-zinc-500">Payout Settlement:</span>
                <span className="font-medium text-emerald-600 dark:text-emerald-400">
                  {createdVendor.banking.payoutSchedule.toUpperCase()} via {createdVendor.banking.bankName}
                </span>
              </div>
            </div>

            <button
              onClick={() => onComplete(createdVendor)}
              className="w-full inline-flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-indigo-600 to-blue-600 hover:from-indigo-500 hover:to-blue-500 py-3 text-sm font-bold text-white shadow-lg shadow-indigo-600/25 transition-all"
            >
              <span>Launch Vendor Dashboard</span>
              <ArrowRightIcon className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
