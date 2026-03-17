import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  IconCarrot,
  IconStack2,
  IconStar,
  IconEdit,
  IconPlus,
  IconLoader2,
  IconTrash,
} from "@tabler/icons-react";
import { cn } from "@/lib/utils";
import { useCatalog } from "@/contexts/CatalogContext";
import {
  getVarieties,
  getProductTypes,
  getQualityGrades,
  getAllQuantityTypes,
  upsertVariety,
  upsertProductType,
  upsertQualityGrade,
  upsertQuantityType,
  deleteQuantityType,
  type VarietyConfig,
  type ProductTypeConfig,
  type QualityGradeConfig,
  type QuantityTypeConfig,
  type UpsertVarietyInput,
  type UpsertProductTypeInput,
  type UpsertQualityGradeInput,
  type UpsertQuantityTypeInput,
} from "@/services/catalogService";
import { showSuccess, showError } from "@/lib/toast";

/** Generate a valid code from a label (uppercase, spaces → underscore, alphanumeric + _ -) */
function labelToCode(label: string): string {
  return label
    .trim()
    .replace(/\s+/g, "_")
    .replace(/[^a-zA-Z0-9_-]/g, "")
    .toUpperCase()
    .slice(0, 64) || "NEW";
}

type TabId = "varieties" | "productTypes" | "qualityGrades";

type EditPayload =
  | { kind: "variety"; item: VarietyConfig }
  | { kind: "productType"; item: ProductTypeConfig }
  | { kind: "qualityGrade"; item: QualityGradeConfig }
  | { kind: "quantityType"; item: QuantityTypeConfig }
  | null;

type CreatePayload =
  | { kind: "variety" }
  | { kind: "productType" }
  | { kind: "qualityGrade" }
  | { kind: "quantityType"; productTypeCode: string }
  | null;

const TABS: { id: TabId; label: string; icon: React.ComponentType<{ className?: string }> }[] = [
  { id: "varieties", label: "Varieties", icon: IconCarrot },
  { id: "productTypes", label: "Product types", icon: IconStack2 },
  { id: "qualityGrades", label: "Quality grades", icon: IconStar },
];

