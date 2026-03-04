import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { SearchableSelect } from "@/components/ui/searchable-select";
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
  IconLoader2,
  IconX,
  IconInfoCircle,
} from "@tabler/icons-react";
import {
  StackedBarChart,
  StatusIndicator,
  ProgressBar,
} from "@/components/visualizations";
import { OnFarmSortingGuide } from "@/components/farmer/OnFarmSortingGuide";
import { useMarketplace } from "@/contexts/MarketplaceContext";
import { useAuth } from "@/contexts/AuthContext";
import { useTransport } from "@/contexts/TransportContext";
import { useAggregation } from "@/contexts/AggregationContext";
import { BatchTraceabilityDialog, type BatchTraceabilityInfo } from "@/components/buyer/BatchTraceabilityDialog";
import { getBatchTraceability } from "@/services/traceabilityService";
import { getFarmerPickupBookings } from "@/services/transportService";
import { getProfileById } from "@/services/profileService";
import { getCounties, getSubCounties, getWards, getVillages } from "@/services/locationsService";
import type { County, SubCounty, Ward, Village } from "@/types/locations";
import { showSuccess, showError, formatApiError } from "@/lib/toast";
import { cn } from "@/lib/utils";
import { uploadImage, getImageFullUrl } from "@/services/uploadService";
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

