"use client";
import { DEVISE } from "@/lib/utils/currency";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { PageHeader } from "@/components/ui/PageHeader";
import { StatCard } from "@/components/ui/StatCard";
import { SearchableSelect } from "@/components/ui/SearchableSelect";
import { DataTable, type Column } from "@/components/common/DataTable";
import { SkeletonTable } from "@/components/ui/skeleton";
import {
  rapportsService,
  type RapportSeuilLigne,
} from "@/lib/api/services/rapports.service";
import { emplacementsService } from "@/lib/api/services/emplacements.service";
import { useAuth } from "@/hooks/useAuth";
import { exportToExcel, type ExcelColumn } from "@/lib/utils/exportExcel";
import { saveElementAsPdf } from "@/lib/utils/exportPdf";
import { RapportTablePDF } from "@/components/pdf/RapportTablePDF";
import { formatDateInput } from "@/lib/utils/format";
import {
  AlertTriangle,
  PackageX,
  Boxes,
  TrendingDown,
  FileSpreadsheet,
  FileText,
  RefreshCw,
  Loader2,
  Warehouse,
} from "lucide-react";

function unwrapList<T>(payload: unknown): T[] {
  if (Array.isArray(payload)) return payload as T[];
  const nested = (payload as { data?: unknown } | null)?.data;
  return Array.isArray(nested) ? (nested as T[]) : [];
}

const money = (v: unknown) => Number(v ?? 0).toFixed(2);

