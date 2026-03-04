/**
 * Locations Service
 * CRUD and list for location hierarchy: counties, sub-counties, wards, villages.
 * Used for dropdowns (user assignment, produce form) and analytics.
 */

import { apiGet, apiPost, apiPut, apiDelete } from '@/lib/api-client';
import type { County, SubCounty, Ward, Village } from '@/types/locations';

const PREFIX = '/locations';

export async function getCounties(): Promise<County[]> {
  const data = await apiGet<County[]>(`${PREFIX}/counties`);
  return Array.isArray(data) ? data : [];
}

export async function getCountyById(id: string): Promise<County | null> {
  try {
    return await apiGet<County>(`${PREFIX}/counties/${id}`);
  } catch {
    return null;
  }
}

export async function createCounty(body: { name: string; code?: string }): Promise<County> {
  return apiPost<County>(`${PREFIX}/counties`, body);
}

export async function updateCounty(id: string, body: { name?: string; code?: string }): Promise<County> {
  return apiPut<County>(`${PREFIX}/counties/${id}`, body);
}

export async function deleteCounty(id: string): Promise<void> {
  await apiDelete(`${PREFIX}/counties/${id}`);
}

// ---------- SubCounties ----------
export async function getSubCounties(countyId?: string): Promise<SubCounty[]> {
  const params = countyId ? { countyId } : undefined;
  const data = await apiGet<SubCounty[]>(`${PREFIX}/subcounties`, params);
  return Array.isArray(data) ? data : [];
}

export async function getSubCountyById(id: string): Promise<SubCounty | null> {
  try {
    return await apiGet<SubCounty>(`${PREFIX}/subcounties/${id}`);
  } catch {
    return null;
  }
}

export async function createSubCounty(body: { name: string; countyId: string }): Promise<SubCounty> {
  return apiPost<SubCounty>(`${PREFIX}/subcounties`, body);
}

export async function updateSubCounty(
  id: string,
  body: { name?: string; countyId?: string }
): Promise<SubCounty> {
  return apiPut<SubCounty>(`${PREFIX}/subcounties/${id}`, body);
}

export async function deleteSubCounty(id: string): Promise<void> {
  await apiDelete(`${PREFIX}/subcounties/${id}`);
}

// ---------- Wards ----------
export async function getWards(subCountyId?: string): Promise<Ward[]> {
  const params = subCountyId ? { subCountyId } : undefined;
  const data = await apiGet<Ward[]>(`${PREFIX}/wards`, params);
  return Array.isArray(data) ? data : [];
}

export async function getWardById(id: string): Promise<Ward | null> {
  try {
    return await apiGet<Ward>(`${PREFIX}/wards/${id}`);
  } catch {
    return null;
  }
}

export async function createWard(body: { name: string; subCountyId: string }): Promise<Ward> {
  return apiPost<Ward>(`${PREFIX}/wards`, body);
}

export async function updateWard(
  id: string,
  body: { name?: string; subCountyId?: string }
): Promise<Ward> {
  return apiPut<Ward>(`${PREFIX}/wards/${id}`, body);
}

export async function deleteWard(id: string): Promise<void> {
  await apiDelete(`${PREFIX}/wards/${id}`);
}

// ---------- Villages ----------
export async function getVillages(wardId?: string): Promise<Village[]> {
  const params = wardId ? { wardId } : undefined;
  const data = await apiGet<Village[]>(`${PREFIX}/villages`, params);
  return Array.isArray(data) ? data : [];
}

export async function getVillageById(id: string): Promise<Village | null> {
  try {
    return await apiGet<Village>(`${PREFIX}/villages/${id}`);
  } catch {
    return null;
  }
}

export async function createVillage(body: { name: string; wardId: string }): Promise<Village> {
  return apiPost<Village>(`${PREFIX}/villages`, body);
}

export async function updateVillage(
  id: string,
  body: { name?: string; wardId?: string }
): Promise<Village> {
  return apiPut<Village>(`${PREFIX}/villages/${id}`, body);
}

export async function deleteVillage(id: string): Promise<void> {
  await apiDelete(`${PREFIX}/villages/${id}`);
}
