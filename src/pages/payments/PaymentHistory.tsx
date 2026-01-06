import { useState, useEffect } from "react";
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

interface PaymentTransaction {
  id: string;
  orderId: string;
  amount: number;
  platformFee: number;
  totalAmount: number;
  method: "mpesa" | "airtel" | "bank" | "card";
  status: EscrowStatus;
  farmerName: string;
  createdAt: string;
  releasedAt?: string;
  receiptUrl?: string;
}

export function PaymentHistory() {
  const [transactions, setTransactions] = useState<PaymentTransaction[]>([]);
  const [filteredTransactions, setFilteredTransactions] = useState<PaymentTransaction[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [selectedTransaction, setSelectedTransaction] = useState<PaymentTransaction | null>(null);
  const [detailsOpen, setDetailsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // TODO: Replace with actual API call
    setTimeout(() => {
      const sampleTransactions: PaymentTransaction[] = [
        {
          id: "PAY-001",
          orderId: "ORD-001",
          amount: 75000,
          platformFee: 1500,
          totalAmount: 76500,
          method: "mpesa",
          status: "completed",
          farmerName: "James Mutua",
          createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
          releasedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
        },
        {
          id: "PAY-002",
          orderId: "ORD-002",
          amount: 36000,
          platformFee: 720,
          totalAmount: 36720,
          method: "mpesa",
          status: "in_escrow",
          farmerName: "Mary Wanjiku",
          createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
        },
        {
          id: "PAY-003",
          orderId: "ORD-003",
          amount: 20000,
          platformFee: 400,
          totalAmount: 20400,
          method: "airtel",
          status: "ready_for_release",
          farmerName: "Peter Kamau",
          createdAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
        },
      ];
      setTransactions(sampleTransactions);
      setFilteredTransactions(sampleTransactions);
      setIsLoading(false);
    }, 1000);
  }, []);

  useEffect(() => {
    let filtered = [...transactions];

    // Search filter
    if (searchTerm) {
      filtered = filtered.filter(
        (tx) =>
          tx.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
          tx.orderId.toLowerCase().includes(searchTerm.toLowerCase()) ||
          tx.farmerName.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Status filter
    if (statusFilter !== "all") {
      filtered = filtered.filter((tx) => tx.status === statusFilter);
    }

    setFilteredTransactions(filtered);
  }, [transactions, searchTerm, statusFilter]);

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
      case "bank":
        return "Bank Transfer";
      case "card":
        return "Card";
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
                      <TableCell className="font-medium">{tx.id}</TableCell>
                      <TableCell>{tx.orderId}</TableCell>
                      <TableCell>{tx.farmerName}</TableCell>
                      <TableCell className="font-semibold">
                        KES {tx.totalAmount.toLocaleString()}
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline">{getMethodLabel(tx.method)}</Badge>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline" className={getStatusColor(tx.status)}>
                          {tx.status.replace(/_/g, " ")}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-sm text-muted-foreground">
                        {new Date(tx.createdAt).toLocaleDateString()}
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
            <DialogDescription>Payment #{selectedTransaction?.id}</DialogDescription>
          </DialogHeader>
          {selectedTransaction && (
            <div className="space-y-6">
              <EscrowStatusComponent
                status={selectedTransaction.status}
                amount={selectedTransaction.amount}
                orderId={selectedTransaction.orderId}
                createdAt={selectedTransaction.createdAt}
                releasedAt={selectedTransaction.releasedAt}
              />
              <div className="border-t pt-4">
                <h3 className="font-semibold mb-3">Transaction Breakdown</h3>
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Order Amount</span>
                    <span className="font-medium">KES {selectedTransaction.amount.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Platform Fee (2%)</span>
                    <span className="font-medium">KES {selectedTransaction.platformFee.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between text-sm pt-2 border-t">
                    <span className="font-semibold">Total Paid</span>
                    <span className="font-bold">KES {selectedTransaction.totalAmount.toLocaleString()}</span>
                  </div>
                </div>
              </div>
              {selectedTransaction.receiptUrl && (
                <div className="border-t pt-4">
                  <Button variant="outline" className="w-full">
                    <IconDownload className="mr-2 h-4 w-4" />
                    Download Receipt
                  </Button>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
