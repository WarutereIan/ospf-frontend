import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import {
  IconSettings,
  IconBell,
  IconShield,
  IconDatabase,
  IconMail,
  IconCurrency,
  IconDeviceFloppy,
} from "@tabler/icons-react";
import { PushNotificationSettings } from "@/components/notifications/PushNotificationSettings";

export function Settings() {
  const [settings, setSettings] = useState({
    // Alert Settings
    priceSpikeThreshold: 20,
    stockOutAlert: true,
    qualityDropAlert: true,
    capacityAlert: 80,
    orderDelayAlert: true,
    delayThreshold: 24, // hours

    // System Settings
    platformFee: 2.0,
    autoReleasePayment: true,
    autoReleaseHours: 24,
    smsNotifications: true,
    emailNotifications: true,

    // Security Settings
    requireTwoFactor: false,
    sessionTimeout: 30, // minutes
    passwordPolicy: "medium", // low, medium, high
    auditLogRetention: 90, // days
  });

  const [hasChanges, setHasChanges] = useState(false);

  const getSettingValue = <T,>(key: string, defaultValue: T): T => {
    return (settings as unknown as Record<string, T>)[key] ?? defaultValue;
  };

  const handleSettingChange = (key: string, value: any) => {
    setSettings({ ...settings, [key]: value });
    setHasChanges(true);
  };

  const handleSave = () => {
    // TODO: Implement settings save
    console.log("Saving settings:", settings);
    setHasChanges(false);
    alert("Settings saved successfully!");
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold">System Settings</h1>
          <p className="text-sm sm:text-base text-muted-foreground mt-1">
            Configure system-wide settings and alert thresholds
          </p>
        </div>
        {hasChanges && (
          <Button onClick={handleSave}>
            <IconDeviceFloppy className="mr-2 h-4 w-4" />
            Save Changes
          </Button>
        )}
      </div>

      {/* Alert Settings */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <IconBell className="h-5 w-5" />
            <CardTitle>Alert Settings</CardTitle>
          </div>
          <CardDescription>Configure automated alerts for anomalies</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Price Spike Alert</Label>
                <p className="text-sm text-muted-foreground">
                  Alert when price increases by threshold percentage
                </p>
              </div>
              <div className="flex items-center gap-4">
                <Input
                  type="number"
                  className="w-24"
                  value={getSettingValue("priceSpikeThreshold", 20) as number}
                  onChange={(e) =>
                    handleSettingChange("priceSpikeThreshold", parseFloat(e.target.value))
                  }
                />
                <span className="text-sm">%</span>
              </div>
            </div>

            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Stock Out Alert</Label>
                <p className="text-sm text-muted-foreground">
                  Alert when aggregation center runs out of stock
                </p>
              </div>
              <Switch
                checked={settings.stockOutAlert}
                onCheckedChange={(checked) => handleSettingChange("stockOutAlert", checked)}
              />
            </div>

            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Quality Drop Alert</Label>
                <p className="text-sm text-muted-foreground">
                  Alert when average quality score drops significantly
                </p>
              </div>
              <Switch
                checked={getSettingValue("qualityDropAlert", true) as boolean}
                onCheckedChange={(checked) => handleSettingChange("qualityDropAlert", checked)}
              />
            </div>

            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Capacity Alert Threshold</Label>
                <p className="text-sm text-muted-foreground">
                  Alert when center capacity exceeds this percentage
                </p>
              </div>
              <div className="flex items-center gap-4">
                <Input
                  type="number"
                  className="w-24"
                  value={getSettingValue("capacityAlert", 80) as number}
                  onChange={(e) =>
                    handleSettingChange("capacityAlert", parseFloat(e.target.value))
                  }
                />
                <span className="text-sm">%</span>
              </div>
            </div>

            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Order Delay Alert</Label>
                <p className="text-sm text-muted-foreground">
                  Alert when order delivery is delayed beyond threshold
                </p>
              </div>
              <Switch
                checked={getSettingValue("orderDelayAlert", true) as boolean}
                onCheckedChange={(checked) => handleSettingChange("orderDelayAlert", checked)}
              />
            </div>

            {(getSettingValue("orderDelayAlert", true) as boolean) && (
              <div className="flex items-center justify-between pl-6">
                <div className="space-y-0.5">
                  <Label className="text-sm">Delay Threshold</Label>
                  <p className="text-xs text-muted-foreground">Hours after expected delivery</p>
                </div>
                <div className="flex items-center gap-4">
                  <Input
                    type="number"
                    className="w-24"
                    value={getSettingValue("delayThreshold", 24) as number}
                    onChange={(e) =>
                      handleSettingChange("delayThreshold", parseFloat(e.target.value))
                    }
                  />
                  <span className="text-sm">hours</span>
                </div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* System Settings */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <IconSettings className="h-5 w-5" />
            <CardTitle>System Settings</CardTitle>
          </div>
          <CardDescription>Configure platform-wide settings</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Platform Transaction Fee</Label>
                <p className="text-sm text-muted-foreground">
                  Percentage fee deducted from each transaction
                </p>
              </div>
              <div className="flex items-center gap-4">
                <Input
                  type="number"
                  step="0.1"
                  className="w-24"
                  value={getSettingValue("platformFee", 2.0) as number}
                  onChange={(e) =>
                    handleSettingChange("platformFee", parseFloat(e.target.value))
                  }
                />
                <span className="text-sm">%</span>
              </div>
            </div>

            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Auto-Release Payment</Label>
                <p className="text-sm text-muted-foreground">
                  Automatically release payment after delivery confirmation period
                </p>
              </div>
              <Switch
                checked={getSettingValue("autoReleasePayment", true) as boolean}
                onCheckedChange={(checked) => handleSettingChange("autoReleasePayment", checked)}
              />
            </div>

            {(getSettingValue("autoReleasePayment", true) as boolean) && (
              <div className="flex items-center justify-between pl-6">
                <div className="space-y-0.5">
                  <Label className="text-sm">Auto-Release After</Label>
                  <p className="text-xs text-muted-foreground">
                    Hours after delivery if no dispute
                  </p>
                </div>
                <div className="flex items-center gap-4">
                  <Input
                    type="number"
                    className="w-24"
                    value={getSettingValue("autoReleaseHours", 24) as number}
                    onChange={(e) =>
                      handleSettingChange("autoReleaseHours", parseFloat(e.target.value))
                    }
                  />
                  <span className="text-sm">hours</span>
                </div>
              </div>
            )}

            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>SMS Notifications</Label>
                <p className="text-sm text-muted-foreground">
                  Enable SMS notifications for order updates
                </p>
              </div>
              <Switch
                checked={getSettingValue("smsNotifications", true) as boolean}
                onCheckedChange={(checked) => handleSettingChange("smsNotifications", checked)}
              />
            </div>

            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Email Notifications</Label>
                <p className="text-sm text-muted-foreground">
                  Enable email notifications for important updates
                </p>
              </div>
              <Switch
                checked={getSettingValue("emailNotifications", true) as boolean}
                onCheckedChange={(checked) => handleSettingChange("emailNotifications", checked)}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Security Settings */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <IconShield className="h-5 w-5" />
            <CardTitle>Security Settings</CardTitle>
          </div>
          <CardDescription>Configure security and access control</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Require Two-Factor Authentication</Label>
                <p className="text-sm text-muted-foreground">
                  Force 2FA for all staff and officer accounts
                </p>
              </div>
              <Switch
                checked={getSettingValue("requireTwoFactor", false) as boolean}
                onCheckedChange={(checked) => handleSettingChange("requireTwoFactor", checked)}
              />
            </div>

            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Session Timeout</Label>
                <p className="text-sm text-muted-foreground">
                  Minutes of inactivity before automatic logout
                </p>
              </div>
              <div className="flex items-center gap-4">
                <Input
                  type="number"
                  className="w-24"
                  value={getSettingValue("sessionTimeout", 30) as number}
                  onChange={(e) =>
                    handleSettingChange("sessionTimeout", parseFloat(e.target.value))
                  }
                />
                <span className="text-sm">minutes</span>
              </div>
            </div>

            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Password Policy</Label>
                <p className="text-sm text-muted-foreground">
                  Minimum password strength requirement
                </p>
              </div>
              <Select
                value={getSettingValue("passwordPolicy", "medium") as string}
                onValueChange={(value) => handleSettingChange("passwordPolicy", value)}
              >
                <SelectTrigger className="w-[150px]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="low">Low</SelectItem>
                  <SelectItem value="medium">Medium</SelectItem>
                  <SelectItem value="high">High</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Audit Log Retention</Label>
                <p className="text-sm text-muted-foreground">
                  Days to retain audit logs for accountability
                </p>
              </div>
              <div className="flex items-center gap-4">
                <Input
                  type="number"
                  className="w-24"
                  value={getSettingValue("auditLogRetention", 90) as number}
                  onChange={(e) =>
                    handleSettingChange("auditLogRetention", parseFloat(e.target.value))
                  }
                />
                <span className="text-sm">days</span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Push Notification Settings */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <IconBell className="h-5 w-5" />
            <CardTitle>Push Notifications</CardTitle>
          </div>
          <CardDescription>Manage browser push notification preferences</CardDescription>
        </CardHeader>
        <CardContent>
          <PushNotificationSettings />
        </CardContent>
      </Card>
    </div>
  );
}
