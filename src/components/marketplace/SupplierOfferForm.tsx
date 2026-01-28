import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  IconLoader2,
  IconSend,
  IconPackage,
} from "@tabler/icons-react";
import { useAuth } from "@/contexts/AuthContext";
import { getInventory } from "@/services/aggregationService";
import type { SourcingRequest, SupplierOffer, QualityGrade } from "@/types/marketplace";
import type { InventoryItem, AggregationCenter } from "@/types/aggregation";

// Extended InventoryItem type that includes center information from API
interface InventoryItemWithCenter extends InventoryItem {
  center?: AggregationCenter;
}

interface SupplierOfferFormProps {
  sourcingRequest: SourcingRequest;
  onSubmit: (offer: Partial<SupplierOffer>) => Promise<void>;
  onCancel: () => void;
}

interface SupplierOfferModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  sourcingRequest: SourcingRequest;
  onSubmit: (offer: Partial<SupplierOffer>) => Promise<void>;
}

export function SupplierOfferForm({ sourcingRequest, onSubmit, onCancel }: SupplierOfferFormProps) {
  const { user } = useAuth();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isLoadingBatches, setIsLoadingBatches] = useState(false);
  const [availableBatches, setAvailableBatches] = useState<InventoryItemWithCenter[]>([]);

  // Form state
  const [quantity, setQuantity] = useState("");
  const [quantityUnit, setQuantityUnit] = useState<"kg" | "tons" | "units">(sourcingRequest.unit || "kg");
  const [pricePerKg, setPricePerKg] = useState("");
  const [qualityGrade, setQualityGrade] = useState<QualityGrade>("A");
  const [selectedBatchId, setSelectedBatchId] = useState<string>("");
  const [notes, setNotes] = useState("");

  // Helper function to convert quantity to kg based on unit
  const convertToKg = (qty: number, unit: "kg" | "tons" | "units"): number => {
    if (unit === "tons") {
      return qty * 1000;
    } else if (unit === "units") {
      // Assume 1 unit = 50kg for bags (common for sweet potatoes)
      return qty * 50;
    }
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

  // Reset quantity when batch selection changes
  useEffect(() => {
    if (selectedBatchId) {
      // Optionally, you could autofill with the batch quantity here
      // For now, we just clear it to force user to enter manually
      // setQuantity(selectedBatch?.quantity.toString() || "");
    } else {
      // Clear quantity when no batch is selected
      // setQuantity("");
    }
  }, [selectedBatchId]);

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

    // Validate batch selection is mandatory
    if (!selectedBatchId || !selectedBatch) {
      setError("Please select a batch. Batch selection is required to submit an offer.");
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

    // Check if quantity exceeds request requirement
    const reqQuantity = sourcingRequest.total;
    const reqUnit = sourcingRequest.unit;
    
    // Convert request quantity to kg for comparison
    const reqQtyInKg = convertToKg(reqQuantity, reqUnit);

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
        batchId: selectedBatchId,
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
        const quantityInKg = convertToKg(parseFloat(quantity), quantityUnit);
        return (quantityInKg * parseFloat(pricePerKg)).toLocaleString();
      })()
    : "0";

  return (
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
                        Your offer: {convertToKg(parseFloat(quantity), quantityUnit).toLocaleString()} kg
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
  );
}

/**
 * Supplier Offer Modal Component
 * A standalone modal that wraps the SupplierOfferForm
 */
export function SupplierOfferModal({
  open,
  onOpenChange,
  sourcingRequest,
  onSubmit,
}: SupplierOfferModalProps) {
  const handleSubmit = async (offer: Partial<SupplierOffer>) => {
    try {
      await onSubmit(offer);
      onOpenChange(false);
    } catch (error) {
      // Error handling is done in the parent component
      // Re-throw to let the form handle the error display
      throw error;
    }
  };

  const handleCancel = () => {
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Submit Offer</DialogTitle>
          <DialogDescription>
            Provide your offer details for Sourcing Request: {sourcingRequest.title}
          </DialogDescription>
        </DialogHeader>
        <SupplierOfferForm
          sourcingRequest={sourcingRequest}
          onSubmit={handleSubmit}
          onCancel={handleCancel}
        />
      </DialogContent>
    </Dialog>
  );
}
