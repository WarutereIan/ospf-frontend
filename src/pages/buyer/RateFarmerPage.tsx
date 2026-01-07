import { useParams } from "react-router-dom";
import { RateFarmer } from "./RateFarmer";

export function RateFarmerPage() {
  const { orderId } = useParams<{ orderId: string }>();
  
  // TODO: Fetch order details from API
  // For now, using sample data
  return (
    <RateFarmer
      orderId={orderId || "ORD-001"}
      farmerName="James Mutua"
      farmerId="F001"
      variety="Kenya"
      quantity={500}
    />
  );
}

