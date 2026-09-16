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
import { emplacementsService } from "@/lib/api/services/emplacements.service";
import { EmplacementStock } from "@/lib/api/typess";
import {
  ArrowLeft, Save, Box, MapPin, Hash, AlignLeft, Layers,
  Warehouse, Package, Shield, AlertTriangle, Ruler, Loader2, Scan
} from "lucide-react";
import { BarcodeScannerModal } from "@/components/common/BarcodeScannerModal";

const usageOptions = [
  { value: "fournisseur", label: "Fournisseur" },
  { value: "client", label: "Client" },
  { value: "interne", label: "Interne" },
  { value: "inventaire", label: "Inventaire" },
  { value: "approvisionnement", label: "Approvisionnement" },
  { value: "production", label: "Production" },
  { value: "transit", label: "Transit" },
  { value: "vue", label: "Vue" },
];

const typeOptions = [
  { value: "normal", label: "Normal" },
  { value: "reserve", label: "Réserve" },
  { value: "qualite", label: "Qualité" },
  { value: "quarantine", label: "Quarantaine" },
];

interface EmplacementFormProps {
  id?: number;
}

export function EmplacementForm({ id }: EmplacementFormProps) {
  const router = useRouter();
  const queryClient = useQueryClient();
  const isEditMode = !!id;

  const [formData, setFormData] = useState({
    nom: "",
    code: "",
    description: "",
    usage: "interne" as string,
    type: "normal" as string,
    emplacement_parent_id: "",
    capacite_maximale: "",
    code_barres: "",
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [initialLoading, setInitialLoading] = useState(isEditMode);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [scannerOpen, setScannerOpen] = useState(false);

  const { data: emplacementsList } = useQuery({
    queryKey: ["emplacements-liste"],
    queryFn: async () => {
      const response = await emplacementsService.getAll({ per_page: 1000 });
      const emps = response.data;
      return Array.isArray(emps) ? emps : (emps as any)?.data ?? [];
    },
    staleTime: 5 * 60 * 1000,
  });

  useEffect(() => {
    const loadEmplacement = async () => {
      if (!id) return;
      try {
        setInitialLoading(true);
        const response = await emplacementsService.getById(id);
        const data = response.data;
        if (data) {
          setFormData({
            nom: data.nom || "",
            code: data.code || "",
            description: data.description || "",
            usage: data.usage || "interne",
            type: data.type || "normal",
            emplacement_parent_id: data.emplacement_parent_id ? String(data.emplacement_parent_id) : "",
            capacite_maximale: data.capacite_maximale ? String(data.capacite_maximale) : "",
            code_barres: data.code_barres || "",
          });
        }
      } catch (error) {
        toast.error("Erreur lors du chargement de l'emplacement");
        router.push("/dashboard/stock/emplacements");
      } finally {
        setInitialLoading(false);
      }
    };

    if (isEditMode) loadEmplacement();
  }, [id, isEditMode, router]);

  const mutation = useMutation({
    mutationFn: async (data: any) => {
      setIsSubmitting(true);
      const payload = {
        ...data,
        emplacement_parent_id: data.emplacement_parent_id ? Number(data.emplacement_parent_id) : null,
        capacite_maximale: data.capacite_maximale ? Number(data.capacite_maximale) : null,
        code_barres: data.code_barres || null,
      };
      if (isEditMode && id) {
        return emplacementsService.update(id, payload);
      }
      return emplacementsService.create(payload);
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
      toast.success(isEditMode ? "Emplacement mis à jour" : "Emplacement créé");
      queryClient.invalidateQueries({ queryKey: ["emplacements"] });
      router.push("/dashboard/stock/emplacements");
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});
    mutation.mutate(formData);
  };

  if (initialLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin text-amber-600" />
        <p className="mt-4 text-gray-500">Chargement...</p>
      </div>
    );
  }

  const parentOptions = (emplacementsList || [])
    .filter((emp: any) => !isEditMode || emp.id !== id)
    .map((emp: any) => ({ value: String(emp.id), label: `${emp.code ? emp.code + " - " : ""}${emp.nom}` }));

  return (
    <div className="p-4 md:p-6">
      <div className="flex items-center gap-4 mb-6">
        <Button
          variant="ghost"
          onClick={() => router.push("/dashboard/stock/emplacements")}
          className="flex items-center gap-2 text-gray-600 hover:text-amber-600"
        >
          <ArrowLeft className="h-4 w-4" /> Retour
        </Button>
        <h1 className="text-2xl font-bold text-gray-800 dark:text-white">
          {isEditMode ? "Modifier l'emplacement" : "Nouvel emplacement"}
        </h1>
      </div>

      <form onSubmit={handleSubmit} noValidate>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            <Card>
              <CardContent className="p-6 space-y-6">
                <div>
                  <h5 className="text-lg font-semibold text-amber-600 flex items-center gap-2 mb-4">
                    <MapPin className="h-5 w-5" /> Informations générales
                  </h5>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormInput
                      label="Nom"
                      name="nom"
                      value={formData.nom}
                      onChange={handleChange}
                      required
                      error={errors.nom}
                      icon={<Box className="h-4 w-4" />}
                      placeholder="Entrepôt principal"
                    />
                    <FormInput
                      label="Code"
                      name="code"
                      value={formData.code}
                      onChange={handleChange}
                      error={errors.code}
                      icon={<Hash className="h-4 w-4" />}
                      placeholder="WH-MAIN"
                    />
                  </div>
                </div>

                <div>
                  <FormTextarea
                    label="Description"
                    name="description"
                    value={formData.description}
                    onChange={handleChange}
                    error={errors.description}
                    rows={3}
                    placeholder="Description de l'emplacement..."
                  />
                </div>

                <div>
                  <h5 className="text-lg font-semibold text-amber-600 flex items-center gap-2 mb-4">
                    <Layers className="h-5 w-5" /> Configuration
                  </h5>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormSelect
                      label="Usage"
                      name="usage"
                      value={formData.usage}
                      onChange={(e) => handleSelectChange("usage", e.target.value)}
                      options={usageOptions}
                      required
                      icon={<Warehouse className="h-4 w-4" />}
                    />
                    <FormSelect
                      label="Type"
                      name="type"
                      value={formData.type}
                      onChange={(e) => handleSelectChange("type", e.target.value)}
                      options={typeOptions}
                      required
                      icon={<Shield className="h-4 w-4" />}
                    />
                  </div>
                </div>

                <div>
                  <h5 className="text-lg font-semibold text-amber-600 flex items-center gap-2 mb-4">
                    <Scan className="h-5 w-5" /> Code-barres
                  </h5>
                  <div className="relative">
                    <FormInput
                      label="Code-barres"
                      name="code_barres"
                      value={formData.code_barres}
                      onChange={handleChange}
                      error={errors.code_barres}
                      placeholder="Scanner ou saisir un code-barres"
                    />
                    <button
                      type="button"
                      onClick={() => setScannerOpen(true)}
                      className="absolute right-2 top-7 p-1.5 rounded-lg text-gray-400 hover:text-amber-600 hover:bg-amber-50 transition-colors"
                      title="Scanner un code-barres"
                    >
                      <Scan className="h-4 w-4" />
                    </button>
                  </div>
                  <BarcodeScannerModal
                    open={scannerOpen}
                    onOpenChange={setScannerOpen}
                    onScan={(value) => {
                      setFormData((prev) => ({ ...prev, code_barres: value }));
                    }}
                  />
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="lg:col-span-1 space-y-6">
            <Card className="sticky top-6">
              <CardContent className="p-6 space-y-4">
                <h5 className="text-lg font-semibold text-amber-600 flex items-center gap-2">
                  <Package className="h-5 w-5" /> Hiérarchie & Capacité
                </h5>

                <FormSelect
                  label="Emplacement parent"
                  name="emplacement_parent_id"
                  value={formData.emplacement_parent_id}
                  onChange={(e) => handleSelectChange("emplacement_parent_id", e.target.value)}
                  options={parentOptions}
                  icon={<Layers className="h-4 w-4" />}
                  placeholder="Aucun (racine)"
                />

                <FormInput
                  label="Capacité maximale"
                  name="capacite_maximale"
                  type="number"
                  value={formData.capacite_maximale}
                  onChange={handleChange}
                  error={errors.capacite_maximale}
                  icon={<Ruler className="h-4 w-4" />}
                  placeholder="Ex: 1000"
                  min="0"
                />

                <div className="pt-4 border-t">
                  <Button
                    type="submit"
                    className="w-full bg-amber-600 hover:bg-amber-700"
                    disabled={mutation.isPending || isSubmitting}
                  >
                    {mutation.isPending || isSubmitting ? (
                      <>
                        <Loader2 className="h-4 w-4 animate-spin mr-2" />
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

export default EmplacementForm;
