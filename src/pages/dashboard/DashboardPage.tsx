import { Navigate } from "react-router-dom";
import { useUserRole } from "@/contexts/UserRoleContext";

export function DashboardPage() {
  const { role } = useUserRole();

  // Redirect to role-specific dashboard
  switch (role) {
    case "farmer":
      return <Navigate to="/dashboard/farmer" replace />;
    case "buyer":
      return <Navigate to="/dashboard/buyer" replace />;
    case "officer":
      return <Navigate to="/dashboard/officer" replace />;
    case "staff":
      return <Navigate to="/dashboard/staff" replace />;
    case "aggregation_manager":
      return <Navigate to="/dashboard/aggregation" replace />;
    default:
      // Default to farmer dashboard if role not set
      return <Navigate to="/dashboard/farmer" replace />;
  }
}

