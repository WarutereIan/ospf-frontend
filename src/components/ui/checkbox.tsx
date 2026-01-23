import * as React from "react"
import { IconCheck } from "@tabler/icons-react"
import { cn } from "@/lib/utils"

export interface CheckboxProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, "type" | "checked" | "onChange"> {
  checked?: boolean
  onCheckedChange?: (checked: boolean) => void
}

const Checkbox = React.forwardRef<HTMLInputElement, CheckboxProps>(
  ({ className, checked, onCheckedChange, disabled, id, ...props }, ref) => {
    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      if (onCheckedChange) {
        onCheckedChange(e.target.checked)
      }
    }

    return (
      <div className="relative inline-flex items-center justify-center">
        <input
          type="checkbox"
          id={id}
          ref={ref}
          checked={checked ?? false}
          onChange={handleChange}
          disabled={disabled}
          className={cn(
            "peer h-4 w-4 shrink-0 rounded-sm border border-primary ring-offset-background",
            "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
            "disabled:cursor-not-allowed disabled:opacity-50",
            "checked:bg-primary checked:border-primary",
            "appearance-none cursor-pointer transition-colors",
            className
          )}
          {...props}
        />
        {checked && (
          <IconCheck className="absolute h-3 w-3 text-primary-foreground pointer-events-none z-10" />
        )}
      </div>
    )
  }
)
Checkbox.displayName = "Checkbox"

export { Checkbox }
