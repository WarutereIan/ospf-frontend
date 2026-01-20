import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  IconAlertTriangle,
  IconPackage,
  IconTrendingDown,
  IconClock,
  IconRefresh,
} from "@tabler/icons-react";
import { cn } from "@/lib/utils";
import { useAggregation } from "@/contexts/AggregationContext";
import type { InventoryItem } from "@/types/aggregation";

export function StorageManagement() {
  const { inventory, fetchInventory, selectedCenter, centers, fetchCenters, isLoading } = useAggregation();
  
  const [filteredItems, setFilteredItems] = useState<InventoryItem[]>([]);
  const [varietyFilter, setVarietyFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");

  // Fetch inventory on mount
  useEffect(() => {
    fetchCenters();
    fetchInventory(selectedCenter?.id);
  }, [fetchCenters, fetchInventory, selectedCenter?.id]);

  // Filter inventory items
  useEffect(() => {
    let filtered = [...inventory];

    if (varietyFilter !== "all") {
      filtered = filtered.filter((item) => item.variety.toLowerCase() === varietyFilter);
    }

    if (statusFilter !== "all") {
      filtered = filtered.filter((item) => item.status === statusFilter);
    }

    setFilteredItems(filtered);
  }, [inventory, varietyFilter, statusFilter]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case "fresh":
        return "bg-green-100 text-green-800";
      case "aging":
        return "bg-yellow-100 text-yellow-800";
      case "critical":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const agingItems = inventory.filter((item) => item.status === "aging" || item.status === "critical");
  const criticalItems = inventory.filter((item) => item.status === "critical");

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold">Storage Management</h1>
          <p className="text-sm sm:text-base text-muted-foreground mt-1">
            Monitor storage conditions and aging stock
          </p>
        </div>
        <Button variant="outline" size="sm" onClick={() => fetchInventory(selectedCenter?.id)}>
          <IconRefresh className="mr-2 h-4 w-4" />
          Refresh
        </Button>
      </div>

      {/* Alerts */}
      {criticalItems.length > 0 && (
        <Card className="border-red-200 bg-red-50">
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <IconAlertTriangle className="h-5 w-5 text-red-600" />
              <div>
                <p className="font-semibold text-red-900">Critical Storage Alert</p>
                <p className="text-sm text-red-800">
                  {criticalItems.length} item(s) have been in storage for more than 7 days. Immediate
                  action required.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {agingItems.length > 0 && agingItems.length <= 5 && (
        <Card className="border-yellow-200 bg-yellow-50">
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <IconClock className="h-5 w-5 text-yellow-600" />
              <div>
                <p className="font-semibold text-yellow-900">Aging Stock Warning</p>
                <p className="text-sm text-yellow-800">
                  {agingItems.length} item(s) are approaching critical storage duration. Consider priority
                  dispatch.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Total in Storage</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {inventory.reduce((sum, item) => sum + item.quantity, 0)} kg
            </div>
            <p className="text-xs text-muted-foreground mt-1">{inventory.length} batches</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Fresh Stock</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {inventory
                .filter((i) => i.status === "fresh")
                .reduce((sum, i) => sum + i.quantity, 0)}{" "}
              kg
            </div>
            <p className="text-xs text-muted-foreground mt-1">&lt; 5 days</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Aging Stock</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-600">
              {inventory
                .filter((i) => i.status === "aging")
                .reduce((sum, i) => sum + i.quantity, 0)}{" "}
              kg
            </div>
            <p className="text-xs text-muted-foreground mt-1">5-7 days</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Critical Stock</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">
              {filteredItems
                .filter((i) => i.status === "critical")
                .reduce((sum, i) => sum + i.quantity, 0)}{" "}
              kg
            </div>
            <p className="text-xs text-muted-foreground mt-1">&gt; 7 days</p>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col md:flex-row gap-4">
            <Select value={varietyFilter} onValueChange={(value) => setVarietyFilter(value || "all")}>
              <SelectTrigger className="w-full md:w-[150px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Varieties</SelectItem>
                <SelectItem value="kenya">Kenya</SelectItem>
                <SelectItem value="spk004">SPK004</SelectItem>
                <SelectItem value="kabode">Kabode</SelectItem>
              </SelectContent>
            </Select>
            <Select value={statusFilter} onValueChange={(value) => setStatusFilter(value || "all")}>
              <SelectTrigger className="w-full md:w-[150px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="fresh">Fresh</SelectItem>
                <SelectItem value="aging">Aging</SelectItem>
                <SelectItem value="critical">Critical</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Storage Table */}
      <Card>
        <CardHeader>
          <CardTitle>Storage Items</CardTitle>
          <CardDescription>{filteredItems.length} item(s) found</CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="space-y-4">
              {[1, 2, 3].map((i) => (
                <div key={i} className="h-16 bg-muted animate-pulse rounded-lg" />
              ))}
            </div>
          ) : filteredItems.length > 0 ? (
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>ID</TableHead>
                    <TableHead>Variety</TableHead>
                    <TableHead>Grade</TableHead>
                    <TableHead>Quantity</TableHead>
                    <TableHead>Storage Duration</TableHead>
                    <TableHead>Temperature</TableHead>
                    <TableHead>Humidity</TableHead>
                    <TableHead>Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredItems.map((item) => (
                    <TableRow key={item.id}>
                      <TableCell className="font-medium">{item.id}</TableCell>
                      <TableCell>{item.variety}</TableCell>
                      <TableCell>
                        <Badge variant="outline">Grade {item.qualityGrade}</Badge>
                      </TableCell>
                      <TableCell className="font-semibold">{item.quantity} kg</TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1">
                          {item.storageDuration > 7 ? (
                            <IconTrendingDown className="h-4 w-4 text-red-600" />
                          ) : item.storageDuration > 5 ? (
                            <IconClock className="h-4 w-4 text-yellow-600" />
                          ) : null}
                          <span>{item.storageDuration} days</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        {item.temperature ? (
                          <span className="text-sm">{item.temperature}°C</span>
                        ) : (
                          <span className="text-sm text-muted-foreground">N/A</span>
                        )}
                      </TableCell>
                      <TableCell>
                        {item.humidity ? (
                          <span className="text-sm">{item.humidity}%</span>
                        ) : (
                          <span className="text-sm text-muted-foreground">N/A</span>
                        )}
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline" className={getStatusColor(item.status)}>
                          {item.status}
                        </Badge>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          ) : (
            <div className="text-center py-12">
              <IconPackage className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-lg font-medium text-muted-foreground">No storage items found</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

