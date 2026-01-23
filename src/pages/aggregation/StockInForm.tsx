import { useState, useEffect, useRef } from "react";
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
  IconQrcode,
} from "@tabler/icons-react";
import { cn } from "@/lib/utils";
import { ReceiptGenerator } from "@/components/receipts/ReceiptGenerator";
import { GradingMatrixGuide } from "@/components/quality/GradingMatrixGuide";
import { useAggregation } from "@/contexts/AggregationContext";
import { useAuth } from "@/contexts/AuthContext";
import { searchBatches, confirmStockTransaction, rejectStockTransaction, getStockTransactions } from "@/services/aggregationService";
import { showSuccess, showError } from "@/lib/toast";
import type { StockTransaction } from "@/types/aggregation";
import type { WeightRange, PhysicalCondition, FreshnessLevel } from "@/types/quality";

interface StockInEntry {
  batchId?: string;
  orderId?: string;
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
  const { recordStockIn, centers, fetchCenters, selectedCenter, isLoading: aggregationLoading } = useAggregation();
  const { user } = useAuth();
  
  const [formData, setFormData] = useState<Partial<StockInEntry>>({
    batchId: "",
    orderId: "",
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
  });
  const [batchSearchTerm, setBatchSearchTerm] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [uploadingPhotos, setUploadingPhotos] = useState(false);
  const [receiptOpen, setReceiptOpen] = useState(false);
  const [showMatrixGuide, setShowMatrixGuide] = useState(false);
  const [generatedReceipt, setGeneratedReceipt] = useState<any>(null);
  const [generatedBatchId, setGeneratedBatchId] = useState<string>("");
  const [generatedQRCode, setGeneratedQRCode] = useState<string>("");
  const [foundBatch, setFoundBatch] = useState<StockTransaction | null>(null);
  const [batchSearchResults, setBatchSearchResults] = useState<StockTransaction[]>([]);
  const [isSearchingBatch, setIsSearchingBatch] = useState(false);
  const [showSearchResults, setShowSearchResults] = useState(false);
  const searchResultsRef = useRef<HTMLDivElement>(null);
  const [pendingTransactions, setPendingTransactions] = useState<StockTransaction[]>([]);
  const [isLoadingPending, setIsLoadingPending] = useState(false);
  const [confirmingTransactionId, setConfirmingTransactionId] = useState<string | null>(null);
  const [rejectDialogOpen, setRejectDialogOpen] = useState(false);
  const [selectedTransactionForReject, setSelectedTransactionForReject] = useState<StockTransaction | null>(null);
  const [rejectionReason, setRejectionReason] = useState("");

  // Fetch centers and pending transactions on mount
  useEffect(() => {
    fetchCenters();
    fetchPendingTransactions();
  }, [fetchCenters, selectedCenter]);

