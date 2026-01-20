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
import { useStaff } from "@/contexts/StaffContext";
import type { TransactionEvidence as TransactionEvidenceType } from "@/types/staff";

export function TransactionEvidence() {
  const { transactionEvidence, fetchTransactionEvidence, isLoading } = useStaff();
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [evidenceFilter, setEvidenceFilter] = useState<string>("all");
  const [selectedTransaction, setSelectedTransaction] = useState<TransactionEvidenceType | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  useEffect(() => {
    fetchTransactionEvidence();
  }, [fetchTransactionEvidence]);

  // Filter transactions - TransactionEvidence type has different fields
  const filteredTransactions = transactionEvidence.filter((txn) => {
    const matchesSearch =
      txn.transactionId.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (txn.description && txn.description.toLowerCase().includes(searchQuery.toLowerCase()));
    // Note: TransactionEvidence doesn't have paymentStatus or evidenceComplete fields
    // We'll filter based on verified status instead
    const matchesStatus = statusFilter === "all" || (statusFilter === "verified" && txn.verified) || (statusFilter === "unverified" && !txn.verified);
    const matchesEvidence = evidenceFilter === "all"; // Simplified since we don't have evidenceComplete
    return matchesSearch && matchesStatus && matchesEvidence;
  });

  const stats = {
    total: transactionEvidence.length,
    complete: transactionEvidence.filter((t) => t.verified).length,
    incomplete: transactionEvidence.filter((t) => !t.verified).length,
    totalValue: 0, // TransactionEvidence doesn't have amount field
  };

  const handleViewEvidence = (transaction: TransactionEvidenceType) => {
    setSelectedTransaction(transaction);
    setIsDialogOpen(true);
  };

  const getEvidenceCount = (txn: TransactionEvidenceType) => {
    // TransactionEvidence has fileUrl, so we count 1 if file exists
    return txn.fileUrl ? 1 : 0;
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
                      <TableCell>{txn.transactionId}</TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1 text-sm">
                          <IconCalendar className="h-3 w-3" />
                          {new Date(txn.uploadedAt).toLocaleDateString()}
                        </div>
                      </TableCell>
                      <TableCell>N/A</TableCell>
                      <TableCell>N/A</TableCell>
                      <TableCell>
                        <div className="space-y-1">
                          <div className="font-medium text-sm">{txn.evidenceType}</div>
                          <div className="text-xs text-muted-foreground">{txn.fileName}</div>
                        </div>
                      </TableCell>
                      <TableCell className="font-medium">N/A</TableCell>
                      <TableCell>
                        <Badge variant="outline" className="capitalize">
                          {txn.transactionType}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="space-y-1">
                          <div className="flex items-center gap-2">
                            {txn.fileUrl ? (
                              <IconCheck className="h-4 w-4 text-green-600" />
                            ) : (
                              <IconX className="h-4 w-4 text-red-600" />
                            )}
                            <span className="text-xs">{txn.evidenceType}</span>
                          </div>
                          <Badge variant="outline" className="text-xs mt-1">
                            {getEvidenceCount(txn)}/1 document
                          </Badge>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant="outline"
                          className={
                            txn.verified
                              ? "bg-green-100 text-green-800"
                              : "bg-yellow-100 text-yellow-800"
                          }
                        >
                          {txn.verified ? "Verified" : "Unverified"}
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
                  <p className="text-sm text-muted-foreground">Transaction ID</p>
                  <p className="font-medium">{selectedTransaction.transactionId}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Upload Date</p>
                  <p className="font-medium">{new Date(selectedTransaction.uploadedAt).toLocaleDateString()}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Transaction Type</p>
                  <Badge variant="outline" className="capitalize">
                    {selectedTransaction.transactionType}
                  </Badge>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Evidence Type</p>
                  <Badge variant="outline" className="capitalize">
                    {selectedTransaction.evidenceType}
                  </Badge>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">File Name</p>
                  <p className="font-medium">{selectedTransaction.fileName}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Status</p>
                  <Badge variant="outline" className={selectedTransaction.verified ? "bg-green-100 text-green-800" : "bg-yellow-100 text-yellow-800"}>
                    {selectedTransaction.verified ? "Verified" : "Unverified"}
                  </Badge>
                </div>
              </div>

              {selectedTransaction.description && (
                <div className="p-4 bg-muted rounded-lg">
                  <p className="text-sm text-muted-foreground mb-1">Description</p>
                  <p className="font-medium">{selectedTransaction.description}</p>
                </div>
              )}

              <div className="space-y-3">
                <h3 className="font-semibold">Evidence Document</h3>
                <div className="space-y-2">
                  <div className="flex items-center justify-between p-3 border rounded-lg">
                    <div className="flex items-center gap-3">
                      <IconFileText className="h-5 w-5 text-blue-600" />
                      <div>
                        <p className="font-medium">{selectedTransaction.fileName}</p>
                        <p className="text-xs text-muted-foreground">{selectedTransaction.evidenceType} - {selectedTransaction.fileType}</p>
                      </div>
                    </div>
                    {selectedTransaction.fileUrl ? (
                      <div className="flex items-center gap-2">
                        <IconCheck className="h-4 w-4 text-green-600" />
                        <Button variant="outline" size="sm" onClick={() => window.open(selectedTransaction.fileUrl, '_blank')}>
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
