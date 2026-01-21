import { Navigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";

export function DashboardPage() {
  const { role } = useAuth();

  // Redirect to role-specific dashboard
  switch (role) {
    case "farmer":
      return <Navigate to="/farmer/marketplace" replace />;
    case "buyer":
      return <Navigate to="/dashboard/buyer" replace />;
    case "officer":
      return <Navigate to="/dashboard/county-officer" replace />;
    case "staff":
      return <Navigate to="/dashboard/staff" replace />;
    case "aggregation_manager":
      return <Navigate to="/dashboard/aggregation" replace />;
    case "input_provider":
      return <Navigate to="/dashboard/input-provider" replace />;
    case "transport_provider":
      return <Navigate to="/dashboard/transport-provider" replace />;
    default:
      // Default to farmer dashboard if role not set
      return <Navigate to="/dashboard/farmer" replace />;
  }
}

