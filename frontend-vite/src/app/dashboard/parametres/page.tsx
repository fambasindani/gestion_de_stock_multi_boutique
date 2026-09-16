"use client";

import { useEffect, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { PageHeader } from "@/components/ui/PageHeader";
import { FormInput } from "@/components/common/FormInput";
import { Settings, Save, Loader2, Percent } from "lucide-react";
import { parametresService } from "@/lib/api/services/parametres.service";
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
    entreprise_nom: "",
    entreprise_adresse: "",
    entreprise_telephone: "",
    ticket_message: "",
  });

  useEffect(() => {
    if (params) {
      setForm({
        tva_taux: params.tva_taux ?? "16",
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
