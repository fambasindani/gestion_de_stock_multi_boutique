"use client";

import React, { useState, Suspense, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { FormInput } from "@/components/common/FormInput";
import { FormCheckbox } from "@/components/common/FormCheckbox";
import { utilisateursService } from "@/lib/api/services/utilisateurs.service";
import { rolesService } from "@/lib/api/services/roles.service";
import { Role } from "@/lib/api/typess";
import { ArrowLeft, Save, Loader2, User, Shield } from "lucide-react";

export default function NouvelUtilisateurPageWrapper() {
  return (
    <Suspense fallback={<div className="p-8 text-center text-gray-500">Chargement...</div>}>
      <NouvelUtilisateurPage />
    </Suspense>
  );
}

function NouvelUtilisateurPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const queryClient = useQueryClient();
  const editId = searchParams.get("id");
  const isEditMode = !!editId;

  const [formData, setFormData] = useState({
    nom: "",
    email: "",
    mot_de_passe: "",
    telephone: "",
    actif: true,
  });

  const [selectedRoles, setSelectedRoles] = useState<number[]>([]);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [initialLoading, setInitialLoading] = useState(isEditMode);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { data: rolesList } = useQuery({
    queryKey: ["roles-list"],
    queryFn: async () => {
      const response = await rolesService.getAll({ assignables: true });
      const roles = response.data;
      return Array.isArray(roles) ? roles : (roles as any)?.data ?? [];
    },
    staleTime: 5 * 60 * 1000,
  });

  useEffect(() => {
    const loadUtilisateur = async () => {
      if (!editId) return;
      try {
        setInitialLoading(true);
        const response = await utilisateursService.getById(Number(editId));
        const data = (response as any)?.data ?? response;
        if (data) {
          setFormData({
            nom: data.nom || "",
            email: data.email || "",
            mot_de_passe: "",
            telephone: data.telephone || "",
            actif: Number(data.actif) === 1,
          });
          if (data.roles) {
            setSelectedRoles(data.roles.map((r: any) => r.id));
          }
        }
      } catch (error) {
        toast.error("Erreur lors du chargement");
        router.push("/dashboard/utilisateurs");
      } finally {
        setInitialLoading(false);
      }
    };
    if (isEditMode) loadUtilisateur();
  }, [editId, isEditMode, router]);

  const mutation = useMutation({
    mutationFn: async (data: any) => {
      setIsSubmitting(true);
      if (isEditMode && editId) {
        const response = await utilisateursService.update(Number(editId), data);
        if (response.success && selectedRoles.length > 0) {
          await utilisateursService.assignerRoles(Number(editId), selectedRoles);
        }
        return response;
      }
      const response = await utilisateursService.create(data);
      if (response.success && response.data && selectedRoles.length > 0) {
        await utilisateursService.assignerRoles(response.data.id, selectedRoles);
      }
      return response;
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
      toast.success(isEditMode ? "Utilisateur mis à jour" : "Utilisateur créé");
      queryClient.invalidateQueries({ queryKey: ["utilisateurs"] });
      router.push("/dashboard/utilisateurs");
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

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target;
    if (errors[name]) {
      setErrors((prev) => { const n = { ...prev }; delete n[name]; return n; });
    }
    if (type === "checkbox") {
      setFormData((prev) => ({ ...prev, [name]: checked }));
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }));
    }
  };

  const toggleRole = (roleId: number) => {
    setSelectedRoles((prev) =>
      prev.includes(roleId) ? prev.filter((id) => id !== roleId) : [...prev, roleId]
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});

    const dataToSend: any = {
      nom: formData.nom,
      email: formData.email,
      telephone: formData.telephone || null,
      actif: formData.actif,
    };

    if (formData.mot_de_passe) {
      dataToSend.mot_de_passe = formData.mot_de_passe;
    }

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
        <Button variant="ghost" onClick={() => router.push("/dashboard/utilisateurs")} className="flex items-center gap-2 text-gray-600 hover:text-blue-600">
          <ArrowLeft /> Retour
        </Button>
        <h1 className="text-2xl font-bold text-gray-800 dark:text-white">
          {isEditMode ? "Modifier l'utilisateur" : "Nouvel utilisateur"}
        </h1>
      </div>

      <form onSubmit={handleSubmit} noValidate>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            <Card>
              <CardContent className="p-6 space-y-6">
                <div>
                  <h5 className="text-lg font-semibold text-blue-600 flex items-center gap-2 mb-4">
                    <User /> Informations générales
                  </h5>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormInput
                      label="Nom"
                      name="nom"
                      value={formData.nom}
                      onChange={handleChange}
                      required
                      error={errors.nom}
                      placeholder="Nom complet"
                    />
                    <FormInput
                      label="Email"
                      name="email"
                      type="email"
                      value={formData.email}
                      onChange={handleChange}
                      required
                      error={errors.email}
                      placeholder="email@exemple.com"
                    />
                    <FormInput
                      label={isEditMode ? "Nouveau mot de passe (laisser vide pour conserver)" : "Mot de passe"}
                      name="mot_de_passe"
                      type="password"
                      value={formData.mot_de_passe}
                      onChange={handleChange}
                      required={!isEditMode}
                      error={errors.mot_de_passe}
                      placeholder="••••••••"
                    />
                    <FormInput
                      label="Téléphone"
                      name="telephone"
                      value={formData.telephone}
                      onChange={handleChange}
                      error={errors.telephone}
                      placeholder="01 23 45 67 89"
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="lg:col-span-1">
            <Card className="sticky top-6">
              <CardContent className="p-6 space-y-4">
                <h5 className="text-lg font-semibold text-blue-600 flex items-center gap-2">
                  <Shield /> Configuration
                </h5>

                <FormCheckbox
                  label="Compte actif"
                  name="actif"
                  checked={formData.actif}
                  onChange={handleChange}
                />

                {rolesList && rolesList.length > 0 && (
                  <div className="space-y-2 pt-2 border-t">
                    <p className="text-sm font-medium text-gray-700 dark:text-gray-300">Rôles</p>
                    {rolesList.map((role: Role) => (
                      <FormCheckbox
                        key={role.id}
                        label={role.nom}
                        name={`role_${role.id}`}
                        checked={selectedRoles.includes(role.id)}
                        onChange={() => toggleRole(role.id)}
                      />
                    ))}
                  </div>
                )}

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
