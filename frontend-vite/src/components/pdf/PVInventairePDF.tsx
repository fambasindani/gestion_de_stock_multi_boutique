import { Document, Page, Text, View, StyleSheet, Image } from "@react-pdf/renderer";
import { resolveLogoUrl } from "@/lib/utils/assets";

export interface PVInventaireLigne {
  nom: string;
  code?: string | null;
  emplacement?: string | null;
  theorique: number | string;
  physique: number | string;
  ecart: number | string;
  ajuste: boolean;
}

export interface PVInventairePDFProps {
  reference: string;
  dateInventaire?: string | null;
  emplacement?: string | null;
  statut?: string | null;
  lignes: PVInventaireLigne[];
  totaux: {
    nombre_lignes: number;
    lignes_ajustees: number;
    total_ecart: number;
    excedents: number;
    manquants: number;
  };
  societe?: { nom?: string | null; logo?: string | null; id?: number | null } | null;
  preparePar?: string | null;
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
  page: { padding: 32, fontSize: 8.5, fontFamily: "Helvetica", color: COLORS.text },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    borderBottomWidth: 2,
    borderBottomColor: COLORS.primary,
    paddingBottom: 10,
    marginBottom: 12,
  },
  logo: { width: 90, height: 40, objectFit: "contain", marginBottom: 4 },
  company: { fontSize: 12, fontWeight: "bold", color: COLORS.primary },
  title: { fontSize: 15, fontWeight: "bold", textAlign: "right" },
  subtitle: { fontSize: 9, textAlign: "right", color: COLORS.muted, marginTop: 2 },
  metaRow: { flexDirection: "row", flexWrap: "wrap", gap: 6, marginBottom: 10 },
  metaItem: {
    flexDirection: "row",
    gap: 4,
    backgroundColor: COLORS.light,
    borderWidth: 1,
    borderColor: "#dbeafe",
    borderRadius: 4,
    paddingVertical: 3,
    paddingHorizontal: 6,
  },
  metaLabel: { color: COLORS.muted, fontSize: 7.5 },
  metaValue: { fontSize: 7.5, fontWeight: "bold", color: COLORS.primary },
  statsRow: { flexDirection: "row", gap: 8, marginBottom: 12 },
  statBox: {
    flex: 1,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 4,
    paddingVertical: 6,
    paddingHorizontal: 8,
  },
  statLabel: { fontSize: 7, color: COLORS.muted, textTransform: "uppercase", marginBottom: 2 },
  statValue: { fontSize: 12, fontWeight: "bold", color: COLORS.primary },
  table: { borderWidth: 1, borderColor: COLORS.border, borderRadius: 4, overflow: "hidden" },
  thRow: {
    flexDirection: "row",
    backgroundColor: COLORS.primary,
    paddingVertical: 6,
    paddingHorizontal: 4,
  },
  th: { color: COLORS.white, fontSize: 7.5, fontWeight: "bold" },
  tr: {
    flexDirection: "row",
    paddingVertical: 5,
    paddingHorizontal: 4,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
  },
  trAlt: { backgroundColor: "#f8fafc" },
  td: { fontSize: 8 },
  signatureSection: {
    marginTop: 40,
    flexDirection: "row",
    justifyContent: "space-between",
    gap: 24,
  },
  signatureBox: { flex: 1 },
  signatureRole: {
    fontSize: 8,
    fontWeight: "bold",
    textTransform: "uppercase",
    color: COLORS.muted,
    marginBottom: 4,
  },
  signatureName: { fontSize: 8, marginBottom: 34 },
  signatureLine: { borderTopWidth: 1, borderTopColor: "#94a3b8", paddingTop: 3 },
  signatureHint: { fontSize: 7, color: COLORS.muted },
  footer: {
    position: "absolute",
    bottom: 18,
    left: 32,
    right: 32,
    flexDirection: "row",
    justifyContent: "space-between",
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
    paddingTop: 6,
  },
  footerText: { fontSize: 7, color: COLORS.muted },
});

const fmt = (v: unknown) => Number(v ?? 0).toFixed(2);

