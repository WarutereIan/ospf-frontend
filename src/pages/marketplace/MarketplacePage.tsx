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
} from "@tabler/icons-react";
import { useUserRole } from "@/contexts/UserRoleContext";
import { NegotiationDialog } from "@/components/messaging/NegotiationDialog";
import { SmartMatching } from "@/components/marketplace/SmartMatching";
import { BulkOrderCart } from "./BulkOrderCart";
import { allAggregationCenters, formatCenterLabel } from "@/data/aggregationCenters";
import {
  PriceDistributionBar,
  StarRating,
} from "@/components/visualizations";

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
  const { role } = useUserRole();
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
          description: "Fresh Grade A Kenya variety, harvested this week",
          status: "active",
          responseTime: 15,
          distance: 5.2,
          createdAt: new Date().toISOString(),
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
          description: "Premium SPK004, high beta-carotene content",
          status: "active",
          responseTime: 8,
          distance: 12.5,
          createdAt: new Date().toISOString(),
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
          description: "Good quality Kabode variety",
          status: "active",
          responseTime: 30,
          distance: 18.3,
          createdAt: new Date().toISOString(),
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
    <div className="space-y-6">
      {/* Header */}
      <div className="space-y-2">
        <h1 className="text-2xl sm:text-3xl font-bold">Marketplace</h1>
        <p className="text-muted-foreground">
          Browse and order OFSP produce directly from farmers
        </p>
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

      {/* Search and Filters */}
      <div className="space-y-4">
        {role === "buyer" && (
          <div className="flex items-center justify-between">
            <Button
              variant="outline"
              onClick={() => setShowSmartMatching(!showSmartMatching)}
            >
              <IconSparkles className="mr-2 h-4 w-4" />
              {showSmartMatching ? "Hide" : "Show"} Smart Matching
            </Button>
            {cartItems.length > 0 && (
              <Button onClick={() => setBulkCartOpen(true)}>
                <IconShoppingCart className="mr-2 h-4 w-4" />
                Cart ({cartItems.length})
              </Button>
            )}
          </div>
        )}

        {/* Price Distribution Bar */}
        <PriceDistributionBar
          minPrice={90}
          maxPrice={180}
          mostCommonPrice={150}
          title="Price Range (Current Market)"
          description="Distribution of current market prices"
        />

        {/* Search Bar */}
        <div className="relative">
          <IconSearch className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search by variety, farmer name, or location..."
            className="pl-10"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        {/* Filter Row */}
        <div className="flex flex-wrap gap-4 items-center">
          <div className="flex items-center gap-2 flex-1 min-w-[200px]">
            <label className="text-sm font-medium whitespace-nowrap">Variety</label>
            <Select value={selectedVariety} onValueChange={(value) => setSelectedVariety(value || "all")}>
              <SelectTrigger className="flex-1">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {ofspVarieties.map((v) => (
                  <SelectItem key={v.value} value={v.value}>
                    {v.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="flex items-center gap-2 flex-1 min-w-[200px]">
            <label className="text-sm font-medium whitespace-nowrap">Quality Grade</label>
            <Select value={selectedGrade} onValueChange={(value) => setSelectedGrade(value || "all")}>
              <SelectTrigger className="flex-1">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {qualityGrades.map((g) => (
                  <SelectItem key={g.value} value={g.value}>
                    {g.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="flex items-center gap-2 flex-1 min-w-[200px]">
            <label className="text-sm font-medium whitespace-nowrap">Location</label>
            <Select value={selectedLocation} onValueChange={(value) => setSelectedLocation(value || "all")}>
              <SelectTrigger className="flex-1">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {subCounties.map((s) => (
                  <SelectItem key={s.value} value={s.value}>
                    {s.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="flex items-center gap-2 flex-1 min-w-[200px]">
            <label className="text-sm font-medium whitespace-nowrap">Sort By</label>
            <Select value={sortBy} onValueChange={(value) => setSortBy(value || "date_desc")}>
              <SelectTrigger className="flex-1">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {sortOptions.map((s) => (
                  <SelectItem key={s.value} value={s.value}>
                    {s.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Advanced Filters */}
        <div className="flex flex-wrap gap-4 items-end">
          <div className="flex-1 min-w-[150px]">
            <label className="text-sm font-medium mb-2 block">Min Price (KES/kg)</label>
            <Input
              type="number"
              placeholder="Min"
              value={minPrice}
              onChange={(e) => setMinPrice(e.target.value)}
            />
          </div>
          <div className="flex-1 min-w-[150px]">
            <label className="text-sm font-medium mb-2 block">Max Price (KES/kg)</label>
            <Input
              type="number"
              placeholder="Max"
              value={maxPrice}
              onChange={(e) => setMaxPrice(e.target.value)}
            />
          </div>
          <div className="flex-1 min-w-[150px]">
            <label className="text-sm font-medium mb-2 block">Min Quantity (kg)</label>
            <Input
              type="number"
              placeholder="Min"
              value={minQuantity}
              onChange={(e) => setMinQuantity(e.target.value)}
            />
          </div>
        </div>

        {/* Results Count */}
        <div className="text-sm text-muted-foreground">
          Showing {filteredListings.length} of {listings.length} listings
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
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {filteredListings.map((listing) => (
            <Card key={listing.id} className="flex flex-col">
              <CardHeader>
                {listing.photos && listing.photos.length > 0 ? (
                  <div className="aspect-video w-full rounded-lg overflow-hidden mb-4 bg-muted relative group">
                    <img
                      src={listing.photos[0]}
                      alt={listing.variety}
                      className="w-full h-full object-cover"
                    />
                    {listing.photos.length > 1 && (
                      <div className="absolute top-2 right-2 bg-black/50 text-white text-xs px-2 py-1 rounded">
                        +{listing.photos.length - 1} more
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="aspect-video w-full rounded-lg bg-muted mb-4 flex items-center justify-center">
                    <IconPackage className="h-12 w-12 text-muted-foreground" />
                  </div>
                )}
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <CardTitle className="text-lg">{listing.variety} - Grade {listing.qualityGrade}</CardTitle>
                    <CardDescription className="mt-1">
                      {listing.farmerName} • {listing.location}
                    </CardDescription>
                  </div>
                  <Badge variant="outline" className={getGradeColor(listing.qualityGrade)}>
                    Grade {listing.qualityGrade}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="flex-1 space-y-3">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-2xl font-bold">KES {listing.pricePerKg}/kg</p>
                    <p className="text-xs text-muted-foreground">per kilogram</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm text-muted-foreground">Available</p>
                    <p className="font-semibold">{listing.availableQuantity} kg</p>
                  </div>
                </div>

                {listing.description && (
                  <p className="text-sm text-muted-foreground line-clamp-2">{listing.description}</p>
                )}

                <div className="flex items-center gap-4 text-sm">
                  <StarRating
                    rating={listing.farmerRating}
                    maxRating={5}
                    size="sm"
                    showValue={true}
                  />
                  {listing.distance && (
                    <div className="flex items-center gap-1 text-muted-foreground">
                      <IconMapPin className="h-4 w-4" />
                      <span>{listing.distance} km</span>
                    </div>
                  )}
                  {listing.responseTime && (
                    <div className="flex items-center gap-1 text-muted-foreground">
                      <IconTrendingUp className="h-4 w-4" />
                      <span>{listing.responseTime} min</span>
                    </div>
                  )}
                </div>
              </CardContent>
              <CardFooter className="flex gap-2">
                {role === "buyer" && (
                  <>
                    <Button
                      className="flex-1"
                      onClick={() => {
                        setSelectedListing(listing);
                        setOrderDialogOpen(true);
                      }}
                    >
                      <IconShoppingCart className="mr-2 h-4 w-4" />
                      Order Now
                    </Button>
                    <Button
                      variant="outline"
                      onClick={() => {
                        setSelectedListing(listing);
                        setNegotiationDialogOpen(true);
                      }}
                      title="Negotiate"
                    >
                      <IconMessageCircle className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="outline"
                      onClick={() => {
                        setSelectedListing(listing);
                        setRfqDialogOpen(true);
                      }}
                      title="Request Quote"
                    >
                      RFQ
                    </Button>
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={() => handleAddToCart(listing)}
                      title="Add to Cart"
                    >
                      <IconShoppingCart className="h-4 w-4" />
                    </Button>
                  </>
                )}
                {role !== "buyer" && (
                  <Button variant="outline" className="w-full" disabled>
                    Login as Buyer to Order
                  </Button>
                )}
              </CardFooter>
            </Card>
          ))}
        </div>
      ) : (
        <Card>
          <CardContent className="py-12 text-center">
            <IconPackage className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <p className="text-lg font-medium text-muted-foreground">No listings found</p>
            <p className="text-sm text-muted-foreground mt-1">
              Try adjusting your filters or search terms
            </p>
          </CardContent>
        </Card>
      )}

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
    </div>
  );
}

