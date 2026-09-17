import { DEVISE } from "@/lib/utils/currency";
import { Document, Page, Text, View, StyleSheet, Image } from "@react-pdf/renderer";
import { resolveLogoUrl } from "@/lib/utils/assets";

export interface BonCommandeLigne {
  nom_produit: string;
  code_produit?: string | null;
  quantite: number | string;
  prix_unitaire_ht: number | string;
  taux_tva?: number | string | null;
  montant_total_ht: number | string;
}

export interface BonCommandePDFProps {
  reference: string;
  date_commande?: string | null;
  date_livraison_prevue?: string | null;
  statut_label?: string | null;
  fournisseur_nom: string;
  fournisseur_adresse?: string | null;
  fournisseur_email?: string | null;
  fournisseur_telephone?: string | null;
  lignes: BonCommandeLigne[];
  montant_ht: number | string;
  montant_ttc?: number | string | null;
  notes?: string | null;
  societe?: { id?: number | null; nom?: string | null; logo?: string | null; adresse?: string | null; telephone?: string | null } | null;
}

const COLORS = {
  primary: "#1e3a8a",
  light: "#eff6ff",
  border: "#cbd5e1",
  text: "#0f172a",
  muted: "#64748b",
  white: "#ffffff",
};

const styles = StyleSheet.create({
  page: { padding: 36, fontSize: 9, fontFamily: "Helvetica", color: COLORS.text },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    borderBottomWidth: 2,
    borderBottomColor: COLORS.primary,
    paddingBottom: 10,
    marginBottom: 16,
  },
  logo: { width: 100, height: 42, objectFit: "contain", marginBottom: 4 },
  company: { fontSize: 13, fontWeight: "bold", color: COLORS.primary },
  companyDetails: { fontSize: 8, color: COLORS.muted },
  title: { fontSize: 18, fontWeight: "bold", textAlign: "right" },
  subtitle: { fontSize: 10, textAlign: "right", color: COLORS.muted, marginTop: 2 },
  section: { marginBottom: 14 },
  box: {
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 4,
    padding: 8,
    marginBottom: 14,
  },
  boxTitle: {
    fontSize: 8,
    fontWeight: "bold",
    textTransform: "uppercase",
    color: COLORS.primary,
    marginBottom: 4,
  },
  rowBetween: { flexDirection: "row", justifyContent: "space-between" },
  table: { borderWidth: 1, borderColor: COLORS.border, borderRadius: 4, overflow: "hidden" },
  thRow: { flexDirection: "row", backgroundColor: COLORS.primary, paddingVertical: 6, paddingHorizontal: 6 },
  th: { color: COLORS.white, fontSize: 8, fontWeight: "bold" },
  tr: {
    flexDirection: "row",
    paddingVertical: 5,
    paddingHorizontal: 6,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
  },
  trAlt: { backgroundColor: "#f8fafc" },
  td: { fontSize: 8.5 },
  totals: { marginTop: 14, flexDirection: "row", justifyContent: "flex-end" },
  totalsBox: { width: 240 },
  totalRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingVertical: 4,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  totalFinal: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingVertical: 7,
    paddingHorizontal: 6,
    backgroundColor: COLORS.primary,
    marginTop: 4,
  },
  totalFinalText: { color: COLORS.white, fontSize: 10, fontWeight: "bold" },
  footer: {
    position: "absolute",
    bottom: 20,
    left: 36,
    right: 36,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
    paddingTop: 6,
    flexDirection: "row",
    justifyContent: "space-between",
  },
  footerText: { fontSize: 7, color: COLORS.muted },
});

const money = (v: unknown) => Number(v ?? 0).toFixed(2);

