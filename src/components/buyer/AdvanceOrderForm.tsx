import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Field, FieldGroup, FieldLabel } from "@/components/ui/field";
import { IconCalendar, IconPackage, IconMapPin } from "@tabler/icons-react";
import { useState } from "react";

interface AdvanceOrderFormProps {
  onSubmit: (order: AdvanceOrderData) => void;
  onCancel?: () => void;
}

export interface AdvanceOrderData {
  variety: string;
  qualityGrade: string;
  quantity: number;
  deliveryLocation: string;
  deliveryDate: string;
  deliveryTime?: string;
  notes?: string;
  preferredPrice?: number;
}

const ofspVarieties = [
  { value: "kenya", label: "Kenya" },
  { value: "spk004", label: "SPK004" },
  { value: "kabode", label: "Kabode" },
];

const qualityGrades = [
  { value: "A", label: "Grade A - Premium" },
  { value: "B", label: "Grade B - Standard" },
  { value: "C", label: "Grade C - Processing" },
];

export function AdvanceOrderForm({ onSubmit, onCancel }: AdvanceOrderFormProps) {
  const [formData, setFormData] = useState<AdvanceOrderData>({
    variety: "",
    qualityGrade: "",
    quantity: 0,
    deliveryLocation: "",
    deliveryDate: "",
    deliveryTime: "",
    notes: "",
    preferredPrice: undefined,
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (formData.variety && formData.qualityGrade && formData.quantity > 0 && formData.deliveryLocation && formData.deliveryDate) {
      onSubmit(formData);
    }
  };

  const minDate = new Date().toISOString().split("T")[0];

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <IconCalendar className="h-5 w-5" />
          Place Advance Order
        </CardTitle>
        <CardDescription>
          Specify volume, grade, and delivery timeline for your order
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <FieldGroup>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Field>
                <FieldLabel htmlFor="variety">OFSP Variety *</FieldLabel>
                <Select
                  value={formData.variety}
                  onValueChange={(value) => setFormData({ ...formData, variety: value || "" })}
                >
                  <SelectTrigger id="variety">
                    <SelectValue placeholder="Select variety" />
                  </SelectTrigger>
                  <SelectContent>
                    {ofspVarieties.map((variety) => (
                      <SelectItem key={variety.value} value={variety.value}>
                        {variety.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </Field>

              <Field>
                <FieldLabel htmlFor="qualityGrade">Quality Grade *</FieldLabel>
                <Select
                  value={formData.qualityGrade}
                  onValueChange={(value) => setFormData({ ...formData, qualityGrade: value || "" })}
                >
                  <SelectTrigger id="qualityGrade">
                    <SelectValue placeholder="Select grade" />
                  </SelectTrigger>
                  <SelectContent>
                    {qualityGrades.map((grade) => (
                      <SelectItem key={grade.value} value={grade.value}>
                        {grade.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </Field>
            </div>

            <Field>
              <FieldLabel htmlFor="quantity">Volume (kg) *</FieldLabel>
              <Input
                id="quantity"
                type="number"
                placeholder="e.g. 500"
                value={formData.quantity || ""}
                onChange={(e) => setFormData({ ...formData, quantity: parseInt(e.target.value) || 0 })}
                min="1"
                required
              />
            </Field>

            <Field>
              <FieldLabel htmlFor="deliveryLocation">Delivery Location (Aggregation Centre) *</FieldLabel>
              <Select
                value={formData.deliveryLocation}
                onValueChange={(value) => setFormData({ ...formData, deliveryLocation: value || "" })}
              >
                <SelectTrigger id="deliveryLocation">
                  <SelectValue placeholder="Select aggregation centre" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="kangundo-main">Kangundo Main Aggregation Center</SelectItem>
                  <SelectItem value="kathiani-main">Kathiani Main Aggregation Center</SelectItem>
                  <SelectItem value="masinga-main">Masinga Main Aggregation Center</SelectItem>
                  <SelectItem value="yatta-main">Yatta Main Aggregation Center</SelectItem>
                  <SelectItem value="tala-satellite">Tala Satellite Center</SelectItem>
                  <SelectItem value="mitaboni-satellite">Mitaboni Satellite Center</SelectItem>
                </SelectContent>
              </Select>
            </Field>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Field>
                <FieldLabel htmlFor="deliveryDate">Delivery Date *</FieldLabel>
                <Input
                  id="deliveryDate"
                  type="date"
                  value={formData.deliveryDate}
                  onChange={(e) => setFormData({ ...formData, deliveryDate: e.target.value })}
                  min={minDate}
                  required
                />
              </Field>

              <Field>
                <FieldLabel htmlFor="deliveryTime">Preferred Time (Optional)</FieldLabel>
                <Input
                  id="deliveryTime"
                  type="time"
                  value={formData.deliveryTime}
                  onChange={(e) => setFormData({ ...formData, deliveryTime: e.target.value })}
                />
              </Field>
            </div>

            <Field>
              <FieldLabel htmlFor="preferredPrice">Preferred Price per kg (KES) - Optional</FieldLabel>
              <Input
                id="preferredPrice"
                type="number"
                placeholder="e.g. 150"
                value={formData.preferredPrice || ""}
                onChange={(e) => setFormData({ ...formData, preferredPrice: parseFloat(e.target.value) || undefined })}
                min="0"
                step="0.01"
              />
              <p className="text-xs text-muted-foreground mt-1">
                Leave blank to accept market price
              </p>
            </Field>

            <Field>
              <FieldLabel htmlFor="notes">Additional Notes (Optional)</FieldLabel>
              <Textarea
                id="notes"
                placeholder="Any special requirements or instructions..."
                value={formData.notes}
                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                rows={3}
              />
            </Field>
          </FieldGroup>

          <div className="flex gap-2 justify-end">
            {onCancel && (
              <Button type="button" variant="outline" onClick={onCancel}>
                Cancel
              </Button>
            )}
            <Button type="submit">
              Place Advance Order
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}

