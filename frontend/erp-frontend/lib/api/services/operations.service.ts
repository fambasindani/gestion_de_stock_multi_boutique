import { apiClient } from '../client';
import { ApiResponse } from '../types';
import { LigneOperationStock } from '../typess';

export class OperationsService {
  async getAll(params?: { search?: string; page?: number; per_page?: number; mouvement_id?: number; produit_id?: number; lot_id?: number; type_operation?: string; date_debut?: string; date_fin?: string }): Promise<ApiResponse<LigneOperationStock[]>> {
    let url = '/operations';
    if (params) {
      const searchParams = new URLSearchParams();
      if (params.search) searchParams.append('search', params.search);
      if (params.page) searchParams.append('page', String(params.page));
      if (params.per_page) searchParams.append('per_page', String(params.per_page));
      if (params.mouvement_id) searchParams.append('mouvement_id', String(params.mouvement_id));
      if (params.produit_id) searchParams.append('produit_id', String(params.produit_id));
      if (params.lot_id) searchParams.append('lot_id', String(params.lot_id));
      if (params.type_operation) searchParams.append('type_operation', params.type_operation);
      if (params.date_debut) searchParams.append('date_debut', params.date_debut);
      if (params.date_fin) searchParams.append('date_fin', params.date_fin);
      const qs = searchParams.toString();
      if (qs) url += `?${qs}`;
    }
    return apiClient.get<LigneOperationStock[]>(url);
  }

  async getById(id: number): Promise<ApiResponse<LigneOperationStock>> {
    return apiClient.get<LigneOperationStock>(`/operations/${id}`);
  }

  async parMouvement(mouvementId: number): Promise<ApiResponse<LigneOperationStock[]>> {
    return apiClient.get<LigneOperationStock[]>(`/operations/mouvement/${mouvementId}`);
  }

  async create(data: Partial<LigneOperationStock>): Promise<ApiResponse<LigneOperationStock>> {
    return apiClient.post<LigneOperationStock>('/operations', data);
  }

  async delete(id: number): Promise<ApiResponse<null>> {
    return apiClient.delete<null>(`/operations/${id}`);
  }
}

export const operationsService = new OperationsService();
