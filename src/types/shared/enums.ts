/**
 * Commodity code types - now flexible strings from catalog.
 * Legacy constants kept only for fallback when catalog is empty.
 */

/** Variety, product type, and grade codes are now arbitrary strings from catalog config */
export type VarietyCode = string;
export type ProductTypeCode = string;
export type QualityGradeCode = string;

/** @deprecated Use VarietyCode - kept for backward compatibility */
export type OFSPVariety = string;

/** @deprecated Use ProductTypeCode - kept for backward compatibility */
export type SourcingProductType = string;

/** @deprecated Use QualityGradeCode - kept for backward compatibility */
export type QualityGrade = string;

/** Default variety codes (fallback when catalog empty) */
export const OFSP_VARIETY_VALUES = ["KENYA", "SPK004", "KAKAMEGA", "KABODE", "OTHER"] as const;

/** Default product type codes */
export const SOURCING_PRODUCT_TYPE_VALUES = ["FRESH_ROOTS", "PROCESS_GRADE", "PLANTING_VINES", "OFSP"] as const;

/** Default quality grade codes */
export const QUALITY_GRADE_VALUES = ["A", "B", "C"] as const;
