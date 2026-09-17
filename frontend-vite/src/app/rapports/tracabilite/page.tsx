"use client";
import { liveSearch } from "@/lib/utils/liveSearch";

import React, { useState, Suspense } from "react";
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
import { operationsService } from "@/lib/api/services/operations.service";
import { produitsService } from "@/lib/api/services/produits.service";
import { lotsService } from "@/lib/api/services/lots.service";
import { LigneOperationStock } from "@/lib/api/typess";
import {
  Search, RefreshCw, Filter, Loader2, ClipboardList, Package, Tag, Calendar
} from "lucide-react";
import { format } from "date-fns";
import { fr } from "date-fns/locale";

const typeOperationLabels: Record<string, string> = {
  prelevement: "Prélèvement",
  reception: "Réception",
  scan: "Scan",
};

const typeOperationVariants: Record<string, "info" | "success" | "warning" | "default"> = {
  prelevement: "warning",
  reception: "success",
  scan: "info",
};

export default function TracabilitePageWrapper() {
  return (
    <Suspense fallback={<div className="p-8 text-center text-gray-500">Chargement...</div>}>
      <TracabilitePage />
    </Suspense>
  );
}

function TracabilitePage() {
  const [searchInput, setSearchInput] = useState("");
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [perPage, setPerPage] = useState(15);
  const [typeFilter, setTypeFilter] = useState<string>("all");
  const [produitFilter, setProduitFilter] = useState<string>("all");
  const [lotFilter, setLotFilter] = useState<string>("all");
  const [dateDebut, setDateDebut] = useState("");
  const [dateFin, setDateFin] = useState("");

  const { data: produitsList } = useQuery({
    queryKey: ["produits-traca"],
    queryFn: async () => {
      const r = await produitsService.getAll({ per_page: 1000, actif: true });
      return (r.data as any)?.data ?? [];
    },
    staleTime: 5 * 60 * 1000,
  });

  const { data: lotsList } = useQuery({
    queryKey: ["lots-traca"],
    queryFn: async () => {
      const r = await lotsService.getAll({ per_page: 1000 });
      return (r.data as any)?.data ?? [];
    },
    staleTime: 5 * 60 * 1000,
  });

  const { data, isLoading, refetch } = useQuery({
    queryKey: ["operations-traca", page, perPage, search, typeFilter, produitFilter, lotFilter, dateDebut, dateFin],
    queryFn: async () => {
      const r = await operationsService.getAll({
        page,
        per_page: perPage,
        search: search || undefined,
        type_operation: typeFilter !== "all" ? typeFilter : undefined,
        produit_id: produitFilter !== "all" ? Number(produitFilter) : undefined,
        lot_id: lotFilter !== "all" ? Number(lotFilter) : undefined,
        date_debut: dateDebut || undefined,
        date_fin: dateFin || undefined,
      });
      return r;
    },
    staleTime: 2 * 60 * 1000,
  });

  const apiData = data as Record<string, unknown> | undefined;
  const paginator = apiData?.data as Record<string, unknown> | undefined;
  const records = Array.isArray(paginator?.data) ? paginator.data as LigneOperationStock[] : [];
  const pagination = {
    current_page: (paginator?.current_page as number) ?? 1,
    per_page: (paginator?.per_page as number) ?? perPage,
    total: (paginator?.total as number) ?? 0,
    last_page: (paginator?.last_page as number) ?? 1,
  };

  const handleSearch = () => {
    setSearch(searchInput);
    setPage(1);
  };

  const columns = [
    {
      key: "date_operation",
      label: "Date",
      render: (item: LigneOperationStock) => (
        <span className="text-xs whitespace-nowrap">
          {item.date_operation ? format(new Date(item.date_operation), "dd/MM/yyyy HH:mm", { locale: fr }) : "-"}
        </span>
      ),
    },
    {
      key: "type_operation",
      label: "Type",
      render: (item: LigneOperationStock) => (
        <DataTableBadge variant={typeOperationVariants[item.type_operation] || "default"}>
          {typeOperationLabels[item.type_operation] || item.type_operation}
        </DataTableBadge>
      ),
    },
    {
      key: "produit",
      label: "Produit",
      render: (item: LigneOperationStock) => (
        <span className="font-medium text-sm">{item.produit?.nom || item.produit?.modele?.nom || `#${item.produit_id}`}</span>
      ),
    },
    {
      key: "lot",
      label: "Lot",
      render: (item: LigneOperationStock) => (
        <span className="font-mono text-xs">{item.lot?.nom || item.lot?.code || (item.lot_id ? `#${item.lot_id}` : "-")}</span>
      ),
    },
    {
      key: "quantite_traitee",
      label: "Quantité",
      render: (item: LigneOperationStock) => (
        <span className="font-semibold">{Number(item.quantite_traitee).toFixed(2)}</span>
      ),
    },
    {
      key: "emplacement_source",
      label: "De",
      render: (item: LigneOperationStock) => (
        <span className="text-xs">{item.emplacementSource?.nom || `#${item.emplacement_source_id}`}</span>
      ),
    },
    {
      key: "emplacement_destination",
      label: "Vers",
      render: (item: LigneOperationStock) => (
        <span className="text-xs">{item.emplacementDestination?.nom || `#${item.emplacement_destination_id}`}</span>
      ),
    },
    {
      key: "utilisateur",
      label: "Utilisateur",
      render: (item: LigneOperationStock) => (
        <span className="text-xs text-gray-500">{item.utilisateur_id ? `#${item.utilisateur_id}` : "-"}</span>
      ),
    },
  ];

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-3">
            <ClipboardList className="h-6 w-6 text-blue-500" />
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Traçabilité</h1>
          </div>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
            Historique des opérations de stock avec filtres par lot, produit, date et type
          </p>
        </div>
      </div>

      <Card>
        <CardHeader className="pb-2">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <CardTitle className="text-sm font-medium text-gray-500 dark:text-gray-400">
              {pagination.total} opération(s)
            </CardTitle>
            <div className="flex items-center gap-2">
              <span className="text-sm text-gray-500">Afficher</span>
              <Select value={String(perPage)} onValueChange={(v) => { setPerPage(Number(v)); setPage(1); }}>
                <SelectTrigger className="w-[70px] h-8">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="15">15</SelectItem>
                  <SelectItem value="30">30</SelectItem>
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
                  placeholder="Rechercher..."
                  value={searchInput}
                  onChange={(e) => { const v = e.target.value; setSearchInput(v); liveSearch(() => { setSearch(v); setPage(1); }); }}
                  onKeyDown={(e) => { if (e.key === "Enter") handleSearch(); }}
                  className="pl-9"
                />
              </div>
            </div>
            <Button onClick={handleSearch} className="bg-blue-600 hover:bg-blue-700 text-white">
              <Search className="h-4 w-4 mr-2" /> Rechercher
            </Button>

            <div className="flex items-center gap-2">
              <Filter className="h-4 w-4 text-gray-400" />
              <Select value={typeFilter} onValueChange={(v) => { setTypeFilter(v); setPage(1); }}>
                <SelectTrigger className="w-[150px]">
                  <SelectValue placeholder="Type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Tous les types</SelectItem>
                  <SelectItem value="prelevement">Prélèvement</SelectItem>
                  <SelectItem value="reception">Réception</SelectItem>
                  <SelectItem value="scan">Scan</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="flex items-center gap-2">
              <Select value={produitFilter} onValueChange={(v) => { setProduitFilter(v); setPage(1); }}>
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Produit" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Tous les produits</SelectItem>
                  {(produitsList || []).map((p: any) => (
                    <SelectItem key={p.id} value={String(p.id)}>{p.nom}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="flex items-center gap-2">
              <Select value={lotFilter} onValueChange={(v) => { setLotFilter(v); setPage(1); }}>
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Lot" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Tous les lots</SelectItem>
                  {(lotsList || []).map((l: any) => (
                    <SelectItem key={l.id} value={String(l.id)}>{l.nom || l.code || `#${l.id}`}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="flex items-center gap-2">
              <Input
                type="date"
                value={dateDebut}
                onChange={(e) => { setDateDebut(e.target.value); setPage(1); }}
                className="w-[140px]"
                placeholder="Date début"
              />
              <span className="text-gray-400">-</span>
              <Input
                type="date"
                value={dateFin}
                onChange={(e) => { setDateFin(e.target.value); setPage(1); }}
                className="w-[140px]"
                placeholder="Date fin"
              />
            </div>

            <Button variant="outline" onClick={() => refetch()}>
              <RefreshCw className="h-4 w-4 mr-2" /> Actualiser
            </Button>
          </div>

          <DataTable
            data={records}
            columns={columns}
            loading={isLoading}
            emptyMessage="Aucune opération trouvée"
            emptyIcon={<ClipboardList className="h-12 w-12" />}
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
