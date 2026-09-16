"use client";

import React, { useState, useEffect, Suspense } from "react";
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
  Action,
} from "@/components/common/DataTable";
import { SkeletonTable } from "@/components/ui/skeleton";
import { ConfirmDialog } from "@/components/common/ConfirmDialog";
import { commandesAchatService } from "@/lib/api/services/commandes-achat.service";
import { CommandeAchat } from "@/lib/api/typess";
import { formatDateShort } from "@/lib/utils/format";
import {
  Plus, Truck, Search, RefreshCw, Filter, Trash2, Eye, Pencil,
} from "lucide-react";

const statusConfig: Record<string, { label: string; variant: "default" | "success" | "warning" | "danger" | "info" | "outline" }> = {
  brouillon: { label: "Brouillon", variant: "outline" },
  confirme: { label: "Confirmé", variant: "info" },
  envoye: { label: "Envoyé", variant: "warning" },
  recu: { label: "Reçu", variant: "success" },
  termine: { label: "Terminé", variant: "success" },
  annule: { label: "Annulé", variant: "danger" },
};

export default function CommandesAchatPageWrapper() {
  return (
    <Suspense fallback={<div className="p-8 text-center text-gray-500">Chargement...</div>}>
      <CommandesAchatPage />
    </Suspense>
  );
}

