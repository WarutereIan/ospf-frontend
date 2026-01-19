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
import { MapContainer, TileLayer, Marker, Popup, useMap } from "react-leaflet";
import type { LatLngExpression } from "leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

// Fix for default marker icons in Leaflet
import icon from "leaflet/dist/images/marker-icon.png";
import iconShadow from "leaflet/dist/images/marker-shadow.png";
import iconRetina from "leaflet/dist/images/marker-icon-2x.png";

const DefaultIcon = L.icon({
  iconUrl: icon,
  shadowUrl: iconShadow,
  iconRetinaUrl: iconRetina,
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41],
});

L.Marker.prototype.options.icon = DefaultIcon;

// Custom icons for centers
const createMainCenterIcon = () => {
  return L.divIcon({
    className: "custom-main-center-marker",
    html: `
      <div style="
        background-color: #3b82f6;
        width: 32px;
        height: 32px;
        border-radius: 50%;
        border: 3px solid white;
        box-shadow: 0 2px 8px rgba(0,0,0,0.3);
        display: flex;
        align-items: center;
        justify-content: center;
      ">
        <div style="color: white; font-size: 18px; font-weight: bold;">M</div>
      </div>
    `,
    iconSize: [32, 32],
    iconAnchor: [16, 32],
  });
};

const createSatelliteCenterIcon = () => {
  return L.divIcon({
    className: "custom-satellite-center-marker",
    html: `
      <div style="
        background-color: #a855f7;
        width: 28px;
        height: 28px;
        border-radius: 50%;
        border: 3px solid white;
        box-shadow: 0 2px 8px rgba(0,0,0,0.3);
        display: flex;
        align-items: center;
        justify-content: center;
      ">
        <div style="color: white; font-size: 14px; font-weight: bold;">S</div>
      </div>
    `,
    iconSize: [28, 28],
    iconAnchor: [14, 28],
  });
};


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
  coordinates?: [number, number]; // [lat, lng]
}

