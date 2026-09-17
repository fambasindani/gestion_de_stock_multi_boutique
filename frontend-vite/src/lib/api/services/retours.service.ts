import { apiClient } from "../client";
import type { ApiResponse } from "../types";

export type RetourType = "client" | "fournisseur" | "casse";

export interface Retour {
  id: number;
  reference: string;
  date_retour: string;
  type: RetourType;
  statut: "brouillon" | "valide";
  valide_par?: number | null;
  date_validation?: string | null;
  partenaire_id: number | null;
  emplacement_id: number | null;
  motif: string | null;
  notes: string | null;
  utilisateur_id: number | null;
  partenaire?: { id: number; nom: string } | null;
  emplacement?: { id: number; nom: string } | null;
  utilisateur?: { id: number; nom: string } | null;
  lignes?: LigneRetour[];
  lignes_count?: number;
  created_at: string;
  updated_at: string;
}

export interface LigneRetour {
  id: number;
  retour_id: number;
  produit_id: number;
  quantite: number;
  prix_unitaire_ht: number;
  montant_ht: number;
  notes: string | null;
  produit?: { id: number; nom: string | null; code_interne: string | null } | null;
}

export interface CreateRetourData {
  type: RetourType;
  date_retour?: string;
  partenaire_id?: number | null;
  emplacement_id?: number | null;
  motif?: string | null;
  notes?: string | null;
  lignes: Array<{
    produit_id: number;
    quantite: number;
    prix_unitaire_ht?: number;
    notes?: string | null;
  }>;
}

export class RetoursService {
  async getAll(params?: {
    page?: number;
    per_page?: number;
    type?: string;
    search?: string;
    date_debut?: string;
    date_fin?: string;
  }): Promise<
    ApiResponse<{
      data: Retour[];
      current_page: number;
      last_page: number;
      total: number;
      per_page: number;
    }>
  > {
    let url = "/retours";
    if (params) {
      const sp = new URLSearchParams();
      if (params.page) sp.append("page", String(params.page));
      if (params.per_page) sp.append("per_page", String(params.per_page));
      if (params.type && params.type !== "all") sp.append("type", params.type);
      if (params.search) sp.append("search", params.search);
      if (params.date_debut) sp.append("date_debut", params.date_debut);
      if (params.date_fin) sp.append("date_fin", params.date_fin);
      const qs = sp.toString();
      if (qs) url += `?${qs}`;
    }
    return apiClient.get(url);
  }

  async getById(id: number): Promise<ApiResponse<Retour>> {
    return apiClient.get(`/retours/${id}`);
  }

  async create(data: CreateRetourData): Promise<ApiResponse<Retour>> {
    return apiClient.post("/retours", data);
  }

  async valider(id: number): Promise<ApiResponse<Retour>> {
    return apiClient.post(`/retours/${id}/valider`);
  }

  async delete(id: number): Promise<ApiResponse<null>> {
    return apiClient.delete(`/retours/${id}`);
  }
}

export const retoursService = new RetoursService();
