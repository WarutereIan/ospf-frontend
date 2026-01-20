/**
 * Staff Context
 * 
 * Provides global state management for staff/admin functionality:
 * - Partners
 * - Activity logs
 * - Data quality
 * - Transaction evidence
 */

import { createContext, useContext, useState, useEffect, useCallback, type ReactNode } from "react";
import type {
  Partner,
  ActivityLog,
  DataQualityIssue,
  TransactionEvidence,
  Setting,
  StaffFilters,
  ActivityLogFilters,
  DataQualityFilters,
  SettingsFilters,
  StaffStats,
} from "@/types/staff";
import {
  getPartners,
  getPartnerById,
  createPartner,
  updatePartner,
  deletePartner,
  getActivityLogs,
  getDataQualityIssues,
  resolveDataQualityIssue,
  getTransactionEvidence,
  uploadTransactionEvidence,
  getSettings,
  getSettingByKey,
  updateSetting,
  getStaffStats,
} from "@/services/staffService";

interface StaffContextType {
  partners: Partner[];
  selectedPartner: Partner | null;
  activityLogs: ActivityLog[];
  dataQualityIssues: DataQualityIssue[];
  transactionEvidence: TransactionEvidence[];
  partnerFilters: StaffFilters;
  activityLogFilters: ActivityLogFilters;
  dataQualityFilters: DataQualityFilters;
  settings: Setting[];
  settingsFilters: SettingsFilters;
  stats: StaffStats | null;
  isLoading: boolean;
  error: string | null;
  
  fetchPartners: (filters?: StaffFilters) => Promise<void>;
  fetchPartnerById: (id: string) => Promise<void>;
  createPartnerAction: (partner: Partial<Partner>) => Promise<void>;
  updatePartnerAction: (id: string, partner: Partial<Partner>) => Promise<void>;
  deletePartnerAction: (id: string) => Promise<void>;
  fetchActivityLogs: (filters?: ActivityLogFilters) => Promise<void>;
  fetchDataQualityIssues: (filters?: DataQualityFilters) => Promise<void>;
  resolveIssue: (id: string, resolution: string) => Promise<void>;
  fetchTransactionEvidence: (transactionId?: string) => Promise<void>;
  uploadEvidence: (evidence: Partial<TransactionEvidence>) => Promise<void>;
  fetchStats: () => Promise<void>;
  setPartnerFilters: (filters: StaffFilters) => void;
  setActivityLogFilters: (filters: ActivityLogFilters) => void;
  setDataQualityFilters: (filters: DataQualityFilters) => void;
  clearSelectedPartner: () => void;
  
  // Settings Actions
  fetchSettings: (filters?: SettingsFilters) => Promise<void>;
  getSettingByKey: (key: string) => Promise<Setting | null>;
  updateSetting: (key: string, value: string | number | boolean | Record<string, unknown>) => Promise<void>;
  setSettingsFilters: (filters: SettingsFilters) => void;
  
  filteredPartners: Partner[];
  filteredActivityLogs: ActivityLog[];
  filteredDataQualityIssues: DataQualityIssue[];
}

const StaffContext = createContext<StaffContextType | undefined>(undefined);