export function RapportSeuils({ mode }: { mode: "rupture" | "bas" }) {
  const { societe } = useAuth();
  const isRupture = mode === "rupture";

  const [emplacementId, setEmplacementId] = useState("");
  const [applied, setApplied] = useState<number | undefined>(undefined);

  const { data: emplacements } = useQuery({
    queryKey: ["emplacements-select"],
    queryFn: async () =>
      unwrapList<{ id: number; nom: string; code?: string | null }>(
        (await emplacementsService.getAll({ per_page: 200 })).data
      ),
    staleTime: 5 * 60 * 1000,
  });

  const { data, isLoading, isFetching, refetch } = useQuery({
    queryKey: ["rapport-seuils", mode, applied],
    queryFn: async () => {
      const fn = isRupture
        ? rapportsService.ruptureStock
        : rapportsService.stockBas;
      return (await fn({ emplacement_id: applied })).data;
    },
    staleTime: 0,
  });

  const lignes = (data?.lignes ?? []) as RapportSeuilLigne[];
  const totaux = data?.totaux;

  const emplacementNom =
    emplacements?.find((e) => e.id === applied)?.nom ?? "Tous";

  const columns: Column<RapportSeuilLigne>[] = [
    {
      key: "produit",
      label: "Produit",
      render: (l) => (
        <div className="flex flex-col">
          <span className="font-medium text-slate-800 dark:text-slate-100">{l.produit}</span>
          {l.code && <span className="font-mono text-xs text-slate-400">{l.code}</span>}
        </div>
      ),
    },
    {
      key: "categorie",
      label: "Catégorie",
      hidden: "md" as const,
      render: (l) => l.categorie || "—",
    },
    {
      key: "emplacement",
      label: "Emplacement",
      hidden: "sm" as const,
      render: (l) => (
        <span className="inline-flex items-center gap-1.5 text-slate-600 dark:text-slate-300">
          <Warehouse className="h-3.5 w-3.5 text-slate-400" />
          {l.emplacement || "—"}
        </span>
      ),
    },
    {
      key: "quantite",
      label: "Stock",
      className: "text-right",
      render: (l) => (
        <span
          className={`font-mono font-medium ${
            l.quantite <= 0 ? "text-red-600 dark:text-red-400" : "text-amber-600 dark:text-amber-400"
          }`}
        >
          {l.quantite}
        </span>
      ),
    },
    {
      key: "seuil_minimum",
      label: "Seuil",
      className: "text-right",
      hidden: "lg" as const,
      render: (l) => (
        <span className="font-mono text-slate-500">
          {l.seuil_minimum == null ? "—" : l.seuil_minimum}
        </span>
      ),
    },
    {
      key: "manque",
      label: "Manque",
      className: "text-right",
      render: (l) => (
        <span className="font-mono font-semibold text-red-600 dark:text-red-400">
          {l.manque == null ? "—" : l.manque}
        </span>
      ),
    },
  ];

  const excelColumns: ExcelColumn<RapportSeuilLigne>[] = [
    { header: "Produit", value: (l) => l.produit, width: 30 },
    { header: "Code", value: (l) => l.code ?? "" },
    { header: "Catégorie", value: (l) => l.categorie ?? "" },
    { header: "Emplacement", value: (l) => l.emplacement ?? "" },
    { header: "Stock", value: (l) => Number(l.quantite) },
    { header: "Seuil", value: (l) => (l.seuil_minimum == null ? "" : Number(l.seuil_minimum)) },
    { header: "Manque", value: (l) => (l.manque == null ? "" : Number(l.manque)) },
  ];

  const titre = isRupture ? "Produits en rupture de stock" : "Produits en stock bas";
  const filename = `${isRupture ? "rupture-stock" : "stock-bas"}_${formatDateInput(new Date())}`;

  const handleExcel = () =>
    exportToExcel({
      rows: lignes,
      columns: excelColumns,
      filename,
      sheetName: isRupture ? "Rupture" : "Stock bas",
      meta: [
        { label: "Rapport", value: titre },
        { label: "Emplacement", value: emplacementNom },
      ],
      totals: {
        Produit: "TOTAUX",
        Code: "",
        Catégorie: "",
        Emplacement: "",
        Stock: Number(totaux?.quantite_totale ?? 0),
        Seuil: "",
        Manque: Number(totaux?.manque_total ?? 0),
      },
    });

  const handlePdf = () =>
    saveElementAsPdf(
      <RapportTablePDF
        title={titre}
        subtitle={isRupture ? "Stock épuisé" : "Stock sous le seuil minimum"}
        company={societe?.nom || "GS Stock"}
        columns={[
          { header: "Produit", flex: 2.4, value: (l: RapportSeuilLigne) => l.produit },
          { header: "Code", flex: 1.2, value: (l: RapportSeuilLigne) => l.code ?? "-" },
          { header: "Catégorie", flex: 1.4, value: (l: RapportSeuilLigne) => l.categorie ?? "-" },
          { header: "Emplacement", flex: 1.4, value: (l: RapportSeuilLigne) => l.emplacement ?? "-" },
          {
            header: "Stock",
            flex: 0.9,
            align: "right",
            value: (l: RapportSeuilLigne) => l.quantite,
          },
          {
            header: "Seuil",
            flex: 0.9,
            align: "right",
            value: (l: RapportSeuilLigne) => (l.seuil_minimum == null ? "-" : l.seuil_minimum),
          },
          {
            header: "Manque",
            flex: 0.9,
            align: "right",
            value: (l: RapportSeuilLigne) => (l.manque == null ? "-" : l.manque),
          },
        ]}
        rows={lignes}
        meta={[{ label: "Emplacement", value: emplacementNom }]}
        stats={[
          { label: "Produits", value: Number(totaux?.nombre_produits ?? 0) },
          { label: "Stock total", value: Number(totaux?.quantite_totale ?? 0) },
          { label: "Manque total", value: Number(totaux?.manque_total ?? 0) },
        ]}
      />,
      filename
    );

  return (
    <div className="space-y-5">
      <PageHeader
        title={titre}
        description={
          isRupture
            ? "Produits dont le stock est épuisé"
            : "Produits sous le seuil minimum d'alerte"
        }
        icon={isRupture ? <PackageX className="h-5 w-5" /> : <AlertTriangle className="h-5 w-5" />}
        actions={
          <>
            <Button variant="outline" onClick={() => refetch()} disabled={isFetching}>
              {isFetching ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <RefreshCw className="mr-2 h-4 w-4" />
              )}
              Actualiser
            </Button>
            <Button variant="outline" onClick={handleExcel} disabled={lignes.length === 0}>
              <FileSpreadsheet className="mr-2 h-4 w-4" /> Excel
            </Button>
            <Button onClick={handlePdf} disabled={lignes.length === 0}>
              <FileText className="mr-2 h-4 w-4" /> PDF
            </Button>
          </>
        }
      />

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          title="Produits"
          value={Number(totaux?.nombre_produits ?? 0)}
          icon={<Boxes className="h-5 w-5" />}
          color="blue"
        />
        <StatCard
          title="Stock total"
          value={Number(totaux?.quantite_totale ?? 0)}
          icon={<TrendingDown className="h-5 w-5" />}
          color="amber"
        />
        <StatCard
          title="Manque total"
          value={Number(totaux?.manque_total ?? 0)}
          icon={<PackageX className="h-5 w-5" />}
          color="rose"
        />
        <StatCard
          title="Valeur du stock"
          value={`${money(totaux?.valeur_totale)} ${DEVISE}`}
          icon={<Warehouse className="h-5 w-5" />}
          color="emerald"
        />
      </div>

      <Card>
        <CardContent className="p-5">
          <div className="mb-4 grid gap-4 sm:grid-cols-3">
            <div>
              <label className="mb-1.5 block text-sm font-medium text-slate-700 dark:text-slate-300">
                Emplacement
              </label>
              <SearchableSelect
                options={(emplacements ?? []).map((e) => ({
                  id: e.id,
                  nom: e.nom,
                  sousTitre: e.code ?? undefined,
                }))}
                value={emplacementId}
                onValueChange={setEmplacementId}
                placeholder="Tous les emplacements"
              />
            </div>
            <div className="flex items-end">
              <Button
                className="w-full"
                onClick={() =>
                  setApplied(emplacementId ? Number(emplacementId) : undefined)
                }
              >
                <RefreshCw className="mr-2 h-4 w-4" /> Appliquer
              </Button>
            </div>
          </div>

          {isLoading ? (
            <SkeletonTable />
          ) : (
            <DataTable
              data={lignes}
              columns={columns}
              loading={false}
              emptyMessage={isRupture ? "Aucun produit en rupture" : "Aucun produit en stock bas"}
              emptyIcon={isRupture ? <PackageX className="h-12 w-12" /> : <AlertTriangle className="h-12 w-12" />}
            />
          )}
        </CardContent>
      </Card>
    </div>
  );
}
