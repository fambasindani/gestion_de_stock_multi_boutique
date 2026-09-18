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
import { TransfertStock, MouvementStock } from "@/lib/api/typess";
import { transfertsService } from "@/lib/api/services/transferts.service";
import {
  ArrowLeft, ArrowLeftRight, CheckCircle, XCircle, Loader2,
  Warehouse, Truck, Package, Factory, Calendar, FileText,
  Trash2, Send, Ban, ClipboardCheck
} from "lucide-react";
import { format } from "date-fns";
import { fr } from "date-fns/locale";

const typeConfig: Record<string, { label: string; icon: React.ReactNode; variant: "default" | "success" | "warning" | "danger" | "info" | "outline" }> = {
  reception: { label: "Réception", icon: <Package className="h-4 w-4" />, variant: "info" as const },
  livraison: { label: "Livraison", icon: <Truck className="h-4 w-4" />, variant: "info" as const },
  interne: { label: "Interne", icon: <ArrowLeftRight className="h-4 w-4" />, variant: "default" as const },
  production: { label: "Production", icon: <Factory className="h-4 w-4" />, variant: "info" as const },
};

const etatVariants: Record<string, "info" | "warning" | "success" | "danger" | "default" | "outline"> = {
  brouillon: "warning",
  attente: "info",
  confirme: "info",
  assigne: "default",
  termine: "success",
  annule: "danger",
};

const etatLabels: Record<string, string> = {
  brouillon: "Brouillon",
  attente: "En attente",
  confirme: "Confirmé",
  assigne: "Assigné",
  termine: "Terminé",
  annule: "Annulé",
};

const mouvementEtatVariants: Record<string, "info" | "warning" | "success" | "danger" | "default" | "outline"> = {
  brouillon: "warning",
  attente: "info",
  confirme: "info",
  assigne: "default",
  termine: "success",
  annule: "danger",
};

