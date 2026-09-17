// Devise d'affichage globale (pilotée par le paramètre `devise` de la société).
export let DEVISE =
  (typeof localStorage !== "undefined" && localStorage.getItem("devise")) || "CDF";

export function setDevise(value?: string | null): void {
  DEVISE = value && value.trim() ? value.trim() : "CDF";
  if (typeof localStorage !== "undefined") {
    localStorage.setItem("devise", DEVISE);
  }
}
