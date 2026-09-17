"use client";
import { DEVISE } from "@/lib/utils/currency";

import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/hooks/useAuth";
import { dashboardService } from "@/lib/api/services/dashboard.service";
import { formatDateShort, formatDateTime, formatCompact, formatDateInput } from "@/lib/utils/format";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { PageHeader } from "@/components/ui/PageHeader";
import { SkeletonCard, SkeletonTable } from "@/components/ui/skeleton";
import {
  Users, ShoppingCart, Package, DollarSign,
  TrendingUp, TrendingDown, Clock, CheckCircle,
  AlertCircle, ChevronRight, CalendarDays,
  Truck, Store, ArrowLeftRight, FileText,
  Building2, UserCog, Calendar, Activity,
  BarChart3, LineChart, PieChart, Sparkles,
  ArrowUpRight, ArrowDownRight, CreditCard,
  Wallet, Percent, ClipboardList, Boxes,
  UserPlus, RefreshCw
} from "lucide-react";
import { useState, useMemo } from "react";

interface DashboardStats {
  stats_generales: {
    total_utilisateurs: number;
    total_clients: number;
    total_fournisseurs: number;
    total_produits: number;
    total_commandes_vente: number;
    total_commandes_achat: number;
    total_factures: number;
    total_transferts: number;
  };
  chiffres_affaires: {
    ca_clients: string;
    ca_fournisseurs: string;
    total_factures: string;
    factures_impayees: string;
    taux_paiement: number;
    date_debut: string;
    date_fin: string;
  };
  commandes: {
    ventes: {
      total: number;
      par_statut: Record<string, number>;
      brouillon: number;
      confirme: number;
      en_cours: number;
      termine: number;
      annule: number;
    };
    achats: {
      total: number;
      par_statut: Record<string, number>;
      brouillon: number;
      confirme: number;
      envoye: number;
      recu: number;
      termine: number;
      annule: number;
    };
  };
  stock: {
    quantite_totale: string;
    produits_en_stock: number;
    produits_rupture: number;
    produits_alerte: number;
    produits_normal: number;
    taux_rupture: number;
  };
  transferts_recents: Array<{
    id: number;
    reference: string;
    type: string;
    type_label: string;
    etat: string;
    etat_label: string;
    source: string;
    destination: string;
    created_at: string;
    cree_par: string;
  }>;
  factures_recents: Array<{
    id: number;
    reference: string;
    numero_facture: string;
    type: string;
    type_label: string;
    statut: string;
    statut_label: string;
    montant_ttc: string;
    partenaire: string;
    date_emission: string;
    cree_par: string;
  }>;
  alertes_stock: Array<any>;
  evolution_ventes: Array<{
    date: string;
    commandes: number;
    montant_commandes: string;
    factures: number;
    montant_factures: string;
  }>;
  top_produits: Array<{
    produit_id: number;
    nom: string;
    quantite_vendue: string;
    total_ht: string;
    nombre_commandes: number;
  }>;
  activite_utilisateurs: {
    dernieres_connexions: Array<{
      nom: string;
      email: string;
      derniere_connexion: string;
      role: string;
    }>;
    utilisateurs_par_role: Record<string, number>;
    total_actifs: number;
    total_inactifs: number;
  };
}

const statutColors: Record<string, { bg: string; text: string; dot: string }> = {
  brouillon: { bg: "bg-slate-100 dark:bg-slate-800", text: "text-slate-700 dark:text-slate-300", dot: "bg-slate-400" },
  confirme: { bg: "bg-blue-50 dark:bg-blue-950/40", text: "text-blue-700 dark:text-blue-300", dot: "bg-blue-500" },
  envoye: { bg: "bg-amber-50 dark:bg-amber-950/40", text: "text-amber-700 dark:text-amber-300", dot: "bg-amber-500" },
  recu: { bg: "bg-purple-50 dark:bg-purple-950/40", text: "text-purple-700 dark:text-purple-300", dot: "bg-purple-500" },
  termine: { bg: "bg-emerald-50 dark:bg-emerald-950/40", text: "text-emerald-700 dark:text-emerald-300", dot: "bg-emerald-500" },
  annule: { bg: "bg-red-50 dark:bg-red-950/40", text: "text-red-700 dark:text-red-300", dot: "bg-red-500" },
  en_cours: { bg: "bg-blue-50 dark:bg-blue-950/40", text: "text-blue-700 dark:text-blue-300", dot: "bg-blue-500" },
  payee: { bg: "bg-emerald-50 dark:bg-emerald-950/40", text: "text-emerald-700 dark:text-emerald-300", dot: "bg-emerald-500" },
  alerte: { bg: "bg-red-50 dark:bg-red-950/40", text: "text-red-700 dark:text-red-300", dot: "bg-red-500" },
  attente: { bg: "bg-amber-50 dark:bg-amber-950/40", text: "text-amber-700 dark:text-amber-300", dot: "bg-amber-500" },
};

