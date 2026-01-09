import { useState } from "react";
import { Link } from "react-router-dom";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { IconArrowLeft, IconTrendingUp, IconTrendingDown, IconChartBar } from "@tabler/icons-react";

interface MarketPrice {
  variety: string;
  grade: string;
  currentPrice: number;
  previousPrice: number;
  change: number;
  changePercent: number;
  location: string;
  lastUpdated: string;
}

interface PriceTrend {
  date: string;
  price: number;
}

// Sample market data
const marketPrices: MarketPrice[] = [
  {
    variety: "Kenya",
    grade: "A",
    currentPrice: 150,
    previousPrice: 145,
    change: 5,
    changePercent: 3.45,
    location: "Kangundo",
    lastUpdated: new Date().toISOString(),
  },
  {
    variety: "Kenya",
    grade: "B",
    currentPrice: 130,
    previousPrice: 125,
    change: 5,
    changePercent: 4.0,
    location: "Kangundo",
    lastUpdated: new Date().toISOString(),
  },
  {
    variety: "SPK004",
    grade: "A",
    currentPrice: 120,
    previousPrice: 118,
    change: 2,
    changePercent: 1.69,
    location: "Kathiani",
    lastUpdated: new Date().toISOString(),
  },
  {
    variety: "SPK004",
    grade: "B",
    currentPrice: 110,
    previousPrice: 108,
    change: 2,
    changePercent: 1.85,
    location: "Kathiani",
    lastUpdated: new Date().toISOString(),
  },
  {
    variety: "Kabode",
    grade: "A",
    currentPrice: 100,
    previousPrice: 98,
    change: 2,
    changePercent: 2.04,
    location: "Masinga",
    lastUpdated: new Date().toISOString(),
  },
  {
    variety: "Kabode",
    grade: "B",
    currentPrice: 90,
    previousPrice: 88,
    change: 2,
    changePercent: 2.27,
    location: "Masinga",
    lastUpdated: new Date().toISOString(),
  },
];

export function MarketInfo() {
  const [selectedLocation, setSelectedLocation] = useState("all");
  const [selectedVariety, setSelectedVariety] = useState("all");

  const filteredPrices = marketPrices.filter((price) => {
    const matchesLocation = selectedLocation === "all" || price.location.toLowerCase() === selectedLocation;
    const matchesVariety = selectedVariety === "all" || price.variety.toLowerCase() === selectedVariety;
    return matchesLocation && matchesVariety;
  });

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-KE", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
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
          <h1 className="text-2xl sm:text-3xl font-bold">Market Information</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Real-time OFSP market prices and trends
          </p>
        </div>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle>Market Prices</CardTitle>
          <CardDescription>Current OFSP prices by variety, grade, and location</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col md:flex-row gap-4 mb-6">
            <Select value={selectedLocation} onValueChange={(value) => setSelectedLocation(value || "all")}>
              <SelectTrigger className="w-full md:w-[200px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Locations</SelectItem>
                <SelectItem value="kangundo">Kangundo</SelectItem>
                <SelectItem value="kathiani">Kathiani</SelectItem>
                <SelectItem value="masinga">Masinga</SelectItem>
                <SelectItem value="yatta">Yatta</SelectItem>
              </SelectContent>
            </Select>
            <Select value={selectedVariety} onValueChange={(value) => setSelectedVariety(value || "all")}>
              <SelectTrigger className="w-full md:w-[200px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Varieties</SelectItem>
                <SelectItem value="kenya">Kenya</SelectItem>
                <SelectItem value="spk004">SPK004</SelectItem>
                <SelectItem value="kabode">Kabode</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Price Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredPrices.map((price, index) => (
              <Card key={index}>
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-lg">
                      {price.variety} - Grade {price.grade}
                    </CardTitle>
                    <Badge
                      variant="outline"
                      className={
                        price.grade === "A"
                          ? "bg-green-100 text-green-800"
                          : price.grade === "B"
                          ? "bg-yellow-100 text-yellow-800"
                          : "bg-orange-100 text-orange-800"
                      }
                    >
                      Grade {price.grade}
                    </Badge>
                  </div>
                  <CardDescription>{price.location}</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div>
                      <p className="text-3xl font-bold">KES {price.currentPrice}/kg</p>
                      <div className="flex items-center gap-2 mt-1">
                        {price.change >= 0 ? (
                          <IconTrendingUp className="h-4 w-4 text-green-600" />
                        ) : (
                          <IconTrendingDown className="h-4 w-4 text-red-600" />
                        )}
                        <span
                          className={`text-sm font-medium ${
                            price.change >= 0 ? "text-green-600" : "text-red-600"
                          }`}
                        >
                          {price.change >= 0 ? "+" : ""}
                          {price.change} ({price.changePercent >= 0 ? "+" : ""}
                          {price.changePercent.toFixed(2)}%)
                        </span>
                      </div>
                    </div>
                    <div className="pt-3 border-t">
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">Previous Price</span>
                        <span className="font-medium">KES {price.previousPrice}/kg</span>
                      </div>
                      <div className="flex justify-between text-sm mt-1">
                        <span className="text-muted-foreground">Last Updated</span>
                        <span className="text-xs">{formatDate(price.lastUpdated)}</span>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Market Insights */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <IconChartBar className="h-5 w-5 text-primary" />
              Price Trends
            </CardTitle>
            <CardDescription>7-day price movement</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-sm">Kenya Grade A</span>
                <div className="flex items-center gap-2">
                  <span className="text-sm font-semibold">KES 150/kg</span>
                  <Badge variant="outline" className="bg-green-100 text-green-800">
                    +3.45%
                  </Badge>
                </div>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm">SPK004 Grade A</span>
                <div className="flex items-center gap-2">
                  <span className="text-sm font-semibold">KES 120/kg</span>
                  <Badge variant="outline" className="bg-green-100 text-green-800">
                    +1.69%
                  </Badge>
                </div>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm">Kabode Grade A</span>
                <div className="flex items-center gap-2">
                  <span className="text-sm font-semibold">KES 100/kg</span>
                  <Badge variant="outline" className="bg-green-100 text-green-800">
                    +2.04%
                  </Badge>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Market Insights</CardTitle>
            <CardDescription>Key market information</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="p-3 bg-muted rounded-lg">
                <p className="text-sm font-medium mb-1">Best Time to Sell</p>
                <p className="text-xs text-muted-foreground">
                  Prices are typically highest on Fridays and Saturdays
                </p>
              </div>
              <div className="p-3 bg-muted rounded-lg">
                <p className="text-sm font-medium mb-1">High Demand Period</p>
                <p className="text-xs text-muted-foreground">
                  Peak demand occurs during the first week of each month
                </p>
              </div>
              <div className="p-3 bg-muted rounded-lg">
                <p className="text-sm font-medium mb-1">Quality Premium</p>
                <p className="text-xs text-muted-foreground">
                  Grade A commands 15-20% premium over Grade B
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

