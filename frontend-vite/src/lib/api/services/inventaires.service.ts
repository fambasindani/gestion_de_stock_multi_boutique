import { apiClient } from "../client";
import type { ApiResponse } from "../types";
import type { VarianteProduit, EmplacementStock } from "../typess";

export type InventaireStatut = "brouillon" | "en_cours" | "cloture";

export interface Inventaire {
  id: number;
  reference: string;
  date_inventaire: string;
  emplacement_id: number | null;
  statut: InventaireStatut;
  notes: string | null;
  utilisateur_id: number | null;
  date_cloture: string | null;
  emplacement?: EmplacementStock | null;
  utilisateur?: { id: number; nom: string } | null;
  lignes_count?: number;
  created_at: string;
  updated_at: string;
}

export interface LigneInventaire {
  id: number;
  inventaire_id: number;
  produit_id: number;
  emplacement_id: number | null;
  quantite_theorique: number;
  quantite_physique: number;
  ecart: number;
  ajuste: boolean;
  notes: string | null;
  produit?: VarianteProduit;
  emplacement?: EmplacementStock | null;
}

export interface InventaireTotaux {
  nombre_lignes: number;
  lignes_ajustees: number;
  total_ecart: number;
  excédents: number;
  manquants: number;
}

export class InventairesService {
  async getAll(params?: {
    page?: number;
    per_page?: number;
    statut?: string;
    emplacement_id?: number;
    search?: string;
  }): Promise<ApiResponse<{ data: Inventaire[]; current_page: number; last_page: number; total: number; per_page: number }>> {
    let url = "/inventaires";
    if (params) {
      const sp = new URLSearchParams();
      if (params.page) sp.append("page", String(params.page));
      if (params.per_page) sp.append("per_page", String(params.per_page));
      if (params.statut && params.statut !== "all") sp.append("statut", params.statut);
      if (params.emplacement_id) sp.append("emplacement_id", String(params.emplacement_id));
      if (params.search) sp.append("search", params.search);
      const qs = sp.toString();
      if (qs) url += `?${qs}`;
    }
    return apiClient.get(url);
  }

  async getById(id: number): Promise<ApiResponse<{ inventaire: Inventaire & { lignes: LigneInventaire[] }; totaux: InventaireTotaux }>> {
    return apiClient.get(`/inventaires/${id}`);
  }

  async create(data: {
    date_inventaire?: string;
    emplacement_id?: number | null;
    notes?: string | null;
    generer_lignes?: boolean;
  }): Promise<ApiResponse<Inventaire>> {
    return apiClient.post("/inventaires", data);
  }

  async update(
    id: number,
    data: { date_inventaire?: string; emplacement_id?: number | null; notes?: string | null }
  ): Promise<ApiResponse<Inventaire>> {
    return apiClient.put(`/inventaires/${id}`, data);
  }

  async delete(id: number): Promise<ApiResponse<null>> {
    return apiClient.delete(`/inventaires/${id}`);
  }

  async genererLignes(id: number): Promise<ApiResponse<{ lignes_ajoutees: number }>> {
    return apiClient.post(`/inventaires/${id}/generer-lignes`);
  }

  async ajouterLigne(
    id: number,
    data: {
      produit_id: number;
      emplacement_id?: number | null;
      quantite_theorique?: number;
      quantite_physique?: number;
      notes?: string | null;
    }
  ): Promise<ApiResponse<LigneInventaire>> {
    return apiClient.post(`/inventaires/${id}/lignes`, data);
  }

  async updateLigne(
    id: number,
    ligneId: number,
    data: { quantite_physique: number; notes?: string | null }
  ): Promise<ApiResponse<LigneInventaire>> {
    return apiClient.put(`/inventaires/${id}/lignes/${ligneId}`, data);
  }

  async supprimerLigne(id: number, ligneId: number): Promise<ApiResponse<null>> {
    return apiClient.delete(`/inventaires/${id}/lignes/${ligneId}`);
  }

  async cloturer(id: number): Promise<ApiResponse<Inventaire>> {
    return apiClient.post(`/inventaires/${id}/cloturer`);
  }

  async ajuster(id: number): Promise<ApiResponse<{ lignes_ajustees: number }>> {
    return apiClient.post(`/inventaires/${id}/ajuster`);
  }
}

export const inventairesService = new InventairesService();
