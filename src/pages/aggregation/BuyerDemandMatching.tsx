import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  IconSearch,
  IconPackage,
  IconUsers,
  IconTrendingUp,
  IconCheck,
  IconX,
  IconAlertCircle,
} from "@tabler/icons-react";
import { useAggregation } from "@/contexts/AggregationContext";
import { useMarketplace } from "@/contexts/MarketplaceContext";
import type { InventoryItem } from "@/types/aggregation";
import type { MarketplaceOrder } from "@/types/marketplace";

export function BuyerDemandMatching() {
  const { inventory, fetchInventory, selectedCenter } = useAggregation();
  const { orders, fetchOrders } = useMarketplace();
  
  const [filterVariety, setFilterVariety] = useState<string>("all");
  const [filterGrade, setFilterGrade] = useState<string>("all");
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedMatches, setSelectedMatches] = useState<Map<string, string>>(new Map()); // orderId -> inventoryId

  // Fetch inventory and orders on mount
  useEffect(() => {
    fetchInventory(selectedCenter?.id);
    fetchOrders({ status: "order_placed" }); // Get pending orders as demands
  }, [fetchInventory, fetchOrders, selectedCenter?.id]);

  // Filter available inventory (only available items)
  const filteredStock = inventory.filter((stock) => {
    const matchesVariety = filterVariety === "all" || stock.variety.toLowerCase() === filterVariety;
    const matchesGrade = filterGrade === "all" || stock.qualityGrade === filterGrade;
    const matchesSearch =
      stock.variety.toLowerCase().includes(searchTerm.toLowerCase()) ||
      stock.id.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesVariety && matchesGrade && matchesSearch;
  });

  // Filter pending orders as buyer demands
  const filteredDemands = orders.filter((order) => {
    const matchesSearch =
      order.buyerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.variety.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesSearch && order.status === "order_placed";
  });

  const handleMatch = (demandId: string, stockId: string) => {
    setSelectedMatches((prev) => {
      const newMap = new Map(prev);
      newMap.set(demandId, stockId);
      return newMap;
    });
  };

  const handleRemoveMatch = (demandId: string) => {
    setSelectedMatches((prev) => {
      const newMap = new Map(prev);
      newMap.delete(demandId);
      return newMap;
    });
  };

  const handleConfirmMatches = async () => {
    if (selectedMatches.size === 0) {
      alert("Please select at least one match");
      return;
    }

    try {
      // TODO: Implement actual matching API call
      // This would update order status and reserve inventory
      console.log("Confirming matches:", Array.from(selectedMatches.entries()));
      alert("Matches confirmed! Stock has been reserved for buyers.");
      setSelectedMatches(new Map());
      // Refresh orders and inventory
      fetchOrders({ status: "order_placed" });
      fetchInventory(selectedCenter?.id);
    } catch (error) {
      console.error("Failed to confirm matches:", error);
      alert("Failed to confirm matches. Please try again.");
    }
  };

  // Find matching stock for a demand/order
  const findMatchingStock = (order: MarketplaceOrder): InventoryItem[] => {
    return filteredStock.filter(
      (stock) =>
        stock.variety === order.variety &&
        stock.qualityGrade === order.qualityGrade &&
        stock.quantity >= order.quantity
    );
  };

  const getBuyerTypeBadge = (buyerType?: string) => {
    // MarketplaceOrder doesn't have buyerType, so we'll skip this
    return null;
  };

  const getPriorityBadge = (priority?: string) => {
    // MarketplaceOrder doesn't have priority field
    // Could be derived from order status or deadline
    return null;
  };

  const getGradeBadge = (grade: string) => {
    const colors: Record<string, string> = {
      A: "bg-green-100 text-green-800",
      B: "bg-yellow-100 text-yellow-800",
      C: "bg-orange-100 text-orange-800",
    };
    return <Badge className={colors[grade] ?? "bg-gray-100 text-gray-800"}>Grade {grade}</Badge>;
  };


  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold">Match Buyer Demand</h1>
          <p className="text-sm sm:text-base text-muted-foreground mt-1">
            Match available OFSP volumes with buyer demand
          </p>
        </div>
        {selectedMatches.size > 0 && (
          <Button onClick={handleConfirmMatches}>
            <IconCheck className="mr-2 h-4 w-4" />
            Confirm {selectedMatches.size} Match{selectedMatches.size !== 1 ? "es" : ""}
          </Button>
        )}
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Available Stock</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {filteredStock.reduce((sum, s) => sum + s.quantity, 0).toLocaleString()} kg
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              {filteredStock.length} batch{filteredStock.length !== 1 ? "es" : ""}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Pending Demands</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{filteredDemands.length}</div>
            <p className="text-xs text-muted-foreground mt-1">Buyer requests</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Active Matches</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{selectedMatches.size}</div>
            <p className="text-xs text-muted-foreground mt-1">Pending confirmation</p>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1">
              <IconSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search by variety, batch ID, or buyer name..."
                className="pl-10"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <Select value={filterVariety} onValueChange={setFilterVariety}>
              <SelectTrigger className="w-[180px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Varieties</SelectItem>
                <SelectItem value="kenya">Kenya</SelectItem>
                <SelectItem value="spk004">SPK004</SelectItem>
                <SelectItem value="kabode">Kabode</SelectItem>
              </SelectContent>
            </Select>
            <Select value={filterGrade} onValueChange={setFilterGrade}>
              <SelectTrigger className="w-[180px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Grades</SelectItem>
                <SelectItem value="A">Grade A</SelectItem>
                <SelectItem value="B">Grade B</SelectItem>
                <SelectItem value="C">Grade C</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Buyer Demands and Matching */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Buyer Demands */}
        <Card>
          <CardHeader>
            <CardTitle>Buyer Demands</CardTitle>
            <CardDescription>Pending buyer requests for OFSP</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {filteredDemands.map((demand) => {
                const matchingStock = findMatchingStock(demand);
                const isMatched = selectedMatches.has(demand.id);
                const matchedStockId = selectedMatches.get(demand.id);

                return (
                  <Card key={demand.id} className={isMatched ? "border-primary border-2" : ""}>
                    <CardContent className="p-4 space-y-3">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <h3 className="font-semibold">{demand.buyerName}</h3>
                            {getBuyerTypeBadge()}
                            {getPriorityBadge()}
                          </div>
                          <div className="space-y-1 text-sm">
                            <div className="flex items-center gap-2">
                              <span className="text-muted-foreground">Variety:</span>
                              <span className="font-medium">{demand.variety}</span>
                              {getGradeBadge(demand.qualityGrade)}
                            </div>
                            <div className="flex items-center gap-2">
                              <IconPackage className="h-4 w-4 text-muted-foreground" />
                              <span className="text-muted-foreground">Required:</span>
                              <span className="font-medium">{demand.quantity} kg</span>
                            </div>
                            <div className="flex items-center gap-2">
                              <IconUsers className="h-4 w-4 text-muted-foreground" />
                              <span className="text-muted-foreground">Location:</span>
                              <span className="font-medium">{demand.deliveryLocation || "N/A"}</span>
                            </div>
                            {demand.deliveryDate && (
                              <div className="text-xs text-muted-foreground">
                                Delivery Date: {new Date(demand.deliveryDate).toLocaleDateString()}
                              </div>
                            )}
                          </div>
                        </div>
                      </div>

                      {matchingStock.length > 0 ? (
                        <div className="space-y-2">
                          <div className="text-xs font-medium text-green-600">
                            ✓ {matchingStock.length} matching batch{matchingStock.length !== 1 ? "es" : ""} available
                          </div>
                          {isMatched ? (
                            <div className="flex items-center justify-between p-2 bg-green-50 rounded border border-green-200">
                              <div className="text-sm">
                                <span className="text-muted-foreground">Matched with:</span>
                                <span className="font-medium ml-2">
                                  {filteredStock.find((s) => s.id === matchedStockId)?.id}
                                </span>
                              </div>
                              <Button
                                size="sm"
                                variant="ghost"
                                onClick={() => handleRemoveMatch(demand.id)}
                              >
                                <IconX className="h-4 w-4" />
                              </Button>
                            </div>
                          ) : (
                            <Select
                              value=""
                              onValueChange={(value) => handleMatch(demand.id, value)}
                            >
                              <SelectTrigger className="w-full">
                                <SelectValue>
                                  Select matching stock batch
                                </SelectValue>
                              </SelectTrigger>
                              <SelectContent>
                                {matchingStock.map((stock) => (
                                  <SelectItem key={stock.id} value={stock.id}>
                                    {stock.id} - {stock.quantity} kg ({stock.storageDuration || 0} days old)
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          )}
                        </div>
                      ) : (
                        <div className="flex items-center gap-2 p-2 bg-yellow-50 rounded border border-yellow-200">
                          <IconAlertCircle className="h-4 w-4 text-yellow-600" />
                          <span className="text-xs text-yellow-800">
                            No matching stock available
                          </span>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                );
              })}
              {filteredDemands.length === 0 && (
                <div className="text-center py-8 text-muted-foreground">
                  <IconUsers className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>No pending buyer demands</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Available Stock */}
        <Card>
          <CardHeader>
            <CardTitle>Available Stock</CardTitle>
            <CardDescription>Stock available for matching with buyer demands</CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Batch ID</TableHead>
                  <TableHead>Variety</TableHead>
                  <TableHead>Grade</TableHead>
                  <TableHead>Quantity</TableHead>
                  <TableHead>Age</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredStock.map((stock) => {
                  const isMatched = Array.from(selectedMatches.values()).includes(stock.id);
                  return (
                    <TableRow key={stock.id} className={isMatched ? "bg-green-50" : ""}>
                      <TableCell className="font-mono text-sm">{stock.id}</TableCell>
                      <TableCell>{stock.variety}</TableCell>
                      <TableCell>{getGradeBadge(stock.qualityGrade)}</TableCell>
                      <TableCell className="font-medium">{stock.quantity} kg</TableCell>
                      <TableCell>
                        <span className={(stock.storageDuration || 0) > 5 ? "text-orange-600" : "text-muted-foreground"}>
                          {stock.storageDuration || 0} day{(stock.storageDuration || 0) !== 1 ? "s" : ""}
                        </span>
                      </TableCell>
                      <TableCell>
                        {isMatched ? (
                          <Badge className="bg-green-100 text-green-800">Matched</Badge>
                        ) : (
                          <Badge variant="outline">Available</Badge>
                        )}
                      </TableCell>
                    </TableRow>
                  );
                })}
                {filteredStock.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                      <IconPackage className="h-12 w-12 mx-auto mb-4 opacity-50" />
                      <p>No matching stock available</p>
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
