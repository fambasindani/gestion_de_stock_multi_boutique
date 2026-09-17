"use client";
import { DEVISE } from "@/lib/utils/currency";

import React, { useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { SkeletonCard } from "@/components/ui/skeleton";
import { ConfirmDialog } from "@/components/common/ConfirmDialog";
import { produitsService } from "@/lib/api/services/produits.service";
import { stockService } from "@/lib/api/services/stock.service";
import { DataTableBadge } from "@/components/common/DataTable";
import {
  ArrowLeft, Package, Pencil, Trash2, CheckCircle, XCircle,
  FileText, Tag, Ruler, Boxes, Loader2, Layers
} from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

export default function ProduitDetails() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const queryClient = useQueryClient();
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [togglingId, setTogglingId] = useState<number | null>(null);
  const [togglingVariantId, setTogglingVariantId] = useState<number | null>(null);

  const { data: produit, isLoading } = useQuery({
    queryKey: ["produit", params.id],
    queryFn: async () => {
      const response = await produitsService.getById(Number(params.id));
      return response.data;
    },
    staleTime: 2 * 60 * 1000,
  });

  const { data: stockData, isLoading: stockLoading } = useQuery({
    queryKey: ["stock-produit", params.id],
    queryFn: async () => {
      const response = await stockService.resumerProduit(Number(params.id));
      return ((response.data as any)?.stocks || []) as any[];
    },
    staleTime: 2 * 60 * 1000,
  });

  const deleteMutation = useMutation({
    mutationFn: () => produitsService.delete(Number(params.id)),
    onSuccess: () => {
      toast.success("Produit supprimé avec succès");
      queryClient.invalidateQueries({ queryKey: ["produits"] });
      router.push("/dashboard/produits");
    },
    onError: () => toast.error("Erreur lors de la suppression"),
    onSettled: () => setDeleteDialogOpen(false),
  });

  const activerMutation = useMutation({
    mutationFn: async (id: number) => {
      setTogglingId(id);
      const response = await produitsService.activer(id);
      if (!response.success) throw new Error(response.message || "Erreur");
      return response.data;
    },
    onSuccess: () => {
      toast.success("Produit activé");
      queryClient.invalidateQueries({ queryKey: ["produit", params.id] });
      queryClient.invalidateQueries({ queryKey: ["produits"] });
      setTogglingId(null);
    },
    onError: (error: any) => { toast.error(error?.message || "Erreur"); setTogglingId(null); },
  });

  const desactiverMutation = useMutation({
    mutationFn: async (id: number) => {
      setTogglingId(id);
      const response = await produitsService.desactiver(id);
      if (!response.success) throw new Error(response.message || "Erreur");
      return response.data;
    },
    onSuccess: () => {
      toast.success("Produit désactivé");
      queryClient.invalidateQueries({ queryKey: ["produit", params.id] });
      queryClient.invalidateQueries({ queryKey: ["produits"] });
      setTogglingId(null);
    },
    onError: (error: any) => { toast.error(error?.message || "Erreur"); setTogglingId(null); },
  });

  const toggleActive = () => {
    if (togglingId) return;
    if (produit && Number(produit.actif) === 1) {
      desactiverMutation.mutate(produit.id);
    } else if (produit) {
      activerMutation.mutate(produit.id);
    }
  };

  if (isLoading) {
    return (
      <div className="max-w-7xl mx-auto p-4 md:p-8 space-y-8 bg-slate-50/30 min-h-screen">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-2">
            <SkeletonCard className="h-10 w-24" />
            <SkeletonCard className="h-10 w-64" />
            <div className="flex gap-2">
              <SkeletonCard className="h-6 w-16" />
              <SkeletonCard className="h-6 w-20" />
            </div>
          </div>
          <div className="flex gap-2">
            <SkeletonCard className="h-10 w-24" />
            <SkeletonCard className="h-10 w-24" />
          </div>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map((i) => (<SkeletonCard key={i} className="h-24" />))}
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="md:col-span-2"><SkeletonCard className="h-80" /></div>
          <div className="md:col-span-1"><SkeletonCard className="h-80" /></div>
        </div>
      </div>
    );
  }

  if (!produit) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center">
        <Package className="h-16 w-16 text-slate-200 mb-4" />
        <h3 className="text-xl font-bold text-slate-900">Produit introuvable</h3>
        <Button onClick={() => router.push("/dashboard/produits")} className="mt-6">
          <ArrowLeft className="mr-2 h-4 w-4" /> Retour à la liste
        </Button>
      </div>
    );
  }

  const InfoStat = ({ icon: Icon, label, value, colorClass }: any) => (
    <div className="flex items-center gap-4 p-5 rounded-2xl bg-white border border-slate-100 shadow-sm hover:shadow-md transition-all duration-200">
      <div className={`p-3 rounded-xl ${colorClass}`}>
        <Icon className="h-6 w-6" />
      </div>
      <div>
        <p className="text-[11px] font-bold text-slate-400 uppercase tracking-widest">{label}</p>
        <p className="text-lg font-bold text-slate-800">{value}</p>
      </div>
    </div>
  );

  const getTypeBadge = (type: string) => {
    const variants: Record<string, { label: string; variant: "default" | "destructive" | "outline" | "secondary" }> = {
      consommable: { label: "Consommable", variant: "secondary" },
      service: { label: "Service", variant: "outline" },
      stockable: { label: "Stockable", variant: "default" },
    };
    const v = variants[type] || { label: type, variant: "outline" as const };
    return <Badge variant={v.variant}>{v.label}</Badge>;
  };

  const getStockTotal = () => {
    if (!stockData) return "N/A";
    return stockData.reduce((sum, s) => sum + Number(s.quantite_disponible), 0).toFixed(2);
  };

  return (
    <div className="max-w-7xl mx-auto p-4 md:p-8 space-y-8 bg-slate-50/30 min-h-screen">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <Button variant="ghost" onClick={() => router.back()} className="-ml-4 text-slate-500 hover:text-slate-900">
            <ArrowLeft className="mr-2 h-4 w-4" /> Retour
          </Button>
          <h1 className="text-4xl font-extrabold text-slate-900 tracking-tight">{produit.nom}</h1>
          <div className="flex gap-2 mt-2">
            <Badge variant={produit.actif ? "default" : "destructive"}>
              {produit.actif ? "Actif" : "Inactif"}
            </Badge>
            <Badge variant="outline" className="bg-white">#{produit.id}</Badge>
            {getTypeBadge(produit.type)}
          </div>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => router.push(`/dashboard/produits/${produit.id}/modifier`)}>
            <Pencil className="mr-2 h-4 w-4" /> Modifier
          </Button>
          <Button
            variant="outline"
            onClick={toggleActive}
            disabled={togglingId !== null}
            className={produit.actif ? "text-red-600 border-red-200 hover:bg-red-50" : "text-emerald-600 border-emerald-200 hover:bg-emerald-50"}
          >
            {togglingId === produit.id ? (
              <Loader2 className="h-4 w-4 animate-spin mr-2" />
            ) : produit.actif ? (
              <XCircle className="h-4 w-4 mr-2" />
            ) : (
              <CheckCircle className="h-4 w-4 mr-2" />
            )}
            {produit.actif ? "Désactiver" : "Activer"}
          </Button>
          <Button variant="destructive" onClick={() => setDeleteDialogOpen(true)}>
            <Trash2 className="mr-2 h-4 w-4" /> Supprimer
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <InfoStat icon={Tag} label="Type" value={produit.type} colorClass="bg-purple-100 text-purple-600" />
        <InfoStat icon={Layers} label="Catégorie" value={produit.categorie?.nom || "N/A"} colorClass="bg-blue-100 text-blue-600" />
        <InfoStat icon={Ruler} label="Unité" value={produit.unite?.symbole || "N/A"} colorClass="bg-amber-100 text-amber-600" />
        <InfoStat icon={Boxes} label="Stock total" value={stockLoading ? "..." : getStockTotal()} colorClass="bg-emerald-100 text-emerald-600" />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-2 space-y-6">
          <Card className="border-none shadow-xl shadow-slate-200/50 rounded-3xl p-2">
            <CardHeader><CardTitle>Informations détaillées</CardTitle></CardHeader>
            <CardContent className="grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-6">
              {[
                { label: "Nom", value: produit.nom },
                { label: "Type", value: produit.type },
                { label: "Catégorie", value: produit.categorie?.nom || "-" },
                { label: "Unité de mesure", value: produit.unite?.symbole || "-" },
                { label: "Statut", value: produit.actif ? "Actif" : "Inactif" },
              ].map((field, i) => (
                <div key={i} className="space-y-1">
                  <p className="text-xs text-slate-400 font-semibold uppercase">{field.label}</p>
                  <p className="text-sm font-medium text-slate-900 border-b pb-1">{field.value}</p>
                </div>
              ))}
            </CardContent>
          </Card>

          {produit.variantes && produit.variantes.length > 0 && (
            <Card className="border-none shadow-xl shadow-slate-200/50 rounded-3xl p-2">
              <CardHeader><CardTitle>Variantes</CardTitle></CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Code</TableHead>
                      <TableHead>Nom</TableHead>
                      <TableHead>Prix achat</TableHead>
                      <TableHead>Prix vente</TableHead>
                      <TableHead>Réf. fournisseur</TableHead>
                      <TableHead>Statut</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {produit.variantes.map((v) => (
                      <TableRow key={v.id}>
                        <TableCell className="font-mono text-xs">{v.code_interne || "-"}</TableCell>
                        <TableCell className="font-medium">{v.nom || "-"}</TableCell>
                        <TableCell>{v.prix_achat ? `${Number(v.prix_achat).toFixed(2)} ${DEVISE}` : "-"}</TableCell>
                        <TableCell>{v.prix_vente ? `${Number(v.prix_vente).toFixed(2)} ${DEVISE}` : "-"}</TableCell>
                        <TableCell className="text-xs">{v.reference_fournisseur || "-"}</TableCell>
                        <TableCell>
                          <DataTableBadge variant={v.actif ? "success" : "danger"}>
                            {v.actif ? "Actif" : "Inactif"}
                          </DataTableBadge>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          )}

          {stockData && stockData.length > 0 && (
            <Card className="border-none shadow-xl shadow-slate-200/50 rounded-3xl p-2">
              <CardHeader><CardTitle>Stock par emplacement</CardTitle></CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Emplacement</TableHead>
                      <TableHead>Disponible</TableHead>
                      <TableHead>Réservée</TableHead>
                      <TableHead>Commandée</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {stockData.map((s) => (
                      <TableRow key={s.id}>
                        <TableCell className="font-medium">{s.emplacement?.nom || emplacementName(s.emplacement_id)}</TableCell>
                        <TableCell>
                          <span className="font-semibold text-emerald-600">{s.quantite_disponible}</span>
                        </TableCell>
                        <TableCell>
                          <span className="font-semibold text-amber-600">{s.quantite_reservee}</span>
                        </TableCell>
                        <TableCell>
                          <span className="font-semibold text-blue-600">{s.quantite_commande}</span>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          )}
        </div>

        <div className="md:col-span-1 space-y-6">
          <Card className="border-none shadow-xl shadow-slate-200/50 rounded-3xl h-full">
            <CardHeader><CardTitle className="flex items-center gap-2"><FileText className="h-4 w-4" /> Description</CardTitle></CardHeader>
            <CardContent>
              <p className="text-sm text-slate-600 italic bg-slate-50 p-4 rounded-xl min-h-[150px]">
                {produit.description || "Aucune description disponible pour ce produit."}
              </p>
            </CardContent>
          </Card>
        </div>
      </div>

      <ConfirmDialog
        open={deleteDialogOpen}
        onOpenChange={setDeleteDialogOpen}
        onConfirm={() => deleteMutation.mutate()}
        title="Suppression définitive"
        description={`Êtes-vous sûr de vouloir supprimer ${produit.nom} ? Cette action est irréversible.`}
        isLoading={deleteMutation.isPending}
      />
    </div>
  );
}

function emplacementName(id: number): string {
  return `#${id}`;
}
