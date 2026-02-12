import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  IconCheck,
  IconX,
  IconPackage,
  IconUser,
  IconMapPin,
  IconCalendar,
  IconMessageCircle,
} from "@tabler/icons-react";
import { getListingsPendingApproval, approveListing, rejectListing } from "@/services/marketplaceService";
import { showSuccess, showError, formatApiError } from "@/lib/toast";
import type { ProduceListing } from "@/types/marketplace";

export function PendingApprovalPage() {
  const [listings, setListings] = useState<ProduceListing[]>([]);
  const [loading, setLoading] = useState(true);
  const [rejectDialog, setRejectDialog] = useState<{ listing: ProduceListing; reason: string } | null>(null);
  const [actioningId, setActioningId] = useState<string | null>(null);

  const load = async () => {
    setLoading(true);
    try {
      const list = await getListingsPendingApproval();
      setListings(list || []);
    } catch (e) {
      showError("Failed to load pending listings", formatApiError(e));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const handleApprove = async (listing: ProduceListing) => {
    setActioningId(listing.id);
    try {
      const res = await approveListing(listing.id);
      if (res.error) throw new Error(res.error);
      showSuccess("Listing approved", "The commodity is now visible to buyers.");
      await load();
    } catch (e: any) {
      showError("Approval failed", e?.message || formatApiError(e));
    } finally {
      setActioningId(null);
    }
  };

  const handleRejectSubmit = async () => {
    if (!rejectDialog) return;
    setActioningId(rejectDialog.listing.id);
    try {
      const res = await rejectListing(rejectDialog.listing.id, rejectDialog.reason);
      if (res.error) throw new Error(res.error);
      showSuccess("Listing returned for revision", "The farmer will be notified.");
      setRejectDialog(null);
      await load();
    } catch (e: any) {
      showError("Reject failed", e?.message || formatApiError(e));
    } finally {
      setActioningId(null);
    }
  };

  const farmerName = (l: ProduceListing) =>
    l.farmerName ||
    (l as any).farmer?.profile
      ? `${(l as any).farmer?.profile?.firstName || ""} ${(l as any).farmer?.profile?.lastName || ""}`.trim()
      : "Farmer";

  const locationText = (l: ProduceListing) =>
    [l.village, l.ward, l.county, l.location].filter(Boolean).join(", ") || l.location || "—";

  return (
    <div className="space-y-6 p-4 max-w-5xl mx-auto">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <IconPackage className="h-6 w-6" />
            Commodity listings pending approval
          </CardTitle>
          <CardDescription>
            Review and approve or return listings so they can go live on the marketplace. Only approved listings are visible to buyers.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <p className="text-muted-foreground">Loading…</p>
          ) : listings.length === 0 ? (
            <p className="text-muted-foreground">No listings pending approval.</p>
          ) : (
            <ul className="space-y-4">
              {listings.map((listing) => (
                <li key={listing.id}>
                  <Card className="border">
                    <CardContent className="pt-4">
                      <div className="flex flex-wrap items-start justify-between gap-4">
                        <div className="space-y-1">
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="font-medium">{String(listing.variety)}</span>
                            <Badge variant="secondary">
                              {listing.quantity} {listing.quantityUnit || "kg"}
                            </Badge>
                            <Badge>{listing.qualityGrade}</Badge>
                          </div>
                          <div className="flex items-center gap-2 text-sm text-muted-foreground">
                            <IconUser className="h-4 w-4" />
                            {farmerName(listing)}
                          </div>
                          <div className="flex items-center gap-2 text-sm text-muted-foreground">
                            <IconMapPin className="h-4 w-4" />
                            {locationText(listing)}
                          </div>
                          {listing.expectedReadyAt && (
                            <div className="flex items-center gap-2 text-sm text-muted-foreground">
                              <IconCalendar className="h-4 w-4" />
                              Ready: {new Date(listing.expectedReadyAt).toLocaleString()}
                            </div>
                          )}
                          {listing.description && (
                            <p className="text-sm mt-1">{listing.description}</p>
                          )}
                          <p className="text-xs text-muted-foreground mt-1">
                            Submitted {new Date(listing.createdAt).toLocaleString()}
                          </p>
                        </div>
                        <div className="flex items-center gap-2">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => setRejectDialog({ listing, reason: "" })}
                            disabled={!!actioningId}
                          >
                            <IconMessageCircle className="h-4 w-4 mr-1" />
                            Return for revision
                          </Button>
                          <Button
                            size="sm"
                            onClick={() => handleApprove(listing)}
                            disabled={!!actioningId}
                          >
                            <IconCheck className="h-4 w-4 mr-1" />
                            Approve
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </li>
              ))}
            </ul>
          )}
        </CardContent>
      </Card>

      <Dialog open={!!rejectDialog} onOpenChange={() => setRejectDialog(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Return for revision</DialogTitle>
            <DialogDescription>
              Add comments so the farmer knows what to correct. The listing status will be set to &quot;Requires revision&quot;.
            </DialogDescription>
          </DialogHeader>
          {rejectDialog && (
            <div className="space-y-2">
              <label className="text-sm font-medium">Comments (optional)</label>
              <Textarea
                placeholder="e.g. Please correct the quantity or add a photo of the produce."
                value={rejectDialog.reason}
                onChange={(e) =>
                  setRejectDialog({ ...rejectDialog, reason: e.target.value })
                }
                rows={3}
              />
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setRejectDialog(null)}>
              Cancel
            </Button>
            <Button
              onClick={handleRejectSubmit}
              disabled={!!actioningId}
            >
              Return for revision
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
