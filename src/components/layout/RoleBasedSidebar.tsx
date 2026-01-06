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
  IconTrash,
  IconHistory,
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
  { name: "Marketplace", path: "/marketplace", icon: IconShoppingBag },
  { name: "Dashboard", path: "/dashboard/farmer", icon: IconChartBar },
  { name: "My Produce", path: "/dashboard/farmer/produce", icon: IconPackage },
  { name: "Orders", path: "/dashboard/farmer/orders", icon: IconPackage },
  { name: "Leaderboard", path: "/dashboard/farmer/leaderboard", icon: IconTrophy },
  { name: "Market Info", path: "/dashboard/farmer/market-info", icon: IconInfoCircle },
];

// Buyer menu items
const buyerMenuItems: MenuItem[] = [
  { name: "Dashboard", path: "/dashboard/buyer", icon: IconChartBar },
  { name: "Marketplace", path: "/marketplace", icon: IconShoppingBag },
  { name: "My Orders", path: "/dashboard/buyer/orders", icon: IconPackage },
  { name: "Rate Farmers", path: "/dashboard/buyer/ratings", icon: IconStar },
  { name: "Recurring Orders", path: "/dashboard/buyer/recurring-orders", icon: IconShoppingBag },
];

// Officer menu items
const officerMenuItems: MenuItem[] = [
  { name: "Dashboard", path: "/dashboard/officer", icon: IconChartBar },
  { name: "Farmers", path: "/dashboard/officer/farmers", icon: IconUsers },
  { name: "Reports", path: "/dashboard/officer/reports", icon: IconFileText },
  { name: "Centers", path: "/dashboard/officer/centers", icon: IconMapPin },
  { name: "Advisory", path: "/dashboard/officer/advisory", icon: IconInfoCircle },
];

// Staff menu items
const staffMenuItems: MenuItem[] = [
  { name: "Dashboard", path: "/dashboard/staff", icon: IconChartBar },
  { name: "Users", path: "/dashboard/staff/users", icon: IconUsers },
  { name: "Analytics", path: "/dashboard/staff/analytics", icon: IconChartBar },
  { name: "Reports", path: "/dashboard/staff/reports", icon: IconFileText },
  { name: "Settings", path: "/dashboard/staff/settings", icon: IconSettings },
];

// Aggregation Manager menu items
const aggregationManagerMenuItems: MenuItem[] = [
  { name: "Dashboard", path: "/dashboard/aggregation", icon: IconChartBar },
  { name: "Stock In", path: "/dashboard/aggregation/stock-in", icon: IconTrendingUp },
  { name: "Stock Out", path: "/dashboard/aggregation/stock-out", icon: IconTrendingDown },
  { name: "Quality Checks", path: "/dashboard/aggregation/quality-checks", icon: IconClipboardCheck },
  { name: "Inventory", path: "/dashboard/aggregation/inventory", icon: IconPackage },
  { name: "Wastage Tracking", path: "/dashboard/aggregation/wastage", icon: IconTrash },
  { name: "Transaction History", path: "/dashboard/aggregation/transaction-history", icon: IconHistory },
  { name: "Farmers", path: "/dashboard/aggregation/farmers", icon: IconUsers },
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
