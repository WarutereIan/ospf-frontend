import { createContext, useContext, useState, type ReactNode } from "react";

interface SidebarContextType {
  toggled: boolean;
  setToggled: (toggled: boolean) => void;
}

const SidebarContext = createContext<SidebarContextType | undefined>(undefined);

export function SidebarProvider({ children }: { children: ReactNode }) {
  const [toggled, setToggled] = useState(false);

  return (
    <SidebarContext.Provider value={{ toggled, setToggled }}>
      {children}
    </SidebarContext.Provider>
  );
}

export function useSidebarContext() {
  const context = useContext(SidebarContext);
  if (context === undefined) {
    throw new Error("useSidebarContext must be used within a SidebarProvider");
  }
  return context;
}
