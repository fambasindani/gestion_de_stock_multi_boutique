"use client";
import { liveSearch } from "@/lib/utils/liveSearch";

import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { PageHeader } from "@/components/ui/PageHeader";
import { Input } from "@/components/ui/input";
import { SlidePanel } from "@/components/ui/SlidePanel";
import { ConfirmDialog } from "@/components/common/ConfirmDialog";
import {
  DataTable,
  DataTableBadge,
  type Column,
  type Action,
} from "@/components/common/DataTable";
import { FormInput } from "@/components/common/FormInput";
import { FormSelect } from "@/components/common/FormSelect";
import { inventairesService, type Inventaire } from "@/lib/api/services/inventaires.service";
import { emplacementsService } from "@/lib/api/services/emplacements.service";
import { useRouter } from "next/navigation";
import { formatDateInput, formatDateShort } from "@/lib/utils/format";
import { ClipboardList, Plus, Eye, Trash2, RefreshCw, Loader2 } from "lucide-react";

const statutVariant: Record<string, "default" | "info" | "success"> = {
  brouillon: "default",
  en_cours: "info",
  cloture: "success",
};

const statutLabel: Record<string, string> = {
  brouillon: "Brouillon",
  en_cours: "En cours",
  cloture: "Clôturé",
};

function unwrapList<T>(payload: unknown): T[] {
  if (Array.isArray(payload)) return payload as T[];
  const nested = (payload as { data?: unknown } | null)?.data;
  return Array.isArray(nested) ? (nested as T[]) : [];
}

