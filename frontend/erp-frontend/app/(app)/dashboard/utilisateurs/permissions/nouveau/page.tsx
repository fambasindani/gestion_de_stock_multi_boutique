"use client";

import React, { useState, Suspense, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { FormInput } from "@/components/common/FormInput";
import { FormTextarea } from "@/components/common/FormTextarea";
import { permissionsService } from "@/lib/api/services/permissions.service";
import { ArrowLeft, Save, Loader2, Key } from "lucide-react";

export default function NouvellePermissionPageWrapper() {
  return (
    <Suspense fallback={<div className="p-8 text-center text-gray-500">Chargement...</div>}>
      <NouvellePermissionPage />
    </Suspense>
  );
}

function NouvellePermissionPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const queryClient = useQueryClient();
  const editId = searchParams.get("id");
  const isEditMode = !!editId;

  const [formData, setFormData] = useState({
    nom: "",
    garde: "",
    description: "",
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [initialLoading, setInitialLoading] = useState(isEditMode);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    const loadPermission = async () => {
      if (!editId) return;
      try {
        setInitialLoading(true);
        const response = await permissionsService.getById(Number(editId));
        const data = (response as any)?.data ?? response;
        if (data) {
          setFormData({
            nom: data.nom || "",
            garde: data.garde || "",
            description: data.description || "",
          });
        }
      } catch (error) {
        toast.error("Erreur lors du chargement");
        router.push("/dashboard/utilisateurs/permissions");
      } finally {
        setInitialLoading(false);
      }
    };
    if (isEditMode) loadPermission();
  }, [editId, isEditMode, router]);

  const mutation = useMutation({
    mutationFn: async (data: any) => {
      setIsSubmitting(true);
      if (isEditMode && editId) {
        return permissionsService.update(Number(editId), data);
      }
      return permissionsService.create(data);
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
          toast.error("Veuillez corriger les erreurs");
        } else if (data.message) {
          toast.error(data.message);
        }
        return;
      }
      toast.success(isEditMode ? "Permission mise à jour" : "Permission créée");
      queryClient.invalidateQueries({ queryKey: ["permissions"] });
      router.push("/dashboard/utilisateurs/permissions");
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
        toast.error("Veuillez corriger les erreurs");
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});
    const dataToSend: any = { nom: formData.nom };
    if (formData.garde) dataToSend.garde = formData.garde;
    if (formData.description) dataToSend.description = formData.description;
    mutation.mutate(dataToSend);
  };

  if (initialLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin text-amber-600" />
        <p className="mt-4 text-gray-500">Chargement...</p>
      </div>
    );
  }

  return (
    <div className="p-4 md:p-6">
      <div className="flex items-center gap-4 mb-6">
        <Button variant="ghost" onClick={() => router.push("/dashboard/utilisateurs/permissions")} className="flex items-center gap-2 text-gray-600 hover:text-amber-600">
          <ArrowLeft /> Retour
        </Button>
        <h1 className="text-2xl font-bold text-gray-800 dark:text-white">
          {isEditMode ? "Modifier la permission" : "Nouvelle permission"}
        </h1>
      </div>

      <form onSubmit={handleSubmit} noValidate>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            <Card>
              <CardContent className="p-6 space-y-6">
                <div>
                  <h5 className="text-lg font-semibold text-amber-600 flex items-center gap-2 mb-4">
                    <Key /> Informations
                  </h5>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormInput
                      label="Nom"
                      name="nom"
                      value={formData.nom}
                      onChange={handleChange}
                      required
                      error={errors.nom}
                      placeholder="Ex: gerer_achats"
                    />
                    <FormInput
                      label="Garde"
                      name="garde"
                      value={formData.garde}
                      onChange={handleChange}
                      error={errors.garde}
                      placeholder="Ex: web, api"
                    />
                  </div>
                  <div className="mt-4">
                    <FormTextarea
                      label="Description"
                      name="description"
                      value={formData.description}
                      onChange={handleChange}
                      error={errors.description}
                      placeholder="Description de la permission"
                      rows={3}
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="lg:col-span-1">
            <Card className="sticky top-6">
              <CardContent className="p-6 space-y-4">
                <h5 className="text-lg font-semibold text-amber-600 flex items-center gap-2">
                  <Key /> Actions
                </h5>
                <div className="pt-4 border-t">
                  <Button
                    type="submit"
                    className="w-full bg-amber-600 hover:bg-amber-700"
                    disabled={mutation.isPending || isSubmitting}
                  >
                    {mutation.isPending || isSubmitting ? (
                      <><Loader2 className="h-4 w-4 animate-spin mr-2" />En cours...</>
                    ) : (
                      <><Save className="mr-2" />{isEditMode ? "Mettre à jour" : "Créer"}</>
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
