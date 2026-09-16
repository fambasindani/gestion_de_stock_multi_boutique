import { apiClient } from '../client';
import { ApiResponse } from '../types';
import { EcritureComptable, LigneEcritureComptable } from '../typess';

export class FacturesService {
  async getAll(params?: { search?: string; page?: number; per_page?: number; statut?: string; type?: string; partenaire_id?: number }): Promise<ApiResponse<EcritureComptable[]>> {
    let url = '/factures';
    if (params) {
      const searchParams = new URLSearchParams();
      if (params.search) searchParams.append('search', params.search);
      if (params.page) searchParams.append('page', String(params.page));
      if (params.per_page) searchParams.append('per_page', String(params.per_page));
      if (params.statut) searchParams.append('statut', params.statut);
      if (params.type) searchParams.append('type', params.type);
      if (params.partenaire_id) searchParams.append('partenaire_id', String(params.partenaire_id));
      const qs = searchParams.toString();
      if (qs) url += `?${qs}`;
    }
    return apiClient.get<EcritureComptable[]>(url);
  }

  async getById(id: number): Promise<ApiResponse<EcritureComptable>> {
    return apiClient.get<EcritureComptable>(`/factures/${id}`);
  }

  async create(data: Partial<EcritureComptable> & { lignes?: Partial<LigneEcritureComptable>[] }): Promise<ApiResponse<EcritureComptable>> {
    return apiClient.post<EcritureComptable>('/factures', data);
  }

  async update(id: number, data: Partial<EcritureComptable>): Promise<ApiResponse<EcritureComptable>> {
    return apiClient.put<EcritureComptable>(`/factures/${id}`, data);
  }

  async delete(id: number): Promise<ApiResponse<null>> {
    return apiClient.delete<null>(`/factures/${id}`);
  }

  async changerStatut(id: number, statut: string): Promise<ApiResponse<EcritureComptable>> {
    return apiClient.post<EcritureComptable>(`/factures/${id}/changer-statut`, { statut });
  }

  async paiementPartiel(id: number, montant: number, data?: Record<string, unknown>): Promise<ApiResponse<EcritureComptable>> {
    return apiClient.post<EcritureComptable>(`/factures/${id}/paiement-partiel`, { montant, ...data });
  }
}

export const facturesService = new FacturesService();
