"use client";
import { DEVISE } from "@/lib/utils/currency";

import { Suspense, useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
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
import { useAuth } from "@/hooks/useAuth";
import { exportToExcel, type ExcelColumn } from "@/lib/utils/exportExcel";
import { saveElementAsPdf } from "@/lib/utils/exportPdf";
import { RapportTablePDF } from "@/components/pdf/RapportTablePDF";
import { formatDateInput, formatCompact } from "@/lib/utils/format";
import {
  Users,
  Receipt,
  Wallet,
  AlertCircle,
  FileSpreadsheet,
  FileText,
  RefreshCw,
  Loader2,
} from "lucide-react";

interface CaLigne {
  partenaire_id: number;
  partenaire: string;
  nombre_factures: number;
  total_ht: number;
  total_ttc: number;
  total_impaye: number;
}

const money = (v: unknown) => Number(v ?? 0).toFixed(2);

export default function CaPartenairesPage() {
  return (
    <Suspense fallback={<div className="p-8 text-center text-slate-500">Chargement...</div>}>
      <CaPartenaires />
    </Suspense>
  );
}

function CaPartenaires() {
  const { societe } = useAuth();
  const searchParams = useSearchParams();
  const typeParam = (searchParams.get("type") as "client" | "fournisseur") || "client";

  const [type, setType] = useState<"client" | "fournisseur">(typeParam);
  const [dateDebut, setDateDebut] = useState("");
  const [dateFin, setDateFin] = useState("");
  const [applied, setApplied] = useState<{
    type: "client" | "fournisseur";
    date_debut?: string;
    date_fin?: string;
  }>({ type: typeParam });

  useEffect(() => {
    setType(typeParam);
    setApplied((prev) => ({ ...prev, type: typeParam }));
  }, [typeParam]);

  const { data, isLoading, isFetching, refetch } = useQuery({
    queryKey: ["rapport-ca-partenaires", applied],
    queryFn: async () => (await rapportsService.caPartenaires(applied)).data,
    staleTime: 0,
  });

  const lignes = (data?.lignes ?? []) as CaLigne[];
  const totaux = data?.totaux;
  const isClient = type === "client";

  const columns: Column<CaLigne>[] = [
    {
      key: "partenaire",
      label: isClient ? "Client" : "Fournisseur",
      render: (l) => (
        <span className="font-medium text-slate-800 dark:text-slate-100">{l.partenaire}</span>
      ),
    },
    {
      key: "nombre_factures",
      label: "Factures",
      className: "text-right",
      render: (l) => <span className="font-mono">{l.nombre_factures}</span>,
    },
    {
      key: "total_ht",
      label: "Total HT",
      className: "text-right",
      hidden: "md" as const,
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
    {
      key: "total_impaye",
      label: "Impayé",
      className: "text-right",
      render: (l) => (
        <span className="font-mono font-semibold text-red-600 dark:text-red-400">
          {money(l.total_impaye)}
        </span>
      ),
    },
  ];

  const excelColumns: ExcelColumn<CaLigne>[] = [
    { header: isClient ? "Client" : "Fournisseur", value: (l) => l.partenaire, width: 28 },
    { header: "Factures", value: (l) => l.nombre_factures },
    { header: "Total HT", value: (l) => Number(l.total_ht) },
    { header: "Total TTC", value: (l) => Number(l.total_ttc) },
    { header: "Impayé", value: (l) => Number(l.total_impaye) },
  ];

  const filename = `ca-${type}_${formatDateInput(new Date())}`;

  const handleExcel = () =>
    exportToExcel({
      rows: lignes,
      columns: excelColumns,
      filename,
      sheetName: isClient ? "CA clients" : "CA fournisseurs",
      totals: {
        [isClient ? "Client" : "Fournisseur"]: "TOTAUX",
        Factures: Number(totaux?.nombre_factures ?? 0),
        "Total HT": Number(totaux?.total_ht ?? 0),
        "Total TTC": Number(totaux?.total_ttc ?? 0),
        Impayé: Number(totaux?.total_impaye ?? 0),
      },
    });

  const handlePdf = () =>
    saveElementAsPdf(
      <RapportTablePDF
        title={isClient ? "Chiffre d'affaires par client" : "Achats par fournisseur"}
        subtitle="Synthèse des factures"
        company={societe?.nom || "GS Stock"}
        columns={[
          { header: isClient ? "Client" : "Fournisseur", flex: 2.4, value: (l: CaLigne) => l.partenaire },
          { header: "Factures", flex: 0.8, align: "right", value: (l: CaLigne) => l.nombre_factures },
          { header: "Total HT", flex: 1.2, align: "right", value: (l: CaLigne) => money(l.total_ht) },
          { header: "Total TTC", flex: 1.3, align: "right", value: (l: CaLigne) => money(l.total_ttc) },
          { header: "Impayé", flex: 1.2, align: "right", value: (l: CaLigne) => money(l.total_impaye) },
        ]}
        rows={lignes}
        stats={[
          { label: isClient ? "Clients" : "Fournisseurs", value: Number(totaux?.nombre_partenaires ?? 0) },
          { label: "Factures", value: Number(totaux?.nombre_factures ?? 0) },
          { label: "Total TTC", value: money(totaux?.total_ttc) },
        ]}
      />,
      filename
    );

  return (
    <div className="space-y-5">
      <PageHeader
        title={isClient ? "CA par client" : "Achats par fournisseur"}
        description="Synthèse des factures par partenaire"
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
          title={isClient ? "Clients" : "Fournisseurs"}
          value={Number(totaux?.nombre_partenaires ?? 0)}
          icon={<Users className="h-5 w-5" />}
          color="blue"
        />
        <StatCard
          title="Total TTC"
          value={`${formatCompact(totaux?.total_ttc)} ${DEVISE}`}
          icon={<Wallet className="h-5 w-5" />}
          color="emerald"
        />
        <StatCard
          title="Impayé"
          value={`${formatCompact(totaux?.total_impaye)} ${DEVISE}`}
          icon={<AlertCircle className="h-5 w-5" />}
          color="rose"
        />
      </div>

      <Card>
        <CardContent className="p-5">
          <div className="mb-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <FormSelect
              label="Type"
              name="type"
              value={type}
              onChange={(e) => setType(e.target.value as "client" | "fournisseur")}
              options={[
                { value: "client", label: "Clients (ventes)" },
                { value: "fournisseur", label: "Fournisseurs (achats)" },
              ]}
            />
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
            <div className="flex items-end">
              <Button
                className="w-full"
                onClick={() =>
                  setApplied({
                    type,
                    date_debut: dateDebut || undefined,
                    date_fin: dateFin || undefined,
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
              emptyMessage="Aucune facture sur la période"
              emptyIcon={<Receipt className="h-12 w-12" />}
            />
          )}
        </CardContent>
      </Card>
    </div>
  );
}
