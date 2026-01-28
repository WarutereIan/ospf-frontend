/**
 * Marketplace Context
 * 
 * Provides global state management for marketplace functionality:
 * - Produce listings
 * - Marketplace orders
 */

import { createContext, useContext, useState, useCallback, type ReactNode } from "react";
import type {
  ProduceListing,
  MarketplaceOrder,
  SourcingRequest,
  SupplierOffer,
  RecurringOrder,
  Negotiation,
  NegotiationMessage,
  NegotiationFilters,
  RFQ,
  RFQResponse,
  RFQFilters,
  RFQResponseFilters,
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
  markOrderAsCollected,
  confirmDeliveryByBuyer,
  getSourcingRequests,
  getSourcingRequestById,
  createSourcingRequest,
  updateSourcingRequest,
  publishSourcingRequest,
  closeSourcingRequest,
  submitSupplierOffer,
  acceptSupplierOffer,
  getRecurringOrders,
  createRecurringOrder,
  updateRecurringOrder,
  cancelRecurringOrder,
  getNegotiations,
  getNegotiationById,
  initiateNegotiation,
  sendNegotiationMessage,
  acceptNegotiation,
  rejectNegotiation,
  convertNegotiationToOrder,
  getRFQs,
  getRFQById,
  createRFQ,
  updateRFQ,
  publishRFQ,
  closeRFQ,
  cancelRFQ,
  getRFQResponses,
  submitRFQResponse,
  getRFQResponseById,
  updateRFQResponseStatus,
  awardRFQ,
  convertRFQResponseToOrder,
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
  
  // Negotiations State
  negotiations: Negotiation[];
  selectedNegotiation: Negotiation | null;
  negotiationFilters: NegotiationFilters;
  
  // RFQs State
  rfqs: RFQ[];
  selectedRFQ: RFQ | null;
  rfqFilters: RFQFilters;
  
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
  markOrderAsCollected: (id: string) => Promise<void>;
  confirmDeliveryByBuyer: (id: string) => Promise<void>;
  setOrderFilters: (filters: MarketplaceOrderFilters) => void;
  clearSelectedOrder: () => void;
  
  // Sourcing Request Actions
  fetchSourcingRequests: (filters?: SourcingRequestFilters) => Promise<void>;
  fetchSourcingRequestById: (id: string) => Promise<void>;
  createSourcingRequest: (request: Partial<SourcingRequest>) => Promise<SourcingRequest | null>;
  updateSourcingRequest: (id: string, request: Partial<SourcingRequest>) => Promise<void>;
  publishSourcingRequest: (id: string) => Promise<void>;
  closeSourcingRequest: (id: string) => Promise<void>;
  submitSupplierOffer: (requestId: string, offer: Partial<SupplierOffer>) => Promise<void>;
  acceptSupplierOffer: (offerId: string) => Promise<void>;
  setSourcingRequestFilters: (filters: SourcingRequestFilters) => void;
  clearSelectedSourcingRequest: () => void;
  
  // Recurring Order Actions
  fetchRecurringOrders: () => Promise<void>;
  createRecurringOrder: (order: Partial<RecurringOrder> & { buyerId: string; farmerId: string }) => Promise<void>;
  updateRecurringOrder: (id: string, order: Partial<RecurringOrder>) => Promise<void>;
  cancelRecurringOrder: (id: string) => Promise<void>;
  
  // Negotiation Actions
  fetchNegotiations: (filters?: NegotiationFilters) => Promise<void>;
  fetchNegotiationById: (id: string) => Promise<void>;
  initiateNegotiation: (listingId: string, message: Partial<NegotiationMessage>) => Promise<Negotiation | null>;
  sendNegotiationMessage: (negotiationId: string, message: Partial<NegotiationMessage>) => Promise<void>;
  acceptNegotiation: (negotiationId: string) => Promise<void>;
  rejectNegotiation: (negotiationId: string) => Promise<void>;
  convertNegotiationToOrder: (negotiationId: string) => Promise<MarketplaceOrder | null>;
  setNegotiationFilters: (filters: NegotiationFilters) => void;
  clearSelectedNegotiation: () => void;
  
  // RFQ Actions
  fetchRFQs: (filters?: RFQFilters) => Promise<void>;
  fetchRFQById: (id: string) => Promise<void>;
  createRFQ: (rfq: Partial<RFQ>) => Promise<void>;
  updateRFQ: (id: string, rfq: Partial<RFQ>) => Promise<void>;
  publishRFQ: (id: string) => Promise<void>;
  closeRFQ: (id: string) => Promise<void>;
  cancelRFQ: (id: string) => Promise<void>;
  fetchRFQResponses: (rfqId: string, filters?: RFQResponseFilters) => Promise<RFQResponse[]>;
  submitRFQResponse: (rfqId: string, response: Partial<RFQResponse>) => Promise<void>;
  fetchRFQResponseById: (rfqId: string, responseId: string) => Promise<void>;
  updateRFQResponseStatus: (rfqId: string, responseId: string, status: RFQResponse["status"]) => Promise<void>;
  awardRFQ: (rfqId: string, responseIds: string[]) => Promise<void>;
  convertRFQResponseToOrder: (rfqId: string, responseId: string) => Promise<MarketplaceOrder | null>;
  setRFQFilters: (filters: RFQFilters) => void;
  clearSelectedRFQ: () => void;
  
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
  
  const [negotiations, setNegotiations] = useState<Negotiation[]>([]);
  const [selectedNegotiation, setSelectedNegotiation] = useState<Negotiation | null>(null);
  const [negotiationFilters, setNegotiationFiltersState] = useState<NegotiationFilters>({});
  
  const [rfqs, setRFQs] = useState<RFQ[]>([]);
  const [selectedRFQ, setSelectedRFQ] = useState<RFQ | null>(null);
  const [rfqFilters, setRFQFiltersState] = useState<RFQFilters>({});
  
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

  const markOrderAsCollectedAction = useCallback(async (id: string) => {
    setIsLoading(true);
    setError(null);
    try {
      const result = await markOrderAsCollected(id);
      if (result.error) {
        throw new Error(result.error);
      }
      // Refresh orders - call service function directly
      const data = await getMarketplaceOrders(orderFilters);
      setOrders(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to mark order as collected");
      throw err; // Re-throw so caller can handle it
    } finally {
      setIsLoading(false);
    }
  }, [orderFilters]);

  const confirmDeliveryByBuyerAction = useCallback(async (id: string) => {
    setIsLoading(true);
    setError(null);
    try {
      const result = await confirmDeliveryByBuyer(id);
      if (result.error) {
        throw new Error(result.error);
      }
      // Refresh orders - call service function directly
      const data = await getMarketplaceOrders(orderFilters);
      setOrders(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to confirm delivery");
      throw err; // Re-throw so caller can handle it
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

  const createSourcingRequestAction = useCallback(async (request: Partial<SourcingRequest>): Promise<SourcingRequest | null> => {
    setIsLoading(true);
    setError(null);
    try {
      const result = await createSourcingRequest(request);
      const created = result.data ?? null;
      const data = await getSourcingRequests(sourcingRequestFilters);
      setSourcingRequests(data);
      return created;
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to create sourcing request");
      return null;
    } finally {
      setIsLoading(false);
    }
  }, [sourcingRequestFilters]);

  const updateSourcingRequestAction = useCallback(async (id: string, request: Partial<SourcingRequest>) => {
    setIsLoading(true);
    setError(null);
    try {
      await updateSourcingRequest(id, request);
      const data = await getSourcingRequests(sourcingRequestFilters);
      setSourcingRequests(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to update sourcing request");
    } finally {
      setIsLoading(false);
    }
  }, [sourcingRequestFilters]);

  const publishSourcingRequestAction = useCallback(async (id: string) => {
    setIsLoading(true);
    setError(null);
    try {
      await publishSourcingRequest(id);
      const data = await getSourcingRequests(sourcingRequestFilters);
      setSourcingRequests(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to publish sourcing request");
    } finally {
      setIsLoading(false);
    }
  }, [sourcingRequestFilters]);

  const closeSourcingRequestAction = useCallback(async (id: string) => {
    setIsLoading(true);
    setError(null);
    try {
      await closeSourcingRequest(id);
      const data = await getSourcingRequests(sourcingRequestFilters);
      setSourcingRequests(data);
      // Refresh selected request if it's the one being closed
      if (selectedSourcingRequest?.id === id) {
        await fetchSourcingRequestById(id);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to close sourcing request");
    } finally {
      setIsLoading(false);
    }
  }, [sourcingRequestFilters, selectedSourcingRequest]);

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

  const createRecurringOrderAction = useCallback(async (order: Partial<RecurringOrder> & { buyerId: string; farmerId: string }) => {
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

  // Negotiation Actions
  const fetchNegotiations = useCallback(async (newFilters?: NegotiationFilters) => {
    setIsLoading(true);
    setError(null);
    try {
      const appliedFilters = newFilters || negotiationFilters;
      const data = await getNegotiations(appliedFilters);
      setNegotiations(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to fetch negotiations");
    } finally {
      setIsLoading(false);
    }
  }, [negotiationFilters]);

  const fetchNegotiationById = useCallback(async (id: string) => {
    setIsLoading(true);
    setError(null);
    try {
      const negotiation = await getNegotiationById(id);
      setSelectedNegotiation(negotiation);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to fetch negotiation");
    } finally {
      setIsLoading(false);
    }
  }, []);

  const initiateNegotiationAction = useCallback(async (listingId: string, message: Partial<NegotiationMessage>): Promise<Negotiation | null> => {
    setIsLoading(true);
    setError(null);
    try {
      const result = await initiateNegotiation(listingId, message);
      // Refresh negotiations - call service function directly
      const data = await getNegotiations(negotiationFilters);
      setNegotiations(data);
      return result.data || null;
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to initiate negotiation");
      return null;
    } finally {
      setIsLoading(false);
    }
  }, [negotiationFilters]);

  const sendNegotiationMessageAction = useCallback(async (negotiationId: string, message: Partial<NegotiationMessage>) => {
    setIsLoading(true);
    setError(null);
    try {
      await sendNegotiationMessage(negotiationId, message);
      // Refresh negotiation - call service function directly
      const negotiation = await getNegotiationById(negotiationId);
      setSelectedNegotiation(negotiation);
      const data = await getNegotiations(negotiationFilters);
      setNegotiations(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to send message");
    } finally {
      setIsLoading(false);
    }
  }, [negotiationFilters]);

  const acceptNegotiationAction = useCallback(async (negotiationId: string) => {
    setIsLoading(true);
    setError(null);
    try {
      await acceptNegotiation(negotiationId);
      // Refresh negotiations - call service function directly
      const data = await getNegotiations(negotiationFilters);
      setNegotiations(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to accept negotiation");
    } finally {
      setIsLoading(false);
    }
  }, [negotiationFilters]);

  const rejectNegotiationAction = useCallback(async (negotiationId: string) => {
    setIsLoading(true);
    setError(null);
    try {
      await rejectNegotiation(negotiationId);
      // Refresh negotiations - call service function directly
      const data = await getNegotiations(negotiationFilters);
      setNegotiations(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to reject negotiation");
    } finally {
      setIsLoading(false);
    }
  }, [negotiationFilters]);

  const convertNegotiationToOrderAction = useCallback(async (negotiationId: string): Promise<MarketplaceOrder | null> => {
    setIsLoading(true);
    setError(null);
    try {
      const result = await convertNegotiationToOrder(negotiationId);
      // Refresh orders and negotiations - call service functions directly
      const ordersData = await getMarketplaceOrders(orderFilters);
      setOrders(ordersData);
      const negotiationsData = await getNegotiations(negotiationFilters);
      setNegotiations(negotiationsData);
      return result.data || null;
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to convert negotiation to order");
      return null;
    } finally {
      setIsLoading(false);
    }
  }, [orderFilters, negotiationFilters]);

  const setNegotiationFilters = useCallback((newFilters: NegotiationFilters) => {
    setNegotiationFiltersState(newFilters);
    // Call service function directly to avoid circular dependency
    void (async () => {
      try {
        const data = await getNegotiations(newFilters);
        setNegotiations(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to fetch negotiations");
      }
    })();
  }, []);

  const clearSelectedNegotiation = useCallback(() => {
    setSelectedNegotiation(null);
  }, []);

  // RFQ Actions
  const fetchRFQs = useCallback(async (newFilters?: RFQFilters) => {
    setIsLoading(true);
    setError(null);
    try {
      const appliedFilters = newFilters || rfqFilters;
      const data = await getRFQs(appliedFilters);
      setRFQs(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to fetch RFQs");
    } finally {
      setIsLoading(false);
    }
  }, [rfqFilters]);

  const fetchRFQById = useCallback(async (id: string) => {
    setIsLoading(true);
    setError(null);
    try {
      const rfq = await getRFQById(id);
      setSelectedRFQ(rfq);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to fetch RFQ");
    } finally {
      setIsLoading(false);
    }
  }, []);

  const createRFQAction = useCallback(async (rfq: Partial<RFQ>) => {
    setIsLoading(true);
    setError(null);
    try {
      await createRFQ(rfq);
      // Refresh RFQs - call service function directly
      const data = await getRFQs(rfqFilters);
      setRFQs(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to create RFQ");
    } finally {
      setIsLoading(false);
    }
  }, [rfqFilters]);

  const updateRFQAction = useCallback(async (id: string, rfq: Partial<RFQ>) => {
    setIsLoading(true);
    setError(null);
    try {
      await updateRFQ(id, rfq);
      // Refresh RFQs - call service function directly
      const data = await getRFQs(rfqFilters);
      setRFQs(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to update RFQ");
    } finally {
      setIsLoading(false);
    }
  }, [rfqFilters]);

  const publishRFQAction = useCallback(async (id: string) => {
    setIsLoading(true);
    setError(null);
    try {
      await publishRFQ(id);
      // Refresh RFQs - call service function directly
      const data = await getRFQs(rfqFilters);
      setRFQs(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to publish RFQ");
    } finally {
      setIsLoading(false);
    }
  }, [rfqFilters]);

  const closeRFQAction = useCallback(async (id: string) => {
    setIsLoading(true);
    setError(null);
    try {
      await closeRFQ(id);
      // Refresh RFQs - call service function directly
      const data = await getRFQs(rfqFilters);
      setRFQs(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to close RFQ");
    } finally {
      setIsLoading(false);
    }
  }, [rfqFilters]);

  const cancelRFQAction = useCallback(async (id: string) => {
    setIsLoading(true);
    setError(null);
    try {
      await cancelRFQ(id);
      // Refresh RFQs - call service function directly
      const data = await getRFQs(rfqFilters);
      setRFQs(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to cancel RFQ");
    } finally {
      setIsLoading(false);
    }
  }, [rfqFilters]);

  const fetchRFQResponses = useCallback(async (rfqId: string, filters?: RFQResponseFilters): Promise<RFQResponse[]> => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await getRFQResponses(rfqId, filters);
      // Update selected RFQ with responses only if it's the same RFQ and responses actually changed
      if (selectedRFQ?.id === rfqId) {
        const currentResponseIds = new Set(selectedRFQ.responses?.map(r => r.id) || []);
        const newResponseIds = new Set(data.map(r => r.id));
        const responsesChanged = 
          currentResponseIds.size !== newResponseIds.size ||
          [...currentResponseIds].some(id => !newResponseIds.has(id));
        
        if (responsesChanged) {
          setSelectedRFQ(prev => prev ? { ...prev, responses: data } : null);
        }
      }
      return data;
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to fetch RFQ responses");
      return [];
    } finally {
      setIsLoading(false);
    }
  }, [selectedRFQ?.id]); // Only depend on the ID, not the entire selectedRFQ object

  const submitRFQResponseAction = useCallback(async (rfqId: string, response: Partial<RFQResponse>) => {
    setIsLoading(true);
    setError(null);
    try {
      await submitRFQResponse(rfqId, response);
      // Refresh RFQ responses - call service function directly
      const data = await getRFQResponses(rfqId);
      if (selectedRFQ?.id === rfqId) {
        // Always update when submitting a new response
        setSelectedRFQ(prev => prev ? { ...prev, responses: data } : null);
      }
      // Refresh RFQs list
      const rfqsData = await getRFQs(rfqFilters);
      setRFQs(rfqsData);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to submit RFQ response");
    } finally {
      setIsLoading(false);
    }
  }, [selectedRFQ?.id, rfqFilters]); // Only depend on the ID

  const fetchRFQResponseById = useCallback(async (rfqId: string, responseId: string) => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await getRFQResponseById(rfqId, responseId);
      // Update selected RFQ with the response only if it actually changed
      if (selectedRFQ?.id === rfqId && response) {
        const currentResponse = selectedRFQ.responses?.find(r => r.id === responseId);
        if (!currentResponse || JSON.stringify(currentResponse) !== JSON.stringify(response)) {
          const updatedResponses = selectedRFQ.responses?.map(r => 
            r.id === responseId ? response : r
          ) || [response];
          setSelectedRFQ(prev => prev ? { ...prev, responses: updatedResponses } : null);
        }
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to fetch RFQ response");
    } finally {
      setIsLoading(false);
    }
  }, [selectedRFQ?.id]); // Only depend on the ID

  const updateRFQResponseStatusAction = useCallback(async (rfqId: string, responseId: string, status: RFQResponse["status"]) => {
    setIsLoading(true);
    setError(null);
    try {
      await updateRFQResponseStatus(rfqId, responseId, status);
      // Refresh RFQ responses - call service function directly
      const data = await getRFQResponses(rfqId);
      if (selectedRFQ?.id === rfqId) {
        const currentResponseIds = new Set(selectedRFQ.responses?.map(r => r.id) || []);
        const newResponseIds = new Set(data.map(r => r.id));
        const responsesChanged = 
          currentResponseIds.size !== newResponseIds.size ||
          [...currentResponseIds].some(id => !newResponseIds.has(id)) ||
          data.some(r => {
            const current = selectedRFQ.responses?.find(cr => cr.id === r.id);
            return !current || current.status !== r.status;
          });
        
        if (responsesChanged) {
          setSelectedRFQ(prev => prev ? { ...prev, responses: data } : null);
        }
      }
      // Refresh RFQs list
      const rfqsData = await getRFQs(rfqFilters);
      setRFQs(rfqsData);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to update RFQ response status");
    } finally {
      setIsLoading(false);
    }
  }, [selectedRFQ?.id, rfqFilters]); // Only depend on the ID

  const awardRFQAction = useCallback(async (rfqId: string, responseIds: string[]) => {
    setIsLoading(true);
    setError(null);
    try {
      await awardRFQ(rfqId, responseIds);
      // Refresh RFQs - call service function directly
      const data = await getRFQs(rfqFilters);
      setRFQs(data);
      const rfq = await getRFQById(rfqId);
      setSelectedRFQ(rfq);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to award RFQ");
    } finally {
      setIsLoading(false);
    }
  }, [rfqFilters]);

  const convertRFQResponseToOrderAction = useCallback(async (rfqId: string, responseId: string): Promise<MarketplaceOrder | null> => {
    setIsLoading(true);
    setError(null);
    try {
      const result = await convertRFQResponseToOrder(rfqId, responseId);
      // Refresh orders and RFQs - call service functions directly
      const ordersData = await getMarketplaceOrders(orderFilters);
      setOrders(ordersData);
      const rfqsData = await getRFQs(rfqFilters);
      setRFQs(rfqsData);
      return result.data || null;
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to convert RFQ response to order");
      return null;
    } finally {
      setIsLoading(false);
    }
  }, [orderFilters, rfqFilters]);

  const setRFQFilters = useCallback((newFilters: RFQFilters) => {
    setRFQFiltersState(newFilters);
    // Call service function directly to avoid circular dependency
    void (async () => {
      try {
        const data = await getRFQs(newFilters);
        setRFQs(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to fetch RFQs");
      }
    })();
  }, []);

  const clearSelectedRFQ = useCallback(() => {
    setSelectedRFQ(null);
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

  // No context-level fetch: each page fetches only what it needs (BuyerRequests → RFQs + sourcing;
  // RFQList → RFQs; ProduceManagement → listings; etc.). Avoids duplicate/unnecessary calls.

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
    negotiations,
    selectedNegotiation,
    negotiationFilters,
    rfqs,
    selectedRFQ,
    rfqFilters,
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
    markOrderAsCollected: markOrderAsCollectedAction,
    confirmDeliveryByBuyer: confirmDeliveryByBuyerAction,
    setOrderFilters,
    clearSelectedOrder,
    fetchSourcingRequests,
    fetchSourcingRequestById,
    createSourcingRequest: createSourcingRequestAction,
    updateSourcingRequest: updateSourcingRequestAction,
    publishSourcingRequest: publishSourcingRequestAction,
    closeSourcingRequest: closeSourcingRequestAction,
    submitSupplierOffer: submitSupplierOfferAction,
    acceptSupplierOffer: acceptSupplierOfferAction,
    setSourcingRequestFilters,
    clearSelectedSourcingRequest,
    fetchRecurringOrders,
    createRecurringOrder: createRecurringOrderAction,
    updateRecurringOrder: updateRecurringOrderAction,
    cancelRecurringOrder: cancelRecurringOrderAction,
    fetchNegotiations,
    fetchNegotiationById,
    initiateNegotiation: initiateNegotiationAction,
    sendNegotiationMessage: sendNegotiationMessageAction,
    acceptNegotiation: acceptNegotiationAction,
    rejectNegotiation: rejectNegotiationAction,
    convertNegotiationToOrder: convertNegotiationToOrderAction,
    setNegotiationFilters,
    clearSelectedNegotiation,
    fetchRFQs,
    fetchRFQById,
    createRFQ: createRFQAction,
    updateRFQ: updateRFQAction,
    publishRFQ: publishRFQAction,
    closeRFQ: closeRFQAction,
    cancelRFQ: cancelRFQAction,
    fetchRFQResponses,
    submitRFQResponse: submitRFQResponseAction,
    fetchRFQResponseById,
    updateRFQResponseStatus: updateRFQResponseStatusAction,
    awardRFQ: awardRFQAction,
    convertRFQResponseToOrder: convertRFQResponseToOrderAction,
    setRFQFilters,
    clearSelectedRFQ,
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