export function BonCommandePDF({
  reference,
  date_commande,
  date_livraison_prevue,
  statut_label,
  fournisseur_nom,
  fournisseur_adresse,
  fournisseur_email,
  fournisseur_telephone,
  lignes,
  montant_ht,
  montant_ttc,
  notes,
  societe,
}: BonCommandePDFProps) {
  const logo = resolveLogoUrl(societe);
  const generatedAt = new Date().toLocaleDateString("fr-FR", {
    day: "2-digit",
    month: "long",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        <View style={styles.header}>
          <View>
            {logo && <Image src={logo} style={styles.logo} />}
            <Text style={styles.company}>{societe?.nom || "GS Stock"}</Text>
            {societe?.adresse && <Text style={styles.companyDetails}>{societe.adresse}</Text>}
            {societe?.telephone && (
              <Text style={styles.companyDetails}>Tél : {societe.telephone}</Text>
            )}
          </View>
          <View>
            <Text style={styles.title}>BON DE COMMANDE</Text>
            <Text style={styles.subtitle}>Réf : {reference}</Text>
            {date_commande && <Text style={styles.subtitle}>Date : {date_commande}</Text>}
            {statut_label && <Text style={styles.subtitle}>Statut : {statut_label}</Text>}
          </View>
        </View>

        <View style={styles.box}>
          <Text style={styles.boxTitle}>Fournisseur</Text>
          <Text style={{ fontSize: 11, fontWeight: "bold" }}>{fournisseur_nom}</Text>
          {fournisseur_adresse && <Text style={styles.companyDetails}>{fournisseur_adresse}</Text>}
          {fournisseur_email && <Text style={styles.companyDetails}>{fournisseur_email}</Text>}
          {fournisseur_telephone && (
            <Text style={styles.companyDetails}>Tél : {fournisseur_telephone}</Text>
          )}
          {date_livraison_prevue && (
            <Text style={styles.companyDetails}>
              Livraison prévue : {date_livraison_prevue}
            </Text>
          )}
        </View>

        <View style={styles.table}>
          <View style={styles.thRow} fixed>
            <Text style={[styles.th, { flex: 2.6 }]}>Article</Text>
            <Text style={[styles.th, { flex: 1.2 }]}>Code</Text>
            <Text style={[styles.th, { flex: 0.8, textAlign: "right" }]}>Qté</Text>
            <Text style={[styles.th, { flex: 1.2, textAlign: "right" }]}>P.U. HT</Text>
            <Text style={[styles.th, { flex: 1.2, textAlign: "right" }]}>Total HT</Text>
          </View>
          {lignes.length === 0 ? (
            <View style={styles.tr}>
              <Text style={[styles.td, { flex: 1, color: COLORS.muted }]}>Aucune ligne</Text>
            </View>
          ) : (
            lignes.map((l, i) => (
              <View key={i} style={[styles.tr, i % 2 === 1 ? styles.trAlt : {}]} wrap={false}>
                <Text style={[styles.td, { flex: 2.6 }]}>{l.nom_produit}</Text>
                <Text style={[styles.td, { flex: 1.2 }]}>{l.code_produit || "-"}</Text>
                <Text style={[styles.td, { flex: 0.8, textAlign: "right" }]}>{Number(l.quantite)}</Text>
                <Text style={[styles.td, { flex: 1.2, textAlign: "right" }]}>
                  {money(l.prix_unitaire_ht)}
                </Text>
                <Text style={[styles.td, { flex: 1.2, textAlign: "right" }]}>
                  {money(l.montant_total_ht)}
                </Text>
              </View>
            ))
          )}
        </View>

        <View style={styles.totals}>
          <View style={styles.totalsBox}>
            <View style={styles.totalRow}>
              <Text style={{ color: COLORS.muted }}>Total HT</Text>
              <Text style={{ fontWeight: "bold" }}>{money(montant_ht)} {DEVISE}</Text>
            </View>
            {montant_ttc != null && (
              <View style={styles.totalFinal}>
                <Text style={styles.totalFinalText}>Total TTC</Text>
                <Text style={styles.totalFinalText}>{money(montant_ttc)} {DEVISE}</Text>
              </View>
            )}
          </View>
        </View>

        {notes && (
          <View style={[styles.box, { marginTop: 14 }]}>
            <Text style={styles.boxTitle}>Notes</Text>
            <Text style={{ fontSize: 8.5, color: COLORS.text }}>{notes}</Text>
          </View>
        )}

        <View style={styles.footer} fixed>
          <Text style={styles.footerText}>
            {societe?.nom ? `${societe.nom} — ` : ""}Document généré le {generatedAt}
          </Text>
          <Text
            style={styles.footerText}
            render={({ pageNumber, totalPages }) => `Page ${pageNumber} / ${totalPages}`}
          />
        </View>
      </Page>
    </Document>
  );
}
