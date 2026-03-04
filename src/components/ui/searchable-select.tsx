import * as React from "react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

export interface SearchableSelectOption {
  value: string;
  label: React.ReactNode;
  /** Optional: used for filtering when label is not a string (e.g. React node). */
  searchText?: string;
}

interface SearchableSelectProps {
  options: SearchableSelectOption[];
  value: string;
  onValueChange: (value: string) => void;
  placeholder?: string;
  /** Optional: override what is shown in the trigger when value is selected (defaults to selected option label). */
  triggerDisplay?: string;
  className?: string;
  contentClassName?: string;
  searchPlaceholder?: string;
  disabled?: boolean;
}

export function SearchableSelect({
  options,
  value,
  onValueChange,
  placeholder = "Select...",
  triggerDisplay,
  className,
  contentClassName,
  searchPlaceholder = "Search...",
  disabled = false,
}: SearchableSelectProps) {
  const [search, setSearch] = React.useState("");
  const [open, setOpen] = React.useState(false);

  const searchLower = search.trim().toLowerCase();
  const filtered =
    !searchLower
      ? options
      : options.filter((o) => {
          const text = o.searchText ?? (typeof o.label === "string" ? o.label : "");
          return String(text).toLowerCase().includes(searchLower);
        });

  const selectedOption = options.find((o) => o.value === value);
  const display = triggerDisplay ?? (selectedOption ? (typeof selectedOption.label === "string" ? selectedOption.label : String(selectedOption?.value)) : null);

  return (
    <Select
      value={value}
      onValueChange={(v) => {
        onValueChange(v);
        setSearch("");
      }}
      open={open}
      onOpenChange={(o) => {
        setOpen(o);
        if (!o) setSearch("");
      }}
      disabled={disabled}
    >
      <SelectTrigger className={cn("w-full", className)} disabled={disabled}>
        <SelectValue>{value ? (display ?? value) : placeholder}</SelectValue>
      </SelectTrigger>
      <SelectContent className={cn(contentClassName)}>
        <div className="sticky top-0 z-10 bg-popover p-2 border-b border-border/50">
          <Input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            onKeyDown={(e) => e.stopPropagation()}
            placeholder={searchPlaceholder}
            className="h-8 text-sm"
            autoComplete="off"
          />
        </div>
        {filtered.length === 0 ? (
          <div className="py-4 text-center text-sm text-muted-foreground">
            No matches
          </div>
        ) : (
          filtered.map((opt) => (
            <SelectItem key={opt.value} value={opt.value}>
              {opt.label}
            </SelectItem>
          ))
        )}
      </SelectContent>
    </Select>
  );
}
