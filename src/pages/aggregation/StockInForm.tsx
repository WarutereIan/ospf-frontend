import { useState, useEffect, useRef } from "react";
import { createPortal } from "react-dom";
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
  IconInfoCircle,
} from "@tabler/icons-react";
import { cn } from "@/lib/utils";
import { ReceiptGenerator } from "@/components/receipts/ReceiptGenerator";
import { GradingMatrixGuide } from "@/components/quality/GradingMatrixGuide";
import { useAggregation } from "@/contexts/AggregationContext";
import { useAuth } from "@/contexts/AuthContext";
import { useCatalog } from "@/contexts/CatalogContext";
import { searchBatches, searchOrders, searchFarmers, confirmStockTransaction, rejectStockTransaction, getStockTransactions } from "@/services/aggregationService";
import type { OrderSearchResult, FarmerSearchResult } from "@/services/aggregationService";
import { uploadImage, getImageFullUrl } from "@/services/uploadService";
import { showSuccess, showError } from "@/lib/toast";
import { calculateGradeFromMatrix } from "@/data/gradingMatrix";
import {
  weightRangeDefinitions,
  colorIntensityDefinitions,
  physicalConditionDefinitions,
  freshnessDefinitions,
} from "@/data/gradingMatrix";
import type { StockTransaction } from "@/types/aggregation";
import type { WeightRange, PhysicalCondition, FreshnessLevel } from "@/types/quality";

interface StockInEntry {
  batchId?: string;
  orderId?: string;
  /** For direct delivery: farmer who delivered to centre (optional) */
  farmerId?: string;
  farmerName?: string;
  variety: string;
  quantity: number; // kg
  qualityGrade: string;
  // Grading Matrix Criteria
  weightRange: WeightRange | "";
  colorIntensity: number; // 1-10
  physicalCondition: PhysicalCondition | "";
  freshness: FreshnessLevel | "";
  daysSinceHarvest?: number;
  photos: string[];
  notes?: string;
}

