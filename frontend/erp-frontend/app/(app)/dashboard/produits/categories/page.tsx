"use client";

import React, { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { SkeletonCard } from "@/components/ui/skeleton";
import { ConfirmDialog } from "@/components/common/ConfirmDialog";
import { FormInput } from "@/components/common/FormInput";
import { FormSelect } from "@/components/common/FormSelect";
import { FormTextarea } from "@/components/common/FormTextarea";
import { categoriesService } from "@/lib/api/services/categories.service";
import { CategorieProduit } from "@/lib/api/typess";
import {
  Tag, Plus, ChevronRight, ChevronDown, Folder, FolderOpen,
  Trash2, Pencil, Save, X, ArrowLeft, RefreshCw, Search, Loader2,
  AlertCircle
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

export default function CategoriesPage() {
  const queryClient = useQueryClient();
  const [search, setSearch] = useState("");
  const [expandedIds, setExpandedIds] = useState<Set<number>>(new Set());

  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<CategorieProduit | null>(null);

  const [formData, setFormData] = useState({
    nom: "",
    description: "",
    parent_id: "",
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { data: categories, isLoading, refetch } = useQuery({
    queryKey: ["categories-arborescence"],
    queryFn: async () => {
      const response = await categoriesService.getArborescence();
      return Array.isArray(response) ? response : (response as any)?.data ?? [];
    },
    staleTime: 2 * 60 * 1000,
  });

  const { data: allCategories } = useQuery({
    queryKey: ["categories-all"],
    queryFn: async () => {
      const response = await categoriesService.getAll({ per_page: 1000 });
      const cats = response.data;
      return (Array.isArray(cats) ? cats : (cats as any)?.data ?? []) as any[];
    },
    staleTime: 5 * 60 * 1000,
  });

  const resetForm = () => {
    setFormData({ nom: "", description: "", parent_id: "" });
    setErrors({});
  };

  const openCreate = (parentId?: number) => {
    resetForm();
    if (parentId) setFormData((prev) => ({ ...prev, parent_id: String(parentId) }));
    setCreateDialogOpen(true);
  };

  const openEdit = (cat: CategorieProduit) => {
    setSelectedCategory(cat);
    setFormData({
      nom: cat.nom,
      description: cat.description || "",
      parent_id: cat.parent_id ? String(cat.parent_id) : "",
    });
    setErrors({});
    setEditDialogOpen(true);
  };

  const createMutation = useMutation({
    mutationFn: async (data: any) => {
      setIsSubmitting(true);
      return categoriesService.create(data);
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
      toast.success("Catégorie créée");
      queryClient.invalidateQueries({ queryKey: ["categories-arborescence"] });
      queryClient.invalidateQueries({ queryKey: ["categories-all"] });
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
      return categoriesService.update(selectedCategory!.id, data);
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
      toast.success("Catégorie mise à jour");
      queryClient.invalidateQueries({ queryKey: ["categories-arborescence"] });
      queryClient.invalidateQueries({ queryKey: ["categories-all"] });
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

  const deleteMutation = useMutation({
    mutationFn: (id: number) => categoriesService.delete(id),
    onSuccess: () => {
      toast.success("Catégorie supprimée");
      queryClient.invalidateQueries({ queryKey: ["categories-arborescence"] });
      queryClient.invalidateQueries({ queryKey: ["categories-all"] });
      setDeleteDialogOpen(false);
      setSelectedCategory(null);
    },
    onError: () => {
      toast.error("Erreur lors de la suppression");
      setDeleteDialogOpen(false);
    },
  });

  const handleSubmitCreate = (e: React.FormEvent) => {
    e.preventDefault();
    createMutation.mutate({
      nom: formData.nom,
      description: formData.description || null,
      parent_id: formData.parent_id ? Number(formData.parent_id) : null,
    });
  };

  const handleSubmitEdit = (e: React.FormEvent) => {
    e.preventDefault();
    updateMutation.mutate({
      nom: formData.nom,
      description: formData.description || null,
      parent_id: formData.parent_id ? Number(formData.parent_id) : null,
    });
  };

  const toggleExpand = (id: number) => {
    setExpandedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const parentOptions = (allCategories || [])
    .filter((c: any) => c.id !== selectedCategory?.id)
    .map((c: any) => ({ value: c.id, label: c.nom }));

  const renderCategoryTree = (items: CategorieProduit[], depth: number = 0) => {
    return items.map((cat) => {
      const hasChildren = cat.enfants && cat.enfants.length > 0;
      const isExpanded = expandedIds.has(cat.id);

      return (
        <React.Fragment key={cat.id}>
          <div
            className={`flex items-center gap-2 py-2.5 px-3 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors group ${
              depth > 0 ? "ml-" + (depth * 6) : ""
            }`}
            style={{ marginLeft: `${depth * 24}px` }}
          >
            <button
              onClick={() => hasChildren && toggleExpand(cat.id)}
              className={`p-0.5 rounded ${hasChildren ? "cursor-pointer hover:bg-gray-200 dark:hover:bg-gray-700" : "invisible"}`}
            >
              {hasChildren ? (
                isExpanded ? <ChevronDown className="h-4 w-4 text-gray-400" /> : <ChevronRight className="h-4 w-4 text-gray-400" />
              ) : (
                <div className="h-4 w-4" />
              )}
            </button>
            {hasChildren && isExpanded ? (
              <FolderOpen className="h-5 w-5 text-amber-500" />
            ) : (
              <Folder className="h-5 w-5 text-amber-400" />
            )}
            <span className="text-sm font-medium text-gray-700 dark:text-gray-300 flex-1">
              {cat.nom}
            </span>
            {cat.description && (
              <span className="text-xs text-gray-400 hidden md:inline max-w-[200px] truncate">
                {cat.description}
              </span>
            )}
            <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
              <Button
                variant="ghost"
                size="sm"
                className="h-7 w-7 p-0 text-amber-600 hover:text-amber-700 hover:bg-amber-50"
                onClick={() => openEdit(cat)}
                title="Modifier"
              >
                <Pencil className="h-3.5 w-3.5" />
              </Button>
              <Button
                variant="ghost"
                size="sm"
                className="h-7 w-7 p-0 text-red-600 hover:text-red-700 hover:bg-red-50"
                onClick={() => { setSelectedCategory(cat); setDeleteDialogOpen(true); }}
                title="Supprimer"
              >
                <Trash2 className="h-3.5 w-3.5" />
              </Button>
              <Button
                variant="ghost"
                size="sm"
                className="h-7 w-7 p-0 text-blue-600 hover:text-blue-700 hover:bg-blue-50"
                onClick={() => openCreate(cat.id)}
                title="Ajouter une sous-catégorie"
              >
                <Plus className="h-3.5 w-3.5" />
              </Button>
            </div>
          </div>
          {hasChildren && isExpanded && renderCategoryTree(cat.enfants!, depth + 1)}
        </React.Fragment>
      );
    });
  };

  const filteredCategories = !search
    ? categories
    : (categories || []).filter((cat: any) =>
        cat.nom.toLowerCase().includes(search.toLowerCase())
      );

  if (isLoading) {
    return (
      <div className="space-y-4">
        <div className="flex items-center gap-3">
          <div className="h-8 w-8 bg-slate-200 dark:bg-slate-700 rounded animate-pulse" />
          <div className="h-8 w-48 bg-slate-200 dark:bg-slate-700 rounded animate-pulse" />
        </div>
        <Card>
          <CardContent className="p-6 space-y-3">
            {[1, 2, 3, 4, 5].map((i) => (
              <SkeletonCard key={i} />
            ))}
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
            <Tag className="h-5 w-5 text-amber-500" />
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
              Catégories de produits
            </h1>
          </div>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
            Gestion des catégories et sous-catégories
          </p>
        </div>
        <Button
          onClick={() => openCreate()}
          className="bg-amber-600 hover:bg-amber-700"
        >
          <Plus className="h-4 w-4 mr-2" />
          Nouvelle catégorie
        </Button>
      </div>

      <Card>
        <CardHeader className="pb-2">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <CardTitle className="text-sm font-medium text-gray-500 dark:text-gray-400">
              Arborescence des catégories
            </CardTitle>
            <div className="flex items-center gap-2">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Rechercher..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="pl-9 h-8 w-48 text-sm"
                />
              </div>
              <Button variant="outline" size="sm" onClick={() => refetch()}>
                <RefreshCw className="h-4 w-4 mr-1" /> Actualiser
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {!filteredCategories || filteredCategories.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <Tag className="h-12 w-12 text-gray-300" />
              <h3 className="mt-4 text-lg font-medium text-gray-900 dark:text-white">
                {search ? "Aucune catégorie trouvée" : "Aucune catégorie"}
              </h3>
              <p className="mt-1 text-sm text-gray-500">
                {search ? "Essayez un autre terme de recherche" : "Créez votre première catégorie"}
              </p>
              {!search && (
                <Button onClick={() => openCreate()} className="mt-4 bg-amber-600 hover:bg-amber-700">
                  <Plus className="h-4 w-4 mr-2" /> Nouvelle catégorie
                </Button>
              )}
            </div>
          ) : (
            <div className="border rounded-lg p-2 bg-white dark:bg-gray-900">
              {renderCategoryTree(filteredCategories)}
            </div>
          )}
        </CardContent>
      </Card>

      <Dialog open={createDialogOpen} onOpenChange={setCreateDialogOpen}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>Nouvelle catégorie</DialogTitle>
            <DialogDescription>
              Créez une nouvelle catégorie de produits.
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
                placeholder="Nom de la catégorie"
              />
              <FormTextarea
                label="Description"
                name="description"
                value={formData.description}
                onChange={(e) => setFormData((prev) => ({ ...prev, description: e.target.value }))}
                error={errors.description}
                rows={3}
                placeholder="Description optionnelle"
              />
              <FormSelect
                label="Catégorie parente"
                name="parent_id"
                value={formData.parent_id}
                onChange={(e) => setFormData((prev) => ({ ...prev, parent_id: e.target.value }))}
                options={parentOptions}
                placeholder="Aucune (racine)"
              />
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setCreateDialogOpen(false)}>
                Annuler
              </Button>
              <Button type="submit" className="bg-amber-600 hover:bg-amber-700" disabled={createMutation.isPending}>
                {createMutation.isPending ? <><FaSpinner className="h-4 w-4 animate-spin mr-2" /> Création...</> : <><Save className="h-4 w-4 mr-2" /> Créer</>}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>Modifier la catégorie</DialogTitle>
            <DialogDescription>
              Modifiez les informations de la catégorie.
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
                placeholder="Nom de la catégorie"
              />
              <FormTextarea
                label="Description"
                name="description"
                value={formData.description}
                onChange={(e) => setFormData((prev) => ({ ...prev, description: e.target.value }))}
                error={errors.description}
                rows={3}
              />
              <FormSelect
                label="Catégorie parente"
                name="parent_id"
                value={formData.parent_id}
                onChange={(e) => setFormData((prev) => ({ ...prev, parent_id: e.target.value }))}
                options={parentOptions}
                placeholder="Aucune (racine)"
              />
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setEditDialogOpen(false)}>
                Annuler
              </Button>
              <Button type="submit" className="bg-amber-600 hover:bg-amber-700" disabled={updateMutation.isPending}>
                {updateMutation.isPending ? <><FaSpinner className="h-4 w-4 animate-spin mr-2" /> Mise à jour...</> : <><Save className="h-4 w-4 mr-2" /> Mettre à jour</>}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      <ConfirmDialog
        open={deleteDialogOpen}
        onOpenChange={setDeleteDialogOpen}
        onConfirm={() => selectedCategory && deleteMutation.mutate(selectedCategory.id)}
        title="Confirmer la suppression"
        description={`Êtes-vous sûr de vouloir supprimer la catégorie "${selectedCategory?.nom || ''}" ? Les sous-catégories seront déplacées à la racine.`}
        confirmLabel="Supprimer"
        cancelLabel="Annuler"
        variant="danger"
        isLoading={deleteMutation.isPending}
      />
    </div>
  );
}
