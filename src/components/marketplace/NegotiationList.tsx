import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  IconSearch,
  IconMessageCircle,
  IconClock,
  IconCheck,
  IconX,
  IconLoader2,
  IconShoppingCart,
} from "@tabler/icons-react";
import { useAuth } from "@/contexts/AuthContext";
import { useMarketplace } from "@/contexts/MarketplaceContext";
import { NegotiationDialog } from "./NegotiationDialog";
import { cn } from "@/lib/utils";
import type { Negotiation, NegotiationStatus } from "@/types/marketplace";

export function NegotiationList() {
  const navigate = useNavigate();
  const { user, role } = useAuth();
  const {
    negotiations,
    fetchNegotiations,
    negotiationFilters,
    setNegotiationFilters,
    isLoading,
  } = useMarketplace();

  const [selectedNegotiation, setSelectedNegotiation] = useState<Negotiation | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [statusFilter, setStatusFilter] = useState<NegotiationStatus | "all">("all");
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    const filters = {
      ...negotiationFilters,
      status: statusFilter === "all" ? undefined : statusFilter,
    };
    fetchNegotiations(filters);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [statusFilter]);

  const handleViewNegotiation = (negotiation: Negotiation) => {
    setSelectedNegotiation(negotiation);
    setDialogOpen(true);
  };

  const getStatusBadge = (status: NegotiationStatus) => {
    const variants: Record<NegotiationStatus, { className: string; label: string }> = {
      pending: { className: "bg-yellow-50 text-yellow-700 border-yellow-200", label: "Pending" },
      counter_offer: { className: "bg-blue-50 text-blue-700 border-blue-200", label: "Counter Offer" },
      accepted: { className: "bg-green-50 text-green-700 border-green-200", label: "Accepted" },
      rejected: { className: "bg-red-50 text-red-700 border-red-200", label: "Rejected" },
      expired: { className: "bg-gray-50 text-gray-700 border-gray-200", label: "Expired" },
      converted: { className: "bg-purple-50 text-purple-700 border-purple-200", label: "Converted" },
    };

    const variant = variants[status];
    return (
      <Badge variant="outline" className={cn("text-xs", variant.className)}>
        {variant.label}
      </Badge>
    );
  };

  const filteredNegotiations = negotiations.filter((neg) => {
    const matchesSearch = searchQuery === "" || 
      neg.negotiationNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (role === "buyer" ? neg.farmerName : neg.buyerName).toLowerCase().includes(searchQuery.toLowerCase());
    return matchesSearch;
  });

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold">Negotiations</h1>
          <p className="text-sm sm:text-base text-muted-foreground mt-1">
            Manage your negotiations with {role === "buyer" ? "farmers" : "buyers"}
          </p>
        </div>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1">
              <IconSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search negotiations..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={statusFilter} onValueChange={(value) => setStatusFilter(value as NegotiationStatus | "all")}>
              <SelectTrigger className="w-full sm:w-[180px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="counter_offer">Counter Offer</SelectItem>
                <SelectItem value="accepted">Accepted</SelectItem>
                <SelectItem value="rejected">Rejected</SelectItem>
                <SelectItem value="expired">Expired</SelectItem>
                <SelectItem value="converted">Converted</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Negotiations List */}
      {isLoading ? (
        <div className="flex items-center justify-center py-12">
          <IconLoader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      ) : filteredNegotiations.length > 0 ? (
        <div className="grid gap-4">
          {filteredNegotiations.map((negotiation) => {
            const counterpartName = role === "buyer" ? negotiation.farmerName : negotiation.buyerName;
            const currentPrice = negotiation.negotiatedPricePerKg || negotiation.originalPricePerKg;
            const currentQuantity = negotiation.negotiatedQuantity || negotiation.originalQuantity;
            const lastMessage = negotiation.messages[negotiation.messages.length - 1];

            return (
              <Card key={negotiation.id} className="hover:shadow-md transition-shadow">
                <CardContent className="p-6">
                  <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                    <div className="flex-1 space-y-2">
                      <div className="flex items-center gap-2 flex-wrap">
                        <h3 className="font-semibold">Negotiation #{negotiation.negotiationNumber}</h3>
                        {getStatusBadge(negotiation.status)}
                      </div>
                      <p className="text-sm text-muted-foreground">
                        With: <span className="font-medium">{counterpartName}</span>
                      </p>
                      {negotiation.listing && (
                        <p className="text-sm">
                          {negotiation.listing.variety} - Grade {negotiation.listing.qualityGrade}
                        </p>
                      )}
                      <div className="flex items-center gap-4 text-sm">
                        <span>
                          <span className="text-muted-foreground">Price: </span>
                          <span className="font-semibold">KES {currentPrice}/kg</span>
                        </span>
                        <span>
                          <span className="text-muted-foreground">Quantity: </span>
                          <span className="font-semibold">{currentQuantity} kg</span>
                        </span>
                        <span>
                          <span className="text-muted-foreground">Total: </span>
                          <span className="font-bold text-primary">
                            KES {(currentPrice * currentQuantity).toLocaleString()}
                          </span>
                        </span>
                      </div>
                      {lastMessage && (
                        <div className="flex items-center gap-2 text-xs text-muted-foreground">
                          <IconClock className="h-3 w-3" />
                          <span>Last message: {formatDate(lastMessage.createdAt)}</span>
                        </div>
                      )}
                    </div>
                    <div className="flex flex-col sm:flex-row gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleViewNegotiation(negotiation)}
                      >
                        <IconMessageCircle className="mr-2 h-4 w-4" />
                        View
                      </Button>
                      {negotiation.status === "accepted" && (
                        <Button
                          size="sm"
                          onClick={() => {
                            handleViewNegotiation(negotiation);
                            // Will show convert to order button in dialog
                          }}
                        >
                          <IconShoppingCart className="mr-2 h-4 w-4" />
                          Convert to Order
                        </Button>
                      )}
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
            <IconMessageCircle className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <p className="text-lg font-medium text-muted-foreground">No negotiations found</p>
            <p className="text-sm text-muted-foreground mt-1">
              {searchQuery || statusFilter !== "all"
                ? "Try adjusting your filters"
                : "Start a negotiation from a listing to begin"}
            </p>
          </CardContent>
        </Card>
      )}

      {/* Negotiation Dialog */}
      {selectedNegotiation && (
        <NegotiationDialog
          open={dialogOpen}
          onOpenChange={setDialogOpen}
          negotiationId={selectedNegotiation.id}
          onConvertToOrder={(orderId) => {
            setDialogOpen(false);
            navigate(`/orders/${orderId}`);
          }}
        />
      )}
    </div>
  );
}
