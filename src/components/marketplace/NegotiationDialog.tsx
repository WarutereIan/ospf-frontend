import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  IconSend,
  IconMessageCircle,
  IconClock,
  IconCheck,
  IconX,
  IconLoader2,
  IconShoppingCart,
  IconAlertCircle,
} from "@tabler/icons-react";
import { cn } from "@/lib/utils";
import { useAuth } from "@/contexts/AuthContext";
import { useMarketplace } from "@/contexts/MarketplaceContext";
import type { Negotiation, NegotiationMessage } from "@/types/marketplace";

interface NegotiationDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  negotiationId?: string; // If provided, load existing negotiation
  listingId?: string; // If provided, initiate new negotiation
  onConvertToOrder?: (orderId: string) => void;
}

export function NegotiationDialog({
  open,
  onOpenChange,
  negotiationId,
  listingId,
  onConvertToOrder,
}: NegotiationDialogProps) {
  const navigate = useNavigate();
  const { user, role } = useAuth();
  const {
    selectedNegotiation,
    fetchNegotiationById,
    initiateNegotiation,
    sendNegotiationMessage,
    acceptNegotiation,
    rejectNegotiation,
    convertNegotiationToOrder,
    isLoading,
  } = useMarketplace();

  const [messageText, setMessageText] = useState("");
  const [showOfferForm, setShowOfferForm] = useState(false);
  const [offerPrice, setOfferPrice] = useState("");
  const [offerQuantity, setOfferQuantity] = useState("");
  const [isSending, setIsSending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Load negotiation when dialog opens
  useEffect(() => {
    if (open && negotiationId) {
      fetchNegotiationById(negotiationId);
    }
  }, [open, negotiationId, fetchNegotiationById]);

  // Reset form when negotiation changes
  useEffect(() => {
    if (selectedNegotiation) {
      setOfferPrice(selectedNegotiation.negotiatedPricePerKg?.toString() || selectedNegotiation.originalPricePerKg.toString());
      setOfferQuantity(selectedNegotiation.negotiatedQuantity?.toString() || selectedNegotiation.originalQuantity.toString());
    } else if (listingId) {
      // Will be set when listing is loaded
    }
  }, [selectedNegotiation, listingId]);

  const negotiation = selectedNegotiation;
  const isBuyer = role === "buyer";
  const isFarmer = role === "farmer";
  const canInteract = negotiation && 
    (negotiation.status === "pending" || negotiation.status === "counter_offer") &&
    !negotiation.expiresAt || 
    (negotiation.expiresAt && new Date(negotiation.expiresAt) > new Date());

  const handleSendMessage = async () => {
    if (!messageText.trim() || !negotiation) return;

    setIsSending(true);
    setError(null);
    try {
      const message: Partial<NegotiationMessage> = {
        message: messageText,
        senderType: role === "buyer" ? "buyer" : "farmer",
        isCounterOffer: false,
      };
      await sendNegotiationMessage(negotiation.id, message);
      setMessageText("");
      await fetchNegotiationById(negotiation.id);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to send message");
    } finally {
      setIsSending(false);
    }
  };

  const handleSendOffer = async () => {
    const price = parseFloat(offerPrice);
    const quantity = parseFloat(offerQuantity);

    if (!price || !quantity || price <= 0 || quantity <= 0) {
      setError("Please enter valid price and quantity");
      return;
    }

    if (!negotiation && !listingId) {
      setError("No negotiation or listing selected");
      return;
    }

    setIsSending(true);
    setError(null);
    try {
      const message: Partial<NegotiationMessage> = {
        pricePerKg: price,
        quantity: quantity,
        totalAmount: price * quantity,
        message: messageText || undefined,
        senderType: role === "buyer" ? "buyer" : "farmer",
        isCounterOffer: negotiation ? negotiation.messages.length > 0 : false,
      };

      if (negotiation) {
        // Send counter offer
        await sendNegotiationMessage(negotiation.id, message);
        await fetchNegotiationById(negotiation.id);
      } else if (listingId) {
        // Initiate new negotiation
        await initiateNegotiation(listingId, message);
      }

      setShowOfferForm(false);
      setMessageText("");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to send offer");
    } finally {
      setIsSending(false);
    }
  };

  const handleAccept = async () => {
    if (!negotiation) return;

    setIsSending(true);
    setError(null);
    try {
      await acceptNegotiation(negotiation.id);
      await fetchNegotiationById(negotiation.id);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to accept negotiation");
    } finally {
      setIsSending(false);
    }
  };

  const handleReject = async () => {
    if (!negotiation) return;

    setIsSending(true);
    setError(null);
    try {
      await rejectNegotiation(negotiation.id);
      await fetchNegotiationById(negotiation.id);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to reject negotiation");
    } finally {
      setIsSending(false);
    }
  };

  const handleConvertToOrder = async () => {
    if (!negotiation) return;

    setIsSending(true);
    setError(null);
    try {
      const result = await convertNegotiationToOrder(negotiation.id);
      if (result?.id) {
        if (onConvertToOrder) {
          onConvertToOrder(result.id);
        } else {
          navigate(`/orders/${result.id}`);
        }
      }
      onOpenChange(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to convert to order");
    } finally {
      setIsSending(false);
    }
  };

  const formatTimestamp = (timestamp: string) => {
    const date = new Date(timestamp);
    return date.toLocaleString("en-US", {
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  if (!open) return null;

  // Show loading state
  if (negotiationId && !negotiation && isLoading) {
    return (
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="max-w-2xl">
          <div className="flex items-center justify-center py-12">
            <IconLoader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  // Show error if negotiation not found
  if (negotiationId && !negotiation && !isLoading) {
    return (
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="max-w-2xl">
          <div className="text-center py-8">
            <IconAlertCircle className="h-12 w-12 text-destructive mx-auto mb-4" />
            <p className="text-lg font-medium">Negotiation not found</p>
            <Button variant="outline" onClick={() => onOpenChange(false)} className="mt-4">
              Close
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  const counterpartName = negotiation
    ? isBuyer
      ? negotiation.farmerName
      : negotiation.buyerName
    : "Counterpart";

  const currentPrice = negotiation?.negotiatedPricePerKg || negotiation?.originalPricePerKg || 0;
  const currentQuantity = negotiation?.negotiatedQuantity || negotiation?.originalQuantity || 0;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] flex flex-col">
        <DialogHeader>
          <div className="flex items-center justify-between">
            <div>
              <DialogTitle>Negotiation with {counterpartName}</DialogTitle>
              <DialogDescription>
                {negotiation ? `Negotiation #${negotiation.negotiationNumber}` : "New Negotiation"}
              </DialogDescription>
            </div>
            {negotiation && (
              <Badge
                variant="outline"
                className={cn(
                  negotiation.status === "accepted" && "bg-green-50 text-green-700 border-green-200",
                  negotiation.status === "rejected" && "bg-red-50 text-red-700 border-red-200",
                  negotiation.status === "pending" && "bg-yellow-50 text-yellow-700 border-yellow-200",
                  negotiation.status === "counter_offer" && "bg-blue-50 text-blue-700 border-blue-200",
                  negotiation.status === "expired" && "bg-gray-50 text-gray-700 border-gray-200",
                  negotiation.status === "converted" && "bg-purple-50 text-purple-700 border-purple-200"
                )}
              >
                {negotiation.status.replace("_", " ").toUpperCase()}
              </Badge>
            )}
          </div>
        </DialogHeader>

        {error && (
          <div className="p-3 bg-destructive/10 border border-destructive/20 rounded-lg text-sm text-destructive">
            {error}
          </div>
        )}

        {/* Original Listing Details */}
        {negotiation?.listing && (
          <Card className="border-muted">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">{negotiation.listing.variety} - Grade {negotiation.listing.qualityGrade}</p>
                  <p className="text-sm text-muted-foreground">
                    Original: KES {negotiation.originalPricePerKg}/kg × {negotiation.originalQuantity}kg
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-sm text-muted-foreground">Current Terms</p>
                  <p className="font-semibold">
                    KES {currentPrice}/kg × {currentQuantity}kg
                  </p>
                  <p className="text-sm font-bold text-primary">
                    Total: KES {(currentPrice * currentQuantity).toLocaleString()}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Messages Area */}
        <div className="flex-1 overflow-y-auto space-y-4 p-4 border rounded-lg bg-muted/30 min-h-[300px] max-h-[400px]">
          {negotiation && negotiation.messages.length > 0 ? (
            negotiation.messages.map((msg) => {
              const isOwnMessage = msg.senderType === role;
              const isOffer = msg.pricePerKg !== undefined || msg.quantity !== undefined;

              return (
                <div
                  key={msg.id}
                  className={cn(
                    "flex flex-col gap-2",
                    isOwnMessage ? "items-end" : "items-start"
                  )}
                >
                  <div
                    className={cn(
                      "rounded-lg p-3 max-w-[80%]",
                      isOwnMessage
                        ? "bg-primary text-primary-foreground"
                        : "bg-background border"
                    )}
                  >
                    <div className="flex items-center gap-2 mb-1 flex-wrap">
                      <span className="font-medium text-sm">{msg.senderName}</span>
                      <Badge variant="outline" className="text-xs">
                        {msg.senderType}
                      </Badge>
                      {isOffer && (
                        <Badge variant="outline" className={cn(
                          "text-xs",
                          msg.isCounterOffer ? "bg-blue-100 text-blue-700" : "bg-yellow-100 text-yellow-700"
                        )}>
                          {msg.isCounterOffer ? "Counter Offer" : "Offer"}
                        </Badge>
                      )}
                    </div>
                    {msg.message && <p className="text-sm mb-2">{msg.message}</p>}
                    {isOffer && (
                      <Card className={cn(
                        "mt-2",
                        isOwnMessage ? "bg-background/20" : "bg-background/50"
                      )}>
                        <CardContent className="p-3 space-y-1 text-sm">
                          {msg.pricePerKg !== undefined && (
                            <div className="flex justify-between">
                              <span>Price per kg:</span>
                              <span className="font-semibold">KES {msg.pricePerKg}</span>
                            </div>
                          )}
                          {msg.quantity !== undefined && (
                            <div className="flex justify-between">
                              <span>Quantity:</span>
                              <span className="font-semibold">{msg.quantity} kg</span>
                            </div>
                          )}
                          {msg.totalAmount !== undefined && (
                            <div className="flex justify-between border-t pt-1 mt-1">
                              <span>Total:</span>
                              <span className="font-bold">KES {msg.totalAmount.toLocaleString()}</span>
                            </div>
                          )}
                        </CardContent>
                      </Card>
                    )}
                    <div className="flex items-center gap-2 mt-2 text-xs opacity-70">
                      <IconClock className="h-3 w-3" />
                      <span>{formatTimestamp(msg.createdAt)}</span>
                      {msg.readAt && <span className="opacity-50">• Read</span>}
                    </div>
                  </div>
                </div>
              );
            })
          ) : (
            <div className="text-center py-8 text-muted-foreground">
              <IconMessageCircle className="h-12 w-12 mx-auto mb-2 opacity-50" />
              <p>No messages yet. Start the negotiation!</p>
            </div>
          )}
        </div>

        {/* Negotiation Actions */}
        {negotiation && negotiation.status === "accepted" && (
          <Card className="border-green-200 bg-green-50">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-semibold text-green-900">Negotiation Accepted!</p>
                  <p className="text-sm text-green-700">
                    Terms agreed: KES {currentPrice}/kg × {currentQuantity}kg
                  </p>
                </div>
                <Button onClick={handleConvertToOrder} disabled={isSending}>
                  {isSending ? (
                    <>
                      <IconLoader2 className="mr-2 h-4 w-4 animate-spin" />
                      Creating...
                    </>
                  ) : (
                    <>
                      <IconShoppingCart className="mr-2 h-4 w-4" />
                      Convert to Order
                    </>
                  )}
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Offer Form */}
        {showOfferForm && canInteract && (
          <Card className="border-primary">
            <CardContent className="p-4 space-y-3">
              <div className="flex items-center justify-between">
                <h4 className="font-semibold">Make an Offer</h4>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowOfferForm(false)}
                >
                  <IconX className="h-4 w-4" />
                </Button>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <Label className="text-xs">Price per kg (KES)</Label>
                  <Input
                    type="number"
                    value={offerPrice}
                    onChange={(e) => setOfferPrice(e.target.value)}
                    placeholder={currentPrice.toString()}
                    min={0}
                    step={0.1}
                  />
                </div>
                <div className="space-y-1">
                  <Label className="text-xs">Quantity (kg)</Label>
                  <Input
                    type="number"
                    value={offerQuantity}
                    onChange={(e) => setOfferQuantity(e.target.value)}
                    placeholder={currentQuantity.toString()}
                    min={0}
                    step={0.1}
                  />
                </div>
              </div>
              <div className="space-y-1">
                <Label className="text-xs">Message (Optional)</Label>
                <Textarea
                  value={messageText}
                  onChange={(e) => setMessageText(e.target.value)}
                  placeholder="Add a message with your offer..."
                  rows={2}
                />
              </div>
              {offerPrice && offerQuantity && (
                <div className="pt-2 border-t">
                  <div className="flex justify-between text-sm">
                    <span>Total Amount:</span>
                    <span className="font-bold">
                      KES {(parseFloat(offerPrice) * parseFloat(offerQuantity)).toLocaleString()}
                    </span>
                  </div>
                </div>
              )}
              <Button onClick={handleSendOffer} className="w-full" disabled={isSending}>
                {isSending ? (
                  <>
                    <IconLoader2 className="mr-2 h-4 w-4 animate-spin" />
                    Sending...
                  </>
                ) : (
                  <>
                    <IconSend className="mr-2 h-4 w-4" />
                    Send Offer
                  </>
                )}
              </Button>
            </CardContent>
          </Card>
        )}

        {/* Message Input & Actions */}
        {canInteract && !showOfferForm && (
          <div className="space-y-2">
            <div className="flex gap-2">
              <Textarea
                placeholder="Type your message..."
                value={messageText}
                onChange={(e) => setMessageText(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !e.shiftKey) {
                    e.preventDefault();
                    handleSendMessage();
                  }
                }}
                rows={2}
              />
              <div className="flex flex-col gap-2">
                <Button
                  onClick={handleSendMessage}
                  disabled={!messageText.trim() || isSending}
                  size="icon"
                >
                  {isSending ? (
                    <IconLoader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <IconSend className="h-4 w-4" />
                  )}
                </Button>
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => setShowOfferForm(true)}
                  title="Make an offer"
                >
                  <IconMessageCircle className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>
        )}

        {/* Accept/Reject Buttons */}
        {negotiation && 
         negotiation.status === "counter_offer" && 
         negotiation.messages.length > 0 &&
         negotiation.messages[negotiation.messages.length - 1].senderType !== role && (
          <div className="flex gap-2">
            <Button
              variant="outline"
              onClick={handleReject}
              disabled={isSending}
              className="flex-1"
            >
              <IconX className="mr-2 h-4 w-4" />
              Reject
            </Button>
            <Button
              onClick={handleAccept}
              disabled={isSending}
              className="flex-1"
            >
              <IconCheck className="mr-2 h-4 w-4" />
              Accept Terms
            </Button>
          </div>
        )}

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Close
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
