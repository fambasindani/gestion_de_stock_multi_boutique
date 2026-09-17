"use client";
import { liveSearch } from "@/lib/utils/liveSearch";
import { DEVISE } from "@/lib/utils/currency";

import React, { useState, Suspense } from "react";
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
import { facturesService } from "@/lib/api/services/factures.service";
import { EcritureComptable } from "@/lib/api/typess";
import {
  Plus, FileText, Search, RefreshCw, Filter, Trash2, Eye, Pencil,
  Loader2
} from "lucide-react";
import { formatDateShort } from "@/lib/utils/format";

const statutLabels: Record<string, string> = {
  brouillon: "Brouillon",
  validee: "Validée",
  envoyee: "Envoyée",
  payee: "Payée",
  annulee: "Annulée",
};

const statutVariants: Record<string, "default" | "success" | "warning" | "danger" | "info" | "outline"> = {
  brouillon: "default",
  validee: "info",
  envoyee: "warning",
  payee: "success",
  annulee: "danger",
};

const typeLabels: Record<string, string> = {
  facture_client: "Facture client",
  avoir_client: "Avoir client",
  facture_fournisseur: "Facture fournisseur",
  avoir_fournisseur: "Avoir fournisseur",
};

export default function FacturesPageWrapper() {
  return (
    <Suspense fallback={<div className="p-8 text-center text-gray-500">Chargement...</div>}>
      <FacturesPage />
    </Suspense>
  );
}

function FacturesPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const queryClient = useQueryClient();

  const typeParam = searchParams.get("type") || "all";
  const statutParam = searchParams.get("statut") || "all";
  const searchParam = searchParams.get("search") || "";

  const [searchInput, setSearchInput] = useState(searchParam);
  const [search, setSearch] = useState(searchParam);
  const [page, setPage] = useState(1);
  const [perPage, setPerPage] = useState(10);
  const [typeFilter, setTypeFilter] = useState<string>(typeParam);
  const [statutFilter, setStatutFilter] = useState<string>(statutParam);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [itemToDelete, setItemToDelete] = useState<EcritureComptable | null>(null);

  const { data, isLoading, refetch } = useQuery({
    queryKey: ["factures", page, perPage, search, typeFilter, statutFilter],
    queryFn: async () => {
      const response = await facturesService.getAll({
        page,
        per_page: perPage,
        search: search || undefined,
        type: typeFilter !== "all" ? typeFilter : undefined,
        statut: statutFilter !== "all" ? statutFilter : undefined,
      });
      return response;
    },
    staleTime: 2 * 60 * 1000,
    retry: 1,
  });

  const deleteMutation = useMutation({
    mutationFn: (id: number) => facturesService.delete(id),
    onSuccess: () => {
      toast.success("Facture supprimée");
      queryClient.invalidateQueries({ queryKey: ["factures"] });
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
  };

  const handlePageChange = (newPage: number) => setPage(newPage);

  const handlePerPageChange = (newPerPage: string) => {
    setPerPage(Number(newPerPage));
    setPage(1);
  };

  const handleTypeChange = (type: string) => {
    setTypeFilter(type);
    setPage(1);
  };

  const handleStatutChange = (statut: string) => {
    setStatutFilter(statut);
    setPage(1);
  };

  const handleDeleteClick = (item: EcritureComptable) => {
    setItemToDelete(item);
    setDeleteDialogOpen(true);
  };

  const handleConfirmDelete = () => {
    if (itemToDelete) {
      deleteMutation.mutate(itemToDelete.id);
    }
  };

  const columns = [
    {
      key: "reference",
      label: "Référence",
      render: (item: EcritureComptable) => (
        <span className="font-mono text-sm font-medium">{item.reference}</span>
      ),
    },
    {
      key: "partenaire.nom",
      label: "Partenaire",
      render: (item: EcritureComptable) => (
        <span>{item.partenaire?.nom || "-"}</span>
      ),
    },
    {
      key: "date_emission",
      label: "Date émission",
      hidden: "md" as const,
      render: (item: EcritureComptable) => <span>{formatDateShort(item.date_emission)}</span>,
    },
    {
      key: "montant_ttc",
      label: "Montant TTC",
      render: (item: EcritureComptable) => (
        <span className="font-medium">
          {Number(item.montant_ttc).toLocaleString("fr-FR", { minimumFractionDigits: 2 })} {DEVISE}
        </span>
      ),
    },
    {
      key: "statut",
      label: "Statut",
      render: (item: EcritureComptable) => (
        <DataTableBadge variant={statutVariants[item.statut] || "default"}>
          {statutLabels[item.statut] || item.statut}
        </DataTableBadge>
      ),
    },
    {
      key: "type",
      label: "Type",
      render: (item: EcritureComptable) => (
        <DataTableBadge variant="outline">
          {typeLabels[item.type] || item.type}
        </DataTableBadge>
      ),
    },
  ];

  const actions = [
    {
      label: "Voir",
      icon: <Eye className="h-4 w-4" />,
      onClick: (item: EcritureComptable) => router.push(`/dashboard/factures/${item.id}/details`),
      variant: "ghost" as const,
      className: "text-blue-600 hover:text-blue-700 hover:bg-blue-50 dark:text-blue-400 dark:hover:bg-blue-950/30",
    },
    {
      label: "Modifier",
      icon: <Pencil className="h-4 w-4" />,
      onClick: (item: EcritureComptable) => router.push(`/dashboard/factures/${item.id}/modifier`),
      variant: "ghost" as const,
      className: "text-amber-600 hover:text-amber-700 hover:bg-amber-50 dark:text-amber-400 dark:hover:bg-amber-950/30",
    },
    {
      label: "Supprimer",
      icon: <Trash2 className="h-4 w-4" />,
      onClick: (item: EcritureComptable) => handleDeleteClick(item),
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
              <div className="h-10 w-40 bg-slate-200 dark:bg-slate-700 rounded animate-pulse" />
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
            <FileText className="h-6 w-6 text-blue-500" />
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
              Factures
            </h1>
          </div>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
            Gestion des factures clients et fournisseurs
          </p>
        </div>
        <Button
          onClick={() => router.push("/dashboard/factures/nouveau")}
          className="bg-blue-600 hover:bg-blue-700"
        >
          <Plus className="h-4 w-4 mr-2" />
          Nouvelle facture
        </Button>
      </div>

      <Card>
        <CardHeader className="pb-2">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <CardTitle className="text-sm font-medium text-gray-500 dark:text-gray-400">
              {pagination.total} facture(s)
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
                  placeholder="Rechercher par référence, partenaire..."
                  value={searchInput}
                  onChange={(e) => { const v = e.target.value; setSearchInput(v); liveSearch(() => { setSearch(v); setPage(1); }); }}
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
              <Select value={typeFilter} onValueChange={handleTypeChange}>
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Tous les types" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Tous les types</SelectItem>
                  <SelectItem value="facture_client">Factures client</SelectItem>
                  <SelectItem value="avoir_client">Avoirs client</SelectItem>
                  <SelectItem value="avoir_fournisseur">Avoirs fournisseur</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex items-center gap-2">
              <Select value={statutFilter} onValueChange={handleStatutChange}>
                <SelectTrigger className="w-[150px]">
                  <SelectValue placeholder="Tous les statuts" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Tous les statuts</SelectItem>
                  <SelectItem value="brouillon">Brouillon</SelectItem>
                  <SelectItem value="validee">Validée</SelectItem>
                  <SelectItem value="envoyee">Envoyée</SelectItem>
                  <SelectItem value="payee">Payée</SelectItem>
                  <SelectItem value="annulee">Annulée</SelectItem>
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
            emptyMessage="Aucune facture trouvée"
            emptyIcon={<FileText className="h-12 w-12" />}
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
        description={`Êtes-vous sûr de vouloir supprimer la facture "${itemToDelete?.reference || ''}" ? Cette action est irréversible.`}
        confirmLabel="Supprimer"
        cancelLabel="Annuler"
        variant="danger"
        isLoading={deleteMutation.isPending}
      />
    </div>
  );
}
