import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
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
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { IconEdit, IconTrash, IconPlus, IconSeeding } from "@tabler/icons-react";

interface Input {
  id: string;
  name: string;
  category: string;
  description: string;
  price: number;
  unit: string;
  stock: number;
  minStock: number;
  status: "available" | "low_stock" | "out_of_stock";
  image?: string;
}

export default function InputManagement() {
  const [inputs, setInputs] = useState<Input[]>([
    {
      id: "1",
      name: "OFSP Vines (Kenya)",
      category: "Planting Material",
      description: "High-quality Kenya variety OFSP vines for planting",
      price: 30,
      unit: "cutting",
      stock: 500,
      minStock: 200,
      status: "available",
    },
    {
      id: "2",
      name: "NPK Fertilizer",
      category: "Fertilizer",
      description: "Balanced NPK fertilizer for optimal growth",
      price: 150,
      unit: "kg",
      stock: 50,
      minStock: 100,
      status: "low_stock",
    },
    {
      id: "3",
      name: "Organic Compost",
      category: "Soil Amendment",
      description: "Rich organic compost for soil enrichment",
      price: 80,
      unit: "kg",
      stock: 0,
      minStock: 50,
      status: "out_of_stock",
    },
  ]);

  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingInput, setEditingInput] = useState<Input | null>(null);

  const [formData, setFormData] = useState({
    name: "",
    category: "",
    description: "",
    price: "",
    unit: "",
    stock: "",
    minStock: "",
  });

  const categories = [
    "Planting Material",
    "Fertilizer",
    "Soil Amendment",
    "Pesticide",
    "Tools & Equipment",
    "Training Materials",
  ];

  const units = ["cutting", "kg", "liter", "piece", "book", "bundle"];

  const handleAddInput = () => {
    setEditingInput(null);
    setFormData({
      name: "",
      category: "",
      description: "",
      price: "",
      unit: "",
      stock: "",
      minStock: "",
    });
    setDialogOpen(true);
  };

  const handleEditInput = (input: Input) => {
    setEditingInput(input);
    setFormData({
      name: input.name,
      category: input.category,
      description: input.description,
      price: input.price.toString(),
      unit: input.unit,
      stock: input.stock.toString(),
      minStock: input.minStock.toString(),
    });
    setDialogOpen(true);
  };

  const handleSaveInput = () => {
    const newInput: Input = {
      id: editingInput?.id || Date.now().toString(),
      name: formData.name,
      category: formData.category,
      description: formData.description,
      price: parseFloat(formData.price),
      unit: formData.unit,
      stock: parseInt(formData.stock),
      minStock: parseInt(formData.minStock),
      status:
        parseInt(formData.stock) === 0
          ? "out_of_stock"
          : parseInt(formData.stock) < parseInt(formData.minStock)
          ? "low_stock"
          : "available",
    };

    if (editingInput) {
      setInputs(inputs.map((i) => (i.id === editingInput.id ? newInput : i)));
    } else {
      setInputs([...inputs, newInput]);
    }

    setDialogOpen(false);
  };

  const handleDeleteInput = (id: string) => {
    if (confirm("Are you sure you want to delete this input?")) {
      setInputs(inputs.filter((i) => i.id !== id));
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "available":
        return <Badge className="bg-success text-success-foreground">Available</Badge>;
      case "low_stock":
        return <Badge className="bg-warning text-warning-foreground">Low Stock</Badge>;
      case "out_of_stock":
        return <Badge className="bg-destructive text-destructive-foreground">Out of Stock</Badge>;
      default:
        return null;
    }
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Input Management</h1>
          <p className="text-muted-foreground mt-1">
            Manage your agricultural inputs and inventory
          </p>
        </div>
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger>
            <Button onClick={handleAddInput}>
              <IconPlus className="mr-2 h-4 w-4" />
              Add New Input
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>
                {editingInput ? "Edit Input" : "Add New Input"}
              </DialogTitle>
              <DialogDescription>
                {editingInput
                  ? "Update the input details"
                  : "Add a new agricultural input to your inventory"}
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Input Name *</Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) =>
                      setFormData({ ...formData, name: e.target.value })
                    }
                    placeholder="e.g., OFSP Vines (Kenya)"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="category">Category *</Label>
                  <Select
                    value={formData.category}
                    onValueChange={(value) =>
                      setFormData({ ...formData, category: value })
                    }
                  >
                    <SelectTrigger id="category">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {categories.map((cat) => (
                        <SelectItem key={cat} value={cat}>
                          {cat}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Description *</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) =>
                    setFormData({ ...formData, description: e.target.value })
                  }
                  placeholder="Describe the input..."
                  rows={3}
                />
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="price">Price (KES) *</Label>
                  <Input
                    id="price"
                    type="number"
                    value={formData.price}
                    onChange={(e) =>
                      setFormData({ ...formData, price: e.target.value })
                    }
                    placeholder="0.00"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="unit">Unit *</Label>
                  <Select
                    value={formData.unit}
                    onValueChange={(value) =>
                      setFormData({ ...formData, unit: value })
                    }
                  >
                    <SelectTrigger id="unit">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {units.map((unit) => (
                        <SelectItem key={unit} value={unit}>
                          {unit}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="stock">Current Stock *</Label>
                  <Input
                    id="stock"
                    type="number"
                    value={formData.stock}
                    onChange={(e) =>
                      setFormData({ ...formData, stock: e.target.value })
                    }
                    placeholder="0"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="minStock">Minimum Stock Level *</Label>
                <Input
                  id="minStock"
                  type="number"
                  value={formData.minStock}
                  onChange={(e) =>
                    setFormData({ ...formData, minStock: e.target.value })
                  }
                  placeholder="0"
                />
              </div>

              <div className="flex justify-end gap-2 mt-6">
                <Button variant="outline" onClick={() => setDialogOpen(false)}>
                  Cancel
                </Button>
                <Button onClick={handleSaveInput}>
                  {editingInput ? "Update Input" : "Add Input"}
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Inputs Table */}
      <Card>
        <CardHeader>
          <CardTitle>Your Inputs</CardTitle>
          <CardDescription>
            Showing {inputs.length} input{inputs.length !== 1 ? "s" : ""}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Category</TableHead>
                <TableHead>Price</TableHead>
                <TableHead>Stock</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {inputs.map((input) => (
                <TableRow key={input.id}>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <IconSeeding className="h-4 w-4 text-muted-foreground" />
                      <div>
                        <div className="font-medium">{input.name}</div>
                        <div className="text-sm text-muted-foreground line-clamp-1">
                          {input.description}
                        </div>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>{input.category}</TableCell>
                  <TableCell>
                    KES {input.price}/{input.unit}
                  </TableCell>
                  <TableCell>
                    <div>
                      <div className="font-medium">{input.stock} {input.unit}s</div>
                      <div className="text-xs text-muted-foreground">
                        Min: {input.minStock}
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>{getStatusBadge(input.status)}</TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => handleEditInput(input)}
                      >
                        <IconEdit className="h-4 w-4" />
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => handleDeleteInput(input.id)}
                      >
                        <IconTrash className="h-4 w-4 text-destructive" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}

