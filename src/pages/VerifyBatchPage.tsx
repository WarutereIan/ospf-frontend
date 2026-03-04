import { useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import { BatchTraceabilityDialog } from "@/components/buyer/BatchTraceabilityDialog";
import { getBatchTraceability } from "@/services/traceabilityService";
import { IconQrcode } from "@tabler/icons-react";

/**
 * Public batch/QR traceability verification page.
 * URL: /verify or /verify?q=BATCH-xxx or /verify?q=QR-BATCH-xxx
 * No login required. Used when someone scans a QR code or opens a shared link.
 */
export function VerifyBatchPage() {
  const [searchParams] = useSearchParams();
  const q = searchParams.get("q")?.trim() || "";
  const [dialogOpen, setDialogOpen] = useState(false);
  const [initialBatchId, setInitialBatchId] = useState("");

  useEffect(() => {
    if (q) {
      setInitialBatchId(q);
      setDialogOpen(true);
    } else {
      setInitialBatchId("");
      setDialogOpen(false);
    }
  }, [q]);

  return (
    <div className="min-h-screen bg-stone-50 flex flex-col items-center justify-start p-4 sm:p-6">
      <header className="w-full max-w-2xl text-center mb-6">
        <div className="flex items-center justify-center gap-2 text-orange-600 mb-2">
          <IconQrcode className="h-8 w-8" />
          <h1 className="text-xl font-semibold text-stone-900">Batch Traceability</h1>
        </div>
        <p className="text-sm text-stone-600">
          Verify a batch by scanning its QR code or entering the Batch ID below.
        </p>
      </header>

      {!q && (
        <div className="w-full max-w-md">
          <button
            type="button"
            onClick={() => {
              setInitialBatchId("");
              setDialogOpen(true);
            }}
            className="w-full py-3 px-4 rounded-lg border-2 border-dashed border-stone-300 hover:border-orange-400 hover:bg-orange-50/50 text-stone-600 hover:text-orange-700 font-medium transition-colors"
          >
            Enter Batch ID or Scan QR
          </button>
        </div>
      )}

      <BatchTraceabilityDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        batchId={initialBatchId || undefined}
        onLookup={getBatchTraceability}
      />
    </div>
  );
}
