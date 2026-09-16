"use client";

import React, { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  DataTable,
  DataTableBadge,
} from "@/components/common/DataTable";
import { SkeletonTable } from "@/components/ui/skeleton";
import { ConfirmDialog } from "@/components/common/ConfirmDialog";
import { FormInput } from "@/components/common/FormInput";
import { FormTextarea } from "@/components/common/FormTextarea";
import { unitesMesureService } from "@/lib/api/services/unites-mesure.service";
import { UniteMesure } from "@/lib/api/typess";
import {
  Ruler, Plus, Search, RefreshCw, Filter, Trash2, Eye, Pencil,
  CheckCircle, XCircle, Loader2, Save, ArrowLeft
} from "lucide-react";
import { FaSpinner } from "react-icons/fa";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";

export default function UnitesPage() {
  const queryClient = useQueryClient();
  const [searchInput, setSearchInput] = useState("");
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [perPage, setPerPage] = useState(10);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [itemToDelete, setItemToDelete] = useState<UniteMesure | null>(null);
  const [togglingId, setTogglingId] = useState<number | null>(null);

  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [editItem, setEditItem] = useState<UniteMesure | null>(null);

  const [formData, setFormData] = useState({
    nom: "",
    symbole: "",
    description: "",
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { data, isLoading, refetch } = useQuery({
    queryKey: ["unites-mesure", page, perPage, search],
    queryFn: async () => {
      const response = await unitesMesureService.getAll({
        page,
        per_page: perPage,
        search: search || undefined,
      });
      return response;
    },
    staleTime: 2 * 60 * 1000,
    retry: 1,
  });

  const resetForm = () => {
    setFormData({ nom: "", symbole: "", description: "" });
    setErrors({});
  };

  const openCreate = () => {
    resetForm();
    setCreateDialogOpen(true);
  };

  const openEdit = (item: UniteMesure) => {
    setEditItem(item);
    setFormData({
      nom: item.nom,
      symbole: item.symbole,
      description: item.description || "",
    });
    setErrors({});
    setEditDialogOpen(true);
  };

  const deleteMutation = useMutation({
    mutationFn: (id: number) => unitesMesureService.delete(id),
    onSuccess: () => {
      toast.success("Unité supprimée");
      queryClient.invalidateQueries({ queryKey: ["unites-mesure"] });
      refetch();
      setDeleteDialogOpen(false);
      setItemToDelete(null);
    },
    onError: () => {
      toast.error("Erreur lors de la suppression");
      setDeleteDialogOpen(false);
      setItemToDelete(null);
    },
  });

  const activerMutation = useMutation({
    mutationFn: async (id: number) => {
      setTogglingId(id);
      const response = await unitesMesureService.activer(id);
      if (!response.success) throw new Error(response.message || "Erreur");
      return response.data;
    },
    onSuccess: () => {
      toast.success("Unité activée");
      queryClient.invalidateQueries({ queryKey: ["unites-mesure"] });
      refetch();
      setTogglingId(null);
    },
    onError: (error: any) => { toast.error(error?.message || "Erreur"); setTogglingId(null); },
  });

  const desactiverMutation = useMutation({
    mutationFn: async (id: number) => {
      setTogglingId(id);
      const response = await unitesMesureService.desactiver(id);
      if (!response.success) throw new Error(response.message || "Erreur");
      return response.data;
    },
    onSuccess: () => {
      toast.success("Unité désactivée");
      queryClient.invalidateQueries({ queryKey: ["unites-mesure"] });
      refetch();
      setTogglingId(null);
    },
    onError: (error: any) => { toast.error(error?.message || "Erreur"); setTogglingId(null); },
  });

  const createMutation = useMutation({
    mutationFn: async (data: any) => {
      setIsSubmitting(true);
      return unitesMesureService.create(data);
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
      toast.success("Unité créée");
      queryClient.invalidateQueries({ queryKey: ["unites-mesure"] });
      setCreateDialogOpen(false);
      resetForm();
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
      } else {
        toast.error("Erreur lors de la création");
      }
    },
  });

  const updateMutation = useMutation({
    mutationFn: async (data: any) => {
      setIsSubmitting(true);
      return unitesMesureService.update(editItem!.id, data);
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
      toast.success("Unité mise à jour");
      queryClient.invalidateQueries({ queryKey: ["unites-mesure"] });
      setEditDialogOpen(false);
      resetForm();
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
      } else {
        toast.error("Erreur lors de la mise à jour");
      }
    },
  });

  const handleToggleActive = (item: UniteMesure) => {
    if (togglingId) return;
    if (Number(item.actif) === 1) {
      desactiverMutation.mutate(item.id);
    } else {
      activerMutation.mutate(item.id);
    }
  };

  const handleSearchSubmit = () => {
    setSearch(searchInput);
    setPage(1);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") { e.preventDefault(); handleSearchSubmit(); }
  };

  const handleClearSearch = () => {
    setSearchInput("");
    setSearch("");
    setPage(1);
  };

  const handlePageChange = (newPage: number) => setPage(newPage);
  const handlePerPageChange = (newPerPage: string) => { setPerPage(Number(newPerPage)); setPage(1); };

  const handleSubmitCreate = (e: React.FormEvent) => {
    e.preventDefault();
    createMutation.mutate({
      nom: formData.nom,
      symbole: formData.symbole,
      description: formData.description || null,
    });
  };

  const handleSubmitEdit = (e: React.FormEvent) => {
    e.preventDefault();
    updateMutation.mutate({
      nom: formData.nom,
      symbole: formData.symbole,
      description: formData.description || null,
    });
  };

  const columns = [
    {
      key: "id",
      label: "ID",
      render: (item: UniteMesure) => (
        <span className="text-xs font-mono bg-gray-100 dark:bg-gray-800 px-2 py-1 rounded">
          #{item.id}
        </span>
      ),
    },
    {
      key: "nom",
      label: "Nom",
      render: (item: UniteMesure) => (
        <div className="flex items-center gap-2">
          <div className="h-8 w-8 rounded-full bg-teal-100 dark:bg-teal-900/30 flex items-center justify-center text-teal-600 dark:text-teal-400 text-xs font-medium">
            {item.nom.charAt(0).toUpperCase()}
          </div>
          <span className="font-medium">{item.nom}</span>
        </div>
      ),
    },
    {
      key: "symbole",
      label: "Symbole",
      render: (item: UniteMesure) => (
        <span className="inline-flex items-center px-2.5 py-1 rounded-md bg-gray-100 dark:bg-gray-800 font-mono text-sm font-bold">
          {item.symbole}
        </span>
      ),
    },
    {
      key: "description",
      label: "Description",
      render: (item: UniteMesure) => (
        <span className="text-sm text-gray-500 dark:text-gray-400">
          {item.description || "-"}
        </span>
      ),
    },
    {
      key: "actif",
      label: "Statut",
      render: (item: UniteMesure) => {
        const isActive = Number(item.actif) === 1;
        const isLoading = togglingId === item.id;
        if (isLoading) {
          return (
            <div className="flex items-center gap-2">
              <Loader2 className="h-4 w-4 animate-spin text-gray-400" />
              <span className="text-sm text-gray-400">Chargement...</span>
            </div>
          );
        }
        return (
          <button
            onClick={() => handleToggleActive(item)}
            className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium transition-all hover:scale-105 cursor-pointer ${
              isActive
                ? "bg-emerald-50 text-emerald-700 border border-emerald-200 hover:bg-emerald-100 dark:bg-emerald-950/30 dark:text-emerald-400 dark:border-emerald-800"
                : "bg-red-50 text-red-700 border border-red-200 hover:bg-red-100 dark:bg-red-950/30 dark:text-red-400 dark:border-red-800"
            }`}
            title={isActive ? "Cliquer pour désactiver" : "Cliquer pour activer"}
          >
            {isActive ? <CheckCircle className="h-3.5 w-3.5" /> : <XCircle className="h-3.5 w-3.5" />}
            {isActive ? "Actif" : "Inactif"}
            <span className="text-[10px] opacity-60 ml-1">(cliquer)</span>
          </button>
        );
      },
    },
  ];

  const actions = [
    {
      label: "Modifier",
      icon: <Pencil className="h-4 w-4" />,
      onClick: (item: UniteMesure) => openEdit(item),
      variant: "ghost" as const,
      className: "text-amber-600 hover:text-amber-700 hover:bg-amber-50 dark:text-amber-400 dark:hover:bg-amber-950/30",
    },
    {
      label: "Supprimer",
      icon: <Trash2 className="h-4 w-4" />,
      onClick: (item: UniteMesure) => { setItemToDelete(item); setDeleteDialogOpen(true); },
      variant: "ghost" as const,
      className: "text-red-600 hover:text-red-700 hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-950/30",
    },
  ];

  const apiData = data as Record<string, unknown> | undefined;
  const paginator = apiData?.data as Record<string, unknown> | undefined;
  const records = Array.isArray(paginator?.data) ? paginator.data : [];
  const pagination = { current_page: (paginator?.current_page as number) ?? 1, per_page: (paginator?.per_page as number) ?? 10, total: (paginator?.total as number) ?? 0, last_page: (paginator?.last_page as number) ?? 1 };

  if (isLoading && !data) {
    return (
      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-3">
              <div className="h-8 w-8 bg-slate-200 dark:bg-slate-700 rounded animate-pulse" />
              <div className="h-8 w-48 bg-slate-200 dark:bg-slate-700 rounded animate-pulse" />
            </div>
            <div className="h-4 w-64 bg-slate-200 dark:bg-slate-700 rounded animate-pulse mt-1" />
          </div>
          <div className="h-10 w-36 bg-slate-200 dark:bg-slate-700 rounded animate-pulse" />
        </div>
        <Card>
          <CardHeader className="pb-2">
            <div className="h-6 w-32 bg-slate-200 dark:bg-slate-700 rounded animate-pulse" />
          </CardHeader>
          <CardContent>
            <SkeletonTable />
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-3">
            <Ruler className="h-5 w-5 text-teal-500" />
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
              Unités de mesure
            </h1>
          </div>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
            Gestion des unités de mesure
          </p>
        </div>
        <Button
          onClick={openCreate}
          className="bg-teal-600 hover:bg-teal-700"
        >
          <Plus className="h-4 w-4 mr-2" />
          Nouvelle unité
        </Button>
      </div>

      <Card>
        <CardHeader className="pb-2">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <CardTitle className="text-sm font-medium text-gray-500 dark:text-gray-400">
              {data?.total ?? 0} unité(s)
            </CardTitle>
            <div className="flex items-center gap-2">
              <span className="text-sm text-gray-500">Afficher</span>
              <Select value={String(perPage)} onValueChange={handlePerPageChange}>
                <SelectTrigger className="w-[70px] h-8">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="10">10</SelectItem>
                  <SelectItem value="20">20</SelectItem>
                  <SelectItem value="50">50</SelectItem>
                  <SelectItem value="100">100</SelectItem>
                </SelectContent>
              </Select>
              <span className="text-sm text-gray-500">par page</span>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-3 mb-4">
            <div className="flex-1 min-w-[200px]">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Rechercher par nom, symbole..."
                  value={searchInput}
                  onChange={(e) => setSearchInput(e.target.value)}
                  onKeyDown={handleKeyDown}
                  className="pl-9"
                />
              </div>
            </div>
            <Button onClick={handleSearchSubmit} className="bg-teal-600 hover:bg-teal-700 text-white">
              <Search className="h-4 w-4 mr-2" /> Rechercher
            </Button>
            {searchInput && (
              <Button variant="ghost" onClick={handleClearSearch} className="text-gray-500 hover:text-gray-700">
                <Trash2 className="h-4 w-4 mr-2" /> Effacer
              </Button>
            )}
            <Button variant="outline" onClick={() => refetch()}>
              <RefreshCw className="h-4 w-4 mr-2" /> Actualiser
            </Button>
          </div>

          <DataTable
            data={records}
            columns={columns}
            actions={actions}
            loading={isLoading}
            emptyMessage="Aucune unité trouvée"
            emptyIcon={<Ruler className="h-12 w-12" />}
            pagination={{
              currentPage: pagination.current_page,
              totalPages: pagination.last_page,
              totalItems: pagination.total,
              perPage: pagination.per_page,
              onPageChange: handlePageChange,
            }}
            rowKey="id"
          />
        </CardContent>
      </Card>

      <Dialog open={createDialogOpen} onOpenChange={setCreateDialogOpen}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>Nouvelle unité de mesure</DialogTitle>
            <DialogDescription>
              Créez une nouvelle unité de mesure pour les produits.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSubmitCreate}>
            <div className="space-y-4 py-4">
              <FormInput
                label="Nom"
                name="nom"
                value={formData.nom}
                onChange={(e) => setFormData((prev) => ({ ...prev, nom: e.target.value }))}
                required
                error={errors.nom}
                placeholder="Ex: Kilogramme, Litre, Unité"
              />
              <FormInput
                label="Symbole"
                name="symbole"
                value={formData.symbole}
                onChange={(e) => setFormData((prev) => ({ ...prev, symbole: e.target.value }))}
                required
                error={errors.symbole}
                placeholder="Ex: kg, L, u"
              />
              <FormTextarea
                label="Description"
                name="description"
                value={formData.description}
                onChange={(e) => setFormData((prev) => ({ ...prev, description: e.target.value }))}
                error={errors.description}
                rows={2}
                placeholder="Description optionnelle"
              />
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setCreateDialogOpen(false)}>
                Annuler
              </Button>
              <Button type="submit" className="bg-teal-600 hover:bg-teal-700" disabled={createMutation.isPending}>
                {createMutation.isPending ? <><FaSpinner className="h-4 w-4 animate-spin mr-2" /> Création...</> : <><Save className="h-4 w-4 mr-2" /> Créer</>}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>Modifier l'unité de mesure</DialogTitle>
            <DialogDescription>
              Modifiez les informations de l'unité de mesure.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSubmitEdit}>
            <div className="space-y-4 py-4">
              <FormInput
                label="Nom"
                name="nom"
                value={formData.nom}
                onChange={(e) => setFormData((prev) => ({ ...prev, nom: e.target.value }))}
                required
                error={errors.nom}
              />
              <FormInput
                label="Symbole"
                name="symbole"
                value={formData.symbole}
                onChange={(e) => setFormData((prev) => ({ ...prev, symbole: e.target.value }))}
                required
                error={errors.symbole}
              />
              <FormTextarea
                label="Description"
                name="description"
                value={formData.description}
                onChange={(e) => setFormData((prev) => ({ ...prev, description: e.target.value }))}
                error={errors.description}
                rows={2}
              />
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setEditDialogOpen(false)}>
                Annuler
              </Button>
              <Button type="submit" className="bg-teal-600 hover:bg-teal-700" disabled={updateMutation.isPending}>
                {updateMutation.isPending ? <><FaSpinner className="h-4 w-4 animate-spin mr-2" /> Mise à jour...</> : <><Save className="h-4 w-4 mr-2" /> Mettre à jour</>}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      <ConfirmDialog
        open={deleteDialogOpen}
        onOpenChange={setDeleteDialogOpen}
        onConfirm={() => itemToDelete && deleteMutation.mutate(itemToDelete.id)}
        title="Confirmer la suppression"
        description={`Êtes-vous sûr de vouloir supprimer l'unité "${itemToDelete?.nom || ''}" ? Cette action est irréversible.`}
        confirmLabel="Supprimer"
        cancelLabel="Annuler"
        variant="danger"
        isLoading={deleteMutation.isPending}
      />
    </div>
  );
}
