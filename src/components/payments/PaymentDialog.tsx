import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
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
  IconCreditCard,
  IconPhone,
  IconBuildingBank,
  IconCheck,
  IconLoader2,
  IconAlertCircle,
} from "@tabler/icons-react";
import { cn } from "@/lib/utils";

interface PaymentDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  orderId: string;
  amount: number;
  farmerName: string;
  onPaymentInitiated?: (paymentData: PaymentData) => void;
}

interface PaymentData {
  method: "mpesa" | "airtel" | "bank" | "card";
  phoneNumber?: string;
  accountNumber?: string;
  cardNumber?: string;
  amount: number;
}

const paymentMethods = [
  {
    value: "mpesa",
    label: "M-PESA",
    icon: IconPhone,
    description: "Pay via M-PESA STK Push",
    color: "bg-green-100 text-green-800 border-green-300",
  },
  {
    value: "airtel",
    label: "Airtel Money",
    icon: IconPhone,
    description: "Pay via Airtel Money",
    color: "bg-red-100 text-red-800 border-red-300",
  },
  {
    value: "bank",
    label: "Bank Transfer",
    icon: IconBuildingBank,
    description: "Direct bank transfer",
    color: "bg-blue-100 text-blue-800 border-blue-300",
  },
  {
    value: "card",
    label: "Card Payment",
    icon: IconCreditCard,
    description: "Debit/Credit card",
    color: "bg-purple-100 text-purple-800 border-purple-300",
  },
];

