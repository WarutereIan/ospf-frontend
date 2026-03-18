import { useState, useEffect, useMemo } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  IconPackage,
  IconTrendingUp,
  IconTrendingDown,
  IconAlertTriangle,
  IconDownload,
  IconRefresh,
  IconSearch,
} from "@tabler/icons-react";
import { cn } from "@/lib/utils";
import {
  TreemapChart,
  AgingHeatmap,
} from "@/components/visualizations";
import { useAggregation } from "@/contexts/AggregationContext";
import { useCatalog } from "@/contexts/CatalogContext";
import type { InventoryItem } from "@/types/aggregation";

export function InventoryManagement() {
  const { inventory, fetchInventory, isLoading, selectedCenter, centers, fetchCenters } = useAggregation();
  const { varieties: catalogVarieties, qualityGrades: catalogGrades, getGradeColor } = useCatalog();
  
  const [filteredInventory, setFilteredInventory] = useState<InventoryItem[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [varietyFilter, setVarietyFilter] = useState("all");
  const [gradeFilter, setGradeFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [cardFilter, setCardFilter] = useState<"all" | "fresh" | "aging" | "critical">("all");

  const [treemapData, setTreemapData] = useState<Array<{ name: string; value: number; color: string }>>([]);
  const [agingHeatmapData, setAgingHeatmapData] = useState<Array<{
    batchId: string;
    days: Array<{ day: number; status: "fresh" | "aging" | "critical" }>;
  }>>([]);

  const [selectedBatch, setSelectedBatch] = useState<InventoryItem | null>(null);
  const [batchModalOpen, setBatchModalOpen] = useState(false);

  const getBatchNumber = (item: InventoryItem) => item.batchId || item.id;

  const getStockInDate = (item: InventoryItem) =>
    item.createdAt || item.stockInDate || undefined;

  const getAgeDays = (item: InventoryItem) => {
    const raw = getStockInDate(item);
    if (!raw) return item.storageDuration || 0;
    const d = new Date(raw);
    if (Number.isNaN(d.getTime())) return item.storageDuration || 0;
    const diffMs = Date.now() - d.getTime();
    return Math.max(0, Math.floor(diffMs / (1000 * 60 * 60 * 24)));
  };

  const getAgeStatus = (ageDays: number): "fresh" | "aging" | "critical" => {
    if (ageDays < 5) return "fresh";
    if (ageDays <= 7) return "aging";
    return "critical";
  };

  const centerNameById = useMemo(() => {
    const map = new Map<string, string>();
    centers.forEach((c) => map.set(c.id, c.name));
    return map;
  }, [centers]);

  // Fetch inventory on mount
  useEffect(() => {
    fetchCenters();
    fetchInventory(selectedCenter?.id);
  }, [fetchCenters, fetchInventory, selectedCenter?.id]);

  // Prepare visualization data when inventory changes
  useEffect(() => {
    if (inventory.length === 0) return;

    // Prepare treemap data
    const treemap: Array<{ name: string; value: number; color: string }> = [];
    inventory.forEach((item) => {
      const name = `${item.variety} Grade ${item.qualityGrade}`;
      const existing = treemap.find((t) => t.name === name);
      if (existing) {
        existing.value += item.quantity;
      } else {
        const colors: Record<string, string> = {
          "Kenya": "#3B82F6",
          "SPK004": "#22C55E",
          "Kabode": "#F59E0B",
        };
        treemap.push({
          name,
          value: item.quantity,
          color: colors[item.variety] || "#8B5CF6",
        });
      }
    });
    setTreemapData(treemap);

    // Prepare aging heatmap data
    const heatmap = inventory.map((item) => {
      const days: Array<{ day: number; status: "fresh" | "aging" | "critical" }> = [];
      const ageDays = getAgeDays(item);
      for (let day = 1; day <= 7; day++) {
        if (ageDays >= day) {
          let status: "fresh" | "aging" | "critical";
          if (day <= 3) {
            status = "fresh";
          } else if (day <= 6) {
            status = "aging";
          } else {
            status = "critical";
          }
          days.push({ day, status });
        }
      }
      return {
        batchId: getBatchNumber(item),
        days,
      };
    });
    setAgingHeatmapData(heatmap);
  }, [inventory]);

  // Filter inventory based on filters
  useEffect(() => {
    let filtered = [...inventory];

    if (searchTerm) {
      filtered = filtered.filter(
        (item) =>
          item.variety.toLowerCase().includes(searchTerm.toLowerCase()) ||
          item.farmerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
          item.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
          (item.batchId || "").toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (varietyFilter !== "all") {
      filtered = filtered.filter((item) => item.variety.toLowerCase() === varietyFilter);
    }

    if (gradeFilter !== "all") {
      filtered = filtered.filter((item) => item.qualityGrade === gradeFilter);
    }

    if (statusFilter !== "all") {
      filtered = filtered.filter((item) => item.status === statusFilter);
    }

    // Apply card filter
    if (cardFilter !== "all") {
      filtered = filtered.filter((item) => getAgeStatus(getAgeDays(item)) === cardFilter);
    }

    // Sort by age (oldest first) to prioritize action on older batches
    filtered.sort((a, b) => getAgeDays(b) - getAgeDays(a));

    setFilteredInventory(filtered);
  }, [inventory, searchTerm, varietyFilter, gradeFilter, statusFilter, cardFilter]);

  const totalStock = inventory.reduce((sum, item) => sum + item.quantity, 0);
  const freshStockKg = inventory
    .filter((i) => getAgeStatus(getAgeDays(i)) === "fresh")
    .reduce((sum, i) => sum + i.quantity, 0);
  const agingStockKg = inventory
    .filter((i) => getAgeStatus(getAgeDays(i)) === "aging")
    .reduce((sum, i) => sum + i.quantity, 0);
  const criticalStockKg = inventory
    .filter((i) => getAgeStatus(getAgeDays(i)) === "critical")
    .reduce((sum, i) => sum + i.quantity, 0);

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


  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold">Inventory Management</h1>
          <p className="text-sm sm:text-base text-muted-foreground mt-1">
            Real-time stock levels and storage tracking
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm">
            <IconDownload className="mr-2 h-4 w-4" />
            Export
          </Button>
          <Button variant="outline" size="sm">
            <IconRefresh className="mr-2 h-4 w-4" />
            Refresh
          </Button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card
          className={cn(
            "cursor-pointer transition-all hover:shadow-md",
            cardFilter === "all" && "ring-2 ring-primary"
          )}
          onClick={() => {
            setCardFilter("all");
            setStatusFilter("all");
          }}
        >
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Total Stock</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalStock} kg</div>
            <p className="text-xs text-muted-foreground mt-1">Across all varieties</p>
          </CardContent>
        </Card>
        <Card
          className={cn(
            "cursor-pointer transition-all hover:shadow-md",
            cardFilter === "fresh" && "ring-2 ring-green-500"
          )}
          onClick={() => {
            setCardFilter("fresh");
            setStatusFilter("fresh");
          }}
        >
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Fresh Stock</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {freshStockKg.toLocaleString()} kg
            </div>
            <p className="text-xs text-muted-foreground mt-1">&lt; 5 days old</p>
          </CardContent>
        </Card>
        <Card
          className={cn(
            "cursor-pointer transition-all hover:shadow-md",
            cardFilter === "aging" && "ring-2 ring-yellow-500"
          )}
          onClick={() => {
            setCardFilter("aging");
            setStatusFilter("aging");
          }}
        >
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Aging Stock</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-600">
              {agingStockKg.toLocaleString()} kg
            </div>
            <p className="text-xs text-muted-foreground mt-1">5-7 days old</p>
          </CardContent>
        </Card>
        <Card
          className={cn(
            "cursor-pointer transition-all hover:shadow-md",
            cardFilter === "critical" && "ring-2 ring-red-500"
          )}
          onClick={() => {
            setCardFilter("critical");
            setStatusFilter("critical");
          }}
        >
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Critical Stock</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">
              {criticalStockKg.toLocaleString()} kg
            </div>
            <p className="text-xs text-muted-foreground mt-1">&gt; 7 days old</p>
          </CardContent>
        </Card>
      </div>

    

      {/* Filters */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="relative flex-1">
              <IconSearch className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Search by variety, farmer, batch #, or ID..."
                className="pl-10"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <Select value={varietyFilter} onValueChange={(value) => setVarietyFilter(value || "all")}>
              <SelectTrigger className="w-full md:w-[150px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Varieties</SelectItem>
                {catalogVarieties.filter(v => v.isActive).map(v => (
                  <SelectItem key={v.id} value={v.code}>{v.label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={gradeFilter} onValueChange={(value) => setGradeFilter(value || "all")}>
              <SelectTrigger className="w-full md:w-[120px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Grades</SelectItem>
                {catalogGrades.filter(g => g.isActive).map(g => (
                  <SelectItem key={g.id} value={g.code}>{g.label}</SelectItem>
                ))}
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

      {/* Inventory Table */}
      <Card>
        <CardHeader>
          <CardTitle>Inventory Table</CardTitle>
          <CardDescription>
            {filteredInventory.length} item(s) found
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="space-y-4">
              {[1, 2, 3].map((i) => (
                <div key={i} className="h-16 bg-muted animate-pulse rounded-lg" />
              ))}
            </div>
          ) : filteredInventory.length > 0 ? (
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Batch #</TableHead>
                    <TableHead>Variety</TableHead>
                    <TableHead>Grade</TableHead>
                    <TableHead>Qty</TableHead>
                    <TableHead>Age</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Farmer</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredInventory.map((item) => {
                    const ageDays = getAgeDays(item);
                    const status = getAgeStatus(ageDays);
                    const statusEmoji = status === "fresh" ? "🟢" : status === "aging" ? "🟡" : "🔴";
                    const ageDisplay = `${ageDays}d`;

                    return (
                      <TableRow
                        key={item.id}
                        className="cursor-pointer hover:bg-muted/50"
                        onClick={() => {
                          setSelectedBatch(item);
                          setBatchModalOpen(true);
                        }}
                      >
                        <TableCell className="font-medium">{getBatchNumber(item)}</TableCell>
                        <TableCell>{item.variety}</TableCell>
                        <TableCell>
                          <Badge variant="outline" className={getGradeColor(item.qualityGrade)}>
                            {item.qualityGrade}
                          </Badge>
                        </TableCell>
                        <TableCell className="font-semibold">{item.quantity.toLocaleString()} kg</TableCell>
                        <TableCell>{ageDisplay}</TableCell>
                        <TableCell>
                          <span className="text-lg">{statusEmoji}</span>
                        </TableCell>
                        <TableCell>{item.farmerName}</TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </div>
          ) : (
            <div className="text-center py-12">
              <IconPackage className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-lg font-medium text-muted-foreground">No inventory found</p>
              <p className="text-sm text-muted-foreground mt-1">
                Try adjusting your filters
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Batch details modal */}
      <Dialog open={batchModalOpen} onOpenChange={setBatchModalOpen}>
        <DialogContent className="sm:max-w-[720px]">
          <DialogHeader>
            <DialogTitle>Batch Details</DialogTitle>
            <DialogDescription>
              Full details for Batch #{selectedBatch ? getBatchNumber(selectedBatch) : ""}
            </DialogDescription>
          </DialogHeader>
          {selectedBatch && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 py-2">
              <div>
                <p className="text-sm text-muted-foreground">Batch #</p>
                <p className="font-medium">{getBatchNumber(selectedBatch)}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Inventory ID</p>
                <p className="font-medium">{selectedBatch.id}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Center</p>
                <p className="font-medium">
                  {centerNameById.get(selectedBatch.centerId) || selectedBatch.centerId}
                </p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Farmer</p>
                <p className="font-medium">{selectedBatch.farmerName}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Variety</p>
                <p className="font-medium">{selectedBatch.variety}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Grade</p>
                <p className="font-medium">Grade {selectedBatch.qualityGrade}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Quantity</p>
                <p className="font-medium">{selectedBatch.quantity.toLocaleString()} kg</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Age</p>
                <p className="font-medium">
                  {getAgeDays(selectedBatch)} days ({getAgeStatus(getAgeDays(selectedBatch))})
                </p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Stock-in date</p>
                <p className="font-medium">
                  {getStockInDate(selectedBatch)
                    ? new Date(getStockInDate(selectedBatch) as string).toLocaleString()
                    : "N/A"}
                </p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Storage duration (backend)</p>
                <p className="font-medium">{selectedBatch.storageDuration ?? 0} days</p>
              </div>
              {selectedBatch.location && (
                <div>
                  <p className="text-sm text-muted-foreground">Location</p>
                  <p className="font-medium">{selectedBatch.location}</p>
                </div>
              )}
              {(selectedBatch.temperature !== undefined || selectedBatch.humidity !== undefined) && (
                <div>
                  <p className="text-sm text-muted-foreground">Storage conditions</p>
                  <p className="font-medium">
                    {selectedBatch.temperature !== undefined ? `${selectedBatch.temperature}°C` : "—"}
                    {" • "}
                    {selectedBatch.humidity !== undefined ? `${selectedBatch.humidity}% RH` : "—"}
                  </p>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}

