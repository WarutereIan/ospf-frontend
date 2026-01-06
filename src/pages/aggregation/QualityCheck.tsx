import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  IconCheck,
  IconX,
  IconPhoto,
  IconLoader2,
  IconAlertTriangle,
} from "@tabler/icons-react";
import { cn } from "@/lib/utils";

interface QualityCheckForm {
  stockId: string;
  farmerId: string; // Track farmer origin
  farmerName: string; // Track farmer origin
  variety: string;
  quantity: number;
  qualityGrade: "A" | "B" | "C" | null;
  size: "small" | "medium" | "large" | null;
  colorScore: number; // 1-10
  damagePercentage: number; // 0-100
  photos: string[];
  notes: string;
  approved: boolean | null;
}

const qualityGrades = [
  { value: "A", label: "Grade A - Premium", color: "bg-green-100 text-green-800" },
  { value: "B", label: "Grade B - Standard", color: "bg-yellow-100 text-yellow-800" },
  { value: "C", label: "Grade C - Processing", color: "bg-orange-100 text-orange-800" },
];

const sizeOptions = [
  { value: "small", label: "Small (< 100g)" },
  { value: "medium", label: "Medium (100-200g)" },
  { value: "large", label: "Large (> 200g)" },
];

export function QualityCheck() {
  const [formData, setFormData] = useState<QualityCheckForm>({
    stockId: "",
    farmerId: "",
    farmerName: "",
    variety: "",
    quantity: 0,
    qualityGrade: null,
    size: null,
    colorScore: 5,
    damagePercentage: 0,
    photos: [],
    notes: "",
    approved: null,
  });

  // Sample pending stock for quality check - TODO: Replace with API
  const samplePendingStock = [
    { id: "STK-001", farmerId: "F001", farmerName: "James Mutua", variety: "Kenya", quantity: 500 },
    { id: "STK-002", farmerId: "F002", farmerName: "Mary Wanjiku", variety: "SPK004", quantity: 300 },
    { id: "STK-003", farmerId: "F003", farmerName: "Peter Kamau", variety: "Kabode", quantity: 200 },
  ];

  const handleStockSelection = (stockId: string) => {
    const selected = samplePendingStock.find((s) => s.id === stockId);
    if (selected) {
      setFormData((prev) => ({
        ...prev,
        stockId: selected.id,
        farmerId: selected.farmerId,
        farmerName: selected.farmerName,
        variety: selected.variety,
        quantity: selected.quantity,
      }));
    }
  };
  const [uploadingPhotos, setUploadingPhotos] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handlePhotoUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files) return;

    setUploadingPhotos(true);
    // TODO: Replace with actual file upload API
    setTimeout(() => {
      const newPhotos = Array.from(files).map((file) => URL.createObjectURL(file));
      setFormData((prev) => ({
        ...prev,
        photos: [...prev.photos, ...newPhotos],
      }));
      setUploadingPhotos(false);
    }, 1000);
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

    setIsSubmitting(true);
    // TODO: Replace with actual API call
    setTimeout(() => {
      console.log("Quality check:", { ...formData, approved });
      setIsSubmitting(false);
      alert(`Quality check ${approved ? "approved" : "rejected"} successfully!`);
      // Reset form
      setFormData({
        stockId: "",
        farmerId: "",
        farmerName: "",
        variety: "",
        quantity: 0,
        qualityGrade: null,
        size: null,
        colorScore: 5,
        damagePercentage: 0,
        photos: [],
        notes: "",
        approved: null,
      });
    }, 1500);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold">Quality Check</h1>
        <p className="text-sm sm:text-base text-muted-foreground mt-1">
          Assess and grade OFSP produce quality
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Form */}
        <div className="lg:col-span-2 space-y-6">
          {/* Stock Information */}
          <Card>
            <CardHeader>
              <CardTitle>Stock Information</CardTitle>
              <CardDescription>Select pending stock for quality check</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="stockId">Select Pending Stock *</Label>
                <Select
                  value={formData.stockId}
                  onValueChange={handleStockSelection}
                >
                  <SelectTrigger id="stockId">
                    <SelectValue placeholder="Select stock to check" />
                  </SelectTrigger>
                  <SelectContent>
                    {samplePendingStock.map((stock) => (
                      <SelectItem key={stock.id} value={stock.id}>
                        {stock.id} - {stock.farmerName} - {stock.variety} ({stock.quantity} kg)
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              {formData.farmerName && (
                <div className="p-4 bg-primary/10 border border-primary/20 rounded-lg">
                  <p className="text-xs font-semibold text-primary mb-2">FARMER ORIGIN</p>
                  <p className="font-medium">{formData.farmerName}</p>
                  <p className="text-sm text-muted-foreground">Farmer ID: {formData.farmerId}</p>
                  <div className="mt-3 grid grid-cols-2 gap-2 text-sm">
                    <div>
                      <span className="text-muted-foreground">Variety:</span>
                      <p className="font-medium">{formData.variety}</p>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Quantity:</span>
                      <p className="font-medium">{formData.quantity} kg</p>
                    </div>
                  </div>
                </div>
              )}
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
                  {qualityGrades.map((grade) => (
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
                      <p className="text-xs text-muted-foreground">{grade.label.split(" - ")[1]}</p>
                    </button>
                  ))}
                </div>
              </div>

              {/* Size Assessment */}
              <div className="space-y-2">
                <Label>Average Size</Label>
                <Select
                  value={formData.size || ""}
                  onValueChange={(value) =>
                    setFormData((prev) => ({ ...prev, size: value as "small" | "medium" | "large" | null }))
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {sizeOptions.map((size) => (
                      <SelectItem key={size.value} value={size.value}>
                        {size.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Color Score */}
              <div className="space-y-2">
                <Label htmlFor="colorScore">Color Score (1-10)</Label>
                <div className="space-y-2">
                  <Input
                    id="colorScore"
                    type="range"
                    min={1}
                    max={10}
                    value={formData.colorScore}
                    onChange={(e) =>
                      setFormData((prev) => ({ ...prev, colorScore: parseInt(e.target.value) }))
                    }
                    className="w-full"
                  />
                  <div className="flex justify-between text-xs text-muted-foreground">
                    <span>Poor (1)</span>
                    <span className="font-semibold">Current: {formData.colorScore}</span>
                    <span>Excellent (10)</span>
                  </div>
                </div>
              </div>

              {/* Damage Percentage */}
              <div className="space-y-2">
                <Label htmlFor="damage">Damage Percentage (0-100%)</Label>
                <div className="space-y-2">
                  <Input
                    id="damage"
                    type="number"
                    min={0}
                    max={100}
                    value={formData.damagePercentage}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        damagePercentage: parseFloat(e.target.value) || 0,
                      }))
                    }
                  />
                  {formData.damagePercentage > 20 && (
                    <div className="flex items-center gap-2 p-2 bg-yellow-50 border border-yellow-200 rounded text-yellow-800 text-sm">
                      <IconAlertTriangle className="h-4 w-4" />
                      <span>High damage percentage may affect grade</span>
                    </div>
                  )}
                </div>
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
                {formData.farmerName && (
                  <div className="p-2 bg-primary/10 rounded">
                    <p className="text-xs font-semibold text-primary">FARMER</p>
                    <p className="text-sm font-medium">{formData.farmerName}</p>
                  </div>
                )}
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
                      className={qualityGrades.find((g) => g.value === formData.qualityGrade)?.color}
                    >
                      Grade {formData.qualityGrade}
                    </Badge>
                  ) : (
                    <span className="text-muted-foreground">Not assigned</span>
                  )}
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Color Score</span>
                  <span className="font-medium">{formData.colorScore}/10</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Damage</span>
                  <span className="font-medium">{formData.damagePercentage}%</span>
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
    </div>
  );
}
