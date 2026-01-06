import { Outlet } from "react-router-dom";
import { Header } from "./Header";
import { RoleBasedSidebar } from "./RoleBasedSidebar";
import { ProSidebarProvider } from "react-pro-sidebar";
import { useProSidebar } from "react-pro-sidebar";

function MainContent() {
  const { collapsed } = useProSidebar();

  return (
    <div
      className="flex-1 flex flex-col transition-all duration-300"
      style={{
        marginLeft: collapsed ? "80px" : "250px",
      }}
    >
      <Header />
      <main className="flex-1 p-4 md:p-6 overflow-auto">
        <Outlet />
      </main>
    </div>
  );
}

export function Layout() {
  return (
    <ProSidebarProvider>
      <div className="min-h-screen bg-background flex">
        <RoleBasedSidebar />
        <MainContent />
      </div>
    </ProSidebarProvider>
  );
}
