"use client";

import React, { useState, Suspense, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { FormInput } from "@/components/common/FormInput";
import { FormTextarea } from "@/components/common/FormTextarea";
import { FormCheckbox } from "@/components/common/FormCheckbox";
import { rolesService } from "@/lib/api/services/roles.service";
import { permissionsService } from "@/lib/api/services/permissions.service";
import { Permission } from "@/lib/api/typess";
import { ArrowLeft, Save, Loader2, Shield, Key } from "lucide-react";

export default function NouveauRolePageWrapper() {
  return (
    <Suspense fallback={<div className="p-8 text-center text-gray-500">Chargement...</div>}>
      <NouveauRolePage />
    </Suspense>
  );
}

function NouveauRolePage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const queryClient = useQueryClient();
  const editId = searchParams.get("id");
  const isEditMode = !!editId;

  const [formData, setFormData] = useState({
    nom: "",
    description: "",
    actif: true,
  });

  const [selectedPermissions, setSelectedPermissions] = useState<number[]>([]);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [initialLoading, setInitialLoading] = useState(isEditMode);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { data: permissionsList } = useQuery({
    queryKey: ["permissions-list"],
    queryFn: async () => {
      const response = await permissionsService.getAll();
      const perms = response.data;
      return Array.isArray(perms) ? perms : (perms as any)?.data ?? [];
    },
    staleTime: 5 * 60 * 1000,
  });

  useEffect(() => {
    const loadRole = async () => {
      if (!editId) return;
      try {
        setInitialLoading(true);
        const response = await rolesService.getById(Number(editId));
        const data = (response as any)?.data ?? response;
        if (data) {
          setFormData({
            nom: data.nom || "",
            description: data.description || "",
            actif: data.actif === 1,
          });
          if (data.permissions) {
            setSelectedPermissions(data.permissions.map((p: any) => p.id));
          }
        }
      } catch (error) {
        toast.error("Erreur lors du chargement");
        router.push("/dashboard/utilisateurs/roles");
      } finally {
        setInitialLoading(false);
      }
    };
    if (isEditMode) loadRole();
  }, [editId, isEditMode, router]);

  const mutation = useMutation({
    mutationFn: async (data: any) => {
      setIsSubmitting(true);
      if (isEditMode && editId) {
        return rolesService.update(Number(editId), { ...data, permissions: selectedPermissions });
      }
      return rolesService.create({ ...data, permissions: selectedPermissions });
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
      toast.success(isEditMode ? "Rôle mis à jour" : "Rôle créé");
      queryClient.invalidateQueries({ queryKey: ["roles"] });
      router.push("/dashboard/utilisateurs/roles");
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
    const { name, value, type } = e.target;
    if (type === "checkbox") {
      setFormData((prev) => ({ ...prev, [name]: (e.target as HTMLInputElement).checked }));
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }));
    }
  };

  const togglePermission = (permId: number) => {
    setSelectedPermissions((prev) =>
      prev.includes(permId) ? prev.filter((id) => id !== permId) : [...prev, permId]
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});
    mutation.mutate(formData);
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
        <Button variant="ghost" onClick={() => router.push("/dashboard/utilisateurs/roles")} className="flex items-center gap-2 text-gray-600 hover:text-blue-600">
          <ArrowLeft /> Retour
        </Button>
        <h1 className="text-2xl font-bold text-gray-800 dark:text-white">
          {isEditMode ? "Modifier le rôle" : "Nouveau rôle"}
        </h1>
      </div>

      <form onSubmit={handleSubmit} noValidate>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            <Card>
              <CardContent className="p-6 space-y-6">
                <div>
                  <h5 className="text-lg font-semibold text-blue-600 flex items-center gap-2 mb-4">
                    <Shield /> Informations
                  </h5>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormInput
                      label="Nom"
                      name="nom"
                      value={formData.nom}
                      onChange={handleChange}
                      required
                      error={errors.nom}
                      placeholder="Nom du rôle"
                    />
                    <FormInput
                      label="Description"
                      name="description"
                      value={formData.description}
                      onChange={handleChange}
                      error={errors.description}
                      placeholder="Description du rôle"
                    />
                  </div>
                </div>
              </CardContent>
            </Card>

            {permissionsList && permissionsList.length > 0 && (
              <Card>
                <CardContent className="p-6">
                  <h5 className="text-lg font-semibold text-blue-600 flex items-center gap-2 mb-4">
                    <Key /> Permissions
                  </h5>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2">
                    {permissionsList.map((perm: Permission) => (
                      <FormCheckbox
                        key={perm.id}
                        label={perm.nom}
                        name={`perm_${perm.id}`}
                        checked={selectedPermissions.includes(perm.id)}
                        onChange={() => togglePermission(perm.id)}
                      />
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}
          </div>

          <div className="lg:col-span-1">
            <Card className="sticky top-6">
              <CardContent className="p-6 space-y-4">
                <h5 className="text-lg font-semibold text-blue-600 flex items-center gap-2">
                  <Shield /> Statut
                </h5>

                <FormCheckbox
                  label="Rôle actif"
                  name="actif"
                  checked={formData.actif}
                  onChange={handleChange}
                />

                <div className="pt-4 border-t">
                  <Button
                    type="submit"
                    className="w-full bg-blue-600 hover:bg-blue-700"
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
