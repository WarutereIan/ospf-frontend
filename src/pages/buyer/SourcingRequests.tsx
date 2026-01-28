import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Progress } from "@/components/ui/progress";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { BatchTraceabilityDialog } from "@/components/buyer/BatchTraceabilityDialog";
import {
  IconPlus,
  IconCarrot,
  IconPackage,
  IconSeeding,
  IconArrowRight,
  IconCheck,
  IconX,
  IconArrowLeft,
  IconDownload,
  IconStar,
  IconUser,
  IconMapPin,
  IconCalendar,
  IconCurrency,
  IconLoader2,
  IconRepeat,
  IconQrcode,
} from "@tabler/icons-react";
import { useMarketplace } from "@/contexts/MarketplaceContext";
import type { SourcingRequest, SupplierOffer, SourcingRequestFilters } from "@/types/marketplace";
import { OFSPVariety, OFSP_VARIETY_LABELS, OFSP_VARIETY_VALUES } from "@/types/shared/enums";
import { showSuccess, showError, formatApiError } from "@/lib/toast";

// Types imported from marketplace.ts

type TabType = "active" | "drafts" | "completed";
type ViewType = "list" | "create" | "manage";

/** Product type options matching backend CreateSourcingRequestDto enum */
const PRODUCT_TYPE_OPTIONS = [
  { value: "FRESH_ROOTS", label: "Fresh OFSP Roots" },
  { value: "PROCESS_GRADE", label: "OFSP Flour" },
  { value: "PLANTING_VINES", label: "Planting Vines" },
  { value: "OFSP", label: "OFSP (General)" },
] as const;

/** Variety options matching backend OFSPVariety enum */
const VARIETY_OPTIONS = OFSP_VARIETY_VALUES.map(value => ({
  value,
  label: OFSP_VARIETY_LABELS[value as OFSPVariety],
}));

function frontendProductTypeToEnum(
  v: SourcingRequest["productType"]
): (typeof PRODUCT_TYPE_OPTIONS)[number]["value"] {
  const map: Record<string, (typeof PRODUCT_TYPE_OPTIONS)[number]["value"]> = {
    fresh_roots: "FRESH_ROOTS",
    process_grade: "PROCESS_GRADE",
    planting_vines: "PLANTING_VINES",
  };
  return map[v] ?? "FRESH_ROOTS";
}

interface CreateRequestForm {
  productType: string;
  variety: string;
  quantity: string;
  quantityUnit: "kg" | "tons" | "bags";
  qualityGrade: string;
  priceMin: string;
  priceMax: string;
  deadline: string;
  deliveryLocation: string;
  additionalRequirements: string;
  isRecurring: boolean;
  recurringFrequency: "weekly" | "biweekly" | "monthly" | "quarterly" | "custom";
  recurringEndDate: string;
}

