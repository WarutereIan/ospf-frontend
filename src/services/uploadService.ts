/**
 * Upload Service
 *
 * Handles image (and file) uploads to the backend.
 * Backend: POST /api/v1/upload/image (multipart/form-data, field: file)
 * Returns URL path to the uploaded file (e.g. /api/v1/uploads/xxx).
 */

import { apiPostFormData } from "@/lib/api-client";

// Must match backend origin so img src requests hit the API (uploads are served there)
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:3000";

export interface UploadImageResult {
  url: string;
}

/**
 * Upload a single image. Allowed: JPEG, PNG, WebP, GIF. Max 10MB.
 * Returns the URL path to use when displaying or storing (e.g. in forms).
 */
export async function uploadImage(file: File): Promise<UploadImageResult> {
  const formData = new FormData();
  formData.append("file", file);
  const response = await apiPostFormData<{ url: string }>(
    "/upload/image",
    formData
  );
  const url = response?.url;
  if (!url) {
    throw new Error("Upload failed: no URL returned");
  }
  return { url };
}

/**
 * Upload multiple images. Returns array of URL paths in the same order.
 */
export async function uploadImages(files: File[]): Promise<UploadImageResult[]> {
  const results = await Promise.all(files.map((file) => uploadImage(file)));
  return results;
}

/**
 * Build full URL for an uploaded image path (for use in img src).
 * Use when the backend returns a path like /api/v1/uploads/xxx.
 */
export function getImageFullUrl(path: string): string {
  if (!path) return "";
  if (path.startsWith("http://") || path.startsWith("https://")) return path;
  const base = API_BASE_URL.replace(/\/$/, "");
  return base ? `${base}${path.startsWith("/") ? path : `/${path}`}` : path;
}
