"use client";
import { DEVISE } from "@/lib/utils/currency";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { FormInput } from "@/components/common/FormInput";
import { FormSelect } from "@/components/common/FormSelect";
import { FormTextarea } from "@/components/common/FormTextarea";
import { facturesService } from "@/lib/api/services/factures.service";
import { partenairesService } from "@/lib/api/services/partenaires.service";
import { produitsService } from "@/lib/api/services/produits.service";
import { parametresService } from "@/lib/api/services/parametres.service";
import { Partenaire } from "@/lib/api/typess";
import { ProduitModele } from "@/lib/api/typess";
import {
  ArrowLeft, Save, Plus, Trash2, Calculator, FileText,
  Loader2, Euro
} from "lucide-react";
import { formatDateInput } from "@/lib/utils/format";

interface LigneFacture {
  produit_id: number | null;
  nom_produit: string;
  description: string;
  quantite: number;
  prix_unitaire_ht: number;
  taux_tva: number;
  taux_remise: number;
  montant_ht: number;
  montant_tva: number;
  montant_ttc: number;
}

interface FactureFormProps {
  id?: number;
}

const TVA_OPTIONS = [
  { value: "0", label: "0%" },
  { value: "5.5", label: "5.5%" },
  { value: "10", label: "10%" },
  { value: "20", label: "20%" },
];

const TYPE_OPTIONS = [
  { value: "facture_client", label: "Facture client" },
  { value: "avoir_client", label: "Avoir client" },
  { value: "facture_fournisseur", label: "Facture fournisseur" },
  { value: "avoir_fournisseur", label: "Avoir fournisseur" },
];

const MODE_PAIEMENT_OPTIONS = [
  { value: "virement", label: "Virement bancaire" },
  { value: "cheque", label: "Chèque" },
  { value: "especes", label: "Espèces" },
  { value: "carte", label: "Carte bancaire" },
  { value: "prelevement", label: "Prélèvement" },
  { value: "autre", label: "Autre" },
];

function calculerLigne(ligne: Partial<LigneFacture>): LigneFacture {
  const qte = ligne.quantite || 0;
  const pu = ligne.prix_unitaire_ht || 0;
  const tauxTva = ligne.taux_tva || 0;
  const tauxRemise = ligne.taux_remise || 0;

  const montantHtBrut = qte * pu;
  const montantRemise = montantHtBrut * (tauxRemise / 100);
  const montantHt = montantHtBrut - montantRemise;
  const montantTva = montantHt * (tauxTva / 100);
  const montantTtc = montantHt + montantTva;

  return {
    produit_id: ligne.produit_id || null,
    nom_produit: ligne.nom_produit || "",
    description: ligne.description || "",
    quantite: qte,
    prix_unitaire_ht: pu,
    taux_tva: tauxTva,
    taux_remise: tauxRemise,
    montant_ht: montantHt,
    montant_tva: montantTva,
    montant_ttc: montantTtc,
  };
}

