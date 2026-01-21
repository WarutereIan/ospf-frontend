import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  IconMessageCircle,
  IconLoader2,
} from "@tabler/icons-react";
import { useAuth } from "@/contexts/AuthContext";
import { useMarketplace } from "@/contexts/MarketplaceContext";
import { NegotiationDialog } from "./NegotiationDialog";
import type { ProduceListing } from "@/types/marketplace";

interface InitiateNegotiationButtonProps {
  listing: ProduceListing;
  variant?: "default" | "outline" | "ghost" | "secondary";
  size?: "default" | "sm" | "lg" | "icon";
  className?: string;
}

export function InitiateNegotiationButton({
  listing,
  variant = "outline",
  size = "default",
  className,
}: InitiateNegotiationButtonProps) {
  const { user } = useAuth();
  const { initiateNegotiation, isLoading } = useMarketplace();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [negotiationDialogOpen, setNegotiationDialogOpen] = useState(false);
  const [negotiationId, setNegotiationId] = useState<string | undefined>();
  const [offerPrice, setOfferPrice] = useState(listing.pricePerKg.toString());
  const [offerQuantity, setOfferQuantity] = useState("1");
  const [message, setMessage] = useState("");
  const [error, setError] = useState<string | null>(null);

  const handleOpenDialog = () => {
    setDialogOpen(true);
    setOfferPrice(listing.pricePerKg.toString());
    setOfferQuantity("1");
    setMessage("");
    setError(null);
  };

  const handleInitiateNegotiation = async () => {
    const price = parseFloat(offerPrice);
    const quantity = parseFloat(offerQuantity);

    if (!price || !quantity || price <= 0 || quantity <= 0) {
      setError("Please enter valid price and quantity");
      return;
    }

    if (quantity > listing.availableQuantity) {
      setError(`Quantity cannot exceed available quantity (${listing.availableQuantity} kg)`);
      return;
    }

    setError(null);
    try {
      const result = await initiateNegotiation(listing.id, {
        pricePerKg: price,
        quantity: quantity,
        totalAmount: price * quantity,
        message: message || undefined,
        senderType: "buyer",
        isCounterOffer: false,
      });
      
      if (result?.id) {
        setNegotiationId(result.id);
        setDialogOpen(false);
        setNegotiationDialogOpen(true);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to initiate negotiation");
    }
  };

  return (
    <>
      <Button
        variant={variant}
        size={size}
        onClick={handleOpenDialog}
        className={className}
        disabled={listing.status !== "active" || listing.availableQuantity <= 0}
      >
        <IconMessageCircle className="mr-2 h-4 w-4" />
        Negotiate
      </Button>

      {/* Initiate Negotiation Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Start Negotiation</DialogTitle>
            <DialogDescription>
              Propose your terms for this listing. The farmer will be notified and can respond.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            {/* Listing Info */}
            <div className="p-3 bg-muted rounded-lg">
              <p className="font-medium">{listing.variety} - Grade {listing.qualityGrade}</p>
              <p className="text-sm text-muted-foreground">
                Current Price: KES {listing.pricePerKg}/kg
              </p>
              <p className="text-sm text-muted-foreground">
                Available: {listing.availableQuantity} kg
              </p>
            </div>

            {error && (
              <div className="p-3 bg-destructive/10 border border-destructive/20 rounded-lg text-sm text-destructive">
                {error}
              </div>
            )}

            {/* Offer Form */}
            <div className="space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <Label htmlFor="offer-price">Price per kg (KES)</Label>
                  <Input
                    id="offer-price"
                    type="number"
                    value={offerPrice}
                    onChange={(e) => setOfferPrice(e.target.value)}
                    placeholder={listing.pricePerKg.toString()}
                    min={0}
                    step={0.1}
                  />
                </div>
                <div className="space-y-1">
                  <Label htmlFor="offer-quantity">Quantity (kg)</Label>
                  <Input
                    id="offer-quantity"
                    type="number"
                    value={offerQuantity}
                    onChange={(e) => setOfferQuantity(e.target.value)}
                    placeholder="1"
                    min={0.1}
                    max={listing.availableQuantity}
                    step={0.1}
                  />
                </div>
              </div>

              <div className="space-y-1">
                <Label htmlFor="offer-message">Message (Optional)</Label>
                <Textarea
                  id="offer-message"
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder="Add a message to explain your offer..."
                  rows={3}
                />
              </div>

              {offerPrice && offerQuantity && (
                <div className="p-3 bg-primary/5 border border-primary/20 rounded-lg">
                  <div className="flex justify-between text-sm">
                    <span>Total Amount:</span>
                    <span className="font-bold text-primary">
                      KES {(parseFloat(offerPrice) * parseFloat(offerQuantity)).toLocaleString()}
                    </span>
                  </div>
                </div>
              )}
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleInitiateNegotiation} disabled={isLoading}>
              {isLoading ? (
                <>
                  <IconLoader2 className="mr-2 h-4 w-4 animate-spin" />
                  Starting...
                </>
              ) : (
                <>
                  <IconMessageCircle className="mr-2 h-4 w-4" />
                  Start Negotiation
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Negotiation Dialog */}
      {negotiationId && (
        <NegotiationDialog
          open={negotiationDialogOpen}
          onOpenChange={setNegotiationDialogOpen}
          negotiationId={negotiationId}
          onConvertToOrder={(orderId) => {
            setNegotiationDialogOpen(false);
            // Navigate to order or call callback
          }}
        />
      )}
    </>
  );
}
