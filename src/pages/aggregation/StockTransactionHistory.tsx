import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  IconTrendingUp,
  IconTrendingDown,
  IconClipboardCheck,
  IconTrash,
  IconSearch,
  IconDownload,
  IconFilter,
  IconEye,
} from "@tabler/icons-react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { useAggregation } from "@/contexts/AggregationContext";
import type { StockTransaction } from "@/types/aggregation";

interface Transaction {
  id: string;
  type: "stock_in" | "quality_check" | "stock_out" | "wastage";
  date: string;
  farmerId: string;
  farmerName: string;
  buyerId?: string;
  buyerName?: string;
  variety: string;
  qualityGrade: "A" | "B" | "C";
  quantity: number; // kg
  pricePerKg?: number;
  totalAmount?: number;
  notes?: string;
  status: "completed" | "pending" | "rejected";
  recordedBy: string;
}

export function StockTransactionHistory() {
  const { transactions, fetchTransactions, isLoading, stockFilters, setStockFilters, selectedCenter } = useAggregation();
  
  const [filteredTransactions, setFilteredTransactions] = useState<StockTransaction[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [typeFilter, setTypeFilter] = useState<string>("all");
  const [farmerFilter, setFarmerFilter] = useState<string>("all");
  const [dateFilter, setDateFilter] = useState<string>("all");
  const [selectedTransaction, setSelectedTransaction] = useState<StockTransaction | null>(null);
  const [isDetailDialogOpen, setIsDetailDialogOpen] = useState(false);

  // Fetch transactions on mount and when filters change
  useEffect(() => {
    const filters: any = {
      centerId: selectedCenter?.id,
      type: typeFilter !== "all" ? typeFilter : undefined,
      farmerId: farmerFilter !== "all" ? farmerFilter : undefined,
    };

    // Add date range filter
    if (dateFilter !== "all") {
      const now = new Date();
      const filterDate = new Date();
      switch (dateFilter) {
        case "today":
          filterDate.setHours(0, 0, 0, 0);
          filters.dateRange = {
            start: filterDate.toISOString(),
            end: now.toISOString(),
          };
          break;
        case "week":
          filterDate.setDate(now.getDate() - 7);
          filters.dateRange = {
            start: filterDate.toISOString(),
            end: now.toISOString(),
          };
          break;
        case "month":
          filterDate.setMonth(now.getMonth() - 1);
          filters.dateRange = {
            start: filterDate.toISOString(),
            end: now.toISOString(),
          };
          break;
      }
    }

    setStockFilters(filters);
    fetchTransactions(filters);
  }, [typeFilter, farmerFilter, dateFilter, selectedCenter?.id, fetchTransactions, setStockFilters]);

  // Apply client-side search filter
  useEffect(() => {
    let filtered = [...transactions];

    if (searchTerm) {
      filtered = filtered.filter(
        (txn) =>
          txn.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
          (txn.farmerName && txn.farmerName.toLowerCase().includes(searchTerm.toLowerCase())) ||
          (txn.farmerId && txn.farmerId.toLowerCase().includes(searchTerm.toLowerCase())) ||
          (txn.buyerName && txn.buyerName.toLowerCase().includes(searchTerm.toLowerCase())) ||
          txn.variety.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Sort by date descending (most recent first)
    filtered.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

    setFilteredTransactions(filtered);
  }, [transactions, searchTerm]);

  const getTypeIcon = (type: string) => {
    switch (type) {
      case "stock_in":
        return <IconTrendingUp className="h-4 w-4 text-green-600" />;
      case "stock_out":
        return <IconTrendingDown className="h-4 w-4 text-orange-600" />;
      case "quality_check":
        return <IconClipboardCheck className="h-4 w-4 text-blue-600" />;
      case "wastage":
        return <IconTrash className="h-4 w-4 text-red-600" />;
      default:
        return null;
    }
  };

  const getTypeLabel = (type: string) => {
    switch (type) {
      case "stock_in":
        return "Stock In";
      case "stock_out":
        return "Stock Out";
      case "quality_check":
        return "Quality Check";
      case "wastage":
        return "Wastage";
      default:
        return type;
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case "stock_in":
        return "bg-green-100 text-green-800";
      case "stock_out":
        return "bg-orange-100 text-orange-800";
      case "quality_check":
        return "bg-blue-100 text-blue-800";
      case "wastage":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const uniqueFarmers = Array.from(new Set(transactions.map((t) => t.farmerId).filter(Boolean))).map((id) => {
    const txn = transactions.find((t) => t.farmerId === id);
    return { id: id as string, name: txn?.farmerName || id };
  });

  const totalStockIn = transactions
    .filter((t) => t.type === "stock_in")
    .reduce((sum, t) => sum + t.quantity, 0);
  const totalStockOut = transactions
    .filter((t) => t.type === "stock_out")
    .reduce((sum, t) => sum + t.quantity, 0);
  const totalWastage = transactions
    .filter((t) => t.type === "wastage")
    .reduce((sum, t) => sum + t.quantity, 0);

  const handleViewDetails = (transaction: StockTransaction) => {
    setSelectedTransaction(transaction);
    setIsDetailDialogOpen(true);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold">Stock Transaction History</h1>
          <p className="text-sm sm:text-base text-muted-foreground mt-1">
            Complete end-to-end traceability of all produce with farmer tracking
          </p>
        </div>
        <Button>
          <IconDownload className="mr-2 h-4 w-4" />
          Export History
        </Button>
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Total Transactions</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{transactions.length}</div>
            <p className="text-xs text-muted-foreground mt-1">All time</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Total Stock In</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{totalStockIn} kg</div>
            <p className="text-xs text-muted-foreground mt-1">From farmers</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Total Stock Out</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-600">{totalStockOut} kg</div>
            <p className="text-xs text-muted-foreground mt-1">To buyers</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Total Wastage</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">{totalWastage} kg</div>
            <p className="text-xs text-muted-foreground mt-1">Post-harvest loss</p>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="relative flex-1">
              <IconSearch className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Search by transaction ID, farmer, buyer, or variety..."
                className="pl-10"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <Select value={typeFilter} onValueChange={(value) => setTypeFilter(value || "all")}>
              <SelectTrigger className="w-full md:w-[180px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Types</SelectItem>
                <SelectItem value="stock_in">Stock In</SelectItem>
                <SelectItem value="stock_out">Stock Out</SelectItem>
                <SelectItem value="quality_check">Quality Check</SelectItem>
                <SelectItem value="wastage">Wastage</SelectItem>
              </SelectContent>
            </Select>
            <Select value={farmerFilter} onValueChange={(value) => setFarmerFilter(value || "all")}>
              <SelectTrigger className="w-full md:w-[180px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Farmers</SelectItem>
                {uniqueFarmers.map((farmer) => (
                  <SelectItem key={farmer.id} value={farmer.id}>
                    {farmer.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={dateFilter} onValueChange={(value) => setDateFilter(value || "all")}>
              <SelectTrigger className="w-full md:w-[150px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Time</SelectItem>
                <SelectItem value="today">Today</SelectItem>
                <SelectItem value="week">Last 7 Days</SelectItem>
                <SelectItem value="month">Last 30 Days</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Transactions Table */}
      <Card>
        <CardHeader>
          <CardTitle>Transaction Records</CardTitle>
          <CardDescription>{filteredTransactions.length} transaction(s) found</CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="space-y-4">
              {[1, 2, 3].map((i) => (
                <div key={i} className="h-16 bg-muted animate-pulse rounded-lg" />
              ))}
            </div>
          ) : filteredTransactions.length > 0 ? (
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>ID</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Farmer (Origin)</TableHead>
                    <TableHead>Buyer (Destination)</TableHead>
                    <TableHead>Variety</TableHead>
                    <TableHead>Grade</TableHead>
                    <TableHead>Quantity</TableHead>
                    <TableHead>Amount</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredTransactions.map((txn) => (
                    <TableRow key={txn.id}>
                      <TableCell className="font-medium">{txn.id}</TableCell>
                      <TableCell className="text-sm">
                        {new Date(txn.createdAt).toLocaleDateString()}
                        <br />
                        <span className="text-xs text-muted-foreground">
                          {new Date(txn.createdAt).toLocaleTimeString()}
                        </span>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline" className={getTypeColor(txn.type)}>
                          <span className="flex items-center gap-1">
                            {getTypeIcon(txn.type)}
                            {getTypeLabel(txn.type)}
                          </span>
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="text-sm">
                          <p className="font-medium">{txn.farmerName}</p>
                          <p className="text-xs text-muted-foreground">{txn.farmerId}</p>
                        </div>
                      </TableCell>
                      <TableCell>
                        {txn.buyerName ? (
                          <div className="text-sm">
                            <p className="font-medium">{txn.buyerName}</p>
                            <p className="text-xs text-muted-foreground">{txn.buyerId}</p>
                          </div>
                        ) : (
                          <span className="text-sm text-muted-foreground">-</span>
                        )}
                      </TableCell>
                      <TableCell>{txn.variety}</TableCell>
                      <TableCell>
                        <Badge variant="outline">Grade {txn.qualityGrade}</Badge>
                      </TableCell>
                      <TableCell className="font-semibold">{txn.quantity} kg</TableCell>
                      <TableCell>
                        {txn.totalAmount ? (
                          <span className="font-medium">
                            KES {txn.totalAmount.toLocaleString()}
                          </span>
                        ) : (
                          <span className="text-sm text-muted-foreground">-</span>
                        )}
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline" className="bg-green-100 text-green-800">
                          Completed
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleViewDetails(txn)}
                        >
                          <IconEye className="h-4 w-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          ) : (
            <div className="text-center py-12">
              <IconFilter className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-lg font-medium text-muted-foreground">No transactions found</p>
              <p className="text-sm text-muted-foreground mt-1">Try adjusting your filters</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Transaction Details Dialog */}
      {selectedTransaction && (
        <Dialog open={isDetailDialogOpen} onOpenChange={setIsDetailDialogOpen}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Transaction Details</DialogTitle>
              <DialogDescription>{selectedTransaction.id}</DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm font-medium">Date & Time</p>
                  <p className="text-sm text-muted-foreground">
                    {new Date(selectedTransaction.createdAt).toLocaleString()}
                  </p>
                </div>
                <div>
                  <p className="text-sm font-medium">Type</p>
                  <Badge variant="outline" className={getTypeColor(selectedTransaction.type)}>
                    {getTypeLabel(selectedTransaction.type)}
                  </Badge>
                </div>
              </div>
              <div className="border-t pt-4">
                <p className="text-sm font-medium mb-2">Farmer (Origin)</p>
                <div className="p-3 bg-primary/10 rounded-lg">
                  <p className="font-medium">{selectedTransaction.farmerName}</p>
                  <p className="text-sm text-muted-foreground">
                    Farmer ID: {selectedTransaction.farmerId}
                  </p>
                </div>
              </div>
              {selectedTransaction.buyerName && (
                <div className="border-t pt-4">
                  <p className="text-sm font-medium mb-2">Buyer (Destination)</p>
                  <div className="p-3 bg-blue-50 rounded-lg">
                    <p className="font-medium">{selectedTransaction.buyerName}</p>
                    <p className="text-sm text-muted-foreground">
                      Buyer ID: {selectedTransaction.buyerId}
                    </p>
                  </div>
                </div>
              )}
              <div className="border-t pt-4 space-y-2">
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">Variety:</span>
                  <span className="text-sm font-medium">{selectedTransaction.variety}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">Quality Grade:</span>
                  <Badge variant="outline">Grade {selectedTransaction.qualityGrade}</Badge>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">Quantity:</span>
                  <span className="text-sm font-medium">{selectedTransaction.quantity} kg</span>
                </div>
                {selectedTransaction.pricePerKg && (
                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground">Price per kg:</span>
                    <span className="text-sm font-medium">
                      KES {selectedTransaction.pricePerKg}
                    </span>
                  </div>
                )}
                {selectedTransaction.totalAmount && (
                  <div className="flex justify-between border-t pt-2">
                    <span className="text-sm font-semibold">Total Amount:</span>
                    <span className="text-sm font-bold">
                      KES {selectedTransaction.totalAmount.toLocaleString()}
                    </span>
                  </div>
                )}
              </div>
              {selectedTransaction.notes && (
                <div className="border-t pt-4">
                  <p className="text-sm font-medium mb-1">Notes:</p>
                  <p className="text-sm text-muted-foreground">{selectedTransaction.notes}</p>
                </div>
              )}
              <div className="border-t pt-4">
                <p className="text-xs text-muted-foreground">
                  Recorded by: {selectedTransaction.createdBy}
                </p>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}
