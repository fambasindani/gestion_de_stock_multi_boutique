// Recherche "live" : applique la valeur après une courte pause de frappe.
// Un seul minuteur global suffit (une seule barre de recherche active à la fois).
let timer: ReturnType<typeof setTimeout> | undefined;

export function liveSearch(apply: () => void, delay = 350): void {
  if (timer) clearTimeout(timer);
  timer = setTimeout(() => {
    timer = undefined;
    apply();
  }, delay);
}
