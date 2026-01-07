import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  IconMapPin,
  IconStar,
  IconPackage,
  IconTrendingUp,
  IconCheck,
  IconSparkles,
} from "@tabler/icons-react";
import { cn } from "@/lib/utils";

interface MatchedFarmer {
  id: string;
  name: string;
  rating: number;
  variety: string;
  availableQuantity: number;
  pricePerKg: number;
  location: string;
  distance: number; // km
  responseTime: number; // minutes
  matchScore: number; // 0-100
  matchReasons: string[];
}

interface SmartMatchingProps {
  buyerRequirements: {
    variety: string;
    quantity: number;
    maxPrice?: number;
    preferredLocation?: string;
    maxDistance?: number;
  };
  onSelectFarmer?: (farmerId: string) => void;
}

export function SmartMatching({ buyerRequirements, onSelectFarmer }: SmartMatchingProps) {
  // Sample matched farmers - TODO: Replace with actual matching algorithm
  const matchedFarmers: MatchedFarmer[] = [
    {
      id: "F001",
      name: "James Mutua",
      rating: 4.8,
      variety: buyerRequirements.variety,
      availableQuantity: 800,
      pricePerKg: 145,
      location: "Kangundo",
      distance: 5.2,
      responseTime: 15,
      matchScore: 95,
      matchReasons: [
        "Close proximity (5.2 km)",
        "High rating (4.8 stars)",
        "Fast response time (15 min)",
        "Price competitive",
      ],
    },
    {
      id: "F002",
      name: "Mary Wanjiku",
      rating: 4.9,
      variety: buyerRequirements.variety,
      availableQuantity: 600,
      pricePerKg: 150,
      location: "Kathiani",
      distance: 12.5,
      responseTime: 8,
      matchScore: 88,
      matchReasons: [
        "Excellent rating (4.9 stars)",
        "Very fast response (8 min)",
        "Sufficient quantity available",
      ],
    },
    {
      id: "F003",
      name: "Peter Kamau",
      rating: 4.5,
      variety: buyerRequirements.variety,
      availableQuantity: 400,
      pricePerKg: 140,
      location: "Masinga",
      distance: 18.3,
      responseTime: 30,
      matchScore: 75,
      matchReasons: ["Best price (KES 140/kg)", "Good rating (4.5 stars)"],
    },
  ];

  const getMatchScoreColor = (score: number) => {
    if (score >= 90) return "bg-green-100 text-green-800";
    if (score >= 75) return "bg-blue-100 text-blue-800";
    if (score >= 60) return "bg-yellow-100 text-yellow-800";
    return "bg-gray-100 text-gray-800";
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center gap-2">
          <IconSparkles className="h-5 w-5 text-primary" />
          <CardTitle>Smart Matched Farmers</CardTitle>
        </div>
        <CardDescription>
          AI-powered recommendations based on your requirements
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {matchedFarmers.map((farmer) => (
          <Card key={farmer.id} className="border-l-4 border-l-primary">
            <CardContent className="p-4">
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1 space-y-3">
                  <div className="flex items-center gap-2">
                    <h4 className="font-semibold">{farmer.name}</h4>
                    <Badge variant="outline" className={getMatchScoreColor(farmer.matchScore)}>
                      {farmer.matchScore}% Match
                    </Badge>
                  </div>

                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-sm">
                    <div className="flex items-center gap-1">
                      <IconStar className="h-4 w-4 text-yellow-500 fill-yellow-500" />
                      <span className="font-medium">{farmer.rating}</span>
                    </div>
                    <div className="flex items-center gap-1 text-muted-foreground">
                      <IconMapPin className="h-4 w-4" />
                      <span>{farmer.distance} km</span>
                    </div>
                    <div className="flex items-center gap-1 text-muted-foreground">
                      <IconPackage className="h-4 w-4" />
                      <span>{farmer.availableQuantity} kg</span>
                    </div>
                    <div>
                      <span className="font-semibold">KES {farmer.pricePerKg}/kg</span>
                    </div>
                  </div>

                  {/* Match Reasons */}
                  <div className="space-y-1">
                    <p className="text-xs font-medium text-muted-foreground">Why this match:</p>
                    <div className="flex flex-wrap gap-1">
                      {farmer.matchReasons.map((reason, index) => (
                        <Badge key={index} variant="outline" className="text-xs">
                          <IconCheck className="h-3 w-3 mr-1" />
                          {reason}
                        </Badge>
                      ))}
                    </div>
                  </div>
                </div>

                <Button
                  onClick={() => onSelectFarmer && onSelectFarmer(farmer.id)}
                  className="shrink-0"
                >
                  Select
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}

        <div className="pt-2 border-t">
          <p className="text-xs text-muted-foreground text-center">
            Matching algorithm considers: location proximity, price competitiveness, farmer rating,
            response time, and quantity availability
          </p>
        </div>
      </CardContent>
    </Card>
  );
}

