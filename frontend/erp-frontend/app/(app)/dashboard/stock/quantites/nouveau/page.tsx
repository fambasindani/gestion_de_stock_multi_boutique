"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { useMutation, useQuery } from "@tanstack/react-query";
import { toast } from "sonner";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { FormInput } from "@/components/common/FormInput";
import { FormSelect } from "@/components/common/FormSelect";
import { FormTextarea } from "@/components/common/FormTextarea";
import { stockService } from "@/lib/api/services/stock.service";
import { produitsService } from "@/lib/api/services/produits.service";
import { emplacementsService } from "@/lib/api/services/emplacements.service";
import { lotsService } from "@/lib/api/services/lots.service";
import {
  ArrowLeft, Save, Package, Warehouse, Tag,
  Ruler, AlertTriangle, Calendar, FileText,
  Loader2, Boxes
} from "lucide-react";

export default function NouveauStock() {
  const router = useRouter();

  const [formData, setFormData] = useState({
    produit_id: "",
    emplacement_id: "",
    lot_id: "",
    quantite_disponible: "0",
    quantite_reservee: "0",
    quantite_commande: "0",
    quantite_controlee: "0",
    seuil_minimum: "",
    seuil_maximum: "",
    date_prochaine_reception: "",
    notes: "",
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { data: produitsData } = useQuery({
    queryKey: ["produits-all"],
    queryFn: async () => {
      const response = await produitsService.getAll({ per_page: 1000, actif: true });
      const prods = response.data;
      return Array.isArray(prods) ? prods : (prods as any)?.data ?? [];
    },
    staleTime: 5 * 60 * 1000,
  });

  const { data: emplacementsData } = useQuery({
    queryKey: ["emplacements-all"],
    queryFn: async () => {
      const response = await emplacementsService.getAll({ per_page: 1000 });
      const emps = response.data;
      return Array.isArray(emps) ? emps : (emps as any)?.data ?? [];
    },
    staleTime: 5 * 60 * 1000,
  });

  const { data: lotsData } = useQuery({
    queryKey: ["lots-all"],
    queryFn: async () => {
      const response = await lotsService.getAll({ per_page: 1000 });
      const lots = response.data;
      return Array.isArray(lots) ? lots : (lots as any)?.data ?? [];
    },
    staleTime: 5 * 60 * 1000,
  });

  const mutation = useMutation({
    mutationFn: async (data: any) => {
      setIsSubmitting(true);
      const payload: any = {
        produit_id: Number(data.produit_id),
        emplacement_id: Number(data.emplacement_id),
        quantite_disponible: Number(data.quantite_disponible),
        quantite_reservee: Number(data.quantite_reservee),
        quantite_commande: Number(data.quantite_commande),
        quantite_controlee: Number(data.quantite_controlee),
      };
      if (data.lot_id) payload.lot_id = Number(data.lot_id);
      if (data.seuil_minimum) payload.seuil_minimum = Number(data.seuil_minimum);
      if (data.seuil_maximum) payload.seuil_maximum = Number(data.seuil_maximum);
      if (data.date_prochaine_reception) payload.date_prochaine_reception = data.date_prochaine_reception;
      if (data.notes) payload.notes = data.notes;
      return stockService.create(payload);
    },
    onSuccess: (data) => {
      setIsSubmitting(false);
      if (data?.success === false) {
        if (data.errors) {
          const newErrors: Record<string, string> = {};
          Object.entries(data.errors).forEach(([key, msgs]) => {
            newErrors[key] = Array.isArray(msgs) ? msgs[0] : msgs as string;
          });
          setErrors(newErrors);
        }
        if (data.message) toast.error(data.message);
        return;
      }
      toast.success("Stock créé avec succès");
      router.push("/dashboard/stock/quantites");
    },
    onError: (error: any) => {
      setIsSubmitting(false);
      if (error?.response?.data?.errors) {
        const newErrors: Record<string, string> = {};
        Object.entries(error.response.data.errors).forEach(([key, msgs]) => {
          newErrors[key] = Array.isArray(msgs) ? msgs[0] : msgs as string;
        });
        setErrors(newErrors);
      }
      toast.error(error?.response?.data?.message || "Une erreur est survenue");
    },
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    if (errors[name]) setErrors((prev) => { const n = { ...prev }; delete n[name]; return n; });
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSelectChange = (name: string, value: string) => {
    if (errors[name]) setErrors((prev) => { const n = { ...prev }; delete n[name]; return n; });
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});
    mutation.mutate(formData);
  };

  const produitOptions = (produitsData || []).flatMap((prod: any) => {
    const variantes = prod.variantes || [];
    if (variantes.length === 0) {
      return [{ value: String(prod.id), label: prod.nom }];
    }
    return variantes.map((v: any) => ({
      value: String(v.id),
      label: `${prod.nom} - ${v.nom || v.code_interne || `#${v.id}`}`,
    }));
  });

  const emplacementOptions = (emplacementsData || []).map((emp: any) => ({
    value: String(emp.id),
    label: emp.nom,
  }));

  const lotsFiltres = (lotsData || []).filter((lot: any) =>
    !formData.produit_id || String(lot.produit_id) === formData.produit_id
  );

  const lotOptions = lotsFiltres.map((lot: any) => ({
    value: String(lot.id),
    label: `${lot.nom || lot.code} (${lot.quantite_actuelle} dispo)`,
  }));

  return (
    <div className="p-4 md:p-6">
      <div className="flex items-center gap-4 mb-6">
        <Button
          variant="ghost"
          onClick={() => router.push("/dashboard/stock/quantites")}
          className="flex items-center gap-2 text-gray-600 hover:text-emerald-600"
        >
          <ArrowLeft className="h-4 w-4" /> Retour
        </Button>
        <h1 className="text-2xl font-bold text-gray-800 dark:text-white">
          Nouvelle ligne de stock
        </h1>
      </div>

      <form onSubmit={handleSubmit} noValidate>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            <Card>
              <CardContent className="p-6 space-y-6">
                <div>
                  <h5 className="text-lg font-semibold text-emerald-600 flex items-center gap-2 mb-4">
                    <Package className="h-5 w-5" /> Produit & Emplacement
                  </h5>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormSelect
                      label="Produit (variante)"
                      name="produit_id"
                      value={formData.produit_id}
                      onChange={(e) => handleSelectChange("produit_id", e.target.value)}
                      options={produitOptions}
                      required
                      icon={<Package className="h-4 w-4" />}
                    />
                    <FormSelect
                      label="Emplacement"
                      name="emplacement_id"
                      value={formData.emplacement_id}
                      onChange={(e) => handleSelectChange("emplacement_id", e.target.value)}
                      options={emplacementOptions}
                      required
                      icon={<Warehouse className="h-4 w-4" />}
                    />
                  </div>
                  <div className="mt-4">
                    <FormSelect
                      label="Lot (optionnel)"
                      name="lot_id"
                      value={formData.lot_id}
                      onChange={(e) => handleSelectChange("lot_id", e.target.value)}
                      options={[{ value: "", label: "Aucun lot" }, ...lotOptions]}
                      icon={<Tag className="h-4 w-4" />}
                    />
                  </div>
                </div>

                <div>
                  <h5 className="text-lg font-semibold text-emerald-600 flex items-center gap-2 mb-4">
                    <Boxes className="h-5 w-5" /> Quantités
                  </h5>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                    <FormInput
                      label="Disponible"
                      name="quantite_disponible"
                      type="number"
                      value={formData.quantite_disponible}
                      onChange={handleChange}
                      error={errors.quantite_disponible}
                      icon={<Ruler className="h-4 w-4" />}
                      min="0"
                      step="0.01"
                    />
                    <FormInput
                      label="Réservée"
                      name="quantite_reservee"
                      type="number"
                      value={formData.quantite_reservee}
                      onChange={handleChange}
                      error={errors.quantite_reservee}
                      icon={<Ruler className="h-4 w-4" />}
                      min="0"
                      step="0.01"
                    />
                    <FormInput
                      label="Commandée"
                      name="quantite_commande"
                      type="number"
                      value={formData.quantite_commande}
                      onChange={handleChange}
                      error={errors.quantite_commande}
                      icon={<Ruler className="h-4 w-4" />}
                      min="0"
                      step="0.01"
                    />
                    <FormInput
                      label="Contrôlée"
                      name="quantite_controlee"
                      type="number"
                      value={formData.quantite_controlee}
                      onChange={handleChange}
                      error={errors.quantite_controlee}
                      icon={<Ruler className="h-4 w-4" />}
                      min="0"
                      step="0.01"
                    />
                  </div>
                </div>

                <div>
                  <h5 className="text-lg font-semibold text-emerald-600 flex items-center gap-2 mb-4">
                    <AlertTriangle className="h-5 w-5" /> Seuils
                  </h5>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <FormInput
                      label="Seuil minimum"
                      name="seuil_minimum"
                      type="number"
                      value={formData.seuil_minimum}
                      onChange={handleChange}
                      error={errors.seuil_minimum}
                      icon={<AlertTriangle className="h-4 w-4" />}
                      min="0"
                      step="0.01"
                      placeholder="Ex: 10"
                    />
                    <FormInput
                      label="Seuil maximum"
                      name="seuil_maximum"
                      type="number"
                      value={formData.seuil_maximum}
                      onChange={handleChange}
                      error={errors.seuil_maximum}
                      icon={<AlertTriangle className="h-4 w-4" />}
                      min="0"
                      step="0.01"
                      placeholder="Ex: 500"
                    />
                  </div>
                </div>

                <div>
                  <h5 className="text-lg font-semibold text-emerald-600 flex items-center gap-2 mb-4">
                    <Calendar className="h-5 w-5" /> Réception
                  </h5>
                  <FormInput
                    label="Date prochaine réception"
                    name="date_prochaine_reception"
                    type="date"
                    value={formData.date_prochaine_reception}
                    onChange={handleChange}
                    error={errors.date_prochaine_reception}
                    icon={<Calendar className="h-4 w-4" />}
                  />
                </div>

                <div>
                  <h5 className="text-lg font-semibold text-emerald-600 flex items-center gap-2 mb-4">
                    <FileText className="h-5 w-5" /> Notes
                  </h5>
                  <FormTextarea
                    label=""
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
          </div>

          <div className="lg:col-span-1">
            <Card className="sticky top-6">
              <CardContent className="p-6">
                <h5 className="text-lg font-semibold text-emerald-600 flex items-center gap-2 mb-4">
                  <FileText className="h-5 w-5" /> Résumé
                </h5>
                <div className="space-y-3 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-500">Produit</span>
                    <span className="font-medium text-right">
                      {produitOptions.find((p: any) => p.value === formData.produit_id)?.label?.split(" - ")[0] || "Non défini"}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500">Emplacement</span>
                    <span className="font-medium">
                      {emplacementOptions.find((e: any) => e.value === formData.emplacement_id)?.label || "Non défini"}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500">Lot</span>
                    <span className="font-medium">
                      {lotOptions.find((l: any) => l.value === formData.lot_id)?.label || "Aucun"}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500">Disponible</span>
                    <span className="font-medium text-emerald-600">{formData.quantite_disponible}</span>
                  </div>
                  <div className="pt-4 border-t">
                    <Button
                      type="submit"
                      className="w-full bg-emerald-600 hover:bg-emerald-700"
                      disabled={mutation.isPending || isSubmitting}
                    >
                      {mutation.isPending || isSubmitting ? (
                        <><Loader2 className="h-4 w-4 animate-spin mr-2" /> En cours...</>
                      ) : (
                        <><Save className="h-4 w-4 mr-2" /> Créer le stock</>
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
