"use client";

import { useEffect, useMemo, useState } from "react";
import { useMutation, useQuery } from "@tanstack/react-query";
import { toast } from "sonner";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { PageHeader } from "@/components/ui/PageHeader";
import { Input } from "@/components/ui/input";
import { FormSelect } from "@/components/common/FormSelect";
import { TicketPDF } from "@/components/pos/TicketPDF";
import { saveElementAsPdf, printElementAsPdf } from "@/lib/utils/exportPdf";
import { posService, type PosVenteResult } from "@/lib/api/services/pos.service";
import { produitsService } from "@/lib/api/services/produits.service";
import { parametresService } from "@/lib/api/services/parametres.service";
import { resolveMediaUrl } from "@/lib/utils/assets";
import {
  ShoppingCart,
  Search,
  Plus,
  Minus,
  Trash2,
  Printer,
  Loader2,
  Banknote,
  Download,
} from "lucide-react";

interface CartLine {
  produit_id: number;
  nom: string;
  code: string | null;
  prix_unitaire_ht: number;
  quantite: number;
  taux_tva: number;
  taux_remise: number;
}

interface PosProduit {
  id: number;
  nom: string;
  code_interne: string | null;
  prix_vente: number;
}

const money = (v: number) => Number(v || 0).toFixed(2);

const MODES = [
  { value: "especes", label: "Espèces" },
  { value: "carte", label: "Carte bancaire" },
  { value: "mobile_money", label: "Mobile money" },
  { value: "virement", label: "Virement" },
  { value: "cheque", label: "Chèque" },
];

function unwrapList<T>(payload: unknown): T[] {
  if (Array.isArray(payload)) return payload as T[];
  const nested = (payload as { data?: unknown } | null)?.data;
  return Array.isArray(nested) ? (nested as T[]) : [];
}

