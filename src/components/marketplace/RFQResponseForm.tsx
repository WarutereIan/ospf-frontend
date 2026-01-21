import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  IconLoader2,
  IconSend,
} from "@tabler/icons-react";
import type { RFQ, RFQResponse, QualityGrade, OFSPVariety } from "@/types/marketplace";

interface RFQResponseFormProps {
  rfq: RFQ;
  onSubmit: (response: Partial<RFQResponse>) => Promise<void>;
  onCancel: () => void;
}

export function RFQResponseForm({ rfq, onSubmit, onCancel }: RFQResponseFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Form state
  const [quantity, setQuantity] = useState("");
  const [quantityUnit, setQuantityUnit] = useState<"kg" | "tons" | "units">(rfq.unit || "kg");
  const [pricePerUnit, setPricePerUnit] = useState("");
  const [variety, setVariety] = useState<OFSPVariety | "">(rfq.variety || "");
  const [qualityGrade, setQualityGrade] = useState<QualityGrade>(rfq.qualityGrade || "A");
  const [deliveryTime, setDeliveryTime] = useState("");
  const [paymentTerms, setPaymentTerms] = useState("");
  const [notes, setNotes] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!quantity || !pricePerUnit) {
      setError("Please fill in quantity and price");
      return;
    }

    const qty = parseFloat(quantity);
    const price = parseFloat(pricePerUnit);

    if (qty <= 0 || price <= 0) {
      setError("Quantity and price must be greater than 0");
      return;
    }

    // Check if quantity exceeds RFQ requirement
    const rfqQuantity = rfq.total;
    const rfqUnit = rfq.unit;
    // Simple conversion (can be enhanced)
    const qtyInKg = quantityUnit === "tons" ? qty * 1000 : qty;
    const rfqQtyInKg = rfqUnit === "tons" ? rfqQuantity * 1000 : rfqQuantity;

    if (qtyInKg > rfqQtyInKg) {
      setError(`Quantity cannot exceed RFQ requirement (${rfqQuantity} ${rfqUnit})`);
      return;
    }

    setIsSubmitting(true);
    try {
      const response: Partial<RFQResponse> = {
        quantity: qty,
        quantityUnit,
        pricePerUnit: price,
        priceUnit: rfq.priceUnit || "kg",
        totalAmount: qty * price,
        variety: variety || undefined,
        qualityGrade,
        deliveryTime: deliveryTime || undefined,
        paymentTerms: paymentTerms || undefined,
        notes: notes || undefined,
        status: "submitted",
      };

      await onSubmit(response);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to submit quote");
    } finally {
      setIsSubmitting(false);
    }
  };

  const totalAmount = quantity && pricePerUnit
    ? (parseFloat(quantity) * parseFloat(pricePerUnit)).toLocaleString()
    : "0";

  return (
    <Card className="border-primary">
      <CardHeader>
        <CardTitle>Submit Quote</CardTitle>
        <CardDescription>
          Provide your quote details for RFQ #{rfq.rfqNumber || rfq.requestId}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <div className="p-3 bg-destructive/10 border border-destructive/20 rounded-lg text-sm text-destructive">
              {error}
            </div>
          )}

          {/* RFQ Summary */}
          <div className="p-3 bg-muted rounded-lg">
            <p className="font-medium text-sm mb-1">{rfq.title}</p>
            <div className="text-xs text-muted-foreground space-y-0.5">
              <p>Required: {rfq.total} {rfq.unit}</p>
              {rfq.priceRange && (
                <p>Price Range: KES {rfq.priceRange.min} - {rfq.priceRange.max}/{rfq.priceUnit}</p>
              )}
              <p>Deadline: {new Date(rfq.quoteDeadline).toLocaleDateString()}</p>
            </div>
          </div>

          {/* Quote Details */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="quantity">Quantity Offered *</Label>
              <Input
                id="quantity"
                type="number"
                value={quantity}
                onChange={(e) => setQuantity(e.target.value)}
                placeholder="0"
                min={0}
                step={0.1}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="quantityUnit">Unit *</Label>
              <Select value={quantityUnit} onValueChange={(value) => setQuantityUnit(value as "kg" | "tons" | "units")}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="kg">Kilograms (kg)</SelectItem>
                  <SelectItem value="tons">Tons</SelectItem>
                  <SelectItem value="units">Units</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="pricePerUnit">Price per {rfq.priceUnit || "kg"} (KES) *</Label>
            <Input
              id="pricePerUnit"
              type="number"
              value={pricePerUnit}
              onChange={(e) => setPricePerUnit(e.target.value)}
              placeholder="0"
              min={0}
              step={0.1}
              required
            />
            {rfq.priceRange && (
              <p className="text-xs text-muted-foreground">
                Suggested range: KES {rfq.priceRange.min} - {rfq.priceRange.max}
              </p>
            )}
          </div>

          {rfq.productType === "fresh_roots" && (
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="variety">Variety</Label>
                <Select value={variety} onValueChange={(value) => setVariety(value as OFSPVariety)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Kenya">Kenya</SelectItem>
                    <SelectItem value="SPK004">SPK004</SelectItem>
                    <SelectItem value="Kakamega">Kakamega</SelectItem>
                    <SelectItem value="Kabode">Kabode</SelectItem>
                    <SelectItem value="Other">Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="qualityGrade">Quality Grade *</Label>
                <Select value={qualityGrade} onValueChange={(value) => setQualityGrade(value as QualityGrade)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="A">Grade A</SelectItem>
                    <SelectItem value="B">Grade B</SelectItem>
                    <SelectItem value="C">Grade C</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          )}

          <div className="space-y-2">
            <Label htmlFor="deliveryTime">Estimated Delivery Time</Label>
            <Input
              id="deliveryTime"
              value={deliveryTime}
              onChange={(e) => setDeliveryTime(e.target.value)}
              placeholder="e.g., 7 days, 2 weeks"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="paymentTerms">Payment Terms</Label>
            <Input
              id="paymentTerms"
              value={paymentTerms}
              onChange={(e) => setPaymentTerms(e.target.value)}
              placeholder="e.g., 50% advance, 50% on delivery"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="notes">Additional Notes</Label>
            <Textarea
              id="notes"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Any additional information about your quote..."
              rows={3}
            />
          </div>

          {/* Total Calculation */}
          {quantity && pricePerUnit && (
            <div className="p-3 bg-primary/5 border border-primary/20 rounded-lg">
              <div className="flex justify-between items-center">
                <span className="font-medium">Total Quote Amount:</span>
                <span className="text-lg font-bold text-primary">
                  KES {totalAmount}
                </span>
              </div>
            </div>
          )}

          {/* Actions */}
          <div className="flex justify-end gap-3 pt-4">
            <Button type="button" variant="outline" onClick={onCancel} disabled={isSubmitting}>
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? (
                <>
                  <IconLoader2 className="mr-2 h-4 w-4 animate-spin" />
                  Submitting...
                </>
              ) : (
                <>
                  <IconSend className="mr-2 h-4 w-4" />
                  Submit Quote
                </>
              )}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
