import { useLocation, useNavigate } from "react-router-dom";
import { Sidebar, Menu, MenuItem, useProSidebar } from "react-pro-sidebar";
import { useEffect, useState, useRef } from "react";
import { useSidebarContext } from "@/contexts/SidebarContext";
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
  IconTruckDelivery,
  IconRefresh,
  IconMessageCircle,
  IconBuilding,
  IconList,
} from "@tabler/icons-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useAuth } from "@/contexts/AuthContext";
import type { UserRole } from "@/contexts/AuthContext";

interface MenuItem {
  name: string;
  path: string;
  icon: React.ComponentType<{ className?: string }>;
}

// Farmer menu items
const farmerMenuItems: MenuItem[] = [
  { name: "Buyer Requests", path: "/farmer/marketplace", icon: IconShoppingBag },
  //{ name: "My RFQs", path: "/dashboard/farmer/rfqs", icon: IconFileText },
  { name: "Inputs", path: "/marketplace/inputs", icon: IconSeeding },
  { name: "My Produce", path: "/dashboard/produce", icon: IconPackage },
  { name: "Pickup Schedules", path: "/dashboard/farmer/pickup-schedules", icon: IconTruck },
  { name: "Orders", path: "/dashboard/orders", icon: IconPackage },
  //{ name: "Negotiations", path: "/dashboard/farmer/negotiations", icon: IconMessageCircle },
  { name: "Analytics", path: "/dashboard/farmer/analytics", icon: IconChartBar },
];

// Buyer menu items
const buyerMenuItems: MenuItem[] = [
 
  { name: "Marketplace", path: "/dashboard/buyer/marketplace", icon: IconShoppingBag },
  { name: "My Orders", path: "/dashboard/buyer/orders", icon: IconPackage },
  { name: "Bulk Requests", path: "/dashboard/buyer/recurring-orders", icon: IconRefresh },
  //{ name: "RFQs", path: "/dashboard/buyer/rfqs", icon: IconFileText },
  //{ name: "Negotiations", path: "/dashboard/buyer/negotiations", icon: IconMessageCircle },
  { name: "Deliveries", path: "/dashboard/buyer/deliveries", icon: IconTruck },
  { name: "Collection", path: "/dashboard/buyer/collection", icon: IconTruckDelivery },
  { name: "Rate Farmers", path: "/dashboard/buyer/ratings", icon: IconStar },
  { name: "Analytics", path: "/dashboard/buyer", icon: IconChartBar }
];

// Officer menu items
const officerMenuItems: MenuItem[] = [
  { name: "My Dashboard", path: "/dashboard/county-officer", icon: IconChartBar },
  { name: "Farmers", path: "/dashboard/county-officer/farmers", icon: IconUsers },
  { name: "Quality Standards", path: "/dashboard/county-officer/quality-standards", icon: IconClipboardCheck },
  { name: "Location Summary", path: "/dashboard/county-officer/location-summary", icon: IconMapPin },
  { name: "Reports", path: "/dashboard/county-officer/reports", icon: IconFileText },
  { name: "Centers", path: "/dashboard/county-officer/centers", icon: IconMapPin },
  { name: "Advisory", path: "/dashboard/county-officer/advisory", icon: IconInfoCircle },
];

// Lead Farmer: same as farmer dashboard + extra tab for commodity approvals
const leadFarmerMenuItems: MenuItem[] = [
  ...farmerMenuItems,
  { name: "Approvals", path: "/dashboard/lead-farmer", icon: IconClipboardCheck },
];

// Staff menu items
const staffMenuItems: MenuItem[] = [
  { name: "My Dashboard", path: "/dashboard/staff", icon: IconChartBar },
  { name: "Users", path: "/dashboard/staff/users", icon: IconUsers },
  { name: "Commodity approval", path: "/dashboard/lead-farmer", icon: IconClipboardCheck },
  { name: "Farmer Groups", path: "/dashboard/staff/farmer-groups", icon: IconUsers },
  { name: "Aggregation Centers", path: "/dashboard/staff/aggregation-centers", icon: IconBuilding },
  { name: "Locations", path: "/dashboard/staff/locations", icon: IconMapPin },
  { name: "Commodity settings", path: "/dashboard/staff/commodity-settings", icon: IconList },
  { name: "Activity Logs", path: "/dashboard/staff/activity-logs", icon: IconFileText },
  { name: "Analytics", path: "/dashboard/staff/analytics", icon: IconChartBar },
  { name: "Reports", path: "/dashboard/staff/reports", icon: IconFileText },
];

