import { createContext, useContext, useState, useEffect, useCallback, type ReactNode } from "react";
import { useAuth } from "@/contexts/AuthContext";
import {
  getActiveVarieties,
  getActiveProductTypes,
  getActiveQualityGrades,
  getAllQuantityTypes,
  type VarietyConfig,
  type ProductTypeConfig,
  type QualityGradeConfig,
  type QuantityTypeConfig,
} from "@/services/catalogService";
const FALLBACK_VARIETIES: VarietyConfig[] = [
  { id: "v-kenya", code: "KENYA", label: "Kenya", isActive: true, sortOrder: 0 },
  { id: "v-spk004", code: "SPK004", label: "SPK004", isActive: true, sortOrder: 1 },
  { id: "v-kakamega", code: "KAKAMEGA", label: "Kakamega", isActive: true, sortOrder: 2 },
  { id: "v-kabode", code: "KABODE", label: "Kabode", isActive: true, sortOrder: 3 },
  { id: "v-other", code: "OTHER", label: "Other", isActive: true, sortOrder: 4 },
];

const FALLBACK_PRODUCT_TYPES: ProductTypeConfig[] = [
  { id: "pt-fresh", code: "FRESH_ROOTS", label: "Fresh OFSP Roots", isActive: true, sortOrder: 0 },
  { id: "pt-process", code: "PROCESS_GRADE", label: "Process Grade (Flour)", isActive: true, sortOrder: 1 },
  { id: "pt-vines", code: "PLANTING_VINES", label: "Planting Vines", isActive: true, sortOrder: 2 },
  { id: "pt-ofsp", code: "OFSP", label: "OFSP (General)", isActive: true, sortOrder: 3 },
];

const FALLBACK_QUALITY_GRADES: QualityGradeConfig[] = [
  { id: "g-a", code: "A", label: "Grade A (Premium)", isActive: true, sortOrder: 0 },
  { id: "g-b", code: "B", label: "Grade B (Standard)", isActive: true, sortOrder: 1 },
  { id: "g-c", code: "C", label: "Grade C (Processing)", isActive: true, sortOrder: 2 },
];

export const GRADE_COLOR_MAP: Record<string, string> = {
  A: "bg-green-100 text-green-800",
  B: "bg-yellow-100 text-yellow-800",
  C: "bg-orange-100 text-orange-800",
};

export interface CatalogContextType {
  /** Staff-configured varieties (or fallback). Empty until loaded when user is authenticated. */
  varieties: VarietyConfig[];
  /** Staff-configured product types (or fallback). */
  productTypes: ProductTypeConfig[];
  /** Staff-configured quality grades (or fallback). */
  qualityGrades: QualityGradeConfig[];
  /** Quantity types (units) per product type. Map productTypeCode -> QuantityTypeConfig[]. */
  quantityTypesByProductType: Record<string, QuantityTypeConfig[]>;
  /** Get quantity types for a product type (from cache or fallback). */
  getQuantityTypes: (productTypeCode: string) => QuantityTypeConfig[];
  /** True while the single catalog load is in progress. */
  isLoading: boolean;
  /** Non-null if the catalog fetch failed (consumers can still use fallback data). */
  error: string | null;
  /** Reload varieties, product types, quality grades, and quantity types from the API. */
  refetch: () => Promise<void>;
  /** Get badge color for a grade code (A/B/C or any from catalog). */
  getGradeColor: (code: string) => string;
}

const CatalogContext = createContext<CatalogContextType | undefined>(undefined);

const FALLBACK_QUANTITY_TYPES: Record<string, QuantityTypeConfig[]> = {
  FRESH_ROOTS: [
    { id: "qt-fr-kg", productTypeCode: "FRESH_ROOTS", code: "kg", label: "Kilograms", isActive: true, sortOrder: 0 },
    { id: "qt-fr-tons", productTypeCode: "FRESH_ROOTS", code: "tons", label: "Tons", isActive: true, sortOrder: 1 },
    { id: "qt-fr-units", productTypeCode: "FRESH_ROOTS", code: "units", label: "Bags", isActive: true, sortOrder: 2 },
  ],
  PROCESS_GRADE: [
    { id: "qt-pg-kg", productTypeCode: "PROCESS_GRADE", code: "kg", label: "Kilograms", isActive: true, sortOrder: 0 },
    { id: "qt-pg-tons", productTypeCode: "PROCESS_GRADE", code: "tons", label: "Tons", isActive: true, sortOrder: 1 },
    { id: "qt-pg-units", productTypeCode: "PROCESS_GRADE", code: "units", label: "Bags", isActive: true, sortOrder: 2 },
  ],
  PLANTING_VINES: [
    { id: "qt-pv-units", productTypeCode: "PLANTING_VINES", code: "units", label: "Units (cuttings)", isActive: true, sortOrder: 0 },
    { id: "qt-pv-bundles", productTypeCode: "PLANTING_VINES", code: "bundles", label: "Bundles", isActive: true, sortOrder: 1 },
  ],
  OFSP: [
    { id: "qt-ofsp-kg", productTypeCode: "OFSP", code: "kg", label: "Kilograms", isActive: true, sortOrder: 0 },
    { id: "qt-ofsp-tons", productTypeCode: "OFSP", code: "tons", label: "Tons", isActive: true, sortOrder: 1 },
    { id: "qt-ofsp-units", productTypeCode: "OFSP", code: "units", label: "Units", isActive: true, sortOrder: 2 },
  ],
};

