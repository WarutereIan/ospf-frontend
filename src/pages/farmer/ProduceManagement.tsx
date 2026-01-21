import { useState, useEffect } from "react";
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
  IconTruck,
  IconQrcode,
  IconEye,
} from "@tabler/icons-react";
import {
  StackedBarChart,
  StatusIndicator,
  ProgressBar,
} from "@/components/visualizations";
import { OnFarmSortingGuide } from "@/components/farmer/OnFarmSortingGuide";
import { IconInfoCircle } from "@tabler/icons-react";
import { useMarketplace } from "@/contexts/MarketplaceContext";
import { useAuth } from "@/contexts/AuthContext";
import { useTransport } from "@/contexts/TransportContext";
import { BatchTraceabilityDialog, type BatchTraceabilityInfo } from "@/components/buyer/BatchTraceabilityDialog";
import { getFarmerPickupBookings } from "@/services/transportService";
import { cn } from "@/lib/utils";
import type { ProduceListing } from "@/types/marketplace";
import type { PickupSlotBooking } from "@/types/transport";

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

type ProduceType = "all" | "listings" | "picked_up";

interface UnifiedProduce {
  id: string;
  type: "listing" | "picked_up";
  variety: string;
  quantity: number;
  qualityGrade: "A" | "B" | "C";
  batchId?: string;
  qrCode?: string;
  status: string;
  location: string;
  createdAt: string;
  // Listing-specific
  listing?: ProduceListing;
  pricePerKg?: number;
  availableQuantity?: number;
  // Picked up-specific
  booking?: PickupSlotBooking;
  aggregationCenter?: string;
  pickupDate?: string;
  lifecycleStage?: string;
}

