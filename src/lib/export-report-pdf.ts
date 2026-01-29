/**
 * Export a DOM element (report content with visualizations) to a multi-page PDF
 * using html2canvas and jsPDF. Preserves charts and layout as shown on screen.
 */

import html2canvas from "html2canvas";
import { jsPDF } from "jspdf";

const A4_WIDTH_MM = 210;
const A4_HEIGHT_MM = 297;
const SCALE = 2; // higher = sharper text/charts, larger file

export interface ExportReportPdfOptions {
  filename?: string;
  onStart?: () => void;
  onComplete?: () => void;
  onError?: (err: Error) => void;
}

/**
 * Capture the given element and download as PDF (multi-page if content is tall).
 */
export async function exportReportToPdf(
  element: HTMLElement,
  options: ExportReportPdfOptions = {}
): Promise<void> {
  const { filename = "report.pdf", onStart, onComplete, onError } = options;

  try {
    onStart?.();

    const canvas = await html2canvas(element, {
      scale: SCALE,
      useCORS: true,
      allowTaint: true,
      logging: false,
      backgroundColor: "#ffffff",
      windowWidth: element.scrollWidth,
      windowHeight: element.scrollHeight,
      scrollX: 0,
      scrollY: 0,
    });

    const imgWidth = canvas.width;
    const imgHeight = canvas.height;
    const pdf = new jsPDF({ unit: "mm", format: "a4", hotfixes: ["pxScaler"] });

    // Fit content width to A4; compute total height in mm
    const contentWidthMm = A4_WIDTH_MM;
    const contentHeightMm = (imgHeight / imgWidth) * contentWidthMm;
    const totalPages = Math.ceil(contentHeightMm / A4_HEIGHT_MM) || 1;

    const imgData = canvas.toDataURL("image/png");

    for (let page = 0; page < totalPages; page++) {
      if (page > 0) pdf.addPage();
      // Draw the portion of the image for this page (negative y to show the right slice)
      pdf.addImage(
        imgData,
        "PNG",
        0,
        -(page * A4_HEIGHT_MM),
        contentWidthMm,
        contentHeightMm,
        undefined,
        "FAST"
      );
    }

    pdf.save(filename.endsWith(".pdf") ? filename : `${filename}.pdf`);
    onComplete?.();
  } catch (err) {
    const error = err instanceof Error ? err : new Error(String(err));
    onError?.(error);
    throw error;
  }
}
