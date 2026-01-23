import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  IconSearch,
  IconCarrot,
  IconPackage,
  IconSeeding,
  IconStar,
  IconMapPin,
  IconCalendar,
  IconFilter,
  IconLayoutGrid,
  IconList,
  IconClock,
  IconChevronDown,
  IconFileText,
  IconRefresh,
  IconUsers,
  IconCurrency,
  IconTrendingUp,
} from "@tabler/icons-react";
import { useAuth } from "@/contexts/AuthContext";
import { useMarketplace } from "@/contexts/MarketplaceContext";
import { RFQDetails } from "@/components/marketplace/RFQDetails";
import { RFQResponseForm } from "@/components/marketplace/RFQResponseForm";
import { SupplierOfferForm } from "@/components/marketplace/SupplierOfferForm";
import { showSuccess, showError, formatApiError } from "@/lib/toast";
import type { RFQ, SourcingRequest, SourcingProductType, SupplierOffer } from "@/types/marketplace";

type RequestType = "all" | "rfq" | "sourcing";
type ViewMode = "grid" | "list";

interface BuyerRequestCard {
  id: string;
  type: "rfq" | "sourcing";
  title: string;
  productType: SourcingProductType;
  quantity: number;
  unit: string;
  fulfilled?: number; // For sourcing requests
  priceRange?: { min: number; max: number };
  pricePerUnit?: number;
  priceUnit?: "kg" | "unit";
  deadline: string;
  location?: string;
  buyerName?: string;
  status: string;
  responses?: number;
  createdAt: string;
  data: RFQ | SourcingRequest;
}

