"use client";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { PageHeader } from "@/components/ui/PageHeader";
import { StatCard } from "@/components/ui/StatCard";
import { FormInput } from "@/components/common/FormInput";
import { SearchableSelect } from "@/components/ui/SearchableSelect";
import { DataTable, DataTableBadge, type Column } from "@/components/common/DataTable";
import { SkeletonTable } from "@/components/ui/skeleton";
import {
  rapportsService,
  type VariationPrixLigne,
} from "@/lib/api/services/rapports.service";
import { produitsService } from "@/lib/api/services/produits.service";
import { useAuth } from "@/hooks/useAuth";
import { exportToExcel, type ExcelColumn } from "@/lib/utils/exportExcel";
import { saveElementAsPdf } from "@/lib/utils/exportPdf";
import { RapportTablePDF } from "@/components/pdf/RapportTablePDF";
import { formatDateInput } from "@/lib/utils/format";
import {
  TrendingUp,
  TrendingDown,
  Minus,
  FileSpreadsheet,
  FileText,
  RefreshCw,
  Loader2,
  LineChart,
} from "lucide-react";

const money = (v: unknown) => Number(v ?? 0).toFixed(2);

function unwrapList<T>(payload: unknown): T[] {
  if (Array.isArray(payload)) return payload as T[];
  const nested = (payload as { data?: unknown } | null)?.data;
  return Array.isArray(nested) ? (nested as T[]) : [];
}

