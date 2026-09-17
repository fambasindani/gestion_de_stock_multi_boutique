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

/**
 * URL du logo d'une société, servie par l'API (donc avec CORS — nécessaire
 * pour l'intégrer dans les PDF @react-pdf/renderer).
 */
export function resolveLogoUrl(
  societe?: { id?: number | null; logo?: string | null } | null
): string | null {
  if (!societe) return null;
  if (societe.logo == null) return null;
  if (societe.id) {
    // `v` change à chaque nouvel upload → évite le cache navigateur/PDF.
    const v = encodeURIComponent(societe.logo);
    return `${API_ORIGIN}/api/logo/${societe.id}?v=${v}`;
  }
  return resolveMediaUrl(societe.logo);
}
