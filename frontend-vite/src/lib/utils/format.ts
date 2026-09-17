import { format } from "date-fns";
import { fr } from "date-fns/locale";

export function formatDateShort(date: string | Date | null | undefined): string {
  if (!date) return "-";
  const d = typeof date === "string" ? new Date(date) : date;
  if (isNaN(d.getTime())) return "-";
  return format(d, "dd/MM/yyyy", { locale: fr });
}

export function formatDateLong(date: string | Date | null | undefined): string {
  if (!date) return "-";
  const d = typeof date === "string" ? new Date(date) : date;
  if (isNaN(d.getTime())) return "-";
  return format(d, "dd MMMM yyyy", { locale: fr });
}

export function formatDateTime(date: string | Date | null | undefined): string {
  if (!date) return "-";
  const d = typeof date === "string" ? new Date(date) : date;
  if (isNaN(d.getTime())) return "-";
  return format(d, "dd/MM/yyyy HH:mm", { locale: fr });
}

export function formatCompact(
  value: number | string | null | undefined
): string {
  const n =
    typeof value === "string"
      ? Number(value.replace(/[\s\u00A0]/g, "").replace(",", "."))
      : Number(value);
  if (!isFinite(n)) return "-";

  const abs = Math.abs(n);
  const withSuffix = (v: number, suffix: string) =>
    `${(Math.round(v * 100) / 100).toLocaleString("fr-FR", {
      maximumFractionDigits: 2,
    })} ${suffix}`;

  if (abs >= 1_000_000_000) return withSuffix(n / 1_000_000_000, "Md");
  if (abs >= 1_000_000) return withSuffix(n / 1_000_000, "M");
  if (abs >= 1_000) return withSuffix(n / 1_000, "k");
  return n.toLocaleString("fr-FR", { maximumFractionDigits: 2 });
}

export function formatDateInput(date: string | Date | null | undefined): string {
  if (!date) return "";
  const d = typeof date === "string" ? new Date(date) : date;
  if (isNaN(d.getTime())) return "";
  return format(d, "yyyy-MM-dd");
}
