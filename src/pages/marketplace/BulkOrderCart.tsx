import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  IconShoppingCart,
  IconTrash,
  IconX,
  IconCheck,
  IconLoader2,
  IconPlus,
  IconBuilding,
  IconBuildingCommunity,
} from "@tabler/icons-react";
import { cn } from "@/lib/utils";
import { allAggregationCenters, formatCenterLabel } from "@/data/aggregationCenters";

interface CartItem {
  listingId: string;
  farmerName: string;
  variety: string;
  qualityGrade: string;
  pricePerKg: number;
  quantity: number;
  availableQuantity: number;
  location: string;
}

interface BulkOrderCartProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  cartItems: CartItem[];
  onRemoveItem: (listingId: string) => void;
  onUpdateQuantity: (listingId: string, quantity: number) => void;
  onCheckout: (items: CartItem[], deliveryLocation: string) => void;
}

export function BulkOrderCart({
  open,
  onOpenChange,
  cartItems,
  onRemoveItem,
  onUpdateQuantity,
  onCheckout,
}: BulkOrderCartProps) {
  const [deliveryLocation, setDeliveryLocation] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);

  const totalAmount = cartItems.reduce(
    (sum, item) => sum + item.pricePerKg * item.quantity,
    0
  );

  const totalQuantity = cartItems.reduce((sum, item) => sum + item.quantity, 0);

  const handleCheckout = async () => {
    if (!deliveryLocation) {
      alert("Please select a delivery location");
      return;
    }

    setIsProcessing(true);
    // TODO: Replace with actual API call
    setTimeout(() => {
      onCheckout(cartItems, deliveryLocation);
      setIsProcessing(false);
      onOpenChange(false);
    }, 2000);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <IconShoppingCart className="h-5 w-5" />
            Bulk Order Cart
          </DialogTitle>
          <DialogDescription>
            Review and checkout items from multiple farmers
          </DialogDescription>
        </DialogHeader>

        {cartItems.length === 0 ? (
          <div className="py-12 text-center">
            <IconShoppingCart className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <p className="text-lg font-medium text-muted-foreground">Your cart is empty</p>
            <p className="text-sm text-muted-foreground mt-1">
              Add items from the marketplace to create a bulk order
            </p>
          </div>
        ) : (
          <div className="space-y-6">
            {/* Cart Items */}
            <div className="space-y-4">
              {cartItems.map((item) => (
                <Card key={item.listingId}>
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1 space-y-2">
                        <div className="flex items-center gap-2">
                          <h4 className="font-semibold">{item.variety}</h4>
                          <Badge variant="outline">Grade {item.qualityGrade}</Badge>
                        </div>
                        <p className="text-sm text-muted-foreground">
                          {item.farmerName} • {item.location}
                        </p>
                        <div className="flex items-center gap-4 text-sm">
                          <div>
                            <span className="text-muted-foreground">Price: </span>
                            <span className="font-semibold">KES {item.pricePerKg}/kg</span>
                          </div>
                          <div>
                            <span className="text-muted-foreground">Subtotal: </span>
                            <span className="font-semibold">
                              KES {(item.pricePerKg * item.quantity).toLocaleString()}
                            </span>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <label className="text-xs text-muted-foreground">Quantity:</label>
                          <Input
                            type="number"
                            value={item.quantity}
                            onChange={(e) => {
                              const qty = parseFloat(e.target.value);
                              if (qty >= 0 && qty <= item.availableQuantity) {
                                onUpdateQuantity(item.listingId, qty);
                              }
                            }}
                            min={0}
                            max={item.availableQuantity}
                            step={0.1}
                            className="w-24 h-8"
                          />
                          <span className="text-xs text-muted-foreground">
                            / {item.availableQuantity} kg available
                          </span>
                        </div>
                      </div>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => onRemoveItem(item.listingId)}
                        className="text-destructive hover:text-destructive"
                      >
                        <IconTrash className="h-4 w-4" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            {/* Summary */}
            <Card className="border-primary">
              <CardHeader>
                <CardTitle className="text-sm">Order Summary</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Total Items:</span>
                    <span className="font-medium">{cartItems.length}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Total Quantity:</span>
                    <span className="font-medium">{totalQuantity} kg</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Total Amount:</span>
                    <span className="font-bold text-lg">KES {totalAmount.toLocaleString()}</span>
                  </div>
                </div>

                <div className="space-y-2 pt-4 border-t">
                  <label className="text-sm font-medium">Delivery Location</label>
                  <Select
                    value={deliveryLocation}
                    onValueChange={(value) => setDeliveryLocation(value || "")}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {allAggregationCenters.map((center) => (
                        <SelectItem key={center.value} value={center.value}>
                          <div className="flex items-center gap-2">
                            {center.type === "main" ? (
                              <IconBuilding className="h-4 w-4 text-blue-600 inline" />
                            ) : (
                              <IconBuildingCommunity className="h-4 w-4 text-purple-600 inline" />
                            )}
                            <span>{formatCenterLabel(center)}</span>
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </CardContent>
            </Card>

            {/* Checkout Button */}
            <DialogFooter>
              <Button variant="outline" onClick={() => onOpenChange(false)}>
                Continue Shopping
              </Button>
              <Button
                onClick={handleCheckout}
                disabled={!deliveryLocation || isProcessing}
                className="min-w-[150px]"
              >
                {isProcessing ? (
                  <>
                    <IconLoader2 className="mr-2 h-4 w-4 animate-spin" />
                    Processing...
                  </>
                ) : (
                  <>
                    <IconCheck className="mr-2 h-4 w-4" />
                    Checkout (KES {totalAmount.toLocaleString()})
                  </>
                )}
              </Button>
            </DialogFooter>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}

