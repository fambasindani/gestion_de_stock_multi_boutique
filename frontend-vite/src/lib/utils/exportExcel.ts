import * as XLSX from "xlsx";

export interface ExcelColumn<T> {
  header: string;
  value: (row: T) => string | number;
  width?: number;
}

export interface ExportMeta {
  label: string;
  value: string | number;
}

export interface ExportToExcelOptions<T> {
  rows: T[];
  columns: ExcelColumn<T>[];
  filename: string;
  sheetName?: string;
  totals?: Record<string, string | number>;
  meta?: ExportMeta[];
}

/**
 * Exporte un jeu de données en fichier Excel (.xlsx) côté navigateur.
 * Multi-secteur : fonctionne pour tout type de produits (alimentaire, entretien, habillement...).
 */
export function exportToExcel<T>({
  rows,
  columns,
  filename,
  sheetName = "Rapport",
  totals,
  meta,
}: ExportToExcelOptions<T>): void {
  const aoa: (string | number)[][] = [];

  if (meta?.length) {
    meta.forEach((m) => aoa.push([m.label, m.value]));
    aoa.push([]);
  }

  aoa.push(columns.map((c) => c.header));
  rows.forEach((row) => aoa.push(columns.map((c) => c.value(row))));
  if (totals) aoa.push(columns.map((c) => totals[c.header] ?? ""));

  const ws = XLSX.utils.aoa_to_sheet(aoa);
  const colWidths = columns.map((c) => ({
    wch: Math.min(Math.max(c.header.length + 4, c.width ?? 14), 42),
  }));
  ws["!cols"] = meta?.length
    ? [{ wch: 24 }, { wch: 24 }, ...colWidths]
    : colWidths;

  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, sheetName.slice(0, 31));
  XLSX.writeFile(wb, filename.endsWith(".xlsx") ? filename : `${filename}.xlsx`);
}

/**
 * Export simple à partir d'objets déjà formés.
 */
export function exportJsonToExcel(
  rows: Record<string, string | number>[],
  filename: string,
  sheetName = "Rapport"
): void {
  const ws = XLSX.utils.json_to_sheet(rows);
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, sheetName.slice(0, 31));
  XLSX.writeFile(wb, filename.endsWith(".xlsx") ? filename : `${filename}.xlsx`);
}
