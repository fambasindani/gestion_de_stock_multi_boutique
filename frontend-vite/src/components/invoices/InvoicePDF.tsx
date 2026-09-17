"use client";
import { DEVISE } from "@/lib/utils/currency";

import React from "react";
import { Document, Page, Text, View, StyleSheet, Font, Image } from "@react-pdf/renderer";
import { formatDateLong } from "../../lib/utils/format";
import { resolveMediaUrl } from "../../lib/utils/assets";

Font.register({
  family: "Helvetica",
  fonts: [
    { src: "https://fonts.gstatic.com/s/helveticaneue/v70/1Ptsg8zYS_SKggPNyCg4QIFqPfE.ttf", fontWeight: "normal" },
    { src: "https://fonts.gstatic.com/s/helveticaneue/v70/1Ptsg8zYS_SKggPNyCg4TYFqPfE.ttf", fontWeight: "bold" },
  ],
});

const styles = StyleSheet.create({
  page: {
    padding: 40,
    fontSize: 10,
    fontFamily: "Helvetica",
    color: "#1a1a1a",
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 40,
    borderBottomWidth: 2,
    borderBottomColor: "#2563eb",
    paddingBottom: 20,
  },
  companyInfo: {
    flex: 1,
  },
  companyLogo: {
    width: 110,
    height: 46,
    objectFit: "contain",
    marginBottom: 6,
  },
  companyName: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#2563eb",
    marginBottom: 4,
  },
  companyDetails: {
    fontSize: 8,
    color: "#666",
    lineHeight: 1.4,
  },
  invoiceTitle: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#1a1a1a",
    textAlign: "right",
  },
  invoiceMeta: {
    fontSize: 8,
    color: "#666",
    textAlign: "right",
    marginTop: 4,
  },
  section: {
    marginBottom: 20,
  },
  row: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  billingSection: {
    marginBottom: 30,
  },
  billingTitle: {
    fontSize: 9,
    fontWeight: "bold",
    color: "#2563eb",
    marginBottom: 6,
    textTransform: "uppercase",
  },
  billingName: {
    fontSize: 11,
    fontWeight: "bold",
    marginBottom: 2,
  },
  billingAddress: {
    fontSize: 8,
    color: "#666",
    lineHeight: 1.4,
  },
  table: {
    marginTop: 10,
  },
  tableHeader: {
    flexDirection: "row",
    backgroundColor: "#2563eb",
    paddingVertical: 8,
    paddingHorizontal: 8,
    borderTopLeftRadius: 4,
    borderTopRightRadius: 4,
  },
  tableHeaderText: {
    color: "white",
    fontSize: 8,
    fontWeight: "bold",
    textTransform: "uppercase",
  },
  tableRow: {
    flexDirection: "row",
    paddingVertical: 8,
    paddingHorizontal: 8,
    borderBottomWidth: 1,
    borderBottomColor: "#e5e7eb",
  },
  tableRowAlt: {
    backgroundColor: "#f9fafb",
  },
  colDescription: { flex: 2.5 },
  colQuantity: { flex: 0.8, textAlign: "right" },
  colPrice: { flex: 1.2, textAlign: "right" },
  colTva: { flex: 0.8, textAlign: "right" },
  colTotal: { flex: 1.2, textAlign: "right" },
  cellText: {
    fontSize: 8,
    color: "#374151",
  },
  totalsSection: {
    marginTop: 20,
    flexDirection: "row",
    justifyContent: "flex-end",
  },
  totalsBox: {
    width: 250,
  },
  totalRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderBottomWidth: 1,
    borderBottomColor: "#e5e7eb",
  },
  totalLabel: {
    fontSize: 9,
    color: "#666",
  },
  totalValue: {
    fontSize: 9,
    fontWeight: "bold",
  },
  totalFinalRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingVertical: 8,
    paddingHorizontal: 8,
    backgroundColor: "#2563eb",
    borderBottomLeftRadius: 4,
    borderBottomRightRadius: 4,
  },
  totalFinalLabel: {
    fontSize: 11,
    fontWeight: "bold",
    color: "white",
  },
  totalFinalValue: {
    fontSize: 11,
    fontWeight: "bold",
    color: "white",
  },
  paymentTerms: {
    marginTop: 40,
    paddingTop: 20,
    borderTopWidth: 1,
    borderTopColor: "#e5e7eb",
  },
  paymentTitle: {
    fontSize: 9,
    fontWeight: "bold",
    color: "#2563eb",
    marginBottom: 4,
    textTransform: "uppercase",
  },
  paymentText: {
    fontSize: 8,
    color: "#666",
    lineHeight: 1.4,
  },
  footer: {
    position: "absolute",
    bottom: 20,
    left: 40,
    right: 40,
    textAlign: "center",
    fontSize: 7,
    color: "#999",
    borderTopWidth: 1,
    borderTopColor: "#e5e7eb",
    paddingTop: 10,
  },
});

