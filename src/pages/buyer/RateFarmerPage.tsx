import { useParams } from "react-router-dom";
import { RateFarmer } from "./RateFarmer";
import { useMarketplace } from "@/contexts/MarketplaceContext";
import { useEffect } from "react";

export function RateFarmerPage() {
  const { orderId } = useParams<{ orderId: string }>();
  const { selectedOrder, fetchOrderById, isLoading } = useMarketplace();

  useEffect(() => {
    if (orderId) {
      fetchOrderById(orderId);
    }
  }, [orderId, fetchOrderById]);

  if (isLoading || !selectedOrder) {
    return (
      <div className="space-y-6">
        <div className="h-8 bg-muted animate-pulse rounded w-48" />
        <div className="h-64 bg-muted animate-pulse rounded-lg" />
      </div>
    );
  }

  return (
    <RateFarmer
      orderId={selectedOrder.id}
      farmerName={selectedOrder.farmerName}
      farmerId={selectedOrder.farmerId}
      variety={selectedOrder.variety}
      quantity={selectedOrder.totalQuantity || selectedOrder.quantity || 0}
    />
  );
}