  // Close search results when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchResultsRef.current && !searchResultsRef.current.contains(event.target as Node)) {
        setShowSearchResults(false);
      }
    };

    if (showSearchResults) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [showSearchResults]);

  // Fetch pending transactions
  const fetchPendingTransactions = async () => {
    if (!selectedCenter?.id) return;
    setIsLoadingPending(true);
    try {
      const transactions = await getStockTransactions({
        centerId: selectedCenter.id,
        type: "stock_in",
        status: "PENDING_CONFIRMATION",
      });
      setPendingTransactions(transactions);
    } catch (error) {
      console.error("Error fetching pending transactions:", error);
    } finally {
      setIsLoadingPending(false);
    }
  };

  // Handle confirm transaction
  const handleConfirmTransaction = async (transactionId: string) => {
    setConfirmingTransactionId(transactionId);
    try {
      const result = await confirmStockTransaction(transactionId);
      if (result.data) {
        showSuccess("Transaction Confirmed", "Stock transaction has been confirmed and inventory updated");
        await fetchPendingTransactions(); // Refresh list
      } else {
        showError("Failed to confirm", result.error || "An error occurred");
      }
    } catch (error) {
      showError("Failed to confirm", "An error occurred while confirming the transaction");
    } finally {
      setConfirmingTransactionId(null);
    }
  };

  // Handle reject transaction
  const handleRejectTransaction = async () => {
    if (!selectedTransactionForReject || !rejectionReason.trim()) {
      showError("Validation Error", "Please provide a rejection reason");
      return;
    }

    try {
      const result = await rejectStockTransaction(selectedTransactionForReject.id, rejectionReason);
      if (result.data) {
        showSuccess("Transaction Rejected", "Stock transaction has been rejected");
        setRejectDialogOpen(false);
        setSelectedTransactionForReject(null);
        setRejectionReason("");
        await fetchPendingTransactions(); // Refresh list
      } else {
        showError("Failed to reject", result.error || "An error occurred");
      }
    } catch (error) {
      showError("Failed to reject", "An error occurred while rejecting the transaction");
    }
  };

  // Search for batches using PostgreSQL full-text search
  useEffect(() => {
    const searchBatch = async () => {
      if (batchSearchTerm.trim().length >= 2) {
        setIsSearchingBatch(true);
        setShowSearchResults(true);
        try {
          // Use the specialized batch search endpoint with full-text search
          const results = await searchBatches(batchSearchTerm, 10);
          
          setBatchSearchResults(results);
          
          if (results.length > 0) {
            // Use the most recent transaction (already sorted by rank and date)
            const latestBatch = results[0];
            setFoundBatch(latestBatch);
            // Auto-fill batch ID if exact match
            if (latestBatch.batchId?.toLowerCase() === batchSearchTerm.toLowerCase()) {
              setFormData((prev) => ({ ...prev, batchId: latestBatch.batchId }));
            }
          } else {
            setFoundBatch(null);
          }
        } catch (error) {
          console.error("Error searching for batch:", error);
          setFoundBatch(null);
          setBatchSearchResults([]);
        } finally {
          setIsSearchingBatch(false);
        }
      } else {
        setFoundBatch(null);
        setBatchSearchResults([]);
        setShowSearchResults(false);
        if (batchSearchTerm.trim().length === 0) {
          setFormData((prev) => ({ ...prev, batchId: "" }));
        }
        setIsSearchingBatch(false);
      }
    };

    const timeoutId = setTimeout(searchBatch, 500); // Debounce search
    return () => clearTimeout(timeoutId);
  }, [batchSearchTerm]);

  // Handle clicking on a search result to fill the form
  const handleSelectBatch = (batch: StockTransaction) => {
    setFormData((prev) => ({
      ...prev,
      batchId: batch.batchId || "",
      variety: batch.variety || prev.variety,
      quantity: batch.quantity || prev.quantity,
      qualityGrade: batch.qualityGrade || prev.qualityGrade,
      orderId: batch.orderId || prev.orderId,
    }));
    setFoundBatch(batch);
    setBatchSearchTerm(batch.batchId || "");
    setShowSearchResults(false);
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

  const generateBatchId = () => {
    const timestamp = Date.now();
    const random = Math.floor(Math.random() * 1000);
    return `BATCH-${timestamp}-${random}`;
  };

  const generateQRCode = (batchId: string) => {
    // Generate QR code value - in production, this would be a URL or encoded data
    return `QR-${batchId}`;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.variety || !formData.quantity || !formData.qualityGrade) {
      return;
    }

    if (!selectedCenter && centers.length > 0) {
      // Auto-select first center if none selected
      // In production, this would come from user's assigned center
    }

    setIsSubmitting(true);
    
    try {
      // Use existing batchId if found, otherwise generate new one
      const batchId = formData.batchId || generateBatchId();
      const qrCode = generateQRCode(batchId);
      
      // Prepare stock transaction data
      const stockTransaction = {
        centerId: selectedCenter?.id || centers[0]?.id || "",
        centerName: selectedCenter?.name || centers[0]?.name || "",
        type: "stock_in" as const,
        // Include farmer info from found batch if available
        farmerId: foundBatch?.farmerId,
        farmerName: foundBatch?.farmerName,
        orderId: formData.orderId,
        variety: formData.variety,
        quantity: formData.quantity || 0,
        qualityGrade: formData.qualityGrade as "A" | "B" | "C",
        photos: formData.photos || [],
        notes: formData.notes,
        batchId,
        qrCode,
        createdBy: user?.id || "",
      };

      // Record stock in via context
      await recordStockIn(stockTransaction);
      
      setGeneratedBatchId(batchId);
      setGeneratedQRCode(qrCode);

      // Generate receipt data
      const receiptData = {
        receiptId: `REC-${Date.now()}`,
        type: "stock_in" as const,
        date: new Date().toISOString(),
        farmerName: foundBatch?.farmerName || "N/A",
        variety: formData.variety,
        quantity: formData.quantity,
        qualityGrade: formData.qualityGrade,
        location: selectedCenter?.name || centers[0]?.name || "Aggregation Center",
        transactionId: batchId,
        qrCode: qrCode,
      };

      setGeneratedReceipt(receiptData);
      setReceiptOpen(true);

      // Reset form after showing receipt
      setFormData({
        batchId: "",
        variety: "",
        quantity: 0,
        qualityGrade: undefined,
        photos: [],
        notes: "",
      });
      setBatchSearchTerm("");
      setFoundBatch(null);
      setBatchSearchResults([]);
      setShowSearchResults(false);
    } catch (error) {
      console.error("Failed to record stock in:", error);
      // Error handling is done by context
    } finally {
      setIsSubmitting(false);
    }
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

      {/* Pending Confirmations Section */}
      {pendingTransactions.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Pending Confirmations</CardTitle>
            <CardDescription>
              Stock transactions created at pickup confirmation, awaiting your approval
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {pendingTransactions.map((transaction) => (
                <div
                  key={transaction.id}
                  className="p-4 border rounded-lg bg-yellow-50 border-yellow-200"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <Badge variant="outline" className="bg-yellow-100 text-yellow-800">
                          Pending
                        </Badge>
                        {transaction.batchId && (
                          <span className="text-sm font-mono text-muted-foreground">
                            {transaction.batchId}
                          </span>
                        )}
                      </div>
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-sm">
                        <div>
                          <span className="text-muted-foreground">Farmer:</span>
                          <p className="font-medium">{transaction.farmerName || "N/A"}</p>
                        </div>
                        <div>
                          <span className="text-muted-foreground">Variety:</span>
                          <p className="font-medium">{transaction.variety}</p>
                        </div>
                        <div>
                          <span className="text-muted-foreground">Quantity:</span>
                          <p className="font-medium">{transaction.quantity} kg</p>
                        </div>
                        <div>
                          <span className="text-muted-foreground">Grade:</span>
                          <Badge variant="outline" className={qualityGrades.find(g => g.value === transaction.qualityGrade)?.color}>
                            Grade {transaction.qualityGrade}
                          </Badge>
                        </div>
                      </div>
                      {transaction.notes && (
                        <p className="text-xs text-muted-foreground mt-2">{transaction.notes}</p>
                      )}
                    </div>
                    <div className="flex gap-2 ml-4">
                      <Button
                        size="sm"
                        onClick={() => handleConfirmTransaction(transaction.id)}
                        disabled={confirmingTransactionId === transaction.id}
                      >
                        {confirmingTransactionId === transaction.id ? (
                          <>
                            <IconLoader2 className="mr-2 h-4 w-4 animate-spin" />
                            Confirming...
                          </>
                        ) : (
                          <>
                            <IconCheck className="mr-2 h-4 w-4" />
                            Confirm
                          </>
                        )}
                      </Button>
                      <Button
                        size="sm"
                        variant="destructive"
                        onClick={() => {
                          setSelectedTransactionForReject(transaction);
                          setRejectDialogOpen(true);
                        }}
                      >
                        <IconX className="mr-2 h-4 w-4" />
                        Reject
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      <form onSubmit={handleSubmit}>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 relative">
          {/* Main Form */}
          <div className="lg:col-span-2 space-y-6 overflow-visible">
            {/* Batch ID Selection */}
            <Card className="relative">
              <CardHeader>
                <CardTitle>Batch Information</CardTitle>
                <CardDescription>Search for existing batch ID or leave blank to generate a new one</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4 overflow-visible">
                <div className="space-y-2">
                  <Label>Batch ID (Optional)</Label>
                  <div className="relative z-10">
                    <Input
                      placeholder="Search for existing batch ID (e.g., BATCH-1234567890-123)..."
                      value={batchSearchTerm}
                      onChange={(e) => {
                        setBatchSearchTerm(e.target.value);
                        setFormData((prev) => ({ ...prev, batchId: e.target.value }));
                        setShowSearchResults(true);
                      }}
                      onFocus={() => {
                        if (batchSearchResults.length > 0) {
                          setShowSearchResults(true);
                        }
                      }}
                    />
                    {/* Search Results Dropdown */}
                    {showSearchResults && batchSearchResults.length > 0 && batchSearchTerm.trim().length >= 2 && (
                      <div 
                        ref={searchResultsRef}
                        className="absolute z-[9999] w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-xl max-h-64 overflow-y-auto"
                        style={{ position: 'absolute', top: '100%' }}
                      >
                        <div className="p-2 text-xs font-semibold text-muted-foreground border-b">
                          Select a batch to auto-fill form:
                        </div>
                        {batchSearchResults.map((batch) => (
                          <button
                            key={batch.id}
                            type="button"
                            onClick={() => handleSelectBatch(batch)}
                            className="w-full text-left p-3 hover:bg-blue-50 transition-colors border-b last:border-b-0"
                          >
                            <div className="flex items-start justify-between">
                              <div className="flex-1">
                                <div className="flex items-center gap-2 mb-1">
                                  <span className="font-mono text-sm font-medium text-primary">
                                    {batch.batchId}
                                  </span>
                                  {batch.status === "PENDING_CONFIRMATION" && (
                                    <Badge variant="outline" className="bg-yellow-100 text-yellow-800 text-xs">
                                      Pending
                                    </Badge>
                                  )}
                                </div>
                                {batch.farmerName && (
                                  <p className="text-xs text-muted-foreground mb-1">
                                    Farmer: {batch.farmerName}
                                  </p>
                                )}
                                <div className="flex items-center gap-3 text-xs text-muted-foreground">
                                  <span>Variety: {batch.variety}</span>
                                  <span>•</span>
                                  <span>Quantity: {batch.quantity} kg</span>
                                  <span>•</span>
                                  <Badge variant="outline" className={qualityGrades.find(g => g.value === batch.qualityGrade)?.color}>
                                    Grade {batch.qualityGrade}
                                  </Badge>
                                </div>
                                {batch.orderId && (
                                  <p className="text-xs text-muted-foreground mt-1">
                                    Order: {batch.orderId}
                                  </p>
                                )}
                              </div>
                              <IconCheck className="h-4 w-4 text-primary ml-2 flex-shrink-0" />
                            </div>
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                  {isSearchingBatch && (
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <IconLoader2 className="h-4 w-4 animate-spin" />
                      Searching for batch...
                    </div>
                  )}
                  {foundBatch && !showSearchResults && (
                    <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="font-medium">Selected Batch</p>
                          <p className="text-sm text-muted-foreground">Batch ID: {foundBatch.batchId}</p>
                          {foundBatch.farmerName && (
                            <p className="text-sm text-muted-foreground">Farmer: {foundBatch.farmerName}</p>
                          )}
                          <p className="text-sm text-muted-foreground">
                            Variety: {foundBatch.variety} • Quantity: {foundBatch.quantity} kg • Grade: {foundBatch.qualityGrade}
                          </p>
                        </div>
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() => {
                            setBatchSearchTerm("");
                            setFormData((prev) => ({ ...prev, batchId: "" }));
                            setFoundBatch(null);
                            setBatchSearchResults([]);
                          }}
                        >
                          <IconX className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  )}
                  {batchSearchTerm && !foundBatch && !isSearchingBatch && batchSearchTerm.length >= 2 && batchSearchResults.length === 0 && (
                    <div className="p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                      <p className="text-sm text-yellow-800">
                        Batch not found. A new batch ID will be generated when you submit.
                      </p>
                    </div>
                  )}
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
                    <span className="text-muted-foreground">Batch ID</span>
                    <span className="font-medium font-mono text-xs">
                      {formData.batchId || (foundBatch?.batchId) || "Will be generated"}
                    </span>
                  </div>
                  {foundBatch && foundBatch.farmerName && (
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Farmer</span>
                      <span className="font-medium">{foundBatch.farmerName}</span>
                    </div>
                  )}
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
                  {generatedBatchId && (
                    <>
                      <div className="border-t pt-4 mt-4 space-y-2">
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-muted-foreground">Generated Batch ID:</span>
                          <span className="font-mono font-medium text-xs">{generatedBatchId}</span>
                        </div>
                        {generatedQRCode && (
                          <div className="flex items-center justify-between text-sm">
                            <span className="text-muted-foreground">QR Code:</span>
                            <div className="flex items-center gap-2">
                              <IconQrcode className="h-4 w-4" />
                              <span className="font-mono text-xs">{generatedQRCode}</span>
                            </div>
                          </div>
                        )}
                      </div>
                    </>
                  )}
                </div>
                <div className="border-t pt-4">
                  <Button
                    type="submit"
                    className="w-full"
                    disabled={
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
                        Record Stock In & Generate Receipt
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
                  <li>• Search for existing batch ID if available</li>
                  <li>• New batch ID will be generated automatically if not found</li>
                  <li>• Weigh the produce before recording</li>
                  <li>• Assess quality and assign appropriate grade</li>
                  <li>• Take clear photos for documentation</li>
                  <li>• Generate receipt with batch information</li>
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
            // TODO: Implement actual download
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

      {/* Reject Transaction Dialog */}
      <Dialog open={rejectDialogOpen} onOpenChange={setRejectDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Reject Stock Transaction</DialogTitle>
            <DialogDescription>
              Please provide a reason for rejecting this transaction. The farmer will be notified.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            {selectedTransactionForReject && (
              <div className="p-3 bg-muted rounded-lg text-sm">
                <p><strong>Batch ID:</strong> {selectedTransactionForReject.batchId || "N/A"}</p>
                <p><strong>Farmer:</strong> {selectedTransactionForReject.farmerName || "N/A"}</p>
                <p><strong>Quantity:</strong> {selectedTransactionForReject.quantity} kg</p>
              </div>
            )}
            <div className="space-y-2">
              <Label htmlFor="rejectionReason">Rejection Reason *</Label>
              <Textarea
                id="rejectionReason"
                placeholder="Enter reason for rejection..."
                value={rejectionReason}
                onChange={(e) => setRejectionReason(e.target.value)}
                rows={4}
              />
            </div>
            <div className="flex justify-end gap-2">
              <Button
                variant="outline"
                onClick={() => {
                  setRejectDialogOpen(false);
                  setSelectedTransactionForReject(null);
                  setRejectionReason("");
                }}
              >
                Cancel
              </Button>
              <Button
                variant="destructive"
                onClick={handleRejectTransaction}
                disabled={!rejectionReason.trim()}
              >
                Reject Transaction
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}

