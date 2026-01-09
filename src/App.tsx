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
import { PeerLeaderboard } from "@/pages/farmer/PeerLeaderboard";
import { MarketInfo } from "@/pages/farmer/MarketInfo";
import { StockInForm } from "@/pages/aggregation/StockInForm";
import { StockOutForm } from "@/pages/aggregation/StockOutForm";
import { InventoryManagement } from "@/pages/aggregation/InventoryManagement";
import { StorageManagement } from "@/pages/aggregation/StorageManagement";
import { CapacityManagement } from "@/pages/aggregation/CapacityManagement";
import { QualityCheck } from "@/pages/aggregation/QualityCheck";
import { PaymentHistory } from "@/pages/payments/PaymentHistory";
import { BuyerOrders } from "@/pages/buyer/BuyerOrders";
import { RateFarmerPage } from "@/pages/buyer/RateFarmerPage";
import { RecurringOrders } from "@/pages/marketplace/RecurringOrders";
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
            <Route path="/dashboard/produce" element={<ProduceManagement />} />
            <Route path="/dashboard/produce/new" element={<ProduceManagement />} />
            <Route path="/dashboard/orders" element={<FarmerOrders />} />
            <Route path="/dashboard/orders/:id" element={<FarmerOrders />} />
            <Route path="/dashboard/leaderboard" element={<PeerLeaderboard />} />
            <Route path="/dashboard/market-info" element={<MarketInfo />} />
            
            {/* Buyer Routes */}
            <Route path="/dashboard/buyer/orders" element={<BuyerOrders />} />
            <Route path="/dashboard/buyer/rate/:orderId" element={<RateFarmerPage />} />
            
            {/* Aggregation Manager Routes */}
            <Route path="/dashboard/stock-in" element={<StockInForm />} />
            <Route path="/dashboard/stock-out" element={<StockOutForm />} />
            <Route path="/dashboard/inventory" element={<InventoryManagement />} />
            <Route path="/dashboard/storage" element={<StorageManagement />} />
            <Route path="/dashboard/capacity" element={<CapacityManagement />} />
            <Route path="/dashboard/quality-check" element={<QualityCheck />} />
            
            {/* Buyer Additional Routes */}
            <Route path="/dashboard/recurring-orders" element={<RecurringOrders />} />
            
            {/* Payment Routes */}
            <Route path="/dashboard/payments" element={<PaymentHistory />} />
          </Route>
          
          {/* 404 */}
          <Route path="*" element={<NotFoundPage />} />
        </Routes>
      </BrowserRouter>
    </UserRoleProvider>
  );
}

export default App;
