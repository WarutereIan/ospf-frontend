import { BrowserRouter, Routes, Route } from "react-router-dom";
import { UserRoleProvider } from "@/contexts/UserRoleContext";
import { Layout } from "@/components/layout/Layout";
import { HomePage } from "@/pages/HomePage";
import { LoginPage } from "@/pages/auth/LoginPage";
import { RegisterPage } from "@/pages/auth/RegisterPage";
import { MarketplacePage } from "@/pages/marketplace/MarketplacePage";
import { DashboardPage } from "@/pages/dashboard/DashboardPage";
import { FarmerDashboard } from "@/pages/dashboard/FarmerDashboard";
import { BuyerDashboard } from "@/pages/dashboard/BuyerDashboard";
import { OfficerDashboard } from "@/pages/dashboard/OfficerDashboard";
import { StaffDashboard } from "@/pages/dashboard/StaffDashboard";
import { AggregationManagerDashboard } from "@/pages/dashboard/AggregationManagerDashboard";
import { ProduceManagement } from "@/pages/farmer/ProduceManagement";
import { FarmerOrders } from "@/pages/farmer/FarmerOrders";
import { FarmerOrderDetails } from "@/pages/farmer/FarmerOrderDetails";
import { PeerLeaderboard } from "@/pages/farmer/PeerLeaderboard";
import { MarketInfo } from "@/pages/farmer/MarketInfo";
import { StockInForm } from "@/pages/aggregation/StockInForm";
import { StockOutForm } from "@/pages/aggregation/StockOutForm";
import { InventoryManagement } from "@/pages/aggregation/InventoryManagement";
import { StorageManagement } from "@/pages/aggregation/StorageManagement";
import { CapacityManagement } from "@/pages/aggregation/CapacityManagement";
import { QualityCheck } from "@/pages/aggregation/QualityCheck";
import { WastageTracking } from "@/pages/aggregation/WastageTracking";
import { StockTransactionHistory } from "@/pages/aggregation/StockTransactionHistory";
import { PaymentHistory } from "@/pages/payments/PaymentHistory";
import { BuyerOrders } from "@/pages/buyer/BuyerOrders";
import { BuyerOrderDetails } from "@/pages/buyer/BuyerOrderDetails";
import { RateFarmerPage } from "@/pages/buyer/RateFarmerPage";
import { Ratings } from "@/pages/buyer/Ratings";
import { RecurringOrders } from "@/pages/marketplace/RecurringOrders";
import { Farmers } from "@/pages/officer/Farmers";
import { Reports } from "@/pages/officer/Reports";
import { Centers } from "@/pages/officer/Centers";
import { Advisory } from "@/pages/officer/Advisory";
import { Analytics } from "@/pages/staff/Analytics";
import { Users } from "@/pages/staff/Users";
import { Settings } from "@/pages/staff/Settings";
import { NotFoundPage } from "@/pages/NotFoundPage";

export function App() {
  return (
    <UserRoleProvider>
      <BrowserRouter>
        <Routes>
          {/* Public Routes */}
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          
          {/* Protected Routes with Layout */}
          <Route element={<Layout />}>
            <Route path="/" element={<HomePage />} />
            <Route path="/marketplace" element={<MarketplacePage />} />
            
            {/* General Dashboard - redirects based on role */}
            <Route path="/dashboard" element={<DashboardPage />} />
            
            {/* Role-based Dashboards */}
            <Route path="/dashboard/farmer" element={<FarmerDashboard />} />
            <Route path="/dashboard/buyer" element={<BuyerDashboard />} />
            <Route path="/dashboard/officer" element={<OfficerDashboard />} />
            <Route path="/dashboard/staff" element={<StaffDashboard />} />
            <Route path="/dashboard/aggregation" element={<AggregationManagerDashboard />} />
            
            {/* Farmer Routes */}
            <Route path="/dashboard/farmer/produce" element={<ProduceManagement />} />
            <Route path="/dashboard/farmer/produce/new" element={<ProduceManagement />} />
            <Route path="/dashboard/farmer/orders" element={<FarmerOrders />} />
            <Route path="/dashboard/farmer/orders/:id" element={<FarmerOrderDetails />} />
            <Route path="/dashboard/farmer/leaderboard" element={<PeerLeaderboard />} />
            <Route path="/dashboard/farmer/market-info" element={<MarketInfo />} />
            <Route path="/dashboard/farmer/payments" element={<PaymentHistory />} />
            
            {/* Buyer Routes */}
            <Route path="/dashboard/buyer/orders" element={<BuyerOrders />} />
            <Route path="/dashboard/buyer/orders/:id" element={<BuyerOrderDetails />} />
            <Route path="/dashboard/buyer/rate/:orderId" element={<RateFarmerPage />} />
            <Route path="/dashboard/buyer/ratings" element={<Ratings />} />
            <Route path="/dashboard/buyer/recurring-orders" element={<RecurringOrders />} />
            <Route path="/dashboard/buyer/payments" element={<PaymentHistory />} />
            
            {/* Officer Routes */}
            <Route path="/dashboard/officer/farmers" element={<Farmers />} />
            <Route path="/dashboard/officer/reports" element={<Reports />} />
            <Route path="/dashboard/officer/centers" element={<Centers />} />
            <Route path="/dashboard/officer/advisory" element={<Advisory />} />
            
            {/* Staff Routes */}
            <Route path="/dashboard/staff/users" element={<Users />} />
            <Route path="/dashboard/staff/analytics" element={<Analytics />} />
            <Route path="/dashboard/staff/reports" element={<Reports />} />
            <Route path="/dashboard/staff/settings" element={<Settings />} />
            
            {/* Aggregation Manager Routes */}
            <Route path="/dashboard/aggregation/stock-in" element={<StockInForm />} />
            <Route path="/dashboard/aggregation/stock-out" element={<StockOutForm />} />
            <Route path="/dashboard/aggregation/inventory" element={<InventoryManagement />} />
            <Route path="/dashboard/aggregation/storage" element={<StorageManagement />} />
            <Route path="/dashboard/aggregation/capacity" element={<CapacityManagement />} />
            <Route path="/dashboard/aggregation/quality-check" element={<QualityCheck />} />
            <Route path="/dashboard/aggregation/quality-checks" element={<QualityCheck />} />
            <Route path="/dashboard/aggregation/wastage" element={<WastageTracking />} />
            <Route path="/dashboard/aggregation/transaction-history" element={<StockTransactionHistory />} />
            <Route path="/dashboard/aggregation/farmers" element={<Farmers />} />
          </Route>
          
          {/* 404 */}
          <Route path="*" element={<NotFoundPage />} />
        </Routes>
      </BrowserRouter>
    </UserRoleProvider>
  );
}

export default App;
