import { useState } from "react";
import { FarmerDashboard } from "@/pages/dashboard/FarmerDashboard";
import { PeerLeaderboard } from "@/pages/farmer/PeerLeaderboard";
import { MarketInfo } from "@/pages/farmer/MarketInfo";
import { cn } from "@/lib/utils";
import {
  IconChartBar,
  IconTrophy,
  IconInfoCircle,
} from "@tabler/icons-react";

type AnalyticsTab = "dashboard" | "leaderboard" | "market-info";

export function Analytics() {
  const [activeTab, setActiveTab] = useState<AnalyticsTab>("dashboard");

  const tabs = [
    {
      id: "dashboard" as const,
      label: "Dashboard",
      icon: IconChartBar,
    },
    {
      id: "leaderboard" as const,
      label: "Leaderboard",
      icon: IconTrophy,
    },
    {
      id: "market-info" as const,
      label: "Market Info",
      icon: IconInfoCircle,
    },
  ];

  return (
    <div className="space-y-6">
      {/* Tabs */}
      <div className="flex gap-2 border-b">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={cn(
                "px-4 py-2 text-sm font-medium border-b-2 transition-colors flex items-center gap-2",
                activeTab === tab.id
                  ? "border-primary text-primary"
                  : "border-transparent text-muted-foreground hover:text-foreground"
              )}
            >
              <Icon className="h-4 w-4" />
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* Tab Content */}
      <div>
        {activeTab === "dashboard" && <FarmerDashboard />}
        {activeTab === "leaderboard" && <PeerLeaderboard />}
        {activeTab === "market-info" && <MarketInfo />}
      </div>
    </div>
  );
}
