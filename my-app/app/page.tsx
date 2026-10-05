'use client';

import React, { useState, useEffect } from 'react';
import { Navbar } from '../components/Navbar';
import { LandingPage } from '../components/LandingPage';
import { VendorRegistrationForm } from '../components/VendorRegistrationForm';
import { RegistrationWizard } from '../components/RegistrationWizard';
import { VendorDashboard } from '../components/VendorDashboard';
import { SignInModal } from '../components/SignInModal';
import {
  getStoredVendors,
  getCurrentVendorSession,
  setCurrentVendorSession,
  registerNewVendor,
  updateVendorProfile,
  syncVendorsWithServer,
} from '../lib/vendorStorage';
import { VendorAccount } from '../types/vendor';

export default function Home() {
  const [vendors, setVendors] = useState<VendorAccount[]>([]);
  const [currentVendor, setCurrentVendor] = useState<VendorAccount | null>(null);
  const [activeView, setActiveView] = useState<'landing' | 'register' | 'dashboard'>('landing');
  const [registerMode, setRegisterMode] = useState<'system_form' | 'wizard'>('system_form');
  const [isSignInOpen, setIsSignInOpen] = useState<boolean>(false);
  const [isClientReady, setIsClientReady] = useState(false);

  useEffect(() => {
    const init = async () => {
      const synced = await syncVendorsWithServer();
      const session = getCurrentVendorSession();
      setVendors(synced);
      if (session) {
        setCurrentVendor(session);
        setActiveView('dashboard');
      }
      setIsClientReady(true);
    };
    init();
  }, []);

  const handleRegisterComplete = (newVendor: VendorAccount) => {
    const registered = registerNewVendor(newVendor);
    setVendors(getStoredVendors());
    setCurrentVendor(registered);
    setActiveView('dashboard');
  };

  const handleSelectVendor = (vendor: VendorAccount) => {
    setCurrentVendorSession(vendor);
    setCurrentVendor(vendor);
    setIsSignInOpen(false);
    setActiveView('dashboard');
  };

  const handleLogout = () => {
    setCurrentVendorSession(null);
    setCurrentVendor(null);
    setActiveView('landing');
  };

  const handleUpdateVendor = (updated: VendorAccount) => {
    updateVendorProfile(updated);
    setCurrentVendor(updated);
    setVendors(getStoredVendors());
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
        onOpenRegister={() => setActiveView('register')}
        onOpenSignIn={() => setIsSignInOpen(true)}
        onLogout={handleLogout}
        activeView={activeView}
        setActiveView={setActiveView}
      />

      <main className="flex-1">
        {activeView === 'landing' && (
          <LandingPage
            onRegisterClick={() => setActiveView('register')}
            onSignInClick={() => setIsSignInOpen(true)}
            onExploreDemo={(demoVendor) => handleSelectVendor(demoVendor)}
            demoVendors={vendors}
          />
        )}

        {activeView === 'register' && (
          <div>
            {/* View Switcher between Clean Registration System Form and Multi-Step Wizard */}
            <div className="bg-zinc-100/80 dark:bg-zinc-900/80 border-b border-zinc-200/80 dark:border-zinc-800/80 py-2.5 px-4">
              <div className="max-w-3xl mx-auto flex items-center justify-between gap-4">
                <span className="text-xs font-semibold text-zinc-600 dark:text-zinc-400">
                  Registration View:
                </span>
                <div className="inline-flex rounded-xl p-1 bg-zinc-200/70 dark:bg-zinc-800 border border-zinc-300/60 dark:border-zinc-700/60">
                  <button
                    type="button"
                    onClick={() => setRegisterMode('system_form')}
                    className={`px-3 py-1 text-xs font-bold rounded-lg transition-all cursor-pointer ${
                      registerMode === 'system_form'
                        ? 'bg-white dark:bg-zinc-900 text-indigo-600 dark:text-indigo-400 shadow-sm'
                        : 'text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-200'
                    }`}
                  >
                    Vendor Registration System (Clean Form)
                  </button>
                  <button
                    type="button"
                    onClick={() => setRegisterMode('wizard')}
                    className={`px-3 py-1 text-xs font-bold rounded-lg transition-all cursor-pointer ${
                      registerMode === 'wizard'
                        ? 'bg-white dark:bg-zinc-900 text-indigo-600 dark:text-indigo-400 shadow-sm'
                        : 'text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-200'
                    }`}
                  >
                    6-Step Onboarding Wizard
                  </button>
                </div>
              </div>
            </div>

            {registerMode === 'system_form' ? (
              <VendorRegistrationForm
                onComplete={handleRegisterComplete}
                onCancel={() => setActiveView(currentVendor ? 'dashboard' : 'landing')}
              />
            ) : (
              <RegistrationWizard
                onComplete={handleRegisterComplete}
                onCancel={() => setActiveView(currentVendor ? 'dashboard' : 'landing')}
              />
            )}
          </div>
        )}

        {activeView === 'dashboard' && currentVendor && (
          <VendorDashboard
            vendor={currentVendor}
            onUpdateVendor={handleUpdateVendor}
            onSwitchToRegister={() => setActiveView('register')}
          />
        )}
      </main>

      {/* Footer */}
      <footer className="border-t border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900/50 py-10 px-4 sm:px-6 lg:px-8 text-xs text-zinc-500 transition-colors">
        <div className="mx-auto max-w-7xl flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <span className="font-extrabold text-zinc-900 dark:text-zinc-100">Merchanta Partner Portal</span>
            <span>•</span>
            <span>Enterprise & Artisan Merchant Network</span>
          </div>

          <div className="flex items-center gap-6">
            <button
              onClick={() => setActiveView('landing')}
              className="hover:text-zinc-900 dark:hover:text-zinc-200"
            >
              Overview
            </button>
            <button
              onClick={() => setActiveView('register')}
              className="hover:text-zinc-900 dark:hover:text-zinc-200"
            >
              Vendor Registration
            </button>
            <button
              onClick={() => setIsSignInOpen(true)}
              className="hover:text-zinc-900 dark:hover:text-zinc-200"
            >
              Merchant Sign In
            </button>
            <span className="text-[11px] text-emerald-600 dark:text-emerald-400 font-semibold">
              ● All Systems Operational
            </span>
          </div>
        </div>
      </footer>

      {/* Sign In Modal */}
      {isSignInOpen && (
        <SignInModal
          vendors={vendors}
          onSelectVendor={handleSelectVendor}
          onClose={() => setIsSignInOpen(false)}
          onGoToRegister={() => {
            setIsSignInOpen(false);
            setActiveView('register');
          }}
        />
      )}
    </div>
  );
}
