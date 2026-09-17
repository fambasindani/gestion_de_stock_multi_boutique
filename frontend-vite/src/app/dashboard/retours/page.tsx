"use client";
import { DEVISE } from "@/lib/utils/currency";

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
import { SearchableSelect } from "@/components/ui/SearchableSelect";
import { FormInput } from "@/components/common/FormInput";
import { FormSelect } from "@/components/common/FormSelect";
import {
  retoursService,
  type Retour,
  type RetourType,
} from "@/lib/api/services/retours.service";
import { partenairesService } from "@/lib/api/services/partenaires.service";
import { emplacementsService } from "@/lib/api/services/emplacements.service";
import { produitsService } from "@/lib/api/services/produits.service";
import { formatDateInput, formatDateShort, formatDateTime } from "@/lib/utils/format";
import {
  RotateCcw,
  Plus,
  Trash2,
  RefreshCw,
  Loader2,
  RotateCw,
  Ban,
  Eye,
  CheckCircle2,
} from "lucide-react";

interface LigneForm {
  produit_id: string;
  quantite: number;
  prix_unitaire_ht: number;
}

const typeVariant: Record<string, "success" | "warning" | "danger"> = {
  client: "success",
  fournisseur: "warning",
  casse: "danger",
};

const typeLabel: Record<string, string> = {
  client: "Retour client",
  fournisseur: "Retour fournisseur",
  casse: "Casse / Avarie",
};

function unwrapList<T>(payload: unknown): T[] {
  if (Array.isArray(payload)) return payload as T[];
  const nested = (payload as { data?: unknown } | null)?.data;
  return Array.isArray(nested) ? (nested as T[]) : [];
}

