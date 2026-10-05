import fs from 'fs';
import path from 'path';
import {
  VendorAccount,
  VendorRegistrationInput,
  RegistrationResult,
  BusinessType,
  isButuanCity,
  isVerifiedLocalVendor,
  filterVerifiedLocalVendors,
} from '../types/vendor';
import { INITIAL_DEMO_VENDORS } from './vendorStorage';

export { isButuanCity, isVerifiedLocalVendor, filterVerifiedLocalVendors };

const DB_DIR = path.join(process.cwd(), 'data');
const DB_FILE = path.join(DB_DIR, 'vendors.json');

function ensureDbFile(): void {
  try {
    if (!fs.existsSync(DB_DIR)) {
      fs.mkdirSync(DB_DIR, { recursive: true });
    }
    if (!fs.existsSync(DB_FILE)) {
      fs.writeFileSync(DB_FILE, JSON.stringify(INITIAL_DEMO_VENDORS, null, 2), 'utf-8');
    }
  } catch (err) {
    console.error('Failed to initialize server vendor database file:', err);
  }
}

export function getServerVendors(): VendorAccount[] {
  ensureDbFile();
  try {
    if (fs.existsSync(DB_FILE)) {
      const raw = fs.readFileSync(DB_FILE, 'utf-8');
      const data = JSON.parse(raw);
      if (Array.isArray(data) && data.length > 0) {
        return data;
      }
    }
  } catch (err) {
    console.error('Error reading vendor database file:', err);
  }
  return INITIAL_DEMO_VENDORS;
}

export function getServerVerifiedLocalVendors(): VendorAccount[] {
  const vendors = getServerVendors();
  return filterVerifiedLocalVendors(vendors);
}

export function saveServerVendors(vendors: VendorAccount[]): void {
  ensureDbFile();
  try {
    fs.writeFileSync(DB_FILE, JSON.stringify(vendors, null, 2), 'utf-8');
  } catch (err) {
    console.error('Error writing vendor database file:', err);
  }
}

export function processServerVendorRegistration(input: VendorRegistrationInput): RegistrationResult {
  const currentVendors = getServerVendors();

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
      fieldErrors.contactNumber = 'Please enter a valid phone number (7–15 digits, e.g. +1 555-0199 or 0917-123-4567).';
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

  if (Object.keys(fieldErrors).length > 0) {
    return {
      success: false,
      message: 'Validation failed on one or more fields.',
      fieldErrors,
    };
  }

  // Step 2: Check if email address already exists
  const normalizedEmail = input.email.trim().toLowerCase();
  const emailExists = currentVendors.some((v) => v.workEmail.trim().toLowerCase() === normalizedEmail);
  if (emailExists) {
    return {
      success: false,
      message: `The email address "${input.email.trim()}" is already registered. Please sign in or use a different email address.`,
      fieldErrors: {
        email: `The email address "${input.email.trim()}" is already associated with an existing vendor account.`,
      },
    };
  }

  // Step 3: Check if business name already exists
  const normalizedBusiness = input.businessName.trim().toLowerCase();
  const businessExists = currentVendors.some(
    (v) =>
      v.businessName.trim().toLowerCase() === normalizedBusiness ||
      (v.dbaName && v.dbaName.trim().toLowerCase() === normalizedBusiness)
  );
  if (businessExists) {
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

  // Save to persistent database
  const updatedList = [newVendor, ...currentVendors];
  saveServerVendors(updatedList);

  return {
    success: true,
    message: `Vendor account for "${newVendor.businessName}" was successfully created and registered in the database.`,
    vendor: newVendor,
  };
}
