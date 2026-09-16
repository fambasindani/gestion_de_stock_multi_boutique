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
import { facturesService } from "@/lib/api/services/factures.service";
import { EcritureComptable } from "@/lib/api/typess";
import {
  CreditCard, Search, RefreshCw, Eye, DollarSign, Loader2, Trash2
} from "lucide-react";
import { formatDateShort } from "@/lib/utils/format";

export default function PaiementsPage() {
  const router = useRouter();
  const queryClient = useQueryClient();

  const [searchInput, setSearchInput] = useState("");
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [perPage, setPerPage] = useState(10);

  const { data, isLoading, refetch } = useQuery({
    queryKey: ["factures-paiements", page, perPage, search],
    queryFn: async () => {
      const response = await facturesService.getAll({
        page,
        per_page: perPage,
        search: search || undefined,
        statut: "payee",
      });
      return response;
    },
    staleTime: 2 * 60 * 1000,
    retry: 1,
  });

  const handleSearchSubmit = () => { setSearch(searchInput); setPage(1); };
  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => { if (e.key === "Enter") { e.preventDefault(); handleSearchSubmit(); } };
  const handleClearSearch = () => { setSearchInput(""); setSearch(""); setPage(1); };
  const handlePageChange = (newPage: number) => setPage(newPage);
  const handlePerPageChange = (newPerPage: string) => { setPerPage(Number(newPerPage)); setPage(1); };

  const columns = [
    { key: "reference", label: "Référence", render: (item: EcritureComptable) => <span className="font-mono text-sm font-medium">{item.reference}</span> },
    { key: "partenaire.nom", label: "Partenaire", render: (item: EcritureComptable) => <span>{item.partenaire?.nom || "-"}</span> },
    { key: "date_paiement", label: "Date paiement", render: (item: EcritureComptable) => <span>{formatDateShort(item.date_paiement || item.date_emission)}</span> },
    { key: "montant_ttc", label: "Montant TTC", render: (item: EcritureComptable) => <span className="font-medium">{Number(item.montant_ttc).toLocaleString("fr-FR", { minimumFractionDigits: 2 })} CDF</span> },
    { key: "montant_paye", label: "Payé", render: (item: EcritureComptable) => <span className="font-medium text-emerald-600">{Number(item.montant_paye).toLocaleString("fr-FR", { minimumFractionDigits: 2 })} CDF</span> },
    { key: "mode_paiement", label: "Mode", render: (item: EcritureComptable) => item.mode_paiement ? <DataTableBadge variant="outline">{item.mode_paiement}</DataTableBadge> : "-" },
  ];

  const actions = [
    { label: "Voir", icon: <Eye className="h-4 w-4" />, onClick: (item: EcritureComptable) => router.push(`/dashboard/factures/${item.id}/details`), variant: "ghost" as const, className: "text-blue-600 hover:text-blue-700 hover:bg-blue-50 dark:text-blue-400 dark:hover:bg-blue-950/30" },
  ];

  const apiData = data as Record<string, unknown> | undefined;
  const paginator = apiData?.data as Record<string, unknown> | undefined;
  const records = Array.isArray(paginator?.data) ? paginator.data : [];
  const pagination = { current_page: (paginator?.current_page as number) ?? 1, per_page: (paginator?.per_page as number) ?? 10, total: (paginator?.total as number) ?? 0, last_page: (paginator?.last_page as number) ?? 1 };

  if (isLoading && !data) {
    return (
      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div><div className="flex items-center gap-3"><div className="h-8 w-8 bg-slate-200 dark:bg-slate-700 rounded animate-pulse" /><div className="h-8 w-48 bg-slate-200 dark:bg-slate-700 rounded animate-pulse" /></div><div className="h-4 w-64 bg-slate-200 dark:bg-slate-700 rounded animate-pulse mt-1" /></div>
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
            <CreditCard className="h-6 w-6 text-emerald-500" />
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Paiements</h1>
          </div>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Factures payées</p>
        </div>
      </div>

      <Card>
        <CardHeader className="pb-2">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <CardTitle className="text-sm font-medium text-gray-500 dark:text-gray-400">{data?.total ?? 0} paiement(s)</CardTitle>
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
                <Input placeholder="Rechercher par référence..." value={searchInput} onChange={(e) => setSearchInput(e.target.value)} onKeyDown={handleKeyDown} className="pl-9" />
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
            emptyMessage="Aucun paiement trouvé"
            emptyIcon={<CreditCard className="h-12 w-12" />}
            pagination={{ currentPage: pagination.current_page, totalPages: pagination.last_page, totalItems: pagination.total, perPage: pagination.per_page, onPageChange: handlePageChange }}
            rowKey="id"
          />
        </CardContent>
      </Card>
    </div>
  );
}
