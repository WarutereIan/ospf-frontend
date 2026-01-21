import { useState } from "react";
import { PickupSchedules } from "./PickupSchedules";
import { MyPickupBookings } from "./MyPickupBookings";
import { Button } from "@/components/ui/button";
import { IconTruck, IconCalendar } from "@tabler/icons-react";
import { cn } from "@/lib/utils";

type TabType = "schedules" | "bookings";

export function PickupManagement() {
  const [activeTab, setActiveTab] = useState<TabType>("schedules");

  const tabs = [
    {
      id: "schedules" as TabType,
      label: "Available Schedules",
      icon: IconTruck,
    },
    {
      id: "bookings" as TabType,
      label: "My Bookings",
      icon: IconCalendar,
    },
  ];

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      {/* Tab Navigation */}
      <div className="border-b border-stone-200">
        <div className="flex gap-2">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            return (
              <Button
                key={tab.id}
                variant="ghost"
                onClick={() => setActiveTab(tab.id)}
                className={cn(
                  "rounded-none border-b-2 border-transparent -mb-px",
                  activeTab === tab.id
                    ? "border-primary text-primary font-semibold"
                    : "text-stone-600 hover:text-stone-900"
                )}
              >
                <Icon className="mr-2 h-4 w-4" />
                {tab.label}
              </Button>
            );
          })}
        </div>
      </div>

      {/* Tab Content */}
      <div>
        {activeTab === "schedules" && <PickupSchedules />}
        {activeTab === "bookings" && <MyPickupBookings />}
      </div>
    </div>
  );
}