export default function InventaireListPage() {
  const router = useRouter();
  const queryClient = useQueryClient();

  const [page, setPage] = useState(1);
  const [perPage, setPerPage] = useState(10);
  const [statutFilter, setStatutFilter] = useState("all");
  const [search, setSearch] = useState("");
  const [panelOpen, setPanelOpen] = useState(false);
  const [toDelete, setToDelete] = useState<Inventaire | null>(null);
  const [form, setForm] = useState({
    date_inventaire: formatDateInput(new Date()),
    emplacement_id: "",
    notes: "",
    generer_lignes: true,
  });

  const { data: emplacements } = useQuery({
    queryKey: ["emplacements-select"],
    queryFn: async () =>
      unwrapList<{ id: number; nom: string; code?: string | null }>(
        (await emplacementsService.getAll({ per_page: 200 })).data
      ),
    staleTime: 5 * 60 * 1000,
  });

  const { data, isLoading, isFetching, refetch } = useQuery({
    queryKey: ["inventaires", page, perPage, statutFilter, search],
    queryFn: async () =>
      (
        await inventairesService.getAll({
          page,
          per_page: perPage,
          statut: statutFilter,
          search: search || undefined,
        })
      ).data,
  });

  const records = data?.data ?? [];

  const createMutation = useMutation({
    mutationFn: () =>
      inventairesService.create({
        date_inventaire: form.date_inventaire || undefined,
        emplacement_id: form.emplacement_id ? Number(form.emplacement_id) : null,
        notes: form.notes || null,
        generer_lignes: form.generer_lignes,
      }),
    onSuccess: (res) => {
      if (!res.success) {
        toast.error(res.message || "Erreur lors de la création");
        return;
      }
      toast.success("Inventaire créé");
      setPanelOpen(false);
      setForm({
        date_inventaire: formatDateInput(new Date()),
        emplacement_id: "",
        notes: "",
        generer_lignes: true,
      });
      queryClient.invalidateQueries({ queryKey: ["inventaires"] });
      if (res.data?.id) router.push(`/dashboard/inventaire/${res.data.id}`);
    },
    onError: () => toast.error("Erreur lors de la création"),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: number) => inventairesService.delete(id),
    onSuccess: (res) => {
      if (!res.success) {
        toast.error(res.message || "Suppression impossible");
      } else {
        toast.success("Inventaire supprimé");
      }
      setToDelete(null);
      queryClient.invalidateQueries({ queryKey: ["inventaires"] });
    },
    onError: () => {
      toast.error("Suppression impossible");
      setToDelete(null);
    },
  });

  const columns: Column<Inventaire>[] = [
    {
      key: "reference",
      label: "Référence",
      render: (i) => <span className="font-mono text-sm font-medium">{i.reference}</span>,
    },
    {
      key: "date_inventaire",
      label: "Date",
      render: (i) => formatDateShort(i.date_inventaire),
    },
    {
      key: "emplacement",
      label: "Emplacement",
      hidden: "sm" as const,
      render: (i) => i.emplacement?.nom || "Tous",
    },
    {
      key: "lignes_count",
      label: "Lignes",
      className: "text-right",
      render: (i) => <span className="font-mono">{i.lignes_count ?? 0}</span>,
    },
    {
      key: "statut",
      label: "Statut",
      render: (i) => (
        <DataTableBadge variant={statutVariant[i.statut] || "default"}>
          {statutLabel[i.statut] || i.statut}
        </DataTableBadge>
      ),
    },
  ];

  const actions: Action<Inventaire>[] = [
    {
      label: "Ouvrir",
      icon: <Eye className="h-5 w-5" />,
      onClick: (i) => router.push(`/dashboard/inventaire/${i.id}`),
      variant: "ghost",
      className:
        "text-blue-600 hover:text-blue-700 hover:bg-blue-50 dark:text-blue-400 dark:hover:bg-blue-950/30",
    },
    {
      label: "Supprimer",
      icon: <Trash2 className="h-5 w-5" />,
      onClick: (i) => setToDelete(i),
      variant: "ghost",
      className:
        "text-red-600 hover:text-red-700 hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-950/30",
      show: (i) => i.statut !== "cloture",
    },
  ];

  return (
    <div className="space-y-5">
      <PageHeader
        title="Inventaires"
        description="Sessions de comptage physique et ajustements de stock"
        icon={<ClipboardList className="h-5 w-5" />}
        actions={
          <>
            <Button variant="outline" onClick={() => refetch()} disabled={isFetching}>
              {isFetching ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <RefreshCw className="mr-2 h-4 w-4" />
              )}
              Actualiser
            </Button>
            <Button onClick={() => setPanelOpen(true)}>
              <Plus className="mr-2 h-4 w-4" />
              Nouvel inventaire
            </Button>
          </>
        }
      />

      <Card>
        <CardContent className="p-5">
          <div className="mb-4 flex flex-wrap items-center gap-3">
            <Input
              placeholder="Rechercher une référence..."
              className="w-full sm:w-64"
              value={search}
              onChange={(e) => {
                const v = e.target.value;
                liveSearch(() => {
                  setSearch(v);
                  setPage(1);
                });
              }}
            />
            <FormSelect
              label=""
              name="statut"
              value={statutFilter}
              onChange={(e) => {
                setStatutFilter(e.target.value);
                setPage(1);
              }}
              options={[
                { value: "all", label: "Tous les statuts" },
                { value: "en_cours", label: "En cours" },
                { value: "cloture", label: "Clôturé" },
              ]}
              className="w-48"
            />
          </div>

          <DataTable
            data={records}
            columns={columns}
            actions={actions}
            loading={isLoading}
            emptyMessage="Aucun inventaire"
            emptyIcon={<ClipboardList className="h-12 w-12" />}
            pagination={{
              currentPage: data?.current_page ?? 1,
              totalPages: data?.last_page ?? 1,
              totalItems: data?.total ?? 0,
              perPage: data?.per_page ?? perPage,
              onPageChange: setPage,
              onPerPageChange: (v) => {
                setPerPage(v);
                setPage(1);
              },
              perPageOptions: [10, 20, 50, 100],
            }}
          />
        </CardContent>
      </Card>

      <SlidePanel
        isOpen={panelOpen}
        onClose={() => setPanelOpen(false)}
        title="Nouvel inventaire"
        subtitle="Un comptage physique par session"
        width="lg"
        footer={
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => setPanelOpen(false)}>
              Annuler
            </Button>
            <Button
              onClick={() => createMutation.mutate()}
              disabled={createMutation.isPending}
            >
              {createMutation.isPending && (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              )}
              Créer
            </Button>
          </div>
        }
      >
        <div className="space-y-4">
          <FormInput
            label="Date d'inventaire"
            name="date_inventaire"
            type="date"
            value={form.date_inventaire}
            onChange={(e) => setForm({ ...form, date_inventaire: e.target.value })}
            required
          />
          <FormSelect
            label="Emplacement"
            name="emplacement_id"
            value={form.emplacement_id}
            onChange={(e) => setForm({ ...form, emplacement_id: e.target.value })}
            options={(emplacements ?? []).map((e) => ({
              value: String(e.id),
              label: e.nom,
            }))}
            placeholder="Tous les emplacements"
          />
          <div>
            <label className="mb-1.5 block text-sm font-medium text-slate-700 dark:text-slate-300">
              Notes
            </label>
            <textarea
              value={form.notes}
              onChange={(e) => setForm({ ...form, notes: e.target.value })}
              rows={3}
              className="w-full rounded-lg border border-slate-200 bg-white px-3.5 py-2 text-sm shadow-sm transition-all focus:border-blue-500 focus:outline-none focus:ring-4 focus:ring-blue-500/10 dark:border-slate-700 dark:bg-slate-900"
              placeholder="Commentaire..."
            />
          </div>
          <label className="flex items-center gap-2 text-sm text-slate-700 dark:text-slate-300">
            <input
              type="checkbox"
              checked={form.generer_lignes}
              onChange={(e) => setForm({ ...form, generer_lignes: e.target.checked })}
              className="h-4 w-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500"
            />
            Générer les lignes à partir du stock actuel
          </label>
        </div>
      </SlidePanel>

      <ConfirmDialog
        open={!!toDelete}
        onOpenChange={(o) => !o && setToDelete(null)}
        onConfirm={() => toDelete && deleteMutation.mutate(toDelete.id)}
        title="Supprimer l'inventaire"
        description={`Voulez-vous supprimer ${toDelete?.reference} ? Cette action est irréversible.`}
        confirmLabel="Supprimer"
        variant="danger"
        isLoading={deleteMutation.isPending}
      />
    </div>
  );
}
