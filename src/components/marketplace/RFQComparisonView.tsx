import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import {
  IconStar,
  IconCheck,
  IconShoppingCart,
  IconArrowsUpDown,
} from "@tabler/icons-react";
import { cn } from "@/lib/utils";
import type { RFQResponse, RFQResponseStatus } from "@/types/marketplace";

interface RFQComparisonViewProps {
  responses: RFQResponse[];
  selectedResponseIds: string[];
  onSelectResponse: (id: string) => void;
  onUpdateStatus?: (responseId: string, status: RFQResponseStatus) => Promise<void>;
  onConvertToOrder?: (responseId: string) => Promise<void>;
  isFarmerView?: boolean;
}

type SortField = "price" | "quantity" | "total" | "rating" | "delivery";
type SortDirection = "asc" | "desc";

export function RFQComparisonView({
  responses,
  selectedResponseIds,
  onSelectResponse,
  onUpdateStatus,
  onConvertToOrder,
  isFarmerView,
}: RFQComparisonViewProps) {
  const [sortField, setSortField] = useState<SortField>("price");
  const [sortDirection, setSortDirection] = useState<SortDirection>("asc");

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc");
    } else {
      setSortField(field);
      setSortDirection("asc");
    }
  };

  const sortedResponses = [...responses].sort((a, b) => {
    let comparison = 0;
    switch (sortField) {
      case "price":
        comparison = a.pricePerUnit - b.pricePerUnit;
        break;
      case "quantity":
        comparison = a.quantity - b.quantity;
        break;
      case "total":
        comparison = a.totalAmount - b.totalAmount;
        break;
      case "rating":
        comparison = (a.supplierRating || 0) - (b.supplierRating || 0);
        break;
      case "delivery":
        // Simple comparison - can be enhanced
        comparison = (a.deliveryTime || "").localeCompare(b.deliveryTime || "");
        break;
    }
    return sortDirection === "asc" ? comparison : -comparison;
  });

  const SortButton = ({ field, children }: { field: SortField; children: React.ReactNode }) => (
    <Button
      variant="ghost"
      size="sm"
      onClick={() => handleSort(field)}
      className="h-auto p-0 font-normal"
    >
      {children}
      <IconArrowsUpDown className={cn(
        "ml-1 h-3 w-3",
        sortField === field && "text-primary"
      )} />
    </Button>
  );

  return (
    <Card>
      <CardHeader>
        <CardTitle>Compare Quotes</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-12">
                  <input
                    type="checkbox"
                    checked={selectedResponseIds.length === responses.length && responses.length > 0}
                    onChange={(e) => {
                      if (e.target.checked) {
                        responses.forEach((r) => {
                          if (!selectedResponseIds.includes(r.id)) {
                            onSelectResponse(r.id);
                          }
                        });
                      } else {
                        responses.forEach((r) => {
                          if (selectedResponseIds.includes(r.id)) {
                            onSelectResponse(r.id);
                          }
                        });
                      }
                    }}
                    className="h-4 w-4 rounded border-gray-300"
                  />
                </TableHead>
                <TableHead>
                  <SortButton field="rating">Supplier</SortButton>
                </TableHead>
                <TableHead>
                  <SortButton field="quantity">Quantity</SortButton>
                </TableHead>
                <TableHead>
                  <SortButton field="price">Price/Unit</SortButton>
                </TableHead>
                <TableHead>
                  <SortButton field="total">Total Amount</SortButton>
                </TableHead>
                <TableHead>Quality</TableHead>
                <TableHead>
                  <SortButton field="delivery">Delivery Time</SortButton>
                </TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {sortedResponses.map((response) => {
                const isSelected = selectedResponseIds.includes(response.id);
                return (
                  <TableRow
                    key={response.id}
                    className={cn(
                      isSelected && "bg-primary/5",
                      response.status === "awarded" && "bg-green-50",
                      response.status === "shortlisted" && "bg-purple-50"
                    )}
                  >
                    <TableCell>
                      <input
                        type="checkbox"
                        checked={isSelected}
                        onChange={() => onSelectResponse(response.id)}
                        className="h-4 w-4 rounded border-gray-300"
                      />
                    </TableCell>
                    <TableCell>
                      <div>
                        <p className="font-medium">{response.supplierName}</p>
                        {response.supplierRating && (
                          <div className="flex items-center gap-1 text-xs text-muted-foreground">
                            <IconStar className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                            <span>{response.supplierRating}</span>
                          </div>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      {response.quantity} {response.quantityUnit}
                    </TableCell>
                    <TableCell>
                      <span className="font-semibold">KES {response.pricePerUnit}</span>
                    </TableCell>
                    <TableCell>
                      <span className="font-bold text-primary">
                        KES {response.totalAmount.toLocaleString()}
                      </span>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline" className="text-xs">
                        Grade {response.qualityGrade}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      {response.deliveryTime || "N/A"}
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant="outline"
                        className={cn(
                          "text-xs",
                          response.status === "awarded" && "bg-green-50 text-green-700 border-green-200",
                          response.status === "shortlisted" && "bg-purple-50 text-purple-700 border-purple-200",
                          response.status === "submitted" && "bg-blue-50 text-blue-700 border-blue-200"
                        )}
                      >
                        {response.status.replace("_", " ")}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex gap-1">
                        {response.status === "awarded" && (
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => onConvertToOrder?.(response.id)}
                          >
                            <IconShoppingCart className="h-3 w-3" />
                          </Button>
                        )}
                        {(response.status === "submitted" || response.status === "under_review") && (
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => onUpdateStatus?.(response.id, "shortlisted")}
                          >
                            <IconCheck className="h-3 w-3" />
                          </Button>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </div>

        {selectedResponseIds.length > 0 && (
          <div className="mt-4 p-3 bg-primary/5 border border-primary/20 rounded-lg">
            <p className="text-sm mb-2">
              {selectedResponseIds.length} response{selectedResponseIds.length !== 1 ? "s" : ""} selected
            </p>
            <div className="flex gap-2">
              <Button
                size="sm"
                onClick={() => {
                  selectedResponseIds.forEach((id) => {
                    onUpdateStatus?.(id, "shortlisted");
                  });
                }}
              >
                Shortlist Selected
              </Button>
              <Button
                size="sm"
                variant="outline"
                onClick={() => {
                  selectedResponseIds.forEach((id) => {
                    onUpdateStatus?.(id, "awarded");
                  });
                }}
              >
                Award Selected
              </Button>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
