"use client";

import { useEffect, useRef, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { PageHeader } from "@/components/ui/PageHeader";
import { FormInput } from "@/components/common/FormInput";
import { Settings, Save, Loader2, Percent, Image as ImageIcon, Upload, Trash2 } from "lucide-react";
import { parametresService } from "@/lib/api/services/parametres.service";
import { societesService } from "@/lib/api/services/societes.service";
import { setDevise } from "@/lib/utils/currency";
import { resolveLogoUrl } from "@/lib/utils/assets";
import { useAuth } from "@/hooks/useAuth";

export default function ParametresPage() {
  const queryClient = useQueryClient();
  const { societe } = useAuth();
  const { data: params, isLoading } = useQuery({
    queryKey: ["parametres"],
    queryFn: async () => (await parametresService.getAll()).data ?? {},
  });

  const [form, setForm] = useState({
    tva_taux: "16",
    devise: "CDF",
    entreprise_nom: "",
    entreprise_adresse: "",
    entreprise_telephone: "",
    ticket_message: "",
  });

  const logoInputRef = useRef<HTMLInputElement>(null);
  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [logoPreview, setLogoPreview] = useState<string | null>(null);

  const currentLogoUrl = resolveLogoUrl(societe);

  const uploadLogoMutation = useMutation({
    mutationFn: (file: File) => societesService.uploadMonLogo(file),
    onSuccess: (res) => {
      if (!res.success) {
        toast.error(res.message || "Erreur lors de l'enregistrement du logo");
        return;
      }
      toast.success("Logo mis à jour");
      setLogoFile(null);
      setLogoPreview(null);
      if (logoInputRef.current) logoInputRef.current.value = "";
      queryClient.invalidateQueries({ queryKey: ["currentUser"] });
    },
    onError: () => toast.error("Erreur lors de l'enregistrement du logo"),
  });

  const removeLogoMutation = useMutation({
    mutationFn: () => societesService.supprimerMonLogo(),
    onSuccess: (res) => {
      if (!res.success) {
        toast.error(res.message || "Erreur lors de la suppression");
        return;
      }
      toast.success("Logo supprimé");
      setLogoFile(null);
      setLogoPreview(null);
      queryClient.invalidateQueries({ queryKey: ["currentUser"] });
    },
    onError: () => toast.error("Erreur lors de la suppression du logo"),
  });

  const handleLogoPick = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] ?? null;
    setLogoFile(file);
    setLogoPreview(file ? URL.createObjectURL(file) : null);
  };

  useEffect(() => {
    if (params) {
      setDevise(params.devise);
      setForm({
        tva_taux: params.tva_taux ?? "16",
        devise: params.devise ?? "CDF",
        entreprise_nom: params.entreprise_nom ?? "",
        entreprise_adresse: params.entreprise_adresse ?? "",
        entreprise_telephone: params.entreprise_telephone ?? "",
        ticket_message: params.ticket_message ?? "",
      });
    }
  }, [params]);

  const saveMutation = useMutation({
    mutationFn: () => parametresService.update(form),
    onSuccess: (res) => {
      if (!res.success) {
        toast.error(res.message || "Erreur");
        return;
      }
      setDevise(form.devise);
      toast.success("Paramètres enregistrés");
      queryClient.invalidateQueries({ queryKey: ["parametres"] });
    },
    onError: () => toast.error("Erreur lors de l'enregistrement"),
  });

  if (isLoading) {
    return (
      <div className="flex min-h-[300px] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
      </div>
    );
  }

  return (
    <div className="space-y-5">
      <PageHeader
        title="Paramètres"
        description={`TVA, informations et ticket — boutiques : ${societe?.nom ?? "—"}`}
        icon={<Settings className="h-5 w-5" />}
        actions={
          <Button onClick={() => saveMutation.mutate()} disabled={saveMutation.isPending}>
            {saveMutation.isPending ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <Save className="mr-2 h-4 w-4" />
            )}
            Enregistrer
          </Button>
        }
      />

      <div className="grid gap-5 lg:grid-cols-2">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <ImageIcon className="h-4 w-4 text-blue-600" /> Logo de la boutique
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex flex-wrap items-center gap-5">
              <div className="flex h-24 w-24 items-center justify-center overflow-hidden rounded-2xl border border-slate-200 bg-slate-50 dark:border-slate-700 dark:bg-slate-800/50">
                {logoPreview || currentLogoUrl ? (
                  <img
                    src={logoPreview ?? currentLogoUrl ?? ""}
                    alt="Logo"
                    className="h-full w-full object-contain"
                  />
                ) : (
                  <ImageIcon className="h-9 w-9 text-slate-300" />
                )}
              </div>
              <div className="space-y-2">
                <input
                  ref={logoInputRef}
                  type="file"
                  accept="image/png,image/jpeg,image/webp,image/svg+xml"
                  className="hidden"
                  onChange={handleLogoPick}
                />
                <div className="flex flex-wrap items-center gap-2">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => logoInputRef.current?.click()}
                  >
                    <Upload className="mr-2 h-4 w-4" /> Choisir une image
                  </Button>
                  {logoFile && (
                    <Button
                      type="button"
                      onClick={() => uploadLogoMutation.mutate(logoFile)}
                      disabled={uploadLogoMutation.isPending}
                      className="bg-blue-600 hover:bg-blue-700"
                    >
                      {uploadLogoMutation.isPending ? (
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      ) : (
                        <Save className="mr-2 h-4 w-4" />
                      )}
                      Enregistrer le logo
                    </Button>
                  )}
                  {societe?.logo && !logoFile && (
                    <Button
                      type="button"
                      variant="ghost"
                      className="text-red-600 hover:bg-red-50 hover:text-red-700 dark:hover:bg-red-950/30"
                      onClick={() => removeLogoMutation.mutate()}
                      disabled={removeLogoMutation.isPending}
                    >
                      {removeLogoMutation.isPending ? (
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      ) : (
                        <Trash2 className="mr-2 h-4 w-4" />
                      )}
                      Supprimer
                    </Button>
                  )}
                </div>
                <p className="text-xs text-slate-400 dark:text-slate-500">
                  PNG, JPG, WEBP ou SVG — 2 Mo max. Affiché dans le menu, les tickets et les factures.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <Percent className="h-4 w-4 text-blue-600" /> TVA
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <FormInput
              label="Taux de TVA par défaut (%)"
              name="tva_taux"
              type="number"
              min="0"
              step="0.01"
              value={form.tva_taux}
              onChange={(e) => setForm({ ...form, tva_taux: e.target.value })}
            />
            <FormInput
              label="Devise (affichage)"
              name="devise"
              value={form.devise}
              onChange={(e) => setForm({ ...form, devise: e.target.value })}
              placeholder="CDF, EUR, USD..."
            />
            <p className="text-xs text-slate-400">
              Utilisé par défaut sur les ventes comptoir. Il reste modifiable ligne par ligne.
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <Settings className="h-4 w-4 text-blue-600" /> Informations société (ticket)
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <FormInput
              label="Nom affiché"
              name="entreprise_nom"
              value={form.entreprise_nom}
              onChange={(e) => setForm({ ...form, entreprise_nom: e.target.value })}
              placeholder="Laisser vide pour le nom de la société"
            />
            <FormInput
              label="Adresse"
              name="entreprise_adresse"
              value={form.entreprise_adresse}
              onChange={(e) => setForm({ ...form, entreprise_adresse: e.target.value })}
            />
            <FormInput
              label="Téléphone"
              name="entreprise_telephone"
              value={form.entreprise_telephone}
              onChange={(e) => setForm({ ...form, entreprise_telephone: e.target.value })}
            />
            <div>
              <label className="mb-1.5 block text-sm font-medium text-slate-700 dark:text-slate-300">
                Message bas de ticket
              </label>
              <textarea
                value={form.ticket_message}
                onChange={(e) => setForm({ ...form, ticket_message: e.target.value })}
                rows={3}
                className="w-full rounded-lg border border-slate-200 bg-white px-3.5 py-2 text-sm shadow-sm transition-all focus:border-blue-500 focus:outline-none focus:ring-4 focus:ring-blue-500/10 dark:border-slate-700 dark:bg-slate-900"
              />
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
