import { IconAlertCircle, IconAlertTriangle, IconInfoCircle, IconCircleCheck } from "@tabler/icons-react";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";

interface AlertCardProps {
  type: "success" | "warning" | "error" | "info";
  title: string;
  message?: string;
  action?: React.ReactNode;
  className?: string;
}

const alertConfig = {
  success: {
    icon: IconCircleCheck,
    bg: "bg-green-50",
    border: "border-green-200",
    iconColor: "text-green-600",
    titleColor: "text-green-900",
    messageColor: "text-green-700",
  },
  warning: {
    icon: IconAlertTriangle,
    bg: "bg-yellow-50",
    border: "border-yellow-200",
    iconColor: "text-yellow-600",
    titleColor: "text-yellow-900",
    messageColor: "text-yellow-700",
  },
  error: {
    icon: IconAlertCircle,
    bg: "bg-red-50",
    border: "border-red-200",
    iconColor: "text-red-600",
    titleColor: "text-red-900",
    messageColor: "text-red-700",
  },
  info: {
    icon: IconInfoCircle,
    bg: "bg-blue-50",
    border: "border-blue-200",
    iconColor: "text-blue-600",
    titleColor: "text-blue-900",
    messageColor: "text-blue-700",
  },
};

export function AlertCard({ type, title, message, action, className }: AlertCardProps) {
  const config = alertConfig[type];
  const Icon = config.icon;

  return (
    <Card className={cn("border", config.bg, config.border, className)}>
      <CardContent className="p-4">
        <div className="flex items-start gap-3">
          <Icon className={cn("h-5 w-5 mt-0.5 flex-shrink-0", config.iconColor)} />
          <div className="flex-1 min-w-0">
            <h4 className={cn("font-medium", config.titleColor)}>{title}</h4>
            {message && <p className={cn("text-sm mt-1", config.messageColor)}>{message}</p>}
          </div>
          {action && <div className="flex-shrink-0">{action}</div>}
        </div>
      </CardContent>
    </Card>
  );
}
