import { useState, useEffect, useCallback } from "react";
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
import { createTransportRequest } from "@/services/transportService";
import { LocationPicker } from "@/components/marketplace/LocationPicker";
import { showSuccess, showError } from "@/lib/toast";

interface RequestTransportProps {
  defaultType?: "produce_pickup" | "produce_delivery" | "input_delivery" | "order_delivery";
  defaultFrom?: string;
  defaultTo?: string;
  trigger?: React.ReactElement;
  orderId?: string; // Optional order ID to link transport request to order
  order?: { // Optional order details for auto-population
    quantity: number;
    variety: string;
    qualityGrade: string;
    aggregationCenter?: string;
    centerLocation?: string;
    deliveryLocation?: string;
    deliveryAddress?: string;
    deliveryCounty?: string;
  };
  open?: boolean; // Controlled open state
  onOpenChange?: (open: boolean) => void; // Callback when dialog open state changes
  onSuccess?: () => void; // Callback when transport request is successfully created
}

export default function RequestTransport({
  defaultType,
  defaultFrom,
  defaultTo,
  trigger,
  orderId,
  order,
  open: controlledOpen,
  onOpenChange,
  onSuccess,
}: RequestTransportProps) {
  const [internalOpen, setInternalOpen] = useState(false);
  const open = controlledOpen !== undefined ? controlledOpen : internalOpen;
  const setOpen = (value: boolean) => {
    if (controlledOpen === undefined) {
      setInternalOpen(value);
    }
    onOpenChange?.(value);
  };

  // Determine if this is an order-based request (simplified mode)
  const isOrderBased = !!orderId && !!order;

  // Auto-populate form data from order if available
  const getInitialFormData = useCallback(() => {
    if (isOrderBased && order) {
      // Auto-populate from order details
      const pickupLocation = order.aggregationCenter || order.centerLocation || defaultFrom || "";
      // Delivery location is NOT auto-populated - user must provide it when requesting transport later
      // Only use defaultTo if provided, otherwise leave empty for user to fill
      const deliveryLocation = defaultTo || "";
      const autoDescription = `${order.quantity} kg of ${order.variety} - Grade ${order.qualityGrade}`;
      
      return {
        type: "produce_delivery",
        from: pickupLocation,
        to: "", // Delivery location will come from LocationPicker
        weight: order.quantity.toString(),
        scheduledDate: "",
        scheduledTime: "",
        description: autoDescription,
        specialRequirements: "",
        deliveryCounty: "",
      };
    }
    
    // Default form data for manual requests
    return {
      type: defaultType || "",
      from: defaultFrom || "",
      to: defaultTo || "",
      weight: "",
      scheduledDate: "",
      scheduledTime: "",
      description: "",
      specialRequirements: "",
      deliveryCounty: "",
    };
  }, [isOrderBased, order, defaultFrom, defaultTo, defaultType]);

  const [formData, setFormData] = useState(getInitialFormData());
  const [deliveryAddress, setDeliveryAddress] = useState("");
  const [deliveryCoordinates, setDeliveryCoordinates] = useState<string | undefined>(undefined);
  const [deliveryCounty, setDeliveryCounty] = useState("");

  // Reset form when order changes or dialog opens
  useEffect(() => {
    if (open) {
      setFormData(getInitialFormData());
      // Reset delivery address fields for order-based requests
      if (isOrderBased) {
        setDeliveryAddress("");
        setDeliveryCoordinates(undefined);
        setDeliveryCounty("");
      }
    }
  }, [open, getInitialFormData, isOrderBased]);

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

  const handleSubmit = async () => {
    // Validate form
    if (!isOrderBased && (!formData.type || !formData.from || !formData.to || !formData.weight)) {
      showError("Validation Error", "Please fill in all required fields");
      return;
    }
    
    // For order-based requests, only delivery address and county are required
    if (isOrderBased) {
      if (!deliveryAddress || !deliveryCounty) {
        if (!deliveryAddress) {
          showError("Validation Error", "Please provide a delivery address");
          return;
        }
        if (!deliveryCounty) {
          showError("Validation Error", "Please select a delivery county");
          return;
        }
      }
    }

    try {
      // Extract county from location
      let pickupCounty: string;
      let finalDeliveryCounty: string;
      let deliveryLocation: string;
      let pickupLocation: string;
      let weight: number;
      let description: string;
      
      if (isOrderBased && order) {
        // For order-based requests, use order details and form inputs
        pickupLocation = order.aggregationCenter || order.centerLocation || formData.from || "Aggregation Center";
        pickupCounty = "Machakos"; // Pickup is always from aggregation center (Machakos)
        deliveryLocation = deliveryAddress; // Use the address from LocationPicker
        finalDeliveryCounty = deliveryCounty; // Use the selected county
        weight = order.quantity;
        description = `${order.quantity} kg of ${order.variety} - Grade ${order.qualityGrade}`;
      } else {
        // For manual requests, use form data
        // Try to find in aggregation centers first
        const pickupCenter = allAggregationCenters.find(c => c.value === formData.from || c.label === formData.from);
        const deliveryCenter = allAggregationCenters.find(c => c.value === formData.to || c.label === formData.to);
        
        // Default to Machakos for aggregation centers, otherwise try to detect from location string
        pickupCounty = pickupCenter ? "Machakos" :
                      (formData.from.includes("Machakos") ? "Machakos" : 
                       formData.from.includes("Nairobi") ? "Nairobi" : 
                       formData.from.includes("Kitui") ? "Kitui" : "Machakos");
        
        finalDeliveryCounty = deliveryCenter ? "Machakos" :
                        (formData.to.includes("Machakos") ? "Machakos" : 
                         formData.to.includes("Nairobi") ? "Nairobi" : 
                         formData.to.includes("Kitui") ? "Kitui" : "Machakos");
        
        pickupLocation = formData.from;
        deliveryLocation = formData.to;
        weight = parseFloat(formData.weight);
        description = formData.description || `Transport request for ${formData.weight} kg`;
      }

      // Create transport request
      const result = await createTransportRequest({
        type: isOrderBased ? "order_delivery" : (formData.type as "produce_pickup" | "produce_delivery" | "input_delivery"),
        pickupLocation,
        pickupCounty,
        deliveryLocation,
        deliveryCounty: finalDeliveryCounty,
        deliveryCoordinates: isOrderBased ? deliveryCoordinates : undefined,
        weight,
        requestedPickupDate: formData.scheduledDate ? `${formData.scheduledDate}T${formData.scheduledTime || "09:00"}:00` : undefined,
        description,
        specialInstructions: isOrderBased ? undefined : formData.specialRequirements,
        orderId,
        requesterType: "buyer",
      });

      if (result.error) {
        showError("Failed to Create Transport Request", result.error);
      } else {
        showSuccess("Transport Request Created", "Transport providers will be notified");
        setOpen(false);
        onSuccess?.();
        
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
          deliveryCounty: "",
        });
        if (isOrderBased) {
          setDeliveryAddress("");
          setDeliveryCoordinates(undefined);
          setDeliveryCounty("");
        }
      }
    } catch (error) {
      showError("Failed to Create Transport Request", error instanceof Error ? error.message : "An error occurred");
    }
  };

  const defaultTrigger = (
    <Button>
      <IconTruck className="mr-2 h-4 w-4" />
      Request Transport
    </Button>
  );

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      {trigger && (
        <DialogTrigger render={trigger} />
      )}
      <DialogContent className={isOrderBased ? "max-w-md" : "max-w-2xl max-h-[90vh] overflow-y-auto"}>
        <DialogHeader>
          <DialogTitle>Request Transport Service</DialogTitle>
          <DialogDescription>
            {isOrderBased 
              ? "Provide delivery details for your order"
              : "Fill in the details below to request transport for your produce or inputs"
            }
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4">
          {/* Simplified form for order-based requests - only Delivery Address and County */}
          {isOrderBased ? (
            <>
              <LocationPicker
                address={deliveryAddress}
                coordinates={deliveryCoordinates}
                onAddressChange={setDeliveryAddress}
                onCoordinatesChange={setDeliveryCoordinates}
                label="Delivery Address"
                required={true}
              />
              <div>
                <Label className="text-sm font-medium mb-2 block">Delivery County *</Label>
                <Select 
                  value={deliveryCounty} 
                  onValueChange={setDeliveryCounty}
                >
                  <SelectTrigger>
                    <SelectValue>{deliveryCounty ? undefined : "Select county"}</SelectValue>
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="machakos">Machakos</SelectItem>
                    <SelectItem value="nairobi">Nairobi</SelectItem>
                    <SelectItem value="kiambu">Kiambu</SelectItem>
                    <SelectItem value="kajiado">Kajiado</SelectItem>
                    <SelectItem value="makueni">Makueni</SelectItem>
                    <SelectItem value="other">Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </>
          ) : (
            <>
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
            </>
          )}

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

