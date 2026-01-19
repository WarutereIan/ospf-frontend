import { useRef, useState } from "react";
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
  IconFileText,
  IconLoader2,
} from "@tabler/icons-react";
import QRCode from "react-qr-code";
import html2canvas from "html2canvas";
import { jsPDF } from "jspdf";
import { useReactToPrint } from "react-to-print";

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
  const receiptRef = useRef<HTMLDivElement>(null);
  const [isDownloading, setIsDownloading] = useState<"png" | "pdf" | null>(null);

  // Generate QR code value - include receipt ID and transaction ID for verification
  const qrCodeValue = receiptData.qrCode || receiptData.transactionId || receiptData.receiptId;

  // Print functionality using react-to-print
  const printReceipt = useReactToPrint({
    contentRef: receiptRef,
    documentTitle: `Receipt_${receiptData.receiptId}`,
  });

  const handleDownloadPNG = async () => {
    if (!receiptRef.current) return;

    if (onDownload) {
      onDownload("png");
      return;
    }

    setIsDownloading("png");
    try {
      const canvas = await html2canvas(receiptRef.current, {
        scale: 2,
        backgroundColor: "#ffffff",
        useCORS: true,
        logging: false,
      });

      const imgData = canvas.toDataURL("image/png");
      const link = document.createElement("a");
      link.download = `receipt_${receiptData.receiptId}.png`;
      link.href = imgData;
      link.click();
    } catch (error) {
      console.error("Error generating PNG:", error);
      alert("Failed to generate PNG. Please try again.");
    } finally {
      setIsDownloading(null);
    }
  };

  const handleDownloadPDF = async () => {
    if (!receiptRef.current) return;

    if (onDownload) {
      onDownload("pdf");
      return;
    }

    setIsDownloading("pdf");
    try {
      const canvas = await html2canvas(receiptRef.current, {
        scale: 2,
        backgroundColor: "#ffffff",
        useCORS: true,
        logging: false,
        windowWidth: receiptRef.current.scrollWidth,
        windowHeight: receiptRef.current.scrollHeight,
      });

      const imgData = canvas.toDataURL("image/png", 1.0);
      const pdf = new jsPDF("p", "mm", "a4");
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = pdf.internal.pageSize.getHeight();
      
      // Convert canvas dimensions from pixels to mm (assuming 96 DPI)
      const imgWidth = canvas.width / 3.779527559; // pixels to mm
      const imgHeight = canvas.height / 3.779527559; // pixels to mm
      
      // Calculate scaling to fit page
      const widthRatio = pdfWidth / imgWidth;
      const heightRatio = pdfHeight / imgHeight;
      const ratio = Math.min(widthRatio, heightRatio, 1); // Don't scale up
      
      const scaledWidth = imgWidth * ratio;
      const scaledHeight = imgHeight * ratio;
      
      // Center the image
      const imgX = (pdfWidth - scaledWidth) / 2;
      const imgY = 0;

      pdf.addImage(imgData, "PNG", imgX, imgY, scaledWidth, scaledHeight);
      pdf.save(`receipt_${receiptData.receiptId}.pdf`);
    } catch (error) {
      console.error("Error generating PDF:", error);
      alert("Failed to generate PDF. Please try again.");
    } finally {
      setIsDownloading(null);
    }
  };

  const handleDownload = (format: "pdf" | "png") => {
    if (format === "png") {
      handleDownloadPNG();
    } else {
      handleDownloadPDF();
    }
  };

  const handlePrintClick = () => {
    if (onPrint) {
      onPrint();
    } else {
      printReceipt();
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl w-full max-h-[90vh] flex flex-col p-0 overflow-hidden">
        <DialogHeader className="px-6 pt-6 pb-4 border-b flex-shrink-0">
          <DialogTitle>Receipt</DialogTitle>
          <DialogDescription>Receipt #{receiptData.receiptId}</DialogDescription>
        </DialogHeader>

        {/* Receipt Content - Scrollable */}
        <div className="flex-1 overflow-y-auto overflow-x-hidden px-6 py-4">
          <Card 
            id="receipt-content" 
            ref={receiptRef}
            className="print:shadow-none w-full max-w-full bg-white"
          >
            <CardContent className="p-4 sm:p-6 space-y-4 sm:space-y-6">
            {/* Header */}
            <div className="text-center border-b pb-4">
              <h2 className="text-xl sm:text-2xl font-bold">OFSP Marketplace</h2>
              <p className="text-xs sm:text-sm text-muted-foreground">Digital Receipt</p>
              <p className="text-xs text-muted-foreground mt-2 break-words">
                Receipt ID: {receiptData.receiptId}
              </p>
              {qrCodeValue && (
                <div className="mt-4 flex justify-center">
                  <div className="p-3 sm:p-4 bg-white border rounded-lg shadow-sm">
                    <div className="w-[120px] h-[120px] sm:w-[150px] sm:h-[150px] mx-auto">
                      <QRCode
                        value={qrCodeValue}
                        size={150}
                        style={{ height: "auto", maxWidth: "100%", width: "100%" }}
                        viewBox="0 0 150 150"
                        fgColor="#000000"
                        bgColor="#ffffff"
                      />
                    </div>
                    <p className="text-xs text-muted-foreground mt-2">Scan to verify</p>
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
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4 text-sm">
                <div>
                  <span className="text-muted-foreground">Date:</span>
                  <p className="font-medium break-words">{new Date(receiptData.date).toLocaleDateString()}</p>
                </div>
                <div>
                  <span className="text-muted-foreground">Time:</span>
                  <p className="font-medium break-words">{new Date(receiptData.date).toLocaleTimeString()}</p>
                </div>
              </div>

              {receiptData.farmerName && (
                <div>
                  <span className="text-xs sm:text-sm text-muted-foreground">Farmer:</span>
                  <p className="font-medium break-words">{receiptData.farmerName}</p>
                </div>
              )}

              {receiptData.buyerName && (
                <div>
                  <span className="text-xs sm:text-sm text-muted-foreground">Buyer:</span>
                  <p className="font-medium break-words">{receiptData.buyerName}</p>
                </div>
              )}

              {receiptData.location && (
                <div>
                  <span className="text-xs sm:text-sm text-muted-foreground">Location:</span>
                  <p className="font-medium break-words">{receiptData.location}</p>
                </div>
              )}

              {receiptData.transactionId && (
                <div>
                  <span className="text-xs sm:text-sm text-muted-foreground">Transaction ID:</span>
                  <p className="font-medium font-mono text-xs break-all">{receiptData.transactionId}</p>
                </div>
              )}

              <div className="border-t pt-4 space-y-2">
                <div className="flex flex-col sm:flex-row sm:justify-between gap-1 sm:gap-2 text-sm">
                  <span className="text-muted-foreground">Variety:</span>
                  <span className="font-medium break-words">{receiptData.variety}</span>
                </div>
                <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-1 sm:gap-2 text-sm">
                  <span className="text-muted-foreground">Quality Grade:</span>
                  <Badge variant="outline" className="w-fit">Grade {receiptData.qualityGrade}</Badge>
                </div>
                <div className="flex flex-col sm:flex-row sm:justify-between gap-1 sm:gap-2 text-sm">
                  <span className="text-muted-foreground">Quantity:</span>
                  <span className="font-medium break-words">{receiptData.quantity} kg</span>
                </div>
                {receiptData.pricePerKg && (
                  <div className="flex flex-col sm:flex-row sm:justify-between gap-1 sm:gap-2 text-sm">
                    <span className="text-muted-foreground">Price per kg:</span>
                    <span className="font-medium break-words">KES {receiptData.pricePerKg}</span>
                  </div>
                )}
                {receiptData.totalAmount && (
                  <div className="flex flex-col sm:flex-row sm:justify-between gap-1 sm:gap-2 text-sm border-t pt-2 mt-2">
                    <span className="font-semibold">Total Amount:</span>
                    <span className="text-base sm:text-lg font-bold break-words">KES {receiptData.totalAmount.toLocaleString()}</span>
                  </div>
                )}
              </div>
            </div>

            {/* Footer */}
            <div className="border-t pt-4 text-center text-xs text-muted-foreground">
              <p className="break-words">This is a computer-generated receipt</p>
              <p className="mt-1 break-words">For inquiries, contact: support@ofsp-marketplace.com</p>
            </div>
          </CardContent>
        </Card>
        </div>

        {/* Footer - Fixed at bottom */}
        <DialogFooter className="px-6 py-4 border-t flex-shrink-0 flex-col sm:flex-row gap-2 no-print">
          <Button 
            variant="outline" 
            onClick={handleDownloadPNG} 
            disabled={isDownloading !== null}
            className="w-full sm:w-auto"
          >
            {isDownloading === "png" ? (
              <>
                <IconLoader2 className="mr-2 h-4 w-4 animate-spin" />
                Generating...
              </>
            ) : (
              <>
                <IconDownload className="mr-2 h-4 w-4" />
                Download PNG
              </>
            )}
          </Button>
          <Button 
            variant="outline" 
            onClick={handleDownloadPDF} 
            disabled={isDownloading !== null}
            className="w-full sm:w-auto"
          >
            {isDownloading === "pdf" ? (
              <>
                <IconLoader2 className="mr-2 h-4 w-4 animate-spin" />
                Generating...
              </>
            ) : (
              <>
                <IconFileText className="mr-2 h-4 w-4" />
                Download PDF
              </>
            )}
          </Button>
          <Button 
            onClick={handlePrintClick} 
            disabled={isDownloading !== null}
            className="w-full sm:w-auto"
          >
            <IconPrinter className="mr-2 h-4 w-4" />
            Print
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

