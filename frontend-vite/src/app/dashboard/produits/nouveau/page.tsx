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
import { produitsService } from "@/lib/api/services/produits.service";
import { categoriesService } from "@/lib/api/services/categories.service";
import { unitesMesureService } from "@/lib/api/services/unites-mesure.service";
import {
  Package, ArrowLeft, Save, Plus, Trash2,
  Tag, Ruler, FileText, Type, DollarSign, Hash, Barcode
} from "lucide-react";
import { FaSpinner } from "react-icons/fa";

interface VarianteLine {
  code_interne: string;
  nom: string;
  prix_achat: number;
  prix_vente: number;
  reference_fournisseur: string;
}

interface ProduitFormProps {
  id?: number;
}

export function ProduitForm({ id }: ProduitFormProps) {
  const router = useRouter();
  const queryClient = useQueryClient();
  const isEditMode = !!id;

  const [formData, setFormData] = useState({
    nom: "",
    type: "stockable" as string,
    description: "",
    categorie_id: "",
    unite_id: "",
    actif: 1,
  });

  const [variantes, setVariantes] = useState<VarianteLine[]>([]);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [initialLoading, setInitialLoading] = useState(isEditMode);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { data: categoriesData } = useQuery({
    queryKey: ["categories-select"],
    queryFn: async () => {
      const response = await categoriesService.getAll();
      const cats = response.data;
      return (Array.isArray(cats) ? cats : (cats as any)?.data ?? []) as any[];
    },
    staleTime: 5 * 60 * 1000,
  });

  const { data: unitesData } = useQuery({
    queryKey: ["unites-select"],
    queryFn: async () => {
      const response = await unitesMesureService.getActives();
      const unites = response.data;
      return (Array.isArray(unites) ? unites : (unites as any)?.data ?? []) as any[];
    },
    staleTime: 5 * 60 * 1000,
  });

  useEffect(() => {
    const loadProduit = async () => {
      if (!id) return;
      try {
        setInitialLoading(true);
        const response = await produitsService.getById(id);
        const data = response.data;
        if (data) {
          setFormData({
            nom: data.nom || "",
            type: data.type || "stockable",
            description: data.description || "",
            categorie_id: data.categorie_id ? String(data.categorie_id) : "",
            unite_id: data.unite_id ? String(data.unite_id) : "",
            actif: data.actif ?? 1,
          });
          if (data.variantes && data.variantes.length > 0) {
            setVariantes(
              data.variantes.map((v) => ({
                code_interne: v.code_interne || "",
                nom: v.nom || "",
                prix_achat: v.prix_achat || 0,
                prix_vente: v.prix_vente || 0,
                reference_fournisseur: v.reference_fournisseur || "",
              }))
            );
          }
        }
      } catch (error) {
        console.error("Erreur chargement produit:", error);
        toast.error("Erreur lors du chargement du produit");
        router.push("/dashboard/produits");
      } finally {
        setInitialLoading(false);
      }
    };

    if (isEditMode) loadProduit();
  }, [id, isEditMode, router]);

  const mutation = useMutation({
    mutationFn: async (data: any) => {
      setIsSubmitting(true);
      if (isEditMode && id) {
        return produitsService.update(id, data);
      }
      return produitsService.create(data);
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
      toast.success(isEditMode ? "Produit mis à jour" : "Produit créé");
      queryClient.invalidateQueries({ queryKey: ["produits"] });
      router.push("/dashboard/produits");
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
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value, type } = e.target;
    if (errors[name]) {
      setErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors[name];
        return newErrors;
      });
    }
    if (type === "number") {
      setFormData((prev) => ({ ...prev, [name]: value === "" ? 0 : Number(value) }));
      return;
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

  const handleAddVariante = () => {
    setVariantes((prev) => [
      ...prev,
      { code_interne: "", nom: "", prix_achat: 0, prix_vente: 0, reference_fournisseur: "" },
    ]);
  };

  const handleRemoveVariante = (index: number) => {
    setVariantes((prev) => prev.filter((_, i) => i !== index));
  };

  const handleVarianteChange = (
    index: number,
    field: keyof VarianteLine,
    value: string | number
  ) => {
    setVariantes((prev) =>
      prev.map((v, i) => (i === index ? { ...v, [field]: value } : v))
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});

    const dataToSend: any = {
      ...formData,
      categorie_id: formData.categorie_id ? Number(formData.categorie_id) : null,
      unite_id: formData.unite_id ? Number(formData.unite_id) : null,
      actif: Number(formData.actif),
    };

    if (variantes.length > 0) {
      dataToSend.variantes = variantes.map((v) => ({
        ...v,
        prix_achat: Number(v.prix_achat),
        prix_vente: Number(v.prix_vente),
      }));
    }

    mutation.mutate(dataToSend);
  };

  if (initialLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px]">
        <FaSpinner className="h-8 w-8 animate-spin text-purple-600" />
        <p className="mt-4 text-gray-500">Chargement...</p>
      </div>
    );
  }

  const typeOptions = [
    { value: "consommable", label: "Consommable" },
    { value: "service", label: "Service" },
    { value: "stockable", label: "Stockable" },
  ];

  const categorieOptions = (categoriesData || []).map((c) => ({
    value: c.id,
    label: c.nom,
  }));

  const uniteOptions = (unitesData || []).map((u) => ({
    value: u.id,
    label: `${u.nom} (${u.symbole})`,
  }));

  return (
    <div className="p-4 md:p-6">
      <div className="flex items-center gap-4 mb-6">
        <Button
          variant="ghost"
          onClick={() => router.push("/dashboard/produits")}
          className="flex items-center gap-2 text-gray-600 hover:text-purple-600"
        >
          <ArrowLeft className="h-4 w-4" /> Retour
        </Button>
        <h1 className="text-2xl font-bold text-gray-800 dark:text-white">
          {isEditMode ? "Modifier le produit" : "Nouveau produit"}
        </h1>
      </div>

      <form onSubmit={handleSubmit} noValidate>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            <Card>
              <CardContent className="p-6 space-y-6">
                <div>
                  <h5 className="text-lg font-semibold text-purple-600 flex items-center gap-2 mb-4">
                    <Package className="h-5 w-5" /> Informations générales
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
                      placeholder="Nom du produit"
                    />
                    <FormSelect
                      label="Type"
                      name="type"
                      value={formData.type}
                      onChange={(e) => handleSelectChange("type", e.target.value)}
                      options={typeOptions}
                      required
                      icon={<Type className="h-4 w-4" />}
                    />
                  </div>
                  <div className="mt-4">
                    <FormTextarea
                      label="Description"
                      name="description"
                      value={formData.description}
                      onChange={handleChange}
                      error={errors.description}
                      rows={3}
                      placeholder="Description du produit..."
                    />
                  </div>
                </div>

                <div>
                  <h5 className="text-lg font-semibold text-purple-600 flex items-center gap-2 mb-4">
                    <FileText className="h-5 w-5" /> Classification
                  </h5>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormSelect
                      label="Catégorie"
                      name="categorie_id"
                      value={formData.categorie_id}
                      onChange={(e) => handleSelectChange("categorie_id", e.target.value)}
                      options={categorieOptions}
                      placeholder="Sélectionner une catégorie"
                      icon={<Tag className="h-4 w-4" />}
                    />
                    <FormSelect
                      label="Unité de mesure"
                      name="unite_id"
                      value={formData.unite_id}
                      onChange={(e) => handleSelectChange("unite_id", e.target.value)}
                      options={uniteOptions}
                      placeholder="Sélectionner une unité"
                      icon={<Ruler className="h-4 w-4" />}
                    />
                  </div>
                </div>

                <div>
                  <div className="flex items-center justify-between mb-4">
                    <h5 className="text-lg font-semibold text-purple-600 flex items-center gap-2">
                      <Barcode className="h-5 w-5" /> Variantes
                    </h5>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={handleAddVariante}
                      className="text-purple-600 border-purple-300 hover:bg-purple-50"
                    >
                      <Plus className="h-4 w-4 mr-1" /> Ajouter une variante
                    </Button>
                  </div>
                  {variantes.length === 0 && (
                    <p className="text-sm text-gray-400 italic">
                      Aucune variante ajoutée. Cliquez sur "Ajouter une variante" pour en créer.
                    </p>
                  )}
                  {variantes.map((variante, index) => (
                    <Card key={index} className="mb-3 border-purple-100 dark:border-purple-900/30">
                      <CardContent className="p-4">
                        <div className="flex items-center justify-between mb-3">
                          <span className="text-sm font-medium text-purple-600">
                            Variante #{index + 1}
                          </span>
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            onClick={() => handleRemoveVariante(index)}
                            className="text-red-500 hover:text-red-700 hover:bg-red-50"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                          <FormInput
                            label="Code interne"
                            name={`variante_code_${index}`}
                            value={variante.code_interne}
                            onChange={(e) =>
                              handleVarianteChange(index, "code_interne", e.target.value)
                            }
                            icon={<Hash className="h-4 w-4" />}
                            placeholder="REF-001"
                          />
                          <FormInput
                            label="Nom"
                            name={`variante_nom_${index}`}
                            value={variante.nom}
                            onChange={(e) =>
                              handleVarianteChange(index, "nom", e.target.value)
                            }
                            icon={<Tag className="h-4 w-4" />}
                            placeholder="Nom de la variante"
                          />
                          <FormInput
                            label="Prix d'achat"
                            name={`variante_achat_${index}`}
                            type="number"
                            value={variante.prix_achat}
                            onChange={(e) =>
                              handleVarianteChange(index, "prix_achat", e.target.value === "" ? 0 : Number(e.target.value))
                            }
                            icon={<DollarSign className="h-4 w-4" />}
                            step="0.01"
                            min="0"
                          />
                          <FormInput
                            label="Prix de vente"
                            name={`variante_vente_${index}`}
                            type="number"
                            value={variante.prix_vente}
                            onChange={(e) =>
                              handleVarianteChange(index, "prix_vente", e.target.value === "" ? 0 : Number(e.target.value))
                            }
                            icon={<DollarSign className="h-4 w-4" />}
                            step="0.01"
                            min="0"
                          />
                          <FormInput
                            label="Référence fournisseur"
                            name={`variante_ref_${index}`}
                            value={variante.reference_fournisseur}
                            onChange={(e) =>
                              handleVarianteChange(index, "reference_fournisseur", e.target.value)
                            }
                            icon={<Barcode className="h-4 w-4" />}
                            placeholder="REF-FOUR-001"
                          />
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="lg:col-span-1">
            <Card className="sticky top-6">
              <CardContent className="p-6 space-y-4">
                <h5 className="text-lg font-semibold text-purple-600 flex items-center gap-2">
                  <FileText className="h-5 w-5" /> Configuration
                </h5>

                <FormSelect
                  label="Statut"
                  name="actif"
                  value={String(formData.actif)}
                  onChange={(e) => handleSelectChange("actif", e.target.value)}
                  options={[
                    { value: "1", label: "Actif" },
                    { value: "0", label: "Inactif" },
                  ]}
                  required
                />

                <div className="pt-4 border-t">
                  <Button
                    type="submit"
                    className="w-full bg-purple-600 hover:bg-purple-700"
                    disabled={mutation.isPending || isSubmitting}
                  >
                    {mutation.isPending || isSubmitting ? (
                      <>
                        <FaSpinner className="h-4 w-4 animate-spin mr-2" />
                        En cours...
                      </>
                    ) : (
                      <>
                        <Save className="h-4 w-4 mr-2" />
                        {isEditMode ? "Mettre à jour" : "Créer"}
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

export default ProduitForm;
