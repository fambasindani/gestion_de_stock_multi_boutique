"use client";

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
import { auditLogsService } from "@/lib/api/services/audit-logs.service";
import {
  Search, RefreshCw, Filter, Loader2, FileText, Calendar, User
} from "lucide-react";
import { format } from "date-fns";
import { fr } from "date-fns/locale";

const actionLabels: Record<string, string> = {
  create: "Création",
  update: "Modification",
  delete: "Suppression",
  login: "Connexion",
  logout: "Déconnexion",
};

const actionVariants: Record<string, "success" | "info" | "danger" | "warning" | "default"> = {
  create: "success",
  update: "info",
  delete: "danger",
  login: "success",
  logout: "warning",
};

export default function LogsPageWrapper() {
  return (
    <Suspense fallback={<div className="p-8 text-center text-gray-500">Chargement...</div>}>
      <LogsPage />
    </Suspense>
  );
}

function LogsPage() {
  const [searchInput, setSearchInput] = useState("");
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [perPage, setPerPage] = useState(15);
  const [actionFilter, setActionFilter] = useState<string>("all");
  const [entityFilter, setEntityFilter] = useState<string>("all");
  const [dateDebut, setDateDebut] = useState("");
  const [dateFin, setDateFin] = useState("");

  const { data, isLoading, refetch } = useQuery({
    queryKey: ["audit-logs", page, perPage, search, actionFilter, entityFilter, dateDebut, dateFin],
    queryFn: async () => {
      const r = await auditLogsService.getAll({
        page,
        per_page: perPage,
        search: search || undefined,
        action: actionFilter !== "all" ? actionFilter : undefined,
        entity_type: entityFilter !== "all" ? entityFilter : undefined,
        date_debut: dateDebut || undefined,
        date_fin: dateFin || undefined,
      });
      return r;
    },
    staleTime: 2 * 60 * 1000,
  });

  const apiData = data as Record<string, unknown> | undefined;
  const paginator = apiData?.data as Record<string, unknown> | undefined;
  const records = Array.isArray(paginator?.data) ? paginator.data : [];
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
      key: "created_at",
      label: "Date",
      render: (item: any) => (
        <span className="text-xs whitespace-nowrap">
          {item.created_at ? format(new Date(item.created_at), "dd/MM/yyyy HH:mm", { locale: fr }) : "-"}
        </span>
      ),
    },
    {
      key: "user",
      label: "Utilisateur",
      render: (item: any) => (
        <span className="text-sm">{item.user?.nom || item.user?.email || "Système"}</span>
      ),
    },
    {
      key: "action",
      label: "Action",
      render: (item: any) => (
        <DataTableBadge variant={actionVariants[item.action] || "default"}>
          {actionLabels[item.action] || item.action}
        </DataTableBadge>
      ),
    },
    {
      key: "entity_type",
      label: "Entité",
      render: (item: any) => (
        <span className="text-sm font-medium">{item.entity_type || "-"}</span>
      ),
    },
    {
      key: "entity_id",
      label: "ID",
      render: (item: any) => (
        <span className="font-mono text-xs">{item.entity_id ?? "-"}</span>
      ),
    },
    {
      key: "description",
      label: "Description",
      render: (item: any) => (
        <span className="text-sm text-gray-600 dark:text-gray-400 line-clamp-2">{item.description || "-"}</span>
      ),
    },
    {
      key: "ip_address",
      label: "IP",
      render: (item: any) => (
        <span className="text-xs text-gray-400 font-mono">{item.ip_address || "-"}</span>
      ),
    },
  ];

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-3">
            <FileText className="h-6 w-6 text-blue-500" />
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Logs d'activité</h1>
          </div>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
            Journal des actions utilisateurs sur le système
          </p>
        </div>
      </div>

      <Card>
        <CardHeader className="pb-2">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <CardTitle className="text-sm font-medium text-gray-500 dark:text-gray-400">
              {pagination.total} entrée(s)
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
                  onChange={(e) => setSearchInput(e.target.value)}
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
              <Select value={actionFilter} onValueChange={(v) => { setActionFilter(v); setPage(1); }}>
                <SelectTrigger className="w-[150px]">
                  <SelectValue placeholder="Action" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Toutes les actions</SelectItem>
                  <SelectItem value="create">Création</SelectItem>
                  <SelectItem value="update">Modification</SelectItem>
                  <SelectItem value="delete">Suppression</SelectItem>
                  <SelectItem value="login">Connexion</SelectItem>
                  <SelectItem value="logout">Déconnexion</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="flex items-center gap-2">
              <Select value={entityFilter} onValueChange={(v) => { setEntityFilter(v); setPage(1); }}>
                <SelectTrigger className="w-[150px]">
                  <SelectValue placeholder="Entité" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Toutes les entités</SelectItem>
                  <SelectItem value="Produit">Produit</SelectItem>
                  <SelectItem value="CommandeAchat">Commande achat</SelectItem>
                  <SelectItem value="CommandeVente">Commande vente</SelectItem>
                  <SelectItem value="Facture">Facture</SelectItem>
                  <SelectItem value="Partenaire">Partenaire</SelectItem>
                  <SelectItem value="Utilisateur">Utilisateur</SelectItem>
                  <SelectItem value="Lot">Lot</SelectItem>
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
            emptyMessage="Aucun log trouvé"
            emptyIcon={<FileText className="h-12 w-12" />}
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