export function ProduceManagement() {
  const { listings, fetchListings, createListing, updateListing, deleteListing, isLoading, listingFilters, setListingFilters } = useMarketplace();
  const { user } = useAuth();
  const { fetchFarmerBookings } = useTransport();
  
  const [activeTab, setActiveTab] = useState<ProduceType>("all");
  const [pickedUpProduce, setPickedUpProduce] = useState<PickupSlotBooking[]>([]);
  const [isLoadingPickedUp, setIsLoadingPickedUp] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");
  const [filterVariety, setFilterVariety] = useState("all");
  const [newListingOpen, setNewListingOpen] = useState(false);
  const [traceabilityDialogOpen, setTraceabilityDialogOpen] = useState(false);
  const [selectedBatchId, setSelectedBatchId] = useState<string | null>(null);
  const [newListing, setNewListing] = useState({
    variety: "",
    quantity: "",
    qualityGrade: "",
    pricePerKg: "",
    location: "",
    description: "",
  });

  // Fetch farmer's listings on mount and when filters change
  useEffect(() => {
    if (user?.id) {
      const filters: any = {
        farmerId: user.id,
        status: filterStatus !== "all" ? filterStatus : undefined,
        variety: filterVariety !== "all" ? filterVariety : undefined,
        searchQuery: searchTerm || undefined,
      };
      fetchListings(filters);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filterStatus, filterVariety, user?.id]);

  // Fetch picked up produce from pickup bookings
  useEffect(() => {
    const loadPickedUpProduce = async () => {
      if (user?.id) {
        setIsLoadingPickedUp(true);
        try {
          const bookings = await getFarmerPickupBookings(user.id);
          // Filter only picked up bookings with batch IDs
          const pickedUp = bookings.filter(
            (b) => b.pickupConfirmed && b.batchId && (b.status === "picked_up" || b.status === "completed")
          );
          setPickedUpProduce(pickedUp);
        } catch (err) {
          console.error("Failed to load picked up produce:", err);
        } finally {
          setIsLoadingPickedUp(false);
        }
      }
    };
    loadPickedUpProduce();
  }, [user?.id]);

  // Create unified produce list
  const unifiedProduce: UnifiedProduce[] = [
    // Listings
    ...listings.map((listing) => ({
      id: listing.id,
      type: "listing" as const,
      variety: listing.variety,
      quantity: listing.quantity,
      qualityGrade: listing.qualityGrade,
      batchId: listing.batchId,
      qrCode: listing.qrCode,
      status: listing.status,
      location: listing.location,
      createdAt: listing.createdAt,
      listing,
      pricePerKg: listing.pricePerKg,
      availableQuantity: listing.availableQuantity,
      lifecycleStage: listing.status === "active" ? "Listed on Marketplace" : listing.status === "sold" ? "Sold" : "Inactive",
    })),
    // Picked up produce
    ...pickedUpProduce.map((booking) => ({
      id: booking.id,
      type: "picked_up" as const,
      variety: booking.variety || "Unknown",
      quantity: booking.quantity,
      qualityGrade: booking.qualityGrade || "A",
      batchId: booking.batchId,
      qrCode: booking.qrCode,
      status: booking.status,
      location: booking.location,
      createdAt: booking.bookedAt,
      booking,
      lifecycleStage: booking.status === "picked_up" ? "Picked Up - In Transit" : booking.status === "completed" ? "Delivered to Aggregation Center" : "Confirmed",
    })),
  ];

  // Filter unified produce based on active tab
  const filteredUnifiedProduce = unifiedProduce.filter((produce) => {
    if (activeTab === "listings" && produce.type !== "listing") return false;
    if (activeTab === "picked_up" && produce.type !== "picked_up") return false;
    
    if (filterVariety !== "all" && produce.variety !== filterVariety) return false;
    if (filterStatus !== "all" && produce.status !== filterStatus) return false;
    
    if (searchTerm) {
      const search = searchTerm.toLowerCase();
      return (
        produce.variety.toLowerCase().includes(search) ||
        produce.id.toLowerCase().includes(search) ||
        produce.batchId?.toLowerCase().includes(search) ||
        produce.location.toLowerCase().includes(search)
      );
    }
    
    return true;
  });

  const handleViewTraceability = (batchId: string) => {
    setSelectedBatchId(batchId);
    setTraceabilityDialogOpen(true);
  };

  const handleBatchLookup = async (batchId: string): Promise<BatchTraceabilityInfo | null> => {
    // Find the produce item with this batch ID
    const produce = unifiedProduce.find((p) => p.batchId === batchId);
    if (!produce) return null;

    // Mock traceability info - in real app, fetch from API
    return new Promise((resolve) => {
      setTimeout(() => {
        const steps = [];
        if (produce.type === "listing") {
          steps.push({
            id: "1",
            stage: "Harvest",
            location: produce.location,
            timestamp: produce.createdAt,
            actor: user?.name || "Farmer",
            actorRole: "Farmer",
            status: "completed" as const,
            notes: "Produce harvested and listed on marketplace",
          });
        } else if (produce.booking) {
          steps.push({
            id: "1",
            stage: "Harvest",
            location: produce.location,
            timestamp: produce.booking.bookedAt,
            actor: user?.name || "Farmer",
            actorRole: "Farmer",
            status: "completed" as const,
            notes: "Produce harvested",
          });
          if (produce.booking.pickupConfirmedAt) {
            steps.push({
              id: "2",
              stage: "Pickup Confirmed",
              location: produce.location,
              timestamp: produce.booking.pickupConfirmedAt,
              actor: user?.name || "Farmer",
              actorRole: "Farmer",
              status: "completed" as const,
              notes: `Batch ${batchId} created. Quantity: ${produce.quantity} kg`,
            });
          }
          if (produce.status === "completed") {
            steps.push({
              id: "3",
              stage: "Delivered to Aggregation Center",
              location: "Aggregation Center",
              timestamp: produce.booking.pickupConfirmedAt || new Date().toISOString(),
              actor: "Transport Provider",
              actorRole: "Logistics",
              status: "completed" as const,
              notes: "Produce delivered to aggregation center",
            });
          }
        }

        resolve({
          batchId,
          qrCode: produce.qrCode,
          variety: produce.variety,
          quantity: produce.quantity,
          qualityGrade: produce.qualityGrade,
          farmerId: user?.id || "",
          farmerName: user?.name || "",
          farmerLocation: produce.location,
          aggregationCenter: produce.aggregationCenter || "Not yet delivered",
          steps,
          currentStatus: produce.lifecycleStage || produce.status,
          currentLocation: produce.location,
        });
      }, 500);
    });
  };

  const handleAddListing = async () => {
    if (
      newListing.variety &&
      newListing.quantity &&
      newListing.qualityGrade &&
      newListing.pricePerKg &&
      newListing.location
    ) {
      try {
        const listing: Partial<ProduceListing> = {
          variety: newListing.variety as any,
          quantity: parseInt(newListing.quantity),
          availableQuantity: parseInt(newListing.quantity),
          qualityGrade: newListing.qualityGrade as any,
          pricePerKg: parseFloat(newListing.pricePerKg),
          location: newListing.location,
          subCounty: newListing.location,
          description: newListing.description,
          status: "active",
        };

        await createListing(listing);
        setNewListing({
          variety: "",
          quantity: "",
          qualityGrade: "",
          pricePerKg: "",
          location: "",
          description: "",
        });
        setNewListingOpen(false);
        // Refresh listings
        if (user?.id) {
          await fetchListings({ farmerId: user.id });
        }
      } catch (error) {
        console.error("Failed to create listing:", error);
        alert("Failed to create listing. Please try again.");
      }
    }
  };

  const handleDeleteListing = async (id: string) => {
    try {
      await deleteListing(id);
      // Refresh listings
      if (user?.id) {
        await fetchListings({ farmerId: user.id });
      }
    } catch (error) {
      console.error("Failed to delete listing:", error);
      alert("Failed to delete listing. Please try again.");
    }
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

  // Calculate variety breakdown (from all produce)
  const varietyBreakdown = ofspVarieties.map((variety) => {
    const varietyProduce = unifiedProduce.filter((p) => p.variety === variety.value);
    const totalQuantity = varietyProduce.reduce((sum, p) => sum + p.quantity, 0);
    const allQuantity = unifiedProduce.reduce((sum, p) => sum + p.quantity, 0);
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
          <h1 className="text-2xl sm:text-3xl font-bold">My Produce</h1>
          <p className="text-sm text-muted-foreground mt-1">
            View and manage all your produce - listings and picked up batches with full traceability
          </p>
        </div>
        <Dialog open={newListingOpen} onOpenChange={setNewListingOpen}>
          <DialogTrigger
            render={
              <Button>
                <IconPlus className="mr-2 h-4 w-4" />
                Post Produce
              </Button>
            }
          />
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

      {/* Tab Navigation */}
      <div className="border-b border-stone-200">
        <div className="flex gap-2">
          <Button
            variant="ghost"
            onClick={() => setActiveTab("all")}
            className={cn(
              "rounded-none border-b-2 border-transparent -mb-px",
              activeTab === "all"
                ? "border-primary text-primary font-semibold"
                : "text-stone-600 hover:text-stone-900"
            )}
          >
            <IconPackage className="mr-2 h-4 w-4" />
            All Produce ({unifiedProduce.length})
          </Button>
          <Button
            variant="ghost"
            onClick={() => setActiveTab("listings")}
            className={cn(
              "rounded-none border-b-2 border-transparent -mb-px",
              activeTab === "listings"
                ? "border-primary text-primary font-semibold"
                : "text-stone-600 hover:text-stone-900"
            )}
          >
            <IconPackage className="mr-2 h-4 w-4" />
            Listings ({listings.length})
          </Button>
          <Button
            variant="ghost"
            onClick={() => setActiveTab("picked_up")}
            className={cn(
              "rounded-none border-b-2 border-transparent -mb-px",
              activeTab === "picked_up"
                ? "border-primary text-primary font-semibold"
                : "text-stone-600 hover:text-stone-900"
            )}
          >
            <IconTruck className="mr-2 h-4 w-4" />
            Picked Up ({pickedUpProduce.length})
          </Button>
        </div>
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
              <DialogTrigger
                render={
                  <Button variant="outline">
                    <IconInfoCircle className="mr-2 h-4 w-4" />
                    View Guide
                  </Button>
                }
              />
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

   

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle>
            {activeTab === "all" && "All Produce"}
            {activeTab === "listings" && "Produce Listings"}
            {activeTab === "picked_up" && "Picked Up Produce"}
          </CardTitle>
          <CardDescription>
            {activeTab === "all" && "View all your produce - listings and picked up batches"}
            {activeTab === "listings" && "Manage your active and sold produce listings"}
            {activeTab === "picked_up" && "Track produce that has been picked up for delivery"}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col md:flex-row gap-4 mb-6">
            <div className="relative flex-1">
              <IconSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search by variety, batch ID, or location..."
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
                {activeTab !== "picked_up" && (
                  <>
                    <SelectItem value="active">Active</SelectItem>
                    <SelectItem value="sold">Sold</SelectItem>
                    <SelectItem value="inactive">Inactive</SelectItem>
                  </>
                )}
                {activeTab === "picked_up" && (
                  <>
                    <SelectItem value="picked_up">Picked Up</SelectItem>
                    <SelectItem value="completed">Delivered</SelectItem>
                  </>
                )}
              </SelectContent>
            </Select>
          </div>

          {/* Unified Produce Table */}
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Type</TableHead>
                  <TableHead>Batch ID</TableHead>
                  <TableHead>Variety</TableHead>
                  <TableHead>Quantity</TableHead>
                  <TableHead>Quality Grade</TableHead>
                  {activeTab !== "picked_up" && <TableHead>Price/kg</TableHead>}
                  <TableHead>Location</TableHead>
                  <TableHead>Lifecycle Stage</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoading || isLoadingPickedUp ? (
                  <TableRow>
                    <TableCell colSpan={9} className="text-center py-8">
                      <div className="flex items-center justify-center">
                        <IconPackage className="h-6 w-6 animate-spin text-muted-foreground mr-2" />
                        <span className="text-muted-foreground">Loading produce...</span>
                      </div>
                    </TableCell>
                  </TableRow>
                ) : filteredUnifiedProduce.length > 0 ? (
                  filteredUnifiedProduce.map((produce) => (
                    <TableRow key={produce.id}>
                      <TableCell>
                        <Badge variant="outline" className={produce.type === "listing" ? "bg-blue-50 text-blue-700" : "bg-green-50 text-green-700"}>
                          {produce.type === "listing" ? "Listing" : "Picked Up"}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        {produce.batchId ? (
                          <div className="flex items-center gap-2">
                            <span className="font-mono text-xs">{produce.batchId}</span>
                            {produce.qrCode && <IconQrcode className="h-4 w-4 text-muted-foreground" />}
                          </div>
                        ) : (
                          <span className="text-muted-foreground text-sm">No batch ID</span>
                        )}
                      </TableCell>
                      <TableCell>{getVarietyName(produce.variety)}</TableCell>
                      <TableCell>{produce.quantity} kg</TableCell>
                      <TableCell>
                        <Badge variant="outline" className={getGradeColor(produce.qualityGrade)}>
                          Grade {produce.qualityGrade}
                        </Badge>
                      </TableCell>
                      {activeTab !== "picked_up" && (
                        <TableCell>
                          {produce.pricePerKg ? `KES ${produce.pricePerKg}/kg` : "-"}
                        </TableCell>
                      )}
                      <TableCell>{getSubCountyName(produce.location)}</TableCell>
                      <TableCell>
                        <Badge variant="outline" className={getStatusColor(produce.status)}>
                          {produce.lifecycleStage || produce.status}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          {produce.batchId && (
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => handleViewTraceability(produce.batchId!)}
                              title="View Batch Traceability"
                            >
                              <IconEye className="h-4 w-4" />
                            </Button>
                          )}
                          {produce.type === "listing" && (
                            <>
                              <Button size="sm" variant="ghost">
                                <IconEdit className="h-4 w-4" />
                              </Button>
                              <Button
                                size="sm"
                                variant="ghost"
                                onClick={() => handleDeleteListing(produce.id)}
                                className="text-destructive"
                              >
                                <IconTrash className="h-4 w-4" />
                              </Button>
                            </>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={9} className="text-center py-8">
                      <div className="flex flex-col items-center">
                        <IconPackage className="h-10 w-10 text-muted-foreground mb-2" />
                        <p className="text-lg font-medium text-muted-foreground">
                          No produce found
                        </p>
                        <p className="text-sm text-muted-foreground">
                          {activeTab === "listings" && "Try adjusting your search or filters, or post a new listing"}
                          {activeTab === "picked_up" && "No picked up produce found. Book a pickup schedule to get started."}
                          {activeTab === "all" && "Try adjusting your search or filters"}
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
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Total Produce</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{unifiedProduce.length}</div>
            <p className="text-xs text-muted-foreground">
              {listings.length} listings, {pickedUpProduce.length} picked up
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Total Quantity</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {unifiedProduce.reduce((sum, p) => sum + p.quantity, 0)} kg
            </div>
            <p className="text-xs text-muted-foreground">Across all produce</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">With Batch ID</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {unifiedProduce.filter((p) => p.batchId).length}
            </div>
            <p className="text-xs text-muted-foreground">Traceable batches</p>
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
            <p className="text-xs text-muted-foreground">Average listing price</p>
          </CardContent>
        </Card>
      </div>

      {/* Batch Traceability Dialog */}
      <BatchTraceabilityDialog
        open={traceabilityDialogOpen}
        onOpenChange={setTraceabilityDialogOpen}
        batchId={selectedBatchId || undefined}
        onLookup={handleBatchLookup}
      />
    </div>
  );
}

