import { useState, useEffect, useRef } from "react";
import { createPortal } from "react-dom";
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
import { ReceiptGenerator } from "@/components/receipts/ReceiptGenerator";
import { useAggregation } from "@/contexts/AggregationContext";
import { useAuth } from "@/contexts/AuthContext";
import { searchOrders, type OrderSearchResult, createStockOut } from "@/services/aggregationService";
import { showSuccess, showError } from "@/lib/toast";

interface StockOutEntry {
  buyerId: string;
  buyerName: string;
  orderId?: string;
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
  const { recordStockOut, centers, fetchCenters, selectedCenter, inventory, fetchInventory, fetchTransactions, fetchStats, isLoading: aggregationLoading } = useAggregation();
  const { user } = useAuth();
  
  const [formData, setFormData] = useState<Partial<StockOutEntry>>({
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
  const [orderSearchTerm, setOrderSearchTerm] = useState("");
  const [orderSearchResults, setOrderSearchResults] = useState<OrderSearchResult[]>([]);
  const [isSearchingOrders, setIsSearchingOrders] = useState(false);
  const [showSearchResults, setShowSearchResults] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [uploadingPhotos, setUploadingPhotos] = useState(false);
  const [receiptOpen, setReceiptOpen] = useState(false);
  const [generatedReceipt, setGeneratedReceipt] = useState<any>(null);
  const [generatedQRCode, setGeneratedQRCode] = useState<string>("");
  const searchResultsRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const [dropdownPosition, setDropdownPosition] = useState<{ top: number; left: number; width: number } | null>(null);

  // Fetch centers and inventory on mount
  useEffect(() => {
    fetchCenters();
    fetchInventory();
  }, [fetchCenters, fetchInventory]);

  // Update dropdown position when input is focused or search results change
  useEffect(() => {
    const updatePosition = () => {
      if (inputRef.current) {
        const rect = inputRef.current.getBoundingClientRect();
        setDropdownPosition({
          top: rect.bottom + window.scrollY + 4,
          left: rect.left + window.scrollX,
          width: rect.width,
        });
      }
    };

    updatePosition();
    window.addEventListener('scroll', updatePosition, true);
    window.addEventListener('resize', updatePosition);

    return () => {
      window.removeEventListener('scroll', updatePosition, true);
      window.removeEventListener('resize', updatePosition);
    };
  }, [showSearchResults, orderSearchResults]);

  // Debounced order search
  useEffect(() => {
    if (!orderSearchTerm || orderSearchTerm.trim().length < 2) {
      setOrderSearchResults([]);
      setIsSearchingOrders(false);
      return;
    }

    setIsSearchingOrders(true);
    const timeoutId = setTimeout(async () => {
      try {
        const results = await searchOrders(orderSearchTerm.trim(), 10);
        setOrderSearchResults(results);
      } catch (error) {
        console.error("Error searching orders:", error);
        setOrderSearchResults([]);
      } finally {
        setIsSearchingOrders(false);
      }
    }, 300); // 300ms debounce

    return () => clearTimeout(timeoutId);
  }, [orderSearchTerm]);

  // Handle click outside to close dropdown
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        searchResultsRef.current &&
        !searchResultsRef.current.contains(event.target as Node) &&
        inputRef.current &&
        !inputRef.current.contains(event.target as Node)
      ) {
        setShowSearchResults(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  // Handle order selection
  const handleSelectOrder = (order: OrderSearchResult) => {
    setFormData((prev) => ({
      ...prev,
      buyerId: order.buyerId,
      buyerName: order.buyerName,
      orderId: order.id, // Use UUID id, not orderNumber
      variety: order.variety,
      quantity: order.quantity,
      qualityGrade: order.qualityGrade as "A" | "B" | "C",
    }));
    setOrderSearchTerm("");
    setShowSearchResults(false);
    setOrderSearchResults([]);
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

  // Generate QR code for stock out
  const generateQRCode = (transactionId: string) => {
    return `QR-OUT-${transactionId}`;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.buyerId || !formData.variety || !formData.quantity || !formData.qualityGrade) {
      showError("Validation Error", "Please fill in all required fields");
      return;
    }

    if (!selectedCenter && centers.length > 0) {
      // Auto-select first center if none selected
    }

    setIsSubmitting(true);
    
    try {
      // Prepare stock transaction data
      const stockTransaction = {
        centerId: selectedCenter?.id || centers[0]?.id || "",
        centerName: selectedCenter?.name || centers[0]?.name || "",
        type: "stock_out" as const,
        buyerId: formData.buyerId,
        buyerName: formData.buyerName || "",
        orderId: formData.orderId,
        variety: formData.variety,
        quantity: formData.quantity || 0,
        qualityGrade: formData.qualityGrade as "A" | "B" | "C",
        photos: formData.photos || [],
        notes: formData.notes || `${formData.vehicleDetails ? `Vehicle: ${formData.vehicleDetails}. ` : ""}${formData.driverName ? `Driver: ${formData.driverName} (${formData.driverPhone}). ` : ""}`,
        createdBy: user?.id || "",
      };

      // Record stock out via service to get the created transaction
      const result = await createStockOut(stockTransaction);
      
      if (result.error) {
        showError("Failed to Record Stock Out", result.error);
        return;
      }

      if (result.data) {
        // Refresh context state (inventory, transactions, stats)
        // Note: We don't call recordStockOut again as it would try to create the transaction twice
        // Instead, we manually refresh the related data
        try {
          await fetchTransactions();
          await fetchInventory();
          await fetchStats();
        } catch (refreshError) {
          console.error("Failed to refresh data:", refreshError);
          // Don't fail the whole operation if refresh fails
        }

        // Generate QR code
        const qrCode = generateQRCode(result.data.id || `OUT-${Date.now()}`);
        setGeneratedQRCode(qrCode);

        // Generate receipt data
        const receiptData = {
          receiptId: `OUT-${Date.now()}`,
          type: "stock_out" as const,
          date: new Date().toISOString(),
          buyerName: formData.buyerName || "N/A",
          variety: formData.variety,
          quantity: formData.quantity,
          qualityGrade: formData.qualityGrade,
          location: selectedCenter?.name || centers[0]?.name || "Aggregation Center",
          transactionId: result.data.transactionNumber ?? result.data.id,
          qrCode: qrCode,
          orderId: formData.orderId,
        };

        setGeneratedReceipt(receiptData);
        setReceiptOpen(true);
        showSuccess("Stock Out Recorded", "Stock out transaction has been recorded successfully");

        // Reset form after showing receipt
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
        setOrderSearchTerm("");
        setOrderSearchResults([]);
        setShowSearchResults(false);
      }
    } catch (error) {
      console.error("Failed to record stock out:", error);
      showError("Failed to Record Stock Out", error instanceof Error ? error.message : "An error occurred");
    } finally {
      setIsSubmitting(false);
    }
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
            {/* Order/Buyer Selection */}
            <Card>
              <CardHeader>
                <CardTitle>Order & Buyer Information</CardTitle>
                <CardDescription>Search for order by order ID or buyer name</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4 overflow-visible relative">
                <div className="space-y-2">
                  <Label>Search Order (by Order ID or Buyer Name)</Label>
                  <div className="relative z-10" ref={inputRef}>
                    <Input
                      placeholder="Search by order ID (e.g., ORD-1234567890) or buyer name..."
                      value={orderSearchTerm}
                      onChange={(e) => {
                        setOrderSearchTerm(e.target.value);
                        setShowSearchResults(true);
                      }}
                      onFocus={() => {
                        if (orderSearchResults.length > 0) {
                          setShowSearchResults(true);
                        }
                      }}
                    />
                  </div>
                  {/* Search Results Dropdown - Rendered via Portal to avoid clipping */}
                  {showSearchResults && orderSearchResults.length > 0 && orderSearchTerm.trim().length >= 2 && dropdownPosition && typeof document !== 'undefined' && createPortal(
                    <div 
                      ref={searchResultsRef}
                      className="fixed z-[9999] bg-white border border-gray-200 rounded-lg shadow-xl max-h-64 overflow-y-auto"
                      style={{ 
                        top: `${dropdownPosition.top}px`,
                        left: `${dropdownPosition.left}px`,
                        width: `${dropdownPosition.width}px`,
                      }}
                    >
                      <div className="p-2 text-xs font-semibold text-muted-foreground border-b">
                        Select an order to auto-fill form:
                      </div>
                      {orderSearchResults.map((order) => (
                        <button
                          key={order.id}
                          type="button"
                          onClick={() => handleSelectOrder(order)}
                          className="w-full text-left p-3 hover:bg-blue-50 transition-colors border-b last:border-b-0"
                        >
                          <div className="flex items-start justify-between">
                            <div className="flex-1">
                              <div className="flex items-center gap-2 mb-1">
                                <span className="font-mono text-sm font-medium text-primary">
                                  {order.orderNumber}
                                </span>
                                <Badge variant="outline" className="text-xs">
                                  {order.status}
                                </Badge>
                              </div>
                              <p className="text-xs text-muted-foreground mb-1">
                                Buyer: {order.buyerName}
                                {order.buyerPhone && ` • ${order.buyerPhone}`}
                              </p>
                              <div className="flex items-center gap-3 text-xs text-muted-foreground">
                                <span>Variety: {order.variety}</span>
                                <span>•</span>
                                <span>Quantity: {order.quantity} kg</span>
                                <span>•</span>
                                <Badge variant="outline" className={qualityGrades.find(g => g.value === order.qualityGrade)?.color}>
                                  Grade {order.qualityGrade}
                                </Badge>
                              </div>
                              <p className="text-xs text-muted-foreground mt-1">
                                Amount: KES {order.totalAmount.toLocaleString()}
                              </p>
                            </div>
                            <IconCheck className="h-4 w-4 text-primary ml-2 flex-shrink-0" />
                          </div>
                        </button>
                      ))}
                    </div>,
                    document.body
                  )}
                </div>
                <div className="space-y-2">
                  {isSearchingOrders && (
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <IconLoader2 className="h-4 w-4 animate-spin" />
                      Searching for orders...
                    </div>
                  )}
                </div>
                {formData.buyerName && (
                  <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium">{formData.buyerName}</p>
                        <p className="text-sm text-muted-foreground">
                          {formData.orderId && `Order: ${formData.orderId} • `}
                          Buyer ID: {formData.buyerId}
                        </p>
                      </div>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => {
                          setFormData((prev) => ({ 
                            ...prev, 
                            buyerId: "", 
                            buyerName: "",
                            orderId: "",
                            variety: "",
                            quantity: 0,
                            qualityGrade: undefined,
                          }));
                          setOrderSearchTerm("");
                        }}
                      >
                        <IconX className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Produce Details */}
            <Card>
              <CardHeader>
                <CardTitle>Produce Details</CardTitle>
                <CardDescription>Enter dispatch information</CardDescription>
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
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Buyer</span>
                    <span className="font-medium">{formData.buyerName || "Not selected"}</span>
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
                      !formData.variety ||
                      !formData.quantity ||
                      !formData.qualityGrade ||
                      isSubmitting ||
                      aggregationLoading ||
                      centers.length === 0
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

