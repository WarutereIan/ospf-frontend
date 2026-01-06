import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  IconPackage,
  IconSearch,
  IconMapPin,
  IconTrendingUp,
  IconTrendingDown,
  IconStar,
  IconAlertCircle,
  IconClipboardCheck,
  IconCash,
  IconChartBar,
  IconBulb,
  IconEye,
  IconClock,
  IconCheck,
  IconX,
  IconArrowUp,
  IconArrowDown,
  IconReceipt,
} from "@tabler/icons-react";
import { cn } from "@/lib/utils";

// Aggregation Center Stock (Farmer's produce across centers)
interface CenterStock {
  centerId: string;
  centerName: string;
  location: string;
  variety: string;
  quantity: number; // Current stock in kg
  qualityGrade: "A" | "B" | "C";
  stockInDate: string;
  status: "fresh" | "aging" | "sold" | "wasted";
  daysInStorage: number;
  lastSold?: string;
  soldQuantity?: number;
  wastage?: number;
}

// Delivery History to Aggregation Centers
interface Delivery {
  id: string;
  centerId: string;
  centerName: string;
  date: string;
  variety: string;
  quantity: number;
  qualityGrade: "A" | "B" | "C";
  qualityScore: number; // 0-100
  pricePerKg: number;
  totalAmount: number;
  paymentStatus: "pending" | "released" | "paid";
  receiptId: string;
  feedback?: string;
}

// Quality Assessment from Centers
interface QualityAssessment {
  id: string;
  centerId: string;
  centerName: string;
  date: string;
  variety: string;
  qualityGrade: "A" | "B" | "C";
  colorScore: number; // 1-10
  sizeScore: number; // 1-10
  damagePercentage: number;
  overallScore: number; // 0-100
  approved: boolean;
  feedback: string;
}

// Recommendation
interface Recommendation {
  id: string;
  type: "quality" | "price" | "variety" | "timing" | "market";
  title: string;
  description: string;
  priority: "high" | "medium" | "low";
  icon: any;
}

