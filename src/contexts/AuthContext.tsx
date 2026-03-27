import { createContext, useContext, useState, useEffect, type ReactNode } from "react";
import { 
  login as apiLogin, 
  logout as apiLogout, 
  getCurrentUser,
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
  login: (identifier: string, password: string) => Promise<{ success: boolean; error?: string; role?: UserRole }>;
  logout: () => void;
  
  // User Methods
  updateUser: (updates: Partial<User>) => void;
  
  // Convenience getters
  role: UserRole | null;
  userId: string | null;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

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

          // Verify session with backend (this validates the HttpOnly cookie).
          // Do NOT trust cached user before verification completes -- a timeout
          // or unreachable server must be treated as "not authenticated".
          const SESSION_VERIFY_TIMEOUT_MS = 10_000;
          const controller = new AbortController();
          const timeoutId = setTimeout(() => controller.abort(), SESSION_VERIFY_TIMEOUT_MS);

          try {
            const result = await getCurrentUser(controller.signal);
            clearTimeout(timeoutId);

            if (result.success && result.user) {
              setUser(result.user);
            } else {
              setUser(null);
              clearLocalAuth();
            }
          } catch {
            clearTimeout(timeoutId);
            // Timeout, network failure, or any other error -- treat as unauthenticated
            setUser(null);
            clearLocalAuth();
          }
        } catch (error: any) {
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

  const login = async (identifier: string, password: string): Promise<{ success: boolean; error?: string; role?: UserRole }> => {
    try {
      const result = await apiLogin(identifier, password);
      
      if (result.success && result.user) {
        setUser(result.user);
        return { success: true, role: result.user.role };
      } else {
        return { success: false, error: result.error || "Invalid credentials" };
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

