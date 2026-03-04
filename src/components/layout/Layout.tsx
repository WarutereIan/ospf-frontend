import { Outlet, Navigate, useLocation } from "react-router-dom";
import { Header } from "./Header";
import { RoleBasedSidebar } from "./RoleBasedSidebar";
import { ProSidebarProvider } from "react-pro-sidebar";
import { useProSidebar } from "react-pro-sidebar";
import { useAuth } from "@/contexts/AuthContext";
import { ProfileProvider } from "@/contexts/ProfileContext";
import { AnalyticsProvider } from "@/contexts/AnalyticsContext";
import { SidebarProvider } from "@/contexts/SidebarContext";
import { getAllowedRolesForPath } from "@/lib/route-config";
import { useEffect, useState } from "react";

function MainContent() {
  const { collapsed } = useProSidebar();
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };

    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  // Guard: clear any stale inline overflow styles on body (e.g. leaked from select/dialog)
  useEffect(() => {
    document.body.style.overflow = "";
  });

  // Note: Sidebar closing on route change is handled in RoleBasedSidebar

  return (
    <div
      className="flex-1 flex flex-col transition-all duration-300 w-full min-w-0 min-h-0"
      style={{
        marginLeft: isMobile ? "0" : collapsed ? "80px" : "250px",
      }}
    >
      <Header />
      <main data-layout-main className="flex-1 p-3 sm:p-4 md:p-6 overflow-y-auto overflow-x-hidden w-full max-w-full min-h-0">
        <Outlet />
      </main>
    </div>
  );
}

export function Layout() {
  const { isAuthenticated, isLoading, user } = useAuth();
  const { pathname } = useLocation();

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

  const allowedRoles = getAllowedRolesForPath(pathname);
  if (allowedRoles.length > 0 && user && !allowedRoles.includes(user.role)) {
    return <Navigate to="/dashboard" replace />;
  }

  return (
    <ProfileProvider>
      <AnalyticsProvider>
        <ProSidebarProvider>
          <SidebarProvider>
            <div className="h-screen bg-background flex overflow-hidden">
              <RoleBasedSidebar />
              <MainContent />
            </div>
          </SidebarProvider>
        </ProSidebarProvider>
      </AnalyticsProvider>
    </ProfileProvider>
  );
}