export function BuyerRequests() {
  const { user } = useAuth();
  const {
    rfqs,
    sourcingRequests,
    fetchRFQs,
    fetchSourcingRequests,
    submitRFQResponse,
    submitSupplierOffer,
    isLoading,
  } = useMarketplace();

  const [viewMode, setViewMode] = useState<ViewMode>("grid");
  const [requestType, setRequestType] = useState<RequestType>("all");
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedProductType, setSelectedProductType] = useState<SourcingProductType | "all">("all");
  const [selectedStatus, setSelectedStatus] = useState<string>("all");
  const [sortBy, setSortBy] = useState<string>("date_desc");
  const [selectedRequest, setSelectedRequest] = useState<BuyerRequestCard | null>(null);
  const [detailsDialogOpen, setDetailsDialogOpen] = useState(false);
  const [responseFormOpen, setResponseFormOpen] = useState(false);
  const [offerFormOpen, setOfferFormOpen] = useState(false);

  useEffect(() => {
    // Fetch published RFQs
    fetchRFQs({ status: "published" });
    // Fetch open sourcing requests
    fetchSourcingRequests({ status: "open" });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Combine RFQs and Sourcing Requests into unified cards
  const buyerRequestCards: BuyerRequestCard[] = [
    ...rfqs.map((rfq) => ({
      id: rfq.id,
      type: "rfq" as const,
      title: rfq.title,
      productType: rfq.productType,
      quantity: rfq.total,
      unit: rfq.unit,
      priceRange: rfq.priceRange,
      deadline: rfq.quoteDeadline || rfq.deadline,
      location: rfq.deliveryRegion,
      buyerName: rfq.buyerName || "Buyer",
      status: rfq.rfqStatus,
      responses: rfq.totalResponses,
      createdAt: rfq.createdAt,
      data: rfq,
    })),
    ...sourcingRequests.map((sr) => ({
      id: sr.id,
      type: "sourcing" as const,
      title: sr.title,
      productType: sr.productType,
      quantity: sr.total,
      unit: sr.unit,
      fulfilled: sr.fulfilled,
      priceRange: sr.priceRange,
      pricePerUnit: sr.pricePerUnit,
      priceUnit: sr.priceUnit,
      deadline: sr.deadline,
      location: sr.deliveryRegion,
      buyerName: sr.buyerName || "Buyer",
      status: sr.status,
      responses: sr.suppliers?.length || 0,
      createdAt: sr.createdAt,
      data: sr,
    })),
  ];

  // Filter and sort
  const filteredCards = buyerRequestCards
    .filter((card) => {
      // Type filter
      if (requestType !== "all" && card.type !== requestType) return false;
      
      // Product type filter
      if (selectedProductType !== "all" && card.productType !== selectedProductType) return false;
      
      // Status filter
      if (selectedStatus !== "all" && card.status !== selectedStatus) return false;
      
      // Search filter
      if (searchTerm) {
        const searchLower = searchTerm.toLowerCase();
        return (
          card.title.toLowerCase().includes(searchLower) ||
          card.buyerName?.toLowerCase().includes(searchLower) ||
          card.location?.toLowerCase().includes(searchLower)
        );
      }
      
      return true;
    })
    .sort((a, b) => {
      switch (sortBy) {
        case "date_desc":
          return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
        case "date_asc":
          return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
        case "deadline_asc":
          return new Date(a.deadline).getTime() - new Date(b.deadline).getTime();
        case "quantity_desc":
          return b.quantity - a.quantity;
        default:
          return 0;
      }
    });

  const getProductIcon = (type: SourcingProductType) => {
    switch (type) {
      case "fresh_roots":
        return <IconCarrot className="h-5 w-5 text-orange-600" />;
      case "process_grade":
        return <IconPackage className="h-5 w-5 text-blue-600" />;
      case "planting_vines":
        return <IconSeeding className="h-5 w-5 text-green-600" />;
    }
  };

  const getStatusBadge = (status: string, type: "rfq" | "sourcing") => {
    if (type === "rfq") {
      const rfqStatus = status as RFQ["rfqStatus"];
      const variants: Record<RFQ["rfqStatus"], { className: string; label: string }> = {
        draft: { className: "bg-gray-50 text-gray-700 border-gray-200", label: "Draft" },
        published: { className: "bg-blue-50 text-blue-700 border-blue-200", label: "Open" },
        closed: { className: "bg-gray-50 text-gray-700 border-gray-200", label: "Closed" },
        evaluating: { className: "bg-yellow-50 text-yellow-700 border-yellow-200", label: "Evaluating" },
        awarded: { className: "bg-green-50 text-green-700 border-green-200", label: "Awarded" },
        cancelled: { className: "bg-red-50 text-red-700 border-red-200", label: "Cancelled" },
      };
      const variant = variants[rfqStatus] || variants.published;
      return (
        <Badge variant="outline" className={`text-xs ${variant.className}`}>
          {variant.label}
        </Badge>
      );
    } else {
      const srStatus = status as SourcingRequest["status"];
      const variants: Record<SourcingRequest["status"], { className: string; label: string }> = {
        draft: { className: "bg-gray-50 text-gray-700 border-gray-200", label: "Draft" },
        open: { className: "bg-blue-50 text-blue-700 border-blue-200", label: "Open" },
        urgent: { className: "bg-red-50 text-red-700 border-red-200", label: "Urgent" },
        closed: { className: "bg-gray-50 text-gray-700 border-gray-200", label: "Closed" },
        fulfilled: { className: "bg-green-50 text-green-700 border-green-200", label: "Fulfilled" },
      };
      const variant = variants[srStatus] || variants.open;
      return (
        <Badge variant="outline" className={`text-xs ${variant.className}`}>
          {variant.label}
        </Badge>
      );
    }
  };

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
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

  const formatPrice = (card: BuyerRequestCard) => {
    if (card.priceRange && typeof card.priceRange.min === "number" && typeof card.priceRange.max === "number") {
      const unitLabel = card.priceUnit === "unit" ? "unit" : card.unit === "kg" ? "kg" : card.unit;
      return `KES ${card.priceRange.min.toLocaleString()} – ${card.priceRange.max.toLocaleString()}/${unitLabel}`;
    }
    if (card.pricePerUnit && typeof card.pricePerUnit === "number" && Number.isFinite(card.pricePerUnit)) {
      const unitLabel = card.priceUnit === "unit" ? "unit" : card.unit === "kg" ? "kg" : card.unit;
      return `KES ${card.pricePerUnit.toLocaleString(undefined, { minimumFractionDigits: 1, maximumFractionDigits: 1 })}/${unitLabel}`;
    }
    return null;
  };

  const getDaysUntilDeadline = (deadline: string) => {
    const days = Math.ceil((new Date(deadline).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24));
    return days;
  };

  const handleViewDetails = (card: BuyerRequestCard) => {
    setSelectedRequest(card);
    setDetailsDialogOpen(true);
  };

  const handleRespond = (card: BuyerRequestCard) => {
    setSelectedRequest(card);
    if (card.type === "rfq") {
      setResponseFormOpen(true);
    } else {
      // For sourcing requests, open offer form
      setOfferFormOpen(true);
    }
  };

  const canRespond = (card: BuyerRequestCard) => {
    if (card.type === "rfq") {
      return card.status === "published" && 
        (!card.deadline || new Date(card.deadline) > new Date());
    } else {
      return card.status === "open" || card.status === "urgent";
    }
  };

  return (
    <div className="max-w-7xl mx-auto space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-stone-900">Buyer Requests</h1>
          <p className="text-stone-500 mt-1">
            Browse RFQs and sourcing requests from buyers. Respond with your quotes and offers.
          </p>
        </div>
      </div>

      {/* Filters Toolbar */}
      <div className="bg-white rounded-xl border border-stone-200 shadow-sm p-1">
        <div className="flex flex-col lg:flex-row divide-y lg:divide-y-0 lg:divide-x divide-stone-100">
          {/* Search */}
          <div className="flex-1 p-2">
            <div className="relative group">
              <IconSearch className="absolute left-3 top-2.5 h-[18px] w-[18px] text-stone-400 group-focus-within:text-orange-500 transition-colors" />
              <Input
                type="text"
                placeholder="Search by title, buyer name, or location..."
                className="w-full pl-10 pr-4 py-2 bg-stone-50 border border-stone-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-orange-100 focus:border-orange-500 transition-all placeholder:text-stone-400"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>

          {/* Dropdown Filters Group */}
          <div className="flex items-center gap-1 p-2 overflow-x-auto">
            {/* Request Type */}
            <Select value={requestType} onValueChange={(value) => setRequestType(value as RequestType)}>
              <SelectTrigger className="flex items-center gap-2 px-3 py-2 text-sm font-medium text-stone-600 bg-white border border-stone-200 rounded-lg hover:bg-stone-50 hover:border-stone-300 transition-all min-w-[120px] justify-between h-auto">
                <SelectValue />
                <IconChevronDown className="h-3.5 w-3.5 text-stone-400" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Requests</SelectItem>
                <SelectItem value="rfq">RFQs</SelectItem>
                <SelectItem value="sourcing">Sourcing</SelectItem>
              </SelectContent>
            </Select>

            {/* Product Type */}
            <Select value={selectedProductType} onValueChange={(value) => setSelectedProductType(value as SourcingProductType | "all")}>
              <SelectTrigger className="flex items-center gap-2 px-3 py-2 text-sm font-medium text-stone-600 bg-white border border-stone-200 rounded-lg hover:bg-stone-50 hover:border-stone-300 transition-all min-w-[140px] justify-between h-auto">
                <SelectValue />
                <IconChevronDown className="h-3.5 w-3.5 text-stone-400" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Products</SelectItem>
                <SelectItem value="fresh_roots">Fresh Roots</SelectItem>
                <SelectItem value="process_grade">Process Grade</SelectItem>
                <SelectItem value="planting_vines">Planting Vines</SelectItem>
              </SelectContent>
            </Select>

            {/* Status */}
            <Select value={selectedStatus} onValueChange={setSelectedStatus}>
              <SelectTrigger className="flex items-center gap-2 px-3 py-2 text-sm font-medium text-stone-600 bg-white border border-stone-200 rounded-lg hover:bg-stone-50 hover:border-stone-300 transition-all min-w-[100px] justify-between h-auto">
                <SelectValue />
                <IconChevronDown className="h-3.5 w-3.5 text-stone-400" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="published">Open</SelectItem>
                <SelectItem value="open">Open</SelectItem>
                <SelectItem value="urgent">Urgent</SelectItem>
                <SelectItem value="evaluating">Evaluating</SelectItem>
              </SelectContent>
            </Select>

            <div className="w-px h-6 bg-stone-200 mx-2" />

            {/* View Toggle */}
            <div className="flex gap-1">
              <button
                onClick={() => setViewMode("grid")}
                className={`p-1.5 rounded ${
                  viewMode === "grid"
                    ? "text-stone-800 bg-white border border-stone-200 shadow-sm"
                    : "text-stone-400 hover:text-stone-600"
                }`}
              >
                <IconLayoutGrid className="h-4 w-4" />
              </button>
              <button
                onClick={() => setViewMode("list")}
                className={`p-1.5 rounded ${
                  viewMode === "list"
                    ? "text-stone-800 bg-white border border-stone-200 shadow-sm"
                    : "text-stone-400 hover:text-stone-600"
                }`}
              >
                <IconList className="h-4 w-4" />
              </button>
            </div>
          </div>

          {/* Sort */}
          <div className="p-2 flex items-center justify-end min-w-[180px]">
            <span className="text-xs font-medium text-stone-400 mr-2 uppercase tracking-wide">Sort by:</span>
            <Select value={sortBy} onValueChange={(value) => setSortBy(value || "date_desc")}>
              <SelectTrigger className="bg-transparent text-sm font-medium text-stone-800 focus:outline-none cursor-pointer border-0 shadow-none h-auto p-0">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="date_desc">Newest First</SelectItem>
                <SelectItem value="date_asc">Oldest First</SelectItem>
                <SelectItem value="deadline_asc">Deadline Soonest</SelectItem>
                <SelectItem value="quantity_desc">Largest Quantity</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>

      {/* Results Info */}
      <div className="flex items-center justify-between">
        <p className="text-sm text-stone-500 font-medium">
          Showing <span className="text-stone-900 font-bold">{filteredCards.length}</span> of{" "}
          <span className="text-stone-900">{buyerRequestCards.length}</span> requests
        </p>
      </div>

      {/* Request Cards Grid */}
      {isLoading ? (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <Card key={i} className="animate-pulse">
              <CardHeader>
                <div className="aspect-video w-full rounded-lg bg-muted mb-4" />
                <div className="h-4 w-3/4 bg-muted rounded" />
                <div className="h-3 w-1/2 bg-muted rounded mt-2" />
              </CardHeader>
              <CardContent>
                <div className="h-6 w-1/3 bg-muted rounded" />
              </CardContent>
            </Card>
          ))}
        </div>
      ) : filteredCards.length > 0 ? (
        <div className={viewMode === "grid" ? "grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6" : "space-y-4"}>
          {filteredCards.map((card) => {
            const daysUntilDeadline = getDaysUntilDeadline(card.deadline);
            const isUrgent = daysUntilDeadline <= 3;

            return (
              <div
                key={`${card.type}-${card.id}`}
                className="bg-white rounded-2xl border border-stone-200 shadow-sm hover:shadow-lg hover:-translate-y-1 transition-all duration-300 group flex flex-col"
              >
                {/* Header Area */}
                <div className="relative h-32 bg-gradient-to-br from-stone-100 to-stone-50 rounded-t-2xl overflow-hidden border-b border-stone-100 p-4">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-2">
                      {getProductIcon(card.productType)}
                      <div>
                        <div className="flex items-center gap-2 flex-wrap">
                          {card.type === "rfq" ? (
                            <IconFileText className="h-4 w-4 text-blue-600" />
                          ) : (
                            <IconRefresh className="h-4 w-4 text-orange-600" />
                          )}
                          <Badge variant="outline" className="text-xs">
                            {card.type === "rfq" ? "RFQ" : "Sourcing"}
                          </Badge>
                          {getStatusBadge(card.status, card.type)}
                        </div>
                      </div>
                    </div>
                    {isUrgent && (
                      <Badge variant="outline" className="bg-red-50 text-red-700 border-red-200 text-xs">
                        Urgent
                      </Badge>
                    )}
                  </div>
                </div>

                {/* Content */}
                <div className="p-5 flex-1 flex flex-col">
                  <div className="mb-3">
                    <h3 className="font-bold text-stone-900 text-lg leading-tight group-hover:text-orange-500 transition-colors mb-2">
                      {card.title}
                    </h3>
                    {card.buyerName && (
                      <div className="flex items-center gap-1.5 text-xs text-stone-500 mb-1">
                        <span className="font-medium text-stone-700">{card.buyerName}</span>
                        {card.location && (
                          <>
                            <span className="w-1 h-1 rounded-full bg-stone-300" />
                            <span className="flex items-center gap-1">
                              <IconMapPin className="h-3 w-3" />
                              {card.location}
                            </span>
                          </>
                        )}
                      </div>
                    )}
                  </div>

                  {/* Meta Stats */}
                  <div className="space-y-2 mb-4 text-sm">
                    <div className="flex items-center justify-between">
                      <span className="text-stone-500">Quantity:</span>
                      <span className="font-semibold text-stone-900">
                        {formatQuantity(card.quantity, card.unit)}
                      </span>
                    </div>
                    {card.type === "sourcing" && card.fulfilled !== undefined && card.fulfilled !== null && (
                      <div className="flex items-center justify-between">
                        <span className="text-stone-500">Fulfilled:</span>
                        <span className="font-semibold text-stone-900">
                          {formatQuantity(card.fulfilled, card.unit)}
                        </span>
                      </div>
                    )}
                    {formatPrice(card) && (
                      <div className="flex items-center justify-between">
                        <span className="text-stone-500 flex items-center gap-1">
                          <IconCurrency className="h-3.5 w-3.5" />
                          Price:
                        </span>
                        <span className="font-semibold text-stone-900">
                          {formatPrice(card)}
                        </span>
                      </div>
                    )}
                    <div className="flex items-center justify-between">
                      <span className="text-stone-500 flex items-center gap-1">
                        <IconCalendar className="h-3.5 w-3.5" />
                        Deadline:
                      </span>
                      <span className={`font-semibold ${isUrgent ? "text-red-600" : "text-stone-900"}`}>
                        {formatDate(card.deadline)} ({daysUntilDeadline}d)
                      </span>
                    </div>
                    {card.responses !== undefined && card.responses > 0 && (
                      <div className="flex items-center justify-between">
                        <span className="text-stone-500 flex items-center gap-1">
                          <IconUsers className="h-3.5 w-3.5" />
                          Responses:
                        </span>
                        <span className="font-semibold text-stone-900">{card.responses}</span>
                      </div>
                    )}
                  </div>

                  {/* Actions */}
                  <div className="mt-auto space-y-2">
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        className="flex-1 text-xs font-medium text-stone-600 hover:text-orange-600 hover:border-orange-500 border-stone-200 py-2"
                        onClick={() => handleViewDetails(card)}
                      >
                        <IconFileText className="h-3.5 w-3.5 mr-2" />
                        View Details
                      </Button>
                      {canRespond(card) && (
                        <Button
                          className="flex-1 bg-stone-900 hover:bg-stone-800 text-white text-xs font-semibold py-2"
                          onClick={() => handleRespond(card)}
                        >
                          {card.type === "rfq" ? (
                            <>
                              <IconFileText className="h-3.5 w-3.5 mr-2" />
                              Submit Quote
                            </>
                          ) : (
                            <>
                              <IconRefresh className="h-3.5 w-3.5 mr-2" />
                              Submit Offer
                            </>
                          )}
                        </Button>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <Card className="bg-white border-stone-200">
          <CardContent className="py-12 text-center">
            <IconFileText className="h-12 w-12 text-stone-400 mx-auto mb-4" />
            <p className="text-lg font-medium text-stone-500">No buyer requests found</p>
            <p className="text-sm text-stone-500 mt-1">
              {searchTerm || requestType !== "all" || selectedProductType !== "all"
                ? "Try adjusting your filters or search terms"
                : "Check back later for new RFQs and sourcing requests"}
            </p>
          </CardContent>
        </Card>
      )}

      {/* RFQ Details Dialog */}
      {selectedRequest && selectedRequest.type === "rfq" && (
        <Dialog open={detailsDialogOpen} onOpenChange={setDetailsDialogOpen}>
          <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
            <RFQDetails
              rfq={selectedRequest.data as RFQ}
              onUpdate={async () => {}}
              onPublish={async () => {}}
              onClose={async () => {}}
              onCancel={async () => {}}
            />
          </DialogContent>
        </Dialog>
      )}

      {/* RFQ Response Form Dialog */}
      {selectedRequest && selectedRequest.type === "rfq" && (
        <Dialog open={responseFormOpen} onOpenChange={setResponseFormOpen}>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Submit Quote</DialogTitle>
              <DialogDescription>
                Provide your quote for RFQ: {selectedRequest.title}
              </DialogDescription>
            </DialogHeader>
            <RFQResponseForm
              rfq={selectedRequest.data as RFQ}
              onSubmit={async (response) => {
                // Handle response submission
                setResponseFormOpen(false);
                // Refresh RFQs
                fetchRFQs({ status: "published" });
              }}
              onCancel={() => setResponseFormOpen(false)}
            />
          </DialogContent>
        </Dialog>
      )}

      {/* Sourcing Request Details */}
      {selectedRequest && selectedRequest.type === "sourcing" && (
        <Dialog open={detailsDialogOpen} onOpenChange={setDetailsDialogOpen}>
          <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
            <div className="space-y-6">
              <div>
                <h2 className="text-2xl font-bold">{selectedRequest.title}</h2>
                <p className="text-sm text-muted-foreground mt-1">
                  Sourcing Request #{(selectedRequest.data as SourcingRequest).requestId || selectedRequest.id}
                </p>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-muted-foreground">Quantity Required</p>
                  <p className="font-semibold">{selectedRequest.quantity} {selectedRequest.unit}</p>
                </div>
                {selectedRequest.priceRange && (
                  <div>
                    <p className="text-sm text-muted-foreground">Price Range</p>
                    <p className="font-semibold">
                      KES {selectedRequest.priceRange.min} - {selectedRequest.priceRange.max}
                    </p>
                  </div>
                )}
                <div>
                  <p className="text-sm text-muted-foreground">Deadline</p>
                  <p className="font-semibold">{formatDate(selectedRequest.deadline)}</p>
                </div>
                {selectedRequest.location && (
                  <div>
                    <p className="text-sm text-muted-foreground">Delivery Location</p>
                    <p className="font-semibold">{selectedRequest.location}</p>
                  </div>
                )}
              </div>
              {(selectedRequest.data as SourcingRequest).additionalRequirements && (
                <div>
                  <p className="text-sm text-muted-foreground mb-1">Additional Requirements</p>
                  <p className="text-sm">{(selectedRequest.data as SourcingRequest).additionalRequirements}</p>
                </div>
              )}
              <Button
                className="w-full"
                onClick={() => {
                  setDetailsDialogOpen(false);
                  setOfferFormOpen(true);
                }}
              >
                Submit Offer
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      )}

      {/* Supplier Offer Form Dialog */}
      {selectedRequest && selectedRequest.type === "sourcing" && (
        <Dialog open={offerFormOpen} onOpenChange={setOfferFormOpen}>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Submit Offer</DialogTitle>
              <DialogDescription>
                Provide your offer for Sourcing Request: {selectedRequest.title}
              </DialogDescription>
            </DialogHeader>
            <SupplierOfferForm
              sourcingRequest={selectedRequest.data as SourcingRequest}
              onSubmit={async (offer) => {
                try {
                  await submitSupplierOffer(selectedRequest.id, offer);
                  showSuccess(
                    "Offer submitted successfully",
                    `Your offer for ${selectedRequest.title} has been submitted`
                  );
                  setOfferFormOpen(false);
                  // Refresh sourcing requests
                  fetchSourcingRequests({ status: "open" });
                } catch (error) {
                  console.error("Failed to submit offer:", error);
                  showError("Failed to submit offer", formatApiError(error));
                }
              }}
              onCancel={() => setOfferFormOpen(false)}
            />
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}