export function ProduceManagement() {
  const [centerStocks, setCenterStocks] = useState<CenterStock[]>([]);
  const [deliveryHistory, setDeliveryHistory] = useState<Delivery[]>([]);
  const [qualityAssessments, setQualityAssessments] = useState<QualityAssessment[]>([]);
  const [recommendations, setRecommendations] = useState<Recommendation[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterCenter, setFilterCenter] = useState("all");
  const [filterStatus, setFilterStatus] = useState("all");
  const [selectedDelivery, setSelectedDelivery] = useState<Delivery | null>(null);
  const [isDetailDialogOpen, setIsDetailDialogOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // TODO: Replace with actual API calls
    setTimeout(() => {
      // Mock Center Stocks
      const mockCenterStocks: CenterStock[] = [
        {
          centerId: "AC-001",
          centerName: "Kangundo Aggregation Center",
          location: "Kangundo",
          variety: "Kenya",
          quantity: 200,
          qualityGrade: "A",
          stockInDate: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
          status: "fresh",
          daysInStorage: 2,
          soldQuantity: 300,
        },
        {
          centerId: "AC-002",
          centerName: "Kathiani Aggregation Center",
          location: "Kathiani",
          variety: "SPK004",
          quantity: 150,
          qualityGrade: "A",
          stockInDate: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
          status: "aging",
          daysInStorage: 5,
          soldQuantity: 100,
        },
        {
          centerId: "AC-003",
          centerName: "Masinga Aggregation Center",
          location: "Masinga",
          variety: "Kabode",
          quantity: 0,
          qualityGrade: "B",
          stockInDate: new Date(Date.now() - 8 * 24 * 60 * 60 * 1000).toISOString(),
          status: "sold",
          daysInStorage: 8,
          soldQuantity: 200,
          lastSold: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
        },
      ];

      // Mock Delivery History
      const mockDeliveries: Delivery[] = [
        {
          id: "DEL-001",
          centerId: "AC-001",
          centerName: "Kangundo Aggregation Center",
          date: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
          variety: "Kenya",
          quantity: 500,
          qualityGrade: "A",
          qualityScore: 95,
          pricePerKg: 150,
          totalAmount: 75000,
          paymentStatus: "released",
          receiptId: "RCP-001",
          feedback: "Excellent quality, uniform size, vibrant color",
        },
        {
          id: "DEL-002",
          centerId: "AC-002",
          centerName: "Kathiani Aggregation Center",
          date: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
          variety: "SPK004",
          quantity: 250,
          qualityGrade: "A",
          qualityScore: 88,
          pricePerKg: 150,
          totalAmount: 37500,
          paymentStatus: "paid",
          receiptId: "RCP-002",
          feedback: "Good quality, slight variation in size",
        },
        {
          id: "DEL-003",
          centerId: "AC-003",
          centerName: "Masinga Aggregation Center",
          date: new Date(Date.now() - 8 * 24 * 60 * 60 * 1000).toISOString(),
          variety: "Kabode",
          quantity: 200,
          qualityGrade: "B",
          qualityScore: 75,
          pricePerKg: 120,
          totalAmount: 24000,
          paymentStatus: "paid",
          receiptId: "RCP-003",
          feedback: "Standard quality, some minor blemishes",
        },
      ];

      // Mock Quality Assessments
      const mockAssessments: QualityAssessment[] = [
        {
          id: "QA-001",
          centerId: "AC-001",
          centerName: "Kangundo Aggregation Center",
          date: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
          variety: "Kenya",
          qualityGrade: "A",
          colorScore: 9,
          sizeScore: 10,
          damagePercentage: 2,
          overallScore: 95,
          approved: true,
          feedback: "Premium quality - vibrant orange color, uniform large size, minimal damage",
        },
        {
          id: "QA-002",
          centerId: "AC-002",
          centerName: "Kathiani Aggregation Center",
          date: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
          variety: "SPK004",
          qualityGrade: "A",
          colorScore: 8,
          sizeScore: 9,
          damagePercentage: 5,
          overallScore: 88,
          approved: true,
          feedback: "Good quality - some size variation but overall excellent",
        },
        {
          id: "QA-003",
          centerId: "AC-003",
          centerName: "Masinga Aggregation Center",
          date: new Date(Date.now() - 8 * 24 * 60 * 60 * 1000).toISOString(),
          variety: "Kabode",
          qualityGrade: "B",
          colorScore: 7,
          sizeScore: 7,
          damagePercentage: 10,
          overallScore: 75,
          approved: true,
          feedback: "Standard quality - acceptable for processing",
        },
      ];

      // Mock Recommendations
      const mockRecommendations: Recommendation[] = [
        {
          id: "REC-001",
          type: "quality",
          title: "Maintain Your Premium Quality",
          description: "Your recent deliveries to Kangundo Center achieved a 95% quality score. Keep following your current harvesting and handling practices.",
          priority: "high",
          icon: IconStar,
        },
        {
          id: "REC-002",
          type: "price",
          title: "Price Opportunity for Grade A Kenya",
          description: "Grade A Kenya variety is in high demand. Current market price is 12% above average. Consider prioritizing this variety.",
          priority: "high",
          icon: IconTrendingUp,
        },
        {
          id: "REC-003",
          type: "timing",
          title: "Stock Aging at Kathiani Center",
          description: "Your produce at Kathiani Center has been in storage for 5 days. Consider checking with the center about sales prospects.",
          priority: "medium",
          icon: IconClock,
        },
        {
          id: "REC-004",
          type: "variety",
          title: "Diversify with SPK004",
          description: "SPK004 variety shows consistent demand across all centers. Consider increasing production of this variety.",
          priority: "low",
          icon: IconPackage,
        },
      ];

      setCenterStocks(mockCenterStocks);
      setDeliveryHistory(mockDeliveries);
      setQualityAssessments(mockAssessments);
      setRecommendations(mockRecommendations);
      setIsLoading(false);
    }, 1000);
  }, []);

  // Calculate metrics
  const totalInStorage = centerStocks
    .filter((s) => s.status === "fresh" || s.status === "aging")
    .reduce((sum, s) => sum + s.quantity, 0);

  const totalDelivered = deliveryHistory.reduce((sum, d) => sum + d.quantity, 0);

  const totalEarnings = deliveryHistory
    .filter((d) => d.paymentStatus === "paid" || d.paymentStatus === "released")
    .reduce((sum, d) => sum + d.totalAmount, 0);

  const averageQualityScore =
    qualityAssessments.length > 0
      ? Math.round(
          qualityAssessments.reduce((sum, q) => sum + q.overallScore, 0) / qualityAssessments.length
        )
      : 0;

  const pendingPayments = deliveryHistory.filter((d) => d.paymentStatus === "pending").length;

  const uniqueCenters = Array.from(new Set(centerStocks.map((s) => s.centerId))).length;

  // Filter center stocks
  const filteredStocks = centerStocks.filter((stock) => {
    const matchesSearch =
      stock.centerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      stock.variety.toLowerCase().includes(searchTerm.toLowerCase()) ||
      stock.centerId.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesCenter = filterCenter === "all" || stock.centerId === filterCenter;
    const matchesStatus = filterStatus === "all" || stock.status === filterStatus;

    return matchesSearch && matchesCenter && matchesStatus;
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case "fresh":
        return "bg-green-100 text-green-800";
      case "aging":
        return "bg-yellow-100 text-yellow-800";
      case "sold":
        return "bg-blue-100 text-blue-800";
      case "wasted":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getPaymentStatusColor = (status: string) => {
    switch (status) {
      case "paid":
        return "bg-green-100 text-green-800";
      case "released":
        return "bg-blue-100 text-blue-800";
      case "pending":
        return "bg-yellow-100 text-yellow-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "high":
        return "border-orange-300 bg-orange-50";
      case "medium":
        return "border-yellow-300 bg-yellow-50";
      case "low":
        return "border-blue-300 bg-blue-50";
      default:
        return "border-gray-300 bg-gray-50";
    }
  };

  const handleViewDelivery = (delivery: Delivery) => {
    setSelectedDelivery(delivery);
    setIsDetailDialogOpen(true);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold">My Produce Dashboard</h1>
        <p className="text-sm sm:text-base text-muted-foreground mt-1">
          Track your produce across aggregation centers, quality assessments, and performance metrics
        </p>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-xs font-medium text-muted-foreground">In Storage</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-xl font-bold">{totalInStorage} kg</div>
            <p className="text-xs text-muted-foreground mt-1">Across {uniqueCenters} centers</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-xs font-medium text-muted-foreground">Total Delivered</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-xl font-bold">{totalDelivered} kg</div>
            <p className="text-xs text-muted-foreground mt-1">{deliveryHistory.length} deliveries</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-xs font-medium text-muted-foreground">Total Earnings</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-xl font-bold text-green-600">KES {totalEarnings.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground mt-1">Paid + Released</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-xs font-medium text-muted-foreground">Avg Quality</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              <div className="text-xl font-bold">{averageQualityScore}%</div>
              <IconStar className="h-4 w-4 text-yellow-500 fill-yellow-500" />
            </div>
            <p className="text-xs text-muted-foreground mt-1">{qualityAssessments.length} assessments</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-xs font-medium text-muted-foreground">Pending Payments</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-xl font-bold text-orange-600">{pendingPayments}</div>
            <p className="text-xs text-muted-foreground mt-1">Awaiting release</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-xs font-medium text-muted-foreground">Active Centers</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-xl font-bold">{uniqueCenters}</div>
            <p className="text-xs text-muted-foreground mt-1">Aggregation centers</p>
          </CardContent>
        </Card>
      </div>

      {/* Recommendations */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <IconBulb className="h-5 w-5 text-yellow-600" />
            <CardTitle>Recommendations & Insights</CardTitle>
          </div>
          <CardDescription>Personalized suggestions to improve your produce management</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {recommendations.map((rec) => {
              const Icon = rec.icon;
              return (
                <div
                  key={rec.id}
                  className={cn("p-4 rounded-lg border-2", getPriorityColor(rec.priority))}
                >
                  <div className="flex items-start gap-3">
                    <div className="p-2 rounded-lg bg-white">
                      <Icon className="h-5 w-5 text-primary" />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <h4 className="font-semibold text-sm">{rec.title}</h4>
                        <Badge
                          variant="outline"
                          className={cn(
                            "text-xs",
                            rec.priority === "high"
                              ? "border-orange-500 text-orange-700"
                              : rec.priority === "medium"
                              ? "border-yellow-500 text-yellow-700"
                              : "border-blue-500 text-blue-700"
                          )}
                        >
                          {rec.priority}
                        </Badge>
                      </div>
                      <p className="text-xs text-muted-foreground">{rec.description}</p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Stock Across Centers */}
      <Card>
        <CardHeader>
          <CardTitle>My Produce Across Aggregation Centers</CardTitle>
          <CardDescription>Real-time tracking of your produce in different centers</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Filters */}
          <div className="flex flex-col md:flex-row gap-4">
            <div className="relative flex-1">
              <IconSearch className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Search by center, variety..."
                className="pl-10"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <Select value={filterCenter} onValueChange={(value) => setFilterCenter(value || "all")}>
              <SelectTrigger className="w-full md:w-[200px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Centers</SelectItem>
                {Array.from(new Set(centerStocks.map((s) => s.centerId))).map((centerId) => {
                  const center = centerStocks.find((s) => s.centerId === centerId);
                  return (
                    <SelectItem key={centerId} value={centerId}>
                      {center?.centerName}
                    </SelectItem>
                  );
                })}
              </SelectContent>
            </Select>
            <Select value={filterStatus} onValueChange={(value) => setFilterStatus(value || "all")}>
              <SelectTrigger className="w-full md:w-[180px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="fresh">Fresh</SelectItem>
                <SelectItem value="aging">Aging</SelectItem>
                <SelectItem value="sold">Sold</SelectItem>
                <SelectItem value="wasted">Wasted</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Stocks Table */}
          {isLoading ? (
            <div className="space-y-3">
              {[1, 2, 3].map((i) => (
                <div key={i} className="h-16 bg-muted animate-pulse rounded-lg" />
              ))}
            </div>
          ) : filteredStocks.length > 0 ? (
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Center</TableHead>
                    <TableHead>Variety</TableHead>
                    <TableHead>Grade</TableHead>
                    <TableHead>Current Stock</TableHead>
                    <TableHead>Sold</TableHead>
                    <TableHead>Days in Storage</TableHead>
                    <TableHead>Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredStocks.map((stock) => (
                    <TableRow key={`${stock.centerId}-${stock.variety}`}>
                      <TableCell>
                        <div className="text-sm">
                          <p className="font-medium">{stock.centerName}</p>
                          <p className="text-xs text-muted-foreground flex items-center gap-1">
                            <IconMapPin className="h-3 w-3" />
                            {stock.location}
                          </p>
                        </div>
                      </TableCell>
                      <TableCell className="font-medium">{stock.variety}</TableCell>
                      <TableCell>
                        <Badge variant="outline">Grade {stock.qualityGrade}</Badge>
                      </TableCell>
                      <TableCell>
                        <span className="font-semibold">{stock.quantity} kg</span>
                      </TableCell>
                      <TableCell>
                        <span className="text-sm text-muted-foreground">
                          {stock.soldQuantity || 0} kg
                        </span>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1">
                          {stock.daysInStorage > 7 ? (
                            <IconAlertCircle className="h-4 w-4 text-red-600" />
                          ) : stock.daysInStorage > 5 ? (
                            <IconClock className="h-4 w-4 text-yellow-600" />
                          ) : (
                            <IconCheck className="h-4 w-4 text-green-600" />
                          )}
                          <span className="text-sm">{stock.daysInStorage} days</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline" className={getStatusColor(stock.status)}>
                          {stock.status}
                        </Badge>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          ) : (
            <div className="text-center py-12">
              <IconPackage className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-lg font-medium text-muted-foreground">No produce found</p>
              <p className="text-sm text-muted-foreground">Try adjusting your filters</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Quality Assessments */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <IconClipboardCheck className="h-5 w-5 text-blue-600" />
            <CardTitle>Quality Assessments from Centers</CardTitle>
          </div>
          <CardDescription>Feedback and ratings from aggregation center quality checks</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {qualityAssessments.map((assessment) => (
              <div
                key={assessment.id}
                className={cn(
                  "p-4 rounded-lg border-2",
                  assessment.approved ? "border-green-200 bg-green-50" : "border-red-200 bg-red-50"
                )}
              >
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <h4 className="font-semibold text-sm">{assessment.centerName}</h4>
                    <p className="text-xs text-muted-foreground">
                      {new Date(assessment.date).toLocaleDateString()} - {assessment.variety}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant="outline">Grade {assessment.qualityGrade}</Badge>
                    {assessment.approved ? (
                      <IconCheck className="h-5 w-5 text-green-600" />
                    ) : (
                      <IconX className="h-5 w-5 text-red-600" />
                    )}
                  </div>
                </div>

                <div className="grid grid-cols-4 gap-4 mb-3">
                  <div className="text-center">
                    <p className="text-2xl font-bold">{assessment.overallScore}%</p>
                    <p className="text-xs text-muted-foreground">Overall Score</p>
                  </div>
                  <div className="text-center">
                    <p className="text-xl font-semibold">{assessment.colorScore}/10</p>
                    <p className="text-xs text-muted-foreground">Color</p>
                  </div>
                  <div className="text-center">
                    <p className="text-xl font-semibold">{assessment.sizeScore}/10</p>
                    <p className="text-xs text-muted-foreground">Size</p>
                  </div>
                  <div className="text-center">
                    <p className="text-xl font-semibold">{assessment.damagePercentage}%</p>
                    <p className="text-xs text-muted-foreground">Damage</p>
                  </div>
                </div>

                <div className="pt-3 border-t">
                  <p className="text-sm font-medium mb-1">Feedback:</p>
                  <p className="text-sm text-muted-foreground italic">"{assessment.feedback}"</p>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Delivery History */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Recent Deliveries</CardTitle>
              <CardDescription>Your delivery history to aggregation centers</CardDescription>
            </div>
            <Button variant="outline" size="sm">
              <IconChartBar className="mr-2 h-4 w-4" />
              View All
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Delivery ID</TableHead>
                  <TableHead>Center</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead>Variety</TableHead>
                  <TableHead>Quantity</TableHead>
                  <TableHead>Quality Score</TableHead>
                  <TableHead>Amount</TableHead>
                  <TableHead>Payment</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {deliveryHistory.map((delivery) => (
                  <TableRow key={delivery.id}>
                    <TableCell className="font-medium">{delivery.id}</TableCell>
                    <TableCell className="text-sm">{delivery.centerName}</TableCell>
                    <TableCell className="text-sm">
                      {new Date(delivery.date).toLocaleDateString()}
                    </TableCell>
                    <TableCell>{delivery.variety}</TableCell>
                    <TableCell className="font-semibold">{delivery.quantity} kg</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1">
                        <IconStar className="h-3 w-3 text-yellow-500 fill-yellow-500" />
                        <span className="font-medium">{delivery.qualityScore}%</span>
                      </div>
                    </TableCell>
                    <TableCell className="font-semibold">
                      KES {delivery.totalAmount.toLocaleString()}
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant="outline"
                        className={getPaymentStatusColor(delivery.paymentStatus)}
                      >
                        {delivery.paymentStatus}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleViewDelivery(delivery)}
                      >
                        <IconEye className="h-4 w-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* Delivery Details Dialog */}
      {selectedDelivery && (
        <Dialog open={isDetailDialogOpen} onOpenChange={setIsDetailDialogOpen}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Delivery Details</DialogTitle>
              <DialogDescription>{selectedDelivery.id}</DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm font-medium">Aggregation Center</p>
                  <p className="text-sm text-muted-foreground">{selectedDelivery.centerName}</p>
                </div>
                <div>
                  <p className="text-sm font-medium">Delivery Date</p>
                  <p className="text-sm text-muted-foreground">
                    {new Date(selectedDelivery.date).toLocaleDateString()}
                  </p>
                </div>
              </div>

              <div className="border-t pt-4 space-y-2">
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">Variety:</span>
                  <span className="text-sm font-medium">{selectedDelivery.variety}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">Quality Grade:</span>
                  <Badge variant="outline">Grade {selectedDelivery.qualityGrade}</Badge>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">Quantity:</span>
                  <span className="text-sm font-medium">{selectedDelivery.quantity} kg</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">Quality Score:</span>
                  <div className="flex items-center gap-1">
                    <IconStar className="h-4 w-4 text-yellow-500 fill-yellow-500" />
                    <span className="text-sm font-medium">{selectedDelivery.qualityScore}%</span>
                  </div>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">Price per kg:</span>
                  <span className="text-sm font-medium">KES {selectedDelivery.pricePerKg}</span>
                </div>
                <div className="flex justify-between border-t pt-2">
                  <span className="text-sm font-semibold">Total Amount:</span>
                  <span className="text-sm font-bold">
                    KES {selectedDelivery.totalAmount.toLocaleString()}
                  </span>
                </div>
              </div>

              <div className="border-t pt-4">
                <p className="text-sm font-medium mb-1">Payment Status:</p>
                <Badge className={getPaymentStatusColor(selectedDelivery.paymentStatus)}>
                  {selectedDelivery.paymentStatus}
                </Badge>
              </div>

              <div className="border-t pt-4">
                <p className="text-sm font-medium mb-1">Receipt ID:</p>
                <div className="flex items-center gap-2">
                  <IconReceipt className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm text-muted-foreground">{selectedDelivery.receiptId}</span>
                </div>
              </div>

              {selectedDelivery.feedback && (
                <div className="border-t pt-4">
                  <p className="text-sm font-medium mb-1">Center Feedback:</p>
                  <p className="text-sm text-muted-foreground italic">
                    "{selectedDelivery.feedback}"
                  </p>
                </div>
              )}
            </div>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}
