import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { IconCheck, IconX, IconLoader2, IconCurrency } from "@tabler/icons-react";

interface CounterOfferDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  originalOffer: {
    pricePerKg: number;
    quantity: number;
    totalAmount: number;
  };
  currentPrice: number;
  availableQuantity: number;
  onCounterOffer: (offer: { pricePerKg: number; quantity: number }) => void;
}

export function CounterOfferDialog({
  open,
  onOpenChange,
  originalOffer,
  currentPrice,
  availableQuantity,
  onCounterOffer,
}: CounterOfferDialogProps) {
  const [counterPrice, setCounterPrice] = useState(currentPrice.toString());
  const [counterQuantity, setCounterQuantity] = useState(originalOffer.quantity.toString());
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async () => {
    const price = parseFloat(counterPrice);
    const quantity = parseFloat(counterQuantity);

    if (!price || !quantity || price <= 0 || quantity <= 0 || quantity > availableQuantity) {
      return;
    }

    setIsSubmitting(true);
    // TODO: Replace with actual API call
    setTimeout(() => {
      onCounterOffer({ pricePerKg: price, quantity });
      setIsSubmitting(false);
      onOpenChange(false);
    }, 1000);
  };

  const counterTotal = counterPrice && counterQuantity
    ? parseFloat(counterPrice) * parseFloat(counterQuantity)
    : 0;

  const priceDifference = counterPrice
    ? parseFloat(counterPrice) - originalOffer.pricePerKg
    : 0;
  const quantityDifference = counterQuantity
    ? parseFloat(counterQuantity) - originalOffer.quantity
    : 0;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Make Counter Offer</DialogTitle>
          <DialogDescription>
            Respond to the buyer's offer with your preferred price and quantity
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Original Offer */}
          <Card>
            <CardHeader>
              <CardTitle className="text-sm">Original Offer</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Price per kg:</span>
                <span className="font-semibold">KES {originalOffer.pricePerKg}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Quantity:</span>
                <span className="font-semibold">{originalOffer.quantity} kg</span>
              </div>
              <div className="flex justify-between text-sm border-t pt-2">
                <span className="font-medium">Total Amount:</span>
                <span className="font-bold">KES {originalOffer.totalAmount.toLocaleString()}</span>
              </div>
            </CardContent>
          </Card>

          {/* Counter Offer Form */}
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="counter-price">Your Price per kg (KES)</Label>
                <Input
                  id="counter-price"
                  type="number"
                  value={counterPrice}
                  onChange={(e) => setCounterPrice(e.target.value)}
                  placeholder={currentPrice.toString()}
                  min={0}
                  step={0.1}
                />
                <p className="text-xs text-muted-foreground">
                  Current listing price: KES {currentPrice}
                </p>
                {priceDifference !== 0 && (
                  <p className={cn(
                    "text-xs",
                    priceDifference > 0 ? "text-green-600" : "text-red-600"
                  )}>
                    {priceDifference > 0 ? "+" : ""}KES {priceDifference.toFixed(2)} from original offer
                  </p>
                )}
              </div>
              <div className="space-y-2">
                <Label htmlFor="counter-quantity">Quantity (kg)</Label>
                <Input
                  id="counter-quantity"
                  type="number"
                  value={counterQuantity}
                  onChange={(e) => setCounterQuantity(e.target.value)}
                  placeholder={originalOffer.quantity.toString()}
                  min={0}
                  max={availableQuantity}
                  step={0.1}
                />
                <p className="text-xs text-muted-foreground">
                  Available: {availableQuantity} kg
                </p>
                {quantityDifference !== 0 && (
                  <p className={cn(
                    "text-xs",
                    quantityDifference > 0 ? "text-green-600" : "text-red-600"
                  )}>
                    {quantityDifference > 0 ? "+" : ""}{quantityDifference} kg from original offer
                  </p>
                )}
              </div>
            </div>

            {/* Counter Offer Summary */}
            {counterPrice && counterQuantity && (
              <Card className="border-primary bg-primary/5">
                <CardContent className="p-4 space-y-2">
                  <div className="flex items-center gap-2 mb-2">
                    <IconCurrency className="h-4 w-4 text-primary" />
                    <span className="font-semibold">Your Counter Offer</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Price per kg:</span>
                    <span className="font-semibold">KES {parseFloat(counterPrice).toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Quantity:</span>
                    <span className="font-semibold">{parseFloat(counterQuantity)} kg</span>
                  </div>
                  <div className="flex justify-between text-sm border-t pt-2 mt-2">
                    <span className="font-semibold">Total Amount:</span>
                    <span className="text-lg font-bold text-primary">
                      KES {counterTotal.toLocaleString()}
                    </span>
                  </div>
                  <div className="flex justify-between text-xs text-muted-foreground pt-1">
                    <span>Difference from original:</span>
                    <span className={counterTotal - originalOffer.totalAmount >= 0 ? "text-green-600" : "text-red-600"}>
                      {counterTotal - originalOffer.totalAmount >= 0 ? "+" : ""}
                      KES {(counterTotal - originalOffer.totalAmount).toLocaleString()}
                    </span>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={isSubmitting}>
            Cancel
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={
              !counterPrice ||
              !counterQuantity ||
              parseFloat(counterPrice) <= 0 ||
              parseFloat(counterQuantity) <= 0 ||
              parseFloat(counterQuantity) > availableQuantity ||
              isSubmitting
            }
          >
            {isSubmitting ? (
              <>
                <IconLoader2 className="mr-2 h-4 w-4 animate-spin" />
                Sending...
              </>
            ) : (
              <>
                <IconCheck className="mr-2 h-4 w-4" />
                Send Counter Offer
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

