import { useEffect, useMemo, useState } from "react";
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
  IconUsers,
  IconSearch,
  IconTrendingUp,
  IconCalendar,
  IconDownload,
  IconRefresh,
} from "@tabler/icons-react";
import { useAggregation } from "@/contexts/AggregationContext";
import type { StockTransaction, InventoryItem } from "@/types/aggregation";

type FarmerStatus = "active" | "inactive";

interface FarmerCRMRow {
  farmerId: string;
  farmerName: string;
  totalDeliveredKg: number;
  deliveriesCount: number;
  lastDeliveryAt?: string;
  gradeCounts: Record<string, number>;
  gradeAKg: number;
  currentStockKg: number;
  status: FarmerStatus;
}

function formatDateTime(value?: string) {
  if (!value) return "—";
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return value;
  return d.toLocaleString();
}

function formatDate(value?: string) {
  if (!value) return "—";
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return value;
  return d.toLocaleDateString("en-KE", { year: "numeric", month: "short", day: "numeric" });
}

function isWithinDays(dateIso: string | undefined, days: number) {
  if (!dateIso) return false;
  const d = new Date(dateIso);
  if (Number.isNaN(d.getTime())) return false;
  const diff = Date.now() - d.getTime();
  return diff <= days * 24 * 60 * 60 * 1000;
}

function getGradeBadgeClass(grade: string) {
  switch (grade) {
    case "A":
      return "bg-green-100 text-green-800";
    case "B":
      return "bg-yellow-100 text-yellow-800";
    case "C":
      return "bg-orange-100 text-orange-800";
    default:
      return "bg-gray-100 text-gray-800";
  }
}

