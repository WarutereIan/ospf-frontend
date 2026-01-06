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
} from "@tabler/icons-react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

interface AggregationCenter {
  id: string;
  name: string;
  location: string;
  subCounty: string;
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
  const [totalStats, setTotalStats] = useState({
    totalCenters: 0,
    totalStock: 0,
    totalCapacity: 0,
    stockInToday: 0,
    stockOutToday: 0,
  });

  useEffect(() => {
    // TODO: Replace with actual API calls
    setTimeout(() => {
      setCenters([
        {
          id: "AC001",
          name: "Kangundo Aggregation Center",
          location: "Kangundo Town",
          subCounty: "Kangundo",
          manager: "Peter Kariuki",
          currentStock: 5000,
          capacity: 10000,
          activeFarmers: 45,
          status: "operational",
          stockInToday: 1200,
          stockOutToday: 800,
          alerts: [],
        },
        {
          id: "AC002",
          name: "Kathiani Aggregation Center",
          location: "Kathiani Market",
          subCounty: "Kathiani",
          manager: "Jane Muthoni",
          currentStock: 3200,
          capacity: 8000,
          activeFarmers: 32,
          status: "operational",
          stockInToday: 800,
          stockOutToday: 500,
          alerts: ["Capacity approaching 80%"],
        },
        {
          id: "AC003",
          name: "Matungulu Aggregation Center",
          location: "Matungulu",
          subCounty: "Matungulu",
          manager: "David Kimani",
          currentStock: 0,
          capacity: 5000,
          activeFarmers: 18,
          status: "maintenance",
          stockInToday: 0,
          stockOutToday: 0,
          alerts: ["Center under maintenance"],
        },
      ]);
      setTotalStats({
        totalCenters: 3,
        totalStock: 8200,
        totalCapacity: 23000,
        stockInToday: 2000,
        stockOutToday: 1300,
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
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
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

      {/* Centers Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {isLoading
          ? [1, 2, 3].map((i) => (
              <Card key={i}>
                <CardContent className="pt-6">
                  <div className="h-48 bg-muted animate-pulse rounded-lg" />
                </CardContent>
              </Card>
            ))
          : centers.map((center) => {
              const utilizationPercent = (center.currentStock / center.capacity) * 100;
              return (
                <Card key={center.id}>
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <CardTitle className="text-lg">{center.name}</CardTitle>
                        <CardDescription className="mt-1">
                          <div className="flex items-center gap-1">
                            <IconMapPin className="h-3 w-3" />
                            {center.location}, {center.subCounty}
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
              {centers.map((center) => {
                const utilizationPercent = (center.currentStock / center.capacity) * 100;
                return (
                  <TableRow key={center.id}>
                    <TableCell className="font-medium">{center.name}</TableCell>
                    <TableCell>
                      <div className="text-sm">
                        <div>{center.location}</div>
                        <div className="text-muted-foreground">{center.subCounty}</div>
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
