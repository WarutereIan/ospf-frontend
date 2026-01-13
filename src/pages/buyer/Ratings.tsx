import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import {
  IconStar,
  IconStarFilled,
} from "@tabler/icons-react";
import { StarRating } from "@/components/visualizations";

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
  const [pendingRatings, setPendingRatings] = useState<PendingRating[]>([]);
  const [supplierRatings, setSupplierRatings] = useState<SupplierRating[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // TODO: Replace with actual API calls
    setTimeout(() => {
      setPendingRatings([
        {
          orderId: "ORD-045",
          farmerId: "F001",
          farmerName: "James Mutua",
          variety: "Kenya",
          quantity: 500,
          qualityGrade: "A",
          deliveryDate: "2024-01-10",
        },
      ]);
      setSupplierRatings([
        {
          farmerId: "F001",
          farmerName: "James Mutua",
          averageRating: 4.9,
          totalOrders: 12,
        },
        {
          farmerId: "F002",
          farmerName: "Mary Wanjiku",
          averageRating: 4.5,
          totalOrders: 8,
        },
        {
          farmerId: "F003",
          farmerName: "Peter Kamau",
          averageRating: 4.2,
          totalOrders: 5,
        },
      ]);
      setIsLoading(false);
    }, 1000);
  }, []);

  const handleRatingSubmit = (pending: PendingRating) => {
    // TODO: Submit rating to API
    console.log("Submitting rating:", pending);
    setPendingRatings((prev) => prev.filter((p) => p.orderId !== pending.orderId));
    // Update supplier rating
    setSupplierRatings((prev) => {
      const existing = prev.find((s) => s.farmerId === pending.farmerId);
      if (existing) {
        return prev.map((s) =>
          s.farmerId === pending.farmerId
            ? {
                ...s,
                averageRating: (s.averageRating + (pending.overallRating || 0)) / 2,
                totalOrders: s.totalOrders + 1,
              }
            : s
        );
      } else {
        return [
          ...prev,
          {
            farmerId: pending.farmerId,
            farmerName: pending.farmerName,
            averageRating: pending.overallRating || 0,
            totalOrders: 1,
          },
        ];
      }
    });
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
