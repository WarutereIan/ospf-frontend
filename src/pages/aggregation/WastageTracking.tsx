import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  IconAlertTriangle,
  IconTrash,
  IconTrendingDown,
  IconDownload,
  IconPlus,
  IconSearch,
  IconCalendar,
} from "@tabler/icons-react";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { useAggregation } from "@/contexts/AggregationContext";
import { useAuth } from "@/contexts/AuthContext";
import type { WastageEntry } from "@/types/aggregation";

const wastageCategories = [
  { value: "spoilage", label: "Spoilage", color: "bg-red-100 text-red-800" },
  { value: "damage", label: "Physical Damage", color: "bg-orange-100 text-orange-800" },
  { value: "expired", label: "Expired", color: "bg-yellow-100 text-yellow-800" },
  { value: "other", label: "Other", color: "bg-gray-100 text-gray-800" },
];

export function WastageTracking() {
  const { wastageEntries, fetchWastageEntries, recordWastageEntry, inventory, fetchInventory, centers, fetchCenters, selectedCenter, isLoading, wastageFilters, setWastageFilters } = useAggregation();
  const { user } = useAuth();
  
  const [filteredEntries, setFilteredEntries] = useState<WastageEntry[]>([]);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [varietyFilter, setVarietyFilter] = useState("all");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [dateFilter, setDateFilter] = useState("all");

  const [newEntry, setNewEntry] = useState<Partial<WastageEntry>>({
    farmerId: "",
    farmerName: "",
    inventoryId: "",
    variety: "",
    qualityGrade: undefined,
    quantity: 0,
    reason: "",
    category: undefined,
    notes: "",
  });

  // Fetch wastage entries and inventory on mount
  useEffect(() => {
    fetchCenters();
    fetchInventory(selectedCenter?.id);
    fetchWastageEntries();
  }, [fetchCenters, fetchInventory, fetchWastageEntries, selectedCenter?.id]);

  useEffect(() => {
    let filtered = [...wastageEntries];

    if (searchTerm) {
      filtered = filtered.filter(
        (entry) =>
          entry.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
          entry.variety.toLowerCase().includes(searchTerm.toLowerCase()) ||
          entry.reason.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (varietyFilter !== "all") {
      filtered = filtered.filter((entry) => entry.variety.toLowerCase() === varietyFilter);
    }

    if (categoryFilter !== "all") {
      filtered = filtered.filter((entry) => entry.category === categoryFilter);
    }

    if (dateFilter !== "all") {
      const now = new Date();
      const filterDate = new Date();
      switch (dateFilter) {
        case "today":
          filterDate.setHours(0, 0, 0, 0);
          filtered = filtered.filter((entry) => new Date(entry.date) >= filterDate);
          break;
        case "week":
          filterDate.setDate(now.getDate() - 7);
          filtered = filtered.filter((entry) => new Date(entry.date) >= filterDate);
          break;
        case "month":
          filterDate.setMonth(now.getMonth() - 1);
          filtered = filtered.filter((entry) => new Date(entry.date) >= filterDate);
          break;
      }
    }

    setFilteredEntries(filtered);
  }, [wastageEntries, searchTerm, varietyFilter, categoryFilter, dateFilter]);

  const handleAddWastage = async () => {
    if (!newEntry.farmerId || !newEntry.variety || !newEntry.qualityGrade || !newEntry.quantity || !newEntry.reason || !newEntry.category) {
      alert("Please fill all required fields");
      return;
    }

    if (!selectedCenter) {
      alert("Please select an aggregation center");
      return;
    }

    try {
      const wastageEntry: Partial<WastageEntry> = {
        centerId: selectedCenter.id,
        date: new Date().toISOString(),
        farmerId: newEntry.farmerId,
        farmerName: newEntry.farmerName || "",
        inventoryId: newEntry.inventoryId,
        variety: newEntry.variety || "",
        qualityGrade: newEntry.qualityGrade as "A" | "B" | "C",
        quantity: newEntry.quantity || 0,
        reason: newEntry.reason || "",
        category: newEntry.category as "spoilage" | "damage" | "expired" | "other",
        recordedBy: user?.id || "",
        notes: newEntry.notes,
      };

      await recordWastageEntry(wastageEntry);
      
      setNewEntry({
        farmerId: "",
        farmerName: "",
        inventoryId: "",
        variety: "",
        qualityGrade: undefined,
        quantity: 0,
        reason: "",
        category: undefined,
        notes: "",
      });
      setIsDialogOpen(false);
      alert("Wastage entry recorded successfully!");
    } catch (error) {
      console.error("Failed to record wastage:", error);
      alert("Failed to record wastage. Please try again.");
    }
  };

  const totalWastage = wastageEntries.reduce((sum, entry) => sum + entry.quantity, 0);
  const wastageByCategory = wastageEntries.reduce((acc, entry) => {
    acc[entry.category] = (acc[entry.category] || 0) + entry.quantity;
    return acc;
  }, {} as Record<string, number>);

  const getCategoryColor = (category: string) => {
    return wastageCategories.find((c) => c.value === category)?.color || "bg-gray-100 text-gray-800";
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold">Wastage Tracking</h1>
          <p className="text-sm sm:text-base text-muted-foreground mt-1">
            Record and analyze post-harvest losses
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm">
            <IconDownload className="mr-2 h-4 w-4" />
            Export Report
          </Button>
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger
              render={
                <Button size="sm">
                  <IconPlus className="mr-2 h-4 w-4" />
                  Record Wastage
                </Button>
              }
            />
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>Record Wastage</DialogTitle>
                <DialogDescription>Record post-harvest loss for analysis</DialogDescription>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <div className="space-y-2">
                  <Label>Select Inventory Batch (Farmer) *</Label>
                  <Select
                    value={newEntry.inventoryId}
                    onValueChange={(value) => {
                      const selected = inventory.find((inv) => inv.id === value);
                      if (selected) {
                        setNewEntry((prev) => ({
                          ...prev,
                          inventoryId: selected.id,
                          farmerId: selected.farmerId,
                          farmerName: selected.farmerName,
                          variety: selected.variety,
                          qualityGrade: selected.qualityGrade,
                        }));
                      }
                    }}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {inventory.map((inv) => (
                        <SelectItem key={inv.id} value={inv.id}>
                          {inv.farmerName} - {inv.variety} Grade {inv.qualityGrade} ({inv.quantity} kg)
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {newEntry.farmerName && (
                    <div className="p-2 bg-blue-50 border border-blue-200 rounded text-sm">
                      <p className="font-semibold">From Farmer: {newEntry.farmerName}</p>
                      <p className="text-xs text-muted-foreground">
                        {newEntry.variety} - Grade {newEntry.qualityGrade}
                      </p>
                    </div>
                  )}
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="quantity">Quantity (kg) *</Label>
                    <Input
                      id="quantity"
                      type="number"
                      min={0}
                      step={0.1}
                      value={newEntry.quantity || ""}
                      onChange={(e) =>
                        setNewEntry((prev) => ({ ...prev, quantity: parseFloat(e.target.value) || 0 }))
                      }
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="category">Category *</Label>
                    <Select
                      value={newEntry.category}
                      onValueChange={(value) =>
                        setNewEntry((prev) => ({ ...prev, category: value as any }))
                      }
                    >
                      <SelectTrigger id="category">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {wastageCategories.map((cat) => (
                          <SelectItem key={cat.value} value={cat.value}>
                            {cat.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="reason">Reason *</Label>
                  <Input
                    id="reason"
                    placeholder="e.g., Mold growth, Physical damage, etc."
                    value={newEntry.reason}
                    onChange={(e) => setNewEntry((prev) => ({ ...prev, reason: e.target.value }))}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="notes">Notes (Optional)</Label>
                  <Textarea
                    id="notes"
                    placeholder="Additional details..."
                    value={newEntry.notes}
                    onChange={(e) => setNewEntry((prev) => ({ ...prev, notes: e.target.value }))}
                    rows={3}
                  />
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
                  Cancel
                </Button>
                <Button onClick={handleAddWastage}>Record Wastage</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Total Wastage</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">{totalWastage} kg</div>
            <p className="text-xs text-muted-foreground mt-1">All time</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Spoilage</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {wastageByCategory["spoilage"] || 0} kg
            </div>
            <p className="text-xs text-muted-foreground mt-1">Mold, rot, etc.</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Physical Damage</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {wastageByCategory["damage"] || 0} kg
            </div>
            <p className="text-xs text-muted-foreground mt-1">Bruising, cuts, etc.</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Expired</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {wastageByCategory["expired"] || 0} kg
            </div>
            <p className="text-xs text-muted-foreground mt-1">Exceeded storage</p>
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
                placeholder="Search by ID, variety, or reason..."
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
            <Select value={categoryFilter} onValueChange={(value) => setCategoryFilter(value || "all")}>
              <SelectTrigger className="w-full md:w-[150px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Categories</SelectItem>
                {wastageCategories.map((cat) => (
                  <SelectItem key={cat.value} value={cat.value}>
                    {cat.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={dateFilter} onValueChange={(value) => setDateFilter(value || "all")}>
              <SelectTrigger className="w-full md:w-[150px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Time</SelectItem>
                <SelectItem value="today">Today</SelectItem>
                <SelectItem value="week">Last 7 Days</SelectItem>
                <SelectItem value="month">Last 30 Days</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Wastage Entries Table */}
      <Card>
        <CardHeader>
          <CardTitle>Wastage Records</CardTitle>
          <CardDescription>{filteredEntries.length} record(s) found</CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="space-y-4">
              {[1, 2, 3].map((i) => (
                <div key={i} className="h-16 bg-muted animate-pulse rounded-lg" />
              ))}
            </div>
          ) : filteredEntries.length > 0 ? (
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>ID</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead>Farmer</TableHead>
                    <TableHead>Variety</TableHead>
                    <TableHead>Grade</TableHead>
                    <TableHead>Quantity</TableHead>
                    <TableHead>Category</TableHead>
                    <TableHead>Reason</TableHead>
                    <TableHead>Recorded By</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredEntries.map((entry) => (
                    <TableRow key={entry.id}>
                      <TableCell className="font-medium">{entry.id}</TableCell>
                      <TableCell>
                        {new Date(entry.createdAt || entry.date).toLocaleDateString()}
                      </TableCell>
                      <TableCell>
                        <div className="text-sm">
                          <p className="font-medium">{entry.farmerName}</p>
                          <p className="text-xs text-muted-foreground">{entry.farmerId}</p>
                        </div>
                      </TableCell>
                      <TableCell>{entry.variety}</TableCell>
                      <TableCell>
                        <Badge variant="outline">Grade {entry.qualityGrade}</Badge>
                      </TableCell>
                      <TableCell className="font-semibold text-red-600">{entry.quantity} kg</TableCell>
                      <TableCell>
                        <Badge variant="outline" className={getCategoryColor(entry.category)}>
                          {wastageCategories.find((c) => c.value === entry.category)?.label}
                        </Badge>
                      </TableCell>
                      <TableCell className="max-w-xs truncate">{entry.reason}</TableCell>
                      <TableCell className="text-sm">{entry.recordedBy}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          ) : (
            <div className="text-center py-12">
              <IconTrash className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-lg font-medium text-muted-foreground">No wastage records found</p>
              <p className="text-sm text-muted-foreground mt-1">Try adjusting your filters</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
