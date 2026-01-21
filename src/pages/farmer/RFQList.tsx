import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  IconSearch,
  IconCarrot,
  IconPackage,
  IconSeeding,
  IconLoader2,
  IconCalendar,
  IconFileText,
  IconClock,
  IconCheck,
} from "@tabler/icons-react";
import { useMarketplace } from "@/contexts/MarketplaceContext";
import { useAuth } from "@/contexts/AuthContext";
import { RFQDetails } from "@/components/marketplace/RFQDetails";
import { cn } from "@/lib/utils";
import type { RFQ, SourcingProductType, RFQResponse } from "@/types/marketplace";

type ViewTab = "all" | "my_responses";

export function RFQList() {
  const { user } = useAuth();
  const {
    rfqs,
    selectedRFQ,
    fetchRFQs,
    fetchRFQById,
    fetchRFQResponses,
    rfqFilters,
    setRFQFilters,
    isLoading,
  } = useMarketplace();

  const [view, setView] = useState<"list" | "details">("list");
  const [selectedRFQId, setSelectedRFQId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [productTypeFilter, setProductTypeFilter] = useState<SourcingProductType | "all">("all");
  const [activeTab, setActiveTab] = useState<ViewTab>("all");
  const [myResponses, setMyResponses] = useState<RFQResponse[]>([]);
  const [rfqsWithMyResponses, setRfqsWithMyResponses] = useState<Set<string>>(new Set());

  useEffect(() => {
    // Fetch published RFQs
    fetchRFQs({ status: "published" });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Fetch farmer's responses to identify engaged RFQs
  useEffect(() => {
    if (user?.id && activeTab === "my_responses" && rfqs.length > 0) {
      // Check which RFQs have responses from this farmer
      const fetchMyEngagements = async () => {
        try {
          const engagedRFQIds = new Set<string>();
          const allResponses: RFQResponse[] = [];
          
          // For each RFQ, check if farmer has responded
          for (const rfq of rfqs) {
            try {
              const responses = await fetchRFQResponses(rfq.id, { supplierId: user.id });
              if (responses.length > 0) {
                engagedRFQIds.add(rfq.id);
                allResponses.push(...responses);
              }
            } catch (err) {
              // Skip if error fetching responses
            }
          }
          setMyResponses(allResponses);
          setRfqsWithMyResponses(engagedRFQIds);
        } catch (err) {
          console.error("Failed to fetch farmer engagements:", err);
        }
      };
      fetchMyEngagements();
    } else if (activeTab === "all") {
      // Clear my responses when switching to "all" tab
      setMyResponses([]);
      setRfqsWithMyResponses(new Set());
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?.id, activeTab, rfqs.length]);

  useEffect(() => {
    if (selectedRFQId) {
      fetchRFQById(selectedRFQId);
    }
  }, [selectedRFQId, fetchRFQById]);

  const handleViewRFQ = (rfqId: string) => {
    setSelectedRFQId(rfqId);
    setView("details");
  };

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

  const filteredRFQs = rfqs.filter((rfq) => {
    // Filter by tab
    if (activeTab === "my_responses" && !rfqsWithMyResponses.has(rfq.id)) {
      return false;
    }
    
    const matchesSearch = searchQuery === "" ||
      rfq.rfqNumber?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      rfq.title.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesProductType = productTypeFilter === "all" || rfq.productType === productTypeFilter;
    const isNotExpired = !rfq.quoteDeadline || new Date(rfq.quoteDeadline) > new Date();
    return matchesSearch && matchesProductType && isNotExpired;
  });

  const getMyResponseStatus = (rfqId: string): RFQResponse | null => {
    return myResponses.find(r => r.rfqId === rfqId) || null;
  };

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  const getDaysUntilDeadline = (deadline: string) => {
    const days = Math.ceil((new Date(deadline).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24));
    return days;
  };

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
        <RFQDetails rfq={selectedRFQ} />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold">RFQs</h1>
          <p className="text-sm sm:text-base text-muted-foreground mt-1">
            {activeTab === "all" 
              ? "Browse and respond to Requests for Quotation"
              : "RFQs you have responded to or are managing"}
          </p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 border-b">
        <button
          onClick={() => setActiveTab("all")}
          className={cn(
            "px-4 py-2 text-sm font-medium border-b-2 transition-colors",
            activeTab === "all"
              ? "border-primary text-primary"
              : "border-transparent text-muted-foreground hover:text-foreground"
          )}
        >
          All Available
        </button>
        <button
          onClick={() => setActiveTab("my_responses")}
          className={cn(
            "px-4 py-2 text-sm font-medium border-b-2 transition-colors",
            activeTab === "my_responses"
              ? "border-primary text-primary"
              : "border-transparent text-muted-foreground hover:text-foreground"
          )}
        >
          My Responses
        </button>
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
            <Select value={productTypeFilter} onValueChange={(value) => setProductTypeFilter(value as SourcingProductType | "all")}>
              <SelectTrigger className="w-full sm:w-[180px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Products</SelectItem>
                <SelectItem value="fresh_roots">Fresh Roots</SelectItem>
                <SelectItem value="process_grade">Process Grade</SelectItem>
                <SelectItem value="planting_vines">Planting Vines</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* RFQs List */}
      {isLoading ? (
        <div className="flex items-center justify-center py-12">
          <IconLoader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      ) : filteredRFQs.length > 0 ? (
        <div className="grid gap-4">
          {filteredRFQs.map((rfq) => {
            const daysUntilDeadline = getDaysUntilDeadline(rfq.quoteDeadline);
            const isUrgent = daysUntilDeadline <= 3;
            const myResponse = getMyResponseStatus(rfq.id);

            return (
              <Card key={rfq.id} className="hover:shadow-md transition-shadow">
                <CardContent className="p-6">
                  <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                    <div className="flex-1 space-y-2">
                      <div className="flex items-center gap-2 flex-wrap">
                        <div className="flex items-center gap-2">
                          {getProductIcon(rfq.productType)}
                          <h3 className="font-semibold">{rfq.title}</h3>
                        </div>
                        {myResponse && (
                          <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200 text-xs flex items-center gap-1">
                            <IconCheck className="h-3 w-3" />
                            Responded
                          </Badge>
                        )}
                        {isUrgent && (
                          <Badge variant="outline" className="bg-red-50 text-red-700 border-red-200 text-xs">
                            Urgent
                          </Badge>
                        )}
                        {myResponse && (
                          <Badge variant="outline" className="text-xs">
                            Status: {myResponse.status}
                          </Badge>
                        )}
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
                          <span className={cn(
                            "font-medium",
                            isUrgent && "text-red-600"
                          )}>
                            {formatDate(rfq.quoteDeadline)} ({daysUntilDeadline} days)
                          </span>
                        </span>
                      </div>
                      {rfq.deliveryRegion && (
                        <div className="flex items-center gap-1 text-sm text-muted-foreground">
                          <IconClock className="h-3 w-3" />
                          <span>Delivery: {rfq.deliveryRegion}</span>
                        </div>
                      )}
                      {rfq.totalResponses !== undefined && rfq.totalResponses > 0 && (
                        <p className="text-xs text-muted-foreground">
                          {rfq.totalResponses} response{rfq.totalResponses !== 1 ? "s" : ""} received
                        </p>
                      )}
                    </div>
                    <div className="flex flex-col gap-2">
                      <Button onClick={() => handleViewRFQ(rfq.id)}>
                        <IconFileText className="mr-2 h-4 w-4" />
                        View & Respond
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      ) : (
        <Card>
          <CardContent className="py-12 text-center">
            <IconFileText className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <p className="text-lg font-medium text-muted-foreground">No RFQs available</p>
            <p className="text-sm text-muted-foreground mt-1">
              {searchQuery || productTypeFilter !== "all"
                ? "Try adjusting your filters"
                : "Check back later for new RFQs"}
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
