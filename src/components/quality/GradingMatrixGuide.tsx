import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import {
  IconWeight,
  IconPalette,
  IconShieldCheck,
  IconClock,
  IconInfoCircle,
} from "@tabler/icons-react";
import {
  weightRangeDefinitions,
  colorIntensityDefinitions,
  physicalConditionDefinitions,
  freshnessDefinitions,
} from "@/data/gradingMatrix";
import { cn } from "@/lib/utils";

export function GradingMatrixGuide() {
  return (
    <div className="space-y-4 sm:space-y-6">
      <div>
        <h2 className="text-lg sm:text-xl font-bold mb-2">Grading Matrix</h2>
        <p className="text-stone-600 text-xs sm:text-sm">
          The grading matrix uses four key criteria to determine quality grades (A, B, C) for OFSP produce.
          All criteria must be assessed to assign the appropriate grade.
        </p>
      </div>

      {/* Weight Ranges */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <IconWeight className="h-5 w-5 text-primary" />
            1. Weight Ranges
          </CardTitle>
          <CardDescription>
            Categorization of the root tubers by size and weight
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="min-w-[120px]">Category</TableHead>
                  <TableHead className="min-w-[180px]">Description</TableHead>
                  <TableHead className="min-w-[150px]">Weight Range</TableHead>
                  <TableHead className="min-w-[140px]">Grade Support</TableHead>
                </TableRow>
              </TableHeader>
            <TableBody>
              {weightRangeDefinitions.map((def) => (
                <TableRow key={def.value}>
                  <TableCell className="font-medium">{def.label}</TableCell>
                  <TableCell>{def.description}</TableCell>
                  <TableCell>
                    {def.minWeight !== undefined && def.maxWeight !== undefined
                      ? `${def.minWeight}g - ${def.maxWeight}g`
                      : def.minWeight !== undefined
                      ? `> ${def.minWeight}g`
                      : "-"}
                  </TableCell>
                  <TableCell>
                    <div className="flex gap-1">
                      {def.gradeMapping.A && (
                        <Badge className="bg-green-100 text-green-800">A</Badge>
                      )}
                      {def.gradeMapping.B && (
                        <Badge className="bg-yellow-100 text-yellow-800">B</Badge>
                      )}
                      {def.gradeMapping.C && (
                        <Badge className="bg-orange-100 text-orange-800">C</Badge>
                      )}
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
          </div>
        </CardContent>
      </Card>

      {/* Color Intensity */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <IconPalette className="h-5 w-5 text-primary" />
            2. Color Intensity
          </CardTitle>
          <CardDescription>
            Orange flesh depth as quality indicator (Scale: 1-10)
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="min-w-[80px]">Score</TableHead>
                  <TableHead className="min-w-[120px]">Label</TableHead>
                  <TableHead className="min-w-[180px]">Description</TableHead>
                  <TableHead className="min-w-[140px]">Grade Support</TableHead>
                </TableRow>
              </TableHeader>
            <TableBody>
              {colorIntensityDefinitions.map((def) => (
                <TableRow key={def.score}>
                  <TableCell className="font-medium">{def.score}/10</TableCell>
                  <TableCell>{def.label}</TableCell>
                  <TableCell>{def.description}</TableCell>
                  <TableCell>
                    <div className="flex gap-1">
                      {def.gradeMapping.A && (
                        <Badge className="bg-green-100 text-green-800">A</Badge>
                      )}
                      {def.gradeMapping.B && (
                        <Badge className="bg-yellow-100 text-yellow-800">B</Badge>
                      )}
                      {def.gradeMapping.C && (
                        <Badge className="bg-orange-100 text-orange-800">C</Badge>
                      )}
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
          </div>
        </CardContent>
      </Card>

      {/* Physical Condition */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <IconShieldCheck className="h-5 w-5 text-primary" />
            3. Physical Condition
          </CardTitle>
          <CardDescription>
            Absence of rot, cuts, pest damage
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="min-w-[120px]">Condition</TableHead>
                  <TableHead className="min-w-[300px]">Description</TableHead>
                  <TableHead className="min-w-[140px]">Grade Support</TableHead>
                </TableRow>
              </TableHeader>
            <TableBody>
              {physicalConditionDefinitions.map((def) => (
                <TableRow key={def.value}>
                  <TableCell className="font-medium">{def.label}</TableCell>
                  <TableCell>{def.description}</TableCell>
                  <TableCell>
                    <div className="flex gap-1">
                      {def.gradeMapping.A && (
                        <Badge className="bg-green-100 text-green-800">A</Badge>
                      )}
                      {def.gradeMapping.B && (
                        <Badge className="bg-yellow-100 text-yellow-800">B</Badge>
                      )}
                      {def.gradeMapping.C && (
                        <Badge className="bg-orange-100 text-orange-800">C</Badge>
                      )}
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
          </div>
        </CardContent>
      </Card>

      {/* Freshness */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <IconClock className="h-5 w-5 text-primary" />
            4. Freshness
          </CardTitle>
          <CardDescription>
            Maturity and time since harvest
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="min-w-[120px]">Level</TableHead>
                  <TableHead className="min-w-[200px]">Description</TableHead>
                  <TableHead className="min-w-[180px]">Days Since Harvest</TableHead>
                  <TableHead className="min-w-[140px]">Grade Support</TableHead>
                </TableRow>
              </TableHeader>
            <TableBody>
              {freshnessDefinitions.map((def) => (
                <TableRow key={def.value}>
                  <TableCell className="font-medium">{def.label}</TableCell>
                  <TableCell>{def.description}</TableCell>
                  <TableCell>
                    {def.daysSinceHarvest?.min !== undefined && def.daysSinceHarvest?.max !== undefined
                      ? `${def.daysSinceHarvest.min}-${def.daysSinceHarvest.max} days`
                      : def.daysSinceHarvest?.min !== undefined
                      ? `> ${def.daysSinceHarvest.min} days`
                      : "-"}
                  </TableCell>
                  <TableCell>
                    <div className="flex gap-1">
                      {def.gradeMapping.A && (
                        <Badge className="bg-green-100 text-green-800">A</Badge>
                      )}
                      {def.gradeMapping.B && (
                        <Badge className="bg-yellow-100 text-yellow-800">B</Badge>
                      )}
                      {def.gradeMapping.C && (
                        <Badge className="bg-orange-100 text-orange-800">C</Badge>
                      )}
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
          </div>
        </CardContent>
      </Card>

      {/* Grade Determination Logic */}
      <Card className="bg-blue-50 border-blue-200">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <IconInfoCircle className="h-5 w-5 text-blue-600" />
            Grade Determination Logic
          </CardTitle>
          <CardDescription>
            How the matrix criteria combine to determine final grade
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-3 text-sm">
          <div>
            <p className="font-semibold mb-2">Grade A (Premium):</p>
            <p className="text-stone-700">
              All four criteria must support Grade A. Requires medium/large weight, high color intensity (6+), 
              excellent/good physical condition, and very fresh/fresh produce.
            </p>
          </div>
          <div>
            <p className="font-semibold mb-2">Grade B (Standard):</p>
            <p className="text-stone-700">
              At least 3 criteria support Grade B, with at least 2 supporting Grade A. Accepts wider range 
              of weight, moderate color intensity (3+), good/fair physical condition, and fresh/moderate freshness.
            </p>
          </div>
          <div>
            <p className="font-semibold mb-2">Grade C (Processing):</p>
            <p className="text-stone-700">
              At least 2 criteria support Grade C. Includes smaller weights, lower color intensity, fair/poor 
              physical condition, or aging produce. Suitable for processing rather than direct consumption.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
