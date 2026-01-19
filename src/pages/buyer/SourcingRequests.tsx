import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
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

interface SourcingRequest {
  id: string;
  requestId: string;
  title: string;
  productType: "fresh_roots" | "process_grade" | "planting_vines";
  status: "open" | "urgent" | "draft" | "closed";
  fulfilled: number;
  total: number;
  unit: "tons" | "kg" | "units";
  priceRange?: { min: number; max: number };
  pricePerUnit?: number;
  priceUnit: "kg" | "unit";
  deadline: string;
  suppliers: Supplier[];
  isPastDue?: boolean;
  isRecurring?: boolean;
  recurringFrequency?: "weekly" | "biweekly" | "monthly" | "quarterly" | "custom";
  recurringEndDate?: string;
  nextDeliveryDate?: string;
}

interface Supplier {
  id: string;
  initials: string;
  color: string;
}

interface SupplierOffer {
  id: string;
  supplierName: string;
  rating?: number;
  isNewSupplier?: boolean;
  quantity: number;
  quantityUnit: "kg" | "tons" | "units";
  pricePerKg: number;
  grade: "A" | "B" | "C";
  batchId?: string; // Batch ID for traceability
  qrCode?: string; // QR code for traceability
}

type TabType = "active" | "drafts" | "history";
type ViewType = "list" | "create" | "manage";

interface CreateRequestForm {
  productType: string;
  quantity: string;
  quantityUnit: "kg" | "tons" | "bags";
  qualityGrade: string;
  priceMin: string;
  priceMax: string;
  deadline: string;
  deliveryRegion: string;
  additionalRequirements: string;
  isRecurring: boolean;
  recurringFrequency: "weekly" | "biweekly" | "monthly" | "quarterly" | "custom";
  recurringEndDate: string;
}

