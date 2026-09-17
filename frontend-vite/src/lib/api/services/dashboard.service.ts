import { apiClient } from '../client';
import { ApiResponse } from '../types';

// ============================================
// TYPES DASHBOARD
// ============================================

export interface DashboardStats {
  stats_generales: StatsGenerales;
  chiffres_affaires: ChiffresAffaires;
  commandes: CommandesStats;
  stock: StockStats;
  transferts_recents: TransfertRecent[];
  factures_recents: FactureRecent[];
  alertes_stock: AlerteStock[];
  evolution_ventes: EvolutionVente[];
  top_produits: TopProduit[];
  activite_utilisateurs: ActiviteUtilisateurs;
}

export interface StatsGenerales {
  total_utilisateurs: number;
  total_clients: number;
  total_fournisseurs: number;
  total_produits: number;
  total_commandes_vente: number;
  total_commandes_achat: number;
  total_factures: number;
  total_transferts: number;
}

export interface ChiffresAffaires {
  ca_clients: string;
  ca_fournisseurs: string;
  total_factures: string;
  factures_impayees: string;
  taux_paiement: number;
  date_debut: string;
  date_fin: string;
}

export interface CommandesStats {
  ventes: {
    total: number;
    par_statut: Record<string, number>;
    brouillon: number;
    confirme: number;
    en_cours: number;
    termine: number;
    annule: number;
  };
  achats: {
    total: number;
    par_statut: Record<string, number>;
    brouillon: number;
    confirme: number;
    envoye: number;
    recu: number;
    termine: number;
    annule: number;
  };
}

export interface StockStats {
  quantite_totale: string;
  produits_en_stock: number;
  produits_rupture: number;
  produits_alerte: number;
  produits_normal: number;
  taux_rupture: number;
}

export interface TransfertRecent {
  id: number;
  reference: string;
  type: string;
  type_label: string;
  etat: string;
  etat_label: string;
  source: string | null;
  destination: string | null;
  created_at: string;
  cree_par: string | null;
}

export interface FactureRecent {
  id: number;
  reference: string;
  numero_facture: string | null;
  type: string;
  type_label: string;
  statut: string;
  statut_label: string;
  montant_ttc: string;
  partenaire: string | null;
  date_emission: string;
  cree_par: string | null;
}

export interface AlerteStock {
  produit: string;
  code: string;
  emplacement: string;
  quantite: string;
  seuil_minimum?: string;
  type: 'rupture' | 'alerte';
  message: string;
}

export interface EvolutionVente {
  date: string;
  commandes: number;
  montant_commandes: string;
  factures: number;
  montant_factures: string;
}

export interface TopProduit {
  produit_id: number;
  nom: string;
  quantite_vendue: string;
  total_ht: string;
  nombre_commandes: number;
}

export interface ActiviteUtilisateurs {
  dernieres_connexions: DerniereConnexion[];
  utilisateurs_par_role: Record<string, number>;
  total_actifs: number;
  total_inactifs: number;
}

export interface DerniereConnexion {
  nom: string;
  email: string;
  derniere_connexion: string;
  role: string;
}

// ============================================
// SERVICE
// ============================================

export class DashboardService {
  /**
   * Récupérer les statistiques du dashboard
   */
  async getStats(dateDebut?: string, dateFin?: string): Promise<ApiResponse<DashboardStats>> {
    let url = '/dashboard';
    if (dateDebut || dateFin) {
      const params = new URLSearchParams();
      if (dateDebut) params.append('date_debut', dateDebut);
      if (dateFin) params.append('date_fin', dateFin);
      url += `?${params.toString()}`;
    }
    return apiClient.get<DashboardStats>(url);
  }

  /**
   * Récupérer le dashboard des commandes
   */
  async getCommandesStats(dateDebut?: string, dateFin?: string): Promise<ApiResponse<any>> {
    let url = '/dashboard/commandes';
    if (dateDebut || dateFin) {
      const params = new URLSearchParams();
      if (dateDebut) params.append('date_debut', dateDebut);
      if (dateFin) params.append('date_fin', dateFin);
      url += `?${params.toString()}`;
    }
    return apiClient.get<any>(url);
  }

  /**
   * Récupérer le dashboard du stock
   */
  async getStockStats(): Promise<ApiResponse<any>> {
    return apiClient.get<any>('/dashboard/stock');
  }

  /**
   * Récupérer le dashboard de facturation
   */
  async getFacturationStats(dateDebut?: string, dateFin?: string): Promise<ApiResponse<any>> {
    let url = '/dashboard/facturation';
    if (dateDebut || dateFin) {
      const params = new URLSearchParams();
      if (dateDebut) params.append('date_debut', dateDebut);
      if (dateFin) params.append('date_fin', dateFin);
      url += `?${params.toString()}`;
    }
    return apiClient.get<any>(url);
  }
}

export const dashboardService = new DashboardService();