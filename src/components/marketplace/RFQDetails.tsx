import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
// Using simple button-based tabs instead of Tabs component
import {
  IconLoader2,
  IconCalendar,
  IconUsers,
  IconCheck,
  IconX,
  IconShoppingCart,
  IconStar,
  IconMapPin,
  IconCurrency,
  IconPackage,
  IconArrowLeft,
  IconFileText,
} from "@tabler/icons-react";
import { useMarketplace } from "@/contexts/MarketplaceContext";
import { RFQResponseForm } from "./RFQResponseForm";
import { RFQResponseCard } from "./RFQResponseCard";
import { RFQComparisonView } from "./RFQComparisonView";
import { cn } from "@/lib/utils";
import type { RFQ, RFQResponse, RFQResponseStatus } from "@/types/marketplace";

interface RFQDetailsProps {
  rfq: RFQ;
  onUpdate?: (id: string, rfq: Partial<RFQ>) => Promise<void>;
  onPublish?: (id: string) => Promise<void>;
  onClose?: (id: string) => Promise<void>;
  onCancel?: (id: string) => Promise<void>;
  isFarmerView?: boolean;
  farmerResponseId?: string;
  farmerUserId?: string;
  hideSubmitButton?: boolean;
}

export function RFQDetails({
  rfq,
  onUpdate,
  onPublish,
  onClose,
  onCancel,
  isFarmerView = false,
  farmerResponseId,
  farmerUserId,
  hideSubmitButton = false,
}: RFQDetailsProps) {
  const navigate = useNavigate();
  const {
    fetchRFQResponses,
    submitRFQResponse,
    updateRFQResponseStatus,
    awardRFQ,
    convertRFQResponseToOrder,
    isLoading,
  } = useMarketplace();

  const [responses, setResponses] = useState<RFQResponse[]>(rfq.responses || []);
  const [showResponseForm, setShowResponseForm] = useState(false);
  const [selectedResponse, setSelectedResponse] = useState<RFQResponse | null>(null);
  const [viewMode, setViewMode] = useState<"list" | "compare">("list");
  const [selectedResponseIds, setSelectedResponseIds] = useState<string[]>([]);

  useEffect(() => {
    if (rfq.id) {
      let cancelled = false;
      // If farmer view, fetch only their responses using supplierId filter
      const fetchPromise = isFarmerView && farmerUserId
        ? fetchRFQResponses(rfq.id, { supplierId: farmerUserId })
        : fetchRFQResponses(rfq.id);
      
      fetchPromise.then((data) => {
        if (!cancelled) {
          setResponses(data);
        }
      });
      return () => {
        cancelled = true;
      };
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [rfq.id, isFarmerView, farmerUserId]); // Removed fetchRFQResponses from dependencies to prevent infinite loop

  const handleSubmitResponse = async (response: Partial<RFQResponse>) => {
    if (!rfq.id) return;
    try {
      await submitRFQResponse(rfq.id, response);
      const updatedResponses = await fetchRFQResponses(rfq.id);
      setResponses(updatedResponses);
      setShowResponseForm(false);
    } catch (error) {
      console.error("Failed to submit response:", error);
    }
  };

  const handleUpdateResponseStatus = async (
    responseId: string,
    status: RFQResponseStatus
  ) => {
    if (!rfq.id) return;
    try {
      await updateRFQResponseStatus(rfq.id, responseId, status);
      const updatedResponses = await fetchRFQResponses(rfq.id);
      setResponses(updatedResponses);
    } catch (error) {
      console.error("Failed to update response status:", error);
    }
  };

  const handleAwardRFQ = async () => {
    if (!rfq.id || selectedResponseIds.length === 0) return;
    try {
      await awardRFQ(rfq.id, selectedResponseIds);
      const updatedResponses = await fetchRFQResponses(rfq.id);
      setResponses(updatedResponses);
      setSelectedResponseIds([]);
    } catch (error) {
      console.error("Failed to award RFQ:", error);
    }
  };

  const handleConvertToOrder = async (responseId: string) => {
    if (!rfq.id) return;
    try {
      const result = await convertRFQResponseToOrder(rfq.id, responseId);
      if (result) {
        navigate(`/orders/${result.id}`);
      }
    } catch (error) {
      console.error("Failed to convert to order:", error);
    }
  };

  const getStatusBadge = (status: RFQ["rfqStatus"]) => {
    const variants: Record<RFQ["rfqStatus"], { className: string; label: string }> = {
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

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  const canSubmitResponse = rfq.rfqStatus === "published" &&
    (!rfq.quoteDeadline || new Date(rfq.quoteDeadline) > new Date());

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <h1 className="text-2xl sm:text-3xl font-bold">{rfq.title}</h1>
            {getStatusBadge(rfq.rfqStatus)}
          </div>
          <p className="text-sm text-muted-foreground">
            RFQ #{rfq.rfqNumber || rfq.requestId} • Created {formatDate(rfq.createdAt)}
          </p>
        </div>
        <div className="flex gap-2">
          {rfq.rfqStatus === "draft" && onPublish && (
            <Button onClick={() => onPublish(rfq.id)}>
              Publish RFQ
            </Button>
          )}
          {rfq.rfqStatus === "published" && onClose && (
            <Button variant="outline" onClick={() => onClose(rfq.id)}>
              Close RFQ
            </Button>
          )}
          {rfq.rfqStatus !== "cancelled" && onCancel && (
            <Button variant="outline" onClick={() => onCancel(rfq.id)}>
              Cancel
            </Button>
          )}
        </div>
      </div>

      {/* RFQ Information */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Quantity Required</p>
                <p className="text-2xl font-bold">{rfq.total} {rfq.unit}</p>
              </div>
              <IconPackage className="h-8 w-8 text-primary" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Responses Received</p>
                <p className="text-2xl font-bold">{responses.length}</p>
              </div>
              <IconUsers className="h-8 w-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Quote Deadline</p>
                <p className="text-lg font-bold">{formatDate(rfq.quoteDeadline)}</p>
              </div>
              <IconCalendar className="h-8 w-8 text-orange-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* RFQ Details */}
      <Card>
        <CardHeader>
          <CardTitle>RFQ Details</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-sm text-muted-foreground">Product Type</p>
              <p className="font-medium">{rfq.productType.replace("_", " ")}</p>
            </div>
            {rfq.variety && (
              <div>
                <p className="text-sm text-muted-foreground">Variety</p>
                <p className="font-medium">{rfq.variety}</p>
              </div>
            )}
            {rfq.qualityGrade && (
              <div>
                <p className="text-sm text-muted-foreground">Quality Grade</p>
                <p className="font-medium">Grade {rfq.qualityGrade}</p>
              </div>
            )}
            {rfq.priceRange && (
              <div>
                <p className="text-sm text-muted-foreground">Price Range</p>
                <p className="font-medium">
                  KES {rfq.priceRange.min} - {rfq.priceRange.max}/{rfq.priceUnit}
                </p>
              </div>
            )}
            {rfq.deliveryRegion && (
              <div>
                <p className="text-sm text-muted-foreground">Delivery Region</p>
                <p className="font-medium">{rfq.deliveryRegion}</p>
              </div>
            )}
            <div>
              <p className="text-sm text-muted-foreground">Delivery Deadline</p>
              <p className="font-medium">{formatDate(rfq.deadline)}</p>
            </div>
          </div>

          {rfq.additionalRequirements && (
            <div>
              <p className="text-sm text-muted-foreground mb-1">Additional Requirements</p>
              <p className="text-sm">{rfq.additionalRequirements}</p>
            </div>
          )}

          {rfq.termsAndConditions && (
            <div>
              <p className="text-sm text-muted-foreground mb-1">Terms and Conditions</p>
              <p className="text-sm">{rfq.termsAndConditions}</p>
            </div>
          )}

          {rfq.evaluationCriteria && (
            <div>
              <p className="text-sm text-muted-foreground mb-1">Evaluation Criteria</p>
              <p className="text-sm">{rfq.evaluationCriteria}</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Responses Section */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Responses ({responses.length})</CardTitle>
              <CardDescription>
                {rfq.rfqStatus === "published"
                  ? "Suppliers can submit quotes until the deadline"
                  : "Review and manage submitted quotes"}
              </CardDescription>
            </div>
            {rfq.rfqStatus === "published" && canSubmitResponse && !hideSubmitButton && (
              <Button onClick={() => setShowResponseForm(true)}>
                Submit Quote
              </Button>
            )}
            {responses.length > 1 && !isFarmerView && (
              <div className="flex gap-2">
                <Button
                  variant={viewMode === "list" ? "default" : "outline"}
                  size="sm"
                  onClick={() => setViewMode("list")}
                >
                  List View
                </Button>
                <Button
                  variant={viewMode === "compare" ? "default" : "outline"}
                  size="sm"
                  onClick={() => setViewMode("compare")}
                >
                  Compare
                </Button>
              </div>
            )}
          </div>
        </CardHeader>
        <CardContent>
          {showResponseForm ? (
            <RFQResponseForm
              rfq={rfq}
              onSubmit={handleSubmitResponse}
              onCancel={() => setShowResponseForm(false)}
            />
          ) : responses.length > 0 ? (
            viewMode === "compare" ? (
              <RFQComparisonView
                responses={responses}
                onSelectResponse={(id) => {
                  setSelectedResponseIds((prev) =>
                    prev.includes(id)
                      ? prev.filter((i) => i !== id)
                      : [...prev, id]
                  );
                }}
                selectedResponseIds={selectedResponseIds}
                onUpdateStatus={handleUpdateResponseStatus}
                onConvertToOrder={handleConvertToOrder}
                isFarmerView={isFarmerView}
              />
            ) : (
              <div className="space-y-4">
                {responses.map((response) => (
                  <RFQResponseCard
                    key={response.id}
                    response={response}
                    rfq={rfq}
                    onUpdateStatus={handleUpdateResponseStatus}
                    onConvertToOrder={handleConvertToOrder}
                    isFarmerView={isFarmerView}
                  />
                ))}
              </div>
            )
          ) : (
            <div className="text-center py-12">
              <IconFileText className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground">No responses yet</p>
              {rfq.rfqStatus === "published" && canSubmitResponse && (
                <Button onClick={() => setShowResponseForm(true)} className="mt-4">
                  Be the first to submit a quote
                </Button>
              )}
            </div>
          )}

          {/* Award Actions */}
          {rfq.rfqStatus === "evaluating" && selectedResponseIds.length > 0 && (
            <div className="mt-6 p-4 bg-primary/5 border border-primary/20 rounded-lg">
              <div className="flex items-center justify-between">
                <p className="text-sm">
                  {selectedResponseIds.length} response{selectedResponseIds.length !== 1 ? "s" : ""} selected
                </p>
                <Button onClick={handleAwardRFQ}>
                  Award RFQ
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
