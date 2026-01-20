/**
 * Transport Context
 * 
 * Provides global state management for transport functionality:
 * - Transport requests
 * - Active deliveries
 * - Delivery tracking
 */

import { createContext, useContext, useState, useEffect, useCallback, type ReactNode } from "react";
import type {
  TransportRequest,
  ActiveDelivery,
  DeliveryTrackingUpdate,
  TransportFilters,
  TransportStats,
} from "@/types/transport";
import {
  getTransportRequests,
  getTransportRequestById,
  createTransportRequest,
  acceptTransportRequest,
  rejectTransportRequest,
  updateTransportRequestStatus,
  getActiveDeliveries,
  addTrackingUpdate,
  getTransportStats,
} from "@/services/transportService";

interface TransportContextType {
  requests: TransportRequest[];
  selectedRequest: TransportRequest | null;
  activeDeliveries: ActiveDelivery[];
  deliveries: ActiveDelivery[]; // Alias for activeDeliveries (used in some contexts)
  filters: TransportFilters;
  stats: TransportStats | null;
  isLoading: boolean;
  error: string | null;
  
  fetchRequests: (filters?: TransportFilters) => Promise<void>;
  fetchRequestById: (id: string) => Promise<void>;
  createRequest: (request: Partial<TransportRequest>) => Promise<void>;
  acceptRequest: (id: string, providerId: string) => Promise<void>;
  rejectRequest: (id: string) => Promise<void>;
  updateRequestStatus: (id: string, status: TransportRequest["status"]) => Promise<void>;
  fetchActiveDeliveries: () => Promise<void>;
  fetchDeliveries: () => Promise<void>; // Alias for fetchActiveDeliveries (used in some contexts)
  addTracking: (deliveryId: string, update: Partial<DeliveryTrackingUpdate>) => Promise<void>;
  fetchStats: () => Promise<void>;
  setFilters: (filters: TransportFilters) => void;
  clearSelectedRequest: () => void;
  
  filteredRequests: TransportRequest[];
}

const TransportContext = createContext<TransportContextType | undefined>(undefined);

export function TransportProvider({ children }: { children: ReactNode }) {
  const [requests, setRequests] = useState<TransportRequest[]>([]);
  const [selectedRequest, setSelectedRequest] = useState<TransportRequest | null>(null);
  const [activeDeliveries, setActiveDeliveries] = useState<ActiveDelivery[]>([]);
  const [filters, setFiltersState] = useState<TransportFilters>({});
  const [stats, setStats] = useState<TransportStats | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchRequests = useCallback(async (newFilters?: TransportFilters) => {
    setIsLoading(true);
    setError(null);
    try {
      const appliedFilters = newFilters || filters;
      const data = await getTransportRequests(appliedFilters);
      setRequests(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to fetch requests");
    } finally {
      setIsLoading(false);
    }
  }, [filters]);

  const fetchRequestById = useCallback(async (id: string) => {
    setIsLoading(true);
    setError(null);
    try {
      const request = await getTransportRequestById(id);
      setSelectedRequest(request);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to fetch request");
    } finally {
      setIsLoading(false);
    }
  }, []);

  const fetchActiveDeliveries = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await getActiveDeliveries();
      setActiveDeliveries(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to fetch active deliveries");
    } finally {
      setIsLoading(false);
    }
  }, []);

  const fetchStats = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await getTransportStats();
      setStats(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to fetch stats");
    } finally {
      setIsLoading(false);
    }
  }, []);

  const createRequest = useCallback(async (request: Partial<TransportRequest>) => {
    setIsLoading(true);
    setError(null);
    try {
      await createTransportRequest(request);
      // Refresh requests - call service function directly to avoid circular dependency
      const data = await getTransportRequests(filters);
      setRequests(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to create request");
    } finally {
      setIsLoading(false);
    }
  }, [filters]);

  const acceptRequest = useCallback(async (id: string, providerId: string) => {
    setIsLoading(true);
    setError(null);
    try {
      await acceptTransportRequest(id, providerId);
      // Refresh related data - call service functions directly
      const requestsData = await getTransportRequests(filters);
      setRequests(requestsData);
      const deliveriesData = await getActiveDeliveries();
      setActiveDeliveries(deliveriesData);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to accept request");
    } finally {
      setIsLoading(false);
    }
  }, [filters]);

  const rejectRequest = useCallback(async (id: string) => {
    setIsLoading(true);
    setError(null);
    try {
      await rejectTransportRequest(id);
      // Refresh requests - call service function directly
      const data = await getTransportRequests(filters);
      setRequests(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to reject request");
    } finally {
      setIsLoading(false);
    }
  }, [filters]);

  const updateRequestStatus = useCallback(async (id: string, status: TransportRequest["status"]) => {
    setIsLoading(true);
    setError(null);
    try {
      await updateTransportRequestStatus(id, status);
      // Refresh related data - call service functions directly
      const requestsData = await getTransportRequests(filters);
      setRequests(requestsData);
      const deliveriesData = await getActiveDeliveries();
      setActiveDeliveries(deliveriesData);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to update request status");
    } finally {
      setIsLoading(false);
    }
  }, [filters]);

  const addTracking = useCallback(async (deliveryId: string, update: Partial<DeliveryTrackingUpdate>) => {
    setIsLoading(true);
    setError(null);
    try {
      await addTrackingUpdate(deliveryId, update);
      // Refresh deliveries - call service function directly
      const data = await getActiveDeliveries();
      setActiveDeliveries(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to add tracking update");
    } finally {
      setIsLoading(false);
    }
  }, []);

  const setFilters = useCallback((newFilters: TransportFilters) => {
    setFiltersState(newFilters);
    // Call service function directly to avoid circular dependency
    void (async () => {
      try {
        const data = await getTransportRequests(newFilters);
        setRequests(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to fetch transport requests");
      }
    })();
  }, []);

  const clearSelectedRequest = useCallback(() => {
    setSelectedRequest(null);
  }, []);

  const filteredRequests = requests; // Filtering handled by service

  useEffect(() => {
    fetchRequests();
    fetchActiveDeliveries();
    fetchStats();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const value: TransportContextType = {
    requests,
    selectedRequest,
    activeDeliveries,
    deliveries: activeDeliveries, // Alias for activeDeliveries
    filters,
    stats,
    isLoading,
    error,
    fetchRequests,
    fetchRequestById,
    createRequest,
    acceptRequest,
    rejectRequest,
    updateRequestStatus,
    fetchActiveDeliveries,
    fetchDeliveries: fetchActiveDeliveries, // Alias for fetchActiveDeliveries
    addTracking,
    fetchStats,
    setFilters,
    clearSelectedRequest,
    filteredRequests,
  };

  return (
    <TransportContext.Provider value={value}>
      {children}
    </TransportContext.Provider>
  );
}

export function useTransport() {
  const context = useContext(TransportContext);
  if (context === undefined) {
    throw new Error("useTransport must be used within a TransportProvider");
  }
  return context;
}