export function SourcingRequests() {
  const navigate = useNavigate();
  const [view, setView] = useState<ViewType>("list");
  const [activeTab, setActiveTab] = useState<TabType>("active");
  const [requests, setRequests] = useState<SourcingRequest[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedRequest, setSelectedRequest] = useState<SourcingRequest | null>(null);
  const [selectedOffer, setSelectedOffer] = useState<SupplierOffer | null>(null);
  const [reviewDialogOpen, setReviewDialogOpen] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [isAcceptingOffer, setIsAcceptingOffer] = useState(false);
  const [traceabilityDialogOpen, setTraceabilityDialogOpen] = useState(false);
  const [selectedBatchId, setSelectedBatchId] = useState<string | undefined>(undefined);
  const [formData, setFormData] = useState<CreateRequestForm>({
    productType: "",
    quantity: "",
    quantityUnit: "kg",
    qualityGrade: "",
    priceMin: "",
    priceMax: "",
    deadline: "",
    deliveryRegion: "",
    additionalRequirements: "",
    isRecurring: false,
    recurringFrequency: "weekly",
    recurringEndDate: "",
  });

  useEffect(() => {
    // TODO: Replace with actual API calls
    setTimeout(() => {
      setRequests([
        {
          id: "1",
          requestId: "REQ-2023-09",
          title: "Fresh OFSP Roots",
          productType: "fresh_roots",
          status: "open",
          fulfilled: 3.2,
          total: 5.0,
          unit: "tons",
          priceRange: { min: 35, max: 40 },
          priceUnit: "kg",
          deadline: "Nov 30, 2023",
          suppliers: [
            { id: "1", initials: "JD", color: "bg-stone-200" },
            { id: "2", initials: "GV", color: "bg-blue-100" },
            { id: "3", initials: "+3", color: "bg-stone-50" },
          ],
        },
        {
          id: "2",
          requestId: "REQ-2023-11",
          title: "Process Grade",
          productType: "process_grade",
          status: "urgent",
          fulfilled: 200,
          total: 2000,
          unit: "kg",
          priceRange: { min: 28, max: 32 },
          priceUnit: "kg",
          deadline: "Nov 22, 2023",
          suppliers: [],
          isPastDue: true,
        },
        {
          id: "3",
          requestId: "REQ-2023-14",
          title: "Planting Vines",
          productType: "planting_vines",
          status: "open",
          fulfilled: 15000,
          total: 20000,
          unit: "units",
          pricePerUnit: 1.5,
          priceUnit: "unit",
          deadline: "Dec 10, 2023",
          suppliers: [
            { id: "1", initials: "MK", color: "bg-purple-100" },
            { id: "2", initials: "AG", color: "bg-yellow-100" },
          ],
        },
        {
          id: "4",
          requestId: "REQ-2023-15",
          title: "Fresh OFSP Roots",
          productType: "fresh_roots",
          status: "open",
          fulfilled: 1.8,
          total: 3.0,
          unit: "tons",
          priceRange: { min: 36, max: 42 },
          priceUnit: "kg",
          deadline: "Dec 15, 2023",
          suppliers: [
            { id: "1", initials: "JM", color: "bg-green-100" },
          ],
        },
      ]);
      setIsLoading(false);
    }, 1000);
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

  const formatQuantity = (value: number, unit: string) => {
    if (unit === "tons") {
      return `${value.toFixed(1)}t`;
    }
    if (unit === "kg") {
      return `${value.toLocaleString()} kg`;
    }
    if (unit === "units") {
      if (value >= 1000) {
        return `${(value / 1000).toFixed(0)}k units`;
      }
      return `${value.toLocaleString()} units`;
    }
    return `${value} ${unit}`;
  };

  const filteredRequests = requests.filter((req) => {
    switch (activeTab) {
      case "active":
        return req.status === "open" || req.status === "urgent";
      case "drafts":
        return req.status === "draft";
      case "history":
        return req.status === "closed";
      default:
        return true;
    }
  });

  const activeCount = requests.filter((r) => r.status === "open" || r.status === "urgent").length;
  const draftsCount = requests.filter((r) => r.status === "draft").length;
  const historyCount = requests.filter((r) => r.status === "closed").length;

  const handleCreateRequest = () => {
    setView("create");
  };

  const handleCancel = () => {
    setView("list");
    setSelectedRequest(null);
    // Reset form
    setFormData({
      productType: "",
      quantity: "",
      quantityUnit: "kg",
      qualityGrade: "",
      priceMin: "",
      priceMax: "",
      deadline: "",
      deliveryRegion: "",
      additionalRequirements: "",
      isRecurring: false,
      recurringFrequency: "weekly",
      recurringEndDate: "",
    });
  };

  const handleBackToList = () => {
    setView("list");
    setSelectedRequest(null);
  };

  const handleSaveDraft = async () => {
    setIsSubmitting(true);
    // TODO: Replace with actual API call
    setTimeout(() => {
      // Create draft request
      const newRequest: SourcingRequest = {
        id: `draft-${Date.now()}`,
        requestId: `REQ-${new Date().getFullYear()}-${String(Math.floor(Math.random() * 100)).padStart(2, "0")}`,
        title: formData.productType || "Draft Request",
        productType: formData.productType === "Fresh OFSP Roots" ? "fresh_roots" : formData.productType === "OFSP Flour" ? "process_grade" : "planting_vines",
        status: "draft",
        fulfilled: 0,
        total: parseFloat(formData.quantity) || 0,
        unit: formData.quantityUnit === "tons" ? "tons" : formData.quantityUnit === "bags" ? "units" : "kg",
        priceRange: formData.priceMin && formData.priceMax ? { min: parseFloat(formData.priceMin), max: parseFloat(formData.priceMax) } : undefined,
        priceUnit: "kg",
        deadline: formData.deadline || new Date().toISOString().split("T")[0],
        suppliers: [],
        isRecurring: formData.isRecurring,
        recurringFrequency: formData.isRecurring ? formData.recurringFrequency : undefined,
        recurringEndDate: formData.isRecurring ? formData.recurringEndDate : undefined,
        nextDeliveryDate: formData.isRecurring && formData.deadline ? formData.deadline : undefined,
      };
      setRequests((prev) => [...prev, newRequest]);
      setIsSubmitting(false);
      setView("list");
      setActiveTab("drafts");
    }, 1000);
  };

  const handlePublishRequest = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    // TODO: Replace with actual API call
    setTimeout(() => {
      // Create active request
      const newRequest: SourcingRequest = {
        id: `req-${Date.now()}`,
        requestId: `REQ-${new Date().getFullYear()}-${String(Math.floor(Math.random() * 100)).padStart(2, "0")}`,
        title: formData.productType || "New Request",
        productType: formData.productType === "Fresh OFSP Roots" ? "fresh_roots" : formData.productType === "OFSP Flour" ? "process_grade" : "planting_vines",
        status: "open",
        fulfilled: 0,
        total: parseFloat(formData.quantity) || 0,
        unit: formData.quantityUnit === "tons" ? "tons" : formData.quantityUnit === "bags" ? "units" : "kg",
        priceRange: formData.priceMin && formData.priceMax ? { min: parseFloat(formData.priceMin), max: parseFloat(formData.priceMax) } : undefined,
        priceUnit: "kg",
        deadline: formData.deadline || new Date().toISOString().split("T")[0],
        suppliers: [],
        isRecurring: formData.isRecurring,
        recurringFrequency: formData.isRecurring ? formData.recurringFrequency : undefined,
        recurringEndDate: formData.isRecurring ? formData.recurringEndDate : undefined,
        nextDeliveryDate: formData.isRecurring && formData.deadline ? formData.deadline : undefined,
      };
      setRequests((prev) => [...prev, newRequest]);
      setIsSubmitting(false);
      setView("list");
      setActiveTab("active");
      handleCancel();
    }, 1000);
  };

  const handleReviewOffer = (offer: SupplierOffer) => {
    setSelectedOffer(offer);
    setReviewDialogOpen(true);
  };

  const handleAcceptOffer = async (offer: SupplierOffer) => {
    setIsAcceptingOffer(true);
    // TODO: Replace with actual API call
    setTimeout(() => {
      // Update request fulfillment
      setRequests((prev) =>
        prev.map((req) =>
          req.id === selectedRequest?.id
            ? {
                ...req,
                fulfilled: req.fulfilled + (offer.quantityUnit === "tons" ? offer.quantity : offer.quantity / 1000),
              }
            : req
        )
      );
      if (selectedRequest) {
        setSelectedRequest({
          ...selectedRequest,
          fulfilled:
            selectedRequest.fulfilled + (offer.quantityUnit === "tons" ? offer.quantity : offer.quantity / 1000),
        });
      }
      setIsAcceptingOffer(false);
      setReviewDialogOpen(false);
      setSelectedOffer(null);
    }, 1000);
  };

  const handleRejectOffer = async (offer: SupplierOffer) => {
    // TODO: Replace with actual API call
    setReviewDialogOpen(false);
    setSelectedOffer(null);
  };

  const handleEditDetails = () => {
    if (selectedRequest) {
      // Pre-populate form with existing request data
      setFormData({
        productType: selectedRequest.title,
        quantity: selectedRequest.total.toString(),
        quantityUnit: selectedRequest.unit === "tons" ? "tons" : selectedRequest.unit === "units" ? "bags" : "kg",
        qualityGrade: "",
        priceMin: selectedRequest.priceRange?.min.toString() || "",
        priceMax: selectedRequest.priceRange?.max.toString() || "",
        deadline: selectedRequest.deadline,
        deliveryRegion: "",
        additionalRequirements: "",
        isRecurring: selectedRequest.isRecurring || false,
        recurringFrequency: selectedRequest.recurringFrequency || "weekly",
        recurringEndDate: selectedRequest.recurringEndDate || "",
      });
      setEditDialogOpen(true);
    }
  };

  const handleSaveEdit = async () => {
    setIsSubmitting(true);
    // TODO: Replace with actual API call
    setTimeout(() => {
      if (selectedRequest) {
        const unit: "kg" | "tons" | "units" =
          formData.quantityUnit === "tons" ? "tons" : formData.quantityUnit === "bags" ? "units" : "kg";
        const updatedRequest: SourcingRequest = {
          ...selectedRequest,
          title: formData.productType || selectedRequest.title,
          total: parseFloat(formData.quantity) || selectedRequest.total,
          unit,
          priceRange: formData.priceMin && formData.priceMax
            ? { min: parseFloat(formData.priceMin), max: parseFloat(formData.priceMax) }
            : selectedRequest.priceRange,
          deadline: formData.deadline || selectedRequest.deadline,
          isRecurring: formData.isRecurring,
          recurringFrequency: formData.isRecurring ? formData.recurringFrequency : undefined,
          recurringEndDate: formData.isRecurring ? formData.recurringEndDate : undefined,
          nextDeliveryDate: formData.isRecurring && formData.deadline ? formData.deadline : undefined,
        };
        setRequests((prev) =>
          prev.map((req) => (req.id === selectedRequest.id ? updatedRequest : req))
        );
        setSelectedRequest(updatedRequest);
      }
      setIsSubmitting(false);
      setEditDialogOpen(false);
    }, 1000);
  };

  // Show manage request view
  if (view === "manage" && selectedRequest) {
    // Mock supplier offers data
    const supplierOffers: SupplierOffer[] = [
      {
        id: "1",
        supplierName: "Green Valley Coop",
        rating: 4.8,
        quantity: 1200,
        quantityUnit: "kg",
        pricePerKg: 35.0,
        grade: "A",
        batchId: "BATCH-2023-004",
        qrCode: "QR-BATCH-2023-004",
      },
      {
        id: "2",
        supplierName: "James Mutua",
        isNewSupplier: true,
        quantity: 500,
        quantityUnit: "kg",
        pricePerKg: 34.5,
        grade: "B",
        batchId: "BATCH-2023-005",
        qrCode: "QR-BATCH-2023-005",
      },
      {
        id: "3",
        supplierName: "Mary Wanjiku",
        rating: 4.5,
        quantity: 800,
        quantityUnit: "kg",
        pricePerKg: 36.0,
        grade: "A",
        batchId: "BATCH-2023-006",
        qrCode: "QR-BATCH-2023-006",
      },
      {
        id: "4",
        supplierName: "Peter Kamau",
        rating: 4.2,
        quantity: 600,
        quantityUnit: "kg",
        pricePerKg: 37.5,
        grade: "A",
        batchId: "BATCH-2023-007",
        qrCode: "QR-BATCH-2023-007",
      },
      {
        id: "5",
        supplierName: "Jane Wambui",
        rating: 4.9,
        quantity: 100,
        quantityUnit: "kg",
        pricePerKg: 35.5,
        grade: "A",
        batchId: "BATCH-2023-008",
        qrCode: "QR-BATCH-2023-008",
      },
    ];

    const totalFulfilled = supplierOffers.reduce((sum, offer) => {
      const kg = offer.quantityUnit === "tons" ? offer.quantity * 1000 : offer.quantity;
      return sum + kg;
    }, 0);
    const totalRequired = selectedRequest.unit === "tons" ? selectedRequest.total * 1000 : selectedRequest.total;
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

    const formatQuantity = (value: number, unit: string) => {
      if (unit === "tons") {
        return `${value.toFixed(1)}t`;
      }
      return `${value.toLocaleString()} ${unit}`;
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
                <h1 className="text-2xl font-bold tracking-tight text-stone-900">{selectedRequest.title}</h1>
                {getStatusBadge(selectedRequest.status)}
                {selectedRequest.isRecurring && (
                  <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-100 text-[10px] font-medium px-2 py-1 flex items-center gap-1">
                    <IconRepeat className="h-3 w-3" />
                    Recurring
                  </Badge>
                )}
              </div>
              <p className="text-stone-500 text-sm mt-0.5 font-mono">
                {selectedRequest.requestId} • Created 2 days ago
                {selectedRequest.isRecurring && selectedRequest.recurringFrequency && (
                  <span className="ml-2 text-stone-400">
                    • {selectedRequest.recurringFrequency.charAt(0).toUpperCase() + selectedRequest.recurringFrequency.slice(1)}
                  </span>
                )}
              </p>
            </div>
          </div>
          <div className="flex gap-2">
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
                  {formatQuantity(selectedRequest.fulfilled, selectedRequest.unit).split(" ")[0]}
                </span>
                <span className="text-sm text-stone-500">
                  / {formatQuantity(selectedRequest.total, selectedRequest.unit)}
                </span>
              </div>
              <div className="mt-3 h-1.5 w-full bg-stone-100 rounded-full overflow-hidden">
                <div
                  className={`h-full ${getProgressColor(fulfillmentPercentage, selectedRequest.status)} transition-all`}
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
                <span className="text-2xl font-bold text-stone-900">KES {avgOfferPrice.toFixed(2)}</span>
                <span className="text-sm text-stone-500">/ kg</span>
              </div>
              <p className="text-xs text-emerald-600 mt-2">Within budget range</p>
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
                  <th className="px-6 py-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-100">
                {supplierOffers.map((offer) => (
                  <tr key={offer.id} className="hover:bg-stone-50 group">
                    <td className="px-6 py-4">
                      <div className="font-medium text-stone-900">{offer.supplierName}</div>
                      {offer.rating ? (
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
                ))}
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
                        KES {(
                          selectedOffer.quantity *
                          (selectedOffer.quantityUnit === "tons" ? 1000 : 1) *
                          selectedOffer.pricePerKg
                        ).toLocaleString()}
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
              <Button
                variant="outline"
                onClick={() => handleRejectOffer(selectedOffer!)}
                disabled={isAcceptingOffer}
                className="w-full sm:w-auto"
              >
                <IconX className="h-4 w-4 mr-2" />
                Reject Offer
              </Button>
              <Button
                onClick={() => handleAcceptOffer(selectedOffer!)}
                disabled={isAcceptingOffer}
                className="w-full sm:w-auto bg-orange-500 hover:bg-orange-600 text-white"
              >
                {isAcceptingOffer ? (
                  <>
                    <IconLoader2 className="h-4 w-4 mr-2 animate-spin" />
                    Accepting...
                  </>
                ) : (
                  <>
                    <IconCheck className="h-4 w-4 mr-2" />
                    Accept Offer
                  </>
                )}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Edit Details Dialog */}
        <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
          <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Edit Sourcing Request</DialogTitle>
              <DialogDescription>Update the details of your sourcing request</DialogDescription>
            </DialogHeader>
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
                  >
                    <SelectTrigger
                      id="edit-productType"
                      className="w-full rounded-lg border border-stone-200 text-sm focus:ring-2 focus:ring-orange-500 focus:border-orange-500 py-2.5 h-auto bg-white"
                    >
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="rounded-lg border-stone-200">
                      <SelectItem value="Fresh OFSP Roots">Fresh OFSP Roots</SelectItem>
                      <SelectItem value="OFSP Flour">OFSP Flour</SelectItem>
                      <SelectItem value="Planting Vines">Planting Vines</SelectItem>
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
                  <Label htmlFor="edit-qualityGrade" className="text-xs font-bold text-stone-500 uppercase tracking-wider">
                    Quality Grade
                  </Label>
                  <Select
                    value={formData.qualityGrade}
                    onValueChange={(value) => setFormData({ ...formData, qualityGrade: value })}
                  >
                    <SelectTrigger
                      id="edit-qualityGrade"
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

                {/* Delivery Region */}
                <div className="space-y-2">
                  <Label htmlFor="edit-deliveryRegion" className="text-xs font-bold text-stone-500 uppercase tracking-wider">
                    Delivery Region
                  </Label>
                  <Select
                    value={formData.deliveryRegion}
                    onValueChange={(value) => setFormData({ ...formData, deliveryRegion: value })}
                  >
                    <SelectTrigger
                      id="edit-deliveryRegion"
                      className="w-full rounded-lg border border-stone-200 text-sm focus:ring-2 focus:ring-orange-500 focus:border-orange-500 py-2.5 h-auto bg-white"
                    >
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="rounded-lg border-stone-200">
                      <SelectItem value="Nairobi HQ">Nairobi HQ</SelectItem>
                      <SelectItem value="Kisumu Hub">Kisumu Hub</SelectItem>
                      <SelectItem value="Mombasa Depot">Mombasa Depot</SelectItem>
                      <SelectItem value="Kangundo">Kangundo</SelectItem>
                      <SelectItem value="Kathiani">Kathiani</SelectItem>
                      <SelectItem value="Masinga">Masinga</SelectItem>
                      <SelectItem value="Yatta">Yatta</SelectItem>
                    </SelectContent>
                  </Select>
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
                      <SelectItem value="Fresh OFSP Roots">Fresh OFSP Roots</SelectItem>
                      <SelectItem value="OFSP Flour">OFSP Flour</SelectItem>
                      <SelectItem value="Planting Vines">Planting Vines</SelectItem>
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

                {/* Delivery Region */}
                <div className="space-y-2">
                  <Label htmlFor="deliveryRegion" className="text-xs font-bold text-stone-500 uppercase tracking-wider">
                    Delivery Region
                  </Label>
                  <Select
                    value={formData.deliveryRegion}
                    onValueChange={(value) => setFormData({ ...formData, deliveryRegion: value })}
                  >
                    <SelectTrigger 
                      id="deliveryRegion" 
                      className="w-full rounded-lg border border-stone-200 text-sm focus:ring-2 focus:ring-orange-500 focus:border-orange-500 py-2.5 h-auto bg-white"
                    >
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="rounded-lg border-stone-200">
                      <SelectItem value="Nairobi HQ">Nairobi HQ</SelectItem>
                      <SelectItem value="Kisumu Hub">Kisumu Hub</SelectItem>
                      <SelectItem value="Mombasa Depot">Mombasa Depot</SelectItem>
                      <SelectItem value="Kangundo">Kangundo</SelectItem>
                      <SelectItem value="Kathiani">Kathiani</SelectItem>
                      <SelectItem value="Masinga">Masinga</SelectItem>
                      <SelectItem value="Yatta">Yatta</SelectItem>
                    </SelectContent>
                  </Select>
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
          onClick={() => setActiveTab("history")}
          className={`px-4 py-2 text-sm font-medium transition-colors ${
            activeTab === "history"
              ? "text-orange-600 border-b-2 border-orange-500"
              : "text-stone-500 hover:text-stone-700"
          }`}
        >
          History
        </button>
      </div>

      {/* Request Cards Grid */}
      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3].map((i) => (
            <Card key={i} className="bg-white border-stone-200 animate-pulse">
              <CardContent className="p-5">
                <div className="h-48 bg-stone-100 rounded" />
              </CardContent>
            </Card>
          ))}
        </div>
      ) : filteredRequests.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredRequests.map((request) => {
            const percentage = (request.fulfilled / request.total) * 100;
            const progressColor = getProgressColor(percentage, request.status);

            return (
              <Card
                key={request.id}
                className="bg-white rounded-xl border border-stone-200 shadow-sm hover:shadow-md transition-shadow group"
              >
                <CardContent className="p-5">
                  {/* Header */}
                  <div className="flex justify-between items-start mb-4">
                    <div className="flex items-center gap-3">
                      <div
                        className={`w-10 h-10 rounded-lg ${getProductIconBg(request.productType)} flex items-center justify-center`}
                      >
                        {getProductIcon(request.productType)}
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <h3 className="text-sm font-bold text-stone-900">{request.title}</h3>
                          {request.isRecurring && (
                            <IconRepeat className="h-3.5 w-3.5 text-blue-600" title="Recurring Order" />
                          )}
                        </div>
                        <span className="text-[10px] text-stone-500 font-mono">{request.requestId}</span>
                        {request.isRecurring && request.recurringFrequency && (
                          <span className="text-[10px] text-blue-600 ml-2">
                            {request.recurringFrequency.charAt(0).toUpperCase() + request.recurringFrequency.slice(1)}
                          </span>
                        )}
                      </div>
                    </div>
                    {getStatusBadge(request.status)}
                  </div>

                  <div className="space-y-4">
                    {/* Fulfillment Progress */}
                    <div>
                      <div className="flex justify-between text-xs mb-1.5">
                        <span className="text-stone-500">Fulfilled</span>
                        <span className="font-medium text-stone-900">
                          {formatQuantity(request.fulfilled, request.unit)} / {formatQuantity(request.total, request.unit)}
                        </span>
                      </div>
                      <div className="h-1.5 w-full bg-stone-100 rounded-full overflow-hidden">
                        <div
                          className={`h-full ${progressColor} transition-all`}
                          style={{ width: `${percentage}%` }}
                        />
                      </div>
                    </div>

                    {/* Price and Deadline */}
                    <div className="grid grid-cols-2 gap-3 py-3 border-t border-b border-stone-50">
                      <div>
                        <p className="text-[10px] text-stone-400 uppercase tracking-wider">
                          Price/{request.priceUnit === "kg" ? "Kg" : "Unit"}
                        </p>
                        <p className="text-sm font-semibold text-stone-700">
                          {request.priceRange
                            ? `KES ${request.priceRange.min} - ${request.priceRange.max}`
                            : `KES ${request.pricePerUnit?.toFixed(1)}`}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-[10px] text-stone-400 uppercase tracking-wider">Deadline</p>
                        <p
                          className={`text-sm font-semibold ${
                            request.isPastDue || request.status === "urgent" ? "text-red-600" : "text-stone-700"
                          }`}
                        >
                          {request.deadline}
                        </p>
                      </div>
                    </div>

                    {/* Suppliers and Manage Button */}
                    <div className="flex justify-between items-center">
                      {request.suppliers.length > 0 ? (
                        <div className="flex -space-x-2">
                          {request.suppliers.map((supplier, idx) => (
                            <div
                              key={supplier.id || idx}
                              className={`w-7 h-7 rounded-full ${supplier.color} border-2 border-white flex items-center justify-center text-[10px] font-bold ${
                                supplier.initials.startsWith("+")
                                  ? "text-stone-400 bg-stone-50"
                                  : supplier.color.includes("blue")
                                  ? "text-blue-600"
                                  : supplier.color.includes("purple")
                                  ? "text-purple-600"
                                  : supplier.color.includes("yellow")
                                  ? "text-yellow-600"
                                  : supplier.color.includes("green")
                                  ? "text-green-600"
                                  : "text-stone-600"
                              }`}
                            >
                              {supplier.initials}
                            </div>
                          ))}
                        </div>
                      ) : (
                        <span className="text-xs text-stone-400 italic">No suppliers yet</span>
                      )}
                      <button
                        onClick={() => {
                          setSelectedRequest(request);
                          setView("manage");
                        }}
                        className="text-xs font-medium text-stone-600 group-hover:text-orange-600 flex items-center gap-1 transition-colors"
                      >
                        Manage
                        <IconArrowRight className="h-3 w-3" />
                      </button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
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

