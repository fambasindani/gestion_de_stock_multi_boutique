"use client";
import { liveSearch } from "@/lib/utils/liveSearch";

import { useState, Suspense, type ReactNode } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { PageHeader } from "@/components/ui/PageHeader";
import { SlidePanel } from "@/components/ui/SlidePanel";
import { FormSelect } from "@/components/common/FormSelect";
import {
  DataTable,
  DataTableBadge,
  type Column,
  type Action,
} from "@/components/common/DataTable";
import { auditLogsService } from "@/lib/api/services/audit-logs.service";
import { societesService } from "@/lib/api/services/societes.service";
import { useAuth } from "@/hooks/useAuth";
import { formatDateTime } from "@/lib/utils/format";
import {
  Search,
  RefreshCw,
  Loader2,
  FileText,
  Eye,
  Activity,
  User as UserIcon,
  Globe,
  Boxes,
} from "lucide-react";

interface AuditLog {
  id: number;
  user_id: number | null;
  action: string;
  entity_type: string | null;
  entity_id: number | string | null;
  description: string | null;
  old_values: Record<string, unknown> | null;
  new_values: Record<string, unknown> | null;
  ip_address: string | null;
  user_agent: string | null;
  created_at: string;
  societe_id?: number | null;
  user?: { id: number; nom: string; email: string } | null;
  societe?: { id: number; nom: string } | null;
}

const actionLabels: Record<string, string> = {
  create: "Création",
  update: "Modification",
  delete: "Suppression",
  login: "Connexion",
  logout: "Déconnexion",
  valider: "Validation",
  vente_comptoir: "Vente comptoir",
  update_profil: "Profil",
  update_password: "Mot de passe",
  generer_facture: "Facture",
  changer_etat: "Changement d'état",
};

const actionVariants: Record<
  string,
  "success" | "info" | "danger" | "warning" | "default"
> = {
  create: "success",
  update: "info",
  delete: "danger",
  login: "success",
  logout: "warning",
  valider: "success",
  vente_comptoir: "success",
  update_profil: "info",
  update_password: "warning",
};

const avatarColor = (name: string) => {
  const palette = ["bg-blue-600", "bg-emerald-600", "bg-violet-600", "bg-amber-600", "bg-rose-600"];
  let sum = 0;
  for (let i = 0; i < name.length; i++) sum += name.charCodeAt(i);
  return palette[sum % palette.length];
};

export default function LogsPageWrapper() {
  return (
    <Suspense fallback={<div className="p-8 text-center text-slate-500">Chargement...</div>}>
      <LogsPage />
    </Suspense>
  );
}

