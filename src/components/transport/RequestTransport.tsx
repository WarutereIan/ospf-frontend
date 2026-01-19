import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { IconTruck, IconCalendar, IconMapPin, IconWeight } from "@tabler/icons-react";
import { allAggregationCenters } from "@/data/aggregationCenters";

interface RequestTransportProps {
  defaultType?: "produce_pickup" | "produce_delivery" | "input_delivery";
  defaultFrom?: string;
  defaultTo?: string;
  trigger?: React.ReactNode;
}

export default function RequestTransport({
  defaultType,
  defaultFrom,
  defaultTo,
  trigger,
}: RequestTransportProps) {
  const [open, setOpen] = useState(false);
  const [formData, setFormData] = useState({
    type: defaultType || "",
    from: defaultFrom || "",
    to: defaultTo || "",
    weight: "",
    scheduledDate: "",
    scheduledTime: "",
    description: "",
    specialRequirements: "",
  });

  const transportTypes = [
    { value: "produce_pickup", label: "Produce Pickup (Farm to Centre)" },
    { value: "produce_delivery", label: "Produce Delivery (Centre to Market)" },
    { value: "input_delivery", label: "Input Delivery" },
  ];

  // Combine aggregation centers with common market locations
  const centerLocations = allAggregationCenters.map((center) => ({
    value: center.value,
    label: center.label,
    type: center.type,
    location: center.type === "main" 
      ? `${center.subCounty} Subcounty`
      : `${center.ward} Ward, ${center.subCounty}`,
  }));

  const marketLocations = [
    { value: "Nairobi Wholesale Market", label: "Nairobi Wholesale Market", type: "market" },
    { value: "Machakos Town Market", label: "Machakos Town Market", type: "market" },
    { value: "Kitui Market", label: "Kitui Market", type: "market" },
  ];

  const allLocations = [...centerLocations, ...marketLocations];

  const handleSubmit = () => {
    // Validate form
    if (!formData.type || !formData.from || !formData.to || !formData.weight) {
      alert("Please fill in all required fields");
      return;
    }

    // Submit transport request
    console.log("Transport request:", formData);
    alert("Transport request submitted successfully! Providers will be notified.");
    setOpen(false);
    
    // Reset form
    setFormData({
      type: defaultType || "",
      from: defaultFrom || "",
      to: defaultTo || "",
      weight: "",
      scheduledDate: "",
      scheduledTime: "",
      description: "",
      specialRequirements: "",
    });
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger>
        {trigger || (
          <Button>
            <IconTruck className="mr-2 h-4 w-4" />
            Request Transport
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Request Transport Service</DialogTitle>
          <DialogDescription>
            Fill in the details below to request transport for your produce or inputs
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4">
          {/* Transport Type */}
          <div className="space-y-2">
            <Label htmlFor="type">Transport Type *</Label>
            <Select
              value={formData.type}
              onValueChange={(value) => setFormData({ ...formData, type: value })}
            >
              <SelectTrigger id="type">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {transportTypes.map((type) => (
                  <SelectItem key={type.value} value={type.value}>
                    {type.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* From Location */}
          <div className="space-y-2">
            <Label htmlFor="from" className="flex items-center gap-2">
              <IconMapPin className="h-4 w-4" />
              Pickup Location *
            </Label>
            <Select
              value={formData.from}
              onValueChange={(value) => setFormData({ ...formData, from: value })}
            >
              <SelectTrigger id="from">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="my_location">My Current Location</SelectItem>
                {centerLocations.map((location) => (
                  <SelectItem key={location.value} value={location.value}>
                    {location.type === "main" ? "🏢" : "🏪"} {location.label} ({location.location})
                  </SelectItem>
                ))}
                {marketLocations.map((location) => (
                  <SelectItem key={location.value} value={location.value}>
                    🏬 {location.label}
                  </SelectItem>
                ))}
                <SelectItem value="custom">Enter Custom Location</SelectItem>
              </SelectContent>
            </Select>
            {formData.from === "custom" && (
              <Input
                placeholder="Enter custom pickup location"
                onChange={(e) => setFormData({ ...formData, from: e.target.value })}
              />
            )}
          </div>

          {/* To Location */}
          <div className="space-y-2">
            <Label htmlFor="to" className="flex items-center gap-2">
              <IconMapPin className="h-4 w-4" />
              Delivery Location *
            </Label>
            <Select
              value={formData.to}
              onValueChange={(value) => setFormData({ ...formData, to: value })}
            >
              <SelectTrigger id="to">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {centerLocations.map((location) => (
                  <SelectItem key={location.value} value={location.value}>
                    {location.type === "main" ? "🏢" : "🏪"} {location.label} ({location.location})
                  </SelectItem>
                ))}
                {marketLocations.map((location) => (
                  <SelectItem key={location.value} value={location.value}>
                    🏬 {location.label}
                  </SelectItem>
                ))}
                <SelectItem value="custom">Enter Custom Location</SelectItem>
              </SelectContent>
            </Select>
            {formData.to === "custom" && (
              <Input
                placeholder="Enter custom delivery location"
                onChange={(e) => setFormData({ ...formData, to: e.target.value })}
              />
            )}
          </div>

          {/* Weight */}
          <div className="space-y-2">
            <Label htmlFor="weight" className="flex items-center gap-2">
              <IconWeight className="h-4 w-4" />
              Estimated Weight (kg) *
            </Label>
            <Input
              id="weight"
              type="number"
              value={formData.weight}
              onChange={(e) => setFormData({ ...formData, weight: e.target.value })}
              placeholder="Enter weight in kilograms"
            />
          </div>

          {/* Scheduled Date & Time */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="date" className="flex items-center gap-2">
                <IconCalendar className="h-4 w-4" />
                Preferred Date
              </Label>
              <Input
                id="date"
                type="date"
                value={formData.scheduledDate}
                onChange={(e) => setFormData({ ...formData, scheduledDate: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="time">Preferred Time</Label>
              <Input
                id="time"
                type="time"
                value={formData.scheduledTime}
                onChange={(e) => setFormData({ ...formData, scheduledTime: e.target.value })}
              />
            </div>
          </div>

          {/* Description */}
          <div className="space-y-2">
            <Label htmlFor="description">Load Description *</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="e.g., 250kg of Grade A OFSP, packed in bags"
              rows={2}
            />
          </div>

          {/* Special Requirements */}
          <div className="space-y-2">
            <Label htmlFor="requirements">Special Requirements</Label>
            <Textarea
              id="requirements"
              value={formData.specialRequirements}
              onChange={(e) => setFormData({ ...formData, specialRequirements: e.target.value })}
              placeholder="e.g., Refrigerated transport required, fragile items"
              rows={2}
            />
          </div>

          {/* Estimated Cost */}
          <div className="p-4 border rounded-lg bg-accent/50">
            <div className="flex justify-between items-center">
              <span className="text-sm text-muted-foreground">Estimated Cost:</span>
              <span className="text-lg font-bold">KES 500 - 1,500</span>
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              Actual cost will be determined by transport providers based on distance and weight
            </p>
          </div>

          {/* Actions */}
          <div className="flex gap-2 pt-4">
            <Button variant="outline" onClick={() => setOpen(false)} className="flex-1">
              Cancel
            </Button>
            <Button onClick={handleSubmit} className="flex-1">
              <IconTruck className="mr-2 h-4 w-4" />
              Submit Request
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

