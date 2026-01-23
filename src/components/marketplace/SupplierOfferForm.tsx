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
  IconPackage,
} from "@tabler/icons-react";
import type { SourcingRequest, SupplierOffer, QualityGrade } from "@/types/marketplace";

interface SupplierOfferFormProps {
  sourcingRequest: SourcingRequest;
  onSubmit: (offer: Partial<SupplierOffer>) => Promise<void>;
  onCancel: () => void;
}

export function SupplierOfferForm({ sourcingRequest, onSubmit, onCancel }: SupplierOfferFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Form state
  const [quantity, setQuantity] = useState("");
  const [quantityUnit, setQuantityUnit] = useState<"kg" | "tons" | "units">(sourcingRequest.unit || "kg");
  const [pricePerKg, setPricePerKg] = useState("");
  const [qualityGrade, setQualityGrade] = useState<QualityGrade>("A");
  const [batchId, setBatchId] = useState("");
  const [notes, setNotes] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!quantity || !pricePerKg) {
      setError("Please fill in quantity and price");
      return;
    }

    const qty = parseFloat(quantity);
    const price = parseFloat(pricePerKg);

    if (qty <= 0 || price <= 0) {
      setError("Quantity and price must be greater than 0");
      return;
    }

    // Check if quantity exceeds request requirement
    const reqQuantity = sourcingRequest.total;
    const reqUnit = sourcingRequest.unit;
    
    // Convert offer quantity to kg for comparison
    let qtyInKg = qty;
    if (quantityUnit === "tons") {
      qtyInKg = qty * 1000;
    } else if (quantityUnit === "units") {
      // Assume 1 unit = 50kg for bags (common for sweet potatoes)
      qtyInKg = qty * 50;
    }
    
    // Convert request quantity to kg for comparison
    let reqQtyInKg = reqQuantity;
    if (reqUnit === "tons") {
      reqQtyInKg = reqQuantity * 1000;
    } else if (reqUnit === "units") {
      // Assume 1 unit = 50kg for bags (common for sweet potatoes)
      reqQtyInKg = reqQuantity * 50;
    }

    if (qtyInKg > reqQtyInKg) {
      setError(`Quantity cannot exceed request requirement (${reqQuantity} ${reqUnit})`);
      return;
    }

    // Check price range if specified
    if (sourcingRequest.priceRange) {
      if (price < sourcingRequest.priceRange.min || price > sourcingRequest.priceRange.max) {
        setError(`Price must be between KES ${sourcingRequest.priceRange.min} and ${sourcingRequest.priceRange.max} per kg`);
        return;
      }
    }

    setIsSubmitting(true);
    try {
      const offer: Partial<SupplierOffer> = {
        quantity: qty,
        quantityUnit,
        pricePerKg: price,
        grade: qualityGrade,
        batchId: batchId || undefined,
        status: "pending",
      };

      await onSubmit(offer);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to submit offer");
    } finally {
      setIsSubmitting(false);
    }
  };

  const totalAmount = quantity && pricePerKg
    ? (() => {
        // Convert offer quantity to kg for calculation
        let quantityInKg = parseFloat(quantity);
        if (quantityUnit === "tons") {
          quantityInKg = parseFloat(quantity) * 1000;
        } else if (quantityUnit === "units") {
          // Assume 1 unit = 50kg for bags (common for sweet potatoes)
          quantityInKg = parseFloat(quantity) * 50;
        }
        return (quantityInKg * parseFloat(pricePerKg)).toLocaleString();
      })()
    : "0";

  return (
    <Card className="border-primary">
      <CardHeader>
        <CardTitle>Submit Offer</CardTitle>
        <CardDescription>
          Provide your offer details for Sourcing Request: {sourcingRequest.title}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <div className="p-3 bg-destructive/10 border border-destructive/20 rounded-lg text-sm text-destructive">
              {error}
            </div>
          )}

          {/* Request Summary */}
          <div className="p-3 bg-muted rounded-lg">
            <p className="font-medium text-sm mb-1">{sourcingRequest.title}</p>
            <div className="text-xs text-muted-foreground space-y-0.5">
              <p>Required: {sourcingRequest.total} {sourcingRequest.unit}</p>
              {sourcingRequest.priceRange && (
                <p>Price Range: KES {sourcingRequest.priceRange.min} - {sourcingRequest.priceRange.max}/{sourcingRequest.priceUnit}</p>
              )}
              <p>Deadline: {new Date(sourcingRequest.deadline).toLocaleDateString()}</p>
            </div>
          </div>

          {/* Offer Details */}
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

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="pricePerKg">Price per kg (KES) *</Label>
              <Input
                id="pricePerKg"
                type="number"
                value={pricePerKg}
                onChange={(e) => setPricePerKg(e.target.value)}
                placeholder="0"
                min={0}
                step={0.1}
                required
              />
              {sourcingRequest.priceRange && (
                <p className="text-xs text-muted-foreground">
                  Suggested range: KES {sourcingRequest.priceRange.min} - {sourcingRequest.priceRange.max}
                </p>
              )}
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

          <div className="space-y-2">
            <Label htmlFor="batchId">Batch ID (Optional)</Label>
            <Input
              id="batchId"
              value={batchId}
              onChange={(e) => setBatchId(e.target.value)}
              placeholder="e.g., BATCH-2024-001"
            />
            <p className="text-xs text-muted-foreground">
              Provide batch ID for traceability if available
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="notes">Additional Notes (Optional)</Label>
            <Textarea
              id="notes"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Any additional information about your offer..."
              rows={3}
            />
          </div>

          {/* Total Calculation */}
          {quantity && pricePerKg && (
            <div className="p-3 bg-primary/5 border border-primary/20 rounded-lg">
              <div className="flex justify-between items-center">
                <span className="font-medium">Total Offer Amount:</span>
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
                  Submit Offer
                </>
              )}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
