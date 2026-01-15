// Aggregation Centers Data
// Hierarchical structure: Main centers at subcounty level, Satellite centers at ward level

export interface AggregationCenterOption {
  value: string;
  label: string;
  type: "main" | "satellite";
  subCounty: string;
  ward?: string;
  location: string;
  mainCenterId?: string; // For satellites - links to parent main center
}

// Main Aggregation Centers (Subcounty Level)
export const mainCenters: AggregationCenterOption[] = [
  {
    value: "kangundo_main",
    label: "Kangundo Main Aggregation Center",
    type: "main",
    subCounty: "Kangundo",
    location: "Kangundo Town",
  },
  {
    value: "kathiani_main",
    label: "Kathiani Main Aggregation Center",
    type: "main",
    subCounty: "Kathiani",
    location: "Kathiani Market",
  },
  {
    value: "matungulu_main",
    label: "Matungulu Main Aggregation Center",
    type: "main",
    subCounty: "Matungulu",
    location: "Matungulu Town",
  },
  {
    value: "yatta_main",
    label: "Yatta Main Aggregation Center",
    type: "main",
    subCounty: "Yatta",
    location: "Yatta Town",
  },
];

// Satellite Aggregation Centers (Ward Level)
export const satelliteCenters: AggregationCenterOption[] = [
  {
    value: "tala_satellite",
    label: "Tala Satellite Center",
    type: "satellite",
    subCounty: "Kangundo",
    ward: "Tala",
    location: "Tala Market",
    mainCenterId: "kangundo_main",
  },
  {
    value: "kangundo_east_satellite",
    label: "Kangundo East Satellite Center",
    type: "satellite",
    subCounty: "Kangundo",
    ward: "Kangundo East",
    location: "Kangundo East",
    mainCenterId: "kangundo_main",
  },
  {
    value: "mitaboni_satellite",
    label: "Mitaboni Satellite Center",
    type: "satellite",
    subCounty: "Kathiani",
    ward: "Mitaboni",
    location: "Mitaboni",
    mainCenterId: "kathiani_main",
  },
  {
    value: "ikombe_satellite",
    label: "Ikombe Satellite Center",
    type: "satellite",
    subCounty: "Kathiani",
    ward: "Ikombe",
    location: "Ikombe",
    mainCenterId: "kathiani_main",
  },
  {
    value: "matungulu_north_satellite",
    label: "Matungulu North Satellite Center",
    type: "satellite",
    subCounty: "Matungulu",
    ward: "Matungulu North",
    location: "Matungulu North",
    mainCenterId: "matungulu_main",
  },
  {
    value: "kithimani_satellite",
    label: "Kithimani Satellite Center",
    type: "satellite",
    subCounty: "Yatta",
    ward: "Kithimani",
    location: "Kithimani",
    mainCenterId: "yatta_main",
  },
  {
    value: "katangi_satellite",
    label: "Katangi Satellite Center",
    type: "satellite",
    subCounty: "Yatta",
    ward: "Katangi",
    location: "Katangi",
    mainCenterId: "yatta_main",
  },
];

// All Aggregation Centers (Combined)
export const allAggregationCenters: AggregationCenterOption[] = [
  ...mainCenters,
  ...satelliteCenters,
];

// Helper function to get center by value
export const getCenterByValue = (value: string): AggregationCenterOption | undefined => {
  return allAggregationCenters.find(center => center.value === value);
};

// Helper function to get centers by type
export const getCentersByType = (type: "main" | "satellite"): AggregationCenterOption[] => {
  return allAggregationCenters.filter(center => center.type === type);
};

// Helper function to get satellites by main center
export const getSatellitesByMainCenter = (mainCenterId: string): AggregationCenterOption[] => {
  return satelliteCenters.filter(center => center.mainCenterId === mainCenterId);
};

// Helper function to format center label with type indicator
export const formatCenterLabel = (center: AggregationCenterOption): string => {
  const typeLabel = center.type === "main" ? "Main" : "Satellite";
  const locationDetails = center.ward 
    ? `${center.ward} Ward, ${center.subCounty}` 
    : `${center.subCounty} Subcounty`;
  return `${center.label} (${typeLabel} - ${locationDetails})`;
};

