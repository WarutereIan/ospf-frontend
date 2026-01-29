import { useState, useEffect, useMemo } from "react";
import { Link } from "react-router-dom";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { 
  IconArrowLeft, 
  IconTrendingUp, 
  IconTrendingDown, 
  IconChartBar, 
  IconFlame,
  IconUsers,
  IconShoppingCart,
  IconAlertCircle,
  IconRefresh
} from "@tabler/icons-react";
import {
  PriceCard,
  LineChart,
  AlertCard,
} from "@/components/visualizations";
import { useAnalytics } from "@/contexts/AnalyticsContext";
import { cn } from "@/lib/utils";

interface MarketPrice {
  variety: string;
  grade: string;
  currentPrice: number;
  previousPrice: number;
  change: number;
  changePercent: number;
  location: string;
  listingCount?: number;
  lastUpdated: string;
}

interface BuyerDemand {
  variety: string;
  grade: string;
  demandLevel: "high" | "medium" | "low";
  buyerCount: number;
  totalQuantityNeeded: number;
  color: string;
}

interface PriceTrend {
  date: string;
  kenya?: number;
  spk004?: number;
  kabode?: number;
  kakamega?: number;
}

export function MarketInfo() {
  const { marketInfo, fetchMarketInfo, isLoading, error } = useAnalytics();
  
  const [selectedLocation, setSelectedLocation] = useState("all");
  const [selectedVariety, setSelectedVariety] = useState("all");
  const [timeRange, setTimeRange] = useState<"week" | "month" | "quarter">("month");

  // Fetch market info on mount and when filters change
  useEffect(() => {
    fetchMarketInfo({ 
      timeRange: timeRange === "week" ? "week" : timeRange === "quarter" ? "quarter" : "month" 
    });
  }, [fetchMarketInfo, timeRange]);

  // Extract real data from backend response
  const marketPrices: MarketPrice[] = useMemo(() => {
    if (!marketInfo?.prices || !Array.isArray(marketInfo.prices)) {
      return [];
    }
    return marketInfo.prices.map((p: any) => ({
      variety: p.variety || "",
      grade: p.grade || "",
      currentPrice: p.currentPrice || 0,
      previousPrice: p.previousPrice || 0,
      change: p.change || 0,
      changePercent: p.changePercent || 0,
      location: p.location || "",
      listingCount: p.listingCount || 0,
      lastUpdated: p.lastUpdated || new Date().toISOString(),
    }));
  }, [marketInfo]);

  const buyerDemand: BuyerDemand[] = useMemo(() => {
    if (!marketInfo?.buyerDemand || !Array.isArray(marketInfo.buyerDemand)) {
      return [];
    }
    return marketInfo.buyerDemand.map((d: any) => ({
      variety: d.variety || "",
      grade: d.grade || "",
      demandLevel: d.demandLevel || "low",
      buyerCount: d.buyerCount || 0,
      totalQuantityNeeded: d.totalQuantityNeeded || 0,
      color: d.color || "#22C55E",
    }));
  }, [marketInfo]);

  const priceTrends: PriceTrend[] = useMemo(() => {
    if (!marketInfo?.priceTrends || !Array.isArray(marketInfo.priceTrends)) {
      return [];
    }
    return marketInfo.priceTrends.map((t: any) => ({
      date: t.date || "",
      kenya: t.kenya,
      spk004: t.spk004,
      kabode: t.kabode,
      kakamega: t.kakamega,
    }));
  }, [marketInfo]);

  // Format price trend data for LineChart component
  const priceTrendData = useMemo(() => {
    return priceTrends.map((trend) => ({
      name: new Date(trend.date).toLocaleDateString("en-US", { month: "short", day: "numeric" }),
      date: trend.date,
      kenya: trend.kenya || 0,
      spk004: trend.spk004 || 0,
      kabode: trend.kabode || 0,
    }));
  }, [priceTrends]);

  // Filter prices by location and variety
  const filteredPrices = useMemo(() => {
    return marketPrices.filter((price) => {
      const matchesLocation = selectedLocation === "all" || 
        price.location.toLowerCase() === selectedLocation.toLowerCase();
      const matchesVariety = selectedVariety === "all" || 
        price.variety.toLowerCase() === selectedVariety.toLowerCase();
      return matchesLocation && matchesVariety;
    });
  }, [marketPrices, selectedLocation, selectedVariety]);

  // Filter buyer demand (only by variety, not location)
  const filteredBuyerDemand = useMemo(() => {
    return buyerDemand.filter((demand) => {
      const matchesVariety = selectedVariety === "all" || 
        demand.variety.toLowerCase() === selectedVariety.toLowerCase();
      return matchesVariety;
    });
  }, [buyerDemand, selectedVariety]);

  // Get unique locations and varieties for filters
  const availableLocations = useMemo(() => {
    const locations = new Set<string>();
    marketPrices.forEach((p) => locations.add(p.location));
    return Array.from(locations).sort();
  }, [marketPrices]);

  const availableVarieties = useMemo(() => {
    const varieties = new Set<string>();
    marketPrices.forEach((p) => varieties.add(p.variety));
    buyerDemand.forEach((d) => varieties.add(d.variety));
    return Array.from(varieties).sort();
  }, [marketPrices, buyerDemand]);

  // Get current prices for main varieties (Grade A, highest price location)
  const currentPrices = useMemo(() => {
    const kenya = marketPrices
      .filter((p) => p.variety.toLowerCase() === "kenya" && p.grade === "A")
      .sort((a, b) => b.currentPrice - a.currentPrice)[0];
    const spk004 = marketPrices
      .filter((p) => p.variety.toLowerCase() === "spk004" && p.grade === "A")
      .sort((a, b) => b.currentPrice - a.currentPrice)[0];
    const kabode = marketPrices
      .filter((p) => p.variety.toLowerCase() === "kabode" && p.grade === "A")
      .sort((a, b) => b.currentPrice - a.currentPrice)[0];

    return { kenya, spk004, kabode };
  }, [marketPrices]);

  // Calculate market insights from real data
  const marketInsights = useMemo(() => {
    if (marketPrices.length === 0) return null;

    const gradeAPrices = marketPrices.filter((p) => p.grade === "A");
    const gradeBPrices = marketPrices.filter((p) => p.grade === "B");

    const avgGradeA = gradeAPrices.length > 0
      ? gradeAPrices.reduce((sum, p) => sum + p.currentPrice, 0) / gradeAPrices.length
      : 0;
    const avgGradeB = gradeBPrices.length > 0
      ? gradeBPrices.reduce((sum, p) => sum + p.currentPrice, 0) / gradeBPrices.length
      : 0;

    const qualityPremium = avgGradeB > 0 ? ((avgGradeA - avgGradeB) / avgGradeB) * 100 : 0;

    // Find highest demand item
    const highestDemand = buyerDemand.length > 0
      ? buyerDemand.reduce((max, d) => 
          d.totalQuantityNeeded > max.totalQuantityNeeded ? d : max, 
          buyerDemand[0]
        )
      : null;

    return {
      qualityPremium: Math.round(qualityPremium),
      highestDemand,
      avgGradeA: Math.round(avgGradeA),
      avgGradeB: Math.round(avgGradeB),
    };
  }, [marketPrices, buyerDemand]);

  const formatDate = (dateString: string) => {
    try {
      return new Date(dateString).toLocaleDateString("en-KE", {
        year: "numeric",
        month: "short",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      });
    } catch {
      return "Unknown";
    }
  };

  const getDemandIcon = (level: "high" | "medium" | "low") => {
    switch (level) {
      case "high":
        return <IconFlame className="h-5 w-5" />;
      case "medium":
        return <IconAlertCircle className="h-5 w-5" />;
      default:
        return <IconChartBar className="h-5 w-5" />;
    }
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
            Real-time OFSP market prices and buyer demand insights
          </p>
        </div>
        <div className="flex gap-2">
          <Select value={timeRange} onValueChange={(v) => setTimeRange(v as typeof timeRange)}>
            <SelectTrigger className="w-[140px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="week">Last Week</SelectItem>
              <SelectItem value="month">Last Month</SelectItem>
              <SelectItem value="quarter">Last Quarter</SelectItem>
            </SelectContent>
          </Select>
          <Button
            variant="outline"
            size="sm"
            onClick={() => fetchMarketInfo({ timeRange: timeRange === "week" ? "week" : timeRange === "quarter" ? "quarter" : "month" })}
            disabled={isLoading}
          >
            <IconRefresh className={cn("h-4 w-4", isLoading && "animate-spin")} />
          </Button>
        </div>
      </div>

      {/* Error State */}
      {error && (
        <AlertCard
          type="error"
          title="Failed to Load Market Data"
          message={error}
        />
      )}

      {/* Buyer Demand Indicators - Improved Design */}
      <Card className="border-2">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2 text-xl">
                <IconFlame className="h-6 w-6 text-orange-500" />
                Buyer Demand Insights
              </CardTitle>
              <CardDescription className="mt-1">
                Aggregated demand by variety and grade across all locations from active RFQs, sourcing requests, and pending orders
              </CardDescription>
            </div>
            <Badge variant="outline" className="text-sm">
              {filteredBuyerDemand.length} Active Demands
            </Badge>
          </div>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {[1, 2, 3, 4, 5, 6].map((i) => (
                <Skeleton key={i} className="h-32 rounded-lg" />
              ))}
            </div>
          ) : filteredBuyerDemand.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              <IconShoppingCart className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>No active buyer demand found for selected filters</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredBuyerDemand.map((demand, index) => {
                const demandStyles = {
                  high: {
                    bg: "bg-gradient-to-br from-red-50 to-red-100",
                    border: "border-red-300",
                    text: "text-red-900",
                    badge: "bg-red-200 text-red-900 border-red-400",
                    icon: "text-red-600",
                  },
                  medium: {
                    bg: "bg-gradient-to-br from-orange-50 to-orange-100",
                    border: "border-orange-300",
                    text: "text-orange-900",
                    badge: "bg-orange-200 text-orange-900 border-orange-400",
                    icon: "text-orange-600",
                  },
                  low: {
                    bg: "bg-gradient-to-br from-green-50 to-green-100",
                    border: "border-green-300",
                    text: "text-green-900",
                    badge: "bg-green-200 text-green-900 border-green-400",
                    icon: "text-green-600",
                  },
                };

                const style = demandStyles[demand.demandLevel];

                return (
                  <Card
                    key={index}
                    className={cn(
                      "border-2 transition-all hover:shadow-lg hover:scale-[1.02]",
                      style.bg,
                      style.border
                    )}
                  >
                    <CardContent className="p-5">
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <div className={cn("p-1.5 rounded-lg", style.bg)}>
                              {getDemandIcon(demand.demandLevel)}
                            </div>
                            <div>
                              <h3 className={cn("font-bold text-lg", style.text)}>
                                {demand.variety}
                              </h3>
                              <p className="text-sm font-medium opacity-70">
                                Grade {demand.grade}
                              </p>
                            </div>
                          </div>
                        </div>
                        <div
                          className="w-10 h-10 rounded-full border-2 flex items-center justify-center font-bold text-white shadow-md"
                          style={{ backgroundColor: demand.color, borderColor: demand.color }}
                        >
                          {demand.demandLevel === "high" ? "🔥" : demand.demandLevel === "medium" ? "⚡" : "✓"}
                        </div>
                      </div>

                      <div className="space-y-3 pt-3 border-t border-current border-opacity-20">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <IconUsers className={cn("h-4 w-4", style.icon)} />
                            <span className={cn("text-sm font-medium", style.text)}>Buyers</span>
                          </div>
                          <span className={cn("text-lg font-bold", style.text)}>
                            {demand.buyerCount}
                          </span>
                        </div>
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <IconShoppingCart className={cn("h-4 w-4", style.icon)} />
                            <span className={cn("text-sm font-medium", style.text)}>Quantity Needed</span>
                          </div>
                          <span className={cn("text-lg font-bold", style.text)}>
                            {demand.totalQuantityNeeded.toLocaleString()} kg
                          </span>
                        </div>
                        <div className="pt-2">
                          <Badge
                            variant="outline"
                            className={cn("text-xs font-semibold w-full justify-center", style.badge)}
                          >
                            {demand.demandLevel.toUpperCase()} DEMAND
                          </Badge>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Current Prices - Improved Design */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <IconChartBar className="h-5 w-5 text-primary" />
            Current Market Prices (Grade A)
          </CardTitle>
          <CardDescription>Top prices by variety across all locations</CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="space-y-3">
              {[1, 2, 3].map((i) => (
                <Skeleton key={i} className="h-24 w-full" />
              ))}
            </div>
          ) : (
            <div className="space-y-3">
              {currentPrices.kenya && (
                <PriceCard
                  variety="Kenya"
                  price={currentPrices.kenya.currentPrice}
                  trend={{
                    value: Math.abs(currentPrices.kenya.changePercent),
                    direction: currentPrices.kenya.change >= 0 ? "up" : "down",
                  }}
                  priceRange={{
                    min: Math.min(...marketPrices.filter(p => p.variety.toLowerCase() === "kenya").map(p => p.currentPrice)),
                    max: Math.max(...marketPrices.filter(p => p.variety.toLowerCase() === "kenya").map(p => p.currentPrice)),
                    current: currentPrices.kenya.currentPrice,
                  }}
                  level="high"
                />
              )}
              {currentPrices.spk004 && (
                <PriceCard
                  variety="SPK004"
                  price={currentPrices.spk004.currentPrice}
                  trend={{
                    value: Math.abs(currentPrices.spk004.changePercent),
                    direction: currentPrices.spk004.change >= 0 ? "up" : "down",
                  }}
                  priceRange={{
                    min: Math.min(...marketPrices.filter(p => p.variety.toLowerCase() === "spk004").map(p => p.currentPrice)),
                    max: Math.max(...marketPrices.filter(p => p.variety.toLowerCase() === "spk004").map(p => p.currentPrice)),
                    current: currentPrices.spk004.currentPrice,
                  }}
                  level="medium"
                />
              )}
              {currentPrices.kabode && (
                <PriceCard
                  variety="Kabode"
                  price={currentPrices.kabode.currentPrice}
                  trend={{
                    value: Math.abs(currentPrices.kabode.changePercent),
                    direction: currentPrices.kabode.change >= 0 ? "up" : "neutral",
                  }}
                  priceRange={{
                    min: Math.min(...marketPrices.filter(p => p.variety.toLowerCase() === "kabode").map(p => p.currentPrice)),
                    max: Math.max(...marketPrices.filter(p => p.variety.toLowerCase() === "kabode").map(p => p.currentPrice)),
                    current: currentPrices.kabode.currentPrice,
                  }}
                  level="low"
                />
              )}
              {!currentPrices.kenya && !currentPrices.spk004 && !currentPrices.kabode && (
                <div className="text-center py-8 text-muted-foreground">
                  <p>No price data available</p>
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Price Trend Chart */}
      {priceTrendData.length > 0 && (
        <LineChart
          data={priceTrendData}
          lines={[
            {
              dataKey: "kenya",
              name: "Kenya",
              color: "#F97316",
            },
            {
              dataKey: "spk004",
              name: "SPK004",
              color: "#8B5CF6",
            },
            {
              dataKey: "kabode",
              name: "Kabode",
              color: "#14B8A6",
            },
          ]}
          title={`Price Trend (${timeRange === "week" ? "Last 7 Days" : timeRange === "quarter" ? "Last 3 Months" : "Last 30 Days"})`}
          description="Historical price movement based on completed orders"
          height={300}
          formatter={(value) => `KES ${value.toFixed(0)}/kg`}
          showLegend={true}
        />
      )}

      {/* High Demand Alert */}
      {marketInsights?.highestDemand && (
        <AlertCard
          type="warning"
          title={`🔥 HIGH DEMAND: ${marketInsights.highestDemand.variety} Grade ${marketInsights.highestDemand.grade}`}
          message={`${marketInsights.highestDemand.buyerCount} buyers seeking ${marketInsights.highestDemand.totalQuantityNeeded.toLocaleString()} kg across all locations`}
          className="border-orange-200 bg-orange-50"
        />
      )}

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle>Detailed Market Prices</CardTitle>
          <CardDescription>All prices by variety, grade, and location</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col md:flex-row gap-4 mb-6">
            <Select value={selectedLocation} onValueChange={(value) => setSelectedLocation(value || "all")}>
              <SelectTrigger className="w-full md:w-[200px]">
                <SelectValue placeholder="Filter by location" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Locations</SelectItem>
                {availableLocations.map((loc) => (
                  <SelectItem key={loc} value={loc.toLowerCase()}>
                    {loc}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={selectedVariety} onValueChange={(value) => setSelectedVariety(value || "all")}>
              <SelectTrigger className="w-full md:w-[200px]">
                <SelectValue placeholder="Filter by variety" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Varieties</SelectItem>
                {availableVarieties.map((var_) => (
                  <SelectItem key={var_} value={var_.toLowerCase()}>
                    {var_}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Price Cards Grid - Improved Design */}
          {isLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {[1, 2, 3, 4, 5, 6].map((i) => (
                <Skeleton key={i} className="h-48 rounded-lg" />
              ))}
            </div>
          ) : filteredPrices.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              <IconChartBar className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>No price data available for selected filters</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredPrices.map((price, index) => (
                <Card key={index} className="hover:shadow-lg transition-shadow">
                  <CardHeader className="pb-3">
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-lg">
                        {price.variety} - Grade {price.grade}
                      </CardTitle>
                      <Badge
                        variant="outline"
                        className={
                          price.grade === "A"
                            ? "bg-green-100 text-green-800 border-green-300"
                            : price.grade === "B"
                            ? "bg-yellow-100 text-yellow-800 border-yellow-300"
                            : "bg-orange-100 text-orange-800 border-orange-300"
                        }
                      >
                        {price.grade}
                      </Badge>
                    </div>
                    <CardDescription className="flex items-center gap-1 mt-1">
                      <span>📍</span>
                      {price.location}
                      {price.listingCount !== undefined && price.listingCount > 0 && (
                        <span className="ml-2 text-xs">
                          ({price.listingCount} {price.listingCount === 1 ? "listing" : "listings"})
                        </span>
                      )}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      <div>
                        <p className="text-3xl font-bold">KES {price.currentPrice.toFixed(2)}/kg</p>
                        <div className="flex items-center gap-2 mt-2">
                          {price.change >= 0 ? (
                            <IconTrendingUp className="h-4 w-4 text-green-600" />
                          ) : (
                            <IconTrendingDown className="h-4 w-4 text-red-600" />
                          )}
                          <span
                            className={cn(
                              "text-sm font-medium",
                              price.change >= 0 ? "text-green-600" : "text-red-600"
                            )}
                          >
                            {price.change >= 0 ? "+" : ""}
                            {price.change.toFixed(2)} ({price.changePercent >= 0 ? "+" : ""}
                            {price.changePercent.toFixed(2)}%)
                          </span>
                        </div>
                      </div>
                      <div className="pt-3 border-t space-y-2">
                        <div className="flex justify-between text-sm">
                          <span className="text-muted-foreground">Previous Price</span>
                          <span className="font-medium">KES {price.previousPrice.toFixed(2)}/kg</span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span className="text-muted-foreground">Last Updated</span>
                          <span className="text-xs">{formatDate(price.lastUpdated)}</span>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Market Insights - Using Real Data */}
      {marketInsights && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <IconChartBar className="h-5 w-5 text-primary" />
                Price Analysis
              </CardTitle>
              <CardDescription>Market price insights</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {currentPrices.kenya && (
                  <div className="flex justify-between items-center p-3 bg-muted rounded-lg">
                    <span className="text-sm font-medium">Kenya Grade A</span>
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-semibold">
                        KES {currentPrices.kenya.currentPrice.toFixed(2)}/kg
                      </span>
                      <Badge
                        variant="outline"
                        className={
                          currentPrices.kenya.change >= 0
                            ? "bg-green-100 text-green-800"
                            : "bg-red-100 text-red-800"
                        }
                      >
                        {currentPrices.kenya.change >= 0 ? "+" : ""}
                        {currentPrices.kenya.changePercent.toFixed(2)}%
                      </Badge>
                    </div>
                  </div>
                )}
                {currentPrices.spk004 && (
                  <div className="flex justify-between items-center p-3 bg-muted rounded-lg">
                    <span className="text-sm font-medium">SPK004 Grade A</span>
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-semibold">
                        KES {currentPrices.spk004.currentPrice.toFixed(2)}/kg
                      </span>
                      <Badge
                        variant="outline"
                        className={
                          currentPrices.spk004.change >= 0
                            ? "bg-green-100 text-green-800"
                            : "bg-red-100 text-red-800"
                        }
                      >
                        {currentPrices.spk004.change >= 0 ? "+" : ""}
                        {currentPrices.spk004.changePercent.toFixed(2)}%
                      </Badge>
                    </div>
                  </div>
                )}
                {currentPrices.kabode && (
                  <div className="flex justify-between items-center p-3 bg-muted rounded-lg">
                    <span className="text-sm font-medium">Kabode Grade A</span>
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-semibold">
                        KES {currentPrices.kabode.currentPrice.toFixed(2)}/kg
                      </span>
                      <Badge
                        variant="outline"
                        className={
                          currentPrices.kabode.change >= 0
                            ? "bg-green-100 text-green-800"
                            : "bg-red-100 text-red-800"
                        }
                      >
                        {currentPrices.kabode.change >= 0 ? "+" : ""}
                        {currentPrices.kabode.changePercent.toFixed(2)}%
                      </Badge>
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Market Insights</CardTitle>
              <CardDescription>Key insights from current market data</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {marketInsights.qualityPremium > 0 && (
                  <div className="p-3 bg-gradient-to-r from-green-50 to-blue-50 rounded-lg border border-green-200">
                    <p className="text-sm font-medium mb-1">Quality Premium</p>
                    <p className="text-xs text-muted-foreground">
                      Grade A commands {marketInsights.qualityPremium}% premium over Grade B
                      {marketInsights.avgGradeA > 0 && marketInsights.avgGradeB > 0 && (
                        <span className="block mt-1">
                          (Avg: KES {marketInsights.avgGradeA}/kg vs KES {marketInsights.avgGradeB}/kg)
                        </span>
                      )}
                    </p>
                  </div>
                )}
                {marketInsights.highestDemand && (
                  <div className="p-3 bg-gradient-to-r from-orange-50 to-red-50 rounded-lg border border-orange-200">
                    <p className="text-sm font-medium mb-1">Highest Demand Opportunity</p>
                    <p className="text-xs text-muted-foreground">
                      {marketInsights.highestDemand.variety} Grade {marketInsights.highestDemand.grade}
                      <span className="block mt-1">
                        {marketInsights.highestDemand.buyerCount} buyers seeking{" "}
                        {marketInsights.highestDemand.totalQuantityNeeded.toLocaleString()} kg across all locations
                      </span>
                    </p>
                  </div>
                )}
                {marketPrices.length > 0 && (
                  <div className="p-3 bg-muted rounded-lg">
                    <p className="text-sm font-medium mb-1">Market Coverage</p>
                    <p className="text-xs text-muted-foreground">
                      {marketPrices.length} price points across {availableLocations.length} locations
                      {availableVarieties.length > 0 && (
                        <span> and {availableVarieties.length} varieties</span>
                      )}
                    </p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
