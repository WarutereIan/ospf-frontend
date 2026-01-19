import { useState } from "react";
import { Link } from "react-router-dom";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Field, FieldGroup, FieldLabel } from "@/components/ui/field";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  IconPlus,
  IconPackage,
  IconSearch,
  IconEdit,
  IconTrash,
  IconAlertTriangle,
  IconArrowLeft,
  IconPhoto,
} from "@tabler/icons-react";
import {
  StackedBarChart,
  StatusIndicator,
  ProgressBar,
} from "@/components/visualizations";
import { OnFarmSortingGuide } from "@/components/farmer/OnFarmSortingGuide";

import { IconInfoCircle } from "@tabler/icons-react";

// OFSP Varieties
const ofspVarieties = [
  { label: "Kenya", value: "kenya" },
  { label: "SPK004", value: "spk004" },
  { label: "Kabode", value: "kabode" },
];

// Quality Grades
const qualityGrades = [
  { label: "Grade A - Premium", value: "A", color: "bg-green-100 text-green-800" },
  { label: "Grade B - Standard", value: "B", color: "bg-yellow-100 text-yellow-800" },
  { label: "Grade C - Processing", value: "C", color: "bg-orange-100 text-orange-800" },
];

// Sub-counties in Machakos
const subCounties = [
  { label: "Kangundo", value: "kangundo" },
  { label: "Kathiani", value: "kathiani" },
  { label: "Masinga", value: "masinga" },
  { label: "Yatta", value: "yatta" },
];

interface ProduceListing {
  id: string;
  variety: string;
  quantity: number;
  qualityGrade: string;
  pricePerKg: number;
  location: string;
  description: string;
  status: "active" | "sold" | "inactive";
  createdAt: string;
  photos?: string[];
  batchId: string; // Batch ID for traceability
  qrCode?: string; // QR code for traceability
}

// Sample data - will be replaced with API calls
const sampleListings: ProduceListing[] = [
  {
    id: "LST-001",
    variety: "kenya",
    quantity: 500,
    qualityGrade: "A",
    pricePerKg: 150,
    location: "kangundo",
    description: "Fresh harvest, Grade A quality",
    status: "active",
    createdAt: new Date().toISOString(),
    batchId: "BATCH-LST-001",
    qrCode: "QR-BATCH-LST-001",
  },
  {
    id: "LST-002",
    variety: "spk004",
    quantity: 300,
    qualityGrade: "B",
    pricePerKg: 120,
    location: "kangundo",
    description: "Good quality, ready for market",
    status: "active",
    createdAt: new Date().toISOString(),
    batchId: "BATCH-LST-002",
    qrCode: "QR-BATCH-LST-002",
  },
];

