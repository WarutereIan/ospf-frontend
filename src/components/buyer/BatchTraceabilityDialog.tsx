import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import {
  IconQrcode,
  IconSearch,
  IconMapPin,
  IconPackage,
  IconCheck,
  IconClock,
  IconUser,
  IconBuilding,
  IconTruck,
  IconTemperature,
  IconShieldCheck,
  IconX,
  IconLoader2,
  IconPlant,
  IconFileText,
} from "@tabler/icons-react";
import { getImageFullUrl } from "@/services/uploadService";

export interface TraceabilityStep {
  id: string;
  stage: string;
  location: string;
  timestamp: string;
  actor: string;
  actorRole?: string;
  status: "completed" | "pending" | "current";
  notes?: string;
  photos?: string[];
  metadata?: {
    temperature?: string;
    humidity?: string;
    qualityGrade?: string;
    quantity?: number;
    duration?: string;
  };
}

export interface BatchTraceabilityInfo {
  batchId: string;
  qrCode?: string;
  variety: string;
  quantity: number;
  qualityGrade: "A" | "B" | "C";
  farmerId: string;
  farmerName: string;
  farmerLocation: string;
  farmerPhone?: string;
  aggregationCenter: string;
  aggregationCenterType?: "main" | "satellite";
  receiptId?: string;
  steps: TraceabilityStep[];
  currentStatus: string;
  currentLocation?: string;
}

interface BatchTraceabilityDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  batchId?: string; // Pre-populated batch ID
  onLookup?: (batchId: string) => Promise<BatchTraceabilityInfo | null>;
}

