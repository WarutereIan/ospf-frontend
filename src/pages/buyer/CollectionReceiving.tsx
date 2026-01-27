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

  const { markOrderAsCollected } = useMarketplace();

  // Fetch buyer's orders that are ready for collection
  useEffect(() => {
    if (user?.id) {
      fetchOrders({ 
        buyerId: user.id
      });
      fetchCenters();
    }
  }, [user?.id, fetchOrders, fetchCenters]);

  // Convert MarketplaceOrder to CollectionOrder format
  // Filter orders that are ready for collection: 
  // - Status is READY_FOR_COLLECTION (when aggregation officer marks as processed), OR
  // - stockOutRecorded=true AND collected=false (legacy flow)
  const collectionOrders = orders
    .filter((order) => 
      (order.status === 'ready_for_collection' && order.collected === false) ||
      (order.stockOutRecorded === true && order.collected === false)
    )
    .map((order) => {
      // Determine aggregation center display: prefer center name, fallback to location, then "N/A"
      let aggregationCenterDisplay = "N/A";
      if (order.aggregationCenter) {
        aggregationCenterDisplay = order.aggregationCenter;
        // If we have both name and location, combine them for better context
        if (order.centerLocation) {
          aggregationCenterDisplay = `${order.aggregationCenter} - ${order.centerLocation}`;
        }
      } else if (order.centerLocation) {
        aggregationCenterDisplay = order.centerLocation;
      }
      
      return {
        id: order.id,
        orderId: order.orderNumber || order.id,
        variety: order.variety,
        quantity: order.quantity,
        qualityGrade: order.qualityGrade,
        aggregationCenter: aggregationCenterDisplay,
        status: order.collected ? "collected" : "ready_for_collection" as "ready_for_collection" | "collected" | "pending",
        readyDate: order.updatedAt || order.createdAt,
        collectionDate: order.actualDeliveryDate,
        batchId: order.batchId,
      };
    });

  const handleCollect = async (orderId: string, collectionDetails: any) => {
    try {
      // Find the order by orderNumber or id
      const order = orders.find(o => o.orderNumber === orderId || o.id === orderId);
      if (!order) {
        console.error("Order not found:", orderId);
        return;
      }
      
      // Mark order as collected
      await markOrderAsCollected(order.id);
      
      // Refresh orders after collection
      if (user?.id) {
        await fetchOrders({ buyerId: user.id });
      }
    } catch (error) {
      console.error("Failed to mark order as collected:", error);
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

