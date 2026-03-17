import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  IconSearch,
  IconShoppingCart,
  IconMessageCircle,
  IconStar,
  IconMapPin,
  IconPackage,
  IconTrendingUp,
  IconSparkles,
  IconBuilding,
  IconBuildingCommunity,
  IconCalendar,
  IconFilter,
  IconLayoutGrid,
  IconList,
  IconClock,
  IconChevronDown,
  IconPlant,
  IconStack,
  IconQrcode,
} from "@tabler/icons-react";
import { useAuth } from "@/contexts/AuthContext";
import { useMarketplace } from "@/contexts/MarketplaceContext";
import { NegotiationDialog } from "@/components/marketplace/NegotiationDialog";
import { InitiateNegotiationButton } from "@/components/marketplace/InitiateNegotiationButton";
import { SmartMatching } from "@/components/marketplace/SmartMatching";
import { BulkOrderCart } from "./BulkOrderCart";
import { AdvanceOrderForm, type AdvanceOrderData } from "@/components/buyer/AdvanceOrderForm";
import { allAggregationCenters, formatCenterLabel } from "@/data/aggregationCenters";
import {
  PriceDistributionBar,
  StarRating,
} from "@/components/visualizations";
import { BatchTraceabilityDialog } from "@/components/buyer/BatchTraceabilityDialog";
import { LocationPicker } from "@/components/marketplace/LocationPicker";
import type { ProduceListing, OFSPVariety } from "@/types/marketplace";
import { useCatalog } from "@/contexts/CatalogContext";

const subCounties = [
  { value: "all", label: "All Locations" },
  { value: "kangundo", label: "Kangundo" },
  { value: "kathiani", label: "Kathiani" },
  { value: "masinga", label: "Masinga" },
  { value: "yatta", label: "Yatta" },
];

const sortOptions = [
  { value: "price_asc", label: "Price: Low to High" },
  { value: "price_desc", label: "Price: High to Low" },
  { value: "quantity_desc", label: "Quantity: High to Low" },
  { value: "rating_desc", label: "Rating: High to Low" },
  { value: "date_desc", label: "Newest First" },
  { value: "distance_asc", label: "Distance: Nearest" },
];

