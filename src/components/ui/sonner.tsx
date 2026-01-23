import { Toaster as Sonner } from "sonner"

type ToasterProps = React.ComponentProps<typeof Sonner>

const Toaster = ({ ...props }: ToasterProps) => {
  return (
    <Sonner
      theme="light"
      className="toaster group"
      toastOptions={{
        classNames: {
          toast:
            "group toast group-[.toaster]:bg-white group-[.toaster]:text-stone-950 group-[.toaster]:border-stone-200 group-[.toaster]:shadow-lg",
          description: "group-[.toast]:text-stone-500",
          actionButton:
            "group-[.toast]:bg-stone-900 group-[.toast]:text-stone-50",
          cancelButton:
            "group-[.toast]:bg-stone-100 group-[.toast]:text-stone-500",
          error:
            "bg-red-50 border-red-300 text-red-900 shadow-xl min-w-[400px] text-base font-semibold",
          errorDescription: "text-red-700 text-sm mt-1",
        },
      }}
      {...props}
    />
  )
}

export { Toaster }
