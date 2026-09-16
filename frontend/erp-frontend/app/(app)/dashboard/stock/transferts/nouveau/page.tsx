"use client";

import React, { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { FormInput } from "@/components/common/FormInput";
import { FormSelect } from "@/components/common/FormSelect";
import { FormTextarea } from "@/components/common/FormTextarea";
import { transfertsService } from "@/lib/api/services/transferts.service";
import { emplacementsService } from "@/lib/api/services/emplacements.service";
import { produitsService } from "@/lib/api/services/produits.service";
import { lotsService } from "@/lib/api/services/lots.service";
import { EmplacementStock, ProduitModele, LotTracabilite } from "@/lib/api/typess";
import {
  ArrowLeft, Save, Plus, Trash2, ArrowLeftRight, Warehouse, Truck,
  Package, Factory, Calendar, FileText, Loader2
} from "lucide-react";

const typeOptions = [
  { value: "reception", label: "Réception" },
  { value: "livraison", label: "Livraison" },
  { value: "interne", label: "Interne" },
  { value: "production", label: "Production" },
];

interface LigneMouvement {
  produit_id: string;
  lot_id: string;
  quantite_demandee: string;
}

export default function NouveauTransfert() {
  const router = useRouter();
  const queryClient = useQueryClient();

  const [formData, setFormData] = useState({
    type: "interne",
    emplacement_source_id: "",
    emplacement_destination_id: "",
    date_prevue: "",
    notes: "",
  });

  const [lignes, setLignes] = useState<LigneMouvement[]>([
    { produit_id: "", lot_id: "", quantite_demandee: "" },
  ]);

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { data: emplacementsList } = useQuery({
    queryKey: ["emplacements-all"],
    queryFn: async () => {
      const response = await emplacementsService.getAll({ per_page: 1000 });
      const emps = response.data;
      return Array.isArray(emps) ? emps : (emps as any)?.data ?? [];
    },
    staleTime: 5 * 60 * 1000,
  });

  const { data: produitsList } = useQuery({
    queryKey: ["produits-liste"],
    queryFn: async () => {
      const response = await produitsService.getAll({ per_page: 1000, actif: true });
      const prods = response.data;
      return Array.isArray(prods) ? prods : (prods as any)?.data ?? [];
    },
    staleTime: 5 * 60 * 1000,
  });

  const { data: lotsList } = useQuery({
    queryKey: ["lots-actifs"],
    queryFn: async () => {
      const response = await lotsService.getAll({ per_page: 1000, statut: "actif" });
      const lots = response.data;
      return Array.isArray(lots) ? lots : (lots as any)?.data ?? [];
    },
    staleTime: 5 * 60 * 1000,
  });

  const mutation = useMutation({
    mutationFn: async (data: any) => {
      setIsSubmitting(true);
      return transfertsService.create(data);
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
      toast.success("Transfert créé avec succès");
      queryClient.invalidateQueries({ queryKey: ["transferts"] });
      router.push("/dashboard/stock/transferts");
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

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    if (errors[name]) setErrors((prev) => { const n = { ...prev }; delete n[name]; return n; });
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSelectChange = (name: string, value: string) => {
    if (errors[name]) setErrors((prev) => { const n = { ...prev }; delete n[name]; return n; });
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleLigneChange = (index: number, field: keyof LigneMouvement, value: string) => {
    setLignes((prev) => {
      const updated = [...prev];
      updated[index] = { ...updated[index], [field]: value };
      return updated;
    });
  };

  const addLigne = () => {
    setLignes((prev) => [...prev, { produit_id: "", lot_id: "", quantite_demandee: "" }]);
  };

  const removeLigne = (index: number) => {
    if (lignes.length <= 1) return;
    setLignes((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});

    const mouvements = lignes
      .filter((l) => l.produit_id && l.quantite_demandee)
      .map((l) => ({
        produit_id: Number(l.produit_id),
        ...(l.lot_id ? { lot_id: Number(l.lot_id) } : {}),
        quantite_demandee: Number(l.quantite_demandee),
      }));

    if (mouvements.length === 0) {
      toast.error("Ajoutez au moins un produit au transfert");
      return;
    }

    const dataToSend = {
      type: formData.type,
      emplacement_source_id: formData.emplacement_source_id ? Number(formData.emplacement_source_id) : undefined,
      emplacement_destination_id: formData.emplacement_destination_id ? Number(formData.emplacement_destination_id) : undefined,
      date_prevue: formData.date_prevue || undefined,
      notes: formData.notes || undefined,
      mouvements,
    };

    mutation.mutate(dataToSend);
  };

  const emplacementOptions = (emplacementsList || []).map((emp: EmplacementStock) => ({
    value: String(emp.id),
    label: `${emp.code ? emp.code + " - " : ""}${emp.nom}`,
  }));

  const produitOptions = (produitsList || []).map((prod: ProduitModele) => ({
    value: String(prod.id),
    label: prod.nom,
  }));

  const lotOptions = (lotsList || []).map((lot: LotTracabilite) => ({
    value: String(lot.id),
    label: `${lot.nom || lot.code || "Lot #" + lot.id} (${lot.quantite_actuelle})`,
  }));

  return (
    <div className="p-4 md:p-6">
      <div className="flex items-center gap-4 mb-6">
        <Button
          variant="ghost"
          onClick={() => router.push("/dashboard/stock/transferts")}
          className="flex items-center gap-2 text-gray-600 hover:text-blue-600"
        >
          <ArrowLeft className="h-4 w-4" /> Retour
        </Button>
        <h1 className="text-2xl font-bold text-gray-800 dark:text-white">
          Nouveau transfert
        </h1>
      </div>

      <form onSubmit={handleSubmit} noValidate>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            <Card>
              <CardContent className="p-6 space-y-6">
                <div>
                  <h5 className="text-lg font-semibold text-blue-600 flex items-center gap-2 mb-4">
                    <ArrowLeftRight className="h-5 w-5" /> Informations générales
                  </h5>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormSelect
                      label="Type de transfert"
                      name="type"
                      value={formData.type}
                      onChange={(e) => handleSelectChange("type", e.target.value)}
                      options={typeOptions}
                      required
                      icon={<Factory className="h-4 w-4" />}
                    />
                    <FormInput
                      label="Date prévue"
                      name="date_prevue"
                      type="date"
                      value={formData.date_prevue}
                      onChange={handleChange}
                      error={errors.date_prevue}
                      icon={<Calendar className="h-4 w-4" />}
                    />
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                    <FormSelect
                      label="Emplacement source"
                      name="emplacement_source_id"
                      value={formData.emplacement_source_id}
                      onChange={(e) => handleSelectChange("emplacement_source_id", e.target.value)}
                      options={emplacementOptions}
                      icon={<Warehouse className="h-4 w-4" />}
                    />
                    <FormSelect
                      label="Emplacement destination"
                      name="emplacement_destination_id"
                      value={formData.emplacement_destination_id}
                      onChange={(e) => handleSelectChange("emplacement_destination_id", e.target.value)}
                      options={emplacementOptions}
                      icon={<Truck className="h-4 w-4" />}
                    />
                  </div>
                </div>

                <div>
                  <FormTextarea
                    label="Notes"
                    name="notes"
                    value={formData.notes}
                    onChange={handleChange}
                    error={errors.notes}
                    rows={3}
                    placeholder="Informations complémentaires..."
                  />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center gap-2">
                    <Package className="h-5 w-5 text-blue-600" />
                    Produits à transférer
                  </CardTitle>
                  <Button type="button" variant="outline" size="sm" onClick={addLigne}>
                    <Plus className="h-4 w-4 mr-1" /> Ajouter
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="p-6 space-y-4">
                {lignes.map((ligne, index) => (
                  <div key={index} className="flex items-start gap-3 p-4 rounded-lg border bg-gray-50 dark:bg-gray-800/50">
                    <div className="flex-1 grid grid-cols-1 md:grid-cols-3 gap-3">
                      <FormSelect
                        label="Produit"
                        name={`lignes[${index}].produit_id`}
                        value={ligne.produit_id}
                        onChange={(e) => handleLigneChange(index, "produit_id", e.target.value)}
                        options={produitOptions}
                        placeholder="Sélectionner..."
                      />
                      <FormSelect
                        label="Lot (optionnel)"
                        name={`lignes[${index}].lot_id`}
                        value={ligne.lot_id}
                        onChange={(e) => handleLigneChange(index, "lot_id", e.target.value)}
                        options={lotOptions}
                        placeholder="Aucun"
                      />
                      <FormInput
                        label="Quantité"
                        name={`lignes[${index}].quantite_demandee`}
                        type="number"
                        value={ligne.quantite_demandee}
                        onChange={(e) => handleLigneChange(index, "quantite_demandee", e.target.value)}
                        min="1"
                        step="1"
                        placeholder="0"
                      />
                    </div>
                    {lignes.length > 1 && (
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => removeLigne(index)}
                        className="mt-6 text-red-500 hover:text-red-700 hover:bg-red-50"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>

          <div className="lg:col-span-1">
            <Card className="sticky top-6">
              <CardContent className="p-6">
                <h5 className="text-lg font-semibold text-blue-600 flex items-center gap-2 mb-4">
                  <FileText className="h-5 w-5" /> Résumé
                </h5>
                <div className="space-y-3 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-500">Type</span>
                    <span className="font-medium">{typeOptions.find((t) => t.value === formData.type)?.label || formData.type}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500">Lignes</span>
                    <span className="font-medium">{lignes.filter((l) => l.produit_id).length}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500">Date</span>
                    <span className="font-medium">{formData.date_prevue || "Non définie"}</span>
                  </div>
                  <div className="pt-4 border-t">
                    <Button
                      type="submit"
                      className="w-full bg-blue-600 hover:bg-blue-700"
                      disabled={mutation.isPending || isSubmitting}
                    >
                      {mutation.isPending || isSubmitting ? (
                        <><Loader2 className="h-4 w-4 animate-spin mr-2" /> En cours...</>
                      ) : (
                        <><Save className="h-4 w-4 mr-2" /> Créer le transfert</>
                      )}
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </form>
    </div>
  );
}
