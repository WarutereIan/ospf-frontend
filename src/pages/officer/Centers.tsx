import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  IconMapPin,
  IconPackage,
  IconUsers,
  IconTrendingUp,
  IconTrendingDown,
  IconEdit,
  IconAlertTriangle,
  IconDownload,
  IconBuilding,
  IconBuildingCommunity,
} from "@tabler/icons-react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface AggregationCenter {
  id: string;
  name: string;
  location: string;
  subCounty: string;
  ward?: string; // For satellite centers
  centerType: "main" | "satellite";
  mainCenterId?: string; // For satellite centers to link to their main center
  manager: string;
  currentStock: number;
  capacity: number;
  activeFarmers: number;
  status: "operational" | "maintenance" | "closed";
  stockInToday: number;
  stockOutToday: number;
  alerts: string[];
}

export function Centers() {
  const [centers, setCenters] = useState<AggregationCenter[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [centerFilter, setCenterFilter] = useState<"all" | "main" | "satellite">("all");
  const [totalStats, setTotalStats] = useState({
    totalCenters: 0,
    mainCenters: 0,
    satelliteCenters: 0,
    totalStock: 0,
    totalCapacity: 0,
    stockInToday: 0,
    stockOutToday: 0,
  });
  
  const filteredCenters = centers.filter((center) => {
    if (centerFilter === "all") return true;
    return center.centerType === centerFilter;
  });

  useEffect(() => {
    // TODO: Replace with actual API calls
    setTimeout(() => {
      const allCenters = [
        // MAIN CENTERS (Subcounty Level)
        {
          id: "AC001",
          name: "Kangundo Main Aggregation Center",
          location: "Kangundo Town",
          subCounty: "Kangundo",
          centerType: "main" as const,
          manager: "Peter Kariuki",
          currentStock: 5000,
          capacity: 10000,
          activeFarmers: 45,
          status: "operational" as const,
          stockInToday: 1200,
          stockOutToday: 800,
          alerts: [],
        },
        {
          id: "AC002",
          name: "Kathiani Main Aggregation Center",
          location: "Kathiani Market",
          subCounty: "Kathiani",
          centerType: "main" as const,
          manager: "Jane Muthoni",
          currentStock: 3200,
          capacity: 8000,
          activeFarmers: 32,
          status: "operational" as const,
          stockInToday: 800,
          stockOutToday: 500,
          alerts: [],
        },
        {
          id: "AC003",
          name: "Matungulu Main Aggregation Center",
          location: "Matungulu Town",
          subCounty: "Matungulu",
          centerType: "main" as const,
          manager: "David Kimani",
          currentStock: 2500,
          capacity: 7000,
          activeFarmers: 28,
          status: "operational" as const,
          stockInToday: 600,
          stockOutToday: 400,
          alerts: [],
        },
        {
          id: "AC004",
          name: "Yatta Main Aggregation Center",
          location: "Yatta Market",
          subCounty: "Yatta",
          centerType: "main" as const,
          manager: "Grace Wambui",
          currentStock: 1800,
          capacity: 6000,
          activeFarmers: 22,
          status: "operational" as const,
          stockInToday: 500,
          stockOutToday: 300,
          alerts: [],
        },
        
        // SATELLITE CENTERS (Ward Level)
        {
          id: "SAT001",
          name: "Kangundo East Satellite Center",
          location: "Kangundo East Ward",
          subCounty: "Kangundo",
          ward: "Kangundo East",
          centerType: "satellite" as const,
          mainCenterId: "AC001",
          manager: "John Mwangi",
          currentStock: 800,
          capacity: 2000,
          activeFarmers: 15,
          status: "operational" as const,
          stockInToday: 250,
          stockOutToday: 150,
          alerts: [],
        },
        {
          id: "SAT002",
          name: "Kangundo West Satellite Center",
          location: "Kangundo West Ward",
          subCounty: "Kangundo",
          ward: "Kangundo West",
          centerType: "satellite" as const,
          mainCenterId: "AC001",
          manager: "Mary Njoki",
          currentStock: 600,
          capacity: 1500,
          activeFarmers: 12,
          status: "operational" as const,
          stockInToday: 200,
          stockOutToday: 100,
          alerts: [],
        },
        {
          id: "SAT003",
          name: "Kathiani Central Satellite Center",
          location: "Kathiani Central Ward",
          subCounty: "Kathiani",
          ward: "Kathiani Central",
          centerType: "satellite" as const,
          mainCenterId: "AC002",
          manager: "Paul Mutuku",
          currentStock: 500,
          capacity: 1800,
          activeFarmers: 10,
          status: "operational" as const,
          stockInToday: 180,
          stockOutToday: 120,
          alerts: [],
        },
        {
          id: "SAT004",
          name: "Mitaboni Satellite Center",
          location: "Mitaboni Ward",
          subCounty: "Kathiani",
          ward: "Mitaboni",
          centerType: "satellite" as const,
          mainCenterId: "AC002",
          manager: "Lucy Mwikali",
          currentStock: 400,
          capacity: 1500,
          activeFarmers: 8,
          status: "operational" as const,
          stockInToday: 150,
          stockOutToday: 80,
          alerts: [],
        },
        {
          id: "SAT005",
          name: "Matungulu North Satellite Center",
          location: "Matungulu North Ward",
          subCounty: "Matungulu",
          ward: "Matungulu North",
          centerType: "satellite" as const,
          mainCenterId: "AC003",
          manager: "James Kioko",
          currentStock: 0,
          capacity: 1000,
          activeFarmers: 6,
          status: "maintenance" as const,
          stockInToday: 0,
          stockOutToday: 0,
          alerts: ["Center under maintenance"],
        },
        {
          id: "SAT006",
          name: "Yatta South Satellite Center",
          location: "Yatta South Ward",
          subCounty: "Yatta",
          ward: "Yatta South",
          centerType: "satellite" as const,
          mainCenterId: "AC004",
          manager: "Sarah Ndunge",
          currentStock: 350,
          capacity: 1200,
          activeFarmers: 9,
          status: "operational" as const,
          stockInToday: 120,
          stockOutToday: 80,
          alerts: [],
        },
      ];
      
      setCenters(allCenters);
      
      const mainCenters = allCenters.filter(c => c.centerType === "main").length;
      const satelliteCenters = allCenters.filter(c => c.centerType === "satellite").length;
      const totalStock = allCenters.reduce((sum, c) => sum + c.currentStock, 0);
      const totalCapacity = allCenters.reduce((sum, c) => sum + c.capacity, 0);
      const stockInToday = allCenters.reduce((sum, c) => sum + c.stockInToday, 0);
      const stockOutToday = allCenters.reduce((sum, c) => sum + c.stockOutToday, 0);
      
      setTotalStats({
        totalCenters: allCenters.length,
        mainCenters,
        satelliteCenters,
        totalStock,
        totalCapacity,
        stockInToday,
        stockOutToday,
      });
      setIsLoading(false);
    }, 1000);
  }, []);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold">Aggregation Centers</h1>
          <p className="text-sm sm:text-base text-muted-foreground mt-1">
            Real-time monitoring of all aggregation centers, stock levels, and alerts
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline">
            <IconDownload className="mr-2 h-4 w-4" />
            Export
          </Button>
          <Button>
            <IconMapPin className="mr-2 h-4 w-4" />
            Add Center
          </Button>
        </div>
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total Centers</p>
                <p className="text-2xl font-bold">{totalStats.totalCenters}</p>
              </div>
              <IconMapPin className="h-8 w-8 text-primary" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Main Centers</p>
                <p className="text-2xl font-bold">{totalStats.mainCenters}</p>
                <p className="text-xs text-muted-foreground mt-1">Subcounty Level</p>
              </div>
              <IconBuilding className="h-8 w-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Satellite Centers</p>
                <p className="text-2xl font-bold">{totalStats.satelliteCenters}</p>
                <p className="text-xs text-muted-foreground mt-1">Ward Level</p>
              </div>
              <IconBuildingCommunity className="h-8 w-8 text-purple-600" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total Stock</p>
                <p className="text-2xl font-bold">{totalStats.totalStock.toLocaleString()} kg</p>
              </div>
              <IconPackage className="h-8 w-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Stock In Today</p>
                <p className="text-2xl font-bold">{totalStats.stockInToday.toLocaleString()} kg</p>
              </div>
              <IconTrendingUp className="h-8 w-8 text-green-600" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Stock Out Today</p>
                <p className="text-2xl font-bold">{totalStats.stockOutToday.toLocaleString()} kg</p>
              </div>
              <IconTrendingDown className="h-8 w-8 text-orange-600" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Capacity Used</p>
                <p className="text-2xl font-bold">
                  {Math.round((totalStats.totalStock / totalStats.totalCapacity) * 100)}%
                </p>
              </div>
              <IconPackage className="h-8 w-8 text-purple-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filter Section */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-semibold">Filter Centers</h3>
              <p className="text-sm text-muted-foreground mt-1">
                View all centers or filter by type
              </p>
            </div>
            <div className="w-64">
              <Select value={centerFilter} onValueChange={(value: any) => setCenterFilter(value)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">
                    All Centers ({totalStats.totalCenters})
                  </SelectItem>
                  <SelectItem value="main">
                    Main Centers ({totalStats.mainCenters})
                  </SelectItem>
                  <SelectItem value="satellite">
                    Satellite Centers ({totalStats.satelliteCenters})
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Centers Grid */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold">
            {centerFilter === "all" ? "All Centers" : centerFilter === "main" ? "Main Centers (Subcounty Level)" : "Satellite Centers (Ward Level)"}
          </h2>
          <Badge variant="outline" className="text-sm">
            {filteredCenters.length} {filteredCenters.length === 1 ? "Center" : "Centers"}
          </Badge>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {isLoading
            ? [1, 2, 3].map((i) => (
                <Card key={i}>
                  <CardContent className="pt-6">
                    <div className="h-48 bg-muted animate-pulse rounded-lg" />
                  </CardContent>
                </Card>
              ))
            : filteredCenters.map((center) => {
              const utilizationPercent = (center.currentStock / center.capacity) * 100;
              return (
                <Card key={center.id}>
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          {center.centerType === "main" ? (
                            <IconBuilding className="h-5 w-5 text-blue-600" />
                          ) : (
                            <IconBuildingCommunity className="h-5 w-5 text-purple-600" />
                          )}
                          <Badge
                            variant="outline"
                            className={
                              center.centerType === "main"
                                ? "bg-blue-100 text-blue-800"
                                : "bg-purple-100 text-purple-800"
                            }
                          >
                            {center.centerType === "main" ? "Main Center" : "Satellite"}
                          </Badge>
                        </div>
                        <CardTitle className="text-lg">{center.name}</CardTitle>
                        <CardDescription className="mt-1 space-y-1">
                          <div className="flex items-center gap-1">
                            <IconMapPin className="h-3 w-3" />
                            {center.location}
                            {center.ward && `, ${center.ward}`}
                          </div>
                          <div className="text-xs text-muted-foreground">
                            {center.centerType === "main" ? `${center.subCounty} Subcounty` : `${center.subCounty} Subcounty - ${center.ward} Ward`}
                          </div>
                        </CardDescription>
                      </div>
                      <Badge
                        variant="outline"
                        className={
                          center.status === "operational"
                            ? "bg-green-100 text-green-800"
                            : center.status === "maintenance"
                            ? "bg-yellow-100 text-yellow-800"
                            : "bg-red-100 text-red-800"
                        }
                      >
                        {center.status}
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-2">
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-muted-foreground">Manager</span>
                        <span className="font-medium">{center.manager}</span>
                      </div>
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-muted-foreground">Active Farmers</span>
                        <span className="font-medium flex items-center gap-1">
                          <IconUsers className="h-4 w-4" />
                          {center.activeFarmers}
                        </span>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-muted-foreground">Stock Level</span>
                        <span className="font-medium">
                          {center.currentStock.toLocaleString()} / {center.capacity.toLocaleString()} kg
                        </span>
                      </div>
                      <div className="w-full bg-muted rounded-full h-2">
                        <div
                          className={`h-2 rounded-full ${
                            utilizationPercent > 80
                              ? "bg-red-500"
                              : utilizationPercent > 50
                              ? "bg-yellow-500"
                              : "bg-green-500"
                          }`}
                          style={{ width: `${Math.min(utilizationPercent, 100)}%` }}
                        />
                      </div>
                      <p className="text-xs text-muted-foreground">
                        {utilizationPercent.toFixed(1)}% capacity utilized
                      </p>
                    </div>

                    {center.alerts.length > 0 && (
                      <div className="p-2 bg-yellow-50 border border-yellow-200 rounded-lg">
                        <div className="flex items-start gap-2">
                          <IconAlertTriangle className="h-4 w-4 text-yellow-600 mt-0.5" />
                          <div className="flex-1">
                            {center.alerts.map((alert, idx) => (
                              <p key={idx} className="text-xs text-yellow-800">
                                {alert}
                              </p>
                            ))}
                          </div>
                        </div>
                      </div>
                    )}

                    <Button variant="outline" className="w-full" size="sm">
                      <IconEdit className="mr-2 h-4 w-4" />
                      Manage Center
                    </Button>
                  </CardContent>
                </Card>
              );
            })}
        </div>
      </div>

      {/* Centers Summary Table */}
      <Card>
        <CardHeader>
          <CardTitle>Centers Summary</CardTitle>
          <CardDescription>Quick overview of all aggregation centers</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Center</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Location</TableHead>
                <TableHead>Current Stock</TableHead>
                <TableHead>Capacity</TableHead>
                <TableHead>Utilization</TableHead>
                <TableHead>Stock In Today</TableHead>
                <TableHead>Stock Out Today</TableHead>
                <TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredCenters.map((center) => {
                const utilizationPercent = (center.currentStock / center.capacity) * 100;
                return (
                  <TableRow key={center.id}>
                    <TableCell className="font-medium">{center.name}</TableCell>
                    <TableCell>
                      <Badge
                        variant="outline"
                        className={
                          center.centerType === "main"
                            ? "bg-blue-100 text-blue-800"
                            : "bg-purple-100 text-purple-800"
                        }
                      >
                        {center.centerType === "main" ? "Main" : "Satellite"}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="text-sm">
                        <div>{center.location}</div>
                        <div className="text-muted-foreground">
                          {center.subCounty}
                          {center.ward && ` - ${center.ward} Ward`}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>{center.currentStock.toLocaleString()} kg</TableCell>
                    <TableCell>{center.capacity.toLocaleString()} kg</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <div className="w-16 bg-muted rounded-full h-2">
                          <div
                            className={`h-2 rounded-full ${
                              utilizationPercent > 80
                                ? "bg-red-500"
                                : utilizationPercent > 50
                                ? "bg-yellow-500"
                                : "bg-green-500"
                            }`}
                            style={{ width: `${Math.min(utilizationPercent, 100)}%` }}
                          />
                        </div>
                        <span className="text-sm">{utilizationPercent.toFixed(0)}%</span>
                      </div>
                    </TableCell>
                    <TableCell className="text-green-600">
                      +{center.stockInToday.toLocaleString()} kg
                    </TableCell>
                    <TableCell className="text-orange-600">
                      -{center.stockOutToday.toLocaleString()} kg
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant="outline"
                        className={
                          center.status === "operational"
                            ? "bg-green-100 text-green-800"
                            : center.status === "maintenance"
                            ? "bg-yellow-100 text-yellow-800"
                            : "bg-red-100 text-red-800"
                        }
                      >
                        {center.status}
                      </Badge>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Geographic Map Placeholder */}
      <Card>
        <CardHeader>
          <CardTitle>Geographic Overview</CardTitle>
          <CardDescription>Visual map of aggregation centers in Machakos County</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="h-64 flex items-center justify-center border-2 border-dashed rounded-lg bg-muted/50">
            <div className="text-center">
              <IconMapPin className="h-12 w-12 text-muted-foreground mx-auto mb-2" />
              <p className="text-muted-foreground">Map visualization would go here</p>
              <p className="text-xs text-muted-foreground mt-1">
                Integration with mapping library (e.g., Leaflet, Google Maps)
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
