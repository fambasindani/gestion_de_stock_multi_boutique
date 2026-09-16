"use client";

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
import { LotTracabilite } from "@/lib/api/typess";
import { lotsService } from "@/lib/api/services/lots.service";
import {
  Tag, Plus, Search, RefreshCw, Filter, Trash2, Eye, Pencil,
  Loader2, Package, Calendar, CheckCircle, XCircle
} from "lucide-react";
import { format } from "date-fns";
import { fr } from "date-fns/locale";

const statutConfig: Record<string, { label: string; variant: "success" | "danger" | "warning" | "info" | "default" }> = {
  actif: { label: "Actif", variant: "success" },
  epuise: { label: "Épuisé", variant: "default" },
  perime: { label: "Périmé", variant: "danger" },
  bloque: { label: "Bloqué", variant: "warning" },
};

const typeBadge: Record<string, "info" | "success"> = {
  lot: "info",
  serie: "success",
};

export default function LotsPageWrapper() {
  return (
    <Suspense fallback={<div className="p-8 text-center text-gray-500">Chargement...</div>}>
      <LotsPage />
    </Suspense>
  );
}

function LotsPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const queryClient = useQueryClient();

  const searchParam = searchParams.get("search") || "";
  const statutParam = searchParams.get("statut") || "all";

  const [searchInput, setSearchInput] = useState(searchParam);
  const [search, setSearch] = useState(searchParam);
  const [page, setPage] = useState(1);
  const [perPage, setPerPage] = useState(10);
  const [statutFilter, setStatutFilter] = useState(statutParam);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [itemToDelete, setItemToDelete] = useState<LotTracabilite | null>(null);

  useEffect(() => {
    const newSearch = searchParams.get("search") || "";
    const newStatut = searchParams.get("statut") || "all";
    if (newSearch !== searchInput) { setSearchInput(newSearch); setSearch(newSearch); }
    if (newStatut !== statutFilter) setStatutFilter(newStatut);
    refetch();
  }, [searchParams]);

  const { data, isLoading, refetch } = useQuery({
    queryKey: ["lots", page, perPage, search, statutFilter],
    queryFn: async () => {
      const response = await lotsService.getAll({
        page,
        per_page: perPage,
        search: search || undefined,
        statut: statutFilter !== "all" ? statutFilter : undefined,
      });
      return response;
    },
    staleTime: 2 * 60 * 1000,
    retry: 1,
  });

  const deleteMutation = useMutation({
    mutationFn: (id: number) => lotsService.delete(id),
    onSuccess: () => {
      toast.success("Lot supprimé");
      queryClient.invalidateQueries({ queryKey: ["lots"] });
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
    if (statutFilter !== "all") params.set("statut", statutFilter);
    router.push(`/dashboard/stock/lots?${params.toString()}`);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") { e.preventDefault(); handleSearchSubmit(); }
  };

  const handleClearSearch = () => {
    setSearchInput(""); setSearch(""); setPage(1);
    const params = new URLSearchParams();
    if (statutFilter !== "all") params.set("statut", statutFilter);
    router.push(`/dashboard/stock/lots?${params.toString()}`);
  };

  const handleStatutChange = (value: string) => {
    setStatutFilter(value); setPage(1);
    const params = new URLSearchParams();
    if (search) params.set("search", search);
    if (value !== "all") params.set("statut", value);
    router.push(`/dashboard/stock/lots?${params.toString()}`);
  };

  const handleDeleteClick = (item: LotTracabilite) => {
    setItemToDelete(item);
    setDeleteDialogOpen(true);
  };

  const handleConfirmDelete = () => {
    if (itemToDelete) deleteMutation.mutate(itemToDelete.id);
  };

  const columns = [
    {
      key: "nom",
      label: "Nom",
      render: (item: LotTracabilite) => (
        <div className="flex items-center gap-2">
          <div className="h-8 w-8 rounded-full bg-cyan-100 dark:bg-cyan-900/30 flex items-center justify-center text-cyan-600 dark:text-cyan-400 text-xs font-medium">
            <Tag className="h-4 w-4" />
          </div>
          <div>
            <span className="font-medium">{item.nom || "-"}</span>
            {item.code && (
              <span className="text-xs text-gray-400 ml-2 font-mono">{item.code}</span>
            )}
          </div>
        </div>
      ),
    },
    {
      key: "produit_id",
      label: "Produit",
      render: (item: LotTracabilite) => (
        <span className="text-sm text-gray-600 dark:text-gray-400">
          {item.produit?.nom || `Produit #${item.produit_id}`}
        </span>
      ),
    },
    {
      key: "type",
      label: "Type",
      render: (item: LotTracabilite) => (
        <DataTableBadge variant={typeBadge[item.type] || "default"}>
          {item.type === "lot" ? "Lot" : "Série"}
        </DataTableBadge>
      ),
    },
    {
      key: "quantite_initiale",
      label: "Qté Initiale",
      render: (item: LotTracabilite) => (
        <span className="text-sm font-medium">{item.quantite_initiale}</span>
      ),
    },
    {
      key: "quantite_actuelle",
      label: "Qté Actuelle",
      render: (item: LotTracabilite) => (
        <span className="font-semibold text-emerald-600 dark:text-emerald-400">
          {item.quantite_actuelle}
        </span>
      ),
    },
    {
      key: "date_peremption",
      label: "Péremption",
      render: (item: LotTracabilite) => (
        <span className={`text-sm ${item.date_peremption && new Date(item.date_peremption) < new Date() ? "text-red-500 font-medium" : "text-gray-500"}`}>
          {item.date_peremption
            ? format(new Date(item.date_peremption), "dd/MM/yyyy", { locale: fr })
            : "-"}
        </span>
      ),
    },
    {
      key: "statut",
      label: "Statut",
      render: (item: LotTracabilite) => {
        const config = statutConfig[item.statut] || { label: item.statut, variant: "default" as const };
        return <DataTableBadge variant={config.variant}>{config.label}</DataTableBadge>;
      },
    },
  ];

  const actions = [
    {
      label: "Voir",
      icon: <Eye className="h-4 w-4" />,
      onClick: (item: LotTracabilite) => router.push(`/dashboard/stock/lots/${item.id}/details`),
      variant: "ghost" as const,
      className: "text-blue-600 hover:text-blue-700 hover:bg-blue-50 dark:text-blue-400 dark:hover:bg-blue-950/30",
    },
    {
      label: "Modifier",
      icon: <Pencil className="h-4 w-4" />,
      onClick: (item: LotTracabilite) => router.push(`/dashboard/stock/lots/${item.id}/modifier`),
      variant: "ghost" as const,
      className: "text-amber-600 hover:text-amber-700 hover:bg-amber-50 dark:text-amber-400 dark:hover:bg-amber-950/30",
    },
    {
      label: "Supprimer",
      icon: <Trash2 className="h-4 w-4" />,
      onClick: (item: LotTracabilite) => handleDeleteClick(item),
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
            <Tag className="h-5 w-5 text-cyan-500" />
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
              Lots / Séries
            </h1>
          </div>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
            Traçabilité des lots et numéros de série
          </p>
        </div>
        <Button
          onClick={() => router.push("/dashboard/stock/lots/nouveau")}
          className="bg-cyan-600 hover:bg-cyan-700"
        >
          <Plus className="h-4 w-4 mr-2" />
          Nouveau lot
        </Button>
      </div>

      <Card>
        <CardHeader className="pb-2">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <CardTitle className="text-sm font-medium text-gray-500 dark:text-gray-400">
              {data?.total ?? 0} lot(s)
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
                  placeholder="Rechercher par nom, code, produit..."
                  value={searchInput}
                  onChange={(e) => setSearchInput(e.target.value)}
                  onKeyDown={handleKeyDown}
                  className="pl-9"
                />
              </div>
            </div>
            <Button onClick={handleSearchSubmit} className="bg-cyan-600 hover:bg-cyan-700 text-white">
              <Search className="h-4 w-4 mr-2" /> Rechercher
            </Button>
            {searchInput && (
              <Button variant="ghost" onClick={handleClearSearch} className="text-gray-500 hover:text-gray-700">
                <Trash2 className="h-4 w-4 mr-2" /> Effacer
              </Button>
            )}
            <div className="flex items-center gap-2">
              <Filter className="h-4 w-4 text-gray-400" />
              <Select value={statutFilter} onValueChange={handleStatutChange}>
                <SelectTrigger className="w-[160px]">
                  <SelectValue placeholder="Tous les statuts" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Tous les statuts</SelectItem>
                  <SelectItem value="actif">Actif</SelectItem>
                  <SelectItem value="epuise">Épuisé</SelectItem>
                  <SelectItem value="perime">Périmé</SelectItem>
                  <SelectItem value="bloque">Bloqué</SelectItem>
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
            emptyMessage="Aucun lot trouvé"
            emptyIcon={<Tag className="h-12 w-12" />}
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
        description={`Êtes-vous sûr de vouloir supprimer le lot "${itemToDelete?.nom || itemToDelete?.code || ''}" ? Cette action est irréversible.`}
        confirmLabel="Supprimer"
        cancelLabel="Annuler"
        variant="danger"
        isLoading={deleteMutation.isPending}
      />
    </div>
  );
}
