"use client";

import React, { useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { SkeletonCard, SkeletonTable } from "@/components/ui/skeleton";
import { ConfirmDialog } from "@/components/common/ConfirmDialog";
import { FormInput } from "@/components/common/FormInput";
import { FormSelect } from "@/components/common/FormSelect";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter,
} from "@/components/ui/dialog";
import { facturesService } from "@/lib/api/services/factures.service";
import { EcritureComptable } from "@/lib/api/typess";
import {
  ArrowLeft, FileText, Pencil, Trash2, Download, CreditCard, CheckCircle,
  XCircle, Printer, Calendar, Building2, User, Euro, Percent,
  Loader2, Hash, Clock, Ban,
} from "lucide-react";
import { formatDateLong } from "@/lib/utils/format";
import { PDFDownloadLink } from "@react-pdf/renderer";
import { InvoicePDF } from "@/components/invoices/InvoicePDF";

const statutLabels: Record<string, string> = {
  brouillon: "Brouillon",
  validee: "Validée",
  envoyee: "Envoyée",
  payee: "Payée",
  annulee: "Annulée",
};

const statutColors: Record<string, string> = {
  brouillon: "bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-400",
  validee: "bg-blue-50 text-blue-700 dark:bg-blue-950/40 dark:text-blue-400",
  envoyee: "bg-amber-50 text-amber-700 dark:bg-amber-950/40 dark:text-amber-400",
  payee: "bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-400",
  annulee: "bg-red-50 text-red-700 dark:bg-red-950/40 dark:text-red-400",
};

const typeLabels: Record<string, string> = {
  facture_client: "Facture client",
  avoir_client: "Avoir client",
  facture_fournisseur: "Facture fournisseur",
  avoir_fournisseur: "Avoir fournisseur",
};

