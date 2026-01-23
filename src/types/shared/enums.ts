/**
 * Centralized Enum Type Definitions
 * 
 * This file contains shared enum types used across the frontend.
 * These enums should match the backend Prisma schema definitions.
 */

/**
 * OFSP Variety Enum
 * Matches backend OFSPVariety enum (uppercase)
 */
export enum OFSPVariety {
  KENYA = 'KENYA',
  SPK004 = 'SPK004',
  KAKAMEGA = 'KAKAMEGA',
  KABODE = 'KABODE',
  OTHER = 'OTHER',
}

/**
 * Sourcing Product Type Enum
 * Matches backend SourcingProductType enum
 */
export enum SourcingProductType {
  FRESH_ROOTS = 'FRESH_ROOTS',
  PROCESS_GRADE = 'PROCESS_GRADE',
  PLANTING_VINES = 'PLANTING_VINES',
  OFSP = 'OFSP',
}

/**
 * Quality Grade Enum
 * Matches backend QualityGrade enum
 */
export enum QualityGrade {
  A = 'A',
  B = 'B',
  C = 'C',
}

/**
 * Array of valid OFSP variety values
 */
export const OFSP_VARIETY_VALUES = Object.values(OFSPVariety) as string[];

/**
 * Array of valid sourcing product type values
 */
export const SOURCING_PRODUCT_TYPE_VALUES = Object.values(SourcingProductType) as string[];

/**
 * Array of valid quality grade values
 */
export const QUALITY_GRADE_VALUES = Object.values(QualityGrade) as string[];

/**
 * OFSP Variety display labels
 */
export const OFSP_VARIETY_LABELS: Record<OFSPVariety, string> = {
  [OFSPVariety.KENYA]: 'Kenya',
  [OFSPVariety.SPK004]: 'SPK004',
  [OFSPVariety.KAKAMEGA]: 'Kakamega',
  [OFSPVariety.KABODE]: 'Kabode',
  [OFSPVariety.OTHER]: 'Other',
};

/**
 * Sourcing Product Type display labels
 */
export const SOURCING_PRODUCT_TYPE_LABELS: Record<SourcingProductType, string> = {
  [SourcingProductType.FRESH_ROOTS]: 'Fresh OFSP Roots',
  [SourcingProductType.PROCESS_GRADE]: 'OFSP Flour',
  [SourcingProductType.PLANTING_VINES]: 'Planting Vines',
  [SourcingProductType.OFSP]: 'OFSP (General)',
};

/**
 * Quality Grade display labels
 */
export const QUALITY_GRADE_LABELS: Record<QualityGrade, string> = {
  [QualityGrade.A]: 'Grade A (Premium)',
  [QualityGrade.B]: 'Grade B (Standard)',
  [QualityGrade.C]: 'Grade C (Processing)',
};
