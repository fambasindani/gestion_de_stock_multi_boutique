"use client";

import React, { useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { SkeletonCard } from "@/components/ui/skeleton";
import { ConfirmDialog } from "@/components/common/ConfirmDialog";
import { commandesAchatService } from "@/lib/api/services/commandes-achat.service";
import { CommandeAchat } from "@/lib/api/typess";
import { formatDateLong } from "@/lib/utils/format";
import {
  ArrowLeft, Truck, Pencil, Trash2, User, Calendar, FileText,
  Euro, Package, Send, XCircle, CheckCircle, ClipboardList, Loader2,
  Archive,
} from "lucide-react";

const statusLabels: Record<string, string> = {
  brouillon: "Brouillon",
  confirme: "Confirmé",
  envoye: "Envoyé",
  recu: "Reçu",
  termine: "Terminé",
  annule: "Annulé",
};

const statusVariants: Record<string, "default" | "destructive" | "outline" | "secondary"> = {
  brouillon: "outline",
  confirme: "default",
  envoye: "secondary",
  recu: "default",
  termine: "default",
  annule: "destructive",
};

const nextStatus: Record<string, string> = {
  brouillon: "confirme",
  confirme: "envoye",
  envoye: "recu",
  recu: "termine",
};

export default function CommandeAchatDetails() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const queryClient = useQueryClient();
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [statusDialogOpen, setStatusDialogOpen] = useState(false);
  const [nextEtat, setNextEtat] = useState<string>("");
  const [changingStatus, setChangingStatus] = useState(false);

  const { data: commande, isLoading } = useQuery({
    queryKey: ["commande-achat", params.id],
    queryFn: async () => {
      const response = await commandesAchatService.getById(Number(params.id));
      return response.data;
    },
    staleTime: 2 * 60 * 1000,
  });

  const deleteMutation = useMutation({
    mutationFn: () => commandesAchatService.delete(Number(params.id)),
    onSuccess: () => {
      toast.success("Commande supprimée avec succès");
      queryClient.invalidateQueries({ queryKey: ["commandes-achat"] });
      router.push("/achats/commandes");
    },
    onError: () => toast.error("Erreur lors de la suppression"),
    onSettled: () => setDeleteDialogOpen(false),
  });

  const handleChangerEtat = async (etat: string) => {
    setChangingStatus(true);
    try {
      const response = await commandesAchatService.changerEtat(Number(params.id), etat);
      if (response.success) {
        toast.success(`Statut changé en "${statusLabels[etat]}"`);
        queryClient.invalidateQueries({ queryKey: ["commande-achat", params.id] });
        queryClient.invalidateQueries({ queryKey: ["commandes-achat"] });
      } else {
        toast.error(response.message || "Erreur lors du changement de statut");
      }
    } catch (error) {
      toast.error("Erreur lors du changement de statut");
    } finally {
      setChangingStatus(false);
      setStatusDialogOpen(false);
    }
  };

  const handleNextStatusClick = () => {
    if (!commande) return;
    const next = nextStatus[commande.etat];
    if (next) {
      setNextEtat(next);
      setStatusDialogOpen(true);
    }
  };

  const handleReceptionnerClick = () => {
    if (!commande) return;
    setNextEtat("recu");
    setStatusDialogOpen(true);
  };

  const handleAnnulerClick = () => {
    if (!commande) return;
    setNextEtat("annule");
    setStatusDialogOpen(true);
  };

  if (isLoading) {
    return (
      <div className="max-w-7xl mx-auto p-4 md:p-8 space-y-8 bg-slate-50/30 min-h-screen">
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
            <SkeletonCard className="h-10 w-24" />
            <SkeletonCard className="h-10 w-24" />
          </div>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <SkeletonCard key={i} className="h-24" />
          ))}
        </div>
        <div className="grid grid-cols-1 gap-6">
          <SkeletonCard className="h-80" />
        </div>
      </div>
    );
  }

  if (!commande) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center">
        <Truck className="h-16 w-16 text-slate-200 mb-4" />
        <h3 className="text-xl font-bold text-slate-900">Commande introuvable</h3>
        <Button onClick={() => router.push("/achats/commandes")} className="mt-6">
          <ArrowLeft className="mr-2 h-4 w-4" /> Retour à la liste
        </Button>
      </div>
    );
  }

  const InfoStat = ({ icon: Icon, label, value, colorClass }: any) => (
    <div className="flex items-center gap-4 p-5 rounded-2xl bg-white border border-slate-100 shadow-sm hover:shadow-md transition-all duration-200">
      <div className={`p-3 rounded-xl ${colorClass}`}>
        <Icon className="h-6 w-6" />
      </div>
      <div>
        <p className="text-[11px] font-bold text-slate-400 uppercase tracking-widest">{label}</p>
        <p className="text-lg font-bold text-slate-800">{value}</p>
      </div>
    </div>
  );

  const canProgress = !!nextStatus[commande.etat];
  const canReceptionner = commande.etat === "envoye";
  const canCancel = commande.etat !== "annule" && commande.etat !== "termine";
  const canModify = commande.etat === "brouillon";

  return (
    <div className="max-w-7xl mx-auto p-4 md:p-8 space-y-8 bg-slate-50/30 min-h-screen">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <Button variant="ghost" onClick={() => router.back()} className="-ml-4 text-slate-500 hover:text-slate-900">
            <ArrowLeft className="mr-2 h-4 w-4" /> Retour
          </Button>
          <h1 className="text-4xl font-extrabold text-slate-900 tracking-tight">{commande.reference}</h1>
          <div className="flex gap-2 mt-2">
            <Badge variant={statusVariants[commande.etat] || "outline"}>
              {statusLabels[commande.etat] || commande.etat}
            </Badge>
            <Badge variant="outline" className="bg-white">
              {commande.partenaire?.nom || "Fournisseur inconnu"}
            </Badge>
          </div>
        </div>
        <div className="flex gap-2">
          {canModify && (
            <Button variant="outline" onClick={() => router.push(`/achats/commandes/${commande.id}/modifier`)}>
              <Pencil className="mr-2 h-4 w-4" /> Modifier
            </Button>
          )}
          {canReceptionner && (
            <Button className="bg-emerald-600 hover:bg-emerald-700" onClick={handleReceptionnerClick} disabled={changingStatus}>
              {changingStatus ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Archive className="mr-2 h-4 w-4" />}
              Réceptionner
            </Button>
          )}
          {canProgress && !canReceptionner && (
            <Button className="bg-blue-600 hover:bg-blue-700" onClick={handleNextStatusClick} disabled={changingStatus}>
              {changingStatus ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Send className="mr-2 h-4 w-4" />}
              Passer à {statusLabels[nextStatus[commande.etat]]}
            </Button>
          )}
          {canCancel && (
            <Button variant="destructive" onClick={handleAnnulerClick} disabled={changingStatus}>
              <XCircle className="mr-2 h-4 w-4" /> Annuler
            </Button>
          )}
          {canModify && (
            <Button variant="destructive" onClick={() => setDeleteDialogOpen(true)}>
              <Trash2 className="mr-2 h-4 w-4" /> Supprimer
            </Button>
          )}
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <InfoStat icon={User} label="Fournisseur" value={commande.partenaire?.nom || "-"} colorClass="bg-amber-100 text-amber-600" />
        <InfoStat icon={Calendar} label="Date" value={formatDateLong(commande.date_commande)} colorClass="bg-purple-100 text-purple-600" />
        <InfoStat icon={Euro} label="Total TTC" value={`${Number(commande.montant_total_ttc).toLocaleString("fr-FR", { minimumFractionDigits: 2 })} CDF`} colorClass="bg-emerald-100 text-emerald-600" />
        <InfoStat icon={ClipboardList} label="Statut" value={statusLabels[commande.etat] || commande.etat} colorClass={commande.etat === "termine" || commande.etat === "recu" ? "bg-emerald-100 text-emerald-600" : commande.etat === "annule" ? "bg-red-100 text-red-600" : "bg-amber-100 text-amber-600"} />
      </div>

      <div className="grid grid-cols-1 gap-6">
        <Card className="border-none shadow-xl shadow-slate-200/50 rounded-3xl p-2">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Package className="h-5 w-5" /> Lignes de commande
            </CardTitle>
          </CardHeader>
          <CardContent>
            {commande.lignes && commande.lignes.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      <th className="pb-3 pr-4">Produit</th>
                      <th className="pb-3 pr-4 text-right">Quantité</th>
                      <th className="pb-3 pr-4 text-right">Qté reçue</th>
                      <th className="pb-3 pr-4 text-right">Prix unitaire HT</th>
                      <th className="pb-3 pr-4 text-right">Remise</th>
                      <th className="pb-3 text-right">Total HT</th>
                    </tr>
                  </thead>
                  <tbody>
                    {commande.lignes.map((ligne) => (
                      <tr key={ligne.id} className="border-b last:border-0">
                        <td className="py-3 pr-4 font-medium">{ligne.nom_produit}</td>
                        <td className="py-3 pr-4 text-right">{ligne.quantite}</td>
                        <td className="py-3 pr-4 text-right">
                          <span className={ligne.quantite_recue >= ligne.quantite ? "text-emerald-600 font-medium" : "text-amber-600"}>
                            {ligne.quantite_recue}
                          </span>
                        </td>
                        <td className="py-3 pr-4 text-right">
                          {Number(ligne.prix_unitaire_ht).toLocaleString("fr-FR", { minimumFractionDigits: 2 })} CDF
                        </td>
                        <td className="py-3 pr-4 text-right">{ligne.taux_remise}%</td>
                        <td className="py-3 text-right font-medium">
                          {Number(ligne.montant_total_ht).toLocaleString("fr-FR", { minimumFractionDigits: 2 })} CDF
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <p className="text-sm text-gray-500 italic">Aucune ligne de commande</p>
            )}

            <div className="mt-6 pt-4 border-t space-y-1 text-right">
              <div className="flex justify-end items-center gap-4">
                <span className="text-sm text-gray-500">Total HT :</span>
                <span className="font-semibold">
                  {Number(commande.montant_total_ht).toLocaleString("fr-FR", { minimumFractionDigits: 2 })} CDF
                </span>
              </div>
              <div className="flex justify-end items-center gap-4">
                <span className="text-sm text-gray-500">TVA (20%) :</span>
                <span className="font-semibold">
                  {(Number(commande.montant_total_ttc) - Number(commande.montant_total_ht)).toLocaleString("fr-FR", { minimumFractionDigits: 2 })} CDF
                </span>
              </div>
              <div className="flex justify-end items-center gap-4 text-lg">
                <span className="font-semibold text-gray-700">Total TTC :</span>
                <span className="font-bold text-blue-700">
                  {Number(commande.montant_total_ttc).toLocaleString("fr-FR", { minimumFractionDigits: 2 })} CDF
                </span>
              </div>
            </div>
          </CardContent>
        </Card>

        {commande.notes && (
          <Card className="border-none shadow-xl shadow-slate-200/50 rounded-3xl">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-4 w-4" /> Notes
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-slate-600 italic bg-slate-50 p-4 rounded-xl">{commande.notes}</p>
            </CardContent>
          </Card>
        )}
      </div>

      <ConfirmDialog
        open={deleteDialogOpen}
        onOpenChange={setDeleteDialogOpen}
        onConfirm={() => deleteMutation.mutate()}
        title="Suppression définitive"
        description={`Êtes-vous sûr de vouloir supprimer ${commande.reference} ? Cette action est irréversible.`}
        isLoading={deleteMutation.isPending}
      />

      <ConfirmDialog
        open={statusDialogOpen}
        onOpenChange={setStatusDialogOpen}
        onConfirm={() => handleChangerEtat(nextEtat)}
        title="Changer le statut"
        description={`Êtes-vous sûr de vouloir passer cette commande au statut "${statusLabels[nextEtat] || nextEtat}" ?`}
        confirmLabel="Confirmer"
        cancelLabel="Annuler"
        variant="info"
        isLoading={changingStatus}
      />
    </div>
  );
}
