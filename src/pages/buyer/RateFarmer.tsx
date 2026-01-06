import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import {
  IconStar,
  IconCheck,
  IconLoader2,
  IconUser,
  IconPackage,
  IconTruck,
  IconMessageCircle,
} from "@tabler/icons-react";
import { cn } from "@/lib/utils";

interface RatingForm {
  overallRating: number;
  qualityRating: number;
  deliveryRating: number;
  communicationRating: number;
  review: string;
}

interface RateFarmerProps {
  orderId: string;
  farmerName: string;
  farmerId: string;
  variety: string;
  quantity: number;
  onRatingSubmitted?: (rating: RatingForm) => void;
}

export function RateFarmer({
  orderId,
  farmerName,
  farmerId,
  variety,
  quantity,
  onRatingSubmitted,
}: RateFarmerProps) {
  const [rating, setRating] = useState<RatingForm>({
    overallRating: 0,
    qualityRating: 0,
    deliveryRating: 0,
    communicationRating: 0,
    review: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const handleStarClick = (category: keyof RatingForm, value: number) => {
    if (category === "review") return;
    setRating((prev) => ({ ...prev, [category]: value }));
  };

  const handleSubmit = async () => {
    if (rating.overallRating === 0) {
      alert("Please provide an overall rating");
      return;
    }

    setIsSubmitting(true);
    // TODO: Replace with actual API call
    setTimeout(() => {
      if (onRatingSubmitted) {
        onRatingSubmitted(rating);
      }
      setIsSubmitting(false);
      setSubmitted(true);
    }, 1500);
  };

  const StarRating = ({
    value,
    onChange,
    label,
    icon: Icon,
  }: {
    value: number;
    onChange: (value: number) => void;
    label: string;
    icon?: React.ComponentType<{ className?: string }>;
  }) => (
    <div className="space-y-2">
      <div className="flex items-center gap-2">
        {Icon && <Icon className="h-4 w-4 text-muted-foreground" />}
        <Label className="text-sm font-medium">{label}</Label>
      </div>
      <div className="flex gap-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <button
            key={star}
            type="button"
            onClick={() => onChange(star)}
            className="focus:outline-none"
          >
            <IconStar
              className={cn(
                "h-6 w-6 transition-colors",
                star <= value
                  ? "text-yellow-500 fill-yellow-500"
                  : "text-gray-300 hover:text-yellow-300"
              )}
            />
          </button>
        ))}
        {value > 0 && (
          <span className="ml-2 text-sm text-muted-foreground">{value}/5</span>
        )}
      </div>
    </div>
  );

  if (submitted) {
    return (
      <Card>
        <CardContent className="py-12 text-center">
          <div className="mx-auto mb-4 w-16 h-16 rounded-full bg-green-100 flex items-center justify-center">
            <IconCheck className="h-8 w-8 text-green-600" />
          </div>
          <h3 className="text-xl font-semibold mb-2">Thank You!</h3>
          <p className="text-muted-foreground">
            Your rating has been submitted successfully.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold">Rate Farmer</h1>
        <p className="text-sm sm:text-base text-muted-foreground mt-1">
          Share your experience with {farmerName}
        </p>
      </div>

      {/* Order Details */}
      <Card>
        <CardHeader>
          <CardTitle className="text-sm">Order Details</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Order ID:</span>
            <span className="font-medium">{orderId}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Farmer:</span>
            <span className="font-medium">{farmerName}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Variety:</span>
            <span className="font-medium">{variety}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Quantity:</span>
            <span className="font-medium">{quantity} kg</span>
          </div>
        </CardContent>
      </Card>

      {/* Rating Form */}
      <Card>
        <CardHeader>
          <CardTitle>Your Rating</CardTitle>
          <CardDescription>
            Help other buyers by sharing your experience
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Overall Rating */}
          <StarRating
            value={rating.overallRating}
            onChange={(value) => handleStarClick("overallRating", value)}
            label="Overall Rating"
            icon={IconStar}
          />

          {/* Detailed Ratings */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-4 border-t">
            <StarRating
              value={rating.qualityRating}
              onChange={(value) => handleStarClick("qualityRating", value)}
              label="Product Quality"
              icon={IconPackage}
            />
            <StarRating
              value={rating.deliveryRating}
              onChange={(value) => handleStarClick("deliveryRating", value)}
              label="Delivery Service"
              icon={IconTruck}
            />
            <StarRating
              value={rating.communicationRating}
              onChange={(value) => handleStarClick("communicationRating", value)}
              label="Communication"
              icon={IconMessageCircle}
            />
          </div>

          {/* Written Review */}
          <div className="space-y-2 pt-4 border-t">
            <Label htmlFor="review">Write a Review (Optional)</Label>
            <Textarea
              id="review"
              placeholder="Share your experience with this farmer..."
              value={rating.review}
              onChange={(e) => setRating((prev) => ({ ...prev, review: e.target.value }))}
              rows={4}
            />
            <p className="text-xs text-muted-foreground">
              Your review will be visible to other buyers
            </p>
          </div>

          {/* Submit Button */}
          <div className="pt-4 border-t">
            <Button
              onClick={handleSubmit}
              disabled={rating.overallRating === 0 || isSubmitting}
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
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
