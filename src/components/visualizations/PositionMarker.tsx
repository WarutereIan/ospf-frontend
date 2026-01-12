import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";

interface PositionMarkerProps {
  percentile: number;
  label?: string;
  title?: string;
  description?: string;
  className?: string;
}

export function PositionMarker({ percentile, label, title, description, className }: PositionMarkerProps) {
  // percentile is 0-100, where 0 is bottom and 100 is top
  // For display, we want to show position from left (0%) to right (100%)
  const position = 100 - percentile; // Invert so top performers are on the right

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
            
            {/* Position marker */}
            <div
              className="absolute top-0 bottom-0 w-0.5 bg-primary z-10"
              style={{ left: `${position}%` }}
            >
              <div className="absolute -top-1.5 left-1/2 transform -translate-x-1/2">
                <div className="w-0 h-0 border-l-[4px] border-r-[4px] border-t-[6px] border-l-transparent border-r-transparent border-t-primary" />
              </div>
            </div>
          </div>
          {label && (
            <p className="text-sm text-center text-muted-foreground">
              {label}
            </p>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
