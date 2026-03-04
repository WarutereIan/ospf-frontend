/**
 * Location hierarchy types (County → SubCounty → Ward → Village)
 * Used for dropdowns, user assignment, and analytics.
 */

export interface County {
  id: string;
  name: string;
  slug: string; // normalized/standardized, e.g. "machakos"
  code?: string | null;
  createdAt?: string;
  updatedAt?: string;
  _count?: { subCounties: number };
}

export interface SubCounty {
  id: string;
  name: string;
  slug: string; // normalized per county, e.g. "kangundo"
  countyId: string;
  county?: County;
  createdAt?: string;
  updatedAt?: string;
  _count?: { wards: number };
}

export interface Ward {
  id: string;
  name: string;
  slug: string; // normalized per sub-county, e.g. "kangundo-north"
  subCountyId: string;
  subCounty?: SubCounty;
  createdAt?: string;
  updatedAt?: string;
  _count?: { villages: number };
}

export interface Village {
  id: string;
  name: string;
  slug: string; // normalized per ward, e.g. "masinga-central"
  wardId: string;
  ward?: Ward;
  createdAt?: string;
  updatedAt?: string;
}
