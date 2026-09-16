import { apiClient } from "../client";
import type { ApiResponse } from "../types";

export interface PosLigneInput {
  produit_id: number;
  quantite: number;
  prix_unitaire_ht: number;
  taux_tva?: number;
  taux_remise?: number;
}

export interface PosArticle {
  produit_id: number;
  code_produit: string | null;
  nom_produit: string;
  quantite: number;
  prix_unitaire_ht: number;
  prix_unitaire_ttc: number;
  taux_remise: number;
  montant_remise: number;
  montant_total_ht: number;
  montant_total_ttc: number;
  taux_tva: number;
}

export interface PosTotaux {
  total_ht: number;
  total_tva: number;
  total_ttc: number;
  total_remise: number;
  montant_paye: number;
  monnaie: number;
}

export interface PosVenteResult {
  commande: { id: number; reference: string };
  facture: { id: number; reference: string; numero_facture: string | null };
  lignes: PosArticle[];
  totaux: PosTotaux;
  client_nom: string | null;
  partenaire: string;
  vendeur: string;
  societe: { nom: string; logo?: string | null } | null;
  date: string;
}

export interface PosVenteData {
  lignes: PosLigneInput[];
  partenaire_id?: number | null;
  client_nom?: string | null;
  mode_paiement?: string | null;
  montant_paye?: number | null;
  emplacement_id?: number | null;
  notes?: string | null;
}

export class PosService {
  async vendre(data: PosVenteData): Promise<ApiResponse<PosVenteResult>> {
    return apiClient.post<PosVenteResult>("/pos/vendre", data);
  }
}

export const posService = new PosService();
