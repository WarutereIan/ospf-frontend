import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  IconQrcode,
  IconSearch,
  IconMapPin,
  IconPackage,
  IconCheck,
  IconClock,
  IconUser,
  IconBuilding,
} from "@tabler/icons-react";
import { useState } from "react";

interface TraceabilityStep {
  stage: string;
  location: string;
  timestamp: string;
  actor: string;
  status: "completed" | "pending" | "current";
  notes?: string;
}

interface TraceabilityInfo {
  batchId: string;
  qrCode?: string;
  variety: string;
  quantity: number;
  qualityGrade: string;
  farmerName: string;
  farmerLocation: string;
  aggregationCenter: string;
  steps: TraceabilityStep[];
}

interface TraceabilityViewerProps {
  onLookup?: (batchId: string) => Promise<TraceabilityInfo | null>;
}

export function TraceabilityViewer({ onLookup }: TraceabilityViewerProps) {
  const [batchId, setBatchId] = useState("");
  const [qrCode, setQrCode] = useState("");
  const [traceabilityInfo, setTraceabilityInfo] = useState<TraceabilityInfo | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleBatchIdLookup = async () => {
    if (!batchId.trim()) {
      setError("Please enter a batch ID");
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      if (onLookup) {
        const result = await onLookup(batchId);
        if (result) {
          setTraceabilityInfo(result);
        } else {
          setError("Batch ID not found. Please check and try again.");
        }
      } else {
        // Mock lookup for demonstration
        setTimeout(() => {
          setTraceabilityInfo({
            batchId: batchId,
            variety: "Kenya",
            quantity: 500,
            qualityGrade: "A",
            farmerName: "James Mutua",
            farmerLocation: "Kangundo Subcounty",
            aggregationCenter: "Kangundo Main Aggregation Center",
            steps: [
              {
                stage: "Harvest",
                location: "James Mutua's Farm",
                timestamp: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
                actor: "James Mutua",
                status: "completed",
                notes: "OFSP roots harvested according to recommended practices",
              },
              {
                stage: "On-Farm Sorting",
                location: "James Mutua's Farm",
                timestamp: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
                actor: "James Mutua",
                status: "completed",
                notes: "Damaged and spoiled produce removed",
              },
              {
                stage: "At Aggregation Center",
                location: "Kangundo Main Aggregation Center",
                timestamp: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
                actor: "Aggregation Manager",
                status: "completed",
                notes: "Produce received and quality checked",
              },
              {
                stage: "Quality Approved",
                location: "Kangundo Main Aggregation Center",
                timestamp: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
                actor: "Quality Officer",
                status: "completed",
                notes: "Grade A quality confirmed",
              },
            ],
          });
          setIsLoading(false);
        }, 1000);
      }
    } catch (err) {
      setError("Error looking up batch ID. Please try again.");
      setIsLoading(false);
    }
  };

  const handleQRScan = () => {
    // TODO: Implement QR code scanning
    alert("QR code scanning will be implemented with camera access");
  };

  const getStageIcon = (stage: string) => {
    switch (stage.toLowerCase()) {
      case "harvest":
        return <IconPackage className="h-5 w-5" />;
      case "on-farm sorting":
        return <IconCheck className="h-5 w-5" />;
      case "at aggregation center":
        return <IconBuilding className="h-5 w-5" />;
      case "quality approved":
        return <IconCheck className="h-5 w-5" />;
      default:
        return <IconClock className="h-5 w-5" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "completed":
        return "bg-green-100 text-green-800 border-green-300";
      case "current":
        return "bg-blue-100 text-blue-800 border-blue-300";
      case "pending":
        return "bg-gray-100 text-gray-800 border-gray-300";
      default:
        return "bg-gray-100 text-gray-800 border-gray-300";
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <IconQrcode className="h-5 w-5" />
            Traceability Lookup
          </CardTitle>
          <CardDescription>
            Track produce using QR code or batch ID for full traceability
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {/* QR Code Scan */}
            <div>
              <label className="text-sm font-medium mb-2 block">Scan QR Code</label>
              <Button onClick={handleQRScan} className="w-full" variant="outline">
                <IconQrcode className="mr-2 h-4 w-4" />
                Scan QR Code
              </Button>
            </div>

            {/* Batch ID Lookup */}
            <div>
              <label className="text-sm font-medium mb-2 block">Or Enter Batch ID</label>
              <div className="flex gap-2">
                <Input
                  placeholder="Enter batch ID (e.g., BATCH-001)"
                  value={batchId}
                  onChange={(e) => setBatchId(e.target.value)}
                  onKeyPress={(e) => e.key === "Enter" && handleBatchIdLookup()}
                />
                <Button onClick={handleBatchIdLookup} disabled={isLoading}>
                  <IconSearch className="h-4 w-4 mr-2" />
                  Lookup
                </Button>
              </div>
            </div>

            {error && (
              <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-800">
                {error}
              </div>
            )}

            {isLoading && (
              <div className="text-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
                <p className="text-sm text-muted-foreground mt-2">Looking up traceability information...</p>
              </div>
            )}

            {traceabilityInfo && (
              <div className="space-y-6 mt-6">
                {/* Batch Info */}
                <div className="p-4 bg-muted rounded-lg">
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div>
                      <p className="text-xs text-muted-foreground">Batch ID</p>
                      <p className="font-semibold">{traceabilityInfo.batchId}</p>
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground">Variety</p>
                      <p className="font-semibold">{traceabilityInfo.variety}</p>
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground">Quantity</p>
                      <p className="font-semibold">{traceabilityInfo.quantity} kg</p>
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground">Quality Grade</p>
                      <Badge variant="outline">Grade {traceabilityInfo.qualityGrade}</Badge>
                    </div>
                  </div>
                </div>

                {/* Farmer Info */}
                <div className="p-4 border rounded-lg">
                  <h3 className="font-semibold mb-3 flex items-center gap-2">
                    <IconUser className="h-4 w-4" />
                    Farmer Information
                  </h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm text-muted-foreground">Name</p>
                      <p className="font-medium">{traceabilityInfo.farmerName}</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Location</p>
                      <p className="font-medium">{traceabilityInfo.farmerLocation}</p>
                    </div>
                  </div>
                </div>

                {/* Traceability Steps */}
                <div className="space-y-4">
                  <h3 className="font-semibold text-lg">Traceability Journey</h3>
                  {traceabilityInfo.steps.map((step, index) => (
                    <div key={index} className="relative">
                      {index < traceabilityInfo.steps.length - 1 && (
                        <div className="absolute left-6 top-12 bottom-0 w-0.5 bg-border" />
                      )}
                      <div className="flex gap-4">
                        <div
                          className={`flex-shrink-0 w-12 h-12 rounded-full flex items-center justify-center border-2 ${
                            step.status === "completed"
                              ? "bg-green-100 border-green-300 text-green-800"
                              : step.status === "current"
                              ? "bg-blue-100 border-blue-300 text-blue-800"
                              : "bg-gray-100 border-gray-300 text-gray-500"
                          }`}
                        >
                          {getStageIcon(step.stage)}
                        </div>
                        <div className="flex-1 pb-6">
                          <div className="flex items-start justify-between mb-2">
                            <div>
                              <h4 className="font-semibold">{step.stage}</h4>
                              <p className="text-sm text-muted-foreground flex items-center gap-1 mt-1">
                                <IconMapPin className="h-3 w-3" />
                                {step.location}
                              </p>
                            </div>
                            <Badge variant="outline" className={getStatusColor(step.status)}>
                              {step.status}
                            </Badge>
                          </div>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm">
                            <div className="flex items-center gap-2">
                              <IconUser className="h-4 w-4 text-muted-foreground" />
                              <span className="text-muted-foreground">Actor:</span>
                              <span className="font-medium">{step.actor}</span>
                            </div>
                            <div className="flex items-center gap-2">
                              <IconClock className="h-4 w-4 text-muted-foreground" />
                              <span className="text-muted-foreground">Time:</span>
                              <span className="font-medium">
                                {new Date(step.timestamp).toLocaleString("en-KE", {
                                  dateStyle: "short",
                                  timeStyle: "short",
                                })}
                              </span>
                            </div>
                          </div>
                          {step.notes && (
                            <div className="mt-2 p-2 bg-muted rounded text-sm">
                              <span className="text-muted-foreground">Note: </span>
                              {step.notes}
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

