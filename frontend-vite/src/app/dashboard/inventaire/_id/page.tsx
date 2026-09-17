"use client";

import { useMemo, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { useParams, useRouter } from "next/navigation";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { PageHeader } from "@/components/ui/PageHeader";
import { StatCard } from "@/components/ui/StatCard";
import { ConfirmDialog } from "@/components/common/ConfirmDialog";
import {
  DataTable,
  DataTableBadge,
  type Column,
} from "@/components/common/DataTable";
import { SkeletonTable } from "@/components/ui/skeleton";
import {
  inventairesService,
  type LigneInventaire,
} from "@/lib/api/services/inventaires.service";
import { exportToExcel, type ExcelColumn } from "@/lib/utils/exportExcel";
import { saveElementAsPdf } from "@/lib/utils/exportPdf";
import { PVInventairePDF } from "@/components/pdf/PVInventairePDF";
import { useAuth } from "@/hooks/useAuth";
import { formatDateShort, formatDateInput } from "@/lib/utils/format";
import {
  ClipboardList,
  Package,
  TrendingUp,
  TrendingDown,
  ListChecks,
  FileSpreadsheet,
  FileText,
  RefreshCw,
  CheckCircle2,
  Loader2,
  ArrowLeft,
} from "lucide-react";

const produitLabel = (l: LigneInventaire) =>
  l.produit?.nom || l.produit?.modele?.nom || `#${l.produit_id}`;
const produitCode = (l: LigneInventaire) => l.produit?.code_interne || "";
const num = (v: unknown) => Number(v ?? 0);

export default function InventaireDetailPage() {
  const { societe, currentUser } = useAuth();
  const params = useParams<{ id: string }>();
  const id = Number(params.id);
  const router = useRouter();
  const queryClient = useQueryClient();

  const [edits, setEdits] = useState<Record<number, string>>({});
  const [confirmAjuster, setConfirmAjuster] = useState(false);
  const [confirmCloturer, setConfirmCloturer] = useState(false);

  const { data, isLoading, isFetching, refetch } = useQuery({
    queryKey: ["inventaire", id],
    queryFn: async () => (await inventairesService.getById(id)).data,
    enabled: !!id,
  });

  const inventaire = data?.inventaire;
  const totaux = data?.totaux;
  const lignes = inventaire?.lignes ?? [];
  const verrouille = inventaire?.statut === "cloture";

  const rows = useMemo(
    () => lignes.map((l) => ({ ...l, row_key: l.id })),
    [lignes]
  );

  const updateLigneMutation = useMutation({
    mutationFn: ({ ligneId, quantite }: { ligneId: number; quantite: number }) =>
      inventairesService.updateLigne(id, ligneId, { quantite_physique: quantite }),
    onSuccess: (res, vars) => {
      if (!res.success) {
        toast.error(res.message || "Erreur");
      }
      setEdits((prev) => {
        const copy = { ...prev };
        delete copy[vars.ligneId];
        return copy;
      });
      queryClient.invalidateQueries({ queryKey: ["inventaire", id] });
    },
    onError: () => toast.error("Erreur lors de l'enregistrement"),
  });

  const genererMutation = useMutation({
    mutationFn: () => inventairesService.genererLignes(id),
    onSuccess: (res) => {
      toast.success(`Lignes générées : ${res.data?.lignes_ajoutees ?? 0}`);
      queryClient.invalidateQueries({ queryKey: ["inventaire", id] });
    },
    onError: () => toast.error("Erreur lors de la génération"),
  });

  const cloturerMutation = useMutation({
    mutationFn: () => inventairesService.cloturer(id),
    onSuccess: () => {
      toast.success("Inventaire clôturé");
      setConfirmCloturer(false);
      queryClient.invalidateQueries({ queryKey: ["inventaire", id] });
    },
    onError: () => {
      toast.error("Erreur lors de la clôture");
      setConfirmCloturer(false);
    },
  });

  const ajusterMutation = useMutation({
    mutationFn: () => inventairesService.ajuster(id),
    onSuccess: (res) => {
      toast.success(`Stock ajusté (${res.data?.lignes_ajustees ?? 0} ligne(s))`);
      setConfirmAjuster(false);
      queryClient.invalidateQueries({ queryKey: ["inventaire", id] });
    },
    onError: () => {
      toast.error("Erreur lors de l'ajustement");
      setConfirmAjuster(false);
    },
  });

  const columns: Column<LigneInventaire & { row_key: number }>[] = [
    {
      key: "produit",
      label: "Produit",
      render: (l) => (
        <div className="flex flex-col">
          <span className="font-medium text-slate-800 dark:text-slate-100">
            {produitLabel(l)}
          </span>
          {produitCode(l) && (
            <span className="font-mono text-xs text-slate-400">{produitCode(l)}</span>
          )}
        </div>
      ),
    },
    {
      key: "emplacement",
      label: "Emplacement",
      hidden: "lg" as const,
      render: (l) => l.emplacement?.nom || "-",
    },
    {
      key: "quantite_theorique",
      label: "Théorique",
      className: "text-right",
      render: (l) => <span className="font-mono">{num(l.quantite_theorique)}</span>,
    },
    {
      key: "quantite_physique",
      label: "Physique",
      className: "text-right",
      render: (l) => {
        const value = edits[l.id] ?? String(num(l.quantite_physique));
        const disabled = verrouille || l.ajuste;
        return (
          <input
            type="number"
            step="0.01"
            min="0"
            value={value}
            disabled={disabled}
            onChange={(e) => setEdits((prev) => ({ ...prev, [l.id]: e.target.value }))}
            onBlur={() => {
              const raw = edits[l.id];
              if (raw === undefined) return;
              const v = Number(raw);
              if (Number.isNaN(v) || v === num(l.quantite_physique)) {
                setEdits((prev) => {
                  const c = { ...prev };
                  delete c[l.id];
                  return c;
                });
                return;
              }
              updateLigneMutation.mutate({ ligneId: l.id, quantite: v });
            }}
            className="h-9 w-24 rounded-lg border border-slate-200 bg-white px-2 text-right font-mono text-sm shadow-sm transition focus:border-blue-500 focus:outline-none focus:ring-4 focus:ring-blue-500/10 disabled:bg-slate-50 disabled:opacity-60 dark:border-slate-700 dark:bg-slate-900"
          />
        );
      },
    },
    {
      key: "ecart",
      label: "Écart",
      className: "text-right",
      render: (l) => {
        const e = num(l.ecart);
        const cls =
          e > 0
            ? "text-emerald-600 dark:text-emerald-400"
            : e < 0
              ? "text-red-600 dark:text-red-400"
              : "text-slate-400";
        return <span className={`font-mono font-semibold ${cls}`}>{e > 0 ? `+${e}` : e}</span>;
      },
    },
    {
      key: "ajuste",
      label: "Ajusté",
      render: (l) =>
        l.ajuste ? (
          <DataTableBadge variant="success">Oui</DataTableBadge>
        ) : (
          <span className="text-xs text-slate-400">Non</span>
        ),
    },
  ];

  const excelColumns: ExcelColumn<LigneInventaire>[] = [
    { header: "Produit", value: produitLabel, width: 32 },
    { header: "Code", value: produitCode },
    { header: "Emplacement", value: (l) => l.emplacement?.nom ?? "", width: 18 },
    { header: "Théorique", value: (l) => num(l.quantite_theorique) },
    { header: "Physique", value: (l) => num(l.quantite_physique) },
    { header: "Écart", value: (l) => num(l.ecart) },
    { header: "Ajusté", value: (l) => (l.ajuste ? "Oui" : "Non") },
  ];

  const filename = `inventaire_${inventaire?.reference ?? id}`;

  const handleExcel = () =>
    exportToExcel({
      rows: lignes,
      columns: excelColumns,
      filename,
      sheetName: "Inventaire",
      meta: [
        { label: "Référence", value: inventaire?.reference ?? "" },
        { label: "Date", value: formatDateShort(inventaire?.date_inventaire) },
        { label: "Emplacement", value: inventaire?.emplacement?.nom ?? "Tous" },
      ],
      totals: {
        Produit: "TOTAUX",
        Code: "",
        Emplacement: "",
        Théorique: num(lignes.reduce((s, l) => s + num(l.quantite_theorique), 0)),
        Physique: num(lignes.reduce((s, l) => s + num(l.quantite_physique), 0)),
        Écart: num(totaux?.total_ecart),
        Ajusté: "",
      },
    });

  const handlePdf = () =>
    saveElementAsPdf(
      <PVInventairePDF
        reference={inventaire?.reference ?? String(id)}
        dateInventaire={formatDateShort(inventaire?.date_inventaire)}
        emplacement={inventaire?.emplacement?.nom ?? "Tous"}
        statut={inventaire?.statut === "cloture" ? "Clôturé" : "En cours"}
        preparePar={currentUser?.nom ?? null}
        societe={societe}
        lignes={lignes.map((l) => ({
          nom: produitLabel(l),
          code: produitCode(l),
          emplacement: l.emplacement?.nom ?? null,
          theorique: num(l.quantite_theorique),
          physique: num(l.quantite_physique),
          ecart: num(l.ecart),
          ajuste: l.ajuste,
        }))}
        totaux={{
          nombre_lignes: num(totaux?.nombre_lignes),
          lignes_ajustees: num(totaux?.lignes_ajustees),
          total_ecart: num(totaux?.total_ecart),
          excedents: num(totaux?.excédents),
          manquants: num(totaux?.manquants),
        }}
      />,
      `PV_${filename}`
    );

  if (isLoading) {
    return (
      <div className="space-y-5">
        <SkeletonTable />
      </div>
    );
  }

  if (!inventaire) {
    return (
      <div className="space-y-4">
        <p className="text-slate-500">Inventaire introuvable.</p>
        <Button variant="outline" onClick={() => router.push("/dashboard/inventaire")}>
          <ArrowLeft className="mr-2 h-4 w-4" /> Retour
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-5">
      <PageHeader
        title={`Inventaire ${inventaire.reference}`}
        description={`${formatDateShort(inventaire.date_inventaire)} · ${
          inventaire.emplacement?.nom ?? "Tous les emplacements"
        }`}
        icon={<ClipboardList className="h-5 w-5" />}
        onBack={() => router.push("/dashboard/inventaire")}
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
            <Button variant="outline" onClick={handlePdf} disabled={lignes.length === 0}>
              <FileText className="mr-2 h-4 w-4" />
              PDF
            </Button>
            {!verrouille && (
              <Button
                variant="outline"
                onClick={() => genererMutation.mutate()}
                disabled={genererMutation.isPending}
              >
                <ListChecks className="mr-2 h-4 w-4" />
                Générer les lignes
              </Button>
            )}
            {!verrouille && (
              <Button variant="outline" onClick={() => setConfirmCloturer(true)}>
                <CheckCircle2 className="mr-2 h-4 w-4" />
                Clôturer
              </Button>
            )}
            {!verrouille && (
              <Button onClick={() => setConfirmAjuster(true)} disabled={lignes.length === 0}>
                Ajuster le stock
              </Button>
            )}
          </>
        }
      />

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          title="Lignes"
          value={num(totaux?.nombre_lignes)}
          icon={<Package className="h-5 w-5" />}
          color="blue"
        />
        <StatCard
          title="Excédents"
          value={num(totaux?.excédents)}
          icon={<TrendingUp className="h-5 w-5" />}
          color="emerald"
        />
        <StatCard
          title="Manquants"
          value={num(totaux?.manquants)}
          icon={<TrendingDown className="h-5 w-5" />}
          color="rose"
        />
        <StatCard
          title="Écart total"
          value={num(totaux?.total_ecart)}
          icon={<ListChecks className="h-5 w-5" />}
          color="amber"
        />
      </div>

      <Card>
        <CardContent className="p-5">
          {isLoading ? (
            <SkeletonTable />
          ) : (
            <DataTable
              data={rows}
              columns={columns}
              rowKey={"row_key" as keyof (LigneInventaire & { row_key: number })}
              emptyMessage="Aucune ligne. Cliquez sur « Générer les lignes »."
              emptyIcon={<ClipboardList className="h-12 w-12" />}
            />
          )}
        </CardContent>
      </Card>

      <ConfirmDialog
        open={confirmAjuster}
        onOpenChange={setConfirmAjuster}
        onConfirm={() => ajusterMutation.mutate()}
        title="Ajuster le stock"
        description="Les écarts saisis seront appliqués au stock disponible et l'inventaire sera clôturé. Continuer ?"
        confirmLabel="Ajuster et clôturer"
        variant="warning"
        isLoading={ajusterMutation.isPending}
      />

      <ConfirmDialog
        open={confirmCloturer}
        onOpenChange={setConfirmCloturer}
        onConfirm={() => cloturerMutation.mutate()}
        title="Clôturer l'inventaire"
        description="L'inventaire sera clôturé sans appliquer les écarts au stock. Continuer ?"
        confirmLabel="Clôturer"
        variant="info"
        isLoading={cloturerMutation.isPending}
      />
    </div>
  );
}
