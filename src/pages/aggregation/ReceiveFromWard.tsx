import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import {
  IconUpload,
  IconCheck,
  IconX,
  IconPhoto,
  IconLoader2,
  IconBuildingCommunity,
  IconPackage,
  IconArrowRight,
  IconInfoCircle,
} from "@tabler/icons-react";
import { cn } from "@/lib/utils";
import { ReceiptGenerator } from "@/components/receipts/ReceiptGenerator";
import { GradingMatrixGuide } from "@/components/quality/GradingMatrixGuide";
import { calculateGradeFromMatrix } from "@/data/gradingMatrix";
import {
  weightRangeDefinitions,
  colorIntensityDefinitions,
  physicalConditionDefinitions,
  freshnessDefinitions,
} from "@/data/gradingMatrix";
import { useAggregation } from "@/contexts/AggregationContext";
import { useAuth } from "@/contexts/AuthContext";
import { showError } from "@/lib/toast";
import type { WeightRange, PhysicalCondition, FreshnessLevel } from "@/types/quality";

interface WardTransferEntry {
  fromCenterId: string;
  fromCenterName: string;
  batchId: string;
  variety: string;
  quantity: number; // kg
  qualityGrade: "A" | "B" | "C";
  // Grading Matrix Criteria
  weightRange: WeightRange | "";
  colorIntensity: number; // 1-10
  physicalCondition: PhysicalCondition | "";
  freshness: FreshnessLevel | "";
  daysSinceHarvest?: number;
  photos: string[];
  notes?: string;
  transferDate: string;
  transferTime: string;
  transporterName?: string;
  vehicleNumber?: string;
}

const ofspVarieties = [
  { value: "kenya", label: "Kenya" },
  { value: "spk004", label: "SPK004" },
  { value: "kabode", label: "Kabode" },
];

const qualityGrades = [
  { value: "A", label: "Grade A - Premium", color: "bg-green-100 text-green-800" },
  { value: "B", label: "Grade B - Standard", color: "bg-yellow-100 text-yellow-800" },
  { value: "C", label: "Grade C - Processing", color: "bg-orange-100 text-orange-800" },
];

