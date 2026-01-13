import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  IconSearch,
  IconClipboardCheck,
  IconPlus,
  IconEye,
  IconCheck,
  IconX,
  IconClock,
} from "@tabler/icons-react";

interface QualityCheckItem {
  id: string;
  stockId: string;
  variety: string;
  quantity: number;
  qualityGrade: "A" | "B" | "C" | null;
  status: "pending" | "approved" | "rejected";
  checkedBy?: string;
  checkedAt?: string;
  farmerName: string;
  stockInDate: string;
}

export function QualityChecksList() {
  const navigate = useNavigate();
  const [qualityChecks, setQualityChecks] = useState<QualityCheckItem[]>([]);
  const [filteredChecks, setFilteredChecks] = useState<QualityCheckItem[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // TODO: Replace with actual API call
    setTimeout(() => {
      const sampleChecks: QualityCheckItem[] = [
        {
          id: "QC-001",
          stockId: "INV-001",
          variety: "Kenya",
          quantity: 500,
          qualityGrade: "A",
          status: "approved",
          checkedBy: "Manager A",
          checkedAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
          farmerName: "James Mutua",
          stockInDate: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
        },
        {
          id: "QC-002",
          stockId: "INV-002",
          variety: "SPK004",
          quantity: 300,
          qualityGrade: null,
          status: "pending",
          farmerName: "Mary Wanjiku",
          stockInDate: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
        },
        {
          id: "QC-003",
          stockId: "INV-003",
          variety: "Kabode",
          quantity: 200,
          qualityGrade: "B",
          status: "approved",
          checkedBy: "Manager B",
          checkedAt: new Date(Date.now() - 5 * 60 * 60 * 1000).toISOString(),
          farmerName: "Peter Kamau",
          stockInDate: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
        },
        {
          id: "QC-004",
          stockId: "INV-004",
          variety: "Kenya",
          quantity: 150,
          qualityGrade: "C",
          status: "rejected",
          checkedBy: "Manager A",
          checkedAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
          farmerName: "John Doe",
          stockInDate: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000).toISOString(),
        },
      ];
      setQualityChecks(sampleChecks);
      setFilteredChecks(sampleChecks);
      setIsLoading(false);
    }, 1000);
  }, []);

  useEffect(() => {
    let filtered = [...qualityChecks];

    if (searchTerm) {
      filtered = filtered.filter(
        (check) =>
          check.stockId.toLowerCase().includes(searchTerm.toLowerCase()) ||
          check.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
          check.farmerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
          check.variety.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (statusFilter !== "all") {
      filtered = filtered.filter((check) => check.status === statusFilter);
    }

    setFilteredChecks(filtered);
  }, [qualityChecks, searchTerm, statusFilter]);

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "approved":
        return (
          <Badge variant="outline" className="bg-green-100 text-green-800 border-green-300">
            <IconCheck className="mr-1 h-3 w-3" />
            Approved
          </Badge>
        );
      case "rejected":
        return (
          <Badge variant="outline" className="bg-red-100 text-red-800 border-red-300">
            <IconX className="mr-1 h-3 w-3" />
            Rejected
          </Badge>
        );
      case "pending":
        return (
          <Badge variant="outline" className="bg-yellow-100 text-yellow-800 border-yellow-300">
            <IconClock className="mr-1 h-3 w-3" />
            Pending
          </Badge>
        );
      default:
        return null;
    }
  };

  const getGradeColor = (grade: string | null) => {
    if (!grade) return "bg-gray-100 text-gray-800";
    switch (grade) {
      case "A":
        return "bg-green-100 text-green-800";
      case "B":
        return "bg-yellow-100 text-yellow-800";
      case "C":
        return "bg-orange-100 text-orange-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const pendingCount = qualityChecks.filter((c) => c.status === "pending").length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold">Quality Checks</h1>
          <p className="text-sm sm:text-base text-muted-foreground mt-1">
            Manage and track quality assessments for incoming stock
          </p>
        </div>
        <Button onClick={() => navigate("/dashboard/aggregation/quality-checks/new")}>
          <IconPlus className="mr-2 h-4 w-4" />
          New Quality Check
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total Checks</p>
                <p className="text-2xl font-bold">{qualityChecks.length}</p>
              </div>
              <IconClipboardCheck className="h-8 w-8 text-primary" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Pending</p>
                <p className="text-2xl font-bold text-yellow-600">{pendingCount}</p>
              </div>
              <IconClock className="h-8 w-8 text-yellow-600" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Approved</p>
                <p className="text-2xl font-bold text-green-600">
                  {qualityChecks.filter((c) => c.status === "approved").length}
                </p>
              </div>
              <IconCheck className="h-8 w-8 text-green-600" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Rejected</p>
                <p className="text-2xl font-bold text-red-600">
                  {qualityChecks.filter((c) => c.status === "rejected").length}
                </p>
              </div>
              <IconX className="h-8 w-8 text-red-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="relative flex-1">
              <IconSearch className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Search by stock ID, check ID, farmer, or variety..."
                className="pl-10"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <Select value={statusFilter} onValueChange={(value) => setStatusFilter(value || "all")}>
              <SelectTrigger className="w-full md:w-[200px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="approved">Approved</SelectItem>
                <SelectItem value="rejected">Rejected</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Quality Checks Table */}
      <Card>
        <CardHeader>
          <CardTitle>Quality Checks ({filteredChecks.length})</CardTitle>
          <CardDescription>List of all quality assessments</CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="space-y-4">
              {[1, 2, 3].map((i) => (
                <div key={i} className="h-16 bg-muted animate-pulse rounded-lg" />
              ))}
            </div>
          ) : filteredChecks.length > 0 ? (
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Check ID</TableHead>
                    <TableHead>Stock ID</TableHead>
                    <TableHead>Variety</TableHead>
                    <TableHead>Quantity</TableHead>
                    <TableHead>Grade</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Farmer</TableHead>
                    <TableHead>Checked By</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredChecks.map((check) => (
                    <TableRow key={check.id}>
                      <TableCell className="font-medium">{check.id}</TableCell>
                      <TableCell>{check.stockId}</TableCell>
                      <TableCell>{check.variety}</TableCell>
                      <TableCell>{check.quantity} kg</TableCell>
                      <TableCell>
                        {check.qualityGrade ? (
                          <Badge variant="outline" className={getGradeColor(check.qualityGrade)}>
                            Grade {check.qualityGrade}
                          </Badge>
                        ) : (
                          <span className="text-muted-foreground">-</span>
                        )}
                      </TableCell>
                      <TableCell>{getStatusBadge(check.status)}</TableCell>
                      <TableCell>{check.farmerName}</TableCell>
                      <TableCell>
                        {check.checkedBy ? (
                          <div>
                            <div className="text-sm">{check.checkedBy}</div>
                            {check.checkedAt && (
                              <div className="text-xs text-muted-foreground">
                                {new Date(check.checkedAt).toLocaleDateString()}
                              </div>
                            )}
                          </div>
                        ) : (
                          <span className="text-muted-foreground">-</span>
                        )}
                      </TableCell>
                      <TableCell>
                        <Link to={`/dashboard/aggregation/quality-checks/${check.id}`}>
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
            </div>
          ) : (
            <div className="text-center py-12">
              <IconClipboardCheck className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-lg font-medium text-muted-foreground">No quality checks found</p>
              <p className="text-sm text-muted-foreground mt-1">
                {searchTerm || statusFilter !== "all"
                  ? "Try adjusting your filters"
                  : "Create your first quality check"}
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