export function PaymentDialog({
  open,
  onOpenChange,
  orderId,
  amount,
  farmerName,
  onPaymentInitiated,
}: PaymentDialogProps) {
  const [selectedMethod, setSelectedMethod] = useState<string>("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [accountNumber, setAccountNumber] = useState("");
  const [cardNumber, setCardNumber] = useState("");
  const [cardExpiry, setCardExpiry] = useState("");
  const [cardCVV, setCardCVV] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handlePayment = async () => {
    setError(null);

    // Validation
    if (!selectedMethod) {
      setError("Please select a payment method");
      return;
    }

    if (selectedMethod === "mpesa" || selectedMethod === "airtel") {
      if (!phoneNumber || phoneNumber.length < 10) {
        setError("Please enter a valid phone number");
        return;
      }
    }

    if (selectedMethod === "bank") {
      if (!accountNumber) {
        setError("Please enter account number");
        return;
      }
    }

    if (selectedMethod === "card") {
      if (!cardNumber || !cardExpiry || !cardCVV) {
        setError("Please fill all card details");
        return;
      }
    }

    setIsProcessing(true);

    // TODO: Replace with actual API call
    setTimeout(() => {
      const paymentData: PaymentData = {
        method: selectedMethod as "mpesa" | "airtel" | "bank" | "card",
        phoneNumber: selectedMethod === "mpesa" || selectedMethod === "airtel" ? phoneNumber : undefined,
        accountNumber: selectedMethod === "bank" ? accountNumber : undefined,
        cardNumber: selectedMethod === "card" ? cardNumber : undefined,
        amount,
      };

      if (onPaymentInitiated) {
        onPaymentInitiated(paymentData);
      }

      setIsProcessing(false);
      onOpenChange(false);
      
      // Reset form
      setSelectedMethod("");
      setPhoneNumber("");
      setAccountNumber("");
      setCardNumber("");
      setCardExpiry("");
      setCardCVV("");
    }, 2000);
  };

  const platformFee = amount * 0.02; // 2% platform fee
  const totalAmount = amount + platformFee;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Make Payment</DialogTitle>
          <DialogDescription>
            Secure payment for Order #{orderId} - {farmerName}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Order Summary */}
          <div className="border rounded-lg p-4 bg-muted/50">
            <div className="flex justify-between items-center mb-2">
              <span className="text-sm text-muted-foreground">Order Amount</span>
              <span className="font-semibold">KES {amount.toLocaleString()}</span>
            </div>
            <div className="flex justify-between items-center mb-2">
              <span className="text-sm text-muted-foreground">Platform Fee (2%)</span>
              <span className="font-semibold">KES {platformFee.toLocaleString()}</span>
            </div>
            <div className="flex justify-between items-center pt-2 border-t">
              <span className="font-semibold">Total Amount</span>
              <span className="text-xl font-bold">KES {totalAmount.toLocaleString()}</span>
            </div>
          </div>

          {/* Payment Method Selection */}
          <div className="space-y-3">
            <Label>Select Payment Method</Label>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {paymentMethods.map((method) => {
                const Icon = method.icon;
                const isSelected = selectedMethod === method.value;
                return (
                  <button
                    key={method.value}
                    type="button"
                    onClick={() => setSelectedMethod(method.value)}
                    className={cn(
                      "flex items-start gap-3 p-4 border-2 rounded-lg text-left transition-all",
                      isSelected
                        ? "border-primary bg-primary/5"
                        : "border-border hover:border-primary/50"
                    )}
                  >
                    <div
                      className={cn(
                        "p-2 rounded-lg",
                        isSelected ? "bg-primary text-primary-foreground" : "bg-muted"
                      )}
                    >
                      <Icon className="h-5 w-5" />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center justify-between">
                        <p className="font-medium">{method.label}</p>
                        {isSelected && <IconCheck className="h-5 w-5 text-primary" />}
                      </div>
                      <p className="text-xs text-muted-foreground mt-1">{method.description}</p>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Payment Details Form */}
          {selectedMethod && (
            <div className="space-y-4 border-t pt-4">
              {selectedMethod === "mpesa" || selectedMethod === "airtel" ? (
                <div className="space-y-2">
                  <Label htmlFor="phone">Phone Number</Label>
                  <Input
                    id="phone"
                    type="tel"
                    placeholder="07XX XXX XXX"
                    value={phoneNumber}
                    onChange={(e) => setPhoneNumber(e.target.value)}
                    maxLength={10}
                  />
                  <p className="text-xs text-muted-foreground">
                    Enter your {selectedMethod === "mpesa" ? "M-PESA" : "Airtel Money"} registered phone number
                  </p>
                </div>
              ) : selectedMethod === "bank" ? (
                <div className="space-y-2">
                  <Label htmlFor="account">Account Number</Label>
                  <Input
                    id="account"
                    type="text"
                    placeholder="Enter account number"
                    value={accountNumber}
                    onChange={(e) => setAccountNumber(e.target.value)}
                  />
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="card">Card Number</Label>
                    <Input
                      id="card"
                      type="text"
                      placeholder="1234 5678 9012 3456"
                      value={cardNumber}
                      onChange={(e) => setCardNumber(e.target.value.replace(/\s/g, ""))}
                      maxLength={16}
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="expiry">Expiry Date</Label>
                      <Input
                        id="expiry"
                        type="text"
                        placeholder="MM/YY"
                        value={cardExpiry}
                        onChange={(e) => setCardExpiry(e.target.value)}
                        maxLength={5}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="cvv">CVV</Label>
                      <Input
                        id="cvv"
                        type="text"
                        placeholder="123"
                        value={cardCVV}
                        onChange={(e) => setCardCVV(e.target.value)}
                        maxLength={3}
                      />
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Error Message */}
          {error && (
            <div className="flex items-center gap-2 p-3 bg-red-50 border border-red-200 rounded-lg text-red-800">
              <IconAlertCircle className="h-5 w-5" />
              <p className="text-sm">{error}</p>
            </div>
          )}

          {/* Payment Info */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <div className="flex items-start gap-2">
              <IconAlertCircle className="h-5 w-5 text-blue-600 mt-0.5" />
              <div className="text-sm text-blue-800">
                <p className="font-medium mb-1">Payment Security</p>
                <p>
                  Your payment will be held securely in escrow until the order is delivered and quality checked.
                  Payment will be released to the farmer automatically 24 hours after delivery confirmation.
                </p>
              </div>
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={isProcessing}>
            Cancel
          </Button>
          <Button onClick={handlePayment} disabled={!selectedMethod || isProcessing}>
            {isProcessing ? (
              <>
                <IconLoader2 className="mr-2 h-4 w-4 animate-spin" />
                Processing...
              </>
            ) : (
              <>
                Pay KES {totalAmount.toLocaleString()}
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
