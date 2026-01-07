import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  IconTrophy,
  IconStar,
  IconTrendingUp,
  IconPackage,
  IconClock,
  IconAward,
  IconCheck,
} from "@tabler/icons-react";
import { cn } from "@/lib/utils";

export type AchievementType =
  | "first_sale"
  | "hundred_kg"
  | "five_hundred_kg"
  | "thousand_kg"
  | "five_star"
  | "fast_responder"
  | "top_performer_monthly"
  | "top_performer_quarterly"
  | "consistent_seller"
  | "quality_champion";

interface Achievement {
  id: string;
  type: AchievementType;
  name: string;
  description: string;
  icon: React.ComponentType<{ className?: string }>;
  color: string;
  bgColor: string;
  earned: boolean;
  earnedDate?: string;
  progress?: number; // 0-100
  target?: number;
  current?: number;
}

const achievementConfig: Record<
  AchievementType,
  {
    name: string;
    description: string;
    icon: React.ComponentType<{ className?: string }>;
    color: string;
    bgColor: string;
  }
> = {
  first_sale: {
    name: "First Sale",
    description: "Made your first sale",
    icon: IconStar,
    color: "text-yellow-600",
    bgColor: "bg-yellow-100",
  },
  hundred_kg: {
    name: "100kg Milestone",
    description: "Sold 100kg of OFSP",
    icon: IconPackage,
    color: "text-blue-600",
    bgColor: "bg-blue-100",
  },
  five_hundred_kg: {
    name: "500kg Milestone",
    description: "Sold 500kg of OFSP",
    icon: IconTrendingUp,
    color: "text-green-600",
    bgColor: "bg-green-100",
  },
  thousand_kg: {
    name: "1000kg Milestone",
    description: "Sold 1000kg of OFSP",
    icon: IconTrophy,
    color: "text-purple-600",
    bgColor: "bg-purple-100",
  },
  five_star: {
    name: "5-Star Rating",
    description: "Achieved 5-star average rating",
    icon: IconStar,
    color: "text-yellow-600",
    bgColor: "bg-yellow-100",
  },
  fast_responder: {
    name: "Fast Responder",
    description: "Average response time under 15 minutes",
    icon: IconClock,
    color: "text-cyan-600",
    bgColor: "bg-cyan-100",
  },
  top_performer_monthly: {
    name: "Top Performer (Monthly)",
    description: "Top seller in your sub-county this month",
    icon: IconAward,
    color: "text-orange-600",
    bgColor: "bg-orange-100",
  },
  top_performer_quarterly: {
    name: "Top Performer (Quarterly)",
    description: "Top seller in your sub-county this quarter",
    icon: IconTrophy,
    color: "text-red-600",
    bgColor: "bg-red-100",
  },
  consistent_seller: {
    name: "Consistent Seller",
    description: "Active seller for 3 consecutive months",
    icon: IconTrendingUp,
    color: "text-indigo-600",
    bgColor: "bg-indigo-100",
  },
  quality_champion: {
    name: "Quality Champion",
    description: "90%+ Grade A produce for 3 months",
    icon: IconAward,
    color: "text-emerald-600",
    bgColor: "bg-emerald-100",
  },
};

interface AchievementBadgesProps {
  achievements: Achievement[];
  showProgress?: boolean;
  compact?: boolean;
}

export function AchievementBadges({
  achievements,
  showProgress = true,
  compact = false,
}: AchievementBadgesProps) {
  const earnedAchievements = achievements.filter((a) => a.earned);
  const inProgressAchievements = achievements.filter((a) => !a.earned && a.progress !== undefined);

  if (compact) {
    return (
      <div className="flex flex-wrap gap-2">
        {earnedAchievements.map((achievement) => {
          const config = achievementConfig[achievement.type];
          const Icon = config.icon;
          return (
            <Badge
              key={achievement.id}
              variant="outline"
              className={cn("flex items-center gap-1", config.bgColor, config.color)}
              title={config.description}
            >
              <Icon className="h-3 w-3" />
              {config.name}
            </Badge>
          );
        })}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Earned Achievements */}
      {earnedAchievements.length > 0 && (
        <div>
          <h3 className="text-lg font-semibold mb-4">Earned Achievements</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {earnedAchievements.map((achievement) => {
              const config = achievementConfig[achievement.type];
              const Icon = config.icon;
              return (
                <Card key={achievement.id} className={cn("border-2", config.bgColor)}>
                  <CardContent className="p-4">
                    <div className="flex items-start gap-3">
                      <div className={cn("p-2 rounded-lg", config.bgColor)}>
                        <Icon className={cn("h-5 w-5", config.color)} />
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center justify-between mb-1">
                          <h4 className="font-semibold">{config.name}</h4>
                          <IconCheck className="h-4 w-4 text-green-600" />
                        </div>
                        <p className="text-xs text-muted-foreground mb-2">{config.description}</p>
                        {achievement.earnedDate && (
                          <p className="text-xs text-muted-foreground">
                            Earned: {new Date(achievement.earnedDate).toLocaleDateString()}
                          </p>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>
      )}

      {/* In Progress Achievements */}
      {showProgress && inProgressAchievements.length > 0 && (
        <div>
          <h3 className="text-lg font-semibold mb-4">In Progress</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {inProgressAchievements.map((achievement) => {
              const config = achievementConfig[achievement.type];
              const Icon = config.icon;
              return (
                <Card key={achievement.id} className="opacity-75">
                  <CardContent className="p-4">
                    <div className="flex items-start gap-3">
                      <div className={cn("p-2 rounded-lg", config.bgColor, "opacity-50")}>
                        <Icon className={cn("h-5 w-5", config.color)} />
                      </div>
                      <div className="flex-1">
                        <h4 className="font-semibold mb-1">{config.name}</h4>
                        <p className="text-xs text-muted-foreground mb-2">{config.description}</p>
                        {achievement.progress !== undefined && (
                          <div className="space-y-1">
                            <div className="flex justify-between text-xs">
                              <span className="text-muted-foreground">Progress</span>
                              <span className="font-medium">{achievement.progress}%</span>
                            </div>
                            <div className="w-full bg-muted rounded-full h-2 overflow-hidden">
                              <div
                                className="h-full bg-primary transition-all"
                                style={{ width: `${achievement.progress}%` }}
                              />
                            </div>
                            {achievement.current !== undefined && achievement.target !== undefined && (
                              <p className="text-xs text-muted-foreground">
                                {achievement.current} / {achievement.target}
                              </p>
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}