function MiniProgressBar({ value, max, color = "bg-emerald-500" }: { value: number; max: number; color?: string }) {
  const pct = max > 0 ? Math.min((value / max) * 100, 100) : 0;
  return (
    <div className="w-full h-1.5 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
      <div className={`h-full rounded-full transition-all duration-700 ${color}`} style={{ width: `${pct}%` }} />
    </div>
  );
}

type Periode = "jour" | "semaine" | "mois" | "annee" | "tout";

const PERIODE_LABELS: Record<Periode, string> = {
  jour: "Aujourd'hui",
  semaine: "Cette semaine",
  mois: "Ce mois",
  annee: "Cette année",
  tout: "Tout",
};

export default function DashboardPage() {
  const { currentUser, isLoadingUser: isUserLoading, societe } = useAuth();
  const [periode, setPeriode] = useState<Periode>("mois");

  const range = useMemo(() => {
    const now = new Date();
    const start = new Date(now);
    if (periode === "jour") {
      start.setHours(0, 0, 0, 0);
    } else if (periode === "semaine") {
      const jour = (now.getDay() + 6) % 7;
      start.setDate(now.getDate() - jour);
      start.setHours(0, 0, 0, 0);
    } else if (periode === "mois") {
      start.setDate(1);
      start.setHours(0, 0, 0, 0);
    } else if (periode === "annee") {
      start.setMonth(0, 1);
      start.setHours(0, 0, 0, 0);
    } else {
      start.setFullYear(now.getFullYear() - 10);
    }
    return {
      date_debut: formatDateInput(start),
      date_fin: formatDateInput(now),
    };
  }, [periode]);

  const { data: stats, isLoading: isDashboardLoading } = useQuery({
    queryKey: ["dashboard-stats", range.date_debut, range.date_fin],
    queryFn: async () => {
      const response = await dashboardService.getStats(range.date_debut, range.date_fin);
      return (response.success && response.data) ? (response.data as DashboardStats) : null;
    },
    staleTime: 2 * 60 * 1000,
    retry: 1,
  });

  const isLoading = isUserLoading || isDashboardLoading;

  const getStatusColor = (status: string) => statutColors[status] || statutColors.brouillon;
  const getStatusLabel = (status: string) => {
    const labels: Record<string, string> = {
      brouillon: "Brouillon", confirme: "Confirmée", envoye: "Envoyé",
      recu: "Reçu", termine: "Terminée", annule: "Annulée",
      en_cours: "En cours", payee: "Payée", alerte: "Alerte", attente: "En attente",
    };
    return labels[status] || status;
  };

  if (isLoading) {
    return (
      <div className="p-6 max-w-7xl mx-auto space-y-6">
        <div className="flex items-center gap-4 mb-2">
          <div className="h-12 w-12 rounded-2xl bg-gradient-to-br from-blue-500 to-indigo-600 animate-pulse" />
          <div className="space-y-2 flex-1">
            <div className="h-6 w-64 bg-slate-200 dark:bg-slate-700 rounded-lg animate-pulse" />
            <div className="h-4 w-48 bg-slate-100 dark:bg-slate-800 rounded-lg animate-pulse" />
          </div>
        </div>
        <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-4">
          {[...Array(4)].map((_, i) => <SkeletonCard key={i} />)}
        </div>
        <div className="grid gap-5 md:grid-cols-2">
          {[...Array(2)].map((_, i) => <SkeletonCard key={i + 10} />)}
        </div>
        <SkeletonTable />
      </div>
    );
  }

  const STATS_CONFIG = [
    {
      title: "Utilisateurs",
      value: stats?.stats_generales?.total_utilisateurs ?? 0,
      icon: Users,
      change: `${stats?.activite_utilisateurs?.total_actifs ?? 0} actif(s)`,
      changeUp: true,
      gradient: "from-blue-500 to-blue-600",
      shadow: "shadow-blue-500/10",
    },
    {
      title: "Clients",
      value: stats?.stats_generales?.total_clients ?? 0,
      icon: Store,
      change: `${stats?.stats_generales?.total_fournisseurs ?? 0} fournisseur(s)`,
      changeUp: true,
      gradient: "from-emerald-500 to-emerald-600",
      shadow: "shadow-emerald-500/10",
    },
    {
      title: "Produits",
      value: stats?.stats_generales?.total_produits ?? 0,
      icon: Package,
      change: `${stats?.stock?.produits_en_stock ?? 0} en stock`,
      changeUp: true,
      gradient: "from-violet-500 to-violet-600",
      shadow: "shadow-violet-500/10",
    },
    {
      title: "Commandes",
      value: stats?.stats_generales?.total_commandes_vente ?? 0,
      icon: ShoppingCart,
      change: `${stats?.commandes?.ventes?.en_cours ?? 0} en cours`,
      changeUp: false,
      gradient: "from-amber-500 to-amber-600",
      shadow: "shadow-amber-500/10",
    },
  ];

  return (
    <div className="p-4 md:p-6 max-w-7xl mx-auto space-y-6">
      {/* En-tête */}
      <PageHeader
        title="Tableau de bord"
        description={[
          societe?.nom,
          new Date().toLocaleDateString("fr-FR", {
            weekday: "long",
            day: "numeric",
            month: "long",
            year: "numeric",
          }),
        ]
          .filter(Boolean)
          .join(" · ")}
        icon={<BarChart3 className="h-5 w-5" />}
        actions={
          <div className="flex items-center gap-2">
            <CalendarDays className="h-4 w-4 text-slate-400 dark:text-slate-500" />
            <Select value={periode} onValueChange={(v) => setPeriode(v as Periode)}>
              <SelectTrigger className="h-9 w-[160px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {(Object.keys(PERIODE_LABELS) as Periode[]).map((p) => (
                  <SelectItem key={p} value={p}>
                    {PERIODE_LABELS[p]}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        }
      />

      {/* Stats Grid */}
      <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-4">
          {STATS_CONFIG.map((stat) => (
            <div
              key={stat.title}
              className="group relative bg-white dark:bg-slate-900/80 rounded-2xl p-5 shadow-sm hover:shadow-xl transition-all duration-300 hover:-translate-y-0.5 border border-slate-200/50 dark:border-slate-700/50"
            >
              <div className="flex items-start justify-between">
                <div className="space-y-2">
                  <p className="text-xs font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wider">
                    {stat.title}
                  </p>
                  <p className="text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
                    {typeof stat.value === 'number' ? formatCompact(stat.value) : stat.value}
                  </p>
                  <div className="flex items-center gap-1.5">
                    {stat.changeUp ? (
                      <ArrowUpRight className="h-3.5 w-3.5 text-emerald-500" />
                    ) : (
                      <ArrowDownRight className="h-3.5 w-3.5 text-amber-500" />
                    )}
                    <span className={`text-xs font-medium ${stat.changeUp ? 'text-emerald-600 dark:text-emerald-400' : 'text-amber-600 dark:text-amber-400'}`}>
                      {stat.change}
                    </span>
                  </div>
                </div>
                <div className={`p-3 rounded-2xl bg-gradient-to-br ${stat.gradient} ${stat.shadow} shadow-lg`}>
                  <stat.icon className="h-5 w-5 text-white" />
                </div>
              </div>
            </div>
          ))}
      </div>

      {/* Chiffres d'affaires */}
      {stats?.chiffres_affaires && (
        <div className="grid gap-4 md:grid-cols-4">
          <div className="bg-white dark:bg-slate-900/80 rounded-2xl p-5 border border-slate-200/50 dark:border-slate-700/50 hover:shadow-lg transition-all">
            <div className="flex items-center gap-3 mb-3">
              <div className="p-2 rounded-xl bg-blue-100 dark:bg-blue-950/40">
                <TrendingUp className="h-4 w-4 text-blue-600 dark:text-blue-400" />
              </div>
              <p className="text-xs font-semibold text-slate-400 dark:text-slate-500 uppercase">CA Clients</p>
            </div>
            <p className="text-2xl font-bold text-slate-900 dark:text-white">{formatCompact(stats.chiffres_affaires.ca_clients)} {DEVISE}</p>
          </div>
          <div className="bg-white dark:bg-slate-900/80 rounded-2xl p-5 border border-slate-200/50 dark:border-slate-700/50 hover:shadow-lg transition-all">
            <div className="flex items-center gap-3 mb-3">
              <div className="p-2 rounded-xl bg-orange-100 dark:bg-orange-950/40">
                <TrendingDown className="h-4 w-4 text-orange-600 dark:text-orange-400" />
              </div>
              <p className="text-xs font-semibold text-slate-400 dark:text-slate-500 uppercase">CA Fournisseurs</p>
            </div>
            <p className="text-2xl font-bold text-slate-900 dark:text-white">{formatCompact(stats.chiffres_affaires.ca_fournisseurs)} {DEVISE}</p>
          </div>
          <div className="bg-white dark:bg-slate-900/80 rounded-2xl p-5 border border-slate-200/50 dark:border-slate-700/50 hover:shadow-lg transition-all">
            <div className="flex items-center gap-3 mb-3">
              <div className="p-2 rounded-xl bg-red-100 dark:bg-red-950/40">
                <AlertCircle className="h-4 w-4 text-red-600 dark:text-red-400" />
              </div>
              <p className="text-xs font-semibold text-slate-400 dark:text-slate-500 uppercase">Impayées</p>
            </div>
            <p className="text-2xl font-bold text-red-600 dark:text-red-400">{formatCompact(stats.chiffres_affaires.factures_impayees)} {DEVISE}</p>
          </div>
          <div className="bg-white dark:bg-slate-900/80 rounded-2xl p-5 border border-slate-200/50 dark:border-slate-700/50 hover:shadow-lg transition-all">
            <div className="flex items-center gap-3 mb-3">
              <div className="p-2 rounded-xl bg-emerald-100 dark:bg-emerald-950/40">
                <Percent className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
              </div>
              <p className="text-xs font-semibold text-slate-400 dark:text-slate-500 uppercase">Taux paiement</p>
            </div>
            <div className="flex items-center gap-3">
              <p className="text-2xl font-bold text-emerald-600 dark:text-emerald-400">{stats.chiffres_affaires.taux_paiement}%</p>
              <MiniProgressBar value={stats.chiffres_affaires.taux_paiement} max={100} color="bg-emerald-500" />
            </div>
          </div>
        </div>
      )}

      {/* Commandes + Stock row */}
      <div className="grid gap-5 md:grid-cols-3">
        {/* Ventes */}
        {stats?.commandes && (
          <div className="bg-white dark:bg-slate-900/80 rounded-2xl p-5 border border-slate-200/50 dark:border-slate-700/50 hover:shadow-lg transition-all">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-xl bg-blue-100 dark:bg-blue-950/40">
                  <ShoppingCart className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                </div>
                <span className="text-sm font-semibold text-slate-700 dark:text-slate-300">Ventes</span>
              </div>
              <span className="text-2xl font-extrabold text-slate-900 dark:text-white">{stats.commandes.ventes.total}</span>
            </div>
            <div className="flex flex-wrap gap-1.5">
              {Object.entries(stats.commandes.ventes.par_statut)
                .filter(([_, count]) => count > 0)
                .map(([status, count]) => {
                  const c = getStatusColor(status);
                  return (
                    <span key={status} className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-medium ${c.bg} ${c.text}`}>
                      <span className={`w-1.5 h-1.5 rounded-full ${c.dot}`} />
                      {getStatusLabel(status)} {count}
                    </span>
                  );
                })}
            </div>
          </div>
        )}

        {/* Achats */}
        {stats?.commandes && (
          <div className="bg-white dark:bg-slate-900/80 rounded-2xl p-5 border border-slate-200/50 dark:border-slate-700/50 hover:shadow-lg transition-all">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-xl bg-amber-100 dark:bg-amber-950/40">
                  <Truck className="h-4 w-4 text-amber-600 dark:text-amber-400" />
                </div>
                <span className="text-sm font-semibold text-slate-700 dark:text-slate-300">Achats</span>
              </div>
              <span className="text-2xl font-extrabold text-slate-900 dark:text-white">{stats.commandes.achats.total}</span>
            </div>
            <div className="flex flex-wrap gap-1.5">
              {Object.entries(stats.commandes.achats.par_statut)
                .filter(([_, count]) => count > 0)
                .map(([status, count]) => {
                  const c = getStatusColor(status);
                  return (
                    <span key={status} className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-medium ${c.bg} ${c.text}`}>
                      <span className={`w-1.5 h-1.5 rounded-full ${c.dot}`} />
                      {getStatusLabel(status)} {count}
                    </span>
                  );
                })}
            </div>
          </div>
        )}

        {/* État du stock */}
        {stats?.stock && (
          <div className="bg-white dark:bg-slate-900/80 rounded-2xl border border-slate-200/50 dark:border-slate-700/50 hover:shadow-lg transition-all overflow-hidden">
            <div className="p-5">
              <div className="flex items-center gap-2.5 mb-4">
                <div className="p-2 rounded-xl bg-violet-100 dark:bg-violet-950/40">
                  <Boxes className="h-4 w-4 text-violet-600 dark:text-violet-400" />
                </div>
                <span className="text-sm font-semibold text-slate-700 dark:text-slate-300">Stock</span>
              </div>
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs text-slate-400 dark:text-slate-500">Quantité totale</span>
                <span className="text-sm font-bold text-slate-900 dark:text-white">{stats.stock.quantite_totale}</span>
              </div>
              <div className="space-y-2.5">
                <div>
                  <div className="flex justify-between text-xs mb-1">
                    <span className="text-emerald-600 dark:text-emerald-400 font-medium">En stock</span>
                    <span className="font-semibold text-slate-700 dark:text-slate-300">{stats.stock.produits_en_stock}</span>
                  </div>
                  <MiniProgressBar value={stats.stock.produits_en_stock} max={stats.stock.produits_en_stock + stats.stock.produits_rupture} color="bg-emerald-500" />
                </div>
                <div>
                  <div className="flex justify-between text-xs mb-1">
                    <span className="text-red-600 dark:text-red-400 font-medium">Rupture</span>
                    <span className="font-semibold text-slate-700 dark:text-slate-300">{stats.stock.produits_rupture}</span>
                  </div>
                  <MiniProgressBar value={stats.stock.produits_rupture} max={stats.stock.produits_en_stock + stats.stock.produits_rupture} color="bg-red-500" />
                </div>
                {stats.stock.produits_alerte > 0 && (
                  <div className="flex items-center gap-2 mt-3 p-2.5 rounded-xl bg-amber-50 dark:bg-amber-950/30 border border-amber-200/50 dark:border-amber-800/50">
                    <AlertCircle className="h-4 w-4 text-amber-500 flex-shrink-0" />
                    <p className="text-xs font-medium text-amber-700 dark:text-amber-400">
                      {stats.stock.produits_alerte} produit{stats.stock.produits_alerte > 1 ? 's' : ''} en alerte
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Transferts récents & Factures récentes */}
      <div className="grid gap-5 md:grid-cols-2">
        {stats?.transferts_recents && stats.transferts_recents.length > 0 && (
          <div className="bg-white dark:bg-slate-900/80 rounded-2xl border border-slate-200/50 dark:border-slate-700/50 hover:shadow-lg transition-all overflow-hidden">
            <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100 dark:border-slate-800">
              <div className="flex items-center gap-2.5">
                <div className="p-1.5 rounded-lg bg-indigo-100 dark:bg-indigo-950/40">
                  <ArrowLeftRight className="h-4 w-4 text-indigo-600 dark:text-indigo-400" />
                </div>
                <span className="text-sm font-semibold text-slate-700 dark:text-slate-300">Transferts récents</span>
              </div>
              <button className="text-xs font-medium text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 dark:hover:text-indigo-300 transition-colors flex items-center gap-1">
                Voir tout <ChevronRight className="h-3 w-3" />
              </button>
            </div>
            <div className="divide-y divide-slate-100 dark:divide-slate-800">
              {stats.transferts_recents.slice(0, 5).map((transfert) => (
                <div key={transfert.id} className="flex items-center justify-between px-5 py-3 hover:bg-slate-50 dark:hover:bg-slate-800/30 transition-colors">
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="p-1.5 rounded-lg bg-slate-100 dark:bg-slate-800 flex-shrink-0">
                      <Truck className="h-3.5 w-3.5 text-slate-500 dark:text-slate-400" />
                    </div>
                    <div className="min-w-0">
                      <p className="text-sm font-semibold text-slate-900 dark:text-white truncate">{transfert.reference}</p>
                      <p className="text-xs text-slate-400 dark:text-slate-500 truncate">{transfert.source} → {transfert.destination}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 flex-shrink-0">
                    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-medium ${getStatusColor(transfert.etat).bg} ${getStatusColor(transfert.etat).text}`}>
                      <span className={`w-1.5 h-1.5 rounded-full ${getStatusColor(transfert.etat).dot}`} />
                      {getStatusLabel(transfert.etat)}
                    </span>
                    <span className="text-xs text-slate-400 dark:text-slate-500 whitespace-nowrap">{formatDateShort(transfert.created_at)}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {stats?.factures_recents && stats.factures_recents.length > 0 && (
          <div className="bg-white dark:bg-slate-900/80 rounded-2xl border border-slate-200/50 dark:border-slate-700/50 hover:shadow-lg transition-all overflow-hidden">
            <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100 dark:border-slate-800">
              <div className="flex items-center gap-2.5">
                <div className="p-1.5 rounded-lg bg-emerald-100 dark:bg-emerald-950/40">
                  <FileText className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
                </div>
                <span className="text-sm font-semibold text-slate-700 dark:text-slate-300">Factures récentes</span>
              </div>
              <button className="text-xs font-medium text-emerald-600 dark:text-emerald-400 hover:text-emerald-700 dark:hover:text-emerald-300 transition-colors flex items-center gap-1">
                Voir tout <ChevronRight className="h-3 w-3" />
              </button>
            </div>
            <div className="divide-y divide-slate-100 dark:divide-slate-800">
              {stats.factures_recents.slice(0, 5).map((facture) => (
                <div key={facture.id} className="flex items-center justify-between px-5 py-3 hover:bg-slate-50 dark:hover:bg-slate-800/30 transition-colors">
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="p-1.5 rounded-lg bg-slate-100 dark:bg-slate-800 flex-shrink-0">
                      <FileText className="h-3.5 w-3.5 text-slate-500 dark:text-slate-400" />
                    </div>
                    <div className="min-w-0">
                      <p className="text-sm font-semibold text-slate-900 dark:text-white truncate">{facture.reference}</p>
                      <p className="text-xs text-slate-400 dark:text-slate-500 truncate">{facture.partenaire}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 flex-shrink-0">
                    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-medium ${getStatusColor(facture.statut).bg} ${getStatusColor(facture.statut).text}`}>
                      <span className={`w-1.5 h-1.5 rounded-full ${getStatusColor(facture.statut).dot}`} />
                      {getStatusLabel(facture.statut)}
                    </span>
                    <span className="text-sm font-bold text-slate-900 dark:text-white">{formatCompact(facture.montant_ttc)} {DEVISE}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Top Produits & Activité */}
      <div className="grid gap-5 md:grid-cols-2">
        {stats?.top_produits && stats.top_produits.length > 0 && (
          <div className="bg-white dark:bg-slate-900/80 rounded-2xl border border-slate-200/50 dark:border-slate-700/50 hover:shadow-lg transition-all overflow-hidden">
            <div className="flex items-center gap-2.5 px-5 py-4 border-b border-slate-100 dark:border-slate-800">
              <div className="p-1.5 rounded-lg bg-rose-100 dark:bg-rose-950/40">
                <Package className="h-4 w-4 text-rose-600 dark:text-rose-400" />
              </div>
              <span className="text-sm font-semibold text-slate-700 dark:text-slate-300">Top produits</span>
            </div>
            <div className="p-5 space-y-3">
              {stats.top_produits.slice(0, 5).map((produit, index) => {
                const maxQty = Math.max(...stats.top_produits.slice(0, 5).map(p => Number(p.quantite_vendue)));
                const pct = maxQty > 0 ? (Number(produit.quantite_vendue) / maxQty) * 100 : 0;
                const barColors = ["from-rose-500 to-pink-500", "from-blue-500 to-indigo-500", "from-emerald-500 to-teal-500", "from-amber-500 to-orange-500", "from-violet-500 to-purple-500"];
                return (
                  <div key={produit.produit_id} className="space-y-1.5">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2 min-w-0">
                        <span className="text-xs font-bold text-slate-400 dark:text-slate-500 w-5">{index + 1}</span>
                        <span className="text-sm font-medium text-slate-900 dark:text-white truncate">{produit.nom}</span>
                      </div>
                      <div className="text-right flex-shrink-0 ml-3">
                        <span className="text-sm font-bold text-slate-900 dark:text-white">{produit.quantite_vendue}</span>
                        <span className="text-xs text-slate-400 dark:text-slate-500 ml-1">unités</span>
                      </div>
                    </div>
                    <div className="w-full h-2 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                      <div className={`h-full rounded-full bg-gradient-to-r ${barColors[index % barColors.length]} transition-all duration-700`} style={{ width: `${pct}%` }} />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {stats?.activite_utilisateurs && (
          <div className="bg-white dark:bg-slate-900/80 rounded-2xl border border-slate-200/50 dark:border-slate-700/50 hover:shadow-lg transition-all overflow-hidden">
            <div className="flex items-center gap-2.5 px-5 py-4 border-b border-slate-100 dark:border-slate-800">
              <div className="p-1.5 rounded-lg bg-cyan-100 dark:bg-cyan-950/40">
                <Users className="h-4 w-4 text-cyan-600 dark:text-cyan-400" />
              </div>
              <span className="text-sm font-semibold text-slate-700 dark:text-slate-300">Activité utilisateurs</span>
            </div>
            <div className="p-5">
              <div className="flex items-center justify-around mb-5 p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/50">
                <div className="text-center">
                  <p className="text-2xl font-extrabold text-emerald-600 dark:text-emerald-400">{stats.activite_utilisateurs.total_actifs}</p>
                  <p className="text-xs text-slate-400 dark:text-slate-500 mt-0.5">Actifs</p>
                </div>
                <div className="w-px h-10 bg-slate-200 dark:bg-slate-700" />
                <div className="text-center">
                  <p className="text-2xl font-extrabold text-red-600 dark:text-red-400">{stats.activite_utilisateurs.total_inactifs}</p>
                  <p className="text-xs text-slate-400 dark:text-slate-500 mt-0.5">Inactifs</p>
                </div>
                <div className="w-px h-10 bg-slate-200 dark:bg-slate-700" />
                <div className="text-center">
                  <p className="text-2xl font-extrabold text-slate-900 dark:text-white">
                    {Object.values(stats.activite_utilisateurs.utilisateurs_par_role).reduce((a, b) => a + b, 0)}
                  </p>
                  <p className="text-xs text-slate-400 dark:text-slate-500 mt-0.5">Total</p>
                </div>
              </div>
              <div className="space-y-2">
                <p className="text-xs font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wider mb-2">Par rôle</p>
                {Object.entries(stats.activite_utilisateurs.utilisateurs_par_role).map(([role, count]) => {
                  const total = Object.values(stats.activite_utilisateurs.utilisateurs_par_role).reduce((a, b) => a + b, 0);
                  return (
                    <div key={role} className="flex items-center gap-3">
                      <span className="text-xs font-medium text-slate-600 dark:text-slate-400 capitalize w-24">{role}</span>
                      <div className="flex-1 h-2 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                        <div className="h-full rounded-full bg-gradient-to-r from-cyan-500 to-blue-500 transition-all duration-700" style={{ width: `${total > 0 ? (count / total) * 100 : 0}%` }} />
                      </div>
                      <span className="text-xs font-bold text-slate-700 dark:text-slate-300 w-6 text-right">{count}</span>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="flex items-center justify-between text-xs text-slate-400 dark:text-slate-500 pt-4 border-t border-slate-200 dark:border-slate-700">
        <span>Dernière mise à jour : {new Date().toLocaleString('fr-FR', { day: '2-digit', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit' })}</span>
        <span className="flex items-center gap-1">
          <RefreshCw className="h-3 w-3" />
          Actualisation automatique
        </span>
      </div>
    </div>
  );
}