export function CommoditySettings() {
  const { refetch } = useCatalog();
  const [activeTab, setActiveTab] = useState<TabId>("varieties");
  const [varieties, setVarieties] = useState<VarietyConfig[]>([]);
  const [productTypes, setProductTypes] = useState<ProductTypeConfig[]>([]);
  const [qualityGrades, setQualityGrades] = useState<QualityGradeConfig[]>([]);
  const [quantityTypes, setQuantityTypes] = useState<QuantityTypeConfig[]>([]);
  const [loading, setLoading] = useState(true);
  const [editOpen, setEditOpen] = useState(false);
  const [createOpen, setCreateOpen] = useState(false);
  const [createKind, setCreateKind] = useState<CreatePayload>(null);
  const [saving, setSaving] = useState(false);
  const [editPayload, setEditPayload] = useState<EditPayload>(null);

  const loadAll = async () => {
    setLoading(true);
    try {
      const [v, p, g, q] = await Promise.all([
        getVarieties(true),
        getProductTypes(true),
        getQualityGrades(true),
        getAllQuantityTypes(true),
      ]);
      setVarieties(v);
      setProductTypes(p);
      setQualityGrades(g);
      setQuantityTypes(q);
    } catch (e) {
      showError(e instanceof Error ? e.message : "Failed to load catalog");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAll();
  }, []);

  const openCreate = (kind: "variety" | "productType" | "qualityGrade") => {
    setCreateKind({ kind });
    setCreateOpen(true);
  };

  const openEdit = (
    kind: "variety" | "productType" | "qualityGrade" | "quantityType",
    item: VarietyConfig | ProductTypeConfig | QualityGradeConfig | QuantityTypeConfig
  ) => {
    setEditPayload({ kind, item } as EditPayload);
    setEditOpen(true);
  };

  const openCreateQuantityType = (productTypeCode: string) => {
    setCreateKind({ kind: "quantityType", productTypeCode });
    setCreateOpen(true);
  };

  const handleSaveVariety = async (input: UpsertVarietyInput) => {
    setSaving(true);
    try {
      await upsertVariety(input);
      showSuccess("Variety saved");
      setEditOpen(false);
      setEditPayload(null);
      await Promise.all([loadAll(), refetch()]);
    } catch (e) {
      showError(e instanceof Error ? e.message : "Failed to save variety");
    } finally {
      setSaving(false);
    }
  };

  const handleSaveProductType = async (input: UpsertProductTypeInput) => {
    setSaving(true);
    try {
      await upsertProductType(input);
      showSuccess("Product type saved");
      setEditOpen(false);
      setEditPayload(null);
      await Promise.all([loadAll(), refetch()]);
    } catch (e) {
      showError(e instanceof Error ? e.message : "Failed to save product type");
    } finally {
      setSaving(false);
    }
  };

  const handleSaveQualityGrade = async (input: UpsertQualityGradeInput) => {
    setSaving(true);
    try {
      await upsertQualityGrade(input);
      showSuccess("Quality grade saved");
      setEditOpen(false);
      setEditPayload(null);
      await Promise.all([loadAll(), refetch()]);
    } catch (e) {
      showError(e instanceof Error ? e.message : "Failed to save quality grade");
    } finally {
      setSaving(false);
    }
  };

  const handleCreateVariety = async (input: UpsertVarietyInput) => {
    setSaving(true);
    try {
      await upsertVariety(input);
      showSuccess("Variety created");
      setCreateOpen(false);
      setCreateKind(null);
      await Promise.all([loadAll(), refetch()]);
    } catch (e) {
      showError(e instanceof Error ? e.message : "Failed to create variety");
    } finally {
      setSaving(false);
    }
  };

  const handleCreateProductType = async (input: UpsertProductTypeInput) => {
    setSaving(true);
    try {
      await upsertProductType(input);
      showSuccess("Product type created");
      setCreateOpen(false);
      setCreateKind(null);
      await Promise.all([loadAll(), refetch()]);
    } catch (e) {
      showError(e instanceof Error ? e.message : "Failed to create product type");
    } finally {
      setSaving(false);
    }
  };

  const handleCreateQualityGrade = async (input: UpsertQualityGradeInput) => {
    setSaving(true);
    try {
      await upsertQualityGrade(input);
      showSuccess("Quality grade created");
      setCreateOpen(false);
      setCreateKind(null);
      await Promise.all([loadAll(), refetch()]);
    } catch (e) {
      showError(e instanceof Error ? e.message : "Failed to create quality grade");
    } finally {
      setSaving(false);
    }
  };

  const handleSaveQuantityType = async (input: UpsertQuantityTypeInput) => {
    setSaving(true);
    try {
      await upsertQuantityType(input);
      showSuccess("Quantity type saved");
      setEditOpen(false);
      setEditPayload(null);
      await Promise.all([loadAll(), refetch()]);
    } catch (e) {
      showError(e instanceof Error ? e.message : "Failed to save quantity type");
    } finally {
      setSaving(false);
    }
  };

  const handleCreateQuantityType = async (input: UpsertQuantityTypeInput) => {
    setSaving(true);
    try {
      await upsertQuantityType(input);
      showSuccess("Quantity type created");
      setCreateOpen(false);
      setCreateKind(null);
      await Promise.all([loadAll(), refetch()]);
    } catch (e) {
      showError(e instanceof Error ? e.message : "Failed to create quantity type");
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteQuantityType = async (productTypeCode: string, code: string) => {
    if (!confirm(`Delete quantity type "${code}"?`)) return;
    setSaving(true);
    try {
      await deleteQuantityType(productTypeCode, code);
      showSuccess("Quantity type deleted");
      await Promise.all([loadAll(), refetch()]);
    } catch (e) {
      showError(e instanceof Error ? e.message : "Failed to delete quantity type");
    } finally {
      setSaving(false);
    }
  };

  const quantityTypesByProductType = productTypes.reduce<Record<string, QuantityTypeConfig[]>>((acc, pt) => {
    acc[pt.code] = quantityTypes.filter((qt) => qt.productTypeCode === pt.code).sort((a, b) => a.sortOrder - b.sortOrder);
    return acc;
  }, {});

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold">Commodity settings</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Manage varieties, product types, and quality grades. Add any new produce types—codes are flexible and can be generated from labels.
        </p>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 border-b border-stone-200 pb-2">
        {TABS.map((tab) => (
          <Button
            key={tab.id}
            variant={activeTab === tab.id ? "secondary" : "ghost"}
            size="sm"
            onClick={() => setActiveTab(tab.id)}
            className={cn(activeTab === tab.id && "bg-stone-200")}
          >
            <tab.icon className="mr-2 h-4 w-4" />
            {tab.label}
          </Button>
        ))}
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-12">
          <IconLoader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      ) : (
        <>
          {activeTab === "varieties" && (
            <Card>
              <CardHeader className="flex flex-row items-center justify-between gap-4">
                <div>
                  <CardTitle>Varieties</CardTitle>
                  <CardDescription>Produce varieties (e.g. Kenya, SPK004, or any new type).</CardDescription>
                </div>
                <Button size="sm" onClick={() => openCreate("variety")} disabled={saving}>
                  <IconPlus className="mr-2 h-4 w-4" />
                  Add variety
                </Button>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Code</TableHead>
                      <TableHead>Label</TableHead>
                      <TableHead>Description</TableHead>
                      <TableHead>Active</TableHead>
                      <TableHead>Order</TableHead>
                      <TableHead className="w-[80px]" />
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {varieties.map((row) => (
                      <TableRow key={row.id}>
                        <TableCell className="font-mono text-sm">{row.code}</TableCell>
                        <TableCell>{row.label}</TableCell>
                        <TableCell className="text-muted-foreground max-w-[200px] truncate">
                          {row.description || "—"}
                        </TableCell>
                        <TableCell>
                          <Badge variant={row.isActive ? "default" : "secondary"}>
                            {row.isActive ? "Yes" : "No"}
                          </Badge>
                        </TableCell>
                        <TableCell>{row.sortOrder}</TableCell>
                        <TableCell>
                          <Button variant="ghost" size="sm" onClick={() => openEdit("variety", row)}>
                            <IconEdit className="h-4 w-4" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          )}

          {activeTab === "productTypes" && (
            <Card>
              <CardHeader className="flex flex-row items-center justify-between gap-4">
                <div>
                  <CardTitle>Product types</CardTitle>
                  <CardDescription>Commodity types for sourcing (e.g. Fresh roots, Flour, or any new type). Units of measure are configured in each product type&apos;s edit dialog.</CardDescription>
                </div>
                <Button size="sm" onClick={() => openCreate("productType")} disabled={saving}>
                  <IconPlus className="mr-2 h-4 w-4" />
                  Add product type
                </Button>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Code</TableHead>
                      <TableHead>Label</TableHead>
                      <TableHead>Description</TableHead>
                      <TableHead>Active</TableHead>
                      <TableHead>Order</TableHead>
                      <TableHead className="w-[80px]" />
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {productTypes.map((row) => (
                      <TableRow key={row.id}>
                        <TableCell className="font-mono text-sm">{row.code}</TableCell>
                        <TableCell>{row.label}</TableCell>
                        <TableCell className="text-muted-foreground max-w-[200px] truncate">
                          {row.description || "—"}
                        </TableCell>
                        <TableCell>
                          <Badge variant={row.isActive ? "default" : "secondary"}>
                            {row.isActive ? "Yes" : "No"}
                          </Badge>
                        </TableCell>
                        <TableCell>{row.sortOrder}</TableCell>
                        <TableCell>
                          <Button variant="ghost" size="sm" onClick={() => openEdit("productType", row)}>
                            <IconEdit className="h-4 w-4" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          )}

          {activeTab === "qualityGrades" && (
            <Card>
              <CardHeader className="flex flex-row items-center justify-between gap-4">
                <div>
                  <CardTitle>Quality grades</CardTitle>
                  <CardDescription>Grades used in listings and aggregation (e.g. A, B, C, or any new grade).</CardDescription>
                </div>
                <Button size="sm" onClick={() => openCreate("qualityGrade")} disabled={saving}>
                  <IconPlus className="mr-2 h-4 w-4" />
                  Add grade
                </Button>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Code</TableHead>
                      <TableHead>Label</TableHead>
                      <TableHead>Description</TableHead>
                      <TableHead>Active</TableHead>
                      <TableHead>Order</TableHead>
                      <TableHead className="w-[80px]" />
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {qualityGrades.map((row) => (
                      <TableRow key={row.id}>
                        <TableCell className="font-mono text-sm">{row.code}</TableCell>
                        <TableCell>{row.label}</TableCell>
                        <TableCell className="text-muted-foreground max-w-[200px] truncate">
                          {row.description || "—"}
                        </TableCell>
                        <TableCell>
                          <Badge variant={row.isActive ? "default" : "secondary"}>
                            {row.isActive ? "Yes" : "No"}
                          </Badge>
                        </TableCell>
                        <TableCell>{row.sortOrder}</TableCell>
                        <TableCell>
                          <Button variant="ghost" size="sm" onClick={() => openEdit("qualityGrade", row)}>
                            <IconEdit className="h-4 w-4" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          )}

        </>
      )}

      <EditDialog
        open={editOpen}
        payload={editPayload}
        saving={saving}
        quantityTypesByProductType={quantityTypesByProductType}
        onClose={() => {
          setEditOpen(false);
          setEditPayload(null);
        }}
        onSaveVariety={handleSaveVariety}
        onSaveProductType={handleSaveProductType}
        onSaveQualityGrade={handleSaveQualityGrade}
        onSaveQuantityType={handleSaveQuantityType}
        onOpenCreateQuantityType={openCreateQuantityType}
        onOpenEditQuantityType={openEdit}
        onDeleteQuantityType={handleDeleteQuantityType}
      />

      <CreateDialog
        open={createOpen}
        kind={createKind}
        saving={saving}
        labelToCode={labelToCode}
        productTypes={productTypes}
        quantityTypesByProductType={quantityTypesByProductType}
        onClose={() => {
          setCreateOpen(false);
          setCreateKind(null);
        }}
        onCreateVariety={handleCreateVariety}
        onCreateProductType={handleCreateProductType}
        onCreateQualityGrade={handleCreateQualityGrade}
        onCreateQuantityType={handleCreateQuantityType}
        nextSortOrder={
          createKind?.kind === "variety"
            ? varieties.length
            : createKind?.kind === "productType"
              ? productTypes.length
              : createKind?.kind === "quantityType"
                ? (quantityTypesByProductType[createKind.productTypeCode]?.length ?? 0)
                : qualityGrades.length
        }
      />
    </div>
  );
}

interface EditDialogProps {
  open: boolean;
  payload: EditPayload;
  saving: boolean;
  quantityTypesByProductType: Record<string, QuantityTypeConfig[]>;
  onOpenCreateQuantityType: (productTypeCode: string) => void;
  onOpenEditQuantityType: (kind: "quantityType", item: QuantityTypeConfig) => void;
  onDeleteQuantityType: (productTypeCode: string, code: string) => void;
  onClose: () => void;
  onSaveVariety: (input: UpsertVarietyInput) => Promise<void>;
  onSaveProductType: (input: UpsertProductTypeInput) => Promise<void>;
  onSaveQualityGrade: (input: UpsertQualityGradeInput) => Promise<void>;
  onSaveQuantityType: (input: UpsertQuantityTypeInput) => Promise<void>;
}

function EditDialog({
  open,
  payload,
  saving,
  quantityTypesByProductType,
  onOpenCreateQuantityType,
  onOpenEditQuantityType,
  onDeleteQuantityType,
  onClose,
  onSaveVariety,
  onSaveProductType,
  onSaveQualityGrade,
  onSaveQuantityType,
}: EditDialogProps) {
  const [code, setCode] = useState("");
  const [label, setLabel] = useState("");
  const [description, setDescription] = useState("");
  const [isActive, setIsActive] = useState(true);
  const [sortOrder, setSortOrder] = useState(0);

  const item = payload?.item;
  const kind = payload?.kind;

  useEffect(() => {
    if (item) {
      setCode(item.code);
      setLabel(item.label);
      setDescription(item.description ?? "");
      setIsActive(item.isActive);
      setSortOrder(item.sortOrder);
    }
  }, [item]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!kind) return;
    const codeVal = code.trim();
    if (!codeVal || !/^[a-zA-Z0-9_-]+$/.test(codeVal)) {
      return;
    }
    if (kind === "variety") {
      onSaveVariety({ code: codeVal, label, description: description || undefined, isActive, sortOrder });
    } else if (kind === "productType") {
      onSaveProductType({ code: codeVal, label, description: description || undefined, isActive, sortOrder });
    } else if (kind === "quantityType" && "productTypeCode" in item) {
      onSaveQuantityType({
        productTypeCode: (item as QuantityTypeConfig).productTypeCode,
        code: codeVal,
        label,
        description: description || undefined,
        isActive,
        sortOrder,
      });
    } else {
      onSaveQualityGrade({ code: codeVal, label, description: description || undefined, isActive, sortOrder });
    }
  };

  if (!payload) return null;

  const title =
    kind === "variety"
      ? "Edit variety"
      : kind === "productType"
        ? "Edit product type"
        : kind === "quantityType"
          ? "Edit quantity type"
          : "Edit quality grade";

  return (
    <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription>Code and label are both editable. Use alphanumeric, underscore, or hyphen for code.</DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="edit-code">Code</Label>
            <Input
              id="edit-code"
              value={code}
              onChange={(e) => setCode(e.target.value)}
              required
              placeholder="e.g. KENYA or ORANGE_FLESHED"
              className="font-mono"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="edit-label">Label</Label>
            <Input
              id="edit-label"
              value={label}
              onChange={(e) => setLabel(e.target.value)}
              required
              placeholder="Display name"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="edit-desc">Description (optional)</Label>
            <Textarea
              id="edit-desc"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Short description"
              rows={2}
            />
          </div>
          <div className="flex items-center justify-between">
            <Label htmlFor="edit-active">Active (shown in dropdowns)</Label>
            <Switch id="edit-active" checked={isActive} onCheckedChange={setIsActive} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="edit-order">Sort order</Label>
            <Input
              id="edit-order"
              type="number"
              min={0}
              value={sortOrder}
              onChange={(e) => setSortOrder(parseInt(e.target.value, 10) || 0)}
            />
          </div>

          {kind === "productType" && item && (
            <div className="border-t pt-4 space-y-3">
              <div className="flex items-center justify-between">
                <Label className="text-base font-medium">Units of measure</Label>
                <Button
                  type="button"
                  size="sm"
                  variant="outline"
                  onClick={() => onOpenCreateQuantityType((item as ProductTypeConfig).code)}
                  disabled={saving}
                >
                  <IconPlus className="mr-2 h-4 w-4" />
                  Add unit
                </Button>
              </div>
              {(() => {
                const qtyTypes = quantityTypesByProductType[(item as ProductTypeConfig).code] ?? [];
                return qtyTypes.length === 0 ? (
                  <p className="text-sm text-muted-foreground py-2">
                    No units configured. Add units for this product type (e.g. kg, tons, bags).
                  </p>
                ) : (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Code</TableHead>
                        <TableHead>Label</TableHead>
                        <TableHead>Active</TableHead>
                        <TableHead>Order</TableHead>
                        <TableHead className="w-[100px]" />
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {qtyTypes.map((qt) => (
                        <TableRow key={qt.id}>
                          <TableCell className="font-mono text-sm">{qt.code}</TableCell>
                          <TableCell>{qt.label}</TableCell>
                          <TableCell>
                            <Badge variant={qt.isActive ? "default" : "secondary"}>
                              {qt.isActive ? "Yes" : "No"}
                            </Badge>
                          </TableCell>
                          <TableCell>{qt.sortOrder}</TableCell>
                          <TableCell>
                            <div className="flex gap-1">
                              <Button
                                type="button"
                                variant="ghost"
                                size="sm"
                                onClick={() => onOpenEditQuantityType("quantityType", qt)}
                              >
                                <IconEdit className="h-4 w-4" />
                              </Button>
                              <Button
                                type="button"
                                variant="ghost"
                                size="sm"
                                className="text-destructive hover:text-destructive"
                                onClick={() => onDeleteQuantityType(qt.productTypeCode, qt.code)}
                                disabled={saving}
                              >
                                <IconTrash className="h-4 w-4" />
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                );
              })()}
            </div>
          )}

          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose} disabled={saving}>
              Cancel
            </Button>
            <Button type="submit" disabled={saving}>
              {saving && <IconLoader2 className="mr-2 h-4 w-4 animate-spin" />}
              Save
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

interface CreateDialogProps {
  open: boolean;
  kind: CreatePayload;
  saving: boolean;
  labelToCode: (label: string) => string;
  productTypes: ProductTypeConfig[];
  quantityTypesByProductType: Record<string, QuantityTypeConfig[]>;
  onClose: () => void;
  onCreateVariety: (input: UpsertVarietyInput) => Promise<void>;
  onCreateProductType: (input: UpsertProductTypeInput) => Promise<void>;
  onCreateQualityGrade: (input: UpsertQualityGradeInput) => Promise<void>;
  onCreateQuantityType: (input: UpsertQuantityTypeInput) => Promise<void>;
  nextSortOrder: number;
}

function CreateDialog({
  open,
  kind,
  saving,
  labelToCode,
  productTypes,
  quantityTypesByProductType,
  onClose,
  onCreateVariety,
  onCreateProductType,
  onCreateQualityGrade,
  onCreateQuantityType,
  nextSortOrder,
}: CreateDialogProps) {
  const [label, setLabel] = useState("");
  const [code, setCode] = useState("");
  const [description, setDescription] = useState("");
  const [isActive, setIsActive] = useState(true);

  useEffect(() => {
    if (open) {
      setLabel("");
      setCode("");
      setDescription("");
      setIsActive(true);
    }
  }, [open]);

  const handleLabelChange = (value: string) => {
    setLabel(value);
    if (!code || code === labelToCode(label)) {
      setCode(labelToCode(value));
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!kind) return;
    const codeVal = (code || labelToCode(label)).trim().replace(/\s+/g, "_").replace(/[^a-zA-Z0-9_-]/g, "").toUpperCase();
    if (!codeVal) return;
    const common = { code: codeVal, label: label.trim(), description: description || undefined, isActive, sortOrder: nextSortOrder };
    if (kind.kind === "variety") {
      onCreateVariety(common);
    } else if (kind.kind === "productType") {
      onCreateProductType(common);
    } else if (kind.kind === "quantityType") {
      onCreateQuantityType({
        productTypeCode: kind.productTypeCode,
        ...common,
      });
    } else {
      onCreateQualityGrade(common);
    }
  };

  if (!kind) return null;

  const title =
    kind.kind === "variety"
      ? "Add variety"
      : kind.kind === "productType"
        ? "Add product type"
        : kind.kind === "quantityType"
          ? "Add quantity type"
          : "Add quality grade";

  const productTypeLabel =
    kind.kind === "quantityType"
      ? productTypes.find((p) => p.code === kind.productTypeCode)?.label ?? kind.productTypeCode
      : null;

  return (
    <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription>
            {kind.kind === "quantityType" ? (
              <>Add a unit of measure for <strong>{productTypeLabel}</strong>. Code is auto-generated from label (e.g. &quot;Kilograms&quot; → KG).</>
            ) : (
              <>Enter label and code. Code is auto-generated from label (e.g. &quot;Orange Fleshed&quot; → ORANGE_FLESHED) but you can edit it.</>
            )}
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          {kind.kind === "quantityType" && (
            <div className="rounded-md bg-muted/50 p-3 text-sm">
              Product type: <strong>{productTypeLabel}</strong>
            </div>
          )}
          <div className="space-y-2">
            <Label htmlFor="create-label">Label *</Label>
            <Input
              id="create-label"
              value={label}
              onChange={(e) => handleLabelChange(e.target.value)}
              required
              placeholder="e.g. Orange Fleshed Sweet Potato"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="create-code">Code *</Label>
            <Input
              id="create-code"
              value={code}
              onChange={(e) => setCode(e.target.value)}
              required
              placeholder="e.g. ORANGE_FLESHED_SWEET_POTATO"
              className="font-mono"
            />
            <p className="text-xs text-muted-foreground">Alphanumeric, underscore, hyphen. Auto-filled from label.</p>
          </div>
          <div className="space-y-2">
            <Label htmlFor="create-desc">Description (optional)</Label>
            <Textarea
              id="create-desc"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Short description"
              rows={2}
            />
          </div>
          <div className="flex items-center justify-between">
            <Label htmlFor="create-active">Active</Label>
            <Switch id="create-active" checked={isActive} onCheckedChange={setIsActive} />
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose} disabled={saving}>
              Cancel
            </Button>
            <Button type="submit" disabled={saving || !label.trim()}>
              {saving && <IconLoader2 className="mr-2 h-4 w-4 animate-spin" />}
              Create
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
