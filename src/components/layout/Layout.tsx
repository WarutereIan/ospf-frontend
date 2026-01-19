import { Outlet, Navigate } from "react-router-dom";
import { Header } from "./Header";
import { RoleBasedSidebar } from "./RoleBasedSidebar";
import { ProSidebarProvider } from "react-pro-sidebar";
import { useProSidebar } from "react-pro-sidebar";
import { useAuth } from "@/contexts/AuthContext";

function MainContent() {
  const { collapsed } = useProSidebar();

  return (
    <div
      className="flex-1 flex flex-col transition-all duration-300 w-full min-w-0 overflow-x-hidden"
      style={{
        marginLeft: collapsed ? "80px" : "250px",
      }}
    >
      <Header />
      <main className="flex-1 p-4 md:p-6 overflow-auto overflow-x-hidden w-full max-w-full">
        <Outlet />
      </main>
    </div>
  );
}

export function Layout() {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center space-y-4">
          <div className="h-8 w-8 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-sm text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return (
    <ProSidebarProvider>
      <div className="min-h-screen bg-background flex">
        <RoleBasedSidebar />
        <MainContent />
      </div>
    </ProSidebarProvider>
  );
}

