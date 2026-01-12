import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";

interface PriceDistributionBarProps {
  minPrice: number;
  maxPrice: number;
  mostCommonPrice?: number;
  title?: string;
  description?: string;
  className?: string;
}

export function PriceDistributionBar({
  minPrice,
  maxPrice,
  mostCommonPrice,
  title,
  description,
  className,
}: PriceDistributionBarProps) {
  const range = maxPrice - minPrice;
  const markerPosition = mostCommonPrice
    ? ((mostCommonPrice - minPrice) / range) * 100
    : 50;

  return (
    <Card className={className}>
      {title && (
        <CardHeader>
          <CardTitle>{title}</CardTitle>
          {description && <CardDescription>{description}</CardDescription>}
        </CardHeader>
      )}
      <CardContent>
        <div className="space-y-4">
          <div className="relative w-full h-6 bg-muted rounded-full overflow-hidden">
            {/* Background gradient */}
            <div className="absolute inset-0 bg-gradient-to-r from-gray-200 via-gray-300 to-gray-200" />
            
            {/* Distribution fill (showing most common range) */}
            <div
              className="absolute left-0 top-0 bottom-0 bg-primary/30"
              style={{
                width: `${Math.min(markerPosition + 10, 100)}%`,
                left: `${Math.max(markerPosition - 10, 0)}%`,
              }}
            />
            
            {/* Most common price marker */}
            {mostCommonPrice && (
              <div
                className="absolute top-0 bottom-0 w-0.5 bg-primary z-10"
                style={{ left: `${markerPosition}%` }}
              >
                <div className="absolute -top-1.5 left-1/2 transform -translate-x-1/2">
                  <div className="w-0 h-0 border-l-[4px] border-r-[4px] border-t-[6px] border-l-transparent border-r-transparent border-t-primary" />
                </div>
              </div>
            )}
          </div>
          <div className="flex justify-between items-center text-sm">
            <span className="text-muted-foreground">
              KES {minPrice} - {maxPrice}/kg
            </span>
            {mostCommonPrice && (
              <span className="text-muted-foreground">
                ▲ Most listings
              </span>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
