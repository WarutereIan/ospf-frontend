import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import {
  IconSearch,
  IconReceipt,
  IconDownload,
  IconEye,
  IconFileText,
  IconCheck,
  IconX,
  IconCalendar,
  IconCurrency,
} from "@tabler/icons-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

interface TransactionEvidence {
  id: string;
  transactionId: string;
  orderId: string;
  date: string;
  buyerName: string;
  sellerName: string;
  amount: number;
  quantity: number;
  product: string;
  paymentMethod: "mpesa" | "bank" | "cash" | "other";
  paymentStatus: "completed" | "pending" | "failed";
  receiptAvailable: boolean;
  receiptUrl?: string;
  invoiceAvailable: boolean;
  invoiceUrl?: string;
  deliveryNoteAvailable: boolean;
  deliveryNoteUrl?: string;
  qualityCertificateAvailable: boolean;
  qualityCertificateUrl?: string;
  evidenceComplete: boolean;
}

export function TransactionEvidence() {
  const [transactions, setTransactions] = useState<TransactionEvidence[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [evidenceFilter, setEvidenceFilter] = useState<string>("all");
  const [selectedTransaction, setSelectedTransaction] = useState<TransactionEvidence | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    setTimeout(() => {
      setTransactions([
        {
          id: "EVD001",
          transactionId: "TXN001",
          orderId: "ORD123",
          date: "2024-01-15",
          buyerName: "Sarah Mwangi",
          sellerName: "John Mutua",
          amount: 50000,
          quantity: 100,
          product: "Sweet Potatoes",
          paymentMethod: "mpesa",
          paymentStatus: "completed",
          receiptAvailable: true,
          receiptUrl: "/receipts/TXN001.pdf",
          invoiceAvailable: true,
          invoiceUrl: "/invoices/ORD123.pdf",
          deliveryNoteAvailable: true,
          deliveryNoteUrl: "/delivery-notes/ORD123.pdf",
          qualityCertificateAvailable: true,
          qualityCertificateUrl: "/quality/ORD123.pdf",
          evidenceComplete: true,
        },
        {
          id: "EVD002",
          transactionId: "TXN002",
          orderId: "ORD124",
          date: "2024-01-14",
          buyerName: "David Kimani",
          sellerName: "Peter Kariuki",
          amount: 35000,
          quantity: 70,
          product: "Cassava",
          paymentMethod: "bank",
          paymentStatus: "completed",
          receiptAvailable: true,
          receiptUrl: "/receipts/TXN002.pdf",
          invoiceAvailable: true,
          invoiceUrl: "/invoices/ORD124.pdf",
          deliveryNoteAvailable: false,
          qualityCertificateAvailable: true,
          qualityCertificateUrl: "/quality/ORD124.pdf",
          evidenceComplete: false,
        },
        {
          id: "EVD003",
          transactionId: "TXN003",
          orderId: "ORD125",
          date: "2024-01-13",
          buyerName: "Grace Wambui",
          sellerName: "Mary Njoki",
          amount: 28000,
          quantity: 50,
          product: "Irish Potatoes",
          paymentMethod: "cash",
          paymentStatus: "completed",
          receiptAvailable: true,
          receiptUrl: "/receipts/TXN003.pdf",
          invoiceAvailable: false,
          deliveryNoteAvailable: true,
          deliveryNoteUrl: "/delivery-notes/ORD125.pdf",
          qualityCertificateAvailable: false,
          evidenceComplete: false,
        },
        {
          id: "EVD004",
          transactionId: "TXN004",
          orderId: "ORD126",
          date: "2024-01-12",
          buyerName: "James Omondi",
          sellerName: "Lucy Mwikali",
          amount: 42000,
          quantity: 85,
          product: "Sweet Potatoes",
          paymentMethod: "mpesa",
          paymentStatus: "pending",
          receiptAvailable: false,
          invoiceAvailable: false,
          deliveryNoteAvailable: false,
          qualityCertificateAvailable: false,
          evidenceComplete: false,
        },
      ]);
      setIsLoading(false);
    }, 1000);
  }, []);

  const filteredTransactions = transactions.filter((txn) => {
    const matchesSearch =
      txn.transactionId.toLowerCase().includes(searchQuery.toLowerCase()) ||
      txn.orderId.toLowerCase().includes(searchQuery.toLowerCase()) ||
      txn.buyerName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      txn.sellerName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      txn.product.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === "all" || txn.paymentStatus === statusFilter;
    const matchesEvidence =
      evidenceFilter === "all" ||
      (evidenceFilter === "complete" && txn.evidenceComplete) ||
      (evidenceFilter === "incomplete" && !txn.evidenceComplete);
    return matchesSearch && matchesStatus && matchesEvidence;
  });

  const stats = {
    total: transactions.length,
    complete: transactions.filter((t) => t.evidenceComplete).length,
    incomplete: transactions.filter((t) => !t.evidenceComplete).length,
    totalValue: transactions.reduce((sum, t) => sum + t.amount, 0),
  };

  const handleViewEvidence = (transaction: TransactionEvidence) => {
    setSelectedTransaction(transaction);
    setIsDialogOpen(true);
  };

  const getEvidenceCount = (txn: TransactionEvidence) => {
    let count = 0;
    if (txn.receiptAvailable) count++;
    if (txn.invoiceAvailable) count++;
    if (txn.deliveryNoteAvailable) count++;
    if (txn.qualityCertificateAvailable) count++;
    return count;
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold">Transaction Evidence</h1>
          <p className="text-sm sm:text-base text-muted-foreground mt-1">
            Review and manage evidence for sales transactions - receipts, invoices, delivery notes, and quality certificates
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm">
            <IconDownload className="mr-2 h-4 w-4" />
            Export All
          </Button>
        </div>
      </div>

      {/* Statistics */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total Transactions</p>
                <p className="text-2xl font-bold">{stats.total}</p>
              </div>
              <IconReceipt className="h-8 w-8 text-primary" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Complete Evidence</p>
                <p className="text-2xl font-bold text-green-600">{stats.complete}</p>
              </div>
              <IconCheck className="h-8 w-8 text-green-600" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Incomplete Evidence</p>
                <p className="text-2xl font-bold text-red-600">{stats.incomplete}</p>
              </div>
              <IconX className="h-8 w-8 text-red-600" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total Value</p>
                <p className="text-2xl font-bold">KES {stats.totalValue.toLocaleString()}</p>
              </div>
              <IconCurrency className="h-8 w-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Search and Filters */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1">
              <IconSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search by transaction ID, order ID, buyer, or seller..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-full sm:w-[180px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="completed">Completed</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="failed">Failed</SelectItem>
              </SelectContent>
            </Select>
            <Select value={evidenceFilter} onValueChange={setEvidenceFilter}>
              <SelectTrigger className="w-full sm:w-[180px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Evidence</SelectItem>
                <SelectItem value="complete">Complete</SelectItem>
                <SelectItem value="incomplete">Incomplete</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Transactions Table */}
      <Card>
        <CardHeader>
          <CardTitle>Transaction Evidence ({filteredTransactions.length})</CardTitle>
          <CardDescription>Review evidence documentation for all sales transactions</CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="space-y-4">
              {[1, 2, 3].map((i) => (
                <div key={i} className="h-16 bg-muted animate-pulse rounded-lg" />
              ))}
            </div>
          ) : filteredTransactions.length > 0 ? (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Transaction ID</TableHead>
                    <TableHead>Order ID</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead>Buyer</TableHead>
                    <TableHead>Seller</TableHead>
                    <TableHead>Product</TableHead>
                    <TableHead>Amount</TableHead>
                    <TableHead>Payment</TableHead>
                    <TableHead>Evidence</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredTransactions.map((txn) => (
                    <TableRow key={txn.id}>
                      <TableCell className="font-medium">{txn.transactionId}</TableCell>
                      <TableCell>{txn.orderId}</TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1 text-sm">
                          <IconCalendar className="h-3 w-3" />
                          {txn.date}
                        </div>
                      </TableCell>
                      <TableCell>{txn.buyerName}</TableCell>
                      <TableCell>{txn.sellerName}</TableCell>
                      <TableCell>
                        <div className="space-y-1">
                          <div className="font-medium text-sm">{txn.product}</div>
                          <div className="text-xs text-muted-foreground">{txn.quantity} kg</div>
                        </div>
                      </TableCell>
                      <TableCell className="font-medium">KES {txn.amount.toLocaleString()}</TableCell>
                      <TableCell>
                        <Badge variant="outline" className="capitalize">
                          {txn.paymentMethod}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="space-y-1">
                          <div className="flex items-center gap-2">
                            {txn.receiptAvailable ? (
                              <IconCheck className="h-4 w-4 text-green-600" />
                            ) : (
                              <IconX className="h-4 w-4 text-red-600" />
                            )}
                            <span className="text-xs">Receipt</span>
                          </div>
                          <div className="flex items-center gap-2">
                            {txn.invoiceAvailable ? (
                              <IconCheck className="h-4 w-4 text-green-600" />
                            ) : (
                              <IconX className="h-4 w-4 text-red-600" />
                            )}
                            <span className="text-xs">Invoice</span>
                          </div>
                          <div className="flex items-center gap-2">
                            {txn.deliveryNoteAvailable ? (
                              <IconCheck className="h-4 w-4 text-green-600" />
                            ) : (
                              <IconX className="h-4 w-4 text-red-600" />
                            )}
                            <span className="text-xs">Delivery Note</span>
                          </div>
                          <div className="flex items-center gap-2">
                            {txn.qualityCertificateAvailable ? (
                              <IconCheck className="h-4 w-4 text-green-600" />
                            ) : (
                              <IconX className="h-4 w-4 text-red-600" />
                            )}
                            <span className="text-xs">Quality Cert</span>
                          </div>
                          <Badge variant="outline" className="text-xs mt-1">
                            {getEvidenceCount(txn)}/4 documents
                          </Badge>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant="outline"
                          className={
                            txn.evidenceComplete
                              ? "bg-green-100 text-green-800"
                              : "bg-yellow-100 text-yellow-800"
                          }
                        >
                          {txn.evidenceComplete ? "Complete" : "Incomplete"}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleViewEvidence(txn)}
                          title="View Evidence"
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
            <div className="text-center py-8">
              <IconReceipt className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground">No transactions found</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Evidence View Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Transaction Evidence - {selectedTransaction?.transactionId}</DialogTitle>
            <DialogDescription>View and download all evidence documents</DialogDescription>
          </DialogHeader>
          {selectedTransaction && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4 p-4 bg-muted rounded-lg">
                <div>
                  <p className="text-sm text-muted-foreground">Order ID</p>
                  <p className="font-medium">{selectedTransaction.orderId}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Date</p>
                  <p className="font-medium">{selectedTransaction.date}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Buyer</p>
                  <p className="font-medium">{selectedTransaction.buyerName}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Seller</p>
                  <p className="font-medium">{selectedTransaction.sellerName}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Amount</p>
                  <p className="font-medium">KES {selectedTransaction.amount.toLocaleString()}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Payment Method</p>
                  <Badge variant="outline" className="capitalize">
                    {selectedTransaction.paymentMethod}
                  </Badge>
                </div>
              </div>

              <div className="space-y-3">
                <h3 className="font-semibold">Evidence Documents</h3>
                <div className="space-y-2">
                  <div className="flex items-center justify-between p-3 border rounded-lg">
                    <div className="flex items-center gap-3">
                      <IconReceipt className="h-5 w-5 text-blue-600" />
                      <div>
                        <p className="font-medium">Receipt</p>
                        <p className="text-xs text-muted-foreground">Payment confirmation</p>
                      </div>
                    </div>
                    {selectedTransaction.receiptAvailable ? (
                      <div className="flex items-center gap-2">
                        <IconCheck className="h-4 w-4 text-green-600" />
                        <Button variant="outline" size="sm">
                          <IconDownload className="h-4 w-4 mr-2" />
                          Download
                        </Button>
                      </div>
                    ) : (
                      <IconX className="h-4 w-4 text-red-600" />
                    )}
                  </div>

                  <div className="flex items-center justify-between p-3 border rounded-lg">
                    <div className="flex items-center gap-3">
                      <IconFileText className="h-5 w-5 text-purple-600" />
                      <div>
                        <p className="font-medium">Invoice</p>
                        <p className="text-xs text-muted-foreground">Order invoice</p>
                      </div>
                    </div>
                    {selectedTransaction.invoiceAvailable ? (
                      <div className="flex items-center gap-2">
                        <IconCheck className="h-4 w-4 text-green-600" />
                        <Button variant="outline" size="sm">
                          <IconDownload className="h-4 w-4 mr-2" />
                          Download
                        </Button>
                      </div>
                    ) : (
                      <IconX className="h-4 w-4 text-red-600" />
                    )}
                  </div>

                  <div className="flex items-center justify-between p-3 border rounded-lg">
                    <div className="flex items-center gap-3">
                      <IconFileText className="h-5 w-5 text-green-600" />
                      <div>
                        <p className="font-medium">Delivery Note</p>
                        <p className="text-xs text-muted-foreground">Delivery confirmation</p>
                      </div>
                    </div>
                    {selectedTransaction.deliveryNoteAvailable ? (
                      <div className="flex items-center gap-2">
                        <IconCheck className="h-4 w-4 text-green-600" />
                        <Button variant="outline" size="sm">
                          <IconDownload className="h-4 w-4 mr-2" />
                          Download
                        </Button>
                      </div>
                    ) : (
                      <IconX className="h-4 w-4 text-red-600" />
                    )}
                  </div>

                  <div className="flex items-center justify-between p-3 border rounded-lg">
                    <div className="flex items-center gap-3">
                      <IconFileText className="h-5 w-5 text-orange-600" />
                      <div>
                        <p className="font-medium">Quality Certificate</p>
                        <p className="text-xs text-muted-foreground">Quality assurance document</p>
                      </div>
                    </div>
                    {selectedTransaction.qualityCertificateAvailable ? (
                      <div className="flex items-center gap-2">
                        <IconCheck className="h-4 w-4 text-green-600" />
                        <Button variant="outline" size="sm">
                          <IconDownload className="h-4 w-4 mr-2" />
                          Download
                        </Button>
                      </div>
                    ) : (
                      <IconX className="h-4 w-4 text-red-600" />
                    )}
                  </div>
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-4 border-t">
                <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
                  Close
                </Button>
                <Button>
                  <IconDownload className="h-4 w-4 mr-2" />
                  Download All Available
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