export default function TransfertDetails() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const queryClient = useQueryClient();
  const id = Number(params.id);
  const [confirmDialogOpen, setConfirmDialogOpen] = useState(false);
  const [confirmAction, setConfirmAction] = useState<{ mode: "etat" | "valider"; etat?: string; label: string } | null>(null);

  const { data: transfert, isLoading } = useQuery({
    queryKey: ["transfert", id],
    queryFn: async () => {
      const response = await transfertsService.getById(id);
      return response.data;
    },
    staleTime: 2 * 60 * 1000,
  });

  const mutationEtat = useMutation({
    mutationFn: async ({ etat }: { etat: string }) => {
      return transfertsService.changerEtat(id, etat);
    },
    onSuccess: (data) => {
      if (data?.success === false) {
        toast.error(data.message || "Erreur lors du changement de statut");
        return;
      }
      toast.success(`Transfert ${confirmAction?.label || "mis à jour"}`);
      queryClient.invalidateQueries({ queryKey: ["transfert", id] });
      queryClient.invalidateQueries({ queryKey: ["transferts"] });
      setConfirmDialogOpen(false);
      setConfirmAction(null);
    },
    onError: () => {
      toast.error("Erreur lors du changement de statut");
      setConfirmDialogOpen(false);
      setConfirmAction(null);
    },
  });

  // Valider = déplacer réellement le stock de la source vers la destination
  const validerMutation = useMutation({
    mutationFn: () => transfertsService.valider(id),
    onSuccess: (data) => {
      if (data?.success === false) {
        toast.error(data.message || "Erreur lors de la validation");
        return;
      }
      toast.success("Transfert validé — stock déplacé");
      queryClient.invalidateQueries({ queryKey: ["transfert", id] });
      queryClient.invalidateQueries({ queryKey: ["transferts"] });
      queryClient.invalidateQueries({ queryKey: ["stocks"] });
      setConfirmDialogOpen(false);
      setConfirmAction(null);
    },
    onError: () => {
      toast.error("Erreur lors de la validation");
      setConfirmDialogOpen(false);
      setConfirmAction(null);
    },
  });

  const handleAction = (action: { mode: "etat" | "valider"; etat?: string; label: string }) => {
    setConfirmAction(action);
    setConfirmDialogOpen(true);
  };

  const executerAction = () => {
    if (!confirmAction) return;
    if (confirmAction.mode === "valider") {
      validerMutation.mutate();
    } else if (confirmAction.etat) {
      mutationEtat.mutate({ etat: confirmAction.etat });
    }
  };

  const getAvailableActions = (etat: string) => {
    switch (etat) {
      case "brouillon":
        return [{ mode: "etat" as const, etat: "confirme", label: "Confirmer", icon: <Send className="h-4 w-4 mr-2" />, className: "bg-blue-600 hover:bg-blue-700" }];
      case "confirme":
      case "assigne":
        return [{ mode: "valider" as const, label: "Valider", icon: <ClipboardCheck className="h-4 w-4 mr-2" />, className: "bg-emerald-600 hover:bg-emerald-700" }];
      case "attente":
        return [
          { mode: "etat" as const, etat: "confirme", label: "Confirmer", icon: <Send className="h-4 w-4 mr-2" />, className: "bg-blue-600 hover:bg-blue-700" },
          { mode: "etat" as const, etat: "annule", label: "Annuler", icon: <Ban className="h-4 w-4 mr-2" />, className: "bg-red-600 hover:bg-red-700" },
        ];
      default:
        return [];
    }
  };

  const mouvementColumns = [
    {
      key: "produit_id",
      label: "Produit",
      render: (item: MouvementStock) => (
        <div className="flex items-center gap-2">
          <div className="h-8 w-8 rounded-full bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center">
            <Package className="h-4 w-4 text-purple-600" />
          </div>
          <span className="font-medium">{item.nom_produit || `Produit #${item.produit_id}`}</span>
        </div>
      ),
    },
    {
      key: "code_produit",
      label: "Code",
      render: (item: MouvementStock) => (
        <span className="text-xs font-mono bg-gray-100 dark:bg-gray-800 px-2 py-1 rounded">
          {item.code_produit || "-"}
        </span>
      ),
    },
    {
      key: "lot_id",
      label: "Lot",
      render: (item: MouvementStock) => (
        <span className="text-sm text-gray-600 dark:text-gray-400">
          {item.lot?.nom || item.lot?.code || "-"}
        </span>
      ),
    },
    {
      key: "quantite_demandee",
      label: "Demandée",
      render: (item: MouvementStock) => (
        <span className="font-medium">{item.quantite_demandee}</span>
      ),
    },
    {
      key: "quantite_traitee",
      label: "Traitée",
      render: (item: MouvementStock) => (
        <span className="font-medium text-emerald-600">{item.quantite_traitee}</span>
      ),
    },
    {
      key: "etat",
      label: "Statut",
      render: (item: MouvementStock) => (
        <DataTableBadge variant={mouvementEtatVariants[item.etat] || "default"}>
          {etatLabels[item.etat] || item.etat}
        </DataTableBadge>
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
              <SkeletonCard className="h-6 w-20" />
              <SkeletonCard className="h-6 w-20" />
            </div>
          </div>
          <div className="flex gap-2">
            <SkeletonCard className="h-10 w-32" />
            <SkeletonCard className="h-10 w-32" />
          </div>
        </div>
        <SkeletonCard className="h-80" />
      </div>
    );
  }

  if (!transfert) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center">
        <ArrowLeftRight className="h-16 w-16 text-slate-200 mb-4" />
        <h3 className="text-xl font-bold text-slate-900">Transfert introuvable</h3>
        <Button onClick={() => router.push("/dashboard/stock/transferts")} className="mt-6">
          <ArrowLeft className="mr-2 h-4 w-4" /> Retour à la liste
        </Button>
      </div>
    );
  }

  const availableActions = getAvailableActions(transfert.etat);

  return (
    <div className="max-w-7xl mx-auto p-4 md:p-8 space-y-8 bg-slate-50/30 dark:bg-transparent min-h-screen">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <Button variant="ghost" onClick={() => router.back()} className="-ml-4 text-slate-500 hover:text-slate-900">
            <ArrowLeft className="mr-2 h-4 w-4" /> Retour
          </Button>
          <h1 className="text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
            {transfert.reference || `Transfert #${transfert.id}`}
          </h1>
          <div className="flex flex-wrap gap-2 mt-2">
            <DataTableBadge variant={typeConfig[transfert.type]?.variant || "default"}>
              <span className="flex items-center gap-1">
                {typeConfig[transfert.type]?.icon}
                {typeConfig[transfert.type]?.label || transfert.type}
              </span>
            </DataTableBadge>
            <DataTableBadge variant={etatVariants[transfert.etat] || "default"}>
              {etatLabels[transfert.etat] || transfert.etat}
            </DataTableBadge>
          </div>
        </div>
        <div className="flex gap-2">
          {availableActions.map((action, i) => (
            <Button
              key={"etat" in action && action.etat ? action.etat : action.label}
              onClick={() => handleAction(action)}
              className={action.className}
            >
              {action.icon}
              {action.label}
            </Button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-2 space-y-6">
          <Card className="border-none shadow-xl shadow-slate-200/50 dark:shadow-none rounded-3xl">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <ClipboardCheck className="h-4 w-4 text-blue-500" />
                Détails du transfert
              </CardTitle>
            </CardHeader>
            <CardContent className="grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-6">
              <div className="space-y-1">
                <p className="text-xs text-slate-400 font-semibold uppercase">Type</p>
                <p className="text-sm font-medium border-b pb-1">
                  {typeConfig[transfert.type]?.label || transfert.type}
                </p>
              </div>
              <div className="space-y-1">
                <p className="text-xs text-slate-400 font-semibold uppercase">Statut</p>
                <p className="text-sm font-medium border-b pb-1">
                  {etatLabels[transfert.etat] || transfert.etat}
                </p>
              </div>
              <div className="space-y-1">
                <p className="text-xs text-slate-400 font-semibold uppercase">Source</p>
                <p className="text-sm font-medium border-b pb-1">
                  {transfert.emplacementSource?.nom || `#${transfert.emplacement_source_id}`}
                </p>
              </div>
              <div className="space-y-1">
                <p className="text-xs text-slate-400 font-semibold uppercase">Destination</p>
                <p className="text-sm font-medium border-b pb-1">
                  {transfert.emplacementDestination?.nom || `#${transfert.emplacement_destination_id}`}
                </p>
              </div>
              <div className="space-y-1">
                <p className="text-xs text-slate-400 font-semibold uppercase">Date prévue</p>
                <p className="text-sm font-medium border-b pb-1">
                  {transfert.date_prevue
                    ? format(new Date(transfert.date_prevue), "dd MMMM yyyy", { locale: fr })
                    : "-"}
                </p>
              </div>
              <div className="space-y-1">
                <p className="text-xs text-slate-400 font-semibold uppercase">Date réelle</p>
                <p className="text-sm font-medium border-b pb-1">
                  {transfert.date_reelle
                    ? format(new Date(transfert.date_reelle), "dd MMMM yyyy", { locale: fr })
                    : "-"}
                </p>
              </div>
              <div className="space-y-1">
                <p className="text-xs text-slate-400 font-semibold uppercase">Origine</p>
                <p className="text-sm font-medium border-b pb-1">{transfert.origine || "-"}</p>
              </div>
              <div className="space-y-1">
                <p className="text-xs text-slate-400 font-semibold uppercase">Mode transport</p>
                <p className="text-sm font-medium border-b pb-1">{transfert.mode_transport || "-"}</p>
              </div>
            </CardContent>
            {transfert.notes && (
              <CardContent className="pt-0">
                <p className="text-xs text-slate-400 font-semibold uppercase mb-2">Notes</p>
                <p className="text-sm text-slate-600 dark:text-slate-300 italic bg-slate-50 dark:bg-gray-800/50 p-4 rounded-xl">
                  {transfert.notes}
                </p>
              </CardContent>
            )}
          </Card>

          <Card className="border-none shadow-xl shadow-slate-200/50 dark:shadow-none rounded-3xl">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Package className="h-4 w-4 text-purple-500" />
                Mouvements ({transfert.mouvements?.length || 0})
              </CardTitle>
            </CardHeader>
            <CardContent>
              <DataTable
                data={transfert.mouvements || []}
                columns={mouvementColumns}
                loading={false}
                emptyMessage="Aucun mouvement"
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
                <Calendar className="h-4 w-4 text-blue-500" />
                Chronologie
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-1">
                <p className="text-xs text-slate-400 font-semibold uppercase">Créé le</p>
                <p className="text-sm font-medium">
                  {transfert.created_at
                    ? format(new Date(transfert.created_at), "dd/MM/yyyy HH:mm", { locale: fr })
                    : "-"}
                </p>
              </div>
              <div className="space-y-1">
                <p className="text-xs text-slate-400 font-semibold uppercase">Dernière modification</p>
                <p className="text-sm font-medium">
                  {transfert.updated_at
                    ? format(new Date(transfert.updated_at), "dd/MM/yyyy HH:mm", { locale: fr })
                    : "-"}
                </p>
              </div>
              {transfert.date_transfert && (
                <div className="space-y-1">
                  <p className="text-xs text-slate-400 font-semibold uppercase">Date transfert</p>
                  <p className="text-sm font-medium">
                    {format(new Date(transfert.date_transfert), "dd/MM/yyyy HH:mm", { locale: fr })}
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>

      <ConfirmDialog
        open={confirmDialogOpen}
        onOpenChange={setConfirmDialogOpen}
        onConfirm={executerAction}
        title={`${confirmAction?.label || "Confirmer"} le transfert`}
        description={
          confirmAction?.mode === "valider"
            ? "Valider déplace définitivement le stock de l'emplacement source vers l'emplacement destination. Confirmer ?"
            : `Êtes-vous sûr de vouloir passer ce transfert à l'état "${confirmAction?.label || confirmAction?.etat || ""}" ?`
        }
        confirmLabel={confirmAction?.label || "Confirmer"}
        cancelLabel="Annuler"
        variant={confirmAction?.mode === "valider" ? "warning" : "info"}
        isLoading={mutationEtat.isPending || validerMutation.isPending}
      />
    </div>
  );
}
