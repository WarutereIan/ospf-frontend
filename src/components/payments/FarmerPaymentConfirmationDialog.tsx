import { useState } from "react";
import { Button } from "@/components/ui/button";
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
  IconLoader2,
  IconAlertCircle,
  IconCheck,
  IconCurrency,
  IconReceipt,
} from "@tabler/icons-react";
import { showSuccess, showError, formatApiError } from "@/lib/toast";
import { apiPost } from "@/lib/api-client";

interface FarmerPaymentConfirmationDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  orderId: string;
  orderNumber: string;
  paymentAmount: number;
  paymentMethod?: string;
  transactionReference?: string;
  paymentEvidence?: string;
  onPaymentConfirmed?: () => void;
}

export function FarmerPaymentConfirmationDialog({
  open,
  onOpenChange,
  orderId,
  orderNumber,
  paymentAmount,
  paymentMethod,
  transactionReference,
  paymentEvidence,
  onPaymentConfirmed,
}: FarmerPaymentConfirmationDialogProps) {
  const [confirmationNotes, setConfirmationNotes] = useState("");
  const [confirmed, setConfirmed] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async () => {
    // Validation
    if (!confirmed) {
      showError("Confirmation required", "Please confirm that you have received the payment");
      return;
    }

    setIsSubmitting(true);

    try {
      // Call API to confirm payment by farmer
      await apiPost(
        `/payments/orders/${orderId}/confirm-by-farmer`,
        {
          confirmationNotes: confirmationNotes.trim() || undefined,
          confirmed: true,
        }
      );

      showSuccess(
        "Payment confirmed",
        `Payment confirmation recorded for order #${orderNumber}. You can now proceed with fulfillment`
      );

      // Reset form
      setConfirmationNotes("");
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
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Confirm Payment Received</DialogTitle>
          <DialogDescription>
            Confirm receipt of payment for Order #{orderNumber}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Payment Details Summary */}
          <div className="border rounded-lg p-4 bg-muted/50 space-y-3">
            <div className="flex items-center gap-2 text-sm font-semibold text-muted-foreground mb-3">
              <IconCurrency className="h-4 w-4" />
              Payment Details
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-xs text-muted-foreground mb-1">Payment Amount</p>
                <p className="text-lg font-bold">KES {paymentAmount.toLocaleString()}</p>
              </div>
              
              {paymentMethod && (
                <div>
                  <p className="text-xs text-muted-foreground mb-1">Payment Method</p>
                  <p className="font-medium">
                    {paymentMethod === "MPESA" ? "M-PESA" : 
                     paymentMethod === "BANK_TRANSFER" ? "Bank Transfer" :
                     paymentMethod === "CASH" ? "Cash" :
                     paymentMethod === "CREDIT" ? "Credit" :
                     paymentMethod.replace(/_/g, " ")}
                  </p>
                </div>
              )}
            </div>

            {transactionReference && (
              <div>
                <p className="text-xs text-muted-foreground mb-1">Transaction Reference</p>
                <p className="font-mono text-sm">{transactionReference}</p>
              </div>
            )}

            {paymentEvidence && (
              <div>
                <p className="text-xs text-muted-foreground mb-2 flex items-center gap-1">
                  <IconReceipt className="h-3 w-3" />
                  Payment Evidence
                </p>
                <img
                  src={paymentEvidence}
                  alt="Payment evidence"
                  className="max-h-48 rounded border"
                />
              </div>
            )}
          </div>

          {/* Confirmation Notes */}
          <div className="space-y-2">
            <Label htmlFor="confirmationNotes">Confirmation Notes (Optional)</Label>
            <Textarea
              id="confirmationNotes"
              placeholder="Add any notes about payment receipt..."
              value={confirmationNotes}
              onChange={(e) => setConfirmationNotes(e.target.value)}
              rows={3}
              disabled={isSubmitting}
            />
            <p className="text-xs text-muted-foreground">
              Optional: Add any notes about how you received the payment
            </p>
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
              I confirm that I have received the payment for this order
            </Label>
          </div>

          {/* Info Message */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <div className="flex items-start gap-2">
              <IconAlertCircle className="h-5 w-5 text-blue-600 mt-0.5" />
              <div className="text-sm text-blue-800">
                <p className="font-medium mb-1">Payment Confirmation</p>
                <p>
                  By confirming payment receipt, you acknowledge that you have received the payment.
                  The order will proceed to fulfillment once confirmed.
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
            disabled={!confirmed || isSubmitting}
            className="bg-green-600 hover:bg-green-700"
          >
            {isSubmitting ? (
              <>
                <IconLoader2 className="mr-2 h-4 w-4 animate-spin" />
                Confirming...
              </>
            ) : (
              <>
                <IconCheck className="mr-2 h-4 w-4" />
                Confirm Payment Received
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
