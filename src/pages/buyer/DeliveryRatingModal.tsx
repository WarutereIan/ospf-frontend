import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  IconStar,
  IconCheck,
  IconLoader2,
  IconUser,
  IconTruck,
  IconMessageCircle,
  IconPackage,
} from "@tabler/icons-react";
import { cn } from "@/lib/utils";
import { useProfile } from "@/contexts/ProfileContext";
import type { Rating } from "@/types/profile";

interface RatingForm {
  overallRating: number;
  review: string;
}

interface DeliveryRatingModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  orderId: string;
  farmerId: string;
  farmerName: string;
  driverId?: string;
  driverName?: string;
  onRatingsSubmitted: () => void;
}

export function DeliveryRatingModal({
  open,
  onOpenChange,
  orderId,
  farmerId,
  farmerName,
  driverId,
  driverName,
  onRatingsSubmitted,
}: DeliveryRatingModalProps) {
  const [farmerRating, setFarmerRating] = useState<RatingForm>({
    overallRating: 0,
    review: "",
  });
  const [driverRating, setDriverRating] = useState<RatingForm>({
    overallRating: 0,
    review: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [currentStep, setCurrentStep] = useState<"farmer" | "driver" | "complete">("farmer");

  const { submitRating } = useProfile();

  const handleStarClick = (
    value: number,
    type: "farmer" | "driver"
  ) => {
    if (type === "farmer") {
      setFarmerRating((prev) => ({ ...prev, overallRating: value }));
    } else {
      setDriverRating((prev) => ({ ...prev, overallRating: value }));
    }
  };

  const handleSubmitFarmerRating = async () => {
    if (farmerRating.overallRating === 0) {
      alert("Please provide a rating for the farmer");
      return;
    }

    setIsSubmitting(true);
    try {
      const ratingData: Partial<Rating> & { ratedUserId: string } = {
        ratedUserId: farmerId,
        orderId,
        overallRating: farmerRating.overallRating,
        review: farmerRating.review || undefined,
      };
      
      await submitRating(ratingData);
      
      setIsSubmitting(false);
      
      // If there's a driver, move to driver rating step
      if (driverId && driverName) {
        setCurrentStep("driver");
      } else {
        // No driver, complete
        setCurrentStep("complete");
        setTimeout(() => {
          onRatingsSubmitted();
          onOpenChange(false);
          // Reset state
          setFarmerRating({ overallRating: 0, review: "" });
          setDriverRating({ overallRating: 0, review: "" });
          setCurrentStep("farmer");
        }, 1500);
      }
    } catch (error) {
      console.error("Failed to submit farmer rating:", error);
      alert("Failed to submit farmer rating. Please try again.");
      setIsSubmitting(false);
    }
  };

  const handleSubmitDriverRating = async () => {
    if (driverRating.overallRating === 0) {
      alert("Please provide a rating for the delivery person");
      return;
    }

    if (!driverId) {
      alert("Driver information is missing");
      return;
    }

    setIsSubmitting(true);
    try {
      const ratingData: Partial<Rating> & { ratedUserId: string } = {
        ratedUserId: driverId,
        orderId,
        overallRating: driverRating.overallRating,
        review: driverRating.review || undefined,
      };
      
      await submitRating(ratingData);
      
      setIsSubmitting(false);
      setCurrentStep("complete");
      
      setTimeout(() => {
        onRatingsSubmitted();
        onOpenChange(false);
        // Reset state
        setFarmerRating({ overallRating: 0, review: "" });
        setDriverRating({ overallRating: 0, review: "" });
        setCurrentStep("farmer");
      }, 1500);
    } catch (error) {
      console.error("Failed to submit driver rating:", error);
      alert("Failed to submit driver rating. Please try again.");
      setIsSubmitting(false);
    }
  };

  const StarRating = ({
    value,
    onChange,
    label,
  }: {
    value: number;
    onChange: (value: number) => void;
    label: string;
  }) => (
    <div className="space-y-3">
      <Label className="text-sm font-medium">{label}</Label>
      <div className="flex gap-2 items-center">
        {[1, 2, 3, 4, 5].map((star) => (
          <button
            key={star}
            type="button"
            onClick={() => onChange(star)}
            className="focus:outline-none transition-transform hover:scale-110"
          >
            <IconStar
              className={cn(
                "h-8 w-8 transition-colors",
                star <= value
                  ? "text-yellow-500 fill-yellow-500"
                  : "text-gray-300 hover:text-yellow-300"
              )}
            />
          </button>
        ))}
        {value > 0 && (
          <span className="ml-3 text-sm font-medium text-muted-foreground">
            {value}/5
          </span>
        )}
      </div>
    </div>
  );

  const handleClose = () => {
    if (!isSubmitting && currentStep !== "complete") {
      onOpenChange(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {currentStep === "farmer" && "Rate the Farmer"}
            {currentStep === "driver" && "Rate the Delivery Person"}
            {currentStep === "complete" && "Thank You!"}
          </DialogTitle>
          <DialogDescription>
            {currentStep === "farmer" && `Share your experience with ${farmerName}`}
            {currentStep === "driver" && driverName && `Share your experience with ${driverName}`}
            {currentStep === "complete" && "Your ratings have been submitted successfully"}
          </DialogDescription>
        </DialogHeader>

        {currentStep === "complete" ? (
          <div className="py-8 text-center">
            <div className="mx-auto mb-4 w-16 h-16 rounded-full bg-green-100 flex items-center justify-center">
              <IconCheck className="h-8 w-8 text-green-600" />
            </div>
            <p className="text-muted-foreground">
              Thank you for your feedback!
            </p>
          </div>
        ) : currentStep === "farmer" ? (
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-base flex items-center gap-2">
                  <IconUser className="h-5 w-5" />
                  Rate {farmerName}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <StarRating
                  value={farmerRating.overallRating}
                  onChange={(value) => handleStarClick(value, "farmer")}
                  label="Overall Rating *"
                />

                <div className="space-y-2">
                  <Label htmlFor="farmer-review">Review (Optional)</Label>
                  <Textarea
                    id="farmer-review"
                    placeholder="Share your experience with this farmer..."
                    value={farmerRating.review}
                    onChange={(e) =>
                      setFarmerRating((prev) => ({ ...prev, review: e.target.value }))
                    }
                    rows={3}
                  />
                </div>

                <Button
                  onClick={handleSubmitFarmerRating}
                  disabled={farmerRating.overallRating === 0 || isSubmitting}
                  className="w-full"
                >
                  {isSubmitting ? (
                    <>
                      <IconLoader2 className="mr-2 h-4 w-4 animate-spin" />
                      Submitting...
                    </>
                  ) : driverId && driverName ? (
                    <>
                      Continue to Rate Driver
                      <IconTruck className="ml-2 h-4 w-4" />
                    </>
                  ) : (
                    <>
                      <IconCheck className="mr-2 h-4 w-4" />
                      Submit Rating
                    </>
                  )}
                </Button>
              </CardContent>
            </Card>
          </div>
        ) : (
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-base flex items-center gap-2">
                  <IconTruck className="h-5 w-5" />
                  Rate {driverName}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <StarRating
                  value={driverRating.overallRating}
                  onChange={(value) => handleStarClick(value, "driver")}
                  label="Overall Rating *"
                />

                <div className="space-y-2">
                  <Label htmlFor="driver-review">Review (Optional)</Label>
                  <Textarea
                    id="driver-review"
                    placeholder="Share your experience with this delivery person..."
                    value={driverRating.review}
                    onChange={(e) =>
                      setDriverRating((prev) => ({ ...prev, review: e.target.value }))
                    }
                    rows={3}
                  />
                </div>

                <Button
                  onClick={handleSubmitDriverRating}
                  disabled={driverRating.overallRating === 0 || isSubmitting}
                  className="w-full"
                >
                  {isSubmitting ? (
                    <>
                      <IconLoader2 className="mr-2 h-4 w-4 animate-spin" />
                      Submitting...
                    </>
                  ) : (
                    <>
                      <IconCheck className="mr-2 h-4 w-4" />
                      Submit Rating
                    </>
                  )}
                </Button>
              </CardContent>
            </Card>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