export function BatchTraceabilityDialog({
  open,
  onOpenChange,
  batchId: initialBatchId,
  onLookup,
}: BatchTraceabilityDialogProps) {
  const [batchId, setBatchId] = useState(initialBatchId || "");
  const [traceabilityInfo, setTraceabilityInfo] = useState<BatchTraceabilityInfo | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showQRScanner, setShowQRScanner] = useState(false);

  useEffect(() => {
    if (initialBatchId && open) {
      setBatchId(initialBatchId);
      handleBatchIdLookup(initialBatchId);
    }
  }, [initialBatchId, open]);

  const handleBatchIdLookup = async (id?: string) => {
    const lookupId = id || batchId.trim();
    if (!lookupId) {
      setError("Please enter a batch ID");
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      if (onLookup) {
        const result = await onLookup(lookupId);
        if (result) {
          setTraceabilityInfo(result);
        } else {
          setError("Batch ID not found. Please check and try again.");
        }
      } else {
        // Mock lookup for demonstration
        setTimeout(() => {
          const mockInfo: BatchTraceabilityInfo = {
            batchId: lookupId,
            qrCode: `QR-${lookupId}`,
            variety: "Kenya",
            quantity: 500,
            qualityGrade: "A",
            farmerId: "F001",
            farmerName: "James Mutua",
            farmerLocation: "Kangundo East Ward, Kangundo Subcounty",
            farmerPhone: "+254712345678",
            aggregationCenter: "Kangundo Main Aggregation Center",
            aggregationCenterType: "main",
            receiptId: "RCP-2023-001",
            currentStatus: "In Storage",
            currentLocation: "Kangundo Main Aggregation Center",
            steps: [
              {
                id: "1",
                stage: "Harvest",
                location: "James Mutua's Farm",
                timestamp: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
                actor: "James Mutua",
                actorRole: "Farmer",
                status: "completed",
                notes: "OFSP roots harvested according to recommended practices. Harvested 520 kg, sorted to 500 kg.",
                metadata: {
                  quantity: 520,
                },
              },
              {
                id: "2",
                stage: "On-Farm Sorting",
                location: "James Mutua's Farm",
                timestamp: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
                actor: "James Mutua",
                actorRole: "Farmer",
                status: "completed",
                notes: "Damaged and spoiled produce removed. Quality sorted into Grade A batch.",
                metadata: {
                  quantity: 500,
                  qualityGrade: "A",
                },
              },
              {
                id: "3",
                stage: "Transport to Aggregation Center",
                location: "Kangundo East Ward → Kangundo Main Center",
                timestamp: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
                actor: "Transport Provider",
                actorRole: "Logistics",
                status: "completed",
                notes: "Produce transported via vehicle KCA 123X. Transit time: 45 minutes.",
                metadata: {
                  duration: "45 minutes",
                },
              },
              {
                id: "4",
                stage: "Stock In - Aggregation Center",
                location: "Kangundo Main Aggregation Center",
                timestamp: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
                actor: "Peter Kariuki",
                actorRole: "Aggregation Manager",
                status: "completed",
                notes: "Produce received, weighed, and initial quality check performed. Receipt RCP-2023-001 generated.",
                metadata: {
                  quantity: 500,
                  qualityGrade: "A",
                },
              },
              {
                id: "5",
                stage: "Quality Inspection",
                location: "Kangundo Main Aggregation Center",
                timestamp: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000).toISOString(),
                actor: "Quality Control Officer",
                actorRole: "Quality Officer",
                status: "completed",
                notes: "Comprehensive quality check performed. Grade A confirmed. Photos captured for documentation.",
                metadata: {
                  qualityGrade: "A",
                },
              },
              {
                id: "6",
                stage: "Storage Entry",
                location: "Kangundo Main Aggregation Center - Storage Unit 3",
                timestamp: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000).toISOString(),
                actor: "Storage Manager",
                actorRole: "Storage Staff",
                status: "completed",
                notes: "Batch stored in climate-controlled storage unit. Proper ventilation maintained.",
                metadata: {
                  temperature: "18-20°C",
                  humidity: "65-70%",
                  duration: "4 days",
                },
              },
              {
                id: "7",
                stage: "Storage Monitoring",
                location: "Kangundo Main Aggregation Center - Storage Unit 3",
                timestamp: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
                actor: "Storage Manager",
                actorRole: "Storage Staff",
                status: "completed",
                notes: "Regular quality check performed. Batch remains in excellent condition. No spoilage detected.",
                metadata: {
                  temperature: "18-20°C",
                  humidity: "65-70%",
                },
              },
              {
                id: "8",
                stage: "In Storage",
                location: "Kangundo Main Aggregation Center - Storage Unit 3",
                timestamp: new Date().toISOString(),
                actor: "System",
                actorRole: "Current Status",
                status: "current",
                notes: "Batch is currently in storage and available for dispatch. Ready for quality buyer orders.",
                metadata: {
                  temperature: "18-20°C",
                  humidity: "65-70%",
                  quantity: 500,
                },
              },
            ],
          };
          setTraceabilityInfo(mockInfo);
          setIsLoading(false);
        }, 1000);
      }
    } catch (err) {
      setError("Error looking up batch ID. Please try again.");
      setIsLoading(false);
    }
  };

  const handleQRScan = () => {
    // TODO: Implement QR code scanning with camera access
    // For now, show a prompt to enter QR code manually
    const qrValue = prompt("Enter QR code value or scan with your device camera:");
    if (qrValue) {
      setBatchId(qrValue);
      handleBatchIdLookup(qrValue);
    }
  };

  const getStageIcon = (stage: string) => {
    const stageLower = stage.toLowerCase();
    if (stageLower.includes("harvest")) return <IconPlant className="h-5 w-5" />;
    if (stageLower.includes("sort")) return <IconCheck className="h-5 w-5" />;
    if (stageLower.includes("transport")) return <IconTruck className="h-5 w-5" />;
    if (stageLower.includes("stock in") || stageLower.includes("aggregation")) return <IconBuilding className="h-5 w-5" />;
    if (stageLower.includes("quality")) return <IconShieldCheck className="h-5 w-5" />;
    if (stageLower.includes("storage")) return <IconPackage className="h-5 w-5" />;
    if (stageLower.includes("monitoring")) return <IconTemperature className="h-5 w-5" />;
    return <IconPackage className="h-5 w-5" />;
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "completed":
        return "bg-emerald-50 text-emerald-700 border-emerald-200";
      case "current":
        return "bg-blue-50 text-blue-700 border-blue-200";
      case "pending":
        return "bg-stone-50 text-stone-600 border-stone-200";
      default:
        return "bg-stone-50 text-stone-600 border-stone-200";
    }
  };

  const getGradeColor = (grade: "A" | "B" | "C") => {
    switch (grade) {
      case "A":
        return "bg-green-100 text-green-700";
      case "B":
        return "bg-yellow-100 text-yellow-700";
      case "C":
        return "bg-orange-100 text-orange-700";
    }
  };

  const formatDate = (timestamp: string) => {
    const date = new Date(timestamp);
    return date.toLocaleString("en-KE", {
      dateStyle: "medium",
      timeStyle: "short",
    });
  };

  const formatRelativeTime = (timestamp: string) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffMinutes = Math.floor(diffMs / (1000 * 60));

    if (diffDays > 0) return `${diffDays} day${diffDays > 1 ? "s" : ""} ago`;
    if (diffHours > 0) return `${diffHours} hour${diffHours > 1 ? "s" : ""} ago`;
    if (diffMinutes > 0) return `${diffMinutes} minute${diffMinutes > 1 ? "s" : ""} ago`;
    return "Just now";
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto p-0">
        <DialogHeader className="px-6 pt-6 pb-4 border-b border-stone-200 flex-shrink-0">
          <DialogTitle className="flex items-center gap-2 text-xl">
            <IconQrcode className="h-5 w-5 text-orange-600" />
            Batch Traceability History
          </DialogTitle>
          <DialogDescription>
            View complete history of produce from farm to current status
          </DialogDescription>
        </DialogHeader>

        <div className="px-6 py-4 space-y-4 flex-1 overflow-y-auto">
          {/* Search Section */}
          {!traceabilityInfo && (
            <Card className="bg-stone-50 border-stone-200">
              <CardContent className="p-4 space-y-4">
                <div className="flex gap-2">
                  <Input
                    placeholder="Enter Batch ID (e.g., BATCH-001, INV-2023-09)"
                    value={batchId}
                    onChange={(e) => setBatchId(e.target.value)}
                    onKeyPress={(e) => e.key === "Enter" && handleBatchIdLookup()}
                    className="flex-1"
                  />
                  <Button onClick={() => handleBatchIdLookup()} disabled={isLoading}>
                    {isLoading ? (
                      <IconLoader2 className="h-4 w-4 mr-2 animate-spin" />
                    ) : (
                      <IconSearch className="h-4 w-4 mr-2" />
                    )}
                    Lookup
                  </Button>
                  <Button variant="outline" onClick={handleQRScan}>
                    <IconQrcode className="h-4 w-4 mr-2" />
                    Scan QR
                  </Button>
                </div>

                {error && (
                  <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-800">
                    {error}
                  </div>
                )}

                {isLoading && (
                  <div className="text-center py-8">
                    <IconLoader2 className="h-8 w-8 animate-spin text-orange-600 mx-auto mb-2" />
                    <p className="text-sm text-stone-600">Looking up traceability information...</p>
                  </div>
                )}
              </CardContent>
            </Card>
          )}

          {/* Traceability Info */}
          {traceabilityInfo && (
            <div className="space-y-6">
              {/* Batch Summary */}
              <Card className="bg-gradient-to-br from-stone-50 to-stone-100 border-stone-200">
                <CardContent className="p-5">
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <h3 className="text-lg font-bold text-stone-900 mb-1">{traceabilityInfo.batchId}</h3>
                      <p className="text-sm text-stone-500">QR Code: {traceabilityInfo.qrCode || "N/A"}</p>
                    </div>
                    <Badge variant="outline" className={`${getGradeColor(traceabilityInfo.qualityGrade)} border-0 px-3 py-1`}>
                      Grade {traceabilityInfo.qualityGrade}
                    </Badge>
                  </div>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div>
                      <p className="text-xs font-semibold uppercase tracking-wider text-stone-500 mb-1">Variety</p>
                      <p className="font-semibold text-stone-900">{traceabilityInfo.variety}</p>
                    </div>
                    <div>
                      <p className="text-xs font-semibold uppercase tracking-wider text-stone-500 mb-1">Quantity</p>
                      <p className="font-semibold text-stone-900">{traceabilityInfo.quantity.toLocaleString()} kg</p>
                    </div>
                    <div>
                      <p className="text-xs font-semibold uppercase tracking-wider text-stone-500 mb-1">Current Status</p>
                      <p className="font-semibold text-stone-900">{traceabilityInfo.currentStatus}</p>
                    </div>
                    <div>
                      <p className="text-xs font-semibold uppercase tracking-wider text-stone-500 mb-1">Receipt ID</p>
                      <p className="font-semibold text-stone-900 font-mono text-xs">{traceabilityInfo.receiptId || "N/A"}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Farmer Information */}
              <Card className="border-stone-200">
                <CardContent className="p-5">
                  <h3 className="font-semibold text-stone-900 mb-4 flex items-center gap-2">
                    <IconUser className="h-5 w-5 text-orange-600" />
                    Farmer Information
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <p className="text-xs font-semibold uppercase tracking-wider text-stone-500 mb-1">Farmer Name</p>
                      <p className="font-medium text-stone-900">{traceabilityInfo.farmerName}</p>
                      <p className="text-xs text-stone-500 mt-1">ID: {traceabilityInfo.farmerId}</p>
                    </div>
                    <div>
                      <p className="text-xs font-semibold uppercase tracking-wider text-stone-500 mb-1">Location</p>
                      <p className="font-medium text-stone-900 flex items-center gap-1">
                        <IconMapPin className="h-3 w-3" />
                        {traceabilityInfo.farmerLocation}
                      </p>
                    </div>
                    {traceabilityInfo.farmerPhone && (
                      <div>
                        <p className="text-xs font-semibold uppercase tracking-wider text-stone-500 mb-1">Contact</p>
                        <p className="font-medium text-stone-900">{traceabilityInfo.farmerPhone}</p>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>

              {/* Aggregation Center Information */}
              <Card className="border-stone-200">
                <CardContent className="p-5">
                  <h3 className="font-semibold text-stone-900 mb-4 flex items-center gap-2">
                    <IconBuilding className="h-5 w-5 text-orange-600" />
                    Aggregation Center
                  </h3>
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium text-stone-900">{traceabilityInfo.aggregationCenter}</p>
                      {traceabilityInfo.aggregationCenterType && (
                        <Badge variant="outline" className="mt-2 text-xs">
                          {traceabilityInfo.aggregationCenterType === "main" ? "Main Center" : "Satellite Center"}
                        </Badge>
                      )}
                    </div>
                    {traceabilityInfo.currentLocation && (
                      <div className="text-right">
                        <p className="text-xs text-stone-500">Current Location</p>
                        <p className="text-sm font-medium text-stone-900">{traceabilityInfo.currentLocation}</p>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>

              {/* Traceability Timeline */}
              <div>
                <h3 className="font-semibold text-lg text-stone-900 mb-4 flex items-center gap-2">
                  <IconFileText className="h-5 w-5 text-orange-600" />
                  Complete Journey Timeline
                </h3>
                <div className="space-y-4">
                  {traceabilityInfo.steps.map((step, index) => (
                    <div key={step.id} className="relative">
                      {index < traceabilityInfo.steps.length - 1 && (
                        <div className="absolute left-6 top-12 bottom-0 w-0.5 bg-stone-200" />
                      )}
                      <div className="flex gap-4">
                        <div
                          className={`flex-shrink-0 w-12 h-12 rounded-full flex items-center justify-center border-2 ${
                            step.status === "completed"
                              ? "bg-emerald-100 border-emerald-300 text-emerald-700"
                              : step.status === "current"
                              ? "bg-blue-100 border-blue-300 text-blue-700"
                              : "bg-stone-100 border-stone-300 text-stone-500"
                          }`}
                        >
                          {getStageIcon(step.stage)}
                        </div>
                        <Card className={`flex-1 border-2 ${
                          step.status === "current" ? "border-blue-200 bg-blue-50/50" : "border-stone-200"
                        }`}>
                          <CardContent className="p-4">
                            <div className="flex items-start justify-between mb-3">
                              <div className="flex-1">
                                <h4 className="font-semibold text-stone-900 mb-1">{step.stage}</h4>
                                <p className="text-sm text-stone-600 flex items-center gap-1 mb-2">
                                  <IconMapPin className="h-3 w-3" />
                                  {step.location}
                                </p>
                              </div>
                              <Badge variant="outline" className={getStatusColor(step.status)}>
                                {step.status}
                              </Badge>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-3">
                              <div className="flex items-center gap-2 text-sm">
                                <IconUser className="h-4 w-4 text-stone-400" />
                                <span className="text-stone-600">Actor:</span>
                                <span className="font-medium text-stone-900">{step.actor}</span>
                                {step.actorRole && (
                                  <Badge variant="outline" className="text-xs ml-1">
                                    {step.actorRole}
                                  </Badge>
                                )}
                              </div>
                              <div className="flex items-center gap-2 text-sm">
                                <IconClock className="h-4 w-4 text-stone-400" />
                                <span className="text-stone-600">{formatRelativeTime(step.timestamp)}</span>
                                <span className="text-stone-400">•</span>
                                <span className="text-stone-500 text-xs">{formatDate(step.timestamp)}</span>
                              </div>
                            </div>

                            {step.metadata && (
                              <div className="flex flex-wrap gap-2 mb-3">
                                {step.metadata.quantity && (
                                  <Badge variant="outline" className="text-xs">
                                    <IconPackage className="h-3 w-3 mr-1" />
                                    {step.metadata.quantity} kg
                                  </Badge>
                                )}
                                {step.metadata.qualityGrade && (
                                  <Badge variant="outline" className={`text-xs ${getGradeColor(step.metadata.qualityGrade as "A" | "B" | "C")}`}>
                                    Grade {step.metadata.qualityGrade}
                                  </Badge>
                                )}
                                {step.metadata.temperature && (
                                  <Badge variant="outline" className="text-xs">
                                    <IconTemperature className="h-3 w-3 mr-1" />
                                    {step.metadata.temperature}
                                  </Badge>
                                )}
                                {step.metadata.humidity && (
                                  <Badge variant="outline" className="text-xs">
                                    Humidity: {step.metadata.humidity}
                                  </Badge>
                                )}
                                {step.metadata.duration && (
                                  <Badge variant="outline" className="text-xs">
                                    <IconClock className="h-3 w-3 mr-1" />
                                    {step.metadata.duration}
                                  </Badge>
                                )}
                              </div>
                            )}

                            {step.notes && (
                              <div className="mt-3 p-3 bg-stone-50 rounded-lg border border-stone-200">
                                <p className="text-sm text-stone-700">{step.notes}</p>
                              </div>
                            )}

                            {step.photos && step.photos.length > 0 && (
                              <div className="mt-3 flex gap-2">
                                {step.photos.map((photo, idx) => (
                                  <img
                                    key={idx}
                                    src={getImageFullUrl(photo)}
                                    alt={`${step.stage} photo ${idx + 1}`}
                                    className="w-16 h-16 rounded border border-stone-200 object-cover"
                                  />
                                ))}
                              </div>
                            )}
                          </CardContent>
                        </Card>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-2 pt-4 border-t border-stone-200">
                <Button
                  variant="outline"
                  onClick={() => {
                    setTraceabilityInfo(null);
                    setBatchId("");
                    setError(null);
                  }}
                  className="flex-1"
                >
                  <IconSearch className="h-4 w-4 mr-2" />
                  Lookup Another Batch
                </Button>
                <Button variant="outline" onClick={() => onOpenChange(false)}>
                  Close
                </Button>
              </div>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}

