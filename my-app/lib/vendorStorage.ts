import {
  VendorAccount,
  VendorRegistrationInput,
  RegistrationResult,
  BusinessType,
  isButuanCity,
  isVerifiedLocalVendor,
  filterVerifiedLocalVendors,
} from '../types/vendor';

export { isButuanCity, isVerifiedLocalVendor, filterVerifiedLocalVendors };

export const INITIAL_DEMO_VENDORS: VendorAccount[] = [
  {
    id: 'vnd_894129',
    fullName: 'Elena Vance',
    workEmail: 'elena@novaaudio.io',
    password: 'password123',
    phoneNumber: '+1 (415) 892-4910',
    jobTitle: 'Founder & Head of Product',
    createdAt: '2026-08-15T10:00:00Z',

    businessName: 'Nova Acoustics Labs Inc.',
    dbaName: 'Nova Audio',
    businessType: 'corporation',
    industryCategory: 'consumer_electronics',
    taxId: 'XX-XXX4912',
    websiteUrl: 'https://novaaudio.example.com',
    annualRevenueBand: '$500K - $1M',
    expectedMonthlyVolume: '250 - 500 orders',

    businessAddress: {
      street: '742 Market Street, Suite 900',
      city: 'San Francisco',
      state: 'CA',
      postalCode: '94102',
      country: 'United States',
    },
    fulfillmentType: 'merchant_hub_3pl',

    banking: {
      bankName: 'Silicon Valley Commercial Bank',
      accountHolderName: 'Nova Acoustics Labs Inc.',
      accountType: 'checking',
      routingNumber: '121000358',
      accountNumberMasked: '•••• •••• 8821',
      currency: 'USD ($)',
      payoutSchedule: 'weekly',
    },

    storeSlug: 'nova-acoustics',
    storeHeadline: 'Precision Audiophile Monitors & Studio Gear',
    storeBio: 'Engineered in California. High-resolution studio reference hardware, open-back magnetic planar headphones, and acoustic dampeners.',
    brandColor: '#6366f1',
    logoUrl: 'https://images.unsplash.com/photo-1546435770-a3e426bf472b?auto=format&fit=crop&w=240&q=80',
    bannerUrl: 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?auto=format&fit=crop&w=1200&q=80',

    verificationStatus: 'verified',
    sellerTier: 'Verified Partner',
    verifiedAt: '2026-08-16T14:22:00Z',
    kycDocuments: [
      {
        id: 'doc_1',
        type: 'business_license',
        name: 'Delaware_Certificate_of_Good_Standing.pdf',
        status: 'approved',
        fileSize: '1.4 MB',
        uploadedAt: '2026-08-15',
      },
      {
        id: 'doc_2',
        type: 'tax_id_certificate',
        name: 'IRS_EIN_Confirmation_Letter.pdf',
        status: 'approved',
        fileSize: '840 KB',
        uploadedAt: '2026-08-15',
      },
    ],

    metrics: {
      totalRevenue: 128450.0,
      monthlyGrowth: 24.6,
      ordersCount: 842,
      conversionRate: 4.12,
      storeViews: 48920,
      availableBalance: 14820.5,
      pendingPayout: 3410.0,
      nextPayoutDate: 'Oct 07, 2026',
    },

    products: [
      {
        id: 'prod_1',
        title: 'Nova Pro Spatial Planar Headphones',
        sku: 'NOV-PL-900',
        category: 'Acoustics & Monitoring',
        price: 499.0,
        stock: 38,
        status: 'active',
        imageUrl: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=400&q=80',
        salesCount: 312,
      },
      {
        id: 'prod_2',
        title: 'Analog Studio Tube Preamp & Interface',
        sku: 'NOV-PR-200',
        category: 'Hardware & DACs',
        price: 749.0,
        stock: 14,
        status: 'active',
        imageUrl: 'https://images.unsplash.com/photo-1598488035139-bdbb2231ce04?auto=format&fit=crop&w=400&q=80',
        salesCount: 145,
      },
      {
        id: 'prod_3',
        title: 'Modular Desk Isolation Pads (Pair)',
        sku: 'NOV-ACC-01',
        category: 'Accessories',
        price: 69.0,
        stock: 120,
        status: 'active',
        imageUrl: 'https://images.unsplash.com/photo-1545454675-3531b543be5d?auto=format&fit=crop&w=400&q=80',
        salesCount: 385,
      },
    ],

    orders: [
      {
        id: 'ord_101',
        orderNumber: 'ORD-98214',
        customerName: 'Marcus Sterling',
        date: '2026-10-01 18:42',
        total: 568.0,
        status: 'processing',
        itemsCount: 2,
        shippingAddress: 'Austin, TX, USA',
      },
      {
        id: 'ord_102',
        orderNumber: 'ORD-98205',
        customerName: 'Sophia Chen',
        date: '2026-10-01 14:15',
        total: 499.0,
        status: 'shipped',
        itemsCount: 1,
        shippingAddress: 'Seattle, WA, USA',
      },
      {
        id: 'ord_103',
        orderNumber: 'ORD-98190',
        customerName: 'David K. Becker',
        date: '2026-09-30 09:12',
        total: 749.0,
        status: 'delivered',
        itemsCount: 1,
        shippingAddress: 'Chicago, IL, USA',
      },
      {
        id: 'ord_104',
        orderNumber: 'ORD-98188',
        customerName: 'Clara Dupont',
        date: '2026-09-29 20:30',
        total: 138.0,
        status: 'delivered',
        itemsCount: 2,
        shippingAddress: 'New York, NY, USA',
      },
    ],
  },
  {
    id: 'vnd_391054',
    fullName: 'Liam Thorne',
    workEmail: 'liam@aurabotanica.co',
    password: 'password123',
    phoneNumber: '+1 (503) 714-8831',
    jobTitle: 'Co-Founder & Formulator',
    createdAt: '2026-09-02T11:30:00Z',

    businessName: 'Aura Botanica Naturals LLC',
    dbaName: 'Aura Botanica',
    businessType: 'llc',
    industryCategory: 'health_beauty',
    taxId: 'XX-XXX1093',
    websiteUrl: 'https://aurabotanica.example.com',
    annualRevenueBand: '$250K - $500K',
    expectedMonthlyVolume: '500 - 1000 orders',

    businessAddress: {
      street: '1220 NW Pearl District St',
      city: 'Portland',
      state: 'OR',
      postalCode: '97209',
      country: 'United States',
    },
    fulfillmentType: 'self_fulfilled',

    banking: {
      bankName: 'Columbia River Banking Trust',
      accountHolderName: 'Aura Botanica Naturals LLC',
      accountType: 'checking',
      routingNumber: '321171992',
      accountNumberMasked: '•••• •••• 4419',
      currency: 'USD ($)',
      payoutSchedule: 'daily',
    },

    storeSlug: 'aura-botanica',
    storeHeadline: 'Pure Organic Cold-Pressed Botanical Skincare',
    storeBio: 'Small-batch organic facial elixirs, peptide barrier creams, and restorative wildcrafted remedies made with sustainable botanicals.',
    brandColor: '#10b981',
    logoUrl: 'https://images.unsplash.com/photo-1556228720-195a672e8a03?auto=format&fit=crop&w=240&q=80',
    bannerUrl: 'https://images.unsplash.com/photo-1608248597359-0026e696f5dc?auto=format&fit=crop&w=1200&q=80',

    verificationStatus: 'verified',
    sellerTier: 'Verified Partner',
    verifiedAt: '2026-09-03T16:00:00Z',
    kycDocuments: [
      {
        id: 'doc_b1',
        type: 'business_license',
        name: 'Oregon_Secretary_State_LLC_Registration.pdf',
        status: 'approved',
        fileSize: '950 KB',
        uploadedAt: '2026-09-02',
      },
    ],

    metrics: {
      totalRevenue: 64210.0,
      monthlyGrowth: 18.2,
      ordersCount: 1140,
      conversionRate: 5.34,
      storeViews: 31200,
      availableBalance: 8190.0,
      pendingPayout: 1250.0,
      nextPayoutDate: 'Oct 03, 2026',
    },

    products: [
      {
        id: 'prod_b1',
        title: 'Radiance Squalane & Rosehip Face Oil',
        sku: 'AUR-ROSE-50',
        category: 'Facial Care',
        price: 58.0,
        stock: 85,
        status: 'active',
        imageUrl: 'https://images.unsplash.com/photo-1608248597359-0026e696f5dc?auto=format&fit=crop&w=400&q=80',
        salesCount: 620,
      },
      {
        id: 'prod_b2',
        title: 'Ceramide Peptide Barrier Restoration Balm',
        sku: 'AUR-BALM-100',
        category: 'Moisturizers',
        price: 64.0,
        stock: 42,
        status: 'active',
        imageUrl: 'https://images.unsplash.com/photo-1571781926291-c477ebfd024b?auto=format&fit=crop&w=400&q=80',
        salesCount: 520,
      },
    ],

    orders: [
      {
        id: 'ord_b101',
        orderNumber: 'ORD-88120',
        customerName: 'Jessica Miller',
        date: '2026-10-01 21:05',
        total: 122.0,
        status: 'processing',
        itemsCount: 2,
        shippingAddress: 'Denver, CO, USA',
      },
    ],
  },
  {
    id: 'vnd_710942',
    fullName: 'Mateo Alcantara',
    workEmail: 'mateo@balangayroasters.ph',
    password: 'password123',
    phoneNumber: '+63 917 552 8419',
    jobTitle: 'Master Roaster & Proprietor',
    createdAt: '2026-09-10T08:00:00Z',

    businessName: 'Balangay Artisan Coffee & Crafts',
    dbaName: 'Balangay Roasters',
    businessType: 'sole_proprietorship',
    industryCategory: 'gourmet_food',
    taxId: 'PH-TIN-8921-3491-000',
    websiteUrl: 'https://balangayroasters.ph',
    annualRevenueBand: '$100K - $250K',
    expectedMonthlyVolume: '300 - 600 orders',

    businessAddress: {
      street: '148 J.C. Aquino Avenue, Purok 3',
      barangay: 'Barangay Doongan',
      city: 'Butuan City',
      state: 'Agusan del Norte',
      postalCode: '8600',
      country: 'Philippines',
    },
    fulfillmentType: 'merchant_hub_3pl',

    banking: {
      bankName: 'Bank of the Philippine Islands (BPI) Butuan Main',
      accountHolderName: 'Balangay Artisan Coffee & Crafts',
      accountType: 'checking',
      routingNumber: '010040018',
      accountNumberMasked: '•••• •••• 1928',
      currency: 'PHP (₱)',
      payoutSchedule: 'daily',
    },

    storeSlug: 'balangay-roasters',
    storeHeadline: 'Heritage Single-Origin Caraga Coffee & Indigenous Artifacts',
    storeBio: 'Locally grown Arabica and Robusta beans from the highlands of Agusan del Norte, roasted fresh in Butuan City alongside authentic indigenous artisan woodwork.',
    brandColor: '#d97706',
    logoUrl: 'https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?auto=format&fit=crop&w=240&q=80',
    bannerUrl: 'https://images.unsplash.com/photo-1447933601403-0c6688de566e?auto=format&fit=crop&w=1200&q=80',

    verificationStatus: 'verified',
    sellerTier: 'Verified Partner',
    verifiedAt: '2026-09-11T10:15:00Z',
    isVerifiedLocal: true,
    kycDocuments: [
      {
        id: 'doc_c1',
        type: 'business_license',
        name: 'Butuan_City_Mayor_Business_Permit_2026.pdf',
        status: 'approved',
        fileSize: '1.1 MB',
        uploadedAt: '2026-09-10',
      },
      {
        id: 'doc_c2',
        type: 'tax_id_certificate',
        name: 'BIR_Certificate_of_Registration_2303.pdf',
        status: 'approved',
        fileSize: '780 KB',
        uploadedAt: '2026-09-10',
      },
    ],

    metrics: {
      totalRevenue: 345000.0,
      monthlyGrowth: 31.5,
      ordersCount: 920,
      conversionRate: 6.2,
      storeViews: 28400,
      availableBalance: 42100.0,
      pendingPayout: 8500.0,
      nextPayoutDate: 'Oct 06, 2026',
    },

    products: [
      {
        id: 'prod_c1',
        title: 'Caraga Highland Mount Hilong-Hilong Single Origin Beans (500g)',
        sku: 'BAL-HILONG-500',
        category: 'Artisan Coffee',
        price: 650.0,
        stock: 60,
        status: 'active',
        imageUrl: 'https://images.unsplash.com/photo-1559056199-641a0ac8b55e?auto=format&fit=crop&w=400&q=80',
        salesCount: 410,
      },
      {
        id: 'prod_c2',
        title: 'Hand-Carved Butuan Balangay Boat Replica & Presentation Stand',
        sku: 'BAL-CRAFT-01',
        category: 'Indigenous Crafts',
        price: 1850.0,
        stock: 18,
        status: 'active',
        imageUrl: 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?auto=format&fit=crop&w=400&q=80',
        salesCount: 88,
      },
    ],

    orders: [
      {
        id: 'ord_c101',
        orderNumber: 'ORD-77192',
        customerName: 'Karlo Mendoza',
        date: '2026-10-02 11:20',
        total: 1300.0,
        status: 'processing',
        itemsCount: 2,
        shippingAddress: 'Montilla Blvd, Butuan City, Agusan del Norte, Philippines',
      },
    ],
  },
];

