import { useState, useEffect, useMemo } from "react";
import { Link } from "react-router-dom";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { 
  IconArrowLeft, 
  IconTrophy, 
  IconTrendingUp, 
  IconUsers, 
  IconCurrency,
  IconRefresh
} from "@tabler/icons-react";
import { AchievementBadges } from "@/components/leaderboard/AchievementBadges";
import { GrowthChart } from "@/components/leaderboard/GrowthChart";
import {
  PositionMarker,
  HorizontalBarChart,
  ProgressBar,
} from "@/components/visualizations";
import { useAnalytics } from "@/contexts/AnalyticsContext";
import { useProfile } from "@/contexts/ProfileContext";
import { useAuth } from "@/contexts/AuthContext";
import { cn } from "@/lib/utils";
import type { LeaderboardEntry } from "@/types/analytics";

export function PeerLeaderboard() {
  const { 
    leaderboards, 
    fetchLeaderboard, 
    farmerAnalytics,
    fetchFarmerAnalytics,
    trends,
    fetchTrends,
    isLoading,
    error
  } = useAnalytics();
  const { user } = useAuth();
  const { selectedProfile } = useProfile();
  
  const [sortBy, setSortBy] = useState<"revenue" | "sales" | "orders" | "rating">("revenue");
  const [filterSubCounty, setFilterSubCounty] = useState("all");
  const [period, setPeriod] = useState<"daily" | "weekly" | "monthly" | "quarterly" | "yearly">("monthly");

  // Fetch leaderboard and farmer analytics on mount and when period changes
  useEffect(() => {
    fetchLeaderboard("revenue", period);
    fetchFarmerAnalytics({ timeRange: period === "daily" ? "day" : period === "weekly" ? "week" : period === "monthly" ? "month" : period === "quarterly" ? "quarter" : "year" });
    fetchTrends({ timeRange: period === "daily" ? "day" : period === "weekly" ? "week" : period === "monthly" ? "month" : period === "quarterly" ? "quarter" : "year" });
  }, [fetchLeaderboard, fetchFarmerAnalytics, fetchTrends, period]);

  // Fetch additional leaderboards for category rankings
  useEffect(() => {
    if (user?.id) {
      // Fetch sales, orders, and rating leaderboards to calculate category rankings
      fetchLeaderboard("sales", period, { userId: user.id });
      fetchLeaderboard("orders", period, { userId: user.id });
      fetchLeaderboard("rating", period, { userId: user.id });
    }
  }, [fetchLeaderboard, period, user?.id]);

  // Get the revenue leaderboard (primary)
  const currentLeaderboard = leaderboards.find(lb => lb.metric === "revenue") || leaderboards[0] || null;
  const leaderboardEntries: LeaderboardEntry[] = currentLeaderboard?.entries || [];
  
  // Get user entry from revenue leaderboard
  const userEntry = leaderboardEntries.find((e) => e.isCurrentUser);
  
  // Get user's sub-county from analytics or profile
  const userSubCounty = farmerAnalytics?.subCountyRanking?.subCounty || 
    (selectedProfile && 'subCounty' in selectedProfile ? selectedProfile.subCounty : null) || 
    null;

  // Calculate total farmers from leaderboard or analytics
  const totalFarmers = useMemo(() => {
    if (farmerAnalytics?.peerRanking?.totalFarmers) {
      return farmerAnalytics.peerRanking.totalFarmers;
    }
    // Fallback: estimate from leaderboard entries (if we have a large limit, this might be close)
    return Math.max(leaderboardEntries.length, 1);
  }, [farmerAnalytics, leaderboardEntries.length]);

  // Calculate user rank
  const userRank = useMemo(() => {
    if (userEntry?.rank) return userEntry.rank;
    if (farmerAnalytics?.peerRanking?.rank) return farmerAnalytics.peerRanking.rank;
    return null;
  }, [userEntry, farmerAnalytics]);

  // Calculate sub-county rank
  const subCountyRank = useMemo(() => {
    if (farmerAnalytics?.subCountyRanking?.rank) {
      return farmerAnalytics.subCountyRanking.rank;
    }
    // Fallback: calculate from filtered leaderboard
    if (userSubCounty && leaderboardEntries.length > 0) {
      const subCountyEntries = leaderboardEntries.filter(e => 
        e.subCounty?.toLowerCase() === userSubCounty.toLowerCase()
      );
      const userSubCountyEntry = subCountyEntries.find(e => e.isCurrentUser);
      if (userSubCountyEntry) {
        return subCountyEntries.findIndex(e => e.userId === userSubCountyEntry.userId) + 1;
      }
    }
    return null;
  }, [farmerAnalytics, userSubCounty, leaderboardEntries]);

  const totalSubCountyFarmers = useMemo(() => {
    if (farmerAnalytics?.subCountyRanking?.totalFarmers) {
      return farmerAnalytics.subCountyRanking.totalFarmers;
    }
    if (userSubCounty && leaderboardEntries.length > 0) {
      return leaderboardEntries.filter(e => 
        e.subCounty?.toLowerCase() === userSubCounty.toLowerCase()
      ).length;
    }
    return null;
  }, [farmerAnalytics, userSubCounty, leaderboardEntries]);

  // Sort leaderboard by selected metric
  const sortedLeaderboard = useMemo(() => {
    return [...leaderboardEntries].sort((a, b) => {
      switch (sortBy) {
        case "revenue":
          return (b.totalRevenue || 0) - (a.totalRevenue || 0);
        case "sales":
          return (b.totalSales || 0) - (a.totalSales || 0);
        case "orders":
          return (b.orderCount || 0) - (a.orderCount || 0);
        case "rating":
          return (b.avgRating || 0) - (a.avgRating || 0);
        default:
          return (a.rank || 0) - (b.rank || 0);
      }
    });
  }, [leaderboardEntries, sortBy]);

  // Filter by sub-county
  const filteredLeaderboard = useMemo(() => {
    if (filterSubCounty === "all") {
      return sortedLeaderboard;
    }
    return sortedLeaderboard.filter((entry) => 
      entry.subCounty?.toLowerCase() === filterSubCounty.toLowerCase()
    );
  }, [sortedLeaderboard, filterSubCounty]);

  // Get unique sub-counties for filter
  const availableSubCounties = useMemo(() => {
    const subCounties = new Set<string>();
    leaderboardEntries.forEach((e) => {
      if (e.subCounty) subCounties.add(e.subCounty);
    });
    return Array.from(subCounties).sort();
  }, [leaderboardEntries]);

  // Calculate growth potential (revenue needed to reach top 10)
  const growthPotential = useMemo(() => {
    if (!userEntry || leaderboardEntries.length < 10) return null;
    
    const top10 = leaderboardEntries.slice(0, 10);
    const top10MinRevenue = Math.min(...top10.map(e => e.totalRevenue || 0));
    const userRevenue = userEntry.totalRevenue || 0;
    const revenueNeeded = Math.max(0, top10MinRevenue - userRevenue);
    const growthPercent = userRevenue > 0 ? (revenueNeeded / userRevenue) * 100 : 0;

    return {
      revenueNeeded,
      growthPercent: Math.round(growthPercent),
      top10MinRevenue,
    };
  }, [userEntry, leaderboardEntries]);

  // Calculate percentile
  const percentile = useMemo(() => {
    if (userRank && totalFarmers) {
      return Math.round(((totalFarmers - userRank) / totalFarmers) * 100);
    }
    if (farmerAnalytics?.peerRanking?.percentile !== undefined) {
      return Math.round(farmerAnalytics.peerRanking.percentile);
    }
    return null;
  }, [userRank, totalFarmers, farmerAnalytics]);

  // Calculate category rankings from different leaderboards
  const categoryRankings = useMemo(() => {
    const rankings: Record<string, { percentile: number; label: string }> = {};

    // Revenue ranking (from current leaderboard)
    if (userRank && totalFarmers) {
      rankings.volume = {
        percentile: Math.round(((totalFarmers - userRank) / totalFarmers) * 100),
        label: "Revenue",
      };
    }

    // Sales ranking
    const salesLeaderboard = leaderboards.find(lb => lb.metric === "sales");
    if (salesLeaderboard) {
      const salesUserEntry = salesLeaderboard.entries.find(e => e.isCurrentUser);
      if (salesUserEntry?.rank && salesLeaderboard.entries.length > 0) {
        const salesTotal = salesLeaderboard.entries.length;
        rankings.sales = {
          percentile: Math.round(((salesTotal - salesUserEntry.rank) / salesTotal) * 100),
          label: "Sales",
        };
      }
    }

    // Orders ranking
    const ordersLeaderboard = leaderboards.find(lb => lb.metric === "orders");
    if (ordersLeaderboard) {
      const ordersUserEntry = ordersLeaderboard.entries.find(e => e.isCurrentUser);
      if (ordersUserEntry?.rank && ordersLeaderboard.entries.length > 0) {
        const ordersTotal = ordersLeaderboard.entries.length;
        rankings.orders = {
          percentile: Math.round(((ordersTotal - ordersUserEntry.rank) / ordersTotal) * 100),
          label: "Orders",
        };
      }
    }

    // Rating/Quality ranking
    const ratingLeaderboard = leaderboards.find(lb => lb.metric === "rating");
    if (ratingLeaderboard) {
      const ratingUserEntry = ratingLeaderboard.entries.find(e => e.isCurrentUser);
      if (ratingUserEntry?.rank && ratingLeaderboard.entries.length > 0) {
        const ratingTotal = ratingLeaderboard.entries.length;
        rankings.quality = {
          percentile: Math.round(((ratingTotal - ratingUserEntry.rank) / ratingTotal) * 100),
          label: "Quality",
        };
      }
    }

    return rankings;
  }, [leaderboards, userRank, totalFarmers]);

  // Generate growth data from trends
  const growthData = useMemo(() => {
    if (!trends || trends.length === 0) return [];

    // Calculate peer average revenue from leaderboard entries
    const peerAverageRevenue = leaderboardEntries.length > 0
      ? leaderboardEntries
          .filter(e => !e.isCurrentUser)
          .reduce((sum, e) => sum + (e.totalRevenue || 0), 0) / 
          Math.max(leaderboardEntries.filter(e => !e.isCurrentUser).length, 1)
      : 0;

    // Use user's revenue from trends, fallback to userEntry
    const userRevenue = userEntry?.totalRevenue || 0;

    // Format trends data for GrowthChart
    // Take last 4-8 data points depending on period
    const dataPoints = period === "weekly" ? 4 : period === "monthly" ? 4 : 4;
    const recentTrends = trends.slice(-dataPoints);
    
    return recentTrends.map((trend, index) => {
      // Format period label based on date
      let periodLabel = `Period ${index + 1}`;
      try {
        const date = new Date(trend.date);
        if (period === "weekly") {
          periodLabel = `Week ${index + 1}`;
        } else if (period === "monthly") {
          periodLabel = date.toLocaleDateString("en-US", { month: "short", day: "numeric" });
        } else {
          periodLabel = date.toLocaleDateString("en-US", { month: "short" });
        }
      } catch {
        // Keep default label
      }

      return {
        period: periodLabel,
        value: trend.revenue || userRevenue, // Use trend revenue or fallback to userEntry
        peerAverage: peerAverageRevenue,
      };
    });
  }, [trends, leaderboardEntries, userEntry, period]);

  // Calculate achievements from real data
  const achievements = useMemo(() => {
    const achievementsList = [];

    // First sale achievement
    if (userEntry && (userEntry.orderCount || 0) > 0) {
      achievementsList.push({
        id: "ach-1",
        type: "first_sale" as const,
        name: "First Sale",
        description: "Made your first sale",
        icon: IconTrophy,
        color: "text-yellow-600",
        bgColor: "bg-yellow-100",
        earned: true,
        earnedDate: new Date().toISOString(), // Would need actual first sale date from backend
      });
    }

    // 100kg milestone
    const totalSales = userEntry?.totalSales || 0;
    if (totalSales >= 100) {
      achievementsList.push({
        id: "ach-2",
        type: "hundred_kg" as const,
        name: "100kg Milestone",
        description: "Sold 100kg of OFSP",
        icon: IconTrophy,
        color: "text-blue-600",
        bgColor: "bg-blue-100",
        earned: true,
        earnedDate: new Date().toISOString(),
      });
    } else {
      achievementsList.push({
        id: "ach-2",
        type: "hundred_kg" as const,
        name: "100kg Milestone",
        description: "Sold 100kg of OFSP",
        icon: IconTrophy,
        color: "text-blue-600",
        bgColor: "bg-blue-100",
        earned: false,
        progress: Math.min(100, (totalSales / 100) * 100),
        current: totalSales,
        target: 100,
      });
    }

    // 500kg milestone
    if (totalSales >= 500) {
      achievementsList.push({
        id: "ach-3",
        type: "five_hundred_kg" as const,
        name: "500kg Milestone",
        description: "Sold 500kg of OFSP",
        icon: IconTrophy,
        color: "text-green-600",
        bgColor: "bg-green-100",
        earned: true,
        earnedDate: new Date().toISOString(),
      });
    } else {
      achievementsList.push({
        id: "ach-3",
        type: "five_hundred_kg" as const,
        name: "500kg Milestone",
        description: "Sold 500kg of OFSP",
        icon: IconTrophy,
        color: "text-green-600",
        bgColor: "bg-green-100",
        earned: false,
        progress: Math.min(100, (totalSales / 500) * 100),
        current: totalSales,
        target: 500,
      });
    }

    return achievementsList;
  }, [userEntry]);

  // Top performers data for horizontal bar chart
  const topPerformers = useMemo(() => {
    const performers = sortedLeaderboard
      .filter((entry) => !entry.isCurrentUser)
      .slice(0, 14)
      .map((entry) => ({
        name: `${getRankIcon(entry.rank || 0)} ${entry.farmerName || entry.name}`,
        value: entry.totalSales || 0,
      }));

    // Add current user if not in top 14
    if (userEntry) {
      const userIndex = performers.findIndex((p) => 
        p.name.includes(userEntry.farmerName || userEntry.name)
      );
      if (userIndex === -1) {
        performers.push({
          name: `#${userEntry.rank || '?'}. You`,
          value: userEntry.totalSales || 0,
        });
      } else {
        performers[userIndex] = {
          name: `#${userEntry.rank || '?'}. You`,
          value: userEntry.totalSales || 0,
        };
      }
    }

    return performers;
  }, [sortedLeaderboard, userEntry]);

  const getRankIcon = (rank: number) => {
    if (rank === 1) return "🥇";
    if (rank === 2) return "🥈";
    if (rank === 3) return "🥉";
    return `#${rank}`;
  };

  const getRankColor = (rank: number) => {
    if (rank === 1) return "bg-yellow-100 text-yellow-800 border-yellow-300";
    if (rank === 2) return "bg-gray-100 text-gray-800 border-gray-300";
    if (rank === 3) return "bg-orange-100 text-orange-800 border-orange-300";
    return "bg-muted text-muted-foreground";
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
          <h1 className="text-2xl sm:text-3xl font-bold">Peer Leaderboard</h1>
          <p className="text-sm text-muted-foreground mt-1">
            See how you rank among other OFSP farmers
          </p>
        </div>
        <div className="flex gap-2">
          <Select value={period} onValueChange={(v) => setPeriod(v as typeof period)}>
            <SelectTrigger className="w-[140px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="daily">Today</SelectItem>
              <SelectItem value="weekly">This Week</SelectItem>
              <SelectItem value="monthly">This Month</SelectItem>
              <SelectItem value="quarterly">This Quarter</SelectItem>
              <SelectItem value="yearly">This Year</SelectItem>
            </SelectContent>
          </Select>
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              fetchLeaderboard("revenue", period);
              fetchFarmerAnalytics({ timeRange: period === "daily" ? "day" : period === "weekly" ? "week" : period === "monthly" ? "month" : period === "quarterly" ? "quarter" : "year" });
            }}
            disabled={isLoading}
          >
            <IconRefresh className={cn("h-4 w-4", isLoading && "animate-spin")} />
          </Button>
        </div>
      </div>

      {/* Error State */}
      {error && (
        <Card className="border-red-200 bg-red-50">
          <CardContent className="p-4">
            <p className="text-sm text-red-800">{error}</p>
          </CardContent>
        </Card>
      )}

      {/* Performance Insights */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <IconTrophy className="h-4 w-4 text-primary" />
              Your Ranking
            </CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <Skeleton className="h-8 w-16 mb-2" />
            ) : userRank ? (
              <>
                <div className="text-3xl font-bold">#{userRank}</div>
                <p className="text-xs text-muted-foreground mt-1">
                  Out of {totalFarmers} farmers
                </p>
                {percentile !== null && (
                  <div className="mt-4">
                    <div className="flex justify-between text-xs mb-1">
                      <span>Top {percentile}%</span>
                      <span>You are here</span>
                    </div>
                    <div className="w-full bg-muted rounded-full h-2">
                      <div 
                        className="bg-primary h-2 rounded-full transition-all" 
                        style={{ width: `${Math.min(100, Math.max(0, percentile))}%` }}
                      />
                    </div>
                  </div>
                )}
              </>
            ) : (
              <p className="text-sm text-muted-foreground">No ranking data available</p>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <IconTrendingUp className="h-4 w-4 text-primary" />
              Growth Potential
            </CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <Skeleton className="h-8 w-16 mb-2" />
            ) : growthPotential ? (
              <>
                <div className="text-3xl font-bold">
                  {growthPotential.growthPercent > 0 ? `+${growthPotential.growthPercent}%` : "Top 10!"}
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  {growthPotential.growthPercent > 0 
                    ? `To reach top 10 (KES ${growthPotential.top10MinRevenue.toLocaleString()})`
                    : "You're in the top 10!"
                  }
                </p>
                {growthPotential.revenueNeeded > 0 && (
                  <p className="text-xs text-muted-foreground mt-2">
                    You need KES {growthPotential.revenueNeeded.toLocaleString()} more revenue
                  </p>
                )}
              </>
            ) : (
              <p className="text-sm text-muted-foreground">Calculating...</p>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <IconUsers className="h-4 w-4 text-primary" />
              Sub-County Rank
            </CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <Skeleton className="h-8 w-16 mb-2" />
            ) : subCountyRank && totalSubCountyFarmers ? (
              <>
                <div className="text-3xl font-bold">#{subCountyRank}</div>
                <p className="text-xs text-muted-foreground mt-1">
                  {userSubCounty ? `In ${userSubCounty}` : "In your sub-county"}
                </p>
                <p className="text-xs text-muted-foreground mt-2">
                  Out of {totalSubCountyFarmers} farmers in your sub-county
                </p>
              </>
            ) : (
              <p className="text-sm text-muted-foreground">
                {userSubCounty ? "No ranking data available" : "Sub-county not available"}
              </p>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle>Leaderboard</CardTitle>
          <CardDescription>
            {currentLeaderboard?.title || "Compare your performance with other farmers"}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col md:flex-row gap-4 mb-6">
            <Select value={sortBy} onValueChange={(value) => setSortBy((value || "revenue") as typeof sortBy)}>
              <SelectTrigger className="w-full md:w-[200px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="revenue">Total Revenue</SelectItem>
                <SelectItem value="sales">Total Sales (kg)</SelectItem>
                <SelectItem value="orders">Order Count</SelectItem>
                <SelectItem value="rating">Average Rating</SelectItem>
              </SelectContent>
            </Select>
            <Select value={filterSubCounty} onValueChange={(value) => setFilterSubCounty(value || "all")}>
              <SelectTrigger className="w-full md:w-[200px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Sub-Counties</SelectItem>
                {availableSubCounties.map((subCounty) => (
                  <SelectItem key={subCounty} value={subCounty.toLowerCase()}>
                    {subCounty}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Leaderboard Table */}
          {isLoading ? (
            <div className="space-y-2">
              {[1, 2, 3, 4, 5].map((i) => (
                <Skeleton key={i} className="h-20 w-full" />
              ))}
            </div>
          ) : filteredLeaderboard.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              <IconTrophy className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>No leaderboard data available</p>
            </div>
          ) : (
            <div className="space-y-2">
              {filteredLeaderboard.map((entry, index) => (
                <Card
                  key={entry.id || entry.userId || index}
                  className={entry.isCurrentUser ? "border-primary border-2" : ""}
                >
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <div className={cn(
                          "flex items-center justify-center w-12 h-12 rounded-full",
                          getRankColor(entry.rank || 0)
                        )}>
                          <span className="text-lg font-bold">{getRankIcon(entry.rank || 0)}</span>
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <p className="font-semibold">
                              {entry.farmerName || entry.name}
                              {entry.isCurrentUser && (
                                <Badge variant="outline" className="ml-2">
                                  You
                                </Badge>
                              )}
                            </p>
                          </div>
                          {entry.subCounty && (
                            <p className="text-sm text-muted-foreground">{entry.subCounty}</p>
                          )}
                        </div>
                      </div>

                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
                        <div>
                          <p className="text-xs text-muted-foreground">Revenue</p>
                          <p className="font-semibold">
                            KES {(entry.totalRevenue || 0).toLocaleString()}
                          </p>
                        </div>
                        <div>
                          <p className="text-xs text-muted-foreground">Sales</p>
                          <p className="font-semibold">{entry.totalSales || 0} kg</p>
                        </div>
                        <div>
                          <p className="text-xs text-muted-foreground">Orders</p>
                          <p className="font-semibold">{entry.orderCount || 0}</p>
                        </div>
                        <div>
                          <p className="text-xs text-muted-foreground">Rating</p>
                          <p className="font-semibold">
                            {(entry.avgRating || 0).toFixed(1)} ⭐
                          </p>
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

      {/* Category Rankings */}
      {Object.keys(categoryRankings).length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Category Rankings</CardTitle>
            <CardDescription>Your percentile ranking across different metrics</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {Object.entries(categoryRankings).map(([key, ranking]) => (
                <div key={key} className="p-4 bg-muted rounded-lg">
                  <p className="text-sm font-medium mb-2">{ranking.label}</p>
                  <div className="flex items-center justify-between">
                    <span className="text-2xl font-bold">Top {ranking.percentile}%</span>
                    <ProgressBar 
                      value={ranking.percentile} 
                      className="w-24"
                    />
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Achievement Badges */}
      <Card>
        <CardHeader>
          <CardTitle>Achievement Badges</CardTitle>
          <CardDescription>Your farming milestones and achievements</CardDescription>
        </CardHeader>
        <CardContent>
          {achievements.length > 0 ? (
            <AchievementBadges achievements={achievements} showProgress={true} />
          ) : (
            <p className="text-sm text-muted-foreground">No achievements yet. Keep farming!</p>
          )}
        </CardContent>
      </Card>

      {/* Growth Tracking */}
      {growthData.length > 0 && period !== "daily" && period !== "yearly" && (
        <GrowthChart
          title="Sales Growth"
          data={growthData}
          metric="sales"
          period={(period === "weekly" ? "weekly" : period === "quarterly" ? "quarterly" : "monthly") as "weekly" | "monthly" | "quarterly"}
          showPeerComparison={true}
        />
      )}
    </div>
  );
}
