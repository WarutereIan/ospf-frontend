import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { IconPackage, IconMapPin, IconTrendingUp } from "@tabler/icons-react";
import { HorizontalBarChart } from "@/components/visualizations";

interface VolumeByGrade {
  grade: string;
  quantity: number;
  location: string;
}

interface VolumeByLocation {
  location: string;
  totalQuantity: number;
  gradeA: number;
  gradeB: number;
  gradeC: number;
}

interface AvailableVolumesDashboardProps {
  volumesByGrade: VolumeByGrade[];
  volumesByLocation: VolumeByLocation[];
  selectedLocation?: string;
  onLocationChange?: (location: string) => void;
}

export function AvailableVolumesDashboard({
  volumesByGrade,
  volumesByLocation,
  selectedLocation = "all",
  onLocationChange,
}: AvailableVolumesDashboardProps) {
  const filteredVolumes = selectedLocation === "all" 
    ? volumesByGrade 
    : volumesByGrade.filter(v => v.location.toLowerCase() === selectedLocation.toLowerCase());

  // Group by grade
  const gradeBreakdown = filteredVolumes.reduce((acc, vol) => {
    if (!acc[vol.grade]) {
      acc[vol.grade] = 0;
    }
    acc[vol.grade] += vol.quantity;
    return acc;
  }, {} as Record<string, number>);

  const gradeData = Object.entries(gradeBreakdown).map(([grade, quantity]) => ({
    name: `Grade ${grade}`,
    value: quantity,
  }));

  const locationData = volumesByLocation.map(loc => ({
    name: loc.location,
    value: loc.totalQuantity,
  }));

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

  const totalAvailable = filteredVolumes.reduce((sum, vol) => sum + vol.quantity, 0);

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Total Available</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalAvailable.toLocaleString()} kg</div>
            <p className="text-xs text-muted-foreground mt-1">
              Across all grades and locations
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Grade A Available</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {gradeBreakdown["A"]?.toLocaleString() || 0} kg
            </div>
            <p className="text-xs text-muted-foreground mt-1">Premium quality</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Locations</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{volumesByLocation.length}</div>
            <p className="text-xs text-muted-foreground mt-1">Aggregation centres</p>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle>Available Volumes by Grade and Location</CardTitle>
          <CardDescription>
            View available OFSP produce volumes filtered by location
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="mb-4">
            <Select value={selectedLocation} onValueChange={onLocationChange}>
              <SelectTrigger className="w-full md:w-[250px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Locations</SelectItem>
                {volumesByLocation.map((loc) => (
                  <SelectItem key={loc.location} value={loc.location.toLowerCase()}>
                    {loc.location}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Volume by Grade Chart */}
          <div className="mb-6">
            <HorizontalBarChart
              data={gradeData}
              title="Available Volumes by Grade"
              description={`Total: ${totalAvailable.toLocaleString()} kg`}
              color="#3B82F6"
              height={200}
            />
          </div>

          {/* Volume by Location Chart */}
          <div className="mb-6">
            <HorizontalBarChart
              data={locationData}
              title="Available Volumes by Location"
              description="Distribution across aggregation centres"
              color="#22C55E"
              height={250}
            />
          </div>

          {/* Detailed Breakdown */}
          <div className="space-y-4">
            <h3 className="font-semibold text-lg">Detailed Breakdown</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {volumesByLocation.map((loc) => (
                <Card key={loc.location}>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-base flex items-center gap-2">
                      <IconMapPin className="h-4 w-4 text-primary" />
                      {loc.location}
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-muted-foreground">Total:</span>
                        <span className="font-semibold">{loc.totalQuantity.toLocaleString()} kg</span>
                      </div>
                      <div className="space-y-2">
                        <div className="flex justify-between items-center">
                          <Badge variant="outline" className="bg-green-100 text-green-800 border-green-300">
                            Grade A
                          </Badge>
                          <span className="text-sm font-medium">{loc.gradeA.toLocaleString()} kg</span>
                        </div>
                        <div className="flex justify-between items-center">
                          <Badge variant="outline" className="bg-yellow-100 text-yellow-800 border-yellow-300">
                            Grade B
                          </Badge>
                          <span className="text-sm font-medium">{loc.gradeB.toLocaleString()} kg</span>
                        </div>
                        <div className="flex justify-between items-center">
                          <Badge variant="outline" className="bg-orange-100 text-orange-800 border-orange-300">
                            Grade C
                          </Badge>
                          <span className="text-sm font-medium">{loc.gradeC.toLocaleString()} kg</span>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