export function CatalogProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  const [varieties, setVarieties] = useState<VarietyConfig[]>(FALLBACK_VARIETIES);
  const [productTypes, setProductTypes] = useState<ProductTypeConfig[]>(FALLBACK_PRODUCT_TYPES);
  const [qualityGrades, setQualityGrades] = useState<QualityGradeConfig[]>(FALLBACK_QUALITY_GRADES);
  const [quantityTypesByProductType, setQuantityTypesByProductType] = useState<Record<string, QuantityTypeConfig[]>>(FALLBACK_QUANTITY_TYPES);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setError(null);
    setIsLoading(true);
    try {
      const [v, p, g, qAll] = await Promise.all([
        getActiveVarieties(),
        getActiveProductTypes(),
        getActiveQualityGrades(),
        getAllQuantityTypes(),
      ]);
      setVarieties(v.length > 0 ? v : FALLBACK_VARIETIES);
      setProductTypes(p.length > 0 ? p : FALLBACK_PRODUCT_TYPES);
      setQualityGrades(g.length > 0 ? g : FALLBACK_QUALITY_GRADES);
      const byProductType: Record<string, QuantityTypeConfig[]> = {};
      for (const qt of qAll) {
        if (!byProductType[qt.productTypeCode]) byProductType[qt.productTypeCode] = [];
        byProductType[qt.productTypeCode].push(qt);
      }
      for (const arr of Object.values(byProductType)) {
        arr.sort((a, b) => a.sortOrder - b.sortOrder);
      }
      setQuantityTypesByProductType(Object.keys(byProductType).length > 0 ? byProductType : FALLBACK_QUANTITY_TYPES);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to load catalog");
      setVarieties(FALLBACK_VARIETIES);
      setProductTypes(FALLBACK_PRODUCT_TYPES);
      setQualityGrades(FALLBACK_QUALITY_GRADES);
      setQuantityTypesByProductType(FALLBACK_QUANTITY_TYPES);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    if (user?.id) {
      load();
    } else {
      setVarieties(FALLBACK_VARIETIES);
      setProductTypes(FALLBACK_PRODUCT_TYPES);
      setQualityGrades(FALLBACK_QUALITY_GRADES);
      setQuantityTypesByProductType(FALLBACK_QUANTITY_TYPES);
      setIsLoading(false);
      setError(null);
    }
  }, [user?.id, load]);

  const getQuantityTypes = useCallback((productTypeCode: string) => {
    return quantityTypesByProductType[productTypeCode] ?? FALLBACK_QUANTITY_TYPES[productTypeCode] ?? [];
  }, [quantityTypesByProductType]);

  const getGradeColor = useCallback((code: string) => {
    return GRADE_COLOR_MAP[code] ?? "bg-gray-100 text-gray-800";
  }, []);

  const value: CatalogContextType = {
    varieties,
    productTypes,
    qualityGrades,
    quantityTypesByProductType,
    getQuantityTypes,
    isLoading,
    error,
    refetch: load,
    getGradeColor,
  };

  return <CatalogContext.Provider value={value}>{children}</CatalogContext.Provider>;
}

function createFallbackContext(): CatalogContextType {
  const getQuantityTypes = (productTypeCode: string) =>
    FALLBACK_QUANTITY_TYPES[productTypeCode] ?? [];
  const getGradeColor = (code: string) => GRADE_COLOR_MAP[code] ?? "bg-gray-100 text-gray-800";
  return {
    varieties: FALLBACK_VARIETIES,
    productTypes: FALLBACK_PRODUCT_TYPES,
    qualityGrades: FALLBACK_QUALITY_GRADES,
    quantityTypesByProductType: FALLBACK_QUANTITY_TYPES,
    getQuantityTypes,
    isLoading: false,
    error: null,
    refetch: async () => {},
    getGradeColor,
  };
}

export function useCatalog(): CatalogContextType {
  const ctx = useContext(CatalogContext);
  if (ctx === undefined) {
    if (typeof window !== "undefined") {
      console.warn("useCatalog used outside CatalogProvider – using fallback data. Ensure CatalogProvider wraps your app.");
    }
    return createFallbackContext();
  }
  return ctx;
}
