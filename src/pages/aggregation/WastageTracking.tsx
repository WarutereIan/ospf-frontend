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

interface WastageEntry {
  id: string;
  date: string;
  farmerId: string; // Track farmer origin
  farmerName: string; // Track farmer origin
  inventoryId?: string; // Link to inventory batch
  variety: string;
  qualityGrade: "A" | "B" | "C";
  quantity: number; // kg
  reason: string;
  category: "spoilage" | "damage" | "expired" | "other";
  recordedBy: string;
  notes?: string;
}

const wastageCategories = [
  { value: "spoilage", label: "Spoilage", color: "bg-red-100 text-red-800" },
  { value: "damage", label: "Physical Damage", color: "bg-orange-100 text-orange-800" },
  { value: "expired", label: "Expired", color: "bg-yellow-100 text-yellow-800" },
  { value: "other", label: "Other", color: "bg-gray-100 text-gray-800" },
];

export function WastageTracking() {
  const [wastageEntries, setWastageEntries] = useState<WastageEntry[]>([]);
  const [filteredEntries, setFilteredEntries] = useState<WastageEntry[]>([]);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [varietyFilter, setVarietyFilter] = useState("all");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [dateFilter, setDateFilter] = useState("all");
  const [isLoading, setIsLoading] = useState(true);

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

  // Sample inventory for selection - TODO: Replace with API
  const sampleInventory = [
    {
      id: "INV-001",
      farmerId: "F001",
      farmerName: "James Mutua",
      variety: "Kenya",
      qualityGrade: "A" as const,
      quantity: 500,
    },
    {
      id: "INV-002",
      farmerId: "F002",
      farmerName: "Mary Wanjiku",
      variety: "SPK004",
      qualityGrade: "A" as const,
      quantity: 300,
    },
    {
      id: "INV-003",
      farmerId: "F003",
      farmerName: "Peter Kamau",
      variety: "Kabode",
      qualityGrade: "B" as const,
      quantity: 200,
    },
  ];

  useEffect(() => {
    // TODO: Replace with actual API call
    setTimeout(() => {
      const sampleEntries: WastageEntry[] = [
        {
          id: "WST-001",
          date: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
          farmerId: "F001",
          farmerName: "James Mutua",
          inventoryId: "INV-001",
          variety: "Kenya",
          qualityGrade: "B",
          quantity: 25,
          reason: "Mold growth due to high humidity",
          category: "spoilage",
          recordedBy: "Peter Kariuki",
          notes: "Found during daily inspection",
        },
        {
          id: "WST-002",
          date: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
          farmerId: "F002",
          farmerName: "Mary Wanjiku",
          inventoryId: "INV-002",
          variety: "SPK004",
          qualityGrade: "C",
          quantity: 15,
          reason: "Bruising during transport",
          category: "damage",
          recordedBy: "Jane Muthoni",
        },
        {
          id: "WST-003",
          date: new Date(Date.now() - 8 * 24 * 60 * 60 * 1000).toISOString(),
          farmerId: "F003",
          farmerName: "Peter Kamau",
          inventoryId: "INV-003",
          variety: "Kabode",
          qualityGrade: "A",
          quantity: 10,
          reason: "Exceeded storage duration",
          category: "expired",
          recordedBy: "David Kimani",
          notes: "Stock in storage for 9 days",
        },
      ];
      setWastageEntries(sampleEntries);
      setFilteredEntries(sampleEntries);
      setIsLoading(false);
    }, 1000);
  }, []);

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

  const handleAddWastage = () => {
    if (!newEntry.farmerId || !newEntry.variety || !newEntry.qualityGrade || !newEntry.quantity || !newEntry.reason || !newEntry.category) {
      alert("Please fill all required fields");
      return;
    }

    const entry: WastageEntry = {
      id: `WST-${String(wastageEntries.length + 1).padStart(3, "0")}`,
      date: new Date().toISOString(),
      farmerId: newEntry.farmerId!,
      farmerName: newEntry.farmerName!,
      inventoryId: newEntry.inventoryId,
      variety: newEntry.variety!,
      qualityGrade: newEntry.qualityGrade!,
      quantity: newEntry.quantity!,
      reason: newEntry.reason!,
      category: newEntry.category!,
      recordedBy: "Current User", // TODO: Get from auth context
      notes: newEntry.notes,
    };

    setWastageEntries([entry, ...wastageEntries]);
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
            <DialogTrigger>
              <Button size="sm">
                <IconPlus className="mr-2 h-4 w-4" />
                Record Wastage
              </Button>
            </DialogTrigger>
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
                      const selected = sampleInventory.find((inv) => inv.id === value);
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
                      {sampleInventory.map((inv) => (
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
                        {new Date(entry.date).toLocaleDateString()}
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