export default function FactureDetailsPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const queryClient = useQueryClient();
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [statutDialogOpen, setStatutDialogOpen] = useState(false);
  const [paiementDialogOpen, setPaiementDialogOpen] = useState(false);
  const [selectedStatut, setSelectedStatut] = useState("");
  const [montantPaiement, setMontantPaiement] = useState("");

  const { data: facture, isLoading } = useQuery({
    queryKey: ["facture", params.id],
    queryFn: async () => {
      const response = await facturesService.getById(Number(params.id));
      return response.data;
    },
    staleTime: 2 * 60 * 1000,
  });

  const deleteMutation = useMutation({
    mutationFn: () => facturesService.delete(Number(params.id)),
    onSuccess: () => {
      toast.success("Facture supprimée");
      queryClient.invalidateQueries({ queryKey: ["factures"] });
      router.push("/dashboard/factures");
    },
    onError: () => toast.error("Erreur lors de la suppression"),
    onSettled: () => setDeleteDialogOpen(false),
  });

  const statutMutation = useMutation({
    mutationFn: async ({ id, statut }: { id: number; statut: string }) => {
      const response = await facturesService.changerStatut(id, statut);
      if (!response.success) throw new Error(response.message);
      return response.data;
    },
    onSuccess: () => {
      toast.success("Statut mis à jour");
      queryClient.invalidateQueries({ queryKey: ["facture", params.id] });
      setStatutDialogOpen(false);
    },
    onError: (error: any) => toast.error(error.message || "Erreur lors du changement de statut"),
  });

  const paiementMutation = useMutation({
    mutationFn: async ({ id, montant }: { id: number; montant: number }) => {
      const response = await facturesService.paiementPartiel(id, montant);
      if (!response.success) throw new Error(response.message);
      return response.data;
    },
    onSuccess: () => {
      toast.success("Paiement enregistré");
      queryClient.invalidateQueries({ queryKey: ["facture", params.id] });
      setPaiementDialogOpen(false);
      setMontantPaiement("");
    },
    onError: (error: any) => toast.error(error.message || "Erreur lors de l'enregistrement du paiement"),
  });

  const handleStatutChange = () => {
    if (!selectedStatut || !facture) return;
    statutMutation.mutate({ id: facture.id, statut: selectedStatut });
  };

  const handlePaiement = () => {
    if (!facture || !montantPaiement) return;
    const montant = Number(montantPaiement);
    if (montant <= 0 || montant > facture.montant_restant) {
      toast.error("Montant invalide");
      return;
    }
    paiementMutation.mutate({ id: facture.id, montant });
  };

  const nextStatuts = (statut: string): { value: string; label: string }[] => {
    const transitions: Record<string, { value: string; label: string }[]> = {
      brouillon: [{ value: "validee", label: "Valider" }],
      validee: [{ value: "envoyee", label: "Envoyer" }, { value: "annulee", label: "Annuler" }],
      envoyee: [{ value: "payee", label: "Marquer payée" }, { value: "annulee", label: "Annuler" }],
      payee: [],
      annulee: [],
    };
    return transitions[statut] || [];
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
          {[1, 2, 3, 4].map((i) => <SkeletonCard key={i} className="h-24" />)}
        </div>
        <SkeletonTable />
      </div>
    );
  }

  if (!facture) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center">
        <FileText className="h-16 w-16 text-slate-200 mb-4" />
        <h3 className="text-xl font-bold text-slate-900">Facture introuvable</h3>
        <Button onClick={() => router.push("/dashboard/factures")} className="mt-6">
          <ArrowLeft className="mr-2 h-4 w-4" /> Retour à la liste
        </Button>
      </div>
    );
  }

  const lines = facture.lignes || [];
  const canChangeStatut = nextStatuts(facture.statut).length > 0;
  const canPay = facture.statut === "envoyee" || facture.statut === "validee";
  const hasRestant = facture.montant_restant > 0;

  return (
    <div className="max-w-7xl mx-auto p-4 md:p-8 space-y-8 bg-slate-50/30 min-h-screen">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <Button variant="ghost" onClick={() => router.back()} className="-ml-4 text-slate-500 hover:text-slate-900">
            <ArrowLeft className="mr-2 h-4 w-4" /> Retour
          </Button>
          <div className="flex items-center gap-3 mt-1">
            <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">
              {facture.reference}
            </h1>
            <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium ${statutColors[facture.statut] || ""}`}>
              {statutLabels[facture.statut] || facture.statut}
            </span>
          </div>
          <div className="flex gap-2 mt-2">
            <Badge variant="outline" className="bg-white">{typeLabels[facture.type]}</Badge>
            {facture.numero_facture && <Badge variant="outline" className="bg-white">N° {facture.numero_facture}</Badge>}
          </div>
        </div>
        <div className="flex flex-wrap gap-2">
          <PDFDownloadLink
            document={<InvoicePDF
              reference={facture.reference}
              numero_facture={facture.numero_facture}
              date_emission={facture.date_emission}
              date_echeance={facture.date_echeance}
              partenaire_nom={facture.partenaire?.nom || ""}
              partenaire_email={facture.partenaire?.email}
              partenaire_adresse={facture.partenaire?.adresse}
              partenaire_ville={facture.partenaire?.ville}
              partenaire_code_postal={facture.partenaire?.code_postal}
              partenaire_numero_tva={facture.partenaire?.numero_tva}
              lignes={lines.map((l) => ({
                nom_produit: l.nom_produit,
                description: l.description,
                quantite: l.quantite,
                prix_unitaire_ht: l.prix_unitaire_ht,
                taux_tva: l.taux_tva,
                montant_ht: l.montant_ht,
                montant_ttc: l.montant_ttc,
              }))}
              montant_ht={facture.montant_ht}
              montant_tva={facture.montant_tva}
              montant_ttc={facture.montant_ttc}
              montant_paye={facture.montant_paye}
              montant_restant={facture.montant_restant}
              mode_paiement={facture.mode_paiement}
              notes={facture.notes}
            />}
            fileName={`Facture_${facture.reference}.pdf`}
          >
            {({ loading }) => (
              <Button variant="outline" disabled={loading} className="text-blue-600">
                {loading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Download className="h-4 w-4 mr-2" />}
                Télécharger PDF
              </Button>
            )}
          </PDFDownloadLink>
          {canChangeStatut && (
            <Button variant="outline" onClick={() => setStatutDialogOpen(true)} className="text-amber-600">
              <CheckCircle className="h-4 w-4 mr-2" />
              Changer statut
            </Button>
          )}
          {canPay && hasRestant && (
            <Button onClick={() => setPaiementDialogOpen(true)} className="bg-emerald-600 hover:bg-emerald-700">
              <CreditCard className="h-4 w-4 mr-2" />
              Enregistrer paiement
            </Button>
          )}
          <Button variant="outline" onClick={() => router.push(`/dashboard/factures/${facture.id}/modifier`)}>
            <Pencil className="h-4 w-4 mr-2" /> Modifier
          </Button>
          <Button variant="destructive" onClick={() => setDeleteDialogOpen(true)}>
            <Trash2 className="h-4 w-4 mr-2" /> Supprimer
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatCard icon={Euro} label="Montant TTC" value={`${Number(facture.montant_ttc).toLocaleString("fr-FR", { minimumFractionDigits: 2 })} CDF`} color="bg-blue-100 text-blue-600" />
        <StatCard icon={CreditCard} label="Déjà payé" value={`${Number(facture.montant_paye).toLocaleString("fr-FR", { minimumFractionDigits: 2 })} CDF`} color="bg-emerald-100 text-emerald-600" />
        <StatCard icon={Clock} label="Restant dû" value={`${Number(facture.montant_restant).toLocaleString("fr-FR", { minimumFractionDigits: 2 })} CDF`} color={facture.montant_restant > 0 ? "bg-red-100 text-red-600" : "bg-emerald-100 text-emerald-600"} />
        <StatCard icon={Calendar} label="Échéance" value={formatDateLong(facture.date_echeance)} color="bg-purple-100 text-purple-600" />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-2 space-y-6">
          <Card className="border-none shadow-xl shadow-slate-200/50 rounded-3xl p-2">
            <CardHeader><CardTitle>Lignes de facture</CardTitle></CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b text-left text-xs text-slate-500 uppercase">
                      <th className="pb-3 font-semibold">Produit</th>
                      <th className="pb-3 font-semibold text-right">Qté</th>
                      <th className="pb-3 font-semibold text-right">Prix unitaire HT</th>
                      <th className="pb-3 font-semibold text-right">TVA</th>
                      <th className="pb-3 font-semibold text-right">Remise</th>
                      <th className="pb-3 font-semibold text-right">Total HT</th>
                    </tr>
                  </thead>
                  <tbody>
                    {lines.map((ligne, index) => (
                      <tr key={ligne.id || index} className="border-b last:border-0">
                        <td className="py-3">
                          <p className="font-medium">{ligne.nom_produit}</p>
                          {ligne.description && <p className="text-xs text-slate-500">{ligne.description}</p>}
                        </td>
                        <td className="py-3 text-right">{ligne.quantite}</td>
                        <td className="py-3 text-right">{Number(ligne.prix_unitaire_ht).toFixed(2)} CDF</td>
                        <td className="py-3 text-right">{ligne.taux_tva}%</td>
                        <td className="py-3 text-right">{ligne.taux_remise > 0 ? `${ligne.taux_remise}%` : "-"}</td>
                        <td className="py-3 text-right font-medium">{Number(ligne.montant_ht).toFixed(2)} CDF</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="md:col-span-1 space-y-6">
          <Card className="border-none shadow-xl shadow-slate-200/50 rounded-3xl">
            <CardHeader><CardTitle className="flex items-center gap-2"><Euro className="h-4 w-4" /> Totaux</CardTitle></CardHeader>
            <CardContent className="space-y-3">
              <div className="flex justify-between py-2 border-b">
                <span className="text-sm text-slate-500">Total HT</span>
                <span className="text-sm font-semibold">{Number(facture.montant_ht).toFixed(2)} CDF</span>
              </div>
              <div className="flex justify-between py-2 border-b">
                <span className="text-sm text-slate-500">Total TVA</span>
                <span className="text-sm font-semibold">{Number(facture.montant_tva).toFixed(2)} CDF</span>
              </div>
              <div className="flex justify-between py-2">
                <span className="text-base font-bold">Total TTC</span>
                <span className="text-base font-bold text-blue-600">{Number(facture.montant_ttc).toFixed(2)} CDF</span>
              </div>
              <div className="border-t pt-3 mt-3 space-y-2">
                <div className="flex justify-between py-1">
                  <span className="text-sm text-emerald-600">Déjà payé</span>
                  <span className="text-sm font-semibold text-emerald-600">{Number(facture.montant_paye).toFixed(2)} CDF</span>
                </div>
                <div className="flex justify-between py-1">
                  <span className={`text-sm font-bold ${facture.montant_restant > 0 ? "text-red-600" : "text-emerald-600"}`}>
                    Restant dû
                  </span>
                  <span className={`text-sm font-bold ${facture.montant_restant > 0 ? "text-red-600" : "text-emerald-600"}`}>
                    {Number(facture.montant_restant).toFixed(2)} CDF
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-none shadow-xl shadow-slate-200/50 rounded-3xl">
            <CardHeader><CardTitle className="flex items-center gap-2"><Building2 className="h-4 w-4" /> Partenaire</CardTitle></CardHeader>
            <CardContent className="space-y-2">
              <p className="text-sm font-medium">{facture.partenaire?.nom || "N/A"}</p>
              {facture.partenaire?.email && <p className="text-xs text-slate-500">{facture.partenaire.email}</p>}
              {facture.partenaire?.telephone && <p className="text-xs text-slate-500">{facture.partenaire.telephone}</p>}
              {facture.partenaire?.adresse && <p className="text-xs text-slate-500">{facture.partenaire.adresse}</p>}
              {facture.partenaire?.ville && <p className="text-xs text-slate-500">{facture.partenaire.ville}</p>}
            </CardContent>
          </Card>

          {facture.notes && (
            <Card className="border-none shadow-xl shadow-slate-200/50 rounded-3xl">
              <CardHeader><CardTitle className="flex items-center gap-2"><FileText className="h-4 w-4" /> Notes</CardTitle></CardHeader>
              <CardContent>
                <p className="text-sm text-slate-600 italic">{facture.notes}</p>
              </CardContent>
            </Card>
          )}
        </div>
      </div>

      <ConfirmDialog
        open={deleteDialogOpen}
        onOpenChange={setDeleteDialogOpen}
        onConfirm={() => deleteMutation.mutate()}
        title="Suppression définitive"
        description={`Êtes-vous sûr de vouloir supprimer la facture ${facture.reference} ? Cette action est irréversible.`}
        isLoading={deleteMutation.isPending}
      />

      <Dialog open={statutDialogOpen} onOpenChange={setStatutDialogOpen}>
        <DialogContent className="sm:max-w-sm">
          <DialogHeader>
            <DialogTitle>Changer le statut</DialogTitle>
          </DialogHeader>
          <div className="py-4">
            <FormSelect
              label="Nouveau statut"
              name="statut"
              value={selectedStatut}
              onChange={(e) => setSelectedStatut(e.target.value)}
              options={nextStatuts(facture.statut)}
              placeholder="Sélectionner un statut"
            />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setStatutDialogOpen(false)}>Annuler</Button>
            <Button onClick={handleStatutChange} disabled={!selectedStatut || statutMutation.isPending}>
              {statutMutation.isPending ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
              Confirmer
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={paiementDialogOpen} onOpenChange={setPaiementDialogOpen}>
        <DialogContent className="sm:max-w-sm">
          <DialogHeader>
            <DialogTitle>Enregistrer un paiement</DialogTitle>
          </DialogHeader>
          <div className="py-4">
            <FormInput
              label="Montant du paiement"
              name="montant"
              type="number"
              value={montantPaiement}
              onChange={(e) => setMontantPaiement(e.target.value)}
              min="0"
              max={facture.montant_restant}
              step="0.01"
              placeholder={`Max: ${Number(facture.montant_restant).toFixed(2)} CDF`}
            />
            <p className="text-xs text-slate-500 mt-2">
              Montant restant : {Number(facture.montant_restant).toFixed(2)} CDF
            </p>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setPaiementDialogOpen(false)}>Annuler</Button>
            <Button
              onClick={handlePaiement}
              disabled={!montantPaiement || paiementMutation.isPending}
              className="bg-emerald-600 hover:bg-emerald-700"
            >
              {paiementMutation.isPending ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <CreditCard className="h-4 w-4 mr-2" />}
              Enregistrer
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

function StatCard({ icon: Icon, label, value, color }: { icon: any; label: string; value: string; color: string }) {
  return (
    <div className="flex items-center gap-4 p-5 rounded-2xl bg-white border border-slate-100 shadow-sm hover:shadow-md transition-all duration-200">
      <div className={`p-3 rounded-xl ${color}`}>
        <Icon className="h-6 w-6" />
      </div>
      <div>
        <p className="text-[11px] font-bold text-slate-400 uppercase tracking-widest">{label}</p>
        <p className="text-lg font-bold text-slate-800">{value}</p>
      </div>
    </div>
  );
}
