import { apiClient } from '../client';
import { ApiResponse, RapportMouvementData, RapportStockData, RapportVentesData, RapportAchatsData } from '../typess';

export interface VariationPrixLigne {
  produit_id: number;
  produit: string;
  code: string | null;
  nombre_achats: number;
  prix_min: number;
  prix_max: number;
  premier_prix: number;
  dernier_prix: number;
  variation_pct: number;
  tendance: "hausse" | "baisse" | "stable";
}

export interface RapportSeuilLigne {
  produit_id: number;
  produit: string;
  code: string | null;
  categorie: string | null;
  emplacement: string | null;
  quantite: number;
  seuil_minimum: number | null;
  manque: number | null;
  valeur: number;
}

export interface RapportSeuilData {
  lignes: RapportSeuilLigne[];
  totaux: {
    nombre_produits: number;
    quantite_totale: number;
    manque_total: number;
    valeur_totale: number;
  };
}

export class RapportsService {
  async ventes(params?: {
    date_debut?: string;
    date_fin?: string;
    partenaire_id?: number;
  }): Promise<ApiResponse<RapportVentesData>> {
    let url = '/rapports/ventes';
    if (params) {
      const sp = new URLSearchParams();
      if (params.date_debut) sp.append('date_debut', params.date_debut);
      if (params.date_fin) sp.append('date_fin', params.date_fin);
      if (params.partenaire_id) sp.append('partenaire_id', String(params.partenaire_id));
      const qs = sp.toString();
      if (qs) url += `?${qs}`;
    }
    return apiClient.get<RapportVentesData>(url);
  }

  async achats(params?: {
    date_debut?: string;
    date_fin?: string;
    partenaire_id?: number;
  }): Promise<ApiResponse<RapportAchatsData>> {
    let url = '/rapports/achats';
    if (params) {
      const sp = new URLSearchParams();
      if (params.date_debut) sp.append('date_debut', params.date_debut);
      if (params.date_fin) sp.append('date_fin', params.date_fin);
      if (params.partenaire_id) sp.append('partenaire_id', String(params.partenaire_id));
      const qs = sp.toString();
      if (qs) url += `?${qs}`;
    }
    return apiClient.get<RapportAchatsData>(url);
  }

  async mouvements(params?: {
    date_debut?: string;
    date_fin?: string;
    categorie_id?: number;
    type_operation?: string;
  }): Promise<ApiResponse<RapportMouvementData>> {
    let url = '/rapports/mouvements';
    if (params) {
      const sp = new URLSearchParams();
      if (params.date_debut) sp.append('date_debut', params.date_debut);
      if (params.date_fin) sp.append('date_fin', params.date_fin);
      if (params.categorie_id) sp.append('categorie_id', String(params.categorie_id));
      if (params.type_operation) sp.append('type_operation', params.type_operation);
      const qs = sp.toString();
      if (qs) url += `?${qs}`;
    }
    return apiClient.get<RapportMouvementData>(url);
  }

  async ventesVendeurs(params?: {
    date_debut?: string;
    date_fin?: string;
    utilisateur_id?: number;
  }): Promise<
    ApiResponse<{
      lignes: Array<{
        utilisateur_id: number | null;
        vendeur: string;
        email: string;
        nombre_ventes: number;
        total_ht: number;
        total_remise: number;
        total_ttc: number;
      }>;
      totaux: {
        nombre_ventes: number;
        total_ht: number;
        total_remise: number;
        total_ttc: number;
        nombre_vendeurs: number;
      };
    }>
  > {
    let url = "/rapports/ventes-vendeurs";
    if (params) {
      const sp = new URLSearchParams();
      if (params.date_debut) sp.append("date_debut", params.date_debut);
      if (params.date_fin) sp.append("date_fin", params.date_fin);
      if (params.utilisateur_id) sp.append("utilisateur_id", String(params.utilisateur_id));
      const qs = sp.toString();
      if (qs) url += `?${qs}`;
    }
    return apiClient.get(url);
  }

  async caPartenaires(params: {
    type: "client" | "fournisseur";
    date_debut?: string;
    date_fin?: string;
  }): Promise<
    ApiResponse<{
      type: string;
      lignes: Array<{
        partenaire_id: number;
        partenaire: string;
        nombre_factures: number;
        total_ht: number;
        total_ttc: number;
        total_impaye: number;
      }>;
      totaux: {
        nombre_partenaires: number;
        nombre_factures: number;
        total_ht: number;
        total_ttc: number;
        total_impaye: number;
      };
    }>
  > {
    const sp = new URLSearchParams({ type: params.type });
    if (params.date_debut) sp.append("date_debut", params.date_debut);
    if (params.date_fin) sp.append("date_fin", params.date_fin);
    return apiClient.get(`/rapports/ca-partenaires?${sp.toString()}`);
  }