const STORAGE_KEY = 'merchanta_vendors_registry_v1';
const CURRENT_VENDOR_KEY = 'merchanta_current_vendor_session_v1';

export function getStoredVendors(): VendorAccount[] {
  if (typeof window === 'undefined') return INITIAL_DEMO_VENDORS;
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(INITIAL_DEMO_VENDORS));
      return INITIAL_DEMO_VENDORS;
    }
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) && parsed.length > 0 ? parsed : INITIAL_DEMO_VENDORS;
  } catch {
    return INITIAL_DEMO_VENDORS;
  }
}

export function getStoredVerifiedLocalVendors(): VendorAccount[] {
  const vendors = getStoredVendors();
  return filterVerifiedLocalVendors(vendors);
}

export function saveStoredVendors(vendors: VendorAccount[]): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(vendors));
  } catch (e) {
    console.error('Failed to save vendors to localStorage', e);
  }
}

export function getCurrentVendorSession(): VendorAccount | null {
  if (typeof window === 'undefined') return INITIAL_DEMO_VENDORS[0];
  try {
    const raw = localStorage.getItem(CURRENT_VENDOR_KEY);
    if (!raw) return null;
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

export function setCurrentVendorSession(vendor: VendorAccount | null): void {
  if (typeof window === 'undefined') return;
  try {
    if (!vendor) {
      localStorage.removeItem(CURRENT_VENDOR_KEY);
    } else {
      localStorage.setItem(CURRENT_VENDOR_KEY, JSON.stringify(vendor));
    }
  } catch (e) {
    console.error('Failed to persist vendor session', e);
  }
}

export function registerNewVendor(newVendor: VendorAccount): VendorAccount {
  const vendors = getStoredVendors();
  const updated = [newVendor, ...vendors.filter((v) => v.id !== newVendor.id && v.workEmail !== newVendor.workEmail)];
  saveStoredVendors(updated);
  setCurrentVendorSession(newVendor);
  return newVendor;
}

export function updateVendorProfile(updatedVendor: VendorAccount): void {
  const vendors = getStoredVendors();
  const nextList = vendors.map((v) => (v.id === updatedVendor.id ? updatedVendor : v));
  saveStoredVendors(nextList);
  setCurrentVendorSession(updatedVendor);
}

/**
 * Synchronize local vendor registry with server database (/api/vendors/register)
 */
export async function syncVendorsWithServer(): Promise<VendorAccount[]> {
  if (typeof window === 'undefined') return INITIAL_DEMO_VENDORS;
  try {
    const res = await fetch('/api/vendors/register', { method: 'GET' });
    if (res.ok) {
      const data = await res.json();
      if (Array.isArray(data.vendors) && data.vendors.length > 0) {
        const local = getStoredVendors();
        const mergedMap = new Map<string, VendorAccount>();
        // Add local first
        local.forEach((v) => mergedMap.set(v.workEmail.toLowerCase(), v));
        // Server vendors take precedence
        data.vendors.forEach((v: VendorAccount) => mergedMap.set(v.workEmail.toLowerCase(), v));
        const merged = Array.from(mergedMap.values());
        saveStoredVendors(merged);
        return merged;
      }
    }
  } catch (e) {
    console.warn('Failed to sync vendors with server:', e);
  }
  return getStoredVendors();
}

/**
 * Check if an email address is already registered to an existing vendor account
 */
export function isEmailRegistered(email: string): boolean {
  if (!email) return false;
  const vendors = getStoredVendors();
  const normalized = email.trim().toLowerCase();
  return vendors.some((v) => v.workEmail.trim().toLowerCase() === normalized);
}

/**
 * Check if a business name is already registered to an existing vendor account
 */
export function isBusinessNameRegistered(businessName: string): boolean {
  if (!businessName) return false;
  const vendors = getStoredVendors();
  const normalized = businessName.trim().toLowerCase();
  return vendors.some(
    (v) =>
      v.businessName.trim().toLowerCase() === normalized ||
      (v.dbaName && v.dbaName.trim().toLowerCase() === normalized)
  );
}

/**
 * Executes the 6 System Processing steps:
 * 1. Validate all input fields
 * 2. Check if the email address already exists
 * 3. Check if the business name already exists
 * 4. Save the vendor information to the database
 * 5. Create a vendor account
 * 6. Return appropriate success or error message
 */
export function processVendorRegistration(input: VendorRegistrationInput): RegistrationResult {
  // Step 1: Validate all input fields
  const fieldErrors: NonNullable<RegistrationResult['fieldErrors']> = {};

  if (!input.businessName || !input.businessName.trim()) {
    fieldErrors.businessName = 'Business name is required.';
  } else if (input.businessName.trim().length < 2) {
    fieldErrors.businessName = 'Business name must be at least 2 characters.';
  }

  if (!input.ownerName || !input.ownerName.trim()) {
    fieldErrors.ownerName = 'Owner name is required.';
  } else if (input.ownerName.trim().length < 2) {
    fieldErrors.ownerName = 'Owner name must be at least 2 characters.';
  }

  if (!input.contactNumber || !input.contactNumber.trim()) {
    fieldErrors.contactNumber = 'Contact number is required.';
  } else {
    const digits = input.contactNumber.replace(/\D/g, '');
    const phoneRegex = /^[+]?[-()\s./0-9]{7,25}$/;
    if (digits.length < 7 || digits.length > 15 || !phoneRegex.test(input.contactNumber.trim())) {
      fieldErrors.contactNumber = 'Please enter a valid contact number (7–15 digits, e.g. +1 555-0199 or 0917-123-4567).';
    }
  }

  if (!input.email || !input.email.trim()) {
    fieldErrors.email = 'Email address is required.';
  } else {
    const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    if (!emailRegex.test(input.email.trim())) {
      fieldErrors.email = 'Please enter a valid email address format (e.g. owner@business.com).';
    }
  }

  if (!input.businessAddress || !input.businessAddress.trim()) {
    fieldErrors.businessAddress = 'Business address is required.';
  } else if (input.businessAddress.trim().length < 5) {
    fieldErrors.businessAddress = 'Please enter a complete business address.';
  }

  if (!input.businessType || !String(input.businessType).trim()) {
    fieldErrors.businessType = 'Please select a business type.';
  }

  if (!input.password) {
    fieldErrors.password = 'Password is required.';
  } else if (input.password.length < 6) {
    fieldErrors.password = 'Password must be at least 6 characters.';
  }

  if (input.confirmPassword !== undefined) {
    if (!input.confirmPassword) {
      fieldErrors.confirmPassword = 'Please confirm your password.';
    } else if (input.confirmPassword !== input.password) {
      fieldErrors.confirmPassword = 'Passwords do not match.';
    }
  }

  // If initial input validation failed, return step 1 error
  if (Object.keys(fieldErrors).length > 0) {
    return {
      success: false,
      message: 'Form validation failed. Please check the highlighted fields.',
      fieldErrors,
    };
  }

  // Step 2: Check if the email address already exists
  if (isEmailRegistered(input.email)) {
    return {
      success: false,
      message: `The email address "${input.email.trim()}" is already registered. Please sign in or use a different email address.`,
      fieldErrors: {
        email: `The email address "${input.email.trim()}" is already associated with an existing vendor account.`,
      },
    };
  }

  // Step 3: Check if the business name already exists
  if (isBusinessNameRegistered(input.businessName)) {
    return {
      success: false,
      message: `The business name "${input.businessName.trim()}" is already registered. Please choose a unique business name.`,
      fieldErrors: {
        businessName: `The business name "${input.businessName.trim()}" is already taken by another merchant.`,
      },
    };
  }

  // Step 4 & 5: Save vendor information to database & Create vendor account
  const newVendorId = `vnd_${Math.floor(100000 + Math.random() * 900000)}`;
  const slug = input.businessName
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');

  const isLocal = input.city ? isButuanCity(input.city) : isButuanCity(input.businessAddress);
  const resolvedCity = isLocal ? 'Butuan City' : (input.city?.trim() || 'Registered City');
  const resolvedState = isLocal ? 'Agusan del Norte' : (input.state?.trim() || 'State/Region');
  const resolvedCountry = isLocal ? 'Philippines' : (input.country?.trim() || 'United States');
  const resolvedPostalCode = isLocal ? '8600' : (input.postalCode?.trim() || '00000');

  const newVendor: VendorAccount = {
    id: newVendorId,
    fullName: input.ownerName.trim(),
    workEmail: input.email.trim(),
    password: input.password,
    phoneNumber: input.contactNumber.trim(),
    jobTitle: 'Authorized Principal / Owner',
    createdAt: new Date().toISOString(),

    businessName: input.businessName.trim(),
    dbaName: input.businessName.trim(),
    businessType: (input.businessType as BusinessType) || 'sole_proprietorship',
    industryCategory: 'consumer_electronics',
    taxId: input.governmentId?.trim() || 'NOT_PROVIDED',
    websiteUrl: `https://${slug || 'business'}.merchanta.market`,
    annualRevenueBand: '$250K - $1M',
    expectedMonthlyVolume: '200 - 500 orders',

    businessAddress: {
      street: input.businessAddress.trim(),
      barangay: input.barangay?.trim() || undefined,
      city: resolvedCity,
      state: resolvedState,
      postalCode: resolvedPostalCode,
      country: resolvedCountry,
    },
    fulfillmentType: 'merchant_hub_3pl',

    banking: {
      bankName: 'Commercial Partner Bank',
      accountHolderName: input.businessName.trim(),
      accountType: 'checking',
      routingNumber: '121000358',
      accountNumberMasked: '•••• •••• 9821',
      currency: isLocal ? 'PHP (₱)' : 'USD ($)',
      payoutSchedule: 'weekly',
    },

    storeSlug: slug || 'vendor-store',
    storeHeadline: `Official Store of ${input.businessName.trim()}`,
    storeBio: `Welcome to ${input.businessName.trim()}. Direct vendor operations and authorized merchandising catalog.`,
    brandColor: '#4f46e5',
    logoUrl: 'https://images.unsplash.com/photo-1546435770-a3e426bf472b?auto=format&fit=crop&w=240&q=80',
    bannerUrl: 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?auto=format&fit=crop&w=1200&q=80',

    verificationStatus: 'verified',
    sellerTier: 'Verified Partner',
    verifiedAt: new Date().toISOString(),
    isVerifiedLocal: isLocal,
    kycDocuments: input.documentFileName
      ? [
          {
            id: `doc_${Date.now()}`,
            type: 'owner_id',
            name: input.documentFileName,
            status: 'approved',
            fileSize: input.documentFileSize || '1.0 MB',
            uploadedAt: new Date().toISOString().split('T')[0],
          },
        ]
      : [],

    metrics: {
      totalRevenue: 0,
      monthlyGrowth: 0,
      ordersCount: 0,
      conversionRate: 0,
      storeViews: 1,
      availableBalance: 0,
      pendingPayout: 0,
      nextPayoutDate: 'Next scheduled cycle',
    },
    products: [],
    orders: [],
  };

  // Step 4: Save to database (persists in storage)
  registerNewVendor(newVendor);

  // Step 6: Return appropriate success message
  return {
    success: true,
    message: `Vendor account for "${newVendor.businessName}" was successfully created and registered in the database.`,
    vendor: newVendor,
  };
}

