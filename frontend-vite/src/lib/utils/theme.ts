const STORAGE_KEY = "theme";

export function isDark(): boolean {
  if (typeof document === "undefined") return false;
  return document.documentElement.classList.contains("dark");
}

export function initTheme(): void {
  if (typeof window === "undefined") return;
  const saved = localStorage.getItem(STORAGE_KEY);
  const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
  const dark = saved ? saved === "dark" : prefersDark;
  document.documentElement.classList.toggle("dark", dark);
}

export function toggleTheme(): boolean {
  if (typeof document === "undefined") return false;
  const dark = !isDark();
  document.documentElement.classList.toggle("dark", dark);
  localStorage.setItem(STORAGE_KEY, dark ? "dark" : "light");
  return dark;
}
