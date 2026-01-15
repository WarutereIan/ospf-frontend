import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { IconCheck, IconX, IconAlertTriangle, IconInfoCircle } from "@tabler/icons-react";

interface SortingChecklistItem {
  id: string;
  title: string;
  description: string;
  action: string;
}

export function OnFarmSortingGuide() {
  const checklistItems: SortingChecklistItem[] = [
    {
      id: "1",
      title: "Remove Damaged Roots",
      description: "Check for cuts, bruises, or broken roots",
      action: "Discard any roots with visible damage",
    },
    {
      id: "2",
      title: "Remove Spoiled Roots",
      description: "Look for soft spots, mold, or rot",
      action: "Separate and discard spoiled produce",
    },
    {
      id: "3",
      title: "Remove Overly Small Roots",
      description: "Roots should be at least 5cm in length",
      action: "Set aside small roots for home use",
    },
    {
      id: "4",
      title: "Remove Overly Large Roots",
      description: "Very large roots may be difficult to handle",
      action: "Separate for processing or home use",
    },
    {
      id: "5",
      title: "Check for Pests",
      description: "Look for signs of insect damage or holes",
      action: "Remove any roots with pest damage",
    },
    {
      id: "6",
      title: "Clean Roots",
      description: "Gently brush off excess soil",
      action: "Do not wash - only remove loose soil",
    },
    {
      id: "7",
      title: "Grade Your Produce",
      description: "Separate into Grade A, B, or C",
      action: "Grade A: Perfect, Grade B: Minor issues, Grade C: Processing quality",
    },
  ];

  const qualityGrades = [
    {
      grade: "A",
      color: "bg-green-100 text-green-800 border-green-300",
      description: "Premium Quality",
      criteria: ["No damage", "Uniform size", "Clean appearance", "No pests"],
    },
    {
      grade: "B",
      color: "bg-yellow-100 text-yellow-800 border-yellow-300",
      description: "Standard Quality",
      criteria: ["Minor blemishes", "Slight size variation", "Generally good condition"],
    },
    {
      grade: "C",
      color: "bg-orange-100 text-orange-800 border-orange-300",
      description: "Processing Quality",
      criteria: ["Some damage acceptable", "Variable sizes", "Suitable for processing"],
    },
  ];

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-xl">
            <IconInfoCircle className="h-6 w-6 text-primary" />
            On-Farm Sorting Guide
          </CardTitle>
          <CardDescription className="text-base">
            Follow these steps to prepare your OFSP roots for delivery to the aggregation center
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {checklistItems.map((item, index) => (
              <div
                key={item.id}
                className="flex gap-4 p-4 border rounded-lg hover:bg-muted/50 transition-colors"
              >
                <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                  <span className="font-semibold text-primary">{index + 1}</span>
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold text-lg mb-1">{item.title}</h3>
                  <p className="text-muted-foreground mb-2">{item.description}</p>
                  <div className="flex items-center gap-2 text-sm">
                    <IconCheck className="h-4 w-4 text-green-600" />
                    <span className="font-medium">{item.action}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-xl">Quality Grading</CardTitle>
          <CardDescription className="text-base">
            Understand how to grade your produce for better pricing
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {qualityGrades.map((grade) => (
              <div key={grade.grade} className="p-4 border rounded-lg">
                <div className="flex items-center justify-between mb-3">
                  <Badge variant="outline" className={grade.color}>
                    Grade {grade.grade}
                  </Badge>
                  <span className="text-sm font-medium">{grade.description}</span>
                </div>
                <ul className="space-y-2">
                  {grade.criteria.map((criterion, index) => (
                    <li key={index} className="flex items-start gap-2 text-sm">
                      <IconCheck className="h-4 w-4 text-green-600 mt-0.5 flex-shrink-0" />
                      <span>{criterion}</span>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <Card className="border-orange-200 bg-orange-50">
        <CardContent className="pt-6">
          <div className="flex gap-3">
            <IconAlertTriangle className="h-6 w-6 text-orange-600 flex-shrink-0" />
            <div>
              <h3 className="font-semibold text-lg mb-2">Important Reminders</h3>
              <ul className="space-y-2 text-sm">
                <li className="flex items-start gap-2">
                  <IconX className="h-4 w-4 text-red-600 mt-0.5 flex-shrink-0" />
                  <span>Do not wash roots with water - only remove loose soil</span>
                </li>
                <li className="flex items-start gap-2">
                  <IconX className="h-4 w-4 text-red-600 mt-0.5 flex-shrink-0" />
                  <span>Handle roots gently to avoid bruising</span>
                </li>
                <li className="flex items-start gap-2">
                  <IconCheck className="h-4 w-4 text-green-600 mt-0.5 flex-shrink-0" />
                  <span>Sort in a clean, dry area</span>
                </li>
                <li className="flex items-start gap-2">
                  <IconCheck className="h-4 w-4 text-green-600 mt-0.5 flex-shrink-0" />
                  <span>Complete sorting before loading for transport</span>
                </li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

