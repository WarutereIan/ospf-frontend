import { useState } from "react";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
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
import { IconSeeding, IconShoppingCart, IconSearch, IconFilter, IconStar, IconTruck } from "@tabler/icons-react";

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
  const [searchQuery, setSearchQuery] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [sortBy, setSortBy] = useState("relevance");
  const [selectedInput, setSelectedInput] = useState<InputItem | null>(null);
  const [orderDialogOpen, setOrderDialogOpen] = useState(false);
  const [quantity, setQuantity] = useState("1");
  const [needsTransport, setNeedsTransport] = useState(false);
  const [imageErrors, setImageErrors] = useState<Set<string>>(new Set());

  const [inputs] = useState<InputItem[]>([
    {
      id: "1",
      name: "OFSP Vines (Kenya)",
      provider: "AgriInputs Co.",
      category: "Planting Material",
      description: "High-quality Kenya variety OFSP vines, disease-resistant and high-yielding",
      price: 30,
      unit: "cutting",
      stock: 500,
      rating: 4.8,
      reviews: 45,
      location: "Machakos",
      image: "https://images.unsplash.com/photo-1625246333195-78d9c38ad449?w=400&h=300&fit=crop",
    },
    {
      id: "2",
      name: "OFSP Vines (SPK004)",
      provider: "FarmSupplies Ltd",
      category: "Planting Material",
      description: "SPK004 variety vines with excellent vitamin A content",
      price: 35,
      unit: "cutting",
      stock: 300,
      rating: 4.9,
      reviews: 38,
      location: "Kangundo",
      image: "https://images.unsplash.com/photo-1625246333195-78d9c38ad449?w=400&h=300&fit=crop",
    },
    {
      id: "3",
      name: "NPK Fertilizer (17-17-17)",
      provider: "AgriInputs Co.",
      category: "Fertilizer",
      description: "Balanced NPK fertilizer for optimal OFSP growth",
      price: 150,
      unit: "kg",
      stock: 200,
      rating: 4.7,
      reviews: 89,
      location: "Machakos",
      image: "https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?w=400&h=300&fit=crop",
    },
    {
      id: "4",
      name: "Organic Compost",
      provider: "EcoFarm Supplies",
      category: "Soil Amendment",
      description: "Rich organic compost from decomposed farm waste",
      price: 80,
      unit: "kg",
      stock: 500,
      rating: 4.6,
      reviews: 67,
      location: "Kathiani",
      image: "https://images.unsplash.com/photo-1585320806297-9794b3e4eeae?w=400&h=300&fit=crop",
    },
    {
      id: "5",
      name: "Farm Training Manual",
      provider: "Knowledge Hub",
      category: "Training Materials",
      description: "Comprehensive guide to OFSP farming best practices",
      price: 500,
      unit: "book",
      stock: 50,
      rating: 4.9,
      reviews: 124,
      location: "Nairobi",
      image: "https://images.unsplash.com/photo-1543002588-bfa74002ed7e?w=400&h=300&fit=crop",
    },
  ]);

  const categories = ["all", "Planting Material", "Fertilizer", "Soil Amendment", "Tools & Equipment", "Training Materials"];

  const filteredInputs = inputs.filter((input) => {
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
    setSelectedInput(input);
    setQuantity("1");
    setNeedsTransport(false);
    setOrderDialogOpen(true);
  };

  const handleSubmitOrder = () => {
    // Handle order submission
    alert(`Order placed: ${quantity} ${selectedInput?.unit}(s) of ${selectedInput?.name}`);
    setOrderDialogOpen(false);
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
                <Input
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
                Provider: {selectedInput?.provider}
              </div>
              <div className="text-sm font-medium mt-2">
                KES {selectedInput?.price}/{selectedInput?.unit}
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="quantity">Quantity</Label>
              <Input
                id="quantity"
                type="number"
                min="1"
                max={selectedInput?.stock}
                value={quantity}
                onChange={(e) => setQuantity(e.target.value)}
                placeholder="Enter quantity"
              />
              <p className="text-xs text-muted-foreground">
                Available: {selectedInput?.stock} {selectedInput?.unit}s
              </p>
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
              <Button variant="outline" onClick={() => setOrderDialogOpen(false)} className="flex-1">
                Cancel
              </Button>
              <Button onClick={handleSubmitOrder} className="flex-1">
                Place Order
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}

