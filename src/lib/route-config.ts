/**
 * Route–role configuration for route protection and access control.
 * Central source of truth for which roles can access which paths.
 */

import type { UserRole } from "@/contexts/AuthContext";

export interface RouteRoleRule {
  /** Path or path prefix (e.g. "/dashboard/farmer" matches /dashboard/farmer and /dashboard/farmer/...). */
  pattern: string;
  /** Roles allowed to access. Empty = public (no auth required). */
  roles: UserRole[];
}

/** Route rules: order matters; first match wins. More specific paths should come first. */
const ROUTE_ROLE_RULES: RouteRoleRule[] = [
  { pattern: "/login", roles: [] },
  { pattern: "/register", roles: [] },

  { pattern: "/dashboard/staff", roles: ["staff"] },
  { pattern: "/dashboard/county-officer", roles: ["officer", "county_officer"] },
  { pattern: "/dashboard/aggregation", roles: ["aggregation_manager"] },
  { pattern: "/dashboard/input-provider", roles: ["input_provider"] },
  { pattern: "/dashboard/transport-provider", roles: ["transport_provider"] },

  { pattern: "/dashboard/farmer", roles: ["farmer"] },
  { pattern: "/farmer/marketplace", roles: ["farmer"] },

  { pattern: "/dashboard/buyer", roles: ["buyer"] },
  { pattern: "/dashboard/buyer/marketplace", roles: ["buyer"] },

  { pattern: "/dashboard/produce", roles: ["farmer"] },
  { pattern: "/dashboard/orders", roles: ["farmer"] },

  { pattern: "/marketplace/inputs", roles: ["farmer"] },

  { pattern: "/dashboard/inputs", roles: ["input_provider"] },
  { pattern: "/dashboard/input-inventory", roles: ["input_provider"] },
  { pattern: "/dashboard/input-orders", roles: ["input_provider"] },
  { pattern: "/dashboard/customers", roles: ["input_provider"] },

  { pattern: "/dashboard/transport-requests", roles: ["transport_provider"] },
  { pattern: "/dashboard/collection", roles: ["transport_provider"] },
  { pattern: "/dashboard/deliveries", roles: ["transport_provider"] },
  { pattern: "/dashboard/completed-deliveries", roles: ["transport_provider"] },
  { pattern: "/dashboard/earnings", roles: ["transport_provider"] },

  { pattern: "/dashboard/payments", roles: ["farmer", "buyer", "input_provider", "transport_provider"] },

  { pattern: "/marketplace", roles: ["farmer", "buyer"] },
  { pattern: "/", roles: ["farmer", "buyer", "officer", "county_officer", "staff", "aggregation_manager", "input_provider", "transport_provider"] },
];

function pathMatches(pattern: string, pathname: string): boolean {
  if (pattern === pathname) return true;
  const prefix = pattern.endsWith("/") ? pattern : `${pattern}/`;
  return pathname.startsWith(prefix) || pathname === pattern;
}

/**
 * Returns roles allowed to access the given path.
 * Empty array = public (no auth required). For protected routes, returns non-empty array.
 */
export function getAllowedRolesForPath(pathname: string): UserRole[] {
  const norm = pathname.replace(/\/$/, "") || "/";
  for (const { pattern, roles } of ROUTE_ROLE_RULES) {
    const p = pattern.replace(/\/$/, "") || "/";
    if (pathMatches(p, norm)) return roles;
  }
  return ["farmer", "buyer", "officer", "county_officer", "staff", "aggregation_manager", "input_provider", "transport_provider"];
}

/**
 * Whether the path is public (no login required).
 */
export function isPublicPath(pathname: string): boolean {
  return getAllowedRolesForPath(pathname).length === 0;
}

/**
 * Whether the given role can access the path.
 * Public paths (no roles) are allowed for everyone when not checking auth.
 */
export function isPathAllowedForRole(pathname: string, role: UserRole | null): boolean {
  const allowed = getAllowedRolesForPath(pathname);
  if (allowed.length === 0) return true;
  if (!role) return false;
  return allowed.includes(role);
}
