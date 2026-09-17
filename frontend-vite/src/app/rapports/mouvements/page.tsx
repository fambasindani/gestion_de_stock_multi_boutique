"use client";
import { DEVISE } from "@/lib/utils/currency";

import React, { useState, Suspense, useCallback } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { DataTable } from "@/components/common/DataTable";
import { SkeletonTable } from "@/components/ui/skeleton";
import { rapportsService } from "@/lib/api/services/rapports.service";
import { RapportVentesLigne, RapportAchatsLigne, RapportMouvementLigne } from "@/lib/api/typess";
import {
  Search, RefreshCw, Loader2, BarChart3, FileText, FileSpreadsheet,
  ShoppingCart, Truck, PackageOpen
} from "lucide-react";
import * as XLSX from "xlsx";

type Tab = "ventes" | "achats" | "mouvements";

export default function MouvementsPageWrapper() {
  return (
    <Suspense fallback={<div className="p-8 text-center text-gray-500">Chargement...</div>}>
      <RapportPage />
    </Suspense>
  );
}

function RapportPage() {
  const [tab, setTab] = useState<Tab>("ventes");
  const [dateDebut, setDateDebut] = useState("");
  const [dateFin, setDateFin] = useState("");
  const [filters, setFilters] = useState<Record<string, string>>({});

  const appliquerFiltres = useCallback(() => {
    const f: Record<string, string> = {};
    if (dateDebut) f.date_debut = dateDebut;
    if (dateFin) f.date_fin = dateFin;
    setFilters(f);
  }, [dateDebut, dateFin]);

  const ventesQuery = useQuery({
    queryKey: ["rapport-ventes", filters],
    queryFn: async () => (await rapportsService.ventes(filters)).data,
    staleTime: 0,
    enabled: tab === "ventes",
  });

  const achatsQuery = useQuery({
    queryKey: ["rapport-achats", filters],
    queryFn: async () => (await rapportsService.achats(filters)).data,
    staleTime: 0,
    enabled: tab === "achats",
  });

  const mouvsQuery = useQuery({
    queryKey: ["rapport-mouvements", filters],
    queryFn: async () => (await rapportsService.mouvements(filters)).data,
    staleTime: 0,
    enabled: tab === "mouvements",
  });

  const activeQuery = tab === "ventes" ? ventesQuery : tab === "achats" ? achatsQuery : mouvsQuery;
  const lignes = activeQuery.data?.lignes ?? [];
  const totaux = activeQuery.data?.totaux as Record<string, number> | undefined;

  const formatMontant = (v: number) => `${Number(v).toFixed(2)} ${DEVISE}`;

  const exporterExcel = useCallback(() => {
    const rows = lignes.map((l: any) => {
      const base: Record<string, unknown> = {
        Produit: l.produit?.nom ?? `#${l.produit_id}`,
        Catégorie: l.produit?.modele?.categorie?.nom ?? "-",
      };
      if (tab === "ventes" || tab === "achats") {
        base.Quantité = Number(l.total_quantite);
        base["Montant HT"] = Number(l.total_montant_ht);
        base["Nb commandes"] = l.nombre_commandes;
      } else {
        base["Total entrée"] = Number(l.total_entree);
        base["Total sortie"] = Number(l.total_sortie);
        base.Solde = Number(l.solde);
        base["Stock actuel"] = Number(l.stock_actuel);
        base["Valeur stock"] = Number(l.valeur_stock);
      }
      return base;
    });
    if (totaux) {
      const t: Record<string, unknown> = { Produit: "TOTAUX", Catégorie: "" };
      if (tab === "ventes" || tab === "achats") {
        t.Quantité = Number(totaux.total_quantite);
        t["Montant HT"] = Number(totaux.total_montant_ht);
        t["Nb commandes"] = totaux.nombre_commandes;
      } else {
        t["Total entrée"] = Number(totaux.total_entree);
        t["Total sortie"] = Number(totaux.total_sortie);
        t.Solde = Number(totaux.solde);
        t["Stock actuel"] = 0;
        t["Valeur stock"] = Number(totaux.valeur_stock);
      }
      rows.push(t);
    }
    const ws = XLSX.utils.json_to_sheet(rows);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, tab);
    const p = filters.date_debut && filters.date_fin ? `${filters.date_debut}_${filters.date_fin}` : "global";
    XLSX.writeFile(wb, `rapport_${tab}_${p}.xlsx`);
  }, [lignes, totaux, tab, filters]);

  const exporterPDF = useCallback(async () => {
    const { pdf, Document, Page, View, Text, StyleSheet } = await import("@react-pdf/renderer");

    const COLORS = { primary: "#2563eb", accent: "#1e40af", border: "#e5e7eb", headerBg: "#eff6ff", altRow: "#f9fafb", text: "#111827", muted: "#6b7280", white: "#ffffff", emerald: "#059669", red: "#dc2626", amber: "#d97706" };

    const styles = StyleSheet.create({
      page: { padding: 35, fontSize: 8.5, fontFamily: "Helvetica", color: COLORS.text },
      // Header band
      headerBand: { backgroundColor: COLORS.primary, margin: -35, marginBottom: 20, padding: 20, paddingHorizontal: 35 },
      headerTitle: { color: COLORS.white, fontSize: 18, fontWeight: "bold" as const },
      headerSub: { color: "#bfdbfe", fontSize: 9, marginTop: 2 },
      // Info bar
      infoRow: { flexDirection: "row" as const, justifyContent: "space-between" as const, marginBottom: 15, paddingBottom: 10, borderBottomWidth: 1, borderBottomColor: COLORS.border },
      infoBox: { flexDirection: "column" as const, gap: 2 },
      infoLabel: { color: COLORS.muted, fontSize: 7 },
      infoValue: { fontSize: 9, fontWeight: "bold" as const },
      // Table
      table: { marginBottom: 15 },
      thRow: { flexDirection: "row" as const, backgroundColor: COLORS.headerBg, borderBottomWidth: 2, borderBottomColor: COLORS.primary },
      th: { paddingVertical: 7, paddingHorizontal: 8, color: COLORS.accent, fontSize: 7.5, fontWeight: "bold" as const },
      tr: { flexDirection: "row" as const, borderBottomWidth: 1, borderBottomColor: COLORS.border, paddingVertical: 5, paddingHorizontal: 8 },
      td: { fontSize: 8.5 },
      // Totals
      totalsRow: { flexDirection: "row" as const, backgroundColor: COLORS.primary, paddingVertical: 8, paddingHorizontal: 8 },
      totalsCell: { color: COLORS.white, fontSize: 9, fontWeight: "bold" as const },
      // Footer
      footer: { flexDirection: "row" as const, justifyContent: "space-between" as const, borderTopWidth: 1, borderTopColor: COLORS.border, paddingTop: 8, fontSize: 7, color: COLORS.muted },
    });

    const titles: Record<Tab, string> = { ventes: "Rapport des Ventes", achats: "Rapport des Achats", mouvements: "Rapport des Mouvements Stock" };
    const period = filters.date_debut && filters.date_fin ? `du ${filters.date_debut} au ${filters.date_fin}` : "Toute période";
    const today = new Date().toLocaleDateString("fr-FR", { day: "numeric", month: "long", year: "numeric" });
    const colWidths = tab === "mouvements" ? ["30%", "14%", "14%", "14%", "14%", "14%"] : ["35%", "20%", "25%", "20%"];
    const colHeaders = tab === "mouvements"
      ? ["Produit", "Entrées", "Sorties", "Solde", "Stock", "Valeur"]
      : ["Produit", "Quantité", "Montant HT", "Nb cmd"];

    const MyDoc = () => (
      <Document>
        <Page size="A4" orientation="landscape" style={styles.page}>
          <View style={styles.headerBand}>
            <Text style={styles.headerTitle}>{titles[tab]}</Text>
            <Text style={styles.headerSub}>Période : {period} • Généré le {today}</Text>
          </View>

          <View style={styles.infoRow}>
            {tab !== "mouvements" ? (
              <>
                <View style={styles.infoBox}><Text style={styles.infoLabel}>Total Produits</Text><Text style={styles.infoValue}>{lignes.length}</Text></View>
                <View style={styles.infoBox}><Text style={styles.infoLabel}>Quantité Totale</Text><Text style={styles.infoValue}>{Number(totaux?.total_quantite ?? 0)}</Text></View>
                <View style={styles.infoBox}><Text style={styles.infoLabel}>Montant HT Total</Text><Text style={styles.infoValue}>{formatMontant(totaux?.total_montant_ht ?? 0)}</Text></View>
                <View style={styles.infoBox}><Text style={styles.infoLabel}>Nb Commandes</Text><Text style={styles.infoValue}>{totaux?.nombre_commandes ?? 0}</Text></View>
              </>
            ) : (
              <>
                <View style={styles.infoBox}><Text style={styles.infoLabel}>Total Produits</Text><Text style={styles.infoValue}>{lignes.length}</Text></View>
                <View style={styles.infoBox}><Text style={styles.infoLabel}>Total Entrées</Text><Text style={styles.infoValue}>{Number(totaux?.total_entree ?? 0)}</Text></View>
                <View style={styles.infoBox}><Text style={styles.infoLabel}>Total Sorties</Text><Text style={styles.infoValue}>{Number(totaux?.total_sortie ?? 0)}</Text></View>
                <View style={styles.infoBox}><Text style={styles.infoLabel}>Valeur Stock</Text><Text style={styles.infoValue}>{formatMontant(totaux?.valeur_stock ?? 0)}</Text></View>
              </>
            )}
          </View>

          <View style={styles.table}>
            <View style={styles.thRow}>
              {colHeaders.map((c, i) => <Text key={c} style={[styles.th, { width: colWidths[i] }]}>{c}</Text>)}
            </View>
            {lignes.map((l: any, idx: number) => (
              <View key={l.produit_id} style={[styles.tr, idx % 2 === 1 ? { backgroundColor: COLORS.altRow } : {}]}>
                <Text style={[styles.td, { width: colWidths[0], fontWeight: "bold" as const }]}>{l.produit?.nom ?? `#${l.produit_id}`}</Text>
                {tab === "mouvements" ? (
                  <>
                    <Text style={[styles.td, { width: colWidths[1], color: COLORS.emerald }]}>{Number(l.total_entree)}</Text>
                    <Text style={[styles.td, { width: colWidths[2], color: COLORS.red }]}>{Number(l.total_sortie)}</Text>
                    <Text style={[styles.td, { width: colWidths[3], color: Number(l.solde) >= 0 ? COLORS.emerald : COLORS.red }]}>{Number(l.solde)}</Text>
                    <Text style={[styles.td, { width: colWidths[4] }]}>{Number(l.stock_actuel)}</Text>
                    <Text style={[styles.td, { width: colWidths[5] }]}>{Number(l.valeur_stock).toFixed(2)} {DEVISE}</Text>
                  </>
                ) : (
                  <>
                    <Text style={[styles.td, { width: colWidths[1] }]}>{Number(l.total_quantite)}</Text>
                    <Text style={[styles.td, { width: colWidths[2], color: tab === "ventes" ? COLORS.primary : COLORS.amber }]}>{Number(l.total_montant_ht).toFixed(2)} {DEVISE}</Text>
                    <Text style={[styles.td, { width: colWidths[3], color: COLORS.muted }]}>{l.nombre_commandes}</Text>
                  </>
                )}
              </View>
            ))}
            {totaux && (
              <View style={styles.totalsRow}>
                <Text style={[styles.totalsCell, { width: colWidths[0] }]}>TOTAUX</Text>
                {tab === "mouvements" ? (
                  <>
                    <Text style={[styles.totalsCell, { width: colWidths[1] }]}>{Number(totaux.total_entree)}</Text>
                    <Text style={[styles.totalsCell, { width: colWidths[2] }]}>{Number(totaux.total_sortie)}</Text>
                    <Text style={[styles.totalsCell, { width: colWidths[3] }]}>{Number(totaux.solde)}</Text>
                    <Text style={[styles.totalsCell, { width: colWidths[4] }]}>-</Text>
                    <Text style={[styles.totalsCell, { width: colWidths[5] }]}>{Number(totaux.valeur_stock).toFixed(2)} {DEVISE}</Text>
                  </>
                ) : (
                  <>
                    <Text style={[styles.totalsCell, { width: colWidths[1] }]}>{Number(totaux.total_quantite)}</Text>
                    <Text style={[styles.totalsCell, { width: colWidths[2] }]}>{Number(totaux.total_montant_ht).toFixed(2)} {DEVISE}</Text>
                    <Text style={[styles.totalsCell, { width: colWidths[3] }]}>{totaux.nombre_commandes}</Text>
                  </>
                )}
              </View>
            )}
          </View>

          <View style={styles.footer}><Text>GS Stock ERP • Rapport généré automatiquement le {today}</Text></View>
        </Page>
      </Document>
    );

    const blob = await pdf(<MyDoc />).toBlob();
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    const p = filters.date_debut && filters.date_fin ? `${filters.date_debut}_${filters.date_fin}` : "global";
    a.download = `rapport_${tab}_${p}.pdf`;
    a.click();
    URL.revokeObjectURL(url);
  }, [lignes, totaux, tab, filters]);

  const tabs: { key: Tab; label: string; icon: React.ReactNode }[] = [
    { key: "ventes", label: "Ventes", icon: <ShoppingCart className="h-4 w-4" /> },
    { key: "achats", label: "Achats", icon: <Truck className="h-4 w-4" /> },
    { key: "mouvements", label: "Mouvements stock", icon: <PackageOpen className="h-4 w-4" /> },
  ];

  const ventesColumns = [
    { key: "produit", label: "Produit", render: (item: RapportVentesLigne) => <span className="font-medium truncate max-w-[200px] block">{item.produit?.nom ?? `#${item.produit_id}`}</span> },
    { key: "categorie", label: "Catégorie", render: (item: RapportVentesLigne) => <span className="text-xs text-gray-500">{item.produit?.modele?.categorie?.nom ?? "-"}</span> },
    { key: "total_quantite", label: "Quantité", render: (item: RapportVentesLigne) => <span className="font-medium">{Number(item.total_quantite)}</span> },
    { key: "total_montant_ht", label: "Montant HT", render: (item: RapportVentesLigne) => <span className="font-medium text-blue-600">{formatMontant(item.total_montant_ht)}</span> },
    { key: "nombre_commandes", label: "Nb cmd", render: (item: RapportVentesLigne) => <span className="text-xs text-gray-500">{item.nombre_commandes}</span>, hidden: "md" as const },
  ];

  const achatsColumns = [
    { key: "produit", label: "Produit", render: (item: RapportAchatsLigne) => <span className="font-medium truncate max-w-[200px] block">{item.produit?.nom ?? `#${item.produit_id}`}</span> },
    { key: "categorie", label: "Catégorie", render: (item: RapportAchatsLigne) => <span className="text-xs text-gray-500">{item.produit?.modele?.categorie?.nom ?? "-"}</span> },
    { key: "total_quantite", label: "Quantité", render: (item: RapportAchatsLigne) => <span className="font-medium">{Number(item.total_quantite)}</span> },
    { key: "total_montant_ht", label: "Montant HT", render: (item: RapportAchatsLigne) => <span className="font-medium text-amber-600">{formatMontant(item.total_montant_ht)}</span> },
    { key: "nombre_commandes", label: "Nb cmd", render: (item: RapportAchatsLigne) => <span className="text-xs text-gray-500">{item.nombre_commandes}</span>, hidden: "md" as const },
  ];

  const mouvsColumns = [
    { key: "produit", label: "Produit", render: (item: RapportMouvementLigne) => <span className="font-medium truncate max-w-[200px] block">{item.produit?.nom ?? `#${item.produit_id}`}</span> },
    { key: "categorie", label: "Catégorie", render: (item: RapportMouvementLigne) => <span className="text-xs text-gray-500">{item.produit?.modele?.categorie?.nom ?? "-"}</span> },
    { key: "total_entree", label: "Entrées", render: (item: RapportMouvementLigne) => <span className="text-emerald-600 font-medium">{Number(item.total_entree)}</span> },
    { key: "total_sortie", label: "Sorties", render: (item: RapportMouvementLigne) => <span className="text-red-600 font-medium">{Number(item.total_sortie)}</span> },
    { key: "solde", label: "Solde", render: (item: RapportMouvementLigne) => { const s = Number(item.solde); return <span className={s >= 0 ? "text-emerald-600 font-medium" : "text-red-600 font-medium"}>{s}</span>; } },
    { key: "stock_actuel", label: "Stock", render: (item: RapportMouvementLigne) => <span className="font-medium">{Number(item.stock_actuel)}</span> },
    { key: "valeur_stock", label: "Valeur", render: (item: RapportMouvementLigne) => <span className="font-medium">{formatMontant(item.valeur_stock)}</span>, hidden: "md" as const },
  ];

  const currentColumns = (tab === "ventes" ? ventesColumns : tab === "achats" ? achatsColumns : mouvsColumns) as any[];
  const isLoading = activeQuery.isLoading;

  return (
    <div className="p-4 md:p-6 space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <BarChart3 className="h-6 w-6 text-blue-500" />
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Rapports</h1>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={exporterExcel} disabled={lignes.length === 0}>
            <FileSpreadsheet className="h-4 w-4 mr-2" /> Excel
          </Button>
          <Button variant="outline" size="sm" onClick={exporterPDF} disabled={lignes.length === 0}>
            <FileText className="h-4 w-4 mr-2" /> PDF
          </Button>
        </div>
      </div>

      <div className="flex gap-1 border-b pb-1">
        {tabs.map(t => (
          <button
            key={t.key}
            onClick={() => setTab(t.key)}
            className={`flex items-center gap-1.5 px-4 py-2 text-sm font-medium rounded-t transition-colors ${
              tab === t.key
                ? "bg-white dark:bg-gray-800 text-blue-600 border-b-2 border-blue-600"
                : "text-gray-500 hover:text-gray-700 dark:hover:text-gray-300"
            }`}
          >
            {t.icon} {t.label}
          </button>
        ))}
      </div>

      <Card>
        <CardHeader className="pb-2">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <CardTitle className="text-sm font-medium text-gray-500 dark:text-gray-400">
              {activeQuery.data ? `${lignes.length} produit(s) - ${totaux?.nombre_commandes ?? totaux?.nombre_operations ?? 0} opération(s)` : "Filtres"}
            </CardTitle>
            <div className="flex flex-wrap items-center gap-2">
              <label className="text-xs text-gray-500">Du</label>
              <Input type="date" value={dateDebut} onChange={e => setDateDebut(e.target.value)} className="w-36 h-8 text-sm" />
              <label className="text-xs text-gray-500">Au</label>
              <Input type="date" value={dateFin} onChange={e => setDateFin(e.target.value)} className="w-36 h-8 text-sm" />
              <Button size="sm" onClick={appliquerFiltres} className="bg-blue-600 hover:bg-blue-700 text-white h-8">
                <Search className="h-4 w-4 mr-1" /> Générer
              </Button>
              <Button variant="outline" size="sm" onClick={() => activeQuery.refetch()} className="h-8">
                <RefreshCw className="h-4 w-4 mr-1" /> Actualiser
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <SkeletonTable />
          ) : lignes.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-gray-400">
              <PackageOpen className="h-12 w-12 mb-3" />
              <p className="text-sm">Aucune donnée trouvée</p>
              <p className="text-xs mt-1">Sélectionnez une période et cliquez sur Générer</p>
            </div>
          ) : (
            <>
              <DataTable
                data={lignes as any[]}
                columns={currentColumns}
                loading={false}
                emptyMessage="Aucun résultat"
                rowKey="produit_id"
              />
              {totaux && (
                <div className="mt-4 p-3 bg-gray-50 dark:bg-gray-800/50 rounded-lg border">
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4 text-sm">
                    {tab === "mouvements" ? (
                      <>
                        <div><span className="text-gray-500">Total entrées</span><p className="font-bold text-emerald-600">{Number(totaux.total_entree)}</p></div>
                        <div><span className="text-gray-500">Total sorties</span><p className="font-bold text-red-600">{Number(totaux.total_sortie)}</p></div>
                        <div><span className="text-gray-500">Solde net</span><p className="font-bold text-blue-600">{Number(totaux.solde)}</p></div>
                        <div><span className="text-gray-500">Valeur stock</span><p className="font-bold">{formatMontant(totaux.valeur_stock)}</p></div>
                      </>
                    ) : (
                      <>
                        <div><span className="text-gray-500">Quantité totale</span><p className="font-bold text-blue-600">{Number(totaux.total_quantite)}</p></div>
                        <div><span className="text-gray-500">Montant HT total</span><p className="font-bold">{formatMontant(totaux.total_montant_ht)}</p></div>
                        <div><span className="text-gray-500">Nb de commandes</span><p className="font-bold">{totaux.nombre_commandes}</p></div>
                      </>
                    )}
                  </div>
                </div>
              )}
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
