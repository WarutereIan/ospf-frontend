import { useState } from "react";
import { Link } from "react-router-dom";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { IconArrowLeft, IconTrophy, IconTrendingUp, IconUsers, IconCurrency } from "@tabler/icons-react";
import { AchievementBadges } from "@/components/leaderboard/AchievementBadges";
import { GrowthChart } from "@/components/leaderboard/GrowthChart";
import {
  PositionMarker,
  HorizontalBarChart,
  ProgressBar,
} from "@/components/visualizations";

interface LeaderboardEntry {
  rank: number;
  farmerName: string;
  subCounty: string;
  totalSales: number;
  totalRevenue: number;
  orderCount: number;
  avgRating: number;
  isCurrentUser?: boolean;
}

// Sample leaderboard data
const sampleLeaderboard: LeaderboardEntry[] = [
  {
    rank: 1,
    farmerName: "James Mutua",
    subCounty: "Kangundo",
    totalSales: 5000,
    totalRevenue: 750000,
    orderCount: 45,
    avgRating: 4.8,
  },
  {
    rank: 2,
    farmerName: "Mary Wanjiku",
    subCounty: "Kathiani",
    totalSales: 4500,
    totalRevenue: 675000,
    orderCount: 38,
    avgRating: 4.7,
  },
  {
    rank: 3,
    farmerName: "Peter Kamau",
    subCounty: "Masinga",
    totalSales: 4000,
    totalRevenue: 600000,
    orderCount: 32,
    avgRating: 4.6,
  },
  {
    rank: 12,
    farmerName: "You",
    subCounty: "Kangundo",
    totalSales: 1500,
    totalRevenue: 225000,
    orderCount: 24,
    avgRating: 4.5,
    isCurrentUser: true,
  },
];

