import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
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
import { NegotiationDialog } from "@/components/messaging/NegotiationDialog";
import { SmartMatching } from "@/components/marketplace/SmartMatching";
import { BulkOrderCart } from "./BulkOrderCart";
import { AdvanceOrderForm, type AdvanceOrderData } from "@/components/buyer/AdvanceOrderForm";
import { allAggregationCenters, formatCenterLabel } from "@/data/aggregationCenters";
import {
  PriceDistributionBar,
  StarRating,
} from "@/components/visualizations";
import { BatchTraceabilityDialog } from "@/components/buyer/BatchTraceabilityDialog";

interface ProduceListing {
  id: string;
  farmerId: string;
  farmerName: string;
  farmerRating: number;
  variety: string;
  quantity: number;
  availableQuantity: number;
  qualityGrade: "A" | "B" | "C";
  pricePerKg: number;
  location: string;
  subCounty: string;
  description?: string;
  photos?: string[];
  createdAt: string;
  status: "active" | "sold" | "inactive";
  responseTime?: number; // minutes
  distance?: number; // km
  batchId?: string; // Batch ID for traceability
  qrCode?: string; // QR code for traceability
}

const ofspVarieties = [
  { value: "all", label: "All Varieties" },
  { value: "kenya", label: "Kenya" },
  { value: "spk004", label: "SPK004" },
  { value: "kabode", label: "Kabode" },
];

