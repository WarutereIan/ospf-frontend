/**
 * Grading Matrix Data
 * 
 * Defines the grading matrix criteria and how they map to quality grades (A, B, C)
 * Based on:
 * 1. Weight Ranges - Categorization by size and weight
 * 2. Color Intensity - Orange flesh depth as quality indicator
 * 3. Physical Condition - Absence of rot, cuts, pest damage
 * 4. Freshness - Maturity and time since harvest
 */

import type {
  WeightRangeDefinition,
  ColorIntensityDefinition,
  PhysicalConditionDefinition,
  FreshnessDefinition,
  QualityGrade,
} from "@/types/quality";

/**
 * Weight Range Definitions
 */
export const weightRangeDefinitions: WeightRangeDefinition[] = [
  {
    value: "small",
    label: "Small",
    description: "< 100g per root",
    minWeight: 0,
    maxWeight: 100,
    gradeMapping: {
      A: false,
      B: true,
      C: true,
    },
  },
  {
    value: "medium",
    label: "Medium",
    description: "100g - 200g per root",
    minWeight: 100,
    maxWeight: 200,
    gradeMapping: {
      A: true,
      B: true,
      C: true,
    },
  },
  {
    value: "large",
    label: "Large",
    description: "200g - 400g per root",
    minWeight: 200,
    maxWeight: 400,
    gradeMapping: {
      A: true,
      B: true,
      C: true,
    },
  },
  {
    value: "extra_large",
    label: "Extra Large",
    description: "> 400g per root",
    minWeight: 400,
    maxWeight: undefined,
    gradeMapping: {
      A: true,
      B: true,
      C: true,
    },
  },
];

/**
 * Color Intensity Definitions
 * Scale: 1-10 (1 = pale, 10 = deep orange)
 */
export const colorIntensityDefinitions: ColorIntensityDefinition[] = [
  {
    score: 1,
    label: "Very Pale",
    description: "Minimal orange color",
    gradeMapping: { A: false, B: false, C: true },
  },
  {
    score: 2,
    label: "Pale",
    description: "Light orange",
    gradeMapping: { A: false, B: false, C: true },
  },
  {
    score: 3,
    label: "Light",
    description: "Moderate orange",
    gradeMapping: { A: false, B: true, C: true },
  },
  {
    score: 4,
    label: "Moderate",
    description: "Good orange color",
    gradeMapping: { A: false, B: true, C: true },
  },
  {
    score: 5,
    label: "Fair",
    description: "Decent orange depth",
    gradeMapping: { A: false, B: true, C: true },
  },
  {
    score: 6,
    label: "Good",
    description: "Rich orange color",
    gradeMapping: { A: true, B: true, C: true },
  },
  {
    score: 7,
    label: "Very Good",
    description: "Deep orange",
    gradeMapping: { A: true, B: true, C: false },
  },
  {
    score: 8,
    label: "Excellent",
    description: "Very deep orange",
    gradeMapping: { A: true, B: true, C: false },
  },
  {
    score: 9,
    label: "Premium",
    description: "Exceptional orange depth",
    gradeMapping: { A: true, B: false, C: false },
  },
  {
    score: 10,
    label: "Premium+",
    description: "Maximum orange intensity",
    gradeMapping: { A: true, B: false, C: false },
  },
];

/**
 * Physical Condition Definitions
 */
export const physicalConditionDefinitions: PhysicalConditionDefinition[] = [
  {
    value: "excellent",
    label: "Excellent",
    description: "No rot, cuts, or pest damage. Perfect condition.",
    gradeMapping: {
      A: true,
      B: true,
      C: true,
    },
  },
  {
    value: "good",
    label: "Good",
    description: "Minor blemishes, no significant damage",
    gradeMapping: {
      A: true,
      B: true,
      C: true,
    },
  },
  {
    value: "fair",
    label: "Fair",
    description: "Some damage, cuts, or minor rot (< 5% affected)",
    gradeMapping: {
      A: false,
      B: true,
      C: true,
    },
  },
  {
    value: "poor",
    label: "Poor",
    description: "Significant damage, rot, or pest damage (> 5% affected)",
    gradeMapping: {
      A: false,
      B: false,
      C: true,
    },
  },
];

