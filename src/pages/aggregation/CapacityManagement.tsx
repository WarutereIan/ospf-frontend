import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import {
  IconAlertTriangle,
  IconPackage,
  IconTrendingUp,
  IconTrendingDown,
  IconRefresh,
} from "@tabler/icons-react";
import { cn } from "@/lib/utils";
import { useAggregation } from "@/contexts/AggregationContext";
import type { AggregationCenter, InventoryItem } from "@/types/aggregation";

export function CapacityManagement() {
  const { centers, fetchCenters, inventory, fetchInventory, isLoading } = useAggregation();

  // Fetch centers and inventory on mount
  useEffect(() => {
    fetchCenters();
    fetchInventory();
  }, [fetchCenters, fetchInventory]);

  // Calculate capacity data from centers and inventory
  const capacityData = centers.map((center) => {
    const centerInventory = inventory.filter((item) => item.centerId === center.id);
    const currentStock = centerInventory.reduce((sum, item) => sum + item.quantity, 0);
    const totalCapacity = center.capacity || 0;
    const utilization = totalCapacity > 0 ? (currentStock / totalCapacity) * 100 : 0;
    const availableSpace = totalCapacity - currentStock;
    
    // Determine status
    let status: "low" | "moderate" | "high" | "full";
    if (utilization >= 95) status = "full";
    else if (utilization >= 70) status = "high";
    else if (utilization >= 40) status = "moderate";
    else status = "low";

    // Calculate variety breakdown
    const varietyMap = new Map<string, number>();
    centerInventory.forEach((item) => {
      const existing = varietyMap.get(item.variety) || 0;
      varietyMap.set(item.variety, existing + item.quantity);
    });

    const varietyBreakdown = Array.from(varietyMap.entries()).map(([variety, quantity]) => ({
      variety,
      quantity,
      percentage: currentStock > 0 ? (quantity / currentStock) * 100 : 0,
    }));

    return {
      centerId: center.id,
      centerName: center.name,
      totalCapacity,
      currentStock,
      utilization,
      availableSpace,
      status,
      varietyBreakdown,
    };
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case "low":
        return "bg-green-100 text-green-800";
      case "moderate":
        return "bg-blue-100 text-blue-800";
      case "high":
        return "bg-yellow-100 text-yellow-800";
      case "full":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getProgressColor = (utilization: number) => {
    if (utilization >= 90) return "bg-red-500";
    if (utilization >= 70) return "bg-yellow-500";
    if (utilization >= 50) return "bg-blue-500";
    return "bg-green-500";
  };

  const fullCenters = capacityData.filter((c) => c.status === "full");
  const highUtilizationCenters = capacityData.filter((c) => c.utilization >= 70);

  const totalCapacity = capacityData.reduce((sum, c) => sum + c.totalCapacity, 0);
  const totalCurrentStock = capacityData.reduce((sum, c) => sum + c.currentStock, 0);
  const overallUtilization = totalCapacity > 0 ? (totalCurrentStock / totalCapacity) * 100 : 0;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold">Capacity Management</h1>
          <p className="text-sm sm:text-base text-muted-foreground mt-1">
            Monitor aggregation center capacity and utilization
          </p>
        </div>
        <Button variant="outline" size="sm" onClick={() => { fetchCenters(); fetchInventory(); }}>
          <IconRefresh className="mr-2 h-4 w-4" />
          Refresh
        </Button>
      </div>

      {/* Overall Summary */}
      <Card>
        <CardHeader>
          <CardTitle>Overall Capacity Summary</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <p className="text-sm text-muted-foreground">Total Capacity</p>
              <p className="text-2xl font-bold">{totalCapacity.toLocaleString()} kg</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Current Stock</p>
              <p className="text-2xl font-bold">{totalCurrentStock.toLocaleString()} kg</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Available Space</p>
              <p className="text-2xl font-bold text-green-600">
                {(totalCapacity - totalCurrentStock).toLocaleString()} kg
              </p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Overall Utilization</p>
              <p className="text-2xl font-bold">{overallUtilization.toFixed(1)}%</p>
            </div>
          </div>
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span>Capacity Utilization</span>
              <span className="font-semibold">{overallUtilization.toFixed(1)}%</span>
            </div>
            <div className="w-full bg-muted rounded-full h-3 overflow-hidden">
              <div
                className={cn("h-full transition-all", getProgressColor(overallUtilization))}
                style={{ width: `${overallUtilization}%` }}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Alerts */}
      {fullCenters.length > 0 && (
        <Card className="border-red-200 bg-red-50">
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <IconAlertTriangle className="h-5 w-5 text-red-600" />
              <div>
                <p className="font-semibold text-red-900">Capacity Alert</p>
                <p className="text-sm text-red-800">
                  {fullCenters.length} center(s) are at or near full capacity. Consider redirecting stock to
                  other centers.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {highUtilizationCenters.length > 0 && highUtilizationCenters.length < fullCenters.length && (
        <Card className="border-yellow-200 bg-yellow-50">
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <IconTrendingUp className="h-5 w-5 text-yellow-600" />
              <div>
                <p className="font-semibold text-yellow-900">High Utilization Warning</p>
                <p className="text-sm text-yellow-800">
                  {highUtilizationCenters.length} center(s) are above 70% capacity. Monitor closely.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Center Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {capacityData.map((center) => (
          <Card key={center.centerId}>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg">{center.centerName}</CardTitle>
                <Badge variant="outline" className={getStatusColor(center.status)}>
                  {center.status}
                </Badge>
              </div>
              <CardDescription>Center ID: {center.centerId}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Utilization Progress */}
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Capacity Utilization</span>
                  <span className="font-semibold">{center.utilization.toFixed(1)}%</span>
                </div>
                <div className="w-full bg-muted rounded-full h-3 overflow-hidden">
                  <div
                    className={cn("h-full transition-all", getProgressColor(center.utilization))}
                    style={{ width: `${center.utilization}%` }}
                  />
                </div>
              </div>

              {/* Capacity Details */}
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="text-muted-foreground">Total Capacity</p>
                  <p className="font-semibold">{center.totalCapacity.toLocaleString()} kg</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Current Stock</p>
                  <p className="font-semibold">{center.currentStock.toLocaleString()} kg</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Available Space</p>
                  <p className="font-semibold text-green-600">
                    {center.availableSpace.toLocaleString()} kg
                  </p>
                </div>
                <div>
                  <p className="text-muted-foreground">Status</p>
                  <Badge variant="outline" className={getStatusColor(center.status)}>
                    {center.status}
                  </Badge>
                </div>
              </div>

              {/* Variety Breakdown */}
              <div className="space-y-2 pt-4 border-t">
                <p className="text-sm font-medium">Variety Breakdown</p>
                <div className="space-y-2">
                  {center.varietyBreakdown.map((item) => (
                    <div key={item.variety} className="space-y-1">
                      <div className="flex justify-between text-xs">
                        <span className="text-muted-foreground">{item.variety}</span>
                        <span className="font-medium">
                          {item.quantity.toLocaleString()} kg ({item.percentage.toFixed(1)}%)
                        </span>
                      </div>
                      <div className="w-full bg-muted rounded-full h-1.5 overflow-hidden">
                        <div
                          className="h-full bg-primary transition-all"
                          style={{ width: `${item.percentage}%` }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}

