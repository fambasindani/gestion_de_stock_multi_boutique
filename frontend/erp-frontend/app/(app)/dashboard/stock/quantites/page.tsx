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
import { QuantiteStock, EmplacementStock } from "@/lib/api/typess";
import { stockService } from "@/lib/api/services/stock.service";
import { emplacementsService } from "@/lib/api/services/emplacements.service";
import {
  Package, Search, RefreshCw, Filter, Trash2, Plus,
  ArrowLeftRight, Warehouse, Loader2
} from "lucide-react";

export default function StockQuantitesPageWrapper() {
  return (
    <Suspense fallback={<div className="p-8 text-center text-gray-500">Chargement...</div>}>
      <StockQuantitesPage />
    </Suspense>
  );
}

function StockQuantitesPage() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const searchParam = searchParams.get("search") || "";
  const emplacementParam = searchParams.get("emplacement_id") || "";

  const [searchInput, setSearchInput] = useState(searchParam);
  const [search, setSearch] = useState(searchParam);
  const [page, setPage] = useState(1);
  const [perPage, setPerPage] = useState(10);
  const [emplacementFilter, setEmplacementFilter] = useState(emplacementParam);

  const { data, isLoading, refetch } = useQuery({
    queryKey: ["stocks", page, perPage, search, emplacementFilter],
    queryFn: async () => {
      const response = await stockService.getAll({
        page,
        per_page: perPage,
        search: search || undefined,
        emplacement_id: emplacementFilter ? Number(emplacementFilter) : undefined,
      });
      return response;
    },
    staleTime: 2 * 60 * 1000,
    retry: 1,
    enabled: true,
  });

  const { data: emplacementsList } = useQuery({
    queryKey: ["emplacements-all"],
    queryFn: async () => {
      const response = await emplacementsService.getAll({ per_page: 1000 });
      const emps = response.data;
      return Array.isArray(emps) ? emps : (emps as any)?.data ?? [];
    },
    staleTime: 5 * 60 * 1000,
  });

  useEffect(() => {
    const newSearch = searchParams.get("search") || "";
    const newEmp = searchParams.get("emplacement_id") || "";
    if (newSearch !== searchInput) {
      setSearchInput(newSearch);
      setSearch(newSearch);
    }
    if (newEmp !== emplacementFilter) setEmplacementFilter(newEmp);
    refetch();
  }, [searchParams]);

  const handleSearchSubmit = () => {
    setSearch(searchInput);
    setPage(1);
    const params = new URLSearchParams();
    if (searchInput) params.set("search", searchInput);
    if (emplacementFilter) params.set("emplacement_id", emplacementFilter);
    router.push(`/dashboard/stock/quantites?${params.toString()}`);
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
    if (emplacementFilter) params.set("emplacement_id", emplacementFilter);
    router.push(`/dashboard/stock/quantites?${params.toString()}`);
  };

  const handleEmplacementChange = (value: string) => {
    setEmplacementFilter(value);
    setPage(1);
    const params = new URLSearchParams();
    if (search) params.set("search", search);
    if (value) params.set("emplacement_id", value);
    router.push(`/dashboard/stock/quantites?${params.toString()}`);
  };

  const columns = [
    {
      key: "produit_id",
      label: "Produit",
      render: (item: QuantiteStock) => (
        <div className="flex items-center gap-2">
          <div className="h-8 w-8 rounded-full bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center text-purple-600 dark:text-purple-400 text-xs font-medium">
            <Package className="h-4 w-4" />
          </div>
          <div>
            <span className="font-medium">{item.produit?.nom || `Produit #${item.produit_id}`}</span>
            {item.produit?.code_interne && (
              <span className="text-xs text-gray-400 ml-2 font-mono">{item.produit.code_interne}</span>
            )}
          </div>
        </div>
      ),
    },
    {
      key: "emplacement_id",
      label: "Emplacement",
      render: (item: QuantiteStock) => (
        <div className="flex items-center gap-1.5">
          <Warehouse className="h-3.5 w-3.5 text-amber-400" />
          <span className="text-sm">{item.emplacement?.nom || `#${item.emplacement_id}`}</span>
        </div>
      ),
    },
    {
      key: "lot_id",
      label: "Lot",
      render: (item: QuantiteStock) => (
        <span className="text-sm text-gray-600 dark:text-gray-400">
          {item.lot?.nom || item.lot?.code || "-"}
        </span>
      ),
    },
    {
      key: "quantite_disponible",
      label: "Qté Disponible",
      render: (item: QuantiteStock) => (
        <span className="font-semibold text-emerald-600 dark:text-emerald-400">
          {item.quantite_disponible}
        </span>
      ),
    },
    {
      key: "quantite_reservee",
      label: "Qté Réservée",
      render: (item: QuantiteStock) => (
        <span className="font-semibold text-amber-600 dark:text-amber-400">
          {item.quantite_reservee}
        </span>
      ),
    },
    {
      key: "seuil_minimum",
      label: "Seuil Mini",
      render: (item: QuantiteStock) => (
        <span className="text-sm text-gray-500">{item.seuil_minimum ?? "-"}</span>
      ),
    },
    {
      key: "seuil_maximum",
      label: "Seuil Maxi",
      render: (item: QuantiteStock) => (
        <span className="text-sm text-gray-500">{item.seuil_maximum ?? "-"}</span>
      ),
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

  const emplacementOptions = (emplacementsList || []).map((emp: EmplacementStock) => ({
    value: String(emp.id),
    label: emp.nom,
  }));

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-3">
            <Package className="h-5 w-5 text-emerald-500" />
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
              Quantités Stock
            </h1>
          </div>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
            Suivi des niveaux de stock par produit et emplacement
          </p>
        </div>
        <div className="flex gap-2">
          <Button
            onClick={() => router.push("/dashboard/stock/quantites/nouveau")}
            className="bg-emerald-600 hover:bg-emerald-700"
          >
            <Plus className="h-4 w-4 mr-2" />
            Nouveau
          </Button>
          <Button
            variant="outline"
            onClick={() => router.push("/dashboard/stock/transferts/nouveau")}
          >
            <ArrowLeftRight className="h-4 w-4 mr-2" />
            Mouvement
          </Button>
        </div>
      </div>

      <Card>
        <CardHeader className="pb-2">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <CardTitle className="text-sm font-medium text-gray-500 dark:text-gray-400">
              {data?.total ?? 0} ligne(s) de stock
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
                  placeholder="Rechercher par produit, code..."
                  value={searchInput}
                  onChange={(e) => setSearchInput(e.target.value)}
                  onKeyDown={handleKeyDown}
                  className="pl-9"
                />
              </div>
            </div>
            <Button
              onClick={handleSearchSubmit}
              className="bg-emerald-600 hover:bg-emerald-700 text-white"
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
              <Select value={emplacementFilter} onValueChange={handleEmplacementChange}>
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Tous les emplacements" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Tous les emplacements</SelectItem>
                  {emplacementOptions.map((opt: any) => (
                    <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>
                  ))}
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
            loading={isLoading}
            emptyMessage="Aucune ligne de stock trouvée"
            emptyIcon={<Package className="h-12 w-12" />}
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
    </div>
  );
}