const quantityUnits = [
  { label: "Kilograms (kg)", value: "kg" },
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

const initialNewListing = {
  variety: "",
  quantity: "",
  quantityUnit: "kg",
  qualityGrade: "",
  pricePerKg: "",
  expectedReadyAt: "",
  countyId: "",
  subCountyId: "",
  wardId: "",
  villageId: "",
  aggregationCenterId: "",
  description: "",
  photos: [] as string[],
};

export function ProduceManagement() {
  const { listings, fetchListings, createListing, updateListing, deleteListing, isLoading, listingFilters, setListingFilters } = useMarketplace();
  const { user } = useAuth();
  const { fetchFarmerBookings } = useTransport();
  const { centers: aggregationCenters, fetchCenters } = useAggregation();

  const [activeTab, setActiveTab] = useState<ProduceType>("all");
  const [pickedUpProduce, setPickedUpProduce] = useState<PickupSlotBooking[]>([]);
  const [isLoadingPickedUp, setIsLoadingPickedUp] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");
  const [filterVariety, setFilterVariety] = useState("all");
  const [newListingOpen, setNewListingOpen] = useState(false);
  const [traceabilityDialogOpen, setTraceabilityDialogOpen] = useState(false);
  const [selectedBatchId, setSelectedBatchId] = useState<string | null>(null);
  const [newListing, setNewListing] = useState(initialNewListing);
  const [uploadingPhotos, setUploadingPhotos] = useState(false);
  const [locationCounties, setLocationCounties] = useState<County[]>([]);
  const [locationSubCounties, setLocationSubCounties] = useState<SubCounty[]>([]);
  const [locationWards, setLocationWards] = useState<Ward[]>([]);
  const [locationVillages, setLocationVillages] = useState<Village[]>([]);

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

  // When post-produce dialog opens: fetch aggregation centers, locations, and auto-link assigned centre from farmer profile
  useEffect(() => {
    if (!newListingOpen) return;
    fetchCenters();
    getCounties().then(setLocationCounties);
    if (user?.id) {
      getProfileById(user.id).then((profile) => {
        if (profile?.aggregationCenterId) {
          setNewListing((prev) => ({ ...prev, aggregationCenterId: profile.aggregationCenterId || prev.aggregationCenterId }));
        }
      });
    }
  }, [newListingOpen, user?.id, fetchCenters]);

  useEffect(() => {
    if (!newListing.countyId) {
      setLocationSubCounties([]);
      return;
    }
    getSubCounties(newListing.countyId).then(setLocationSubCounties);
  }, [newListing.countyId]);

  useEffect(() => {
    if (!newListing.subCountyId) {
      setLocationWards([]);
      return;
    }
    getWards(newListing.subCountyId).then(setLocationWards);
  }, [newListing.subCountyId]);

  useEffect(() => {
    if (!newListing.wardId) {
      setLocationVillages([]);
      return;
    }
    getVillages(newListing.wardId).then(setLocationVillages);
  }, [newListing.wardId]);

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

  const handlePostProducePhotoUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files?.length) return;
    setUploadingPhotos(true);
    try {
      const urls: string[] = [];
      for (let i = 0; i < files.length; i++) {
        const { url } = await uploadImage(files[i]);
        urls.push(url);
      }
      setNewListing((prev) => ({ ...prev, photos: [...(prev.photos || []), ...urls] }));
    } catch (err: unknown) {
      showError("Upload failed", err instanceof Error ? err.message : "Failed to upload photos");
    } finally {
      setUploadingPhotos(false);
      event.target.value = "";
    }
  };

  const handleRemovePostProducePhoto = (index: number) => {
    setNewListing((prev) => ({
      ...prev,
      photos: prev.photos?.filter((_, i) => i !== index) ?? [],
    }));
  };

  const handleBatchLookup = async (batchId: string): Promise<BatchTraceabilityInfo | null> => {
    try {
      return await getBatchTraceability(batchId);
    } catch {
      return null;
    }
  };

  const handleAddListing = async () => {
    const hasRequired =
      newListing.variety &&
      newListing.quantity &&
      newListing.qualityGrade &&
      newListing.pricePerKg &&
      newListing.expectedReadyAt &&
      newListing.countyId &&
      newListing.subCountyId &&
      newListing.wardId &&
      newListing.villageId &&
      newListing.aggregationCenterId;
    if (!hasRequired) return;
    const countyName = locationCounties.find((c) => c.id === newListing.countyId)?.name ?? "";
    const subCountyName = locationSubCounties.find((s) => s.id === newListing.subCountyId)?.name ?? "";
    const wardName = locationWards.find((w) => w.id === newListing.wardId)?.name ?? "";
    const villageName = locationVillages.find((v) => v.id === newListing.villageId)?.name ?? "";
    try {
      const photos = newListing.photos?.length ? newListing.photos : undefined;
      const listing: Partial<ProduceListing> = {
        variety: newListing.variety as any,
        quantity: parseInt(newListing.quantity),
        availableQuantity: parseInt(newListing.quantity),
        quantityUnit: newListing.quantityUnit,
        qualityGrade: newListing.qualityGrade as any,
        pricePerKg: parseFloat(newListing.pricePerKg),
        expectedReadyAt: new Date(newListing.expectedReadyAt).toISOString(),
        village: villageName,
        ward: wardName,
        location: subCountyName,
        subCounty: subCountyName,
        county: countyName,
        aggregationCenterId: newListing.aggregationCenterId || undefined,
        description: newListing.description || undefined,
        photos,
      };

      await createListing(listing);
      showSuccess(
        "Listing submitted for approval",
        `Your ${newListing.variety} listing has been submitted. A lead farmer will review it before it appears on the marketplace.`
      );
      setNewListing(initialNewListing);
      setNewListingOpen(false);
      if (user?.id) {
        await fetchListings({ farmerId: user.id });
      }
    } catch (error) {
      console.error("Failed to create listing:", error);
      showError("Failed to create listing", formatApiError(error));
    }
  };

  const handleDeleteListing = async (id: string) => {
    try {
      await deleteListing(id);
      showSuccess("Listing deleted successfully", "The listing has been removed from the marketplace");
      // Refresh listings
      if (user?.id) {
        await fetchListings({ farmerId: user.id });
      }
    } catch (error) {
      console.error("Failed to delete listing:", error);
      showError("Failed to delete listing", formatApiError(error));
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
      case "PENDING_LEAD_APPROVAL":
        return "bg-amber-100 text-amber-800";
      case "REVISION_REQUESTED":
        return "bg-orange-100 text-orange-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case "PENDING_LEAD_APPROVAL":
        return "Pending approval";
      case "REVISION_REQUESTED":
        return "Revision requested";
      case "active":
        return "Active";
      case "sold":
        return "Sold";
      case "inactive":
        return "Inactive";
      default:
        return status;
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

  // Missing required fields for post-produce form (for submit-disabled indicator)
  const newListingMissing: string[] = [];
  if (!newListing.variety) newListingMissing.push("Variety");
  if (!newListing.quantity) newListingMissing.push("Quantity");
  if (!newListing.qualityGrade) newListingMissing.push("Grade / quality");
  if (!newListing.pricePerKg) newListingMissing.push("Price per kg");
  if (!newListing.expectedReadyAt) newListingMissing.push("Expected ready date & time");
  if (!newListing.countyId) newListingMissing.push("County");
  if (!newListing.subCountyId) newListingMissing.push("Sub-county");
  if (!newListing.wardId) newListingMissing.push("Ward");
  if (!newListing.villageId) newListingMissing.push("Village");
  if (!newListing.aggregationCenterId) newListingMissing.push("Aggregation centre");
  const isNewListingSubmitDisabled = newListingMissing.length > 0;

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
        <Dialog
          open={newListingOpen}
          onOpenChange={(open) => {
            setNewListingOpen(open);
            if (!open) setNewListing(initialNewListing);
          }}
        >
          <DialogTrigger
            render={
              <Button className="shrink-0">
                <IconPlus className="mr-2 h-4 w-4" />
                Post produce
              </Button>
            }
          />
          <DialogContent className="sm:max-w-md max-h-[90vh] flex flex-col overflow-hidden">
            <DialogHeader className="shrink-0">
              <DialogTitle>Post produce</DialogTitle>
              <DialogDescription>
                Add a new listing. It will be submitted for lead farmer approval before appearing on the marketplace.
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4 min-h-0 overflow-y-auto">
              {/* Core Commodity Details */}
              <div className="space-y-3">
                <p className="text-sm font-medium text-stone-700">Core commodity details</p>
                <p className="text-xs text-muted-foreground">Commodity type: OFSP</p>
                <FieldGroup>
                  <FieldLabel>Variety</FieldLabel>
                  <Select
                    value={newListing.variety}
                    onValueChange={(v) => setNewListing((prev) => ({ ...prev, variety: v }))}
                  >
                    <SelectTrigger>
                      <SelectValue>{newListing.variety ? undefined : "Select variety"}</SelectValue>
                    </SelectTrigger>
                    <SelectContent>
                      {ofspVarieties.map((v) => (
                        <SelectItem key={v.value} value={v.value}>
                          {v.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </FieldGroup>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <FieldGroup>
                    <FieldLabel>Quantity</FieldLabel>
                    <Input
                      type="number"
                      min={1}
                      placeholder="e.g. 100"
                      value={newListing.quantity}
                      onChange={(e) => setNewListing((prev) => ({ ...prev, quantity: e.target.value }))}
                    />
                  </FieldGroup>
                  <FieldGroup>
                    <FieldLabel>Unit of measure</FieldLabel>
                    <Select
                      value={newListing.quantityUnit}
                      onValueChange={(v) => setNewListing((prev) => ({ ...prev, quantityUnit: v }))}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {quantityUnits.map((u) => (
                          <SelectItem key={u.value} value={u.value}>
                            {u.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </FieldGroup>
                </div>
                <FieldGroup>
                  <FieldLabel>Grade / quality classification</FieldLabel>
                  <Select
                    value={newListing.qualityGrade}
                    onValueChange={(v) => setNewListing((prev) => ({ ...prev, qualityGrade: v }))}
                  >
                    <SelectTrigger>
                      <SelectValue>{newListing.qualityGrade ? undefined : "Select grade"}</SelectValue>
                    </SelectTrigger>
                    <SelectContent>
                      {qualityGrades.map((g) => (
                        <SelectItem key={g.value} value={g.value}>
                          {g.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </FieldGroup>
                <FieldGroup>
                  <FieldLabel>Expected date and time ready at aggregation centre</FieldLabel>
                  <Input
                    type="datetime-local"
                    value={newListing.expectedReadyAt}
                    onChange={(e) => setNewListing((prev) => ({ ...prev, expectedReadyAt: e.target.value }))}
                  />
                </FieldGroup>
                <FieldGroup>
                  <FieldLabel>Price per kg (KES)</FieldLabel>
                  <Input
                    type="number"
                    min={0}
                    step={0.01}
                    placeholder="e.g. 45"
                    value={newListing.pricePerKg}
                    onChange={(e) => setNewListing((prev) => ({ ...prev, pricePerKg: e.target.value }))}
                  />
                </FieldGroup>
              </div>

              {/* Location information (from location hierarchy) */}
              <div className="space-y-3">
                <p className="text-sm font-medium text-stone-700">Location information</p>
                <FieldGroup>
                  <FieldLabel>County</FieldLabel>
                  <SearchableSelect
                    options={locationCounties.map((c) => ({ value: c.id, label: c.name, searchText: c.name }))}
                    value={newListing.countyId}
                    onValueChange={(v) =>
                      setNewListing((prev) => ({
                        ...prev,
                        countyId: v,
                        subCountyId: "",
                        wardId: "",
                        villageId: "",
                      }))
                    }
                    placeholder="Select county"
                    searchPlaceholder="Search counties..."
                  />
                </FieldGroup>
                <FieldGroup>
                  <FieldLabel>Sub-county</FieldLabel>
                  <SearchableSelect
                    options={locationSubCounties.map((s) => ({ value: s.id, label: s.name, searchText: s.name }))}
                    value={newListing.subCountyId}
                    onValueChange={(v) =>
                      setNewListing((prev) => ({ ...prev, subCountyId: v, wardId: "", villageId: "" }))
                    }
                    placeholder="Select sub-county"
                    searchPlaceholder="Search sub-counties..."
                    disabled={!newListing.countyId}
                  />
                </FieldGroup>
                <FieldGroup>
                  <FieldLabel>Ward</FieldLabel>
                  <SearchableSelect
                    options={locationWards.map((w) => ({ value: w.id, label: w.name, searchText: w.name }))}
                    value={newListing.wardId}
                    onValueChange={(v) => setNewListing((prev) => ({ ...prev, wardId: v, villageId: "" }))}
                    placeholder="Select ward"
                    searchPlaceholder="Search wards..."
                    disabled={!newListing.subCountyId}
                  />
                </FieldGroup>
                <FieldGroup>
                  <FieldLabel>Village</FieldLabel>
                  <SearchableSelect
                    options={locationVillages.map((v) => ({ value: v.id, label: v.name, searchText: v.name }))}
                    value={newListing.villageId}
                    onValueChange={(v) => setNewListing((prev) => ({ ...prev, villageId: v }))}
                    placeholder="Select village"
                    searchPlaceholder="Search villages..."
                    disabled={!newListing.wardId}
                  />
                </FieldGroup>
                <FieldGroup>
                  <FieldLabel>Assigned aggregation centre</FieldLabel>
                  <SearchableSelect
                    options={aggregationCenters.map((c) => ({ value: c.id, label: c.name, searchText: c.name }))}
                    value={newListing.aggregationCenterId}
                    onValueChange={(v) => setNewListing((prev) => ({ ...prev, aggregationCenterId: v }))}
                    placeholder="Select centre (auto-linked if assigned)"
                    searchPlaceholder="Search centres..."
                  />
                </FieldGroup>
              </div>

              {/* Visual evidence - optional */}
              <div className="space-y-3">
                <p className="text-sm font-medium text-stone-700">Visual evidence (optional)</p>
                <FieldGroup>
                  <FieldLabel>Images of the produce</FieldLabel>
                  <div className="border-2 border-dashed rounded-lg p-4 text-center">
                    <input
                      type="file"
                      id="post-produce-photo-upload"
                      multiple
                      accept="image/jpeg,image/png,image/webp,image/gif"
                      onChange={handlePostProducePhotoUpload}
                      className="hidden"
                    />
                    <label
                      htmlFor="post-produce-photo-upload"
                      className="cursor-pointer flex flex-col items-center gap-2"
                    >
                      <IconPhoto className="h-8 w-8 text-muted-foreground" />
                      <span className="text-sm font-medium">Click to upload photos</span>
                      <span className="text-xs text-muted-foreground">JPEG, PNG, WebP, GIF — up to 10MB each</span>
                    </label>
                  </div>
                  {uploadingPhotos && (
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <IconLoader2 className="h-4 w-4 animate-spin" />
                      Uploading...
                    </div>
                  )}
                  {newListing.photos && newListing.photos.length > 0 && (
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mt-2">
                      {newListing.photos.map((photo, index) => (
                        <div key={index} className="relative group">
                          <img
                            src={getImageFullUrl(photo)}
                            alt={`Produce ${index + 1}`}
                            className="w-full aspect-square object-cover rounded-lg border"
                          />
                          <button
                            type="button"
                            onClick={() => handleRemovePostProducePhoto(index)}
                            className="absolute top-1 right-1 p-1 bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                          >
                            <IconX className="h-4 w-4" />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </FieldGroup>
              </div>

              <FieldGroup>
                <FieldLabel>Description (optional)</FieldLabel>
                <Textarea
                  placeholder="Notes about this batch..."
                  value={newListing.description}
                  onChange={(e) => setNewListing((prev) => ({ ...prev, description: e.target.value }))}
                  rows={2}
                />
              </FieldGroup>
            </div>
            <DialogFooter className="shrink-0 flex-wrap gap-2">
              <Button variant="outline" onClick={() => setNewListingOpen(false)}>
                Cancel
              </Button>
              <Button
                onClick={handleAddListing}
                disabled={isNewListingSubmitDisabled}
              >
                Submit for approval
              </Button>
              {isNewListingSubmitDisabled && (
                <span className="w-full text-xs text-amber-700 flex items-center gap-1.5 py-1 order-first">
                  <IconAlertTriangle className="h-4 w-4 shrink-0" />
                  Missing: {newListingMissing.join(", ")}
                </span>
              )}
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
                          {produce.type === "listing" ? getStatusLabel(produce.status) : (produce.lifecycleStage || produce.status)}
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
                          {activeTab === "listings" && "Try adjusting your search or filters, or "}
                          {activeTab === "picked_up" && "No picked up produce found. Book a pickup schedule to get started."}
                          {activeTab === "all" && "Try adjusting your search or filters"}
                        </p>
                        {activeTab === "listings" && (
                          <Button variant="link" className="mt-2" onClick={() => setNewListingOpen(true)}>
                            Post a new listing
                          </Button>
                        )}
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

