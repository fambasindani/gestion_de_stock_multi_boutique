"use client";
import { DEVISE } from "@/lib/utils/currency";

import { useParams, useRouter } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { PageHeader } from "@/components/ui/PageHeader";
import { StatCard } from "@/components/ui/StatCard";
import {
  utilisateursService,
  type UtilisateurActivite,
} from "@/lib/api/services/utilisateurs.service";
import { resolveMediaUrl } from "@/lib/utils/assets";
import { formatDateLong, formatDateTime, formatCompact } from "@/lib/utils/format";
import {
  User,
  Mail,
  Phone,
  Shield,
  Calendar,
  Clock,
  Pencil,
  Receipt,
  Wallet,
  TrendingUp,
  Building2,
  KeyRound,
  Loader2,
  Activity,
} from "lucide-react";

const actionVariant: Record<string, "default" | "success" | "warning" | "danger" | "info" | "outline"> = {
  login: "info",
  logout: "outline",
  create: "success",
  update: "warning",
  delete: "danger",
  vente_comptoir: "success",
  update_profil: "info",
  update_password: "warning",
};

const money = (v: unknown) => Number(v ?? 0).toFixed(2);

export default function UtilisateurDetailsPage() {
  const router = useRouter();
  const params = useParams<{ id: string }>();
  const id = Number(params.id);

  const { data: res, isLoading } = useQuery({
    queryKey: ["utilisateur-details", id],
    queryFn: async () => utilisateursService.getDetails(id),
    enabled: !!id,
  });

  if (isLoading) {
    return (
      <div className="flex min-h-[400px] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
      </div>
    );
  }

  const user = res?.data;
  if (!user) {
    return <div className="p-8 text-center text-slate-500">Utilisateur introuvable</div>;
  }

  const societe = (user as unknown as { societe?: { nom: string; logo?: string | null } }).societe;
  const logo = resolveMediaUrl(societe?.logo);
  const initials = (user.nom || "U")
    .split(" ")
    .map((w) => w.charAt(0))
    .join("")
    .toUpperCase()
    .slice(0, 2);

  const stats = res?.statistiques ?? { nombre_ventes: 0, total_ht: 0, total_ttc: 0 };
  const permissions = res?.permissions ?? [];
  const activite = res?.activite_recente ?? [];

  const permsByGarde = permissions.reduce<Record<string, string[]>>((acc, p) => {
    const g = p.garde || "autre";
    (acc[g] ||= []).push(p.nom);
    return acc;
  }, {});

  return (
    <div className="space-y-5">
      <PageHeader
        title={user.nom || user.email}
        description={user.email}
        icon={<User className="h-5 w-5" />}
        onBack={() => router.push("/dashboard/utilisateurs")}
        actions={
          <Button onClick={() => router.push(`/dashboard/utilisateurs/nouveau?id=${user.id}`)}>
            <Pencil className="mr-2 h-4 w-4" /> Modifier
          </Button>
        }
      />

      <div className="grid gap-4 sm:grid-cols-3">
        <StatCard
          title="Ventes réalisées"
          value={stats.nombre_ventes}
          icon={<Receipt className="h-5 w-5" />}
          color="blue"
        />
        <StatCard
          title="Total HT"
          value={`${formatCompact(stats.total_ht)} ${DEVISE}`}
          icon={<TrendingUp className="h-5 w-5" />}
          color="emerald"
        />
        <StatCard
          title="Total TTC"
          value={`${formatCompact(stats.total_ttc)} ${DEVISE}`}
          icon={<Wallet className="h-5 w-5" />}
          color="violet"
        />
      </div>

      <div className="grid gap-5 lg:grid-cols-3">
        {/* Identité */}
        <Card>
          <CardContent className="p-6">
            <div className="flex flex-col items-center text-center">
              <div className="flex h-20 w-20 items-center justify-center rounded-full bg-gradient-to-br from-blue-500 to-blue-700 text-2xl font-bold text-white shadow-lg shadow-blue-600/30">
                {initials}
              </div>
              <h2 className="mt-3 text-lg font-semibold text-slate-900 dark:text-white">
                {user.nom}
              </h2>
              <p className="text-sm text-slate-500">{user.email}</p>
              <div className="mt-3 flex flex-wrap justify-center gap-2">
                {user.roles?.map((r) => (
                  <Badge key={r.id} variant="info">
                    {r.nom}
                  </Badge>
                ))}
                <Badge variant={user.actif ? "success" : "danger"}>
                  {user.actif ? "Actif" : "Inactif"}
                </Badge>
              </div>
            </div>

            <div className="mt-5 space-y-3 border-t border-slate-100 pt-4 text-sm dark:border-slate-800">
              {societe && (
                <InfoRow icon={<Building2 className="h-4 w-4" />} label="Société">
                  <span className="flex items-center gap-2">
                    {logo && (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={logo} alt={societe.nom} className="h-5 w-5 rounded object-contain" />
                    )}
                    {societe.nom}
                  </span>
                </InfoRow>
              )}
              <InfoRow icon={<Mail className="h-4 w-4" />} label="Email">
                {user.email}
              </InfoRow>
              <InfoRow icon={<Phone className="h-4 w-4" />} label="Téléphone">
                {user.telephone || "—"}
              </InfoRow>
              <InfoRow icon={<Clock className="h-4 w-4" />} label="Dernière connexion">
                {user.derniere_connexion ? formatDateTime(user.derniere_connexion) : "Jamais"}
              </InfoRow>
              <InfoRow icon={<Calendar className="h-4 w-4" />} label="Créé le">
                {formatDateLong(user.created_at)}
              </InfoRow>
            </div>
          </CardContent>
        </Card>

        {/* Rôles & permissions */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <Shield className="h-4 w-4 text-blue-600" /> Rôles & permissions
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-slate-400">
                Rôles
              </p>
              {user.roles?.length ? (
                <div className="space-y-2">
                  {user.roles.map((r) => (
                    <div
                      key={r.id}
                      className="rounded-lg border border-slate-200 p-2.5 dark:border-slate-700"
                    >
                      <p className="text-sm font-medium text-slate-800 dark:text-slate-100">{r.nom}</p>
                      {r.description && (
                        <p className="text-xs text-slate-400">{r.description}</p>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-slate-400">Aucun rôle</p>
              )}
            </div>

            <div>
              <p className="mb-2 flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-slate-400">
                <KeyRound className="h-3.5 w-3.5" /> Permissions ({permissions.length})
              </p>
              {permissions.length === 0 ? (
                <p className="text-sm text-slate-400">Aucune permission</p>
              ) : (
                <div className="max-h-56 space-y-3 overflow-y-auto pr-1">
                  {Object.entries(permsByGarde).map(([garde, noms]) => (
                    <div key={garde}>
                      <p className="mb-1 text-[11px] font-semibold uppercase text-slate-500">
                        {garde}
                      </p>
                      <div className="flex flex-wrap gap-1.5">
                        {noms.map((n) => (
                          <Badge key={n} variant="outline" className="font-mono text-[10px]">
                            {n}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Activité récente */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <Activity className="h-4 w-4 text-blue-600" /> Activité récente
            </CardTitle>
          </CardHeader>
          <CardContent>
            {activite.length === 0 ? (
              <p className="py-4 text-center text-sm text-slate-400">Aucune activité</p>
            ) : (
              <ol className="relative space-y-4 border-l border-slate-200 pl-4 dark:border-slate-700">
                {activite.map((a: UtilisateurActivite) => (
                  <li key={a.id} className="relative">
                    <span className="absolute -left-[21px] top-1 h-2.5 w-2.5 rounded-full bg-blue-500 ring-4 ring-white dark:ring-slate-900" />
                    <div className="flex items-center gap-2">
                      <Badge variant={actionVariant[a.action] || "default"}>{a.action}</Badge>
                      <span className="text-xs text-slate-400">
                        {formatDateTime(a.created_at)}
                      </span>
                    </div>
                    {a.description && (
                      <p className="mt-1 text-sm text-slate-600 dark:text-slate-300">
                        {a.description}
                      </p>
                    )}
                  </li>
                ))}
              </ol>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

function InfoRow({
  icon,
  label,
  children,
}: {
  icon: React.ReactNode;
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex items-start justify-between gap-3">
      <span className="flex items-center gap-2 text-slate-500">
        <span className="text-slate-400">{icon}</span>
        {label}
      </span>
      <span className="text-right font-medium text-slate-800 dark:text-slate-100">
        {children}
      </span>
    </div>
  );
}
