'use client';

import React from 'react';
import { StoreIcon, ShieldCheckIcon, LogOutIcon, PlusIcon, ArrowRightIcon } from './Icons';
import { VendorAccount } from '../types/vendor';

interface NavbarProps {
  currentVendor: VendorAccount | null;
  onOpenRegister: () => void;
  onOpenSignIn: () => void;
  onLogout: () => void;
  activeView: 'dashboard' | 'register' | 'landing';
  setActiveView: (view: 'dashboard' | 'register' | 'landing') => void;
}

export function Navbar({
  currentVendor,
  onOpenRegister,
  onOpenSignIn,
  onLogout,
  activeView,
  setActiveView,
}: NavbarProps) {
  return (
    <header className="sticky top-0 z-40 border-b border-zinc-200/80 bg-white/90 backdrop-blur-md dark:border-zinc-800/80 dark:bg-zinc-950/90 transition-colors">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        {/* Brand Logo */}
        <div className="flex items-center gap-3">
          <button
            onClick={() => setActiveView(currentVendor ? 'dashboard' : 'landing')}
            className="flex items-center gap-2.5 text-left group"
          >
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-tr from-indigo-600 via-blue-600 to-cyan-500 shadow-md shadow-indigo-500/20 text-white font-bold group-hover:scale-105 transition-transform">
              <StoreIcon className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="font-extrabold tracking-tight text-lg text-zinc-900 dark:text-zinc-100">
                  Merchanta
                </span>
                <span className="rounded-full bg-indigo-100 dark:bg-indigo-950/80 px-2 py-0.5 text-[11px] font-semibold text-indigo-700 dark:text-indigo-300">
                  PARTNER
                </span>
              </div>
              <p className="text-[11px] text-zinc-500 dark:text-zinc-400 font-medium -mt-0.5">
                Vendor Hub & Business Onboarding
              </p>
            </div>
          </button>
        </div>

        {/* Center navigation */}
        <nav className="hidden md:flex items-center gap-1 bg-zinc-100 dark:bg-zinc-900 p-1 rounded-xl border border-zinc-200 dark:border-zinc-800">
          <button
            onClick={() => setActiveView('landing')}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              activeView === 'landing'
                ? 'bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 shadow-sm'
                : 'text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-200'
            }`}
          >
            Overview
          </button>

          {currentVendor && (
            <button
              onClick={() => setActiveView('dashboard')}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                activeView === 'dashboard'
                  ? 'bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 shadow-sm'
                  : 'text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-200'
              }`}
            >
              Seller Dashboard
            </button>
          )}

          <button
            onClick={onOpenRegister}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              activeView === 'register'
                ? 'bg-white dark:bg-zinc-800 text-indigo-600 dark:text-indigo-400 shadow-sm'
                : 'text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-200'
            }`}
          >
            Register Business
          </button>
        </nav>

        {/* Right Action buttons */}
        <div className="flex items-center gap-3">
          {currentVendor ? (
            <div className="flex items-center gap-3">
              <div className="hidden sm:flex items-center gap-2.5 pl-3 border-l border-zinc-200 dark:border-zinc-800">
                <div
                  className="w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs text-white shadow-sm ring-2 ring-indigo-500/20"
                  style={{ backgroundColor: currentVendor.brandColor || '#6366f1' }}
                >
                  {currentVendor.businessName.substring(0, 2).toUpperCase()}
                </div>
                <div className="text-left">
                  <div className="flex items-center gap-1.5">
                    <span className="text-xs font-bold text-zinc-900 dark:text-zinc-100 truncate max-w-[140px]">
                      {currentVendor.businessName}
                    </span>
                    <ShieldCheckIcon className="w-3.5 h-3.5 text-emerald-500 inline flex-shrink-0" />
                  </div>
                  <span className="text-[10px] text-zinc-500 dark:text-zinc-400 font-mono">
                    ID: {currentVendor.id}
                  </span>
                </div>
              </div>

              <button
                onClick={() => setActiveView('dashboard')}
                className="hidden lg:inline-flex items-center gap-1.5 rounded-lg bg-zinc-100 hover:bg-zinc-200 dark:bg-zinc-900 dark:hover:bg-zinc-800 px-3 py-1.5 text-xs font-medium text-zinc-800 dark:text-zinc-200 transition-colors"
              >
                Dashboard
              </button>

              <button
                onClick={onLogout}
                title="Sign out of vendor account"
                className="inline-flex items-center gap-1.5 rounded-lg border border-zinc-200 dark:border-zinc-800 px-3 py-1.5 text-xs font-semibold text-zinc-700 dark:text-zinc-300 hover:bg-red-50 hover:text-red-600 hover:border-red-200 dark:hover:bg-red-950/30 dark:hover:text-red-400 transition-all"
              >
                <LogOutIcon className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Sign Out</span>
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <button
                onClick={onOpenSignIn}
                className="rounded-lg px-3.5 py-1.5 text-xs font-semibold text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-900 transition-colors"
              >
                Sign In
              </button>
              <button
                onClick={onOpenRegister}
                className="flex items-center gap-1.5 rounded-lg bg-gradient-to-r from-indigo-600 to-blue-600 px-3.5 py-1.5 text-xs font-semibold text-white shadow-sm shadow-indigo-600/20 hover:from-indigo-500 hover:to-blue-500 transition-all active:scale-[0.98]"
              >
                <PlusIcon className="w-3.5 h-3.5" />
                <span>Register Business</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
