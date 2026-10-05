'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Navbar } from '../../components/Navbar';
import { VendorRegistrationForm } from '../../components/VendorRegistrationForm';
import { SignInModal } from '../../components/SignInModal';
import {
  getStoredVendors,
  getCurrentVendorSession,
  setCurrentVendorSession,
  registerNewVendor,
  syncVendorsWithServer,
} from '../../lib/vendorStorage';
import { VendorAccount } from '../../types/vendor';

export default function RegisterPage() {
  const router = useRouter();
  const [vendors, setVendors] = useState<VendorAccount[]>([]);
  const [currentVendor, setCurrentVendor] = useState<VendorAccount | null>(null);
  const [isSignInOpen, setIsSignInOpen] = useState(false);
  const [isClientReady, setIsClientReady] = useState(false);

  useEffect(() => {
    const init = async () => {
      const synced = await syncVendorsWithServer();
      const session = getCurrentVendorSession();
      setVendors(synced);
      setCurrentVendor(session);
      setIsClientReady(true);
    };
    init();
  }, []);

  const handleRegisterComplete = (newVendor: VendorAccount) => {
    registerNewVendor(newVendor);
    router.push('/');
  };

  const handleSelectVendor = (vendor: VendorAccount) => {
    setCurrentVendorSession(vendor);
    setCurrentVendor(vendor);
    setIsSignInOpen(false);
    router.push('/');
  };

  const handleLogout = () => {
    setCurrentVendorSession(null);
    setCurrentVendor(null);
  };

  if (!isClientReady) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white dark:bg-zinc-950">
        <div className="w-8 h-8 rounded-full border-2 border-indigo-600 border-t-transparent animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-white dark:bg-zinc-950 text-zinc-900 dark:text-zinc-100 transition-colors">
      <Navbar
        currentVendor={currentVendor}
        onOpenRegister={() => {}}
        onOpenSignIn={() => setIsSignInOpen(true)}
        onLogout={handleLogout}
        activeView="register"
        setActiveView={(view) => {
          if (view === 'landing' || view === 'dashboard') {
            router.push('/');
          }
        }}
      />

      <main className="flex-1">
        <VendorRegistrationForm
          onComplete={handleRegisterComplete}
          onCancel={() => router.push('/')}
        />
      </main>

      {/* Footer */}
      <footer className="border-t border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900/50 py-10 px-4 sm:px-6 lg:px-8 text-xs text-zinc-500 transition-colors">
        <div className="mx-auto max-w-7xl flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <span className="font-extrabold text-zinc-900 dark:text-zinc-100">Merchanta Partner Portal</span>
            <span>•</span>
            <span>Vendor Registration System</span>
          </div>

          <div className="flex items-center gap-6">
            <button
              onClick={() => router.push('/')}
              className="hover:text-zinc-900 dark:hover:text-zinc-200 cursor-pointer"
            >
              Overview
            </button>
            <button
              onClick={() => setIsSignInOpen(true)}
              className="hover:text-zinc-900 dark:hover:text-zinc-200 cursor-pointer"
            >
              Merchant Sign In
            </button>
            <span className="text-[11px] text-emerald-600 dark:text-emerald-400 font-semibold">
              ● All Systems Operational
            </span>
          </div>
        </div>
      </footer>

      {isSignInOpen && (
        <SignInModal
          vendors={vendors}
          onSelectVendor={handleSelectVendor}
          onClose={() => setIsSignInOpen(false)}
          onGoToRegister={() => setIsSignInOpen(false)}
        />
      )}
    </div>
  );
}
