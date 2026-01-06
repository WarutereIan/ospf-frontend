import { createContext, useContext, useState, useEffect, type ReactNode } from "react";

export type UserRole =
  | "farmer"
  | "buyer"
  | "officer"
  | "staff"
  | "aggregation_manager";

interface UserRoleContextType {
  role: UserRole | null;
  setRole: (role: UserRole | null) => void;
  userId: string | null;
  setUserId: (id: string | null) => void;
}

const UserRoleContext = createContext<UserRoleContextType | undefined>(undefined);

export function UserRoleProvider({ children }: { children: ReactNode }) {
  // Load role from localStorage on mount, or default to null
  const [role, setRoleState] = useState<UserRole | null>(() => {
    if (typeof window !== "undefined") {
      const stored = localStorage.getItem("userRole");
      return (stored as UserRole) || null;
    }
    return null;
  });
  
  const [userId, setUserIdState] = useState<string | null>(() => {
    if (typeof window !== "undefined") {
      return localStorage.getItem("userId");
    }
    return null;
  });

  // Persist role to localStorage when it changes
  useEffect(() => {
    if (role) {
      localStorage.setItem("userRole", role);
    } else {
      localStorage.removeItem("userRole");
    }
  }, [role]);

  // Persist userId to localStorage when it changes
  useEffect(() => {
    if (userId) {
      localStorage.setItem("userId", userId);
    } else {
      localStorage.removeItem("userId");
    }
  }, [userId]);

  const setRole = (newRole: UserRole | null) => {
    setRoleState(newRole);
  };

  const setUserId = (id: string | null) => {
    setUserIdState(id);
  };

  return (
    <UserRoleContext.Provider value={{ role, setRole, userId, setUserId }}>
      {children}
    </UserRoleContext.Provider>
  );
}

export function useUserRole() {
  const context = useContext(UserRoleContext);
  if (context === undefined) {
    throw new Error("useUserRole must be used within a UserRoleProvider");
  }
  return context;
}