export default function PosPage() {
  const [search, setSearch] = useState("");
  const [cart, setCart] = useState<CartLine[]>([]);
  const [clientNom, setClientNom] = useState("");
  const [modePaiement, setModePaiement] = useState("especes");
  const [montantPaye, setMontantPaye] = useState("");
  const [lastSale, setLastSale] = useState<PosVenteResult | null>(null);
  const [printSignal, setPrintSignal] = useState(0);

  const { data: params } = useQuery({
    queryKey: ["parametres"],
    queryFn: async () => (await parametresService.getAll()).data ?? {},
    staleTime: 5 * 60 * 1000,
  });

  const tvaDefaut = Number(params?.tva_taux ?? 16) || 0;

  const { data: produits, isFetching } = useQuery({
    queryKey: ["pos-produits", search],
    queryFn: async () => {
      const res = await produitsService.getAll({
        search: search || undefined,
        per_page: 30,
      });
      const modeles = unwrapList<{
        id: number;
        nom: string;
        variantes?: Array<{
          id: number;
          nom: string | null;
          code_interne: string | null;
          prix_vente: number | string;
        }>;
      }>(res.data);

      const flat: PosProduit[] = [];
      for (const m of modeles) {
        for (const v of m.variantes ?? []) {
          flat.push({
            id: v.id,
            nom: v.nom || m.nom,
            code_interne: v.code_interne,
            prix_vente: Number(v.prix_vente) || 0,
          });
        }
      }
      return flat;
    },
    staleTime: 30 * 1000,
  });

  const totals = useMemo(() => {
    let ht = 0;
    let tva = 0;
    let ttc = 0;
    for (const l of cart) {
      const brut = l.prix_unitaire_ht * l.quantite;
      const remise = brut * (l.taux_remise / 100);
      const htLigne = brut - remise;
      ht += htLigne;
      tva += htLigne * (l.taux_tva / 100);
      ttc += htLigne * (1 + l.taux_tva / 100);
    }
    const paye = montantPaye === "" ? ttc : Number(montantPaye);
    return { ht, tva, ttc, paye, monnaie: Math.max(0, paye - ttc) };
  }, [cart, montantPaye]);

  useEffect(() => {
    if (printSignal > 0 && lastSale) {
      const t = setTimeout(() => {
        printElementAsPdf(<TicketPDF vente={lastSale} entreprise={params ?? undefined} />);
      }, 150);
      return () => clearTimeout(t);
    }
  }, [printSignal, lastSale, params]);

  const addProduct = (p: PosProduit) => {
    const nom = p.nom || "Produit";
    setCart((prev) => {
      const existing = prev.find((l) => l.produit_id === p.id);
      if (existing) {
        return prev.map((l) =>
          l.produit_id === p.id ? { ...l, quantite: l.quantite + 1 } : l
        );
      }
      return [
        ...prev,
        {
          produit_id: p.id,
          nom,
          code: p.code_interne,
          prix_unitaire_ht: Number(p.prix_vente) || 0,
          quantite: 1,
          taux_tva: tvaDefaut,
          taux_remise: 0,
        },
      ];
    });
  };

  const updateLine = (id: number, patch: Partial<CartLine>) =>
    setCart((prev) => prev.map((l) => (l.produit_id === id ? { ...l, ...patch } : l)));
  const removeLine = (id: number) =>
    setCart((prev) => prev.filter((l) => l.produit_id !== id));

  const venteMutation = useMutation({
    mutationFn: () =>
      posService.vendre({
        lignes: cart.map((l) => ({
          produit_id: l.produit_id,
          quantite: l.quantite,
          prix_unitaire_ht: l.prix_unitaire_ht,
          taux_tva: l.taux_tva,
          taux_remise: l.taux_remise,
        })),
        client_nom: clientNom || null,
        mode_paiement: modePaiement,
        montant_paye: totals.paye,
      }),
    onSuccess: (res) => {
      if (!res.success || !res.data) {
        toast.error(res.message || "Vente impossible");
        return;
      }
      toast.success("Vente enregistrée — impression du ticket");
      setLastSale(res.data);
      setPrintSignal((n) => n + 1);
      setCart([]);
      setClientNom("");
      setMontantPaye("");
    },
    onError: () => toast.error("Erreur lors de la vente"),
  });

  const enregistrer = () => {
    if (cart.length === 0) {
      toast.error("Le panier est vide");
      return;
    }
    venteMutation.mutate();
  };

  return (
    <div className="space-y-5">
      <PageHeader
        title="Vente comptoir (POS)"
        description="Encaissez et imprimez le ticket immédiatement"
        icon={<ShoppingCart className="h-5 w-5" />}
        actions={
          lastSale && (
            <>
              <Button
                variant="outline"
                onClick={() =>
                  saveElementAsPdf(
                    <TicketPDF vente={lastSale} entreprise={params ?? undefined} />,
                    `ticket-${lastSale.facture.numero_facture || lastSale.commande.reference}`
                  )
                }
              >
                <Download className="mr-2 h-4 w-4" />
                Télécharger le ticket
              </Button>
              <Button variant="outline" onClick={() => setPrintSignal((n) => n + 1)}>
                <Printer className="mr-2 h-4 w-4" />
                Réimprimer
              </Button>
            </>
          )
        }
      />

      <div className="grid gap-5 lg:grid-cols-[1.4fr_1fr]">
        {/* Produits */}
        <Card>
          <CardContent className="p-5">
            <div className="relative mb-4">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
              <Input
                autoFocus
                placeholder="Rechercher un produit (nom ou code)..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-9"
              />
            </div>

            <div className="grid max-h-[520px] gap-2 overflow-y-auto sm:grid-cols-2">
              {isFetching && (
                <div className="col-span-2 py-6 text-center text-sm text-slate-400">
                  <Loader2 className="mx-auto h-5 w-5 animate-spin" />
                </div>
              )}
              {(produits ?? []).map((p) => (
                <button
                  key={p.id}
                  type="button"
                  onClick={() => addProduct(p)}
                  className="flex items-center justify-between gap-2 rounded-xl border border-slate-200 bg-white p-3 text-left transition-all hover:-translate-y-0.5 hover:border-blue-300 hover:shadow-md dark:border-slate-700 dark:bg-slate-900 dark:hover:border-blue-800"
                >
                  <div className="min-w-0">
                    <p className="truncate text-sm font-medium text-slate-800 dark:text-slate-100">
                      {p.nom}
                    </p>
                    <p className="font-mono text-xs text-slate-400">{p.code_interne || "-"}</p>
                  </div>
                  <span className="shrink-0 rounded-lg bg-blue-50 px-2 py-1 text-xs font-semibold text-blue-600 dark:bg-blue-950/40 dark:text-blue-400">
                    {money(p.prix_vente)}
                  </span>
                </button>
              ))}
              {!isFetching && (produits ?? []).length === 0 && (
                <p className="col-span-2 py-6 text-center text-sm text-slate-400">
                  Aucun produit
                </p>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Panier */}
        <Card>
          <CardContent className="flex h-full flex-col p-5">
            <div className="mb-3 flex items-center justify-between">
              <h3 className="font-semibold text-slate-800 dark:text-slate-100">
                Panier ({cart.length})
              </h3>
              {cart.length > 0 && (
                <Button variant="ghost" size="sm" onClick={() => setCart([])}>
                  <Trash2 className="mr-1 h-4 w-4" /> Vider
                </Button>
              )}
            </div>

            <div className="mb-4 max-h-[300px] space-y-2 overflow-y-auto">
              {cart.length === 0 && (
                <p className="py-8 text-center text-sm text-slate-400">
                  Cliquez sur un produit pour l'ajouter
                </p>
              )}
              {cart.map((l) => (
                <div
                  key={l.produit_id}
                  className="rounded-xl border border-slate-200 p-3 dark:border-slate-700"
                >
                  <div className="mb-2 flex items-start justify-between gap-2">
                    <span className="text-sm font-medium text-slate-800 dark:text-slate-100">
                      {l.nom}
                    </span>
                    <button
                      type="button"
                      onClick={() => removeLine(l.produit_id)}
                      className="text-red-500 hover:text-red-600"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                  <div className="flex flex-wrap items-center gap-2">
                    <div className="flex items-center gap-1">
                      <Button
                        variant="outline"
                        size="icon-sm"
                        onClick={() =>
                          updateLine(l.produit_id, {
                            quantite: Math.max(1, l.quantite - 1),
                          })
                        }
                      >
                        <Minus className="h-3 w-3" />
                      </Button>
                      <input
                        type="number"
                        min="1"
                        value={l.quantite}
                        onChange={(e) =>
                          updateLine(l.produit_id, {
                            quantite: Math.max(1, Number(e.target.value)),
                          })
                        }
                        className="h-8 w-12 rounded-lg border border-slate-200 bg-white text-center font-mono text-sm dark:border-slate-700 dark:bg-slate-900"
                      />
                      <Button
                        variant="outline"
                        size="icon-sm"
                        onClick={() =>
                          updateLine(l.produit_id, { quantite: l.quantite + 1 })
                        }
                      >
                        <Plus className="h-3 w-3" />
                      </Button>
                    </div>
                    <span
                      title="Prix défini sur le produit"
                      className="w-24 text-right font-mono text-sm text-slate-500 dark:text-slate-400"
                    >
                      {money(l.prix_unitaire_ht)} ×
                    </span>
                    <span className="ml-auto font-mono text-sm font-semibold text-slate-700 dark:text-slate-200">
                      {money(l.prix_unitaire_ht * l.quantite * (1 + l.taux_tva / 100))}
                    </span>
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-auto space-y-3 border-t border-slate-200 pt-4 dark:border-slate-800">
              <Input
                placeholder="Nom du client (optionnel)"
                value={clientNom}
                onChange={(e) => setClientNom(e.target.value)}
              />
              <div className="grid grid-cols-2 gap-3">
                <FormSelect
                  label="Paiement"
                  name="mode_paiement"
                  value={modePaiement}
                  onChange={(e) => setModePaiement(e.target.value)}
                  options={MODES}
                />
                <FormInputMontant
                  value={montantPaye}
                  onChange={setMontantPaye}
                  placeholder={money(totals.ttc)}
                />
              </div>

              <div className="space-y-1 rounded-xl bg-slate-50 p-3 text-sm dark:bg-slate-900/60">
                <Row label="Total HT" value={money(totals.ht)} />
                <Row label={`TVA (${tvaDefaut}%)`} value={money(totals.tva)} />
                <Row label="Total TTC" value={money(totals.ttc)} strong />
                <Row label="Monnaie" value={money(totals.monnaie)} />
              </div>

              <Button
                className="w-full"
                size="lg"
                onClick={enregistrer}
                disabled={venteMutation.isPending || cart.length === 0}
              >
                {venteMutation.isPending ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                  <Banknote className="mr-2 h-4 w-4" />
                )}
                Encaisser & imprimer
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>

    </div>
  );
}

function Row({ label, value, strong }: { label: string; value: string; strong?: boolean }) {
  return (
    <div className="flex justify-between">
      <span className="text-slate-500">{label}</span>
      <span className={strong ? "font-bold text-slate-900 dark:text-white" : "font-medium"}>
        {value} CDF
      </span>
    </div>
  );
}

function FormInputMontant({
  value,
  onChange,
  placeholder,
}: {
  value: string;
  onChange: (v: string) => void;
  placeholder: string;
}) {
  return (
    <div className="space-y-1.5">
      <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">
        Montant payé
      </label>
      <input
        type="number"
        min="0"
        step="0.01"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="h-10 w-full rounded-lg border border-slate-200 bg-white px-3.5 text-sm shadow-sm transition-all focus:border-blue-500 focus:outline-none focus:ring-4 focus:ring-blue-500/10 dark:border-slate-700 dark:bg-slate-900"
      />
    </div>
  );
}
