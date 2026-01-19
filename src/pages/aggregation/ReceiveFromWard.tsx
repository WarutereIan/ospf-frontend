import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import {
  IconUpload,
  IconCheck,
  IconX,
  IconPhoto,
  IconLoader2,
  IconBuildingCommunity,
  IconPackage,
  IconArrowRight,
} from "@tabler/icons-react";
import { cn } from "@/lib/utils";
import { ReceiptGenerator } from "@/components/receipts/ReceiptGenerator";

interface WardTransferEntry {
  fromCenterId: string;
  fromCenterName: string;
  batchId: string;
  variety: string;
  quantity: number; // kg
  qualityGrade: "A" | "B" | "C";
  photos: string[];
  notes?: string;
  transferDate: string;
  transferTime: string;
  transporterName?: string;
  vehicleNumber?: string;
}

const satelliteCenters = [
  { id: "SAT-001", name: "Tala Satellite Center", ward: "Tala Ward", subCounty: "Kangundo" },
  { id: "SAT-002", name: "Kilala Satellite Center", ward: "Kilala Ward", subCounty: "Kangundo" },
  { id: "SAT-003", name: "Mitaboni Satellite Center", ward: "Mitaboni Ward", subCounty: "Kathiani" },
  { id: "SAT-004", name: "Masinga Satellite Center", ward: "Masinga Ward", subCounty: "Masinga" },
  { id: "SAT-005", name: "Yatta Satellite Center", ward: "Yatta Ward", subCounty: "Yatta" },
];

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
  const [formData, setFormData] = useState<Partial<WardTransferEntry>>({
    fromCenterId: "",
    fromCenterName: "",
    batchId: "",
    variety: "",
    quantity: 0,
    qualityGrade: undefined,
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

  const selectedCenter = satelliteCenters.find((c) => c.id === formData.fromCenterId);

  const handleCenterChange = (centerId: string) => {
    const center = satelliteCenters.find((c) => c.id === centerId);
    setFormData({
      ...formData,
      fromCenterId: centerId,
      fromCenterName: center?.name || "",
    });
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
      return;
    }

    setIsSubmitting(true);
    // TODO: Replace with actual API call
    setTimeout(() => {
      const qrCode = generateQRCode(formData.batchId!);
      setGeneratedQRCode(qrCode);

      // Generate receipt data
      const receiptData = {
        receiptId: `TRF-${Date.now()}`,
        type: "stock_in" as const,
        date: new Date().toISOString(),
        variety: formData.variety,
        quantity: formData.quantity,
        qualityGrade: formData.qualityGrade,
        location: `From ${formData.fromCenterName} to Main Center`,
        transactionId: formData.batchId,
        qrCode: qrCode,
      };

      setGeneratedReceipt(receiptData);
      setIsSubmitting(false);
      setReceiptOpen(true);

      // Reset form after showing receipt
      setFormData({
        fromCenterId: "",
        fromCenterName: "",
        batchId: "",
        variety: "",
        quantity: 0,
        qualityGrade: undefined,
        photos: [],
        notes: "",
        transferDate: new Date().toISOString().split("T")[0],
        transferTime: new Date().toTimeString().slice(0, 5),
        transporterName: "",
        vehicleNumber: "",
      });
    }, 2000);
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
                      <SelectValue placeholder="Select ward center" />
                    </SelectTrigger>
                    <SelectContent>
                      {satelliteCenters.map((center) => (
                        <SelectItem key={center.id} value={center.id}>
                          <div className="flex flex-col">
                            <span>{center.name}</span>
                            <span className="text-xs text-muted-foreground">
                              {center.ward} • {center.subCounty}
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
                      <SelectValue placeholder="Select variety" />
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

                <div className="space-y-2">
                  <Label>Quality Grade (Secondary Verification) *</Label>
                  <div className="grid grid-cols-3 gap-2">
                    {qualityGrades.map((grade) => (
                      <button
                        key={grade.value}
                        type="button"
                        onClick={() => setFormData({ ...formData, qualityGrade: grade.value as "A" | "B" | "C" })}
                        className={cn(
                          "p-3 border-2 rounded-lg text-sm font-medium transition-all",
                          formData.qualityGrade === grade.value
                            ? "border-primary bg-primary/10"
                            : "border-border hover:border-primary/50"
                        )}
                      >
                        <div className={cn("inline-block px-2 py-1 rounded text-xs mb-1", grade.color)}>
                          Grade {grade.value}
                        </div>
                        <div className="text-xs text-muted-foreground mt-1">{grade.label.split(" - ")[1]}</div>
                      </button>
                    ))}
                  </div>
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
    </div>
  );
}
