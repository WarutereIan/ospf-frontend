import { useEffect } from "react";
import { CollectionReceiving as CollectionReceivingComponent } from "@/components/buyer/CollectionReceiving";
import { useMarketplace } from "@/contexts/MarketplaceContext";
import { useAggregation } from "@/contexts/AggregationContext";
import { useAuth } from "@/contexts/AuthContext";
import type { MarketplaceOrder } from "@/types/marketplace";

export function CollectionReceiving() {
  const { orders, fetchOrders } = useMarketplace();
  const { centers, fetchCenters } = useAggregation();
  const { user } = useAuth();

  // Fetch buyer's orders that are ready for collection
  useEffect(() => {
    if (user?.id) {
      fetchOrders({ 
        buyerId: user.id,
        status: "quality_approved" // Orders ready for collection
      });
      fetchCenters();
    }
  }, [user?.id, fetchOrders, fetchCenters]);

  // Convert MarketplaceOrder to CollectionOrder format
  const collectionOrders = orders
    .filter((order) => 
      order.status === "quality_approved" || 
      order.status === "out_for_delivery" ||
      order.status === "delivered"
    )
    .map((order) => ({
      id: order.id,
      orderId: order.orderNumber || order.id,
      variety: order.variety,
      quantity: order.quantity,
      qualityGrade: order.qualityGrade,
      aggregationCenter: order.aggregationCenter || "N/A",
      status: order.status === "delivered" ? "collected" : 
              order.status === "quality_approved" ? "ready_for_collection" : 
              "pending" as "ready_for_collection" | "collected" | "pending",
      readyDate: order.updatedAt || order.createdAt,
      collectionDate: order.actualDeliveryDate,
      batchId: order.batchId,
    }));

  const handleCollect = async (orderId: string, collectionDetails: any) => {
    // TODO: Replace with actual API call to mark order as collected
    console.log("Marking order as collected:", { orderId, collectionDetails });
    // Refresh orders after collection
    if (user?.id) {
      await fetchOrders({ buyerId: user.id });
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold">Collection & Receiving</h1>
        <p className="text-sm sm:text-base text-muted-foreground mt-1">
          Collect or receive produce from sub-county aggregation centres
        </p>
      </div>
      <CollectionReceivingComponent orders={collectionOrders} onCollect={handleCollect} />
    </div>
  );
}