function LogsPage() {
  const { isSuperAdmin } = useAuth();
  const [searchInput, setSearchInput] = useState("");
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [perPage, setPerPage] = useState(15);
  const [actionFilter, setActionFilter] = useState("all");
  const [entityFilter, setEntityFilter] = useState("all");
  const [societeFilter, setSocieteFilter] = useState("all");
  const [dateDebut, setDateDebut] = useState("");
  const [dateFin, setDateFin] = useState("");
  const [detail, setDetail] = useState<AuditLog | null>(null);

  // Liste des boutiques (uniquement pour le compte plateforme, qui voit toutes les sociétés)
  const { data: societesData } = useQuery({
    queryKey: ["societes-select-logs"],
    queryFn: async () => {
      const res = await societesService.getAll({ per_page: 200 });
      const payload = res.data as unknown;
      const list = Array.isArray(payload)
        ? payload
        : ((payload as { data?: unknown[] })?.data ?? []);
      return list as { id: number; nom: string }[];
    },
    enabled: isSuperAdmin,
    staleTime: 5 * 60 * 1000,
  });
  const societes = societesData ?? [];

  const { data, isLoading, isFetching, refetch } = useQuery({
    queryKey: ["audit-logs", page, perPage, search, actionFilter, entityFilter, societeFilter, dateDebut, dateFin],
    queryFn: async () =>
      auditLogsService.getAll({
        page,
        per_page: perPage,
        search: search || undefined,
        action: actionFilter !== "all" ? actionFilter : undefined,
        entity_type: entityFilter !== "all" ? entityFilter : undefined,
        societe_id: societeFilter !== "all" ? Number(societeFilter) : undefined,
        date_debut: dateDebut || undefined,
        date_fin: dateFin || undefined,
      }),
    staleTime: 2 * 60 * 1000,
  });

  const apiData = data as Record<string, unknown> | undefined;
  const paginator = apiData?.data as Record<string, unknown> | undefined;
  const records = (Array.isArray(paginator?.data) ? paginator.data : []) as AuditLog[];
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

  const columns: Column<AuditLog>[] = [
    {
      key: "created_at",
      label: "Date",
      render: (l) => (
        <span className="whitespace-nowrap text-xs text-slate-500">
          {formatDateTime(l.created_at)}
        </span>
      ),
    },
    {
      key: "user",
      label: "Utilisateur",
      render: (l) => {
        const nom = l.user?.nom || l.user?.email || "Système";
        const initials = nom
          .split(" ")
          .map((w) => w.charAt(0))
          .join("")
          .toUpperCase()
          .slice(0, 2);
        return (
          <div className="flex items-center gap-2.5">
            <div
              className={`flex h-8 w-8 items-center justify-center rounded-full text-[11px] font-semibold text-white ${avatarColor(nom)}`}
            >
              {initials || "S"}
            </div>
            <div className="flex flex-col">
              <span className="text-sm font-medium text-slate-800 dark:text-slate-100">
                {l.user?.nom || "Système"}
              </span>
              <span className="text-xs text-slate-400">{l.user?.email || ""}</span>
            </div>
          </div>
        );
      },
    },
    {
      key: "societe",
      label: "Boutique",
      hidden: "md" as const,
      render: (l) => (
        <span className="text-sm text-slate-600 dark:text-slate-400">
          {l.societe?.nom || "—"}
        </span>
      ),
    },
    {
      key: "action",
      label: "Action",
      render: (l) => (
        <DataTableBadge variant={actionVariants[l.action] || "default"}>
          {actionLabels[l.action] || l.action}
        </DataTableBadge>
      ),
    },
    {
      key: "entity_type",
      label: "Entité",
      hidden: "md" as const,
      render: (l) => (
        <span className="text-sm">
          {l.entity_type || "—"}
          {l.entity_id != null && (
            <span className="ml-1 font-mono text-xs text-slate-400">#{l.entity_id}</span>
          )}
        </span>
      ),
    },
    {
      key: "description",
      label: "Description",
      hidden: "lg" as const,
      render: (l) => (
        <span className="text-sm text-slate-600 dark:text-slate-400">{l.description || "—"}</span>
      ),
    },
    {
      key: "ip_address",
      label: "IP",
      hidden: "lg" as const,
      render: (l) => (
        <span className="font-mono text-xs text-slate-400">{l.ip_address || "—"}</span>
      ),
    },
  ];

  const actions: Action<AuditLog>[] = [
    {
      label: "Détails",
      icon: <Eye className="h-5 w-5" />,
      onClick: (l) => setDetail(l),
      variant: "ghost",
      className:
        "text-blue-600 hover:text-blue-700 hover:bg-blue-50 dark:text-blue-400 dark:hover:bg-blue-950/30",
    },
  ];

  return (
    <div className="space-y-5">
      <PageHeader
        title="Journal d'activité"
        description="Historique des actions réalisées sur le système"
        icon={<Activity className="h-5 w-5" />}
        actions={
          <Button variant="outline" onClick={() => refetch()} disabled={isFetching}>
            {isFetching ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <RefreshCw className="mr-2 h-4 w-4" />
            )}
            Actualiser
          </Button>
        }
      />

      <Card>
        <CardContent className="p-5">
          <div className="mb-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-6">
            <div className="lg:col-span-2">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                <Input
                  placeholder="Rechercher (description, action, entité)..."
                  value={searchInput}
                  onChange={(e) => { const v = e.target.value; setSearchInput(v); liveSearch(() => { setSearch(v); setPage(1); }); }}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") handleSearch();
                  }}
                  className="pl-9"
                />
              </div>
            </div>
            <FormSelect
              label=""
              name="action"
              value={actionFilter}
              onChange={(e) => {
                setActionFilter(e.target.value);
                setPage(1);
              }}
              options={[
                { value: "all", label: "Toutes les actions" },
                { value: "create", label: "Création" },
                { value: "update", label: "Modification" },
                { value: "delete", label: "Suppression" },
                { value: "login", label: "Connexion" },
                { value: "logout", label: "Déconnexion" },
              ]}
            />
            <FormSelect
              label=""
              name="entity"
              value={entityFilter}
              onChange={(e) => {
                setEntityFilter(e.target.value);
                setPage(1);
              }}
              options={[
                { value: "all", label: "Toutes les entités" },
                { value: "Produit", label: "Produit" },
                { value: "CommandeAchat", label: "Commande achat" },
                { value: "CommandeVente", label: "Commande vente" },
                { value: "Facture", label: "Facture" },
                { value: "Partenaire", label: "Partenaire" },
                { value: "Utilisateur", label: "Utilisateur" },
                { value: "Retour", label: "Retour" },
                { value: "Lot", label: "Lot" },
              ]}
            />
            {isSuperAdmin && (
              <FormSelect
                label=""
                name="societe"
                value={societeFilter}
                onChange={(e) => {
                  setSocieteFilter(e.target.value);
                  setPage(1);
                }}
                options={[
                  { value: "all", label: "Toutes les boutiques" },
                  ...societes.map((s) => ({ value: String(s.id), label: s.nom })),
                ]}
              />
            )}
            <Input
              type="date"
              value={dateDebut}
              onChange={(e) => {
                setDateDebut(e.target.value);
                setPage(1);
              }}
            />
            <Input
              type="date"
              value={dateFin}
              onChange={(e) => {
                setDateFin(e.target.value);
                setPage(1);
              }}
            />
          </div>

          <div className="mb-3 flex items-center justify-between">
            <span className="text-sm text-slate-500">{pagination.total} entrée(s)</span>
            <Button variant="outline" size="sm" onClick={handleSearch}>
              <Search className="mr-2 h-4 w-4" /> Appliquer
            </Button>
          </div>

          <DataTable
            data={records}
            columns={columns}
            actions={actions}
            loading={isLoading}
            emptyMessage="Aucun log trouvé"
            emptyIcon={<FileText className="h-12 w-12" />}
            pagination={{
              currentPage: pagination.current_page,
              totalPages: pagination.last_page,
              totalItems: pagination.total,
              perPage: pagination.per_page,
              onPageChange: setPage,
              onPerPageChange: (v) => {
                setPerPage(v);
                setPage(1);
              },
              perPageOptions: [15, 30, 50, 100],
            }}
            rowKey="id"
          />
        </CardContent>
      </Card>

      {/* Détails du log */}
      <SlidePanel
        isOpen={!!detail}
        onClose={() => setDetail(null)}
        title="Détail de l'activité"
        subtitle={detail ? formatDateTime(detail.created_at) : ""}
        width="2xl"
      >
        {detail && (
          <div className="space-y-5">
            <div className="flex flex-wrap items-center gap-2">
              <DataTableBadge variant={actionVariants[detail.action] || "default"}>
                {actionLabels[detail.action] || detail.action}
              </DataTableBadge>
              {detail.entity_type && (
                <Badge variant="outline">
                  {detail.entity_type}
                  {detail.entity_id != null ? ` #${detail.entity_id}` : ""}
                </Badge>
              )}
            </div>

            <div className="grid gap-3 rounded-xl bg-slate-50 p-4 text-sm dark:bg-slate-900/60 sm:grid-cols-2">
              <DetailItem icon={<Activity className="h-3.5 w-3.5" />} label="Action">
                {actionLabels[detail.action] || detail.action}
              </DetailItem>
              <DetailItem icon={<UserIcon className="h-3.5 w-3.5" />} label="Utilisateur">
                {detail.user?.nom || "Système"}
                {detail.user?.email ? ` (${detail.user.email})` : ""}
              </DetailItem>
              <DetailItem icon={<Boxes className="h-3.5 w-3.5" />} label="Entité">
                {detail.entity_type || "—"}
                {detail.entity_id != null ? ` #${detail.entity_id}` : ""}
              </DetailItem>
              <DetailItem icon={<Globe className="h-3.5 w-3.5" />} label="Adresse IP">
                {detail.ip_address || "—"}
              </DetailItem>
            </div>

            {detail.description && (
              <div>
                <p className="mb-1.5 text-xs font-semibold uppercase tracking-wider text-slate-400">
                  Description
                </p>
                <p className="rounded-lg border border-slate-200 bg-white p-3 text-sm text-slate-700 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200">
                  {detail.description}
                </p>
              </div>
            )}

            {detail.user_agent && (
              <div>
                <p className="mb-1.5 text-xs font-semibold uppercase tracking-wider text-slate-400">
                  Navigateur / appareil
                </p>
                <p className="break-all rounded-lg border border-slate-200 bg-white p-3 font-mono text-xs text-slate-500 dark:border-slate-700 dark:bg-slate-900">
                  {detail.user_agent}
                </p>
              </div>
            )}

            <div className="grid gap-4 sm:grid-cols-2">
              <JsonBlock title="Anciennes valeurs" data={detail.old_values} />
              <JsonBlock title="Nouvelles valeurs" data={detail.new_values} />
            </div>
          </div>
        )}
      </SlidePanel>
    </div>
  );
}

function DetailItem({
  icon,
  label,
  children,
}: {
  icon: ReactNode;
  label: string;
  children: ReactNode;
}) {
  return (
    <div className="flex flex-col">
      <span className="mb-0.5 flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-wider text-slate-400">
        {icon}
        {label}
      </span>
      <span className="text-slate-800 dark:text-slate-100">{children}</span>
    </div>
  );
}

function JsonBlock({ title, data }: { title: string; data: Record<string, unknown> | null }) {
  return (
    <div>
      <p className="mb-1.5 text-xs font-semibold uppercase tracking-wider text-slate-400">{title}</p>
      {data && Object.keys(data).length > 0 ? (
        <pre className="max-h-64 overflow-auto rounded-lg border border-slate-200 bg-slate-50 p-3 font-mono text-[11px] leading-relaxed text-slate-600 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-300">
          {JSON.stringify(data, null, 2)}
        </pre>
      ) : (
        <p className="text-sm text-slate-400">Aucune donnée</p>
      )}
    </div>
  );
}
