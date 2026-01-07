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
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // TODO: Replace with actual API call
    setTimeout(() => {
      const sampleInventory: InventoryItem[] = [
        {
          id: "INV-001",
          variety: "Kenya",
          qualityGrade: "A",
          quantity: 500,
          storageDuration: 2,
          farmerId: "F001",
          farmerName: "James Mutua",
          stockInDate: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
          status: "fresh",
        },
        {
          id: "INV-002",
          variety: "SPK004",
          qualityGrade: "A",
          quantity: 300,
          storageDuration: 5,
          farmerId: "F002",
          farmerName: "Mary Wanjiku",
          stockInDate: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
          status: "aging",
        },
        {
          id: "INV-003",
          variety: "Kabode",
          qualityGrade: "B",
          quantity: 200,
          storageDuration: 8,
          farmerId: "F003",
          farmerName: "Peter Kamau",
          stockInDate: new Date(Date.now() - 8 * 24 * 60 * 60 * 1000).toISOString(),
          status: "critical",
        },
      ];
      setInventory(sampleInventory);
      setFilteredInventory(sampleInventory);
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

    setFilteredInventory(filtered);
  }, [inventory, searchTerm, varietyFilter, gradeFilter, statusFilter]);

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
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Total Stock</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalStock} kg</div>
            <p className="text-xs text-muted-foreground mt-1">Across all varieties</p>
          </CardContent>
        </Card>
        <Card>
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
        <Card>
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
        <Card>
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

      {/* Alerts */}
      {criticalStock.length > 0 && (
        <Card className="border-red-200 bg-red-50">
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <IconAlertTriangle className="h-5 w-5 text-red-600" />
              <div>
                <p className="font-semibold text-red-900">Critical Stock Alert</p>
                <p className="text-sm text-red-800">
                  {criticalStock.length} item(s) have been in storage for more than 7 days. Consider
                  priority dispatch or processing.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

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
          <CardTitle>Current Inventory</CardTitle>
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
                    <TableHead>Quantity</TableHead>
                    <TableHead>Farmer</TableHead>
                    <TableHead>Storage Duration</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Stock In Date</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredInventory.map((item) => (
                    <TableRow key={item.id}>
                      <TableCell className="font-medium">{item.id}</TableCell>
                      <TableCell>{item.variety}</TableCell>
                      <TableCell>
                        <Badge variant="outline" className={getGradeColor(item.qualityGrade)}>
                          Grade {item.qualityGrade}
                        </Badge>
                      </TableCell>
                      <TableCell className="font-semibold">{item.quantity} kg</TableCell>
                      <TableCell>{item.farmerName}</TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1">
                          {item.storageDuration > 7 ? (
                            <IconTrendingDown className="h-4 w-4 text-red-600" />
                          ) : item.storageDuration > 5 ? (
                            <IconTrendingUp className="h-4 w-4 text-yellow-600" />
                          ) : null}
                          <span>{item.storageDuration} days</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline" className={getStatusColor(item.status)}>
                          {item.status}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-sm text-muted-foreground">
                        {new Date(item.stockInDate).toLocaleDateString()}
                      </TableCell>
                    </TableRow>
                  ))}
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

