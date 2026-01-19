import { createContext, useContext, useState, useEffect, type ReactNode } from "react";

export type UserRole =
  | "farmer"
  | "buyer"
  | "officer"
  | "staff"
  | "aggregation_manager"
  | "input_provider"
  | "transport_provider";

export interface User {
  id: string;
  name: string;
  phone: string;
  role: UserRole;
  email?: string;
  location?: string;
  subCounty?: string;
  createdAt?: string;
  lastLogin?: string;
}

interface AuthContextType {
  // Auth State
  isAuthenticated: boolean;
  user: User | null;
  isLoading: boolean;

  // Auth Methods
  login: (phone: string, password: string) => Promise<{ success: boolean; error?: string }>;
  logout: () => void;
  
  // User Methods
  updateUser: (updates: Partial<User>) => void;
  
  // Convenience getters
  role: UserRole | null;
  userId: string | null;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Mock credentials - matches LoginPage
const MOCK_CREDENTIALS: Record<string, { role: UserRole; name: string; phone: string; password: string; email?: string; location?: string; subCounty?: string }> = {
  farmer: {
    role: "farmer",
    name: "John Mutua",
    phone: "+254712345678",
    password: "farmer123",
    email: "john.mutua@example.com",
    location: "Kangundo",
    subCounty: "Kangundo",
  },
  buyer: {
    role: "buyer",
    name: "Sarah Mwangi",
    phone: "+254723456789",
    password: "buyer123",
    email: "sarah.mwangi@example.com",
    location: "Nairobi",
  },
  officer: {
    role: "officer",
    name: "David Kimani",
    phone: "+254734567890",
    password: "officer123",
    email: "david.kimani@example.com",
    location: "Machakos",
  },
  staff: {
    role: "staff",
    name: "Mary Wanjiku",
    phone: "+254745678901",
    password: "staff123",
    email: "mary.wanjiku@example.com",
    location: "Nairobi",
  },
  aggregation_manager: {
    role: "aggregation_manager",
    name: "Peter Kariuki",
    phone: "+254756789012",
    password: "manager123",
    email: "peter.kariuki@example.com",
    location: "Kangundo",
    subCounty: "Kangundo",
  },
  input_provider: {
    role: "input_provider",
    name: "Grace Njeri",
    phone: "+254767890123",
    password: "input123",
    email: "grace.njeri@example.com",
    location: "Nairobi",
  },
  transport_provider: {
    role: "transport_provider",
    name: "James Omondi",
    phone: "+254778901234",
    password: "transport123",
    email: "james.omondi@example.com",
    location: "Nairobi",
  },
};

const STORAGE_KEY = "ofsp_auth";

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Load user from localStorage on mount
  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        setUser(parsed);
      }
    } catch (error) {
      console.error("Error loading auth from storage:", error);
      localStorage.removeItem(STORAGE_KEY);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Save user to localStorage whenever it changes
  useEffect(() => {
    if (user) {
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(user));
      } catch (error) {
        console.error("Error saving auth to storage:", error);
      }
    } else {
      localStorage.removeItem(STORAGE_KEY);
    }
  }, [user]);

  const login = async (phone: string, password: string): Promise<{ success: boolean; error?: string }> => {
    // Normalize phone number (remove spaces, dashes, etc.)
    const normalizedPhone = phone.replace(/\s+/g, "").replace(/-/g, "");

    // Check against mock credentials
    const credential = Object.values(MOCK_CREDENTIALS).find(
      (cred) => cred.phone === normalizedPhone || cred.phone.replace(/\s+/g, "") === normalizedPhone
    );

    if (credential && credential.password === password) {
      // Create user object
      const newUser: User = {
        id: `mock-${credential.role}-${Date.now()}`,
        name: credential.name,
        phone: credential.phone,
        role: credential.role,
        email: credential.email,
        location: credential.location,
        subCounty: credential.subCounty,
        createdAt: new Date().toISOString(),
        lastLogin: new Date().toISOString(),
      };

      setUser(newUser);
      return { success: true };
    } else {
      return { success: false, error: "Invalid phone number or password" };
    }
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem(STORAGE_KEY);
  };

  const updateUser = (updates: Partial<User>) => {
    if (user) {
      setUser({ ...user, ...updates });
    }
  };

  const value: AuthContextType = {
    isAuthenticated: !!user,
    user,
    isLoading,
    login,
    logout,
    updateUser,
    role: user?.role || null,
    userId: user?.id || null,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}

// Export mock credentials for use in LoginPage
export { MOCK_CREDENTIALS };

