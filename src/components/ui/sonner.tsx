/**
 * Sonner-style Toaster - re-exports the app Toaster so imports resolve without the sonner package.
 * The app uses @/components/ui/toaster (radix) in App.tsx.
 */
import { Toaster as AppToaster } from "@/components/ui/toaster";

export function Toaster() {
  return <AppToaster />;
}
