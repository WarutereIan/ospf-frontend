import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input as InputComponent } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { IconSeeding, IconShoppingCart, IconSearch, IconFilter, IconStar, IconTruck, IconLoader2 } from "@tabler/icons-react";
import { useInput } from "@/contexts/InputContext";
import { useAuth } from "@/contexts/AuthContext";
import { createInputOrder } from "@/services/inputService";
import { showSuccess, showError } from "@/lib/toast";
import type { Input } from "@/types/input";

interface InputItem {
  id: string;
  name: string;
  provider: string;
  category: string;
  description: string;
  price: number;
  unit: string;
  stock: number;
  rating: number;
  reviews: number;
  image?: string;
  location: string;
}

export default function InputMarketplace() {
  const { inputs, fetchInputs, isLoading } = useInput();
  const { user } = useAuth();
  
  const [searchQuery, setSearchQuery] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [sortBy, setSortBy] = useState("relevance");
  const [selectedInput, setSelectedInput] = useState<Input | null>(null);
  const [orderDialogOpen, setOrderDialogOpen] = useState(false);
  const [quantity, setQuantity] = useState("1");
  const [needsTransport, setNeedsTransport] = useState(false);
  const [imageErrors, setImageErrors] = useState<Set<string>>(new Set());
  const [isSubmittingOrder, setIsSubmittingOrder] = useState(false);

  // Fetch inputs on mount
  useEffect(() => {
    fetchInputs();
  }, [fetchInputs]);

  // Convert inputs to InputItem format
  const inputItems: InputItem[] = inputs.map((input) => ({
    id: input.id,
    name: input.name,
    provider: input.providerName || "Input Provider",
    category: input.category,
    description: input.description || "",
    price: input.price,
    unit: input.unit,
    stock: input.stock,
    rating: input.rating || 4.5,
    reviews: input.reviews || 0,
    location: input.location || "Machakos",
    image: input.images?.[0],
  }));

  const categories = ["all", "Planting Material", "Fertilizer", "Soil Amendment", "Tools & Equipment", "Training Materials"];

  const filteredInputs = inputItems.filter((input) => {
    const matchesSearch = input.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      input.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = categoryFilter === "all" || input.category === categoryFilter;
    return matchesSearch && matchesCategory;
  });

  const sortedInputs = [...filteredInputs].sort((a, b) => {
    switch (sortBy) {
      case "price_low":
        return a.price - b.price;
      case "price_high":
        return b.price - a.price;
      case "rating":
        return b.rating - a.rating;
      default:
        return 0;
    }
  });

  const handleOrderInput = (input: InputItem) => {
    // Find the actual Input from inputs array
    const actualInput = inputs.find(i => i.id === input.id);
    setSelectedInput(actualInput || null);
    setQuantity("1");
    setNeedsTransport(false);
    setOrderDialogOpen(true);
  };

  const handleSubmitOrder = async () => {
    // Validate user is authenticated
    if (!user?.id) {
      showError("Authentication required", "Please log in to place an order");
      return;
    }

    // Validate input is selected
    if (!selectedInput) {
      showError("No input selected", "Please select an input to order");
      return;
    }

    // Validate quantity
    const qty = parseInt(quantity || "0");
    if (isNaN(qty) || qty < 1) {
      showError("Invalid quantity", "Please enter a valid quantity (minimum 1)");
      return;
    }

    // Validate stock availability
    if (qty > selectedInput.stock) {
      showError(
        "Insufficient stock",
        `Only ${selectedInput.stock} ${selectedInput.unit}(s) available. You requested ${qty}.`
      );
      return;
    }

    setIsSubmittingOrder(true);

    try {
      // Build order object
      const orderData = {
        inputId: selectedInput.id,
        quantity: qty,
        requiresTransport: needsTransport,
        transportFee: needsTransport ? 500 : undefined,
        notes: undefined, // Can be added later if needed
      };

      // Create the order
      const result = await createInputOrder(orderData);

      if (result.error) {
        showError("Failed to place order", result.error);
      } else {
        showSuccess(
          "Order placed successfully",
          `Your order for ${qty} ${selectedInput.unit}(s) of ${selectedInput.name} has been placed.`
        );
        
        // Close dialog and reset form
        setOrderDialogOpen(false);
        setQuantity("1");
        setNeedsTransport(false);
        setSelectedInput(null);
        
        // Refresh inputs to update stock availability
        await fetchInputs();
      }
    } catch (error: any) {
      const errorMessage = error?.message || "Failed to place order. Please try again.";
      showError("Order failed", errorMessage);
      console.error("Error placing order:", error);
    } finally {
      setIsSubmittingOrder(false);
    }
  };

  const calculateTotal = () => {
    if (!selectedInput) return 0;
    const itemTotal = selectedInput.price * parseInt(quantity || "0");
    const transportCost = needsTransport ? 500 : 0; // Fixed transport cost for demo
    return itemTotal + transportCost;
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-foreground">Input Marketplace</h1>
        <p className="text-muted-foreground mt-1">
          Browse and purchase agricultural inputs from verified providers
        </p>
      </div>

      {/* Search and Filters */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-wrap gap-4 items-center">
            <div className="flex items-center gap-2 flex-1 min-w-[200px]">
              <Label htmlFor="search" className="text-sm font-medium whitespace-nowrap">Search</Label>
              <div className="relative flex-1">
                <IconSearch className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <InputComponent
                  id="search"
                  placeholder="Search inputs..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <div className="flex items-center gap-2 flex-1 min-w-[200px]">
              <Label htmlFor="category" className="text-sm font-medium whitespace-nowrap">Category</Label>
              <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                <SelectTrigger id="category" className="flex-1">
                  <IconFilter className="mr-2 h-4 w-4" />
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {categories.map((cat) => (
                    <SelectItem key={cat} value={cat}>
                      {cat === "all" ? "All Categories" : cat}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="flex items-center gap-2 flex-1 min-w-[200px]">
              <Label htmlFor="sort" className="text-sm font-medium whitespace-nowrap">Sort By</Label>
              <Select value={sortBy} onValueChange={setSortBy}>
                <SelectTrigger id="sort" className="flex-1">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="relevance">Relevance</SelectItem>
                  <SelectItem value="price_low">Price: Low to High</SelectItem>
                  <SelectItem value="price_high">Price: High to Low</SelectItem>
                  <SelectItem value="rating">Highest Rated</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Results */}
      <div>
        <p className="text-sm text-muted-foreground mb-4">
          Showing {sortedInputs.length} result{sortedInputs.length !== 1 ? "s" : ""}
        </p>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {sortedInputs.map((input) => (
            <Card key={input.id} className="hover:shadow-lg transition-shadow overflow-hidden">
              {/* Image Section */}
              <div className="relative w-full h-48 bg-muted overflow-hidden">
                {input.image && !imageErrors.has(input.id) ? (
                  <>
                    <img
                      src={input.image}
                      alt={input.name}
                      className="w-full h-full object-cover"
                      onError={() => {
                        setImageErrors((prev) => new Set(prev).add(input.id));
                      }}
                    />
                    <div className="absolute top-2 right-2">
                      <Badge variant="secondary" className="bg-background/80 backdrop-blur-sm">
                        {input.category}
                      </Badge>
                    </div>
                  </>
                ) : (
                  <>
                    <div className="w-full h-full flex items-center justify-center bg-primary/10">
                      <IconSeeding className="h-16 w-16 text-primary" />
                    </div>
                    <div className="absolute top-2 right-2">
                      <Badge variant="secondary" className="bg-background/80 backdrop-blur-sm">
                        {input.category}
                      </Badge>
                    </div>
                  </>
                )}
              </div>
              
              <CardHeader>
                <CardTitle className="mt-2">{input.name}</CardTitle>
                <CardDescription>{input.provider}</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                <p className="text-sm text-muted-foreground line-clamp-2">
                  {input.description}
                </p>
                <div className="flex items-center gap-1 text-sm">
                  <IconStar className="h-4 w-4 text-warning fill-warning" />
                  <span className="font-medium">{input.rating}</span>
                  <span className="text-muted-foreground">({input.reviews} reviews)</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <span>📍 {input.location}</span>
                  <span>•</span>
                  <span>{input.stock} {input.unit}s available</span>
                </div>
                <div className="text-2xl font-bold text-primary">
                  KES {input.price}
                  <span className="text-sm font-normal text-muted-foreground">/{input.unit}</span>
                </div>
              </CardContent>
              <CardFooter>
                <Button className="w-full" onClick={() => handleOrderInput(input)}>
                  <IconShoppingCart className="mr-2 h-4 w-4" />
                  Order Now
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>
      </div>

      {/* Order Dialog */}
      <Dialog open={orderDialogOpen} onOpenChange={setOrderDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Order {selectedInput?.name}</DialogTitle>
            <DialogDescription>
              Complete your order details below
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="p-4 border rounded-lg bg-accent/50">
              <div className="font-medium">{selectedInput?.name}</div>
              <div className="text-sm text-muted-foreground">
                Provider: {selectedInput?.providerName || "Input Provider"}
              </div>
              <div className="text-sm font-medium mt-2">
                KES {selectedInput?.price}/{selectedInput?.unit}
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="quantity">Quantity</Label>
              <InputComponent
                id="quantity"
                type="number"
                min="1"
                max={selectedInput?.stock}
                value={quantity}
                onChange={(e) => setQuantity(e.target.value)}
                placeholder="Enter quantity"
                className={(() => {
                  const qty = parseInt(quantity || "0");
                  return qty > (selectedInput?.stock || 0) ? "border-destructive" : "";
                })()}
              />
              <p className="text-xs text-muted-foreground">
                Available: {selectedInput?.stock} {selectedInput?.unit}s
              </p>
              {(() => {
                const qty = parseInt(quantity || "0");
                if (qty > (selectedInput?.stock || 0)) {
                  return (
                    <p className="text-xs text-destructive font-medium">
                      Quantity exceeds available stock. Maximum: {selectedInput?.stock} {selectedInput?.unit}s
                    </p>
                  );
                }
                return null;
              })()}
            </div>

            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="transport"
                  checked={needsTransport}
                  onChange={(e) => setNeedsTransport(e.target.checked)}
                  className="h-4 w-4"
                />
                <Label htmlFor="transport" className="flex items-center gap-2 cursor-pointer">
                  <IconTruck className="h-4 w-4" />
                  Request Transport (+KES 500)
                </Label>
              </div>
              {needsTransport && (
                <p className="text-xs text-muted-foreground pl-6">
                  A transport provider will deliver to your location
                </p>
              )}
            </div>

            <div className="border-t pt-4">
              <div className="flex justify-between text-sm mb-2">
                <span>Subtotal:</span>
                <span>
                  KES {((selectedInput?.price || 0) * parseInt(quantity || "0")).toFixed(2)}
                </span>
              </div>
              {needsTransport && (
                <div className="flex justify-between text-sm mb-2">
                  <span>Transport:</span>
                  <span>KES 500.00</span>
                </div>
              )}
              <div className="flex justify-between font-bold text-lg">
                <span>Total:</span>
                <span>KES {calculateTotal().toFixed(2)}</span>
              </div>
            </div>

            <div className="flex gap-2">
              <Button 
                variant="outline" 
                onClick={() => setOrderDialogOpen(false)} 
                className="flex-1"
                disabled={isSubmittingOrder}
              >
                Cancel
              </Button>
              <Button 
                onClick={handleSubmitOrder} 
                className="flex-1"
                disabled={isSubmittingOrder || !selectedInput || !quantity || parseInt(quantity || "0") < 1}
              >
                {isSubmittingOrder ? (
                  <>
                    <IconLoader2 className="mr-2 h-4 w-4 animate-spin" />
                    Placing Order...
                  </>
                ) : (
                  "Place Order"
                )}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}