export function FactureForm({ id }: FactureFormProps) {
  const router = useRouter();
  const queryClient = useQueryClient();
  const isEditMode = !!id;

  const [formData, setFormData] = useState({
    partenaire_id: "",
    type: "facture_client" as string,
    date_emission: formatDateInput(new Date()),
    date_echeance: "",
    mode_paiement: "",
    notes: "",
  });

  const [lignes, setLignes] = useState<LigneFacture[]>([
    { produit_id: null, nom_produit: "", description: "", quantite: 1, prix_unitaire_ht: 0, taux_tva: 20, taux_remise: 0, montant_ht: 0, montant_tva: 0, montant_ttc: 0 },
  ]);

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [initialLoading, setInitialLoading] = useState(isEditMode);

  const { data: params } = useQuery({
    queryKey: ["parametres"],
    queryFn: async () => (await parametresService.getAll()).data ?? {},
    staleTime: 5 * 60 * 1000,
  });
  const tvaTaux = Number(params?.tva_taux ?? 16) || 0;

  useEffect(() => {
    if (params && lignes.length === 1 && lignes[0].produit_id === null) {
      setLignes((prev) => [{ ...prev[0], taux_tva: tvaTaux }]);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [params]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { data: partenairesData } = useQuery({
    queryKey: ["partenaires-select"],
    queryFn: async () => {
      const response = await partenairesService.getAll({ perPage: 200 });
      return response?.data ?? [];
    },
    staleTime: 5 * 60 * 1000,
  });

  const { data: produitsData } = useQuery({
    queryKey: ["produits-select"],
    queryFn: async () => {
      const response = await produitsService.getAll({ per_page: 200 });
      return (response?.data as any)?.data ?? [];
    },
    staleTime: 5 * 60 * 1000,
  });

  useEffect(() => {
    const loadFacture = async () => {
      if (!id) return;
      try {
        setInitialLoading(true);
        const response = await facturesService.getById(id);
        const data = response.data;
        if (data) {
          setFormData({
            partenaire_id: String(data.partenaire_id),
            type: data.type,
            date_emission: formatDateInput(data.date_emission),
            date_echeance: formatDateInput(data.date_echeance),
            mode_paiement: data.mode_paiement || "",
            notes: data.notes || "",
          });
          if (data.lignes && data.lignes.length > 0) {
            setLignes(data.lignes.map((l) => ({
              produit_id: l.produit_id,
              nom_produit: l.nom_produit,
              description: l.description || "",
              quantite: l.quantite,
              prix_unitaire_ht: l.prix_unitaire_ht,
              taux_tva: l.taux_tva,
              taux_remise: l.taux_remise,
              montant_ht: l.montant_ht,
              montant_tva: l.montant_tva,
              montant_ttc: l.montant_ttc,
            })));
          }
        }
      } catch (error) {
        toast.error("Erreur lors du chargement de la facture");
        router.push("/dashboard/factures");
      } finally {
        setInitialLoading(false);
      }
    };
    if (isEditMode) loadFacture();
  }, [id, isEditMode, router]);

  const mutation = useMutation({
    mutationFn: async (data: any) => {
      setIsSubmitting(true);
      if (isEditMode && id) {
        return facturesService.update(id, data);
      }
      return facturesService.create(data);
    },
    onSuccess: (data) => {
      setIsSubmitting(false);
      if (data?.success === false) {
        if (data.errors) {
          const newErrors: Record<string, string> = {};
          const errs = data.errors;
          Object.keys(errs).forEach((key) => {
            const messages = errs[key]!;
            newErrors[key] = Array.isArray(messages) ? messages[0] : messages;
          });
          setErrors(newErrors);
          toast.error("Veuillez corriger les erreurs dans le formulaire");
        } else if (data.message) {
          toast.error(data.message);
        }
        return;
      }
      toast.success(isEditMode ? "Facture mise à jour" : "Facture créée");
      queryClient.invalidateQueries({ queryKey: ["factures"] });
      router.push("/dashboard/factures");
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

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    if (errors[name]) {
      setErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors[name];
        return newErrors;
      });
    }
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSelectChange = (name: string, value: string) => {
    if (errors[name]) {
      setErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors[name];
        return newErrors;
      });
    }
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleLigneChange = (index: number, field: keyof LigneFacture, value: any) => {
    setLignes((prev) => {
      const updated = [...prev];
      updated[index] = { ...updated[index], [field]: value };
      if (field === "produit_id" && value) {
        const produit = produitsData?.find((p: any) => p.id === Number(value));
        if (produit) {
          updated[index].nom_produit = produit.nom;
          const variante = (produit as any).variantes?.[0];
          if (variante) {
            updated[index].prix_unitaire_ht = Number(variante.prix_vente) || 0;
          }
        }
      }
      updated[index] = calculerLigne(updated[index]);
      return updated;
    });
  };

  const ajouterLigne = () => {
    setLignes((prev) => [...prev, { produit_id: null, nom_produit: "", description: "", quantite: 1, prix_unitaire_ht: 0, taux_tva: tvaTaux, taux_remise: 0, montant_ht: 0, montant_tva: 0, montant_ttc: 0 }]);
  };

  const supprimerLigne = (index: number) => {
    if (lignes.length <= 1) return;
    setLignes((prev) => prev.filter((_, i) => i !== index));
  };

  const getTotals = () => {
    const totalHt = lignes.reduce((sum, l) => sum + l.montant_ht, 0);
    const totalTva = lignes.reduce((sum, l) => sum + l.montant_tva, 0);
    const totalTtc = lignes.reduce((sum, l) => sum + l.montant_ttc, 0);
    return { totalHt, totalTva, totalTtc };
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});

    const { totalHt, totalTva, totalTtc } = getTotals();

    const dataToSend = {
      partenaire_id: Number(formData.partenaire_id),
      type: formData.type,
      date_emission: formData.date_emission,
      date_echeance: formData.date_echeance || null,
      mode_paiement: formData.mode_paiement || null,
      notes: formData.notes || null,
      montant_ht: totalHt,
      montant_tva: totalTva,
      montant_ttc: totalTtc,
      lignes: lignes.map((l) => ({
        produit_id: l.produit_id,
        nom_produit: l.nom_produit,
        description: l.description || null,
        quantite: l.quantite,
        prix_unitaire_ht: l.prix_unitaire_ht,
        taux_tva: l.taux_tva,
        taux_remise: l.taux_remise,
        montant_ht: l.montant_ht,
        montant_tva: l.montant_tva,
        montant_ttc: l.montant_ttc,
      })),
    };

    mutation.mutate(dataToSend);
  };

  const { totalHt, totalTva, totalTtc } = getTotals();

  if (initialLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
        <p className="mt-4 text-gray-500">Chargement...</p>
      </div>
    );
  }

  const partenairesList = (partenairesData || []).map((p: Partenaire) => ({
    value: String(p.id),
    label: `${p.nom} (${p.code || ""})`,
  }));

  const produitsList = (produitsData || []).map((p: ProduitModele) => ({
    value: String(p.id),
    label: p.nom,
  }));

  return (
    <div className="p-4 md:p-6">
      <div className="flex items-center gap-4 mb-6">
        <Button
          variant="ghost"
          onClick={() => router.push("/dashboard/factures")}
          className="flex items-center gap-2 text-gray-600 hover:text-blue-600"
        >
          <ArrowLeft /> Retour
        </Button>
        <h1 className="text-2xl font-bold text-gray-800 dark:text-white">
          {isEditMode ? "Modifier la facture" : "Nouvelle facture"}
        </h1>
      </div>

      <form onSubmit={handleSubmit} noValidate>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            <Card>
              <CardContent className="p-6 space-y-6">
                <div>
                  <h5 className="text-lg font-semibold text-blue-600 flex items-center gap-2 mb-4">
                    <FileText /> Informations générales
                  </h5>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormSelect
                      label="Partenaire"
                      name="partenaire_id"
                      value={formData.partenaire_id}
                      onChange={(e) => handleSelectChange("partenaire_id", e.target.value)}
                      options={partenairesList}
                      required
                      error={errors.partenaire_id}
                      placeholder="Sélectionner un partenaire"
                    />
                    <FormSelect
                      label="Type"
                      name="type"
                      value={formData.type}
                      onChange={(e) => handleSelectChange("type", e.target.value)}
                      options={TYPE_OPTIONS}
                      required
                    />
                    <FormInput
                      label="Date d'émission"
                      name="date_emission"
                      type="date"
                      value={formData.date_emission}
                      onChange={handleChange}
                      required
                    />
                    <FormInput
                      label="Date d'échéance"
                      name="date_echeance"
                      type="date"
                      value={formData.date_echeance}
                      onChange={handleChange}
                    />
                    <FormSelect
                      label="Mode de paiement"
                      name="mode_paiement"
                      value={formData.mode_paiement}
                      onChange={(e) => handleSelectChange("mode_paiement", e.target.value)}
                      options={MODE_PAIEMENT_OPTIONS}
                      placeholder="Sélectionner"
                    />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <h5 className="text-lg font-semibold text-blue-600 flex items-center gap-2">
                    <Calculator /> Lignes de facture
                  </h5>
                  <Button type="button" variant="outline" onClick={ajouterLigne} className="text-blue-600">
                    <Plus className="h-4 w-4 mr-2" />
                    Ajouter une ligne
                  </Button>
                </div>

                <div className="space-y-4">
                  {lignes.map((ligne, index) => (
                    <div key={index} className="border rounded-lg p-4 bg-gray-50 dark:bg-gray-800/50 space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium text-gray-500">Ligne {index + 1}</span>
                        {lignes.length > 1 && (
                          <Button type="button" variant="ghost" size="sm" onClick={() => supprimerLigne(index)} className="text-red-500 h-8 w-8 p-0">
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        )}
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        <FormSelect
                          label="Produit"
                          name={`ligne_${index}_produit`}
                          value={String(ligne.produit_id || "")}
                          onChange={(e) => handleLigneChange(index, "produit_id", e.target.value ? Number(e.target.value) : null)}
                          options={produitsList}
                          placeholder="Sélectionner un produit"
                        />
                        <FormInput
                          label="Nom du produit"
                          name={`ligne_${index}_nom`}
                          value={ligne.nom_produit}
                          onChange={(e) => handleLigneChange(index, "nom_produit", e.target.value)}
                          placeholder="Description du produit"
                        />
                      </div>
                      <FormInput
                        label="Description"
                        name={`ligne_${index}_desc`}
                        value={ligne.description}
                        onChange={(e) => handleLigneChange(index, "description", e.target.value)}
                        placeholder="Description complémentaire..."
                      />
                      <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
                        <FormInput
                          label="Quantité"
                          name={`ligne_${index}_qte`}
                          type="number"
                          value={ligne.quantite}
                          onChange={(e) => handleLigneChange(index, "quantite", Number(e.target.value))}
                          min="0"
                          step="1"
                        />
                        <FormInput
                          label="Prix unitaire HT"
                          name={`ligne_${index}_pu`}
                          type="number"
                          value={ligne.prix_unitaire_ht}
                          onChange={(e) => handleLigneChange(index, "prix_unitaire_ht", Number(e.target.value))}
                          min="0"
                          step="0.01"
                        />
                        <FormSelect
                          label="TVA"
                          name={`ligne_${index}_tva`}
                          value={String(ligne.taux_tva)}
                          onChange={(e) => handleLigneChange(index, "taux_tva", Number(e.target.value))}
                          options={TVA_OPTIONS}
                        />
                        <FormInput
                          label="Remise (%)"
                          name={`ligne_${index}_remise`}
                          type="number"
                          value={ligne.taux_remise}
                          onChange={(e) => handleLigneChange(index, "taux_remise", Number(e.target.value))}
                          min="0"
                          max="100"
                          step="0.01"
                        />
                        <div className="flex flex-col justify-end pb-1.5">
                          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                            Total HT
                          </label>
                          <div className="h-[38px] rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 px-3 flex items-center text-sm font-medium">
                            {ligne.montant_ht.toFixed(2)} {DEVISE}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="lg:col-span-1">
            <Card className="sticky top-6">
              <CardContent className="p-6 space-y-4">
                <h5 className="text-lg font-semibold text-blue-600 flex items-center gap-2">
                  <Euro /> Résumé
                </h5>

                <div className="space-y-3">
                  <div className="flex justify-between items-center py-2 border-b">
                    <span className="text-sm text-gray-500">Total HT</span>
                    <span className="text-sm font-semibold">{totalHt.toFixed(2)} {DEVISE}</span>
                  </div>
                  <div className="flex justify-between items-center py-2 border-b">
                    <span className="text-sm text-gray-500">Total TVA</span>
                    <span className="text-sm font-semibold">{totalTva.toFixed(2)} {DEVISE}</span>
                  </div>
                  <div className="flex justify-between items-center py-2">
                    <span className="text-base font-bold">Total TTC</span>
                    <span className="text-base font-bold text-blue-600">{totalTtc.toFixed(2)} {DEVISE}</span>
                  </div>
                </div>

                <FormTextarea
                  label="Notes"
                  name="notes"
                  value={formData.notes}
                  onChange={handleChange}
                  rows={4}
                  placeholder="Notes internes..."
                />

                <div className="pt-4 border-t">
                  <Button
                    type="submit"
                    className="w-full bg-blue-600 hover:bg-blue-700"
                    disabled={mutation.isPending || isSubmitting}
                  >
                    {mutation.isPending || isSubmitting ? (
                      <>
                        <Loader2 className="h-4 w-4 animate-spin mr-2" />
                        En cours...
                      </>
                    ) : (
                      <>
                        <Save className="mr-2" />
                        {isEditMode ? "Mettre à jour" : "Créer la facture"}
                      </>
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

export default FactureForm;
