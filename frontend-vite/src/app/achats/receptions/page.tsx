"use client";
import { liveSearch } from "@/lib/utils/liveSearch";
import { DEVISE } from "@/lib/utils/currency";

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
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  DataTable,
  DataTableBadge,
} from "@/components/common/DataTable";
import { SkeletonTable } from "@/components/ui/skeleton";
import { commandesAchatService } from "@/lib/api/services/commandes-achat.service";
import { CommandeAchat, LigneCommandeAchat } from "@/lib/api/typess";
import { formatDateShort } from "@/lib/utils/format";
import {
  Truck, Search, RefreshCw, Filter, Eye, Archive, PackageCheck,
  Loader2, Plus, X,
} from "lucide-react";

const statusConfig: Record<string, { label: string; variant: "default" | "success" | "warning" | "danger" | "info" | "outline" }> = {
  envoye: { label: "Envoyé", variant: "warning" },
  recu: { label: "Reçu", variant: "success" },
  termine: { label: "Terminé", variant: "success" },
};

export default function ReceptionsPageWrapper() {
  return (
    <Suspense fallback={<div className="p-8 text-center text-gray-500">Chargement...</div>}>
      <ReceptionsPage />
    </Suspense>
  );
}

function ReceptionsPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const queryClient = useQueryClient();

  const searchParam = searchParams.get("search") || "";
  const etatParam = searchParams.get("etat") || "all";

  const [searchInput, setSearchInput] = useState(searchParam);
  const [search, setSearch] = useState(searchParam);
  const [page, setPage] = useState(1);
  const [perPage, setPerPage] = useState(10);
  const [etatFilter, setEtatFilter] = useState<string>(etatParam);
  const [receptionDialogOpen, setReceptionDialogOpen] = useState(false);
  const [itemToReceptionner, setItemToReceptionner] = useState<CommandeAchat | null>(null);
  const [ligneReceptions, setLigneReceptions] = useState<Record<number, { quantite_recue: number; lot: boolean; lot_nom: string; lot_date_production: string; lot_date_peremption: string }>>({});

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
    queryKey: ["commandes-achat-receptions", page, perPage, search, etatFilter],
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

  const receptionMutation = useMutation({
    mutationFn: async (payload: { id: number; lignes: unknown[] }) => {
      return commandesAchatService.receptionner(payload.id, { lignes: payload.lignes });
    },
    onSuccess: (data) => {
      if (data.success) {
        toast.success("Réception effectuée avec succès");
        queryClient.invalidateQueries({ queryKey: ["commandes-achat-receptions"] });
        queryClient.invalidateQueries({ queryKey: ["commandes-achat"] });
        refetch();
      } else {
        toast.error(data.message || "Erreur lors de la réception");
      }
      setReceptionDialogOpen(false);
      setItemToReceptionner(null);
      setLigneReceptions({});
    },
    onError: () => {
      toast.error("Erreur lors de la réception");
      setReceptionDialogOpen(false);
      setItemToReceptionner(null);
      setLigneReceptions({});
    },
  });

  const handleSearchSubmit = () => {
    setSearch(searchInput);
    setPage(1);
    const params = new URLSearchParams();
    if (searchInput) params.set("search", searchInput);
    if (etatFilter !== "all") params.set("etat", etatFilter);
    router.push(`/achats/receptions?${params.toString()}`);
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
    router.push(`/achats/receptions?${params.toString()}`);
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
    router.push(`/achats/receptions?${params.toString()}`);
  };

  const handleReceptionnerClick = (item: CommandeAchat) => {
    setItemToReceptionner(item);
    const lignes: Record<number, { quantite_recue: number; lot: boolean; lot_nom: string; lot_date_production: string; lot_date_peremption: string }> = {};
    item.lignes?.forEach((l) => {
      const restante = l.quantite - l.quantite_recue;
      lignes[l.id] = { quantite_recue: restante, lot: false, lot_nom: "", lot_date_production: "", lot_date_peremption: "" };
    });
    setLigneReceptions(lignes);
    setReceptionDialogOpen(true);
  };

  const handleConfirmReception = () => {
    if (!itemToReceptionner) return;
    const lignesPayload: unknown[] = [];
    for (const l of itemToReceptionner.lignes || []) {
      const data = ligneReceptions[l.id];
      if (!data || data.quantite_recue <= 0) continue;
      const ligne: Record<string, unknown> = { id: l.id, quantite_recue: data.quantite_recue };
      if (data.lot) {
        ligne.lot = {
          nom: data.lot_nom || `Lot ${l.nom_produit}`,
          type: "lot",
          date_production: data.lot_date_production || null,
          date_peremption: data.lot_date_peremption || null,
        };
      }
      lignesPayload.push(ligne);
    }
    if (lignesPayload.length === 0) {
      toast.error("Veuillez saisir au moins une quantité à réceptionner");
      return;
    }
    receptionMutation.mutate({ id: itemToReceptionner.id, lignes: lignesPayload });
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
      key: "date_livraison_prevue",
      label: "Livraison prévue",
      render: (item: CommandeAchat) => (
        <span className="text-sm">
          {item.date_livraison_prevue
            ? formatDateShort(item.date_livraison_prevue)
            : "-"}
        </span>
      ),
    },
    {
      key: "montant_total_ttc",
      label: "Total TTC",
      render: (item: CommandeAchat) => (
        <span className="font-medium">
          {Number(item.montant_total_ttc).toLocaleString("fr-FR", { minimumFractionDigits: 2 })} {DEVISE}
        </span>
      ),
    },
    {
      key: "etat",
      label: "Statut",
      render: (item: CommandeAchat) => {
        const config = statusConfig[item.etat] || { label: item.etat, variant: "outline" as const };
        return <DataTableBadge variant={config.variant}>{config.label}</DataTableBadge>;
      },
    },
  ];

  const actions = [
    {
      label: "Voir",
      icon: <Eye className="h-4 w-4" />,
      onClick: (item: CommandeAchat) => router.push(`/achats/commandes/${item.id}/details`),
      variant: "ghost" as const,
      className: "text-blue-600 hover:text-blue-700 hover:bg-blue-50 dark:text-blue-400 dark:hover:bg-blue-950/30",
    },
    {
      label: "Réceptionner",
      icon: <Archive className="h-4 w-4" />,
      onClick: (item: CommandeAchat) => handleReceptionnerClick(item),
      variant: "ghost" as const,
      className: "text-emerald-600 hover:text-emerald-700 hover:bg-emerald-50 dark:text-emerald-400 dark:hover:bg-emerald-950/30",
      show: (item: CommandeAchat) => item.etat === "envoye" || item.etat === "confirme",
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
            <div className="h-8 w-8 bg-slate-200 dark:bg-slate-700 rounded animate-pulse" />
            <div className="h-8 w-48 bg-slate-200 dark:bg-slate-700 rounded animate-pulse mt-1" />
            <div className="h-4 w-64 bg-slate-200 dark:bg-slate-700 rounded animate-pulse mt-1" />
          </div>
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
            <PackageCheck className="h-5 w-5 text-emerald-500" />
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
              Réceptions
            </h1>
          </div>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
            Gestion des réceptions de commandes fournisseurs
          </p>
        </div>
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
                <Search className="h-4 w-4 mr-2" /> Effacer
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
                  <SelectItem value="envoye">Envoyé</SelectItem>
                  <SelectItem value="recu">Reçu</SelectItem>
                  <SelectItem value="confirme">Confirmé</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <Button variant="outline" onClick={() => refetch()}>
              <RefreshCw className="h-4 w-4 mr-2" /> Actualiser
            </Button>
          </div>

          <DataTable
            data={rawData}
            columns={columns}
            actions={actions}
            loading={isLoading}
            emptyMessage="Aucune commande à réceptionner"
            emptyIcon={<PackageCheck className="h-12 w-12" />}
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

      <Dialog open={receptionDialogOpen} onOpenChange={(open) => { if (!receptionMutation.isPending) { setReceptionDialogOpen(open); if (!open) setLigneReceptions({}); } }}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-emerald-600">
              <Archive className="h-5 w-5" />
              Réception - {itemToReceptionner?.reference || ""}
            </DialogTitle>
            <DialogDescription>
              Fournisseur : <strong>{itemToReceptionner?.partenaire?.nom || "-"}</strong>
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 my-4">
            {itemToReceptionner?.lignes?.map((ligne) => {
              const reste = ligne.quantite - ligne.quantite_recue;
              const ligneData = ligneReceptions[ligne.id] || { quantite_recue: 0, lot: false, lot_nom: "", lot_date_production: "", lot_date_peremption: "" };
              return (
                <div key={ligne.id} className="border rounded-lg p-4 space-y-3 bg-gray-50 dark:bg-gray-800/50">
                  <div className="flex items-center justify-between">
                    <div>
                      <span className="font-medium text-gray-900 dark:text-white">{ligne.nom_produit}</span>
                      <div className="text-xs text-gray-500 mt-0.5">
                        Commandé: {ligne.quantite} | Déjà reçu: {ligne.quantite_recue} | Restant: <strong>{reste}</strong>
                      </div>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Quantité reçue</label>
                      <Input
                        type="number"
                        min="0"
                        max={reste}
                        step="1"
                        value={ligneData.quantite_recue}
                        onChange={(e) => {
                          const val = Number(e.target.value);
                          setLigneReceptions((prev) => ({ ...prev, [ligne.id]: { ...prev[ligne.id], quantite_recue: val } }));
                        }}
                      />
                    </div>
                    <div className="flex items-end pb-1">
                      <Button
                        type="button"
                        variant={ligneData.lot ? "default" : "outline"}
                        size="sm"
                        className={ligneData.lot ? "bg-emerald-600 hover:bg-emerald-700" : ""}
                        onClick={() => setLigneReceptions((prev) => ({ ...prev, [ligne.id]: { ...prev[ligne.id], lot: !prev[ligne.id]?.lot } }))}
                      >
                        {ligneData.lot ? <PackageCheck className="h-4 w-4 mr-1" /> : <Plus className="h-4 w-4 mr-1" />}
                        {ligneData.lot ? "Avec lot" : "Créer un lot"}
                      </Button>
                    </div>
                  </div>
                  {ligneData.lot && (
                    <div className="grid grid-cols-3 gap-3 p-3 bg-white dark:bg-gray-900 rounded border">
                      <div className="col-span-3">
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Nom du lot</label>
                        <Input
                          placeholder={`Lot ${ligne.nom_produit}`}
                          value={ligneData.lot_nom}
                          onChange={(e) => setLigneReceptions((prev) => ({ ...prev, [ligne.id]: { ...prev[ligne.id], lot_nom: e.target.value } }))}
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Date production</label>
                        <Input
                          type="date"
                          value={ligneData.lot_date_production}
                          onChange={(e) => setLigneReceptions((prev) => ({ ...prev, [ligne.id]: { ...prev[ligne.id], lot_date_production: e.target.value } }))}
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Date péremption</label>
                        <Input
                          type="date"
                          value={ligneData.lot_date_peremption}
                          onChange={(e) => setLigneReceptions((prev) => ({ ...prev, [ligne.id]: { ...prev[ligne.id], lot_date_peremption: e.target.value } }))}
                        />
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          <DialogFooter className="gap-2">
            <Button variant="outline" onClick={() => { setReceptionDialogOpen(false); setLigneReceptions({}); }} disabled={receptionMutation.isPending}>
              Annuler
            </Button>
            <Button onClick={handleConfirmReception} className="bg-emerald-600 hover:bg-emerald-700" disabled={receptionMutation.isPending}>
              {receptionMutation.isPending ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Archive className="h-4 w-4 mr-2" />}
              Valider la réception
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
