import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import {
  IconStar,
  IconStarFilled,
} from "@tabler/icons-react";
import { StarRating } from "@/components/visualizations";
import { useProfile } from "@/contexts/ProfileContext";
import { useMarketplace } from "@/contexts/MarketplaceContext";
import { useAuth } from "@/contexts/AuthContext";

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

  // Fetch orders that can be rated and existing ratings
  useEffect(() => {
    if (user?.id) {
      fetchOrders({ buyerId: user.id, status: "completed" });
      fetchRatings({ buyerId: user.id });
      fetchRatingSummary(user.id);
    }
  }, [user?.id, fetchOrders, fetchRatings, fetchRatingSummary]);

  // Get pending ratings from orders that can be rated
  const [pendingRatings, setPendingRatings] = useState<PendingRating[]>([]);
  
  useEffect(() => {
    const pending: PendingRating[] = orders
      .filter((order) => order.canRate && order.status === "completed")
      .map((order) => ({
        orderId: order.id,
        farmerId: order.farmerId,
        farmerName: order.farmerName,
        variety: order.variety,
        quantity: order.quantity,
        qualityGrade: order.qualityGrade,
        deliveryDate: order.actualDeliveryDate || order.updatedAt,
      }));
    setPendingRatings(pending);
  }, [orders]);

  // Get supplier ratings from rating summary
  const supplierRatings: SupplierRating[] = (ratingSummary?.topRated || []).map(item => ({
    farmerId: item.farmerId || item.userId || "",
    farmerName: item.farmerName || item.name || "",
    averageRating: item.averageRating || item.rating || 0,
    totalOrders: item.totalOrders || 0,
  }));

  const handleRatingSubmit = async (pending: PendingRating) => {
    // Rating submission is handled by RateFarmer component
    // Refresh data after rating
    if (user?.id) {
      await fetchOrders({ buyerId: user.id });
      await fetchRatings({ buyerId: user.id });
      await fetchRatingSummary(user.id);
    }
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
          <CardDescription>Orders awaiting your rating</CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="space-y-4">
              {[1, 2].map((i) => (
                <div key={i} className="h-40 bg-muted animate-pulse rounded-lg" />
              ))}
            </div>
          ) : pendingRatings.length > 0 ? (
            <div className="space-y-4">
              {pendingRatings.map((pending) => (
                <Card key={pending.orderId} className="border">
                  <CardContent className="p-6">
                    <div className="space-y-4">
                      <div>
                        <p className="font-medium">
                          Order #{pending.orderId} from {pending.farmerName}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          {pending.variety} {pending.quantity}kg Grade {pending.qualityGrade} - Delivered {formatDate(pending.deliveryDate)}
                        </p>
                      </div>

                      <div className="space-y-3">
                        <div className="flex items-center justify-between">
                          <span className="text-sm font-medium">Overall:</span>
                          <StarRating
                            rating={pending.overallRating || 0}
                            maxRating={5}
                            size="md"
                            interactive={true}
                            onRatingChange={(rating) => {
                              setPendingRatings((prev) =>
                                prev.map((p) =>
                                  p.orderId === pending.orderId
                                    ? { ...p, overallRating: rating }
                                    : p
                                )
                              );
                            }}
                          />
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-sm font-medium">Quality:</span>
                          <StarRating
                            rating={pending.qualityRating || 0}
                            maxRating={5}
                            size="md"
                            interactive={true}
                            onRatingChange={(rating) => {
                              setPendingRatings((prev) =>
                                prev.map((p) =>
                                  p.orderId === pending.orderId
                                    ? { ...p, qualityRating: rating }
                                    : p
                                )
                              );
                            }}
                          />
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-sm font-medium">Delivery:</span>
                          <StarRating
                            rating={pending.deliveryRating || 0}
                            maxRating={5}
                            size="md"
                            interactive={true}
                            onRatingChange={(rating) => {
                              setPendingRatings((prev) =>
                                prev.map((p) =>
                                  p.orderId === pending.orderId
                                    ? { ...p, deliveryRating: rating }
                                    : p
                                )
                              );
                            }}
                          />
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-sm font-medium">Communication:</span>
                          <StarRating
                            rating={pending.communicationRating || 0}
                            maxRating={5}
                            size="md"
                            interactive={true}
                            onRatingChange={(rating) => {
                              setPendingRatings((prev) =>
                                prev.map((p) =>
                                  p.orderId === pending.orderId
                                    ? { ...p, communicationRating: rating }
                                    : p
                                )
                              );
                            }}
                          />
                        </div>
                      </div>

                      <div>
                        <label className="text-sm font-medium mb-2 block">Review (Optional)</label>
                        <Textarea
                          placeholder="Share your experience..."
                          value={pending.review || ""}
                          onChange={(e) => {
                            setPendingRatings((prev) =>
                              prev.map((p) =>
                                p.orderId === pending.orderId
                                  ? { ...p, review: e.target.value }
                                  : p
                              )
                            );
                          }}
                          rows={3}
                        />
                      </div>

                      <div className="flex justify-end">
                        <Button
                          onClick={() => handleRatingSubmit(pending)}
                          disabled={
                            !pending.overallRating ||
                            !pending.qualityRating ||
                            !pending.deliveryRating ||
                            !pending.communicationRating
                          }
                        >
                          Submit Rating
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <IconStar className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground">No pending ratings</p>
              <p className="text-sm text-muted-foreground mt-1">
                All orders have been rated
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
              <p className="text-muted-foreground">No supplier ratings yet</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
