/**
 * Input Context
 * 
 * Provides global state management for input provider functionality:
 * - Input products
 * - Input orders
 * - Input customers
 */

import { createContext, useContext, useState, useCallback, type ReactNode } from "react";
import type {
  Input,
  InputOrder,
  InputCustomer,
  InputFilters,
  InputOrderFilters,
  CustomerFilters,
  InputStats,
  CustomerStats,
} from "@/types/input";
import {
  getInputs,
  getInputById,
  createInput as createInputService,
  updateInput as updateInputService,
  deleteInput as deleteInputService,
  getInputOrders,
  getInputOrderById,
  updateInputOrderStatus,
  getInputCustomers,
  getInputCustomerById,
  getCustomerOrderHistory,
  getInputStats,
  getCustomerStats,
} from "@/services/inputService";

interface InputContextType {
  // Input Products State
  inputs: Input[];
  selectedInput: Input | null;
  inputFilters: InputFilters;
  
  // Input Orders State
  inputOrders: InputOrder[];
  selectedInputOrder: InputOrder | null;
  inputOrderFilters: InputOrderFilters;
  
  // Customers State
  customers: InputCustomer[];
  selectedCustomer: InputCustomer | null;
  customerFilters: CustomerFilters;
  
  // Statistics
  inputStats: InputStats | null;
  customerStats: CustomerStats | null;
  
  // Loading & Error
  isLoading: boolean;
  error: string | null;
  
  // Input Actions
  fetchInputs: (filters?: InputFilters) => Promise<void>;
  fetchInputById: (id: string) => Promise<void>;
  createInput: (input: Partial<Input>) => Promise<void>;
  updateInput: (id: string, input: Partial<Input>) => Promise<void>;
  deleteInput: (id: string) => Promise<void>;
  setInputFilters: (filters: InputFilters) => void;
  
  // Order Actions
  fetchInputOrders: (filters?: InputOrderFilters) => Promise<void>;
  fetchInputOrderById: (id: string) => Promise<void>;
  updateOrderStatus: (id: string, status: InputOrder["status"]) => Promise<void>;
  setInputOrderFilters: (filters: InputOrderFilters) => void;
  clearSelectedOrder: () => void;
  
  // Customer Actions
  fetchCustomers: (filters?: CustomerFilters) => Promise<void>;
  fetchCustomerById: (id: string) => Promise<void>;
  fetchCustomerOrderHistory: (customerId: string) => Promise<void>;
  setCustomerFilters: (filters: CustomerFilters) => void;
  clearSelectedCustomer: () => void;
  
  // Stats Actions
  fetchInputStats: () => Promise<void>;
  fetchCustomerStats: () => Promise<void>;
  
  // Computed
  filteredInputs: Input[];
  filteredOrders: InputOrder[];
  filteredCustomers: InputCustomer[];
}

const InputContext = createContext<InputContextType | undefined>(undefined);

