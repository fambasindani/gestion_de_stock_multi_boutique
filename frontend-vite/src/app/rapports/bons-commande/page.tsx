"use client";
import { DEVISE } from "@/lib/utils/currency";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { PageHeader } from "@/components/ui/PageHeader";
import { StatCard } from "@/components/ui/StatCard";
import { FormInput } from "@/components/common/FormInput";
import { FormSelect } from "@/components/common/FormSelect";
import { DataTable, type Column } from "@/components/common/DataTable";
import { SkeletonTable } from "@/components/ui/skeleton";
import { rapportsService } from "@/lib/api/services/rapports.service";
import { partenairesService } from "@/lib/api/services/partenaires.service";
import { exportToExcel, type ExcelColumn } from "@/lib/utils/exportExcel";
import { saveElementAsPdf } from "@/lib/utils/exportPdf";
import { RapportTablePDF } from "@/components/pdf/RapportTablePDF";
import { formatDateShort, formatCompact } from "@/lib/utils/format";
import {
  ClipboardList,
  Receipt,
  Wallet,
  FileSpreadsheet,
  FileText,
  RefreshCw,
  Loader2,
  Eye,
} from "lucide-react";
import type { Action } from "@/components/common/DataTable";

interface BonLigne {
  id: number;
  reference: string;
  date_commande: string | null;
  fournisseur: string;
  etat: string;
  etat_label: string;
  nombre_lignes: number;
  total_ht: number;
  total_ttc: number;
}

const money = (v: unknown) => Number(v ?? 0).toFixed(2);

const etats = [
  { value: "all", label: "Tous les états" },
  { value: "brouillon", label: "Brouillon" },
  { value: "confirme", label: "Confirmé" },
  { value: "envoye", label: "Envoyé" },
  { value: "recu", label: "Reçu" },
  { value: "termine", label: "Terminé" },
  { value: "annule", label: "Annulé" },
];

import { useAuth } from "@/hooks/useAuth";

