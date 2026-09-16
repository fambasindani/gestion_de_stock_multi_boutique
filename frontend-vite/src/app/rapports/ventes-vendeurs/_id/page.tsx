"use client";

import { useSearchParams } from "next/navigation";
import { useParams, useRouter } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { PageHeader } from "@/components/ui/PageHeader";
import { StatCard } from "@/components/ui/StatCard";
import { DataTable, type Column } from "@/components/common/DataTable";
import { SkeletonTable } from "@/components/ui/skeleton";
import { rapportsService } from "@/lib/api/services/rapports.service";
import { exportToExcel, type ExcelColumn } from "@/lib/utils/exportExcel";
import { saveElementAsPdf } from "@/lib/utils/exportPdf";
import { RapportTablePDF } from "@/components/pdf/RapportTablePDF";
import { formatDateShort } from "@/lib/utils/format";
import {
  Users,
  Receipt,
  Wallet,
  FileSpreadsheet,
  FileText,
  RefreshCw,
  Loader2,
  Eye,
} from "lucide-react";
import type { Action } from "@/components/common/DataTable";

interface VenteLigne {
  id: number;
  reference: string;
  date_commande: string | null;
  client: string;
  etat: string;
  mode_paiement: string | null;
  nombre_articles: number;
  total_ht: number;
  total_remise: number;
  total_ttc: number;
}

const money = (v: unknown) => Number(v ?? 0).toFixed(2);

const etatLabel: Record<string, string> = {
  brouillon: "Brouillon",
  confirme: "Confirmée",
  en_cours: "En cours",
  termine: "Terminée",
  annule: "Annulée",
};

export default function VendeurDetailsPage() {
  const params = useParams<{ id: string }>();
  const id = Number(params.id);
  const router = useRouter();
  const searchParams = useSearchParams();

  const dateDebut = searchParams.get("date_debut") || undefined;
  const dateFin = searchParams.get("date_fin") || undefined;

  const { data, isLoading, isFetching, refetch } = useQuery({
    queryKey: ["vendeur-details", id, dateDebut, dateFin],
    queryFn: async () =>
      (await rapportsService.ventesVendeurDetails(id, { date_debut: dateDebut, date_fin: dateFin }))
        .data,
    enabled: !!id,
  });

  const vendeur = data?.vendeur;
  const lignes = (data?.lignes ?? []) as VenteLigne[];
  const totaux = data?.totaux;

  const columns: Column<VenteLigne>[] = [
    {
      key: "reference",
      label: "Référence",
      render: (l) => <span className="font-mono text-sm font-medium">{l.reference}</span>,
    },
    { key: "date_commande", label: "Date", render: (l) => formatDateShort(l.date_commande) },
    { key: "client", label: "Client" },
    {
      key: "nombre_articles",
      label: "Articles",
      className: "text-right",
      hidden: "sm" as const,
      render: (l) => <span className="font-mono">{l.nombre_articles}</span>,
    },
    {
      key: "etat",
      label: "État",
      hidden: "md" as const,
      render: (l) => etatLabel[l.etat] || l.etat,
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
          {money(l.total_ttc)} CDF
        </span>
      ),
    },
  ];

  const actions: Action<VenteLigne>[] = [
    {
      label: "Voir la vente",
      icon: <Eye className="h-5 w-5" />,
      onClick: (l) => router.push(`/ventes/commandes/${l.id}/details`),
      variant: "ghost",
      className:
        "text-blue-600 hover:text-blue-700 hover:bg-blue-50 dark:text-blue-400 dark:hover:bg-blue-950/30",
    },
  ];

  const excelColumns: ExcelColumn<VenteLigne>[] = [
    { header: "Référence", value: (l) => l.reference, width: 20 },
    { header: "Date", value: (l) => formatDateShort(l.date_commande) },
    { header: "Client", value: (l) => l.client, width: 24 },
    { header: "Articles", value: (l) => l.nombre_articles },
    { header: "Total HT", value: (l) => Number(l.total_ht) },
    { header: "Remise", value: (l) => Number(l.total_remise) },
    { header: "Total TTC", value: (l) => Number(l.total_ttc) },
  ];

  const filename = `ventes_${vendeur?.nom ?? id}`;

  const periodeLabel =
    dateDebut || dateFin
      ? `${dateDebut || "..."} → ${dateFin || "..."}`
      : "Toutes les dates";

  const handleExcel = () =>
    exportToExcel({
      rows: lignes,
      columns: excelColumns,
      filename,
      sheetName: "Ventes",
      meta: [
        { label: "Vendeur", value: vendeur?.nom ?? "" },
        { label: "Période", value: periodeLabel },
      ],
      totals: {
        Référence: "TOTAUX",
        Date: "",
        Client: "",
        Articles: "",
        "Total HT": Number(totaux?.total_ht ?? 0),
        Remise: Number(totaux?.total_remise ?? 0),
        "Total TTC": Number(totaux?.total_ttc ?? 0),
      },
    });

  const handlePdf = () =>
    saveElementAsPdf(
      <RapportTablePDF
        title="Détail des ventes du vendeur"
        subtitle={vendeur?.nom}
        company="GS Stock ERP"
        columns={[
          { header: "Référence", flex: 1.3, value: (l: VenteLigne) => l.reference },
          {
            header: "Date",
            flex: 1,
            value: (l: VenteLigne) => formatDateShort(l.date_commande),
          },
          { header: "Client", flex: 1.6, value: (l: VenteLigne) => l.client },
          {
            header: "Articles",
            flex: 0.8,
            align: "right",
            value: (l: VenteLigne) => l.nombre_articles,
          },
          {
            header: "Total HT",
            flex: 1.1,
            align: "right",
            value: (l: VenteLigne) => money(l.total_ht),
          },
          {
            header: "Total TTC",
            flex: 1.2,
            align: "right",
            value: (l: VenteLigne) => money(l.total_ttc),
          },
        ]}
        rows={lignes}
        meta={[
          { label: "Vendeur", value: vendeur?.nom ?? "" },
          { label: "Période", value: periodeLabel },
        ]}
        stats={[
          { label: "Ventes", value: Number(totaux?.nombre_ventes ?? 0) },
          { label: "Total HT", value: money(totaux?.total_ht) },
          { label: "Total TTC", value: money(totaux?.total_ttc) },
        ]}
      />,
      filename
    );

  return (
    <div className="space-y-5">
      <PageHeader
        title={`Ventes de ${vendeur?.nom ?? "..."}`}
        description={`${vendeur?.email ?? ""} · ${periodeLabel}`}
        icon={<Users className="h-5 w-5" />}
        onBack={() => router.push("/rapports/ventes-vendeurs")}
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
          title="Ventes"
          value={Number(totaux?.nombre_ventes ?? 0)}
          icon={<Receipt className="h-5 w-5" />}
          color="blue"
        />
        <StatCard
          title="Total HT"
          value={`${money(totaux?.total_ht)} CDF`}
          icon={<Users className="h-5 w-5" />}
          color="emerald"
        />
        <StatCard
          title="Total TTC"
          value={`${money(totaux?.total_ttc)} CDF`}
          icon={<Wallet className="h-5 w-5" />}
          color="violet"
        />
      </div>

      <Card>
        <CardContent className="p-5">
          {isLoading ? (
            <SkeletonTable />
          ) : (
            <DataTable
              data={lignes}
              columns={columns}
              actions={actions}
              emptyMessage="Aucune vente sur la période"
              emptyIcon={<Receipt className="h-12 w-12" />}
            />
          )}
        </CardContent>
      </Card>
    </div>
  );
}