export function PVInventairePDF({
  reference,
  dateInventaire,
  emplacement,
  statut,
  lignes,
  totaux,
  societe,
  preparePar,
}: PVInventairePDFProps) {
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
      <Page size="A4" orientation="landscape" style={styles.page}>
        <View style={styles.header}>
          <View>
            {logo && <Image src={logo} style={styles.logo} />}
            <Text style={styles.company}>{societe?.nom || "GS Stock"}</Text>
          </View>
          <View>
            <Text style={styles.title}>PROCÈS-VERBAL D'INVENTAIRE</Text>
            <Text style={styles.subtitle}>Référence : {reference}</Text>
          </View>
        </View>

        <View style={styles.metaRow}>
          <View style={styles.metaItem}>
            <Text style={styles.metaLabel}>Date :</Text>
            <Text style={styles.metaValue}>{dateInventaire || "-"}</Text>
          </View>
          <View style={styles.metaItem}>
            <Text style={styles.metaLabel}>Emplacement :</Text>
            <Text style={styles.metaValue}>{emplacement || "Tous"}</Text>
          </View>
          <View style={styles.metaItem}>
            <Text style={styles.metaLabel}>Statut :</Text>
            <Text style={styles.metaValue}>{statut || "-"}</Text>
          </View>
          <View style={styles.metaItem}>
            <Text style={styles.metaLabel}>Préparé par :</Text>
            <Text style={styles.metaValue}>{preparePar || "-"}</Text>
          </View>
        </View>

        <View style={styles.statsRow}>
          <View style={styles.statBox}>
            <Text style={styles.statLabel}>Lignes</Text>
            <Text style={styles.statValue}>{totaux.nombre_lignes}</Text>
          </View>
          <View style={styles.statBox}>
            <Text style={styles.statLabel}>Lignes ajustées</Text>
            <Text style={styles.statValue}>{totaux.lignes_ajustees}</Text>
          </View>
          <View style={styles.statBox}>
            <Text style={styles.statLabel}>Excédents</Text>
            <Text style={styles.statValue}>{fmt(totaux.excedents)}</Text>
          </View>
          <View style={styles.statBox}>
            <Text style={styles.statLabel}>Manquants</Text>
            <Text style={styles.statValue}>{fmt(totaux.manquants)}</Text>
          </View>
          <View style={styles.statBox}>
            <Text style={styles.statLabel}>Écart total</Text>
            <Text style={styles.statValue}>{fmt(totaux.total_ecart)}</Text>
          </View>
        </View>

        <View style={styles.table}>
          <View style={styles.thRow} fixed>
            <Text style={[styles.th, { flex: 2.6 }]}>Produit</Text>
            <Text style={[styles.th, { flex: 1.2 }]}>Code</Text>
            <Text style={[styles.th, { flex: 1.4 }]}>Emplacement</Text>
            <Text style={[styles.th, { flex: 1, textAlign: "right" }]}>Théorique</Text>
            <Text style={[styles.th, { flex: 1, textAlign: "right" }]}>Physique</Text>
            <Text style={[styles.th, { flex: 1, textAlign: "right" }]}>Écart</Text>
            <Text style={[styles.th, { flex: 0.8, textAlign: "center" }]}>Ajusté</Text>
          </View>
          {lignes.length === 0 ? (
            <View style={styles.tr}>
              <Text style={[styles.td, { flex: 1, color: COLORS.muted }]}>Aucune ligne</Text>
            </View>
          ) : (
            lignes.map((l, i) => (
              <View key={i} style={[styles.tr, i % 2 === 1 ? styles.trAlt : {}]} wrap={false}>
                <Text style={[styles.td, { flex: 2.6 }]}>{l.nom}</Text>
                <Text style={[styles.td, { flex: 1.2 }]}>{l.code || "-"}</Text>
                <Text style={[styles.td, { flex: 1.4 }]}>{l.emplacement || "-"}</Text>
                <Text style={[styles.td, { flex: 1, textAlign: "right" }]}>{fmt(l.theorique)}</Text>
                <Text style={[styles.td, { flex: 1, textAlign: "right" }]}>{fmt(l.physique)}</Text>
                <Text style={[styles.td, { flex: 1, textAlign: "right" }]}>
                  {Number(l.ecart) > 0 ? `+${fmt(l.ecart)}` : fmt(l.ecart)}
                </Text>
                <Text style={[styles.td, { flex: 0.8, textAlign: "center" }]}>
                  {l.ajuste ? "Oui" : "Non"}
                </Text>
              </View>
            ))
          )}
        </View>

        <View style={styles.signatureSection}>
          <View style={styles.signatureBox}>
            <Text style={styles.signatureRole}>Préparé par</Text>
            <Text style={styles.signatureName}>{preparePar || " "}</Text>
            <View style={styles.signatureLine}>
              <Text style={styles.signatureHint}>Nom, signature et date</Text>
            </View>
          </View>
          <View style={styles.signatureBox}>
            <Text style={styles.signatureRole}>Contrôlé par</Text>
            <Text style={styles.signatureName}> </Text>
            <View style={styles.signatureLine}>
              <Text style={styles.signatureHint}>Nom, signature et date</Text>
            </View>
          </View>
          <View style={styles.signatureBox}>
            <Text style={styles.signatureRole}>Approuvé par (Responsable)</Text>
            <Text style={styles.signatureName}> </Text>
            <View style={styles.signatureLine}>
              <Text style={styles.signatureHint}>Nom, signature et date</Text>
            </View>
          </View>
        </View>

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