export function MarketplacePage() {
  const { role, user } = useAuth();
  const { listings, fetchListings, createOrder, createSourcingRequest, isLoading, listingFilters, setListingFilters } = useMarketplace();
  const { varieties, qualityGrades, getGradeColor } = useCatalog();
  const varietyFilterOptions = [
    { value: "all", label: "All Varieties" },
    ...varieties.map((v) => ({ value: v.code, label: v.label })),
  ];
  const gradeFilterOptions = [
    { value: "all", label: "All Grades" },
    ...qualityGrades.map((g) => ({ value: g.code, label: g.label })),
  ];

  const [filteredListings, setFilteredListings] = useState<ProduceListing[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedVariety, setSelectedVariety] = useState("all");
  const [selectedGrade, setSelectedGrade] = useState("all");
  const [selectedLocation, setSelectedLocation] = useState("all");
  const [sortBy, setSortBy] = useState("date_desc");
  const [minPrice, setMinPrice] = useState("");
  const [maxPrice, setMaxPrice] = useState("");
  const [minQuantity, setMinQuantity] = useState("");
  const [selectedListing, setSelectedListing] = useState<ProduceListing | null>(null);
  const [orderDialogOpen, setOrderDialogOpen] = useState(false);
  const [rfqDialogOpen, setRfqDialogOpen] = useState(false);
  const [bulkCartOpen, setBulkCartOpen] = useState(false);
  const [cartItems, setCartItems] = useState<any[]>([]);
  const [showSmartMatching, setShowSmartMatching] = useState(false);
  const [orderQuantity, setOrderQuantity] = useState("");
  const [deliveryLocation, setDeliveryLocation] = useState("");
  const [deliveryCounty, setDeliveryCounty] = useState("");
  const [deliveryCoordinates, setDeliveryCoordinates] = useState<string | undefined>(undefined);
  const [fulfillmentType, setFulfillmentType] = useState<"self_pickup" | "request_transport">("self_pickup");
  const [advanceOrderOpen, setAdvanceOrderOpen] = useState(false);
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [showFilters, setShowFilters] = useState(false);
  const [traceabilityDialogOpen, setTraceabilityDialogOpen] = useState(false);
  const [selectedBatchId, setSelectedBatchId] = useState<string | undefined>(undefined);

  // Fetch listings on mount and when filters change
  useEffect(() => {
    const filters: any = {
      status: "active",
      variety: selectedVariety !== "all" ? selectedVariety : undefined,
      qualityGrade: selectedGrade !== "all" ? selectedGrade : undefined,
      subCounty: selectedLocation !== "all" ? selectedLocation : undefined,
      searchQuery: searchTerm || undefined,
      minPrice: minPrice ? parseFloat(minPrice) : undefined,
      maxPrice: maxPrice ? parseFloat(maxPrice) : undefined,
      minQuantity: minQuantity ? parseFloat(minQuantity) : undefined,
    };
    fetchListings(filters);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedVariety, selectedGrade, selectedLocation, searchTerm, minPrice, maxPrice, minQuantity]);

  const handleAdvanceOrder = async (orderData: AdvanceOrderData) => {
    try {
      // Create sourcing request for advance order
      await createSourcingRequest({
        variety: orderData.variety as any,
        quantity: orderData.quantity,
        qualityGrade: orderData.qualityGrade as any,
        deliveryLocation: orderData.deliveryLocation,
        nextDeliveryDate: orderData.deliveryDate,
        notes: orderData.notes,
      });
      setAdvanceOrderOpen(false);
      alert("Advance order placed successfully! You will be notified when produce is available.");
    } catch (error) {
      console.error("Failed to place advance order:", error);
      alert("Failed to place advance order. Please try again.");
    }
  };

  // Apply client-side filtering and sorting (filters are handled by context)
  useEffect(() => {
    // Exclude listings with 0 kg remaining quantity
    let filtered = listings.filter(
      (l) => l.availableQuantity != null && Number(l.availableQuantity) > 0
    );

    // Sort
    filtered.sort((a, b) => {
      switch (sortBy) {
        case "price_asc":
          return a.pricePerKg - b.pricePerKg;
        case "price_desc":
          return b.pricePerKg - a.pricePerKg;
        case "quantity_desc":
          return (b.availableQuantity || 0) - (a.availableQuantity || 0);
        case "rating_desc":
          return (b.farmerRating || 0) - (a.farmerRating || 0);
        case "date_desc":
          return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
        case "distance_asc":
          return (a.distance || 0) - (b.distance || 0);
        default:
          return 0;
      }
    });

    setFilteredListings(filtered as ProduceListing[]);
  }, [listings, sortBy]);

  const handlePlaceOrder = async () => {
    if (!selectedListing || !orderQuantity || !user?.id) return;

    // Validate transport requirements
    if (fulfillmentType === "request_transport" && (!deliveryLocation || !deliveryCounty)) {
      alert("Please provide delivery location and county when requesting transport");
      return;
    }

    const quantity = parseFloat(orderQuantity);
    if (quantity > selectedListing.availableQuantity) {
      alert(`Only ${selectedListing.availableQuantity} kg available`);
      return;
    }

    try {
      await createOrder({
        listingId: selectedListing.id,
        farmerId: selectedListing.farmerId,
        buyerId: user.id,
        variety: selectedListing.variety,
        quantity,
        qualityGrade: selectedListing.qualityGrade,
        pricePerKg: selectedListing.pricePerKg,
        totalAmount: quantity * selectedListing.pricePerKg,
        deliveryLocation: fulfillmentType === "request_transport" ? deliveryLocation : undefined,
        deliveryCounty: fulfillmentType === "request_transport" ? deliveryCounty : undefined,
        deliveryCoordinates: fulfillmentType === "request_transport" && deliveryCoordinates
          ? (() => {
              const parts = deliveryCoordinates.split(",").map((s) => parseFloat(s.trim()));
              return parts.length === 2 && Number.isFinite(parts[0]) && Number.isFinite(parts[1])
                ? ([parts[0], parts[1]] as [number, number])
                : undefined;
            })()
          : undefined,
        fulfillmentType,
        status: "order_placed",
      });

      // Close dialog and reset
      setOrderDialogOpen(false);
      setOrderQuantity("");
      setDeliveryLocation("");
      setDeliveryCounty("");
      setDeliveryCoordinates(undefined);
      setFulfillmentType("self_pickup");
      setSelectedListing(null);
      alert("Order placed successfully!");
    } catch (error) {
      console.error("Failed to place order:", error);
      alert("Failed to place order. Please try again.");
    }
  };

  const handleRequestQuote = () => {
    if (!selectedListing || !orderQuantity || !deliveryLocation) return;

    // TODO: Replace with actual API call
    console.log("Requesting quote:", {
      listingId: selectedListing.id,
      quantity: parseFloat(orderQuantity),
      deliveryLocation,
    });

    setRfqDialogOpen(false);
    setOrderQuantity("");
    setDeliveryLocation("");
    setSelectedListing(null);
  };

  const handleAddToCart = (listing: ProduceListing) => {
    setCartItems((prev) => [
      ...prev,
      {
        listingId: listing.id,
        farmerName: listing.farmerName,
        variety: listing.variety,
        qualityGrade: listing.qualityGrade,
        pricePerKg: listing.pricePerKg,
        quantity: 1,
        availableQuantity: listing.availableQuantity,
        location: listing.location,
      },
    ]);
  };

  const handleRemoveFromCart = (listingId: string) => {
    setCartItems((prev) => prev.filter((item) => item.listingId !== listingId));
  };

  const handleUpdateCartQuantity = (listingId: string, quantity: number) => {
    setCartItems((prev) =>
      prev.map((item) => (item.listingId === listingId ? { ...item, quantity } : item))
    );
  };

  const handleBulkCheckout = async (items: any[], deliveryLocation: string) => {
    if (!user?.id) return;

    try {
      // Create orders for each item in bulk
      const orderPromises = items.map((item) =>
        createOrder({
          listingId: item.listingId,
          farmerId: item.farmerId || "",
          buyerId: user.id,
          variety: item.variety,
          quantity: item.quantity,
          qualityGrade: item.qualityGrade,
          pricePerKg: item.pricePerKg,
          totalAmount: item.quantity * item.pricePerKg,
          deliveryLocation,
          status: "order_placed",
        })
      );

      await Promise.all(orderPromises);
      setCartItems([]);
      setBulkCartOpen(false);
      alert("Bulk order placed successfully!");
    } catch (error) {
      console.error("Failed to place bulk order:", error);
      alert("Failed to place bulk order. Please try again.");
    }
  };

  return (
    <div className="max-w-7xl mx-auto space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-stone-900">Marketplace</h1>
          <p className="text-stone-500 mt-1">Browse and order OFSP produce directly from verified farmers.</p>
        </div>
        {role === "buyer" && (
          <Button
            variant="outline"
            onClick={() => setAdvanceOrderOpen(true)}
            className="inline-flex items-center gap-2 px-4 py-2 bg-white border border-stone-200 hover:border-orange-500 hover:text-orange-500 text-stone-700 rounded-lg text-sm font-medium shadow-sm transition-all"
          >
            <IconCalendar className="h-4 w-4" />
            Place Advance Order
          </Button>
        )}
      </div>

      {/* Smart Matching */}
      {role === "buyer" && showSmartMatching && (
        <SmartMatching
          buyerRequirements={{
            variety: selectedVariety !== "all" ? selectedVariety : "kenya",
            quantity: parseFloat(minQuantity) || 100,
            maxPrice: maxPrice ? parseFloat(maxPrice) : undefined,
            preferredLocation: selectedLocation !== "all" ? selectedLocation : undefined,
          }}
          onSelectFarmer={(farmerId) => {
            // Find and select the matched farmer's listing
            const matchedListing = listings.find((l) => l.farmerId === farmerId);
            if (matchedListing) {
              setSelectedListing(matchedListing as ProduceListing);
              setOrderDialogOpen(true);
            }
            setShowSmartMatching(false);
          }}
        />
      )}

      {/* Filters Toolbar */}
      <div className="bg-white rounded-xl border border-stone-200 shadow-sm p-1">
        <div className="flex flex-col lg:flex-row divide-y lg:divide-y-0 lg:divide-x divide-stone-100">
          {/* Search */}
          <div className="flex-1 p-2">
            <div className="relative group">
              <IconSearch className="absolute left-3 top-2.5 h-[18px] w-[18px] text-stone-400 group-focus-within:text-orange-500 transition-colors" />
              <Input
                type="text"
                placeholder="Search by variety, farmer name, or location..."
                className="w-full pl-10 pr-4 py-2 bg-stone-50 border border-stone-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-orange-100 focus:border-orange-500 transition-all placeholder:text-stone-400"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>

          {/* Dropdown Filters Group */}
          <div className="flex items-center gap-1 p-2 overflow-x-auto">
            {/* Variety */}
            <Select value={selectedVariety} onValueChange={(value) => setSelectedVariety(value || "all")}>
              <SelectTrigger className="flex items-center gap-2 px-3 py-2 text-sm font-medium text-stone-600 bg-white border border-stone-200 rounded-lg hover:bg-stone-50 hover:border-stone-300 transition-all min-w-[100px] justify-between h-auto">
                <SelectValue />
                <IconChevronDown className="h-3.5 w-3.5 text-stone-400" />
              </SelectTrigger>
              <SelectContent>
                {varietyFilterOptions.map((v) => (
                  <SelectItem key={v.value} value={v.value}>
                    {v.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            {/* Quality */}
            <Select value={selectedGrade} onValueChange={(value) => setSelectedGrade(value || "all")}>
              <SelectTrigger className="flex items-center gap-2 px-3 py-2 text-sm font-medium text-stone-600 bg-white border border-stone-200 rounded-lg hover:bg-stone-50 hover:border-stone-300 transition-all min-w-[120px] justify-between h-auto">
                <SelectValue />
                <IconChevronDown className="h-3.5 w-3.5 text-stone-400" />
              </SelectTrigger>
              <SelectContent>
                {gradeFilterOptions.map((g) => (
                  <SelectItem key={g.value} value={g.value}>
                    {g.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            {/* Location */}
            <Select value={selectedLocation} onValueChange={(value) => setSelectedLocation(value || "all")}>
              <SelectTrigger className="flex items-center gap-2 px-3 py-2 text-sm font-medium text-stone-600 bg-white border border-stone-200 rounded-lg hover:bg-stone-50 hover:border-stone-300 transition-all min-w-[110px] justify-between h-auto">
                <SelectValue />
                <IconChevronDown className="h-3.5 w-3.5 text-stone-400" />
              </SelectTrigger>
              <SelectContent>
                {subCounties.map((s) => (
                  <SelectItem key={s.value} value={s.value}>
                    {s.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <div className="w-px h-6 bg-stone-200 mx-2" />

            {/* Advanced Filters Trigger */}
            <Button
              variant="ghost"
              onClick={() => setShowFilters(!showFilters)}
              className="flex items-center gap-2 px-3 py-2 text-sm font-medium text-stone-600 hover:text-stone-900 rounded-lg transition-colors h-auto"
            >
              <IconFilter className="h-4 w-4" />
              <span className="hidden sm:inline">Filters</span>
            </Button>
          </div>

          {/* Sort */}
          <div className="p-2 flex items-center justify-end min-w-[180px]">
            <span className="text-xs font-medium text-stone-400 mr-2 uppercase tracking-wide">Sort by:</span>
            <Select value={sortBy} onValueChange={(value) => setSortBy(value || "date_desc")}>
              <SelectTrigger className="bg-transparent text-sm font-medium text-stone-800 focus:outline-none cursor-pointer border-0 shadow-none h-auto p-0">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {sortOptions.map((s) => (
                  <SelectItem key={s.value} value={s.value}>
                    {s.label === "Newest First" ? "Newest Listings" : s.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Collapsible Area for Range Inputs */}
        <div className="px-4 pb-4 pt-2 border-t border-stone-100 bg-stone-50/50 rounded-b-xl grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Price Range */}
          <div className="col-span-2">
            <label className="text-xs font-semibold text-stone-500 uppercase mb-2 block">Price Range (KES/kg)</label>
            <div className="flex items-center gap-4">
              <div className="relative w-full max-w-[100px]">
                <span className="absolute left-3 top-2 text-xs text-stone-400">Min</span>
                <Input
                  type="number"
                  value={minPrice}
                  onChange={(e) => setMinPrice(e.target.value)}
                  className="w-full pl-8 pr-2 py-1.5 text-sm border border-stone-200 rounded-md focus:ring-1 focus:ring-orange-500 focus:border-orange-500 outline-none"
                />
              </div>
              <div className="flex-1 h-1 bg-stone-200 rounded-full relative">
                <div className="absolute left-[10%] right-[30%] top-0 bottom-0 bg-orange-500 rounded-full" />
              </div>
              <div className="relative w-full max-w-[100px]">
                <span className="absolute left-3 top-2 text-xs text-stone-400">Max</span>
                <Input
                  type="number"
                  value={maxPrice}
                  onChange={(e) => setMaxPrice(e.target.value)}
                  className="w-full pl-8 pr-2 py-1.5 text-sm border border-stone-200 rounded-md focus:ring-1 focus:ring-orange-500 focus:border-orange-500 outline-none"
                />
              </div>
            </div>
          </div>
          {/* Quantity */}
          <div>
            <label className="text-xs font-semibold text-stone-500 uppercase mb-2 block">Min Quantity (kg)</label>
            <div className="relative">
              <Input
                type="number"
                placeholder="e.g. 500"
                value={minQuantity}
                onChange={(e) => setMinQuantity(e.target.value)}
                className="w-full pl-3 pr-10 py-1.5 text-sm border border-stone-200 rounded-md focus:ring-1 focus:ring-orange-500 focus:border-orange-500 outline-none"
              />
              <span className="absolute right-3 top-1.5 text-xs text-stone-400 font-medium pt-0.5">KG</span>
            </div>
          </div>
        </div>
      </div>

      {/* Results Info */}
      <div className="flex items-center justify-between">
        <p className="text-sm text-stone-500 font-medium">
          Showing <span className="text-stone-900 font-bold">{filteredListings.length}</span> of{" "}
          <span className="text-stone-900">
            {listings.filter((l) => l.availableQuantity != null && Number(l.availableQuantity) > 0).length}
          </span>{" "}
          listings
        </p>
        <div className="flex gap-1">
          <button
            onClick={() => setViewMode("grid")}
            className={`p-1.5 rounded ${
              viewMode === "grid"
                ? "text-stone-800 bg-white border border-stone-200 shadow-sm"
                : "text-stone-400 hover:text-stone-600"
            }`}
          >
            <IconLayoutGrid className="h-4 w-4" />
          </button>
          <button
            onClick={() => setViewMode("list")}
            className={`p-1.5 rounded ${
              viewMode === "list"
                ? "text-stone-800 bg-white border border-stone-200 shadow-sm"
                : "text-stone-400 hover:text-stone-600"
            }`}
          >
            <IconList className="h-4 w-4" />
          </button>
        </div>
      </div>

      {/* Listings Grid */}
      {isLoading ? (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <Card key={i} className="animate-pulse">
              <CardHeader>
                <div className="aspect-video w-full rounded-lg bg-muted mb-4" />
                <div className="h-4 w-3/4 bg-muted rounded" />
                <div className="h-3 w-1/2 bg-muted rounded mt-2" />
              </CardHeader>
              <CardContent>
                <div className="h-6 w-1/3 bg-muted rounded" />
              </CardContent>
            </Card>
          ))}
        </div>
      ) : filteredListings.length > 0 ? (
        <div className={viewMode === "grid" ? "grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6" : "space-y-4"}>
          {filteredListings.map((listing) => {
            // Calculate if harvested this week
            const createdAt = new Date(listing.createdAt);
            const daysSinceCreation = Math.floor((Date.now() - createdAt.getTime()) / (1000 * 60 * 60 * 24));
            const isHarvestedThisWeek = daysSinceCreation <= 7;

            // Get icon based on variety
            const getVarietyIcon = () => {
              if (listing.variety.toLowerCase().includes("spk")) return <IconPlant className="h-12 w-12" />;
              if (listing.variety.toLowerCase().includes("kabode")) return <IconStack className="h-12 w-12" />;
              return <IconPackage className="h-12 w-12" />;
            };

            return (
              <div
                key={listing.id}
                className="bg-white rounded-2xl border border-stone-200 shadow-sm hover:shadow-lg hover:-translate-y-1 transition-all duration-300 group flex flex-col"
              >
                {/* Image Area */}
                <div className="relative h-48 bg-stone-100 rounded-t-2xl overflow-hidden border-b border-stone-100">
                  {/* Grade Badge */}
                  <div className="absolute top-3 right-3 z-10">
                    <Badge
                      className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold border shadow-sm backdrop-blur-sm ${
                        listing.qualityGrade === "A"
                          ? "bg-green-100 text-green-700 border-green-200/50"
                          : listing.qualityGrade === "B"
                          ? "bg-yellow-100 text-yellow-800 border-yellow-200/50"
                          : "bg-orange-100 text-orange-800 border-orange-200/50"
                      }`}
                    >
                      Grade {listing.qualityGrade}
                    </Badge>
                  </div>

                  {/* Placeholder Icon/Image */}
                  {listing.photos && listing.photos.length > 0 ? (
                    <img
                      src={listing.photos[0]}
                      alt={listing.variety}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="absolute inset-0 flex items-center justify-center text-stone-300">
                      <div className="opacity-50">{getVarietyIcon()}</div>
                    </div>
                  )}

                  {/* Overlay Info */}
                  {(() => {
                    const readyAt = listing.expectedReadyAt ? new Date(listing.expectedReadyAt) : null;
                    const isAdvanceOrder = readyAt && readyAt.getTime() > Date.now();
                    if (isAdvanceOrder) {
                      return (
                        <div className="absolute bottom-0 left-0 right-0 p-3 bg-gradient-to-t from-black/50 to-transparent">
                          <div className="flex items-center gap-1 text-white/90 text-xs font-medium">
                            <IconClock className="h-3 w-3" />
                            <span>Advance order – ready by {readyAt.toLocaleDateString(undefined, { dateStyle: "medium" })}</span>
                          </div>
                        </div>
                      );
                    }
                    if (isHarvestedThisWeek) {
                      return (
                        <div className="absolute bottom-0 left-0 right-0 p-3 bg-gradient-to-t from-black/50 to-transparent">
                          <div className="flex items-center gap-1 text-white/90 text-xs font-medium">
                            <IconClock className="h-3 w-3" />
                            <span>Harvested this week</span>
                          </div>
                        </div>
                      );
                    }
                    return null;
                  })()}
                </div>

                {/* Content */}
                <div className="p-5 flex-1 flex flex-col">
                  <div className="flex justify-between items-start mb-2">
                    <div>
                      <h3 className="font-bold text-stone-900 text-lg leading-tight group-hover:text-orange-500 transition-colors">
                        {listing.variety} - Grade {listing.qualityGrade}
                      </h3>
                      <div className="flex items-center gap-1.5 mt-1 text-xs text-stone-500">
                        <span className="font-medium text-stone-700">{listing.farmerName}</span>
                        <span className="w-1 h-1 rounded-full bg-stone-300" />
                        <span>{listing.location}</span>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-lg font-bold text-stone-900">
                        KES {listing.pricePerKg}
                        <span className="text-xs font-normal text-stone-500">/kg</span>
                      </div>
                    </div>
                  </div>

                  {listing.description && (
                    <p className="text-sm text-stone-500 line-clamp-2 mb-4 leading-relaxed">
                      {listing.description}
                    </p>
                  )}

                  {/* Advance order: ready-by date */}
                  {listing.expectedReadyAt && new Date(listing.expectedReadyAt).getTime() > Date.now() && (
                    <p className="text-xs text-amber-600 font-medium mb-2 flex items-center gap-1">
                      <IconClock className="h-3.5 w-3.5" />
                      Available from {new Date(listing.expectedReadyAt).toLocaleDateString(undefined, { dateStyle: "medium" })} – advance orders welcome
                    </p>
                  )}

                  {/* Meta Stats */}
                  <div className="flex items-center gap-4 mb-5 text-xs font-medium text-stone-500 border-t border-b border-stone-50 py-3">
                    <div className="flex items-center gap-1 text-yellow-500">
                      <IconStar className="h-3.5 w-3.5 fill-yellow-500" />
                      <span className="text-stone-700">{listing.farmerRating}</span>
                    </div>
                    <div className="w-px h-3 bg-stone-200" />
                    {listing.distance && (
                      <>
                        <div className="flex items-center gap-1">
                          <IconMapPin className="h-3.5 w-3.5" />
                          <span>{listing.distance} km</span>
                        </div>
                        <div className="w-px h-3 bg-stone-200" />
                      </>
                    )}
                    <div className="flex items-center gap-1">
                      <IconPackage className="h-3.5 w-3.5" />
                      <span>{listing.availableQuantity} kg left</span>
                    </div>
                  </div>

                  {/* Actions */}
                  {role === "buyer" && (
                    <div className="mt-auto space-y-2">
                      <div className="flex items-center gap-2">
                      <Button
                          className="flex-1 flex items-center justify-center gap-2 bg-stone-900 hover:bg-stone-800 text-white text-sm font-semibold py-2.5 px-4 rounded-lg transition-colors shadow-sm"
                        onClick={() => {
                          setSelectedListing(listing);
                          setOrderDialogOpen(true);
                        }}
                      >
                        <IconShoppingCart className="h-4 w-4" />
                        Order Now
                      </Button>
                    {/*   <InitiateNegotiationButton
                        listing={listing}
                        variant="outline"
                        size="default"
                        className="shrink-0 px-3 rounded-lg border border-stone-200 hover:border-stone-300 hover:bg-stone-50 text-stone-600 transition-colors whitespace-nowrap"
                      /> */}
                    
                      </div>
                      <Button
                        variant="outline"
                        className="w-full text-xs font-medium text-stone-600 hover:text-orange-600 hover:border-orange-500 border-stone-200 py-2"
                        onClick={() => {
                          setSelectedBatchId(listing.batchId);
                          setTraceabilityDialogOpen(true);
                        }}
                      >
                        <IconQrcode className="h-3.5 w-3.5 mr-2" />
                        View Batch History
                      </Button>
                    </div>
                  )}
                  {role !== "buyer" && (
                    <Button variant="outline" className="w-full mt-auto" disabled>
                      Login as Buyer to Order
                    </Button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <Card className="bg-white border-stone-200">
          <CardContent className="py-12 text-center">
            <IconPackage className="h-12 w-12 text-stone-400 mx-auto mb-4" />
            <p className="text-lg font-medium text-stone-500">No listings found</p>
            <p className="text-sm text-stone-500 mt-1">
              Try adjusting your filters or search terms
            </p>
          </CardContent>
        </Card>
      )}

      {/* Batch Traceability Dialog */}
      <BatchTraceabilityDialog
        open={traceabilityDialogOpen}
        onOpenChange={setTraceabilityDialogOpen}
        batchId={selectedBatchId}
      />

      {/* Order Dialog */}
      <Dialog open={orderDialogOpen} onOpenChange={setOrderDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Place Order</DialogTitle>
            <DialogDescription>
              Order {selectedListing?.variety} from {selectedListing?.farmerName}
            </DialogDescription>
          </DialogHeader>
          {selectedListing && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium">Price per kg</label>
                  <p className="text-lg font-semibold">KES {selectedListing.pricePerKg}</p>
                </div>
                <div>
                  <label className="text-sm font-medium">Available Quantity</label>
                  <p className="text-lg font-semibold">{selectedListing.availableQuantity} kg</p>
                </div>
              </div>
              <div>
                <Label className="text-sm font-medium mb-2 block">Quantity (kg)</Label>
                <Input
                  type="number"
                  placeholder="Enter quantity"
                  value={orderQuantity}
                  onChange={(e) => setOrderQuantity(e.target.value)}
                  max={selectedListing.availableQuantity}
                  min={1}
                />
              </div>
              
              {/* Fulfillment Type Selection */}
              <div>
                <Label className="text-sm font-medium mb-2 block">Fulfillment Type</Label>
                <Select
                  value={fulfillmentType}
                  onValueChange={(value) => {
                    setFulfillmentType(value as "self_pickup" | "request_transport");
                    if (value === "self_pickup") {
                      setDeliveryLocation("");
                      setDeliveryCounty("");
                    }
                  }}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="self_pickup">Self Pickup</SelectItem>
                    <SelectItem value="request_transport">Request Transport</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Delivery Details - Only show when transport is requested */}
              {fulfillmentType === "request_transport" && (
                <>
                  <LocationPicker
                    address={deliveryLocation}
                    coordinates={deliveryCoordinates}
                    onAddressChange={setDeliveryLocation}
                    onCoordinatesChange={setDeliveryCoordinates}
                    label="Delivery Address"
                    required={true}
                  />
                  <div>
                    <Label className="text-sm font-medium mb-2 block">Delivery County *</Label>
                    <Select value={deliveryCounty} onValueChange={(value) => setDeliveryCounty(value || "")}>
                      <SelectTrigger>
                        <SelectValue>{deliveryCounty ? ({ machakos: "Machakos", nairobi: "Nairobi", kiambu: "Kiambu", kajiado: "Kajiado", makueni: "Makueni", other: "Other" } as Record<string, string>)[deliveryCounty] ?? deliveryCounty : "Select county"}</SelectValue>
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="machakos">Machakos</SelectItem>
                        <SelectItem value="nairobi">Nairobi</SelectItem>
                        <SelectItem value="kiambu">Kiambu</SelectItem>
                        <SelectItem value="kajiado">Kajiado</SelectItem>
                        <SelectItem value="makueni">Makueni</SelectItem>
                        <SelectItem value="other">Other</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </>
              )}
              {orderQuantity && (
                <div className="border-t pt-4">
                  <div className="flex justify-between items-center">
                    <span className="font-medium">Total Amount</span>
                    <span className="text-2xl font-bold">
                      KES {(parseFloat(orderQuantity) * selectedListing.pricePerKg).toLocaleString()}
                    </span>
                  </div>
                </div>
              )}
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setOrderDialogOpen(false)}>
              Cancel
            </Button>
            <Button
              onClick={handlePlaceOrder}
              disabled={
                !orderQuantity || 
                parseFloat(orderQuantity) <= 0 ||
                (fulfillmentType === "request_transport" && (!deliveryLocation || !deliveryCounty))
              }
            >
              Place Order
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* RFQ Dialog */}
      <Dialog open={rfqDialogOpen} onOpenChange={setRfqDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Request Quote</DialogTitle>
            <DialogDescription>
              Request a custom quote from {selectedListing?.farmerName}
            </DialogDescription>
          </DialogHeader>
          {selectedListing && (
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium mb-2 block">Desired Quantity (kg)</label>
                <Input
                  type="number"
                  placeholder="Enter quantity"
                  value={orderQuantity}
                  onChange={(e) => setOrderQuantity(e.target.value)}
                />
              </div>
              <div>
                <label className="text-sm font-medium mb-2 block">Delivery Location</label>
                <Select value={deliveryLocation} onValueChange={(value) => setDeliveryLocation(value || "")}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {allAggregationCenters.map((center) => (
                      <SelectItem key={center.value} value={center.value}>
                        {formatCenterLabel(center)}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <label className="text-sm font-medium mb-2 block">Special Requirements (Optional)</label>
                <Input placeholder="Any special requirements or notes..." />
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setRfqDialogOpen(false)}>
              Cancel
            </Button>
            <Button
              onClick={handleRequestQuote}
              disabled={!orderQuantity || !deliveryLocation}
            >
              Send Quote Request
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Negotiation Dialog - Now handled by InitiateNegotiationButton */}

      {/* Bulk Order Cart */}
      <BulkOrderCart
        open={bulkCartOpen}
        onOpenChange={setBulkCartOpen}
        cartItems={cartItems}
        onRemoveItem={handleRemoveFromCart}
        onUpdateQuantity={handleUpdateCartQuantity}
        onCheckout={handleBulkCheckout}
      />

      {/* Advance Order Dialog */}
      {role === "buyer" && (
        <Dialog open={advanceOrderOpen} onOpenChange={setAdvanceOrderOpen}>
          <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Place Advance Order</DialogTitle>
              <DialogDescription>
                Specify volume, grade, and delivery timeline for your order
              </DialogDescription>
            </DialogHeader>
            <AdvanceOrderForm
              onSubmit={handleAdvanceOrder}
              onCancel={() => setAdvanceOrderOpen(false)}
            />
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}

