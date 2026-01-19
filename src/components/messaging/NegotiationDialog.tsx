import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
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
} from "@tabler/icons-react";
import { cn } from "@/lib/utils";
import { useAuth } from "@/contexts/AuthContext";

interface Message {
  id: string;
  senderId: string;
  senderName: string;
  senderRole: "farmer" | "buyer";
  message: string;
  timestamp: string;
  type: "message" | "offer" | "counter_offer" | "accept" | "reject";
  offerDetails?: {
    pricePerKg: number;
    quantity: number;
    totalAmount: number;
  };
}

interface NegotiationDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  listingId: string;
  farmerName: string;
  buyerName: string;
  currentPrice: number;
  currentQuantity: number;
  onSendMessage?: (message: string) => void;
  onSendOffer?: (offer: { pricePerKg: number; quantity: number }) => void;
  onAcceptOffer?: (offerId: string) => void;
  onRejectOffer?: (offerId: string) => void;
}

export function NegotiationDialog({
  open,
  onOpenChange,
  listingId,
  farmerName,
  buyerName,
  currentPrice,
  currentQuantity,
  onSendMessage,
  onSendOffer,
  onAcceptOffer,
  onRejectOffer,
}: NegotiationDialogProps) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [messageText, setMessageText] = useState("");
  const [showOfferForm, setShowOfferForm] = useState(false);
  const [offerPrice, setOfferPrice] = useState(currentPrice.toString());
  const [offerQuantity, setOfferQuantity] = useState("1");
  const [isSending, setIsSending] = useState(false);
  const { role } = useAuth();

  // Load messages - TODO: Replace with API call
  useEffect(() => {
    if (open) {
      // Sample messages
      setMessages([
        {
          id: "msg-1",
          senderId: "buyer-1",
          senderName: buyerName,
          senderRole: "buyer",
          message: "Hi, I'm interested in your OFSP. Can we discuss the price?",
          timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
          type: "message",
        },
        {
          id: "msg-2",
          senderId: "farmer-1",
          senderName: farmerName,
          senderRole: "farmer",
          message: "Sure! What quantity are you looking for?",
          timestamp: new Date(Date.now() - 1.5 * 60 * 60 * 1000).toISOString(),
          type: "message",
        },
      ]);
    }
  }, [open, buyerName, farmerName]);

  const handleSendMessage = async () => {
    if (!messageText.trim()) return;

    setIsSending(true);
    const newMessage: Message = {
      id: `msg-${Date.now()}`,
      senderId: role === "buyer" ? "buyer-1" : "farmer-1",
      senderName: role === "buyer" ? buyerName : farmerName,
      senderRole: role === "buyer" ? "buyer" : "farmer",
      message: messageText,
      timestamp: new Date().toISOString(),
      type: "message",
    };

    setMessages((prev) => [...prev, newMessage]);
    setMessageText("");
    setIsSending(false);

    if (onSendMessage) {
      onSendMessage(messageText);
    }
  };

  const handleSendOffer = async () => {
    const price = parseFloat(offerPrice);
    const quantity = parseFloat(offerQuantity);

    if (!price || !quantity || price <= 0 || quantity <= 0) return;

    setIsSending(true);
    const newMessage: Message = {
      id: `offer-${Date.now()}`,
      senderId: role === "buyer" ? "buyer-1" : "farmer-1",
      senderName: role === "buyer" ? buyerName : farmerName,
      senderRole: role === "buyer" ? "buyer" : "farmer",
      message: `Offering KES ${price}/kg for ${quantity}kg`,
      timestamp: new Date().toISOString(),
      type: role === "buyer" ? "offer" : "counter_offer",
      offerDetails: {
        pricePerKg: price,
        quantity,
        totalAmount: price * quantity,
      },
    };

    setMessages((prev) => [...prev, newMessage]);
    setShowOfferForm(false);
    setOfferPrice(currentPrice.toString());
    setOfferQuantity("1");
    setIsSending(false);

    if (onSendOffer) {
      onSendOffer({ pricePerKg: price, quantity });
    }
  };

  const handleAcceptOffer = (messageId: string) => {
    if (onAcceptOffer) {
      onAcceptOffer(messageId);
    }
    // Add acceptance message
    const acceptMessage: Message = {
      id: `accept-${Date.now()}`,
      senderId: role === "buyer" ? "buyer-1" : "farmer-1",
      senderName: role === "buyer" ? buyerName : farmerName,
      senderRole: role === "buyer" ? "buyer" : "farmer",
      message: "Offer accepted!",
      timestamp: new Date().toISOString(),
      type: "accept",
    };
    setMessages((prev) => [...prev, acceptMessage]);
  };

  const handleRejectOffer = (messageId: string) => {
    if (onRejectOffer) {
      onRejectOffer(messageId);
    }
    // Add rejection message
    const rejectMessage: Message = {
      id: `reject-${Date.now()}`,
      senderId: role === "buyer" ? "buyer-1" : "farmer-1",
      senderName: role === "buyer" ? buyerName : farmerName,
      senderRole: role === "buyer" ? "buyer" : "farmer",
      message: "Offer rejected",
      timestamp: new Date().toISOString(),
      type: "reject",
    };
    setMessages((prev) => [...prev, rejectMessage]);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] flex flex-col">
        <DialogHeader>
          <DialogTitle>Negotiation with {role === "buyer" ? farmerName : buyerName}</DialogTitle>
          <DialogDescription>Listing #{listingId}</DialogDescription>
        </DialogHeader>

        {/* Messages Area */}
        <div className="flex-1 overflow-y-auto space-y-4 p-4 border rounded-lg bg-muted/30 min-h-[300px] max-h-[400px]">
          {messages.map((msg) => {
            const isOwnMessage = msg.senderRole === role;
            const isOffer = msg.type === "offer" || msg.type === "counter_offer";

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
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-medium text-sm">{msg.senderName}</span>
                    <Badge variant="outline" className="text-xs">
                      {msg.senderRole}
                    </Badge>
                    {isOffer && (
                      <Badge variant="outline" className="text-xs bg-yellow-100">
                        {msg.type === "counter_offer" ? "Counter Offer" : "Offer"}
                      </Badge>
                    )}
                  </div>
                  <p className="text-sm">{msg.message}</p>
                  {msg.offerDetails && (
                    <Card className="mt-2 bg-background/50">
                      <CardContent className="p-3 space-y-1 text-sm">
                        <div className="flex justify-between">
                          <span>Price per kg:</span>
                          <span className="font-semibold">KES {msg.offerDetails.pricePerKg}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Quantity:</span>
                          <span className="font-semibold">{msg.offerDetails.quantity} kg</span>
                        </div>
                        <div className="flex justify-between border-t pt-1 mt-1">
                          <span>Total:</span>
                          <span className="font-bold">KES {msg.offerDetails.totalAmount.toLocaleString()}</span>
                        </div>
                      </CardContent>
                    </Card>
                  )}
                  <div className="flex items-center gap-2 mt-2 text-xs opacity-70">
                    <IconClock className="h-3 w-3" />
                    <span>{new Date(msg.timestamp).toLocaleTimeString()}</span>
                  </div>
                </div>
                {isOffer && !isOwnMessage && msg.type !== "accept" && msg.type !== "reject" && (
                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleRejectOffer(msg.id)}
                      className="text-xs"
                    >
                      <IconX className="h-3 w-3 mr-1" />
                      Reject
                    </Button>
                    <Button
                      size="sm"
                      onClick={() => handleAcceptOffer(msg.id)}
                      className="text-xs"
                    >
                      <IconCheck className="h-3 w-3 mr-1" />
                      Accept
                    </Button>
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Offer Form */}
        {showOfferForm && (
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
                  <label className="text-xs text-muted-foreground">Price per kg (KES)</label>
                  <Input
                    type="number"
                    value={offerPrice}
                    onChange={(e) => setOfferPrice(e.target.value)}
                    placeholder="0"
                    min={0}
                    step={0.1}
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs text-muted-foreground">Quantity (kg)</label>
                  <Input
                    type="number"
                    value={offerQuantity}
                    onChange={(e) => setOfferQuantity(e.target.value)}
                    placeholder="0"
                    min={0}
                    step={0.1}
                  />
                </div>
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

        {/* Message Input */}
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
              {!showOfferForm && (
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => setShowOfferForm(true)}
                  title="Make an offer"
                >
                  <IconMessageCircle className="h-4 w-4" />
                </Button>
              )}
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Close
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