interface InvoiceLine {
  nom_produit: string;
  description?: string | null;
  quantite: number;
  prix_unitaire_ht: number;
  taux_tva: number;
  montant_ht: number;
  montant_ttc: number;
}

interface InvoicePDFProps {
  reference: string;
  numero_facture?: string | null;
  date_emission: string;
  date_echeance?: string | null;
  partenaire_nom: string;
  partenaire_email?: string | null;
  partenaire_adresse?: string | null;
  partenaire_ville?: string | null;
  partenaire_code_postal?: string | null;
  partenaire_numero_tva?: string | null;
  lignes: InvoiceLine[];
  montant_ht: number;
  montant_tva: number;
  montant_ttc: number;
  montant_paye?: number;
  montant_restant?: number;
  mode_paiement?: string | null;
  notes?: string | null;
  societe_nom?: string | null;
  societe_logo?: string | null;
  societe_adresse?: string | null;
  societe_telephone?: string | null;
  tva_taux?: number | null;
}

export function InvoicePDF({
  reference,
  numero_facture,
  date_emission,
  date_echeance,
  partenaire_nom,
  partenaire_email,
  partenaire_adresse,
  partenaire_ville,
  partenaire_code_postal,
  partenaire_numero_tva,
  lignes,
  montant_ht,
  montant_tva,
  montant_ttc,
  montant_paye,
  montant_restant,
  mode_paiement,
  notes,
  societe_nom,
  societe_logo,
  societe_adresse,
  societe_telephone,
  tva_taux,
}: InvoicePDFProps) {
  const logo = resolveMediaUrl(societe_logo);

  // TVA : priorité au paramètre de la société (sinon taux enregistrés par ligne)
  const hasParamTva = tva_taux !== undefined && tva_taux !== null;
  const tvaCalc = hasParamTva
    ? Number(montant_ht) * (Number(tva_taux) / 100)
    : Number(montant_tva);
  const ttcCalc = hasParamTva
    ? Number(montant_ht) + tvaCalc
    : Number(montant_ttc);
  const restantCalc = hasParamTva
    ? Math.max(0, ttcCalc - Number(montant_paye ?? 0))
    : Number(montant_restant ?? 0);
  const ttcParTaux = lignes.reduce((acc, l) => {
    const key = `${l.taux_tva}%`;
    if (!acc[key]) acc[key] = { ht: 0, tva: 0, ttc: 0 };
    acc[key].ht += l.montant_ht;
    acc[key].tva += l.montant_ht * (l.taux_tva / 100);
    acc[key].ttc += l.montant_ht * (1 + l.taux_tva / 100);
    return acc;
  }, {} as Record<string, { ht: number; tva: number; ttc: number }>);

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        <View style={styles.header}>
          <View style={styles.companyInfo}>
            {logo && <Image src={logo} style={styles.companyLogo} />}
            <Text style={styles.companyName}>{societe_nom || "GS Stock"}</Text>
            {societe_adresse ? (
              <Text style={styles.companyDetails}>{societe_adresse}</Text>
            ) : (
              <>
                <Text style={styles.companyDetails}>123 rue de l'Entreprise</Text>
                <Text style={styles.companyDetails}>75000 Paris, France</Text>
              </>
            )}
            {societe_telephone && (
              <Text style={styles.companyDetails}>Tél : {societe_telephone}</Text>
            )}
          </View>
          <View>
            <Text style={styles.invoiceTitle}>FACTURE</Text>
            <Text style={styles.invoiceMeta}>{reference}</Text>
            {numero_facture && <Text style={styles.invoiceMeta}>N° {numero_facture}</Text>}
            <Text style={styles.invoiceMeta}>Date : {formatDateLong(date_emission)}</Text>
            {date_echeance && <Text style={styles.invoiceMeta}>Échéance : {formatDateLong(date_echeance)}</Text>}
          </View>
        </View>

        <View style={styles.billingSection}>
          <Text style={styles.billingTitle}>Facturer à</Text>
          <Text style={styles.billingName}>{partenaire_nom}</Text>
          {partenaire_adresse && <Text style={styles.billingAddress}>{partenaire_adresse}</Text>}
          {partenaire_code_postal && partenaire_ville && (
            <Text style={styles.billingAddress}>{partenaire_code_postal} {partenaire_ville}</Text>
          )}
          {partenaire_email && <Text style={styles.billingAddress}>{partenaire_email}</Text>}
          {partenaire_numero_tva && <Text style={styles.billingAddress}>TVA : {partenaire_numero_tva}</Text>}
        </View>

        <View style={styles.table}>
          <View style={styles.tableHeader}>
            <Text style={[styles.tableHeaderText, styles.colDescription]}>Description</Text>
            <Text style={[styles.tableHeaderText, styles.colQuantity]}>Quantité</Text>
            <Text style={[styles.tableHeaderText, styles.colPrice]}>Prix unitaire HT</Text>
            <Text style={[styles.tableHeaderText, styles.colTva]}>TVA</Text>
            <Text style={[styles.tableHeaderText, styles.colTotal]}>Total HT</Text>
          </View>
          {lignes.map((ligne, index) => (
            <View key={index} style={[styles.tableRow, index % 2 === 1 ? styles.tableRowAlt : {}]}>
              <Text style={[styles.cellText, styles.colDescription]}>
                {ligne.nom_produit}
                {ligne.description ? `\n${ligne.description}` : ""}
              </Text>
              <Text style={[styles.cellText, styles.colQuantity]}>{ligne.quantite}</Text>
              <Text style={[styles.cellText, styles.colPrice]}>
                {Number(ligne.prix_unitaire_ht).toFixed(2)} {DEVISE}
              </Text>
              <Text style={[styles.cellText, styles.colTva]}>
                {hasParamTva ? `${Number(tva_taux)}%` : `${ligne.taux_tva}%`}
              </Text>
              <Text style={[styles.cellText, styles.colTotal]}>
                {Number(ligne.montant_ht).toFixed(2)} {DEVISE}
              </Text>
            </View>
          ))}
        </View>

        <View style={styles.totalsSection}>
          <View style={styles.totalsBox}>
            {hasParamTva ? (
              <View style={styles.totalRow}>
                <Text style={styles.totalLabel}>Dont TVA {Number(tva_taux)}%</Text>
                <Text style={styles.totalValue}>{tvaCalc.toFixed(2)} {DEVISE}</Text>
              </View>
            ) : (
              Object.entries(ttcParTaux).map(([taux, vals]) => (
                <View key={taux} style={styles.totalRow}>
                  <Text style={styles.totalLabel}>Dont TVA {taux}</Text>
                  <Text style={styles.totalValue}>{Number(vals.tva).toFixed(2)} {DEVISE}</Text>
                </View>
              ))
            )}
            <View style={styles.totalRow}>
              <Text style={styles.totalLabel}>Total HT</Text>
              <Text style={styles.totalValue}>{Number(montant_ht).toFixed(2)} {DEVISE}</Text>
            </View>
            <View style={styles.totalRow}>
              <Text style={styles.totalLabel}>
                Total TVA{hasParamTva ? ` (${Number(tva_taux)}%)` : ""}
              </Text>
              <Text style={styles.totalValue}>{tvaCalc.toFixed(2)} {DEVISE}</Text>
            </View>
            <View style={styles.totalFinalRow}>
              <Text style={styles.totalFinalLabel}>Total TTC</Text>
              <Text style={styles.totalFinalValue}>{ttcCalc.toFixed(2)} {DEVISE}</Text>
            </View>
            {montant_paye !== undefined && montant_paye > 0 && (
              <View style={styles.totalRow}>
                <Text style={styles.totalLabel}>Déjà payé</Text>
                <Text style={{ ...styles.totalValue, color: "#16a34a" }}>{Number(montant_paye).toFixed(2)} {DEVISE}</Text>
              </View>
            )}
            {restantCalc > 0 && (
              <View style={styles.totalRow}>
                <Text style={{ ...styles.totalLabel, fontWeight: "bold" }}>Restant dû</Text>
                <Text style={{ ...styles.totalValue, color: "#dc2626" }}>{restantCalc.toFixed(2)} {DEVISE}</Text>
              </View>
            )}
          </View>
        </View>

        <View style={styles.paymentTerms}>
          <Text style={styles.paymentTitle}>Conditions de paiement</Text>
          <Text style={styles.paymentText}>
            Paiement à réception de facture.
            {mode_paiement ? ` Mode de paiement : ${mode_paiement}.` : ""}
          </Text>
          {date_echeance && (
            <Text style={styles.paymentText}>
              Date d'échéance : {formatDateLong(date_echeance)}. Tout retard de paiement entraînera des pénalités.
            </Text>
          )}
          {notes && (
            <Text style={styles.paymentText}>
              Notes : {notes}
            </Text>
          )}
        </View>

        <View style={styles.footer}>
          <Text>
            {societe_nom || "GS Stock"}
            {societe_adresse ? ` — ${societe_adresse}` : ""}
          </Text>
          {societe_telephone ? <Text>Tél : {societe_telephone}</Text> : null}
          <Text
            render={({ pageNumber, totalPages }) => `Page ${pageNumber} / ${totalPages}`}
          />
        </View>
      </Page>
    </Document>
  );
}
