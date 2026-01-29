/**
 * Location Constants
 * 
 * Valid administrative divisions for the system
 */

export const VALID_SUBCOUNTIES = [
  "Kangundo",
  "Kathiani",
  "Masinga",
  "Yatta",
] as const;

export type SubCounty = typeof VALID_SUBCOUNTIES[number];

/**
 * Get subcounty display name
 */
export function getSubCountyDisplayName(subCounty: string): string {
  return VALID_SUBCOUNTIES.includes(subCounty as SubCounty) ? subCounty : subCounty;
}

/**
 * Validate subcounty
 */
export function isValidSubCounty(subCounty: string): boolean {
  return VALID_SUBCOUNTIES.includes(subCounty as SubCounty);
}
