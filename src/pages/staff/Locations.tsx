import { useState, useEffect, useMemo } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { SearchableSelect } from "@/components/ui/searchable-select";
import { IconMapPin, IconPlus, IconTrash, IconEdit, IconArrowUp, IconArrowDown, IconSelector } from "@tabler/icons-react";
import {
  getCounties,
  getSubCounties,
  getWards,
  getVillages,
  createCounty,
  createSubCounty,
  createWard,
  createVillage,
  updateCounty,
  updateSubCounty,
  updateWard,
  updateVillage,
  deleteCounty,
  deleteSubCounty,
  deleteWard,
  deleteVillage,
} from "@/services/locationsService";
import type { County, SubCounty, Ward, Village } from "@/types/locations";
import { showSuccess, showError } from "@/lib/toast";

type Level = "county" | "subcounty" | "ward" | "village";

/** Parse comma-separated names: trim, capitalize first letter of each word (spaces preserved). */
function parseCommaSeparatedNames(input: string): string[] {
  return input
    .split(",")
    .map((s) => s.trim())
    .filter((s) => s.length > 0)
    .map((s) => s.replace(/(\S)(\S*)/g, (_, first, rest) => first.toUpperCase() + rest.toLowerCase()));
}

export function Locations() {
  const [counties, setCounties] = useState<County[]>([]);
  const [subCounties, setSubCounties] = useState<SubCounty[]>([]);
  const [wards, setWards] = useState<Ward[]>([]);
  const [villages, setVillages] = useState<Village[]>([]);
  const [loading, setLoading] = useState(true);
  const [createOpen, setCreateOpen] = useState<Level | null>(null);
  const [selectedId, setSelectedId] = useState<string | null>(null); // when set, dialog is in edit mode

  const [activeTab, setActiveTab] = useState<Level>("county");
  const [countyForm, setCountyForm] = useState({ name: "", code: "" });
  const [subCountyForm, setSubCountyForm] = useState({ name: "", countyId: "" });
  const [wardForm, setWardForm] = useState({ name: "", subCountyId: "" });
  const [villageForm, setVillageForm] = useState({ name: "", wardId: "" });

  type SortDir = "asc" | "desc";
  const [countySort, setCountySort] = useState<{ column: "name" | "code"; dir: SortDir }>({ column: "name", dir: "asc" });
  const [subCountySort, setSubCountySort] = useState<{ column: "name" | "county"; dir: SortDir }>({ column: "county", dir: "asc" });
  const [wardSort, setWardSort] = useState<{ column: "name" | "subCounty"; dir: SortDir }>({ column: "subCounty", dir: "asc" });
  const [villageSort, setVillageSort] = useState<{ column: "name" | "ward"; dir: SortDir }>({ column: "ward", dir: "asc" });

  const loadAll = async () => {
    setLoading(true);
    try {
      const [c, s, w, v] = await Promise.all([
        getCounties(),
        getSubCounties(),
        getWards(),
        getVillages(),
      ]);
      setCounties(c);
      setSubCounties(s);
      setWards(w);
      setVillages(v);
    } catch (e) {
      showError("Failed to load locations");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAll();
  }, []);

  const handleSaveCounty = async () => {
    if (selectedId) {
      try {
        await updateCounty(selectedId, { name: countyForm.name.trim(), code: countyForm.code.trim() || undefined });
        showSuccess("County updated");
        setCreateOpen(null);
        setSelectedId(null);
        setCountyForm({ name: "", code: "" });
        loadAll();
      } catch (e: any) {
        showError(e?.message || "Failed to update county");
      }
      return;
    }
    const names = parseCommaSeparatedNames(countyForm.name);
    if (names.length === 0) return;
    const code = countyForm.code.trim() || undefined;
    try {
      let created = 0;
      for (let i = 0; i < names.length; i++) {
        await createCounty({ name: names[i], code: i === 0 ? code : undefined });
        created += 1;
      }
      showSuccess(created === 1 ? "County created" : `${created} counties created`);
      setCreateOpen(null);
      setSelectedId(null);
      setCountyForm({ name: "", code: "" });
      loadAll();
    } catch (e: any) {
      showError(e?.message || "Failed to create county");
    }
  };

  const handleSaveSubCounty = async () => {
    if (selectedId) {
      try {
        await updateSubCounty(selectedId, { name: subCountyForm.name.trim(), countyId: subCountyForm.countyId });
        showSuccess("Sub-county updated");
        setCreateOpen(null);
        setSelectedId(null);
        setSubCountyForm({ name: "", countyId: "" });
        loadAll();
      } catch (e: any) {
        showError(e?.message || "Failed to update sub-county");
      }
      return;
    }
    const names = parseCommaSeparatedNames(subCountyForm.name);
    if (names.length === 0 || !subCountyForm.countyId) return;
    try {
      let created = 0;
      for (const name of names) {
        await createSubCounty({ name, countyId: subCountyForm.countyId });
        created += 1;
      }
      showSuccess(created === 1 ? "Sub-county created" : `${created} sub-counties created`);
      setCreateOpen(null);
      setSelectedId(null);
      setSubCountyForm({ name: "", countyId: "" });
      loadAll();
    } catch (e: any) {
      showError(e?.message || "Failed to create sub-county");
    }
  };

  const handleSaveWard = async () => {
    if (selectedId) {
      try {
        await updateWard(selectedId, { name: wardForm.name.trim(), subCountyId: wardForm.subCountyId });
        showSuccess("Ward updated");
        setCreateOpen(null);
        setSelectedId(null);
        setWardForm({ name: "", subCountyId: "" });
        loadAll();
      } catch (e: any) {
        showError(e?.message || "Failed to update ward");
      }
      return;
    }
    const names = parseCommaSeparatedNames(wardForm.name);
    if (names.length === 0 || !wardForm.subCountyId) return;
    try {
      let created = 0;
      for (const name of names) {
        await createWard({ name, subCountyId: wardForm.subCountyId });
        created += 1;
      }
      showSuccess(created === 1 ? "Ward created" : `${created} wards created`);
      setCreateOpen(null);
      setSelectedId(null);
      setWardForm({ name: "", subCountyId: "" });
      loadAll();
    } catch (e: any) {
      showError(e?.message || "Failed to create ward");
    }
  };

  const handleSaveVillage = async () => {
    if (selectedId) {
      try {
        await updateVillage(selectedId, { name: villageForm.name.trim(), wardId: villageForm.wardId });
        showSuccess("Village updated");
        setCreateOpen(null);
        setSelectedId(null);
        setVillageForm({ name: "", wardId: "" });
        loadAll();
      } catch (e: any) {
        showError(e?.message || "Failed to update village");
      }
      return;
    }
    const names = parseCommaSeparatedNames(villageForm.name);
    if (names.length === 0 || !villageForm.wardId) return;
    try {
      let created = 0;
      for (const name of names) {
        await createVillage({ name, wardId: villageForm.wardId });
        created += 1;
      }
      showSuccess(created === 1 ? "Village created" : `${created} villages created`);
      setCreateOpen(null);
      setSelectedId(null);
      setVillageForm({ name: "", wardId: "" });
      loadAll();
    } catch (e: any) {
      showError(e?.message || "Failed to create village");
    }
  };

  const handleDelete = async (level: Level, id: string) => {
    if (!confirm("Delete this item? Child locations may also be removed.")) return;
    try {
      if (level === "county") await deleteCounty(id);
      else if (level === "subcounty") await deleteSubCounty(id);
      else if (level === "ward") await deleteWard(id);
      else await deleteVillage(id);
      showSuccess("Deleted");
      setCreateOpen(null);
      setSelectedId(null);
      loadAll();
    } catch (e: any) {
      showError(e?.message || "Failed to delete");
    }
  };

  const getSubCountyName = (id: string) => subCounties.find((s) => s.id === id)?.name ?? id;
  const getWardName = (id: string) => wards.find((w) => w.id === id)?.name ?? id;
  const getCountyName = (id: string) => counties.find((c) => c.id === id)?.name ?? id;

  const sortedCounties = useMemo(() => {
    const list = [...counties];
    const { column, dir } = countySort;
    list.sort((a, b) => {
      const aVal = column === "name" ? a.name : (a.code ?? "");
      const bVal = column === "name" ? b.name : (b.code ?? "");
      const cmp = aVal.localeCompare(bVal, undefined, { sensitivity: "base" });
      return dir === "asc" ? cmp : -cmp;
    });
    return list;
  }, [counties, countySort]);

  const sortedSubCounties = useMemo(() => {
    const list = [...subCounties];
    const { column, dir } = subCountySort;
    const getCounty = (id: string) => counties.find((c) => c.id === id)?.name ?? id;
    list.sort((a, b) => {
      const aVal = column === "name" ? a.name : (a.county?.name ?? getCounty(a.countyId));
      const bVal = column === "name" ? b.name : (b.county?.name ?? getCounty(b.countyId));
      const cmp = aVal.localeCompare(bVal, undefined, { sensitivity: "base" });
      return dir === "asc" ? cmp : -cmp;
    });
    return list;
  }, [subCounties, subCountySort, counties]);

  const sortedWards = useMemo(() => {
    const list = [...wards];
    const { column, dir } = wardSort;
    const getSub = (id: string) => subCounties.find((s) => s.id === id)?.name ?? id;
    list.sort((a, b) => {
      const aVal = column === "name" ? a.name : (a.subCounty?.name ?? getSub(a.subCountyId));
      const bVal = column === "name" ? b.name : (b.subCounty?.name ?? getSub(b.subCountyId));
      const cmp = aVal.localeCompare(bVal, undefined, { sensitivity: "base" });
      return dir === "asc" ? cmp : -cmp;
    });
    return list;
  }, [wards, wardSort, subCounties]);

  const sortedVillages = useMemo(() => {
    const list = [...villages];
    const { column, dir } = villageSort;
    const getWard = (id: string) => wards.find((w) => w.id === id)?.name ?? id;
    list.sort((a, b) => {
      const aVal = column === "name" ? a.name : (a.ward?.name ?? getWard(a.wardId));
      const bVal = column === "name" ? b.name : (b.ward?.name ?? getWard(b.wardId));
      const cmp = aVal.localeCompare(bVal, undefined, { sensitivity: "base" });
      return dir === "asc" ? cmp : -cmp;
    });
    return list;
  }, [villages, villageSort, wards]);

  const SortableTh = ({
    label,
    column,
    current,
    dir,
    onClick,
  }: {
    label: string;
    column: string;
    current: string;
    dir: SortDir;
    onClick: () => void;
  }) => (
    <TableHead>
      <button
        type="button"
        onClick={onClick}
        className="flex items-center gap-1 font-medium hover:text-foreground"
      >
        {label}
        {current === column ? dir === "asc" ? <IconArrowUp className="h-4 w-4" /> : <IconArrowDown className="h-4 w-4" /> : <IconSelector className="h-4 w-4 text-muted-foreground" />}
      </button>
    </TableHead>
  );

  if (loading) {
    return (
      <div className="p-6">
        <p className="text-muted-foreground">Loading locations...</p>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-8">
      <div>
        <h1 className="text-2xl font-bold flex items-center gap-2">
          <IconMapPin className="h-7 w-7" />
          Location hierarchy
        </h1>
        <p className="text-muted-foreground mt-1">
          Manage counties, sub-counties, wards and villages. Use these in user assignment and produce posting dropdowns.
        </p>
      </div>

      {/* Tabs */}
      <div className="border-b border-stone-200">
        <div className="flex gap-2">
          {(["county", "subcounty", "ward", "village"] as const).map((tab) => (
            <Button
              key={tab}
              variant="ghost"
              onClick={() => setActiveTab(tab)}
              className={cn(
                "rounded-none border-b-2 border-transparent -mb-px capitalize",
                activeTab === tab
                  ? "border-primary text-primary font-semibold"
                  : "text-stone-600 hover:text-stone-900"
              )}
            >
              {tab === "county" && "Counties"}
              {tab === "subcounty" && "Sub-counties"}
              {tab === "ward" && "Wards"}
              {tab === "village" && "Villages"}
            </Button>
          ))}
        </div>
      </div>

      {/* Tabular listing for active level */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle>
              {activeTab === "county" && "Counties"}
              {activeTab === "subcounty" && "Sub-counties"}
              {activeTab === "ward" && "Wards"}
              {activeTab === "village" && "Villages"}
            </CardTitle>
            <CardDescription>
              {activeTab === "county" && "Top-level administrative locations"}
              {activeTab === "subcounty" && "Under a county"}
              {activeTab === "ward" && "Under a sub-county"}
              {activeTab === "village" && "Under a ward"}
            </CardDescription>
          </div>
          <Button
            size="sm"
            onClick={() => {
              setSelectedId(null);
              setCreateOpen(activeTab);
              if (activeTab === "county") setCountyForm({ name: "", code: "" });
              if (activeTab === "subcounty") setSubCountyForm({ name: "", countyId: "" });
              if (activeTab === "ward") setWardForm({ name: "", subCountyId: "" });
              if (activeTab === "village") setVillageForm({ name: "", wardId: "" });
            }}
          >
            <IconPlus className="h-4 w-4 mr-1" /> Add
          </Button>
        </CardHeader>
        <CardContent>
          {activeTab === "county" && (
            <Table>
              <TableHeader>
                <TableRow>
                  <SortableTh
                    label="Name"
                    column="name"
                    current={countySort.column}
                    dir={countySort.dir}
                    onClick={() => setCountySort((s) => ({ column: "name", dir: s.column === "name" && s.dir === "asc" ? "desc" : "asc" }))}
                  />
                  <SortableTh
                    label="Code"
                    column="code"
                    current={countySort.column}
                    dir={countySort.dir}
                    onClick={() => setCountySort((s) => ({ column: "code", dir: s.column === "code" && s.dir === "asc" ? "desc" : "asc" }))}
                  />
                  <TableHead className="w-24 text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {sortedCounties.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={3} className="text-center text-muted-foreground py-8">
                      No counties yet. Click Add to create one.
                    </TableCell>
                  </TableRow>
                ) : (
                  sortedCounties.map((c) => (
                    <TableRow key={c.id}>
                      <TableCell>{c.name}</TableCell>
                      <TableCell>{c.code ?? "—"}</TableCell>
                      <TableCell className="text-right">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => {
                            setSelectedId(c.id);
                            setCreateOpen("county");
                            setCountyForm({ name: c.name, code: c.code ?? "" });
                          }}
                        >
                          <IconEdit className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="sm" onClick={() => handleDelete("county", c.id)}>
                          <IconTrash className="h-4 w-4 text-destructive" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          )}
          {activeTab === "subcounty" && (
            <Table>
              <TableHeader>
                <TableRow>
                  <SortableTh
                    label="Name"
                    column="name"
                    current={subCountySort.column}
                    dir={subCountySort.dir}
                    onClick={() => setSubCountySort((s) => ({ column: "name", dir: s.column === "name" && s.dir === "asc" ? "desc" : "asc" }))}
                  />
                  <SortableTh
                    label="County"
                    column="county"
                    current={subCountySort.column}
                    dir={subCountySort.dir}
                    onClick={() => setSubCountySort((s) => ({ column: "county", dir: s.column === "county" && s.dir === "asc" ? "desc" : "asc" }))}
                  />
                  <TableHead className="w-24 text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {sortedSubCounties.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={3} className="text-center text-muted-foreground py-8">
                      No sub-counties yet. Add a county first, then click Add.
                    </TableCell>
                  </TableRow>
                ) : (
                  sortedSubCounties.map((s) => (
                    <TableRow key={s.id}>
                      <TableCell>{s.name}</TableCell>
                      <TableCell>{s.county?.name ?? getCountyName(s.countyId)}</TableCell>
                      <TableCell className="text-right">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => {
                            setSelectedId(s.id);
                            setCreateOpen("subcounty");
                            setSubCountyForm({ name: s.name, countyId: s.countyId });
                          }}
                        >
                          <IconEdit className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="sm" onClick={() => handleDelete("subcounty", s.id)}>
                          <IconTrash className="h-4 w-4 text-destructive" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          )}
          {activeTab === "ward" && (
            <Table>
              <TableHeader>
                <TableRow>
                  <SortableTh
                    label="Name"
                    column="name"
                    current={wardSort.column}
                    dir={wardSort.dir}
                    onClick={() => setWardSort((s) => ({ column: "name", dir: s.column === "name" && s.dir === "asc" ? "desc" : "asc" }))}
                  />
                  <SortableTh
                    label="Sub-county"
                    column="subCounty"
                    current={wardSort.column}
                    dir={wardSort.dir}
                    onClick={() => setWardSort((s) => ({ column: "subCounty", dir: s.column === "subCounty" && s.dir === "asc" ? "desc" : "asc" }))}
                  />
                  <TableHead className="w-24 text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {sortedWards.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={3} className="text-center text-muted-foreground py-8">
                      No wards yet. Add a sub-county first, then click Add.
                    </TableCell>
                  </TableRow>
                ) : (
                  sortedWards.map((w) => (
                    <TableRow key={w.id}>
                      <TableCell>{w.name}</TableCell>
                      <TableCell>{w.subCounty?.name ?? getSubCountyName(w.subCountyId)}</TableCell>
                      <TableCell className="text-right">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => {
                            setSelectedId(w.id);
                            setCreateOpen("ward");
                            setWardForm({ name: w.name, subCountyId: w.subCountyId });
                          }}
                        >
                          <IconEdit className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="sm" onClick={() => handleDelete("ward", w.id)}>
                          <IconTrash className="h-4 w-4 text-destructive" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          )}
          {activeTab === "village" && (
            <Table>
              <TableHeader>
                <TableRow>
                  <SortableTh
                    label="Name"
                    column="name"
                    current={villageSort.column}
                    dir={villageSort.dir}
                    onClick={() => setVillageSort((s) => ({ column: "name", dir: s.column === "name" && s.dir === "asc" ? "desc" : "asc" }))}
                  />
                  <SortableTh
                    label="Ward"
                    column="ward"
                    current={villageSort.column}
                    dir={villageSort.dir}
                    onClick={() => setVillageSort((s) => ({ column: "ward", dir: s.column === "ward" && s.dir === "asc" ? "desc" : "asc" }))}
                  />
                  <TableHead className="w-24 text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {sortedVillages.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={3} className="text-center text-muted-foreground py-8">
                      No villages yet. Add a ward first, then click Add.
                    </TableCell>
                  </TableRow>
                ) : (
                  sortedVillages.map((v) => (
                    <TableRow key={v.id}>
                      <TableCell>{v.name}</TableCell>
                      <TableCell>{v.ward?.name ?? getWardName(v.wardId)}</TableCell>
                      <TableCell className="text-right">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => {
                            setSelectedId(v.id);
                            setCreateOpen("village");
                            setVillageForm({ name: v.name, wardId: v.wardId });
                          }}
                        >
                          <IconEdit className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="sm" onClick={() => handleDelete("village", v.id)}>
                          <IconTrash className="h-4 w-4 text-destructive" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* Create / Edit County */}
      <Dialog open={createOpen === "county"} onOpenChange={(o) => !o && (setCreateOpen(null), setSelectedId(null))}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{selectedId ? "Edit county" : "Add county"}</DialogTitle>
            <DialogDescription>
              {selectedId ? "Update the county name and code." : "Enter one or more names, comma-separated. Spaces are trimmed; first letter of each word is capitalized."}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <label className="text-sm font-medium">{selectedId ? "Name" : "Name(s)"}</label>
            <Input
              value={countyForm.name}
              onChange={(e) => setCountyForm((p) => ({ ...p, name: e.target.value }))}
              placeholder={selectedId ? "e.g. Machakos" : "e.g. Machakos or Machakos, Nairobi, Kiambu"}
            />
            <label className="text-sm font-medium">Code (optional)</label>
            <Input
              value={countyForm.code}
              onChange={(e) => setCountyForm((p) => ({ ...p, code: e.target.value }))}
              placeholder="e.g. MCK"
            />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => (setCreateOpen(null), setSelectedId(null))}>Cancel</Button>
            <Button
              onClick={handleSaveCounty}
              disabled={selectedId ? !countyForm.name.trim() : parseCommaSeparatedNames(countyForm.name).length === 0}
            >
              {selectedId ? "Save" : "Create"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Create / Edit SubCounty */}
      <Dialog open={createOpen === "subcounty"} onOpenChange={(o) => !o && (setCreateOpen(null), setSelectedId(null))}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{selectedId ? "Edit sub-county" : "Add sub-county"}</DialogTitle>
            <DialogDescription>
              {selectedId ? "Update the sub-county name and county." : "Select a county and enter one or more names, comma-separated. Spaces are trimmed; first letter of each word is capitalized."}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <label className="text-sm font-medium">County</label>
            <SearchableSelect
              options={counties.map((c) => ({ value: c.id, label: c.name, searchText: c.name }))}
              value={subCountyForm.countyId}
              onValueChange={(v) => setSubCountyForm((p) => ({ ...p, countyId: v }))}
              placeholder="Select county"
              searchPlaceholder="Search counties..."
            />
            <label className="text-sm font-medium">{selectedId ? "Name" : "Name(s)"}</label>
            <Input
              value={subCountyForm.name}
              onChange={(e) => setSubCountyForm((p) => ({ ...p, name: e.target.value }))}
              placeholder={selectedId ? "e.g. Kangundo" : "e.g. Kangundo or Kangundo, Kathiani, Masinga"}
            />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => (setCreateOpen(null), setSelectedId(null))}>Cancel</Button>
            <Button
              onClick={handleSaveSubCounty}
              disabled={selectedId ? !subCountyForm.name.trim() || !subCountyForm.countyId : parseCommaSeparatedNames(subCountyForm.name).length === 0 || !subCountyForm.countyId}
            >
              {selectedId ? "Save" : "Create"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Create / Edit Ward */}
      <Dialog open={createOpen === "ward"} onOpenChange={(o) => !o && (setCreateOpen(null), setSelectedId(null))}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{selectedId ? "Edit ward" : "Add ward"}</DialogTitle>
            <DialogDescription>
              {selectedId ? "Update the ward name and sub-county." : "Select a sub-county and enter one or more names, comma-separated. Spaces are trimmed; first letter of each word is capitalized."}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <label className="text-sm font-medium">Sub-county</label>
            <SearchableSelect
              options={subCounties.map((s) => ({
                value: s.id,
                label: `${s.name} (${s.county?.name ?? getCountyName(s.countyId)})`,
                searchText: `${s.name} ${s.county?.name ?? getCountyName(s.countyId)}`,
              }))}
              value={wardForm.subCountyId}
              onValueChange={(v) => setWardForm((p) => ({ ...p, subCountyId: v }))}
              placeholder="Select sub-county"
              searchPlaceholder="Search sub-counties..."
            />
            <label className="text-sm font-medium">{selectedId ? "Name" : "Name(s)"}</label>
            <Input
              value={wardForm.name}
              onChange={(e) => setWardForm((p) => ({ ...p, name: e.target.value }))}
              placeholder={selectedId ? "e.g. Kangundo North" : "e.g. Kangundo North or Kangundo North, Kangundo South"}
            />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => (setCreateOpen(null), setSelectedId(null))}>Cancel</Button>
            <Button
              onClick={handleSaveWard}
              disabled={selectedId ? !wardForm.name.trim() || !wardForm.subCountyId : parseCommaSeparatedNames(wardForm.name).length === 0 || !wardForm.subCountyId}
            >
              {selectedId ? "Save" : "Create"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Create / Edit Village */}
      <Dialog open={createOpen === "village"} onOpenChange={(o) => !o && (setCreateOpen(null), setSelectedId(null))}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{selectedId ? "Edit village" : "Add village"}</DialogTitle>
            <DialogDescription>
              {selectedId ? "Update the village name and ward." : "Select a ward and enter one or more names, comma-separated. Spaces are trimmed; first letter of each word is capitalized."}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <label className="text-sm font-medium">Ward</label>
            <SearchableSelect
              options={wards.map((w) => ({
                value: w.id,
                label: `${w.name} (${w.subCounty?.name ?? getSubCountyName(w.subCountyId)})`,
                searchText: `${w.name} ${w.subCounty?.name ?? getSubCountyName(w.subCountyId)}`,
              }))}
              value={villageForm.wardId}
              onValueChange={(v) => setVillageForm((p) => ({ ...p, wardId: v }))}
              placeholder="Select ward"
              searchPlaceholder="Search wards..."
            />
            <label className="text-sm font-medium">{selectedId ? "Name" : "Name(s)"}</label>
            <Input
              value={villageForm.name}
              onChange={(e) => setVillageForm((p) => ({ ...p, name: e.target.value }))}
              placeholder={selectedId ? "e.g. Masinga Central" : "e.g. Masinga Central or Masinga Central, Masinga East"}
            />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => (setCreateOpen(null), setSelectedId(null))}>Cancel</Button>
            <Button
              onClick={handleSaveVillage}
              disabled={selectedId ? !villageForm.name.trim() || !villageForm.wardId : parseCommaSeparatedNames(villageForm.name).length === 0 || !villageForm.wardId}
            >
              {selectedId ? "Save" : "Create"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
