'use client';

import React, { useState } from 'react';
import { MailIcon, LockIcon, StoreIcon, ArrowRightIcon, CloseIcon, ShieldCheckIcon } from './Icons';
import { VendorAccount } from '../types/vendor';

interface SignInModalProps {
  vendors: VendorAccount[];
  onSelectVendor: (vendor: VendorAccount) => void;
  onClose: () => void;
  onGoToRegister: () => void;
}

export function SignInModal({ vendors, onSelectVendor, onClose, onGoToRegister }: SignInModalProps) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleManualLogin = (e: React.FormEvent) => {
    e.preventDefault();
    const found = vendors.find((v) => v.workEmail.toLowerCase() === email.trim().toLowerCase());
    if (found) {
      onSelectVendor(found);
    } else {
      setError('No registered vendor account found with this email. You can register a new business or select a demo account below.');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fadeIn">
      <div className="w-full max-w-md rounded-3xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 p-6 sm:p-8 shadow-2xl relative">
        <button
          onClick={onClose}
          className="absolute top-5 right-5 p-1.5 rounded-xl text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
        >
          <CloseIcon className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-3 mb-5">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-600 to-blue-600 flex items-center justify-center text-white shadow-md shadow-indigo-600/20">
            <StoreIcon className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-lg font-extrabold text-zinc-900 dark:text-white">
              Vendor Portal Sign In
            </h2>
            <p className="text-xs text-zinc-500 dark:text-zinc-400">
              Access your merchant dashboard and orders
            </p>
          </div>
        </div>

        {error && (
          <div className="mb-4 rounded-xl bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-800 p-3 text-xs text-red-600 dark:text-red-400">
            {error}
          </div>
        )}

        <form onSubmit={handleManualLogin} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1.5">
              Corporate Email
            </label>
            <div className="relative">
              <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3 text-zinc-400">
                <MailIcon className="w-4 h-4" />
              </div>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value);
                  setError('');
                }}
                placeholder="merchant@yourbrand.com"
                className="w-full rounded-xl border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-800/80 pl-9 pr-3.5 py-2.5 text-xs text-zinc-900 dark:text-white placeholder:text-zinc-400 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1.5">
              Password
            </label>
            <div className="relative">
              <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3 text-zinc-400">
                <LockIcon className="w-4 h-4" />
              </div>
              <input
                type="password"
                required
                value={password}
                onChange={(e) => {
                  setPassword(e.target.value);
                  setError('');
                }}
                placeholder="••••••••••••"
                className="w-full rounded-xl border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-800/80 pl-9 pr-3.5 py-2.5 text-xs text-zinc-900 dark:text-white placeholder:text-zinc-400 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
              />
            </div>
          </div>

          <button
            type="submit"
            className="w-full inline-flex items-center justify-center gap-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 py-2.5 text-xs font-bold text-white shadow-md shadow-indigo-600/20 transition-all active:scale-[0.98]"
          >
            <span>Sign In to Dashboard</span>
            <ArrowRightIcon className="w-4 h-4" />
          </button>
        </form>

        <div className="relative my-6">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-zinc-200 dark:border-zinc-800" />
          </div>
          <div className="relative flex justify-center text-[10px] uppercase font-bold tracking-wider">
            <span className="bg-white dark:bg-zinc-900 px-2 text-zinc-400">
              Or 1-Click Demo Merchant Access
            </span>
          </div>
        </div>

        {/* Demo Accounts List */}
        <div className="space-y-2">
          {vendors.slice(0, 3).map((v) => (
            <button
              key={v.id}
              onClick={() => onSelectVendor(v)}
              className="w-full flex items-center justify-between p-2.5 rounded-xl border border-zinc-200 dark:border-zinc-800 hover:border-indigo-400 dark:hover:border-indigo-600 hover:bg-indigo-50/40 dark:hover:bg-indigo-950/20 text-left transition-all group"
            >
              <div className="flex items-center gap-2.5 truncate">
                <div
                  className="w-7 h-7 rounded-lg flex items-center justify-center text-[11px] font-bold text-white flex-shrink-0"
                  style={{ backgroundColor: v.brandColor || '#6366f1' }}
                >
                  {v.businessName.substring(0, 2).toUpperCase()}
                </div>
                <div className="truncate">
                  <div className="flex items-center gap-1.5">
                    <span className="text-xs font-bold text-zinc-900 dark:text-zinc-100 truncate">
                      {v.businessName}
                    </span>
                    <ShieldCheckIcon className="w-3.5 h-3.5 text-emerald-500 inline flex-shrink-0" />
                  </div>
                  <span className="text-[10px] text-zinc-500 dark:text-zinc-400 block truncate">
                    {v.workEmail}
                  </span>
                </div>
              </div>
              <span className="text-[11px] font-semibold text-indigo-600 dark:text-indigo-400 group-hover:translate-x-0.5 transition-transform flex items-center gap-1 flex-shrink-0">
                Log In <ArrowRightIcon className="w-3 h-3" />
              </span>
            </button>
          ))}
        </div>

        <div className="mt-5 text-center pt-4 border-t border-zinc-100 dark:border-zinc-800">
          <p className="text-xs text-zinc-500 dark:text-zinc-400">
            Don&apos;t have a vendor account yet?{' '}
            <button
              onClick={() => {
                onClose();
                onGoToRegister();
              }}
              className="font-bold text-indigo-600 dark:text-indigo-400 hover:underline"
            >
              Register your business
            </button>
          </p>
        </div>
      </div>
    </div>
  );
}
