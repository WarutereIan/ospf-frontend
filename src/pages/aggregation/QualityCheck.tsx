import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  IconCheck,
  IconX,
  IconPhoto,
  IconLoader2,
  IconAlertTriangle,
  IconArrowLeft,
  IconInfoCircle,
} from "@tabler/icons-react";
import { cn } from "@/lib/utils";
import { useAggregation } from "@/contexts/AggregationContext";
import { useAuth } from "@/contexts/AuthContext";
import { GradingMatrixGuide } from "@/components/quality/GradingMatrixGuide";
import { calculateGradeFromMatrix } from "@/data/gradingMatrix";
import {
  weightRangeDefinitions,
  colorIntensityDefinitions,
  physicalConditionDefinitions,
  freshnessDefinitions,
} from "@/data/gradingMatrix";
import type { QualityCheck } from "@/types/aggregation";
import type { WeightRange, PhysicalCondition, FreshnessLevel } from "@/types/quality";
import { uploadImage, getImageFullUrl } from "@/services/uploadService";
import { useCatalog } from "@/contexts/CatalogContext";

interface QualityCheckForm {
  stockId: string;
  variety: string;
  quantity: number;
  qualityGrade: string | null;
  // Grading Matrix Criteria
  weightRange: WeightRange | "";
  colorIntensity: number; // 1-10
  physicalCondition: PhysicalCondition | "";
  freshness: FreshnessLevel | "";
  daysSinceHarvest?: number;
  photos: string[];
  notes: string;
  approved: boolean | null;
}