export function StaffProvider({ children }: { children: ReactNode }) {
  const [partners, setPartners] = useState<Partner[]>([]);
  const [selectedPartner, setSelectedPartner] = useState<Partner | null>(null);
  const [activityLogs, setActivityLogs] = useState<ActivityLog[]>([]);
  const [dataQualityIssues, setDataQualityIssues] = useState<DataQualityIssue[]>([]);
  const [transactionEvidence, setTransactionEvidence] = useState<TransactionEvidence[]>([]);
  const [partnerFilters, setPartnerFiltersState] = useState<StaffFilters>({});
  const [activityLogFilters, setActivityLogFiltersState] = useState<ActivityLogFilters>({});
  const [dataQualityFilters, setDataQualityFiltersState] = useState<DataQualityFilters>({});
  const [settings, setSettings] = useState<Setting[]>([]);
  const [settingsFilters, setSettingsFiltersState] = useState<SettingsFilters>({});
  const [stats, setStats] = useState<StaffStats | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchPartners = useCallback(async (newFilters?: StaffFilters) => {
    setIsLoading(true);
    setError(null);
    try {
      const appliedFilters = newFilters || partnerFilters;
      const data = await getPartners(appliedFilters);
      setPartners(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to fetch partners");
    } finally {
      setIsLoading(false);
    }
  }, [partnerFilters]);

  const fetchPartnerById = useCallback(async (id: string) => {
    setIsLoading(true);
    setError(null);
    try {
      const partner = await getPartnerById(id);
      setSelectedPartner(partner);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to fetch partner");
    } finally {
      setIsLoading(false);
    }
  }, []);

  const fetchActivityLogs = useCallback(async (newFilters?: ActivityLogFilters) => {
    setIsLoading(true);
    setError(null);
    try {
      const appliedFilters = newFilters || activityLogFilters;
      const data = await getActivityLogs(appliedFilters);
      setActivityLogs(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to fetch activity logs");
    } finally {
      setIsLoading(false);
    }
  }, [activityLogFilters]);

  const fetchDataQualityIssues = useCallback(async (newFilters?: DataQualityFilters) => {
    setIsLoading(true);
    setError(null);
    try {
      const appliedFilters = newFilters || dataQualityFilters;
      const data = await getDataQualityIssues(appliedFilters);
      setDataQualityIssues(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to fetch data quality issues");
    } finally {
      setIsLoading(false);
    }
  }, [dataQualityFilters]);

  const fetchTransactionEvidence = useCallback(async (transactionId?: string) => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await getTransactionEvidence(transactionId);
      setTransactionEvidence(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to fetch transaction evidence");
    } finally {
      setIsLoading(false);
    }
  }, []);

  const fetchStats = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await getStaffStats();
      setStats(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to fetch stats");
    } finally {
      setIsLoading(false);
    }
  }, []);

  const fetchSettings = useCallback(async (newFilters?: SettingsFilters) => {
    setIsLoading(true);
    setError(null);
    try {
      const appliedFilters = newFilters || settingsFilters;
      const data = await getSettings(appliedFilters);
      setSettings(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to fetch settings");
    } finally {
      setIsLoading(false);
    }
  }, [settingsFilters]);

  const createPartnerAction = useCallback(async (partner: Partial<Partner>) => {
    setIsLoading(true);
    setError(null);
    try {
      await createPartner(partner);
      // Refresh partners - call service function directly to avoid circular dependency
      const data = await getPartners(partnerFilters);
      setPartners(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to create partner");
    } finally {
      setIsLoading(false);
    }
  }, [partnerFilters]);

  const updatePartnerAction = useCallback(async (id: string, partner: Partial<Partner>) => {
    setIsLoading(true);
    setError(null);
    try {
      await updatePartner(id, partner);
      // Refresh partners - call service function directly
      const data = await getPartners(partnerFilters);
      setPartners(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to update partner");
    } finally {
      setIsLoading(false);
    }
  }, [partnerFilters]);

  const deletePartnerAction = useCallback(async (id: string) => {
    setIsLoading(true);
    setError(null);
    try {
      await deletePartner(id);
      // Refresh partners - call service function directly
      const data = await getPartners(partnerFilters);
      setPartners(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to delete partner");
    } finally {
      setIsLoading(false);
    }
  }, [partnerFilters]);

  const resolveIssue = useCallback(async (id: string, resolution: string) => {
    setIsLoading(true);
    setError(null);
    try {
      await resolveDataQualityIssue(id, resolution);
      // Refresh related data - call service functions directly
      const issuesData = await getDataQualityIssues(dataQualityFilters);
      setDataQualityIssues(issuesData);
      const statsData = await getStaffStats();
      setStats(statsData);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to resolve issue");
    } finally {
      setIsLoading(false);
    }
  }, [dataQualityFilters]);

  const uploadEvidence = useCallback(async (evidence: Partial<TransactionEvidence>) => {
    setIsLoading(true);
    setError(null);
    try {
      await uploadTransactionEvidence(evidence);
      // Refresh evidence - call service function directly
      const data = await getTransactionEvidence();
      setTransactionEvidence(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to upload evidence");
    } finally {
      setIsLoading(false);
    }
  }, []);

  const getSettingByKeyAction = useCallback(async (key: string): Promise<Setting | null> => {
    setIsLoading(true);
    setError(null);
    try {
      const setting = await getSettingByKey(key);
      return setting;
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to fetch setting");
      return null;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const updateSettingAction = useCallback(async (key: string, value: string | number | boolean | Record<string, unknown>) => {
    setIsLoading(true);
    setError(null);
    try {
      await updateSetting(key, value);
      // Refresh settings - call service function directly
      const data = await getSettings(settingsFilters);
      setSettings(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to update setting");
    } finally {
      setIsLoading(false);
    }
  }, [settingsFilters]);

  const setPartnerFilters = useCallback((newFilters: StaffFilters) => {
    setPartnerFiltersState(newFilters);
    // Call service function directly to avoid circular dependency
    void (async () => {
      try {
        const data = await getPartners(newFilters);
        setPartners(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to fetch partners");
      }
    })();
  }, []);

  const setActivityLogFilters = useCallback((newFilters: ActivityLogFilters) => {
    setActivityLogFiltersState(newFilters);
    // Call service function directly to avoid circular dependency
    void (async () => {
      try {
        const data = await getActivityLogs(newFilters);
        setActivityLogs(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to fetch activity logs");
      }
    })();
  }, []);

  const setDataQualityFilters = useCallback((newFilters: DataQualityFilters) => {
    setDataQualityFiltersState(newFilters);
    // Call service function directly to avoid circular dependency
    void (async () => {
      try {
        const data = await getDataQualityIssues(newFilters);
        setDataQualityIssues(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to fetch data quality issues");
      }
    })();
  }, []);

  const setSettingsFilters = useCallback((newFilters: SettingsFilters) => {
    setSettingsFiltersState(newFilters);
    // Call service function directly to avoid circular dependency
    void (async () => {
      try {
        const data = await getSettings(newFilters);
        setSettings(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to fetch settings");
      }
    })();
  }, []);

  const clearSelectedPartner = useCallback(() => {
    setSelectedPartner(null);
  }, []);

  const filteredPartners = partners;
  const filteredActivityLogs = activityLogs;
  const filteredDataQualityIssues = dataQualityIssues;

  useEffect(() => {
    fetchPartners();
    fetchActivityLogs();
    fetchDataQualityIssues();
    fetchTransactionEvidence();
    fetchSettings();
    fetchStats();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const value: StaffContextType = {
    partners,
    selectedPartner,
    activityLogs,
    dataQualityIssues,
    transactionEvidence,
    partnerFilters,
    activityLogFilters,
    dataQualityFilters,
    settings,
    settingsFilters,
    stats,
    isLoading,
    error,
    fetchPartners,
    fetchPartnerById,
    createPartnerAction,
    updatePartnerAction,
    deletePartnerAction,
    fetchActivityLogs,
    fetchDataQualityIssues,
    resolveIssue,
    fetchTransactionEvidence,
    uploadEvidence,
    fetchStats,
    setPartnerFilters,
    setActivityLogFilters,
    setDataQualityFilters,
    clearSelectedPartner,
    fetchSettings,
    getSettingByKey: getSettingByKeyAction,
    updateSetting: updateSettingAction,
    setSettingsFilters,
    filteredPartners,
    filteredActivityLogs,
    filteredDataQualityIssues,
  };

  return (
    <StaffContext.Provider value={value}>
      {children}
    </StaffContext.Provider>
  );
}

export function useStaff() {
  const context = useContext(StaffContext);
  if (context === undefined) {
    throw new Error("useStaff must be used within a StaffProvider");
  }
  return context;
}
