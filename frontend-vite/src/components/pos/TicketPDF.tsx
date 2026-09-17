import {
  Document,
  Page,
  Text,
  View,
  Image,
  StyleSheet,
} from "@react-pdf/renderer";
import type { PosVenteResult } from "@/lib/api/services/pos.service";
import { resolveLogoUrl } from "@/lib/utils/assets";

const money = (v: unknown) => Number(v ?? 0).toFixed(2);

const styles = StyleSheet.create({
  page: {
    paddingVertical: 10,
    paddingHorizontal: 8,
    fontFamily: "Courier",
    fontSize: 9,
    color: "#000",
  },
  center: { textAlign: "center" },
  logo: { width: 90, height: 40, objectFit: "contain", alignSelf: "center", marginBottom: 4 },
  company: { fontFamily: "Courier-Bold", fontSize: 12, textAlign: "center" },
  small: { fontSize: 8, textAlign: "center", color: "#333" },
  sep: { borderBottomWidth: 1, borderBottomColor: "#000", marginVertical: 4 },
  dashed: { borderBottomWidth: 1, borderBottomColor: "#999", borderStyle: "dashed", marginVertical: 3 },
  row: { flexDirection: "row", justifyContent: "space-between" },
  bold: { fontFamily: "Courier-Bold" },
  th: { fontFamily: "Courier-Bold", borderBottomWidth: 1, borderBottomColor: "#000", paddingBottom: 2, marginBottom: 2 },
  colQte: { width: 26 },
  colArt: { flex: 1 },
  colPu: { width: 48, textAlign: "right" },
  colTot: { width: 54, textAlign: "right" },
  line: { flexDirection: "row", paddingVertical: 1 },
  totalRow: { flexDirection: "row", justifyContent: "space-between", paddingVertical: 1 },
  totalTtc: { fontFamily: "Courier-Bold", fontSize: 11 },
  footer: { marginTop: 6, fontSize: 8, textAlign: "center" },
});

interface TicketPDFProps {
  vente: PosVenteResult;
  entreprise?: Record<string, string>;
}

export function TicketPDF({ vente, entreprise }: TicketPDFProps) {
  const logo = resolveLogoUrl(vente.societe);
  const nom = entreprise?.entreprise_nom || vente.societe?.nom || "GS Stock";
  const adresse = entreprise?.entreprise_adresse || "";
  const tel = entreprise?.entreprise_telephone || "";
  const message = entreprise?.ticket_message || "Merci de votre visite !";

  const height = 250 + vente.lignes.length * 12 + (adresse ? 10 : 0) + (tel ? 10 : 0);

  return (
    <Document>
      <Page size={[226.77, height]} style={styles.page} wrap={false}>
        {logo ? <Image src={logo} style={styles.logo} /> : null}
        <Text style={styles.company}>{nom}</Text>
        {adresse ? <Text style={styles.small}>{adresse}</Text> : null}
        {tel ? <Text style={styles.small}>Tél : {tel}</Text> : null}

        <View style={styles.sep} />

        <View style={styles.row}>
          <Text>Ticket : {vente.facture.numero_facture || vente.commande.reference}</Text>
        </View>
        <View style={styles.row}>
          <Text>Date : {vente.date}</Text>
        </View>
        <View style={styles.row}>
          <Text>Vendeur : {vente.vendeur}</Text>
        </View>
        <View style={styles.row}>
          <Text>Client : {vente.client_nom || "Comptoir"}</Text>
        </View>

        <View style={styles.dashed} />

        <View style={[styles.line, styles.th]}>
          <Text style={styles.colQte}>Qté</Text>
          <Text style={styles.colArt}>Article</Text>
          <Text style={styles.colPu}>P.U.</Text>
          <Text style={styles.colTot}>Total</Text>
        </View>

        {vente.lignes.map((l, i) => (
          <View key={i} style={styles.line}>
            <Text style={styles.colQte}>{l.quantite}</Text>
            <Text style={styles.colArt}>{l.nom_produit.slice(0, 20)}</Text>
            <Text style={styles.colPu}>{money(l.prix_unitaire_ht)}</Text>
            <Text style={styles.colTot}>{money(l.montant_total_ht)}</Text>
          </View>
        ))}

        <View style={styles.dashed} />

        <View style={styles.totalRow}>
          <Text>Total HT</Text>
          <Text>{money(vente.totaux.total_ht)}</Text>
        </View>
        <View style={styles.totalRow}>
          <Text>TVA</Text>
          <Text>{money(vente.totaux.total_tva)}</Text>
        </View>
        <View style={styles.totalRow}>
          <Text style={styles.totalTtc}>TOTAL TTC</Text>
          <Text style={styles.totalTtc}>{money(vente.totaux.total_ttc)}</Text>
        </View>
        <View style={styles.totalRow}>
          <Text>Payé</Text>
          <Text>{money(vente.totaux.montant_paye)}</Text>
        </View>
        <View style={styles.totalRow}>
          <Text>Monnaie</Text>
          <Text>{money(vente.totaux.monnaie)}</Text>
        </View>

        <View style={styles.sep} />

        <Text style={styles.footer}>{message}</Text>
        <Text style={styles.footer}>{vente.commande.reference}</Text>
      </Page>
    </Document>
  );
}