// Aggregation Manager menu items
const aggregationManagerMenuItems: MenuItem[] = [
  { name: "My Dashboard", path: "/dashboard/aggregation", icon: IconChartBar },
  { name: "Stock In", path: "/dashboard/aggregation/stock-in", icon: IconTrendingUp },
  { name: "Receive from Ward", path: "/dashboard/aggregation/receive-ward", icon: IconPackage },
  { name: "Stock Out", path: "/dashboard/aggregation/stock-out", icon: IconTrendingDown },
  { name: "Order Processing", path: "/dashboard/aggregation/order-processing", icon: IconPackage },
  //{ name: "Quality Checks", path: "/dashboard/aggregation/quality-checks", icon: IconClipboardCheck },
  { name: "Buyer Matching", path: "/dashboard/aggregation/buyer-matching", icon: IconUsers },
  { name: "Inventory", path: "/dashboard/aggregation/inventory", icon: IconPackage },
  { name: "Reports", path: "/dashboard/aggregation/reports", icon: IconFileText },
  { name: "Farmers", path: "/dashboard/aggregation/farmers", icon: IconUsers },
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
  { name: "Pickup Schedules", path: "/dashboard/transport-provider/pickup-schedules", icon: IconTruck },
  { name: "Requests", path: "/dashboard/transport-requests", icon: IconTruck },
  { name: "Collection", path: "/dashboard/collection", icon: IconPackage },
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
    case "county_officer":
      return officerMenuItems;
    case "lead_farmer":
      return leadFarmerMenuItems;
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
  const { role } = useAuth();
  const { toggled, setToggled } = useSidebarContext();
  const [isMobile, setIsMobile] = useState(false);

  const menuItems = getMenuItemsForRole(role);
  const prevPathnameRef = useRef(location.pathname);

  useEffect(() => {
    const checkMobile = () => {
      const mobile = window.innerWidth < 768;
      setIsMobile(mobile);
      if (!mobile) {
        setToggled(false);
      }
    };

    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, [setToggled]);

  // Close sidebar on mobile only when route actually changes (e.g. after nav click).
  // Do NOT depend on toggled, or the effect runs when menu opens and closes it immediately.
  useEffect(() => {
    if (!isMobile) return;
    if (prevPathnameRef.current !== location.pathname) {
      prevPathnameRef.current = location.pathname;
      setToggled(false);
    } else {
      prevPathnameRef.current = location.pathname;
    }
  }, [isMobile, location.pathname, setToggled]);

  // Close sidebar on mobile when menu item is clicked
  const handleMenuItemClick = (path: string) => {
    navigate(path);
    if (isMobile) {
      setToggled(false);
    }
  };

  return (
    <Sidebar
      collapsed={collapsed}
      toggled={toggled}
      onBackdropClick={() => setToggled(false)}
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
      <div className="flex items-center justify-between p-3 sm:p-4 border-b border-border h-14 sm:h-16">
        {!collapsed && (
          <div className="flex items-center gap-2">
            <div className="h-7 w-7 sm:h-8 sm:w-8 rounded-lg bg-primary flex items-center justify-center flex-shrink-0">
              <span className="text-primary-foreground font-bold text-base sm:text-lg">O</span>
            </div>
            <span className="font-semibold text-base sm:text-lg text-foreground">OFSP</span>
          </div>
        )}
        <Button
          variant="ghost"
          size="icon"
          onClick={() => {
            if (isMobile) {
              setToggled(false);
            } else {
              collapseSidebar(!collapsed);
            }
          }}
          className={cn("ml-auto h-9 w-9 sm:h-10 sm:w-10", collapsed && "mx-auto")}
          aria-label="Toggle sidebar"
        >
          <IconMenu2 className="h-4 w-4 sm:h-5 sm:w-5" />
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
                padding: "0.625rem 0.75rem sm:0.75rem sm:1rem",
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
                icon={<Icon className="h-4 w-4 sm:h-5 sm:w-5" />}
                onClick={() => handleMenuItemClick(item.path)}
              >
                {item.name}
              </MenuItem>
            );
          })}
        </Menu>
      </div>

      {/* Footer */}
      <div className="p-3 sm:p-4 border-t border-border">
        <div className="text-xs text-muted-foreground text-center">
          {!collapsed && <p className="text-xs">OFSP Marketplace v1.0</p>}
        </div>
      </div>
    </Sidebar>
  );
}

