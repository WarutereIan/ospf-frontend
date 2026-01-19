import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
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
import InputProviderDashboard from "@/pages/dashboard/InputProviderDashboard";
import TransportProviderDashboard from "@/pages/dashboard/TransportProviderDashboard";
import { ProduceManagement } from "@/pages/farmer/ProduceManagement";
import { FarmerOrders } from "@/pages/farmer/FarmerOrders";
import { PeerLeaderboard } from "@/pages/farmer/PeerLeaderboard";
import { MarketInfo } from "@/pages/farmer/MarketInfo";
import { Farmers } from "@/pages/officer/Farmers";
import { Reports } from "@/pages/officer/Reports";
import { Centers } from "@/pages/officer/Centers";
import { Advisory } from "@/pages/officer/Advisory";
import { QualityStandards } from "@/pages/officer/QualityStandards";
import { LocationSalesSummary } from "@/pages/officer/LocationSalesSummary";
import { StockInForm } from "@/pages/aggregation/StockInForm";
import { StockOutForm } from "@/pages/aggregation/StockOutForm";
import { InventoryManagement } from "@/pages/aggregation/InventoryManagement";
import { StorageManagement } from "@/pages/aggregation/StorageManagement";
import { CapacityManagement } from "@/pages/aggregation/CapacityManagement";
import { QualityCheck } from "@/pages/aggregation/QualityCheck";
import { QualityChecksList } from "@/pages/aggregation/QualityChecksList";
import { ReceiveFromWard } from "@/pages/aggregation/ReceiveFromWard";
import { AggregationReports } from "@/pages/aggregation/Reports";
import { BuyerDemandMatching } from "@/pages/aggregation/BuyerDemandMatching";
import { PaymentHistory } from "@/pages/payments/PaymentHistory";
import { BuyerOrders } from "@/pages/buyer/BuyerOrders";
import { BuyerOrderDetails } from "@/pages/buyer/BuyerOrderDetails";
import { RateFarmerPage } from "@/pages/buyer/RateFarmerPage";
import { Ratings } from "@/pages/buyer/Ratings";
import { CollectionReceiving } from "@/pages/buyer/CollectionReceiving";
import { LogisticsDeliveries } from "@/pages/buyer/LogisticsDeliveries";
import { SourcingRequests } from "@/pages/buyer/SourcingRequests";
import InputManagement from "@/pages/inputs/InputManagement";
import InputMarketplace from "@/pages/marketplace/InputMarketplace";
import TransportRequests from "@/pages/transport/TransportRequests";
import Collection from "@/pages/transport/Collection";
import ActiveDeliveries from "@/pages/transport/ActiveDeliveries";
import CompletedDeliveries from "@/pages/transport/CompletedDeliveries";
import { NotFoundPage } from "@/pages/NotFoundPage";

