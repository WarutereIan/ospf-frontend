import { useState, useEffect, useMemo } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  IconStar,
  IconStarFilled,
} from "@tabler/icons-react";
import { StarRating } from "@/components/visualizations";
import { useProfile } from "@/contexts/ProfileContext";
import { useMarketplace } from "@/contexts/MarketplaceContext";
import { useAuth } from "@/contexts/AuthContext";
import type { Rating } from "@/types/profile";

interface PendingRating {
  orderId: string;
  farmerId: string;
  farmerName: string;
  variety: string;
  quantity: number;
  qualityGrade: string;
  deliveryDate: string;
  overallRating?: number;
  qualityRating?: number;
  deliveryRating?: number;
  communicationRating?: number;
  review?: string;
}

interface SupplierRating {
  farmerId: string;
  farmerName: string;
  averageRating: number;
  totalOrders: number;
}

export function Ratings() {
  const { ratings, ratingSummary, fetchRatings, fetchRatingSummary, isLoading } = useProfile();
  const { orders, fetchOrders } = useMarketplace();
  const { user } = useAuth();
  const [selectedPendingRating, setSelectedPendingRating] = useState<PendingRating | null>(null);
  const [ratingDialogOpen, setRatingDialogOpen] = useState(false);

  // Fetch orders that can be rated and existing ratings
  useEffect(() => {
    if (user?.id) {
      // Fetch all orders (not just completed) to get all farmers worked with
      fetchOrders({ buyerId: user.id });
      fetchRatings({ buyerId: user.id });
      fetchRatingSummary(user.id);
    }
  }, [user?.id, fetchOrders, fetchRatings, fetchRatingSummary]);

  // Get pending ratings from orders that can be rated
  const [pendingRatings, setPendingRatings] = useState<PendingRating[]>([]);
  
  useEffect(() => {
    // Create a set of order IDs that have been rated
    const ratedOrderIds = new Set(ratings.map(r => r.orderId).filter(Boolean));
    
    // Filter orders that are completed/delivered and haven't been rated yet
    const pending: PendingRating[] = orders
      .filter((order) => {
        const isCompleted = order.status === "completed" || order.status === "delivered";
        const notRated = !ratedOrderIds.has(order.id);
        return isCompleted && notRated;
      })
      .map((order) => ({
        orderId: order.id,
        farmerId: order.farmerId,
        farmerName: order.farmerName,
        variety: order.variety,
        quantity: order.totalQuantity || order.quantity || 0,
        qualityGrade: order.qualityGrade,
        deliveryDate: order.actualDeliveryDate || order.deliveryDate || order.updatedAt,
      }));
    setPendingRatings(pending);
  }, [orders, ratings]);

  // Get supplier ratings - combine from ratingSummary and orders
  const supplierRatings: SupplierRating[] = useMemo(() => {
    // Get all unique farmers from completed/delivered orders
    const completedOrders = orders.filter(
      o => o.status === "completed" || o.status === "delivered"
    );
    
    const farmerMap = new Map<string, {
      farmerId: string;
      farmerName: string;
      orderIds: Set<string>;
    }>();
    
    completedOrders.forEach(order => {
      if (!order.farmerId) return;
      
      if (!farmerMap.has(order.farmerId)) {
        farmerMap.set(order.farmerId, {
          farmerId: order.farmerId,
          farmerName: order.farmerName || "Unknown",
          orderIds: new Set(),
        });
      }
      farmerMap.get(order.farmerId)!.orderIds.add(order.id);
    });
    
    // Get ratings for each farmer
    const farmerRatingsMap = new Map<string, {
      totalRatings: number;
      sumRatings: number;
    }>();
    
    ratings.forEach(rating => {
      if (!rating.ratedUserId) return;
      const farmerId = rating.ratedUserId;
      
      if (!farmerRatingsMap.has(farmerId)) {
        farmerRatingsMap.set(farmerId, {
          totalRatings: 0,
          sumRatings: 0,
        });
      }
      const stats = farmerRatingsMap.get(farmerId)!;
      stats.totalRatings++;
      stats.sumRatings += rating.overallRating ?? rating.rating ?? 0;
    });
    
    // Build supplier ratings list
    const suppliers: SupplierRating[] = Array.from(farmerMap.values()).map(farmer => {
      const ratingStats = farmerRatingsMap.get(farmer.farmerId);
      const averageRating = ratingStats && ratingStats.totalRatings > 0
        ? ratingStats.sumRatings / ratingStats.totalRatings
        : 0;
      
      return {
        farmerId: farmer.farmerId,
        farmerName: farmer.farmerName,
        averageRating,
        totalOrders: farmer.orderIds.size,
      };
    });
    
    // Sort by average rating (highest first), then by total orders
    return suppliers.sort((a, b) => {
      if (b.averageRating !== a.averageRating) {
        return b.averageRating - a.averageRating;
      }
      return b.totalOrders - a.totalOrders;
    });
  }, [orders, ratings]);

  const { submitRating } = useProfile();

  const handleRatingSubmit = async (pending: PendingRating) => {
    // Validate that overall rating is provided
    if (!pending.overallRating || pending.overallRating === 0) {
      alert("Please provide an overall rating");
      return;
    }

    try {
      // Backend only accepts a single rating value
      const ratingData: Partial<Rating> & { ratedUserId: string } = {
        ratedUserId: pending.farmerId,
        orderId: pending.orderId,
        overallRating: pending.overallRating,
        review: pending.review || undefined,
      };

      const result = await submitRating(ratingData);
      
      if (result.error) {
        throw new Error(result.error);
      }

      // Refresh data after successful rating submission
      if (user?.id) {
        await fetchOrders({ buyerId: user.id });
        await fetchRatings({ buyerId: user.id });
        await fetchRatingSummary(user.id);
      }

      // Remove from pending list
      setPendingRatings((prev) => prev.filter((p) => p.orderId !== pending.orderId));
      
      // Close dialog
      setRatingDialogOpen(false);
      setSelectedPendingRating(null);
    } catch (error) {
      console.error("Failed to submit rating:", error);
      alert(error instanceof Error ? error.message : "Failed to submit rating. Please try again.");
    }
  };

  const openRatingDialog = (pending: PendingRating) => {
    setSelectedPendingRating(pending);
    setRatingDialogOpen(true);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-KE", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const renderStarDisplay = (rating: number) => {
    return (
      <div className="flex items-center gap-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <span key={star}>
            {star <= Math.round(rating) ? (
              <IconStarFilled className="h-4 w-4 text-yellow-500 fill-yellow-500" />
            ) : (
              <IconStar className="h-4 w-4 text-gray-300" />
            )}
          </span>
        ))}
      </div>
    );
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold">Rate Farmers</h1>
          <p className="text-sm sm:text-base text-muted-foreground mt-1">
            Rate your completed orders and view supplier ratings
          </p>
        </div>
      </div>

      {/* Pending Ratings */}
      <Card>
        <CardHeader>
          <CardTitle>Pending Ratings</CardTitle>
          <CardDescription>
            {pendingRatings.length > 0 
              ? `${pendingRatings.length} order(s) awaiting your rating`
              : "Orders awaiting your rating"}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="space-y-2">
              {[1, 2, 3].map((i) => (
                <div key={i} className="h-12 bg-muted animate-pulse rounded" />
              ))}
            </div>
          ) : pendingRatings.length > 0 ? (
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Order ID</TableHead>
                    <TableHead>Farmer</TableHead>
                    <TableHead>Variety</TableHead>
                    <TableHead>Quantity</TableHead>
                    <TableHead>Grade</TableHead>
                    <TableHead>Delivery Date</TableHead>
                    <TableHead>Rating</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {/* Render all pending ratings - no pagination or limiting */}
                  {pendingRatings.map((pending) => (
                    <TableRow key={pending.orderId}>
                      <TableCell className="font-medium">
                        {pending.orderId}
                      </TableCell>
                      <TableCell>
                        {pending.farmerName}
                      </TableCell>
                      <TableCell>
                        {pending.variety}
                      </TableCell>
                      <TableCell>
                        {pending.quantity.toLocaleString()} kg
                      </TableCell>
                      <TableCell>
                        {pending.qualityGrade || "N/A"}
                      </TableCell>
                      <TableCell>
                        {pending.deliveryDate ? formatDate(pending.deliveryDate) : "N/A"}
                      </TableCell>
                      <TableCell>
                        {pending.overallRating && pending.overallRating > 0 ? (
                          <div className="flex items-center gap-1">
                            {[1, 2, 3, 4, 5].map((star) => (
                              <span key={star}>
                                {star <= Math.round(pending.overallRating!) ? (
                                  <IconStarFilled className="h-4 w-4 text-yellow-500 fill-yellow-500" />
                                ) : (
                                  <IconStar className="h-4 w-4 text-gray-300" />
                                )}
                              </span>
                            ))}
                            <span className="text-sm text-muted-foreground ml-1">
                              ({pending.overallRating})
                            </span>
                          </div>
                        ) : (
                          <span className="text-sm text-muted-foreground">Not rated</span>
                        )}
                      </TableCell>
                      <TableCell className="text-right">
                        <Button
                          size="sm"
                          onClick={() => openRatingDialog(pending)}
                        >
                          {pending.overallRating && pending.overallRating > 0 ? "Update Rating" : "Rate"}
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          ) : (
            <div className="text-center py-8">
              <IconStar className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground">
                {orders.filter(o => o.status === "completed" || o.status === "delivered").length === 0
                  ? "No completed orders yet"
                  : "No pending ratings"}
              </p>
              <p className="text-sm text-muted-foreground mt-1">
                {orders.filter(o => o.status === "completed" || o.status === "delivered").length === 0
                  ? "Complete an order to rate the farmer"
                  : "All completed orders have been rated"}
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* My Supplier Ratings */}
      <Card>
        <CardHeader>
          <CardTitle>My Supplier Ratings</CardTitle>
          <CardDescription>Farmers you've worked with</CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="space-y-4">
              {[1, 2, 3].map((i) => (
                <div key={i} className="h-16 bg-muted animate-pulse rounded-lg" />
              ))}
            </div>
          ) : supplierRatings.length > 0 ? (
            <div className="space-y-3">
              {supplierRatings.map((supplier) => (
                <div
                  key={supplier.farmerId}
                  className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50 transition-colors"
                >
                  <div className="flex items-center gap-4">
                    <div className="flex items-center gap-2">
                      {renderStarDisplay(supplier.averageRating)}
                      <span className="text-sm font-medium">
                        ({supplier.averageRating.toFixed(1)})
                      </span>
                    </div>
                    <span className="font-medium">{supplier.farmerName}</span>
                  </div>
                  <span className="text-sm text-muted-foreground">
                    {supplier.totalOrders} orders
                  </span>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <IconStar className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground">
                {orders.filter(o => o.status === "completed" || o.status === "delivered").length === 0
                  ? "No completed orders yet"
                  : "No supplier ratings yet"}
              </p>
              <p className="text-sm text-muted-foreground mt-1">
                {orders.filter(o => o.status === "completed" || o.status === "delivered").length === 0
                  ? "Complete an order to see farmers you've worked with"
                  : "Rate your completed orders to see supplier ratings here"}
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Rating Dialog */}
      <Dialog open={ratingDialogOpen} onOpenChange={setRatingDialogOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Rate Farmer</DialogTitle>
            <DialogDescription>
              Rate your experience with {selectedPendingRating?.farmerName} for Order #{selectedPendingRating?.orderId}
            </DialogDescription>
          </DialogHeader>
          {selectedPendingRating && (
            <div className="space-y-6 py-4">
              <div className="space-y-2">
                <p className="text-sm font-medium">Order Details</p>
                <p className="text-sm text-muted-foreground">
                  {selectedPendingRating.variety} • {selectedPendingRating.quantity.toLocaleString()} kg • Grade {selectedPendingRating.qualityGrade || "N/A"}
                </p>
                {selectedPendingRating.deliveryDate && (
                  <p className="text-sm text-muted-foreground">
                    Delivered: {formatDate(selectedPendingRating.deliveryDate)}
                  </p>
                )}
              </div>

              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Overall Rating:</span>
                  <StarRating
                    rating={selectedPendingRating.overallRating || 0}
                    maxRating={5}
                    size="md"
                    interactive={true}
                    onRatingChange={(rating) => {
                      setPendingRatings((prev) =>
                        prev.map((p) =>
                          p.orderId === selectedPendingRating.orderId
                            ? { ...p, overallRating: rating }
                            : p
                        )
                      );
                      setSelectedPendingRating({
                        ...selectedPendingRating,
                        overallRating: rating,
                      });
                    }}
                  />
                </div>
              </div>

              <div>
                <label className="text-sm font-medium mb-2 block">Review (Optional)</label>
                <Textarea
                  placeholder="Share your experience..."
                  value={selectedPendingRating.review || ""}
                  onChange={(e) => {
                    setPendingRatings((prev) =>
                      prev.map((p) =>
                        p.orderId === selectedPendingRating.orderId
                          ? { ...p, review: e.target.value }
                          : p
                      )
                    );
                    setSelectedPendingRating({
                      ...selectedPendingRating,
                      review: e.target.value,
                    });
                  }}
                  rows={4}
                />
              </div>

              <div className="flex justify-end gap-2">
                <Button
                  variant="outline"
                  onClick={() => {
                    setRatingDialogOpen(false);
                    setSelectedPendingRating(null);
                  }}
                >
                  Cancel
                </Button>
                <Button
                  onClick={() => handleRatingSubmit(selectedPendingRating)}
                  disabled={!selectedPendingRating.overallRating || selectedPendingRating.overallRating === 0}
                >
                  Submit Rating
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
