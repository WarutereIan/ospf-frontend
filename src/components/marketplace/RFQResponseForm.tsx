import { useState, useEffect } from "react";
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
import { useAuth } from "@/contexts/AuthContext";
import { useCatalog } from "@/contexts/CatalogContext";
import { getInventory } from "@/services/aggregationService";
import type { RFQ, RFQResponse, QualityGrade, OFSPVariety } from "@/types/marketplace";
import type { InventoryItem, AggregationCenter } from "@/types/aggregation";

// Extended InventoryItem type that includes center information from API
interface InventoryItemWithCenter extends InventoryItem {
  center?: AggregationCenter;
}

interface RFQResponseFormProps {
  rfq: RFQ;
  onSubmit: (response: Partial<RFQResponse>) => Promise<void>;
  onCancel: () => void;
}

export function RFQResponseForm({ rfq, onSubmit, onCancel }: RFQResponseFormProps) {
  const { user } = useAuth();
  const { varieties: availableVarieties, qualityGrades: availableQualityGrades, productTypes, getQuantityTypes } = useCatalog();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isLoadingBatches, setIsLoadingBatches] = useState(false);
  const [availableBatches, setAvailableBatches] = useState<InventoryItemWithCenter[]>([]);

  // Form state
  const [quantity, setQuantity] = useState("");
  const [quantityUnit, setQuantityUnit] = useState<string>(rfq.unit || "kg");
  const [pricePerUnit, setPricePerUnit] = useState("");
  const [variety, setVariety] = useState<OFSPVariety | "">(rfq.variety || "");
  const [qualityGrade, setQualityGrade] = useState<QualityGrade>(rfq.qualityGrade || "A");
  const [selectedBatchId, setSelectedBatchId] = useState<string>("");
  const [deliveryTime, setDeliveryTime] = useState("");
  const [paymentTerms, setPaymentTerms] = useState("");
  const [notes, setNotes] = useState("");

  // Helper function to convert quantity to kg based on unit
  const convertToKg = (qty: number, unit: string): number => {
    const u = (unit || "kg").toLowerCase();
    if (u === "tons") return qty * 1000;
    if (u === "units" || u === "bags") return qty * 50; // Assume 1 unit/bag = 50kg
    if (u === "bundles") return qty * 25; // Estimate for planting vines
    return qty;
  };

  // Get selected batch details
  const selectedBatch = availableBatches.find(batch => batch.batchId === selectedBatchId);

  // Fetch batches when quality grade changes
  useEffect(() => {
    const fetchBatches = async () => {
      if (!user?.id) return;
      
      setIsLoadingBatches(true);
      // Reset selected batch and quantity when quality grade changes
      setSelectedBatchId("");
      setQuantity("");
      
      try {
        const batches = await getInventory({
          farmerId: user.id,
          qualityGrade: qualityGrade,
        });
        // Filter to only include batches that have batchId (checked in at aggregation centers)
        // Type assertion needed because API returns center data but TypeScript interface doesn't include it
        const validBatches = (batches as InventoryItemWithCenter[]).filter(batch => batch.batchId);
        setAvailableBatches(validBatches);
      } catch (error) {
        console.error("Failed to fetch batches:", error);
        setAvailableBatches([]);
      } finally {
        setIsLoadingBatches(false);
      }
    };

    fetchBatches();
  }, [user?.id, qualityGrade]);

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

    // Validate batch selection is mandatory
    if (!selectedBatchId || !selectedBatch) {
      setError("Please select a batch. Batch selection is required to submit a quote.");
      return;
    }

    // Convert offer quantity to kg for comparison
    const qtyInKg = convertToKg(qty, quantityUnit);

    // Validate against selected batch quantity
    const batchQuantityKg = selectedBatch.quantity; // Already in kg
    if (qtyInKg > batchQuantityKg) {
      setError(
        `Quantity cannot exceed available batch quantity. Available: ${batchQuantityKg.toLocaleString()} kg (${selectedBatch.batchId})`
      );
      return;
    }

    // Check if quantity exceeds RFQ requirement
    const rfqQuantity = rfq.total;
    const rfqUnit = rfq.unit;
    const rfqQtyInKg = convertToKg(rfqQuantity, rfqUnit);

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
        batchId: selectedBatchId,
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
              {selectedBatch && quantity && (
                <p className={`text-xs ${convertToKg(parseFloat(quantity), quantityUnit) > selectedBatch.quantity ? "text-destructive" : "text-muted-foreground"}`}>
                  {convertToKg(parseFloat(quantity), quantityUnit) > selectedBatch.quantity
                    ? `⚠️ Exceeds available batch quantity (${selectedBatch.quantity.toLocaleString()} kg)`
                    : `✓ Within available batch quantity (${selectedBatch.quantity.toLocaleString()} kg)`}
                </p>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="quantityUnit">Unit *</Label>
              <Select value={quantityUnit} onValueChange={(value) => setQuantityUnit(value)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {getQuantityTypes(productTypes.find((p) => p.code.toLowerCase() === rfq.productType)?.code ?? "FRESH_ROOTS").map((qt) => (
                    <SelectItem key={qt.id} value={qt.code}>
                      {qt.label}
                    </SelectItem>
                  ))}
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
                    {availableVarieties.map((v) => (
                      <SelectItem key={v.code} value={v.code}>
                        {v.label}
                      </SelectItem>
                    ))}
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
                    {availableQualityGrades.map((g) => (
                      <SelectItem key={g.code} value={g.code}>
                        {g.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          )}

          <div className="space-y-2">
            <Label htmlFor="batchId">Select Batch *</Label>
            <p className="text-xs text-muted-foreground mb-2">
              Select a batch that has been checked in at aggregation centers. Batch selection is required. Only batches matching Grade {qualityGrade} are shown.
            </p>
            {isLoadingBatches ? (
              <div className="flex items-center justify-center py-4 border rounded-lg">
                <IconLoader2 className="h-4 w-4 animate-spin text-muted-foreground" />
                <span className="ml-2 text-sm text-muted-foreground">Loading batches...</span>
              </div>
            ) : availableBatches.length > 0 ? (
              <>
                <div className="w-full">
                  <Select value={selectedBatchId} onValueChange={setSelectedBatchId}>
                    <SelectTrigger className="!w-full">
                      <SelectValue>
                        {selectedBatchId 
                          ? `${selectedBatch?.batchId || "Selected"} - ${selectedBatch?.quantity.toLocaleString() || 0} kg available`
                          : "Select a batch"}
                      </SelectValue>
                    </SelectTrigger>
                    <SelectContent 
                      className="min-w-[var(--radix-select-trigger-width)] max-w-[calc(100vw-4rem)]"
                      alignItemWithTrigger={true}
                    >
                      {availableBatches.map((batch) => (
                        <SelectItem key={batch.batchId} value={batch.batchId || ""}>
                          <div className="flex flex-col w-full min-w-0 pr-4">
                            <span className="font-mono text-sm break-words">{batch.batchId}</span>
                            <span className="text-xs text-muted-foreground break-words">
                              Available: {batch.quantity.toLocaleString()} kg • {batch.variety}
                              {batch.center && ` • ${batch.center.name} (${batch.center.location})`}
                            </span>
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                {selectedBatch && (
                  <div className="p-2 bg-muted rounded-lg text-xs">
                    <p className="font-medium text-foreground mb-1">Selected Batch Information:</p>
                    <p className="text-muted-foreground">
                      Batch ID: <span className="font-mono">{selectedBatch.batchId}</span>
                    </p>
                    <p className="text-muted-foreground">
                      Available Quantity: <span className="font-semibold text-foreground">{selectedBatch.quantity.toLocaleString()} kg</span>
                    </p>
                    <p className="text-muted-foreground">
                      Variety: {selectedBatch.variety}
                    </p>
                    {selectedBatch.center && (
                      <p className="text-muted-foreground">
                        Aggregation Center: <span className="font-semibold text-foreground">{selectedBatch.center.name}</span> • {selectedBatch.center.location}
                      </p>
                    )}
                    {quantity && (
                      <p className={`mt-1 ${convertToKg(parseFloat(quantity), quantityUnit) > selectedBatch.quantity ? "text-destructive font-semibold" : "text-muted-foreground"}`}>
                        Your quote: {convertToKg(parseFloat(quantity), quantityUnit).toLocaleString()} kg
                        {convertToKg(parseFloat(quantity), quantityUnit) > selectedBatch.quantity && " (exceeds available)"}
                      </p>
                    )}
                  </div>
                )}
              </>
            ) : (
              <div className="border rounded-lg p-4 text-center">
                <p className="text-sm text-muted-foreground">
                  No batches available for Grade {qualityGrade} that have been checked in at aggregation centers.
                </p>
              </div>
            )}
          </div>

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
