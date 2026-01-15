import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ProgressBar } from "@/components/visualizations";
import { IconCheck, IconX, IconAlertCircle, IconStar } from "@tabler/icons-react";

interface QualityCriteria {
  name: string;
  score: number;
  maxScore: number;
  feedback: string;
  passed: boolean;
}

interface QualityFeedbackProps {
  orderId: string;
  qualityGrade: string;
  overallScore: number;
  criteria: QualityCriteria[];
  feedbackNotes?: string;
  inspectorName?: string;
  inspectionDate: string;
}

export function QualityFeedback({
  orderId,
  qualityGrade,
  overallScore,
  criteria,
  feedbackNotes,
  inspectorName,
  inspectionDate,
}: QualityFeedbackProps) {
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
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2 text-xl">
              <IconStar className="h-6 w-6 text-primary" />
              Quality Feedback & Grading
            </CardTitle>
            <CardDescription className="text-base">
              Detailed feedback on your produce quality. Order ID: {orderId}
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
                        <IconX className="h-5 w-5 text-red-600" />
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

          {/* Feedback Notes */}
          {feedbackNotes && (
            <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
              <div className="flex items-start gap-2">
                <IconAlertCircle className="h-5 w-5 text-blue-600 mt-0.5 flex-shrink-0" />
                <div>
                  <h4 className="font-semibold text-base mb-1">Additional Feedback</h4>
                  <p className="text-sm text-muted-foreground leading-relaxed">{feedbackNotes}</p>
                </div>
              </div>
            </div>
          )}

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

          {/* Grade Explanation */}
          <div className={`p-4 rounded-lg border-2 ${getGradeColor(qualityGrade)}`}>
            <h4 className="font-semibold text-base mb-2">What Grade {qualityGrade} Means:</h4>
            {qualityGrade === "A" && (
              <p className="text-sm">
                Premium quality produce. Excellent appearance, size, and condition. Commands the
                highest market price.
              </p>
            )}
            {qualityGrade === "B" && (
              <p className="text-sm">
                Standard quality produce. Good condition with minor blemishes. Suitable for fresh
                market consumption.
              </p>
            )}
            {qualityGrade === "C" && (
              <p className="text-sm">
                Processing quality produce. Some damage or size variation acceptable. Best suited
                for value-added products.
              </p>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

