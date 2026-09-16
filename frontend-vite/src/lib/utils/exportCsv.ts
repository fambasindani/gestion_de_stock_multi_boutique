import { Cookies } from "@/lib/utils/cookies";

const API_URL =
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api";

function buildUrl(path: string, params: Record<string, string> = {}): string {
  const query = new URLSearchParams(params).toString();
  return `${API_URL}${path}${query ? `?${query}` : ""}`;
}

function triggerDownload(blob: Blob, filename: string): void {
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
}

export async function downloadBlob(
  path: string,
  params: Record<string, string>,
  filename: string
): Promise<void> {
  const token = Cookies.get("auth_token");
  const res = await fetch(buildUrl(path, params), {
    headers: {
      Accept: "*/*",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
  });
  if (!res.ok) throw new Error(`Export échoué (${res.status})`);
  triggerDownload(await res.blob(), filename);
}

/**
 * Télécharge un export CSV depuis un endpoint de l'API (avec token d'auth).
 */
export function downloadCsv(
  path: string,
  params: Record<string, string>,
  filename: string
): Promise<void> {
  return downloadBlob(path, params, filename);
}

/**
 * Télécharge un PDF généré côté serveur (avec token d'auth).
 */
export function downloadPdf(
  path: string,
  params: Record<string, string>,
  filename: string
): Promise<void> {
  return downloadBlob(path, params, filename);
}
