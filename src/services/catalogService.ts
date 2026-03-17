import { apiGet, apiPost } from "@/lib/api-client";

export interface VarietyConfig {
  id: string;
  code: string;
  label: string;
  description?: string;
  isActive: boolean;
  sortOrder: number;
}

export interface ProductTypeConfig {
  id: string;
  code: string;
  label: string;
  description?: string;
  isActive: boolean;
  sortOrder: number;
}

export interface QualityGradeConfig {
  id: string;
  code: string;
  label: string;
  description?: string;
  isActive: boolean;
  sortOrder: number;
}

export interface QuantityTypeConfig {
  id: string;
  productTypeCode: string;
  code: string;
  label: string;
  description?: string;
  isActive: boolean;
  sortOrder: number;
}

export async function getActiveVarieties(): Promise<VarietyConfig[]> {
  const varieties = await apiGet<VarietyConfig[]>("/catalog/varieties");
  return Array.isArray(varieties) ? varieties : [];
}

export async function getActiveProductTypes(): Promise<ProductTypeConfig[]> {
  const types = await apiGet<ProductTypeConfig[]>("/catalog/product-types");
  return Array.isArray(types) ? types : [];
}

export async function getActiveQualityGrades(): Promise<QualityGradeConfig[]> {
  const grades = await apiGet<QualityGradeConfig[]>("/catalog/quality-grades");
  return Array.isArray(grades) ? grades : [];
}

/** Staff: fetch all varieties (optionally including inactive). */
export async function getVarieties(includeInactive = false): Promise<VarietyConfig[]> {
  const q = includeInactive ? "?includeInactive=true" : "";
  const list = await apiGet<VarietyConfig[]>(`/catalog/varieties${q}`);
  return Array.isArray(list) ? list : [];
}

/** Staff: fetch all product types (optionally including inactive). */
export async function getProductTypes(includeInactive = false): Promise<ProductTypeConfig[]> {
  const q = includeInactive ? "?includeInactive=true" : "";
  const list = await apiGet<ProductTypeConfig[]>(`/catalog/product-types${q}`);
  return Array.isArray(list) ? list : [];
}

/** Staff: fetch all quality grades (optionally including inactive). */
export async function getQualityGrades(includeInactive = false): Promise<QualityGradeConfig[]> {
  const q = includeInactive ? "?includeInactive=true" : "";
  const list = await apiGet<QualityGradeConfig[]>(`/catalog/quality-grades${q}`);
  return Array.isArray(list) ? list : [];
}

export interface UpsertVarietyInput {
  code: string;
  label: string;
  description?: string;
  isActive?: boolean;
  sortOrder?: number;
}

export interface UpsertProductTypeInput {
  code: string;
  label: string;
  description?: string;
  isActive?: boolean;
  sortOrder?: number;
}

export interface UpsertQualityGradeInput {
  code: string;
  label: string;
  description?: string;
  isActive?: boolean;
  sortOrder?: number;
}

/** Staff: create or update a variety. */
export async function upsertVariety(input: UpsertVarietyInput): Promise<VarietyConfig> {
  return apiPost<VarietyConfig>("/catalog/varieties", input);
}

/** Staff: create or update a product type. */
export async function upsertProductType(input: UpsertProductTypeInput): Promise<ProductTypeConfig> {
  return apiPost<ProductTypeConfig>("/catalog/product-types", input);
}

/** Staff: create or update a quality grade. */
export async function upsertQualityGrade(input: UpsertQualityGradeInput): Promise<QualityGradeConfig> {
  return apiPost<QualityGradeConfig>("/catalog/quality-grades", input);
}

/** Get quantity types (units) for a product type. */
export async function getQuantityTypes(
  productTypeCode: string,
  includeInactive = false
): Promise<QuantityTypeConfig[]> {
  const q = includeInactive ? "?includeInactive=true" : "";
  const list = await apiGet<QuantityTypeConfig[]>(
    `/catalog/product-types/${encodeURIComponent(productTypeCode)}/quantity-types${q}`
  );
  return Array.isArray(list) ? list : [];
}

/** Staff: fetch all quantity types across product types. */
export async function getAllQuantityTypes(
  includeInactive = false
): Promise<QuantityTypeConfig[]> {
  const q = includeInactive ? "?includeInactive=true" : "";
  const list = await apiGet<QuantityTypeConfig[]>(`/catalog/quantity-types${q}`);
  return Array.isArray(list) ? list : [];
}

export interface UpsertQuantityTypeInput {
  productTypeCode: string;
  code: string;
  label: string;
  description?: string;
  isActive?: boolean;
  sortOrder?: number;
}

/** Staff: create or update a quantity type. */
export async function upsertQuantityType(
  input: UpsertQuantityTypeInput
): Promise<QuantityTypeConfig> {
  return apiPost<QuantityTypeConfig>("/catalog/quantity-types", input);
}

/** Staff: delete a quantity type. */
export async function deleteQuantityType(
  productTypeCode: string,
  code: string
): Promise<void> {
  await apiPost("/catalog/quantity-types/delete", { productTypeCode, code });
}

