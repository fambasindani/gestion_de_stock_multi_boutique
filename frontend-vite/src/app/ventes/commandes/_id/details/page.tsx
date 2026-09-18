"use client";
import { DEVISE } from "@/lib/utils/currency";

import React, { useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { SkeletonCard } from "@/components/ui/skeleton";
import { ConfirmDialog } from "@/components/common/ConfirmDialog";
import { FormInput } from "@/components/common/FormInput";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter,
} from "@/components/ui/dialog";
import { commandesVenteService } from "@/lib/api/services/commandes-vente.service";
import { facturesService } from "@/lib/api/services/factures.service";
import { CommandeVente } from "@/lib/api/typess";
import { formatDateLong, formatDateInput } from "@/lib/utils/format";
import {
  ArrowLeft, ShoppingCart, Pencil, Trash2, User, Calendar, Truck,
  FileText, Euro, Percent, Package, CheckCircle, XCircle, Send,
  ClipboardList, Loader2, CreditCard,
} from "lucide-react";

const statusLabels: Record<string, string> = {
  brouillon: "Brouillon",
  confirme: "Confirmé",
  en_cours: "En cours",
  termine: "Terminé",
  annule: "Annulé",
};

const statusVariants: Record<string, "default" | "destructive" | "outline" | "secondary"> = {
  brouillon: "outline",
  confirme: "default",
  en_cours: "secondary",
  termine: "default",
  annule: "destructive",
};

const nextStatus: Record<string, string> = {
  brouillon: "confirme",
  confirme: "en_cours",
  en_cours: "termine",
};

