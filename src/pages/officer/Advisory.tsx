import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  IconSend,
  IconUsers,
  IconMessage,
  IconCheck,
  IconClock,
  IconAlertCircle,
} from "@tabler/icons-react";
import { useAnalytics } from "@/contexts/AnalyticsContext";
import type { Advisory } from "@/types/analytics";

export function Advisory() {
  const { advisories, fetchAdvisories, createAdvisory, updateAdvisory, deleteAdvisory, isLoading } = useAnalytics();
  
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [formData, setFormData] = useState({
    title: "",
    message: "",
    targetAudience: "all" as "all" | "sub_county" | "farmer_group" | "individual",
    targetValue: "",
  });

  // Fetch advisories on mount
  useEffect(() => {
    fetchAdvisories();
  }, [fetchAdvisories]);

  const handleSendAdvisory = async () => {
    try {
      await createAdvisory({
        type: "information",
        title: formData.title,
        content: formData.message,
        targetAudience: formData.targetAudience,
        targetValue: formData.targetAudience !== "all" ? (formData.targetValue || undefined) : undefined,
        isActive: true,
      });
      setIsDialogOpen(false);
      setFormData({ title: "", message: "", targetAudience: "all", targetValue: "" });
      await fetchAdvisories();
    } catch (error) {
      console.error("Failed to create advisory:", error);
      alert("Failed to send advisory. Please try again.");
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold">Advisory Management</h1>
          <p className="text-sm sm:text-base text-muted-foreground mt-1">
            Send advisories and track their impact on farmers
          </p>
        </div>
        <Button onClick={() => setIsDialogOpen(true)}>
          <IconSend className="mr-2 h-4 w-4" />
          Send Advisory
        </Button>
      </div>

      {/* Advisory Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total Sent</p>
                <p className="text-2xl font-bold">{advisories.length}</p>
              </div>
              <IconMessage className="h-8 w-8 text-primary" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Notifications Sent</p>
                <p className="text-2xl font-bold">
                  {advisories.reduce((sum, a) => sum + (a.deliveryCount ?? 0), 0)}
                </p>
                <p className="text-xs text-muted-foreground mt-1">SMS + web-push accepted (matches sum below)</p>
              </div>
              <IconCheck className="h-8 w-8 text-green-600" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total Reach</p>
                <p className="text-2xl font-bold">
                  {advisories.reduce((sum, a) => sum + (a.deliveryCount ?? 0), 0)}
                </p>
                <p className="text-xs text-muted-foreground mt-1">Total farmer notifications</p>
              </div>
              <IconUsers className="h-8 w-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Read Rate</p>
                <p className="text-2xl font-bold">
                  {advisories.length > 0
                    ? (() => {
                        const totalDelivered = advisories.reduce((sum, a) => sum + (a.deliveryCount ?? 0), 0);
                        const totalRead = advisories.reduce((sum, a) => sum + (a.readCount ?? 0), 0);
                        return totalDelivered > 0 ? Math.round((totalRead / totalDelivered) * 100) : 0;
                      })()
                    : 0}
                  %
                </p>
              </div>
              <IconAlertCircle className="h-8 w-8 text-orange-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Advisories List */}
      <Card>
        <CardHeader>
          <CardTitle>Sent Advisories</CardTitle>
          <CardDescription>View and track advisory messages sent to farmers</CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="space-y-4">
              {[1, 2, 3].map((i) => (
                <div key={i} className="h-32 bg-muted animate-pulse rounded-lg" />
              ))}
            </div>
          ) : (
            <div className="space-y-4">
              {advisories.map((advisory) => (
                <div key={advisory.id} className="border rounded-lg p-4 space-y-3">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <h3 className="font-semibold">{advisory.title}</h3>
                        <Badge
                          variant="outline"
                          className={
                            advisory.status === "delivered"
                              ? "bg-green-100 text-green-800"
                              : advisory.status === "sent"
                              ? "bg-yellow-100 text-yellow-800"
                              : "bg-gray-100 text-gray-800"
                          }
                        >
                          {advisory.status}
                        </Badge>
                      </div>
                      <p className="text-sm text-muted-foreground mb-2">{advisory.message}</p>
                      <div className="flex items-center gap-4 text-xs text-muted-foreground">
                        <span>
                          Target:{" "}
                          {typeof advisory.targetAudience === "string"
                            ? advisory.targetAudience === "all"
                              ? "All Farmers"
                              : advisory.targetAudience === "sub_county"
                              ? `Sub-County: ${advisory.targetValue || ""}`
                              : advisory.targetAudience === "farmer_group"
                              ? `Group: ${advisory.targetValue || ""}`
                              : `Individual: ${advisory.targetValue || ""}`
                            : Array.isArray(advisory.targetAudience)
                            ? advisory.targetAudience.includes("farmer") && advisory.targetAudience.length === 1
                              ? "All Farmers"
                              : advisory.targetAudience.join(", ")
                            : "All Users"}
                        </span>
                        <span>Sent: {advisory.sentDate}</span>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-6 pt-2 border-t">
                    <div className="text-sm">
                      <span className="text-muted-foreground">Sent: </span>
                      <span className="font-medium">{advisory.deliveryCount}</span>
                    </div>
                    {advisory.smsDeliveredCount != null && advisory.smsDeliveredCount > 0 && (
                      <div className="text-sm">
                        <span className="text-muted-foreground">SMS delivered (DLR): </span>
                        <span className="font-medium">{advisory.smsDeliveredCount}</span>
                      </div>
                    )}
                    <div className="text-sm">
                      <span className="text-muted-foreground">Read: </span>
                      <span className="font-medium">{advisory.readCount}</span>
                    </div>
                    {advisory.impact && (
                      <div className="text-sm">
                        <span className="text-muted-foreground">Impact: </span>
                        <span className="font-medium text-green-600">
                          +{advisory.impact.ordersIncrease}% orders
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Send Advisory Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Send Advisory Message</DialogTitle>
            <DialogDescription>
              Create and send an advisory message to farmers
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Title</label>
              <Input
                placeholder="Advisory title"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Message</label>
              <Textarea
                placeholder="Enter advisory message..."
                rows={6}
                value={formData.message}
                onChange={(e) => setFormData({ ...formData, message: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Target Audience</label>
              <Select
                value={formData.targetAudience}
                onValueChange={(value: any) =>
                  setFormData({ ...formData, targetAudience: value, targetValue: "" })
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Farmers</SelectItem>
                  <SelectItem value="sub_county">Sub-County</SelectItem>
                  <SelectItem value="farmer_group">Farmer Group</SelectItem>
                  <SelectItem value="individual">Individual Farmer</SelectItem>
                </SelectContent>
              </Select>
            </div>
            {formData.targetAudience !== "all" && (
              <div className="space-y-2">
                <label className="text-sm font-medium">
                  {formData.targetAudience === "sub_county"
                    ? "Sub-County"
                    : formData.targetAudience === "farmer_group"
                    ? "Farmer Group"
                    : "Farmer ID"}
                </label>
                <Input
                  placeholder={
                    formData.targetAudience === "sub_county"
                      ? "Select sub-county"
                      : formData.targetAudience === "farmer_group"
                      ? "Enter group name"
                      : "Enter farmer ID"
                  }
                  value={formData.targetValue}
                  onChange={(e) => setFormData({ ...formData, targetValue: e.target.value })}
                />
              </div>
            )}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleSendAdvisory} disabled={!formData.title || !formData.message}>
              <IconSend className="mr-2 h-4 w-4" />
              Send Advisory
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
