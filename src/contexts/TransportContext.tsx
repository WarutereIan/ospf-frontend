/**
 * Transport Context
 * 
 * Provides global state management for transport functionality:
 * - Transport requests
 * - Active deliveries
 * - Delivery tracking
 */

import { createContext, useContext, useState, useCallback, useRef, type ReactNode } from "react";
import type {
  TransportRequest,
  ActiveDelivery,
  DeliveryTrackingUpdate,
  TransportFilters,
  TransportStats,
  FarmPickupSchedule,
  PickupSlot,
  PickupSlotBooking,
  PickupScheduleFilters,
  AggregationCenterCapacity,
  PickupReceipt,
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
  getPickupSchedules,
  getPickupScheduleById,
  createPickupSchedule,
  updatePickupSchedule,
  publishPickupSchedule,
  cancelPickupSchedule,
  getPickupSlots,
  bookPickupSlot,
  cancelPickupSlotBooking,
  getAggregationCenterCapacity,
  getAvailablePickupSchedules,
  getFarmerPickupBookings,
  confirmPickup,
  getPickupReceiptByBooking,
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
  
  // Pickup Schedule state
  pickupSchedules: FarmPickupSchedule[];
  selectedSchedule: FarmPickupSchedule | null;
  scheduleFilters: PickupScheduleFilters;
  centerCapacities: Map<string, AggregationCenterCapacity>;
  farmerBookings: PickupSlotBooking[];
  
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
  
  // Pickup Schedule actions
  fetchPickupSchedules: (filters?: PickupScheduleFilters) => Promise<void>;
  fetchPickupScheduleById: (id: string) => Promise<void>;
  createPickupSchedule: (schedule: Partial<FarmPickupSchedule>) => Promise<FarmPickupSchedule | null>;
  updatePickupSchedule: (id: string, schedule: Partial<FarmPickupSchedule>) => Promise<void>;
  publishPickupSchedule: (id: string) => Promise<void>;
  cancelPickupSchedule: (id: string) => Promise<void>;
  fetchAvailablePickupSchedules: (filters?: { aggregationCenterId?: string; dateRange?: { start: string; end: string }; minAvailableCapacity?: number }) => Promise<void>;
  bookPickupSlot: (scheduleId: string, slotId: string, booking: Partial<PickupSlotBooking>) => Promise<PickupSlotBooking | null>;
  cancelPickupSlotBooking: (bookingId: string) => Promise<void>;
  fetchAggregationCenterCapacity: (centerId: string) => Promise<AggregationCenterCapacity | null>;
  setScheduleFilters: (filters: PickupScheduleFilters) => void;
  clearSelectedSchedule: () => void;
  
  // Farmer booking actions
  fetchFarmerBookings: (farmerId: string) => Promise<void>;
  confirmPickup: (bookingId: string, data: {
    variety: string;
    qualityGrade: "A" | "B" | "C";
    photos?: string[];
    notes?: string;
  }) => Promise<PickupSlotBooking | null>;
  fetchPickupReceipt: (bookingId: string) => Promise<PickupReceipt | null>;
  
  filteredRequests: TransportRequest[];
  filteredSchedules: FarmPickupSchedule[];
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
  
  // Pickup Schedule state
  const [pickupSchedules, setPickupSchedules] = useState<FarmPickupSchedule[]>([]);
  const [selectedSchedule, setSelectedSchedule] = useState<FarmPickupSchedule | null>(null);
  const [scheduleFilters, setScheduleFiltersState] = useState<PickupScheduleFilters>({});
  const [centerCapacities, setCenterCapacities] = useState<Map<string, AggregationCenterCapacity>>(new Map());
  const [farmerBookings, setFarmerBookings] = useState<PickupSlotBooking[]>([]);
  const [pickupReceipts, setPickupReceipts] = useState<Map<string, PickupReceipt>>(new Map());

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

  // Track when capacities were last fetched to avoid excessive refetches
  const capacityFetchTimestamps = useRef<Map<string, number>>(new Map());
  const CAPACITY_CACHE_TTL = 5 * 60 * 1000; // 5 minutes

  // Pickup Schedule actions
  const fetchPickupSchedules = useCallback(async (newFilters?: PickupScheduleFilters) => {
    setIsLoading(true);
    setError(null);
    try {
      const appliedFilters = newFilters || scheduleFilters;
      const data = await getPickupSchedules(appliedFilters);
      setPickupSchedules(data);
      
      // Only fetch capacity for centers that aren't cached or are stale
      const uniqueCenterIds = [...new Set(data.map(s => s.aggregationCenterId))];
      const now = Date.now();
      const centersToFetch = uniqueCenterIds.filter(centerId => {
        const lastFetch = capacityFetchTimestamps.current.get(centerId);
        return !lastFetch || (now - lastFetch) > CAPACITY_CACHE_TTL;
      });
      
      if (centersToFetch.length > 0) {
        const capacityPromises = centersToFetch.map(centerId => 
          getAggregationCenterCapacity(centerId).then(cap => {
            capacityFetchTimestamps.current.set(centerId, now);
            return { centerId, capacity: cap };
          })
        );
        const capacities = await Promise.all(capacityPromises);
        
        // Merge with existing capacities instead of replacing
        setCenterCapacities(prev => {
          const newMap = new Map(prev);
          capacities.forEach(({ centerId, capacity }) => {
            if (capacity) {
              newMap.set(centerId, capacity);
            }
          });
          return newMap;
        });
      }
    } catch (err: any) {
      // Don't set error state for auth errors (401) or rate limit errors (429)
      if (err?.statusCode !== 401 && err?.statusCode !== 429) {
        setError(err instanceof Error ? err.message : "Failed to fetch pickup schedules");
      }
    } finally {
      setIsLoading(false);
    }
  }, [scheduleFilters]);

  const fetchPickupScheduleById = useCallback(async (id: string) => {
    setIsLoading(true);
    setError(null);
    try {
      const schedule = await getPickupScheduleById(id);
      setSelectedSchedule(schedule);
      if (schedule) {
        // Fetch capacity for the center
        const capacity = await getAggregationCenterCapacity(schedule.aggregationCenterId);
        if (capacity) {
          setCenterCapacities(prev => new Map(prev).set(schedule.aggregationCenterId, capacity));
        }
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to fetch schedule");
    } finally {
      setIsLoading(false);
    }
  }, []);

  const createPickupScheduleAction = useCallback(async (schedule: Partial<FarmPickupSchedule>): Promise<FarmPickupSchedule | null> => {
    setIsLoading(true);
    setError(null);
    try {
      const result = await createPickupSchedule(schedule);
      if (result.data) {
        // Refresh schedules
        const data = await getPickupSchedules(scheduleFilters);
        setPickupSchedules(data);
        return result.data;
      }
      return null;
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to create schedule");
      return null;
    } finally {
      setIsLoading(false);
    }
  }, [scheduleFilters]);

  const updatePickupScheduleAction = useCallback(async (id: string, schedule: Partial<FarmPickupSchedule>) => {
    setIsLoading(true);
    setError(null);
    try {
      await updatePickupSchedule(id, schedule);
      // Refresh schedules
      const data = await getPickupSchedules(scheduleFilters);
      setPickupSchedules(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to update schedule");
    } finally {
      setIsLoading(false);
    }
  }, [scheduleFilters]);

  const publishPickupScheduleAction = useCallback(async (id: string) => {
    setIsLoading(true);
    setError(null);
    try {
      await publishPickupSchedule(id);
      // Refresh schedules
      const data = await getPickupSchedules(scheduleFilters);
      setPickupSchedules(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to publish schedule");
    } finally {
      setIsLoading(false);
    }
  }, [scheduleFilters]);

  const cancelPickupScheduleAction = useCallback(async (id: string) => {
    setIsLoading(true);
    setError(null);
    try {
      await cancelPickupSchedule(id);
      // Refresh schedules
      const data = await getPickupSchedules(scheduleFilters);
      setPickupSchedules(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to cancel schedule");
    } finally {
      setIsLoading(false);
    }
  }, [scheduleFilters]);

  const fetchAvailablePickupSchedules = useCallback(async (filters?: { aggregationCenterId?: string; dateRange?: { start: string; end: string }; minAvailableCapacity?: number }) => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await getAvailablePickupSchedules(filters);
      setPickupSchedules(data);
      
      // Fetch capacity for each unique center
      const uniqueCenterIds = [...new Set(data.map(s => s.aggregationCenterId))];
      const capacityPromises = uniqueCenterIds.map(centerId => 
        getAggregationCenterCapacity(centerId).then(cap => ({ centerId, capacity: cap }))
      );
      const capacities = await Promise.all(capacityPromises);
      const capacityMap = new Map<string, AggregationCenterCapacity>();
      capacities.forEach(({ centerId, capacity }) => {
        if (capacity) {
          capacityMap.set(centerId, capacity);
        }
      });
      setCenterCapacities(capacityMap);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to fetch available schedules");
    } finally {
      setIsLoading(false);
    }
  }, []);

  const bookPickupSlotAction = useCallback(async (scheduleId: string, slotId: string, booking: Partial<PickupSlotBooking>): Promise<PickupSlotBooking | null> => {
    setIsLoading(true);
    setError(null);
    try {
      const result = await bookPickupSlot(scheduleId, slotId, booking);
      if (result.data) {
        // Refresh schedules to update capacity
        const data = await getPickupSchedules(scheduleFilters);
        setPickupSchedules(data);
        return result.data;
      }
      return null;
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to book slot");
      return null;
    } finally {
      setIsLoading(false);
    }
  }, [scheduleFilters]);

  const cancelPickupSlotBookingAction = useCallback(async (bookingId: string) => {
    setIsLoading(true);
    setError(null);
    try {
      await cancelPickupSlotBooking(bookingId);
      // Refresh schedules to update capacity
      const data = await getPickupSchedules(scheduleFilters);
      setPickupSchedules(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to cancel booking");
    } finally {
      setIsLoading(false);
    }
  }, [scheduleFilters]);

  const fetchAggregationCenterCapacityAction = useCallback(async (centerId: string): Promise<AggregationCenterCapacity | null> => {
    // Don't set loading state for capacity fetches to avoid blocking UI
    try {
      const capacity = await getAggregationCenterCapacity(centerId);
      if (capacity) {
        setCenterCapacities(prev => new Map(prev).set(centerId, capacity));
      }
      return capacity;
    } catch (err: any) {
      // Don't log or retry on auth errors (401) or rate limit errors (429)
      // The API client already handles these and prevents retries
      if (err?.statusCode === 401 || err?.statusCode === 429) {
        // Silently fail - API client will handle redirect/rate limiting
        return null;
      }
      console.error('Error fetching center capacity:', err);
      return null;
    }
  }, []);

  const setScheduleFilters = useCallback((newFilters: PickupScheduleFilters) => {
    setScheduleFiltersState(newFilters);
    // Call service function directly to avoid circular dependency
    void (async () => {
      try {
        const data = await getPickupSchedules(newFilters);
        setPickupSchedules(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to fetch pickup schedules");
      }
    })();
  }, []);

  const clearSelectedSchedule = useCallback(() => {
    setSelectedSchedule(null);
  }, []);

  // Farmer booking actions
  const fetchFarmerBookings = useCallback(async (farmerId: string) => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await getFarmerPickupBookings(farmerId);
      setFarmerBookings(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to fetch bookings");
    } finally {
      setIsLoading(false);
    }
  }, []);

  const confirmPickupAction = useCallback(async (
    bookingId: string,
    data: {
      variety: string;
      qualityGrade: "A" | "B" | "C";
      photos?: string[];
      notes?: string;
    }
  ): Promise<PickupSlotBooking | null> => {
    setIsLoading(true);
    setError(null);
    try {
      const result = await confirmPickup(bookingId, data);
      if (result.data) {
        // Update booking in state
        setFarmerBookings(prev => prev.map(b => 
          b.id === bookingId 
            ? { ...b, ...result.data!, pickupConfirmed: true, status: "picked_up" as const }
            : b
        ));
        // Store receipt if available
        if (result.data.pickupReceipt) {
          setPickupReceipts(prev => new Map(prev).set(bookingId, result.data!.pickupReceipt));
        }
        return result.data;
      }
      return null;
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to confirm pickup");
      return null;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const fetchPickupReceipt = useCallback(async (bookingId: string): Promise<PickupReceipt | null> => {
    setIsLoading(true);
    setError(null);
    try {
      const receipt = await getPickupReceiptByBooking(bookingId);
      if (receipt) {
        setPickupReceipts(prev => new Map(prev).set(bookingId, receipt));
      }
      return receipt;
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to fetch receipt");
      return null;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const filteredRequests = requests; // Filtering handled by service
  const filteredSchedules = pickupSchedules; // Filtering handled by service

  // No context-level fetch: each page fetches only what it needs (e.g. TransportRequests → fetchRequests;
  // ActiveDeliveries → fetchActiveDeliveries; PickupScheduleManagement → fetchPickupSchedules).

  const value: TransportContextType = {
    requests,
    selectedRequest,
    activeDeliveries,
    deliveries: activeDeliveries, // Alias for activeDeliveries
    filters,
    stats,
    isLoading,
    error,
    pickupSchedules,
    selectedSchedule,
    scheduleFilters,
    centerCapacities,
    farmerBookings,
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
    fetchPickupSchedules,
    fetchPickupScheduleById,
    createPickupSchedule: createPickupScheduleAction,
    updatePickupSchedule: updatePickupScheduleAction,
    publishPickupSchedule: publishPickupScheduleAction,
    cancelPickupSchedule: cancelPickupScheduleAction,
    fetchAvailablePickupSchedules,
    bookPickupSlot: bookPickupSlotAction,
    cancelPickupSlotBooking: cancelPickupSlotBookingAction,
    fetchAggregationCenterCapacity: fetchAggregationCenterCapacityAction,
    setScheduleFilters,
    clearSelectedSchedule,
    fetchFarmerBookings,
    confirmPickup: confirmPickupAction,
    fetchPickupReceipt,
    filteredRequests,
    filteredSchedules,
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