// Component to set map bounds
function MapBounds({ centers }: { centers: AggregationCenter[] }) {
  const map = useMap();
  
  useEffect(() => {
    const centersWithCoords = centers.filter(c => c.coordinates);
    if (centersWithCoords.length === 0) return;
    
    const bounds = L.latLngBounds(
      centersWithCoords.map(c => c.coordinates! as L.LatLngExpression)
    );
    map.fitBounds(bounds, { padding: [50, 50] });
  }, [map, centers]);
  
  return null;
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
          coordinates: [-1.3, 37.35] as [number, number],
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
          coordinates: [-1.5, 37.3] as [number, number],
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
          coordinates: [-1.4, 37.25] as [number, number],
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
          coordinates: [-1.6, 37.2] as [number, number],
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
          coordinates: [-1.32, 37.36] as [number, number],
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
          coordinates: [-1.28, 37.34] as [number, number],
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
          coordinates: [-1.52, 37.32] as [number, number],
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
          coordinates: [-1.48, 37.28] as [number, number],
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
          coordinates: [-1.42, 37.27] as [number, number],
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
          coordinates: [-1.62, 37.22] as [number, number],
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
    <div className="space-y-6 w-full max-w-full overflow-x-hidden">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold break-words">Aggregation Centers</h1>
          <p className="text-sm sm:text-base text-muted-foreground mt-1 break-words">
            Real-time monitoring of all aggregation centers, stock levels, and alerts
          </p>
        </div>
        <div className="flex flex-col sm:flex-row gap-2">
          <Button variant="outline" size="sm" className="w-full sm:w-auto">
            <IconDownload className="mr-2 h-4 w-4" />
            Export
          </Button>
          <Button size="sm" className="w-full sm:w-auto">
            <IconMapPin className="mr-2 h-4 w-4" />
            Add Center
          </Button>
        </div>
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4 w-full">
       
        <Card className="w-full min-w-0">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div className="flex-1 min-w-0">
                <p className="text-xs sm:text-sm text-muted-foreground">Main Centers</p>
                <p className="text-xl sm:text-2xl xl:text-2xl font-bold">{totalStats.mainCenters}</p>
                <p className="text-xs text-muted-foreground mt-1">Subcounty Level</p>
              </div>
              <IconBuilding className="h-6 w-6 sm:h-8 sm:w-8 xl:h-8 xl:w-8 text-blue-600 flex-shrink-0 ml-2" />
            </div>
          </CardContent>
        </Card>
        <Card className="w-full min-w-0">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div className="flex-1 min-w-0">
                <p className="text-xs sm:text-sm text-muted-foreground">Satellite Centers</p>
                <p className="text-xl sm:text-2xl xl:text-2xl font-bold">{totalStats.satelliteCenters}</p>
                <p className="text-xs text-muted-foreground mt-1">Ward Level</p>
              </div>
              <IconBuildingCommunity className="h-6 w-6 sm:h-8 sm:w-8 xl:h-8 xl:w-8 text-purple-600 flex-shrink-0 ml-2" />
            </div>
          </CardContent>
        </Card>
        <Card className="w-full min-w-0">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div className="flex-1 min-w-0">
                <p className="text-xs sm:text-sm text-muted-foreground">Total Stock</p>
                <p className="text-lg sm:text-xl xl:text-xl 2xl:text-2xl font-bold break-words">{totalStats.totalStock.toLocaleString()} kg</p>
              </div>
              <IconPackage className="h-6 w-6 sm:h-8 sm:w-8 xl:h-8 xl:w-8 text-blue-600 flex-shrink-0 ml-2" />
            </div>
          </CardContent>
        </Card>
        <Card className="w-full min-w-0">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div className="flex-1 min-w-0">
                <p className="text-xs sm:text-sm text-muted-foreground">Stock In Today</p>
                <p className="text-lg sm:text-xl xl:text-xl 2xl:text-2xl font-bold break-words">{totalStats.stockInToday.toLocaleString()} kg</p>
              </div>
              <IconTrendingUp className="h-6 w-6 sm:h-8 sm:w-8 xl:h-8 xl:w-8 text-green-600 flex-shrink-0 ml-2" />
            </div>
          </CardContent>
        </Card>
        <Card className="w-full min-w-0">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div className="flex-1 min-w-0">
                <p className="text-xs sm:text-sm text-muted-foreground">Stock Out Today</p>
                <p className="text-lg sm:text-xl xl:text-xl 2xl:text-2xl font-bold break-words">{totalStats.stockOutToday.toLocaleString()} kg</p>
              </div>
              <IconTrendingDown className="h-6 w-6 sm:h-8 sm:w-8 xl:h-8 xl:w-8 text-orange-600 flex-shrink-0 ml-2" />
            </div>
          </CardContent>
        </Card>
        <Card className="w-full min-w-0">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div className="flex-1 min-w-0">
                <p className="text-xs sm:text-sm text-muted-foreground">Capacity Used</p>
                <p className="text-xl sm:text-2xl xl:text-2xl font-bold">
                  {Math.round((totalStats.totalStock / totalStats.totalCapacity) * 100)}%
                </p>
              </div>
              <IconPackage className="h-6 w-6 sm:h-8 sm:w-8 xl:h-8 xl:w-8 text-purple-600 flex-shrink-0 ml-2" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filter Section */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div className="min-w-0 flex-1">
              <h3 className="text-lg font-semibold break-words">Filter Centers</h3>
              <p className="text-sm text-muted-foreground mt-1 break-words">
                View all centers or filter by type
              </p>
            </div>
            <div className="w-full sm:w-64 flex-shrink-0">
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

      

      {/* Centers Summary Table */}
      <Card>
        <CardHeader>
          <CardTitle>Centers Summary</CardTitle>
          <CardDescription>Quick overview of all aggregation centers</CardDescription>
        </CardHeader>
        <CardContent className="p-0 sm:p-6">
          <div className="overflow-x-auto w-full">
            <div className="min-w-full">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="min-w-[200px]">Center</TableHead>
                    <TableHead className="min-w-[100px]">Type</TableHead>
                    <TableHead className="min-w-[150px]">Location</TableHead>
                    <TableHead className="min-w-[120px]">Current Stock</TableHead>
                    <TableHead className="min-w-[100px]">Capacity</TableHead>
                    <TableHead className="min-w-[120px]">Utilization</TableHead>
                    <TableHead className="min-w-[120px]">Stock In Today</TableHead>
                    <TableHead className="min-w-[120px]">Stock Out Today</TableHead>
                    <TableHead className="min-w-[100px]">Status</TableHead>
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
                            <span className="text-sm whitespace-nowrap">{utilizationPercent.toFixed(0)}%</span>
                          </div>
                        </TableCell>
                        <TableCell className="text-green-600 whitespace-nowrap">
                          +{center.stockInToday.toLocaleString()} kg
                        </TableCell>
                        <TableCell className="text-orange-600 whitespace-nowrap">
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
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Geographic Overview */}
      <Card>
        <CardHeader>
          <CardTitle>Geographic Overview</CardTitle>
          <CardDescription>Visual map of aggregation centers in Machakos County with key metrics</CardDescription>
        </CardHeader>
        <CardContent className="p-0">
          <div className="w-full h-[400px] sm:h-[500px] lg:h-[600px] relative rounded-lg overflow-hidden border border-border">
            {isLoading ? (
              <div className="h-full flex items-center justify-center bg-muted/50">
                <div className="text-center">
                  <div className="h-8 w-8 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-2" />
                  <p className="text-sm text-muted-foreground">Loading map...</p>
                </div>
              </div>
            ) : (
              <MapContainer
                {...({
                  center: [-1.45, 37.28] as [number, number],
                  zoom: 9,
                  style: { height: "100%", width: "100%", zIndex: 0 },
                  scrollWheelZoom: true,
                  className: "z-0",
                } as any)}
              >
                <TileLayer
                  {...({
                    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
                    url: "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png",
                  } as any)}
                />
                <MapBounds centers={filteredCenters} />
                
                {filteredCenters
                  .filter(center => center.coordinates)
                  .map((center) => {
                    const utilizationPercent = (center.currentStock / center.capacity) * 100;
                    return (
                      <Marker
                        key={center.id}
                        {...({
                          position: center.coordinates! as LatLngExpression,
                          icon: center.centerType === "main" 
                            ? createMainCenterIcon() 
                            : createSatelliteCenterIcon(),
                        } as any)}
                      >
                        <Popup>
                          <div className="text-sm min-w-[200px]">
                            <div className="font-semibold mb-2 text-base">{center.name}</div>
                            <div className="space-y-1.5">
                              <div className="flex items-center gap-2">
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
                              <div className="pt-1 border-t">
                                <p className="text-muted-foreground text-xs">Location</p>
                                <p className="font-medium">{center.location}</p>
                                {center.ward && (
                                  <p className="text-xs text-muted-foreground">{center.subCounty} - {center.ward}</p>
                                )}
                              </div>
                              <div className="pt-1 border-t">
                                <p className="text-muted-foreground text-xs mb-1">Stock Metrics</p>
                                <div className="space-y-1">
                                  <div className="flex justify-between items-center">
                                    <span className="text-xs">Current Stock:</span>
                                    <span className="font-medium text-xs">
                                      {center.currentStock.toLocaleString()} / {center.capacity.toLocaleString()} kg
                                    </span>
                                  </div>
                                  <div className="w-full bg-muted rounded-full h-1.5">
                                    <div
                                      className={`h-1.5 rounded-full ${
                                        utilizationPercent > 80
                                          ? "bg-red-500"
                                          : utilizationPercent > 50
                                          ? "bg-yellow-500"
                                          : "bg-green-500"
                                      }`}
                                      style={{ width: `${Math.min(utilizationPercent, 100)}%` }}
                                    />
                                  </div>
                                  <div className="flex justify-between items-center text-xs">
                                    <span className="text-green-600">
                                      +{center.stockInToday.toLocaleString()} kg in
                                    </span>
                                    <span className="text-orange-600">
                                      -{center.stockOutToday.toLocaleString()} kg out
                                    </span>
                                  </div>
                                </div>
                              </div>
                              <div className="pt-1 border-t">
                                <p className="text-muted-foreground text-xs">Manager</p>
                                <p className="font-medium text-xs">{center.manager}</p>
                              </div>
                            </div>
                          </div>
                        </Popup>
                      </Marker>
                    );
                  })}
              </MapContainer>
            )}
          </div>
          
          {/* Legend and Summary Metrics */}
          <div className="p-4 border-t border-border bg-muted/30">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div className="flex flex-wrap items-center gap-4 text-xs">
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 rounded-full bg-blue-500 border-2 border-white shadow-sm"></div>
                  <span>Main Centers</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 rounded-full bg-purple-500 border-2 border-white shadow-sm"></div>
                  <span>Satellite Centers</span>
                </div>
              </div>
              <div className="flex flex-wrap items-center gap-4 text-xs">
                <div className="flex items-center gap-2">
                  <IconPackage className="h-4 w-4 text-blue-600" />
                  <span className="font-medium">
                    Total Stock: {totalStats.totalStock.toLocaleString()} kg
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <IconTrendingUp className="h-4 w-4 text-green-600" />
                  <span className="font-medium text-green-600">
                    In: {totalStats.stockInToday.toLocaleString()} kg
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <IconTrendingDown className="h-4 w-4 text-orange-600" />
                  <span className="font-medium text-orange-600">
                    Out: {totalStats.stockOutToday.toLocaleString()} kg
                  </span>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
