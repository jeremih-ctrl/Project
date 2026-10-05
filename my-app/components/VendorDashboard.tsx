'use client';

import React, { useState } from 'react';
import {
  TrendingUpIcon,
  DollarSignIcon,
  PackageIcon,
  ShoppingBagIcon,
  EyeIcon,
  ShieldCheckIcon,
  CheckCircleIcon,
  PlusIcon,
  SearchIcon,
  ExternalLinkIcon,
  StoreIcon,
  BuildingIcon,
  CreditCardIcon,
  FileTextIcon,
  CloseIcon,
  TrashIcon,
  SparklesIcon,
  CopyIcon,
  CheckIcon,
} from './Icons';
import { VendorAccount, VendorProduct, VendorOrder } from '../types/vendor';

interface VendorDashboardProps {
  vendor: VendorAccount;
  onUpdateVendor: (updated: VendorAccount) => void;
  onSwitchToRegister: () => void;
}

export function VendorDashboard({ vendor, onUpdateVendor, onSwitchToRegister }: VendorDashboardProps) {
  const [activeTab, setActiveTab] = useState<'overview' | 'products' | 'storefront' | 'profile' | 'payouts'>('overview');
  const [timeRange, setTimeRange] = useState<'7d' | '30d'>('7d');

  // Product modal state
  const [isAddProductModal, setIsAddProductModal] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newSku, setNewSku] = useState('');
  const [newCategory, setNewCategory] = useState('Standard Line');
  const [newPrice, setNewPrice] = useState<number>(89.0);
  const [newStock, setNewStock] = useState<number>(25);
  const [newImageUrl, setNewImageUrl] = useState(
    'https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&w=400&q=80'
  );

  // Edit profile state
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [editHeadline, setEditHeadline] = useState(vendor.storeHeadline);
  const [editBio, setEditBio] = useState(vendor.storeBio);
  const [editWebsite, setEditWebsite] = useState(vendor.websiteUrl);

  // Storefront simulated cart / message
  const [storefrontToast, setStorefrontToast] = useState<string | null>(null);

  // Payout action state
  const [payoutSuccessMsg, setPayoutSuccessMsg] = useState<string | null>(null);
  const [copiedLink, setCopiedLink] = useState(false);

  // Copy Store Link helper
  const handleCopyLink = () => {
    navigator.clipboard?.writeText(`https://${vendor.storeSlug}.merchanta.market`);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2000);
  };

  // Add Product Handler
  const handleAddProduct = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle) return;

    const newProd: VendorProduct = {
      id: `prod_${Date.now()}`,
      title: newTitle,
      sku: newSku || `SKU-${Math.floor(1000 + Math.random() * 9000)}`,
      category: newCategory,
      price: Number(newPrice),
      stock: Number(newStock),
      status: 'active',
      imageUrl: newImageUrl,
      salesCount: 0,
    };

    const updated = {
      ...vendor,
      products: [newProd, ...vendor.products],
    };

    onUpdateVendor(updated);
    setIsAddProductModal(false);
    setNewTitle('');
    setNewSku('');
  };

  // Delete Product Handler
  const handleDeleteProduct = (productId: string) => {
    if (confirm('Are you sure you want to remove this product listing?')) {
      const updated = {
        ...vendor,
        products: vendor.products.filter((p) => p.id !== productId),
      };
      onUpdateVendor(updated);
    }
  };

  // Save Profile Changes
  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    const updated: VendorAccount = {
      ...vendor,
      storeHeadline: editHeadline,
      storeBio: editBio,
      websiteUrl: editWebsite,
    };
    onUpdateVendor(updated);
    setIsEditingProfile(false);
  };

  // Instant Payout Request
  const handleRequestPayout = () => {
    if (vendor.metrics.availableBalance <= 0) {
      alert('Your available payout balance is currently $0.00.');
      return;
    }
    const amount = vendor.metrics.availableBalance;
    const updated: VendorAccount = {
      ...vendor,
      metrics: {
        ...vendor.metrics,
        availableBalance: 0,
        pendingPayout: vendor.metrics.pendingPayout + amount,
      },
    };
    onUpdateVendor(updated);
    setPayoutSuccessMsg(`Instant payout transfer of $${amount.toLocaleString(undefined, { minimumFractionDigits: 2 })} initiated to ${vendor.banking.bankName}. Expected in 1-2 business hours.`);
    setTimeout(() => setPayoutSuccessMsg(null), 6000);
  };

  // Sample Revenue Points for Graph
  const chartPoints7d = [
    { day: 'Mon', revenue: 1420, orders: 12 },
    { day: 'Tue', revenue: 2180, orders: 18 },
    { day: 'Wed', revenue: 1890, orders: 14 },
    { day: 'Thu', revenue: 3200, orders: 25 },
    { day: 'Fri', revenue: 4100, orders: 32 },
    { day: 'Sat', revenue: 5400, orders: 41 },
    { day: 'Sun', revenue: 4850, orders: 36 },
  ];

  const chartPoints30d = [
    { day: 'W1', revenue: 18200, orders: 142 },
    { day: 'W2', revenue: 24500, orders: 188 },
    { day: 'W3', revenue: 31000, orders: 230 },
    { day: 'W4', revenue: 38750, orders: 282 },
  ];

  const activePoints = timeRange === '7d' ? chartPoints7d : chartPoints30d;
  const maxRevenue = Math.max(...activePoints.map((p) => p.revenue));

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950 py-8 px-4 sm:px-6 lg:px-8 transition-colors">
      <div className="mx-auto max-w-7xl space-y-6">
        {/* Banner Alert for Instant Payout notification */}
        {payoutSuccessMsg && (
          <div className="rounded-2xl bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800 p-4 flex items-center justify-between shadow-sm animate-fadeIn">
            <div className="flex items-center gap-3">
              <CheckCircleIcon className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
              <span className="text-xs font-semibold text-emerald-900 dark:text-emerald-200">
                {payoutSuccessMsg}
              </span>
            </div>
            <button
              onClick={() => setPayoutSuccessMsg(null)}
              className="text-emerald-700 dark:text-emerald-300 hover:text-emerald-900 p-1"
            >
              <CloseIcon className="w-4 h-4" />
            </button>
          </div>
        )}

        {/* Vendor Top Header Card */}
        <div className="rounded-3xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-6 sm:p-8 shadow-sm">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
            <div className="flex items-start sm:items-center gap-4">
              <div
                className="w-16 h-16 rounded-2xl flex items-center justify-center text-white font-black text-xl shadow-md ring-4 ring-zinc-100 dark:ring-zinc-800 flex-shrink-0"
                style={{ backgroundColor: vendor.brandColor || '#6366f1' }}
              >
                {vendor.businessName.substring(0, 2).toUpperCase()}
              </div>

              <div>
                <div className="flex flex-wrap items-center gap-2">
                  <h1 className="text-2xl sm:text-3xl font-extrabold text-zinc-900 dark:text-white tracking-tight">
                    {vendor.businessName}
                  </h1>
                  <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 dark:bg-emerald-950/70 border border-emerald-200 dark:border-emerald-800 px-3 py-0.5 text-xs font-bold text-emerald-700 dark:text-emerald-300">
                    <ShieldCheckIcon className="w-3.5 h-3.5 text-emerald-500" />
                    <span>{vendor.sellerTier}</span>
                  </span>
                  <span className="rounded-full bg-zinc-100 dark:bg-zinc-800 px-2.5 py-0.5 text-xs font-medium text-zinc-600 dark:text-zinc-400">
                    ID: {vendor.id}
                  </span>
                </div>

                <p className="text-xs sm:text-sm text-zinc-500 dark:text-zinc-400 mt-1 max-w-2xl">
                  {vendor.storeHeadline}
                </p>

                <div className="flex flex-wrap items-center gap-4 mt-3 text-xs text-zinc-500 dark:text-zinc-400">
                  <span className="flex items-center gap-1 font-mono text-indigo-600 dark:text-indigo-400">
                    {vendor.storeSlug}.merchanta.market
                  </span>
                  <span>•</span>
                  <span>Category: <strong className="text-zinc-700 dark:text-zinc-300 capitalize">{vendor.industryCategory.replace('_', ' ')}</strong></span>
                  <span>•</span>
                  <span>Fulfillment: <strong className="text-zinc-700 dark:text-zinc-300 capitalize">{vendor.fulfillmentType.replace(/_/g, ' ')}</strong></span>
                </div>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="flex flex-wrap items-center gap-2.5">
              <button
                onClick={handleCopyLink}
                className="inline-flex items-center gap-1.5 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-800 px-3.5 py-2 text-xs font-semibold text-zinc-700 dark:text-zinc-300 hover:bg-zinc-50 dark:hover:bg-zinc-750 transition-colors shadow-sm"
              >
                {copiedLink ? <CheckIcon className="w-4 h-4 text-emerald-500" /> : <CopyIcon className="w-4 h-4 text-zinc-400" />}
                <span>{copiedLink ? 'Copied Store URL' : 'Share Storefront'}</span>
              </button>

              <button
                onClick={() => setActiveTab('storefront')}
                className="inline-flex items-center gap-1.5 rounded-xl border border-indigo-200 dark:border-indigo-800 bg-indigo-50/70 dark:bg-indigo-950/40 px-3.5 py-2 text-xs font-semibold text-indigo-700 dark:text-indigo-300 hover:bg-indigo-100 transition-colors shadow-sm"
              >
                <StoreIcon className="w-4 h-4" />
                <span>Customer View</span>
              </button>

              <button
                onClick={() => setIsAddProductModal(true)}
                className="inline-flex items-center gap-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 px-4 py-2 text-xs font-bold text-white shadow-md shadow-indigo-600/20 transition-all active:scale-[0.98]"
              >
                <PlusIcon className="w-4 h-4" />
                <span>Add Product</span>
              </button>
            </div>
          </div>

          {/* Navigation Sub-Tabs */}
          <div className="mt-8 flex items-center gap-2 overflow-x-auto border-t border-zinc-100 dark:border-zinc-800 pt-4">
            {([
              { id: 'overview' as const, label: 'Performance & Orders', icon: TrendingUpIcon },
              { id: 'products' as const, label: `Product Catalog (${vendor.products.length})`, icon: PackageIcon },
              { id: 'storefront' as const, label: 'Storefront Preview', icon: StoreIcon },
              { id: 'profile' as const, label: 'Business Legal Info', icon: BuildingIcon },
              { id: 'payouts' as const, label: 'Payouts & Banking', icon: CreditCardIcon },
            ]).map((t) => {
              const Icon = t.icon;
              const isActive = activeTab === t.id;
              return (
                <button
                  key={t.id}
                  onClick={() => setActiveTab(t.id)}
                  className={`inline-flex items-center gap-2 rounded-xl px-4 py-2 text-xs font-bold whitespace-nowrap transition-all ${
                    isActive
                      ? 'bg-zinc-900 text-white dark:bg-white dark:text-zinc-900 shadow-sm'
                      : 'text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800'
                  }`}
                >
                  <Icon className="w-3.5 h-3.5" />
                  <span>{t.label}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* TAB 1: OVERVIEW & ANALYTICS */}
        {activeTab === 'overview' && (
          <div className="space-y-6 animate-fadeIn">
            {/* 4 Stat Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="rounded-3xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-6 shadow-sm">
                <div className="flex items-center justify-between text-zinc-500 dark:text-zinc-400 mb-2">
                  <span className="text-xs font-bold uppercase tracking-wider">Gross Revenue</span>
                  <div className="p-2 rounded-xl bg-emerald-50 dark:bg-emerald-950/80 text-emerald-600 dark:text-emerald-400">
                    <DollarSignIcon className="w-4 h-4" />
                  </div>
                </div>
                <div className="text-2xl sm:text-3xl font-extrabold text-zinc-900 dark:text-white font-mono">
                  ${vendor.metrics.totalRevenue.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                </div>
                <div className="mt-2 flex items-center gap-1.5 text-xs text-emerald-600 dark:text-emerald-400 font-semibold">
                  <TrendingUpIcon className="w-3.5 h-3.5" />
                  <span>+{vendor.metrics.monthlyGrowth || 18.4}% this month</span>
                </div>
              </div>

              <div className="rounded-3xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-6 shadow-sm">
                <div className="flex items-center justify-between text-zinc-500 dark:text-zinc-400 mb-2">
                  <span className="text-xs font-bold uppercase tracking-wider">Total Orders</span>
                  <div className="p-2 rounded-xl bg-blue-50 dark:bg-blue-950/80 text-blue-600 dark:text-blue-400">
                    <ShoppingBagIcon className="w-4 h-4" />
                  </div>
                </div>
                <div className="text-2xl sm:text-3xl font-extrabold text-zinc-900 dark:text-white font-mono">
                  {vendor.metrics.ordersCount.toLocaleString()}
                </div>
                <div className="mt-2 text-xs text-zinc-500 dark:text-zinc-400">
                  98.9% on-time fulfillment rate
                </div>
              </div>

              <div className="rounded-3xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-6 shadow-sm">
                <div className="flex items-center justify-between text-zinc-500 dark:text-zinc-400 mb-2">
                  <span className="text-xs font-bold uppercase tracking-wider">Conversion Rate</span>
                  <div className="p-2 rounded-xl bg-purple-50 dark:bg-purple-950/80 text-purple-600 dark:text-purple-400">
                    <EyeIcon className="w-4 h-4" />
                  </div>
                </div>
                <div className="text-2xl sm:text-3xl font-extrabold text-zinc-900 dark:text-white font-mono">
                  {vendor.metrics.conversionRate || 3.9}%
                </div>
                <div className="mt-2 text-xs text-zinc-500 dark:text-zinc-400">
                  {vendor.metrics.storeViews.toLocaleString()} storefront pageviews
                </div>
              </div>

              <div className="rounded-3xl border border-indigo-200 dark:border-indigo-800 bg-gradient-to-br from-indigo-50/50 via-white to-indigo-50/30 dark:from-zinc-900 dark:via-zinc-900 dark:to-indigo-950/40 p-6 shadow-sm">
                <div className="flex items-center justify-between text-zinc-500 dark:text-zinc-400 mb-2">
                  <span className="text-xs font-bold uppercase tracking-wider text-indigo-700 dark:text-indigo-300">
                    Ready for Payout
                  </span>
                  <button
                    onClick={handleRequestPayout}
                    className="rounded-lg bg-indigo-600 hover:bg-indigo-700 px-2 py-1 text-[10px] font-bold text-white transition-colors"
                  >
                    Withdraw
                  </button>
                </div>
                <div className="text-2xl sm:text-3xl font-extrabold text-zinc-900 dark:text-white font-mono">
                  ${vendor.metrics.availableBalance.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                </div>
                <div className="mt-2 text-xs text-zinc-500 dark:text-zinc-400">
                  Next automated settlement: {vendor.metrics.nextPayoutDate}
                </div>
              </div>
            </div>

            {/* Interactive SVG Revenue Chart */}
            <div className="rounded-3xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-6 sm:p-8 shadow-sm">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
                <div>
                  <h3 className="text-lg font-extrabold text-zinc-900 dark:text-white">
                    Revenue & Sales Velocity
                  </h3>
                  <p className="text-xs text-zinc-500 dark:text-zinc-400">
                    Real-time transaction volume processed through your merchant account
                  </p>
                </div>

                <div className="inline-flex rounded-xl bg-zinc-100 dark:bg-zinc-800 p-1 border border-zinc-200 dark:border-zinc-700">
                  <button
                    onClick={() => setTimeRange('7d')}
                    className={`px-3 py-1 rounded-lg text-xs font-semibold transition-all ${
                      timeRange === '7d'
                        ? 'bg-white dark:bg-zinc-700 text-zinc-900 dark:text-white shadow-sm'
                        : 'text-zinc-500 hover:text-zinc-900 dark:hover:text-white'
                    }`}
                  >
                    Last 7 Days
                  </button>
                  <button
                    onClick={() => setTimeRange('30d')}
                    className={`px-3 py-1 rounded-lg text-xs font-semibold transition-all ${
                      timeRange === '30d'
                        ? 'bg-white dark:bg-zinc-700 text-zinc-900 dark:text-white shadow-sm'
                        : 'text-zinc-500 hover:text-zinc-900 dark:hover:text-white'
                    }`}
                  >
                    Last 30 Days
                  </button>
                </div>
              </div>

              {/* Bar / Graph visual */}
              <div className="h-64 flex items-end gap-3 sm:gap-6 pt-6 pb-2 px-2">
                {activePoints.map((pt, i) => {
                  const heightPercent = Math.max(15, Math.round((pt.revenue / (maxRevenue || 1)) * 100));
                  return (
                    <div key={i} className="flex-1 flex flex-col items-center gap-2 group h-full justify-end">
                      {/* Tooltip on hover */}
                      <div className="opacity-0 group-hover:opacity-100 transition-opacity text-center mb-1 pointer-events-none">
                        <span className="rounded-lg bg-zinc-900 text-white dark:bg-white dark:text-zinc-900 px-2 py-1 text-[10px] font-mono font-bold shadow-md block whitespace-nowrap">
                          ${pt.revenue.toLocaleString()} ({pt.orders} ord)
                        </span>
                      </div>

                      <div className="w-full bg-zinc-100 dark:bg-zinc-800/80 rounded-2xl h-full flex items-end p-1 overflow-hidden">
                        <div
                          className="w-full rounded-xl bg-gradient-to-t from-indigo-600 to-blue-500 group-hover:from-indigo-500 group-hover:to-cyan-400 transition-all duration-500"
                          style={{ height: `${heightPercent}%` }}
                        />
                      </div>

                      <span className="text-xs font-semibold text-zinc-500 dark:text-zinc-400 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
                        {pt.day}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Recent Orders Table */}
            <div className="rounded-3xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-6 sm:p-8 shadow-sm">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h3 className="text-lg font-extrabold text-zinc-900 dark:text-white">
                    Recent Customer Orders
                  </h3>
                  <p className="text-xs text-zinc-500 dark:text-zinc-400">
                    Latest purchases placed through your Merchanta merchant storefront
                  </p>
                </div>
                <span className="text-xs font-semibold text-zinc-500">
                  {vendor.orders.length} Total Orders
                </span>
              </div>

              {vendor.orders.length === 0 ? (
                <div className="text-center py-12 border-2 border-dashed border-zinc-200 dark:border-zinc-800 rounded-2xl">
                  <ShoppingBagIcon className="w-10 h-10 text-zinc-300 dark:text-zinc-600 mx-auto mb-2" />
                  <p className="text-sm font-bold text-zinc-700 dark:text-zinc-300">
                    No orders placed yet
                  </p>
                  <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1 max-w-sm mx-auto">
                    Share your verified storefront link to start receiving customer orders.
                  </p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead>
                      <tr className="border-b border-zinc-100 dark:border-zinc-800 text-zinc-400 uppercase tracking-wider text-[10px]">
                        <th className="pb-3 font-bold">Order ID</th>
                        <th className="pb-3 font-bold">Customer</th>
                        <th className="pb-3 font-bold">Date & Time</th>
                        <th className="pb-3 font-bold">Shipping Destination</th>
                        <th className="pb-3 font-bold">Total</th>
                        <th className="pb-3 font-bold">Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800/60 font-medium">
                      {vendor.orders.map((ord) => (
                        <tr key={ord.id} className="hover:bg-zinc-50/50 dark:hover:bg-zinc-800/40 transition-colors">
                          <td className="py-3.5 font-mono font-bold text-indigo-600 dark:text-indigo-400">
                            {ord.orderNumber}
                          </td>
                          <td className="py-3.5 font-bold text-zinc-900 dark:text-white">
                            {ord.customerName}
                          </td>
                          <td className="py-3.5 text-zinc-500">
                            {ord.date}
                          </td>
                          <td className="py-3.5 text-zinc-500">
                            {ord.shippingAddress}
                          </td>
                          <td className="py-3.5 font-mono font-bold text-zinc-900 dark:text-white">
                            ${ord.total.toFixed(2)}
                          </td>
                          <td className="py-3.5">
                            <span
                              className={`inline-block rounded-full px-2.5 py-0.5 text-[10px] font-bold ${
                                ord.status === 'delivered'
                                  ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/70 dark:text-emerald-300'
                                  : ord.status === 'shipped'
                                  ? 'bg-blue-50 text-blue-700 dark:bg-blue-950/70 dark:text-blue-300'
                                  : 'bg-amber-50 text-amber-700 dark:bg-amber-950/70 dark:text-amber-300'
                              }`}
                            >
                              {ord.status.toUpperCase()}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        )}

        {/* TAB 2: PRODUCTS & CATALOG */}
        {activeTab === 'products' && (
          <div className="space-y-6 animate-fadeIn">
            <div className="rounded-3xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-6 sm:p-8 shadow-sm">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
                <div>
                  <h3 className="text-lg font-extrabold text-zinc-900 dark:text-white">
                    Product Catalog & Inventory
                  </h3>
                  <p className="text-xs text-zinc-500 dark:text-zinc-400">
                    Manage active merchandise, prices, stock levels, and fulfillment statuses
                  </p>
                </div>

                <button
                  onClick={() => setIsAddProductModal(true)}
                  className="inline-flex items-center gap-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 px-4 py-2 text-xs font-bold text-white shadow-md shadow-indigo-600/20 transition-all"
                >
                  <PlusIcon className="w-4 h-4" />
                  <span>Add New Product Listing</span>
                </button>
              </div>

              {vendor.products.length === 0 ? (
                <div className="text-center py-16 border-2 border-dashed border-zinc-200 dark:border-zinc-800 rounded-2xl">
                  <PackageIcon className="w-12 h-12 text-zinc-300 dark:text-zinc-600 mx-auto mb-3" />
                  <h4 className="text-sm font-bold text-zinc-900 dark:text-white">
                    No products added yet
                  </h4>
                  <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1 max-w-sm mx-auto">
                    Create your first product listing to showcase on your merchant storefront.
                  </p>
                  <button
                    onClick={() => setIsAddProductModal(true)}
                    className="mt-4 inline-flex items-center gap-1.5 rounded-xl bg-indigo-600 px-4 py-2 text-xs font-bold text-white shadow-sm"
                  >
                    <PlusIcon className="w-4 h-4" />
                    <span>Create First Listing</span>
                  </button>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {vendor.products.map((prod) => (
                    <div
                      key={prod.id}
                      className="rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-800/40 p-4 flex flex-col justify-between hover:border-zinc-300 dark:hover:border-zinc-700 transition-all group"
                    >
                      <div>
                        <div className="relative aspect-[4/3] rounded-xl overflow-hidden bg-zinc-200 dark:bg-zinc-800 mb-3">
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img
                            src={prod.imageUrl}
                            alt={prod.title}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                          />
                          <span className="absolute top-2 right-2 rounded-full bg-black/60 backdrop-blur-md px-2.5 py-0.5 text-[10px] font-bold text-white">
                            {prod.category}
                          </span>
                        </div>

                        <div className="flex items-start justify-between gap-2">
                          <div>
                            <h4 className="font-bold text-sm text-zinc-900 dark:text-white line-clamp-1">
                              {prod.title}
                            </h4>
                            <span className="text-[11px] font-mono text-zinc-500 dark:text-zinc-400">
                              SKU: {prod.sku}
                            </span>
                          </div>
                          <span className="text-base font-extrabold font-mono text-zinc-900 dark:text-white">
                            ${prod.price.toFixed(2)}
                          </span>
                        </div>
                      </div>

                      <div className="mt-4 pt-3 border-t border-zinc-200 dark:border-zinc-750 flex items-center justify-between text-xs">
                        <div className="flex items-center gap-2">
                          <span className="inline-block w-2 h-2 rounded-full bg-emerald-500" />
                          <span className="text-zinc-600 dark:text-zinc-400 font-medium">
                            {prod.stock} in stock
                          </span>
                        </div>

                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => handleDeleteProduct(prod.id)}
                            className="p-1.5 rounded-lg text-zinc-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-950/40 transition-colors"
                            title="Delete listing"
                          >
                            <TrashIcon className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* TAB 3: STOREFRONT PREVIEW */}
        {activeTab === 'storefront' && (
          <div className="space-y-6 animate-fadeIn">
            {storefrontToast && (
              <div className="rounded-2xl bg-indigo-600 text-white p-3 text-xs font-semibold text-center shadow-lg animate-fadeIn">
                {storefrontToast}
              </div>
            )}

            <div className="rounded-3xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 overflow-hidden shadow-lg">
              {/* Browser frame preview bar */}
              <div className="bg-zinc-100 dark:bg-zinc-800 px-4 py-2.5 border-b border-zinc-200 dark:border-zinc-700 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-red-400" />
                  <div className="w-3 h-3 rounded-full bg-amber-400" />
                  <div className="w-3 h-3 rounded-full bg-emerald-400" />
                  <span className="ml-3 text-[11px] font-mono text-zinc-500 dark:text-zinc-400 bg-white dark:bg-zinc-900 px-3 py-1 rounded-md border border-zinc-200 dark:border-zinc-700 flex items-center gap-1.5">
                    <ShieldCheckIcon className="w-3.5 h-3.5 text-emerald-500" />
                    https://{vendor.storeSlug}.merchanta.market
                  </span>
                </div>
                <span className="text-[11px] font-semibold text-zinc-500">Live Customer Storefront Mode</span>
              </div>

              {/* Storefront Hero Banner */}
              <div className="relative h-48 sm:h-64 w-full bg-zinc-900 overflow-hidden">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={vendor.bannerUrl}
                  alt={vendor.businessName}
                  className="w-full h-full object-cover opacity-80"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent" />

                <div className="absolute bottom-6 left-6 sm:left-10 flex items-end gap-4 text-white">
                  <div
                    className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl overflow-hidden shadow-2xl ring-4 ring-white/20 flex-shrink-0 bg-zinc-800"
                  >
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={vendor.logoUrl}
                      alt={vendor.businessName}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h2 className="text-xl sm:text-2xl font-black text-white">
                        {vendor.businessName}
                      </h2>
                      <ShieldCheckIcon className="w-4 h-4 text-emerald-400" />
                    </div>
                    <p className="text-xs sm:text-sm text-zinc-200 font-medium line-clamp-1 mt-0.5">
                      {vendor.storeHeadline}
                    </p>
                  </div>
                </div>
              </div>

              {/* Storefront Bio & Story */}
              <div className="p-6 sm:p-10 border-b border-zinc-100 dark:border-zinc-800">
                <div className="max-w-3xl">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-indigo-600 dark:text-indigo-400 mb-2">
                    About Our Brand
                  </h3>
                  <p className="text-sm text-zinc-600 dark:text-zinc-300 leading-relaxed">
                    {vendor.storeBio}
                  </p>
                </div>
              </div>

              {/* Storefront Products Display */}
              <div className="p-6 sm:p-10 bg-zinc-50/50 dark:bg-zinc-950/40">
                <div className="flex items-center justify-between mb-6">
                  <div>
                    <h3 className="text-lg font-bold text-zinc-900 dark:text-white">
                      Featured Products ({vendor.products.length})
                    </h3>
                    <p className="text-xs text-zinc-500">
                      Direct from {vendor.businessName} with verified buyer warranty
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                  {vendor.products.map((prod) => (
                    <div
                      key={prod.id}
                      className="rounded-3xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-4 shadow-sm hover:shadow-xl transition-all flex flex-col justify-between"
                    >
                      <div>
                        <div className="aspect-[4/3] rounded-2xl overflow-hidden bg-zinc-100 dark:bg-zinc-800 mb-3">
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img
                            src={prod.imageUrl}
                            alt={prod.title}
                            className="w-full h-full object-cover"
                          />
                        </div>
                        <h4 className="font-bold text-sm text-zinc-900 dark:text-white">
                          {prod.title}
                        </h4>
                        <div className="mt-2 flex items-baseline justify-between">
                          <span className="text-lg font-black font-mono text-zinc-900 dark:text-white">
                            ${prod.price.toFixed(2)}
                          </span>
                          <span className="text-[11px] text-zinc-500">Free 2-day delivery</span>
                        </div>
                      </div>

                      <button
                        onClick={() => {
                          setStorefrontToast(`Added "${prod.title}" to simulated cart!`);
                          setTimeout(() => setStorefrontToast(null), 3000);
                        }}
                        className="mt-4 w-full rounded-xl py-2.5 text-xs font-bold text-white shadow-md transition-all active:scale-[0.98]"
                        style={{ backgroundColor: vendor.brandColor || '#6366f1' }}
                      >
                        Add to Cart • ${prod.price.toFixed(2)}
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* TAB 4: PROFILE & LEGAL KYB */}
        {activeTab === 'profile' && (
          <div className="space-y-6 animate-fadeIn">
            <div className="rounded-3xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-6 sm:p-8 shadow-sm">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
                <div>
                  <h3 className="text-lg font-extrabold text-zinc-900 dark:text-white">
                    Verified Business Entity & KYB Documents
                  </h3>
                  <p className="text-xs text-zinc-500 dark:text-zinc-400">
                    Official state legal registration records and compliance validation
                  </p>
                </div>

                <button
                  onClick={() => setIsEditingProfile(!isEditingProfile)}
                  className="rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-800 px-4 py-2 text-xs font-bold text-zinc-800 dark:text-zinc-200 hover:bg-zinc-100 transition-colors"
                >
                  {isEditingProfile ? 'Cancel Editing' : 'Edit Brand Profile'}
                </button>
              </div>

              {isEditingProfile ? (
                <form onSubmit={handleSaveProfile} className="space-y-4 pt-2">
                  <div>
                    <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1.5">
                      Storefront Headline
                    </label>
                    <input
                      type="text"
                      value={editHeadline}
                      onChange={(e) => setEditHeadline(e.target.value)}
                      className="w-full rounded-xl border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 px-3.5 py-2.5 text-sm text-zinc-900 dark:text-white"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1.5">
                      Brand Story & Bio
                    </label>
                    <textarea
                      rows={3}
                      value={editBio}
                      onChange={(e) => setEditBio(e.target.value)}
                      className="w-full rounded-xl border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 px-3.5 py-2.5 text-sm text-zinc-900 dark:text-white"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1.5">
                      External Website
                    </label>
                    <input
                      type="url"
                      value={editWebsite}
                      onChange={(e) => setEditWebsite(e.target.value)}
                      className="w-full rounded-xl border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 px-3.5 py-2.5 text-sm text-zinc-900 dark:text-white"
                    />
                  </div>
                  <div className="flex gap-2 pt-2">
                    <button
                      type="submit"
                      className="rounded-xl bg-indigo-600 px-4 py-2 text-xs font-bold text-white shadow-md hover:bg-indigo-700"
                    >
                      Save Changes
                    </button>
                    <button
                      type="button"
                      onClick={() => setIsEditingProfile(false)}
                      className="rounded-xl border border-zinc-300 dark:border-zinc-700 px-4 py-2 text-xs font-medium text-zinc-700 dark:text-zinc-300"
                    >
                      Cancel
                    </button>
                  </div>
                </form>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-xs">
                  <div className="rounded-2xl bg-zinc-50/70 dark:bg-zinc-800/40 p-5 border border-zinc-200 dark:border-zinc-800 space-y-3">
                    <h4 className="font-bold text-zinc-900 dark:text-white uppercase tracking-wider text-[11px] flex items-center gap-1.5">
                      <BuildingIcon className="w-4 h-4 text-indigo-500" />
                      Legal Corporation Profile
                    </h4>
                    <div className="flex justify-between py-1 border-b border-zinc-200/60 dark:border-zinc-750">
                      <span className="text-zinc-500">Legal Name:</span>
                      <span className="font-bold text-zinc-900 dark:text-white">{vendor.businessName}</span>
                    </div>
                    <div className="flex justify-between py-1 border-b border-zinc-200/60 dark:border-zinc-750">
                      <span className="text-zinc-500">DBA Brand:</span>
                      <span className="font-medium text-zinc-900 dark:text-white">{vendor.dbaName || 'None'}</span>
                    </div>
                    <div className="flex justify-between py-1 border-b border-zinc-200/60 dark:border-zinc-750">
                      <span className="text-zinc-500">Structure:</span>
                      <span className="font-medium uppercase text-zinc-900 dark:text-white">{vendor.businessType}</span>
                    </div>
                    <div className="flex justify-between py-1 border-b border-zinc-200/60 dark:border-zinc-750">
                      <span className="text-zinc-500">Tax ID / EIN:</span>
                      <span className="font-mono font-bold text-zinc-900 dark:text-white">{vendor.taxId}</span>
                    </div>
                    <div className="flex justify-between py-1">
                      <span className="text-zinc-500">Registration Date:</span>
                      <span className="text-zinc-700 dark:text-zinc-300">{new Date(vendor.createdAt).toLocaleDateString()}</span>
                    </div>
                  </div>

                  <div className="rounded-2xl bg-zinc-50/70 dark:bg-zinc-800/40 p-5 border border-zinc-200 dark:border-zinc-800 space-y-3">
                    <h4 className="font-bold text-zinc-900 dark:text-white uppercase tracking-wider text-[11px] flex items-center gap-1.5">
                      <ShieldCheckIcon className="w-4 h-4 text-emerald-500" />
                      Representative & Headquarters
                    </h4>
                    <div className="flex justify-between py-1 border-b border-zinc-200/60 dark:border-zinc-750">
                      <span className="text-zinc-500">Authorized Agent:</span>
                      <span className="font-bold text-zinc-900 dark:text-white">{vendor.fullName} ({vendor.jobTitle})</span>
                    </div>
                    <div className="flex justify-between py-1 border-b border-zinc-200/60 dark:border-zinc-750">
                      <span className="text-zinc-500">Corporate Email:</span>
                      <span className="font-mono text-zinc-900 dark:text-white">{vendor.workEmail}</span>
                    </div>
                    <div className="flex justify-between py-1 border-b border-zinc-200/60 dark:border-zinc-750">
                      <span className="text-zinc-500">Phone:</span>
                      <span className="text-zinc-900 dark:text-white">{vendor.phoneNumber}</span>
                    </div>
                    <div className="flex justify-between py-1">
                      <span className="text-zinc-500">HQ Address:</span>
                      <span className="text-zinc-900 dark:text-white text-right">
                        {vendor.businessAddress.street}, {vendor.businessAddress.city}, {vendor.businessAddress.state} {vendor.businessAddress.postalCode}
                      </span>
                    </div>
                  </div>
                </div>
              )}

              {/* Uploaded KYB Documents */}
              <div className="mt-6 pt-6 border-t border-zinc-200 dark:border-zinc-800">
                <h4 className="text-xs font-bold text-zinc-900 dark:text-white mb-3">
                  Verified KYB Documents on File
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {vendor.kycDocuments.map((doc) => (
                    <div
                      key={doc.id}
                      className="rounded-xl border border-zinc-200 dark:border-zinc-800 p-3 flex items-center justify-between bg-white dark:bg-zinc-850 text-xs"
                    >
                      <div className="flex items-center gap-2.5 truncate">
                        <FileTextIcon className="w-4 h-4 text-indigo-500 flex-shrink-0" />
                        <span className="font-semibold text-zinc-800 dark:text-zinc-200 truncate">
                          {doc.name}
                        </span>
                      </div>
                      <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 dark:bg-emerald-950 px-2 py-0.5 text-[10px] font-bold text-emerald-600 dark:text-emerald-400 flex-shrink-0">
                        <CheckIcon className="w-3 h-3" />
                        VERIFIED
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* TAB 5: PAYOUTS & BANKING */}
        {activeTab === 'payouts' && (
          <div className="space-y-6 animate-fadeIn">
            <div className="rounded-3xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-6 sm:p-8 shadow-sm">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
                <div>
                  <h3 className="text-lg font-extrabold text-zinc-900 dark:text-white">
                    Direct Deposit & Payout Settlements
                  </h3>
                  <p className="text-xs text-zinc-500 dark:text-zinc-400">
                    Automated ACH bank transfers with zero wire fees and same-day clearing
                  </p>
                </div>

                <button
                  onClick={handleRequestPayout}
                  className="inline-flex items-center gap-1.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 px-4 py-2.5 text-xs font-bold text-white shadow-md shadow-emerald-600/20 transition-all active:scale-[0.98]"
                >
                  <DollarSignIcon className="w-4 h-4" />
                  <span>Withdraw Available Balance (${vendor.metrics.availableBalance.toFixed(2)})</span>
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="rounded-2xl bg-zinc-50 dark:bg-zinc-800/50 p-5 border border-zinc-200 dark:border-zinc-800 text-xs space-y-2">
                  <span className="text-[10px] uppercase font-bold text-zinc-400">Linked Bank Account</span>
                  <div className="text-sm font-bold text-zinc-900 dark:text-white">
                    {vendor.banking.bankName}
                  </div>
                  <div className="font-mono text-zinc-500">
                    Account: {vendor.banking.accountNumberMasked}
                  </div>
                  <div className="font-mono text-zinc-500">
                    Routing: {vendor.banking.routingNumber}
                  </div>
                  <div className="pt-2 text-emerald-600 dark:text-emerald-400 font-semibold flex items-center gap-1">
                    <CheckCircleIcon className="w-3.5 h-3.5" />
                    <span>FDIC-Insured & Verified</span>
                  </div>
                </div>

                <div className="rounded-2xl bg-zinc-50 dark:bg-zinc-800/50 p-5 border border-zinc-200 dark:border-zinc-800 text-xs space-y-2">
                  <span className="text-[10px] uppercase font-bold text-zinc-400">Payout Frequency</span>
                  <div className="text-sm font-bold text-zinc-900 dark:text-white uppercase">
                    {vendor.banking.payoutSchedule} Deposits
                  </div>
                  <p className="text-zinc-500">
                    Settlements are deposited automatically according to your preferred frequency.
                  </p>
                  <div className="pt-2 font-mono text-zinc-700 dark:text-zinc-300">
                    Next Run: <strong>{vendor.metrics.nextPayoutDate}</strong>
                  </div>
                </div>

                <div className="rounded-2xl bg-indigo-50/70 dark:bg-indigo-950/40 p-5 border border-indigo-200 dark:border-indigo-800 text-xs space-y-2">
                  <span className="text-[10px] uppercase font-bold text-indigo-600 dark:text-indigo-400">Escrow & Protection</span>
                  <div className="text-sm font-bold text-zinc-900 dark:text-white">
                    0% Dispute Rolling Reserve
                  </div>
                  <p className="text-zinc-600 dark:text-zinc-400">
                    As a Verified Partner, your funds are exempt from mandatory 14-day hold reserves.
                  </p>
                </div>
              </div>

              {/* Settlement History */}
              <div className="mt-8 pt-6 border-t border-zinc-200 dark:border-zinc-800">
                <h4 className="text-xs font-bold text-zinc-900 dark:text-white mb-4">
                  Past Deposit Settlements
                </h4>
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead>
                      <tr className="border-b border-zinc-100 dark:border-zinc-800 text-zinc-400 uppercase text-[10px]">
                        <th className="pb-2 font-bold">Transfer Ref</th>
                        <th className="pb-2 font-bold">Date</th>
                        <th className="pb-2 font-bold">Destination Bank</th>
                        <th className="pb-2 font-bold">Amount</th>
                        <th className="pb-2 font-bold">Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800/60 font-medium">
                      <tr>
                        <td className="py-3 font-mono text-indigo-600 dark:text-indigo-400">TRF-ACH-98129</td>
                        <td className="py-3 text-zinc-500">Sep 25, 2026</td>
                        <td className="py-3 text-zinc-700 dark:text-zinc-300">{vendor.banking.bankName}</td>
                        <td className="py-3 font-mono font-bold text-zinc-900 dark:text-white">$12,410.00</td>
                        <td className="py-3">
                          <span className="rounded-full bg-emerald-50 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300 px-2 py-0.5 text-[10px] font-bold">
                            CLEARED
                          </span>
                        </td>
                      </tr>
                      <tr>
                        <td className="py-3 font-mono text-indigo-600 dark:text-indigo-400">TRF-ACH-97401</td>
                        <td className="py-3 text-zinc-500">Sep 18, 2026</td>
                        <td className="py-3 text-zinc-700 dark:text-zinc-300">{vendor.banking.bankName}</td>
                        <td className="py-3 font-mono font-bold text-zinc-900 dark:text-white">$8,950.50</td>
                        <td className="py-3">
                          <span className="rounded-full bg-emerald-50 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300 px-2 py-0.5 text-[10px] font-bold">
                            CLEARED
                          </span>
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Modal: Add New Product */}
      {isAddProductModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fadeIn">
          <div className="w-full max-w-lg rounded-3xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 p-6 sm:p-8 shadow-2xl relative">
            <button
              onClick={() => setIsAddProductModal(false)}
              className="absolute top-5 right-5 p-1.5 rounded-xl text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
            >
              <CloseIcon className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 rounded-xl bg-indigo-100 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-400 flex items-center justify-center font-bold">
                <PlusIcon className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-lg font-extrabold text-zinc-900 dark:text-white">
                  Add New Product Listing
                </h3>
                <p className="text-xs text-zinc-500">
                  Publish a new product to your merchant catalog
                </p>
              </div>
            </div>

            <form onSubmit={handleAddProduct} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1.5">
                  Product Title *
                </label>
                <input
                  type="text"
                  required
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  placeholder="e.g. Master Wireless Reference Headset"
                  className="w-full rounded-xl border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-800/80 px-3.5 py-2.5 text-xs text-zinc-900 dark:text-white placeholder:text-zinc-400 focus:border-indigo-500 focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1.5">
                    SKU Identifier
                  </label>
                  <input
                    type="text"
                    value={newSku}
                    onChange={(e) => setNewSku(e.target.value)}
                    placeholder="e.g. SKU-901"
                    className="w-full rounded-xl border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-800/80 px-3.5 py-2.5 text-xs text-zinc-900 dark:text-white font-mono"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1.5">
                    Category Tag
                  </label>
                  <input
                    type="text"
                    value={newCategory}
                    onChange={(e) => setNewCategory(e.target.value)}
                    placeholder="Hardware, Apparel, etc."
                    className="w-full rounded-xl border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-800/80 px-3.5 py-2.5 text-xs text-zinc-900 dark:text-white"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1.5">
                    Retail Price ($ USD) *
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    required
                    value={newPrice}
                    onChange={(e) => setNewPrice(Number(e.target.value))}
                    className="w-full rounded-xl border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-800/80 px-3.5 py-2.5 text-xs text-zinc-900 dark:text-white font-mono"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1.5">
                    Initial Stock Count *
                  </label>
                  <input
                    type="number"
                    required
                    value={newStock}
                    onChange={(e) => setNewStock(Number(e.target.value))}
                    className="w-full rounded-xl border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-800/80 px-3.5 py-2.5 text-xs text-zinc-900 dark:text-white font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1.5">
                  High-Resolution Product Image URL
                </label>
                <input
                  type="url"
                  value={newImageUrl}
                  onChange={(e) => setNewImageUrl(e.target.value)}
                  placeholder="https://..."
                  className="w-full rounded-xl border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-800/80 px-3.5 py-2.5 text-xs text-zinc-900 dark:text-white"
                />
              </div>

              <div className="pt-4 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsAddProductModal(false)}
                  className="rounded-xl border border-zinc-300 dark:border-zinc-700 px-4 py-2.5 text-xs font-semibold text-zinc-700 dark:text-zinc-300 hover:bg-zinc-50 dark:hover:bg-zinc-800 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="rounded-xl bg-indigo-600 hover:bg-indigo-700 px-5 py-2.5 text-xs font-bold text-white shadow-md shadow-indigo-600/20 transition-all active:scale-[0.98]"
                >
                  Publish Listing
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
