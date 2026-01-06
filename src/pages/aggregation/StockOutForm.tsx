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
  IconTruck,
} from "@tabler/icons-react";
import { cn } from "@/lib/utils";

interface StockOutEntry {
  buyerId: string;
  buyerName: string;
  orderId?: string;
  inventoryId?: string; // Link to inventory batch
  farmerId?: string; // Track farmer origin
  farmerName?: string; // Track farmer origin
  variety: string;
  quantity: number; // kg
  qualityGrade: "A" | "B" | "C";
  vehicleDetails?: string;
  driverName?: string;
  driverPhone?: string;
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

export function StockOutForm() {
  const [formData, setFormData] = useState<Partial<StockOutEntry>>({
    buyerId: "",
    buyerName: "",
    orderId: "",
    inventoryId: "",
    farmerId: "",
    farmerName: "",
    variety: "",
    quantity: 0,
    qualityGrade: undefined,
    vehicleDetails: "",
    driverName: "",
    driverPhone: "",
    photos: [],
    notes: "",
  });
  const [searchTerm, setSearchTerm] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [uploadingPhotos, setUploadingPhotos] = useState(false);
  const [availableInventory, setAvailableInventory] = useState<any[]>([]);
  const [selectedInventoryBatch, setSelectedInventoryBatch] = useState<any>(null);

  // Sample buyers for search - TODO: Replace with API
  const sampleBuyers = [
    { id: "B001", name: "John Mwangi", phone: "+254712345678" },
    { id: "B002", name: "Jane Wanjiru", phone: "+254723456789" },
    { id: "B003", name: "Mike Ochieng", phone: "+254734567890" },
  ];

  // Sample inventory for selection - TODO: Replace with API
  const sampleInventory = [
    {
      id: "INV-001",
      farmerId: "F001",
      farmerName: "James Mutua",
      variety: "kenya",
      varietyLabel: "Kenya",
      qualityGrade: "A" as const,
      availableQuantity: 500,
      stockInDate: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
    },
    {
      id: "INV-002",
      farmerId: "F002",
      farmerName: "Mary Wanjiku",
      variety: "spk004",
      varietyLabel: "SPK004",
      qualityGrade: "A" as const,
      availableQuantity: 300,
      stockInDate: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
    },
    {
      id: "INV-003",
      farmerId: "F003",
      farmerName: "Peter Kamau",
      variety: "kabode",
      varietyLabel: "Kabode",
      qualityGrade: "B" as const,
      availableQuantity: 200,
      stockInDate: new Date(Date.now() - 8 * 24 * 60 * 60 * 1000).toISOString(),
    },
  ];

  const filteredBuyers = sampleBuyers.filter(
    (buyer) =>
      buyer.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      buyer.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      buyer.phone.includes(searchTerm)
  );

  const handleInventorySelection = (batch: any) => {
    setSelectedInventoryBatch(batch);
    setFormData((prev) => ({
      ...prev,
      inventoryId: batch.id,
      farmerId: batch.farmerId,
      farmerName: batch.farmerName,
      variety: batch.variety,
      qualityGrade: batch.qualityGrade,
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.buyerId || !formData.variety || !formData.quantity || !formData.qualityGrade) {
      return;
    }

    setIsSubmitting(true);
    // TODO: Replace with actual API call
    setTimeout(() => {
      console.log("Stock Out Entry:", formData);
      // Reset form
      setFormData({
        buyerId: "",
        buyerName: "",
        orderId: "",
        variety: "",
        quantity: 0,
        qualityGrade: undefined,
        vehicleDetails: "",
        driverName: "",
        driverPhone: "",
        photos: [],
        notes: "",
      });
      setSearchTerm("");
      setIsSubmitting(false);
      alert("Stock out entry recorded successfully!");
    }, 2000);
  };

  const selectedGrade = qualityGrades.find((g) => g.value === formData.qualityGrade);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold">Stock Out</h1>
        <p className="text-sm sm:text-base text-muted-foreground mt-1">
          Record outgoing OFSP produce dispatch
        </p>
      </div>

      <form onSubmit={handleSubmit}>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Form */}
          <div className="lg:col-span-2 space-y-6">
            {/* Inventory Selection - Select which farmer's produce to dispatch */}
            <Card>
              <CardHeader>
                <CardTitle>Select Inventory Batch</CardTitle>
                <CardDescription>Choose the produce batch to dispatch (includes farmer origin)</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {!selectedInventoryBatch ? (
                  <div className="space-y-2">
                    <Label>Available Inventory</Label>
                    <div className="border rounded-lg max-h-64 overflow-y-auto">
                      {sampleInventory.map((batch) => (
                        <button
                          key={batch.id}
                          type="button"
                          onClick={() => handleInventorySelection(batch)}
                          className="w-full text-left p-4 hover:bg-muted transition-colors border-b last:border-b-0"
                        >
                          <div className="flex items-center justify-between">
                            <div>
                              <p className="font-medium">{batch.varietyLabel} - Grade {batch.qualityGrade}</p>
                              <p className="text-sm text-muted-foreground">
                                Farmer: {batch.farmerName} ({batch.farmerId})
                              </p>
                              <p className="text-sm text-muted-foreground">
                                Available: {batch.availableQuantity} kg
                              </p>
                            </div>
                            <Badge variant="outline" className="bg-green-100 text-green-800">
                              Grade {batch.qualityGrade}
                            </Badge>
                          </div>
                        </button>
                      ))}
                    </div>
                  </div>
                ) : (
                  <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg space-y-2">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium">Selected Batch: {selectedInventoryBatch.id}</p>
                        <p className="text-sm text-muted-foreground">
                          {selectedInventoryBatch.varietyLabel} - Grade {selectedInventoryBatch.qualityGrade}
                        </p>
                        <p className="text-sm font-semibold text-primary mt-2">
                          From Farmer: {selectedInventoryBatch.farmerName}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          Farmer ID: {selectedInventoryBatch.farmerId}
                        </p>
                        <p className="text-sm text-muted-foreground mt-1">
                          Available: {selectedInventoryBatch.availableQuantity} kg
                        </p>
                      </div>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => {
                          setSelectedInventoryBatch(null);
                          setFormData((prev) => ({
                            ...prev,
                            inventoryId: "",
                            farmerId: "",
                            farmerName: "",
                            variety: "",
                            qualityGrade: undefined,
                          }));
                        }}
                      >
                        <IconX className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Buyer Selection */}
            <Card>
              <CardHeader>
                <CardTitle>Buyer Information</CardTitle>
                <CardDescription>Select or search for the buyer</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label>Search Buyer</Label>
                  <Input
                    placeholder="Search by name, ID, or phone..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                  {searchTerm && filteredBuyers.length > 0 && (
                    <div className="border rounded-lg mt-2 max-h-48 overflow-y-auto">
                      {filteredBuyers.map((buyer) => (
                        <button
                          key={buyer.id}
                          type="button"
                          onClick={() => {
                            setFormData((prev) => ({
                              ...prev,
                              buyerId: buyer.id,
                              buyerName: buyer.name,
                            }));
                            setSearchTerm("");
                          }}
                          className="w-full text-left p-3 hover:bg-muted transition-colors border-b last:border-b-0"
                        >
                          <div className="font-medium">{buyer.name}</div>
                          <div className="text-sm text-muted-foreground">
                            {buyer.id} • {buyer.phone}
                          </div>
                        </button>
                      ))}
                    </div>
                  )}
                </div>
                {formData.buyerName && (
                  <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium">{formData.buyerName}</p>
                        <p className="text-sm text-muted-foreground">ID: {formData.buyerId}</p>
                      </div>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => {
                          setFormData((prev) => ({ ...prev, buyerId: "", buyerName: "" }));
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

            {/* Dispatch Quantity */}
            <Card>
              <CardHeader>
                <CardTitle>Dispatch Quantity</CardTitle>
                <CardDescription>Specify quantity to dispatch from selected batch</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="p-3 bg-muted rounded-lg space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Selected Variety:</span>
                    <span className="font-medium">
                      {selectedInventoryBatch
                        ? selectedInventoryBatch.varietyLabel
                        : "Select inventory batch first"}
                    </span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Quality Grade:</span>
                    {formData.qualityGrade ? (
                      <Badge variant="outline" className={qualityGrades.find(g => g.value === formData.qualityGrade)?.color}>
                        Grade {formData.qualityGrade}
                      </Badge>
                    ) : (
                      <span>-</span>
                    )}
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Available:</span>
                    <span className="font-medium">
                      {selectedInventoryBatch ? `${selectedInventoryBatch.availableQuantity} kg` : "-"}
                    </span>
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="quantity">Dispatch Quantity (kg) *</Label>
                  <Input
                    id="quantity"
                    type="number"
                    placeholder="0"
                    min={0}
                    max={selectedInventoryBatch?.availableQuantity || undefined}
                    step={0.1}
                    value={formData.quantity || ""}
                    onChange={(e) =>
                      setFormData((prev) => ({ ...prev, quantity: parseFloat(e.target.value) || 0 }))
                    }
                    disabled={!selectedInventoryBatch}
                  />
                  {selectedInventoryBatch && formData.quantity > selectedInventoryBatch.availableQuantity && (
                    <p className="text-sm text-red-600">
                      Quantity exceeds available stock ({selectedInventoryBatch.availableQuantity} kg)
                    </p>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Transport Details */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <IconTruck className="h-5 w-5" />
                  Transport Details
                </CardTitle>
                <CardDescription>Vehicle and driver information</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="vehicle">Vehicle Details</Label>
                  <Input
                    id="vehicle"
                    placeholder="e.g., KCA 123X, Toyota Hilux"
                    value={formData.vehicleDetails}
                    onChange={(e) => setFormData((prev) => ({ ...prev, vehicleDetails: e.target.value }))}
                  />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="driverName">Driver Name</Label>
                    <Input
                      id="driverName"
                      placeholder="Driver full name"
                      value={formData.driverName}
                      onChange={(e) => setFormData((prev) => ({ ...prev, driverName: e.target.value }))}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="driverPhone">Driver Phone</Label>
                    <Input
                      id="driverPhone"
                      type="tel"
                      placeholder="07XX XXX XXX"
                      value={formData.driverPhone}
                      onChange={(e) => setFormData((prev) => ({ ...prev, driverPhone: e.target.value }))}
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="notes">Dispatch Notes (Optional)</Label>
                  <Textarea
                    id="notes"
                    placeholder="Any additional notes about the dispatch..."
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
                <CardDescription>Upload photos of the dispatch</CardDescription>
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
                <CardTitle>Stock Out Summary</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  <div className="p-3 bg-primary/10 rounded-lg">
                    <p className="text-xs font-semibold text-primary mb-1">FARMER ORIGIN</p>
                    <p className="text-sm font-medium">{formData.farmerName || "Not selected"}</p>
                    <p className="text-xs text-muted-foreground">{formData.farmerId || "-"}</p>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Buyer</span>
                    <span className="font-medium">{formData.buyerName || "Not selected"}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Variety</span>
                    <span className="font-medium">
                      {selectedInventoryBatch?.varietyLabel || "Not selected"}
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
                  {formData.vehicleDetails && (
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Vehicle</span>
                      <span className="font-medium">{formData.vehicleDetails}</span>
                    </div>
                  )}
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
                      !formData.buyerId ||
                      !formData.inventoryId ||
                      !formData.farmerId ||
                      !formData.quantity ||
                      isSubmitting ||
                      (selectedInventoryBatch && formData.quantity > selectedInventoryBatch.availableQuantity)
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
                        Record Stock Out
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
                  <li>• Verify quantity matches order</li>
                  <li>• Confirm quality grade before dispatch</li>
                  <li>• Record vehicle and driver details</li>
                  <li>• Take photos of loaded produce</li>
                  <li>• Update inventory automatically</li>
                </ul>
              </CardContent>
            </Card>
          </div>
        </div>
      </form>
    </div>
  );
}