export function ReceiveFromWard() {
  const { recordStockIn, centers, fetchCenters, selectedCenter, isLoading: aggregationLoading } = useAggregation();
  const { user } = useAuth();
  
  const [formData, setFormData] = useState<Partial<WardTransferEntry>>({
    fromCenterId: "",
    fromCenterName: "",
    batchId: "",
    variety: "",
    quantity: 0,
    qualityGrade: undefined,
    weightRange: "",
    colorIntensity: 5,
    physicalCondition: "",
    freshness: "",
    daysSinceHarvest: 0,
    photos: [],
    notes: "",
    transferDate: new Date().toISOString().split("T")[0],
    transferTime: new Date().toTimeString().slice(0, 5),
    transporterName: "",
    vehicleNumber: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [uploadingPhotos, setUploadingPhotos] = useState(false);
  const [receiptOpen, setReceiptOpen] = useState(false);
  const [generatedReceipt, setGeneratedReceipt] = useState<any>(null);
  const [generatedQRCode, setGeneratedQRCode] = useState<string>("");
  const [showMatrixGuide, setShowMatrixGuide] = useState(false);

  // Fetch centers on mount - filter for satellite centers
  useEffect(() => {
    fetchCenters({ centerType: "satellite" });
  }, [fetchCenters]);

  // Filter for satellite centers
  const satelliteCenters = centers.filter((c) => c.centerType === "satellite");
  const sourceCenter = satelliteCenters.find((c) => c.id === formData.fromCenterId);

  const handleCenterChange = (centerId: string) => {
    const center = satelliteCenters.find((c) => c.id === centerId);
    setFormData((prev) => ({
      ...prev,
      fromCenterId: centerId,
      fromCenterName: center?.name || "",
    }));
  };

  const handlePhotoUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files) return;

    setUploadingPhotos(true);
    // TODO: Replace with actual file upload API
    setTimeout(() => {
      const newPhotos = Array.from(files).map((file) => URL.createObjectURL(file));
      setFormData((prev) => ({
        ...prev,
        photos: [...(prev.photos || []), ...newPhotos],
      }));
      setUploadingPhotos(false);
    }, 1000);
  };

  const handleRemovePhoto = (index: number) => {
    setFormData((prev) => ({
      ...prev,
      photos: prev.photos?.filter((_, i) => i !== index) || [],
    }));
  };

  const generateQRCode = (batchId: string) => {
    return `QR-${batchId}`;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (
      !formData.fromCenterId ||
      !formData.batchId ||
      !formData.variety ||
      !formData.quantity ||
      !formData.qualityGrade
    ) {
      showError("Validation Error", "Please fill in all required fields");
      return;
    }
    // Validate grading matrix criteria
    if (!formData.weightRange || !formData.physicalCondition || !formData.freshness) {
      showError("Validation Error", "Please complete all grading matrix criteria (weight range, physical condition, freshness)");
      return;
    }

    if (!selectedCenter && centers.length > 0) {
      // Auto-select first center if none selected
    }

    setIsSubmitting(true);
    
    try {
      const qrCode = generateQRCode(formData.batchId!);
      setGeneratedQRCode(qrCode);

      // Prepare stock transaction data (transfer from satellite to main)
      const stockTransaction = {
        centerId: selectedCenter?.id || centers[0]?.id || "",
        centerName: selectedCenter?.name || centers[0]?.name || "",
        type: "stock_in" as const,
        variety: formData.variety || "",
        quantity: formData.quantity || 0,
        qualityGrade: formData.qualityGrade as "A" | "B" | "C",
        // Grading Matrix Criteria
        weightRange: formData.weightRange || undefined,
        colorIntensity: formData.colorIntensity || undefined,
        physicalCondition: formData.physicalCondition || undefined,
        freshness: formData.freshness || undefined,
        daysSinceHarvest: formData.daysSinceHarvest || undefined,
        photos: formData.photos || [],
        notes: `${formData.notes || ""} Transfer from ${formData.fromCenterName}. ${formData.transporterName ? `Transporter: ${formData.transporterName}. ` : ""}${formData.vehicleNumber ? `Vehicle: ${formData.vehicleNumber}.` : ""}`,
        batchId: formData.batchId,
        qrCode,
        createdBy: user?.id || "",
        orderId: undefined, // Transfer doesn't have an order
        sourceCenterId: formData.fromCenterId, // Source center for transfer
      };

      // Record stock in via context
      await recordStockIn(stockTransaction);

      // Generate receipt data
      const receiptData = {
        receiptId: `TRF-${Date.now()}`,
        type: "stock_in" as const,
        date: new Date().toISOString(),
        variety: formData.variety,
        quantity: formData.quantity,
        qualityGrade: formData.qualityGrade,
        location: `From ${formData.fromCenterName} to ${selectedCenter?.name || "Main Center"}`,
        transactionId: formData.batchId,
        qrCode: qrCode,
      };

      setGeneratedReceipt(receiptData);
      setReceiptOpen(true);

      // Reset form after showing receipt
      setFormData({
        fromCenterId: "",
        fromCenterName: "",
        batchId: "",
        variety: "",
        quantity: 0,
        qualityGrade: undefined,
        weightRange: "",
        colorIntensity: 5,
        physicalCondition: "",
        freshness: "",
        daysSinceHarvest: 0,
        photos: [],
        notes: "",
        transferDate: new Date().toISOString().split("T")[0],
        transferTime: new Date().toTimeString().slice(0, 5),
        transporterName: "",
        vehicleNumber: "",
      });
    } catch (error) {
      console.error("Failed to record transfer:", error);
      alert("Failed to record transfer. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const selectedGrade = qualityGrades.find((g) => g.value === formData.qualityGrade);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold">Receive from Ward Centers</h1>
        <p className="text-sm sm:text-base text-muted-foreground mt-1">
          Record produce received from satellite/ward aggregation centers
        </p>
      </div>

      <form onSubmit={handleSubmit}>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Form */}
          <div className="lg:col-span-2 space-y-6">
            {/* Source Center Selection */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <IconBuildingCommunity className="h-5 w-5" />
                  Source Ward Center
                </CardTitle>
                <CardDescription>Select the satellite center transferring produce</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label>Ward Center *</Label>
                  <Select value={formData.fromCenterId} onValueChange={handleCenterChange}>
                    <SelectTrigger>
                      <SelectValue>
                        {formData.fromCenterId ? "" : "Select ward center"}
                      </SelectValue>
                    </SelectTrigger>
                    <SelectContent>
                      {satelliteCenters.map((center) => (
                        <SelectItem key={center.id} value={center.id}>
                          <div className="flex flex-col">
                            <span>{center.name}</span>
                            <span className="text-xs text-muted-foreground">
                              {center.ward || ""} • {center.subCounty}
                            </span>
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {selectedCenter && (
                    <div className="p-3 bg-muted rounded-lg">
                      <div className="text-sm">
                        <div className="font-medium">{selectedCenter.name}</div>
                        <div className="text-muted-foreground text-xs mt-1">
                          {selectedCenter.ward} • {selectedCenter.subCounty} Subcounty
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Transfer Details */}
            <Card>
              <CardHeader>
                <CardTitle>Transfer Details</CardTitle>
                <CardDescription>Information about the transferred produce</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="batchId">Batch ID from Ward Center *</Label>
                  <Input
                    id="batchId"
                    placeholder="Enter batch ID from satellite center"
                    value={formData.batchId}
                    onChange={(e) => setFormData({ ...formData, batchId: e.target.value })}
                    required
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="transferDate">Transfer Date *</Label>
                    <Input
                      id="transferDate"
                      type="date"
                      value={formData.transferDate}
                      onChange={(e) => setFormData({ ...formData, transferDate: e.target.value })}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="transferTime">Transfer Time *</Label>
                    <Input
                      id="transferTime"
                      type="time"
                      value={formData.transferTime}
                      onChange={(e) => setFormData({ ...formData, transferTime: e.target.value })}
                      required
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="variety">Variety *</Label>
                  <Select value={formData.variety} onValueChange={(value) => setFormData({ ...formData, variety: value })}>
                    <SelectTrigger>
                      <SelectValue>
                        {formData.variety ? "" : "Select variety"}
                      </SelectValue>
                    </SelectTrigger>
                    <SelectContent>
                      {ofspVarieties.map((variety) => (
                        <SelectItem key={variety.value} value={variety.value}>
                          {variety.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="quantity">Quantity (kg) *</Label>
                  <Input
                    id="quantity"
                    type="number"
                    min="0"
                    step="0.1"
                    placeholder="Enter quantity in kg"
                    value={formData.quantity || ""}
                    onChange={(e) => setFormData({ ...formData, quantity: parseFloat(e.target.value) || 0 })}
                    required
                  />
                </div>

                {/* Grading Matrix Section */}
                <div className="border-t pt-6 space-y-4">
                  <div className="flex items-center justify-between">
                    <Label className="text-base font-semibold">Grading Matrix Criteria (Secondary Verification)</Label>
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
                      value={formData.weightRange || ""}
                      onValueChange={(value) =>
                        setFormData((prev) => ({ ...prev, weightRange: value as WeightRange }))
                      }
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select weight range" />
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
                        value={formData.colorIntensity || 5}
                        onChange={(e) =>
                          setFormData((prev) => ({ ...prev, colorIntensity: parseInt(e.target.value) }))
                        }
                        className="w-full"
                      />
                      <div className="flex justify-between text-xs text-muted-foreground">
                        <span>Very Pale (1)</span>
                        <span className="font-semibold">
                          {colorIntensityDefinitions.find((c) => c.score === (formData.colorIntensity || 5))?.label || formData.colorIntensity}
                        </span>
                        <span>Premium+ (10)</span>
                      </div>
                    </div>
                  </div>

                  {/* Physical Condition */}
                  <div className="space-y-2">
                    <Label>3. Physical Condition *</Label>
                    <Select
                      value={formData.physicalCondition || ""}
                      onValueChange={(value) =>
                        setFormData((prev) => ({ ...prev, physicalCondition: value as PhysicalCondition }))
                      }
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select physical condition" />
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
                        value={formData.freshness || ""}
                        onValueChange={(value) =>
                          setFormData((prev) => ({ ...prev, freshness: value as FreshnessLevel }))
                        }
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select freshness level" />
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
                          colorIntensity: formData.colorIntensity || 5,
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
                              onClick={() =>
                                setFormData((prev) => ({
                                  ...prev,
                                  qualityGrade: recommendation.recommendedGrade as "A" | "B" | "C",
                                }))
                              }
                              className="w-full mt-2"
                            >
                              <IconCheck className="mr-2 h-4 w-4" />
                              Apply Recommended Grade
                            </Button>
                          </div>
                        );
                      })()}
                    </div>
                  )}

                  {/* Quality Grade Display */}
                  {formData.qualityGrade && (
                    <div className="p-3 bg-muted rounded-lg">
                      <div className="flex items-center justify-between">
                        <Label className="text-sm font-medium">Selected Quality Grade:</Label>
                        <Badge
                          variant="outline"
                          className={cn(
                            qualityGrades.find((g) => g.value === formData.qualityGrade)?.color
                          )}
                        >
                          Grade {formData.qualityGrade}
                        </Badge>
                      </div>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Transport Information */}
            <Card>
              <CardHeader>
                <CardTitle>Transport Information</CardTitle>
                <CardDescription>Details about the transport used for transfer</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="transporterName">Transporter Name (Optional)</Label>
                  <Input
                    id="transporterName"
                    placeholder="Enter transporter name"
                    value={formData.transporterName}
                    onChange={(e) => setFormData({ ...formData, transporterName: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="vehicleNumber">Vehicle Number (Optional)</Label>
                  <Input
                    id="vehicleNumber"
                    placeholder="e.g. KCA 123A"
                    value={formData.vehicleNumber}
                    onChange={(e) => setFormData({ ...formData, vehicleNumber: e.target.value })}
                  />
                </div>
              </CardContent>
            </Card>

            {/* Photos and Notes */}
            <Card>
              <CardHeader>
                <CardTitle>Documentation</CardTitle>
                <CardDescription>Photos and notes for record keeping</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label>Photos</Label>
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
                    className="cursor-pointer flex flex-col items-center gap-2 p-8 border-2 border-dashed rounded-lg hover:bg-muted/50 transition-colors"
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
                {formData.photos && formData.photos.length > 0 && (
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                    {formData.photos.map((photo, index) => (
                      <div key={index} className="relative group">
                        <img
                          src={photo}
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

                <div className="space-y-2">
                  <Label htmlFor="notes">Notes (Optional)</Label>
                  <Textarea
                    id="notes"
                    placeholder="Add any notes about the transfer..."
                    value={formData.notes}
                    onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                    rows={3}
                  />
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Summary Sidebar */}
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Transfer Summary</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">From Center</span>
                    <span className="font-medium">{formData.fromCenterName || "Not selected"}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Batch ID</span>
                    <span className="font-mono text-xs">{formData.batchId || "Not entered"}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Variety</span>
                    <span className="font-medium">
                      {ofspVarieties.find((v) => v.value === formData.variety)?.label || "Not selected"}
                    </span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Quantity</span>
                    <span className="font-medium">{formData.quantity || 0} kg</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Quality Grade</span>
                    {selectedGrade ? (
                      <Badge variant="outline" className={selectedGrade.color}>
                        Grade {selectedGrade.value}
                      </Badge>
                    ) : (
                      <span className="text-muted-foreground">Not selected</span>
                    )}
                  </div>
                  {generatedQRCode && (
                    <div className="border-t pt-4 mt-4 space-y-2">
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-muted-foreground">QR Code:</span>
                        <span className="font-mono text-xs">{generatedQRCode}</span>
                      </div>
                    </div>
                  )}
                </div>
                <div className="border-t pt-4">
                  <Button
                    type="submit"
                    className="w-full"
                    disabled={
                      !formData.fromCenterId ||
                      !formData.batchId ||
                      !formData.variety ||
                      !formData.quantity ||
                      !formData.qualityGrade ||
                      !formData.weightRange ||
                      !formData.physicalCondition ||
                      !formData.freshness ||
                      isSubmitting
                    }
                  >
                    {isSubmitting ? (
                      <>
                        <IconLoader2 className="mr-2 h-4 w-4 animate-spin" />
                        Recording...
                      </>
                    ) : (
                      <>
                        <IconCheck className="mr-2 h-4 w-4" />
                        Record Transfer & Generate Receipt
                      </>
                    )}
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Instructions */}
            <Card>
              <CardHeader>
                <CardTitle className="text-sm">Instructions</CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="text-xs text-muted-foreground space-y-2">
                  <li>• Verify batch ID from satellite center</li>
                  <li>• Conduct secondary quality verification</li>
                  <li>• Weigh and verify quantity</li>
                  <li>• Take photos for documentation</li>
                  <li>• Generate receipt with QR code</li>
                </ul>
              </CardContent>
            </Card>
          </div>
        </div>
      </form>

      {/* Receipt Dialog */}
      {generatedReceipt && (
        <ReceiptGenerator
          open={receiptOpen}
          onOpenChange={setReceiptOpen}
          receiptData={generatedReceipt}
          onDownload={(format) => {
            console.log(`Downloading receipt as ${format}...`);
          }}
          onPrint={() => {
            window.print();
          }}
        />
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
