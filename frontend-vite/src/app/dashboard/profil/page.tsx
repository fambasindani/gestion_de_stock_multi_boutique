"use client";

import { useEffect, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { PageHeader } from "@/components/ui/PageHeader";
import { FormInput } from "@/components/common/FormInput";
import { Badge } from "@/components/ui/badge";
import { profilService } from "@/lib/api/services/profil.service";
import { resolveLogoUrl } from "@/lib/utils/assets";
import { formatDateTime } from "@/lib/utils/format";
import {
  User,
  ShieldCheck,
  KeyRound,
  Save,
  Loader2,
  Building2,
  Mail,
  Phone,
  Calendar,
} from "lucide-react";

export default function ProfilPage() {
  const queryClient = useQueryClient();

  const { data, isLoading } = useQuery({
    queryKey: ["profil"],
    queryFn: async () => (await profilService.get()).data,
  });

  const [form, setForm] = useState({ nom: "", email: "", telephone: "" });
  const [pwd, setPwd] = useState({
    actuel: "",
    nouveau: "",
    confirmation: "",
  });

  useEffect(() => {
    if (data?.utilisateur) {
      setForm({
        nom: data.utilisateur.nom ?? "",
        email: data.utilisateur.email ?? "",
        telephone: data.utilisateur.telephone ?? "",
      });
    }
  }, [data]);

  const saveMutation = useMutation({
    mutationFn: () =>
      profilService.update({
        nom: form.nom,
        email: form.email,
        telephone: form.telephone || null,
      }),
    onSuccess: (res) => {
      if (!res.success) {
        toast.error(res.message || "Erreur");
        return;
      }
      toast.success("Profil mis à jour");
      queryClient.invalidateQueries({ queryKey: ["profil"] });
      queryClient.invalidateQueries({ queryKey: ["currentUser"] });
    },
    onError: () => toast.error("Erreur lors de la mise à jour"),
  });

  const passwordMutation = useMutation({
    mutationFn: () =>
      profilService.updatePassword({
        mot_de_passe_actuel: pwd.actuel,
        mot_de_passe: pwd.nouveau,
        mot_de_passe_confirmation: pwd.confirmation,
      }),
    onSuccess: (res) => {
      if (!res.success) {
        toast.error(res.message || "Erreur");
        return;
      }
      toast.success("Mot de passe modifié");
      setPwd({ actuel: "", nouveau: "", confirmation: "" });
    },
    onError: () => toast.error("Erreur lors du changement de mot de passe"),
  });

  if (isLoading) {
    return (
      <div className="flex min-h-[300px] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
      </div>
    );
  }

  const u = data?.utilisateur;
  const societe = data?.societe;
  const logo = resolveLogoUrl(societe);
  const initials = (u?.nom || "U")
    .split(" ")
    .map((w) => w.charAt(0))
    .join("")
    .toUpperCase()
    .slice(0, 2);

  return (
    <div className="space-y-5">
      <PageHeader
        title="Mon profil"
        description="Vos informations personnelles et votre mot de passe"
        icon={<User className="h-5 w-5" />}
      />

      <div className="grid gap-5 lg:grid-cols-[1fr_1.4fr]">
        {/* Carte identité */}
        <Card>
          <CardContent className="flex flex-col items-center p-6 text-center">
            <div className="flex h-20 w-20 items-center justify-center rounded-full bg-gradient-to-br from-blue-500 to-blue-700 text-2xl font-bold text-white shadow-lg shadow-blue-600/30">
              {initials}
            </div>
            <h2 className="mt-4 text-lg font-semibold text-slate-900 dark:text-white">
              {u?.nom}
            </h2>
            <p className="text-sm text-slate-500">{u?.email}</p>

            <div className="mt-3 flex flex-wrap justify-center gap-2">
              {data?.roles?.map((r) => (
                <Badge key={r} variant="info">
                  {r}
                </Badge>
              ))}
              {u?.est_super_admin && (
                <Badge variant="warning">Super-admin</Badge>
              )}
              <Badge variant={u?.actif ? "success" : "danger"}>
                {u?.actif ? "Actif" : "Inactif"}
              </Badge>
            </div>

            <div className="mt-5 w-full space-y-3 border-t border-slate-100 pt-4 text-left text-sm dark:border-slate-800">
              <div className="flex items-center gap-2 text-slate-600 dark:text-slate-300">
                <Building2 className="h-4 w-4 text-slate-400" />
                {logo ? (
                  <img src={logo} alt={societe?.nom} className="h-6 w-6 rounded object-contain" />
                ) : null}
                <span>{societe?.nom || "Plateforme"}</span>
                {societe?.code && (
                  <span className="font-mono text-xs text-slate-400">({societe.code})</span>
                )}
              </div>
              <div className="flex items-center gap-2 text-slate-600 dark:text-slate-300">
                <Mail className="h-4 w-4 text-slate-400" />
                {u?.email}
              </div>
              <div className="flex items-center gap-2 text-slate-600 dark:text-slate-300">
                <Phone className="h-4 w-4 text-slate-400" />
                {u?.telephone || "—"}
              </div>
              <div className="flex items-center gap-2 text-slate-600 dark:text-slate-300">
                <Calendar className="h-4 w-4 text-slate-400" />
                Dernière connexion : {formatDateTime(u?.derniere_connexion)}
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="space-y-5">
          {/* Informations */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base">
                <User className="h-4 w-4 text-blue-600" /> Informations
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <FormInput
                label="Nom complet"
                name="nom"
                value={form.nom}
                onChange={(e) => setForm({ ...form, nom: e.target.value })}
                required
              />
              <div className="grid gap-4 sm:grid-cols-2">
                <FormInput
                  label="Email"
                  name="email"
                  type="email"
                  value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                  required
                />
                <FormInput
                  label="Téléphone"
                  name="telephone"
                  value={form.telephone}
                  onChange={(e) => setForm({ ...form, telephone: e.target.value })}
                />
              </div>
              <div className="flex justify-end">
                <Button
                  onClick={() => saveMutation.mutate()}
                  disabled={saveMutation.isPending || !form.nom || !form.email}
                >
                  {saveMutation.isPending ? (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  ) : (
                    <Save className="mr-2 h-4 w-4" />
                  )}
                  Enregistrer
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Sécurité */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base">
                <ShieldCheck className="h-4 w-4 text-blue-600" /> Sécurité
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <FormInput
                label="Mot de passe actuel"
                name="mot_de_passe_actuel"
                type="password"
                value={pwd.actuel}
                onChange={(e) => setPwd({ ...pwd, actuel: e.target.value })}
                autoComplete="current-password"
              />
              <div className="grid gap-4 sm:grid-cols-2">
                <FormInput
                  label="Nouveau mot de passe"
                  name="mot_de_passe"
                  type="password"
                  value={pwd.nouveau}
                  onChange={(e) => setPwd({ ...pwd, nouveau: e.target.value })}
                  autoComplete="new-password"
                />
                <FormInput
                  label="Confirmation"
                  name="mot_de_passe_confirmation"
                  type="password"
                  value={pwd.confirmation}
                  onChange={(e) => setPwd({ ...pwd, confirmation: e.target.value })}
                  autoComplete="new-password"
                />
              </div>
              <div className="flex justify-end">
                <Button
                  variant="outline"
                  onClick={() => passwordMutation.mutate()}
                  disabled={
                    passwordMutation.isPending ||
                    !pwd.actuel ||
                    pwd.nouveau.length < 8 ||
                    pwd.nouveau !== pwd.confirmation
                  }
                >
                  {passwordMutation.isPending ? (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  ) : (
                    <KeyRound className="mr-2 h-4 w-4" />
                  )}
                  Changer le mot de passe
                </Button>
              </div>
              {pwd.nouveau && pwd.nouveau !== pwd.confirmation && (
                <p className="text-right text-xs text-red-500">
                  Les mots de passe ne correspondent pas.
                </p>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
