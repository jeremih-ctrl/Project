import { NextRequest, NextResponse } from 'next/server';
import {
  processServerVendorRegistration,
  getServerVendors,
  isVerifiedLocalVendor,
  filterVerifiedLocalVendors,
} from '../../../../lib/serverDb';
import { VendorRegistrationInput } from '../../../../types/vendor';

export async function GET(req: NextRequest) {
  const vendors = getServerVendors();
  const searchParams = req.nextUrl.searchParams;
  const verifiedLocalOnly =
    searchParams.get('verifiedLocal') === 'true' ||
    searchParams.get('localOnly') === 'true' ||
    searchParams.get('filter') === 'verified_local';
  const cityQuery = searchParams.get('city');

  let filtered = vendors;
  if (verifiedLocalOnly) {
    filtered = filterVerifiedLocalVendors(filtered);
  } else if (cityQuery) {
    const norm = cityQuery.trim().toLowerCase();
    filtered = filtered.filter((v) => v.businessAddress?.city?.toLowerCase() === norm);
  }

  const verifiedLocalVendors = filterVerifiedLocalVendors(vendors);

  return NextResponse.json({
    total: filtered.length,
    allTotal: vendors.length,
    verifiedLocalTotal: verifiedLocalVendors.length,
    vendors: filtered.map((v) => ({
      ...v,
      isVerifiedLocal: isVerifiedLocalVendor(v),
    })),
  });
}

export async function POST(req: NextRequest) {
  try {
    const body = (await req.json()) as VendorRegistrationInput;

    if (!body) {
      return NextResponse.json(
        {
          success: false,
          message: 'Request payload is empty.',
        },
        { status: 400 }
      );
    }

    // Execute the 6 System Processing steps on the server
    const result = processServerVendorRegistration(body);

    if (!result.success) {
      const isDuplicate =
        (result.fieldErrors?.email && result.fieldErrors.email.toLowerCase().includes('already')) ||
        (result.fieldErrors?.businessName && result.fieldErrors.businessName.toLowerCase().includes('already'));
      return NextResponse.json(result, { status: isDuplicate ? 409 : 422 });
    }

    return NextResponse.json(result, { status: 201 });
  } catch (error) {
    console.error('Error during vendor registration API processing:', error);
    return NextResponse.json(
      {
        success: false,
        message: 'An unexpected server error occurred while processing vendor registration.',
      },
      { status: 500 }
    );
  }
}
