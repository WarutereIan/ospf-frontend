import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
// Checkbox will be implemented as a simple input[type="checkbox"]
import {
  IconLoader2,
  IconCarrot,
  IconPackage,
  IconSeeding,
} from "@tabler/icons-react";
import type { RFQ, SourcingProductType, RecurringFrequency, OFSPVariety, QualityGrade } from "@/types/marketplace";

interface RFQFormProps {
  rfq?: RFQ; // If provided, edit mode
  onSubmit: (rfq: Partial<RFQ>) => Promise<void>;
  onCancel: () => void;
}

export function RFQForm({ rfq, onSubmit, onCancel }: RFQFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Form state
  const [title, setTitle] = useState(rfq?.title || "");
  const [productType, setProductType] = useState<SourcingProductType | "">(rfq?.productType || "");
  const [variety, setVariety] = useState<OFSPVariety | "">(rfq?.variety || "");
  const [quantity, setQuantity] = useState(rfq?.total?.toString() || "");
  const [quantityUnit, setQuantityUnit] = useState<"kg" | "tons" | "units">(rfq?.unit || "kg");
  const [qualityGrade, setQualityGrade] = useState<QualityGrade | "">(rfq?.qualityGrade || "");
  const [priceMin, setPriceMin] = useState(rfq?.priceRange?.min?.toString() || "");
  const [priceMax, setPriceMax] = useState(rfq?.priceRange?.max?.toString() || "");
  const [deadline, setDeadline] = useState(rfq?.deadline || "");
  const [quoteDeadline, setQuoteDeadline] = useState(rfq?.quoteDeadline || "");
  const [evaluationDeadline, setEvaluationDeadline] = useState(rfq?.evaluationDeadline || "");
  const [deliveryRegion, setDeliveryRegion] = useState(rfq?.deliveryRegion || "");
  const [additionalRequirements, setAdditionalRequirements] = useState(rfq?.additionalRequirements || "");
  const [termsAndConditions, setTermsAndConditions] = useState(rfq?.termsAndConditions || "");
  const [evaluationCriteria, setEvaluationCriteria] = useState(rfq?.evaluationCriteria || "");
  const [isRecurring, setIsRecurring] = useState(rfq?.isRecurring || false);
  const [recurringFrequency, setRecurringFrequency] = useState<RecurringFrequency>(rfq?.recurringFrequency || "weekly");
  const [recurringEndDate, setRecurringEndDate] = useState(rfq?.recurringEndDate || "");

  const handleSubmit = async (e: React.FormEvent, saveAsDraft: boolean = false) => {
    e.preventDefault();
    setError(null);

    if (!saveAsDraft) {
      if (!title || !productType || !quantity || !deadline || !quoteDeadline) {
        setError("Please fill in all required fields");
        return;
      }
    }

    setIsSubmitting(true);
    try {
      const rfqData: Partial<RFQ> = {
        title,
        productType: productType as SourcingProductType,
        variety: variety ? (variety as OFSPVariety) : undefined,
        total: parseFloat(quantity) || 0,
        unit: quantityUnit,
        qualityGrade: qualityGrade ? (qualityGrade as QualityGrade) : undefined,
        priceRange: priceMin && priceMax
          ? { min: parseFloat(priceMin), max: parseFloat(priceMax) }
          : undefined,
        priceUnit: "kg",
        deadline,
        quoteDeadline,
        evaluationDeadline: evaluationDeadline || undefined,
        deliveryRegion: deliveryRegion || undefined,
        additionalRequirements: additionalRequirements || undefined,
        termsAndConditions: termsAndConditions || undefined,
        evaluationCriteria: evaluationCriteria || undefined,
        isRecurring,
        recurringFrequency: isRecurring ? recurringFrequency : undefined,
        recurringEndDate: isRecurring ? recurringEndDate : undefined,
        status: saveAsDraft ? "draft" : "open",
        rfqStatus: saveAsDraft ? "draft" : "published",
        fulfilled: 0,
      };

      await onSubmit(rfqData);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to save RFQ");
    } finally {
      setIsSubmitting(false);
    }
  };

  const getProductIcon = (type: SourcingProductType) => {
    switch (type) {
      case "fresh_roots":
        return <IconCarrot className="h-5 w-5 text-orange-600" />;
      case "process_grade":
        return <IconPackage className="h-5 w-5 text-blue-600" />;
      case "planting_vines":
        return <IconSeeding className="h-5 w-5 text-green-600" />;
    }
  };

  return (
    <form onSubmit={(e) => handleSubmit(e, false)} className="space-y-6">
      {error && (
        <div className="p-3 bg-destructive/10 border border-destructive/20 rounded-lg text-sm text-destructive">
          {error}
        </div>
      )}

      {/* Basic Information */}
      <Card>
        <CardHeader>
          <CardTitle>Basic Information</CardTitle>
          <CardDescription>Provide details about what you're sourcing</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="title">RFQ Title *</Label>
            <Input
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g., Fresh OFSP Roots - Bulk Purchase"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="productType">Product Type *</Label>
            <Select value={productType} onValueChange={(value) => setProductType(value as SourcingProductType)}>
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Select product type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="fresh_roots">
                  <div className="flex items-center gap-2">
                    <IconCarrot className="h-4 w-4 text-orange-600" />
                    Fresh OFSP Roots
                  </div>
                </SelectItem>
                <SelectItem value="process_grade">
                  <div className="flex items-center gap-2">
                    <IconPackage className="h-4 w-4 text-blue-600" />
                    Process Grade (Flour)
                  </div>
                </SelectItem>
                <SelectItem value="planting_vines">
                  <div className="flex items-center gap-2">
                    <IconSeeding className="h-4 w-4 text-green-600" />
                    Planting Vines
                  </div>
                </SelectItem>
              </SelectContent>
            </Select>
          </div>

          {productType === "fresh_roots" && (
            <div className="space-y-2">
              <Label htmlFor="variety">OFSP Variety</Label>
              <Select value={variety} onValueChange={(value) => setVariety(value as OFSPVariety)}>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Select variety (optional)" />
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
          )}

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="quantity">Quantity *</Label>
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
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Select unit" />
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
            <Label htmlFor="qualityGrade">Quality Grade</Label>
            <Select value={qualityGrade} onValueChange={(value) => setQualityGrade(value as QualityGrade)}>
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Select quality grade (optional)" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="A">Grade A</SelectItem>
                <SelectItem value="B">Grade B</SelectItem>
                <SelectItem value="C">Grade C</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Pricing & Deadlines */}
      <Card>
        <CardHeader>
          <CardTitle>Pricing & Deadlines</CardTitle>
          <CardDescription>Set price expectations and timeline</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="priceMin">Min Price (KES/kg)</Label>
              <Input
                id="priceMin"
                type="number"
                value={priceMin}
                onChange={(e) => setPriceMin(e.target.value)}
                placeholder="0"
                min={0}
                step={0.1}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="priceMax">Max Price (KES/kg)</Label>
              <Input
                id="priceMax"
                type="number"
                value={priceMax}
                onChange={(e) => setPriceMax(e.target.value)}
                placeholder="0"
                min={0}
                step={0.1}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="deadline">Delivery Deadline *</Label>
            <Input
              id="deadline"
              type="date"
              value={deadline}
              onChange={(e) => setDeadline(e.target.value)}
              min={new Date().toISOString().split("T")[0]}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="quoteDeadline">Quote Submission Deadline *</Label>
            <Input
              id="quoteDeadline"
              type="date"
              value={quoteDeadline}
              onChange={(e) => setQuoteDeadline(e.target.value)}
              min={new Date().toISOString().split("T")[0]}
              max={deadline || undefined}
              required
            />
            <p className="text-xs text-muted-foreground">
              Suppliers must submit quotes before this date
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="evaluationDeadline">Evaluation Deadline</Label>
            <Input
              id="evaluationDeadline"
              type="date"
              value={evaluationDeadline}
              onChange={(e) => setEvaluationDeadline(e.target.value)}
              min={quoteDeadline || new Date().toISOString().split("T")[0]}
            />
            <p className="text-xs text-muted-foreground">
              When you plan to complete quote evaluation (optional)
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Delivery & Requirements */}
      <Card>
        <CardHeader>
          <CardTitle>Delivery & Requirements</CardTitle>
          <CardDescription>Specify delivery location and additional requirements</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="deliveryRegion">Delivery Region</Label>
            <Input
              id="deliveryRegion"
              value={deliveryRegion}
              onChange={(e) => setDeliveryRegion(e.target.value)}
              placeholder="e.g., Nairobi, Machakos"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="additionalRequirements">Additional Requirements</Label>
            <Textarea
              id="additionalRequirements"
              value={additionalRequirements}
              onChange={(e) => setAdditionalRequirements(e.target.value)}
              placeholder="Any special requirements, certifications, or specifications..."
              rows={4}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="termsAndConditions">Terms and Conditions</Label>
            <Textarea
              id="termsAndConditions"
              value={termsAndConditions}
              onChange={(e) => setTermsAndConditions(e.target.value)}
              placeholder="Payment terms, delivery terms, etc."
              rows={3}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="evaluationCriteria">Evaluation Criteria</Label>
            <Textarea
              id="evaluationCriteria"
              value={evaluationCriteria}
              onChange={(e) => setEvaluationCriteria(e.target.value)}
              placeholder="e.g., Price (40%), Quality (30%), Delivery Time (30%)"
              rows={2}
            />
            <p className="text-xs text-muted-foreground">
              How quotes will be evaluated (optional but recommended)
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Recurring Options */}
      <Card>
        <CardHeader>
          <CardTitle>Recurring Options</CardTitle>
          <CardDescription>Set up recurring RFQ if needed</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center space-x-2">
            <input
              type="checkbox"
              id="isRecurring"
              checked={isRecurring}
              onChange={(e) => setIsRecurring(e.target.checked)}
              className="h-4 w-4 rounded border-gray-300"
            />
            <Label htmlFor="isRecurring" className="cursor-pointer">
              This is a recurring RFQ
            </Label>
          </div>

          {isRecurring && (
            <>
              <div className="space-y-2">
                <Label htmlFor="recurringFrequency">Frequency</Label>
                <Select value={recurringFrequency} onValueChange={(value) => setRecurringFrequency(value as RecurringFrequency)}>
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Select frequency" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="weekly">Weekly</SelectItem>
                    <SelectItem value="biweekly">Bi-weekly</SelectItem>
                    <SelectItem value="monthly">Monthly</SelectItem>
                    <SelectItem value="quarterly">Quarterly</SelectItem>
                    <SelectItem value="custom">Custom</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="recurringEndDate">End Date</Label>
                <Input
                  id="recurringEndDate"
                  type="date"
                  value={recurringEndDate}
                  onChange={(e) => setRecurringEndDate(e.target.value)}
                  min={deadline || new Date().toISOString().split("T")[0]}
                />
              </div>
            </>
          )}
        </CardContent>
      </Card>

      {/* Actions */}
      <div className="flex justify-end gap-3">
        <Button type="button" variant="outline" onClick={onCancel} disabled={isSubmitting}>
          Cancel
        </Button>
        <Button
          type="button"
          variant="outline"
          onClick={(e) => handleSubmit(e, true)}
          disabled={isSubmitting}
        >
          {isSubmitting ? (
            <>
              <IconLoader2 className="mr-2 h-4 w-4 animate-spin" />
              Saving...
            </>
          ) : (
            "Save as Draft"
          )}
        </Button>
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? (
            <>
              <IconLoader2 className="mr-2 h-4 w-4 animate-spin" />
              {rfq ? "Updating..." : "Creating..."}
            </>
          ) : (
            rfq ? "Update RFQ" : "Create RFQ"
          )}
        </Button>
      </div>
    </form>
  );
}