export function ProduceManagement() {
  const [listings, setListings] = useState<ProduceListing[]>(sampleListings);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");
  const [filterVariety, setFilterVariety] = useState("all");
  const [newListingOpen, setNewListingOpen] = useState(false);
  const [newListing, setNewListing] = useState({
    variety: "",
    quantity: "",
    qualityGrade: "",
    pricePerKg: "",
    location: "",
    description: "",
  });

  const filteredListings = listings.filter((listing) => {
    const matchesSearch =
      listing.variety.toLowerCase().includes(searchTerm.toLowerCase()) ||
      listing.id.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = filterStatus === "all" || listing.status === filterStatus;
    const matchesVariety = filterVariety === "all" || listing.variety === filterVariety;
    return matchesSearch && matchesStatus && matchesVariety;
  });

  const handleAddListing = () => {
    if (
      newListing.variety &&
      newListing.quantity &&
      newListing.qualityGrade &&
      newListing.pricePerKg &&
      newListing.location
    ) {
      const listing: ProduceListing = {
        id: `LST-${String(listings.length + 1).padStart(3, "0")}`,
        variety: newListing.variety,
        quantity: parseInt(newListing.quantity),
        qualityGrade: newListing.qualityGrade,
        pricePerKg: parseFloat(newListing.pricePerKg),
        location: newListing.location,
        description: newListing.description,
        status: "active",
        createdAt: new Date().toISOString(),
        batchId: `BATCH-LST-${String(listings.length + 1).padStart(3, "0")}`,
        qrCode: `QR-BATCH-LST-${String(listings.length + 1).padStart(3, "0")}`,
      };

      setListings([...listings, listing]);
      setNewListing({
        variety: "",
        quantity: "",
        qualityGrade: "",
        pricePerKg: "",
        location: "",
        description: "",
      });
      setNewListingOpen(false);
    }
  };

  const handleDeleteListing = (id: string) => {
    setListings(listings.filter((listing) => listing.id !== id));
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "active":
        return "bg-green-100 text-green-800";
      case "sold":
        return "bg-blue-100 text-blue-800";
      case "inactive":
        return "bg-gray-100 text-gray-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getGradeColor = (grade: string) => {
    const gradeInfo = qualityGrades.find((g) => g.value === grade);
    return gradeInfo?.color || "bg-gray-100 text-gray-800";
  };

  const getVarietyName = (value: string) => {
    const variety = ofspVarieties.find((v) => v.value === value);
    return variety?.label || value;
  };

  const getSubCountyName = (value: string) => {
    const subCounty = subCounties.find((s) => s.value === value);
    return subCounty?.label || value;
  };

  // Calculate variety breakdown
  const varietyBreakdown = ofspVarieties.map((variety) => {
    const varietyListings = listings.filter((l) => l.variety === variety.value);
    const totalQuantity = varietyListings.reduce((sum, l) => sum + l.quantity, 0);
    const allQuantity = listings.reduce((sum, l) => sum + l.quantity, 0);
    return {
      name: variety.label,
      quantity: totalQuantity,
      percentage: allQuantity > 0 ? (totalQuantity / allQuantity) * 100 : 0,
    };
  });

  // Calculate listing status counts
  const statusCounts = {
    active: listings.filter((l) => l.status === "active").length,
    pending: listings.filter((l) => l.status === "inactive").length,
    sold: listings.filter((l) => l.status === "sold").length,
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <Link to="/dashboard">
            <Button variant="ghost" size="sm" className="mb-2">
              <IconArrowLeft className="mr-2 h-4 w-4" />
              Back to Dashboard
            </Button>
          </Link>
          <h1 className="text-2xl sm:text-3xl font-bold">Manage Produce</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Post and manage your OFSP produce listings
          </p>
        </div>
        <Dialog open={newListingOpen} onOpenChange={setNewListingOpen}>
          <DialogTrigger>
            <Button>
              <IconPlus className="mr-2 h-4 w-4" />
              Post Produce
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Post New Produce Listing</DialogTitle>
              <DialogDescription>
                Add your OFSP produce to the marketplace for buyers to discover
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <FieldGroup>
                <Field>
                  <FieldLabel htmlFor="variety">OFSP Variety *</FieldLabel>
                  <Select
                    value={newListing.variety}
                    onValueChange={(value) =>
                      setNewListing({ ...newListing, variety: value || "" })
                    }
                  >
                    <SelectTrigger id="variety">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {ofspVarieties.map((variety) => (
                        <SelectItem key={variety.value} value={variety.value}>
                          {variety.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </Field>

                <div className="grid grid-cols-2 gap-4">
                  <Field>
                    <FieldLabel htmlFor="quantity">Quantity (kg) *</FieldLabel>
                    <Input
                      id="quantity"
                      type="number"
                      placeholder="e.g. 500"
                      value={newListing.quantity}
                      onChange={(e) =>
                        setNewListing({ ...newListing, quantity: e.target.value })
                      }
                      min="1"
                    />
                  </Field>
                  <Field>
                    <FieldLabel htmlFor="qualityGrade">Quality Grade *</FieldLabel>
                    <Select
                      value={newListing.qualityGrade}
                      onValueChange={(value) =>
                        setNewListing({ ...newListing, qualityGrade: value || "" })
                      }
                    >
                      <SelectTrigger id="qualityGrade">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {qualityGrades.map((grade) => (
                          <SelectItem key={grade.value} value={grade.value}>
                            {grade.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </Field>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <Field>
                    <FieldLabel htmlFor="pricePerKg">Price per kg (KES) *</FieldLabel>
                    <Input
                      id="pricePerKg"
                      type="number"
                      placeholder="e.g. 150"
                      value={newListing.pricePerKg}
                      onChange={(e) =>
                        setNewListing({ ...newListing, pricePerKg: e.target.value })
                      }
                      min="0"
                      step="0.01"
                    />
                  </Field>
                  <Field>
                    <FieldLabel htmlFor="location">Sub-County *</FieldLabel>
                    <Select
                      value={newListing.location}
                      onValueChange={(value) =>
                        setNewListing({ ...newListing, location: value || "" })
                      }
                    >
                      <SelectTrigger id="location">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {subCounties.map((subCounty) => (
                          <SelectItem key={subCounty.value} value={subCounty.value}>
                            {subCounty.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </Field>
                </div>

                <Field>
                  <FieldLabel htmlFor="description">Description</FieldLabel>
                  <Textarea
                    id="description"
                    placeholder="Add any additional details about your produce..."
                    value={newListing.description}
                    onChange={(e) =>
                      setNewListing({ ...newListing, description: e.target.value })
                    }
                    rows={3}
                  />
                </Field>

                <Field>
                  <FieldLabel>Photos (Optional)</FieldLabel>
                  <Button variant="outline" type="button" className="w-full">
                    <IconPhoto className="mr-2 h-4 w-4" />
                    Upload Photos
                  </Button>
                  <p className="text-xs text-muted-foreground mt-1">
                    Add photos of your produce to attract buyers
                  </p>
                </Field>
              </FieldGroup>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setNewListingOpen(false)}>
                Cancel
              </Button>
              <Button onClick={handleAddListing}>Post Listing</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {/* On-Farm Sorting Guide */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <IconInfoCircle className="h-5 w-5 text-primary" />
                On-Farm Sorting Guide
              </CardTitle>
              <CardDescription>
                Learn how to properly sort your OFSP roots before delivery
              </CardDescription>
            </div>
            <Dialog>
              <DialogTrigger>
                <Button variant="outline">
                  <IconInfoCircle className="mr-2 h-4 w-4" />
                  View Guide
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle>On-Farm Sorting Guide</DialogTitle>
                  <DialogDescription>
                    Follow these steps to prepare your produce for delivery
                  </DialogDescription>
                </DialogHeader>
                <OnFarmSortingGuide />
              </DialogContent>
            </Dialog>
          </div>
        </CardHeader>
      </Card>

      {/* Visualizations */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <StackedBarChart
          data={varietyBreakdown.map((v) => ({
            name: v.name,
            quantity: v.quantity,
          }))}
          bars={[
            {
              dataKey: "quantity",
              name: "Quantity (kg)",
              color: "#22C55E",
            },
          ]}
          title="Variety Breakdown"
          description="Distribution of produce by variety"
          layout="horizontal"
          height={200}
          formatter={(value) => `${value} kg`}
        />
        <Card>
          <CardHeader>
            <CardTitle>Listing Status</CardTitle>
            <CardDescription>Current listing status overview</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <StatusIndicator status="Active" count={statusCounts.active} color="green" />
              <StatusIndicator status="Pending" count={statusCounts.pending} color="yellow" />
              <StatusIndicator status="Sold" count={statusCounts.sold} color="blue" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Active Listings with Stock Progress */}
      {listings.filter((l) => l.status === "active").length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Active Listings</CardTitle>
            <CardDescription>Your currently active produce listings</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {listings
                .filter((l) => l.status === "active")
                .map((listing) => {
                  // Calculate remaining stock (assuming some has been sold/ordered)
                  const initialQuantity = listing.quantity;
                  const remainingQuantity = initialQuantity * 0.8; // Mock: 80% remaining
                  const remainingPercent = (remainingQuantity / initialQuantity) * 100;
                  const daysAgo = Math.floor(
                    (Date.now() - new Date(listing.createdAt).getTime()) / (1000 * 60 * 60 * 24)
                  );

                  return (
                    <div
                      key={listing.id}
                      className="flex items-center gap-4 p-4 border rounded-lg hover:bg-muted/50 transition-colors"
                    >
                      <div className="w-16 h-16 bg-muted rounded-lg flex items-center justify-center">
                        <IconPackage className="h-8 w-8 text-muted-foreground" />
                      </div>
                      <div className="flex-1 space-y-2">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="font-medium">
                              {getVarietyName(listing.variety)}, Grade {listing.qualityGrade}
                            </p>
                            <p className="text-sm text-muted-foreground">
                              {listing.quantity} kg @ KES {listing.pricePerKg}/kg
                            </p>
                          </div>
                          <Badge variant="outline" className={getGradeColor(listing.qualityGrade)}>
                            Grade {listing.qualityGrade}
                          </Badge>
                        </div>
                        <div className="space-y-1">
                          <ProgressBar
                            value={remainingPercent}
                            maxValue={100}
                            color="success"
                            size="md"
                            showValue={false}
                          />
                          <p className="text-xs text-muted-foreground">
                            {remainingPercent.toFixed(0)}% remaining • Listed {daysAgo} days ago
                          </p>
                        </div>
                      </div>
                    </div>
                  );
                })}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle>Your Produce Listings</CardTitle>
          <CardDescription>
            Manage your active and sold produce listings
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col md:flex-row gap-4 mb-6">
            <div className="relative flex-1">
              <IconSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search by variety or listing ID..."
                className="pl-10"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <Select value={filterVariety} onValueChange={(value) => setFilterVariety(value || "all")}>
              <SelectTrigger className="w-[180px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Varieties</SelectItem>
                {ofspVarieties.map((variety) => (
                  <SelectItem key={variety.value} value={variety.value}>
                    {variety.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={filterStatus} onValueChange={(value) => setFilterStatus(value || "all")}>
              <SelectTrigger className="w-[180px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="sold">Sold</SelectItem>
                <SelectItem value="inactive">Inactive</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Listings Table */}
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Listing ID</TableHead>
                  <TableHead>Variety</TableHead>
                  <TableHead>Quantity</TableHead>
                  <TableHead>Quality Grade</TableHead>
                  <TableHead>Price/kg</TableHead>
                  <TableHead>Location</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredListings.length > 0 ? (
                  filteredListings.map((listing) => (
                    <TableRow key={listing.id}>
                      <TableCell className="font-medium">{listing.id}</TableCell>
                      <TableCell>{getVarietyName(listing.variety)}</TableCell>
                      <TableCell>{listing.quantity} kg</TableCell>
                      <TableCell>
                        <Badge variant="outline" className={getGradeColor(listing.qualityGrade)}>
                          Grade {listing.qualityGrade}
                        </Badge>
                      </TableCell>
                      <TableCell>KES {listing.pricePerKg}/kg</TableCell>
                      <TableCell>{getSubCountyName(listing.location)}</TableCell>
                      <TableCell>
                        <Badge variant="outline" className={getStatusColor(listing.status)}>
                          {listing.status}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <Button size="sm" variant="ghost">
                            <IconEdit className="h-4 w-4" />
                          </Button>
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => handleDeleteListing(listing.id)}
                            className="text-destructive"
                          >
                            <IconTrash className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={8} className="text-center py-8">
                      <div className="flex flex-col items-center">
                        <IconPackage className="h-10 w-10 text-muted-foreground mb-2" />
                        <p className="text-lg font-medium text-muted-foreground">
                          No listings found
                        </p>
                        <p className="text-sm text-muted-foreground">
                          Try adjusting your search or filters, or post a new listing
                        </p>
                      </div>
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Total Listings</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{listings.length}</div>
            <p className="text-xs text-muted-foreground">
              {listings.filter((l) => l.status === "active").length} active
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Total Quantity Listed</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {listings.reduce((sum, l) => sum + l.quantity, 0)} kg
            </div>
            <p className="text-xs text-muted-foreground">Across all listings</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Average Price</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              KES{" "}
              {listings.length > 0
                ? Math.round(
                    listings.reduce((sum, l) => sum + l.pricePerKg, 0) / listings.length
                  )
                : 0}
              /kg
            </div>
            <p className="text-xs text-muted-foreground">Average across all listings</p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

