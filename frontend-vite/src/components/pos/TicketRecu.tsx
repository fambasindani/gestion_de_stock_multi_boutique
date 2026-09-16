import type { PosVenteResult } from "@/lib/api/services/pos.service";
import { resolveMediaUrl } from "@/lib/utils/assets";

const money = (v: unknown) => Number(v ?? 0).toFixed(2);

interface TicketRecuProps {
  vente: PosVenteResult;
  entreprise?: Record<string, string>;
}

/**
 * Ticket de caisse prêt pour imprimante matricielle/thermique (monospace, colonnes fixes).
 * Rendu hors écran ; imprimé via window.print() grâce au CSS #ticket-impression.
 */
export function TicketRecu({ vente, entreprise }: TicketRecuProps) {
  const logo = resolveMediaUrl(vente.societe?.logo);
  const nom = entreprise?.entreprise_nom || vente.societe?.nom || "GS Stock";
  const adresse = entreprise?.entreprise_adresse || "";
  const tel = entreprise?.entreprise_telephone || "";
  const message = entreprise?.ticket_message || "Merci de votre visite !";
  const [, , refFacture] = (vente.facture.numero_facture || "").split("-");

  return (
    <div id="ticket-impression" className="ticket-print-area ticket-mono">
      <div style={{ textAlign: "center" }}>
        {logo && (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={logo}
            alt={nom}
            style={{ maxHeight: 60, maxWidth: 160, margin: "0 auto 4px", objectFit: "contain" }}
          />
        )}
        <div style={{ fontWeight: 700, fontSize: 14 }}>{nom}</div>
        {adresse && <div>{adresse}</div>}
        {tel && <div>Tél : {tel}</div>}
      </div>

      {"\n================================\n"}
      <div>Ticket : {vente.facture.numero_facture || vente.commande.reference}</div>
      <div>Date   : {vente.date}</div>
      <div>Vendeur: {vente.vendeur}</div>
      <div>Client : {vente.client_nom || "Comptoir"}</div>
      {"\n"}
      <div>{"Qté Article              PU      Total"}</div>
      <div>{"--------------------------------"}</div>
      {vente.lignes.map((l, i) => {
        const nomLimite = l.nom_produit.slice(0, 18).padEnd(18, " ");
        const qte = String(l.quantite).padStart(3, " ");
        const pu = money(l.prix_unitaire_ht).padStart(8, " ");
        const tot = money(l.montant_total_ht).padStart(9, " ");
        return <div key={i}>{`${qte} ${nomLimite}${pu} ${tot}`}</div>;
      })}
      <div>{"--------------------------------"}</div>
      <div>{`Total HT        : ${money(vente.totaux.total_ht).padStart(12, " ")}`}</div>
      <div>{`TVA             : ${money(vente.totaux.total_tva).padStart(12, " ")}`}</div>
      <div>{`TOTAL TTC       : ${money(vente.totaux.total_ttc).padStart(12, " ")}`}</div>
      <div>{`Payé            : ${money(vente.totaux.montant_paye).padStart(12, " ")}`}</div>
      <div>{`Monnaie         : ${money(vente.totaux.monnaie).padStart(12, " ")}`}</div>
      {"\n================================\n"}
      <div style={{ textAlign: "center" }}>{message}</div>
      <div style={{ textAlign: "center", fontSize: 10 }}>
        {refFacture ? `FACT-${refFacture}` : ""}
      </div>
    </div>
  );
}
