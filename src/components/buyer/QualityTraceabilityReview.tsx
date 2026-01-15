import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  IconStar,
  IconCheck,
  IconAlertCircle,
  IconQrcode,
  IconDownload,
  IconMapPin,
} from "@tabler/icons-react";
import { ProgressBar } from "@/components/visualizations";
import { TraceabilityViewer } from "./TraceabilityViewer";

interface QualityCriteria {
  name: string;
  score: number;
  maxScore: number;
  feedback: string;
  passed: boolean;
}

interface QualityTraceabilityReviewProps {
  orderId: string;
  batchId: string;
  qualityGrade: string;
  overallScore: number;
  criteria: QualityCriteria[];
  farmerName: string;
  farmerLocation: string;
  aggregationCenter: string;
  inspectionDate: string;
  inspectorName?: string;
  qrCode?: string;
  onDownloadReport?: () => void;
}

export function QualityTraceabilityReview({
  orderId,
  batchId,
  qualityGrade,
  overallScore,
  criteria,
  farmerName,
  farmerLocation,
  aggregationCenter,
  inspectionDate,
  inspectorName,
  qrCode,
  onDownloadReport,
}: QualityTraceabilityReviewProps) {
  const getGradeColor = (grade: string) => {
    switch (grade) {
      case "A":
        return "bg-green-100 text-green-800 border-green-300";
      case "B":
        return "bg-yellow-100 text-yellow-800 border-yellow-300";
      case "C":
        return "bg-orange-100 text-orange-800 border-orange-300";
      default:
        return "bg-gray-100 text-gray-800 border-gray-300";
    }
  };

  const getScoreColor = (score: number) => {
    if (score >= 90) return "text-green-600";
    if (score >= 75) return "text-yellow-600";
    return "text-orange-600";
  };

  return (
    <div className="space-y-6">
      {/* Quality Information */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <IconStar className="h-5 w-5 text-primary" />
                Quality and Grading Information
              </CardTitle>
              <CardDescription>
                Detailed quality assessment for Order #{orderId}
              </CardDescription>
            </div>
            <Badge variant="outline" className={`text-lg px-4 py-2 ${getGradeColor(qualityGrade)}`}>
              Grade {qualityGrade}
            </Badge>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            {/* Overall Score */}
            <div className="p-6 bg-muted rounded-lg">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="text-lg font-semibold mb-1">Overall Quality Score</h3>
                  <p className="text-sm text-muted-foreground">Based on all quality criteria</p>
                </div>
                <div className="text-right">
                  <p className={`text-4xl font-bold ${getScoreColor(overallScore)}`}>
                    {overallScore}%
                  </p>
                  <p className="text-sm text-muted-foreground">out of 100</p>
                </div>
              </div>
              <ProgressBar
                value={overallScore}
                maxValue={100}
                color={overallScore >= 90 ? "success" : overallScore >= 75 ? "warning" : "danger"}
                size="lg"
                showValue={false}
              />
            </div>

            {/* Quality Criteria */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Quality Criteria Assessment</h3>
              {criteria.map((criterion, index) => (
                <div key={index} className="p-4 border rounded-lg">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <h4 className="font-semibold text-base">{criterion.name}</h4>
                        {criterion.passed ? (
                          <IconCheck className="h-5 w-5 text-green-600" />
                        ) : (
                          <IconAlertCircle className="h-5 w-5 text-orange-600" />
                        )}
                      </div>
                      <p className="text-sm text-muted-foreground mb-2">{criterion.feedback}</p>
                    </div>
                    <div className="text-right ml-4">
                      <p className="text-lg font-semibold">
                        {criterion.score}/{criterion.maxScore}
                      </p>
                      <p className="text-xs text-muted-foreground">points</p>
                    </div>
                  </div>
                  <ProgressBar
                    value={(criterion.score / criterion.maxScore) * 100}
                    maxValue={100}
                    color={criterion.passed ? "success" : "warning"}
                    size="sm"
                    showValue={false}
                  />
                </div>
              ))}
            </div>

            {/* Inspection Details */}
            <div className="grid grid-cols-2 gap-4 p-4 bg-muted rounded-lg text-sm">
              <div>
                <p className="text-muted-foreground mb-1">Inspected By</p>
                <p className="font-semibold">{inspectorName || "Quality Officer"}</p>
              </div>
              <div>
                <p className="text-muted-foreground mb-1">Inspection Date</p>
                <p className="font-semibold">
                  {new Date(inspectionDate).toLocaleDateString("en-KE", {
                    year: "numeric",
                    month: "long",
                    day: "numeric",
                  })}
                </p>
              </div>
            </div>

            {/* Batch Information */}
            <div className="p-4 border rounded-lg">
              <div className="flex items-center justify-between mb-3">
                <h4 className="font-semibold flex items-center gap-2">
                  <IconQrcode className="h-4 w-4" />
                  Batch Information
                </h4>
                {qrCode && (
                  <Badge variant="outline" className="bg-blue-50 text-blue-800">
                    QR Code Available
                  </Badge>
                )}
              </div>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="text-muted-foreground">Batch ID</p>
                  <p className="font-semibold">{batchId}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Aggregation Center</p>
                  <p className="font-semibold">{aggregationCenter}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Farmer</p>
                  <p className="font-semibold">{farmerName}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Farmer Location</p>
                  <p className="font-semibold flex items-center gap-1">
                    <IconMapPin className="h-3 w-3" />
                    {farmerLocation}
                  </p>
                </div>
              </div>
            </div>

            {/* Download Report */}
            {onDownloadReport && (
              <Button onClick={onDownloadReport} variant="outline" className="w-full">
                <IconDownload className="mr-2 h-4 w-4" />
                Download Quality Report
              </Button>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Traceability Viewer */}
      <TraceabilityViewer />
    </div>
  );
}

