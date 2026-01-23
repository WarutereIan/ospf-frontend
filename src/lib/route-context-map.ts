/**
 * Route–context map: which contexts should fetch data for a given path.
 * Used to avoid eager fetching from all contexts on every page load.
 */

import { isPublicPath, isPathAllowedForRole } from "@/lib/route-config";
import type { UserRole } from "@/contexts/AuthContext";

export type DataContextKey =
  | "marketplace"
  | "transport"
  | "aggregation"
  | "input"
  | "payment"
  | "notification"
  | "staff";

function pathPrefix(pathname: string, prefixes: string[]): boolean {
  return prefixes.some((p) => pathname === p || pathname.startsWith(`${p}/`));
}

/**
 * Returns which data contexts should run their initial fetch for the current route.
 * Only returns contexts whose data is used on that route.
 */
export function getContextsForPath(pathname: string): Set<DataContextKey> {
  const out = new Set<DataContextKey>();

  if (isPublicPath(pathname)) return out;

  if (
    pathname === "/marketplace" ||
    pathname === "/farmer/marketplace" ||
    pathPrefix(pathname, ["/dashboard/buyer", "/dashboard/farmer", "/dashboard/produce", "/dashboard/orders"])
  )
    out.add("marketplace");

  if (
    pathPrefix(pathname, [
      "/dashboard/farmer/pickup-schedules",
      "/dashboard/transport-provider",
      "/dashboard/transport-requests",
      "/dashboard/collection",
      "/dashboard/deliveries",
      "/dashboard/completed-deliveries",
      "/dashboard/buyer/deliveries",
    ])
  )
    out.add("transport");

  if (
    pathPrefix(pathname, ["/dashboard/aggregation", "/dashboard/county-officer", "/dashboard/staff"])
  )
    out.add("aggregation");

  if (
    pathPrefix(pathname, [
      "/dashboard/inputs",
      "/dashboard/input-inventory",
      "/dashboard/input-orders",
      "/dashboard/customers",
    ]) ||
    pathname === "/marketplace/inputs" ||
    pathname.startsWith("/marketplace/inputs/")
  )
    out.add("input");

  if (
    pathPrefix(pathname, ["/dashboard/payments", "/dashboard/earnings", "/dashboard/buyer/orders"])
  )
    out.add("payment");

  if (pathPrefix(pathname, ["/dashboard/staff"])) out.add("staff");

  return out;
}

/**
 * Whether the given context should fetch on this path for this role.
 * Prevents fetching when path doesn't match, user isn't authenticated, or role can't access the path.
 */
export function shouldFetchContext(
  pathname: string,
  role: UserRole | null,
  contextKey: DataContextKey
): boolean {
  if (isPublicPath(pathname)) return false;
  if (!role) return false;
  if (!isPathAllowedForRole(pathname, role)) return false;
  return getContextsForPath(pathname).has(contextKey);
}
