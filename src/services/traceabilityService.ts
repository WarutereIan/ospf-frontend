/**
 * Traceability Service
 *
 * Public batch/QR traceability lookup. No auth required.
 * Backend: GET /api/v1/traceability/batch/:identifier
 * Identifier can be batchId (e.g. BATCH-20260128-123456-ABC) or QR value (e.g. QR-BATCH-...).
 */

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:3000";
const API_PREFIX = import.meta.env.VITE_API_PREFIX || "api/v1";

export interface TraceabilityStep {
  id: string;
  stage: string;
  location: string;
  timestamp: string;
  actor: string;
  actorRole?: string;
  status: "completed" | "pending" | "current";
  notes?: string;
  photos?: string[];
  metadata?: {
    temperature?: string;
    humidity?: string;
    qualityGrade?: string;
    quantity?: number;
    duration?: string;
  };
}

export interface BatchTraceabilityInfo {
  batchId: string;
  qrCode?: string;
  variety: string;
  quantity: number;
  qualityGrade: "A" | "B" | "C";
  farmerId: string;
  farmerName: string;
  farmerLocation: string;
  farmerPhone?: string;
  aggregationCenter: string;
  aggregationCenterType?: "main" | "satellite";
  receiptId?: string;
  steps: TraceabilityStep[];
  currentStatus: string;
  currentLocation?: string;
}

/**
 * Build the public verify URL for a batch (for use in QR codes).
 * Scanning the QR opens the verify page with this batch.
 */
export function getBatchVerifyUrl(batchIdOrQr: string): string {
  if (typeof window === "undefined") return "";
  const base = window.location.origin;
  return `${base}/verify?q=${encodeURIComponent((batchIdOrQr || "").trim())}`;
}

/**
 * Fetch batch traceability by batch ID or QR code value.
 * Public endpoint - no auth required. Use from verify page or in-app.
 */
export async function getBatchTraceability(
  identifier: string
): Promise<BatchTraceabilityInfo | null> {
  const trimmed = (identifier || "").trim();
  if (!trimmed) return null;

  const url = `${API_BASE_URL}/${API_PREFIX}/traceability/batch/${encodeURIComponent(trimmed)}`;
  const res = await fetch(url, { credentials: "omit" });
  if (!res.ok) {
    if (res.status === 404) return null;
    throw new Error(res.status === 404 ? "Batch not found" : `Traceability lookup failed: ${res.status}`);
  }
  const json = await res.json();
  const data = json?.data ?? json;
  return data as BatchTraceabilityInfo;
}
