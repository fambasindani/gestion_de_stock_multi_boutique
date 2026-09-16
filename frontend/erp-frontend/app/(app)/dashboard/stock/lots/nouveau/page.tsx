"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { FormInput } from "@/components/common/FormInput";
import { FormSelect } from "@/components/common/FormSelect";
import { FormTextarea } from "@/components/common/FormTextarea";
import { lotsService } from "@/lib/api/services/lots.service";
import { produitsService } from "@/lib/api/services/produits.service";
import { ProduitModele } from "@/lib/api/typess";
import { formatDateInput } from "@/lib/utils/format";
import {
  ArrowLeft, Save, Tag, Box, Hash, Calendar, Building2,
  FileText, Loader2, Ruler, Scan
} from "lucide-react";
import { BarcodeScannerModal } from "@/components/common/BarcodeScannerModal";

const typeOptions = [
  { value: "lot", label: "Lot" },
  { value: "serie", label: "Série" },
];

interface LotFormProps {
  id?: number;
}

export function LotForm({ id }: LotFormProps) {
  const router = useRouter();
  const queryClient = useQueryClient();
  const isEditMode = !!id;

  const [formData, setFormData] = useState({
    nom: "",
    code: "",
    produit_id: "",
    type: "lot" as string,
    date_production: "",
    date_peremption: "",
    quantite_initiale: "1",
    fournisseur: "",
    notes: "",
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [initialLoading, setInitialLoading] = useState(isEditMode);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [scannerOpen, setScannerOpen] = useState(false);

  const { data: produitsList } = useQuery({
    queryKey: ["produits-liste"],
    queryFn: async () => {
      const response = await produitsService.getAll({ per_page: 1000, actif: true });
      const prods = response.data;
      return Array.isArray(prods) ? prods : (prods as any)?.data ?? [];
    },
    staleTime: 5 * 60 * 1000,
  });

  useEffect(() => {
    const loadLot = async () => {
      if (!id) return;
      try {
        setInitialLoading(true);
        const response = await lotsService.getById(id);
        const data = response.data;
        if (data) {
          setFormData({
            nom: data.nom || "",
            code: data.code || "",
            produit_id: String(data.produit_id),
            type: data.type || "lot",
            date_production: data.date_production ? formatDateInput(data.date_production) : "",
            date_peremption: data.date_peremption ? formatDateInput(data.date_peremption) : "",
            quantite_initiale: String(data.quantite_initiale),
            fournisseur: data.fournisseur || "",
            notes: data.notes || "",
          });
        }
      } catch (error) {
        toast.error("Erreur lors du chargement du lot");
        router.push("/dashboard/stock/lots");
      } finally {
        setInitialLoading(false);
      }
    };

    if (isEditMode) loadLot();
  }, [id, isEditMode, router]);

  const mutation = useMutation({
    mutationFn: async (data: any) => {
      setIsSubmitting(true);
      const payload = {
        ...data,
        produit_id: Number(data.produit_id),
        quantite_initiale: Number(data.quantite_initiale),
      };
      if (isEditMode && id) return lotsService.update(id, payload);
      return lotsService.create(payload);
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
      toast.success(isEditMode ? "Lot mis à jour" : "Lot créé");
      queryClient.invalidateQueries({ queryKey: ["lots"] });
      router.push("/dashboard/stock/lots");
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});
    mutation.mutate(formData);
  };

  if (initialLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin text-cyan-600" />
        <p className="mt-4 text-gray-500">Chargement...</p>
      </div>
    );
  }

  const produitOptions = (produitsList || []).map((prod: ProduitModele) => ({
    value: String(prod.id),
    label: prod.nom,
  }));

  return (
    <div className="p-4 md:p-6">
      <div className="flex items-center gap-4 mb-6">
        <Button
          variant="ghost"
          onClick={() => router.push("/dashboard/stock/lots")}
          className="flex items-center gap-2 text-gray-600 hover:text-cyan-600"
        >
          <ArrowLeft className="h-4 w-4" /> Retour
        </Button>
        <h1 className="text-2xl font-bold text-gray-800 dark:text-white">
          {isEditMode ? "Modifier le lot" : "Nouveau lot"}
        </h1>
      </div>

      <form onSubmit={handleSubmit} noValidate>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            <Card>
              <CardContent className="p-6 space-y-6">
                <div>
                  <h5 className="text-lg font-semibold text-cyan-600 flex items-center gap-2 mb-4">
                    <Tag className="h-5 w-5" /> Informations générales
                  </h5>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormInput
                      label="Nom"
                      name="nom"
                      value={formData.nom}
                      onChange={handleChange}
                      required
                      error={errors.nom}
                      icon={<Tag className="h-4 w-4" />}
                      placeholder="LOT-2024-001"
                    />
                    <div className="relative">
                      <FormInput
                        label="Code"
                        name="code"
                        value={formData.code}
                        onChange={handleChange}
                        error={errors.code}
                        icon={<Hash className="h-4 w-4" />}
                        placeholder="LOT-001"
                      />
                      <button
                        type="button"
                        onClick={() => setScannerOpen(true)}
                        className="absolute right-2 top-7 p-1.5 rounded-lg text-gray-400 hover:text-cyan-600 hover:bg-cyan-50 transition-colors"
                        title="Scanner un code-barres"
                      >
                        <Scan className="h-4 w-4" />
                      </button>
                    </div>
                    <BarcodeScannerModal
                      open={scannerOpen}
                      onOpenChange={setScannerOpen}
                      onScan={(value) => {
                        setFormData((prev) => ({ ...prev, code: value }));
                      }}
                    />
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                    <FormSelect
                      label="Produit"
                      name="produit_id"
                      value={formData.produit_id}
                      onChange={(e) => handleSelectChange("produit_id", e.target.value)}
                      options={produitOptions}
                      required
                      icon={<Box className="h-4 w-4" />}
                    />
                    <FormSelect
                      label="Type"
                      name="type"
                      value={formData.type}
                      onChange={(e) => handleSelectChange("type", e.target.value)}
                      options={typeOptions}
                      required
                      icon={<Ruler className="h-4 w-4" />}
                    />
                  </div>
                </div>

                <div>
                  <h5 className="text-lg font-semibold text-cyan-600 flex items-center gap-2 mb-4">
                    <Calendar className="h-5 w-5" /> Dates & Quantité
                  </h5>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <FormInput
                      label="Date de production"
                      name="date_production"
                      type="date"
                      value={formData.date_production}
                      onChange={handleChange}
                      error={errors.date_production}
                      icon={<Calendar className="h-4 w-4" />}
                    />
                    <FormInput
                      label="Date de péremption"
                      name="date_peremption"
                      type="date"
                      value={formData.date_peremption}
                      onChange={handleChange}
                      error={errors.date_peremption}
                      icon={<Calendar className="h-4 w-4" />}
                    />
                    <FormInput
                      label="Quantité initiale"
                      name="quantite_initiale"
                      type="number"
                      value={formData.quantite_initiale}
                      onChange={handleChange}
                      required
                      error={errors.quantite_initiale}
                      min="1"
                      step="1"
                      icon={<Ruler className="h-4 w-4" />}
                    />
                  </div>
                </div>

                <div>
                  <h5 className="text-lg font-semibold text-cyan-600 flex items-center gap-2 mb-4">
                    <Building2 className="h-5 w-5" /> Fournisseur
                  </h5>
                  <FormInput
                    label="Fournisseur"
                    name="fournisseur"
                    value={formData.fournisseur}
                    onChange={handleChange}
                    error={errors.fournisseur}
                    icon={<Building2 className="h-4 w-4" />}
                    placeholder="Nom du fournisseur"
                  />
                </div>

                <div>
                  <h5 className="text-lg font-semibold text-cyan-600 flex items-center gap-2 mb-4">
                    <FileText className="h-5 w-5" /> Notes
                  </h5>
                  <FormTextarea
                    label=""
                    name="notes"
                    value={formData.notes}
                    onChange={handleChange}
                    error={errors.notes}
                    rows={4}
                    placeholder="Informations complémentaires..."
                  />
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="lg:col-span-1">
            <Card className="sticky top-6">
              <CardContent className="p-6">
                <h5 className="text-lg font-semibold text-cyan-600 flex items-center gap-2 mb-4">
                  <FileText className="h-5 w-5" /> Résumé
                </h5>
                <div className="space-y-3 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-500">Type</span>
                    <span className="font-medium">{formData.type === "lot" ? "Lot" : "Série"}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500">Produit</span>
                    <span className="font-medium">
                      {produitOptions.find((p: any) => p.value === formData.produit_id)?.label || "Non défini"}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500">Quantité</span>
                    <span className="font-medium">{formData.quantite_initiale}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500">Statut</span>
                    <span className="font-medium text-emerald-600">Actif</span>
                  </div>
                  <div className="pt-4 border-t">
                    <Button
                      type="submit"
                      className="w-full bg-cyan-600 hover:bg-cyan-700"
                      disabled={mutation.isPending || isSubmitting}
                    >
                      {mutation.isPending || isSubmitting ? (
                        <><Loader2 className="h-4 w-4 animate-spin mr-2" /> En cours...</>
                      ) : (
                        <><Save className="h-4 w-4 mr-2" /> {isEditMode ? "Mettre à jour" : "Créer"}</>
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

export default LotForm;
