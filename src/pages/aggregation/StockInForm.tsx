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
} from "@tabler/icons-react";
import { cn } from "@/lib/utils";

interface StockInEntry {
  farmerId: string;
  farmerName: string;
  orderId?: string;
  variety: string;
  quantity: number; // kg
  qualityGrade: "A" | "B" | "C";
  photos: string[];
  notes?: string;
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

export function StockInForm() {
  const [formData, setFormData] = useState<Partial<StockInEntry>>({
    farmerId: "",
    farmerName: "",
    orderId: "",
    variety: "",
    quantity: 0,
    qualityGrade: undefined,
    photos: [],
    notes: "",
  });
  const [searchTerm, setSearchTerm] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [uploadingPhotos, setUploadingPhotos] = useState(false);

  // Sample farmers for search - TODO: Replace with API
  const sampleFarmers = [
    { id: "F001", name: "James Mutua", phone: "+254712345678" },
    { id: "F002", name: "Mary Wanjiku", phone: "+254723456789" },
    { id: "F003", name: "Peter Kamau", phone: "+254734567890" },
  ];

  const filteredFarmers = sampleFarmers.filter(
    (farmer) =>
      farmer.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      farmer.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      farmer.phone.includes(searchTerm)
  );

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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.farmerId || !formData.variety || !formData.quantity || !formData.qualityGrade) {
      return;
    }

    setIsSubmitting(true);
    // TODO: Replace with actual API call
    setTimeout(() => {
      console.log("Stock In Entry:", formData);
      // Reset form
      setFormData({
        farmerId: "",
        farmerName: "",
        orderId: "",
        variety: "",
        quantity: 0,
        qualityGrade: undefined,
        photos: [],
        notes: "",
      });
      setSearchTerm("");
      setIsSubmitting(false);
      alert("Stock in entry recorded successfully! Receipt generated.");
    }, 2000);
  };

  const selectedGrade = qualityGrades.find((g) => g.value === formData.qualityGrade);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold">Stock In</h1>
        <p className="text-sm sm:text-base text-muted-foreground mt-1">
          Record incoming OFSP produce at aggregation center
        </p>
      </div>

      <form onSubmit={handleSubmit}>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Form */}
          <div className="lg:col-span-2 space-y-6">
            {/* Farmer Selection */}
            <Card>
              <CardHeader>
                <CardTitle>Farmer Information</CardTitle>
                <CardDescription>Select or search for the farmer</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label>Search Farmer</Label>
                  <Input
                    placeholder="Search by name, ID, or phone..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                  {searchTerm && filteredFarmers.length > 0 && (
                    <div className="border rounded-lg mt-2 max-h-48 overflow-y-auto">
                      {filteredFarmers.map((farmer) => (
                        <button
                          key={farmer.id}
                          type="button"
                          onClick={() => {
                            setFormData((prev) => ({
                              ...prev,
                              farmerId: farmer.id,
                              farmerName: farmer.name,
                            }));
                            setSearchTerm("");
                          }}
                          className="w-full text-left p-3 hover:bg-muted transition-colors border-b last:border-b-0"
                        >
                          <div className="font-medium">{farmer.name}</div>
                          <div className="text-sm text-muted-foreground">
                            {farmer.id} • {farmer.phone}
                          </div>
                        </button>
                      ))}
                    </div>
                  )}
                </div>
                {formData.farmerName && (
                  <div className="p-3 bg-green-50 border border-green-200 rounded-lg">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium">{formData.farmerName}</p>
                        <p className="text-sm text-muted-foreground">ID: {formData.farmerId}</p>
                      </div>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => {
                          setFormData((prev) => ({ ...prev, farmerId: "", farmerName: "" }));
                        }}
                      >
                        <IconX className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                )}
                <div className="space-y-2">
                  <Label htmlFor="orderId">Order ID (Optional)</Label>
                  <Input
                    id="orderId"
                    placeholder="ORD-001"
                    value={formData.orderId}
                    onChange={(e) => setFormData((prev) => ({ ...prev, orderId: e.target.value }))}
                  />
                </div>
              </CardContent>
            </Card>

            {/* Produce Details */}
            <Card>
              <CardHeader>
                <CardTitle>Produce Details</CardTitle>
                <CardDescription>Enter produce information</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="variety">OFSP Variety</Label>
                    <Select
                      value={formData.variety}
                      onValueChange={(value) => setFormData((prev) => ({ ...prev, variety: value || "" }))}
                    >
                      <SelectTrigger id="variety">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {ofspVarieties.map((v) => (
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
                      placeholder="0"
                      min={0}
                      step={0.1}
                      value={formData.quantity || ""}
                      onChange={(e) =>
                        setFormData((prev) => ({ ...prev, quantity: parseFloat(e.target.value) || 0 }))
                      }
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>Quality Grade</Label>
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

                <div className="space-y-2">
                  <Label htmlFor="notes">Notes (Optional)</Label>
                  <Textarea
                    id="notes"
                    placeholder="Any additional notes about the produce..."
                    value={formData.notes}
                    onChange={(e) => setFormData((prev) => ({ ...prev, notes: e.target.value }))}
                    rows={3}
                  />
                </div>
              </CardContent>
            </Card>

            {/* Photo Documentation */}
            <Card>
              <CardHeader>
                <CardTitle>Photo Documentation</CardTitle>
                <CardDescription>Upload photos of the produce for quality verification</CardDescription>
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
              </CardContent>
            </Card>
          </div>

          {/* Summary Sidebar */}
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Stock In Summary</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Farmer</span>
                    <span className="font-medium">{formData.farmerName || "Not selected"}</span>
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
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Photos</span>
                    <span className="font-medium">{formData.photos?.length || 0}</span>
                  </div>
                </div>
                <div className="border-t pt-4">
                  <Button
                    type="submit"
                    className="w-full"
                    disabled={
                      !formData.farmerId ||
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
                        Record Stock In
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
                  <li>• Weigh the produce before recording</li>
                  <li>• Assess quality and assign appropriate grade</li>
                  <li>• Take clear photos for documentation</li>
                  <li>• Generate receipt for farmer</li>
                  <li>• SMS confirmation will be sent automatically</li>
                </ul>
              </CardContent>
            </Card>
          </div>
        </div>
      </form>
    </div>
  );
}

