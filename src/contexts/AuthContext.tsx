import { createContext, useContext, useState, useEffect, type ReactNode } from "react";
import { 
  login as apiLogin, 
  logout as apiLogout, 
  getCurrentUser,
  type LoginRequest 
} from "@/services/authService";
import { getLocalUser, storeLocalUser, clearLocalAuth } from "@/lib/api-client";

export type UserRole =
  | "farmer"
  | "lead_farmer"
  | "buyer"
  | "officer"
  | "extension_officer"
  | "county_officer"  // Backend EXTENSION_OFFICER; used by user API and staff UI
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

// Mock credentials - matches LoginPage (for development/testing fallback)
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
  lead_farmer: {
    role: "lead_farmer",
    name: "Kamau Mwangi",
    phone: "+254789012345",
    password: "leadfarmer123",
    email: "kamau.lead@example.com",
    location: "Kangundo",
    subCounty: "Kangundo",
  },
};

const MOCK_USER_KEY = "ofsp_mock_user";

// Session restore lock to prevent multiple simultaneous /auth/me calls
let sessionRestorePromise: Promise<void> | null = null;
let isRestoringSession = false;

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Restore session on mount:
  // 1. Show cached user immediately (for fast UX)
  // 2. Verify session with backend via /auth/me (HttpOnly cookie)
  useEffect(() => {
    const restoreSession = async () => {
      // If already restoring session, wait for existing restore to complete
      if (isRestoringSession && sessionRestorePromise) {
        await sessionRestorePromise;
        return;
      }

      // Start new session restore
      isRestoringSession = true;
      sessionRestorePromise = (async () => {
        try {
          // Skip session restore on login/register pages - no need to verify session
          const isAuthPage = window.location.pathname === '/login' || 
                            window.location.pathname === '/register' ||
                            window.location.pathname === '/forgot-password';
          
          // Check for mock user first (development fallback)
          const mockUser = localStorage.getItem(MOCK_USER_KEY);
          if (mockUser) {
            const parsed = JSON.parse(mockUser);
            if (parsed.id?.startsWith('mock-')) {
              setUser(parsed as User);
              setIsLoading(false);
              isRestoringSession = false;
              sessionRestorePromise = null;
              return;
            }
          }

          // Check for cached user
          const cachedUser = getLocalUser();
          
          // If no cached user data, skip backend verification
          // This prevents unnecessary /auth/me calls when not logged in
          if (!cachedUser || !cachedUser.id) {
            setUser(null);
            setIsLoading(false);
            isRestoringSession = false;
            sessionRestorePromise = null;
            return;
          }
          
          // If on auth page, clear any stale cached data and skip verification
          if (isAuthPage) {
            setUser(null);
            clearLocalAuth();
            setIsLoading(false);
            isRestoringSession = false;
            sessionRestorePromise = null;
            return;
          }

          // Show cached user immediately for better UX
          setUser(cachedUser as unknown as User);

          // Verify session with backend (this validates the HttpOnly cookie)
          // Suppress error toast for /auth/me calls during session restore
          const result = await getCurrentUser();
          if (result.success && result.user) {
            setUser(result.user);
          } else {
            // Session invalid - clear local data
            setUser(null);
            clearLocalAuth();
          }
        } catch (error: any) {
          // Don't log 401 errors during session restore - they're expected when not authenticated
          if (error?.statusCode !== 401 && error?.statusCode !== 429) {
            console.error("Error restoring session:", error);
          }
          setUser(null);
          clearLocalAuth();
        } finally {
          setIsLoading(false);
          isRestoringSession = false;
          sessionRestorePromise = null;
        }
      })();

      await sessionRestorePromise;
    };

    restoreSession();
  }, []);

  const login = async (phone: string, password: string): Promise<{ success: boolean; error?: string }> => {
    try {
      // Try backend API first
      const result = await apiLogin(phone, password);
      
      if (result.success && result.user) {
        setUser(result.user);
        // Clear any mock user
        localStorage.removeItem(MOCK_USER_KEY);
        return { success: true };
      } else {
        // Fallback to mock credentials for development/testing
        const normalizedPhone = phone.replace(/\s+/g, "").replace(/-/g, "");
        const credential = Object.values(MOCK_CREDENTIALS).find(
          (cred) => cred.phone === normalizedPhone || cred.phone.replace(/\s+/g, "") === normalizedPhone
        );

        if (credential && credential.password === password) {
          // Create user object from mock credentials
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
          // Store mock user separately
          localStorage.setItem(MOCK_USER_KEY, JSON.stringify(newUser));
          return { success: true };
        } else {
          return { success: false, error: result.error || "Invalid phone number or password" };
        }
      }
    } catch (error) {
      console.error("Login error:", error);
      return { success: false, error: "An error occurred during login" };
    }
  };

  const logout = async () => {
    try {
      await apiLogout();
    } catch (error) {
      console.error("Logout error:", error);
    } finally {
      setUser(null);
      clearLocalAuth();
      localStorage.removeItem(MOCK_USER_KEY);
    }
  };

  const updateUser = (updates: Partial<User>) => {
    if (user) {
      const updatedUser = { ...user, ...updates };
      setUser(updatedUser);
      // Update local cache
      storeLocalUser(updatedUser);
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