export function StockInForm() {
  const { recordStockIn, centers, fetchCenters, selectedCenter, isLoading: aggregationLoading } = useAggregation();
  const { user } = useAuth();
  const { varieties: catalogVarieties, qualityGrades: catalogGrades, getGradeColor } = useCatalog();

  const ofspVarieties = catalogVarieties.filter(v => v.isActive).map(v => ({ value: v.code, label: v.label }));
  const qualityGrades = catalogGrades.filter(g => g.isActive).map(g => ({
    value: g.code,
    label: g.label,
    color: getGradeColor(g.code),
  }));

  const [formData, setFormData] = useState<Partial<StockInEntry>>({
    batchId: "",
    orderId: "",
    farmerId: "",
    farmerName: "",
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
  const inputRef = useRef<HTMLInputElement>(null);
  const [dropdownPosition, setDropdownPosition] = useState<{ top: number; left: number; width: number } | null>(null);
  // Farmer search state (backend PG full-text search)
  const [farmerSearchTerm, setFarmerSearchTerm] = useState("");
  const [farmerSearchResults, setFarmerSearchResults] = useState<FarmerSearchResult[]>([]);
  const [isSearchingFarmers, setIsSearchingFarmers] = useState(false);
  const [showFarmerResults, setShowFarmerResults] = useState(false);
  const farmerInputRef = useRef<HTMLInputElement>(null);
  const farmerResultsRef = useRef<HTMLDivElement>(null);
  const [farmerDropdownPosition, setFarmerDropdownPosition] = useState<{ top: number; left: number; width: number } | null>(null);

  // Order search state
  const [orderSearchTerm, setOrderSearchTerm] = useState("");
  const [orderSearchResults, setOrderSearchResults] = useState<OrderSearchResult[]>([]);
  const [isSearchingOrders, setIsSearchingOrders] = useState(false);
  const [showOrderSearchResults, setShowOrderSearchResults] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState<OrderSearchResult | null>(null);
  const orderInputRef = useRef<HTMLInputElement>(null);
  const orderResultsRef = useRef<HTMLDivElement>(null);
  const [orderDropdownPosition, setOrderDropdownPosition] = useState<{ top: number; left: number; width: number } | null>(null);

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

  // Update dropdown position when input position changes
  useEffect(() => {
    const updatePosition = () => {
      if (inputRef.current && showSearchResults && batchSearchResults.length > 0) {
        const rect = inputRef.current.getBoundingClientRect();
        setDropdownPosition({
          top: rect.bottom + window.scrollY + 4,
          left: rect.left + window.scrollX,
          width: rect.width,
        });
      } else {
        setDropdownPosition(null);
      }
    };

    if (showSearchResults && batchSearchResults.length > 0) {
      updatePosition();
      window.addEventListener('scroll', updatePosition, true);
      window.addEventListener('resize', updatePosition);
    }

    return () => {
      window.removeEventListener('scroll', updatePosition, true);
      window.removeEventListener('resize', updatePosition);
    };
  }, [showSearchResults, batchSearchResults.length, batchSearchTerm]);

  // Close search results when clicking outside
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

    if (showSearchResults) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [showSearchResults]);

  // Order search: debounced
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
      } catch {
        setOrderSearchResults([]);
      } finally {
        setIsSearchingOrders(false);
      }
    }, 400);

    return () => clearTimeout(timeoutId);
  }, [orderSearchTerm]);

  // Order search: dropdown positioning
  useEffect(() => {
    const updatePosition = () => {
      if (orderInputRef.current && showOrderSearchResults && orderSearchResults.length > 0) {
        const rect = orderInputRef.current.getBoundingClientRect();
        setOrderDropdownPosition({
          top: rect.bottom + window.scrollY + 4,
          left: rect.left + window.scrollX,
          width: rect.width,
        });
      } else {
        setOrderDropdownPosition(null);
      }
    };

    if (showOrderSearchResults && orderSearchResults.length > 0) {
      updatePosition();
      window.addEventListener("scroll", updatePosition, true);
      window.addEventListener("resize", updatePosition);
    }

    return () => {
      window.removeEventListener("scroll", updatePosition, true);
      window.removeEventListener("resize", updatePosition);
    };
  }, [showOrderSearchResults, orderSearchResults.length, orderSearchTerm]);

  // Order search: close on click outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        orderResultsRef.current &&
        !orderResultsRef.current.contains(event.target as Node) &&
        orderInputRef.current &&
        !orderInputRef.current.contains(event.target as Node)
      ) {
        setShowOrderSearchResults(false);
      }
    };

    if (showOrderSearchResults) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [showOrderSearchResults]);

  const handleSelectOrder = (order: OrderSearchResult) => {
    setSelectedOrder(order);
    setFormData((prev) => ({
      ...prev,
      orderId: order.id,
      farmerId: "",
      farmerName: "",
      variety: order.variety || prev.variety,
      quantity: order.quantity || prev.quantity,
      qualityGrade: order.qualityGrade || prev.qualityGrade,
    }));
    setOrderSearchTerm("");
    setShowOrderSearchResults(false);
    setOrderSearchResults([]);
  };

  const handleClearOrder = () => {
    setSelectedOrder(null);
    setFormData((prev) => ({ ...prev, orderId: "" }));
    setOrderSearchTerm("");
  };

  // Farmer search: debounced backend PG full-text search
  useEffect(() => {
    if (!farmerSearchTerm || farmerSearchTerm.trim().length < 2) {
      setFarmerSearchResults([]);
      setIsSearchingFarmers(false);
      return;
    }

    setIsSearchingFarmers(true);
    const timeoutId = setTimeout(async () => {
      try {
        const results = await searchFarmers(farmerSearchTerm.trim(), 20);
        setFarmerSearchResults(results);
      } catch {
        setFarmerSearchResults([]);
      } finally {
        setIsSearchingFarmers(false);
      }
    }, 400);

    return () => clearTimeout(timeoutId);
  }, [farmerSearchTerm]);

  // Farmer search: dropdown positioning
  useEffect(() => {
    const updatePosition = () => {
      if (farmerInputRef.current && showFarmerResults && farmerSearchResults.length > 0) {
        const rect = farmerInputRef.current.getBoundingClientRect();
        setFarmerDropdownPosition({
          top: rect.bottom + window.scrollY + 4,
          left: rect.left + window.scrollX,
          width: rect.width,
        });
      } else {
        setFarmerDropdownPosition(null);
      }
    };

    if (showFarmerResults && farmerSearchResults.length > 0) {
      updatePosition();
      window.addEventListener("scroll", updatePosition, true);
      window.addEventListener("resize", updatePosition);
    }
    return () => {
      window.removeEventListener("scroll", updatePosition, true);
      window.removeEventListener("resize", updatePosition);
    };
  }, [showFarmerResults, farmerSearchResults.length, farmerSearchTerm]);

  // Farmer search: close on click outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        farmerResultsRef.current &&
        !farmerResultsRef.current.contains(event.target as Node) &&
        farmerInputRef.current &&
        !farmerInputRef.current.contains(event.target as Node)
      ) {
        setShowFarmerResults(false);
      }
    };
    if (showFarmerResults) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [showFarmerResults]);

  const handleSelectFarmer = (farmerId: string, farmerName: string) => {
    setFormData((prev) => ({ ...prev, farmerId, farmerName }));
    setFarmerSearchTerm("");
    setShowFarmerResults(false);
    setFarmerSearchResults([]);
  };

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
      farmerId: batch.farmerId || prev.farmerId,
      farmerName: batch.farmerName || prev.farmerName,
      // Fill grading matrix criteria if available
      weightRange: (batch as any).weightRange || prev.weightRange,
      colorIntensity: (batch as any).colorIntensity || prev.colorIntensity,
      physicalCondition: (batch as any).physicalCondition || prev.physicalCondition,
      freshness: (batch as any).freshness || prev.freshness,
      daysSinceHarvest: (batch as any).daysSinceHarvest || prev.daysSinceHarvest,
    }));
    setFoundBatch(batch);
    setBatchSearchTerm(batch.batchId || "");
    setShowSearchResults(false);
  };

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
        photos: [...(prev.photos || []), ...urls],
      }));
    } catch (err) {
      showError("Upload failed", err instanceof Error ? err.message : "Failed to upload photos");
    } finally {
      setUploadingPhotos(false);
      event.target.value = "";
    }
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
      showError("Validation Error", "Please fill in all required fields (variety, quantity, quality grade)");
      return;
    }
    // Validate grading matrix criteria
    if (!formData.weightRange || !formData.physicalCondition || !formData.freshness) {
      showError("Validation Error", "Please complete all grading matrix criteria (weight range, physical condition, freshness)");
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
        // Farmer: from direct delivery selector or from selected batch
        farmerId: formData.farmerId || foundBatch?.farmerId,
        farmerName: formData.farmerName || foundBatch?.farmerName,
        orderId: formData.orderId,
        variety: formData.variety,
        quantity: formData.quantity || 0,
        qualityGrade: formData.qualityGrade as "A" | "B" | "C",
        // Grading Matrix Criteria
        weightRange: formData.weightRange || undefined,
        colorIntensity: formData.colorIntensity || undefined,
        physicalCondition: formData.physicalCondition || undefined,
        freshness: formData.freshness || undefined,
        daysSinceHarvest: formData.daysSinceHarvest || undefined,
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
        farmerName: formData.farmerName || foundBatch?.farmerName || "N/A",
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
        farmerId: "",
        farmerName: "",
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
      setOrderSearchTerm("");
      setSelectedOrder(null);
      setOrderSearchResults([]);
      setShowOrderSearchResults(false);
      setFarmerSearchTerm("");
      setFarmerSearchResults([]);
      setShowFarmerResults(false);
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
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 relative" style={{ overflow: 'visible' }}>
          {/* Main Form */}
          <div className="lg:col-span-2 space-y-6" style={{ overflow: 'visible' }}>
            {/* Batch ID Selection */}
            <Card className="relative overflow-visible">
              <CardHeader>
                <CardTitle>Batch Information</CardTitle>
                <CardDescription>Search for existing batch ID or farmer name, or leave blank to generate a new batch</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4 overflow-visible relative">
                <div className="space-y-2">
                  <Label>Batch ID (Optional)</Label>
                  <div className="relative z-10" ref={inputRef}>
                    <Input
                      placeholder="Search by batch ID (e.g., BATCH-1234567890-123) or farmer name..."
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
                  </div>
                </div>
                {/* Search Results Dropdown - Rendered via Portal to avoid clipping */}
                {showSearchResults && batchSearchResults.length > 0 && batchSearchTerm.trim().length >= 2 && dropdownPosition && typeof document !== 'undefined' && createPortal(
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
                    </div>,
                    document.body
                  )}
                <div className="space-y-2">
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

            {/* Order Linking (optional) */}
            <Card className="relative overflow-visible">
              <CardHeader>
                <CardTitle>Link to Order (Optional)</CardTitle>
                <CardDescription>
                  If this delivery fulfils a marketplace order, search and link the order here.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4 overflow-visible relative">
                {selectedOrder ? (
                  <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
                    <div className="flex items-start justify-between">
                      <div>
                        <p className="font-medium text-sm">
                          Order {selectedOrder.orderNumber}
                        </p>
                        <div className="text-xs text-muted-foreground mt-1 space-y-0.5">
                          <p>Buyer: {selectedOrder.buyerName}{selectedOrder.buyerPhone ? ` (${selectedOrder.buyerPhone})` : ""}</p>
                          <p>Variety: {selectedOrder.variety} · Quantity: {selectedOrder.quantity} kg · Grade {selectedOrder.qualityGrade}</p>
                          <p>Amount: KES {selectedOrder.totalAmount.toLocaleString()}</p>
                        </div>
                      </div>
                      <Button type="button" variant="ghost" size="sm" onClick={handleClearOrder}>
                        <IconX className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-2">
                    <Label>Search by Order ID or Buyer Name</Label>
                    <div className="relative z-[5]" ref={orderInputRef}>
                      <Input
                        placeholder="e.g., ORD-1234567890 or buyer name..."
                        value={orderSearchTerm}
                        onChange={(e) => {
                          setOrderSearchTerm(e.target.value);
                          setShowOrderSearchResults(true);
                        }}
                        onFocus={() => {
                          if (orderSearchResults.length > 0) setShowOrderSearchResults(true);
                        }}
                      />
                    </div>
                    {isSearchingOrders && (
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <IconLoader2 className="h-4 w-4 animate-spin" />
                        Searching orders...
                      </div>
                    )}
                    {orderSearchTerm.length >= 2 && !isSearchingOrders && orderSearchResults.length === 0 && (
                      <p className="text-xs text-muted-foreground">No matching orders found.</p>
                    )}
                  </div>
                )}
                {/* Order search dropdown via portal */}
                {showOrderSearchResults && orderSearchResults.length > 0 && orderDropdownPosition && typeof document !== "undefined" && createPortal(
                  <div
                    ref={orderResultsRef}
                    className="fixed z-[9999] bg-white border border-gray-200 rounded-lg shadow-xl max-h-64 overflow-y-auto"
                    style={{
                      top: `${orderDropdownPosition.top}px`,
                      left: `${orderDropdownPosition.left}px`,
                      width: `${orderDropdownPosition.width}px`,
                    }}
                  >
                    <div className="p-2 text-xs font-semibold text-muted-foreground border-b">
                      Select an order to link:
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
                            <p className="text-xs text-muted-foreground">
                              Buyer: {order.buyerName}
                            </p>
                            <div className="flex items-center gap-3 text-xs text-muted-foreground">
                              <span>{order.variety}</span>
                              <span>·</span>
                              <span>{order.quantity} kg</span>
                              <span>·</span>
                              <span>Grade {order.qualityGrade}</span>
                            </div>
                          </div>
                          <IconCheck className="h-4 w-4 text-primary ml-2 flex-shrink-0" />
                        </div>
                      </button>
                    ))}
                  </div>,
                  document.body
                )}
              </CardContent>
            </Card>

            {/* Direct delivery – Farmer (optional) */}
            <Card className="relative overflow-visible">
              <CardHeader>
                <CardTitle>Direct Delivery – Farmer (Optional)</CardTitle>
                <CardDescription>
                  When a farmer delivers directly to the centre (no order, no pickup), search for the farmer so the system can create a listing and notify them.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4 overflow-visible relative">
                {formData.farmerId ? (
                  <div className="p-3 bg-green-50 border border-green-200 rounded-lg">
                    <div className="flex items-start justify-between">
                      <div>
                        <p className="font-medium text-sm">{formData.farmerName}</p>
                        <p className="text-xs text-muted-foreground mt-0.5">
                          A listing will be created and the farmer notified.
                        </p>
                      </div>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => {
                          setFormData((prev) => ({ ...prev, farmerId: "", farmerName: "" }));
                          setFarmerSearchTerm("");
                        }}
                      >
                        <IconX className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-2">
                    <Label>Search Farmer by Name or Phone</Label>
                    <div className="relative z-[4]" ref={farmerInputRef}>
                      <Input
                        placeholder="Type farmer name or phone number..."
                        value={farmerSearchTerm}
                        onChange={(e) => {
                          setFarmerSearchTerm(e.target.value);
                          setShowFarmerResults(true);
                        }}
                        onFocus={() => {
                          if (farmerSearchResults.length > 0 && farmerSearchTerm.length >= 2) setShowFarmerResults(true);
                        }}
                      />
                    </div>
                    {isSearchingFarmers && (
                      <div className="flex items-center gap-2 text-xs text-muted-foreground">
                        <IconLoader2 className="h-3 w-3 animate-spin" />
                        Searching farmers...
                      </div>
                    )}
                    {farmerSearchTerm.length >= 2 && !isSearchingFarmers && farmerSearchResults.length === 0 && (
                      <p className="text-xs text-muted-foreground">No matching farmers found.</p>
                    )}
                  </div>
                )}
                {/* Farmer search dropdown via portal */}
                {showFarmerResults && farmerSearchResults.length > 0 && farmerDropdownPosition && typeof document !== "undefined" && createPortal(
                  <div
                    ref={farmerResultsRef}
                    className="fixed z-[9999] bg-white border border-gray-200 rounded-lg shadow-xl max-h-64 overflow-y-auto"
                    style={{
                      top: `${farmerDropdownPosition.top}px`,
                      left: `${farmerDropdownPosition.left}px`,
                      width: `${farmerDropdownPosition.width}px`,
                    }}
                  >
                    <div className="p-2 text-xs font-semibold text-muted-foreground border-b">
                      Select a farmer ({farmerSearchResults.length} match{farmerSearchResults.length !== 1 ? "es" : ""}):
                    </div>
                    {farmerSearchResults.map((f) => (
                        <button
                          key={f.userId}
                          type="button"
                          onClick={() => handleSelectFarmer(f.userId, f.name)}
                          className="w-full text-left p-3 hover:bg-green-50 transition-colors border-b last:border-b-0"
                        >
                          <div className="flex items-center justify-between">
                            <div>
                              <span className="text-sm font-medium">{f.name}</span>
                              {f.phone && (
                                <span className="text-xs text-muted-foreground ml-2">{f.phone}</span>
                              )}
                              {f.ward && (
                                <span className="text-xs text-muted-foreground ml-2">({f.ward})</span>
                              )}
                            </div>
                            <IconCheck className="h-4 w-4 text-primary ml-2 flex-shrink-0" />
                          </div>
                        </button>
                    ))}
                  </div>,
                  document.body
                )}
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
                      value={formData.weightRange || ""}
                      onValueChange={(value) =>
                        setFormData((prev) => ({ ...prev, weightRange: value as WeightRange }))
                      }
                    >
                      <SelectTrigger>
                        <SelectValue>{formData.weightRange ? undefined : "Select weight range"}</SelectValue>
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
                        <SelectValue>{formData.physicalCondition ? undefined : "Select physical condition"}</SelectValue>
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
                          <SelectValue>{formData.freshness ? undefined : "Select freshness level"}</SelectValue>
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
                  {selectedOrder && (
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Order</span>
                      <span className="font-medium font-mono text-xs">{selectedOrder.orderNumber}</span>
                    </div>
                  )}
                  {(formData.farmerName || foundBatch?.farmerName) && (
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Farmer</span>
                      <span className="font-medium">{formData.farmerName || foundBatch?.farmerName}</span>
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
                  <li>• Search for existing batch ID or farmer name if available</li>
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

