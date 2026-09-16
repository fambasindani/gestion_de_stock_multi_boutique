"use client";

import React, { useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { SkeletonCard, SkeletonTable } from "@/components/ui/skeleton";
import { ConfirmDialog } from "@/components/common/ConfirmDialog";
import { partenairesService } from "@/lib/api/services/partenaires.service";
import {
  ArrowLeft, Building2, Mail, Phone, MapPin, Globe, User, Pencil,
  Trash2, Loader2, CheckCircle, XCircle, Users, Truck, CreditCard,
  Calendar, FileText, MapPinned, Building, Award, Clock, UserCheck,
  ShoppingCart,
} from "lucide-react";

export default function PartenaireDetails() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const queryClient = useQueryClient();
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);

  // 1. Récupération des données
  const { data: partenaire, isLoading } = useQuery({
    queryKey: ["partenaire", params.id],
    queryFn: async () => {
      const response = await partenairesService.getById(Number(params.id));
      return response.data;
    },
    staleTime: 2 * 60 * 1000,
  });

  // 2. Mutation suppression
  const deleteMutation = useMutation({
    mutationFn: () => partenairesService.delete(Number(params.id)),
    onSuccess: () => {
      toast.success("Partenaire supprimé avec succès");
      queryClient.invalidateQueries({ queryKey: ["partenaires"] });
      router.push("/dashboard/partenaires");
    },
    onError: () => toast.error("Erreur lors de la suppression"),
    onSettled: () => setDeleteDialogOpen(false),
  });

  // 3. États de chargement avec Skeleton
  if (isLoading) {
    return (
      <div className="max-w-7xl mx-auto p-4 md:p-8 space-y-8 bg-slate-50/30 min-h-screen">
        {/* Header skeleton */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <SkeletonCard className="h-10 w-24" />
            </div>
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

        {/* Stats skeleton */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <SkeletonCard key={i} className="h-24" />
          ))}
        </div>

        {/* Main content skeleton */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="md:col-span-2">
            <SkeletonCard className="h-80" />
          </div>
          <div className="md:col-span-1">
            <SkeletonCard className="h-80" />
          </div>
        </div>
      </div>
    );
  }

  if (!partenaire) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center">
        <Building2 className="h-16 w-16 text-slate-200 mb-4" />
        <h3 className="text-xl font-bold text-slate-900">Partenaire introuvable</h3>
        <Button onClick={() => router.push("/dashboard/partenaires")} className="mt-6">
          <ArrowLeft className="mr-2 h-4 w-4" /> Retour à la liste
        </Button>
      </div>
    );
  }

  // 4. Composant utilitaire pour les cartes de stats
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

  return (
    <div className="max-w-7xl mx-auto p-4 md:p-8 space-y-8 bg-slate-50/30 min-h-screen">
      
      {/* Header section */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <Button variant="ghost" onClick={() => router.back()} className="-ml-4 text-slate-500 hover:text-slate-900">
            <ArrowLeft className="mr-2 h-4 w-4" /> Retour
          </Button>
          <h1 className="text-4xl font-extrabold text-slate-900 tracking-tight">{partenaire.nom}</h1>
          <div className="flex gap-2 mt-2">
            <Badge variant={partenaire.actif ? "default" : "destructive"}>
              {partenaire.actif ? "Actif" : "Inactif"}
            </Badge>
            <Badge variant="outline" className="bg-white">Code: {partenaire.code || "N/A"}</Badge>
          </div>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => router.push(`/dashboard/partenaires/${partenaire.id}/modifier`)}>
            <Pencil className="mr-2 h-4 w-4" /> Modifier
          </Button>
          <Button variant="destructive" onClick={() => setDeleteDialogOpen(true)}>
            <Trash2 className="mr-2 h-4 w-4" /> Supprimer
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <InfoStat icon={Users} label="Type" value={partenaire.est_client ? "Client" : "Fournisseur"} colorClass="bg-blue-100 text-blue-600" />
        <InfoStat icon={Award} label="Remise" value={`${partenaire.remise}%`} colorClass="bg-emerald-100 text-emerald-600" />
        <InfoStat icon={Clock} label="Délai" value={`${partenaire.delai_paiement} j`} colorClass="bg-purple-100 text-purple-600" />
        <InfoStat icon={UserCheck} label="Statut" value={partenaire.actif ? "Actif" : "Inactif"} colorClass={partenaire.actif ? "bg-emerald-100 text-emerald-600" : "bg-red-100 text-red-600"} />
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Colonne principale (Détails) */}
        <div className="md:col-span-2 space-y-6">
          <Card className="border-none shadow-xl shadow-slate-200/50 rounded-3xl p-2">
            <CardHeader><CardTitle>Informations détaillées</CardTitle></CardHeader>
            <CardContent className="grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-6">
              {[
                { label: "Email", value: partenaire.email },
                { label: "Téléphone", value: partenaire.telephone },
                { label: "Adresse", value: partenaire.adresse },
                { label: "Ville", value: partenaire.ville },
                { label: "Pays", value: partenaire.pays },
                { label: "N° TVA", value: partenaire.numero_tva },
              ].map((field, i) => (
                <div key={i} className="space-y-1">
                  <p className="text-xs text-slate-400 font-semibold uppercase">{field.label}</p>
                  <p className="text-sm font-medium text-slate-900 border-b pb-1">{field.value || "-"}</p>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>

        {/* Colonne secondaire (Notes) */}
        <div className="md:col-span-1">
          <Card className="border-none shadow-xl shadow-slate-200/50 rounded-3xl h-full">
            <CardHeader><CardTitle className="flex items-center gap-2"><FileText className="h-4 w-4" /> Notes</CardTitle></CardHeader>
            <CardContent>
              <p className="text-sm text-slate-600 italic bg-slate-50 p-4 rounded-xl min-h-[150px]">
                {partenaire.notes || "Aucune note disponible pour ce partenaire."}
              </p>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Modal suppression */}
      <ConfirmDialog
        open={deleteDialogOpen}
        onOpenChange={setDeleteDialogOpen}
        onConfirm={() => deleteMutation.mutate()}
        title="Suppression définitive"
        description={`Êtes-vous sûr de vouloir supprimer ${partenaire.nom} ? Cette action est irréversible.`}
        isLoading={deleteMutation.isPending}
      />
    </div>
  );
}