"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
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
import { utilisateursService } from "@/lib/api/services/utilisateurs.service";
import { Utilisateur } from "@/lib/api/typess";
import {
  Plus, Users, Search, RefreshCw, Trash2, Eye, Pencil,
  CheckCircle, XCircle, Loader2, Shield
} from "lucide-react";

export default function UtilisateursPage() {
  const router = useRouter();
  const queryClient = useQueryClient();

  const [searchInput, setSearchInput] = useState("");
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [perPage, setPerPage] = useState(10);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [itemToDelete, setItemToDelete] = useState<Utilisateur | null>(null);
  const [togglingId, setTogglingId] = useState<number | null>(null);

  const { data, isLoading, refetch } = useQuery({
    queryKey: ["utilisateurs", page, perPage, search],
    queryFn: async () => {
      const response = await utilisateursService.getAll({
        page,
        per_page: perPage,
        search: search || undefined,
      });
      return response;
    },
    staleTime: 2 * 60 * 1000,
    retry: 1,
  });

  const deleteMutation = useMutation({
    mutationFn: (id: number) => utilisateursService.delete(id),
    onSuccess: () => {
      toast.success("Utilisateur supprimé");
      queryClient.invalidateQueries({ queryKey: ["utilisateurs"] });
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
      const response = await utilisateursService.update(id, { actif: true });
      if (!response.success) throw new Error(response.message || "Erreur lors de l'activation");
      return response.data;
    },
    onSuccess: () => {
      toast.success("Utilisateur activé");
      queryClient.invalidateQueries({ queryKey: ["utilisateurs"] });
      refetch();
      setTogglingId(null);
    },
    onError: (error: any) => {
      toast.error(error?.message || "Erreur lors de l'activation");
      setTogglingId(null);
    },
  });

  const desactiverMutation = useMutation({
    mutationFn: async (id: number) => {
      setTogglingId(id);
      const response = await utilisateursService.update(id, { actif: false });
      if (!response.success) throw new Error(response.message || "Erreur lors de la désactivation");
      return response.data;
    },
    onSuccess: () => {
      toast.success("Utilisateur désactivé");
      queryClient.invalidateQueries({ queryKey: ["utilisateurs"] });
      refetch();
      setTogglingId(null);
    },
    onError: (error: any) => {
      toast.error(error?.message || "Erreur lors de la désactivation");
      setTogglingId(null);
    },
  });

  const handleSearchSubmit = () => { setSearch(searchInput); setPage(1); };
  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => { if (e.key === "Enter") { e.preventDefault(); handleSearchSubmit(); } };
  const handleClearSearch = () => { setSearchInput(""); setSearch(""); setPage(1); };
  const handlePageChange = (newPage: number) => setPage(newPage);
  const handlePerPageChange = (newPerPage: string) => { setPerPage(Number(newPerPage)); setPage(1); };
  const handleDeleteClick = (item: Utilisateur) => { setItemToDelete(item); setDeleteDialogOpen(true); };
  const handleConfirmDelete = () => { if (itemToDelete) deleteMutation.mutate(itemToDelete.id); };

  const handleToggleActive = (item: Utilisateur) => {
    if (togglingId) return;
    if (item.actif === 1) {
      desactiverMutation.mutate(item.id);
    } else {
      activerMutation.mutate(item.id);
    }
  };

  const columns = [
    {
      key: "nom",
      label: "Nom",
      render: (item: Utilisateur) => (
        <div className="flex items-center gap-2">
          <div className="h-8 w-8 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center text-blue-600 dark:text-blue-400 text-xs font-medium">
            {item.nom.charAt(0).toUpperCase()}
          </div>
          <span className="font-medium">{item.nom}</span>
        </div>
      ),
    },
    { key: "email", label: "Email" },
    { key: "telephone", label: "Téléphone", hidden: "md" as const, render: (item: Utilisateur) => <span>{item.telephone || "-"}</span> },
    {
      key: "roles",
      label: "Rôles",
      render: (item: Utilisateur) => (
        <div className="flex flex-wrap gap-1">
          {item.roles && item.roles.length > 0 ? (
            item.roles.map((role) => (
              <DataTableBadge key={role.id} variant="info">{role.nom}</DataTableBadge>
            ))
          ) : (
            <span className="text-xs text-gray-400">Aucun rôle</span>
          )}
        </div>
      ),
    },
    { key: "derniere_connexion", label: "Dernière connexion", hidden: "sm" as const, render: (item: Utilisateur) => <span>{item.derniere_connexion || "Jamais"}</span> },
    {
      key: "actif",
      label: "Statut",
      render: (item: Utilisateur) => {
        const isActive = item.actif === 1;
        const isLoading = togglingId === item.id;
        if (isLoading) {
          return <div className="flex items-center gap-2"><Loader2 className="h-4 w-4 animate-spin text-gray-400" /><span className="text-sm text-gray-400">...</span></div>;
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
          </button>
        );
      },
    },
  ];

  const actions = [
    {
      label: "Voir",
      icon: <Eye className="h-4 w-4" />,
      onClick: (item: Utilisateur) => router.push(`/dashboard/utilisateurs/${item.id}/details`),
      variant: "ghost" as const,
      className: "text-blue-600 hover:text-blue-700 hover:bg-blue-50 dark:text-blue-400 dark:hover:bg-blue-950/30",
    },
    {
      label: "Modifier",
      icon: <Pencil className="h-4 w-4" />,
      onClick: (item: Utilisateur) => router.push(`/dashboard/utilisateurs/nouveau?id=${item.id}`),
      variant: "ghost" as const,
      className: "text-amber-600 hover:text-amber-700 hover:bg-amber-50 dark:text-amber-400 dark:hover:bg-amber-950/30",
    },
    {
      label: "Supprimer",
      icon: <Trash2 className="h-4 w-4" />,
      onClick: (item: Utilisateur) => handleDeleteClick(item),
      variant: "ghost" as const,
      className: "text-red-600 hover:text-red-700 hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-950/30",
    },
  ];

  const apiData = data as Record<string, unknown> | undefined;
  const records = Array.isArray(apiData?.data) ? apiData.data : [];
  const pagination = { current_page: (apiData?.current_page as number) ?? 1, per_page: (apiData?.per_page as number) ?? 10, total: (apiData?.total as number) ?? 0, last_page: (apiData?.last_page as number) ?? 1 };

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
          <div className="h-10 w-40 bg-slate-200 dark:bg-slate-700 rounded animate-pulse" />
        </div>
        <Card>
          <CardHeader className="pb-2"><div className="h-6 w-32 bg-slate-200 dark:bg-slate-700 rounded animate-pulse" /></CardHeader>
          <CardContent><SkeletonTable /></CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-3">
            <Users className="h-6 w-6 text-blue-500" />
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Utilisateurs</h1>
          </div>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Gestion des utilisateurs</p>
        </div>
        <Button onClick={() => router.push("/dashboard/utilisateurs/nouveau")} className="bg-blue-600 hover:bg-blue-700">
          <Plus className="h-4 w-4 mr-2" />Nouvel utilisateur
        </Button>
      </div>

      <Card>
        <CardHeader className="pb-2">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <CardTitle className="text-sm font-medium text-gray-500 dark:text-gray-400">{data?.total ?? 0} utilisateur(s)</CardTitle>
            <div className="flex items-center gap-2">
              <span className="text-sm text-gray-500">Afficher</span>
              <Select value={String(perPage)} onValueChange={handlePerPageChange}>
                <SelectTrigger className="w-[70px] h-8"><SelectValue /></SelectTrigger>
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
                <Input placeholder="Rechercher par nom, email..." value={searchInput} onChange={(e) => setSearchInput(e.target.value)} onKeyDown={handleKeyDown} className="pl-9" />
              </div>
            </div>
            <Button onClick={handleSearchSubmit} className="bg-blue-600 hover:bg-blue-700 text-white"><Search className="h-4 w-4 mr-2" />Rechercher</Button>
            {searchInput && <Button variant="ghost" onClick={handleClearSearch} className="text-gray-500 hover:text-gray-700"><Trash2 className="h-4 w-4 mr-2" />Effacer</Button>}
            <Button variant="outline" onClick={() => refetch()}><RefreshCw className="h-4 w-4 mr-2" />Actualiser</Button>
          </div>

          <DataTable
            data={records}
            columns={columns}
            actions={actions}
            loading={isLoading}
            emptyMessage="Aucun utilisateur trouvé"
            emptyIcon={<Users className="h-12 w-12" />}
            pagination={{ currentPage: pagination.current_page, totalPages: pagination.last_page, totalItems: pagination.total, perPage: pagination.per_page, onPageChange: handlePageChange }}
            rowKey="id"
          />
        </CardContent>
      </Card>

      <ConfirmDialog
        open={deleteDialogOpen}
        onOpenChange={setDeleteDialogOpen}
        onConfirm={handleConfirmDelete}
        title="Confirmer la suppression"
        description={`Êtes-vous sûr de vouloir supprimer l'utilisateur "${itemToDelete?.nom || ''}" ? Cette action est irréversible.`}
        confirmLabel="Supprimer"
        cancelLabel="Annuler"
        variant="danger"
        isLoading={deleteMutation.isPending}
      />
    </div>
  );
}
