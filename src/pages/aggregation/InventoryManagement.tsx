import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
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

interface InventoryItem {
  id: string;
  variety: string;
  qualityGrade: "A" | "B" | "C";
  quantity: number; // kg
  storageDuration: number; // days
  farmerId: string;
  farmerName: string;
  stockInDate: string;
  status: "fresh" | "aging" | "critical";
}

export function InventoryManagement() {
  const [inventory, setInventory] = useState<InventoryItem[]>([]);
  const [filteredInventory, setFilteredInventory] = useState<InventoryItem[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [varietyFilter, setVarietyFilter] = useState("all");
  const [gradeFilter, setGradeFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [cardFilter, setCardFilter] = useState<"all" | "fresh" | "aging" | "critical">("all");
  const [isLoading, setIsLoading] = useState(true);

  const [treemapData, setTreemapData] = useState<Array<{ name: string; value: number; color: string }>>([]);
  const [agingHeatmapData, setAgingHeatmapData] = useState<Array<{
    batchId: string;
    days: Array<{ day: number; status: "fresh" | "aging" | "critical" }>;
  }>>([]);

  useEffect(() => {
    // TODO: Replace with actual API call
    setTimeout(() => {
      const sampleInventory: InventoryItem[] = [
        {
          id: "INV-001",
          variety: "Kenya",
          qualityGrade: "A",
          quantity: 1200,
          storageDuration: 3,
          farmerId: "F001",
          farmerName: "James M.",
          stockInDate: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
          status: "fresh",
        },
        {
          id: "INV-002",
          variety: "Kenya",
          qualityGrade: "B",
          quantity: 400,
          storageDuration: 5,
          farmerId: "F004",
          farmerName: "John D.",
          stockInDate: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
          status: "aging",
        },
        {
          id: "INV-003",
          variety: "SPK004",
          qualityGrade: "A",
          quantity: 800,
          storageDuration: 2,
          farmerId: "F002",
          farmerName: "Mary W.",
          stockInDate: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
          status: "fresh",
        },
        {
          id: "INV-004",
          variety: "SPK004",
          qualityGrade: "B",
          quantity: 350,
          storageDuration: 6,
          farmerId: "F005",
          farmerName: "Sarah K.",
          stockInDate: new Date(Date.now() - 6 * 24 * 60 * 60 * 1000).toISOString(),
          status: "aging",
        },
        {
          id: "INV-005",
          variety: "Kabode",
          qualityGrade: "A",
          quantity: 200,
          storageDuration: 4,
          farmerId: "F003",
          farmerName: "Peter K.",
          stockInDate: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000).toISOString(),
          status: "fresh",
        },
        {
          id: "INV-006",
          variety: "Kabode",
          qualityGrade: "B",
          quantity: 150,
          storageDuration: 8,
          farmerId: "F006",
          farmerName: "David M.",
          stockInDate: new Date(Date.now() - 8 * 24 * 60 * 60 * 1000).toISOString(),
          status: "critical",
        },
      ];
      setInventory(sampleInventory);
      setFilteredInventory(sampleInventory);

      // Prepare treemap data
      const treemap: Array<{ name: string; value: number; color: string }> = [];
      sampleInventory.forEach((item) => {
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
      const heatmap = sampleInventory.map((item) => {
        const days: Array<{ day: number; status: "fresh" | "aging" | "critical" }> = [];
        for (let day = 1; day <= 7; day++) {
          if (item.storageDuration >= day) {
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
          batchId: item.id,
          days,
        };
      });
      setAgingHeatmapData(heatmap);

      setIsLoading(false);
    }, 1000);
  }, []);

  useEffect(() => {
    let filtered = [...inventory];

    if (searchTerm) {
      filtered = filtered.filter(
        (item) =>
          item.variety.toLowerCase().includes(searchTerm.toLowerCase()) ||
          item.farmerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
          item.id.toLowerCase().includes(searchTerm.toLowerCase())
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
      filtered = filtered.filter((item) => item.status === cardFilter);
    }

    setFilteredInventory(filtered);
  }, [inventory, searchTerm, varietyFilter, gradeFilter, statusFilter, cardFilter]);

  const totalStock = inventory.reduce((sum, item) => sum + item.quantity, 0);
  const agingStock = inventory.filter((item) => item.status === "aging" || item.status === "critical");
  const criticalStock = inventory.filter((item) => item.status === "critical");

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

  const getGradeColor = (grade: string) => {
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
              {inventory.filter((i) => i.status === "fresh").reduce((sum, i) => sum + i.quantity, 0)} kg
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
              {agingStock.reduce((sum, i) => sum + i.quantity, 0)} kg
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
              {criticalStock.reduce((sum, i) => sum + i.quantity, 0)} kg
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
                placeholder="Search by variety, farmer, or ID..."
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
                <SelectItem value="kenya">Kenya</SelectItem>
                <SelectItem value="spk004">SPK004</SelectItem>
                <SelectItem value="kabode">Kabode</SelectItem>
              </SelectContent>
            </Select>
            <Select value={gradeFilter} onValueChange={(value) => setGradeFilter(value || "all")}>
              <SelectTrigger className="w-full md:w-[120px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Grades</SelectItem>
                <SelectItem value="A">Grade A</SelectItem>
                <SelectItem value="B">Grade B</SelectItem>
                <SelectItem value="C">Grade C</SelectItem>
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
                    <TableHead>ID</TableHead>
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
                    const statusEmoji =
                      item.status === "fresh"
                        ? "🟢"
                        : item.status === "aging"
                        ? "🟡"
                        : "🔴";
                    const ageDisplay = `${item.storageDuration}d`;

                    return (
                      <TableRow key={item.id}>
                        <TableCell className="font-medium">{item.id}</TableCell>
                        <TableCell>{item.variety}</TableCell>
                        <TableCell>
                          <Badge variant="outline" className={getGradeColor(item.qualityGrade)}>
                            {item.qualityGrade}
                          </Badge>
                        </TableCell>
                        <TableCell className="font-semibold">{item.quantity}kg</TableCell>
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
    </div>
  );
}