  async variationsPrix(params?: {
    date_debut?: string;
    date_fin?: string;
    produit_id?: number;
  }): Promise<
    ApiResponse<{
      lignes: VariationPrixLigne[];
      totaux: {
        nombre_produits: number;
        en_hausse: number;
        en_baisse: number;
        stables: number;
      };
    }>
  > {
    let url = "/rapports/variations-prix";
    if (params) {
      const sp = new URLSearchParams();
      if (params.date_debut) sp.append("date_debut", params.date_debut);
      if (params.date_fin) sp.append("date_fin", params.date_fin);
      if (params.produit_id) sp.append("produit_id", String(params.produit_id));
      const qs = sp.toString();
      if (qs) url += `?${qs}`;
    }
    return apiClient.get(url);
  }

  async ruptureStock(params?: {
    emplacement_id?: number;
  }): Promise<ApiResponse<RapportSeuilData>> {
    let url = "/rapports/rupture-stock";
    if (params?.emplacement_id) url += `?emplacement_id=${params.emplacement_id}`;
    return apiClient.get(url);
  }

  async stockBas(params?: {
    emplacement_id?: number;
  }): Promise<ApiResponse<RapportSeuilData>> {
    let url = "/rapports/stock-bas";
    if (params?.emplacement_id) url += `?emplacement_id=${params.emplacement_id}`;
    return apiClient.get(url);
  }

  async bonsCommande(params?: {
    date_debut?: string;
    date_fin?: string;
    partenaire_id?: number;
    etat?: string;
  }): Promise<
    ApiResponse<{
      lignes: Array<{
        id: number;
        reference: string;
        date_commande: string | null;
        fournisseur: string;
        etat: string;
        etat_label: string;
        nombre_lignes: number;
        total_ht: number;
        total_ttc: number;
      }>;
      totaux: {
        nombre_commandes: number;
        total_ht: number;
        total_ttc: number;
        total_lignes: number;
      };
    }>
  > {
    let url = "/rapports/bons-commande";
    if (params) {
      const sp = new URLSearchParams();
      if (params.date_debut) sp.append("date_debut", params.date_debut);
      if (params.date_fin) sp.append("date_fin", params.date_fin);
      if (params.partenaire_id) sp.append("partenaire_id", String(params.partenaire_id));
      if (params.etat && params.etat !== "all") sp.append("etat", params.etat);
      const qs = sp.toString();
      if (qs) url += `?${qs}`;
    }
    return apiClient.get(url);
  }

  async ventesVendeurDetails(
    utilisateurId: number,
    params?: { date_debut?: string; date_fin?: string }
  ): Promise<
    ApiResponse<{
      vendeur: { id: number; nom: string; email: string };
      lignes: Array<{
        id: number;
        reference: string;
        date_commande: string | null;
        client: string;
        etat: string;
        mode_paiement: string | null;
        nombre_articles: number;
        total_ht: number;
        total_remise: number;
        total_ttc: number;
      }>;
      totaux: {
        nombre_ventes: number;
        total_ht: number;
        total_remise: number;
        total_ttc: number;
      };
    }>
  > {
    let url = `/rapports/ventes-vendeurs/${utilisateurId}`;
    if (params) {
      const sp = new URLSearchParams();
      if (params.date_debut) sp.append("date_debut", params.date_debut);
      if (params.date_fin) sp.append("date_fin", params.date_fin);
      const qs = sp.toString();
      if (qs) url += `?${qs}`;
    }
    return apiClient.get(url);
  }

  async stock(params?: {
    categorie_id?: number;
    emplacement_id?: number;
  }): Promise<ApiResponse<RapportStockData>> {
    let url = '/rapports/stock';
    if (params) {
      const sp = new URLSearchParams();
      if (params.categorie_id) sp.append('categorie_id', String(params.categorie_id));
      if (params.emplacement_id) sp.append('emplacement_id', String(params.emplacement_id));
      const qs = sp.toString();
      if (qs) url += `?${qs}`;
    }
    return apiClient.get<RapportStockData>(url);
  }
}

export const rapportsService = new RapportsService();
