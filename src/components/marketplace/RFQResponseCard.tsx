import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import {
  IconStar,
  IconCheck,
  IconX,
  IconShoppingCart,
  IconClock,
  IconMapPin,
} from "@tabler/icons-react";
import { cn } from "@/lib/utils";
import type { RFQ, RFQResponse, RFQResponseStatus } from "@/types/marketplace";

interface RFQResponseCardProps {
  response: RFQResponse;
  rfq: RFQ;
  onUpdateStatus?: (responseId: string, status: RFQResponseStatus) => Promise<void>;
  onConvertToOrder?: (responseId: string) => Promise<void>;
  isFarmerView?: boolean;
}

export function RFQResponseCard({
  response,
  rfq,
  onUpdateStatus,
  onConvertToOrder,
  isFarmerView = false,
}: RFQResponseCardProps) {
  const getStatusBadge = (status: RFQResponseStatus) => {
    const variants: Record<RFQResponseStatus, { className: string; label: string }> = {
      draft: { className: "bg-gray-50 text-gray-700 border-gray-200", label: "Draft" },
      submitted: { className: "bg-blue-50 text-blue-700 border-blue-200", label: "Submitted" },
      under_review: { className: "bg-yellow-50 text-yellow-700 border-yellow-200", label: "Under Review" },
      shortlisted: { className: "bg-purple-50 text-purple-700 border-purple-200", label: "Shortlisted" },
      awarded: { className: "bg-green-50 text-green-700 border-green-200", label: "Awarded" },
      rejected: { className: "bg-red-50 text-red-700 border-red-200", label: "Rejected" },
      withdrawn: { className: "bg-gray-50 text-gray-700 border-gray-200", label: "Withdrawn" },
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

  const canManage = rfq.rfqStatus === "published" || rfq.rfqStatus === "evaluating";

  return (
    <Card className={cn(
      "hover:shadow-md transition-shadow",
      response.status === "awarded" && "border-green-200 bg-green-50/30",
      response.status === "shortlisted" && "border-purple-200 bg-purple-50/30"
    )}>
      <CardContent className="p-6">
        <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
          <div className="flex-1 space-y-3">
            {/* Supplier Info */}
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                <span className="text-sm font-bold text-primary">
                  {isFarmerView 
                    ? "MY"
                    : response.supplierName
                    ? response.supplierName
                        .split(" ")
                        .map((n) => n[0])
                        .join("")
                        .toUpperCase()
                        .slice(0, 2)
                    : "SU"}
                </span>
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <p className="font-semibold">
                    {isFarmerView ? "My Response" : (response.supplierName || "Unknown Supplier")}
                  </p>
                  {!isFarmerView && response.supplierRating && (
                    <div className="flex items-center gap-1">
                      <IconStar className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                      <span className="text-xs">{response.supplierRating}</span>
                    </div>
                  )}
                </div>
                <p className="text-xs text-muted-foreground">
                  Submitted {response.submittedAt ? formatDate(response.submittedAt) : formatDate(response.createdAt)}
                </p>
              </div>
              {getStatusBadge(response.status)}
            </div>

            {/* Quote Details */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pt-2 border-t">
              <div>
                <p className="text-xs text-muted-foreground mb-1">Quantity</p>
                <p className="font-semibold">
                  {response.quantity ?? 0} {response.quantityUnit || "kg"}
                </p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground mb-1">Price per {response.priceUnit || "kg"}</p>
                <p className="font-semibold">
                  KES {(() => {
                    const price = typeof response.pricePerUnit === 'number' 
                      ? response.pricePerUnit 
                      : parseFloat(String(response.pricePerUnit || 0));
                    return isNaN(price) ? "0" : price.toLocaleString();
                  })()}
                </p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground mb-1">Total Amount</p>
                <p className="font-bold text-primary">
                  KES {(() => {
                    const amount = typeof response.totalAmount === 'number' 
                      ? response.totalAmount 
                      : parseFloat(String(response.totalAmount || 0));
                    return isNaN(amount) ? "0" : amount.toLocaleString();
                  })()}
                </p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground mb-1">Quality Grade</p>
                <Badge variant="outline" className="text-xs">
                  Grade {response.qualityGrade || "N/A"}
                </Badge>
              </div>
            </div>

            {/* Additional Info */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
              {response.variety && (
                <div className="flex items-center gap-2">
                  <span className="text-muted-foreground">Variety:</span>
                  <span className="font-medium">{response.variety}</span>
                </div>
              )}
              {response.deliveryTime && (
                <div className="flex items-center gap-2">
                  <IconClock className="h-4 w-4 text-muted-foreground" />
                  <span className="text-muted-foreground">Delivery:</span>
                  <span className="font-medium">{response.deliveryTime}</span>
                </div>
              )}
              {response.paymentTerms && (
                <div className="flex items-center gap-2">
                  <span className="text-muted-foreground">Payment:</span>
                  <span className="font-medium">{response.paymentTerms}</span>
                </div>
              )}
              {response.batchId && (
                <div className="flex items-center gap-2">
                  <span className="text-muted-foreground">Batch ID:</span>
                  <span className="font-mono text-xs">{response.batchId}</span>
                </div>
              )}
            </div>

            {response.notes && (
              <div className="pt-2 border-t">
                <p className="text-xs text-muted-foreground mb-1">Notes</p>
                <p className="text-sm">{response.notes}</p>
              </div>
            )}
          </div>

          {/* Actions */}
          {canManage && !isFarmerView && (
            <div className="flex flex-col gap-2">
              {response.status === "submitted" || response.status === "under_review" ? (
                <>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => onUpdateStatus?.(response.id, "shortlisted")}
                  >
                    Shortlist
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => onUpdateStatus?.(response.id, "rejected")}
                    className="text-red-600 hover:text-red-700"
                  >
                    <IconX className="mr-2 h-4 w-4" />
                    Reject
                  </Button>
                </>
              ) : response.status === "shortlisted" ? (
                <>
                  <Button
                    size="sm"
                    onClick={() => onUpdateStatus?.(response.id, "awarded")}
                  >
                    <IconCheck className="mr-2 h-4 w-4" />
                    Award
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => onUpdateStatus?.(response.id, "rejected")}
                    className="text-red-600 hover:text-red-700"
                  >
                    Reject
                  </Button>
                </>
              ) : response.status === "awarded" ? (
                <Button
                  size="sm"
                  onClick={() => onConvertToOrder?.(response.id)}
                >
                  <IconShoppingCart className="mr-2 h-4 w-4" />
                  Convert to Order
                </Button>
              ) : null}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
