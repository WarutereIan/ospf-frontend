import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  IconSearch,
  IconStar,
  IconStarFilled,
  IconTrendingUp,
  IconTrendingDown,
  IconEye,
} from "@tabler/icons-react";
import { Link } from "react-router-dom";

interface FarmerRating {
  farmerId: string;
  farmerName: string;
  phone: string;
  subCounty: string;
  averageRating: number;
  totalRatings: number;
  totalOrders: number;
  lastRated: string;
  ratings: {
    orderId: string;
    rating: number;
    review: string;
    date: string;
  }[];
}

export function Ratings() {
  const [ratings, setRatings] = useState<FarmerRating[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [sortBy, setSortBy] = useState<string>("rating");
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // TODO: Replace with actual API calls
    setTimeout(() => {
      setRatings([
        {
          farmerId: "F001",
          farmerName: "John Mutua",
          phone: "+254712345678",
          subCounty: "Kangundo",
          averageRating: 4.8,
          totalRatings: 25,
          totalOrders: 30,
          lastRated: "2024-01-15",
          ratings: [
            {
              orderId: "ORD001",
              rating: 5,
              review: "Excellent quality produce, very fresh!",
              date: "2024-01-15",
            },
            {
              orderId: "ORD002",
              rating: 4,
              review: "Good quality, timely delivery",
              date: "2024-01-10",
            },
          ],
        },
        {
          farmerId: "F002",
          farmerName: "Mary Wanjiku",
          phone: "+254723456789",
          subCounty: "Kathiani",
          averageRating: 4.5,
          totalRatings: 18,
          totalOrders: 20,
          lastRated: "2024-01-12",
          ratings: [
            {
              orderId: "ORD003",
              rating: 5,
              review: "Best OFSP I've ever bought!",
              date: "2024-01-12",
            },
          ],
        },
        {
          farmerId: "F003",
          farmerName: "Peter Kariuki",
          phone: "+254734567890",
          subCounty: "Kangundo",
          averageRating: 3.8,
          totalRatings: 10,
          totalOrders: 15,
          lastRated: "2024-01-08",
          ratings: [
            {
              orderId: "ORD004",
              rating: 4,
              review: "Decent quality, could be better",
              date: "2024-01-08",
            },
          ],
        },
      ]);
      setIsLoading(false);
    }, 1000);
  }, []);

  const filteredAndSorted = ratings
    .filter(
      (rating) =>
        rating.farmerName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        rating.farmerId.toLowerCase().includes(searchQuery.toLowerCase()) ||
        rating.subCounty.toLowerCase().includes(searchQuery.toLowerCase())
    )
    .sort((a, b) => {
      switch (sortBy) {
        case "rating":
          return b.averageRating - a.averageRating;
        case "orders":
          return b.totalOrders - a.totalOrders;
        case "recent":
          return new Date(b.lastRated).getTime() - new Date(a.lastRated).getTime();
        default:
          return 0;
      }
    });

  const renderStars = (rating: number) => {
    return (
      <div className="flex items-center gap-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <span key={star}>
            {star <= Math.round(rating) ? (
              <IconStarFilled className="h-4 w-4 text-yellow-500 fill-yellow-500" />
            ) : (
              <IconStar className="h-4 w-4 text-gray-300" />
            )}
          </span>
        ))}
        <span className="ml-1 text-sm font-medium">{rating.toFixed(1)}</span>
      </div>
    );
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold">Rate Farmers</h1>
          <p className="text-sm sm:text-base text-muted-foreground mt-1">
            View and manage your ratings for farmers
          </p>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Farmers Rated</p>
                <p className="text-2xl font-bold">{ratings.length}</p>
              </div>
              <IconStar className="h-8 w-8 text-primary" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total Ratings</p>
                <p className="text-2xl font-bold">
                  {ratings.reduce((sum, r) => sum + r.totalRatings, 0)}
                </p>
              </div>
              <IconStarFilled className="h-8 w-8 text-yellow-500" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Average Rating</p>
                <p className="text-2xl font-bold">
                  {ratings.length > 0
                    ? (
                        ratings.reduce((sum, r) => sum + r.averageRating, 0) / ratings.length
                      ).toFixed(1)
                    : "0.0"}
                </p>
              </div>
              <IconTrendingUp className="h-8 w-8 text-green-600" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total Orders</p>
                <p className="text-2xl font-bold">
                  {ratings.reduce((sum, r) => sum + r.totalOrders, 0)}
                </p>
              </div>
              <IconTrendingUp className="h-8 w-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Search and Filters */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1">
              <IconSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search by farmer name, ID, or location..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={sortBy} onValueChange={setSortBy}>
              <SelectTrigger className="w-full sm:w-[200px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="rating">Sort by Rating</SelectItem>
                <SelectItem value="orders">Sort by Orders</SelectItem>
                <SelectItem value="recent">Sort by Recent</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Ratings Table */}
      <Card>
        <CardHeader>
          <CardTitle>Farmer Ratings ({filteredAndSorted.length})</CardTitle>
          <CardDescription>View all farmers you've rated</CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="space-y-4">
              {[1, 2, 3].map((i) => (
                <div key={i} className="h-20 bg-muted animate-pulse rounded-lg" />
              ))}
            </div>
          ) : filteredAndSorted.length > 0 ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Farmer</TableHead>
                  <TableHead>Location</TableHead>
                  <TableHead>Rating</TableHead>
                  <TableHead>Total Ratings</TableHead>
                  <TableHead>Orders</TableHead>
                  <TableHead>Last Rated</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredAndSorted.map((rating) => (
                  <TableRow key={rating.farmerId}>
                    <TableCell>
                      <div>
                        <div className="font-medium">{rating.farmerName}</div>
                        <div className="text-sm text-muted-foreground">{rating.farmerId}</div>
                      </div>
                    </TableCell>
                    <TableCell>{rating.subCounty}</TableCell>
                    <TableCell>{renderStars(rating.averageRating)}</TableCell>
                    <TableCell>{rating.totalRatings}</TableCell>
                    <TableCell>{rating.totalOrders}</TableCell>
                    <TableCell>{rating.lastRated}</TableCell>
                    <TableCell>
                      <Link to={`/dashboard/buyer/rate/${rating.farmerId}`}>
                        <Button variant="ghost" size="sm">
                          <IconEye className="h-4 w-4 mr-1" />
                          View
                        </Button>
                      </Link>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          ) : (
            <div className="text-center py-8">
              <IconStar className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground">No ratings found</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
