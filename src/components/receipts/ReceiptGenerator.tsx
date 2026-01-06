import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  IconDownload,
  IconPrinter,
  IconQrcode,
  IconFileText,
} from "@tabler/icons-react";

interface ReceiptData {
  receiptId: string;
  type: "stock_in" | "stock_out" | "payment" | "order";
  date: string;
  farmerName?: string;
  buyerName?: string;
  variety: string;
  quantity: number;
  qualityGrade: string;
  pricePerKg?: number;
  totalAmount?: number;
  location?: string;
  transactionId?: string;
  qrCode?: string;
}

interface ReceiptGeneratorProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  receiptData: ReceiptData;
  onDownload?: (format: "pdf" | "png") => void;
  onPrint?: () => void;
}

export function ReceiptGenerator({
  open,
  onOpenChange,
  receiptData,
  onDownload,
  onPrint,
}: ReceiptGeneratorProps) {
  const handleDownload = (format: "pdf" | "png") => {
    if (onDownload) {
      onDownload(format);
    } else {
      // TODO: Implement actual download
      console.log(`Downloading receipt as ${format}...`);
    }
  };

  const handlePrint = () => {
    if (onPrint) {
      onPrint();
    } else {
      window.print();
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Receipt</DialogTitle>
          <DialogDescription>Receipt #{receiptData.receiptId}</DialogDescription>
        </DialogHeader>

        {/* Receipt Content */}
        <Card id="receipt-content" className="print:shadow-none">
          <CardContent className="p-6 space-y-6">
            {/* Header */}
            <div className="text-center border-b pb-4">
              <h2 className="text-2xl font-bold">OFSP Marketplace</h2>
              <p className="text-sm text-muted-foreground">Digital Receipt</p>
              <p className="text-xs text-muted-foreground mt-2">
                Receipt ID: {receiptData.receiptId}
              </p>
              {receiptData.qrCode && (
                <div className="mt-4 flex justify-center">
                  <div className="p-2 bg-white border rounded">
                    <IconQrcode className="h-24 w-24" />
                    <p className="text-xs text-muted-foreground mt-1">Scan to verify</p>
                  </div>
                </div>
              )}
            </div>

            {/* Receipt Type Badge */}
            <div className="flex justify-center">
              <Badge variant="outline" className="text-sm">
                {receiptData.type === "stock_in" && "Stock In Receipt"}
                {receiptData.type === "stock_out" && "Stock Out Receipt"}
                {receiptData.type === "payment" && "Payment Receipt"}
                {receiptData.type === "order" && "Order Receipt"}
              </Badge>
            </div>

            {/* Details */}
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-muted-foreground">Date:</span>
                  <p className="font-medium">{new Date(receiptData.date).toLocaleDateString()}</p>
                </div>
                <div>
                  <span className="text-muted-foreground">Time:</span>
                  <p className="font-medium">{new Date(receiptData.date).toLocaleTimeString()}</p>
                </div>
              </div>

              {receiptData.farmerName && (
                <div>
                  <span className="text-sm text-muted-foreground">Farmer:</span>
                  <p className="font-medium">{receiptData.farmerName}</p>
                </div>
              )}

              {receiptData.buyerName && (
                <div>
                  <span className="text-sm text-muted-foreground">Buyer:</span>
                  <p className="font-medium">{receiptData.buyerName}</p>
                </div>
              )}

              {receiptData.location && (
                <div>
                  <span className="text-sm text-muted-foreground">Location:</span>
                  <p className="font-medium">{receiptData.location}</p>
                </div>
              )}

              {receiptData.transactionId && (
                <div>
                  <span className="text-sm text-muted-foreground">Transaction ID:</span>
                  <p className="font-medium font-mono text-xs">{receiptData.transactionId}</p>
                </div>
              )}

              <div className="border-t pt-4 space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Variety:</span>
                  <span className="font-medium">{receiptData.variety}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Quality Grade:</span>
                  <Badge variant="outline">Grade {receiptData.qualityGrade}</Badge>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Quantity:</span>
                  <span className="font-medium">{receiptData.quantity} kg</span>
                </div>
                {receiptData.pricePerKg && (
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Price per kg:</span>
                    <span className="font-medium">KES {receiptData.pricePerKg}</span>
                  </div>
                )}
                {receiptData.totalAmount && (
                  <div className="flex justify-between text-sm border-t pt-2 mt-2">
                    <span className="font-semibold">Total Amount:</span>
                    <span className="text-lg font-bold">KES {receiptData.totalAmount.toLocaleString()}</span>
                  </div>
                )}
              </div>
            </div>

            {/* Footer */}
            <div className="border-t pt-4 text-center text-xs text-muted-foreground">
              <p>This is a computer-generated receipt</p>
              <p className="mt-1">For inquiries, contact: support@ofsp-marketplace.com</p>
            </div>
          </CardContent>
        </Card>

        <DialogFooter>
          <Button variant="outline" onClick={() => handleDownload("png")}>
            <IconDownload className="mr-2 h-4 w-4" />
            Download PNG
          </Button>
          <Button variant="outline" onClick={() => handleDownload("pdf")}>
            <IconFileText className="mr-2 h-4 w-4" />
            Download PDF
          </Button>
          <Button onClick={handlePrint}>
            <IconPrinter className="mr-2 h-4 w-4" />
            Print
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