export default function VariationsPrixPage() {
  const { societe } = useAuth();
  const [dateDebut, setDateDebut] = useState("");
  const [dateFin, setDateFin] = useState("");
  const [produitId, setProduitId] = useState("");
  const [applied, setApplied] = useState<{
    date_debut?: string;
    date_fin?: string;
    produit_id?: number;
  }>({});

  const { data: produits } = useQuery({
    queryKey: ["produits-variantes-select"],
    queryFn: async () => {
      const res = await produitsService.getAll({ per_page: 500 });
      const modeles = unwrapList<{
        nom: string;
        variantes?: Array<{ id: number; nom: string | null; code_interne: string | null }>;
      }>(res.data);
      const flat: { id: number; nom: string; sousTitre?: string }[] = [];
      for (const m of modeles) {
        for (const v of m.variantes ?? []) {
          flat.push({
            id: v.id,
            nom: v.nom && v.nom !== m.nom ? `${m.nom} — ${v.nom}` : m.nom,
            sousTitre: v.code_interne ?? undefined,
          });
        }
      }
      return flat;
    },
    staleTime: 5 * 60 * 1000,
  });

  const { data, isLoading, isFetching, refetch } = useQuery({
    queryKey: ["rapport-variations-prix", applied],
    queryFn: async () => (await rapportsService.variationsPrix(applied)).data,
    staleTime: 0,
  });

  const lignes = (data?.lignes ?? []) as VariationPrixLigne[];
  const totaux = data?.totaux;

  const columns: Column<VariationPrixLigne>[] = [
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
      key: "nombre_achats",
      label: "Achats",
      className: "text-right",
      hidden: "sm" as const,
      render: (l) => <span className="font-mono">{l.nombre_achats}</span>,
    },
    {
      key: "prix_min",
      label: "Prix min",
      className: "text-right",
      hidden: "md" as const,
      render: (l) => <span className="font-mono">{money(l.prix_min)}</span>,
    },
    {
      key: "prix_max",
      label: "Prix max",
      className: "text-right",
      hidden: "md" as const,
      render: (l) => <span className="font-mono">{money(l.prix_max)}</span>,
    },
    {
      key: "premier_prix",
      label: "Premier → Dernier",
      className: "text-right",
      render: (l) => (
        <span className="font-mono text-sm">
          {money(l.premier_prix)} → {money(l.dernier_prix)}
        </span>
      ),
    },
    {
      key: "variation_pct",
      label: "Variation",
      className: "text-right",
      render: (l) => (
        <span
          className={`font-mono font-semibold ${
            l.tendance === "hausse"
              ? "text-red-600 dark:text-red-400"
              : l.tendance === "baisse"
                ? "text-emerald-600 dark:text-emerald-400"
                : "text-slate-400"
          }`}
        >
          {l.variation_pct > 0 ? "+" : ""}
          {l.variation_pct}%
        </span>
      ),
    },
    {
      key: "tendance",
      label: "Tendance",
      render: (l) => (
        <DataTableBadge
          variant={l.tendance === "hausse" ? "danger" : l.tendance === "baisse" ? "success" : "default"}
        >
          {l.tendance === "hausse" ? "Hausse" : l.tendance === "baisse" ? "Baisse" : "Stable"}
        </DataTableBadge>
      ),
    },
  ];

  const excelColumns: ExcelColumn<VariationPrixLigne>[] = [
    { header: "Produit", value: (l) => l.produit, width: 30 },
    { header: "Code", value: (l) => l.code ?? "" },
    { header: "Achats", value: (l) => l.nombre_achats },
    { header: "Prix min", value: (l) => Number(l.prix_min) },
    { header: "Prix max", value: (l) => Number(l.prix_max) },
    { header: "Premier prix", value: (l) => Number(l.premier_prix) },
    { header: "Dernier prix", value: (l) => Number(l.dernier_prix) },
    { header: "Variation %", value: (l) => Number(l.variation_pct) },
    { header: "Tendance", value: (l) => l.tendance },
  ];

  const periode =
    applied.date_debut || applied.date_fin
      ? `${applied.date_debut || "..."} → ${applied.date_fin || "..."}`
      : "Toutes les dates";
  const filename = `variations-prix_${formatDateInput(new Date())}`;

  const handleExcel = () =>
    exportToExcel({
      rows: lignes,
      columns: excelColumns,
      filename,
      sheetName: "Variations prix",
      meta: [{ label: "Période", value: periode }],
    });

  const handlePdf = () =>
    saveElementAsPdf(
      <RapportTablePDF
        title="Variations des prix d'achat"
        subtitle="Prix constatés par produit"
        company={societe?.nom || "GS Stock"}
        orientation="landscape"
        columns={[
          { header: "Produit", flex: 2.4, value: (l: VariationPrixLigne) => l.produit },
          { header: "Code", flex: 1.2, value: (l: VariationPrixLigne) => l.code ?? "-" },
          { header: "Achats", flex: 0.8, align: "right", value: (l: VariationPrixLigne) => l.nombre_achats },
          { header: "Prix min", flex: 1, align: "right", value: (l: VariationPrixLigne) => money(l.prix_min) },
          { header: "Prix max", flex: 1, align: "right", value: (l: VariationPrixLigne) => money(l.prix_max) },
          { header: "Premier", flex: 1, align: "right", value: (l: VariationPrixLigne) => money(l.premier_prix) },
          { header: "Dernier", flex: 1, align: "right", value: (l: VariationPrixLigne) => money(l.dernier_prix) },
          {
            header: "Variation",
            flex: 1,
            align: "right",
            value: (l: VariationPrixLigne) => `${l.variation_pct > 0 ? "+" : ""}${l.variation_pct}%`,
          },
        ]}
        rows={lignes}
        meta={[{ label: "Période", value: periode }]}
        stats={[
          { label: "Produits", value: Number(totaux?.nombre_produits ?? 0) },
          { label: "En hausse", value: Number(totaux?.en_hausse ?? 0) },
          { label: "En baisse", value: Number(totaux?.en_baisse ?? 0) },
        ]}
      />,
      filename
    );

  return (
    <div className="space-y-5">
      <PageHeader
        title="Variations des prix"
        description="Évolution des prix d'achat par produit sur une période"
        icon={<LineChart className="h-5 w-5" />}
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

      <div className="grid gap-4 sm:grid-cols-3">
        <StatCard
          title="Produits suivis"
          value={Number(totaux?.nombre_produits ?? 0)}
          icon={<LineChart className="h-5 w-5" />}
          color="blue"
        />
        <StatCard
          title="En hausse"
          value={Number(totaux?.en_hausse ?? 0)}
          icon={<TrendingUp className="h-5 w-5" />}
          color="rose"
        />
        <StatCard
          title="En baisse"
          value={Number(totaux?.en_baisse ?? 0)}
          icon={<TrendingDown className="h-5 w-5" />}
          color="emerald"
        />
      </div>

      <Card>
        <CardContent className="p-5">
          <div className="mb-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <FormInput
              label="Date début"
              name="date_debut"
              type="date"
              value={dateDebut}
              onChange={(e) => setDateDebut(e.target.value)}
            />
            <FormInput
              label="Date fin"
              name="date_fin"
              type="date"
              value={dateFin}
              onChange={(e) => setDateFin(e.target.value)}
            />
            <div>
              <label className="mb-1.5 block text-sm font-medium text-slate-700 dark:text-slate-300">
                Produit
              </label>
              <SearchableSelect
                options={produits ?? []}
                value={produitId}
                onValueChange={setProduitId}
                placeholder="Tous les produits"
              />
            </div>
            <div className="flex items-end">
              <Button
                className="w-full"
                onClick={() =>
                  setApplied({
                    date_debut: dateDebut || undefined,
                    date_fin: dateFin || undefined,
                    produit_id: produitId ? Number(produitId) : undefined,
                  })
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
              emptyMessage="Aucune donnée de prix"
              emptyIcon={<Minus className="h-12 w-12" />}
            />
          )}
        </CardContent>
      </Card>
    </div>
  );
}
