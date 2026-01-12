import { useLocation, useNavigate } from "react-router-dom";
import { Sidebar, Menu, MenuItem, useProSidebar } from "react-pro-sidebar";
import {
  IconShoppingBag,
  IconChartBar,
  IconPackage,
  IconTrophy,
  IconInfoCircle,
  IconUsers,
  IconSettings,
  IconFileText,
  IconMapPin,
  IconTrendingUp,
  IconTrendingDown,
  IconClipboardCheck,
  IconStar,
  IconMenu2,
  IconSeeding,
  IconTruck,
  IconShoppingCart,
} from "@tabler/icons-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useUserRole } from "@/contexts/UserRoleContext";
import type { UserRole } from "@/contexts/UserRoleContext";

interface MenuItem {
  name: string;
  path: string;
  icon: React.ComponentType<{ className?: string }>;
}

// Farmer menu items
const farmerMenuItems: MenuItem[] = [
  { name: "My Dashboard", path: "/dashboard/farmer", icon: IconChartBar },
  { name: "Marketplace", path: "/marketplace", icon: IconShoppingBag },
  { name: "Inputs", path: "/marketplace/inputs", icon: IconSeeding },
  
  { name: "My Produce", path: "/dashboard/produce", icon: IconPackage },
  { name: "Orders", path: "/dashboard/orders", icon: IconPackage },
  { name: "Leaderboard", path: "/dashboard/leaderboard", icon: IconTrophy },
  { name: "Market Info", path: "/dashboard/market-info", icon: IconInfoCircle },
];

// Buyer menu items
const buyerMenuItems: MenuItem[] = [
  { name: "My Dashboard", path: "/dashboard/buyer", icon: IconChartBar },
  { name: "Marketplace", path: "/marketplace", icon: IconShoppingBag },

  { name: "My Orders", path: "/dashboard/buyer/orders", icon: IconPackage },
  { name: "Rate Farmers", path: "/dashboard/buyer/ratings", icon: IconStar },
];

// Officer menu items
const officerMenuItems: MenuItem[] = [
  { name: "My Dashboard", path: "/dashboard/officer", icon: IconChartBar },
  { name: "Farmers", path: "/dashboard/farmers", icon: IconUsers },
  { name: "Reports", path: "/dashboard/reports", icon: IconFileText },
  { name: "Centers", path: "/dashboard/centers", icon: IconMapPin },
  { name: "Advisory", path: "/dashboard/advisory", icon: IconInfoCircle },
];

// Staff menu items
const staffMenuItems: MenuItem[] = [
  { name: "My Dashboard", path: "/dashboard/staff", icon: IconChartBar },
  { name: "Users", path: "/dashboard/users", icon: IconUsers },
  { name: "Analytics", path: "/dashboard/analytics", icon: IconChartBar },
  { name: "Reports", path: "/dashboard/reports", icon: IconFileText },
  { name: "Settings", path: "/dashboard/settings", icon: IconSettings },
];

// Aggregation Manager menu items
const aggregationManagerMenuItems: MenuItem[] = [
  { name: "My Dashboard", path: "/dashboard/aggregation", icon: IconChartBar },
  { name: "Stock In", path: "/dashboard/stock-in", icon: IconTrendingUp },
  { name: "Stock Out", path: "/dashboard/stock-out", icon: IconTrendingDown },
  { name: "Quality Checks", path: "/dashboard/quality-checks", icon: IconClipboardCheck },
  { name: "Inventory", path: "/dashboard/inventory", icon: IconPackage },
  { name: "Farmers", path: "/dashboard/farmers", icon: IconUsers },
];

// Input Provider menu items
const inputProviderMenuItems: MenuItem[] = [
  { name: "My Dashboard", path: "/dashboard/input-provider", icon: IconChartBar },
  { name: "My Inputs", path: "/dashboard/inputs", icon: IconSeeding },
  { name: "Orders", path: "/dashboard/input-orders", icon: IconShoppingCart },
  { name: "Inventory", path: "/dashboard/input-inventory", icon: IconPackage },
  { name: "Customers", path: "/dashboard/customers", icon: IconUsers },
];

// Transport Provider menu items
const transportProviderMenuItems: MenuItem[] = [
  { name: "My Dashboard", path: "/dashboard/transport-provider", icon: IconChartBar },
  { name: "Requests", path: "/dashboard/transport-requests", icon: IconTruck },
  { name: "Active Deliveries", path: "/dashboard/deliveries", icon: IconTrendingUp },
  { name: "Completed", path: "/dashboard/completed-deliveries", icon: IconClipboardCheck },
  { name: "Earnings", path: "/dashboard/earnings", icon: IconChartBar },
];

function getMenuItemsForRole(role: UserRole | null): MenuItem[] {
  switch (role) {
    case "farmer":
      return farmerMenuItems;
    case "buyer":
      return buyerMenuItems;
    case "officer":
      return officerMenuItems;
    case "staff":
      return staffMenuItems;
    case "aggregation_manager":
      return aggregationManagerMenuItems;
    case "input_provider":
      return inputProviderMenuItems;
    case "transport_provider":
      return transportProviderMenuItems;
    default:
      return farmerMenuItems; // Default to farmer
  }
}

export function RoleBasedSidebar() {
  const location = useLocation();
  const navigate = useNavigate();
  const { collapsed, collapseSidebar } = useProSidebar();
  const { role } = useUserRole();

  const menuItems = getMenuItemsForRole(role);

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
            const isActive =
              location.pathname === item.path ||
              location.pathname.startsWith(item.path);
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

