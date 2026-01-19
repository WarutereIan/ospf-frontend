import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
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
  IconBuilding,
  IconUsers,
  IconPlus,
  IconEdit,
  IconMail,
  IconPhone,
  IconMapPin,
  IconChartBar,
  IconDownload,
} from "@tabler/icons-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface Partner {
  id: string;
  name: string;
  type: "government" | "ngo" | "private" | "donor" | "other";
  contactPerson: string;
  email?: string;
  phone: string;
  location: string;
  status: "active" | "inactive" | "pending";
  engagementLevel: "high" | "medium" | "low";
  contributions: string[];
  createdAt: string;
  lastContact?: string;
}

export function Partners() {
  const [partners, setPartners] = useState<Partner[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [typeFilter, setTypeFilter] = useState<string>("all");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [formData, setFormData] = useState({
    name: "",
    type: "ngo" as Partner["type"],
    contactPerson: "",
    email: "",
    phone: "",
    location: "",
    engagementLevel: "medium" as Partner["engagementLevel"],
    contributions: "",
  });

  useEffect(() => {
    setTimeout(() => {
      setPartners([
        {
          id: "P001",
          name: "Machakos County Government",
          type: "government",
          contactPerson: "John Mwangi",
          email: "john.mwangi@machakos.go.ke",
          phone: "+254712345678",
          location: "Machakos Town",
          status: "active",
          engagementLevel: "high",
          contributions: ["Policy support", "Infrastructure", "Extension services"],
          createdAt: "2023-01-15",
          lastContact: "2024-01-10",
        },
        {
          id: "P002",
          name: "USAID Kenya",
          type: "donor",
          contactPerson: "Sarah Johnson",
          email: "sjohnson@usaid.gov",
          phone: "+254723456789",
          location: "Nairobi",
          status: "active",
          engagementLevel: "high",
          contributions: ["Funding", "Technical assistance", "Monitoring"],
          createdAt: "2023-02-01",
          lastContact: "2024-01-12",
        },
        {
          id: "P003",
          name: "Farmers Cooperative Union",
          type: "private",
          contactPerson: "David Kimani",
          phone: "+254734567890",
          location: "Kangundo",
          status: "active",
          engagementLevel: "medium",
          contributions: ["Farmer mobilization", "Market access"],
          createdAt: "2023-03-10",
          lastContact: "2024-01-05",
        },
        {
          id: "P004",
          name: "World Vision Kenya",
          type: "ngo",
          contactPerson: "Grace Wambui",
          email: "grace.wambui@worldvision.org",
          phone: "+254745678901",
          location: "Machakos",
          status: "active",
          engagementLevel: "medium",
          contributions: ["Training", "Community engagement"],
          createdAt: "2023-04-20",
          lastContact: "2023-12-15",
        },
      ]);
      setIsLoading(false);
    }, 1000);
  }, []);

  const filteredPartners = partners.filter((partner) => {
    const matchesSearch =
      partner.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      partner.contactPerson.toLowerCase().includes(searchQuery.toLowerCase()) ||
      partner.location.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesType = typeFilter === "all" || partner.type === typeFilter;
    const matchesStatus = statusFilter === "all" || partner.status === statusFilter;
    return matchesSearch && matchesType && matchesStatus;
  });

  const handleCreatePartner = () => {
    const newPartner: Partner = {
      id: `P${String(partners.length + 1).padStart(3, "0")}`,
      name: formData.name,
      type: formData.type,
      contactPerson: formData.contactPerson,
      email: formData.email || undefined,
      phone: formData.phone,
      location: formData.location,
      status: "pending",
      engagementLevel: formData.engagementLevel,
      contributions: formData.contributions.split(",").map((c) => c.trim()).filter(Boolean),
      createdAt: new Date().toISOString().split("T")[0],
    };
    setPartners([...partners, newPartner]);
    setIsDialogOpen(false);
    setFormData({
      name: "",
      type: "ngo",
      contactPerson: "",
      email: "",
      phone: "",
      location: "",
      engagementLevel: "medium",
      contributions: "",
    });
  };

  const getTypeBadgeColor = (type: Partner["type"]) => {
    switch (type) {
      case "government":
        return "bg-blue-100 text-blue-800";
      case "ngo":
        return "bg-green-100 text-green-800";
      case "private":
        return "bg-purple-100 text-purple-800";
      case "donor":
        return "bg-orange-100 text-orange-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getEngagementColor = (level: Partner["engagementLevel"]) => {
    switch (level) {
      case "high":
        return "bg-green-100 text-green-800";
      case "medium":
        return "bg-yellow-100 text-yellow-800";
      case "low":
        return "bg-gray-100 text-gray-800";
    }
  };

  const stats = {
    total: partners.length,
    active: partners.filter((p) => p.status === "active").length,
    highEngagement: partners.filter((p) => p.engagementLevel === "high").length,
    byType: {
      government: partners.filter((p) => p.type === "government").length,
      ngo: partners.filter((p) => p.type === "ngo").length,
      private: partners.filter((p) => p.type === "private").length,
      donor: partners.filter((p) => p.type === "donor").length,
    },
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold">Partners & Stakeholders</h1>
          <p className="text-sm sm:text-base text-muted-foreground mt-1">
            Coordinate and manage partnerships with government, NGOs, donors, and private sector
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm">
            <IconDownload className="mr-2 h-4 w-4" />
            Export
          </Button>
          <Button onClick={() => setIsDialogOpen(true)} size="sm">
            <IconPlus className="mr-2 h-4 w-4" />
            Add Partner
          </Button>
        </div>
      </div>

      {/* Statistics */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total Partners</p>
                <p className="text-2xl font-bold">{stats.total}</p>
              </div>
              <IconBuilding className="h-8 w-8 text-primary" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Active Partners</p>
                <p className="text-2xl font-bold">{stats.active}</p>
              </div>
              <IconUsers className="h-8 w-8 text-green-600" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">High Engagement</p>
                <p className="text-2xl font-bold">{stats.highEngagement}</p>
              </div>
              <IconChartBar className="h-8 w-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Government</p>
                <p className="text-2xl font-bold">{stats.byType.government}</p>
              </div>
              <IconBuilding className="h-8 w-8 text-purple-600" />
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
                placeholder="Search by name, contact person, or location..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={typeFilter} onValueChange={setTypeFilter}>
              <SelectTrigger className="w-full sm:w-[180px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Types</SelectItem>
                <SelectItem value="government">Government</SelectItem>
                <SelectItem value="ngo">NGO</SelectItem>
                <SelectItem value="private">Private</SelectItem>
                <SelectItem value="donor">Donor</SelectItem>
                <SelectItem value="other">Other</SelectItem>
              </SelectContent>
            </Select>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-full sm:w-[180px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="inactive">Inactive</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Partners Table */}
      <Card>
        <CardHeader>
          <CardTitle>Partners ({filteredPartners.length})</CardTitle>
          <CardDescription>Manage partner relationships and engagement</CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="space-y-4">
              {[1, 2, 3].map((i) => (
                <div key={i} className="h-16 bg-muted animate-pulse rounded-lg" />
              ))}
            </div>
          ) : filteredPartners.length > 0 ? (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Partner Name</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Contact Person</TableHead>
                    <TableHead>Contact Info</TableHead>
                    <TableHead>Location</TableHead>
                    <TableHead>Engagement</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Contributions</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredPartners.map((partner) => (
                    <TableRow key={partner.id}>
                      <TableCell className="font-medium">{partner.name}</TableCell>
                      <TableCell>
                        <Badge variant="outline" className={getTypeBadgeColor(partner.type)}>
                          {partner.type}
                        </Badge>
                      </TableCell>
                      <TableCell>{partner.contactPerson}</TableCell>
                      <TableCell>
                        <div className="space-y-1">
                          {partner.email && (
                            <div className="flex items-center gap-1 text-sm">
                              <IconMail className="h-3 w-3" />
                              {partner.email}
                            </div>
                          )}
                          <div className="flex items-center gap-1 text-sm">
                            <IconPhone className="h-3 w-3" />
                            {partner.phone}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1 text-sm">
                          <IconMapPin className="h-3 w-3" />
                          {partner.location}
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline" className={getEngagementColor(partner.engagementLevel)}>
                          {partner.engagementLevel}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant="outline"
                          className={
                            partner.status === "active"
                              ? "bg-green-100 text-green-800"
                              : partner.status === "pending"
                              ? "bg-yellow-100 text-yellow-800"
                              : "bg-gray-100 text-gray-800"
                          }
                        >
                          {partner.status}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex flex-wrap gap-1">
                          {partner.contributions.slice(0, 2).map((contrib, idx) => (
                            <Badge key={idx} variant="outline" className="text-xs">
                              {contrib}
                            </Badge>
                          ))}
                          {partner.contributions.length > 2 && (
                            <Badge variant="outline" className="text-xs">
                              +{partner.contributions.length - 2}
                            </Badge>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <Button variant="ghost" size="sm" title="Edit Partner">
                          <IconEdit className="h-4 w-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          ) : (
            <div className="text-center py-8">
              <IconBuilding className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground">No partners found</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Create Partner Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Add New Partner</DialogTitle>
            <DialogDescription>Register a new partner or stakeholder organization</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Organization Name *</label>
                <Input
                  placeholder="Enter organization name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Partner Type *</label>
                <Select
                  value={formData.type}
                  onValueChange={(value: Partner["type"]) => setFormData({ ...formData, type: value })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="government">Government</SelectItem>
                    <SelectItem value="ngo">NGO</SelectItem>
                    <SelectItem value="private">Private Sector</SelectItem>
                    <SelectItem value="donor">Donor</SelectItem>
                    <SelectItem value="other">Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Contact Person *</label>
                <Input
                  placeholder="Contact person name"
                  value={formData.contactPerson}
                  onChange={(e) => setFormData({ ...formData, contactPerson: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Phone Number *</label>
                <Input
                  type="tel"
                  placeholder="+254 7XX XXX XXX"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                />
              </div>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Email</label>
                <Input
                  type="email"
                  placeholder="email@example.com"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Location *</label>
                <Input
                  placeholder="City/Town"
                  value={formData.location}
                  onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                />
              </div>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Engagement Level</label>
              <Select
                value={formData.engagementLevel}
                onValueChange={(value: Partner["engagementLevel"]) =>
                  setFormData({ ...formData, engagementLevel: value })
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="high">High</SelectItem>
                  <SelectItem value="medium">Medium</SelectItem>
                  <SelectItem value="low">Low</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Contributions (comma-separated)</label>
              <Input
                placeholder="e.g., Funding, Training, Technical assistance"
                value={formData.contributions}
                onChange={(e) => setFormData({ ...formData, contributions: e.target.value })}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
              Cancel
            </Button>
            <Button
              onClick={handleCreatePartner}
              disabled={!formData.name || !formData.contactPerson || !formData.phone || !formData.location}
            >
              Add Partner
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
