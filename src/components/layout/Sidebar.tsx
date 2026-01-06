import { useLocation, useNavigate } from "react-router-dom";
import { Sidebar, Menu, MenuItem, ProSidebarProvider, useProSidebar } from "react-pro-sidebar";
import {
  IconHome,
  IconShoppingBag,
  IconChartBar,
  IconPackage,
  IconTrophy,
  IconMenu2,
  IconInfoCircle,
} from "@tabler/icons-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

// TODO: This should be role-based, for now showing farmer menu
const menuItems = [
  { name: "Home", path: "/", icon: IconHome },
  { name: "Marketplace", path: "/marketplace", icon: IconShoppingBag },
  { name: "Dashboard", path: "/dashboard/farmer", icon: IconChartBar },
  { name: "My Produce", path: "/dashboard/produce", icon: IconPackage },
  { name: "Orders", path: "/dashboard/orders", icon: IconPackage },
  { name: "Leaderboard", path: "/dashboard/leaderboard", icon: IconTrophy },
  { name: "Market Info", path: "/dashboard/market-info", icon: IconInfoCircle },
];

function SidebarContent() {
  const location = useLocation();
  const navigate = useNavigate();
  const { collapsed, collapseSidebar } = useProSidebar();

  return (
    <Sidebar
      collapsed={collapsed}
      breakPoint="md"
      width="250px"
      collapsedWidth="80px"
      className="border-r border-border bg-card"
      rootStyles={{
        height: "100vh",
        position: "fixed",
        left: 0,
        top: 0,
        zIndex: 1000,
      }}
    >
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-border h-16">
        {!collapsed && (
          <div className="flex items-center gap-2">
            <div className="h-8 w-8 rounded-lg bg-primary flex items-center justify-center">
              <span className="text-primary-foreground font-bold text-lg">O</span>
            </div>
            <span className="font-semibold text-lg text-foreground">OFSP</span>
          </div>
        )}
        <Button
          variant="ghost"
          size="icon"
          onClick={() => collapseSidebar(!collapsed)}
          className={cn("ml-auto", collapsed && "mx-auto")}
        >
          <IconMenu2 className="h-5 w-5" />
        </Button>
      </div>

      {/* Menu Content */}
      <div className="flex-1 overflow-y-auto p-2">
        <Menu
          menuItemStyles={{
            button: ({ active }) => {
              return {
                backgroundColor: active
                  ? "hsl(var(--primary))"
                  : "transparent",
                color: active
                  ? "hsl(var(--primary-foreground))"
                  : "hsl(var(--muted-foreground))",
                borderRadius: "0.5rem",
                padding: "0.75rem 1rem",
                marginBottom: "0.25rem",
                fontSize: "0.875rem",
                fontWeight: 500,
                transition: "all 0.2s ease",
                "&:hover": {
                  backgroundColor: active
                    ? "hsl(var(--primary))"
                    : "hsl(var(--accent))",
                  color: active
                    ? "hsl(var(--primary-foreground))"
                    : "hsl(var(--accent-foreground))",
                },
              };
            },
          }}
        >
          {menuItems.map((item) => {
            // Check if current path matches or starts with item path
            const isActive =
              location.pathname === item.path ||
              (item.path !== "/" && location.pathname.startsWith(item.path));
            const Icon = item.icon;
            return (
              <MenuItem
                key={item.name}
                active={isActive}
                icon={<Icon className="h-5 w-5" />}
                onClick={() => navigate(item.path)}
              >
                {item.name}
              </MenuItem>
            );
          })}
        </Menu>
      </div>

      {/* Footer */}
      <div className="p-4 border-t border-border">
        <div className="text-xs text-muted-foreground text-center">
          {!collapsed && <p>OFSP Marketplace v1.0</p>}
        </div>
      </div>
    </Sidebar>
  );
}

export function AppSidebar() {
  return <SidebarContent />;
}

export { ProSidebarProvider };
