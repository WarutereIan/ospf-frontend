import { useEffect, useMemo, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
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
  IconDownload,
  IconEye,
  IconCreditCard,
  IconFileText,
} from "@tabler/icons-react";
import { EscrowStatus as EscrowStatusComponent, type EscrowStatus } from "@/components/payments/EscrowStatus";
import { usePayment } from "@/contexts/PaymentContext";
import { useAuth } from "@/contexts/AuthContext";
import type { PaymentHistoryItem } from "@/types/payment";

export function PaymentHistory() {
  const { user } = useAuth();
  const { 
    paymentHistory, 
    fetchPaymentHistory,
    setFilters,
    isLoading 
  } = usePayment();
  
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [selectedTransaction, setSelectedTransaction] = useState<PaymentHistoryItem | null>(null);
  const [detailsOpen, setDetailsOpen] = useState(false);

  // Fetch payment history on mount
  useEffect(() => {
    fetchPaymentHistory();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Update filters when search or status changes
  useEffect(() => {
    setFilters({
      status: statusFilter !== "all" ? statusFilter as any : undefined,
      searchQuery: searchTerm || undefined,
    });
  }, [statusFilter, searchTerm, setFilters]);

  // Filter transactions based on search and status
  const filteredTransactions = useMemo(() => {
    let filtered = [...paymentHistory];

    // Search filter
    if (searchTerm) {
      filtered = filtered.filter(
        (tx) =>
          tx.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
          tx.orderId?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          tx.farmerName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          tx.buyerName?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Status filter (already applied via context filters, but double-check)
    if (statusFilter !== "all") {
      filtered = filtered.filter((tx) => tx.status === statusFilter);
    }

    return filtered;
  }, [paymentHistory, searchTerm, statusFilter]);

  const getStatusColor = (status: EscrowStatus) => {
    switch (status) {
      case "pending":
        return "bg-yellow-100 text-yellow-800";
      case "processing":
        return "bg-blue-100 text-blue-800";
      case "in_escrow":
      case "quality_check":
      case "ready_for_release":
        return "bg-green-100 text-green-800";
      case "released":
      case "completed":
        return "bg-green-100 text-green-800";
      case "disputed":
        return "bg-red-100 text-red-800";
      case "refunded":
        return "bg-gray-100 text-gray-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getMethodLabel = (method: string) => {
    switch (method) {
      case "mpesa":
        return "M-PESA";
      case "airtel":
        return "Airtel Money";
      case "bank_transfer":
      case "bank":
        return "Bank Transfer";
      case "card":
        return "Card";
      case "escrow":
        return "Escrow";
      case "cash":
        return "Cash";
      default:
        return method;
    }
  };

  const handleExport = (format: "csv" | "pdf") => {
    // TODO: Implement export functionality
    console.log(`Exporting to ${format}...`);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold">Payment History</h1>
          <p className="text-sm sm:text-base text-muted-foreground mt-1">
            View all your payment transactions and receipts
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={() => handleExport("csv")}>
            <IconDownload className="mr-2 h-4 w-4" />
            Export CSV
          </Button>
          <Button variant="outline" size="sm" onClick={() => handleExport("pdf")}>
            <IconFileText className="mr-2 h-4 w-4" />
            Export PDF
          </Button>
        </div>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="relative flex-1">
              <IconSearch className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Search by payment ID, order ID, or farmer name..."
                className="pl-10"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <Select value={statusFilter} onValueChange={(value) => setStatusFilter(value || "all")}>
              <SelectTrigger className="w-full md:w-[200px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Statuses</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="processing">Processing</SelectItem>
                <SelectItem value="in_escrow">In Escrow</SelectItem>
                <SelectItem value="quality_check">Quality Check</SelectItem>
                <SelectItem value="ready_for_release">Ready for Release</SelectItem>
                <SelectItem value="released">Released</SelectItem>
                <SelectItem value="completed">Completed</SelectItem>
                <SelectItem value="disputed">Disputed</SelectItem>
                <SelectItem value="refunded">Refunded</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Transactions Table */}
      <Card>
        <CardHeader>
          <CardTitle>Transactions</CardTitle>
          <CardDescription>
            {filteredTransactions.length} transaction{filteredTransactions.length !== 1 ? "s" : ""} found
          </CardDescription>
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
                    <TableHead>Payment ID</TableHead>
                    <TableHead>Order ID</TableHead>
                    <TableHead>Farmer</TableHead>
                    <TableHead>Amount</TableHead>
                    <TableHead>Method</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredTransactions.map((tx) => (
                    <TableRow key={tx.id}>
                      <TableCell className="font-medium">{tx.paymentId || tx.id}</TableCell>
                      <TableCell>{tx.orderId || tx.orderNumber}</TableCell>
                      <TableCell>{tx.counterparty}</TableCell>
                      <TableCell className="font-semibold">
                        KES {tx.amount.toLocaleString()}
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline">{getMethodLabel(tx.method)}</Badge>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline" className={getStatusColor(tx.status as EscrowStatus)}>
                          {String(tx.status).replace(/_/g, " ")}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-sm text-muted-foreground">
                        {new Date(tx.date).toLocaleDateString()}
                      </TableCell>
                      <TableCell className="text-right">
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => {
                            setSelectedTransaction(tx);
                            setDetailsOpen(true);
                          }}
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
              <IconCreditCard className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-lg font-medium text-muted-foreground">No transactions found</p>
              <p className="text-sm text-muted-foreground mt-1">
                {searchTerm || statusFilter !== "all"
                  ? "Try adjusting your filters"
                  : "Your payment history will appear here"}
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Transaction Details Dialog */}
      <Dialog open={detailsOpen} onOpenChange={setDetailsOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Transaction Details</DialogTitle>
            <DialogDescription>Payment #{selectedTransaction?.paymentId || selectedTransaction?.id}</DialogDescription>
          </DialogHeader>
          {selectedTransaction && (
            <div className="space-y-6">
              <EscrowStatusComponent
                status={selectedTransaction.status as EscrowStatus}
                amount={selectedTransaction.amount}
                orderId={selectedTransaction.orderId || selectedTransaction.orderNumber}
                createdAt={selectedTransaction.date}
                releasedAt={selectedTransaction.type === "escrow_release" ? selectedTransaction.date : undefined}
              />
              <div className="border-t pt-4">
                <h3 className="font-semibold mb-3">Transaction Breakdown</h3>
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Transaction Type</span>
                    <span className="font-medium">{selectedTransaction.type.replace(/_/g, " ")}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Amount</span>
                    <span className="font-medium">KES {selectedTransaction.amount.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Description</span>
                    <span className="font-medium">{selectedTransaction.description}</span>
                  </div>
                  <div className="flex justify-between text-sm pt-2 border-t">
                    <span className="font-semibold">Total</span>
                    <span className="font-bold">KES {selectedTransaction.amount.toLocaleString()}</span>
                  </div>
                </div>
              </div>
              <div className="border-t pt-4">
                <Button variant="outline" className="w-full">
                  <IconDownload className="mr-2 h-4 w-4" />
                  Download Receipt
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}

