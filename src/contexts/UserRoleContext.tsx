import { createContext, useContext, useState, type ReactNode } from "react";

export type UserRole =
  | "farmer"
  | "buyer"
  | "officer"
  | "staff"
  | "aggregation_manager"
  | "input_provider"
  | "transport_provider";

interface UserRoleContextType {
  role: UserRole | null;
  setRole: (role: UserRole | null) => void;
  userId: string | null;
  setUserId: (id: string | null) => void;
}

const UserRoleContext = createContext<UserRoleContextType | undefined>(undefined);

export function UserRoleProvider({ children }: { children: ReactNode }) {
  // TODO: Replace with actual authentication/role fetching
  // For now, defaulting to farmer for development
  const [role, setRole] = useState<UserRole | null>("farmer");
  const [userId, setUserId] = useState<string | null>(null);

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

