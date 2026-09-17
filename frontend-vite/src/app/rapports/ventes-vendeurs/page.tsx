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
import { DataTable, type Column, type Action } from "@/components/common/DataTable";
import { SkeletonTable } from "@/components/ui/skeleton";
import { rapportsService } from "@/lib/api/services/rapports.service";
import { utilisateursService } from "@/lib/api/services/utilisateurs.service";
import { exportToExcel, type ExcelColumn } from "@/lib/utils/exportExcel";
import { saveElementAsPdf } from "@/lib/utils/exportPdf";
import { RapportTablePDF } from "@/components/pdf/RapportTablePDF";
import { formatDateInput, formatCompact } from "@/lib/utils/format";
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

interface VendeurLigne {
  utilisateur_id: number | null;
  vendeur: string;
  email: string;
  nombre_ventes: number;
  total_ht: number;
  total_remise: number;
  total_ttc: number;
}

const money = (v: unknown) => Number(v ?? 0).toFixed(2);

function unwrapList<T>(payload: unknown): T[] {
  if (Array.isArray(payload)) return payload as T[];
  const nested = (payload as { data?: unknown } | null)?.data;
  return Array.isArray(nested) ? (nested as T[]) : [];
}

import { useAuth } from "@/hooks/useAuth";

export default function RapportVendeursPage() {
  const { societe } = useAuth();
  const router = useRouter();
  const [dateDebut, setDateDebut] = useState("");
  const [dateFin, setDateFin] = useState("");
  const [utilisateurId, setUtilisateurId] = useState("");
  const [applied, setApplied] = useState<{
    date_debut?: string;
    date_fin?: string;
    utilisateur_id?: number;
  }>({});

  const { data: utilisateurs } = useQuery({
    queryKey: ["utilisateurs-select"],
    queryFn: async () =>
      unwrapList<{ id: number; nom: string; email: string }>(
        (await utilisateursService.getAll({ per_page: 200 })).data
      ),
    staleTime: 5 * 60 * 1000,
  });

  const { data, isLoading, isFetching, refetch } = useQuery({
    queryKey: ["rapport-vendeurs", applied],
    queryFn: async () => (await rapportsService.ventesVendeurs(applied)).data,
    staleTime: 0,
  });

  const lignes = (data?.lignes ?? []) as VendeurLigne[];
  const totaux = data?.totaux;

  const columns: Column<VendeurLigne>[] = [
    {
      key: "vendeur",
      label: "Vendeur",
      render: (l) => (
        <div className="flex flex-col">
          <span className="font-medium text-slate-800 dark:text-slate-100">{l.vendeur}</span>
          <span className="text-xs text-slate-400">{l.email}</span>
        </div>
      ),
    },
    {
      key: "nombre_ventes",
      label: "Ventes",
      className: "text-right",
      render: (l) => <span className="font-mono">{l.nombre_ventes}</span>,
    },
    {
      key: "total_ht",
      label: "Total HT",
      className: "text-right",
      hidden: "sm" as const,
      render: (l) => <span className="font-mono">{money(l.total_ht)}</span>,
    },
    {
      key: "total_remise",
      label: "Remise",
      className: "text-right",
      hidden: "lg" as const,
      render: (l) => <span className="font-mono">{money(l.total_remise)}</span>,
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

  const queryString = () => {
    const sp = new URLSearchParams();
    if (applied.date_debut) sp.set("date_debut", applied.date_debut);
    if (applied.date_fin) sp.set("date_fin", applied.date_fin);
    const qs = sp.toString();
    return qs ? `?${qs}` : "";
  };

  const actions: Action<VendeurLigne>[] = [
    {
      label: "Détails",
      icon: <Eye className="h-5 w-5" />,
      onClick: (l) =>
        router.push(`/rapports/ventes-vendeurs/${l.utilisateur_id}${queryString()}`),
      variant: "ghost",
      className:
        "text-blue-600 hover:text-blue-700 hover:bg-blue-50 dark:text-blue-400 dark:hover:bg-blue-950/30",
      show: (l) => l.utilisateur_id != null,
    },
  ];

  const excelColumns: ExcelColumn<VendeurLigne>[] = [
    { header: "Vendeur", value: (l) => l.vendeur, width: 24 },
    { header: "Email", value: (l) => l.email, width: 24 },
    { header: "Nombre de ventes", value: (l) => l.nombre_ventes },
    { header: "Total HT", value: (l) => Number(l.total_ht) },
    { header: "Remise", value: (l) => Number(l.total_remise) },
    { header: "Total TTC", value: (l) => Number(l.total_ttc) },
  ];

  const periode =
    applied.date_debut && applied.date_fin
      ? `${applied.date_debut}_${applied.date_fin}`
      : "global";
  const filename = `ventes-vendeurs_${periode}`;

  const meta = [
    {
      label: "Période",
      value:
        applied.date_debut || applied.date_fin
          ? `${applied.date_debut || "..."} → ${applied.date_fin || "..."}`
          : "Toutes les dates",
    },
    {
      label: "Vendeur",
      value: utilisateurs?.find((u) => u.id === applied.utilisateur_id)?.nom ?? "Tous",
    },
  ];

  const handleExcel = () =>
    exportToExcel({
      rows: lignes,
      columns: excelColumns,
      filename,
      sheetName: "Vendeurs",
      meta,
      totals: {
        Vendeur: "TOTAUX",
        Email: "",
        "Nombre de ventes": Number(totaux?.nombre_ventes ?? 0),
        "Total HT": Number(totaux?.total_ht ?? 0),
        Remise: Number(totaux?.total_remise ?? 0),
        "Total TTC": Number(totaux?.total_ttc ?? 0),
      },
    });

  const handlePdf = () =>
    saveElementAsPdf(
      <RapportTablePDF
        title="Ventes par vendeur"
        subtitle="Chiffre d'affaires par utilisateur"
        company={societe?.nom || "GS Stock"}
        columns={[
          { header: "Vendeur", flex: 2, value: (l: VendeurLigne) => l.vendeur },
          { header: "Email", flex: 2, value: (l: VendeurLigne) => l.email },
          { header: "Ventes", flex: 0.8, align: "right", value: (l: VendeurLigne) => l.nombre_ventes },
          { header: "Total HT", flex: 1.2, align: "right", value: (l: VendeurLigne) => money(l.total_ht) },
          { header: "Remise", flex: 1, align: "right", value: (l: VendeurLigne) => money(l.total_remise) },
          { header: "Total TTC", flex: 1.3, align: "right", value: (l: VendeurLigne) => money(l.total_ttc) },
        ]}
        rows={lignes}
        meta={meta}
        stats={[
          { label: "Vendeurs", value: Number(totaux?.nombre_vendeurs ?? 0) },
          { label: "Ventes", value: Number(totaux?.nombre_ventes ?? 0) },
          { label: "Total TTC", value: money(totaux?.total_ttc) },
        ]}
      />,
      filename
    );

  return (
    <div className="space-y-5">
      <PageHeader
        title="Ventes par vendeur"
        description="Chiffre d'affaires par utilisateur sur une période"
        icon={<Users className="h-5 w-5" />}
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
          title="Vendeurs"
          value={Number(totaux?.nombre_vendeurs ?? 0)}
          icon={<Users className="h-5 w-5" />}
          color="blue"
        />
        <StatCard
          title="Ventes"
          value={Number(totaux?.nombre_ventes ?? 0)}
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
            <FormSelect
              label="Vendeur"
              name="utilisateur_id"
              value={utilisateurId}
              onChange={(e) => setUtilisateurId(e.target.value)}
              options={(utilisateurs ?? []).map((u) => ({
                value: String(u.id),
                label: u.nom,
              }))}
              placeholder="Tous les vendeurs"
            />
            <div className="flex items-end">
              <Button
                className="w-full"
                onClick={() =>
                  setApplied({
                    date_debut: dateDebut || undefined,
                    date_fin: dateFin || undefined,
                    utilisateur_id: utilisateurId ? Number(utilisateurId) : undefined,
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
              loading={false}
              emptyMessage="Aucune vente sur la période"
              emptyIcon={<Users className="h-12 w-12" />}
            />
          )}
        </CardContent>
      </Card>
    </div>
  );
}