export function SourcingRequests() {
  const navigate = useNavigate();
  const { 
    sourcingRequests, 
    fetchSourcingRequests, 
    fetchSourcingRequestById,
    createSourcingRequest: createRequest,
    updateSourcingRequest: updateRequest,
    publishSourcingRequest: publishRequest,
    closeSourcingRequest: closeRequest,
    acceptSupplierOffer,
    clearSelectedSourcingRequest,
    selectedSourcingRequest,
    isLoading,
    sourcingRequestFilters,
    setSourcingRequestFilters,
  } = useMarketplace();
  
  const [view, setView] = useState<ViewType>("list");
  const [activeTab, setActiveTab] = useState<TabType>("active");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedOffer, setSelectedOffer] = useState<SupplierOffer | null>(null);
  const [reviewDialogOpen, setReviewDialogOpen] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [isAcceptingOffer, setIsAcceptingOffer] = useState(false);
  const [traceabilityDialogOpen, setTraceabilityDialogOpen] = useState(false);
  const [selectedBatchId, setSelectedBatchId] = useState<string | undefined>(undefined);
  const [closeConfirmDialogOpen, setCloseConfirmDialogOpen] = useState(false);
  const [isClosingRequest, setIsClosingRequest] = useState(false);
  const [publishingRequestId, setPublishingRequestId] = useState<string | null>(null);
  const [formData, setFormData] = useState<CreateRequestForm>({
    productType: "FRESH_ROOTS",
    variety: OFSPVariety.KENYA,
    quantity: "",
    quantityUnit: "kg",
    qualityGrade: "",
    priceMin: "",
    priceMax: "",
    deadline: "",
    deliveryLocation: "",
    additionalRequirements: "",
    isRecurring: false,
    recurringFrequency: "weekly",
    recurringEndDate: "",
  });

  // Fetch all sourcing requests on mount (no status filter). Tabs filter client-side.
  useEffect(() => {
    setSourcingRequestFilters({ status: "all" });
    fetchSourcingRequests({ status: "all" });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const getProductIcon = (type: SourcingRequest["productType"]) => {
    switch (type) {
      case "fresh_roots":
        return <IconCarrot className="h-5 w-5 text-orange-600" />;
      case "process_grade":
        return <IconPackage className="h-5 w-5 text-blue-600" />;
      case "planting_vines":
        return <IconSeeding className="h-5 w-5 text-green-600" />;
      default:
        return null;
    }
  };

  const getProductIconBg = (type: SourcingRequest["productType"]) => {
    switch (type) {
      case "fresh_roots":
        return "bg-orange-100";
      case "process_grade":
        return "bg-blue-100";
      case "planting_vines":
        return "bg-green-100";
      default:
        return "bg-stone-100";
    }
  };

  const getStatusBadge = (status: SourcingRequest["status"]) => {
    switch (status) {
      case "open":
        return (
          <Badge variant="outline" className="bg-emerald-50 text-emerald-700 border-emerald-100 text-[10px] font-medium px-2 py-1">
            Open
          </Badge>
        );
      case "urgent":
        return (
          <Badge variant="outline" className="bg-amber-50 text-amber-700 border-amber-100 text-[10px] font-medium px-2 py-1">
            Urgent
          </Badge>
        );
      case "draft":
        return (
          <Badge variant="outline" className="bg-stone-50 text-stone-700 border-stone-100 text-[10px] font-medium px-2 py-1">
            Draft
          </Badge>
        );
      case "closed":
        return (
          <Badge variant="outline" className="bg-stone-50 text-stone-700 border-stone-100 text-[10px] font-medium px-2 py-1">
            Closed
          </Badge>
        );
      default:
        return null;
    }
  };

  const getOfferStatusBadge = (status?: string) => {
    if (!status) return null;
    switch (status.toLowerCase()) {
      case "accepted":
        return (
          <Badge variant="outline" className="bg-emerald-50 text-emerald-700 border-emerald-100 text-[10px] font-medium px-2 py-1">
            Accepted
          </Badge>
        );
      case "rejected":
        return (
          <Badge variant="outline" className="bg-red-50 text-red-700 border-red-100 text-[10px] font-medium px-2 py-1">
            Rejected
          </Badge>
        );
      case "converted":
        return (
          <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-100 text-[10px] font-medium px-2 py-1">
            Converted
          </Badge>
        );
      case "pending":
      default:
        return (
          <Badge variant="outline" className="bg-amber-50 text-amber-700 border-amber-100 text-[10px] font-medium px-2 py-1">
            Pending
          </Badge>
        );
    }
  };

  const getProgressColor = (percentage: number, status: SourcingRequest["status"]) => {
    if (status === "urgent" && percentage < 20) {
      return "bg-red-500";
    }
    if (percentage >= 75) {
      return "bg-green-500";
    }
    if (percentage >= 50) {
      return "bg-orange-500";
    }
    return "bg-orange-500";
  };

  const formatQuantity = (value: number | undefined | null, unit?: string) => {
    const n = typeof value === "number" && Number.isFinite(value) ? value : 0;
    const u = unit ?? "kg";
    if (u === "tons") {
      return `${n.toFixed(1)}t`;
    }
    if (u === "kg") {
      return `${n.toLocaleString()} kg`;
    }
    if (u === "units") {
      if (n >= 1000) {
        return `${(n / 1000).toFixed(0)}k units`;
      }
      return `${n.toLocaleString()} units`;
    }
    return `${n} ${u}`;
  };

  const formatDeadline = (iso: string | undefined | null) => {
    if (!iso || typeof iso !== "string") return "—";
    try {
      const d = new Date(iso);
      if (Number.isNaN(d.getTime())) return "—";
      return d.toLocaleDateString("en-KE", {
        year: "numeric",
        month: "short",
        day: "numeric",
      });
    } catch {
      return "—";
    }
  };

  const formatPrice = (r: {
    priceRange?: { min: number; max: number };
    pricePerUnit?: number;
    priceUnit?: string;
  }) => {
    if (r.priceRange != null && typeof r.priceRange.min === "number" && typeof r.priceRange.max === "number") {
      return `KES ${r.priceRange.min.toLocaleString()} – ${r.priceRange.max.toLocaleString()}`;
    }
    if (typeof r.pricePerUnit === "number" && Number.isFinite(r.pricePerUnit)) {
      return `KES ${r.pricePerUnit.toLocaleString(undefined, { minimumFractionDigits: 1, maximumFractionDigits: 1 })}`;
    }
    return "—";
  };

  const formatRelativeTime = (iso: string | undefined | null) => {
    if (!iso || typeof iso !== "string") return "—";
    try {
      const d = new Date(iso);
      if (Number.isNaN(d.getTime())) return "—";
      const now = new Date();
      const diffMs = now.getTime() - d.getTime();
      const diffMins = Math.floor(diffMs / 60000);
      const diffHours = Math.floor(diffMs / 3600000);
      const diffDays = Math.floor(diffMs / 86400000);
      if (diffMins < 1) return "Just now";
      if (diffMins < 60) return `${diffMins} min ago`;
      if (diffHours < 24) return `${diffHours} hour${diffHours !== 1 ? "s" : ""} ago`;
      if (diffDays < 30) return `${diffDays} day${diffDays !== 1 ? "s" : ""} ago`;
      return formatDeadline(iso);
    } catch {
      return "—";
    }
  };

  // Client-side filter by tab; sort by newest first (createdAt desc)
  const filteredRequests = (() => {
    let list: SourcingRequest[];
    if (activeTab === "active") {
      list = sourcingRequests.filter((r) => r.status === "open" || r.status === "urgent");
    } else if (activeTab === "drafts") {
      list = sourcingRequests.filter((r) => r.status === "draft");
    } else {
      list = sourcingRequests.filter((r) => r.status === "closed" || r.status === "fulfilled");
    }
    return [...list].sort((a, b) => {
      const tA = a.createdAt ? new Date(a.createdAt).getTime() : 0;
      const tB = b.createdAt ? new Date(b.createdAt).getTime() : 0;
      return tB - tA;
    });
  })();

  const activeCount = sourcingRequests.filter((r) => r.status === "open" || r.status === "urgent").length;
  const draftsCount = sourcingRequests.filter((r) => r.status === "draft").length;
  const completedCount = sourcingRequests.filter((r) => r.status === "closed" || r.status === "fulfilled").length;

  const handleCreateRequest = () => {
    setView("create");
  };

  const handleCancel = () => {
    setView("list");
    // Reset form
    setFormData({
      productType: "FRESH_ROOTS",
      variety: OFSPVariety.KENYA,
      quantity: "",
      quantityUnit: "kg",
      qualityGrade: "",
      priceMin: "",
      priceMax: "",
      deadline: "",
      deliveryLocation: "",
      additionalRequirements: "",
      isRecurring: false,
      recurringFrequency: "weekly",
      recurringEndDate: "",
    });
  };

  const handleBackToList = () => {
    clearSelectedSourcingRequest();
    setView("list");
  };

  const handleManage = async (request: SourcingRequest) => {
    try {
      await fetchSourcingRequestById(request.id);
      setView("manage");
    } catch {
      setView("list");
    }
  };

  const formQualityToGrade = (s: string): "A" | "B" | "C" | undefined => {
    if (!s) return undefined;
    const lower = s.toLowerCase();
    if (lower.includes("grade a") || lower.includes("premium")) return "A";
    if (lower.includes("grade b") || lower.includes("standard")) return "B";
    if (lower.includes("processing")) return "C";
    if (s === "A" || s === "B" || s === "C") return s;
    return undefined;
  };

  const buildCreatePayload = (opts?: { publishImmediately?: boolean }) => {
    const productType = formData.productType || "FRESH_ROOTS";
    // Ensure variety is a valid OFSPVariety enum value
    const varietyValue = formData.variety || OFSPVariety.KENYA;
    const variety: OFSPVariety = OFSP_VARIETY_VALUES.includes(varietyValue) 
      ? (varietyValue as OFSPVariety) 
      : OFSPVariety.KENYA;
    const unit = formData.quantityUnit === "tons" ? "tons" : formData.quantityUnit === "bags" ? "units" : "kg";
    const quantity = parseFloat(formData.quantity) || 0;
    const deadline = formData.deadline || new Date().toISOString().split("T")[0];
    const qualityGrade = formQualityToGrade(formData.qualityGrade);
    const label = PRODUCT_TYPE_OPTIONS.find((o) => o.value === productType)?.label ?? "New Request";
    
    // Build price information
    const priceMin = formData.priceMin ? parseFloat(formData.priceMin) : undefined;
    const priceMax = formData.priceMax ? parseFloat(formData.priceMax) : undefined;
    const priceUnit = unit === "kg" ? "kg" : unit === "units" ? "unit" : "kg";
    
    return {
      title: label,
      productType,
      variety,
      total: quantity,
      unit,
      deadline,
      ...(qualityGrade && { qualityGrade }),
      deliveryLocation: formData.deliveryLocation || undefined,
      additionalRequirements: formData.additionalRequirements || undefined,
      ...(priceMin !== undefined && priceMax !== undefined && { 
        priceRange: { min: priceMin, max: priceMax },
        priceRangeMin: priceMin,
        priceRangeMax: priceMax,
        priceUnit,
      }),
      ...(opts?.publishImmediately && { publishImmediately: true }),
    };
  };

  const handleSaveDraft = async () => {
    setIsSubmitting(true);
    try {
      await createRequest(buildCreatePayload() as Partial<SourcingRequest>);
      showSuccess("Draft saved successfully", "Your sourcing request has been saved as a draft");
      setIsSubmitting(false);
      setView("list");
      setActiveTab("drafts");
    } catch (error) {
      console.error("Failed to save draft:", error);
      showError("Failed to save draft", formatApiError(error));
      setIsSubmitting(false);
    }
  };

  const handlePublishRequest = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      await createRequest(buildCreatePayload({ publishImmediately: true }) as Partial<SourcingRequest>);
      showSuccess("Request published successfully", "Your sourcing request is now visible to suppliers");
      setView("list");
      setActiveTab("active");
      handleCancel();
    } catch (error) {
      console.error("Failed to publish request:", error);
      showError("Failed to publish request", formatApiError(error));
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleReviewOffer = (offer: SupplierOffer) => {
    setSelectedOffer(offer);
    setReviewDialogOpen(true);
  };

  const handleAcceptOffer = async (offer: SupplierOffer) => {
    if (!offer.id || !selectedSourcingRequest) return;
    
    // Prevent accepting already accepted, rejected, or converted offers
    const offerStatus = offer.status?.toLowerCase();
    if (offerStatus === 'accepted' || offerStatus === 'rejected' || offerStatus === 'converted') {
      showError("Cannot accept offer", `This offer has already been ${offerStatus}`);
      return;
    }
    
    setIsAcceptingOffer(true);
    try {
      await acceptSupplierOffer(offer.id);
      showSuccess(
        "Offer accepted and order created", 
        `The offer from ${offer.supplierName} has been accepted and automatically converted to an order`
      );
      await fetchSourcingRequests(sourcingRequestFilters);
      await fetchSourcingRequestById(selectedSourcingRequest.id);
      setIsAcceptingOffer(false);
      setReviewDialogOpen(false);
      setSelectedOffer(null);
    } catch (error) {
      console.error("Failed to accept offer:", error);
      showError("Failed to accept offer", formatApiError(error));
      setIsAcceptingOffer(false);
    }
  };

  const handleRejectOffer = async (offer: SupplierOffer) => {
    // TODO: Replace with actual API call
    showSuccess("Offer rejected", `You have rejected the offer from ${offer.supplierName}`);
    setReviewDialogOpen(false);
    setSelectedOffer(null);
  };

  const handleEditDetails = () => {
    if (selectedSourcingRequest) {
      const raw = selectedSourcingRequest.deadline ?? selectedSourcingRequest.nextDeliveryDate ?? "";
      const deadlineYmd = typeof raw === "string" && raw.includes("T") ? (raw.split("T")[0] ?? "") : raw;
      const recEnd = selectedSourcingRequest.recurringEndDate;
      const recurringEndYmd =
        typeof recEnd === "string" && recEnd.includes("T") ? (recEnd.split("T")[0] ?? "") : (recEnd ?? "");
      setFormData({
        productType: frontendProductTypeToEnum(selectedSourcingRequest.productType),
        variety: (selectedSourcingRequest.variety?.toUpperCase() as OFSPVariety) || OFSPVariety.KENYA,
        quantity: selectedSourcingRequest.total.toString(),
        quantityUnit: selectedSourcingRequest.unit === "tons" ? "tons" : selectedSourcingRequest.unit === "units" ? "bags" : "kg",
        qualityGrade: selectedSourcingRequest.qualityGrade || "",
        priceMin: selectedSourcingRequest.priceRange?.min.toString() || "",
        priceMax: selectedSourcingRequest.priceRange?.max.toString() || "",
        deadline: deadlineYmd || "",
        deliveryLocation: selectedSourcingRequest.deliveryLocation ?? selectedSourcingRequest.deliveryRegion ?? "",
        additionalRequirements: selectedSourcingRequest.additionalRequirements ?? "",
        isRecurring: selectedSourcingRequest.isRecurring || false,
        recurringFrequency: selectedSourcingRequest.recurringFrequency || "weekly",
        recurringEndDate: recurringEndYmd || "",
      });
      setEditDialogOpen(true);
    }
  };

  const handleSaveEdit = async () => {
    if (!selectedSourcingRequest) return;
    setIsSubmitting(true);
    try {
      const isPublishedRequest = selectedSourcingRequest.status === "open" || selectedSourcingRequest.status === "urgent";
      
      let updatedRequest: Partial<SourcingRequest>;
      
      if (isPublishedRequest) {
        // For published requests, only send allowed fields: deadline, deliveryLocation, additionalRequirements
        updatedRequest = {
          deadline: formData.deadline || selectedSourcingRequest.deadline,
          deliveryLocation: formData.deliveryLocation || selectedSourcingRequest.deliveryLocation,
          additionalRequirements: formData.additionalRequirements || selectedSourcingRequest.additionalRequirements,
        };
      } else {
        // For draft requests, send all fields
        const unit: "kg" | "tons" | "units" =
          formData.quantityUnit === "tons" ? "tons" : formData.quantityUnit === "bags" ? "units" : "kg";
        const title =
          PRODUCT_TYPE_OPTIONS.find((o) => o.value === formData.productType)?.label ?? selectedSourcingRequest.title;
        // Convert backend enum to frontend format
        const productTypeMap: Record<string, SourcingRequest["productType"]> = {
          "FRESH_ROOTS": "fresh_roots",
          "PROCESS_GRADE": "process_grade",
          "PLANTING_VINES": "planting_vines",
        };
        // Build price information
        const priceMin = formData.priceMin ? parseFloat(formData.priceMin) : undefined;
        const priceMax = formData.priceMax ? parseFloat(formData.priceMax) : undefined;
        const priceUnit = unit === "kg" ? "kg" : unit === "units" ? "unit" : "kg";
        
        updatedRequest = {
          ...selectedSourcingRequest,
          title,
          productType: productTypeMap[formData.productType] || selectedSourcingRequest.productType,
          variety: (formData.variety as OFSPVariety) || selectedSourcingRequest.variety || OFSPVariety.KENYA,
          total: parseFloat(formData.quantity) || selectedSourcingRequest.total,
          unit,
          qualityGrade: formQualityToGrade(formData.qualityGrade) || selectedSourcingRequest.qualityGrade,
          priceRange: priceMin !== undefined && priceMax !== undefined
            ? { min: priceMin, max: priceMax }
            : selectedSourcingRequest.priceRange,
          priceRangeMin: priceMin,
          priceRangeMax: priceMax,
          priceUnit,
          deadline: formData.deadline || selectedSourcingRequest.deadline,
          deliveryRegion: formData.deliveryLocation || selectedSourcingRequest.deliveryRegion,
          deliveryLocation: formData.deliveryLocation || selectedSourcingRequest.deliveryLocation,
          additionalRequirements: formData.additionalRequirements || selectedSourcingRequest.additionalRequirements,
          isRecurring: formData.isRecurring,
          recurringFrequency: formData.isRecurring ? formData.recurringFrequency : undefined,
          recurringEndDate: formData.isRecurring ? formData.recurringEndDate : undefined,
          nextDeliveryDate: formData.isRecurring && formData.deadline ? formData.deadline : undefined,
        };
      }
      
      await updateRequest(selectedSourcingRequest.id, updatedRequest);
      showSuccess(
        "Request updated successfully",
        isPublishedRequest 
          ? "Deadline, delivery location, and description have been updated"
          : "Sourcing request details have been updated"
      );
      await fetchSourcingRequests(sourcingRequestFilters);
      await fetchSourcingRequestById(selectedSourcingRequest.id);
      setEditDialogOpen(false);
    } catch (error) {
      console.error("Failed to update sourcing request:", error);
      showError("Failed to update request", formatApiError(error));
    } finally {
      setIsSubmitting(false);
    }
  };

  const handlePublishDraft = async (requestId: string) => {
    setPublishingRequestId(requestId);
    try {
      await publishRequest(requestId);
      showSuccess(
        "Request published successfully",
        "Your sourcing request is now visible to suppliers"
      );
      await fetchSourcingRequests(sourcingRequestFilters);
      setActiveTab("active");
    } catch (error) {
      console.error("Failed to publish request:", error);
      showError("Failed to publish request", formatApiError(error));
    } finally {
      setPublishingRequestId(null);
    }
  };

  const handleCloseRequest = async () => {
    if (!selectedSourcingRequest) return;
    
    // Prevent closing already closed or fulfilled requests
    if (selectedSourcingRequest.status === "closed" || selectedSourcingRequest.status === "fulfilled") {
      showError("Cannot close request", "This request is already closed or fulfilled");
      return;
    }
    
    setIsClosingRequest(true);
    try {
      await closeRequest(selectedSourcingRequest.id);
      showSuccess(
        "Request closed successfully",
        `Sourcing request ${selectedSourcingRequest.requestId} has been closed. No new offers will be accepted.`
      );
      await fetchSourcingRequests(sourcingRequestFilters);
      await fetchSourcingRequestById(selectedSourcingRequest.id);
      setCloseConfirmDialogOpen(false);
      setView("list");
      setActiveTab("completed");
    } catch (error) {
      console.error("Failed to close sourcing request:", error);
      showError("Failed to close request", formatApiError(error));
    } finally {
      setIsClosingRequest(false);
    }
  };

  // Show manage request view
  if (view === "manage" && selectedSourcingRequest) {
    const supplierOffers: SupplierOffer[] = selectedSourcingRequest.offers ?? [];
    const totalFulfilled = typeof selectedSourcingRequest.fulfilled === "number" && Number.isFinite(selectedSourcingRequest.fulfilled)
      ? selectedSourcingRequest.fulfilled
      : 0;
    const totalRequired = typeof selectedSourcingRequest.total === "number" && Number.isFinite(selectedSourcingRequest.total)
      ? selectedSourcingRequest.total
      : 0;
    const fulfillmentPercentage = totalRequired > 0 ? (totalFulfilled / totalRequired) * 100 : 0;
    const avgOfferPrice = supplierOffers.length > 0
      ? supplierOffers.reduce((sum, offer) => sum + offer.pricePerKg, 0) / supplierOffers.length
      : 0;

    const getGradeColor = (grade: string) => {
      switch (grade) {
        case "A":
          return "bg-green-100 text-green-700";
        case "B":
          return "bg-yellow-100 text-yellow-700";
        case "C":
          return "bg-orange-100 text-orange-700";
        default:
          return "bg-stone-100 text-stone-700";
      }
    };

    return (
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="icon"
              onClick={handleBackToList}
              className="p-2 hover:bg-stone-100 rounded-full text-stone-500"
            >
              <IconArrowLeft className="h-5 w-5" />
            </Button>
            <div>
              <div className="flex items-center gap-3">
                <h1 className="text-2xl font-bold tracking-tight text-stone-900">{selectedSourcingRequest.title}</h1>
                {getStatusBadge(selectedSourcingRequest.status)}
                {selectedSourcingRequest.isRecurring && (
                  <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-100 text-[10px] font-medium px-2 py-1 flex items-center gap-1">
                    <IconRepeat className="h-3 w-3" />
                    Recurring
                  </Badge>
                )}
              </div>
              <p className="text-stone-500 text-sm mt-0.5 font-mono">
                {selectedSourcingRequest.requestId} • Created {formatRelativeTime(selectedSourcingRequest.createdAt)}
                {selectedSourcingRequest.isRecurring && selectedSourcingRequest.recurringFrequency && (
                  <span className="ml-2 text-stone-400">
                    • {selectedSourcingRequest.recurringFrequency.charAt(0).toUpperCase() + selectedSourcingRequest.recurringFrequency.slice(1)}
                  </span>
                )}
              </p>
            </div>
          </div>
          <div className="flex gap-2">
            {selectedSourcingRequest.status === "draft" && (
              <Button
                onClick={() => handlePublishDraft(selectedSourcingRequest.id)}
                disabled={publishingRequestId === selectedSourcingRequest.id || isLoading}
                size="sm"
                className="px-3 py-2 bg-orange-500 hover:bg-orange-600 text-white"
              >
                {publishingRequestId === selectedSourcingRequest.id ? (
                  <>
                    <IconLoader2 className="h-4 w-4 mr-2 animate-spin" />
                    Publishing...
                  </>
                ) : (
                  <>
                    <IconArrowRight className="h-4 w-4 mr-2" />
                    Publish Request
                  </>
                )}
              </Button>
            )}
            <Button
              variant="outline"
              size="sm"
              className="px-3 py-2 bg-white border-stone-200 text-stone-700 hover:bg-stone-50"
              onClick={handleEditDetails}
            >
              Edit Details
            </Button>
            <Button
              variant="outline"
              size="sm"
              className="px-3 py-2 bg-white border-red-200 text-red-600 hover:bg-red-50"
              onClick={() => setCloseConfirmDialogOpen(true)}
              disabled={selectedSourcingRequest.status === "closed" || selectedSourcingRequest.status === "fulfilled"}
            >
              Close Request
            </Button>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Fulfillment Status */}
          <Card className="bg-white rounded-xl border border-stone-200 shadow-sm">
            <CardContent className="p-5">
              <p className="text-xs font-semibold uppercase tracking-wider text-stone-500 mb-1">
                Fulfillment Status
              </p>
              <div className="flex items-baseline gap-2">
                <span className="text-2xl font-bold text-stone-900">
                  {formatQuantity(selectedSourcingRequest.fulfilled, selectedSourcingRequest.unit).split(" ")[0]}
                </span>
                <span className="text-sm text-stone-500">
                  / {formatQuantity(selectedSourcingRequest.total, selectedSourcingRequest.unit)}
                </span>
              </div>
              <div className="mt-3 h-1.5 w-full bg-stone-100 rounded-full overflow-hidden">
                <div
                  className={`h-full ${getProgressColor(fulfillmentPercentage, selectedSourcingRequest.status)} transition-all`}
                  style={{ width: `${fulfillmentPercentage}%` }}
                />
              </div>
            </CardContent>
          </Card>

          {/* Offers Received */}
          <Card className="bg-white rounded-xl border border-stone-200 shadow-sm">
            <CardContent className="p-5">
              <p className="text-xs font-semibold uppercase tracking-wider text-stone-500 mb-1">
                Offers Received
              </p>
              <div className="flex items-baseline gap-2">
                <span className="text-2xl font-bold text-stone-900">{supplierOffers.length}</span>
                <span className="text-sm text-stone-500">suppliers</span>
              </div>
              <div className="flex -space-x-2 mt-3">
                {supplierOffers.slice(0, 2).map((offer) => (
                  <div
                    key={offer.id}
                    className="w-6 h-6 rounded-full bg-stone-200 border-2 border-white flex items-center justify-center text-[10px] font-bold text-stone-600"
                  >
                    {offer.supplierName
                      .split(" ")
                      .map((n) => n[0])
                      .join("")
                      .toUpperCase()
                      .slice(0, 2)}
                  </div>
                ))}
                {supplierOffers.length > 2 && (
                  <div className="w-6 h-6 rounded-full bg-stone-400 border-2 border-white flex items-center justify-center text-[10px] font-bold text-white">
                    +{supplierOffers.length - 2}
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Avg Offer Price */}
          <Card className="bg-white rounded-xl border border-stone-200 shadow-sm">
            <CardContent className="p-5">
              <p className="text-xs font-semibold uppercase tracking-wider text-stone-500 mb-1">
                Avg Offer Price
              </p>
              <div className="flex items-baseline gap-2">
                <span className="text-2xl font-bold text-stone-900">
                  {supplierOffers.length > 0 ? `KES ${avgOfferPrice.toFixed(2)}` : "—"}
                </span>
                {supplierOffers.length > 0 && <span className="text-sm text-stone-500">/ kg</span>}
              </div>
              {supplierOffers.length > 0 && (
                <p className="text-xs text-emerald-600 mt-2">Within budget range</p>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Offers Table */}
        <Card className="bg-white rounded-xl border border-stone-200 shadow-sm overflow-hidden">
          <div className="px-6 py-4 border-b border-stone-100 flex justify-between items-center">
            <h3 className="font-semibold text-stone-900">Supplier Offers</h3>
            <Button
              variant="ghost"
              size="sm"
              className="text-sm text-orange-600 font-medium hover:text-orange-700"
            >
              <IconDownload className="h-4 w-4 mr-2" />
              Download CSV
            </Button>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-stone-50 text-stone-500 font-medium">
                <tr>
                  <th className="px-6 py-3">Supplier</th>
                  <th className="px-6 py-3">Quantity</th>
                  <th className="px-6 py-3">Price/Kg</th>
                  <th className="px-6 py-3">Grade</th>
                  <th className="px-6 py-3">Status</th>
                  <th className="px-6 py-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-100">
                {supplierOffers.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-6 py-12 text-center text-stone-500 text-sm">
                      No supplier offers yet
                    </td>
                  </tr>
                ) : (
                  supplierOffers.map((offer) => (
                    <tr key={offer.id} className="hover:bg-stone-50 group">
                      <td className="px-6 py-4">
                        <div className="font-medium text-stone-900">{offer.supplierName}</div>
                        {offer.rating != null ? (
                          <div className="text-xs text-stone-500 flex items-center gap-1">
                            <IconStar className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                            {offer.rating} Rating
                          </div>
                        ) : offer.isNewSupplier ? (
                          <div className="text-xs text-stone-500">New Supplier</div>
                        ) : null}
                      </td>
                      <td className="px-6 py-4">{formatQuantity(offer.quantity, offer.quantityUnit)}</td>
                      <td className="px-6 py-4 font-medium">KES {offer.pricePerKg.toFixed(2)}</td>
                      <td className="px-6 py-4">
                        <Badge
                          variant="outline"
                          className={`px-2 py-1 rounded text-xs font-bold ${getGradeColor(offer.grade)} border-0`}
                        >
                          {offer.grade}
                        </Badge>
                      </td>
                      <td className="px-6 py-4">
                        {getOfferStatusBadge(offer.status || 'pending')}
                      </td>
                      <td className="px-6 py-4 text-right">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleReviewOffer(offer)}
                          className="text-stone-500 hover:text-orange-600 font-medium text-xs border-stone-200 rounded px-3 py-1.5 bg-white hover:bg-orange-50"
                        >
                          Review
                        </Button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </Card>

        {/* Review Offer Dialog */}
        <Dialog open={reviewDialogOpen} onOpenChange={setReviewDialogOpen}>
          <DialogContent className="max-w-2xl max-h-[85vh] flex flex-col p-0">
            <DialogHeader className="px-6 pt-6 pb-4 flex-shrink-0">
              <DialogTitle>Review Supplier Offer</DialogTitle>
              <DialogDescription>Review the offer details and decide whether to accept or reject</DialogDescription>
            </DialogHeader>
            {selectedOffer && (
              <div className="px-6 pb-4 overflow-y-auto flex-1 space-y-4 min-h-0">
                {/* Supplier Info */}
                <Card className="bg-stone-50 border-stone-200">
                  <CardContent className="p-3 sm:p-4">
                    <div className="flex items-center gap-2 sm:gap-3">
                      <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-stone-200 flex items-center justify-center text-stone-600 font-bold text-sm sm:text-base flex-shrink-0">
                        {selectedOffer.supplierName
                          .split(" ")
                          .map((n) => n[0])
                          .join("")
                          .toUpperCase()
                          .slice(0, 2)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="font-semibold text-stone-900 text-sm sm:text-base truncate">{selectedOffer.supplierName}</h3>
                        {selectedOffer.rating ? (
                          <div className="flex items-center gap-1 text-xs sm:text-sm text-stone-600">
                            <IconStar className="h-3 w-3 sm:h-4 sm:w-4 fill-yellow-400 text-yellow-400" />
                            <span>{selectedOffer.rating} Rating</span>
                          </div>
                        ) : selectedOffer.isNewSupplier ? (
                          <span className="text-xs sm:text-sm text-stone-500">New Supplier</span>
                        ) : null}
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Offer Details */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                  <Card>
                    <CardContent className="p-3 sm:p-4 space-y-2">
                      <div className="flex items-center gap-2 text-stone-500">
                        <IconPackage className="h-3 w-3 sm:h-4 sm:w-4 flex-shrink-0" />
                        <span className="text-xs font-semibold uppercase tracking-wider">Quantity</span>
                      </div>
                      <p className="text-base sm:text-lg font-bold text-stone-900">
                        {formatQuantity(selectedOffer.quantity, selectedOffer.quantityUnit)}
                      </p>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardContent className="p-3 sm:p-4 space-y-2">
                      <div className="flex items-center gap-2 text-stone-500">
                        <IconCurrency className="h-3 w-3 sm:h-4 sm:w-4 flex-shrink-0" />
                        <span className="text-xs font-semibold uppercase tracking-wider">Price/Kg</span>
                      </div>
                      <p className="text-base sm:text-lg font-bold text-stone-900">KES {selectedOffer.pricePerKg.toFixed(2)}</p>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardContent className="p-3 sm:p-4 space-y-2">
                      <div className="flex items-center gap-2 text-stone-500">
                        <span className="text-xs font-semibold uppercase tracking-wider">Quality Grade</span>
                      </div>
                      <Badge
                        variant="outline"
                        className={`px-2 py-1 sm:px-3 sm:py-1.5 rounded text-xs sm:text-sm font-bold ${getGradeColor(selectedOffer.grade)} border-0`}
                      >
                        Grade {selectedOffer.grade}
                      </Badge>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardContent className="p-3 sm:p-4 space-y-2">
                      <div className="flex items-center gap-2 text-stone-500">
                        <span className="text-xs font-semibold uppercase tracking-wider">Total Amount</span>
                      </div>
                      <p className="text-base sm:text-lg font-bold text-stone-900 break-words">
                        KES {(() => {
                          // Convert offer quantity to kg for calculation
                          let quantityInKg = selectedOffer.quantity;
                          if (selectedOffer.quantityUnit === "tons") {
                            quantityInKg = selectedOffer.quantity * 1000;
                          } else if (selectedOffer.quantityUnit === "units") {
                            // Assume 1 unit = 50kg for bags (common for sweet potatoes)
                            quantityInKg = selectedOffer.quantity * 50;
                          }
                          return (quantityInKg * selectedOffer.pricePerKg).toLocaleString();
                        })()}
                      </p>
                    </CardContent>
                  </Card>
                </div>

                {/* Additional Info */}
                <div className="space-y-2">
                  <Label className="text-xs font-semibold uppercase tracking-wider text-stone-500">
                    Additional Information
                  </Label>
                  <Card className="bg-stone-50 border-stone-200">
                    <CardContent className="p-3 sm:p-4">
                      <p className="text-xs sm:text-sm text-stone-600">
                        This offer meets the quality requirements and is within the specified price range.
                      </p>
                    </CardContent>
                  </Card>
                </div>

                {/* Batch Traceability */}
                {selectedOffer.batchId && (
                  <div className="space-y-2">
                    <Label className="text-xs font-semibold uppercase tracking-wider text-stone-500">
                      Batch Traceability
                    </Label>
                    <Card className="bg-stone-50 border-stone-200">
                      <CardContent className="p-3 sm:p-4">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="text-xs text-stone-500 mb-1">Batch ID</p>
                            <p className="text-sm font-mono font-semibold text-stone-900">{selectedOffer.batchId}</p>
                            {selectedOffer.qrCode && (
                              <p className="text-xs text-stone-500 mt-1">QR: {selectedOffer.qrCode}</p>
                            )}
                          </div>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => {
                              setSelectedBatchId(selectedOffer.batchId);
                              setTraceabilityDialogOpen(true);
                            }}
                            className="text-xs font-medium"
                          >
                            <IconQrcode className="h-3.5 w-3.5 mr-2" />
                            View History
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                )}
              </div>
            )}
            <DialogFooter className="px-6 pb-6 pt-4 flex-shrink-0 border-t border-stone-100 flex-col sm:flex-row gap-2 sm:gap-0">
              {selectedOffer && (() => {
                const offerStatus = selectedOffer.status?.toLowerCase() || 'pending';
                const isAccepted = offerStatus === 'accepted' || offerStatus === 'converted';
                const isRejected = offerStatus === 'rejected';
                
                return (
                  <>
                    <Button
                      variant="outline"
                      onClick={() => handleRejectOffer(selectedOffer!)}
                      disabled={isAcceptingOffer || isRejected || isAccepted}
                      className={`w-full sm:w-auto ${
                        isRejected || isAccepted 
                          ? 'bg-stone-100 text-stone-400 cursor-not-allowed border-stone-200' 
                          : ''
                      }`}
                    >
                      <IconX className="h-4 w-4 mr-2" />
                      Reject Offer
                    </Button>
                    <Button
                      onClick={() => handleAcceptOffer(selectedOffer!)}
                      disabled={isAcceptingOffer || isAccepted || isRejected}
                      className={`w-full sm:w-auto ${
                        isAccepted || isRejected
                          ? 'bg-stone-400 text-white cursor-not-allowed' 
                          : 'bg-orange-500 hover:bg-orange-600 text-white'
                      }`}
                    >
                      {isAcceptingOffer ? (
                        <>
                          <IconLoader2 className="h-4 w-4 mr-2 animate-spin" />
                          Accepting...
                        </>
                      ) : isAccepted ? (
                        <>
                          <IconCheck className="h-4 w-4 mr-2" />
                          Accepted
                        </>
                      ) : (
                        <>
                          <IconCheck className="h-4 w-4 mr-2" />
                          Accept Offer
                        </>
                      )}
                    </Button>
                  </>
                );
              })()}
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Edit Details Dialog */}
        <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
          <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Edit Sourcing Request</DialogTitle>
              <DialogDescription>
                {selectedSourcingRequest && (selectedSourcingRequest.status === "open" || selectedSourcingRequest.status === "urgent") 
                  ? "Only deadline, delivery location, and description can be updated for published requests."
                  : "Update the details of your sourcing request"}
              </DialogDescription>
            </DialogHeader>
            {selectedSourcingRequest && (() => {
              const isPublishedRequest = selectedSourcingRequest.status === "open" || selectedSourcingRequest.status === "urgent";
              const disabledClassName = isPublishedRequest ? "bg-stone-50 text-stone-400 cursor-not-allowed border-stone-200" : "";
              
              return (
                <>
                  <div className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Product Type */}
                    <div className="space-y-2">
                      <Label htmlFor="edit-productType" className="text-xs font-bold text-stone-500 uppercase tracking-wider">
                        Product Type
                      </Label>
                      <Select
                        value={formData.productType}
                        onValueChange={(value) => setFormData({ ...formData, productType: value })}
                        disabled={isPublishedRequest}
                      >
                        <SelectTrigger
                          id="edit-productType"
                          className={`w-full rounded-lg border text-sm focus:ring-2 focus:ring-orange-500 focus:border-orange-500 py-2.5 h-auto ${isPublishedRequest ? disabledClassName : "bg-white border-stone-200"}`}
                        >
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent className="rounded-lg border-stone-200">
                          {PRODUCT_TYPE_OPTIONS.map((opt) => (
                            <SelectItem key={opt.value} value={opt.value}>
                              {opt.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    {/* Variety */}
                    <div className="space-y-2">
                      <Label htmlFor="edit-variety" className="text-xs font-bold text-stone-500 uppercase tracking-wider">
                        Variety
                      </Label>
                      <Select
                        value={formData.variety}
                        onValueChange={(value) => setFormData({ ...formData, variety: value })}
                        disabled={isPublishedRequest}
                      >
                        <SelectTrigger
                          id="edit-variety"
                          className={`w-full rounded-lg border text-sm focus:ring-2 focus:ring-orange-500 focus:border-orange-500 py-2.5 h-auto ${isPublishedRequest ? disabledClassName : "bg-white border-stone-200"}`}
                        >
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent className="rounded-lg border-stone-200">
                          {VARIETY_OPTIONS.map((opt) => (
                            <SelectItem key={opt.value} value={opt.value}>
                              {opt.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    {/* Required Quantity */}
                    <div className="space-y-2">
                      <Label htmlFor="edit-quantity" className="text-xs font-bold text-stone-500 uppercase tracking-wider">
                        Required Quantity
                      </Label>
                      <div className="flex gap-2">
                        <Input
                          id="edit-quantity"
                          type="number"
                          placeholder="e.g. 5000"
                          value={formData.quantity}
                          onChange={(e) => setFormData({ ...formData, quantity: e.target.value })}
                          disabled={isPublishedRequest}
                          className={`rounded-lg border text-sm py-2.5 h-auto focus:ring-2 focus:ring-orange-500 focus:border-orange-500 ${isPublishedRequest ? disabledClassName : "border-stone-200"}`}
                        />
                        <Select
                          value={formData.quantityUnit}
                          onValueChange={(value: "kg" | "tons" | "bags") => setFormData({ ...formData, quantityUnit: value })}
                          disabled={isPublishedRequest}
                        >
                          <SelectTrigger className={`w-24 rounded-lg border text-sm py-2.5 h-auto ${isPublishedRequest ? disabledClassName : "bg-stone-50 border-stone-200"}`}>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent className="rounded-lg border-stone-200">
                            <SelectItem value="kg">kg</SelectItem>
                            <SelectItem value="tons">tons</SelectItem>
                            <SelectItem value="bags">bags</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>

                    {/* Quality Grade */}
                    <div className="space-y-2">
                      <Label htmlFor="edit-qualityGrade" className="text-xs font-bold text-stone-500 uppercase tracking-wider">
                        Quality Grade
                      </Label>
                      <Select
                        value={formData.qualityGrade}
                        onValueChange={(value) => setFormData({ ...formData, qualityGrade: value })}
                        disabled={isPublishedRequest}
                      >
                        <SelectTrigger
                          id="edit-qualityGrade"
                          className={`w-full rounded-lg border text-sm focus:ring-2 focus:ring-orange-500 focus:border-orange-500 py-2.5 h-auto ${isPublishedRequest ? disabledClassName : "bg-white border-stone-200"}`}
                        >
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent className="rounded-lg border-stone-200">
                          <SelectItem value="Grade A (Premium)">Grade A (Premium)</SelectItem>
                          <SelectItem value="Grade B (Standard)">Grade B (Standard)</SelectItem>
                          <SelectItem value="Processing Grade">Processing Grade</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    {/* Target Price */}
                    <div className="space-y-2">
                      <Label className="text-xs font-bold text-stone-500 uppercase tracking-wider">
                        Target Price (KES/unit)
                      </Label>
                      <div className="flex items-center gap-2">
                        <Input
                          type="number"
                          placeholder="Min"
                          value={formData.priceMin}
                          onChange={(e) => setFormData({ ...formData, priceMin: e.target.value })}
                          disabled={isPublishedRequest}
                          className={`rounded-lg border text-sm py-2.5 h-auto focus:ring-2 focus:ring-orange-500 focus:border-orange-500 ${isPublishedRequest ? disabledClassName : "border-stone-200"}`}
                        />
                        <span className="text-stone-400">-</span>
                        <Input
                          type="number"
                          placeholder="Max"
                          value={formData.priceMax}
                          onChange={(e) => setFormData({ ...formData, priceMax: e.target.value })}
                          disabled={isPublishedRequest}
                          className={`rounded-lg border text-sm py-2.5 h-auto focus:ring-2 focus:ring-orange-500 focus:border-orange-500 ${isPublishedRequest ? disabledClassName : "border-stone-200"}`}
                        />
                      </div>
                    </div>

                    {/* Deadline */}
                    <div className="space-y-2">
                      <Label htmlFor="edit-deadline" className="text-xs font-bold text-stone-500 uppercase tracking-wider">
                        Deadline
                      </Label>
                      <Input
                        id="edit-deadline"
                        type="date"
                        value={formData.deadline}
                        onChange={(e) => setFormData({ ...formData, deadline: e.target.value })}
                        className="w-full rounded-lg border border-stone-200 text-sm py-2.5 h-auto focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                      />
                    </div>

                    {/* Delivery Location */}
                    <div className="space-y-2">
                      <Label htmlFor="edit-deliveryLocation" className="text-xs font-bold text-stone-500 uppercase tracking-wider">
                        Delivery Location
                      </Label>
                      <Input
                        id="edit-deliveryLocation"
                        type="text"
                        placeholder="e.g. Nairobi Hub, Kisumu Hub"
                        value={formData.deliveryLocation}
                        onChange={(e) => setFormData({ ...formData, deliveryLocation: e.target.value })}
                        className="w-full rounded-lg border border-stone-200 text-sm py-2.5 h-auto focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                      />
                    </div>
                  </div>

                  {/* Additional Requirements */}
                  <div className="space-y-2">
                    <Label htmlFor="edit-additionalRequirements" className="text-xs font-bold text-stone-500 uppercase tracking-wider">
                      Additional Requirements
                    </Label>
                    <Textarea
                      id="edit-additionalRequirements"
                      placeholder="Describe packaging requirements, specific varieties, etc."
                      value={formData.additionalRequirements}
                      onChange={(e) => setFormData({ ...formData, additionalRequirements: e.target.value })}
                      className="w-full rounded-lg border border-stone-200 text-sm h-24 p-3 focus:ring-2 focus:ring-orange-500 focus:border-orange-500 resize-none"
                    />
                  </div>

                  {/* Recurring Order Section */}
                  <div className="pt-4 border-t border-stone-200 space-y-4">
                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    id="edit-isRecurring"
                    checked={formData.isRecurring}
                    onChange={(e) => setFormData({ ...formData, isRecurring: e.target.checked })}
                    className="w-4 h-4 rounded border-stone-300 text-orange-600 focus:ring-orange-500 focus:ring-2"
                  />
                  <Label htmlFor="edit-isRecurring" className="text-sm font-semibold text-stone-900 cursor-pointer">
                    Make this a recurring order
                  </Label>
                </div>

                {formData.isRecurring && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pl-6">
                    <div className="space-y-2">
                      <Label htmlFor="edit-recurringFrequency" className="text-xs font-bold text-stone-500 uppercase tracking-wider">
                        Frequency
                      </Label>
                      <Select
                        value={formData.recurringFrequency}
                        onValueChange={(value: "weekly" | "biweekly" | "monthly" | "quarterly" | "custom") =>
                          setFormData({ ...formData, recurringFrequency: value })
                        }
                      >
                        <SelectTrigger
                          id="edit-recurringFrequency"
                          className="w-full rounded-lg border border-stone-200 text-sm focus:ring-2 focus:ring-orange-500 focus:border-orange-500 py-2.5 h-auto bg-white"
                        >
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent className="rounded-lg border-stone-200">
                          <SelectItem value="weekly">Weekly</SelectItem>
                          <SelectItem value="biweekly">Bi-weekly</SelectItem>
                          <SelectItem value="monthly">Monthly</SelectItem>
                          <SelectItem value="quarterly">Quarterly</SelectItem>
                          <SelectItem value="custom">Custom</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="edit-recurringEndDate" className="text-xs font-bold text-stone-500 uppercase tracking-wider">
                        End Date (Optional)
                      </Label>
                      <Input
                        id="edit-recurringEndDate"
                        type="date"
                        value={formData.recurringEndDate}
                        onChange={(e) => setFormData({ ...formData, recurringEndDate: e.target.value })}
                        className="w-full rounded-lg border border-stone-200 text-sm py-2.5 h-auto focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                      />
                    </div>
                  </div>
                )}
                  </div>
                </div>
                  <DialogFooter>
                    <Button variant="outline" onClick={() => setEditDialogOpen(false)} disabled={isSubmitting}>
                      Cancel
                    </Button>
                    <Button onClick={handleSaveEdit} disabled={isSubmitting} className="bg-stone-900 hover:bg-stone-800 text-white">
                      {isSubmitting ? (
                        <>
                          <IconLoader2 className="h-4 w-4 mr-2 animate-spin" />
                          Saving...
                        </>
                      ) : (
                        <>
                          <IconCheck className="h-4 w-4 mr-2" />
                          Save Changes
                        </>
                      )}
                    </Button>
                  </DialogFooter>
                </>
              );
            })()}
          </DialogContent>
        </Dialog>

        {/* Close Request Confirmation Dialog */}
        <Dialog open={closeConfirmDialogOpen} onOpenChange={setCloseConfirmDialogOpen}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>Close Sourcing Request</DialogTitle>
              <DialogDescription>
                Are you sure you want to close this sourcing request? This will prevent suppliers from submitting new offers.
                {selectedSourcingRequest && selectedSourcingRequest.offers && selectedSourcingRequest.offers.length > 0 && (
                  <span className="block mt-2 text-sm text-stone-600">
                    {selectedSourcingRequest.offers.length} offer{selectedSourcingRequest.offers.length !== 1 ? "s" : ""} already submitted will remain visible.
                  </span>
                )}
              </DialogDescription>
            </DialogHeader>
            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => setCloseConfirmDialogOpen(false)}
                disabled={isClosingRequest}
              >
                Cancel
              </Button>
              <Button
                onClick={handleCloseRequest}
                disabled={isClosingRequest}
                className="bg-red-600 hover:bg-red-700 text-white"
              >
                {isClosingRequest ? (
                  <>
                    <IconLoader2 className="h-4 w-4 mr-2 animate-spin" />
                    Closing...
                  </>
                ) : (
                  <>
                    <IconX className="h-4 w-4 mr-2" />
                    Close Request
                  </>
                )}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Batch Traceability Dialog */}
        <BatchTraceabilityDialog
          open={traceabilityDialogOpen}
          onOpenChange={setTraceabilityDialogOpen}
          batchId={selectedBatchId}
        />
      </div>
    );
  }

  // Show create form view
  if (view === "create") {
    return (
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-stone-900">Create Sourcing Request</h1>
            <p className="text-stone-500 mt-1 text-sm">Define your requirements to receive offers from suppliers.</p>
          </div>
          <Button variant="ghost" onClick={handleCancel} className="text-stone-500 hover:text-stone-700">
            <IconX className="h-4 w-4 mr-2" />
            Cancel
          </Button>
        </div>

        {/* Form Card */}
        <Card className="bg-white rounded-xl border border-stone-200 shadow-sm max-w-3xl mx-auto md:mx-0">
          <CardContent className="p-6">
            <form onSubmit={handlePublishRequest} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Product Type */}
                <div className="space-y-2">
                  <Label htmlFor="productType" className="text-xs font-bold text-stone-500 uppercase tracking-wider">
                    Product Type
                  </Label>
                  <Select
                    value={formData.productType}
                    onValueChange={(value) => setFormData({ ...formData, productType: value })}
                  >
                    <SelectTrigger 
                      id="productType" 
                      className="w-full rounded-lg border border-stone-200 text-sm focus:ring-2 focus:ring-orange-500 focus:border-orange-500 py-2.5 h-auto bg-white"
                    >
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="rounded-lg border-stone-200">
                      {PRODUCT_TYPE_OPTIONS.map((opt) => (
                        <SelectItem key={opt.value} value={opt.value}>
                          {opt.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Variety */}
                <div className="space-y-2">
                  <Label htmlFor="variety" className="text-xs font-bold text-stone-500 uppercase tracking-wider">
                    Variety
                  </Label>
                  <Select
                    value={formData.variety}
                    onValueChange={(value) => setFormData({ ...formData, variety: value })}
                  >
                    <SelectTrigger 
                      id="variety" 
                      className="w-full rounded-lg border border-stone-200 text-sm focus:ring-2 focus:ring-orange-500 focus:border-orange-500 py-2.5 h-auto bg-white"
                    >
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="rounded-lg border-stone-200">
                      {VARIETY_OPTIONS.map((opt) => (
                        <SelectItem key={opt.value} value={opt.value}>
                          {opt.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Required Quantity */}
                <div className="space-y-2">
                  <Label htmlFor="quantity" className="text-xs font-bold text-stone-500 uppercase tracking-wider">
                    Required Quantity
                  </Label>
                  <div className="flex gap-2">
                    <Input
                      id="quantity"
                      type="number"
                      placeholder="e.g. 5000"
                      value={formData.quantity}
                      onChange={(e) => setFormData({ ...formData, quantity: e.target.value })}
                      className="rounded-lg border border-stone-200 text-sm py-2.5 h-auto focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                    />
                    <Select
                      value={formData.quantityUnit}
                      onValueChange={(value: "kg" | "tons" | "bags") => setFormData({ ...formData, quantityUnit: value })}
                    >
                      <SelectTrigger className="w-24 rounded-lg border border-stone-200 text-sm bg-stone-50 py-2.5 h-auto">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent className="rounded-lg border-stone-200">
                        <SelectItem value="kg">kg</SelectItem>
                        <SelectItem value="tons">tons</SelectItem>
                        <SelectItem value="bags">bags</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                {/* Quality Grade */}
                <div className="space-y-2">
                  <Label htmlFor="qualityGrade" className="text-xs font-bold text-stone-500 uppercase tracking-wider">
                    Quality Grade
                  </Label>
                  <Select
                    value={formData.qualityGrade}
                    onValueChange={(value) => setFormData({ ...formData, qualityGrade: value })}
                  >
                    <SelectTrigger 
                      id="qualityGrade" 
                      className="w-full rounded-lg border border-stone-200 text-sm focus:ring-2 focus:ring-orange-500 focus:border-orange-500 py-2.5 h-auto bg-white"
                    >
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="rounded-lg border-stone-200">
                      <SelectItem value="Grade A (Premium)">Grade A (Premium)</SelectItem>
                      <SelectItem value="Grade B (Standard)">Grade B (Standard)</SelectItem>
                      <SelectItem value="Processing Grade">Processing Grade</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Target Price */}
                <div className="space-y-2">
                  <Label className="text-xs font-bold text-stone-500 uppercase tracking-wider">
                    Target Price (KES/unit)
                  </Label>
                  <div className="flex items-center gap-2">
                    <Input
                      type="number"
                      placeholder="Min"
                      value={formData.priceMin}
                      onChange={(e) => setFormData({ ...formData, priceMin: e.target.value })}
                      className="rounded-lg border border-stone-200 text-sm py-2.5 h-auto focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                    />
                    <span className="text-stone-400">-</span>
                    <Input
                      type="number"
                      placeholder="Max"
                      value={formData.priceMax}
                      onChange={(e) => setFormData({ ...formData, priceMax: e.target.value })}
                      className="rounded-lg border border-stone-200 text-sm py-2.5 h-auto focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                    />
                  </div>
                </div>

                {/* Deadline */}
                <div className="space-y-2">
                  <Label htmlFor="deadline" className="text-xs font-bold text-stone-500 uppercase tracking-wider">
                    Deadline
                  </Label>
                  <Input
                    id="deadline"
                    type="date"
                    value={formData.deadline}
                    onChange={(e) => setFormData({ ...formData, deadline: e.target.value })}
                    className="w-full rounded-lg border border-stone-200 text-sm py-2.5 h-auto focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                  />
                </div>

                {/* Delivery Location */}
                <div className="space-y-2">
                  <Label htmlFor="deliveryLocation" className="text-xs font-bold text-stone-500 uppercase tracking-wider">
                    Delivery Location
                  </Label>
                  <Input
                    id="deliveryLocation"
                    type="text"
                    placeholder="e.g. Nairobi Hub, Kisumu Hub"
                    value={formData.deliveryLocation}
                    onChange={(e) => setFormData({ ...formData, deliveryLocation: e.target.value })}
                    className="w-full rounded-lg border border-stone-200 text-sm py-2.5 h-auto focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                  />
                </div>
              </div>

              {/* Additional Requirements */}
              <div className="space-y-2">
                <Label htmlFor="additionalRequirements" className="text-xs font-bold text-stone-500 uppercase tracking-wider">
                  Additional Requirements
                </Label>
                <Textarea
                  id="additionalRequirements"
                  placeholder="Describe packaging requirements, specific varieties, etc."
                  value={formData.additionalRequirements}
                  onChange={(e) => setFormData({ ...formData, additionalRequirements: e.target.value })}
                  className="w-full rounded-lg border border-stone-200 text-sm h-24 p-3 focus:ring-2 focus:ring-orange-500 focus:border-orange-500 resize-none"
                />
              </div>

              {/* Form Actions */}
              <div className="pt-4 border-t border-stone-100 flex justify-end gap-3">
                <Button
                  type="button"
                  variant="outline"
                  onClick={handleSaveDraft}
                  disabled={isSubmitting}
                  className="px-4 py-2 border-stone-200 rounded-lg text-sm font-medium text-stone-700 hover:bg-stone-50"
                >
                  Save Draft
                </Button>
                <Button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-4 py-2 bg-stone-900 text-white rounded-lg text-sm font-medium hover:bg-stone-800 shadow-sm"
                >
                  {isSubmitting ? (
                    "Publishing..."
                  ) : (
                    <>
                      <IconCheck className="h-3.5 w-3.5 inline mr-1" />
                      Publish Request
                    </>
                  )}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Show list view
  return (
    <div className="max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-stone-900">Sourcing Requests</h1>
          <p className="text-stone-500 mt-1 text-sm">Manage your open tenders and aggregate orders.</p>
        </div>
        <Button
          className="bg-stone-900 hover:bg-stone-800 text-white"
          onClick={handleCreateRequest}
        >
          <IconPlus className="h-4 w-4 mr-2" />
          Create Request
        </Button>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 border-b border-stone-200 pb-1">
        <button
          onClick={() => setActiveTab("active")}
          className={`px-4 py-2 text-sm font-medium transition-colors ${
            activeTab === "active"
              ? "text-orange-600 border-b-2 border-orange-500"
              : "text-stone-500 hover:text-stone-700"
          }`}
        >
          Active ({activeCount})
        </button>
        <button
          onClick={() => setActiveTab("drafts")}
          className={`px-4 py-2 text-sm font-medium transition-colors ${
            activeTab === "drafts"
              ? "text-orange-600 border-b-2 border-orange-500"
              : "text-stone-500 hover:text-stone-700"
          }`}
        >
          Drafts ({draftsCount})
        </button>
        <button
          onClick={() => setActiveTab("completed")}
          className={`px-4 py-2 text-sm font-medium transition-colors ${
            activeTab === "completed"
              ? "text-orange-600 border-b-2 border-orange-500"
              : "text-stone-500 hover:text-stone-700"
          }`}
        >
          Completed ({completedCount})
        </button>
      </div>

      {/* Request Table */}
      {isLoading ? (
        <Card>
          <CardContent className="p-0">
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Request</TableHead>
                    <TableHead>Quantity</TableHead>
                    <TableHead>Price</TableHead>
                    <TableHead>Deadline</TableHead>
                    <TableHead>Suppliers</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {[1, 2, 3].map((i) => (
                    <TableRow key={i}>
                      <TableCell colSpan={7}>
                        <div className="h-12 bg-stone-100 rounded animate-pulse" />
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      ) : filteredRequests.length > 0 ? (
        <Card>
          <CardContent className="p-0">
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Request</TableHead>
                    <TableHead>Quantity</TableHead>
                    <TableHead>Price</TableHead>
                    <TableHead>Deadline</TableHead>
                    <TableHead>Suppliers</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredRequests.map((request) => {
                    const total = typeof request.total === "number" && Number.isFinite(request.total) ? request.total : 0;
                    const fulfilled = typeof request.fulfilled === "number" && Number.isFinite(request.fulfilled) ? request.fulfilled : 0;
                    const percentage = total > 0 ? (fulfilled / total) * 100 : 0;
                    const progressColor = getProgressColor(percentage, request.status);

                    // Get supplier count
                    const offers = Array.isArray(request.offers) ? request.offers : [];
                    const uniqueSupplierIds = new Set(offers.map(offer => offer.farmerId).filter(Boolean));
                    const offerCount = uniqueSupplierIds.size;
                    const suppliersList = Array.isArray(request.suppliers) ? request.suppliers : [];
                    const supplierRefs = suppliersList.filter(
                      (s): s is { id: string; initials: string; color: string } =>
                        typeof s === "object" && s != null && "id" in s && "initials" in s
                    );
                    const displayCount = offerCount > 0 ? offerCount : supplierRefs.length;

                    return (
                      <TableRow
                        key={request.id}
                        className="cursor-pointer hover:bg-stone-50"
                        onClick={() => handleManage(request)}
                      >
                        <TableCell>
                          <div className="flex items-center gap-3">
                            <div
                              className={`w-10 h-10 rounded-lg ${getProductIconBg(request.productType)} flex items-center justify-center flex-shrink-0`}
                            >
                              {getProductIcon(request.productType)}
                            </div>
                            <div className="min-w-0">
                              <div className="flex items-center gap-2">
                                <p className="font-medium text-stone-900 truncate">{request.title}</p>
                                {request.isRecurring && (
                                  <IconRepeat className="h-3.5 w-3.5 text-blue-600 flex-shrink-0" title="Recurring Order" />
                                )}
                              </div>
                              <div className="flex items-center gap-2 mt-0.5">
                                <span className="text-xs text-stone-500 font-mono">{request.requestId}</span>
                                {request.isRecurring && request.recurringFrequency && (
                                  <span className="text-xs text-blue-600">
                                    {request.recurringFrequency.charAt(0).toUpperCase() + request.recurringFrequency.slice(1)}
                                  </span>
                                )}
                              </div>
                              <div className="mt-1.5">
                                <div className="flex justify-between text-xs mb-1">
                                  <span className="text-stone-500">Fulfilled</span>
                                  <span className="font-medium text-stone-900">
                                    {formatQuantity(fulfilled, request.unit)} / {formatQuantity(total, request.unit)}
                                  </span>
                                </div>
                                <div className="h-1.5 w-full bg-stone-100 rounded-full overflow-hidden">
                                  <div
                                    className={`h-full ${progressColor} transition-all`}
                                    style={{ width: `${percentage}%` }}
                                  />
                                </div>
                              </div>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="text-sm">
                            <p className="font-medium">{formatQuantity(total, request.unit)}</p>
                            {fulfilled > 0 && (
                              <p className="text-xs text-stone-500 mt-0.5">
                                {formatQuantity(fulfilled, request.unit)} fulfilled
                              </p>
                            )}
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="text-sm">
                            <p className="font-medium">{formatPrice(request)}</p>
                            <p className="text-xs text-stone-500 mt-0.5">
                              per {request.priceUnit === "unit" ? "Unit" : "Kg"}
                            </p>
                          </div>
                        </TableCell>
                        <TableCell>
                          <p
                            className={`text-sm font-medium ${
                              request.isPastDue || request.status === "urgent" ? "text-red-600" : "text-stone-700"
                            }`}
                          >
                            {formatDeadline(request.deadline)}
                          </p>
                        </TableCell>
                        <TableCell>
                          {request.status === "draft" ? (
                            <span className="text-xs text-stone-400 italic">—</span>
                          ) : supplierRefs.length > 0 ? (
                            <div className="flex items-center gap-2">
                              <div className="flex -space-x-2">
                                {supplierRefs.slice(0, 3).map((supplier, idx) => (
                                  <div
                                    key={supplier.id || idx}
                                    className={`w-6 h-6 rounded-full ${supplier.color} border-2 border-white flex items-center justify-center text-[10px] font-bold ${
                                      supplier.initials.startsWith("+")
                                        ? "text-stone-400 bg-stone-50"
                                        : supplier.color?.includes("blue")
                                        ? "text-blue-600"
                                        : supplier.color?.includes("purple")
                                        ? "text-purple-600"
                                        : supplier.color?.includes("yellow")
                                        ? "text-yellow-600"
                                        : supplier.color?.includes("green")
                                        ? "text-green-600"
                                        : "text-stone-600"
                                    }`}
                                  >
                                    {supplier.initials}
                                  </div>
                                ))}
                                {displayCount > 3 && (
                                  <div className="w-6 h-6 rounded-full bg-stone-400 border-2 border-white flex items-center justify-center text-[10px] font-bold text-white">
                                    +{displayCount - 3}
                                  </div>
                                )}
                              </div>
                              {displayCount > 3 && (
                                <span className="text-xs text-stone-500">{displayCount}</span>
                              )}
                            </div>
                          ) : displayCount > 0 ? (
                            <span className="text-xs text-stone-500">{displayCount} supplier{displayCount !== 1 ? "s" : ""}</span>
                          ) : (
                            <span className="text-xs text-stone-400 italic">No suppliers yet</span>
                          )}
                        </TableCell>
                        <TableCell>
                          {getStatusBadge(request.status)}
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex items-center justify-end gap-2">
                            {request.status === "draft" ? (
                              <Button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handlePublishDraft(request.id);
                                }}
                                disabled={publishingRequestId === request.id || isLoading}
                                size="sm"
                                className="text-xs px-3 py-1.5 h-auto bg-orange-500 hover:bg-orange-600 text-white"
                              >
                                {publishingRequestId === request.id ? (
                                  <>
                                    <IconLoader2 className="h-3 w-3 mr-1.5 animate-spin" />
                                    Publishing...
                                  </>
                                ) : (
                                  <>
                                    <IconArrowRight className="h-3 w-3 mr-1.5" />
                                    Publish
                                  </>
                                )}
                              </Button>
                            ) : null}
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleManage(request);
                              }}
                              className="text-xs"
                            >
                              Manage
                              <IconArrowRight className="h-3 w-3 ml-1" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      ) : (
        <Card className="bg-white border-stone-200">
          <CardContent className="p-12 text-center">
            <p className="text-lg font-medium text-stone-500">No {activeTab} requests</p>
            <p className="text-sm text-stone-400 mt-1">
              {activeTab === "active"
                ? "Create a new sourcing request to get started"
                : activeTab === "drafts"
                ? "You don't have any draft requests"
                : "No completed requests yet"}
            </p>
            {activeTab === "active" && (
              <Button
                className="mt-4 bg-stone-900 hover:bg-stone-800 text-white"
                onClick={handleCreateRequest}
              >
                <IconPlus className="h-4 w-4 mr-2" />
                Create Request
              </Button>
            )}
          </CardContent>
        </Card>
      )}

      {/* Batch Traceability Dialog */}
      <BatchTraceabilityDialog
        open={traceabilityDialogOpen}
        onOpenChange={setTraceabilityDialogOpen}
        batchId={selectedBatchId}
      />
    </div>
  );
}

