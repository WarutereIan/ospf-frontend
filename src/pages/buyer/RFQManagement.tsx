import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
// Using simple button-based tabs instead of Tabs component
import {
  IconPlus,
  IconSearch,
  IconCarrot,
  IconPackage,
  IconSeeding,
  IconLoader2,
  IconCalendar,
  IconUsers,
  IconCheck,
  IconX,
  IconShoppingCart,
  IconFileText,
} from "@tabler/icons-react";
import { useAuth } from "@/contexts/AuthContext";
import { useMarketplace } from "@/contexts/MarketplaceContext";
import { RFQForm } from "@/components/marketplace/RFQForm";
import { RFQDetails } from "@/components/marketplace/RFQDetails";
import { cn } from "@/lib/utils";
import type { RFQ, RFQStatus } from "@/types/marketplace";

type TabType = "all" | "drafts" | "published" | "evaluating" | "awarded" | "closed";

export function RFQManagement() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const {
    rfqs,
    selectedRFQ,
    fetchRFQs,
    fetchRFQById,
    createRFQ,
    updateRFQ,
    publishRFQ,
    closeRFQ,
    cancelRFQ,
    rfqFilters,
    setRFQFilters,
    isLoading,
  } = useMarketplace();

  const [activeTab, setActiveTab] = useState<TabType>("all");
  const [view, setView] = useState<"list" | "create" | "details">("list");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedRFQId, setSelectedRFQId] = useState<string | null>(null);

  useEffect(() => {
    const filters: typeof rfqFilters = {};
    if (activeTab === "drafts") {
      filters.status = "draft";
    } else if (activeTab === "published") {
      filters.status = "published";
    } else if (activeTab === "evaluating") {
      filters.status = "evaluating";
    } else if (activeTab === "awarded") {
      filters.status = "awarded";
    } else if (activeTab === "closed") {
      filters.status = "closed";
    }
    fetchRFQs(filters);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeTab]);

  useEffect(() => {
    if (selectedRFQId) {
      fetchRFQById(selectedRFQId);
    }
  }, [selectedRFQId, fetchRFQById]);

  const handleCreateRFQ = async (rfqData: Partial<RFQ>) => {
    try {
      await createRFQ(rfqData);
      setView("list");
      setActiveTab("drafts");
    } catch (error) {
      console.error("Failed to create RFQ:", error);
    }
  };

  const handleUpdateRFQ = async (id: string, rfqData: Partial<RFQ>) => {
    try {
      await updateRFQ(id, rfqData);
      setView("list");
    } catch (error) {
      console.error("Failed to update RFQ:", error);
    }
  };

  const handlePublishRFQ = async (id: string) => {
    try {
      await publishRFQ(id);
      setView("list");
      setActiveTab("published");
    } catch (error) {
      console.error("Failed to publish RFQ:", error);
    }
  };

  const handleViewRFQ = (rfqId: string) => {
    setSelectedRFQId(rfqId);
    setView("details");
  };

  const getProductIcon = (type: RFQ["productType"]) => {
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

  const getStatusBadge = (status: RFQStatus) => {
    const variants: Record<RFQStatus, { className: string; label: string }> = {
      draft: { className: "bg-gray-50 text-gray-700 border-gray-200", label: "Draft" },
      published: { className: "bg-blue-50 text-blue-700 border-blue-200", label: "Published" },
      closed: { className: "bg-gray-50 text-gray-700 border-gray-200", label: "Closed" },
      evaluating: { className: "bg-yellow-50 text-yellow-700 border-yellow-200", label: "Evaluating" },
      awarded: { className: "bg-green-50 text-green-700 border-green-200", label: "Awarded" },
      cancelled: { className: "bg-red-50 text-red-700 border-red-200", label: "Cancelled" },
    };

    const variant = variants[status];
    return (
      <Badge variant="outline" className={cn("text-xs", variant.className)}>
        {variant.label}
      </Badge>
    );
  };

  const filteredRFQs = rfqs.filter((rfq) => {
    const matchesSearch = searchQuery === "" ||
      rfq.rfqNumber?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      rfq.title.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesSearch;
  });

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  if (view === "create") {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold">Create RFQ</h1>
            <p className="text-sm sm:text-base text-muted-foreground mt-1">
              Create a new Request for Quotation
            </p>
          </div>
          <Button variant="outline" onClick={() => setView("list")}>
            Cancel
          </Button>
        </div>
        <RFQForm
          onSubmit={handleCreateRFQ}
          onCancel={() => setView("list")}
        />
      </div>
    );
  }

  if (view === "details" && selectedRFQ) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold">RFQ Details</h1>
            <p className="text-sm sm:text-base text-muted-foreground mt-1">
              {selectedRFQ.rfqNumber || selectedRFQ.requestId}
            </p>
          </div>
          <Button variant="outline" onClick={() => setView("list")}>
            Back to List
          </Button>
        </div>
        <RFQDetails
          rfq={selectedRFQ}
          onUpdate={handleUpdateRFQ}
          onPublish={handlePublishRFQ}
          onClose={closeRFQ}
          onCancel={cancelRFQ}
        />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold">RFQ Management</h1>
          <p className="text-sm sm:text-base text-muted-foreground mt-1">
            Create and manage your Requests for Quotation
          </p>
        </div>
        <Button onClick={() => setView("create")}>
          <IconPlus className="mr-2 h-4 w-4" />
          Create RFQ
        </Button>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1">
              <IconSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search RFQs..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Tabs */}
      <div className="flex gap-2 border-b border-stone-200 pb-1 overflow-x-auto">
        <button
          onClick={() => setActiveTab("all")}
          className={cn(
            "px-4 py-2 text-sm font-medium transition-colors whitespace-nowrap",
            activeTab === "all"
              ? "text-primary border-b-2 border-primary"
              : "text-muted-foreground hover:text-foreground"
          )}
        >
          All
        </button>
        <button
          onClick={() => setActiveTab("drafts")}
          className={cn(
            "px-4 py-2 text-sm font-medium transition-colors whitespace-nowrap",
            activeTab === "drafts"
              ? "text-primary border-b-2 border-primary"
              : "text-muted-foreground hover:text-foreground"
          )}
        >
          Drafts
        </button>
        <button
          onClick={() => setActiveTab("published")}
          className={cn(
            "px-4 py-2 text-sm font-medium transition-colors whitespace-nowrap",
            activeTab === "published"
              ? "text-primary border-b-2 border-primary"
              : "text-muted-foreground hover:text-foreground"
          )}
        >
          Published
        </button>
        <button
          onClick={() => setActiveTab("evaluating")}
          className={cn(
            "px-4 py-2 text-sm font-medium transition-colors whitespace-nowrap",
            activeTab === "evaluating"
              ? "text-primary border-b-2 border-primary"
              : "text-muted-foreground hover:text-foreground"
          )}
        >
          Evaluating
        </button>
        <button
          onClick={() => setActiveTab("awarded")}
          className={cn(
            "px-4 py-2 text-sm font-medium transition-colors whitespace-nowrap",
            activeTab === "awarded"
              ? "text-primary border-b-2 border-primary"
              : "text-muted-foreground hover:text-foreground"
          )}
        >
          Awarded
        </button>
        <button
          onClick={() => setActiveTab("closed")}
          className={cn(
            "px-4 py-2 text-sm font-medium transition-colors whitespace-nowrap",
            activeTab === "closed"
              ? "text-primary border-b-2 border-primary"
              : "text-muted-foreground hover:text-foreground"
          )}
        >
          Closed
        </button>
      </div>

      {/* RFQs List */}
      <div className="mt-6">
          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <IconLoader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : filteredRFQs.length > 0 ? (
            <div className="grid gap-4">
              {filteredRFQs.map((rfq) => (
                <Card key={rfq.id} className="hover:shadow-md transition-shadow">
                  <CardContent className="p-6">
                    <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                      <div className="flex-1 space-y-2">
                        <div className="flex items-center gap-2 flex-wrap">
                          <div className="flex items-center gap-2">
                            {getProductIcon(rfq.productType)}
                            <h3 className="font-semibold">{rfq.title}</h3>
                          </div>
                          {getStatusBadge(rfq.rfqStatus)}
                        </div>
                        <p className="text-sm text-muted-foreground">
                          RFQ #{rfq.rfqNumber || rfq.requestId}
                        </p>
                        <div className="flex items-center gap-4 text-sm flex-wrap">
                          <span>
                            <span className="text-muted-foreground">Quantity: </span>
                            <span className="font-semibold">{rfq.total} {rfq.unit}</span>
                          </span>
                          {rfq.priceRange && (
                            <span>
                              <span className="text-muted-foreground">Price Range: </span>
                              <span className="font-semibold">
                                KES {rfq.priceRange.min} - {rfq.priceRange.max}/{rfq.priceUnit}
                              </span>
                            </span>
                          )}
                          <span className="flex items-center gap-1">
                            <IconCalendar className="h-3 w-3" />
                            <span className="text-muted-foreground">Deadline: </span>
                            <span>{formatDate(rfq.deadline)}</span>
                          </span>
                        </div>
                        {rfq.totalResponses !== undefined && rfq.totalResponses > 0 && (
                          <div className="flex items-center gap-2 text-sm text-muted-foreground">
                            <IconUsers className="h-4 w-4" />
                            <span>{rfq.totalResponses} response{rfq.totalResponses !== 1 ? "s" : ""}</span>
                          </div>
                        )}
                      </div>
                      <div className="flex flex-col sm:flex-row gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleViewRFQ(rfq.id)}
                        >
                          <IconFileText className="mr-2 h-4 w-4" />
                          View
                        </Button>
                        {rfq.rfqStatus === "draft" && (
                          <Button
                            size="sm"
                            onClick={() => handlePublishRFQ(rfq.id)}
                          >
                            Publish
                          </Button>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <Card>
              <CardContent className="py-12 text-center">
                <IconFileText className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <p className="text-lg font-medium text-muted-foreground">No RFQs found</p>
                <p className="text-sm text-muted-foreground mt-1">
                  {searchQuery || activeTab !== "all"
                    ? "Try adjusting your filters"
                    : "Create your first RFQ to get started"}
                </p>
                {!searchQuery && activeTab === "all" && (
                  <Button onClick={() => setView("create")} className="mt-4">
                    <IconPlus className="mr-2 h-4 w-4" />
                    Create RFQ
                  </Button>
                )}
              </CardContent>
            </Card>
          )}
      </div>
    </div>
  );
}
