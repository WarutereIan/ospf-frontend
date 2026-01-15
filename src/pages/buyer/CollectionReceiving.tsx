import { CollectionReceiving as CollectionReceivingComponent } from "@/components/buyer/CollectionReceiving";

interface CollectionOrder {
  id: string;
  orderId: string;
  variety: string;
  quantity: number;
  qualityGrade: string;
  aggregationCenter: string;
  status: "ready_for_collection" | "collected" | "pending";
  readyDate: string;
  collectionDate?: string;
  batchId: string;
}

export function CollectionReceiving() {
  // Sample data - will be replaced with API calls
  const sampleOrders: CollectionOrder[] = [
    {
      id: "COL-001",
      orderId: "ORD-045",
      variety: "Kenya",
      quantity: 500,
      qualityGrade: "A",
      aggregationCenter: "Kangundo Main Aggregation Center",
      status: "ready_for_collection",
      readyDate: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
      batchId: "BATCH-ORD-045",
    },
    {
      id: "COL-002",
      orderId: "ORD-044",
      variety: "SPK004",
      quantity: 300,
      qualityGrade: "A",
      aggregationCenter: "Kathiani Main Aggregation Center",
      status: "ready_for_collection",
      readyDate: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
      batchId: "BATCH-ORD-044",
    },
    {
      id: "COL-003",
      orderId: "ORD-043",
      variety: "Kabode",
      quantity: 200,
      qualityGrade: "B",
      aggregationCenter: "Masinga Main Aggregation Center",
      status: "collected",
      readyDate: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
      collectionDate: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
      batchId: "BATCH-ORD-043",
    },
  ];

  const handleCollect = (orderId: string, collectionDetails: any) => {
    // TODO: Replace with actual API call
    console.log("Marking order as collected:", { orderId, collectionDetails });
    alert(`Order ${orderId} marked as collected successfully!`);
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold">Collection & Receiving</h1>
        <p className="text-sm sm:text-base text-muted-foreground mt-1">
          Collect or receive produce from sub-county aggregation centres
        </p>
      </div>
      <CollectionReceivingComponent orders={sampleOrders} onCollect={handleCollect} />
    </div>
  );
}

