"use client";

import { Suspense, type ReactNode } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { PageHeader } from "@/components/ui/PageHeader";
import { SkeletonTable } from "@/components/ui/skeleton";
import { DataTableBadge } from "@/components/common/DataTable";
import { produitsService } from "@/lib/api/services/produits.service";
import { partenairesService } from "@/lib/api/services/partenaires.service";
import { commandesVenteService } from "@/lib/api/services/commandes-vente.service";
import { commandesAchatService } from "@/lib/api/services/commandes-achat.service";
import { Search, Package, Users, ShoppingCart, Truck, Loader2 } from "lucide-react";

function unwrapList<T>(payload: unknown): T[] {
  if (Array.isArray(payload)) return payload as T[];
  const nested = (payload as { data?: unknown } | null)?.data;
  return Array.isArray(nested) ? (nested as T[]) : [];
}

export default function RecherchePage() {
  return (
    <Suspense fallback={<div className="p-8 text-center text-slate-500">Chargement...</div>}>
      <Recherche />
    </Suspense>
  );
}

function Recherche() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const q = searchParams.get("q") || "";

  const { data: produits, isLoading: l1 } = useQuery({
    queryKey: ["recherche-produits", q],
    queryFn: async () =>
      unwrapList<{ id: number; nom: string; variantes?: unknown[] }>(
        (await produitsService.getAll({ search: q, per_page: 8 })).data
      ),
    enabled: !!q,
  });

  const { data: partenaires, isLoading: l2 } = useQuery({
    queryKey: ["recherche-partenaires", q],
    queryFn: async () => {
      const res = await partenairesService.getAll({ search: q, perPage: 8 });
      const items = (res as unknown as { data?: unknown })?.data;
      return Array.isArray(items) ? (items as { id: number; nom: string; email: string | null }[]) : [];
    },
    enabled: !!q,
  });

  const { data: commandesVente, isLoading: l3 } = useQuery({
    queryKey: ["recherche-commandes-vente", q],
    queryFn: async () =>
      unwrapList<{ id: number; reference: string }>(
        (await commandesVenteService.getAll({ search: q, per_page: 8 })).data
      ),
    enabled: !!q,
  });

  const { data: commandesAchat, isLoading: l4 } = useQuery({
    queryKey: ["recherche-commandes-achat", q],
    queryFn: async () =>
      unwrapList<{ id: number; reference: string }>(
        (await commandesAchatService.getAll({ search: q, per_page: 8 })).data
      ),
    enabled: !!q,
  });

  const loading = l1 || l2 || l3 || l4;
  const total =
    (produits?.length ?? 0) +
    (partenaires?.length ?? 0) +
    (commandesVente?.length ?? 0) +
    (commandesAchat?.length ?? 0);

  return (
    <div className="space-y-5">
      <PageHeader
        title="Recherche"
        description={q ? `Résultats pour « ${q} »` : "Saisissez un terme dans la barre de recherche"}
        icon={<Search className="h-5 w-5" />}
        onBack={() => router.back()}
      />

      {!q ? (
        <Card>
          <CardContent className="py-12 text-center text-slate-400">
            Utilisez la barre de recherche en haut de page.
          </CardContent>
        </Card>
      ) : loading ? (
        <SkeletonTable />
      ) : total === 0 ? (
        <Card>
          <CardContent className="py-12 text-center text-slate-400">
            Aucun résultat pour « {q} ».
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 lg:grid-cols-2">
          <ResultCard
            title="Produits"
            icon={<Package className="h-4 w-4 text-blue-600" />}
            count={produits?.length ?? 0}
            empty="Aucun produit"
            items={(produits ?? []).map((p) => ({
              key: p.id,
              label: p.nom,
              hint: p.variantes ? `${p.variantes.length} variante(s)` : "",
              onClick: () => router.push(`/dashboard/produits/${p.id}/details`),
            }))}
          />
          <ResultCard
            title="Partenaires"
            icon={<Users className="h-4 w-4 text-emerald-600" />}
            count={partenaires?.length ?? 0}
            empty="Aucun partenaire"
            items={(partenaires ?? []).map((p) => ({
              key: p.id,
              label: p.nom,
              hint: p.email || "",
              onClick: () => router.push(`/dashboard/partenaires/${p.id}/details`),
            }))}
          />
          <ResultCard
            title="Commandes de vente"
            icon={<ShoppingCart className="h-4 w-4 text-violet-600" />}
            count={commandesVente?.length ?? 0}
            empty="Aucune commande de vente"
            items={(commandesVente ?? []).map((c) => ({
              key: c.id,
              label: c.reference,
              hint: "",
              onClick: () => router.push(`/ventes/commandes/${c.id}/details`),
            }))}
          />
          <ResultCard
            title="Commandes d'achat"
            icon={<Truck className="h-4 w-4 text-amber-600" />}
            count={commandesAchat?.length ?? 0}
            empty="Aucune commande d'achat"
            items={(commandesAchat ?? []).map((c) => ({
              key: c.id,
              label: c.reference,
              hint: "",
              onClick: () => router.push(`/achats/commandes/${c.id}/details`),
            }))}
          />
        </div>
      )}
    </div>
  );
}

function ResultCard({
  title,
  icon,
  count,
  empty,
  items,
}: {
  title: string;
  icon: ReactNode;
  count: number;
  empty: string;
  items: { key: number; label: string; hint: string; onClick: () => void }[];
}) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-base">
          {icon}
          {title}
          <DataTableBadge variant="outline">{count}</DataTableBadge>
        </CardTitle>
      </CardHeader>
      <CardContent>
        {items.length === 0 ? (
          <p className="py-3 text-sm text-slate-400">{empty}</p>
        ) : (
          <div className="divide-y divide-slate-100 dark:divide-slate-800">
            {items.map((it) => (
              <button
                key={it.key}
                type="button"
                onClick={it.onClick}
                className="flex w-full items-center justify-between gap-3 py-2.5 text-left transition-colors hover:bg-slate-50 dark:hover:bg-slate-800/50"
              >
                <span className="truncate text-sm font-medium text-slate-800 dark:text-slate-100">
                  {it.label}
                </span>
                {it.hint && (
                  <span className="shrink-0 text-xs text-slate-400">{it.hint}</span>
                )}
              </button>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
