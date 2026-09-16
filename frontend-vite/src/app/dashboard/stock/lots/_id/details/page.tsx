"use client";

import React, { useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { SkeletonCard } from "@/components/ui/skeleton";
import { DataTable, DataTableBadge } from "@/components/common/DataTable";
import { ConfirmDialog } from "@/components/common/ConfirmDialog";
import { lotsService } from "@/lib/api/services/lots.service";
import { stockService } from "@/lib/api/services/stock.service";
import { QuantiteStock } from "@/lib/api/typess";
import {
  ArrowLeft, Tag, CheckCircle, XCircle, Loader2, Package,
  Calendar, Building2, Ruler, Warehouse, Lock, Unlock,
  Pencil, Trash2, ClipboardCheck
} from "lucide-react";
import { format } from "date-fns";
import { fr } from "date-fns/locale";

const statutVariants: Record<string, "success" | "danger" | "warning" | "info" | "default"> = {
  actif: "success",
  epuise: "default",
  perime: "danger",
  bloque: "warning",
};

const statutLabels: Record<string, string> = {
  actif: "Actif",
  epuise: "Épuisé",
  perime: "Périmé",
  bloque: "Bloqué",
};

export default function LotDetails() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const queryClient = useQueryClient();
  const id = Number(params.id);

  const [actionDialogOpen, setActionDialogOpen] = useState(false);
  const [currentAction, setCurrentAction] = useState<{ type: "reserver" | "liberer"; label: string } | null>(null);
  const [quantiteAction, setQuantiteAction] = useState("1");

  const { data: lot, isLoading } = useQuery({
    queryKey: ["lot", id],
    queryFn: async () => {
      const response = await lotsService.getById(id);
      return response.data;
    },
    staleTime: 2 * 60 * 1000,
  });

  const { data: stocksData } = useQuery({
    queryKey: ["stocks-lot", id],
    queryFn: async () => {
      const response = await stockService.getAll({
        per_page: 100,
        ...(id ? {} : {}),
      });
      const stocks_arr = Array.isArray(response.data) ? response.data : (response.data as any)?.data ?? [];
      return stocks_arr.filter((s: QuantiteStock) => s.lot_id === id);
    },
    staleTime: 2 * 60 * 1000,
    enabled: !!id,
  });

  const actionMutation = useMutation({
    mutationFn: async ({ type, quantite }: { type: string; quantite?: number }) => {
      if (type === "reserver") return lotsService.reserver(id, quantite);
      return lotsService.liberer(id, quantite);
    },
    onSuccess: (data) => {
      if (data?.success === false) {
        toast.error(data.message || "Erreur lors de l'opération");
        return;
      }
      toast.success(`Lot ${currentAction?.label || "mis à jour"} avec succès`);
      queryClient.invalidateQueries({ queryKey: ["lot", id] });
      queryClient.invalidateQueries({ queryKey: ["stocks-lot", id] });
      setActionDialogOpen(false);
      setCurrentAction(null);
      setQuantiteAction("1");
    },
    onError: () => {
      toast.error("Erreur lors de l'opération");
      setActionDialogOpen(false);
      setCurrentAction(null);
    },
  });

  const handleAction = (type: "reserver" | "liberer", label: string) => {
    setCurrentAction({ type, label });
    setQuantiteAction("1");
    setActionDialogOpen(true);
  };

  const confirmAction = () => {
    if (currentAction) {
      actionMutation.mutate({ type: currentAction.type, quantite: Number(quantiteAction) });
    }
  };

  const stockColumns = [
    {
      key: "emplacement_id",
      label: "Emplacement",
      render: (item: QuantiteStock) => (
        <div className="flex items-center gap-2">
          <Warehouse className="h-4 w-4 text-amber-400" />
          <span className="font-medium">{item.emplacement?.nom || `#${item.emplacement_id}`}</span>
        </div>
      ),
    },
    {
      key: "quantite_disponible",
      label: "Disponible",
      render: (item: QuantiteStock) => (
        <span className="font-semibold text-emerald-600">{item.quantite_disponible}</span>
      ),
    },
    {
      key: "quantite_reservee",
      label: "Réservée",
      render: (item: QuantiteStock) => (
        <span className="font-semibold text-amber-600">{item.quantite_reservee}</span>
      ),
    },
    {
      key: "seuil_minimum",
      label: "Seuil Mini",
      render: (item: QuantiteStock) => (
        <span className="text-sm text-gray-500">{item.seuil_minimum ?? "-"}</span>
      ),
    },
  ];

  if (isLoading) {
    return (
      <div className="max-w-7xl mx-auto p-4 md:p-8 space-y-8 min-h-screen">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-2">
            <SkeletonCard className="h-10 w-24" />
            <SkeletonCard className="h-10 w-64" />
            <div className="flex gap-2">
              <SkeletonCard className="h-6 w-16" />
              <SkeletonCard className="h-6 w-20" />
            </div>
          </div>
          <div className="flex gap-2">
            <SkeletonCard className="h-10 w-32" />
            <SkeletonCard className="h-10 w-32" />
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="md:col-span-2">
            <SkeletonCard className="h-80" />
          </div>
          <div>
            <SkeletonCard className="h-60" />
          </div>
        </div>
      </div>
    );
  }

  if (!lot) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center">
        <Tag className="h-16 w-16 text-slate-200 mb-4" />
        <h3 className="text-xl font-bold text-slate-900">Lot introuvable</h3>
        <Button onClick={() => router.push("/dashboard/stock/lots")} className="mt-6">
          <ArrowLeft className="mr-2 h-4 w-4" /> Retour à la liste
        </Button>
      </div>
    );
  }

  const isPerime = lot.date_peremption && new Date(lot.date_peremption) < new Date();

  return (
    <div className="max-w-7xl mx-auto p-4 md:p-8 space-y-8 bg-slate-50/30 dark:bg-transparent min-h-screen">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <Button variant="ghost" onClick={() => router.back()} className="-ml-4 text-slate-500 hover:text-slate-900">
            <ArrowLeft className="mr-2 h-4 w-4" /> Retour
          </Button>
          <h1 className="text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
            {lot.nom || lot.code || `Lot #${lot.id}`}
          </h1>
          <div className="flex flex-wrap gap-2 mt-2">
            <DataTableBadge variant={statutVariants[lot.statut] || "default"}>
              {statutLabels[lot.statut] || lot.statut}
            </DataTableBadge>
            <DataTableBadge variant={lot.type === "lot" ? "info" : "success"}>
              {lot.type === "lot" ? "Lot" : "Série"}
            </DataTableBadge>
            {isPerime && lot.statut !== "perime" && (
              <Badge variant="destructive" className="animate-pulse">
                <Calendar className="h-3 w-3 mr-1" /> Périmé
              </Badge>
            )}
            <Badge variant="outline" className="bg-white dark:bg-gray-800">
              Code: {lot.code || "N/A"}
            </Badge>
          </div>
        </div>
        <div className="flex gap-2">
          {lot.statut === "actif" && lot.quantite_actuelle > 0 && (
            <Button
              variant="outline"
              onClick={() => handleAction("reserver", "Réservation")}
              className="text-blue-600 border-blue-200 hover:bg-blue-50"
            >
              <Lock className="h-4 w-4 mr-2" /> Réserver
            </Button>
          )}
          {lot.quantite_reservee > 0 && (
            <Button
              variant="outline"
              onClick={() => handleAction("liberer", "Libération")}
              className="text-amber-600 border-amber-200 hover:bg-amber-50"
            >
              <Unlock className="h-4 w-4 mr-2" /> Libérer
            </Button>
          )}
          <Button variant="outline" onClick={() => router.push(`/dashboard/stock/lots/${lot.id}/modifier`)}>
            <Pencil className="h-4 w-4 mr-2" /> Modifier
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-2 space-y-6">
          <Card className="border-none shadow-xl shadow-slate-200/50 dark:shadow-none rounded-3xl">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Tag className="h-4 w-4 text-cyan-500" />
                Informations du lot
              </CardTitle>
            </CardHeader>
            <CardContent className="grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-6">
              <div className="space-y-1">
                <p className="text-xs text-slate-400 font-semibold uppercase">Produit</p>
                <p className="text-sm font-medium border-b pb-1">
                  {lot.produit?.nom || `Produit #${lot.produit_id}`}
                </p>
              </div>
              <div className="space-y-1">
                <p className="text-xs text-slate-400 font-semibold uppercase">Type</p>
                <p className="text-sm font-medium border-b pb-1">
                  {lot.type === "lot" ? "Lot" : "Numéro de série"}
                </p>
              </div>
              <div className="space-y-1">
                <p className="text-xs text-slate-400 font-semibold uppercase">Quantité initiale</p>
                <p className="text-sm font-medium border-b pb-1">{lot.quantite_initiale}</p>
              </div>
              <div className="space-y-1">
                <p className="text-xs text-slate-400 font-semibold uppercase">Quantité actuelle</p>
                <p className="text-sm font-medium border-b pb-1">
                  <span className="text-emerald-600 font-bold">{lot.quantite_actuelle}</span>
                </p>
              </div>
              <div className="space-y-1">
                <p className="text-xs text-slate-400 font-semibold uppercase">Quantité réservée</p>
                <p className="text-sm font-medium border-b pb-1">
                  <span className="text-amber-600">{lot.quantite_reservee}</span>
                </p>
              </div>
              <div className="space-y-1">
                <p className="text-xs text-slate-400 font-semibold uppercase">Disponible</p>
                <p className="text-sm font-medium border-b pb-1">
                  <span className="text-emerald-600 font-bold">
                    {lot.quantite_actuelle - lot.quantite_reservee}
                  </span>
                </p>
              </div>
              <div className="space-y-1">
                <p className="text-xs text-slate-400 font-semibold uppercase">Date de production</p>
                <p className="text-sm font-medium border-b pb-1">
                  {lot.date_production
                    ? format(new Date(lot.date_production), "dd MMMM yyyy", { locale: fr })
                    : "-"}
                </p>
              </div>
              <div className="space-y-1">
                <p className="text-xs text-slate-400 font-semibold uppercase">Date de péremption</p>
                <p className={`text-sm font-medium border-b pb-1 ${isPerime ? "text-red-500" : ""}`}>
                  {lot.date_peremption
                    ? format(new Date(lot.date_peremption), "dd MMMM yyyy", { locale: fr })
                    : "-"}
                  {isPerime && " (Périmé)"}
                </p>
              </div>
              <div className="space-y-1">
                <p className="text-xs text-slate-400 font-semibold uppercase">Fournisseur</p>
                <p className="text-sm font-medium border-b pb-1">{lot.fournisseur || "-"}</p>
              </div>
              <div className="space-y-1">
                <p className="text-xs text-slate-400 font-semibold uppercase">Réf. fournisseur</p>
                <p className="text-sm font-medium border-b pb-1">{lot.reference_fournisseur || "-"}</p>
              </div>
              <div className="space-y-1">
                <p className="text-xs text-slate-400 font-semibold uppercase">Unité</p>
                <p className="text-sm font-medium border-b pb-1">{lot.unite || "-"}</p>
              </div>
              <div className="space-y-1">
                <p className="text-xs text-slate-400 font-semibold uppercase">Date réception</p>
                <p className="text-sm font-medium border-b pb-1">
                  {lot.date_reception
                    ? format(new Date(lot.date_reception), "dd MMMM yyyy", { locale: fr })
                    : "-"}
                </p>
              </div>
            </CardContent>
            {lot.notes && (
              <CardContent className="pt-0">
                <p className="text-xs text-slate-400 font-semibold uppercase mb-2">Notes</p>
                <p className="text-sm text-slate-600 dark:text-slate-300 italic bg-slate-50 dark:bg-gray-800/50 p-4 rounded-xl">
                  {lot.notes}
                </p>
              </CardContent>
            )}
          </Card>

          <Card className="border-none shadow-xl shadow-slate-200/50 dark:shadow-none rounded-3xl">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Package className="h-4 w-4 text-emerald-500" />
                Stocks avec ce lot
              </CardTitle>
            </CardHeader>
            <CardContent>
              <DataTable
                data={stocksData || []}
                columns={stockColumns}
                loading={false}
                emptyMessage="Aucun stock associé à ce lot"
                emptyIcon={<Package className="h-12 w-12" />}
                rowKey="id"
              />
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6">
          <Card className="border-none shadow-xl shadow-slate-200/50 dark:shadow-none rounded-3xl">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Ruler className="h-4 w-4 text-cyan-500" />
                Résumé quantités
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center justify-between p-3 rounded-lg bg-emerald-50 dark:bg-emerald-950/20">
                  <span className="text-sm font-medium text-emerald-700 dark:text-emerald-400">Initiale</span>
                  <span className="text-lg font-bold text-emerald-700 dark:text-emerald-400">{lot.quantite_initiale}</span>
                </div>
                <div className="flex items-center justify-between p-3 rounded-lg bg-blue-50 dark:bg-blue-950/20">
                  <span className="text-sm font-medium text-blue-700 dark:text-blue-400">Actuelle</span>
                  <span className="text-lg font-bold text-blue-700 dark:text-blue-400">{lot.quantite_actuelle}</span>
                </div>
                <div className="flex items-center justify-between p-3 rounded-lg bg-amber-50 dark:bg-amber-950/20">
                  <span className="text-sm font-medium text-amber-700 dark:text-amber-400">Réservée</span>
                  <span className="text-lg font-bold text-amber-700 dark:text-amber-400">{lot.quantite_reservee}</span>
                </div>
                <div className="flex items-center justify-between p-3 rounded-lg bg-emerald-50 dark:bg-emerald-950/20 border-2 border-emerald-200 dark:border-emerald-800">
                  <span className="text-sm font-medium text-emerald-700 dark:text-emerald-400">Disponible</span>
                  <span className="text-lg font-bold text-emerald-700 dark:text-emerald-400">
                    {lot.quantite_actuelle - lot.quantite_reservee}
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-none shadow-xl shadow-slate-200/50 dark:shadow-none rounded-3xl">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <ClipboardCheck className="h-4 w-4 text-blue-500" />
                Actions rapides
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {lot.statut === "actif" && lot.quantite_actuelle > 0 && (
                <Button
                  variant="outline"
                  className="w-full justify-start text-blue-600"
                  onClick={() => handleAction("reserver", "Réservation")}
                  disabled={actionMutation.isPending}
                >
                  <Lock className="h-4 w-4 mr-2" /> Réserver du stock
                </Button>
              )}
              {lot.quantite_reservee > 0 && (
                <Button
                  variant="outline"
                  className="w-full justify-start text-amber-600"
                  onClick={() => handleAction("liberer", "Libération")}
                  disabled={actionMutation.isPending}
                >
                  <Unlock className="h-4 w-4 mr-2" /> Libérer du stock
                </Button>
              )}
              <Button
                variant="outline"
                className="w-full justify-start"
                onClick={() => router.push(`/dashboard/stock/lots/${lot.id}/modifier`)}
              >
                <Pencil className="h-4 w-4 mr-2" /> Modifier le lot
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>

      <ConfirmDialog
        open={actionDialogOpen}
        onOpenChange={setActionDialogOpen}
        onConfirm={confirmAction}
        title={`${currentAction?.label || "Confirmer"} du stock`}
        description={
          <>
            <p className="mb-3">
              {currentAction?.type === "reserver"
                ? "Combien d'unités souhaitez-vous réserver ?"
                : "Combien d'unités souhaitez-vous libérer ?"}
            </p>
            <div className="flex items-center gap-2">
              <input
                type="number"
                min="1"
                max={
                  currentAction?.type === "reserver"
                    ? lot?.quantite_actuelle - lot?.quantite_reservee
                    : lot?.quantite_reservee
                }
                value={quantiteAction}
                onChange={(e) => setQuantiteAction(e.target.value)}
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                placeholder="Quantité"
              />
              <span className="text-sm text-gray-500">
                / {currentAction?.type === "reserver"
                  ? (lot?.quantite_actuelle || 0) - (lot?.quantite_reservee || 0)
                  : lot?.quantite_reservee || 0}
              </span>
            </div>
          </>
        }
        confirmLabel={currentAction?.label || "Confirmer"}
        cancelLabel="Annuler"
        variant={currentAction?.type === "liberer" ? "warning" : "info"}
        isLoading={actionMutation.isPending}
      />
    </div>
  );
}