function CommandesAchatPage() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const etatParam = searchParams.get("etat") || "all";
  const searchParam = searchParams.get("search") || "";

  const [searchInput, setSearchInput] = useState(searchParam);
  const [search, setSearch] = useState(searchParam);
  const [page, setPage] = useState(1);
  const [perPage, setPerPage] = useState(10);
  const [etatFilter, setEtatFilter] = useState<string>(etatParam);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [itemToDelete, setItemToDelete] = useState<CommandeAchat | null>(null);

  const queryClient = useQueryClient();

  useEffect(() => {
    const newEtat = searchParams.get("etat") || "all";
    const newSearch = searchParams.get("search") || "";

    if (newEtat !== etatFilter) setEtatFilter(newEtat);
    if (newSearch !== searchInput) {
      setSearchInput(newSearch);
      setSearch(newSearch);
    }
    refetch();
  }, [searchParams]);

  const { data, isLoading, refetch } = useQuery({
    queryKey: ["commandes-achat", page, perPage, search, etatFilter],
    queryFn: async () => {
      const response = await commandesAchatService.getAll({
        page,
        per_page: perPage,
        search: search || undefined,
        etat: etatFilter !== "all" ? etatFilter : undefined,
      });
      return response;
    },
    staleTime: 2 * 60 * 1000,
    retry: 1,
  });

  const deleteMutation = useMutation({
    mutationFn: (id: number) => commandesAchatService.delete(id),
    onSuccess: () => {
      toast.success("Commande supprimée");
      queryClient.invalidateQueries({ queryKey: ["commandes-achat"] });
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
    router.push(`/achats/commandes?${params.toString()}`);
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
    if (etatFilter !== "all") params.set("etat", etatFilter);
    router.push(`/achats/commandes?${params.toString()}`);
  };

  const handlePageChange = (newPage: number) => setPage(newPage);

  const handlePerPageChange = (newPerPage: string) => {
    setPerPage(Number(newPerPage));
    setPage(1);
  };

  const handleEtatChange = (etat: string) => {
    setEtatFilter(etat);
    setPage(1);
    const params = new URLSearchParams();
    if (etat !== "all") params.set("etat", etat);
    if (search) params.set("search", search);
    router.push(`/achats/commandes?${params.toString()}`);
  };

  const handleDeleteClick = (item: CommandeAchat) => {
    setItemToDelete(item);
    setDeleteDialogOpen(true);
  };

  const handleConfirmDelete = () => {
    if (itemToDelete) deleteMutation.mutate(itemToDelete.id);
  };

  const columns = [
    {
      key: "reference",
      label: "Référence",
      render: (item: CommandeAchat) => (
        <span className="text-xs font-mono bg-gray-100 dark:bg-gray-800 px-2 py-1 rounded">
          {item.reference || "-"}
        </span>
      ),
    },
    {
      key: "partenaire",
      label: "Fournisseur",
      render: (item: CommandeAchat) => (
        <span className="font-medium">{item.partenaire?.nom || "-"}</span>
      ),
    },
    {
      key: "date_commande",
      label: "Date",
      render: (item: CommandeAchat) => (
        <span className="text-sm">
          {formatDateShort(item.date_commande)}
        </span>
      ),
    },
    {
      key: "montant_total_ttc",
      label: "Total TTC",
      render: (item: CommandeAchat) => (
        <span className="font-medium">
          {Number(item.montant_total_ttc).toLocaleString("fr-FR", { minimumFractionDigits: 2 })} CDF
        </span>
      ),
    },
    {
      key: "etat",
      label: "Statut",
      render: (item: CommandeAchat) => {
        const config = statusConfig[item.etat] || statusConfig.brouillon;
        return <DataTableBadge variant={config.variant}>{config.label}</DataTableBadge>;
      },
    },
  ];

  const actions: Action<CommandeAchat>[] = [
    {
      label: "Voir",
      icon: <Eye className="h-4 w-4" />,
      onClick: (item: CommandeAchat) => router.push(`/achats/commandes/${item.id}/details`),
      variant: "ghost" as const,
      className: "text-blue-600 hover:text-blue-700 hover:bg-blue-50 dark:text-blue-400 dark:hover:bg-blue-950/30",
    },
    {
      label: "Modifier",
      icon: <Pencil className="h-4 w-4" />,
      onClick: (item: CommandeAchat) => router.push(`/achats/commandes/${item.id}/modifier`),
      variant: "ghost" as const,
      className: "text-amber-600 hover:text-amber-700 hover:bg-amber-50 dark:text-amber-400 dark:hover:bg-amber-950/30",
    },
    {
      label: "Supprimer",
      icon: <Trash2 className="h-4 w-4" />,
      onClick: (item: CommandeAchat) => handleDeleteClick(item),
      variant: "ghost" as const,
      className: "text-red-600 hover:text-red-700 hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-950/30",
    },
  ];

  const apiData = data as Record<string, unknown> | undefined;
  const paginator = apiData?.data as Record<string, unknown> | undefined;
  const rawData: CommandeAchat[] = Array.isArray(paginator?.data) ? paginator.data as CommandeAchat[] : [];
  const paginationRaw = { current_page: (paginator?.current_page as number) ?? 1, per_page: (paginator?.per_page as number) ?? 10, total: (paginator?.total as number) ?? 0, last_page: (paginator?.last_page as number) ?? 1 };
  const totalCount = paginationRaw.total ?? (Array.isArray(data) ? data.length : 0);

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
            <Truck className="h-5 w-5 text-amber-500" />
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
              Commandes d'achat
            </h1>
          </div>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
            Gestion des commandes fournisseurs
          </p>
        </div>
        <Button
          onClick={() => router.push("/achats/commandes/nouveau")}
          className="bg-blue-600 hover:bg-blue-700"
        >
          <Plus className="h-4 w-4 mr-2" />
          Nouvelle commande
        </Button>
      </div>

      <Card>
        <CardHeader className="pb-2">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <CardTitle className="text-sm font-medium text-gray-500 dark:text-gray-400">
              {totalCount} commande(s)
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
                  placeholder="Rechercher par référence, fournisseur..."
                  value={searchInput}
                  onChange={(e) => setSearchInput(e.target.value)}
                  onKeyDown={handleKeyDown}
                  className="pl-9"
                />
              </div>
            </div>
            <Button onClick={handleSearchSubmit} className="bg-blue-600 hover:bg-blue-700 text-white">
              <Search className="h-4 w-4 mr-2" />
              Rechercher
            </Button>
            {searchInput && (
              <Button variant="ghost" onClick={handleClearSearch} className="text-gray-500 hover:text-gray-700">
                <Trash2 className="h-4 w-4 mr-2" />
                Effacer
              </Button>
            )}
            <div className="flex items-center gap-2">
              <Filter className="h-4 w-4 text-gray-400" />
              <Select value={etatFilter} onValueChange={handleEtatChange}>
                <SelectTrigger className="w-[160px]">
                  <SelectValue placeholder="Tous les statuts" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Tous les statuts</SelectItem>
                  <SelectItem value="brouillon">Brouillon</SelectItem>
                  <SelectItem value="confirme">Confirmé</SelectItem>
                  <SelectItem value="envoye">Envoyé</SelectItem>
                  <SelectItem value="recu">Reçu</SelectItem>
                  <SelectItem value="termine">Terminé</SelectItem>
                  <SelectItem value="annule">Annulé</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <Button variant="outline" onClick={() => refetch()}>
              <RefreshCw className="h-4 w-4 mr-2" />
              Actualiser
            </Button>
          </div>

          <DataTable
            data={rawData}
            columns={columns}
            actions={actions}
            loading={isLoading}
            emptyMessage="Aucune commande trouvée"
            emptyIcon={<Truck className="h-12 w-12" />}
            pagination={{
              currentPage: paginationRaw.current_page,
              totalPages: paginationRaw.last_page,
              totalItems: paginationRaw.total,
              perPage: paginationRaw.per_page,
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
        description={`Êtes-vous sûr de vouloir supprimer la commande "${itemToDelete?.reference || ''}" ? Cette action est irréversible.`}
        confirmLabel="Supprimer"
        cancelLabel="Annuler"
        variant="danger"
        isLoading={deleteMutation.isPending}
      />
    </div>
  );
}
