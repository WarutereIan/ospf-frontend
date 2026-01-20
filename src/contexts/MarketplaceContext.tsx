/**
 * Marketplace Context
 * 
 * Provides global state management for marketplace functionality:
 * - Produce listings
 * - Marketplace orders
 */

import { createContext, useContext, useState, useEffect, useCallback, type ReactNode } from "react";
import type {
  ProduceListing,
  MarketplaceOrder,
  SourcingRequest,
  SupplierOffer,
  RecurringOrder,
  MarketplaceFilters,
  MarketplaceOrderFilters,
  SourcingRequestFilters,
  MarketplaceStats,
} from "@/types/marketplace";
import {
  getListings,
  getListingById,
  createListing,
  updateListing,
  deleteListing,
  getMarketplaceOrders,
  getMarketplaceOrderById,
  createMarketplaceOrder,
  updateMarketplaceOrderStatus,
  getSourcingRequests,
  getSourcingRequestById,
  createSourcingRequest,
  updateSourcingRequest,
  submitSupplierOffer,
  acceptSupplierOffer,
  getRecurringOrders,
  createRecurringOrder,
  updateRecurringOrder,
  cancelRecurringOrder,
  getMarketplaceStats,
} from "@/services/marketplaceService";

interface MarketplaceContextType {
  // Listings State
  listings: ProduceListing[];
  selectedListing: ProduceListing | null;
  listingFilters: MarketplaceFilters;
  marketplaceFilters: MarketplaceFilters; // Alias for listingFilters (used in some contexts)
  
  // Orders State
  orders: MarketplaceOrder[];
  selectedOrder: MarketplaceOrder | null;
  orderFilters: MarketplaceOrderFilters;
  
  // Sourcing Requests State
  sourcingRequests: SourcingRequest[];
  selectedSourcingRequest: SourcingRequest | null;
  sourcingRequestFilters: SourcingRequestFilters;
  
  // Recurring Orders State
  recurringOrders: RecurringOrder[];
  
  // Statistics
  stats: MarketplaceStats | null;
  
  // Loading & Error
  isLoading: boolean;
  error: string | null;
  
  // Listing Actions
  fetchListings: (filters?: MarketplaceFilters) => Promise<void>;
  fetchListingById: (id: string) => Promise<void>;
  createListing: (listing: Partial<ProduceListing>) => Promise<void>;
  updateListing: (id: string, listing: Partial<ProduceListing>) => Promise<void>;
  deleteListing: (id: string) => Promise<void>;
  setListingFilters: (filters: MarketplaceFilters) => void;
  setMarketplaceFilters: (filters: MarketplaceFilters) => void; // Alias for setListingFilters (used in some contexts)
  clearSelectedListing: () => void;
  
  // Order Actions
  fetchOrders: (filters?: MarketplaceOrderFilters) => Promise<void>;
  fetchOrderById: (id: string) => Promise<void>;
  createOrder: (order: Partial<MarketplaceOrder>) => Promise<void>;
  updateOrderStatus: (id: string, status: MarketplaceOrder["status"]) => Promise<void>;
  setOrderFilters: (filters: MarketplaceOrderFilters) => void;
  clearSelectedOrder: () => void;
  
  // Sourcing Request Actions
  fetchSourcingRequests: (filters?: SourcingRequestFilters) => Promise<void>;
  fetchSourcingRequestById: (id: string) => Promise<void>;
  createSourcingRequest: (request: Partial<SourcingRequest>) => Promise<void>;
  updateSourcingRequest: (id: string, request: Partial<SourcingRequest>) => Promise<void>;
  submitSupplierOffer: (requestId: string, offer: Partial<SupplierOffer>) => Promise<void>;
  acceptSupplierOffer: (offerId: string) => Promise<void>;
  setSourcingRequestFilters: (filters: SourcingRequestFilters) => void;
  clearSelectedSourcingRequest: () => void;
  