export default function RapportBonsCommandePage() {
  const { societe } = useAuth();
  const router = useRouter();
  const [dateDebut, setDateDebut] = useState("");
  const [dateFin, setDateFin] = useState("");
  const [fournisseurId, setFournisseurId] = useState("");
  const [etat, setEtat] = useState("all");
  const [applied, setApplied] = useState<{
    date_debut?: string;
    date_fin?: string;
    partenaire_id?: number;
    etat?: string;
  }>({});

  const { data: fournisseurs } = useQuery({
    queryKey: ["fournisseurs-select"],
    queryFn: async () => {
      const res = await partenairesService.getFournisseurs({ perPage: 200 });
      const items = (res as unknown as { data?: unknown })?.data;
      return Array.isArray(items) ? (items as { id: number; nom: string }[]) : [];
    },
    staleTime: 5 * 60 * 1000,
  });

  const { data, isLoading, isFetching, refetch } = useQuery({
    queryKey: ["rapport-bons-commande", applied],
    queryFn: async () => (await rapportsService.bonsCommande(applied)).data,
    staleTime: 0,
  });

  const lignes = (data?.lignes ?? []) as BonLigne[];
  const totaux = data?.totaux;

  const columns: Column<BonLigne>[] = [
    {
      key: "reference",
      label: "Référence",
      render: (l) => <span className="font-mono text-sm font-medium">{l.reference}</span>,
    },
    { key: "date_commande", label: "Date", render: (l) => formatDateShort(l.date_commande) },
    { key: "fournisseur", label: "Fournisseur" },
    {
      key: "etat_label",
      label: "État",
      hidden: "sm" as const,
    },
    {
      key: "nombre_lignes",
      label: "Lignes",
      className: "text-right",
      hidden: "md" as const,
      render: (l) => <span className="font-mono">{l.nombre_lignes}</span>,
    },
    {
      key: "total_ht",
      label: "Total HT",
      className: "text-right",
      hidden: "lg" as const,
      render: (l) => <span className="font-mono">{money(l.total_ht)}</span>,
    },
    {
      key: "total_ttc",
      label: "Total TTC",
      className: "text-right",
      render: (l) => (
        <span className="font-mono font-semibold text-blue-600 dark:text-blue-400">
          {money(l.total_ttc)} {DEVISE}
        </span>
      ),
    },
  ];

  const actions: Action<BonLigne>[] = [
    {
      label: "Voir le bon",
      icon: <Eye className="h-5 w-5" />,
      onClick: (l) => router.push(`/achats/commandes/${l.id}/details`),
      variant: "ghost",
      className:
        "text-blue-600 hover:text-blue-700 hover:bg-blue-50 dark:text-blue-400 dark:hover:bg-blue-950/30",
    },
  ];

  const excelColumns: ExcelColumn<BonLigne>[] = [
    { header: "Référence", value: (l) => l.reference, width: 20 },
    { header: "Date", value: (l) => formatDateShort(l.date_commande) },
    { header: "Fournisseur", value: (l) => l.fournisseur, width: 26 },
    { header: "État", value: (l) => l.etat_label },
    { header: "Lignes", value: (l) => l.nombre_lignes },
    { header: "Total HT", value: (l) => Number(l.total_ht) },
    { header: "Total TTC", value: (l) => Number(l.total_ttc) },
  ];

  const periode =
    applied.date_debut || applied.date_fin
      ? `${applied.date_debut || "..."} → ${applied.date_fin || "..."}`
      : "Toutes les dates";
  const filename = `rapport-bons-commande_${applied.date_debut || "global"}`;

  const meta = [
    { label: "Période", value: periode },
    {
      label: "Fournisseur",
      value: fournisseurs?.find((f) => f.id === applied.partenaire_id)?.nom ?? "Tous",
    },
    { label: "État", value: etats.find((e) => e.value === (applied.etat || "all"))?.label ?? "Tous" },
  ];

  const handleExcel = () =>
    exportToExcel({
      rows: lignes,
      columns: excelColumns,
      filename,
      sheetName: "Bons de commande",
      meta,
      totals: {
        Référence: "TOTAUX",
        Date: "",
        Fournisseur: "",
        État: "",
        Lignes: Number(totaux?.total_lignes ?? 0),
        "Total HT": Number(totaux?.total_ht ?? 0),
        "Total TTC": Number(totaux?.total_ttc ?? 0),
      },
    });

  const handlePdf = () =>
    saveElementAsPdf(
      <RapportTablePDF
        title="Rapport des bons de commande"
        subtitle="Commandes fournisseurs"
        company={societe?.nom || "GS Stock"}
        columns={[
          { header: "Référence", flex: 1.3, value: (l: BonLigne) => l.reference },
          { header: "Date", flex: 1, value: (l: BonLigne) => formatDateShort(l.date_commande) },
          { header: "Fournisseur", flex: 1.8, value: (l: BonLigne) => l.fournisseur },
          { header: "État", flex: 1, value: (l: BonLigne) => l.etat_label },
          {
            header: "Lignes",
            flex: 0.7,
            align: "right",
            value: (l: BonLigne) => l.nombre_lignes,
          },
          {
            header: "Total HT",
            flex: 1.1,
            align: "right",
            value: (l: BonLigne) => money(l.total_ht),
          },
          {
            header: "Total TTC",
            flex: 1.2,
            align: "right",
            value: (l: BonLigne) => money(l.total_ttc),
          },
        ]}
        rows={lignes}
        meta={meta}
        stats={[
          { label: "Bons", value: Number(totaux?.nombre_commandes ?? 0) },
          { label: "Total HT", value: money(totaux?.total_ht) },
          { label: "Total TTC", value: money(totaux?.total_ttc) },
        ]}
      />,
      filename
    );

  return (
    <div className="space-y-5">
      <PageHeader
        title="Rapport des bons de commande"
        description="Commandes fournisseurs sur une période"
        icon={<ClipboardList className="h-5 w-5" />}
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
          title="Bons de commande"
          value={Number(totaux?.nombre_commandes ?? 0)}
          icon={<ClipboardList className="h-5 w-5" />}
          color="blue"
        />
        <StatCard
          title="Total HT"
          value={`${formatCompact(totaux?.total_ht)} ${DEVISE}`}
          icon={<Receipt className="h-5 w-5" />}
          color="emerald"
        />
        <StatCard
          title="Total TTC"
          value={`${formatCompact(totaux?.total_ttc)} ${DEVISE}`}
          icon={<Wallet className="h-5 w-5" />}
          color="violet"
        />
      </div>

      <Card>
        <CardContent className="p-5">
          <div className="mb-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
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
            <FormSelect
              label="Fournisseur"
              name="partenaire_id"
              value={fournisseurId}
              onChange={(e) => setFournisseurId(e.target.value)}
              options={(fournisseurs ?? []).map((f) => ({
                value: String(f.id),
                label: f.nom,
              }))}
              placeholder="Tous"
            />
            <FormSelect
              label="État"
              name="etat"
              value={etat}
              onChange={(e) => setEtat(e.target.value)}
              options={etats}
            />
            <div className="flex items-end">
              <Button
                className="w-full"
                onClick={() =>
                  setApplied({
                    date_debut: dateDebut || undefined,
                    date_fin: dateFin || undefined,
                    partenaire_id: fournisseurId ? Number(fournisseurId) : undefined,
                    etat: etat,
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
              actions={actions}
              emptyMessage="Aucun bon de commande sur la période"
              emptyIcon={<ClipboardList className="h-12 w-12" />}
            />
          )}
        </CardContent>
      </Card>
    </div>
  );
}