export default function CommandeVenteDetails() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const queryClient = useQueryClient();
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [statusDialogOpen, setStatusDialogOpen] = useState(false);
  const [nextEtat, setNextEtat] = useState<string>("");
  const [changingStatus, setChangingStatus] = useState(false);
  const [paiementDialogOpen, setPaiementDialogOpen] = useState(false);
  const [montantPaiement, setMontantPaiement] = useState("");
  const [paiementLoading, setPaiementLoading] = useState(false);

  const { data: commande, isLoading } = useQuery({
    queryKey: ["commande-vente", params.id],
    queryFn: async () => {
      const response = await commandesVenteService.getById(Number(params.id));
      return response.data;
    },
    staleTime: 2 * 60 * 1000,
  });

  const deleteMutation = useMutation({
    mutationFn: () => commandesVenteService.delete(Number(params.id)),
    onSuccess: () => {
      toast.success("Commande supprimée avec succès");
      queryClient.invalidateQueries({ queryKey: ["commandes-vente"] });
      router.push("/ventes/commandes");
    },
    onError: () => toast.error("Erreur lors de la suppression"),
    onSettled: () => setDeleteDialogOpen(false),
  });

  const handleChangerEtat = async (etat: string) => {
    setChangingStatus(true);
    try {
      const response = await commandesVenteService.changerEtat(Number(params.id), etat);
      if (response.success) {
        toast.success(`Statut changé en "${statusLabels[etat]}"`);
        queryClient.invalidateQueries({ queryKey: ["commande-vente", params.id] });
        queryClient.invalidateQueries({ queryKey: ["commandes-vente"] });
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

  const handleAnnulerClick = () => {
    if (!commande) return;
    setNextEtat("annule");
    setStatusDialogOpen(true);
  };

  const handlePaiement = async () => {
    if (!commande || !montantPaiement) return;
    const montant = Number(montantPaiement);
    if (montant <= 0) { toast.error("Montant invalide"); return; }

    // Empêche de payer plus que le reste dû
    const facturesLiees = ((commande as any).factures || []) as Array<{ montant_restant?: any }>;
    const reste = facturesLiees.length > 0
      ? facturesLiees.reduce((s, f) => s + Number(f.montant_restant || 0), 0)
      : Number(commande.montant_total_ttc);
    if (reste <= 0) { toast.error("Cette commande est déjà entièrement payée"); setPaiementDialogOpen(false); return; }
    if (montant > reste + 0.001) { toast.error("Le montant dépasse le reste à payer"); return; }

    setPaiementLoading(true);
    try {
      const ecritures = (commande as any).factures || [];
      let invoice = ecritures.length > 0 ? ecritures[0] : null;

      if (!invoice) {
        const lignes = (commande.lignes || []).map((l: any) => ({
          produit_id: l.produit_id,
          nom_produit: l.nom_produit,
          quantite: l.quantite,
          prix_unitaire_ht: l.prix_unitaire_ht,
          taux_tva: l.taux_tva ?? 0,
          montant_ht: l.montant_total_ht || (l.quantite * l.prix_unitaire_ht),
        }));
        const invoiceData: any = {
          reference: `INV-${commande.reference}`,
          partenaire_id: commande.partenaire_id,
          type: "facture_client",
          date_emission: formatDateInput(new Date()),
          date_echeance: formatDateInput(new Date(Date.now() + 30 * 86400000)),
          montant_ht: commande.montant_total_ht,
          montant_tva: Number(commande.montant_total_ttc) - Number(commande.montant_total_ht),
          montant_ttc: commande.montant_total_ttc,
          montant_paye: 0,
          montant_restant: commande.montant_total_ttc,
          statut: "validee",
          commande_vente_id: commande.id,
          lignes,
        };
        const createResp = await facturesService.create(invoiceData);
        if (!createResp.success) { toast.error(createResp.message || "Erreur création facture"); return; }
        invoice = createResp.data;
      }

      const paiementResp = await facturesService.paiementPartiel(
        Array.isArray(invoice) ? (invoice as any)[0]?.id || invoice[0] : invoice.id,
        montant
      );
      if (paiementResp.success) {
        toast.success("Paiement confirmé");
        queryClient.invalidateQueries({ queryKey: ["commande-vente", params.id] });
        setPaiementDialogOpen(false);
        setMontantPaiement("");
      } else {
        toast.error(paiementResp.message || "Erreur lors du paiement");
      }
    } catch (error: any) {
      toast.error(error?.response?.data?.message || "Erreur lors du paiement");
    } finally {
      setPaiementLoading(false);
    }
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
        <ShoppingCart className="h-16 w-16 text-slate-200 mb-4" />
        <h3 className="text-xl font-bold text-slate-900">Commande introuvable</h3>
        <Button onClick={() => router.push("/ventes/commandes")} className="mt-6">
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

  // Taux de TVA réel (depuis les lignes, sinon déduit du montant)
  const tauxTva = (() => {
    const rates = Array.from(
      new Set(
        (commande.lignes || [])
          .map((l: any) => Number(l.taux_tva))
          .filter((n: number) => !Number.isNaN(n))
      )
    );
    if (rates.length === 1) return rates[0];
    const ht = Number(commande.montant_total_ht);
    const ttc = Number(commande.montant_total_ttc);
    if (ht > 0) return Math.round(((ttc - ht) / ht) * 10000) / 100;
    return null;
  })();

  const canProgress = !!nextStatus[commande.etat];
  const canCancel = commande.etat !== "annule" && commande.etat !== "termine";
  const canModify = commande.etat === "brouillon";

  // État de paiement réel (d'après les factures liées)
  const factures = ((commande as unknown as { factures?: Array<{ montant_paye?: any; montant_restant?: any }> }).factures ?? []);
  const totalPaye = factures.reduce((s, f) => s + Number(f.montant_paye || 0), 0);
  const resteAPayer = factures.length > 0
    ? factures.reduce((s, f) => s + Number(f.montant_restant || 0), 0)
    : Number(commande.montant_total_ttc);
  const estPayee = factures.length > 0 && resteAPayer <= 0.0001;

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
              {commande.partenaire?.nom || "Client inconnu"}
            </Badge>
            {estPayee ? (
              <Badge className="bg-emerald-100 text-emerald-700 hover:bg-emerald-100">
                <CheckCircle className="mr-1 h-3 w-3" /> Payée
              </Badge>
            ) : factures.length > 0 ? (
              <Badge className="bg-amber-100 text-amber-700 hover:bg-amber-100">
                Reste {Number(resteAPayer).toLocaleString("fr-FR", { minimumFractionDigits: 2 })} {DEVISE}
              </Badge>
            ) : null}
          </div>
        </div>
        <div className="flex gap-2">
          {canModify && (
            <Button variant="outline" onClick={() => router.push(`/ventes/commandes/${commande.id}/modifier`)}>
              <Pencil className="mr-2 h-4 w-4" /> Modifier
            </Button>
          )}
          {canProgress && (
            <Button className="bg-blue-600 hover:bg-blue-700" onClick={handleNextStatusClick} disabled={changingStatus}>
              {changingStatus ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Send className="mr-2 h-4 w-4" />}
              Passer à {statusLabels[nextStatus[commande.etat]]}
            </Button>
          )}
          {commande.etat === "termine" && !estPayee && (
            <Button className="bg-emerald-600 hover:bg-emerald-700" onClick={() => setPaiementDialogOpen(true)}>
              <CreditCard className="mr-2 h-4 w-4" />
              {factures.length > 0 ? "Enregistrer un paiement" : "Confirmer paiement"}
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
        <InfoStat icon={User} label="Client" value={commande.partenaire?.nom || "-"} colorClass="bg-blue-100 text-blue-600" />
        <InfoStat icon={Calendar} label="Date" value={formatDateLong(commande.date_commande)} colorClass="bg-purple-100 text-purple-600" />
        <InfoStat icon={Euro} label="Total TTC" value={`${Number(commande.montant_total_ttc).toLocaleString("fr-FR", { minimumFractionDigits: 2 })} ${DEVISE}`} colorClass="bg-emerald-100 text-emerald-600" />
        <InfoStat icon={ClipboardList} label="Statut" value={statusLabels[commande.etat] || commande.etat} colorClass={commande.etat === "termine" ? "bg-emerald-100 text-emerald-600" : commande.etat === "annule" ? "bg-red-100 text-red-600" : "bg-amber-100 text-amber-600"} />
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
                          {Number(ligne.prix_unitaire_ht).toLocaleString("fr-FR", { minimumFractionDigits: 2 })} {DEVISE}
                        </td>
                        <td className="py-3 pr-4 text-right">{ligne.taux_remise}%</td>
                        <td className="py-3 text-right font-medium">
                          {Number(ligne.montant_total_ht).toLocaleString("fr-FR", { minimumFractionDigits: 2 })} {DEVISE}
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
                  {Number(commande.montant_total_ht).toLocaleString("fr-FR", { minimumFractionDigits: 2 })} {DEVISE}
                </span>
              </div>
              <div className="flex justify-end items-center gap-4">
                <span className="text-sm text-gray-500">
                  TVA{tauxTva !== null ? ` (${tauxTva}%)` : ""} :
                </span>
                <span className="font-semibold">
                  {(Number(commande.montant_total_ttc) - Number(commande.montant_total_ht)).toLocaleString("fr-FR", { minimumFractionDigits: 2 })} {DEVISE}
                </span>
              </div>
              <div className="flex justify-end items-center gap-4 text-lg">
                <span className="font-semibold text-gray-700">Total TTC :</span>
                <span className="font-bold text-blue-700">
                  {Number(commande.montant_total_ttc).toLocaleString("fr-FR", { minimumFractionDigits: 2 })} {DEVISE}
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
              <p className="text-sm text-slate-600 italic bg-slate-50 p-4 rounded-xl">
                {commande.notes}
              </p>
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

      <Dialog open={paiementDialogOpen} onOpenChange={setPaiementDialogOpen}>
        <DialogContent className="sm:max-w-sm">
          <DialogHeader>
            <DialogTitle>Confirmer le paiement</DialogTitle>
          </DialogHeader>
          <div className="py-4">
            <p className="text-sm text-slate-500">
              Total TTC : <strong className="text-slate-800">{Number(commande.montant_total_ttc).toFixed(2)} {DEVISE}</strong>
            </p>
            {totalPaye > 0 && (
              <p className="text-sm text-slate-500 mt-1">
                Déjà payé : <strong className="text-emerald-600">{Number(totalPaye).toFixed(2)} {DEVISE}</strong>
              </p>
            )}
            <p className="text-sm text-slate-500 mb-4 mt-1">
              Reste à payer : <strong className="text-amber-600">{Number(resteAPayer).toFixed(2)} {DEVISE}</strong>
            </p>
            <FormInput
              label="Montant du paiement"
              name="montant"
              type="number"
              value={montantPaiement}
              onChange={(e) => setMontantPaiement(e.target.value)}
              min="0"
              max={resteAPayer}
              step="0.01"
              placeholder={"Montant à payer"}
            />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setPaiementDialogOpen(false)} disabled={paiementLoading}>Annuler</Button>
            <Button
              onClick={handlePaiement}
              disabled={!montantPaiement || paiementLoading}
              className="bg-emerald-600 hover:bg-emerald-700"
            >
              {paiementLoading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <CreditCard className="h-4 w-4 mr-2" />}
              Confirmer le paiement
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
