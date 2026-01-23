import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
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
  IconCash,
  IconUpload,
  IconLoader2,
  IconAlertCircle,
  IconCheck,
  IconX,
} from "@tabler/icons-react";
import { cn } from "@/lib/utils";
import { showSuccess, showError, formatApiError } from "@/lib/toast";
import { apiPost } from "@/lib/api-client";

interface PaymentConfirmationDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  orderId: string;
  orderNumber: string;
  amount: number;
  onPaymentConfirmed?: () => void;
}

type PaymentMethod = "MPESA" | "BANK_TRANSFER" | "CASH" | "CREDIT";

const paymentMethods: Array<{
  value: PaymentMethod;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  description: string;
}> = [
  {
    value: "MPESA",
    label: "M-PESA",
    icon: IconPhone,
    description: "M-PESA mobile money",
  },
  {
    value: "BANK_TRANSFER",
    label: "Bank Transfer",
    icon: IconBuildingBank,
    description: "Direct bank transfer",
  },
  {
    value: "CASH",
    label: "Cash",
    icon: IconCash,
    description: "Cash payment",
  },
  {
    value: "CREDIT",
    label: "Credit",
    icon: IconCreditCard,
    description: "Credit payment",
  },
];

export function PaymentConfirmationDialog({
  open,
  onOpenChange,
  orderId,
  orderNumber,
  amount,
  onPaymentConfirmed,
}: PaymentConfirmationDialogProps) {
  const [selectedMethod, setSelectedMethod] = useState<PaymentMethod | "">("");
  const [transactionReference, setTransactionReference] = useState("");
  const [paymentAmount, setPaymentAmount] = useState(amount.toString());
  const [paymentDate, setPaymentDate] = useState(
    new Date().toISOString().split("T")[0]
  );
  const [paymentDetails, setPaymentDetails] = useState("");
  const [paymentEvidence, setPaymentEvidence] = useState<File | null>(null);
  const [evidencePreview, setEvidencePreview] = useState<string | null>(null);
  const [confirmed, setConfirmed] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Validate file type
      if (!file.type.startsWith("image/")) {
        showError("Invalid file type", "Please upload an image file");
        return;
      }
      // Validate file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        showError("File too large", "Please upload an image smaller than 5MB");
        return;
      }
      setPaymentEvidence(file);
      // Create preview
      const reader = new FileReader();
      reader.onloadend = () => {
        setEvidencePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const removeEvidence = () => {
    setPaymentEvidence(null);
    setEvidencePreview(null);
  };

  const handleSubmit = async () => {
    // Validation
    if (!selectedMethod) {
      showError("Payment method required", "Please select a payment method");
      return;
    }

    if (!transactionReference.trim()) {
      showError("Transaction reference required", "Please enter the transaction reference/ID");
      return;
    }

    const amountValue = parseFloat(paymentAmount);
    if (isNaN(amountValue) || amountValue <= 0) {
      showError("Invalid amount", "Please enter a valid payment amount");
      return;
    }

    // Allow small variance for rounding (0.01)
    const amountDifference = Math.abs(amountValue - amount);
    if (amountDifference > 0.01) {
      showError(
        "Amount mismatch",
        `Payment amount (KES ${amountValue.toLocaleString()}) does not match order total (KES ${amount.toLocaleString()})`
      );
      return;
    }

    if (!paymentDate) {
      showError("Payment date required", "Please select the payment date");
      return;
    }

    if (!confirmed) {
      showError("Confirmation required", "Please confirm that you have made the payment");
      return;
    }

    setIsSubmitting(true);

    try {
      // Upload evidence if provided
      let evidenceUrl: string | undefined;
      if (paymentEvidence) {
        // TODO: Implement image upload to storage service
        // For now, we'll convert to base64 (not ideal for production)
        const base64 = await new Promise<string>((resolve, reject) => {
          const reader = new FileReader();
          reader.onloadend = () => resolve(reader.result as string);
          reader.onerror = reject;
          reader.readAsDataURL(paymentEvidence);
        });
        evidenceUrl = base64;
      }

      // Call API to confirm payment
      await apiPost(
        `/payments/orders/${orderId}/confirm`,
        {
          method: selectedMethod,
          transactionReference: transactionReference.trim(),
          amount: amountValue,
          paymentDate: new Date(paymentDate).toISOString(),
          paymentDetails: paymentDetails.trim() || undefined,
          paymentEvidence: evidenceUrl,
          confirmed: true,
        }
      );

      showSuccess(
        "Payment confirmed",
        `Payment confirmation recorded for order #${orderNumber}`
      );

      // Reset form
      setSelectedMethod("");
      setTransactionReference("");
      setPaymentAmount(amount.toString());
      setPaymentDate(new Date().toISOString().split("T")[0]);
      setPaymentDetails("");
      setPaymentEvidence(null);
      setEvidencePreview(null);
      setConfirmed(false);

      onOpenChange(false);
      if (onPaymentConfirmed) {
        onPaymentConfirmed();
      }
    } catch (error) {
      console.error("Failed to confirm payment:", error);
      showError("Failed to confirm payment", formatApiError(error));
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    if (!isSubmitting) {
      onOpenChange(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Confirm Payment</DialogTitle>
          <DialogDescription>
            Confirm payment for Order #{orderNumber}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Order Summary */}
          <div className="border rounded-lg p-4 bg-muted/50">
            <div className="flex justify-between items-center">
              <span className="text-sm text-muted-foreground">Order Total</span>
              <span className="text-xl font-bold">KES {amount.toLocaleString()}</span>
            </div>
          </div>

          {/* Payment Method Selection */}
          <div className="space-y-3">
            <Label>Payment Method *</Label>
            <div className="grid grid-cols-2 gap-3">
              {paymentMethods.map((method) => {
                const Icon = method.icon;
                const isSelected = selectedMethod === method.value;
                return (
                  <button
                    key={method.value}
                    type="button"
                    onClick={() => setSelectedMethod(method.value)}
                    disabled={isSubmitting}
                    className={cn(
                      "flex items-start gap-3 p-4 border-2 rounded-lg text-left transition-all",
                      isSelected
                        ? "border-primary bg-primary/5"
                        : "border-border hover:border-primary/50",
                      isSubmitting && "opacity-50 cursor-not-allowed"
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
          <div className="space-y-4 border-t pt-4">
            <div className="space-y-2">
              <Label htmlFor="transactionReference">
                Transaction Reference/ID *
              </Label>
              <Input
                id="transactionReference"
                type="text"
                placeholder="e.g., M-Pesa code, bank reference, receipt number"
                value={transactionReference}
                onChange={(e) => setTransactionReference(e.target.value)}
                disabled={isSubmitting}
              />
              <p className="text-xs text-muted-foreground">
                Enter the transaction reference number, M-Pesa code, or receipt number
              </p>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="paymentAmount">Payment Amount (KES) *</Label>
                <Input
                  id="paymentAmount"
                  type="number"
                  step="0.01"
                  min="0"
                  value={paymentAmount}
                  onChange={(e) => setPaymentAmount(e.target.value)}
                  disabled={isSubmitting}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="paymentDate">Payment Date *</Label>
                <Input
                  id="paymentDate"
                  type="date"
                  value={paymentDate}
                  onChange={(e) => setPaymentDate(e.target.value)}
                  max={new Date().toISOString().split("T")[0]}
                  disabled={isSubmitting}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="paymentDetails">Payment Details (Optional)</Label>
              <Textarea
                id="paymentDetails"
                placeholder="Add any additional notes about the payment..."
                value={paymentDetails}
                onChange={(e) => setPaymentDetails(e.target.value)}
                rows={3}
                disabled={isSubmitting}
              />
            </div>

            {/* Evidence Upload */}
            <div className="space-y-2">
              <Label htmlFor="paymentEvidence">Payment Evidence (Optional)</Label>
              <div className="space-y-2">
                {!evidencePreview ? (
                  <div className="flex items-center gap-2">
                    <Input
                      id="paymentEvidence"
                      type="file"
                      accept="image/*"
                      onChange={handleFileChange}
                      disabled={isSubmitting}
                      className="flex-1"
                    />
                  </div>
                ) : (
                  <div className="relative border rounded-lg p-4 bg-muted/50">
                    <img
                      src={evidencePreview}
                      alt="Payment evidence"
                      className="max-h-48 mx-auto rounded"
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={removeEvidence}
                      disabled={isSubmitting}
                      className="absolute top-2 right-2"
                    >
                      <IconX className="h-4 w-4" />
                    </Button>
                  </div>
                )}
                <p className="text-xs text-muted-foreground">
                  Upload a receipt, screenshot, or proof of payment (max 5MB, image only)
                </p>
              </div>
            </div>

            {/* Confirmation Checkbox */}
            <div className="flex items-start gap-3 p-4 border rounded-lg bg-muted/30">
              <Checkbox
                id="confirmed"
                checked={confirmed}
                onCheckedChange={(checked) => setConfirmed(checked === true)}
                disabled={isSubmitting}
              />
              <Label
                htmlFor="confirmed"
                className="text-sm font-medium cursor-pointer flex-1"
              >
                I confirm that I have made this payment
              </Label>
            </div>
          </div>

          {/* Info Message */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <div className="flex items-start gap-2">
              <IconAlertCircle className="h-5 w-5 text-blue-600 mt-0.5" />
              <div className="text-sm text-blue-800">
                <p className="font-medium mb-1">Payment Confirmation</p>
                <p>
                  By confirming payment, you acknowledge that you have made the payment externally.
                  The order will proceed to fulfillment once payment is confirmed.
                </p>
              </div>
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button
            variant="outline"
            onClick={handleClose}
            disabled={isSubmitting}
          >
            Cancel
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={
              !selectedMethod ||
              !transactionReference.trim() ||
              !confirmed ||
              isSubmitting
            }
          >
            {isSubmitting ? (
              <>
                <IconLoader2 className="mr-2 h-4 w-4 animate-spin" />
                Confirming...
              </>
            ) : (
              "Confirm Payment"
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
