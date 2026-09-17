"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { PageHeader } from "@/components/ui/PageHeader";
import { FormInput } from "@/components/common/FormInput";
import { FormSelect } from "@/components/common/FormSelect";
import { FormTextarea } from "@/components/common/FormTextarea";
import { partenairesService } from "@/lib/api/services/partenaires.service";
import {
  User,
  Building2,
  Phone,
  Mail,
  MapPin,
  Globe,
  FileText,
  Save,
  Loader2,
  Users,
  Store,
  Truck,
  Receipt,
  Percent,
  CalendarClock,
  ToggleLeft,
  Hash,
} from "lucide-react";

interface PartenaireFormProps {
  id?: number;
}

function SectionTitle({ icon, title }: { icon: React.ReactNode; title: string }) {
  return (
    <div className="mb-4 flex items-center gap-2.5">
      <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-50 text-blue-600 ring-1 ring-blue-100 dark:bg-blue-950/40 dark:text-blue-400 dark:ring-blue-900">
        {icon}
      </div>
      <h3 className="text-[13px] font-semibold uppercase tracking-wide text-slate-600 dark:text-slate-300">
        {title}
      </h3>
    </div>
  );
}

export function PartenaireForm({ id }: PartenaireFormProps) {
  const router = useRouter();
  const queryClient = useQueryClient();
  const isEditMode = !!id;

  const [formData, setFormData] = useState({
    nom: "",
    code: "",
    est_client: true,
    est_fournisseur: false,
    email: "",
    telephone: "",
    mobile: "",
    adresse: "",
    ville: "",
    code_postal: "",
    pays: "France",
    numero_tva: "",
    siret: "",
    site_web: "",
    notes: "",
    remise: 0,
    delai_paiement: 30,
    actif: 1,
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [initialLoading, setInitialLoading] = useState(isEditMode);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    const loadPartenaire = async () => {
      if (!id) return;
      try {
        setInitialLoading(true);
        const response = await partenairesService.getById(id);
        const data = response.data;
        if (data) {
          setFormData({
            nom: data.nom || "",
            code: data.code || "",
            est_client: data.est_client ?? true,
            est_fournisseur: data.est_fournisseur ?? false,
            email: data.email || "",
            telephone: data.telephone || "",
            mobile: data.mobile || "",
            adresse: data.adresse || "",
            ville: data.ville || "",
            code_postal: data.code_postal || "",
            pays: data.pays || "France",
            numero_tva: data.numero_tva || "",
            siret: data.siret || "",
            site_web: data.site_web || "",
            notes: data.notes || "",
            remise: data.remise ?? 0,
            delai_paiement: data.delai_paiement ?? 30,
            actif: data.actif ?? 1,
          });
        }
      } catch (error) {
        console.error("Erreur chargement partenaire:", error);
        toast.error("Erreur lors du chargement du partenaire");
        router.push("/dashboard/partenaires");
      } finally {
        setInitialLoading(false);
      }
    };

    if (isEditMode) loadPartenaire();
  }, [id, isEditMode, router]);

  const mutation = useMutation({
    mutationFn: async (data: any) => {
      setIsSubmitting(true);
      if (isEditMode && id) return partenairesService.update(id, data);
      return partenairesService.create(data);
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
      toast.success(isEditMode ? "Partenaire mis à jour" : "Partenaire créé");
      queryClient.invalidateQueries({ queryKey: ["partenaires"] });
      router.push("/dashboard/partenaires");
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

  const clearError = (name: string) => {
    if (errors[name]) {
      setErrors((prev) => {
        const next = { ...prev };
        delete next[name];
        return next;
      });
    }
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value, type } = e.target;
    clearError(name);

    if (type === "number") {
      setFormData((prev) => ({ ...prev, [name]: value === "" ? 0 : Number(value) }));
      return;
    }
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSelectChange = (name: string, value: string) => {
    clearError(name);
    const numValue =
      name === "actif" || name === "delai_paiement" ? Number(value) : value;
    setFormData((prev) => ({ ...prev, [name]: numValue }));
  };

  const toggleType = (field: "est_client" | "est_fournisseur") => {
    setFormData((prev) => ({ ...prev, [field]: !prev[field] }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});

    if (!formData.est_client && !formData.est_fournisseur) {
      toast.error("Choisissez au moins Client ou Fournisseur");
      return;
    }

    mutation.mutate({
      ...formData,
      remise: Number(formData.remise),
      delai_paiement: Number(formData.delai_paiement),
      actif: Number(formData.actif),
    });
  };

  if (initialLoading) {
    return (
      <div className="flex min-h-[400px] flex-col items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
        <p className="mt-4 text-sm text-slate-500">Chargement...</p>
      </div>
    );
  }

  const typeOptions = [
    {
      key: "est_client" as const,
      label: "Client",
      icon: Store,
      active: formData.est_client,
      color: "blue",
    },
    {
      key: "est_fournisseur" as const,
      label: "Fournisseur",
      icon: Truck,
      active: formData.est_fournisseur,
      color: "amber",
    },
  ];

  return (
    <div className="space-y-5">
      <PageHeader
        title={isEditMode ? "Modifier le partenaire" : "Nouveau partenaire"}
        description="Clients et fournisseurs — coordonnées, informations légales et conditions"
        icon={<Users className="h-5 w-5" />}
        onBack={() => router.push("/dashboard/partenaires")}
        actions={
          <>
            <Button
              type="button"
              variant="outline"
              onClick={() => router.push("/dashboard/partenaires")}
            >
              Annuler
            </Button>
            <Button
              type="submit"
              form="partenaire-form"
              disabled={mutation.isPending || isSubmitting}
            >
              {mutation.isPending || isSubmitting ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <Save className="mr-2 h-4 w-4" />
              )}
              {isEditMode ? "Mettre à jour" : "Créer le partenaire"}
            </Button>
          </>
        }
      />

      <form id="partenaire-form" onSubmit={handleSubmit} noValidate>
        <div className="grid grid-cols-1 gap-5 lg:grid-cols-3">
          <div className="space-y-5 lg:col-span-2">
            {/* Type */}
            <Card>
              <CardContent className="p-5">
                <SectionTitle icon={<Users className="h-4 w-4" />} title="Type de partenaire" />
                <div className="grid grid-cols-2 gap-3">
                  {typeOptions.map((t) => {
                    const Icon = t.icon;
                    return (
                      <button
                        key={t.key}
                        type="button"
                        onClick={() => toggleType(t.key)}
                        className={`flex items-center gap-3 rounded-xl border p-4 text-left transition-all ${
                          t.active
                            ? t.color === "blue"
                              ? "border-blue-300 bg-blue-50 ring-1 ring-blue-200 dark:border-blue-800 dark:bg-blue-950/30"
                              : "border-amber-300 bg-amber-50 ring-1 ring-amber-200 dark:border-amber-800 dark:bg-amber-950/30"
                            : "border-slate-200 bg-white hover:border-slate-300 dark:border-slate-700 dark:bg-slate-900 dark:hover:border-slate-600"
                        }`}
                      >
                        <span
                          className={`flex h-9 w-9 items-center justify-center rounded-lg ${
                            t.active
                              ? t.color === "blue"
                                ? "bg-blue-600 text-white"
                                : "bg-amber-500 text-white"
                              : "bg-slate-100 text-slate-500 dark:bg-slate-800"
                          }`}
                        >
                          <Icon className="h-4 w-4" />
                        </span>
                        <span>
                          <span className="block text-sm font-semibold text-slate-800 dark:text-slate-100">
                            {t.label}
                          </span>
                          <span className="block text-xs text-slate-400">
                            {t.active ? "Sélectionné" : "Cliquer pour activer"}
                          </span>
                        </span>
                      </button>
                    );
                  })}
                </div>
              </CardContent>
            </Card>

            {/* Général */}
            <Card>
              <CardContent className="p-5">
                <SectionTitle icon={<Building2 className="h-4 w-4" />} title="Informations générales" />
                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                  <FormInput
                    label="Nom"
                    name="nom"
                    value={formData.nom}
                    onChange={handleChange}
                    required
                    error={errors.nom}
                    icon={<User />}
                    placeholder="Nom de l'entreprise"
                  />
                  <FormInput
                    label="Code"
                    name="code"
                    value={formData.code}
                    onChange={handleChange}
                    error={errors.code}
                    icon={<Hash />}
                    placeholder="CLI-001"
                  />
                </div>
              </CardContent>
            </Card>

            {/* Contact */}
            <Card>
              <CardContent className="p-5">
                <SectionTitle icon={<Phone className="h-4 w-4" />} title="Contact" />
                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                  <FormInput
                    label="Téléphone"
                    name="telephone"
                    value={formData.telephone}
                    onChange={handleChange}
                    error={errors.telephone}
                    icon={<Phone />}
                    placeholder="01 23 45 67 89"
                  />
                  <FormInput
                    label="Mobile"
                    name="mobile"
                    value={formData.mobile}
                    onChange={handleChange}
                    error={errors.mobile}
                    icon={<Phone />}
                    placeholder="06 12 34 56 78"
                  />
                  <FormInput
                    label="Email"
                    name="email"
                    type="email"
                    value={formData.email}
                    onChange={handleChange}
                    error={errors.email}
                    icon={<Mail />}
                    placeholder="contact@entreprise.com"
                  />
                  <FormInput
                    label="Site web"
                    name="site_web"
                    value={formData.site_web}
                    onChange={handleChange}
                    error={errors.site_web}
                    icon={<Globe />}
                    placeholder="https://www.entreprise.com"
                  />
                </div>
              </CardContent>
            </Card>

            {/* Adresse */}
            <Card>
              <CardContent className="p-5">
                <SectionTitle icon={<MapPin className="h-4 w-4" />} title="Adresse" />
                <div className="grid grid-cols-1 gap-4">
                  <FormInput
                    label="Adresse"
                    name="adresse"
                    value={formData.adresse}
                    onChange={handleChange}
                    error={errors.adresse}
                    icon={<MapPin />}
                    placeholder="123 rue de la Paix"
                  />
                  <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                    <FormInput
                      label="Ville"
                      name="ville"
                      value={formData.ville}
                      onChange={handleChange}
                      error={errors.ville}
                      placeholder="Paris"
                    />
                    <FormInput
                      label="Code postal"
                      name="code_postal"
                      value={formData.code_postal}
                      onChange={handleChange}
                      error={errors.code_postal}
                      placeholder="75001"
                    />
                    <FormSelect
                      label="Pays"
                      name="pays"
                      value={formData.pays}
                      onChange={(e) => handleSelectChange("pays", e.target.value)}
                      options={[
                        { value: "France", label: "France" },
                        { value: "Belgique", label: "Belgique" },
                        { value: "Suisse", label: "Suisse" },
                        { value: "Canada", label: "Canada" },
                        { value: "RDC", label: "RDC" },
                        { value: "Autre", label: "Autre" },
                      ]}
                    />
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Fiscal */}
            <Card>
              <CardContent className="p-5">
                <SectionTitle icon={<Receipt className="h-4 w-4" />} title="Informations fiscales" />
                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                  <FormInput
                    label="Numéro TVA"
                    name="numero_tva"
                    value={formData.numero_tva}
                    onChange={handleChange}
                    error={errors.numero_tva}
                    placeholder="FR12345678901"
                  />
                  <FormInput
                    label="SIRET"
                    name="siret"
                    value={formData.siret}
                    onChange={handleChange}
                    error={errors.siret}
                    placeholder="12345678900012"
                  />
                </div>
              </CardContent>
            </Card>

            {/* Notes */}
            <Card>
              <CardContent className="p-5">
                <SectionTitle icon={<FileText className="h-4 w-4" />} title="Notes" />
                <FormTextarea
                  label=""
                  name="notes"
                  value={formData.notes}
                  onChange={handleChange}
                  error={errors.notes}
                  rows={4}
                  placeholder="Informations complémentaires..."
                />
              </CardContent>
            </Card>
          </div>

          {/* Colonne configuration */}
          <div className="lg:col-span-1">
            <Card className="sticky top-6">
              <CardContent className="space-y-5 p-5">
                <SectionTitle icon={<Percent className="h-4 w-4" />} title="Configuration" />

                <FormInput
                  label="Remise (%)"
                  name="remise"
                  type="number"
                  value={formData.remise}
                  onChange={handleChange}
                  error={errors.remise}
                  icon={<Percent />}
                  step="0.01"
                  min="0"
                  max="100"
                />

                <FormInput
                  label="Délai de paiement (jours)"
                  name="delai_paiement"
                  type="number"
                  value={formData.delai_paiement}
                  onChange={handleChange}
                  error={errors.delai_paiement}
                  icon={<CalendarClock />}
                  min="0"
                />

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

                <div className="rounded-xl bg-slate-50 p-3 text-xs text-slate-500 dark:bg-slate-900/60">
                  <p className="flex items-center gap-1.5">
                    <ToggleLeft className="h-3.5 w-3.5" />
                    Le type (Client / Fournisseur) se choisit à gauche.
                  </p>
                </div>

                <Button
                  type="submit"
                  form="partenaire-form"
                  className="w-full"
                  disabled={mutation.isPending || isSubmitting}
                >
                  {mutation.isPending || isSubmitting ? (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  ) : (
                    <Save className="mr-2 h-4 w-4" />
                  )}
                  {isEditMode ? "Mettre à jour" : "Créer le partenaire"}
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </form>
    </div>
  );
}

export default PartenaireForm;