/**
 * Freshness Definitions
 */
export const freshnessDefinitions: FreshnessDefinition[] = [
  {
    value: "very_fresh",
    label: "Very Fresh",
    description: "Harvested within 24 hours",
    daysSinceHarvest: {
      min: 0,
      max: 1,
    },
    gradeMapping: {
      A: true,
      B: true,
      C: true,
    },
  },
  {
    value: "fresh",
    label: "Fresh",
    description: "Harvested 1-3 days ago",
    daysSinceHarvest: {
      min: 1,
      max: 3,
    },
    gradeMapping: {
      A: true,
      B: true,
      C: true,
    },
  },
  {
    value: "moderate",
    label: "Moderate",
    description: "Harvested 3-7 days ago",
    daysSinceHarvest: {
      min: 3,
      max: 7,
    },
    gradeMapping: {
      A: false,
      B: true,
      C: true,
    },
  },
  {
    value: "aging",
    label: "Aging",
    description: "Harvested more than 7 days ago",
    daysSinceHarvest: {
      min: 7,
      max: undefined,
    },
    gradeMapping: {
      A: false,
      B: false,
      C: true,
    },
  },
];

/**
 * Calculate recommended grade based on matrix criteria
 */
export function calculateGradeFromMatrix(criteria: {
  weightRange: string;
  colorIntensity: number;
  physicalCondition: string;
  freshness: string;
}): {
  recommendedGrade: QualityGrade;
  confidence: "high" | "medium" | "low";
  explanation: string;
  criteria: {
    weightRange: { meets: boolean; grade: QualityGrade | null };
    colorIntensity: { meets: boolean; grade: QualityGrade | null };
    physicalCondition: { meets: boolean; grade: QualityGrade | null };
    freshness: { meets: boolean; grade: QualityGrade | null };
  };
} {
  const weightDef = weightRangeDefinitions.find((w) => w.value === criteria.weightRange);
  const colorDef = colorIntensityDefinitions.find((c) => c.score === criteria.colorIntensity);
  const physicalDef = physicalConditionDefinitions.find((p) => p.value === criteria.physicalCondition);
  const freshnessDef = freshnessDefinitions.find((f) => f.value === criteria.freshness);

  // Determine which grades each criterion supports
  const gradeSupport: Record<QualityGrade, number> = {
    A: 0,
    B: 0,
    C: 0,
  };

  if (weightDef) {
    if (weightDef.gradeMapping.A) gradeSupport.A++;
    if (weightDef.gradeMapping.B) gradeSupport.B++;
    if (weightDef.gradeMapping.C) gradeSupport.C++;
  }

  if (colorDef) {
    if (colorDef.gradeMapping.A) gradeSupport.A++;
    if (colorDef.gradeMapping.B) gradeSupport.B++;
    if (colorDef.gradeMapping.C) gradeSupport.C++;
  }

  if (physicalDef) {
    if (physicalDef.gradeMapping.A) gradeSupport.A++;
    if (physicalDef.gradeMapping.B) gradeSupport.B++;
    if (physicalDef.gradeMapping.C) gradeSupport.C++;
  }

  if (freshnessDef) {
    if (freshnessDef.gradeMapping.A) gradeSupport.A++;
    if (freshnessDef.gradeMapping.B) gradeSupport.B++;
    if (freshnessDef.gradeMapping.C) gradeSupport.C++;
  }

  // Determine recommended grade (highest grade with all 4 criteria support)
  let recommendedGrade: QualityGrade = "C";
  if (gradeSupport.A === 4) {
    recommendedGrade = "A";
  } else if (gradeSupport.B >= 3 && gradeSupport.A >= 2) {
    recommendedGrade = "B";
  } else if (gradeSupport.B >= 2) {
    recommendedGrade = "B";
  }

  // Calculate confidence
  const maxSupport = Math.max(gradeSupport.A, gradeSupport.B, gradeSupport.C);
  let confidence: "high" | "medium" | "low" = "low";
  if (maxSupport === 4) {
    confidence = "high";
  } else if (maxSupport >= 3) {
    confidence = "medium";
  }

  // Build explanation
  const explanations: string[] = [];
  if (weightDef) {
    const supports = [];
    if (weightDef.gradeMapping.A) supports.push("A");
    if (weightDef.gradeMapping.B) supports.push("B");
    if (weightDef.gradeMapping.C) supports.push("C");
    explanations.push(`Weight Range (${weightDef.label}): Supports Grade ${supports.join(", ")}`);
  }
  if (colorDef) {
    const supports = [];
    if (colorDef.gradeMapping.A) supports.push("A");
    if (colorDef.gradeMapping.B) supports.push("B");
    if (colorDef.gradeMapping.C) supports.push("C");
    explanations.push(`Color Intensity (${colorDef.label}): Supports Grade ${supports.join(", ")}`);
  }
  if (physicalDef) {
    const supports = [];
    if (physicalDef.gradeMapping.A) supports.push("A");
    if (physicalDef.gradeMapping.B) supports.push("B");
    if (physicalDef.gradeMapping.C) supports.push("C");
    explanations.push(`Physical Condition (${physicalDef.label}): Supports Grade ${supports.join(", ")}`);
  }
  if (freshnessDef) {
    const supports = [];
    if (freshnessDef.gradeMapping.A) supports.push("A");
    if (freshnessDef.gradeMapping.B) supports.push("B");
    if (freshnessDef.gradeMapping.C) supports.push("C");
    explanations.push(`Freshness (${freshnessDef.label}): Supports Grade ${supports.join(", ")}`);
  }

  const explanation = `Recommended Grade ${recommendedGrade} (${confidence} confidence). ${explanations.join(". ")}.`;

  return {
    recommendedGrade,
    confidence,
    explanation,
    criteria: {
      weightRange: {
        meets: weightDef?.gradeMapping[recommendedGrade] || false,
        grade: weightDef?.gradeMapping.A ? "A" : weightDef?.gradeMapping.B ? "B" : weightDef?.gradeMapping.C ? "C" : null,
      },
      colorIntensity: {
        meets: colorDef?.gradeMapping[recommendedGrade] || false,
        grade: colorDef?.gradeMapping.A ? "A" : colorDef?.gradeMapping.B ? "B" : colorDef?.gradeMapping.C ? "C" : null,
      },
      physicalCondition: {
        meets: physicalDef?.gradeMapping[recommendedGrade] || false,
        grade: physicalDef?.gradeMapping.A ? "A" : physicalDef?.gradeMapping.B ? "B" : physicalDef?.gradeMapping.C ? "C" : null,
      },
      freshness: {
        meets: freshnessDef?.gradeMapping[recommendedGrade] || false,
        grade: freshnessDef?.gradeMapping.A ? "A" : freshnessDef?.gradeMapping.B ? "B" : freshnessDef?.gradeMapping.C ? "C" : null,
      },
    },
  };
}

/**
 * Get grade mapping for a specific criterion
 */
export function getGradeMappingForCriterion(
  criterion: "weightRange" | "colorIntensity" | "physicalCondition" | "freshness",
  value: string | number
): { A: boolean; B: boolean; C: boolean } {
  switch (criterion) {
    case "weightRange":
      const weightDef = weightRangeDefinitions.find((w) => w.value === value);
      return weightDef?.gradeMapping || { A: false, B: false, C: false };
    case "colorIntensity":
      const colorDef = colorIntensityDefinitions.find((c) => c.score === value);
      return colorDef?.gradeMapping || { A: false, B: false, C: false };
    case "physicalCondition":
      const physicalDef = physicalConditionDefinitions.find((p) => p.value === value);
      return physicalDef?.gradeMapping || { A: false, B: false, C: false };
    case "freshness":
      const freshnessDef = freshnessDefinitions.find((f) => f.value === value);
      return freshnessDef?.gradeMapping || { A: false, B: false, C: false };
  }
}
