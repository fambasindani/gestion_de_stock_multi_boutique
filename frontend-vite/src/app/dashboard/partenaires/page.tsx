"use client";
import { liveSearch } from "@/lib/utils/liveSearch";

import React, { useState, Suspense, useCallback, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
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
import { Partenaire } from "@/lib/api/partenaire";
import { partenairesService } from "@/lib/api/services/partenaires.service";
import { 
  Plus, Building2, Users, Truck, Search, RefreshCw, Filter, Trash2, Eye, Pencil,
  CheckCircle, XCircle, Power, PowerOff, Loader2
} from "lucide-react";

export default function PartenairesPageWrapper() {
  return (
    <Suspense fallback={<div className="p-8 text-center text-gray-500">Chargement...</div>}>
      <PartenairesPage />
    </Suspense>
  );
}

function PartenairesPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  
  const typeParam = searchParams.get("type") || "all";
  const searchParam = searchParams.get("search") || "";

  const [searchInput, setSearchInput] = useState(searchParam);
  const [search, setSearch] = useState(searchParam);
  const [page, setPage] = useState(1);
  const [perPage, setPerPage] = useState(10);
  const [typeFilter, setTypeFilter] = useState<string>(typeParam);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [itemToDelete, setItemToDelete] = useState<Partenaire | null>(null);
  const [togglingId, setTogglingId] = useState<number | null>(null);

  const queryClient = useQueryClient();

  useEffect(() => {
    const newType = searchParams.get("type") || "all";
    const newSearch = searchParams.get("search") || "";
    
    if (newType !== typeFilter) {
      setTypeFilter(newType);
    }
    if (newSearch !== searchInput) {
      setSearchInput(newSearch);
      setSearch(newSearch);
    }
    refetch();
  }, [searchParams]);

  const { data, isLoading, refetch } = useQuery({
    queryKey: ["partenaires", page, perPage, search, typeFilter],
    queryFn: async () => {
      const response = await partenairesService.getAll({
        page,
        perPage,
        search: search || undefined,
        type: typeFilter as any,
      });
      return response;
    },
    staleTime: 2 * 60 * 1000,
    retry: 1,
    enabled: true,
  });

  const deleteMutation = useMutation({
    mutationFn: (id: number) => partenairesService.delete(id),
    onSuccess: () => {
      toast.success("Partenaire supprimé");
      queryClient.invalidateQueries({ queryKey: ["partenaires"] });
      refetch();
      setDeleteDialogOpen(false);
      setItemToDelete(null);
    },
    onError: (error) => {
      toast.error("Erreur lors de la suppression");
      setDeleteDialogOpen(false);
      setItemToDelete(null);
    },
  });

  // ✅ Mutation pour activer
  const activerMutation = useMutation({
    mutationFn: async (id: number) => {
      setTogglingId(id);
      const response = await partenairesService.activer(id);
      if (!response.success) {
        throw new Error(response.message || 'Erreur lors de l\'activation');
      }
      return response.data;
    },
    onSuccess: () => {
      toast.success("Partenaire activé avec succès");
      queryClient.invalidateQueries({ queryKey: ["partenaires"] });
      refetch();
      setTogglingId(null);
    },
    onError: (error: any) => {
      toast.error(error?.message || "Erreur lors de l'activation");
      setTogglingId(null);
    },
  });

  // ✅ Mutation pour désactiver
  const desactiverMutation = useMutation({
    mutationFn: async (id: number) => {
      setTogglingId(id);
      const response = await partenairesService.desactiver(id);
      if (!response.success) {
        throw new Error(response.message || 'Erreur lors de la désactivation');
      }
      return response.data;
    },
    onSuccess: () => {
      toast.success("Partenaire désactivé avec succès");
      queryClient.invalidateQueries({ queryKey: ["partenaires"] });
      refetch();
      setTogglingId(null);
    },
    onError: (error: any) => {
      toast.error(error?.message || "Erreur lors de la désactivation");
      setTogglingId(null);
    },
  });

  const handleSearchSubmit = () => {
    setSearch(searchInput);
    setPage(1);
    const params = new URLSearchParams();
    if (searchInput) params.set("search", searchInput);
    if (typeFilter !== "all") params.set("type", typeFilter);
    router.push(`/dashboard/partenaires?${params.toString()}`);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      e.preventDefault();
      handleSearchSubmit();
    }
  };

  const handleClearSearch = () => {
    setSearchInput("");
    setSearch("");
    setPage(1);
    const params = new URLSearchParams();
    if (typeFilter !== "all") params.set("type", typeFilter);
    router.push(`/dashboard/partenaires?${params.toString()}`);
  };

  const handlePageChange = (newPage: number) => {
    setPage(newPage);
  };

  const handlePerPageChange = (newPerPage: string) => {
    setPerPage(Number(newPerPage));
    setPage(1);
  };

  const handleTypeChange = (type: string) => {
    setTypeFilter(type);
    setPage(1);
    const params = new URLSearchParams();
    if (type !== "all") params.set("type", type);
    if (search) params.set("search", search);
    router.push(`/dashboard/partenaires?${params.toString()}`);
  };

  const handleDeleteClick = (item: Partenaire) => {
    setItemToDelete(item);
    setDeleteDialogOpen(true);
  };

  const handleConfirmDelete = () => {
    if (itemToDelete) {
      deleteMutation.mutate(itemToDelete.id);
    }
  };

  const handleToggleActive = (item: Partenaire) => {
    if (togglingId) return;
    
    if (Number(item.actif) === 1) {
      desactiverMutation.mutate(item.id);
    } else {
      activerMutation.mutate(item.id);
    }
  };

  // ✅ Colonnes avec statut cliquable
  const columns = [
    {
      key: "code",
      label: "Code",
      render: (item: Partenaire) => (
        <span className="text-xs font-mono bg-gray-100 dark:bg-gray-800 px-2 py-1 rounded">
          {item.code || "-"}
        </span>
      ),
    },
    {
      key: "nom",
      label: "Nom",
      render: (item: Partenaire) => (
        <div className="flex items-center gap-2">
          <div className="h-8 w-8 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center text-blue-600 dark:text-blue-400 text-xs font-medium">
            {item.nom.charAt(0).toUpperCase()}
          </div>
          <span className="font-medium">{item.nom}</span>
        </div>
      ),
    },
    {
      key: "email",
      label: "Email",
      hidden: "md" as const,
    },
    {
      key: "telephone",
      label: "Téléphone",
      hidden: "sm" as const,
    },
    {
      key: "est_client",
      label: "Type",
      render: (item: Partenaire) => {
        if (item.est_client && item.est_fournisseur) {
          return <DataTableBadge variant="info">Client & Fournisseur</DataTableBadge>;
        }
        if (item.est_client) {
          return <DataTableBadge variant="info">Client</DataTableBadge>;
        }
        if (item.est_fournisseur) {
          return <DataTableBadge variant="warning">Fournisseur</DataTableBadge>;
        }
        return <DataTableBadge variant="outline">Aucun</DataTableBadge>;
      },
    },
    {
      key: "actif",
      label: "Statut",
      render: (item: Partenaire) => {
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
            {isActive ? (
              <CheckCircle className="h-3.5 w-3.5" />
            ) : (
              <XCircle className="h-3.5 w-3.5" />
            )}
            {isActive ? "Actif" : "Inactif"}
            <span className="text-[10px] opacity-60 ml-1">
              (cliquer)
            </span>
          </button>
        );
      },
    },
  ];

  // ✅ Actions
  const actions = [
    {
      label: "Voir",
      icon: <Eye className="h-4 w-4" />,
      onClick: (item: Partenaire) => router.push(`/dashboard/partenaires/${item.id}/details`),
      variant: "ghost" as const,
      className: "text-blue-600 hover:text-blue-700 hover:bg-blue-50 dark:text-blue-400 dark:hover:bg-blue-950/30",
    },
    {
      label: "Modifier",
      icon: <Pencil className="h-4 w-4" />,
      onClick: (item: Partenaire) => router.push(`/dashboard/partenaires/${item.id}/modifier`),
      variant: "ghost" as const,
      className: "text-amber-600 hover:text-amber-700 hover:bg-amber-50 dark:text-amber-400 dark:hover:bg-amber-950/30",
    },
    {
      label: "Supprimer",
      icon: <Trash2 className="h-4 w-4" />,
      onClick: (item: Partenaire) => handleDeleteClick(item),
      variant: "ghost" as const,
      className: "text-red-600 hover:text-red-700 hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-950/30",
    },
  ];

  const getTitleInfo = () => {
    switch (typeFilter) {
      case "client":
        return {
          title: "Clients",
          icon: <Users className="h-5 w-5 text-blue-500" />,
          description: "Gestion des clients",
        };
      case "fournisseur":
        return {
          title: "Fournisseurs",
          icon: <Truck className="h-5 w-5 text-amber-500" />,
          description: "Gestion des fournisseurs",
        };
      default:
        return {
          title: "Partenaires",
          icon: <Building2 className="h-5 w-5 text-gray-500" />,
          description: "Gestion des clients et fournisseurs",
        };
    }
  };

  const titleInfo = getTitleInfo();
  const records = Array.isArray(data?.data) ? data.data : [];
  const pagination = { current_page: (data?.current_page as number) ?? 1, per_page: (data?.per_page as number) ?? 10, total: (data?.total as number) ?? 0, last_page: (data?.last_page as number) ?? 1 };

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
          <div className="h-10 w-32 bg-slate-200 dark:bg-slate-700 rounded animate-pulse" />
        </div>
        <Card>
          <CardHeader className="pb-2">
            <div className="h-6 w-32 bg-slate-200 dark:bg-slate-700 rounded animate-pulse" />
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-3 mb-4">
              <div className="flex-1 min-w-[200px] h-10 bg-slate-200 dark:bg-slate-700 rounded animate-pulse" />
              <div className="h-10 w-40 bg-slate-200 dark:bg-slate-700 rounded animate-pulse" />
              <div className="h-10 w-32 bg-slate-200 dark:bg-slate-700 rounded animate-pulse" />
            </div>
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
            {titleInfo.icon}
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
              {titleInfo.title}
            </h1>
          </div>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
            {titleInfo.description}
          </p>
        </div>
        <Button
          onClick={() => router.push("/dashboard/partenaires/nouveau")}
          className="bg-blue-600 hover:bg-blue-700"
        >
          <Plus className="h-4 w-4 mr-2" />
          Nouveau
        </Button>
      </div>

      <Card>
        <CardHeader className="pb-2">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <CardTitle className="text-sm font-medium text-gray-500 dark:text-gray-400">
              {data?.total ?? 0} partenaire(s)
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
                  placeholder="Rechercher par nom, email, code..."
                  value={searchInput}
                  onChange={(e) => { const v = e.target.value; setSearchInput(v); liveSearch(() => { setSearch(v); setPage(1); }); }}
                  onKeyDown={handleKeyDown}
                  className="pl-9"
                />
              </div>
            </div>
            <Button 
              onClick={handleSearchSubmit}
              className="bg-blue-600 hover:bg-blue-700 text-white"
            >
              <Search className="h-4 w-4 mr-2" />
              Rechercher
            </Button>
            {searchInput && (
              <Button 
                variant="ghost" 
                onClick={handleClearSearch}
                className="text-gray-500 hover:text-gray-700"
              >
                <Trash2 className="h-4 w-4 mr-2" />
                Effacer
              </Button>
            )}
            <div className="flex items-center gap-2">
              <Filter className="h-4 w-4 text-gray-400" />
              <Select value={typeFilter} onValueChange={handleTypeChange}>
                <SelectTrigger className="w-[160px]">
                  <SelectValue placeholder="Tous les types" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Tous les types</SelectItem>
                  <SelectItem value="client">Clients</SelectItem>
                  <SelectItem value="fournisseur">Fournisseurs</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <Button variant="outline" onClick={() => refetch()}>
              <RefreshCw className="h-4 w-4 mr-2" />
              Actualiser
            </Button>
          </div>

          <DataTable
            data={records}
            columns={columns}
            actions={actions}
            loading={isLoading}
            emptyMessage="Aucun partenaire trouvé"
            emptyIcon={<Building2 className="h-12 w-12" />}
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

      <ConfirmDialog
        open={deleteDialogOpen}
        onOpenChange={setDeleteDialogOpen}
        onConfirm={handleConfirmDelete}
        title="Confirmer la suppression"
        description={`Êtes-vous sûr de vouloir supprimer le partenaire "${itemToDelete?.nom || ''}" ? Cette action est irréversible.`}
        confirmLabel="Supprimer"
        cancelLabel="Annuler"
        variant="danger"
        isLoading={deleteMutation.isPending}
      />
    </div>
  );
}