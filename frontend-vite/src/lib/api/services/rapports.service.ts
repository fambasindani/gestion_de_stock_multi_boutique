import { apiClient } from '../client';
import { ApiResponse, RapportMouvementData, RapportStockData, RapportVentesData, RapportAchatsData } from '../typess';

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