export default function RetoursPage() {
  const queryClient = useQueryClient();
  const [page, setPage] = useState(1);
  const [perPage, setPerPage] = useState(10);
  const [typeFilter, setTypeFilter] = useState("all");
  const [panelOpen, setPanelOpen] = useState(false);
  const [toDelete, setToDelete] = useState<Retour | null>(null);
  const [toValider, setToValider] = useState<Retour | null>(null);
  const [detailId, setDetailId] = useState<number | null>(null);

  const [form, setForm] = useState({
    type: "client" as RetourType,
    date_retour: formatDateInput(new Date()),
    partenaire_id: "",
    emplacement_id: "",
    motif: "",
    notes: "",
  });
  const [lignes, setLignes] = useState<LigneForm[]>([
    { produit_id: "", quantite: 1, prix_unitaire_ht: 0 },
  ]);

  const { data, isLoading, isFetching, refetch } = useQuery({
    queryKey: ["retours", page, perPage, typeFilter],
    queryFn: async () =>
      (await retoursService.getAll({ page, per_page: perPage, type: typeFilter })).data,
  });
  const records = data?.data ?? [];

  const { data: detail } = useQuery({
    queryKey: ["retour-detail", detailId],
    queryFn: async () => (await retoursService.getById(Number(detailId))).data,
    enabled: !!detailId,
  });

  const { data: partenaires } = useQuery({
    queryKey: ["partenaires-select"],
    queryFn: async () => {
      const res = await partenairesService.getAll({ perPage: 200 });
      const items = (res as unknown as { data?: unknown })?.data;
      return Array.isArray(items)
        ? (items as { id: number; nom: string; code: string | null }[])
        : [];
    },
    staleTime: 5 * 60 * 1000,
  });

  const { data: emplacements } = useQuery({
    queryKey: ["emplacements-select"],
    queryFn: async () =>
      unwrapList<{ id: number; nom: string; code?: string | null }>(
        (await emplacementsService.getAll({ per_page: 200 })).data
      ),
    staleTime: 5 * 60 * 1000,
  });

  const { data: produits } = useQuery({
    queryKey: ["produits-variantes-select"],
    queryFn: async () => {
      const res = await produitsService.getAll({ per_page: 200 });
      const modeles = unwrapList<{
        nom: string;
        variantes?: Array<{ id: number; nom: string | null; code_interne: string | null; prix_vente: number | string }>;
      }>(res.data);
      const flat: { id: number; nom: string; sousTitre?: string; prix: number }[] = [];
      for (const m of modeles) {
        for (const v of m.variantes ?? []) {
          flat.push({
            id: v.id,
            nom: v.nom && v.nom !== m.nom ? `${m.nom} — ${v.nom}` : m.nom,
            sousTitre: v.code_interne ?? undefined,
            prix: Number(v.prix_vente) || 0,
          });
        }
      }
      return flat;
    },
    staleTime: 5 * 60 * 1000,
  });

  const createMutation = useMutation({
    mutationFn: () =>
      retoursService.create({
        type: form.type,
        date_retour: form.date_retour || undefined,
        partenaire_id: form.partenaire_id ? Number(form.partenaire_id) : null,
        emplacement_id: form.emplacement_id ? Number(form.emplacement_id) : null,
        motif: form.motif || null,
        notes: form.notes || null,
        lignes: lignes
          .filter((l) => l.produit_id)
          .map((l) => ({
            produit_id: Number(l.produit_id),
            quantite: Number(l.quantite),
            prix_unitaire_ht: Number(l.prix_unitaire_ht) || 0,
          })),
      }),
    onSuccess: (res) => {
      if (!res.success) {
        toast.error(res.message || "Erreur");
        return;
      }
      toast.success("Retour enregistré (en attente de validation)");
      setPanelOpen(false);
      setForm({
        type: "client",
        date_retour: formatDateInput(new Date()),
        partenaire_id: "",
        emplacement_id: "",
        motif: "",
        notes: "",
      });
      setLignes([{ produit_id: "", quantite: 1, prix_unitaire_ht: 0 }]);
      queryClient.invalidateQueries({ queryKey: ["retours"] });
    },
    onError: () => toast.error("Erreur lors de l'enregistrement"),
  });

  const validerMutation = useMutation({
    mutationFn: (id: number) => retoursService.valider(id),
    onSuccess: (res) => {
      if (!res.success) {
        toast.error(res.message || "Validation impossible");
        return;
      }
      toast.success("Retour validé, stock mis à jour");
      setToValider(null);
      queryClient.invalidateQueries({ queryKey: ["retours"] });
      queryClient.invalidateQueries({ queryKey: ["retour-detail", detailId] });
    },
    onError: () => {
      toast.error("Validation impossible");
      setToValider(null);
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: number) => retoursService.delete(id),
    onSuccess: (res) => {
      if (!res.success) toast.error(res.message || "Suppression impossible");
      else toast.success("Retour supprimé, stock corrigé");
      setToDelete(null);
      queryClient.invalidateQueries({ queryKey: ["retours"] });
    },
    onError: () => {
      toast.error("Suppression impossible");
      setToDelete(null);
    },
  });

  const produitOptions = (produits ?? []).map((p) => ({
    id: p.id,
    nom: p.nom,
    sousTitre: p.sousTitre,
  }));

  const columns: Column<Retour>[] = [
    {
      key: "reference",
      label: "Référence",
      render: (r) => <span className="font-mono text-sm font-medium">{r.reference}</span>,
    },
    { key: "date_retour", label: "Date", render: (r) => formatDateShort(r.date_retour) },
    {
      key: "type",
      label: "Type",
      render: (r) => (
        <DataTableBadge variant={typeVariant[r.type] || "default"}>
          {typeLabel[r.type] || r.type}
        </DataTableBadge>
      ),
    },
    {
      key: "statut",
      label: "Statut",
      render: (r) => (
        <DataTableBadge variant={r.statut === "valide" ? "success" : "warning"}>
          {r.statut === "valide" ? "Validé" : "Brouillon"}
        </DataTableBadge>
      ),
    },
    {
      key: "partenaire",
      label: "Partenaire",
      hidden: "md" as const,
      render: (r) => r.partenaire?.nom || "—",
    },
    {
      key: "motif",
      label: "Motif",
      hidden: "lg" as const,
      render: (r) => r.motif || "—",
    },
    {
      key: "lignes_count",
      label: "Lignes",
      className: "text-right",
      render: (r) => <span className="font-mono">{r.lignes_count ?? 0}</span>,
    },
  ];

  const actions: Action<Retour>[] = [
    {
      label: "Détails",
      icon: <Eye className="h-5 w-5" />,
      onClick: (r) => setDetailId(r.id),
      variant: "ghost",
      className:
        "text-blue-600 hover:text-blue-700 hover:bg-blue-50 dark:text-blue-400 dark:hover:bg-blue-950/30",
    },
    {
      label: "Valider",
      icon: <CheckCircle2 className="h-5 w-5" />,
      onClick: (r) => setToValider(r),
      variant: "ghost",
      className:
        "text-emerald-600 hover:text-emerald-700 hover:bg-emerald-50 dark:text-emerald-400 dark:hover:bg-emerald-950/30",
      show: (r) => r.statut !== "valide",
    },
    {
      label: "Supprimer",
      icon: <Trash2 className="h-5 w-5" />,
      onClick: (r) => setToDelete(r),
      variant: "ghost",
      className:
        "text-red-600 hover:text-red-700 hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-950/30",
      show: (r) => r.statut !== "valide",
    },
  ];

  const total =
    lignes.reduce((s, l) => s + (Number(l.prix_unitaire_ht) || 0) * (Number(l.quantite) || 0), 0);

  return (
    <div className="space-y-5">
      <PageHeader
        title="Retours en stock"
        description="Retour client, renvoi fournisseur ou casse — le stock est ajusté automatiquement"
        icon={<RotateCcw className="h-5 w-5" />}
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
              Nouveau retour
            </Button>
          </>
        }
      />

      <Card>
        <CardContent className="p-5">
          <div className="mb-4 flex flex-wrap items-center gap-3">
            <FormSelect
              label=""
              name="type"
              value={typeFilter}
              onChange={(e) => {
                setTypeFilter(e.target.value);
                setPage(1);
              }}
              options={[
                { value: "all", label: "Tous les types" },
                { value: "client", label: "Retours client" },
                { value: "fournisseur", label: "Retours fournisseur" },
                { value: "casse", label: "Casse / Avarie" },
              ]}
              className="w-56"
            />
          </div>

          <DataTable
            data={records}
            columns={columns}
            actions={actions}
            loading={isLoading}
            emptyMessage="Aucun retour"
            emptyIcon={<RotateCcw className="h-12 w-12" />}
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
              perPageOptions: [10, 20, 50],
            }}
          />
        </CardContent>
      </Card>

      <SlidePanel
        isOpen={panelOpen}
        onClose={() => setPanelOpen(false)}
        title="Nouveau retour"
        subtitle="Le stock sera appliqué après validation (permission requise)"
        width="3xl"
        footer={
          <div className="flex items-center justify-between gap-2">
            <span className="text-sm text-slate-500">
              Total : <span className="font-mono font-semibold">{total.toFixed(2)} {DEVISE}</span>
            </span>
            <div className="flex gap-2">
              <Button variant="outline" onClick={() => setPanelOpen(false)}>
                Annuler
              </Button>
              <Button
                onClick={() => createMutation.mutate()}
                disabled={createMutation.isPending || lignes.every((l) => !l.produit_id)}
              >
                {createMutation.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Enregistrer
              </Button>
            </div>
          </div>
        }
      >
        <div className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <FormSelect
              label="Type de retour"
              name="type"
              value={form.type}
              onChange={(e) => setForm({ ...form, type: e.target.value as RetourType })}
              options={[
                { value: "client", label: "Retour client (remise en stock)" },
                { value: "fournisseur", label: "Retour fournisseur (sortie de stock)" },
                { value: "casse", label: "Casse / Avarie (sortie de stock)" },
              ]}
              required
            />
            <FormInput
              label="Date"
              name="date_retour"
              type="date"
              value={form.date_retour}
              onChange={(e) => setForm({ ...form, date_retour: e.target.value })}
            />
            <div>
              <label className="mb-1.5 block text-sm font-medium text-slate-700 dark:text-slate-300">
                Partenaire (optionnel)
              </label>
              <SearchableSelect
                options={(partenaires ?? []).map((p) => ({
                  id: p.id,
                  nom: p.nom,
                  sousTitre: p.code ?? undefined,
                }))}
                value={form.partenaire_id}
                onValueChange={(v) => setForm({ ...form, partenaire_id: v })}
                placeholder="Client / fournisseur"
              />
            </div>
            <div>
              <label className="mb-1.5 block text-sm font-medium text-slate-700 dark:text-slate-300">
                Emplacement {form.type === "client" ? "(entrée)" : "(sortie)"}
              </label>
              <SearchableSelect
                options={(emplacements ?? []).map((e) => ({
                  id: e.id,
                  nom: e.nom,
                  sousTitre: e.code ?? undefined,
                }))}
                value={form.emplacement_id}
                onValueChange={(v) => setForm({ ...form, emplacement_id: v })}
                placeholder="Auto si vide"
              />
            </div>
            <FormInput
              label="Motif"
              name="motif"
              value={form.motif}
              onChange={(e) => setForm({ ...form, motif: e.target.value })}
              placeholder="Ex : produit défectueux, erreur de commande..."
            />
          </div>

          <div className="rounded-xl border border-slate-200 p-4 dark:border-slate-700">
            <div className="mb-3 flex items-center justify-between">
              <p className="text-sm font-semibold text-slate-700 dark:text-slate-200">Lignes</p>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() =>
                  setLignes((prev) => [...prev, { produit_id: "", quantite: 1, prix_unitaire_ht: 0 }])
                }
              >
                <Plus className="mr-1 h-3.5 w-3.5" /> Ajouter
              </Button>
            </div>
            <div className="space-y-3">
              {lignes.map((l, i) => (
                <div key={i} className="grid grid-cols-12 items-end gap-2">
                  <div className="col-span-6">
                    <SearchableSelect
                      options={produitOptions}
                      value={l.produit_id}
                      onValueChange={(v) => {
                        const option = (produits ?? []).find((p) => String(p.id) === v);
                        setLignes((prev) =>
                          prev.map((x, xi) =>
                            xi === i
                              ? {
                                  ...x,
                                  produit_id: v,
                                  prix_unitaire_ht: option?.prix ?? x.prix_unitaire_ht,
                                }
                              : x
                          )
                        );
                      }}
                      placeholder="Sélectionner un produit"
                    />
                  </div>
                  <div className="col-span-2">
                    <Input
                      type="number"
                      min="0.01"
                      step="0.01"
                      value={l.quantite}
                      onChange={(e) =>
                        setLignes((prev) =>
                          prev.map((x, xi) =>
                            xi === i ? { ...x, quantite: Number(e.target.value) } : x
                          )
                        )
                      }
                      placeholder="Qté"
                    />
                  </div>
                  <div className="col-span-3">
                    <Input
                      type="number"
                      min="0"
                      step="0.01"
                      value={l.prix_unitaire_ht}
                      onChange={(e) =>
                        setLignes((prev) =>
                          prev.map((x, xi) =>
                            xi === i ? { ...x, prix_unitaire_ht: Number(e.target.value) } : x
                          )
                        )
                      }
                      placeholder="Prix HT"
                    />
                  </div>
                  <div className="col-span-1">
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon-sm"
                      onClick={() => setLignes((prev) => prev.filter((_, xi) => xi !== i))}
                      disabled={lignes.length <= 1}
                      className="text-red-500"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="flex flex-wrap gap-2 text-xs text-slate-500">
            <span className="inline-flex items-center gap-1">
              <RotateCw className="h-3.5 w-3.5 text-emerald-500" /> Client : remet en stock
            </span>
            <span className="inline-flex items-center gap-1">
              <Ban className="h-3.5 w-3.5 text-amber-500" /> Fournisseur : sort du stock
            </span>
            <span className="inline-flex items-center gap-1">
              <Ban className="h-3.5 w-3.5 text-red-500" /> Casse : sort du stock (rebut)
            </span>
          </div>
        </div>
      </SlidePanel>

      {/* Détails du retour */}
      <SlidePanel
        isOpen={!!detailId}
        onClose={() => setDetailId(null)}
        title={detail ? `Retour ${detail.reference}` : "Détail du retour"}
        subtitle={
          detail
            ? `${typeLabel[detail.type] ?? detail.type} · ${formatDateShort(detail.date_retour)}`
            : ""
        }
        width="2xl"
        footer={
          detail && detail.statut !== "valide" ? (
            <div className="flex justify-end">
              <Button
                onClick={() => setToValider(detail)}
                disabled={validerMutation.isPending}
              >
                {validerMutation.isPending ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                  <CheckCircle2 className="mr-2 h-4 w-4" />
                )}
                Valider le retour
              </Button>
            </div>
          ) : undefined
        }
      >
        {detail ? (
          <div className="space-y-4">
            <div className="flex flex-wrap gap-2">
              <DataTableBadge variant={typeVariant[detail.type] || "default"}>
                {typeLabel[detail.type] || detail.type}
              </DataTableBadge>
              <DataTableBadge variant={detail.statut === "valide" ? "success" : "warning"}>
                {detail.statut === "valide" ? "Validé" : "Brouillon"}
              </DataTableBadge>
            </div>

            <div className="grid grid-cols-2 gap-3 rounded-xl bg-slate-50 p-4 text-sm dark:bg-slate-900/60">
              <DetailInfo label="Date" value={formatDateShort(detail.date_retour)} />
              <DetailInfo label="Partenaire" value={detail.partenaire?.nom || "—"} />
              <DetailInfo label="Emplacement" value={detail.emplacement?.nom || "Auto"} />
              <DetailInfo label="Motif" value={detail.motif || "—"} />
              <DetailInfo label="Créé par" value={detail.utilisateur?.nom || "—"} />
              <DetailInfo
                label="Validé le"
                value={detail.date_validation ? formatDateTime(detail.date_validation) : "—"}
              />
            </div>

            {detail.notes && (
              <p className="text-sm text-slate-500 dark:text-slate-400">{detail.notes}</p>
            )}

            <div className="overflow-hidden rounded-xl border border-slate-200 dark:border-slate-700">
              <table className="w-full text-sm">
                <thead className="bg-slate-50 dark:bg-slate-800/60">
                  <tr>
                    <th className="px-3 py-2 text-left text-xs font-semibold uppercase text-slate-500">Produit</th>
                    <th className="px-3 py-2 text-right text-xs font-semibold uppercase text-slate-500">Qté</th>
                    <th className="px-3 py-2 text-right text-xs font-semibold uppercase text-slate-500">P.U.</th>
                    <th className="px-3 py-2 text-right text-xs font-semibold uppercase text-slate-500">Total</th>
                  </tr>
                </thead>
                <tbody>
                  {(detail.lignes ?? []).map((l) => (
                    <tr key={l.id} className="border-t border-slate-100 dark:border-slate-800">
                      <td className="px-3 py-2">
                        {l.produit?.nom || `#${l.produit_id}`}
                        {l.produit?.code_interne && (
                          <span className="ml-2 font-mono text-xs text-slate-400">
                            {l.produit.code_interne}
                          </span>
                        )}
                      </td>
                      <td className="px-3 py-2 text-right font-mono">{Number(l.quantite)}</td>
                      <td className="px-3 py-2 text-right font-mono">
                        {Number(l.prix_unitaire_ht).toFixed(2)}
                      </td>
                      <td className="px-3 py-2 text-right font-mono">
                        {Number(l.montant_ht).toFixed(2)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="flex justify-end text-sm font-semibold text-slate-800 dark:text-slate-100">
              Total :{" "}
              {(detail.lignes ?? []).reduce((s, l) => s + Number(l.montant_ht), 0).toFixed(2)} {DEVISE}
            </div>

            {detail.statut !== "valide" && (
              <p className="rounded-lg bg-amber-50 p-3 text-xs text-amber-700 dark:bg-amber-950/30 dark:text-amber-400">
                Ce retour est en <strong>brouillon</strong> : le stock n'est pas encore modifié.
                Validez-le (permission requise) pour appliquer le mouvement.
              </p>
            )}
          </div>
        ) : (
          <div className="flex justify-center py-8">
            <Loader2 className="h-6 w-6 animate-spin text-blue-600" />
          </div>
        )}
      </SlidePanel>

      <ConfirmDialog
        open={!!toValider}
        onOpenChange={(o) => !o && setToValider(null)}
        onConfirm={() => toValider && validerMutation.mutate(toValider.id)}
        title="Valider le retour"
        description={`Confirmer la validation de ${toValider?.reference} ? Le mouvement de stock sera appliqué et le retour ne pourra plus être supprimé.`}
        confirmLabel="Valider"
        variant="info"
        isLoading={validerMutation.isPending}
      />

      <ConfirmDialog
        open={!!toDelete}
        onOpenChange={(o) => !o && setToDelete(null)}
        onConfirm={() => toDelete && deleteMutation.mutate(toDelete.id)}
        title="Supprimer le retour"
        description={`Supprimer le retour ${toDelete?.reference} ? Cette action est irréversible.`}
        confirmLabel="Supprimer"
        variant="danger"
        isLoading={deleteMutation.isPending}
      />
    </div>
  );
}

function DetailInfo({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex flex-col">
      <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">
        {label}
      </span>
      <span className="text-slate-800 dark:text-slate-100">{value}</span>
    </div>
  );
}
