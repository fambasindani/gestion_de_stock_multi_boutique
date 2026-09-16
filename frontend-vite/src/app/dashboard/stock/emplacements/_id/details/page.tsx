"use client";

import React from "react";
import { useParams, useRouter } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { SkeletonCard } from "@/components/ui/skeleton";
import { DataTable, DataTableBadge } from "@/components/common/DataTable";
import { emplacementsService } from "@/lib/api/services/emplacements.service";
import { stockService } from "@/lib/api/services/stock.service";
import { QuantiteStock } from "@/lib/api/typess";
import {
  ArrowLeft, Box, MapPin, Warehouse, Pencil, Edit3,
  CheckCircle, XCircle, ChevronRight, Home, Layers, Package
} from "lucide-react";

export default function EmplacementDetails() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const id = Number(params.id);

  const { data: emplacement, isLoading } = useQuery({
    queryKey: ["emplacement", id],
    queryFn: async () => {
      const response = await emplacementsService.getById(id);
      return response.data;
    },
    staleTime: 2 * 60 * 1000,
  });

  const { data: chemin } = useQuery({
    queryKey: ["emplacement-chemin", id],
    queryFn: async () => {
      const response = await emplacementsService.getChemin(id);
      const chemin = response.data;
      return Array.isArray(chemin) ? chemin : (chemin as any)?.data ?? [];
    },
    staleTime: 5 * 60 * 1000,
    enabled: !!id,
  });

  const { data: stocksData } = useQuery({
    queryKey: ["stocks-emplacement", id],
    queryFn: async () => {
      const response = await stockService.resumerEmplacement(id);
      const stocks = response.data;
      return Array.isArray(stocks) ? stocks : (stocks as any)?.data ?? [];
    },
    staleTime: 2 * 60 * 1000,
    enabled: !!id,
  });

  const { data: enfants } = useQuery({
    queryKey: ["emplacement-enfants", id],
    queryFn: async () => {
      const response = await emplacementsService.getArborescence();
      const findEnfants = (items: any[]): any[] => {
        for (const item of items) {
          if (item.id === id) return item.enfants || [];
          if (item.enfants) {
            const found = findEnfants(item.enfants);
            if (found.length > 0) return found;
          }
        }
        return [];
      };
      const enfants_arr = Array.isArray(response.data) ? response.data : (response.data as any)?.data ?? [];
      return findEnfants(enfants_arr);
    },
    staleTime: 2 * 60 * 1000,
    enabled: !!id,
  });

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

  const stockColumns = [
    {
      key: "produit_id",
      label: "Produit",
      render: (item: QuantiteStock) => (
        <div className="flex items-center gap-2">
          <div className="h-8 w-8 rounded-full bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center text-purple-600 dark:text-purple-400 text-xs font-medium">
            <Package className="h-4 w-4" />
          </div>
          <span className="font-medium">{item.produit?.nom || `Produit #${item.produit_id}`}</span>
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
        <span className="font-medium text-emerald-600">{item.quantite_disponible}</span>
      ),
    },
    {
      key: "quantite_reservee",
      label: "Qté Réservée",
      render: (item: QuantiteStock) => (
        <span className="font-medium text-amber-600">{item.quantite_reservee}</span>
      ),
    },
    {
      key: "seuil_minimum",
      label: "Seuil Mini",
      render: (item: QuantiteStock) => (
        <span className="text-sm text-gray-500">{item.seuil_minimum ?? "-"}</span>
      ),
    },
  ];

  if (isLoading) {
    return (
      <div className="max-w-7xl mx-auto p-4 md:p-8 space-y-8 min-h-screen">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-2">
            <SkeletonCard className="h-10 w-24" />
            <SkeletonCard className="h-10 w-64" />
            <div className="flex gap-2">
              <SkeletonCard className="h-6 w-16" />
              <SkeletonCard className="h-6 w-20" />
              <SkeletonCard className="h-6 w-20" />
            </div>
          </div>
          <SkeletonCard className="h-10 w-24" />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="md:col-span-2">
            <SkeletonCard className="h-80" />
          </div>
          <div>
            <SkeletonCard className="h-60" />
          </div>
        </div>
      </div>
    );
  }

  if (!emplacement) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center">
        <Warehouse className="h-16 w-16 text-slate-200 mb-4" />
        <h3 className="text-xl font-bold text-slate-900">Emplacement introuvable</h3>
        <Button onClick={() => router.push("/dashboard/stock/emplacements")} className="mt-6">
          <ArrowLeft className="mr-2 h-4 w-4" /> Retour à la liste
        </Button>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto p-4 md:p-8 space-y-8 bg-slate-50/30 dark:bg-transparent min-h-screen">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <Button variant="ghost" onClick={() => router.back()} className="-ml-4 text-slate-500 hover:text-slate-900">
            <ArrowLeft className="mr-2 h-4 w-4" /> Retour
          </Button>

          {chemin && chemin.length > 0 && (
            <nav className="flex items-center gap-1.5 text-xs text-gray-400 mb-2 mt-1">
              <Home className="h-3 w-3" />
              {chemin.map((emp: any, idx: number) => (
                <React.Fragment key={emp.id}>
                  <ChevronRight className="h-3 w-3" />
                  <button
                    onClick={() => router.push(`/dashboard/stock/emplacements/${emp.id}/details`)}
                    className="hover:text-amber-600 transition-colors"
                  >
                    {emp.nom}
                  </button>
                </React.Fragment>
              ))}
              <ChevronRight className="h-3 w-3" />
              <span className="text-amber-600 font-medium">{emplacement.nom}</span>
            </nav>
          )}

          <h1 className="text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
            {emplacement.nom}
          </h1>
          <div className="flex flex-wrap gap-2 mt-2">
            <DataTableBadge variant={usageVariants[emplacement.usage] || "default"}>
              {emplacement.usage}
            </DataTableBadge>
            <DataTableBadge variant={typeVariants[emplacement.type] || "default"}>
              {emplacement.type}
            </DataTableBadge>
            <Badge
              variant="outline"
              className={`${
                Number(emplacement.actif) === 1
                  ? "bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/30 dark:text-emerald-400"
                  : "bg-red-50 text-red-700 border-red-200 dark:bg-red-950/30 dark:text-red-400"
              }`}
            >
              {Number(emplacement.actif) === 1 ? (
                <CheckCircle className="h-3 w-3 mr-1" />
              ) : (
                <XCircle className="h-3 w-3 mr-1" />
              )}
              {Number(emplacement.actif) === 1 ? "Actif" : "Inactif"}
            </Badge>
            <Badge variant="outline" className="bg-white dark:bg-gray-800">
              Code: {emplacement.code || "N/A"}
            </Badge>
          </div>
        </div>
        <Button
          variant="outline"
          onClick={() => router.push(`/dashboard/stock/emplacements/${emplacement.id}/modifier`)}
        >
          <Pencil className="mr-2 h-4 w-4" /> Modifier
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-2 space-y-6">
          <Card className="border-none shadow-xl shadow-slate-200/50 dark:shadow-none rounded-3xl">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MapPin className="h-4 w-4 text-amber-500" />
                Informations
              </CardTitle>
            </CardHeader>
            <CardContent className="grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-6">
              <div className="space-y-1">
                <p className="text-xs text-slate-400 font-semibold uppercase">Code</p>
                <p className="text-sm font-medium border-b pb-1">{emplacement.code || "-"}</p>
              </div>
              <div className="space-y-1">
                <p className="text-xs text-slate-400 font-semibold uppercase">Parent</p>
                <p className="text-sm font-medium border-b pb-1">
                  {emplacement.parent?.nom ? (
                    <button
                      onClick={() => router.push(`/dashboard/stock/emplacements/${emplacement.parent!.id}/details`)}
                      className="text-amber-600 hover:underline"
                    >
                      {emplacement.parent.nom}
                    </button>
                  ) : "-"}
                </p>
              </div>
              <div className="space-y-1">
                <p className="text-xs text-slate-400 font-semibold uppercase">Usage</p>
                <p className="text-sm font-medium border-b pb-1">{emplacement.usage}</p>
              </div>
              <div className="space-y-1">
                <p className="text-xs text-slate-400 font-semibold uppercase">Type</p>
                <p className="text-sm font-medium border-b pb-1">{emplacement.type}</p>
              </div>
              <div className="space-y-1">
                <p className="text-xs text-slate-400 font-semibold uppercase">Capacité max</p>
                <p className="text-sm font-medium border-b pb-1">
                  {emplacement.capacite_maximale ? `${emplacement.capacite_maximale} ${emplacement.unite_capacite || ""}` : "-"}
                </p>
              </div>
              <div className="space-y-1">
                <p className="text-xs text-slate-400 font-semibold uppercase">Code-barres</p>
                <p className="text-sm font-medium border-b pb-1">{emplacement.code_barres || "-"}</p>
              </div>
            </CardContent>
            {emplacement.description && (
              <CardContent className="pt-0">
                <p className="text-xs text-slate-400 font-semibold uppercase mb-2">Description</p>
                <p className="text-sm text-slate-600 dark:text-slate-300 italic bg-slate-50 dark:bg-gray-800/50 p-4 rounded-xl">
                  {emplacement.description}
                </p>
              </CardContent>
            )}
          </Card>

          <Card className="border-none shadow-xl shadow-slate-200/50 dark:shadow-none rounded-3xl">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Package className="h-4 w-4 text-emerald-500" />
                Stocks présents
              </CardTitle>
            </CardHeader>
            <CardContent>
              <DataTable
                data={stocksData || []}
                columns={stockColumns}
                loading={false}
                emptyMessage="Aucun stock à cet emplacement"
                emptyIcon={<Package className="h-12 w-12" />}
                rowKey="id"
              />
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6">
          <Card className="border-none shadow-xl shadow-slate-200/50 dark:shadow-none rounded-3xl">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Layers className="h-4 w-4 text-amber-500" />
                Sous-emplacements
              </CardTitle>
            </CardHeader>
            <CardContent>
              {(!enfants || enfants.length === 0) ? (
                <div className="text-center py-6">
                  <Box className="h-8 w-8 text-gray-300 mx-auto mb-2" />
                  <p className="text-sm text-gray-500">Aucun sous-emplacement</p>
                </div>
              ) : (
                <div className="space-y-2">
                  {enfants.map((enfant: any) => (
                    <button
                      key={enfant.id}
                      onClick={() => router.push(`/dashboard/stock/emplacements/${enfant.id}/details`)}
                      className="w-full flex items-center gap-3 p-3 rounded-lg border hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors text-left"
                    >
                      <div className="h-8 w-8 rounded-full bg-amber-100 dark:bg-amber-900/30 flex items-center justify-center flex-shrink-0">
                        <Box className="h-4 w-4 text-amber-600" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="text-sm font-medium truncate">{enfant.nom}</p>
                        <p className="text-xs text-gray-400">{enfant.code || ""}</p>
                      </div>
                      <ChevronRight className="h-4 w-4 text-gray-300 flex-shrink-0" />
                    </button>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
