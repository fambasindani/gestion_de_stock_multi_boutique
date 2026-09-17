"use client";
import { DEVISE } from "@/lib/utils/currency";

import { useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { PageHeader } from "@/components/ui/PageHeader";
import { StatCard } from "@/components/ui/StatCard";
import { SearchableSelect } from "@/components/ui/SearchableSelect";
import { DataTable, type Column } from "@/components/common/DataTable";
import { SkeletonTable } from "@/components/ui/skeleton";
import { rapportsService } from "@/lib/api/services/rapports.service";
import { categoriesService } from "@/lib/api/services/categories.service";
import { emplacementsService } from "@/lib/api/services/emplacements.service";
import type {
  RapportStockLigne,
  CategorieProduit,
  EmplacementStock,
} from "@/lib/api/typess";
import { exportToExcel, type ExcelColumn } from "@/lib/utils/exportExcel";
import { saveElementAsPdf } from "@/lib/utils/exportPdf";
import { RapportTablePDF } from "@/components/pdf/RapportTablePDF";
import { formatDateInput, formatCompact } from "@/lib/utils/format";
import {
  Boxes,
  Package,
  Wallet,
  FileSpreadsheet,
  FileText,
  RefreshCw,
  Warehouse,
  Loader2,
} from "lucide-react";

const produitLabel = (l: RapportStockLigne) =>
  l.produit?.nom || l.produit?.modele?.nom || `#${l.produit_id}`;

const categorieLabel = (l: RapportStockLigne) =>
  l.produit?.modele?.categorie?.nom || "-";

const montant = (v: unknown) => Number(v ?? 0).toFixed(2);

type StockRow = RapportStockLigne & { row_key: string };

function unwrapList<T>(payload: unknown): T[] {
  if (Array.isArray(payload)) return payload as T[];
  const nested = (payload as { data?: unknown } | null)?.data;
  return Array.isArray(nested) ? (nested as T[]) : [];
}

import { useAuth } from "@/hooks/useAuth";

export default function RapportStockPage() {
  const { societe } = useAuth();
  const [categorieId, setCategorieId] = useState("");
  const [emplacementId, setEmplacementId] = useState("");
  const [applied, setApplied] = useState<{ categorie_id?: number; emplacement_id?: number }>({});

  const { data: categories } = useQuery({
    queryKey: ["categories-select"],
    queryFn: async () =>
      unwrapList<CategorieProduit>(
        (await categoriesService.getAll({ per_page: 200 })).data
      ),
    staleTime: 5 * 60 * 1000,
  });

  const { data: emplacements } = useQuery({
    queryKey: ["emplacements-select"],
    queryFn: async () =>
      unwrapList<EmplacementStock>(
        (await emplacementsService.getAll({ per_page: 200 })).data
      ),
    staleTime: 5 * 60 * 1000,
  });

  const { data, isLoading, isFetching, refetch } = useQuery({
    queryKey: ["rapport-stock", applied],
    queryFn: async () => (await rapportsService.stock(applied)).data,
    staleTime: 0,
  });

  const lignes = data?.lignes ?? [];
  const totaux = data?.totaux;

  const rows = useMemo<StockRow[]>(
    () =>
      lignes.map((l) => ({
        ...l,
        row_key: `${l.produit_id}-${l.emplacement_id}`,
      })),
    [lignes]
  );

  const categorieNom = useMemo(
    () => categories?.find((c) => String(c.id) === categorieId)?.nom ?? "Toutes",
    [categories, categorieId]
  );
  const emplacementNom = useMemo(
    () => emplacements?.find((e) => String(e.id) === emplacementId)?.nom ?? "Tous",
    [emplacements, emplacementId]
  );

  const columns: Column<StockRow>[] = [
    {
      key: "produit",
      label: "Produit",
      render: (l) => (
        <div className="flex flex-col">
          <span className="font-medium text-slate-800 dark:text-slate-100">
            {produitLabel(l)}
          </span>
          {l.produit?.code_interne && (
            <span className="font-mono text-xs text-slate-400">
              {l.produit.code_interne}
            </span>
          )}
        </div>
      ),
    },
    {
      key: "categorie",
      label: "Catégorie",
      hidden: "md" as const,
      render: (l) => categorieLabel(l),
    },
    {
      key: "emplacement",
      label: "Emplacement",
      hidden: "sm" as const,
      render: (l) => (
        <span className="inline-flex items-center gap-1.5 text-slate-600 dark:text-slate-300">
          <Warehouse className="h-3.5 w-3.5 text-slate-400" />
          {l.emplacement?.nom || "-"}
        </span>
      ),
    },
    {
      key: "quantite_totale",
      label: "Quantité",
      className: "text-right",
      render: (l) => (
        <span className="font-mono font-medium">{Number(l.quantite_totale)}</span>
      ),
    },
    {
      key: "quantite_reservee_totale",
      label: "Réservée",
      hidden: "lg" as const,
      className: "text-right",
      render: (l) => (
        <span className="font-mono text-slate-500">
          {Number(l.quantite_reservee_totale)}
        </span>
      ),
    },
    {
      key: "valeur",
      label: "Valeur",
      className: "text-right",
      render: (l) => (
        <span className="font-mono font-medium text-blue-600 dark:text-blue-400">
          {montant(l.valeur)} {DEVISE}
        </span>
      ),
    },
  ];

  const excelColumns: ExcelColumn<RapportStockLigne>[] = [
    { header: "Produit", value: (l) => produitLabel(l), width: 32 },
    { header: "Code", value: (l) => l.produit?.code_interne ?? "" },
    { header: "Catégorie", value: (l) => categorieLabel(l), width: 20 },
    { header: "Emplacement", value: (l) => l.emplacement?.nom ?? "", width: 20 },
    { header: "Quantité", value: (l) => Number(l.quantite_totale) },
    { header: "Réservée", value: (l) => Number(l.quantite_reservee_totale) },
    { header: "Valeur", value: (l) => Number(l.valeur) },
  ];

  const exportFilename = `rapport-stock_${formatDateInput(new Date())}`;

  const handleExcel = () => {
    exportToExcel({
      rows: lignes,
      columns: excelColumns,
      filename: exportFilename,
      sheetName: "Stock",
      meta: [
        { label: "Rapport", value: "État du stock" },
        { label: "Catégorie", value: categorieNom },
        { label: "Emplacement", value: emplacementNom },
      ],
      totals: {
        Produit: "TOTAUX",
        Code: "",
        Catégorie: "",
        Emplacement: "",
        Quantité: Number(totaux?.quantite_totale ?? 0),
        Réservée: "",
        Valeur: Number(totaux?.valeur_totale ?? 0),
      },
    });
  };

  const handlePdf = () =>
    saveElementAsPdf(
      <RapportTablePDF
        title="État du stock"
        subtitle="Valorisation du stock par produit et emplacement"
        company={societe?.nom || "GS Stock"}
        orientation="landscape"
        columns={[
          { header: "Produit", flex: 2.4, value: produitLabel },
          {
            header: "Code",
            flex: 1,
            value: (l) => l.produit?.code_interne ?? "-",
          },
          { header: "Catégorie", flex: 1.4, value: categorieLabel },
          {
            header: "Emplacement",
            flex: 1.4,
            value: (l) => l.emplacement?.nom ?? "-",
          },
          {
            header: "Quantité",
            flex: 0.9,
            align: "right",
            value: (l) => Number(l.quantite_totale),
          },
          {
            header: "Réservée",
            flex: 0.9,
            align: "right",
            value: (l) => Number(l.quantite_reservee_totale),
          },
          {
            header: `Valeur (${DEVISE})`,
            flex: 1.2,
            align: "right",
            value: (l) => montant(l.valeur),
          },
        ]}
        rows={lignes}
        meta={[
          { label: "Catégorie", value: categorieNom },
          { label: "Emplacement", value: emplacementNom },
        ]}
        stats={[
          { label: "Produits", value: Number(totaux?.nombre_produits ?? 0) },
          { label: "Quantité totale", value: Number(totaux?.quantite_totale ?? 0) },
          {
            label: `Valeur totale (${DEVISE})`,
            value: montant(totaux?.valeur_totale),
          },
        ]}
      />,
      exportFilename
    );

  return (
    <div className="space-y-5">
      <PageHeader
        title="Rapport de stock"
        description="Quantités et valorisation par produit et emplacement"
        icon={<Boxes className="h-5 w-5" />}
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
              <FileSpreadsheet className="mr-2 h-4 w-4" />
              Excel
            </Button>
            <Button onClick={handlePdf} disabled={lignes.length === 0}>
              <FileText className="mr-2 h-4 w-4" />
              PDF
            </Button>
          </>
        }
      />

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <StatCard
          title="Produits en stock"
          value={Number(totaux?.nombre_produits ?? 0)}
          icon={<Package className="h-5 w-5" />}
          color="blue"
        />
        <StatCard
          title="Quantité totale"
          value={Number(totaux?.quantite_totale ?? 0)}
          icon={<Boxes className="h-5 w-5" />}
          color="emerald"
        />
        <StatCard
          title="Valeur du stock"
          value={`${formatCompact(totaux?.valeur_totale)} ${DEVISE}`}
          icon={<Wallet className="h-5 w-5" />}
          color="violet"
        />
      </div>

      <Card>
        <CardContent className="p-5">
          <div className="mb-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <div>
              <label className="mb-1.5 block text-sm font-medium text-slate-700 dark:text-slate-300">
                Catégorie
              </label>
              <SearchableSelect
                options={(categories ?? []).map((c) => ({ id: c.id, nom: c.nom }))}
                value={categorieId}
                onValueChange={setCategorieId}
                placeholder="Toutes les catégories"
              />
            </div>
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
                  setApplied({
                    categorie_id: categorieId ? Number(categorieId) : undefined,
                    emplacement_id: emplacementId ? Number(emplacementId) : undefined,
                  })
                }
              >
                <RefreshCw className="mr-2 h-4 w-4" />
                Appliquer les filtres
              </Button>
            </div>
          </div>

          {isLoading ? (
            <SkeletonTable />
          ) : (
            <DataTable
              data={rows}
              columns={columns}
              rowKey={"row_key" as keyof StockRow}
              loading={false}
              emptyMessage="Aucun stock à afficher"
              emptyIcon={<Boxes className="h-12 w-12" />}
            />
          )}
        </CardContent>
      </Card>
    </div>
  );
}