export function PeerLeaderboard() {
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>(sampleLeaderboard);
  const [sortBy, setSortBy] = useState<"revenue" | "sales" | "orders" | "rating">("revenue");
  const [filterSubCounty, setFilterSubCounty] = useState("all");

  const sortedLeaderboard = [...leaderboard].sort((a, b) => {
    switch (sortBy) {
      case "revenue":
        return b.totalRevenue - a.totalRevenue;
      case "sales":
        return b.totalSales - a.totalSales;
      case "orders":
        return b.orderCount - a.orderCount;
      case "rating":
        return b.avgRating - a.avgRating;
      default:
        return a.rank - b.rank;
    }
  });

  const filteredLeaderboard =
    filterSubCounty === "all"
      ? sortedLeaderboard
      : sortedLeaderboard.filter((entry) => entry.subCounty.toLowerCase() === filterSubCounty);

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

  // Sample achievements data
  const achievements = [
    {
      id: "ach-1",
      type: "first_sale" as const,
      name: "First Sale",
      description: "Made your first sale",
      icon: IconTrophy,
      color: "text-yellow-600",
      bgColor: "bg-yellow-100",
      earned: true,
      earnedDate: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
    },
    {
      id: "ach-2",
      type: "hundred_kg" as const,
      name: "100kg Milestone",
      description: "Sold 100kg of OFSP",
      icon: IconTrophy,
      color: "text-blue-600",
      bgColor: "bg-blue-100",
      earned: true,
      earnedDate: new Date(Date.now() - 20 * 24 * 60 * 60 * 1000).toISOString(),
    },
    {
      id: "ach-3",
      type: "five_hundred_kg" as const,
      name: "500kg Milestone",
      description: "Sold 500kg of OFSP",
      icon: IconTrophy,
      color: "text-green-600",
      bgColor: "bg-green-100",
      earned: false,
      progress: 60,
      current: 300,
      target: 500,
    },
  ];

  // Sample growth data
  const growthData = [
    { period: "Week 1", value: 100, peerAverage: 95 },
    { period: "Week 2", value: 150, peerAverage: 140 },
    { period: "Week 3", value: 200, peerAverage: 180 },
    { period: "Week 4", value: 250, peerAverage: 220 },
  ];

  // Get user entry and calculate position
  const userEntry = sortedLeaderboard.find((e) => e.isCurrentUser);
  const userRank = userEntry?.rank || 12;
  const totalFarmers = 150;
  const topPercent = (userRank / totalFarmers) * 100; // Top 8% for rank 12
  const positionFromLeft = 100 - topPercent; // 92% from left for top 8%

  // Top performers data for horizontal bar chart
  const topPerformers = sortedLeaderboard
    .filter((entry) => !entry.isCurrentUser)
    .slice(0, 14)
    .map((entry) => ({
      name: `${getRankIcon(entry.rank)} ${entry.farmerName}`,
      value: entry.totalSales,
    }));

  // Add current user if not in top 14
  if (userEntry) {
    const userIndex = topPerformers.findIndex((p) => p.name.includes(userEntry.farmerName));
    if (userIndex === -1) {
      topPerformers.push({
        name: `${userEntry.rank}. You`,
        value: userEntry.totalSales,
      });
    } else {
      // Update existing entry to show "You"
      topPerformers[userIndex] = {
        name: `${userEntry.rank}. You`,
        value: userEntry.totalSales,
      };
    }
  }

  // Category rankings
  const categoryRankings = {
    volume: { percentile: 15, label: "Volume" },
    quality: { percentile: 20, label: "Quality" },
    consistency: { percentile: 10, label: "Consistency" },
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
      </div>

    
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
            <div className="text-3xl font-bold">#12</div>
            <p className="text-xs text-muted-foreground mt-1">Out of 150 farmers</p>
            <div className="mt-4">
              <div className="flex justify-between text-xs mb-1">
                <span>Top 10%</span>
                <span>You are here</span>
              </div>
              <div className="w-full bg-muted rounded-full h-2">
                <div className="bg-primary h-2 rounded-full" style={{ width: "8%" }}></div>
              </div>
            </div>
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
            <div className="text-3xl font-bold">+25%</div>
            <p className="text-xs text-muted-foreground mt-1">
              To reach top 10 (KES 600,000)
            </p>
            <p className="text-xs text-muted-foreground mt-2">
              You need KES {375000} more revenue
            </p>
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
            <div className="text-3xl font-bold">#3</div>
            <p className="text-xs text-muted-foreground mt-1">In Kangundo</p>
            <p className="text-xs text-muted-foreground mt-2">
              Out of 45 farmers in your sub-county
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle>Leaderboard</CardTitle>
          <CardDescription>Compare your performance with other farmers</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col md:flex-row gap-4 mb-6">
            <Select value={sortBy} onValueChange={(value) => setSortBy((value || "revenue") as "revenue" | "sales" | "orders" | "rating")}>
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
                <SelectItem value="kangundo">Kangundo</SelectItem>
                <SelectItem value="kathiani">Kathiani</SelectItem>
                <SelectItem value="masinga">Masinga</SelectItem>
                <SelectItem value="yatta">Yatta</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Leaderboard Table */}
          <div className="space-y-2">
            {filteredLeaderboard.map((entry, index) => (
              <Card
                key={entry.rank}
                className={entry.isCurrentUser ? "border-primary border-2" : ""}
              >
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className="flex items-center justify-center w-12 h-12 rounded-full bg-muted">
                        <span className="text-lg font-bold">{getRankIcon(entry.rank)}</span>
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <p className="font-semibold">
                            {entry.farmerName}
                            {entry.isCurrentUser && (
                              <Badge variant="outline" className="ml-2">
                                You
                              </Badge>
                            )}
                          </p>
                        </div>
                        <p className="text-sm text-muted-foreground">{entry.subCounty}</p>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
                      <div>
                        <p className="text-xs text-muted-foreground">Revenue</p>
                        <p className="font-semibold">KES {entry.totalRevenue.toLocaleString()}</p>
                      </div>
                      <div>
                        <p className="text-xs text-muted-foreground">Sales</p>
                        <p className="font-semibold">{entry.totalSales} kg</p>
                      </div>
                      <div>
                        <p className="text-xs text-muted-foreground">Orders</p>
                        <p className="font-semibold">{entry.orderCount}</p>
                      </div>
                      <div>
                        <p className="text-xs text-muted-foreground">Rating</p>
                        <p className="font-semibold">{entry.avgRating.toFixed(1)} ⭐</p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </CardContent>
      </Card>

      

      {/* Achievement Badges */}
      <Card>
        <CardHeader>
          <CardTitle>Achievement Badges</CardTitle>
          <CardDescription>Your farming milestones and achievements</CardDescription>
        </CardHeader>
        <CardContent>
          <AchievementBadges achievements={achievements} showProgress={true} />
        </CardContent>
      </Card>

      {/* Growth Tracking */}
      <GrowthChart
        title="Sales Growth"
        data={growthData}
        metric="sales"
        period="weekly"
        showPeerComparison={true}
      />
    </div>
  );
}

