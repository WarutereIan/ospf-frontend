import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import {
  IconSearch,
  IconUsers,
  IconTrendingUp,
  IconPackage,
  IconDownload,
  IconEye,
  IconX,
  IconMapPin,
} from "@tabler/icons-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface Farmer {
  id: string;
  name: string;
  phone: string;
  subCounty: string;
  ward: string;
  totalSales: number;
  orderCount: number;
  lastActivity: string;
  status: "active" | "inactive";
  registrationDate: string;
}

export function Farmers() {
  const [farmers, setFarmers] = useState<Farmer[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [subCountyFilter, setSubCountyFilter] = useState<string>("all");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [farmerGroupFilter, setFarmerGroupFilter] = useState<string>("all");
  const [selectedFarmer, setSelectedFarmer] = useState<Farmer | null>(null);
  const [isProfileDialogOpen, setIsProfileDialogOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [stats, setStats] = useState({
    totalFarmers: 0,
    activeFarmers: 0,
    inactiveFarmers: 0,
    newRegistrations: 0,
  });

  useEffect(() => {
    // TODO: Replace with actual API calls
    setTimeout(() => {
      setFarmers([
        {
          id: "F001",
          name: "John Mutua",
          phone: "+254712345678",
          subCounty: "Kangundo",
          ward: "Kangundo North",
          totalSales: 125000,
          orderCount: 45,
          lastActivity: "2024-01-15",
          status: "active",
          registrationDate: "2023-06-01",
        },
        {
          id: "F002",
          name: "Mary Wanjiku",
          phone: "+254723456789",
          subCounty: "Kathiani",
          ward: "Kathiani Central",
          totalSales: 98000,
          orderCount: 32,
          lastActivity: "2024-01-14",
          status: "active",
          registrationDate: "2023-07-15",
        },
        {
          id: "F003",
          name: "Peter Kariuki",
          phone: "+254734567890",
          subCounty: "Kangundo",
          ward: "Kangundo South",
          totalSales: 45000,
          orderCount: 12,
          lastActivity: "2024-01-10",
          status: "inactive",
          registrationDate: "2023-08-20",
        },
      ]);
      setIsLoading(false);
      setStats({
        totalFarmers: 3,
        activeFarmers: 2,
        inactiveFarmers: 1,
        newRegistrations: 0,
      });
    }, 1000);
  }, []);

  const subCounties = Array.from(new Set(farmers.map((f) => f.subCounty)));

  const filteredFarmers = farmers.filter(
    (farmer) => {
      const matchesSearch =
        farmer.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        farmer.phone.includes(searchQuery) ||
        farmer.subCounty.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesSubCounty = subCountyFilter === "all" || farmer.subCounty === subCountyFilter;
      const matchesStatus = statusFilter === "all" || farmer.status === statusFilter;
      const matchesGroup = farmerGroupFilter === "all"; // TODO: Add farmer group field to interface
      return matchesSearch && matchesSubCounty && matchesStatus && matchesGroup;
    }
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold">Farmers Management</h1>
          <p className="text-sm sm:text-base text-muted-foreground mt-1">
            View and manage all registered farmers
          </p>
        </div>
        <Button>
          <IconDownload className="mr-2 h-4 w-4" />
          Export Report
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total Registered</p>
                <p className="text-2xl font-bold">{stats.totalFarmers}</p>
              </div>
              <IconUsers className="h-8 w-8 text-primary" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Active Farmers</p>
                <p className="text-2xl font-bold">{stats.activeFarmers}</p>
              </div>
              <IconTrendingUp className="h-8 w-8 text-green-600" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Inactive Farmers</p>
                <p className="text-2xl font-bold">{stats.inactiveFarmers}</p>
              </div>
              <IconX className="h-8 w-8 text-gray-600" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">New Registrations</p>
                <p className="text-2xl font-bold">{stats.newRegistrations}</p>
                <p className="text-xs text-muted-foreground mt-1">This month</p>
              </div>
              <IconPackage className="h-8 w-8 text-blue-600" />
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
                placeholder="Search by name, phone, or location..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={subCountyFilter} onValueChange={setSubCountyFilter}>
              <SelectTrigger className="w-full sm:w-[200px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Sub-Counties</SelectItem>
                {subCounties.map((subCounty) => (
                  <SelectItem key={subCounty} value={subCounty}>
                    {subCounty}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-full sm:w-[200px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="inactive">Inactive</SelectItem>
              </SelectContent>
            </Select>
            <Select value={farmerGroupFilter} onValueChange={setFarmerGroupFilter}>
              <SelectTrigger className="w-full sm:w-[200px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Groups</SelectItem>
                <SelectItem value="group1">Group 1</SelectItem>
                <SelectItem value="group2">Group 2</SelectItem>
                <SelectItem value="group3">Group 3</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Farmers Table */}
      <Card>
        <CardHeader>
          <CardTitle>All Farmers ({filteredFarmers.length})</CardTitle>
          <CardDescription>Complete list of registered farmers in the system</CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="space-y-4">
              {[1, 2, 3].map((i) => (
                <div key={i} className="h-16 bg-muted animate-pulse rounded-lg" />
              ))}
            </div>
          ) : filteredFarmers.length > 0 ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Farmer ID</TableHead>
                  <TableHead>Name</TableHead>
                  <TableHead>Contact</TableHead>
                  <TableHead>Location</TableHead>
                  <TableHead>Total Sales</TableHead>
                  <TableHead>Orders</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredFarmers.map((farmer) => (
                  <TableRow key={farmer.id}>
                    <TableCell className="font-medium">{farmer.id}</TableCell>
                    <TableCell>{farmer.name}</TableCell>
                    <TableCell>{farmer.phone}</TableCell>
                    <TableCell>
                      <div className="text-sm">
                        <div>{farmer.subCounty}</div>
                        <div className="text-muted-foreground">{farmer.ward}</div>
                      </div>
                    </TableCell>
                    <TableCell>KES {farmer.totalSales.toLocaleString()}</TableCell>
                    <TableCell>{farmer.orderCount}</TableCell>
                    <TableCell>
                      <Badge
                        variant="outline"
                        className={
                          farmer.status === "active"
                            ? "bg-green-100 text-green-800"
                            : "bg-gray-100 text-gray-800"
                        }
                      >
                        {farmer.status}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => {
                          setSelectedFarmer(farmer);
                          setIsProfileDialogOpen(true);
                        }}
                      >
                        <IconEye className="h-4 w-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          ) : (
            <div className="text-center py-8">
              <IconUsers className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground">No farmers found</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Farmer Profile Dialog */}
      <Dialog open={isProfileDialogOpen} onOpenChange={setIsProfileDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Farmer Profile</DialogTitle>
            <DialogDescription>View detailed information about the farmer</DialogDescription>
          </DialogHeader>
          {selectedFarmer && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-muted-foreground">Farmer ID</p>
                  <p className="font-medium">{selectedFarmer.id}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Name</p>
                  <p className="font-medium">{selectedFarmer.name}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Phone</p>
                  <p className="font-medium">{selectedFarmer.phone}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Sub-County</p>
                  <p className="font-medium">{selectedFarmer.subCounty}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Ward</p>
                  <p className="font-medium">{selectedFarmer.ward}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Status</p>
                  <Badge
                    variant="outline"
                    className={
                      selectedFarmer.status === "active"
                        ? "bg-green-100 text-green-800"
                        : "bg-gray-100 text-gray-800"
                    }
                  >
                    {selectedFarmer.status}
                  </Badge>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Total Sales</p>
                  <p className="font-medium">KES {selectedFarmer.totalSales.toLocaleString()}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Total Orders</p>
                  <p className="font-medium">{selectedFarmer.orderCount}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Registration Date</p>
                  <p className="font-medium">{selectedFarmer.registrationDate}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Last Activity</p>
                  <p className="font-medium">{selectedFarmer.lastActivity}</p>
                </div>
              </div>
              <div className="flex gap-2 pt-4 border-t">
                <Button
                  variant="outline"
                  onClick={() => {
                    // TODO: Implement deactivate
                    setFarmers(
                      farmers.map((f) =>
                        f.id === selectedFarmer.id
                          ? { ...f, status: f.status === "active" ? "inactive" : "active" }
                          : f
                      )
                    );
                    setIsProfileDialogOpen(false);
                  }}
                >
                  {selectedFarmer.status === "active" ? "Deactivate" : "Activate"} Account
                </Button>
                <Button variant="outline">
                  <IconDownload className="mr-2 h-4 w-4" />
                  Export Profile
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