export function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          {/* Public Routes */}
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          
          {/* Protected Routes with Layout */}
          <Route element={<Layout />}>
            <Route path="/" element={<HomePage />} />
            <Route path="/marketplace" element={<MarketplacePage />} />
            <Route path="/dashboard/buyer/marketplace" element={<MarketplacePage />} />
            
            {/* General Dashboard - redirects based on role */}
            <Route path="/dashboard" element={<DashboardPage />} />
            
            {/* Role-based Dashboards */}
            <Route path="/dashboard/farmer" element={<FarmerDashboard />} />
            <Route path="/dashboard/buyer" element={<BuyerDashboard />} />
            <Route path="/dashboard/county-officer" element={<OfficerDashboard />} />
            <Route path="/dashboard/staff" element={<StaffDashboard />} />
            <Route path="/dashboard/aggregation" element={<AggregationManagerDashboard />} />
            <Route path="/dashboard/input-provider" element={<InputProviderDashboard />} />
            <Route path="/dashboard/transport-provider" element={<TransportProviderDashboard />} />
            
            {/* Farmer Routes */}
            <Route path="/dashboard/produce" element={<ProduceManagement />} />
            <Route path="/dashboard/produce/new" element={<ProduceManagement />} />
            <Route path="/dashboard/orders" element={<FarmerOrders />} />
            <Route path="/dashboard/orders/:id" element={<FarmerOrders />} />
            <Route path="/dashboard/leaderboard" element={<PeerLeaderboard />} />
            <Route path="/dashboard/market-info" element={<MarketInfo />} />
            
            {/* Buyer Routes */}
            <Route path="/dashboard/buyer/orders" element={<BuyerOrders />} />
            <Route path="/dashboard/buyer/orders/:id" element={<BuyerOrderDetails />} />
            <Route path="/dashboard/buyer/ratings" element={<Ratings />} />
            <Route path="/dashboard/buyer/rate/:orderId" element={<RateFarmerPage />} />
            <Route path="/dashboard/buyer/collection" element={<CollectionReceiving />} />
            <Route path="/dashboard/buyer/deliveries" element={<LogisticsDeliveries />} />
            
            {/* Aggregation Manager Routes */}
            <Route path="/dashboard/aggregation/stock-in" element={<StockInForm />} />
            <Route path="/dashboard/aggregation/receive-ward" element={<ReceiveFromWard />} />
            <Route path="/dashboard/aggregation/stock-out" element={<StockOutForm />} />
            <Route path="/dashboard/aggregation/inventory" element={<InventoryManagement />} />
            <Route path="/dashboard/aggregation/storage" element={<StorageManagement />} />
            <Route path="/dashboard/aggregation/capacity" element={<CapacityManagement />} />
            <Route path="/dashboard/aggregation/quality-checks" element={<QualityChecksList />} />
            <Route path="/dashboard/aggregation/quality-checks/new" element={<QualityCheck />} />
            <Route path="/dashboard/aggregation/quality-checks/:id" element={<QualityCheck />} />
            <Route path="/dashboard/aggregation/buyer-matching" element={<BuyerDemandMatching />} />
            <Route path="/dashboard/aggregation/reports" element={<AggregationReports />} />
            <Route path="/dashboard/aggregation/farmers" element={<PeerLeaderboard />} />
            
            {/* County Officer Routes */}
            <Route path="/dashboard/county-officer/farmers" element={<Farmers />} />
            <Route path="/dashboard/county-officer/farmers/:id" element={<Farmers />} />
            <Route path="/dashboard/county-officer/quality-standards" element={<QualityStandards />} />
            <Route path="/dashboard/county-officer/location-summary" element={<LocationSalesSummary />} />
            <Route path="/dashboard/county-officer/reports" element={<Reports />} />
            <Route path="/dashboard/county-officer/centers" element={<Centers />} />
            <Route path="/dashboard/county-officer/advisory" element={<Advisory />} />
            
            {/* Buyer Additional Routes */}
            <Route path="/dashboard/buyer/recurring-orders" element={<SourcingRequests />} />
            <Route path="/dashboard/buyer/sourcing-requests" element={<SourcingRequests />} />
            
            {/* Payment Routes */}
            <Route path="/dashboard/payments" element={<PaymentHistory />} />
            
            {/* Input Provider Routes */}
            <Route path="/dashboard/inputs" element={<InputManagement />} />
            <Route path="/dashboard/input-inventory" element={<InputManagement />} />
            <Route path="/dashboard/input-orders" element={<FarmerOrders />} /> {/* Reusing FarmerOrders for now */}
            <Route path="/dashboard/customers" element={<PeerLeaderboard />} /> {/* Placeholder */}
            
            {/* Input Marketplace for Farmers */}
            <Route path="/marketplace/inputs" element={<InputMarketplace />} />
            
            {/* Transport Provider Routes */}
            <Route path="/dashboard/transport-requests" element={<TransportRequests />} />
            <Route path="/dashboard/collection" element={<Collection />} />
            <Route path="/dashboard/deliveries" element={<ActiveDeliveries />} />
            <Route path="/dashboard/completed-deliveries" element={<CompletedDeliveries />} />
            <Route path="/dashboard/earnings" element={<PaymentHistory />} /> {/* Reusing PaymentHistory for now */}
          </Route>
          
          {/* 404 */}
          <Route path="*" element={<NotFoundPage />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;
