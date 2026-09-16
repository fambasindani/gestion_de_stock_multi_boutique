import {
  Document,
  Page,
  Text,
  View,
  StyleSheet,
} from "@react-pdf/renderer";

export interface RapportPdfColumn<T> {
  header: string;
  flex?: number;
  align?: "left" | "right" | "center";
  value: (row: T) => string | number;
}

export interface RapportPdfStat {
  label: string;
  value: string | number;
}

export interface RapportTablePDFProps<T> {
  title: string;
  subtitle?: string;
  company?: string;
  columns: RapportPdfColumn<T>[];
  rows: T[];
  stats?: RapportPdfStat[];
  meta?: RapportPdfStat[];
  orientation?: "portrait" | "landscape";
  footerNote?: string;
}

const COLORS = {
  primary: "#2563eb",
  dark: "#1e3a8a",
  light: "#eff6ff",
  border: "#e2e8f0",
  alt: "#f8fafc",
  text: "#0f172a",
  muted: "#64748b",
  white: "#ffffff",
};

const styles = StyleSheet.create({
  page: {
    paddingTop: 28,
    paddingBottom: 40,
    paddingHorizontal: 28,
    fontSize: 8.5,
    fontFamily: "Helvetica",
    color: COLORS.text,
  },
  headerBand: {
    backgroundColor: COLORS.primary,
    marginHorizontal: -28,
    marginTop: -28,
    paddingHorizontal: 28,
    paddingVertical: 16,
    marginBottom: 14,
  },
  company: {
    color: "#bfdbfe",
    fontSize: 8,
    textTransform: "uppercase",
    letterSpacing: 1,
    marginBottom: 2,
  },
  title: { color: COLORS.white, fontSize: 18, fontWeight: "bold" },
  subtitle: { color: "#dbeafe", fontSize: 9, marginTop: 2 },
  metaRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 6,
    marginBottom: 10,
  },
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
  metaValue: { fontSize: 7.5, fontWeight: "bold", color: COLORS.dark },
  table: {
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 4,
    overflow: "hidden",
  },
  thRow: {
    flexDirection: "row",
    backgroundColor: COLORS.dark,
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
  trAlt: { backgroundColor: COLORS.alt },
  td: { fontSize: 8 },
  statsRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
    marginTop: 12,
  },
  statBox: {
    minWidth: 110,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 4,
    paddingVertical: 6,
    paddingHorizontal: 8,
  },
  statLabel: {
    fontSize: 7,
    color: COLORS.muted,
    textTransform: "uppercase",
    letterSpacing: 0.5,
    marginBottom: 2,
  },
  statValue: { fontSize: 12, fontWeight: "bold", color: COLORS.dark },
  footer: {
    position: "absolute",
    bottom: 18,
    left: 28,
    right: 28,
    flexDirection: "row",
    justifyContent: "space-between",
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
    paddingTop: 6,
  },
  footerText: { fontSize: 7, color: COLORS.muted },
});

function alignStyle(align?: "left" | "right" | "center") {
  return { textAlign: align ?? ("left" as const) };
}

export function RapportTablePDF<T>({
  title,
  subtitle,
  company = "GS Stock",
  columns,
  rows,
  stats,
  meta,
  orientation = "portrait",
  footerNote,
}: RapportTablePDFProps<T>) {
  const generatedAt = new Date().toLocaleDateString("fr-FR", {
    day: "2-digit",
    month: "long",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });

  return (
    <Document>
      <Page size="A4" orientation={orientation} style={styles.page}>
        <View style={styles.headerBand}>
          <Text style={styles.company}>{company}</Text>
          <Text style={styles.title}>{title}</Text>
          {subtitle && <Text style={styles.subtitle}>{subtitle}</Text>}
        </View>

        {meta && meta.length > 0 && (
          <View style={styles.metaRow}>
            {meta.map((m, i) => (
              <View key={i} style={styles.metaItem}>
                <Text style={styles.metaLabel}>{m.label} :</Text>
                <Text style={styles.metaValue}>{m.value}</Text>
              </View>
            ))}
          </View>
        )}

        <View style={styles.table}>
          <View style={styles.thRow} fixed>
            {columns.map((c, i) => (
              <Text
                key={i}
                style={[
                  styles.th,
                  { flex: c.flex ?? 1 },
                  alignStyle(c.align),
                ]}
              >
                {c.header}
              </Text>
            ))}
          </View>

          {rows.length === 0 ? (
            <View style={styles.tr}>
              <Text style={[styles.td, { flex: 1, color: COLORS.muted }]}>
                Aucune donnée
              </Text>
            </View>
          ) : (
            rows.map((row, ri) => (
              <View
                key={ri}
                style={[styles.tr, ri % 2 === 1 ? styles.trAlt : {}]}
                wrap={false}
              >
                {columns.map((c, ci) => (
                  <Text
                    key={ci}
                    style={[
                      styles.td,
                      { flex: c.flex ?? 1 },
                      alignStyle(c.align),
                    ]}
                  >
                    {c.value(row)}
                  </Text>
                ))}
              </View>
            ))
          )}
        </View>

        {stats && stats.length > 0 && (
          <View style={styles.statsRow}>
            {stats.map((s, i) => (
              <View key={i} style={styles.statBox}>
                <Text style={styles.statLabel}>{s.label}</Text>
                <Text style={styles.statValue}>{s.value}</Text>
              </View>
            ))}
          </View>
        )}

        <View style={styles.footer} fixed>
          <Text style={styles.footerText}>
            {footerNote ?? `Document généré le ${generatedAt}`}
          </Text>
          <Text
            style={styles.footerText}
            render={({ pageNumber, totalPages }) =>
              `Page ${pageNumber} / ${totalPages}`
            }
          />
        </View>
      </Page>
    </Document>
  );
}
