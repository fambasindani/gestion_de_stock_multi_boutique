const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api";
const API_ORIGIN = API_URL.replace(/\/api\/?$/, "");

/**
 * Résout l'URL d'un média renvoyé par l'API (logo, image...).
 * Accepte une URL absolue, un data-URI, ou un chemin relatif (/logos/xxx.png).
 */
export function resolveMediaUrl(path?: string | null): string | null {
  if (!path) return null;
  if (/^(https?:)?\/\//i.test(path) || path.startsWith("data:")) return path;
  return `${API_ORIGIN}${path.startsWith("/") ? "" : "/"}${path}`;
}
