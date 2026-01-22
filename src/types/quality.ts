/**
 * Quality Grading Types
 * 
 * Types for quality grading and assessment:
 * - Quality grades (A, B, C)
 * - Grading matrix criteria
 * - Quality assessment metrics
 */

/**
 * Quality grade
 */
export type QualityGrade = "A" | "B" | "C";

/**
 * Weight Range Category
 * Categorization of root tubers by size and weight
 */
export type WeightRange = "small" | "medium" | "large" | "extra_large";

/**
 * Color Intensity Score
 * Orange flesh depth as quality indicator (1-10 scale)
 */
export type ColorIntensityScore = 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10;

/**
 * Physical Condition Assessment
 * Absence of rot, cuts, pest damage
 */
export type PhysicalCondition = "excellent" | "good" | "fair" | "poor";

/**
 * Freshness Level
 * Maturity and time since harvest
 */
export type FreshnessLevel = "very_fresh" | "fresh" | "moderate" | "aging";

/**
 * Grading Matrix Criteria
 * The four key criteria used for grading produce
 */
export interface GradingMatrixCriteria {
  weightRange: WeightRange;
  colorIntensity: ColorIntensityScore;
  physicalCondition: PhysicalCondition;
  freshness: FreshnessLevel;
}

/**
 * Weight Range Definition
 */
export interface WeightRangeDefinition {
  value: WeightRange;
  label: string;
  description: string;
  minWeight?: number; // grams
  maxWeight?: number; // grams
  gradeMapping: {
    A: boolean; // Can achieve Grade A
    B: boolean; // Can achieve Grade B
    C: boolean; // Can achieve Grade C
  };
}

/**
 * Color Intensity Definition
 */
export interface ColorIntensityDefinition {
  score: ColorIntensityScore;
  label: string;
  description: string;
  gradeMapping: {
    A: boolean;
    B: boolean;
    C: boolean;
  };
}

/**
 * Physical Condition Definition
 */
export interface PhysicalConditionDefinition {
  value: PhysicalCondition;
  label: string;
  description: string;
  gradeMapping: {
    A: boolean;
    B: boolean;
    C: boolean;
  };
}

/**
 * Freshness Definition
 */
export interface FreshnessDefinition {
  value: FreshnessLevel;
  label: string;
  description: string;
  daysSinceHarvest?: {
    min?: number;
    max?: number;
  };
  gradeMapping: {
    A: boolean;
    B: boolean;
    C: boolean;
  };
}

/**
 * Quality Assessment
 * Complete quality assessment with all matrix criteria
 */
export interface QualityAssessment {
  id?: string;
  batchId?: string;
  variety: string;
  quantity: number;
  
  // Grading Matrix Criteria
  weightRange: WeightRange;
  colorIntensity: ColorIntensityScore;
  physicalCondition: PhysicalCondition;
  freshness: FreshnessLevel;
  
  // Calculated Grade
  qualityGrade: QualityGrade;
  
  // Additional metadata
  assessedBy?: string;
  assessedAt?: string;
  notes?: string;
  photos?: string[];
}

/**
 * Grade Recommendation
 * Recommended grade based on matrix criteria
 */
export interface GradeRecommendation {
  recommendedGrade: QualityGrade;
  confidence: "high" | "medium" | "low";
  criteria: {
    weightRange: { meets: boolean; grade: QualityGrade | null };
    colorIntensity: { meets: boolean; grade: QualityGrade | null };
    physicalCondition: { meets: boolean; grade: QualityGrade | null };
    freshness: { meets: boolean; grade: QualityGrade | null };
  };
  explanation: string;
}