  // Recurring Order Actions
  fetchRecurringOrders: () => Promise<void>;
  createRecurringOrder: (order: Partial<RecurringOrder>) => Promise<void>;
  updateRecurringOrder: (id: string, order: Partial<RecurringOrder>) => Promise<void>;
  cancelRecurringOrder: (id: string) => Promise<void>;
  
  // Stats Actions
  fetchStats: () => Promise<void>;
  
  // Computed
  filteredListings: ProduceListing[];
  filteredOrders: MarketplaceOrder[];
}

const MarketplaceContext = createContext<MarketplaceContextType | undefined>(undefined);

export function MarketplaceProvider({ children }: { children: ReactNode }) {
  const [listings, setListings] = useState<ProduceListing[]>([]);
  const [selectedListing, setSelectedListing] = useState<ProduceListing | null>(null);
  const [listingFilters, setListingFiltersState] = useState<MarketplaceFilters>({});
  
  const [orders, setOrders] = useState<MarketplaceOrder[]>([]);
  const [selectedOrder, setSelectedOrder] = useState<MarketplaceOrder | null>(null);
  const [orderFilters, setOrderFiltersState] = useState<MarketplaceOrderFilters>({});
  
  const [sourcingRequests, setSourcingRequests] = useState<SourcingRequest[]>([]);
  const [selectedSourcingRequest, setSelectedSourcingRequest] = useState<SourcingRequest | null>(null);
  const [sourcingRequestFilters, setSourcingRequestFiltersState] = useState<SourcingRequestFilters>({});
  
  const [recurringOrders, setRecurringOrders] = useState<RecurringOrder[]>([]);
  
  const [stats, setStats] = useState<MarketplaceStats | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Listing Actions
  const fetchListings = useCallback(async (newFilters?: MarketplaceFilters) => {
    setIsLoading(true);
    setError(null);
    try {
      const appliedFilters = newFilters || listingFilters;
      const data = await getListings(appliedFilters);
      setListings(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to fetch listings");
    } finally {
      setIsLoading(false);
    }
  }, [listingFilters]);

  const fetchListingById = useCallback(async (id: string) => {
    setIsLoading(true);
    setError(null);
    try {
      const listing = await getListingById(id);
      setSelectedListing(listing);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to fetch listing");
    } finally {
      setIsLoading(false);
    }
  }, []);

  const createListingAction = useCallback(async (listing: Partial<ProduceListing>) => {
    setIsLoading(true);
    setError(null);
    try {
      await createListing(listing);
      // Refresh listings - call service function directly to avoid circular dependency
      const data = await getListings(listingFilters);
      setListings(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to create listing");
    } finally {
      setIsLoading(false);
    }
  }, [listingFilters]);

  const updateListingAction = useCallback(async (id: string, listing: Partial<ProduceListing>) => {
    setIsLoading(true);
    setError(null);
    try {
      await updateListing(id, listing);
      // Refresh listings - call service function directly
      const data = await getListings(listingFilters);
      setListings(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to update listing");
    } finally {
      setIsLoading(false);
    }
  }, [listingFilters]);

  const deleteListingAction = useCallback(async (id: string) => {
    setIsLoading(true);
    setError(null);
    try {
      await deleteListing(id);
      // Refresh listings - call service function directly
      const data = await getListings(listingFilters);
      setListings(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to delete listing");
    } finally {
      setIsLoading(false);
    }
  }, [listingFilters]);

  const setListingFilters = useCallback((newFilters: MarketplaceFilters) => {
    setListingFiltersState(newFilters);
    // Call service function directly to avoid circular dependency with fetchListings
    void (async () => {
      try {
        const data = await getListings(newFilters);
        setListings(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to fetch listings");
      }
    })();
  }, []);

  const clearSelectedListing = useCallback(() => {
    setSelectedListing(null);
  }, []);

  // Order Actions
  const fetchOrders = useCallback(async (newFilters?: MarketplaceOrderFilters) => {
    setIsLoading(true);
    setError(null);
    try {
      const appliedFilters = newFilters || orderFilters;
      const data = await getMarketplaceOrders(appliedFilters);
      setOrders(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to fetch orders");
    } finally {
      setIsLoading(false);
    }
  }, [orderFilters]);

  const fetchOrderById = useCallback(async (id: string) => {
    setIsLoading(true);
    setError(null);
    try {
      const order = await getMarketplaceOrderById(id);
      setSelectedOrder(order);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to fetch order");
    } finally {
      setIsLoading(false);
    }
  }, []);

  const createOrder = useCallback(async (order: Partial<MarketplaceOrder>) => {
    setIsLoading(true);
    setError(null);
    try {
      await createMarketplaceOrder(order);
      // Refresh orders - call service function directly to avoid circular dependency
      const data = await getMarketplaceOrders(orderFilters);
      setOrders(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to create order");
    } finally {
      setIsLoading(false);
    }
  }, [orderFilters]);

  const updateOrderStatus = useCallback(async (id: string, status: MarketplaceOrder["status"]) => {
    setIsLoading(true);
    setError(null);
    try {
      await updateMarketplaceOrderStatus(id, status);
      // Refresh orders - call service function directly
      const data = await getMarketplaceOrders(orderFilters);
      setOrders(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to update order status");
    } finally {
      setIsLoading(false);
    }
  }, [orderFilters]);

  const setOrderFilters = useCallback((newFilters: MarketplaceOrderFilters) => {
    setOrderFiltersState(newFilters);
    // Call service function directly to avoid circular dependency
    void (async () => {
      try {
        const data = await getMarketplaceOrders(newFilters);
        setOrders(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to fetch orders");
      }
    })();
  }, []);

  const clearSelectedOrder = useCallback(() => {
    setSelectedOrder(null);
  }, []);

  // Sourcing Request Actions
  const fetchSourcingRequests = useCallback(async (newFilters?: SourcingRequestFilters) => {
    setIsLoading(true);
    setError(null);
    try {
      const appliedFilters = newFilters || sourcingRequestFilters;
      const data = await getSourcingRequests(appliedFilters);
      setSourcingRequests(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to fetch sourcing requests");
    } finally {
      setIsLoading(false);
    }
  }, [sourcingRequestFilters]);

  const fetchSourcingRequestById = useCallback(async (id: string) => {
    setIsLoading(true);
    setError(null);
    try {
      const request = await getSourcingRequestById(id);
      setSelectedSourcingRequest(request);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to fetch sourcing request");
    } finally {
      setIsLoading(false);
    }
  }, []);

  const createSourcingRequestAction = useCallback(async (request: Partial<SourcingRequest>) => {
    setIsLoading(true);
    setError(null);
    try {
      await createSourcingRequest(request);
      // Refresh sourcing requests - call service function directly to avoid circular dependency
      const data = await getSourcingRequests(sourcingRequestFilters);
      setSourcingRequests(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to create sourcing request");
    } finally {
      setIsLoading(false);
    }
  }, [sourcingRequestFilters]);

  const updateSourcingRequestAction = useCallback(async (id: string, request: Partial<SourcingRequest>) => {
    setIsLoading(true);
    setError(null);
    try {
      await updateSourcingRequest(id, request);
      // Refresh sourcing requests - call service function directly
      const data = await getSourcingRequests(sourcingRequestFilters);
      setSourcingRequests(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to update sourcing request");
    } finally {
      setIsLoading(false);
    }
  }, [sourcingRequestFilters]);

  const submitSupplierOfferAction = useCallback(async (requestId: string, offer: Partial<SupplierOffer>) => {
    setIsLoading(true);
    setError(null);
    try {
      await submitSupplierOffer(requestId, offer);
      // Refresh sourcing requests - call service function directly
      const data = await getSourcingRequests(sourcingRequestFilters);
      setSourcingRequests(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to submit offer");
    } finally {
      setIsLoading(false);
    }
  }, [sourcingRequestFilters]);

  const acceptSupplierOfferAction = useCallback(async (offerId: string) => {
    setIsLoading(true);
    setError(null);
    try {
      await acceptSupplierOffer(offerId);
      // Refresh sourcing requests - call service function directly
      const data = await getSourcingRequests(sourcingRequestFilters);
      setSourcingRequests(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to accept offer");
    } finally {
      setIsLoading(false);
    }
  }, [sourcingRequestFilters]);

  const setSourcingRequestFilters = useCallback((newFilters: SourcingRequestFilters) => {
    setSourcingRequestFiltersState(newFilters);
    // Call service function directly to avoid circular dependency
    void (async () => {
      try {
        const data = await getSourcingRequests(newFilters);
        setSourcingRequests(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to fetch sourcing requests");
      }
    })();
  }, []);

  const clearSelectedSourcingRequest = useCallback(() => {
    setSelectedSourcingRequest(null);
  }, []);

  // Recurring Order Actions
  const fetchRecurringOrders = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await getRecurringOrders();
      setRecurringOrders(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to fetch recurring orders");
    } finally {
      setIsLoading(false);
    }
  }, []);

  const createRecurringOrderAction = useCallback(async (order: Partial<RecurringOrder>) => {
    setIsLoading(true);
    setError(null);
    try {
      await createRecurringOrder(order);
      // Refresh recurring orders - call service function directly
      const data = await getRecurringOrders();
      setRecurringOrders(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to create recurring order");
    } finally {
      setIsLoading(false);
    }
  }, []);

  const updateRecurringOrderAction = useCallback(async (id: string, order: Partial<RecurringOrder>) => {
    setIsLoading(true);
    setError(null);
    try {
      await updateRecurringOrder(id, order);
      // Refresh recurring orders - call service function directly
      const data = await getRecurringOrders();
      setRecurringOrders(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to update recurring order");
    } finally {
      setIsLoading(false);
    }
  }, []);

  const cancelRecurringOrderAction = useCallback(async (id: string) => {
    setIsLoading(true);
    setError(null);
    try {
      await cancelRecurringOrder(id);
      // Refresh recurring orders - call service function directly
      const data = await getRecurringOrders();
      setRecurringOrders(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to cancel recurring order");
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Stats Actions
  const fetchStats = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await getMarketplaceStats();
      setStats(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to fetch stats");
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Computed
  const filteredListings = listings; // Filtering handled by service
  const filteredOrders = orders; // Filtering handled by service

  useEffect(() => {
    fetchListings();
    fetchOrders();
    fetchSourcingRequests();
    fetchRecurringOrders();
    fetchStats();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const value: MarketplaceContextType = {
    listings,
    selectedListing,
    listingFilters,
    marketplaceFilters: listingFilters, // Alias for listingFilters
    setMarketplaceFilters: setListingFilters, // Alias for setListingFilters
    orders,
    selectedOrder,
    orderFilters,
    sourcingRequests,
    selectedSourcingRequest,
    sourcingRequestFilters,
    recurringOrders,
    stats,
    isLoading,
    error,
    fetchListings,
    fetchListingById,
    createListing: createListingAction,
    updateListing: updateListingAction,
    deleteListing: deleteListingAction,
    setListingFilters,
    clearSelectedListing,
    fetchOrders,
    fetchOrderById,
    createOrder,
    updateOrderStatus,
    setOrderFilters,
    clearSelectedOrder,
    fetchSourcingRequests,
    fetchSourcingRequestById,
    createSourcingRequest: createSourcingRequestAction,
    updateSourcingRequest: updateSourcingRequestAction,
    submitSupplierOffer: submitSupplierOfferAction,
    acceptSupplierOffer: acceptSupplierOfferAction,
    setSourcingRequestFilters,
    clearSelectedSourcingRequest,
    fetchRecurringOrders,
    createRecurringOrder: createRecurringOrderAction,
    updateRecurringOrder: updateRecurringOrderAction,
    cancelRecurringOrder: cancelRecurringOrderAction,
    fetchStats,
    filteredListings,
    filteredOrders,
  };

  return (
    <MarketplaceContext.Provider value={value}>
      {children}
    </MarketplaceContext.Provider>
  );
}

export function useMarketplace() {
  const context = useContext(MarketplaceContext);
  if (context === undefined) {
    throw new Error("useMarketplace must be used within a MarketplaceProvider");
  }
  return context;
}