export function InputProvider({ children }: { children: ReactNode }) {
  // Input Products State
  const [inputs, setInputs] = useState<Input[]>([]);
  const [selectedInput, setSelectedInput] = useState<Input | null>(null);
  const [inputFilters, setInputFiltersState] = useState<InputFilters>({});
  
  // Input Orders State
  const [inputOrders, setInputOrders] = useState<InputOrder[]>([]);
  const [selectedInputOrder, setSelectedInputOrder] = useState<InputOrder | null>(null);
  const [inputOrderFilters, setInputOrderFiltersState] = useState<InputOrderFilters>({});
  
  // Customers State
  const [customers, setCustomers] = useState<InputCustomer[]>([]);
  const [selectedCustomer, setSelectedCustomer] = useState<InputCustomer | null>(null);
  const [customerFilters, setCustomerFiltersState] = useState<CustomerFilters>({});
  
  // Statistics
  const [inputStats, setInputStats] = useState<InputStats | null>(null);
  const [customerStats, setCustomerStats] = useState<CustomerStats | null>(null);
  
  // Loading & Error
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Input Actions
  const fetchInputs = useCallback(async (newFilters?: InputFilters) => {
    setIsLoading(true);
    setError(null);
    try {
      const appliedFilters = newFilters || inputFilters;
      const data = await getInputs(appliedFilters);
      setInputs(data);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Failed to fetch inputs";
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  }, [inputFilters]);

  const fetchInputById = useCallback(async (id: string) => {
    setIsLoading(true);
    setError(null);
    try {
      const input = await getInputById(id);
      setSelectedInput(input);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Failed to fetch input";
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const createInput = useCallback(async (input: Partial<Input>) => {
    setIsLoading(true);
    setError(null);
    try {
      // Add empty location if not provided (backend requires it but we're not collecting it in the form)
      const inputWithLocation = { ...input, location: input.location || "" };
      const result = await createInputService(inputWithLocation);
      if (result.error) {
        setError(result.error);
      } else {
        // Refresh inputs list after successful creation
        await fetchInputs();
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Failed to create input";
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  }, [fetchInputs]);

  const updateInput = useCallback(async (id: string, input: Partial<Input>) => {
    setIsLoading(true);
    setError(null);
    try {
      const result = await updateInputService(id, input);
      if (result.error) {
        setError(result.error);
      } else {
        // Refresh inputs list after successful update
        await fetchInputs();
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Failed to update input";
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  }, [fetchInputs]);

  const deleteInput = useCallback(async (id: string) => {
    setIsLoading(true);
    setError(null);
    try {
      await deleteInputService(id);
      // Refresh inputs list after successful deletion
      await fetchInputs();
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Failed to delete input";
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  }, [fetchInputs]);

  const setInputFilters = (newFilters: InputFilters) => {
    setInputFiltersState(newFilters);
    fetchInputs(newFilters);
  };

  // Order Actions
  const fetchInputOrders = useCallback(async (newFilters?: InputOrderFilters) => {
    setIsLoading(true);
    setError(null);
    try {
      const appliedFilters = newFilters || inputOrderFilters;
      const data = await getInputOrders(appliedFilters);
      setInputOrders(data);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Failed to fetch orders";
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  }, [inputOrderFilters]);

  const fetchInputOrderById = useCallback(async (id: string) => {
    setIsLoading(true);
    setError(null);
    try {
      const order = await getInputOrderById(id);
      setSelectedInputOrder(order);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Failed to fetch order";
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const updateOrderStatus = useCallback(async (id: string, status: InputOrder["status"]) => {
    setIsLoading(true);
    setError(null);
    try {
      await updateInputOrderStatus(id, status);
      await fetchInputOrders();
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Failed to update order status";
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  }, [fetchInputOrders]);

  const setInputOrderFilters = useCallback((newFilters: InputOrderFilters) => {
    setInputOrderFiltersState(newFilters);
    // Call service function directly to avoid circular dependency
    void (async () => {
      try {
        const data = await getInputOrders(newFilters);
        setInputOrders(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to fetch input orders");
      }
    })();
  }, []);

  const clearSelectedOrder = useCallback(() => {
    setSelectedInputOrder(null);
  }, []);

  // Customer Actions
  const fetchCustomers = useCallback(async (newFilters?: CustomerFilters) => {
    setIsLoading(true);
    setError(null);
    try {
      const appliedFilters = newFilters || customerFilters;
      const data = await getInputCustomers(appliedFilters);
      setCustomers(data);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Failed to fetch customers";
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  }, [customerFilters]);

  const fetchCustomerById = useCallback(async (id: string) => {
    setIsLoading(true);
    setError(null);
    try {
      const customer = await getInputCustomerById(id);
      setSelectedCustomer(customer);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Failed to fetch customer";
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const fetchCustomerOrderHistory = useCallback(async (customerId: string) => {
    setIsLoading(true);
    setError(null);
    try {
      const orders = await getCustomerOrderHistory(customerId);
      // Use functional update to avoid dependency on selectedCustomer
      setSelectedCustomer(prev => prev ? { ...prev, orderHistory: orders } : null);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Failed to fetch order history";
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const setCustomerFilters = (newFilters: CustomerFilters) => {
    setCustomerFiltersState(newFilters);
    fetchCustomers(newFilters);
  };

  const clearSelectedCustomer = () => {
    setSelectedCustomer(null);
  };

  // Stats Actions
  const fetchInputStats = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const stats = await getInputStats();
      setInputStats(stats);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Failed to fetch stats";
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const fetchCustomerStats = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const stats = await getCustomerStats();
      setCustomerStats(stats);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Failed to fetch customer stats";
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Computed
  const filteredInputs = inputs.filter((input) => {
    if (inputFilters.category && inputFilters.category !== "all" && input.category !== inputFilters.category) {
      return false;
    }
    if (inputFilters.status && inputFilters.status !== "all" && input.status !== inputFilters.status) {
      return false;
    }
    if (inputFilters.searchQuery) {
      const query = inputFilters.searchQuery.toLowerCase();
      if (!input.name.toLowerCase().includes(query) && !input.description.toLowerCase().includes(query)) {
        return false;
      }
    }
    return true;
  });

  const filteredOrders = inputOrders.filter((order) => {
    if (inputOrderFilters.status && inputOrderFilters.status !== "all" && order.status !== inputOrderFilters.status) {
      return false;
    }
    if (inputOrderFilters.paymentStatus && inputOrderFilters.paymentStatus !== "all" && order.paymentStatus !== inputOrderFilters.paymentStatus) {
      return false;
    }
    if (inputOrderFilters.searchQuery) {
      const query = inputOrderFilters.searchQuery.toLowerCase();
      if (
        !order.orderNumber.toLowerCase().includes(query) &&
        !order.farmerName.toLowerCase().includes(query) &&
        !order.inputName.toLowerCase().includes(query)
      ) {
        return false;
      }
    }
    return true;
  });

  const filteredCustomers = customers.filter((customer) => {
    if (customerFilters.status && customerFilters.status !== "all" && customer.status !== customerFilters.status) {
      return false;
    }
    if (customerFilters.searchQuery) {
      const query = customerFilters.searchQuery.toLowerCase();
      if (
        !customer.farmerName.toLowerCase().includes(query) &&
        !customer.farmerPhone.includes(query) &&
        !customer.location.toLowerCase().includes(query)
      ) {
        return false;
      }
    }
    return true;
  });

  // No context-level fetch: each page fetches only what it needs (e.g. InputManagement → fetchInputs;
  // InputOrders → fetchInputOrders; InputCustomers → fetchCustomers).

  const value: InputContextType = {
    inputs,
    selectedInput,
    inputFilters,
    inputOrders,
    selectedInputOrder,
    inputOrderFilters,
    customers,
    selectedCustomer,
    customerFilters,
    inputStats,
    customerStats,
    isLoading,
    error,
    fetchInputs,
    fetchInputById,
    createInput,
    updateInput,
    deleteInput,
    setInputFilters,
    fetchInputOrders,
    fetchInputOrderById,
    updateOrderStatus,
    setInputOrderFilters,
    clearSelectedOrder,
    fetchCustomers,
    fetchCustomerById,
    fetchCustomerOrderHistory,
    setCustomerFilters,
    clearSelectedCustomer,
    fetchInputStats,
    fetchCustomerStats,
    filteredInputs,
    filteredOrders,
    filteredCustomers,
  };

  return (
    <InputContext.Provider value={value}>
      {children}
    </InputContext.Provider>
  );
}

export function useInput() {
  const context = useContext(InputContext);
  if (context === undefined) {
    throw new Error("useInput must be used within an InputProvider");
  }
  return context;
}
