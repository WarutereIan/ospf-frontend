/**
 * Input Customer Context
 * 
 * Provides global state management for input provider customers.
 * This context centralizes customer data and operations.
 */

import { createContext, useContext, useState, useEffect, type ReactNode } from "react";
import type { Customer, CustomerStats, CustomerFilters } from "@/types/inputCustomer";
import {
  getCustomers,
  getCustomerById,
  getCustomerStats,
  getCustomerOrderHistory,
} from "@/services/inputCustomerService";

interface InputCustomerContextType {
  // State
  customers: Customer[];
  selectedCustomer: Customer | null;
  stats: CustomerStats | null;
  isLoading: boolean;
  error: string | null;
  filters: CustomerFilters;
  
  // Actions
  fetchCustomers: (filters?: CustomerFilters) => Promise<void>;
  fetchCustomerById: (id: string) => Promise<void>;
  fetchStats: () => Promise<void>;
  fetchCustomerOrderHistory: (customerId: string) => Promise<void>;
  setFilters: (filters: CustomerFilters) => void;
  clearSelectedCustomer: () => void;
  
  // Computed
  filteredCustomers: Customer[];
}

const InputCustomerContext = createContext<InputCustomerContextType | undefined>(undefined);

export function InputCustomerProvider({ children }: { children: ReactNode }) {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);
  const [stats, setStats] = useState<CustomerStats | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [filters, setFiltersState] = useState<CustomerFilters>({});

  /**
   * Fetch all customers with optional filters
   */
  const fetchCustomers = async (newFilters?: CustomerFilters) => {
    setIsLoading(true);
    setError(null);
    try {
      const appliedFilters = newFilters || filters;
      const data = await getCustomers(appliedFilters);
      setCustomers(data);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Failed to fetch customers";
      setError(errorMessage);
      console.error("Error fetching customers:", err);
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * Fetch customer by ID
   */
  const fetchCustomerById = async (id: string) => {
    setIsLoading(true);
    setError(null);
    try {
      const customer = await getCustomerById(id);
      if (customer) {
        setSelectedCustomer(customer);
      } else {
        setError("Customer not found");
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Failed to fetch customer";
      setError(errorMessage);
      console.error("Error fetching customer:", err);
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * Fetch customer statistics
   */
  const fetchStats = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await getCustomerStats();
      setStats(data);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Failed to fetch stats";
      setError(errorMessage);
      console.error("Error fetching stats:", err);
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * Fetch customer order history
   */
  const fetchCustomerOrderHistory = async (customerId: string) => {
    setIsLoading(true);
    setError(null);
    try {
      const orderHistory = await getCustomerOrderHistory(customerId);
      if (selectedCustomer) {
        setSelectedCustomer({
          ...selectedCustomer,
          orderHistory,
        });
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Failed to fetch order history";
      setError(errorMessage);
      console.error("Error fetching order history:", err);
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * Update filters and refetch customers
   */
  const setFilters = (newFilters: CustomerFilters) => {
    setFiltersState(newFilters);
    fetchCustomers(newFilters);
  };

  /**
   * Clear selected customer
   */
  const clearSelectedCustomer = () => {
    setSelectedCustomer(null);
  };

  /**
   * Computed: Filtered customers based on current filters
   */
  const filteredCustomers = customers.filter((customer) => {
    if (filters.searchQuery) {
      const query = filters.searchQuery.toLowerCase();
      const matchesSearch =
        customer.farmerName.toLowerCase().includes(query) ||
        customer.farmerPhone.includes(query) ||
        customer.location.toLowerCase().includes(query);
      if (!matchesSearch) return false;
    }
    
    if (filters.status && customer.status !== filters.status) {
      return false;
    }
    
    if (filters.location) {
      const matchesLocation = customer.location
        .toLowerCase()
        .includes(filters.location.toLowerCase());
      if (!matchesLocation) return false;
    }
    
    return true;
  });

  // Initial fetch on mount
  useEffect(() => {
    fetchCustomers();
    fetchStats();
  }, []);

  const value: InputCustomerContextType = {
    customers,
    selectedCustomer,
    stats,
    isLoading,
    error,
    filters,
    fetchCustomers,
    fetchCustomerById,
    fetchStats,
    fetchCustomerOrderHistory,
    setFilters,
    clearSelectedCustomer,
    filteredCustomers,
  };

  return (
    <InputCustomerContext.Provider value={value}>
      {children}
    </InputCustomerContext.Provider>
  );
}

/**
 * Hook to use Input Customer Context
 */
export function useInputCustomer() {
  const context = useContext(InputCustomerContext);
  if (context === undefined) {
    throw new Error("useInputCustomer must be used within an InputCustomerProvider");
  }
  return context;
}
