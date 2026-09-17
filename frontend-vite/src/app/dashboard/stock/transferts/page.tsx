"use client";
import { liveSearch } from "@/lib/utils/liveSearch";

import React, { useState, Suspense, useEffect } from "react";
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
import { TransfertStock } from "@/lib/api/typess";
import { transfertsService } from "@/lib/api/services/transferts.service";
import {
  ArrowLeftRight, Plus, Search, RefreshCw, Filter, Trash2, Eye,
  CheckCircle, XCircle, Loader2, Truck, Package, Warehouse, Factory
} from "lucide-react";
import { format } from "date-fns";
import { fr } from "date-fns/locale";

const typeConfig: Record<string, { label: string; variant: "info" | "warning" | "success" | "default" }> = {
  reception: { label: "Réception", variant: "success" },
  livraison: { label: "Livraison", variant: "info" },
  interne: { label: "Interne", variant: "warning" },
  production: { label: "Production", variant: "default" },
};

const etatVariants: Record<string, "info" | "warning" | "success" | "danger" | "default" | "outline"> = {
  brouillon: "warning",
  attente: "info",
  confirme: "info",
  assigne: "default",
  termine: "success",
  annule: "danger",
};

const etatLabels: Record<string, string> = {
  brouillon: "Brouillon",
  attente: "En attente",
  confirme: "Confirmé",
  assigne: "Assigné",
  termine: "Terminé",
  annule: "Annulé",
};

export default function TransfertsPageWrapper() {
  return (
    <Suspense fallback={<div className="p-8 text-center text-gray-500">Chargement...</div>}>
      <TransfertsPage />
    </Suspense>
  );
}

function TransfertsPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const queryClient = useQueryClient();

  const searchParam = searchParams.get("search") || "";
  const etatParam = searchParams.get("etat") || "all";
  const typeParam = searchParams.get("type") || "all";

  const [searchInput, setSearchInput] = useState(searchParam);
  const [search, setSearch] = useState(searchParam);
  const [page, setPage] = useState(1);
  const [perPage, setPerPage] = useState(10);
  const [etatFilter, setEtatFilter] = useState(etatParam);
  const [typeFilter, setTypeFilter] = useState(typeParam);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [itemToDelete, setItemToDelete] = useState<TransfertStock | null>(null);

  useEffect(() => {
    const newSearch = searchParams.get("search") || "";
    const newEtat = searchParams.get("etat") || "all";
    const newType = searchParams.get("type") || "all";
    if (newSearch !== searchInput) { setSearchInput(newSearch); setSearch(newSearch); }
    if (newEtat !== etatFilter) setEtatFilter(newEtat);
    if (newType !== typeFilter) setTypeFilter(newType);
    refetch();
  }, [searchParams]);

  const { data, isLoading, refetch } = useQuery({
    queryKey: ["transferts", page, perPage, search, etatFilter, typeFilter],
    queryFn: async () => {
      const response = await transfertsService.getAll({
        page,
        per_page: perPage,
        search: search || undefined,
        etat: etatFilter !== "all" ? etatFilter : undefined,
        type: typeFilter !== "all" ? typeFilter : undefined,
      });
      return response;
    },
    staleTime: 2 * 60 * 1000,
    retry: 1,
  });

  const deleteMutation = useMutation({
    mutationFn: (id: number) => transfertsService.delete(id),
    onSuccess: () => {
      toast.success("Transfert supprimé");
      queryClient.invalidateQueries({ queryKey: ["transferts"] });
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

  const handleSearchSubmit = () => {
    setSearch(searchInput);
    setPage(1);
    const params = new URLSearchParams();
    if (searchInput) params.set("search", searchInput);
    if (etatFilter !== "all") params.set("etat", etatFilter);
    if (typeFilter !== "all") params.set("type", typeFilter);
    router.push(`/dashboard/stock/transferts?${params.toString()}`);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") { e.preventDefault(); handleSearchSubmit(); }
  };

  const handleClearSearch = () => {
    setSearchInput(""); setSearch(""); setPage(1);
    const params = new URLSearchParams();
    if (etatFilter !== "all") params.set("etat", etatFilter);
    if (typeFilter !== "all") params.set("type", typeFilter);
    router.push(`/dashboard/stock/transferts?${params.toString()}`);
  };

  const handleEtatChange = (value: string) => {
    setEtatFilter(value); setPage(1);
    const params = new URLSearchParams();
    if (search) params.set("search", search);
    if (value !== "all") params.set("etat", value);
    if (typeFilter !== "all") params.set("type", typeFilter);
    router.push(`/dashboard/stock/transferts?${params.toString()}`);
  };

  const handleTypeChange = (value: string) => {
    setTypeFilter(value); setPage(1);
    const params = new URLSearchParams();
    if (search) params.set("search", search);
    if (etatFilter !== "all") params.set("etat", etatFilter);
    if (value !== "all") params.set("type", value);
    router.push(`/dashboard/stock/transferts?${params.toString()}`);
  };

  const handleDeleteClick = (item: TransfertStock) => {
    setItemToDelete(item);
    setDeleteDialogOpen(true);
  };

  const handleConfirmDelete = () => {
    if (itemToDelete) deleteMutation.mutate(itemToDelete.id);
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case "reception": return <Package className="h-4 w-4" />;
      case "livraison": return <Truck className="h-4 w-4" />;
      case "production": return <Factory className="h-4 w-4" />;
      default: return <ArrowLeftRight className="h-4 w-4" />;
    }
  };

  const columns = [
    {
      key: "reference",
      label: "Référence",
      render: (item: TransfertStock) => (
        <span className="text-xs font-mono bg-gray-100 dark:bg-gray-800 px-2 py-1 rounded font-medium">
          {item.reference || "-"}
        </span>
      ),
    },
    {
      key: "type",
      label: "Type",
      render: (item: TransfertStock) => {
        const config = typeConfig[item.type] || { label: item.type, variant: "default" as const };
        return (
          <DataTableBadge variant={config.variant}>
            <span className="flex items-center gap-1">
              {getTypeIcon(item.type)}
              {config.label}
            </span>
          </DataTableBadge>
        );
      },
    },
    {
      key: "emplacement_source_id",
      label: "Source",
      render: (item: TransfertStock) => (
        <span className="text-sm text-gray-600 dark:text-gray-400">
          {item.emplacementSource?.nom || `#${item.emplacement_source_id}`}
        </span>
      ),
    },
    {
      key: "emplacement_destination_id",
      label: "Destination",
      render: (item: TransfertStock) => (
        <span className="text-sm text-gray-600 dark:text-gray-400">
          {item.emplacementDestination?.nom || `#${item.emplacement_destination_id}`}
        </span>
      ),
    },
    {
      key: "etat",
      label: "Statut",
      render: (item: TransfertStock) => (
        <DataTableBadge variant={etatVariants[item.etat] || "default"}>
          {etatLabels[item.etat] || item.etat}
        </DataTableBadge>
      ),
    },
    {
      key: "date_prevue",
      label: "Date",
      render: (item: TransfertStock) => (
        <span className="text-sm text-gray-500">
          {item.date_prevue
            ? format(new Date(item.date_prevue), "dd/MM/yyyy", { locale: fr })
            : "-"}
        </span>
      ),
    },
  ];

  const actions = [
    {
      label: "Voir",
      icon: <Eye className="h-4 w-4" />,
      onClick: (item: TransfertStock) => router.push(`/dashboard/stock/transferts/${item.id}/details`),
      variant: "ghost" as const,
      className: "text-blue-600 hover:text-blue-700 hover:bg-blue-50 dark:text-blue-400 dark:hover:bg-blue-950/30",
    },
    {
      label: "Supprimer",
      icon: <Trash2 className="h-4 w-4" />,
      onClick: (item: TransfertStock) => handleDeleteClick(item),
      variant: "ghost" as const,
      className: "text-red-600 hover:text-red-700 hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-950/30",
      show: (item: TransfertStock) => item.etat === "brouillon",
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
          <div className="h-10 w-44 bg-slate-200 dark:bg-slate-700 rounded animate-pulse" />
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
            <ArrowLeftRight className="h-5 w-5 text-blue-500" />
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
              Transferts
            </h1>
          </div>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
            Gestion des mouvements de stock
          </p>
        </div>
        <Button
          onClick={() => router.push("/dashboard/stock/transferts/nouveau")}
          className="bg-blue-600 hover:bg-blue-700"
        >
          <Plus className="h-4 w-4 mr-2" />
          Nouveau transfert
        </Button>
      </div>

      <Card>
        <CardHeader className="pb-2">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <CardTitle className="text-sm font-medium text-gray-500 dark:text-gray-400">
              {pagination.total} transfert(s)
            </CardTitle>
            <div className="flex items-center gap-2">
              <span className="text-sm text-gray-500">Afficher</span>
              <Select value={String(perPage)} onValueChange={(v) => { setPerPage(Number(v)); setPage(1); }}>
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
                  placeholder="Rechercher par référence..."
                  value={searchInput}
                  onChange={(e) => { const v = e.target.value; setSearchInput(v); liveSearch(() => { setSearch(v); setPage(1); }); }}
                  onKeyDown={handleKeyDown}
                  className="pl-9"
                />
              </div>
            </div>
            <Button onClick={handleSearchSubmit} className="bg-blue-600 hover:bg-blue-700 text-white">
              <Search className="h-4 w-4 mr-2" /> Rechercher
            </Button>
            {searchInput && (
              <Button variant="ghost" onClick={handleClearSearch} className="text-gray-500 hover:text-gray-700">
                <Trash2 className="h-4 w-4 mr-2" /> Effacer
              </Button>
            )}
            <div className="flex items-center gap-2">
              <Filter className="h-4 w-4 text-gray-400" />
              <Select value={typeFilter} onValueChange={handleTypeChange}>
                <SelectTrigger className="w-[140px]">
                  <SelectValue placeholder="Type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Tous les types</SelectItem>
                  <SelectItem value="reception">Réception</SelectItem>
                  <SelectItem value="livraison">Livraison</SelectItem>
                  <SelectItem value="interne">Interne</SelectItem>
                  <SelectItem value="production">Production</SelectItem>
                </SelectContent>
              </Select>
              <Select value={etatFilter} onValueChange={handleEtatChange}>
                <SelectTrigger className="w-[140px]">
                  <SelectValue placeholder="Statut" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Tous les statuts</SelectItem>
                  <SelectItem value="brouillon">Brouillon</SelectItem>
                  <SelectItem value="attente">En attente</SelectItem>
                  <SelectItem value="confirme">Confirmé</SelectItem>
                  <SelectItem value="assigne">Assigné</SelectItem>
                  <SelectItem value="termine">Terminé</SelectItem>
                  <SelectItem value="annule">Annulé</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <Button variant="outline" onClick={() => refetch()}>
              <RefreshCw className="h-4 w-4 mr-2" /> Actualiser
            </Button>
          </div>

          <DataTable
            data={records}
            columns={columns}
            actions={actions}
            loading={isLoading}
            emptyMessage="Aucun transfert trouvé"
            emptyIcon={<ArrowLeftRight className="h-12 w-12" />}
            pagination={{
              currentPage: pagination.current_page,
              totalPages: pagination.last_page,
              totalItems: pagination.total,
              perPage: pagination.per_page,
              onPageChange: setPage,
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
        description={`Êtes-vous sûr de vouloir supprimer le transfert "${itemToDelete?.reference || ''}" ? Cette action est irréversible.`}
        confirmLabel="Supprimer"
        cancelLabel="Annuler"
        variant="danger"
        isLoading={deleteMutation.isPending}
      />
    </div>
  );
}