export function FarmersCRM() {
  const {
    centers,
    selectedCenter,
    setSelectedCenter,
    transactions,
    inventory,
    fetchCenters,
    fetchTransactions,
    fetchInventory,
    isLoading,
  } = useAggregation();

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<"all" | FarmerStatus>("all");
  const [selectedFarmer, setSelectedFarmer] = useState<FarmerCRMRow | null>(null);
  const [farmerModalOpen, setFarmerModalOpen] = useState(false);

  const center = selectedCenter || (centers.length > 0 ? centers[0] : null);

  useEffect(() => {
    fetchCenters();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (center?.id) {
      fetchTransactions({ centerId: center.id });
      fetchInventory(center.id);
    } else {
      fetchTransactions();
      fetchInventory();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [center?.id]);

  const centerStockInTransactions = useMemo(() => {
    const base = center?.id ? transactions.filter((t) => t.centerId === center.id) : transactions;
    return base
      .filter((t) => t.type === "stock_in" && t.farmerId && t.farmerName)
      .slice()
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }, [transactions, center?.id]);

  const centerInventory: InventoryItem[] = useMemo(() => {
    return center?.id ? inventory.filter((i) => i.centerId === center.id) : inventory;
  }, [inventory, center?.id]);

  const farmerRows: FarmerCRMRow[] = useMemo(() => {
    const map = new Map<string, FarmerCRMRow>();

    for (const t of centerStockInTransactions) {
      const farmerId = t.farmerId as string;
      const farmerName = t.farmerName || "Unknown";
      const qty = t.quantity || 0;
      const grade = (t.grade || t.qualityGrade || "N/A") as string;

      if (!map.has(farmerId)) {
        map.set(farmerId, {
          farmerId,
          farmerName,
          totalDeliveredKg: 0,
          deliveriesCount: 0,
          lastDeliveryAt: undefined,
          gradeCounts: {},
          gradeAKg: 0,
          currentStockKg: 0,
          status: "inactive",
        });
      }

      const row = map.get(farmerId)!;
      row.totalDeliveredKg += qty;
      row.deliveriesCount += 1;
      if (!row.lastDeliveryAt || new Date(t.createdAt) > new Date(row.lastDeliveryAt)) {
        row.lastDeliveryAt = t.createdAt;
      }
      row.gradeCounts[grade] = (row.gradeCounts[grade] || 0) + 1;
      if (grade === "A") row.gradeAKg += qty;
    }

    // current stock by farmer from inventory
    for (const item of centerInventory) {
      if (!item.farmerId) continue;
      const existing = map.get(item.farmerId);
      if (existing) {
        existing.currentStockKg += item.quantity || 0;
      }
    }

    const rows = Array.from(map.values()).map((r) => ({
      ...r,
      status: r.lastDeliveryAt && isWithinDays(r.lastDeliveryAt, 30) ? "active" : "inactive",
    }));

    // sort by last delivery desc, then by total delivered desc
    rows.sort((a, b) => {
      const aT = a.lastDeliveryAt ? new Date(a.lastDeliveryAt).getTime() : 0;
      const bT = b.lastDeliveryAt ? new Date(b.lastDeliveryAt).getTime() : 0;
      if (bT !== aT) return bT - aT;
      return b.totalDeliveredKg - a.totalDeliveredKg;
    });

    return rows;
  }, [centerStockInTransactions, centerInventory]);

  const filteredRows = useMemo(() => {
    const q = search.trim().toLowerCase();
    return farmerRows.filter((r) => {
      const matchesSearch =
        !q ||
        r.farmerName.toLowerCase().includes(q) ||
        r.farmerId.toLowerCase().includes(q);
      const matchesStatus = statusFilter === "all" || r.status === statusFilter;
      return matchesSearch && matchesStatus;
    });
  }, [farmerRows, search, statusFilter]);

  const stats = useMemo(() => {
    const totalFarmers = farmerRows.length;
    const activeFarmers = farmerRows.filter((r) => r.status === "active").length;
    const totalDelivered30dKg = farmerRows
      .filter((r) => r.lastDeliveryAt && isWithinDays(r.lastDeliveryAt, 30))
      .reduce((sum, r) => sum + r.totalDeliveredKg, 0);
    const totalCurrentStockKg = farmerRows.reduce((sum, r) => sum + r.currentStockKg, 0);
    return { totalFarmers, activeFarmers, totalDelivered30dKg, totalCurrentStockKg };
  }, [farmerRows]);

  const farmerHistory = useMemo(() => {
    if (!selectedFarmer) return [] as StockTransaction[];
    return centerStockInTransactions.filter((t) => t.farmerId === selectedFarmer.farmerId);
  }, [centerStockInTransactions, selectedFarmer]);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold">Farmers</h1>
          <p className="text-sm sm:text-base text-muted-foreground mt-1">
            CRM view of farmers who have delivered produce to this centre
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              if (center?.id) {
                fetchTransactions({ centerId: center.id });
                fetchInventory(center.id);
              } else {
                fetchTransactions();
                fetchInventory();
              }
            }}
            disabled={isLoading}
          >
            <IconRefresh className={`h-4 w-4 mr-2 ${isLoading ? "animate-spin" : ""}`} />
            Refresh
          </Button>
          <Button variant="outline" size="sm">
            <IconDownload className="h-4 w-4 mr-2" />
            Export
          </Button>
        </div>
      </div>

      {/* Center selector */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col md:flex-row gap-4 items-start md:items-center">
            <div className="w-full md:w-[320px]">
              <p className="text-sm text-muted-foreground mb-1">Aggregation centre</p>
              <Select
                value={center?.id || ""}
                onValueChange={(id) => {
                  const next = centers.find((c) => c.id === id) || null;
                  setSelectedCenter(next);
                }}
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Select a centre" />
                </SelectTrigger>
                <SelectContent>
                  {centers.map((c) => (
                    <SelectItem key={c.id} value={c.id}>
                      {c.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="flex-1" />
          </div>
        </CardContent>
      </Card>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total farmers</p>
                <p className="text-2xl font-bold">{stats.totalFarmers}</p>
              </div>
              <IconUsers className="h-8 w-8 text-primary" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Active (30 days)</p>
                <p className="text-2xl font-bold">{stats.activeFarmers}</p>
              </div>
              <IconTrendingUp className="h-8 w-8 text-green-600" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Delivered (30 days)</p>
                <p className="text-2xl font-bold">{stats.totalDelivered30dKg.toLocaleString()} kg</p>
              </div>
              <IconCalendar className="h-8 w-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Current centre stock</p>
                <p className="text-2xl font-bold">{stats.totalCurrentStockKg.toLocaleString()} kg</p>
              </div>
              <IconTrendingUp className="h-8 w-8 text-orange-600" />
            </div>
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
                placeholder="Search by farmer name or ID…"
                className="pl-10"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
            <Select value={statusFilter} onValueChange={(v) => setStatusFilter((v as any) || "all")}>
              <SelectTrigger className="w-full md:w-[180px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All statuses</SelectItem>
                <SelectItem value="active">Active (30 days)</SelectItem>
                <SelectItem value="inactive">Inactive</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Table */}
      <Card>
        <CardHeader>
          <CardTitle>Farmers</CardTitle>
          <CardDescription>{filteredRows.length} farmer(s) found</CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="space-y-4">
              {[1, 2, 3].map((i) => (
                <div key={i} className="h-16 bg-muted animate-pulse rounded-lg" />
              ))}
            </div>
          ) : filteredRows.length > 0 ? (
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Farmer</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Delivered</TableHead>
                    <TableHead className="text-right">Deliveries</TableHead>
                    <TableHead className="text-right">Grade A</TableHead>
                    <TableHead className="text-right">Current stock</TableHead>
                    <TableHead>Last delivery</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredRows.map((r) => {
                    const gradeAShare = r.totalDeliveredKg > 0 ? (r.gradeAKg / r.totalDeliveredKg) * 100 : 0;
                    return (
                      <TableRow
                        key={r.farmerId}
                        className="cursor-pointer hover:bg-muted/50"
                        onClick={() => {
                          setSelectedFarmer(r);
                          setFarmerModalOpen(true);
                        }}
                      >
                        <TableCell className="font-medium">
                          <div className="flex flex-col">
                            <span>{r.farmerName}</span>
                            <span className="text-xs text-muted-foreground">{r.farmerId}</span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge
                            variant="outline"
                            className={r.status === "active" ? "bg-green-100 text-green-800" : "bg-gray-100 text-gray-800"}
                          >
                            {r.status}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right font-semibold">{r.totalDeliveredKg.toLocaleString()} kg</TableCell>
                        <TableCell className="text-right">{r.deliveriesCount}</TableCell>
                        <TableCell className="text-right">
                          <span className="font-medium">{gradeAShare.toFixed(0)}%</span>
                        </TableCell>
                        <TableCell className="text-right">{r.currentStockKg.toLocaleString()} kg</TableCell>
                        <TableCell>{formatDate(r.lastDeliveryAt)}</TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </div>
          ) : (
            <div className="text-center py-12">
              <IconUsers className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-lg font-medium text-muted-foreground">No farmers found</p>
              <p className="text-sm text-muted-foreground mt-1">This list is built from stock-in transactions.</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Farmer modal */}
      <Dialog open={farmerModalOpen} onOpenChange={setFarmerModalOpen}>
        <DialogContent className="sm:max-w-[900px]">
          <DialogHeader>
            <DialogTitle>Farmer details</DialogTitle>
            <DialogDescription>
              {selectedFarmer?.farmerName} • {selectedFarmer?.farmerId}
            </DialogDescription>
          </DialogHeader>
          {selectedFarmer && (
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
                <Card>
                  <CardContent className="pt-5">
                    <p className="text-xs text-muted-foreground">Total delivered</p>
                    <p className="text-lg font-semibold">{selectedFarmer.totalDeliveredKg.toLocaleString()} kg</p>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="pt-5">
                    <p className="text-xs text-muted-foreground">Deliveries</p>
                    <p className="text-lg font-semibold">{selectedFarmer.deliveriesCount}</p>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="pt-5">
                    <p className="text-xs text-muted-foreground">Current stock (centre)</p>
                    <p className="text-lg font-semibold">{selectedFarmer.currentStockKg.toLocaleString()} kg</p>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="pt-5">
                    <p className="text-xs text-muted-foreground">Last delivery</p>
                    <p className="text-lg font-semibold">{formatDate(selectedFarmer.lastDeliveryAt)}</p>
                  </CardContent>
                </Card>
              </div>

              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Date</TableHead>
                      <TableHead>Batch</TableHead>
                      <TableHead>Variety</TableHead>
                      <TableHead>Grade</TableHead>
                      <TableHead className="text-right">Qty</TableHead>
                      <TableHead>Center</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {farmerHistory.map((t) => (
                      <TableRow key={t.id}>
                        <TableCell>{formatDateTime(t.createdAt)}</TableCell>
                        <TableCell className="font-medium">{t.batchId || t.id}</TableCell>
                        <TableCell>{t.variety}</TableCell>
                        <TableCell>
                          <Badge
                            variant="outline"
                            className={getGradeBadgeClass((t.grade || t.qualityGrade || "N/A") as string)}
                          >
                            {t.grade || t.qualityGrade || "N/A"}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right">{(t.quantity || 0).toLocaleString()} kg</TableCell>
                        <TableCell>{t.centerName}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}

