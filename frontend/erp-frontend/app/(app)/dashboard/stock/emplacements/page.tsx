"use client";

import React, { useState, Suspense, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
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
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { EmplacementStock } from "@/lib/api/typess";
import { emplacementsService } from "@/lib/api/services/emplacements.service";
import {
  Warehouse, Plus, Search, RefreshCw, Filter, Trash2, Eye, Pencil,
  CheckCircle, XCircle, ChevronRight, ChevronDown, Layers, Box,
  MapPin, Loader2
} from "lucide-react";

function EmplacementTreeItem({
  item,
  depth = 0,
  onSelect,
}: {
  item: EmplacementStock;
  depth?: number;
  onSelect: (id: number) => void;
}) {
  const hasChildren = item.enfants && item.enfants.length > 0;
  const [open, setOpen] = useState(depth < 1);

  const usageVariants: Record<string, "info" | "warning" | "success" | "default" | "outline"> = {
    fournisseur: "warning",
    client: "info",
    interne: "success",
    inventaire: "default",
    approvisionnement: "warning",
    production: "success",
    transit: "info",
    vue: "outline",
  };

  const typeVariants: Record<string, "info" | "warning" | "danger" | "success"> = {
    normal: "success",
    reserve: "warning",
    qualite: "info",
    quarantine: "danger",
  };

  return (
    <div>
      <div
        className={`flex items-center gap-3 px-3 py-2.5 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors group cursor-pointer ${
          depth > 0 ? "ml-6" : ""
        }`}
        onClick={() => onSelect(item.id)}
      >
        {hasChildren ? (
          <button
            onClick={(e) => {
              e.stopPropagation();
              setOpen(!open);
            }}
            className="p-0.5 hover:bg-gray-200 dark:hover:bg-gray-700 rounded"
          >
            {open ? (
              <ChevronDown className="h-4 w-4 text-gray-400" />
            ) : (
              <ChevronRight className="h-4 w-4 text-gray-400" />
            )}
          </button>
        ) : (
          <div className="w-5" />
        )}
        <div className="flex-1 flex items-center gap-3 min-w-0">
          <div className="h-8 w-8 rounded-full bg-amber-100 dark:bg-amber-900/30 flex items-center justify-center text-amber-600 dark:text-amber-400 flex-shrink-0">
            <Box className="h-4 w-4" />
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <span className="text-xs font-mono bg-gray-100 dark:bg-gray-800 px-1.5 py-0.5 rounded text-gray-500">
                {item.code || "-"}
              </span>
              <span className="font-medium text-sm text-gray-900 dark:text-white truncate">
                {item.nom}
              </span>
            </div>
            <div className="flex items-center gap-2 mt-0.5">
              <DataTableBadge variant={usageVariants[item.usage] || "default"}>
                {item.usage}
              </DataTableBadge>
              <DataTableBadge variant={typeVariants[item.type] || "default"}>
                {item.type}
              </DataTableBadge>
              <span
                className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-medium ${
                  item.actif === 1
                    ? "bg-emerald-50 text-emerald-700 dark:bg-emerald-950/30 dark:text-emerald-400"
                    : "bg-red-50 text-red-700 dark:bg-red-950/30 dark:text-red-400"
                }`}
              >
                {item.actif === 1 ? (
                  <CheckCircle className="h-3 w-3" />
                ) : (
                  <XCircle className="h-3 w-3" />
                )}
                {item.actif === 1 ? "Actif" : "Inactif"}
              </span>
            </div>
          </div>
        </div>
        {item.capacite_maximale && (
          <span className="text-xs text-gray-400 flex-shrink-0 hidden sm:block">
            Cap. {item.capacite_maximale}
          </span>
        )}
      </div>
      {hasChildren && open && (
        <div className="border-l-2 border-gray-200 dark:border-gray-700 ml-5">
          {item.enfants!.map((enfant) => (
            <EmplacementTreeItem
              key={enfant.id}
              item={enfant}
              depth={depth + 1}
              onSelect={onSelect}
            />
          ))}
        </div>
      )}
    </div>
  );
}

export default function EmplacementsPageWrapper() {
  return (
    <Suspense fallback={<div className="p-8 text-center text-gray-500">Chargement...</div>}>
      <EmplacementsPage />
    </Suspense>
  );
}

function EmplacementsPage() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const searchParam = searchParams.get("search") || "";

  const [searchInput, setSearchInput] = useState(searchParam);
  const [search, setSearch] = useState(searchParam);
  const [page, setPage] = useState(1);
  const [perPage, setPerPage] = useState(10);
  const [viewMode, setViewMode] = useState<"arborescence" | "liste">("arborescence");

  const { data: arboData, isLoading: arboLoading } = useQuery({
    queryKey: ["emplacements-arborescence"],
    queryFn: async () => {
      const response = await emplacementsService.getArborescence();
      const arr = response.data;
      return Array.isArray(arr) ? arr : (arr as any)?.data ?? [];
    },
    staleTime: 2 * 60 * 1000,
  });

  const { data: listData, isLoading: listLoading } = useQuery({
    queryKey: ["emplacements", page, perPage, search],
    queryFn: async () => {
      const response = await emplacementsService.getAll({
        page,
        per_page: perPage,
        search: search || undefined,
      });
      return response;
    },
    staleTime: 2 * 60 * 1000,
    retry: 1,
    enabled: viewMode === "liste",
  });

  useEffect(() => {
    const newSearch = searchParams.get("search") || "";
    if (newSearch !== searchInput) {
      setSearchInput(newSearch);
      setSearch(newSearch);
    }
  }, [searchParams]);

  const handleSearchSubmit = () => {
    setSearch(searchInput);
    setPage(1);
    const params = new URLSearchParams();
    if (searchInput) params.set("search", searchInput);
    router.push(`/dashboard/stock/emplacements?${params.toString()}`);
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
    router.push("/dashboard/stock/emplacements");
  };

  const columns = [
    {
      key: "code",
      label: "Code",
      render: (item: EmplacementStock) => (
        <span className="text-xs font-mono bg-gray-100 dark:bg-gray-800 px-2 py-1 rounded">
          {item.code || "-"}
        </span>
      ),
    },
    {
      key: "nom",
      label: "Nom",
      render: (item: EmplacementStock) => (
        <div className="flex items-center gap-2">
          <div className="h-8 w-8 rounded-full bg-amber-100 dark:bg-amber-900/30 flex items-center justify-center text-amber-600 dark:text-amber-400 text-xs font-medium">
            <Box className="h-4 w-4" />
          </div>
          <span className="font-medium">{item.nom}</span>
        </div>
      ),
    },
    {
      key: "usage",
      label: "Usage",
      render: (item: EmplacementStock) => {
        const variants: Record<string, "info" | "warning" | "success" | "default" | "outline"> = {
          fournisseur: "warning",
          client: "info",
          interne: "success",
          inventaire: "default",
          approvisionnement: "warning",
          production: "success",
          transit: "info",
          vue: "outline",
        };
        return (
          <DataTableBadge variant={variants[item.usage] || "default"}>
            {item.usage}
          </DataTableBadge>
        );
      },
    },
    {
      key: "type",
      label: "Type",
      render: (item: EmplacementStock) => {
        const variants: Record<string, "info" | "warning" | "danger" | "success"> = {
          normal: "success",
          reserve: "warning",
          qualite: "info",
          quarantine: "danger",
        };
        return (
          <DataTableBadge variant={variants[item.type] || "default"}>
            {item.type}
          </DataTableBadge>
        );
      },
    },
    {
      key: "actif",
      label: "Statut",
      render: (item: EmplacementStock) => (
        <span
          className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium ${
            item.actif === 1
              ? "bg-emerald-50 text-emerald-700 border border-emerald-200 dark:bg-emerald-950/30 dark:text-emerald-400 dark:border-emerald-800"
              : "bg-red-50 text-red-700 border border-red-200 dark:bg-red-950/30 dark:text-red-400 dark:border-red-800"
          }`}
        >
          {item.actif === 1 ? (
            <CheckCircle className="h-3.5 w-3.5" />
          ) : (
            <XCircle className="h-3.5 w-3.5" />
          )}
          {item.actif === 1 ? "Actif" : "Inactif"}
        </span>
      ),
    },
  ];

  const actions = [
    {
      label: "Voir",
      icon: <Eye className="h-4 w-4" />,
      onClick: (item: EmplacementStock) => router.push(`/dashboard/stock/emplacements/${item.id}/details`),
      variant: "ghost" as const,
      className: "text-blue-600 hover:text-blue-700 hover:bg-blue-50 dark:text-blue-400 dark:hover:bg-blue-950/30",
    },
    {
      label: "Modifier",
      icon: <Pencil className="h-4 w-4" />,
      onClick: (item: EmplacementStock) => router.push(`/dashboard/stock/emplacements/${item.id}/modifier`),
      variant: "ghost" as const,
      className: "text-amber-600 hover:text-amber-700 hover:bg-amber-50 dark:text-amber-400 dark:hover:bg-amber-950/30",
    },
  ];

  const apiData = listData as Record<string, unknown> | undefined;
  const paginator = apiData?.data as Record<string, unknown> | undefined;
  const records = Array.isArray(paginator?.data) ? paginator.data : [];
  const pagination = { current_page: (paginator?.current_page as number) ?? 1, per_page: (paginator?.per_page as number) ?? 10, total: (paginator?.total as number) ?? 0, last_page: (paginator?.last_page as number) ?? 1 };

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-3">
            <Warehouse className="h-5 w-5 text-amber-500" />
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
              Emplacements
            </h1>
          </div>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
            Gestion des emplacements de stock
          </p>
        </div>
        <Button
          onClick={() => router.push("/dashboard/stock/emplacements/nouveau")}
          className="bg-amber-600 hover:bg-amber-700"
        >
          <Plus className="h-4 w-4 mr-2" />
          Nouvel emplacement
        </Button>
      </div>

      <Card>
        <CardHeader className="pb-2">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <CardTitle className="text-sm font-medium text-gray-500 dark:text-gray-400">
                {viewMode === "arborescence"
                  ? `Arborescence (${arboData?.length || 0} racine(s))`
                  : `${pagination.total} emplacement(s)`}
              </CardTitle>
              <div className="flex items-center border rounded-lg p-0.5 bg-gray-100 dark:bg-gray-800">
                <button
                  onClick={() => setViewMode("arborescence")}
                  className={`px-3 py-1 text-xs rounded-md transition-colors ${
                    viewMode === "arborescence"
                      ? "bg-white dark:bg-gray-700 shadow-sm font-medium"
                      : "text-gray-500 hover:text-gray-700"
                  }`}
                >
                  <Layers className="h-3.5 w-3.5 inline mr-1" />
                  Arborescence
                </button>
                <button
                  onClick={() => setViewMode("liste")}
                  className={`px-3 py-1 text-xs rounded-md transition-colors ${
                    viewMode === "liste"
                      ? "bg-white dark:bg-gray-700 shadow-sm font-medium"
                      : "text-gray-500 hover:text-gray-700"
                  }`}
                >
                  <MapPin className="h-3.5 w-3.5 inline mr-1" />
                  Liste
                </button>
              </div>
            </div>
            {viewMode === "liste" && (
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
            )}
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-3 mb-4">
            <div className="flex-1 min-w-[200px]">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Rechercher par nom, code..."
                  value={searchInput}
                  onChange={(e) => setSearchInput(e.target.value)}
                  onKeyDown={handleKeyDown}
                  className="pl-9"
                />
              </div>
            </div>
            <Button
              onClick={handleSearchSubmit}
              className="bg-amber-600 hover:bg-amber-700 text-white"
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
            <Button variant="outline" onClick={() => {}}>
              <RefreshCw className="h-4 w-4 mr-2" />
              Actualiser
            </Button>
          </div>

          {viewMode === "arborescence" ? (
            arboLoading ? (
              <div className="space-y-2">
                {Array.from({ length: 5 }).map((_, i) => (
                  <div key={i} className="flex items-center gap-3 p-3 animate-pulse">
                    <div className="h-4 w-4 bg-slate-200 dark:bg-slate-700 rounded" />
                    <div className="h-8 w-8 bg-slate-200 dark:bg-slate-700 rounded-full" />
                    <div className="flex-1 space-y-2">
                      <div className="h-4 w-48 bg-slate-200 dark:bg-slate-700 rounded" />
                      <div className="flex gap-2">
                        <div className="h-5 w-16 bg-slate-200 dark:bg-slate-700 rounded" />
                        <div className="h-5 w-16 bg-slate-200 dark:bg-slate-700 rounded" />
                        <div className="h-5 w-14 bg-slate-200 dark:bg-slate-700 rounded" />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : !arboData || arboData.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12 text-center">
                <Warehouse className="h-12 w-12 text-gray-300" />
                <h3 className="mt-4 text-lg font-medium text-gray-900 dark:text-white">
                  Aucun emplacement
                </h3>
                <p className="mt-1 text-sm text-gray-500">
                  Créez votre premier emplacement pour commencer.
                </p>
                <Button
                  onClick={() => router.push("/dashboard/stock/emplacements/nouveau")}
                  className="mt-4 bg-amber-600 hover:bg-amber-700"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Nouvel emplacement
                </Button>
              </div>
            ) : (
              <div className="rounded-lg border divide-y divide-gray-100 dark:divide-gray-800">
                {arboData.map((item: any) => (
                  <EmplacementTreeItem
                    key={item.id}
                    item={item}
                    onSelect={(id) => router.push(`/dashboard/stock/emplacements/${id}/details`)}
                  />
                ))}
              </div>
            )
          ) : (
            <DataTable
              data={records}
              columns={columns}
              actions={actions}
              loading={listLoading}
              emptyMessage="Aucun emplacement trouvé"
              emptyIcon={<Warehouse className="h-12 w-12" />}
              pagination={{
                currentPage: pagination.current_page,
                totalPages: pagination.last_page,
                totalItems: pagination.total,
                perPage: pagination.per_page,
                onPageChange: setPage,
              }}
              rowKey="id"
            />
          )}
        </CardContent>
      </Card>
    </div>
  );
}