const qualityGrades = [
  { value: "all", label: "All Grades" },
  { value: "A", label: "Grade A" },
  { value: "B", label: "Grade B" },
  { value: "C", label: "Grade C" },
];

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
  const { role } = useAuth();
  const [listings, setListings] = useState<ProduceListing[]>([]);
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
  const [negotiationDialogOpen, setNegotiationDialogOpen] = useState(false);
  const [bulkCartOpen, setBulkCartOpen] = useState(false);
  const [cartItems, setCartItems] = useState<any[]>([]);
  const [showSmartMatching, setShowSmartMatching] = useState(false);
  const [orderQuantity, setOrderQuantity] = useState("");
  const [deliveryLocation, setDeliveryLocation] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [advanceOrderOpen, setAdvanceOrderOpen] = useState(false);
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [showFilters, setShowFilters] = useState(false);
  const [traceabilityDialogOpen, setTraceabilityDialogOpen] = useState(false);
  const [selectedBatchId, setSelectedBatchId] = useState<string | undefined>(undefined);

  const handleAdvanceOrder = (orderData: AdvanceOrderData) => {
    // TODO: Replace with actual API call
    console.log("Placing advance order:", orderData);
    setAdvanceOrderOpen(false);
    alert("Advance order placed successfully! You will be notified when produce is available.");
  };

  useEffect(() => {
    // TODO: Replace with actual API call
    setTimeout(() => {
      const sampleListings: ProduceListing[] = [
        {
          id: "LST-001",
          farmerId: "F001",
          farmerName: "James Mutua",
          farmerRating: 4.8,
          variety: "Kenya",
          quantity: 1000,
          availableQuantity: 500,
          qualityGrade: "A",
          pricePerKg: 150,
          location: "Kangundo",
          subCounty: "kangundo",
          description: "Fresh Grade A Kenya variety, high dry matter content. Sorted and cleaned, ready for transport.",
          status: "active",
          responseTime: 15,
          distance: 5.2,
          createdAt: new Date().toISOString(),
          batchId: "BATCH-2023-001",
          qrCode: "QR-BATCH-2023-001",
        },
        {
          id: "LST-002",
          farmerId: "F002",
          farmerName: "Mary Wanjiku",
          farmerRating: 4.9,
          variety: "SPK004",
          quantity: 800,
          availableQuantity: 300,
          qualityGrade: "A",
          pricePerKg: 120,
          location: "Kathiani",
          subCounty: "kathiani",
          description: "Premium SPK004 variety, exceptionally high beta-carotene content. Ideal for puree processing.",
          status: "active",
          responseTime: 8,
          distance: 12.5,
          createdAt: new Date().toISOString(),
          batchId: "BATCH-2023-002",
          qrCode: "QR-BATCH-2023-002",
        },
        {
          id: "LST-003",
          farmerId: "F003",
          farmerName: "Peter Kamau",
          farmerRating: 4.5,
          variety: "Kabode",
          quantity: 600,
          availableQuantity: 200,
          qualityGrade: "B",
          pricePerKg: 100,
          location: "Masinga",
          subCounty: "masinga",
          description: "Good quality Kabode variety. Size variation present but excellent taste. Suitable for flour.",
          status: "active",
          responseTime: 30,
          distance: 18.3,
          createdAt: new Date().toISOString(),
          batchId: "BATCH-2023-003",
          qrCode: "QR-BATCH-2023-003",
        },
      ];
      setListings(sampleListings);
      setFilteredListings(sampleListings);
      setIsLoading(false);
    }, 1000);
  }, []);

  useEffect(() => {
    let filtered = [...listings];

    // Search filter
    if (searchTerm) {
      filtered = filtered.filter(
        (listing) =>
          listing.farmerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
          listing.variety.toLowerCase().includes(searchTerm.toLowerCase()) ||
          listing.location.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Variety filter
    if (selectedVariety !== "all") {
      filtered = filtered.filter((listing) => listing.variety.toLowerCase() === selectedVariety);
    }

    // Grade filter
    if (selectedGrade !== "all") {
      filtered = filtered.filter((listing) => listing.qualityGrade === selectedGrade);
    }

    // Location filter
    if (selectedLocation !== "all") {
      filtered = filtered.filter((listing) => listing.subCounty === selectedLocation);
    }

    // Price filter
    if (minPrice) {
      filtered = filtered.filter((listing) => listing.pricePerKg >= parseFloat(minPrice));
    }
    if (maxPrice) {
      filtered = filtered.filter((listing) => listing.pricePerKg <= parseFloat(maxPrice));
    }

    // Quantity filter
    if (minQuantity) {
      filtered = filtered.filter((listing) => listing.availableQuantity >= parseFloat(minQuantity));
    }

    // Sort
    filtered.sort((a, b) => {
      switch (sortBy) {
        case "price_asc":
          return a.pricePerKg - b.pricePerKg;
        case "price_desc":
          return b.pricePerKg - a.pricePerKg;
        case "quantity_desc":
          return b.availableQuantity - a.availableQuantity;
        case "rating_desc":
          return b.farmerRating - a.farmerRating;
        case "date_desc":
          return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
        case "distance_asc":
          return (a.distance || 0) - (b.distance || 0);
        default:
          return 0;
      }
    });

    setFilteredListings(filtered);
  }, [listings, searchTerm, selectedVariety, selectedGrade, selectedLocation, sortBy, minPrice, maxPrice, minQuantity]);

  const handlePlaceOrder = () => {
    if (!selectedListing || !orderQuantity || !deliveryLocation) return;

    const quantity = parseFloat(orderQuantity);
    if (quantity > selectedListing.availableQuantity) {
      alert(`Only ${selectedListing.availableQuantity} kg available`);
      return;
    }

    // TODO: Replace with actual API call
    console.log("Placing order:", {
      listingId: selectedListing.id,
      quantity,
      deliveryLocation,
      totalAmount: quantity * selectedListing.pricePerKg,
    });

    // Close dialog and reset
    setOrderDialogOpen(false);
    setOrderQuantity("");
    setDeliveryLocation("");
    setSelectedListing(null);
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

  const handleBulkCheckout = (items: any[], deliveryLocation: string) => {
    // TODO: Replace with actual API call
    console.log("Bulk checkout:", { items, deliveryLocation });
    setCartItems([]);
    setBulkCartOpen(false);
  };

  const getGradeColor = (grade: string) => {
    switch (grade) {
      case "A":
        return "bg-green-100 text-green-800 border-green-300";
      case "B":
        return "bg-yellow-100 text-yellow-800 border-yellow-300";
      case "C":
        return "bg-orange-100 text-orange-800 border-orange-300";
      default:
        return "bg-gray-100 text-gray-800 border-gray-300";
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
              setSelectedListing(matchedListing);
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
                {ofspVarieties.map((v) => (
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
                {qualityGrades.map((g) => (
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
          <span className="text-stone-900">{listings.length}</span> listings
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
                  {isHarvestedThisWeek && (
                    <div className="absolute bottom-0 left-0 right-0 p-3 bg-gradient-to-t from-black/50 to-transparent">
                      <div className="flex items-center gap-1 text-white/90 text-xs font-medium">
                        <IconClock className="h-3 w-3" />
                        <span>Harvested this week</span>
                      </div>
                    </div>
                  )}
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
                      <div className="grid grid-cols-[1fr_auto_auto] gap-2">
                        <Button
                          className="flex items-center justify-center gap-2 bg-stone-900 hover:bg-stone-800 text-white text-sm font-semibold py-2.5 px-4 rounded-lg transition-colors shadow-sm"
                          onClick={() => {
                            setSelectedListing(listing);
                            setOrderDialogOpen(true);
                          }}
                        >
                          <IconShoppingCart className="h-4 w-4" />
                          Order Now
                        </Button>
                        <Button
                          variant="outline"
                          size="icon"
                          className="p-2.5 rounded-lg border border-stone-200 hover:border-stone-300 hover:bg-stone-50 text-stone-600 transition-colors"
                          onClick={() => {
                            setSelectedListing(listing);
                            setNegotiationDialogOpen(true);
                          }}
                          title="Message Farmer"
                        >
                          <IconMessageCircle className="h-[18px] w-[18px]" />
                        </Button>
                        <Button
                          variant="outline"
                          className="px-3 rounded-lg border border-stone-200 hover:border-orange-500 hover:text-orange-500 text-stone-600 text-xs font-bold transition-colors"
                          onClick={() => {
                            setSelectedListing(listing);
                            setRfqDialogOpen(true);
                          }}
                          title="Request Quote"
                        >
                          RFQ
                        </Button>
                      </div>
                      {listing.batchId && (
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
                      )}
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
                <label className="text-sm font-medium mb-2 block">Quantity (kg)</label>
                <Input
                  type="number"
                  placeholder="Enter quantity"
                  value={orderQuantity}
                  onChange={(e) => setOrderQuantity(e.target.value)}
                  max={selectedListing.availableQuantity}
                  min={1}
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
              disabled={!orderQuantity || !deliveryLocation || parseFloat(orderQuantity) <= 0}
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

      {/* Negotiation Dialog */}
      {selectedListing && (
        <NegotiationDialog
          open={negotiationDialogOpen}
          onOpenChange={setNegotiationDialogOpen}
          listingId={selectedListing.id}
          farmerName={selectedListing.farmerName}
          buyerName="Current Buyer" // TODO: Get from context
          currentPrice={selectedListing.pricePerKg}
          currentQuantity={selectedListing.availableQuantity}
        />
      )}

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

