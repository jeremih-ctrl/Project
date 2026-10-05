export type BusinessType =
  | 'sole_proprietorship'
  | 'llc'
  | 'corporation'
  | 'partnership'
  | 'non_profit';

export type IndustryCategory =
  | 'fashion_apparel'
  | 'consumer_electronics'
  | 'health_beauty'
  | 'home_lifestyle'
  | 'gourmet_food'
  | 'artisan_crafts'
  | 'software_digital';

export type ShippingFulfillmentType = 'self_fulfilled' | 'merchant_hub_3pl' | 'digital_download';

export type PayoutSchedule = 'daily' | 'weekly' | 'biweekly' | 'monthly';

export type VerificationStatus = 'verified' | 'in_review' | 'action_required';

export interface BusinessAddress {
  street: string;
  unitSuite?: string;
  barangay?: string;
  city: string;
  state: string;
  postalCode: string;
  country: string;
}

export interface BankAccountDetails {
  bankName: string;
  accountHolderName: string;
  accountType: 'checking' | 'savings';
  routingNumber: string;
  accountNumberMasked: string;
  currency: string;
  payoutSchedule: PayoutSchedule;
}

export interface VendorProduct {
  id: string;
  title: string;
  sku: string;
  category: string;
  price: number;
  stock: number;
  status: 'active' | 'draft' | 'low_stock';
  imageUrl: string;
  salesCount: number;
}

export interface VendorOrder {
  id: string;
  orderNumber: string;
  customerName: string;
  date: string;
  total: number;
  status: 'processing' | 'shipped' | 'delivered' | 'cancelled';
  itemsCount: number;
  shippingAddress: string;
}

export interface KYCDocument {
  id: string;
  type: 'business_license' | 'tax_id_certificate' | 'articles_of_incorporation' | 'owner_id';
  name: string;
  status: 'approved' | 'reviewing' | 'uploaded';
  fileSize: string;
  uploadedAt: string;
}

export interface VendorAccount {
  id: string;
  // Personal / Credential
  fullName: string;
  workEmail: string;
  password?: string;
  phoneNumber: string;
  jobTitle: string;
  createdAt: string;

  // Business Legal Information
  businessName: string;
  dbaName?: string;
  businessType: BusinessType;
  industryCategory: IndustryCategory;
  taxId: string;
  websiteUrl: string;
  annualRevenueBand: string;
  expectedMonthlyVolume: string;

  // Physical Location & Logistics
  businessAddress: BusinessAddress;
  fulfillmentType: ShippingFulfillmentType;

  // Payout & Banking
  banking: BankAccountDetails;

  // Storefront & Brand Identity
  storeSlug: string;
  storeHeadline: string;
  storeBio: string;
  brandColor: string;
  logoUrl: string;
  bannerUrl: string;

  // Verification & Status
  // Verification & Status
  verificationStatus: VerificationStatus;
  sellerTier: 'Standard Merchant' | 'Verified Partner' | 'Enterprise Platinum';
  kycDocuments: KYCDocument[];
  verifiedAt?: string;
  isVerifiedLocal?: boolean;

  // Performance Metrics & Data
  metrics: {
    totalRevenue: number;
    monthlyGrowth: number;
    ordersCount: number;
    conversionRate: number;
    storeViews: number;
    availableBalance: number;
    pendingPayout: number;
    nextPayoutDate: string;
  };
  products: VendorProduct[];
  orders: VendorOrder[];
}

export interface VendorRegistrationInput {
  businessName: string;
  ownerName: string;
  contactNumber: string;
  email: string;
  businessAddress: string;
  city?: string;
  barangay?: string;
  state?: string;
  postalCode?: string;
  country?: string;
  businessType: BusinessType | string;
  governmentId?: string;
  password: string;
  confirmPassword?: string;
  documentFileName?: string;
  documentFileSize?: string;
}

export interface RegistrationResult {
  success: boolean;
  message: string;
  vendor?: VendorAccount;
  fieldErrors?: {
    businessName?: string;
    ownerName?: string;
    contactNumber?: string;
    email?: string;
    businessAddress?: string;
    businessType?: string;
    password?: string;
    confirmPassword?: string;
    governmentId?: string;
  };
}

export const TARGET_LOCAL_CITY = 'Butuan City';
export const TARGET_LOCAL_COUNTRY = 'Philippines';

/**
 * Checks whether a given city string represents Butuan City (case-insensitive).
 */
export function isButuanCity(city?: string): boolean {
  if (!city) return false;
  const normalized = city.trim().toLowerCase();
  return (
    normalized === 'butuan city' ||
    normalized === 'butuan' ||
    normalized.startsWith('butuan')
  );
}

/**
 * Evaluates whether a vendor is a verified local vendor in Butuan City, Philippines.
 *
 * Requirements:
 * 1. Physical business location must be in Butuan City (businessAddress.city = "Butuan City").
 *    (Delivering or shipping to Butuan does NOT satisfy this requirement).
 * 2. Verification requirements are satisfied: verificationStatus = "verified".
 *
 * Conceptually:
 * city = "Butuan City" AND verificationStatus = "verified"
 */
export function isVerifiedLocalVendor(
  vendor: {
    businessAddress?: { city?: string; country?: string; street?: string };
    verificationStatus?: string;
  } | null | undefined
): boolean {
  if (!vendor || !vendor.businessAddress) return false;
  const isCityButuan = isButuanCity(vendor.businessAddress.city);
  const isStatusVerified = vendor.verificationStatus === 'verified';
  return isCityButuan && isStatusVerified;
}

/**
 * Filters a vendor collection returning only verified local vendors physically located in Butuan City.
 */
export function filterVerifiedLocalVendors<
  T extends { businessAddress?: { city?: string }; verificationStatus?: string }
>(vendors: T[]): T[] {
  return vendors.filter(isVerifiedLocalVendor);
}

