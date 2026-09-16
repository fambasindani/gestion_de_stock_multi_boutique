"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { FormInput } from "@/components/common/FormInput";
import { FormSelect } from "@/components/common/FormSelect";
import { FormTextarea } from "@/components/common/FormTextarea";
import { FormCheckbox } from "@/components/common/FormCheckbox";
import { partenairesService } from "@/lib/api/services/partenaires.service";
import {
  FaUser,
  FaBuilding,
  FaPhone,
  FaEnvelope,
  FaMapMarkerAlt,
  FaIdCard,
  FaGlobe,
  FaFileAlt,
  FaArrowLeft,
  FaSave,
  FaUserTag,
  FaRegBuilding,
  FaSpinner,
} from "react-icons/fa";

interface PartenaireFormProps {
  id?: number;
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

  // ✅ Mutation avec gestion d'erreurs améliorée
  const mutation = useMutation({
    mutationFn: async (data: any) => {
      setIsSubmitting(true);
      if (isEditMode && id) {
        return partenairesService.update(id, data);
      }
      return partenairesService.create(data);
    },
    onSuccess: (data) => {
      setIsSubmitting(false);
      console.log("✅ Mutation réussie:", data);
      
      // ✅ Vérifier si la réponse est un succès
      if (data?.success === false) {
        console.log("⚠️ La réponse indique une erreur:", data);
        
        // ✅ Récupérer les erreurs même en cas de success: false
        if (data.errors) {
          const newErrors: Record<string, string> = {};
          const errs = data.errors;
          Object.keys(errs).forEach((key) => {
            const messages = errs[key]!;
            newErrors[key] = Array.isArray(messages) ? messages[0] : messages;
          });
          console.log("📝 Erreurs assignées (onSuccess):", newErrors);
          setErrors(newErrors);
          toast.error("Veuillez corriger les erreurs dans le formulaire");
        } else if (data.message) {
          toast.error(data.message);
        }
        return;
      }
      
      // ✅ Si tout est bon, afficher le succès
      toast.success(isEditMode ? "Partenaire mis à jour" : "Partenaire créé");
      queryClient.invalidateQueries({ queryKey: ["partenaires"] });
      router.push("/dashboard/partenaires");
    },
    onError: (error: any) => {
      setIsSubmitting(false);
      console.error("❌ Erreur mutation:", error);
      console.error("❌ Response:", error?.response);
      console.error("❌ Data:", error?.response?.data);
      console.error("❌ Errors:", error?.response?.data?.errors);
      
      // ✅ Récupérer les erreurs du backend
      if (error?.response?.data?.errors) {
        const newErrors: Record<string, string> = {};
        Object.keys(error.response.data.errors).forEach((key) => {
          const messages = error.response.data.errors[key];
          // ✅ Prendre le premier message
          newErrors[key] = Array.isArray(messages) ? messages[0] : messages;
        });
        console.log("📝 Erreurs assignées (onError):", newErrors);
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

    // ✅ Effacer l'erreur quand l'utilisateur tape
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

    if (type === "checkbox") {
      const checked = (e.target as HTMLInputElement).checked;
      setFormData((prev) => ({ ...prev, [name]: checked }));
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
    const numValue = name === "actif" || name === "delai_paiement" ? Number(value) : value;
    setFormData((prev) => ({ ...prev, [name]: numValue }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // ✅ Nettoyer les erreurs avant soumission
    setErrors({});

    const dataToSend = {
      ...formData,
      remise: Number(formData.remise),
      delai_paiement: Number(formData.delai_paiement),
      actif: Number(formData.actif),
    };

    console.log("📤 Envoi des données:", dataToSend);
    mutation.mutate(dataToSend);
  };

  // ✅ Debug: afficher les erreurs
  console.log("🔍 Erreurs actuelles:", errors);

  if (initialLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px]">
        <FaSpinner className="h-8 w-8 animate-spin text-blue-600" />
        <p className="mt-4 text-gray-500">Chargement...</p>
      </div>
    );
  }

  return (
    <div className="p-4 md:p-6">
      <div className="flex items-center gap-4 mb-6">
        <Button
          variant="ghost"
          onClick={() => router.push("/dashboard/partenaires")}
          className="flex items-center gap-2 text-gray-600 hover:text-blue-600"
        >
          <FaArrowLeft /> Retour
        </Button>
        <h1 className="text-2xl font-bold text-gray-800 dark:text-white">
          {isEditMode ? "Modifier le partenaire" : "Nouveau partenaire"}
        </h1>
      </div>

      <form onSubmit={handleSubmit} noValidate>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            <Card>
              <CardContent className="p-6 space-y-6">
                {/* Type de partenaire */}
                <div>
                  <h5 className="text-lg font-semibold text-blue-600 flex items-center gap-2 mb-4">
                    <FaUserTag /> Type de partenaire
                  </h5>
                  <div className="grid grid-cols-2 gap-4">
                    <FormCheckbox
                      label="Client"
                      name="est_client"
                      checked={formData.est_client}
                      onChange={handleChange}
                    />
                    <FormCheckbox
                      label="Fournisseur"
                      name="est_fournisseur"
                      checked={formData.est_fournisseur}
                      onChange={handleChange}
                    />
                  </div>
                </div>

                {/* Informations générales */}
                <div>
                  <h5 className="text-lg font-semibold text-blue-600 flex items-center gap-2 mb-4">
                    <FaBuilding /> Informations générales
                  </h5>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormInput
                      label="Nom"
                      name="nom"
                      value={formData.nom}
                      onChange={handleChange}
                      required
                      error={errors.nom}
                      icon={<FaUser />}
                      placeholder="Nom de l'entreprise"
                    />
                    <FormInput
                      label="Code"
                      name="code"
                      value={formData.code}
                      onChange={handleChange}
                      error={errors.code}
                      icon={<FaIdCard />}
                      placeholder="CLI-001"
                    />
                  </div>
                </div>

                {/* Contact */}
                <div>
                  <h5 className="text-lg font-semibold text-blue-600 flex items-center gap-2 mb-4">
                    <FaPhone /> Contact
                  </h5>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormInput
                      label="Téléphone"
                      name="telephone"
                      value={formData.telephone}
                      onChange={handleChange}
                      required
                      error={errors.telephone}
                      icon={<FaPhone />}
                      placeholder="01 23 45 67 89"
                    />
                    <FormInput
                      label="Mobile"
                      name="mobile"
                      value={formData.mobile}
                      onChange={handleChange}
                      error={errors.mobile}
                      icon={<FaPhone />}
                      placeholder="06 12 34 56 78"
                    />
                    <FormInput
                      label="Email"
                      name="email"
                      type="email"
                      value={formData.email}
                      onChange={handleChange}
                      required
                      error={errors.email}
                      icon={<FaEnvelope />}
                      placeholder="contact@entreprise.com"
                    />
                    <FormInput
                      label="Site web"
                      name="site_web"
                      value={formData.site_web}
                      onChange={handleChange}
                      error={errors.site_web}
                      icon={<FaGlobe />}
                      placeholder="https://www.entreprise.com"
                    />
                  </div>
                </div>

                {/* Adresse */}
                <div>
                  <h5 className="text-lg font-semibold text-blue-600 flex items-center gap-2 mb-4">
                    <FaMapMarkerAlt /> Adresse
                  </h5>
                  <div className="grid grid-cols-1 gap-4">
                    <FormInput
                      label="Adresse"
                      name="adresse"
                      value={formData.adresse}
                      onChange={handleChange}
                      required
                      error={errors.adresse}
                      icon={<FaMapMarkerAlt />}
                      placeholder="123 rue de la Paix"
                    />
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <FormInput
                        label="Ville"
                        name="ville"
                        value={formData.ville}
                        onChange={handleChange}
                        required
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
                          { value: "Autre", label: "Autre" },
                        ]}
                      />
                    </div>
                  </div>
                </div>

                {/* Informations fiscales */}
                <div>
                  <h5 className="text-lg font-semibold text-blue-600 flex items-center gap-2 mb-4">
                    <FaRegBuilding /> Informations fiscales
                  </h5>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
                </div>

                {/* Notes */}
                <div>
                  <h5 className="text-lg font-semibold text-blue-600 flex items-center gap-2 mb-4">
                    <FaFileAlt /> Notes
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
              <CardContent className="p-6 space-y-4">
                <h5 className="text-lg font-semibold text-blue-600 flex items-center gap-2">
                  <FaFileAlt /> Configuration
                </h5>

                <FormInput
                  label="Remise (%)"
                  name="remise"
                  type="number"
                  value={formData.remise}
                  onChange={handleChange}
                  error={errors.remise}
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

                <div className="pt-4 border-t">
                  <Button
                    type="submit"
                    className="w-full bg-blue-600 hover:bg-blue-700"
                    disabled={mutation.isPending || isSubmitting}
                  >
                    {mutation.isPending || isSubmitting ? (
                      <>
                        <FaSpinner className="h-4 w-4 animate-spin mr-2" />
                        En cours...
                      </>
                    ) : (
                      <>
                        <FaSave className="mr-2" />
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

export default PartenaireForm;