export function QualityCheck() {
  const { id } = useParams<{ id: string }>();
  const { recordQualityCheck, qualityChecks, fetchQualityChecks, inventory, fetchInventory, isLoading: aggregationLoading } = useAggregation();
  const { user } = useAuth();
  const { varieties, qualityGrades, getGradeColor } = useCatalog();
  const varietyOptions = varieties.map((v) => ({ value: v.code.toLowerCase(), label: v.label }));
  const gradeOptions = qualityGrades.map((g) => ({
    value: g.code,
    label: g.label,
    color: getGradeColor(g.code),
  }));

  const isNew = !id || id === "new";
  const [formData, setFormData] = useState<QualityCheckForm>({
    stockId: "",
    variety: "",
    quantity: 0,
    qualityGrade: null,
    weightRange: "",
    colorIntensity: 5,
    physicalCondition: "",
    freshness: "",
    daysSinceHarvest: 0,
    photos: [],
    notes: "",
    approved: null,
  });
  const [showMatrixGuide, setShowMatrixGuide] = useState(false);
  const [uploadingPhotos, setUploadingPhotos] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoading, setIsLoading] = useState(!isNew);

  // Fetch inventory on mount
  useEffect(() => {
    fetchInventory();
  }, [fetchInventory]);

  useEffect(() => {
    if (!isNew && id) {
      setIsLoading(true);
      // Find existing quality check
      const existingCheck = qualityChecks.find((qc) => qc.id === id);
      if (existingCheck) {
        setFormData({
          stockId: existingCheck.transactionId || "",
          variety: existingCheck.variety,
          quantity: existingCheck.quantity,
          qualityGrade: existingCheck.qualityGrade,
          weightRange: "", // Map from existing data if available
          colorIntensity: existingCheck.colorScore || 5,
          physicalCondition: "", // Map from existing data if available
          freshness: "", // Map from existing data if available
          daysSinceHarvest: 0,
          photos: existingCheck.photos || [],
          notes: existingCheck.notes || "",
          approved: existingCheck.qualityScore ? (existingCheck.qualityScore >= 70 ? true : false) : null,
        });
      }
      setIsLoading(false);
    } else {
      // Fetch quality checks to ensure we have latest data
      fetchQualityChecks();
    }
  }, [id, isNew, qualityChecks, fetchQualityChecks]);

  const handlePhotoUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files?.length) return;

    setUploadingPhotos(true);
    try {
      const urls: string[] = [];
      for (let i = 0; i < files.length; i++) {
        const { url } = await uploadImage(files[i]);
        urls.push(url);
      }
      setFormData((prev) => ({
        ...prev,
        photos: [...prev.photos, ...urls],
      }));
    } catch (err: unknown) {
      console.error("Failed to upload photos:", err);
      alert(err instanceof Error ? err.message : "Failed to upload photos");
    } finally {
      setUploadingPhotos(false);
      event.target.value = "";
    }
  };

  const handleRemovePhoto = (index: number) => {
    setFormData((prev) => ({
      ...prev,
      photos: prev.photos.filter((_, i) => i !== index),
    }));
  };

  const handleSubmit = async (approved: boolean) => {
    if (!formData.qualityGrade) {
      alert("Please assign a quality grade");
      return;
    }

    if (!formData.stockId) {
      alert("Please select stock item");
      return;
    }

    setIsSubmitting(true);
    
    try {
      // Find the inventory item to get transaction ID
      const inventoryItem = inventory.find((item) => item.id === formData.stockId);
      
      // Calculate quality score based on grading matrix
      // Base score from color intensity (0-100)
      let qualityScore = formData.colorIntensity * 10;
      
      // Adjust based on physical condition
      if (formData.physicalCondition === "poor") qualityScore -= 30;
      else if (formData.physicalCondition === "fair") qualityScore -= 15;
      else if (formData.physicalCondition === "good") qualityScore -= 5;
      
      // Adjust based on freshness
      if (formData.freshness === "aging") qualityScore -= 25;
      else if (formData.freshness === "moderate") qualityScore -= 10;
      
      qualityScore = Math.max(0, Math.min(100, qualityScore));

      const qualityCheckData: Partial<QualityCheck> = {
        centerId: inventoryItem?.centerId || "",
        transactionId: inventoryItem?.id || formData.stockId,
        farmerId: inventoryItem?.farmerId || "",
        farmerName: inventoryItem?.farmerName || "",
        variety: formData.variety,
        quantity: formData.quantity,
        qualityGrade: formData.qualityGrade,
        qualityScore,
        colorScore: formData.colorIntensity,
        damageScore: formData.physicalCondition === "poor" ? 8 : formData.physicalCondition === "fair" ? 4 : 0, // Convert to 0-10 scale
        photos: formData.photos,
        notes: formData.notes,
        checkedBy: user?.id || "",
      };

      await recordQualityCheck(qualityCheckData);
      
      alert(`Quality check ${approved ? "approved" : "rejected"} successfully!`);
      
      // Reset form
      setFormData({
        stockId: "",
        variety: "",
        quantity: 0,
        qualityGrade: null,
        weightRange: "",
        colorIntensity: 5,
        physicalCondition: "",
        freshness: "",
        daysSinceHarvest: 0,
        photos: [],
        notes: "",
        approved: null,
      });
    } catch (error) {
      console.error("Failed to record quality check:", error);
      alert("Failed to record quality check. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <Link to="/dashboard/aggregation/quality-checks">
          <Button variant="ghost" size="sm" className="mb-2">
            <IconArrowLeft className="mr-2 h-4 w-4" />
            Back to Quality Checks
          </Button>
        </Link>
        <h1 className="text-2xl sm:text-3xl font-bold">
          {isNew ? "New Quality Check" : `Quality Check ${id}`}
        </h1>
        <p className="text-sm sm:text-base text-muted-foreground mt-1">
          Assess and grade OFSP produce quality
        </p>
      </div>

      {isLoading ? (
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-32 bg-muted animate-pulse rounded-lg" />
          ))}
        </div>
      ) : (

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Form */}
        <div className="lg:col-span-2 space-y-6">
          {/* Stock Information */}
          <Card>
            <CardHeader>
              <CardTitle>Stock Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="stockId">Stock ID</Label>
                  <Input
                    id="stockId"
                    placeholder="INV-001"
                    value={formData.stockId}
                    onChange={(e) => setFormData((prev) => ({ ...prev, stockId: e.target.value }))}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="variety">Variety</Label>
                  <Select
                    value={formData.variety}
                    onValueChange={(value) => setFormData((prev) => ({ ...prev, variety: value || "" }))}
                  >
                    <SelectTrigger id="variety">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {varietyOptions.map((v) => (
                        <SelectItem key={v.value} value={v.value}>
                          {v.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="quantity">Quantity (kg)</Label>
                  <Input
                    id="quantity"
                    type="number"
                    value={formData.quantity || ""}
                    onChange={(e) =>
                      setFormData((prev) => ({ ...prev, quantity: parseFloat(e.target.value) || 0 }))
                    }
                    min={0}
                    step={0.1}
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Quality Assessment */}
          <Card>
            <CardHeader>
              <CardTitle>Quality Assessment</CardTitle>
              <CardDescription>Evaluate produce quality parameters</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Quality Grade */}
              <div className="space-y-3">
                <Label>Quality Grade *</Label>
                <div className="grid grid-cols-3 gap-3">
                  {gradeOptions.map((grade) => (
                    <button
                      key={grade.value}
                      type="button"
                      onClick={() =>
                        setFormData((prev) => ({ ...prev, qualityGrade: grade.value as "A" | "B" | "C" }))
                      }
                      className={cn(
                        "p-4 border-2 rounded-lg text-left transition-all",
                        formData.qualityGrade === grade.value
                          ? "border-primary bg-primary/5"
                          : "border-border hover:border-primary/50"
                      )}
                    >
                      <div className="flex items-center justify-between mb-2">
                        <Badge variant="outline" className={grade.color}>
                          Grade {grade.value}
                        </Badge>
                        {formData.qualityGrade === grade.value && (
                          <IconCheck className="h-5 w-5 text-primary" />
                        )}
                      </div>
                      <p className="text-xs text-muted-foreground">{grade.label.split(" - ")[1] ?? grade.label}</p>
                    </button>
                  ))}
                </div>
              </div>

              {/* Grading Matrix Section */}
              <div className="border-t pt-6 space-y-4">
                <div className="flex items-center justify-between">
                  <Label className="text-base font-semibold">Grading Matrix Criteria</Label>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => setShowMatrixGuide(true)}
                  >
                    <IconInfoCircle className="mr-2 h-4 w-4" />
                    View Matrix Guide
                  </Button>
                </div>

                {/* Weight Range */}
                <div className="space-y-2">
                  <Label>1. Weight Range *</Label>
                  <Select
                    value={formData.weightRange}
                    onValueChange={(value) =>
                      setFormData((prev) => ({ ...prev, weightRange: value as WeightRange }))
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {weightRangeDefinitions.map((def) => (
                        <SelectItem key={def.value} value={def.value}>
                          {def.label} - {def.description}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Color Intensity */}
                <div className="space-y-2">
                  <Label htmlFor="colorIntensity">2. Color Intensity (1-10) *</Label>
                  <div className="space-y-2">
                    <Input
                      id="colorIntensity"
                      type="range"
                      min={1}
                      max={10}
                      value={formData.colorIntensity}
                      onChange={(e) =>
                        setFormData((prev) => ({ ...prev, colorIntensity: parseInt(e.target.value) }))
                      }
                      className="w-full"
                    />
                    <div className="flex justify-between text-xs text-muted-foreground">
                      <span>Very Pale (1)</span>
                      <span className="font-semibold">
                        {colorIntensityDefinitions.find((c) => c.score === formData.colorIntensity)?.label || formData.colorIntensity}
                      </span>
                      <span>Premium+ (10)</span>
                    </div>
                  </div>
                </div>

                {/* Physical Condition */}
                <div className="space-y-2">
                  <Label>3. Physical Condition *</Label>
                  <Select
                    value={formData.physicalCondition}
                    onValueChange={(value) =>
                      setFormData((prev) => ({ ...prev, physicalCondition: value as PhysicalCondition }))
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {physicalConditionDefinitions.map((def) => (
                        <SelectItem key={def.value} value={def.value}>
                          {def.label} - {def.description}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Freshness */}
                <div className="space-y-2">
                  <Label>4. Freshness *</Label>
                  <div className="space-y-2">
                    <Select
                      value={formData.freshness}
                      onValueChange={(value) =>
                        setFormData((prev) => ({ ...prev, freshness: value as FreshnessLevel }))
                      }
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {freshnessDefinitions.map((def) => (
                          <SelectItem key={def.value} value={def.value}>
                            {def.label} - {def.description}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <Input
                      type="number"
                      placeholder="Days since harvest (optional)"
                      min={0}
                      value={formData.daysSinceHarvest || ""}
                      onChange={(e) =>
                        setFormData((prev) => ({
                          ...prev,
                          daysSinceHarvest: parseInt(e.target.value) || 0,
                        }))
                      }
                    />
                  </div>
                </div>

                {/* Grade Recommendation */}
                {formData.weightRange && formData.physicalCondition && formData.freshness && (
                  <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                    {(() => {
                      const recommendation = calculateGradeFromMatrix({
                        weightRange: formData.weightRange,
                        colorIntensity: formData.colorIntensity,
                        physicalCondition: formData.physicalCondition,
                        freshness: formData.freshness,
                      });
                      return (
                        <div className="space-y-2">
                          <div className="flex items-center justify-between">
                            <span className="font-semibold text-blue-900">Recommended Grade:</span>
                            <Badge
                              className={cn(
                                "text-base px-3 py-1",
                                recommendation.recommendedGrade === "A" && "bg-green-100 text-green-800",
                                recommendation.recommendedGrade === "B" && "bg-yellow-100 text-yellow-800",
                                recommendation.recommendedGrade === "C" && "bg-orange-100 text-orange-800"
                              )}
                            >
                              Grade {recommendation.recommendedGrade}
                            </Badge>
                          </div>
                          <p className="text-sm text-blue-700">
                            Confidence: <span className="font-semibold">{recommendation.confidence}</span>
                          </p>
                          <p className="text-xs text-blue-600 mt-2">{recommendation.explanation}</p>
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            className="mt-2"
                            onClick={() =>
                              setFormData((prev) => ({
                                ...prev,
                                qualityGrade: recommendation.recommendedGrade,
                              }))
                            }
                          >
                            Use Recommended Grade
                          </Button>
                        </div>
                      );
                    })()}
                  </div>
                )}
              </div>

              {/* Notes */}
              <div className="space-y-2">
                <Label htmlFor="notes">Assessment Notes</Label>
                <Textarea
                  id="notes"
                  placeholder="Additional observations, issues, or recommendations..."
                  value={formData.notes}
                  onChange={(e) => setFormData((prev) => ({ ...prev, notes: e.target.value }))}
                  rows={4}
                />
              </div>
            </CardContent>
          </Card>

          {/* Photo Documentation */}
          <Card>
            <CardHeader>
              <CardTitle>Photo Documentation</CardTitle>
              <CardDescription>Capture images for quality verification</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="border-2 border-dashed rounded-lg p-6 text-center">
                <input
                  type="file"
                  id="photo-upload"
                  multiple
                  accept="image/*"
                  onChange={handlePhotoUpload}
                  className="hidden"
                />
                <label
                  htmlFor="photo-upload"
                  className="cursor-pointer flex flex-col items-center gap-2"
                >
                  <IconPhoto className="h-8 w-8 text-muted-foreground" />
                  <span className="text-sm font-medium">Click to upload photos</span>
                  <span className="text-xs text-muted-foreground">PNG, JPG up to 10MB each</span>
                </label>
              </div>
              {uploadingPhotos && (
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <IconLoader2 className="h-4 w-4 animate-spin" />
                  Uploading photos...
                </div>
              )}
              {formData.photos.length > 0 && (
                <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                  {formData.photos.map((photo, index) => (
                    <div key={index} className="relative group">
                      <img
                        src={getImageFullUrl(photo)}
                        alt={`Photo ${index + 1}`}
                        className="w-full aspect-square object-cover rounded-lg border"
                      />
                      <button
                        type="button"
                        onClick={() => handleRemovePhoto(index)}
                        className="absolute top-2 right-2 p-1 bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        <IconX className="h-4 w-4" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Summary Sidebar */}
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Quality Check Summary</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-3">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Stock ID</span>
                  <span className="font-medium">{formData.stockId || "Not entered"}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Variety</span>
                  <span className="font-medium">{formData.variety || "Not selected"}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Quantity</span>
                  <span className="font-medium">{formData.quantity || 0} kg</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Quality Grade</span>
                  {formData.qualityGrade ? (
                    <Badge
                      variant="outline"
                      className={gradeOptions.find((g) => g.value === formData.qualityGrade)?.color ?? getGradeColor(formData.qualityGrade)}
                    >
                      Grade {formData.qualityGrade}
                    </Badge>
                  ) : (
                    <span className="text-muted-foreground">Not assigned</span>
                  )}
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Color Score</span>
                  <span className="font-medium">{formData.colorIntensity}/10</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Damage</span>
                  <span className="font-medium">{formData.physicalCondition === "poor" ? 80 : formData.physicalCondition === "fair" ? 40 : 0}%</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Photos</span>
                  <span className="font-medium">{formData.photos.length}</span>
                </div>
              </div>
              <div className="border-t pt-4 space-y-2">
                <Button
                  onClick={() => handleSubmit(true)}
                  disabled={!formData.qualityGrade || isSubmitting}
                  className="w-full"
                >
                  {isSubmitting ? (
                    <>
                      <IconLoader2 className="mr-2 h-4 w-4 animate-spin" />
                      Processing...
                    </>
                  ) : (
                    <>
                      <IconCheck className="mr-2 h-4 w-4" />
                      Approve Quality
                    </>
                  )}
                </Button>
                <Button
                  variant="destructive"
                  onClick={() => handleSubmit(false)}
                  disabled={!formData.qualityGrade || isSubmitting}
                  className="w-full"
                >
                  {isSubmitting ? (
                    <>
                      <IconLoader2 className="mr-2 h-4 w-4 animate-spin" />
                      Processing...
                    </>
                  ) : (
                    <>
                      <IconX className="mr-2 h-4 w-4" />
                      Reject Quality
                    </>
                  )}
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
      )}

      {/* Grading Matrix Guide Dialog */}
      <Dialog open={showMatrixGuide} onOpenChange={setShowMatrixGuide}>
        <DialogContent className="w-[95vw] max-w-7xl max-h-[90vh] overflow-y-auto p-6">
          <DialogHeader>
            <DialogTitle>Grading Matrix Guide</DialogTitle>
            <DialogDescription>
              Reference guide for the four criteria used in quality grading
            </DialogDescription>
          </DialogHeader>
          <div className="overflow-x-auto">
            <GradingMatrixGuide />
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}

