"use client";

import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { PageHeader } from "@/components/ui/PageHeader";
import { Input } from "@/components/ui/input";
import { SlidePanel } from "@/components/ui/SlidePanel";
import { ConfirmDialog } from "@/components/common/ConfirmDialog";
import {
  DataTable,
  DataTableBadge,
  createEditAction,
  createDeleteAction,
  type Column,
  type Action,
} from "@/components/common/DataTable";
import { FormInput } from "@/components/common/FormInput";
import { societesService, type Societe } from "@/lib/api/services/societes.service";
import { formatDateInput, formatDateShort } from "@/lib/utils/format";
import { resolveMediaUrl } from "@/lib/utils/assets";
import { Building2, Plus, Power, PowerOff, RefreshCw, Loader2, Upload } from "lucide-react";

const emptyForm = {
  nom: "",
  code: "",
  email: "",
  telephone: "",
  adresse: "",
  date_abonnement: formatDateInput(new Date()),
  date_expiration: "",
  notes: "",
  admin_nom: "",
  admin_email: "",
  admin_mot_de_passe: "",
};

export default function SocietesPage() {
  const queryClient = useQueryClient();
  const [page, setPage] = useState(1);
  const [perPage, setPerPage] = useState(10);
  const [search, setSearch] = useState("");
  const [panelOpen, setPanelOpen] = useState(false);
  const [editing, setEditing] = useState<Societe | null>(null);
  const [form, setForm] = useState({ ...emptyForm });
  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [logoPreview, setLogoPreview] = useState<string | null>(null);
  const [toDelete, setToDelete] = useState<Societe | null>(null);

  const { data, isLoading, isFetching, refetch } = useQuery({
    queryKey: ["societes", page, perPage, search],
    queryFn: async () =>
      (await societesService.getAll({ page, per_page: perPage, search: search || undefined }))
        .data,
  });

  const records = data?.data ?? [];

  const openCreate = () => {
    setEditing(null);
    setForm({ ...emptyForm });
    setLogoFile(null);
    setLogoPreview(null);
    setPanelOpen(true);
  };

  const openEdit = (s: Societe) => {
    setEditing(s);
    setForm({
      nom: s.nom,
      code: s.code ?? "",
      email: s.email ?? "",
      telephone: s.telephone ?? "",
      adresse: s.adresse ?? "",
      date_abonnement: formatDateInput(s.date_abonnement),
      date_expiration: formatDateInput(s.date_expiration),
      notes: s.notes ?? "",
      admin_nom: "",
      admin_email: "",
      admin_mot_de_passe: "",
    });
    setLogoFile(null);
    setLogoPreview(resolveMediaUrl(s.logo));
    setPanelOpen(true);
  };

  const saveMutation = useMutation({
    mutationFn: () => {
      if (editing) {
        return societesService.update(editing.id, {
          nom: form.nom,
          code: form.code || undefined,
          email: form.email || undefined,
          telephone: form.telephone || undefined,
          adresse: form.adresse || undefined,
          date_abonnement: form.date_abonnement || undefined,
          date_expiration: form.date_expiration || undefined,
          notes: form.notes || undefined,
        });
      }
      return societesService.create({
        nom: form.nom,
        code: form.code || undefined,
        email: form.email || undefined,
        telephone: form.telephone || undefined,
        adresse: form.adresse || undefined,
        date_abonnement: form.date_abonnement || undefined,
        date_expiration: form.date_expiration || undefined,
        notes: form.notes || undefined,
        admin_nom: form.admin_nom || undefined,
        admin_email: form.admin_email || undefined,
        admin_mot_de_passe: form.admin_mot_de_passe || undefined,
      });
    },
    onSuccess: async (res) => {
      if (!res.success) {
        toast.error(res.message || "Erreur");
        return;
      }
      const id = res.data?.id ?? editing?.id;
      if (logoFile && id) {
        const up = await societesService.uploadLogo(id, logoFile);
        if (!up.success) toast.error(up.message || "Logo non enregistré");
      }
      toast.success(editing ? "Société mise à jour" : "Société créée");
      setPanelOpen(false);
      queryClient.invalidateQueries({ queryKey: ["societes"] });
    },
    onError: () => toast.error("Erreur lors de l'enregistrement"),
  });

  const toggleMutation = useMutation({
    mutationFn: (s: Societe) =>
      s.actif ? societesService.desactiver(s.id) : societesService.activer(s.id),
    onSuccess: (res) => {
      if (!res.success) {
        toast.error(res.message || "Erreur");
      } else {
        toast.success("Statut mis à jour");
      }
      queryClient.invalidateQueries({ queryKey: ["societes"] });
    },
    onError: () => toast.error("Erreur"),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: number) => societesService.delete(id),
    onSuccess: (res) => {
      if (!res.success) toast.error(res.message || "Suppression impossible");
      else toast.success("Société supprimée");
      setToDelete(null);
      queryClient.invalidateQueries({ queryKey: ["societes"] });
    },
    onError: () => {
      toast.error("Suppression impossible");
      setToDelete(null);
    },
  });

  const columns: Column<Societe>[] = [
    {
      key: "nom",
      label: "Société",
      render: (s) => (
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-blue-50 text-blue-600 ring-1 ring-blue-100 dark:bg-blue-950/40 dark:text-blue-400 dark:ring-blue-900">
            <Building2 className="h-4 w-4" />
          </div>
          <div className="flex flex-col">
            <span className="font-medium text-slate-800 dark:text-slate-100">{s.nom}</span>
            <span className="font-mono text-xs text-slate-400">{s.code}</span>
          </div>
        </div>
      ),
    },
    {
      key: "email",
      label: "Contact",
      hidden: "md" as const,
      render: (s) => (
        <div className="flex flex-col text-sm">
          <span>{s.email || "-"}</span>
          <span className="text-xs text-slate-400">{s.telephone || ""}</span>
        </div>
      ),
    },
    {
      key: "utilisateurs_count",
      label: "Utilisateurs",
      className: "text-right",
      render: (s) => <span className="font-mono">{s.utilisateurs_count ?? 0}</span>,
    },
    {
      key: "date_expiration",
      label: "Expiration",
      hidden: "sm" as const,
      render: (s) => formatDateShort(s.date_expiration),
    },
    {
      key: "actif",
      label: "Abonnement",
      render: (s) => {
        const expired =
          s.date_expiration && new Date(s.date_expiration) < new Date(new Date().toDateString());
        if (!s.actif) return <DataTableBadge variant="danger">Désactivé</DataTableBadge>;
        if (expired) return <DataTableBadge variant="warning">Expiré</DataTableBadge>;
        return <DataTableBadge variant="success">Actif</DataTableBadge>;
      },
    },
  ];

  const actions: Action<Societe>[] = [
    {
      label: "Activer",
      icon: <Power className="h-5 w-5" />,
      onClick: (s) => toggleMutation.mutate(s),
      variant: "ghost",
      className:
        "text-emerald-600 hover:text-emerald-700 hover:bg-emerald-50 dark:text-emerald-400 dark:hover:bg-emerald-950/30",
      show: (s) => !s.actif,
    },
    {
      label: "Désactiver",
      icon: <PowerOff className="h-5 w-5" />,
      onClick: (s) => toggleMutation.mutate(s),
      variant: "ghost",
      className:
        "text-amber-600 hover:text-amber-700 hover:bg-amber-50 dark:text-amber-400 dark:hover:bg-amber-950/30",
      show: (s) => s.actif,
    },
    createEditAction<Societe>((s) => openEdit(s)),
    createDeleteAction<Societe>((s) => setToDelete(s)),
  ];

  return (
    <div className="space-y-5">
      <PageHeader
        title="Sociétés & abonnements"
        description="Créez les boutiques clientes et gérez leur abonnement"
        icon={<Building2 className="h-5 w-5" />}
        actions={
          <>
            <Button variant="outline" onClick={() => refetch()} disabled={isFetching}>
              {isFetching ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <RefreshCw className="mr-2 h-4 w-4" />
              )}
              Actualiser
            </Button>
            <Button onClick={openCreate}>
              <Plus className="mr-2 h-4 w-4" />
              Nouvelle société
            </Button>
          </>
        }
      />

      <Card>
        <CardContent className="p-5">
          <div className="mb-4">
            <Input
              placeholder="Rechercher une société..."
              className="w-full sm:w-72"
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setPage(1);
              }}
            />
          </div>
          <DataTable
            data={records}
            columns={columns}
            actions={actions}
            loading={isLoading}
            emptyMessage="Aucune société"
            emptyIcon={<Building2 className="h-12 w-12" />}
            pagination={{
              currentPage: data?.current_page ?? 1,
              totalPages: data?.last_page ?? 1,
              totalItems: data?.total ?? 0,
              perPage: data?.per_page ?? perPage,
              onPageChange: setPage,
              onPerPageChange: (v) => {
                setPerPage(v);
                setPage(1);
              },
              perPageOptions: [10, 20, 50],
            }}
          />
        </CardContent>
      </Card>

      <SlidePanel
        isOpen={panelOpen}
        onClose={() => setPanelOpen(false)}
        title={editing ? `Modifier ${editing.nom}` : "Nouvelle société"}
        subtitle="Société cliente et son abonnement"
        width="xl"
        footer={
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => setPanelOpen(false)}>
              Annuler
            </Button>
            <Button
              onClick={() => saveMutation.mutate()}
              disabled={saveMutation.isPending || !form.nom}
            >
              {saveMutation.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {editing ? "Enregistrer" : "Créer"}
            </Button>
          </div>
        }
      >
        <div className="space-y-4">
          <div className="flex items-center gap-4 rounded-xl border border-slate-200 bg-slate-50/60 p-4 dark:border-slate-800 dark:bg-slate-900/40">
            <div className="flex h-16 w-16 shrink-0 items-center justify-center overflow-hidden rounded-2xl border border-slate-200 bg-white dark:border-slate-700 dark:bg-slate-800">
              {logoPreview ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={logoPreview} alt="logo" className="h-full w-full object-contain" />
              ) : (
                <Building2 className="h-6 w-6 text-slate-300" />
              )}
            </div>
            <div className="min-w-0">
              <label className="mb-1 block text-sm font-medium text-slate-700 dark:text-slate-300">
                Logo de la boutique
              </label>
              <input
                type="file"
                accept="image/png,image/jpeg,image/webp,image/svg+xml"
                onChange={(e) => {
                  const f = e.target.files?.[0];
                  if (f) {
                    setLogoFile(f);
                    setLogoPreview(URL.createObjectURL(f));
                  }
                }}
                className="block w-full text-sm text-slate-500 file:mr-3 file:rounded-lg file:border-0 file:bg-blue-50 file:px-3 file:py-2 file:text-sm file:font-medium file:text-blue-600 hover:file:bg-blue-100 dark:file:bg-blue-950/40 dark:file:text-blue-400"
              />
              <p className="mt-1 flex items-center gap-1 text-xs text-slate-400">
                <Upload className="h-3 w-3" /> PNG/JPG/WEBP, 2 Mo max — affiché dans l'app et sur les documents.
              </p>
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <FormInput
              label="Nom"
              name="nom"
              value={form.nom}
              onChange={(e) => setForm({ ...form, nom: e.target.value })}
              required
            />
            <FormInput
              label="Code"
              name="code"
              value={form.code}
              onChange={(e) => setForm({ ...form, code: e.target.value })}
              placeholder="Auto si vide"
            />
            <FormInput
              label="Email"
              name="email"
              type="email"
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
            />
            <FormInput
              label="Téléphone"
              name="telephone"
              value={form.telephone}
              onChange={(e) => setForm({ ...form, telephone: e.target.value })}
            />
            <FormInput
              label="Date d'abonnement"
              name="date_abonnement"
              type="date"
              value={form.date_abonnement}
              onChange={(e) => setForm({ ...form, date_abonnement: e.target.value })}
            />
            <FormInput
              label="Date d'expiration"
              name="date_expiration"
              type="date"
              value={form.date_expiration}
              onChange={(e) => setForm({ ...form, date_expiration: e.target.value })}
            />
          </div>
          <FormInput
            label="Adresse"
            name="adresse"
            value={form.adresse}
            onChange={(e) => setForm({ ...form, adresse: e.target.value })}
          />

          {!editing && (
            <div className="rounded-xl border border-slate-200 bg-slate-50/60 p-4 dark:border-slate-800 dark:bg-slate-900/40">
              <p className="mb-3 text-sm font-semibold text-slate-700 dark:text-slate-200">
                Compte administrateur de la boutique (optionnel)
              </p>
              <div className="grid gap-4 sm:grid-cols-2">
                <FormInput
                  label="Nom de l'admin"
                  name="admin_nom"
                  value={form.admin_nom}
                  onChange={(e) => setForm({ ...form, admin_nom: e.target.value })}
                />
                <FormInput
                  label="Email de l'admin"
                  name="admin_email"
                  type="email"
                  value={form.admin_email}
                  onChange={(e) => setForm({ ...form, admin_email: e.target.value })}
                />
                <FormInput
                  label="Mot de passe"
                  name="admin_mot_de_passe"
                  type="password"
                  value={form.admin_mot_de_passe}
                  onChange={(e) => setForm({ ...form, admin_mot_de_passe: e.target.value })}
                />
              </div>
            </div>
          )}

          <div>
            <label className="mb-1.5 block text-sm font-medium text-slate-700 dark:text-slate-300">
              Notes
            </label>
            <textarea
              value={form.notes}
              onChange={(e) => setForm({ ...form, notes: e.target.value })}
              rows={3}
              className="w-full rounded-lg border border-slate-200 bg-white px-3.5 py-2 text-sm shadow-sm transition-all focus:border-blue-500 focus:outline-none focus:ring-4 focus:ring-blue-500/10 dark:border-slate-700 dark:bg-slate-900"
            />
          </div>
        </div>
      </SlidePanel>

      <ConfirmDialog
        open={!!toDelete}
        onOpenChange={(o) => !o && setToDelete(null)}
        onConfirm={() => toDelete && deleteMutation.mutate(toDelete.id)}
        title="Supprimer la société"
        description={`Supprimer ${toDelete?.nom} ? Impossible si des utilisateurs y sont rattachés.`}
        confirmLabel="Supprimer"
        variant="danger"
        isLoading={deleteMutation.isPending}
      />
    </div>
  );
}
