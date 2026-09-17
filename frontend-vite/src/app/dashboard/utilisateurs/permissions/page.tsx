"use client";
import { liveSearch } from "@/lib/utils/liveSearch";

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
} from "@/components/common/DataTable";
import { SkeletonTable } from "@/components/ui/skeleton";
import { ConfirmDialog } from "@/components/common/ConfirmDialog";
import { permissionsService } from "@/lib/api/services/permissions.service";
import { Permission } from "@/lib/api/typess";
import { useAuth } from "@/hooks/useAuth";
import {
  Plus, Key, Pencil, Trash2, Search, RefreshCw
} from "lucide-react";

export default function PermissionsPage() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const { isSuperAdmin } = useAuth();
  const [searchInput, setSearchInput] = useState("");
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [perPage, setPerPage] = useState(50);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [itemToDelete, setItemToDelete] = useState<Permission | null>(null);

  const { data, isLoading, refetch } = useQuery({
    queryKey: ["permissions", page, perPage, search],
    queryFn: async () => {
      const response = await permissionsService.getAll({
        page,
        per_page: perPage,
        search: search || undefined,
      });
      return response;
    },
    staleTime: 2 * 60 * 1000,
  });

  const deleteMutation = useMutation({
    mutationFn: (id: number) => permissionsService.delete(id),
    onSuccess: (result) => {
      if (result?.success === false) {
        if (result.message) toast.error(result.message);
        return;
      }
      toast.success("Permission supprimée");
      queryClient.invalidateQueries({ queryKey: ["permissions"] });
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

  const handleDeleteClick = (item: Permission) => { setItemToDelete(item); setDeleteDialogOpen(true); };
  const handleConfirmDelete = () => { if (itemToDelete) deleteMutation.mutate(itemToDelete.id); };

  const handleSearchSubmit = () => { setSearch(searchInput); setPage(1); };
  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => { if (e.key === "Enter") { e.preventDefault(); handleSearchSubmit(); } };
  const handleClearSearch = () => { setSearchInput(""); setSearch(""); setPage(1); };
  const handlePageChange = (newPage: number) => setPage(newPage);
  const handlePerPageChange = (newPerPage: string) => { setPerPage(Number(newPerPage)); setPage(1); };

  const columns = [
    { key: "nom", label: "Nom", render: (item: Permission) => (
      <div className="flex items-center gap-2">
        <div className="h-8 w-8 rounded-full bg-amber-100 dark:bg-amber-900/30 flex items-center justify-center text-amber-600 dark:text-amber-400 text-xs font-medium">
          {item.nom.charAt(0).toUpperCase()}
        </div>
        <span className="font-medium">{item.nom}</span>
      </div>
    )},
    { key: "garde", label: "Garde", render: (item: Permission) => (
      <code className="text-xs bg-gray-100 dark:bg-gray-800 px-2 py-1 rounded font-mono">{item.garde || "-"}</code>
    )},
    { key: "description", label: "Description", render: (item: Permission) => <span>{item.description || "-"}</span> },
  ];

  // Les permissions sont un référentiel global : seul le compte plateforme peut les modifier
  const actions = isSuperAdmin
    ? [
        {
          label: "Modifier",
          icon: <Pencil className="h-4 w-4" />,
          onClick: (item: Permission) => router.push(`/dashboard/utilisateurs/permissions/nouveau?id=${item.id}`),
          variant: "ghost" as const,
          className: "text-amber-600 hover:text-amber-700 hover:bg-amber-50 dark:text-amber-400 dark:hover:bg-amber-950/30",
        },
        {
          label: "Supprimer",
          icon: <Trash2 className="h-4 w-4" />,
          onClick: (item: Permission) => handleDeleteClick(item),
          variant: "ghost" as const,
          className: "text-red-600 hover:text-red-700 hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-950/30",
        },
      ]
    : [];

  if (isLoading && !data) {
    return (
      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div><div className="flex items-center gap-3"><div className="h-8 w-8 bg-slate-200 dark:bg-slate-700 rounded animate-pulse" /><div className="h-8 w-48 bg-slate-200 dark:bg-slate-700 rounded animate-pulse" /></div><div className="h-4 w-64 bg-slate-200 dark:bg-slate-700 rounded animate-pulse mt-1" /></div>
          <div className="h-10 w-40 bg-slate-200 dark:bg-slate-700 rounded animate-pulse" />
        </div>
        <Card><CardHeader className="pb-2"><div className="h-6 w-32 bg-slate-200 dark:bg-slate-700 rounded animate-pulse" /></CardHeader><CardContent><SkeletonTable /></CardContent></Card>
      </div>
    );
  }

  const apiData = data as Record<string, unknown> | undefined;
  const permissionsData = Array.isArray(apiData?.data) ? apiData.data : [];
  const pagination = {
    current_page: (apiData?.current_page as number) ?? 1,
    per_page: (apiData?.per_page as number) ?? perPage,
    total: (apiData?.total as number) ?? 0,
    last_page: (apiData?.last_page as number) ?? 1,
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-3">
            <Key className="h-6 w-6 text-amber-500" />
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Permissions</h1>
          </div>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Gestion des permissions</p>
        </div>
        {isSuperAdmin && (
          <Button onClick={() => router.push("/dashboard/utilisateurs/permissions/nouveau")} className="bg-blue-600 hover:bg-blue-700">
            <Plus className="h-4 w-4 mr-2" />Nouvelle permission
          </Button>
        )}
      </div>

      <Card>
        <CardHeader className="pb-2">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <CardTitle className="text-sm font-medium text-gray-500 dark:text-gray-400">{pagination.total} permission(s)</CardTitle>
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
                <Input placeholder="Rechercher par nom, description..." value={searchInput} onChange={(e) => { const v = e.target.value; setSearchInput(v); liveSearch(() => { setSearch(v); setPage(1); }); }} onKeyDown={handleKeyDown} className="pl-9" />
              </div>
            </div>
            <Button onClick={handleSearchSubmit} className="bg-blue-600 hover:bg-blue-700 text-white"><Search className="h-4 w-4 mr-2" />Rechercher</Button>
            {searchInput && <Button variant="ghost" onClick={handleClearSearch} className="text-gray-500 hover:text-gray-700"><Trash2 className="h-4 w-4 mr-2" />Effacer</Button>}
            <Button variant="outline" onClick={() => refetch()}><RefreshCw className="h-4 w-4 mr-2" />Actualiser</Button>
          </div>

          <DataTable
            data={permissionsData}
            columns={columns}
            actions={actions}
            loading={isLoading}
            emptyMessage="Aucune permission trouvée"
            emptyIcon={<Key className="h-12 w-12" />}
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
        description={`Êtes-vous sûr de vouloir supprimer la permission "${itemToDelete?.nom || ''}" ? Cette action est irréversible.`}
        confirmLabel="Supprimer"
        cancelLabel="Annuler"
        variant="danger"
        isLoading={deleteMutation.isPending}
      />
    </div>
  );
}
