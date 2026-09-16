"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { FormInput } from "@/components/common/FormInput";
import { FormSelect } from "@/components/common/FormSelect";
import { FormTextarea } from "@/components/common/FormTextarea";
import { commandesAchatService } from "@/lib/api/services/commandes-achat.service";
import { partenairesService } from "@/lib/api/services/partenaires.service";
import { produitsService } from "@/lib/api/services/produits.service";
import { formatDateInput } from "@/lib/utils/format";
import { ArrowLeft, Save, Loader2, ShoppingCart, User, Calendar, Plus, Trash2, Truck, List, Euro, Percent, Package } from "lucide-react";

interface LigneForm {
  produit_id: number | "";
  nom_produit: string;
  quantite: number;
  prix_unitaire_ht: number;
  taux_remise: number;
}

interface CommandeAchatFormProps {
  id?: number;
}

export function CommandeAchatForm({ id }: CommandeAchatFormProps) {
  const router = useRouter();
  const queryClient = useQueryClient();
  const isEditMode = !!id;

  const [formData, setFormData] = useState({
    partenaire_id: "",
    date_commande: formatDateInput(new Date()),
    date_livraison_prevue: "",
    notes: "",
    adresse_livraison: "",
  });

  const [lignes, setLignes] = useState<LigneForm[]>([
    { produit_id: "", nom_produit: "", quantite: 1, prix_unitaire_ht: 0, taux_remise: 0 },
  ]);

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [initialLoading, setInitialLoading] = useState(isEditMode);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { data: fournisseursData } = useQuery({
    queryKey: ["fournisseurs-select"],
    queryFn: async () => {
      const response = await partenairesService.getFournisseurs({ perPage: 1000 });
      return response;
    },
    staleTime: 5 * 60 * 1000,
  });

  const { data: produitsData } = useQuery({
    queryKey: ["produits-select-achat"],
    queryFn: async () => {
      const response = await produitsService.getAll({ actif: true });
      return response;
    },
    staleTime: 5 * 60 * 1000,
  });

  const fournisseurs = Array.isArray(fournisseursData?.data) ? fournisseursData.data : [];
  const produits = (produitsData as any)?.data?.data ?? [];

  useEffect(() => {
    const loadCommande = async () => {
      if (!id) return;
      try {
        setInitialLoading(true);
        const response = await commandesAchatService.getById(id);
        const data = response.data;
        if (data) {
          setFormData({
            partenaire_id: String(data.partenaire_id),
            date_commande: data.date_commande ? formatDateInput(data.date_commande) : "",
            date_livraison_prevue: data.date_livraison_prevue ? formatDateInput(data.date_livraison_prevue) : "",
            notes: data.notes || "",
            adresse_livraison: data.adresse_livraison || "",
          });
          if (data.lignes && data.lignes.length > 0) {
            setLignes(
              data.lignes.map((l) => ({
                produit_id: l.produit_id,
                nom_produit: l.nom_produit,
                quantite: l.quantite,
                prix_unitaire_ht: l.prix_unitaire_ht,
                taux_remise: l.taux_remise,
              }))
            );
          }
        }
      } catch (error) {
        toast.error("Erreur lors du chargement de la commande");
        router.push("/achats/commandes");
      } finally {
        setInitialLoading(false);
      }
    };

    if (isEditMode) loadCommande();
  }, [id, isEditMode, router]);

  const mutation = useMutation({
    mutationFn: async (data: any) => {
      setIsSubmitting(true);
      if (isEditMode && id) return commandesAchatService.update(id, data);
      return commandesAchatService.create(data);
    },
    onSuccess: (data) => {
      setIsSubmitting(false);
      if (data?.success === false) {
        if (data?.errors) {
          const newErrors: Record<string, string> = {};
          Object.keys(data.errors!).forEach((key) => {
            const messages = data.errors![key];
            newErrors[key] = Array.isArray(messages) ? messages[0] : messages;
          });
          setErrors(newErrors);
          toast.error("Veuillez corriger les erreurs dans le formulaire");
        } else if (data?.message) {
          toast.error(data.message);
        }
        return;
      }
      toast.success(isEditMode ? "Commande mise à jour" : "Commande créée");
      queryClient.invalidateQueries({ queryKey: ["commandes-achat"] });
      router.push("/achats/commandes");
    },
    onError: (error: any) => {
      setIsSubmitting(false);
      if (error?.response?.data?.errors) {
        const newErrors: Record<string, string> = {};
        Object.keys(error.response.data.errors).forEach((key) => {
          const messages = error.response.data.errors[key];
          newErrors[key] = Array.isArray(messages) ? messages[0] : messages;
        });
        setErrors(newErrors);
        toast.error("Veuillez corriger les erreurs dans le formulaire");
      } else if (error?.response?.data?.message) {
        toast.error(error.response.data.message);
      } else {
        toast.error("Une erreur est survenue");
      }
    },
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    if (errors[name]) {
      setErrors((prev) => { const n = { ...prev }; delete n[name]; return n; });
    }
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSelectChange = (name: string, value: string) => {
    if (errors[name]) {
      setErrors((prev) => { const n = { ...prev }; delete n[name]; return n; });
    }
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleLigneChange = (index: number, field: keyof LigneForm, value: any) => {
    setLignes((prev) => {
      const updated = [...prev];
      updated[index] = { ...updated[index], [field]: value };
      if (field === "produit_id" && value) {
        const produit = produits.find((p: any) => p.id === Number(value));
        if (produit) {
          const variante = produit.variantes?.[0];
          updated[index].nom_produit = produit.nom;
          if (variante?.prix_achat) updated[index].prix_unitaire_ht = Number(variante.prix_achat);
        }
      }
      return updated;
    });
  };

  const addLigne = () => {
    setLignes((prev) => [
      ...prev,
      { produit_id: "", nom_produit: "", quantite: 1, prix_unitaire_ht: 0, taux_remise: 0 },
    ]);
  };

  const removeLigne = (index: number) => {
    if (lignes.length <= 1) return;
    setLignes((prev) => prev.filter((_, i) => i !== index));
  };

  const calcLigneTotal = (ligne: LigneForm): number => {
    const ht = ligne.quantite * ligne.prix_unitaire_ht;
    return ht - ht * (ligne.taux_remise / 100);
  };

  const totalHT = lignes.reduce((sum, l) => sum + calcLigneTotal(l), 0);
  const totalTVA = totalHT * 0.2;
  const totalTTC = totalHT + totalTVA;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});
    const lignesValides = lignes.filter((l) => l.produit_id !== "");
    if (lignesValides.length === 0) {
      toast.error("Ajoutez au moins une ligne de produit");
      return;
    }
    const dataToSend = {
      partenaire_id: Number(formData.partenaire_id),
      date_commande: formData.date_commande,
      date_livraison_prevue: formData.date_livraison_prevue || undefined,
      notes: formData.notes || undefined,
      adresse_livraison: formData.adresse_livraison || undefined,
      lignes: lignesValides.map((l) => ({
        produit_id: Number(l.produit_id),
        quantite: Number(l.quantite),
        prix_unitaire_ht: Number(l.prix_unitaire_ht),
        taux_remise: Number(l.taux_remise),
      })),
      montant_total_ht: totalHT,
      montant_total_ttc: totalTTC,
    };
    mutation.mutate(dataToSend);
  };

  if (initialLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
        <p className="mt-4 text-gray-500">Chargement...</p>
      </div>
    );
  }

  return (
    <div className="p-4 md:p-6">
      <div className="flex items-center gap-4 mb-6">
        <Button variant="ghost" onClick={() => router.push("/achats/commandes")} className="flex items-center gap-2 text-gray-600 hover:text-blue-600">
          <ArrowLeft /> Retour
        </Button>
        <h1 className="text-2xl font-bold text-gray-800 dark:text-white">
          {isEditMode ? "Modifier la commande" : "Nouvelle commande d'achat"}
        </h1>
      </div>

      <form onSubmit={handleSubmit} noValidate>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            <Card>
              <CardContent className="p-6 space-y-6">
                <div>
                  <h5 className="text-lg font-semibold text-blue-600 flex items-center gap-2 mb-4">
                    <ShoppingCart /> Informations générales
                  </h5>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormSelect
                      label="Fournisseur"
                      name="partenaire_id"
                      value={formData.partenaire_id}
                      onChange={(e) => handleSelectChange("partenaire_id", e.target.value)}
                      options={fournisseurs.map((f: any) => ({ value: f.id, label: f.nom }))}
                      required
                      error={errors.partenaire_id}
                      icon={<User />}
                      placeholder="Sélectionner un fournisseur"
                    />
                    <FormInput
                      label="Date commande"
                      name="date_commande"
                      type="date"
                      value={formData.date_commande}
                      onChange={handleChange}
                      required
                      error={errors.date_commande}
                      icon={<Calendar />}
                    />
                    <FormInput
                      label="Date livraison prévue"
                      name="date_livraison_prevue"
                      type="date"
                      value={formData.date_livraison_prevue}
                      onChange={handleChange}
                      error={errors.date_livraison_prevue}
                      icon={<Truck />}
                    />
                    <FormInput
                      label="Adresse livraison"
                      name="adresse_livraison"
                      value={formData.adresse_livraison}
                      onChange={handleChange}
                      error={errors.adresse_livraison}
                      placeholder="Adresse de livraison"
                    />
                  </div>
                </div>

                <div>
                  <div className="flex items-center justify-between mb-4">
                    <h5 className="text-lg font-semibold text-blue-600 flex items-center gap-2">
                      <List /> Lignes de commande
                    </h5>
                    <Button type="button" onClick={addLigne} variant="outline" size="sm" className="text-blue-600 border-blue-200">
                      <Plus className="mr-1" /> Ajouter une ligne
                    </Button>
                  </div>

                  <div className="space-y-3">
                    {lignes.map((ligne, index) => (
                      <div key={index} className="flex flex-wrap items-end gap-3 p-4 bg-gray-50 dark:bg-gray-800/50 rounded-lg border border-gray-200 dark:border-gray-700">
                        <div className="flex-1 min-w-[200px]">
                          <FormSelect
                            label="Produit"
                            name={`produit_id_${index}`}
                            value={String(ligne.produit_id)}
                            onChange={(e) => handleLigneChange(index, "produit_id", e.target.value)}
                            options={produits.map((p: any) => ({
                              value: p.id,
                              label: p.nom,
                            }))}
                            placeholder="Sélectionner un produit"
                          />
                        </div>
                        <div className="w-24">
                          <FormInput
                            label="Qté"
                            name={`quantite_${index}`}
                            type="number"
                            value={ligne.quantite}
                            onChange={(e) => handleLigneChange(index, "quantite", Number(e.target.value))}
                            min="0"
                            step="1"
                          />
                        </div>
                        <div className="w-32">
                          <FormInput
                            label="Prix unitaire HT"
                            name={`prix_ht_${index}`}
                            type="number"
                            value={ligne.prix_unitaire_ht}
                            onChange={(e) => handleLigneChange(index, "prix_unitaire_ht", Number(e.target.value))}
                            min="0"
                            step="0.01"
                          />
                        </div>
                        <div className="w-24">
                          <FormInput
                            label="Remise %"
                            name={`remise_${index}`}
                            type="number"
                            value={ligne.taux_remise}
                            onChange={(e) => handleLigneChange(index, "taux_remise", Number(e.target.value))}
                            min="0"
                            max="100"
                            step="0.1"
                          />
                        </div>
                        <div className="w-28 pb-2.5">
                          <p className="text-sm font-medium text-gray-500 mb-1.5">Total HT</p>
                          <p className="text-sm font-bold text-gray-900 dark:text-white">
                            {calcLigneTotal(ligne).toLocaleString("fr-FR", { minimumFractionDigits: 2 })} CDF
                          </p>
                        </div>
                        <button type="button" onClick={() => removeLigne(index)} className="pb-2.5 text-red-500 hover:text-red-700 disabled:opacity-30" disabled={lignes.length <= 1}>
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    ))}
                  </div>

                  <div className="mt-4 p-4 bg-blue-50 dark:bg-blue-950/20 rounded-lg border border-blue-200 dark:border-blue-800">
                    <div className="flex justify-between items-center text-sm">
                      <span className="text-gray-600 dark:text-gray-400">Total HT :</span>
                      <span className="font-bold text-gray-900 dark:text-white">{totalHT.toLocaleString("fr-FR", { minimumFractionDigits: 2 })} CDF</span>
                    </div>
                    <div className="flex justify-between items-center text-sm mt-1">
                      <span className="text-gray-600 dark:text-gray-400">TVA (20%) :</span>
                      <span className="font-bold text-gray-900 dark:text-white">{totalTVA.toLocaleString("fr-FR", { minimumFractionDigits: 2 })} CDF</span>
                    </div>
                    <div className="flex justify-between items-center text-base mt-2 pt-2 border-t border-blue-200 dark:border-blue-700">
                      <span className="font-semibold text-gray-800 dark:text-gray-200">Total TTC :</span>
                      <span className="font-bold text-lg text-blue-700 dark:text-blue-400">{totalTTC.toLocaleString("fr-FR", { minimumFractionDigits: 2 })} CDF</span>
                    </div>
                  </div>
                </div>

                <div>
                  <h5 className="text-lg font-semibold text-blue-600 flex items-center gap-2 mb-4">
                    <List /> Notes
                  </h5>
                  <FormTextarea label="" name="notes" value={formData.notes} onChange={handleChange} error={errors.notes} rows={3} placeholder="Notes internes..." />
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="lg:col-span-1">
            <Card className="sticky top-6">
              <CardContent className="p-6 space-y-4">
                <h5 className="text-lg font-semibold text-blue-600 flex items-center gap-2">
                  <Save /> Actions
                </h5>
                <div className="space-y-2 text-sm text-gray-600 dark:text-gray-400">
                  <p><strong>Total HT :</strong> {totalHT.toLocaleString("fr-FR", { minimumFractionDigits: 2 })} CDF</p>
                  <p><strong>TVA :</strong> {totalTVA.toLocaleString("fr-FR", { minimumFractionDigits: 2 })} CDF</p>
                  <p><strong>Total TTC :</strong> {totalTTC.toLocaleString("fr-FR", { minimumFractionDigits: 2 })} CDF</p>
                </div>
                <div className="pt-4 border-t">
                  <Button type="submit" className="w-full bg-blue-600 hover:bg-blue-700" disabled={mutation.isPending || isSubmitting}>
                    {mutation.isPending || isSubmitting ? (
                      <><Loader2 className="h-4 w-4 animate-spin mr-2" /> En cours...</>
                    ) : (
                      <><Save className="mr-2" /> {isEditMode ? "Mettre à jour" : "Créer"}</>
                    )}
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </form>
    </div>
  );
}

export default CommandeAchatForm;
