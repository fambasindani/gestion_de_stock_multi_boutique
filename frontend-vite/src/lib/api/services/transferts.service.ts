import { apiClient } from '../client';
import { ApiResponse } from '../types';
import { TransfertStock, MouvementStock } from '../typess';

export class TransfertsService {
  async getAll(params?: { search?: string; page?: number; per_page?: number; etat?: string; type?: string }): Promise<ApiResponse<TransfertStock[]>> {
    let url = '/transferts';
    if (params) {
      const searchParams = new URLSearchParams();
      if (params.search) searchParams.append('search', params.search);
      if (params.page) searchParams.append('page', String(params.page));
      if (params.per_page) searchParams.append('per_page', String(params.per_page));
      if (params.etat) searchParams.append('etat', params.etat);
      if (params.type) searchParams.append('type', params.type);
      const qs = searchParams.toString();
      if (qs) url += `?${qs}`;
    }
    return apiClient.get<TransfertStock[]>(url);
  }

  async getById(id: number): Promise<ApiResponse<TransfertStock>> {
    return apiClient.get<TransfertStock>(`/transferts/${id}`);
  }

  async create(data: Partial<TransfertStock> & { mouvements?: Partial<MouvementStock>[] }): Promise<ApiResponse<TransfertStock>> {
    return apiClient.post<TransfertStock>('/transferts', data);
  }

  async update(id: number, data: Partial<TransfertStock>): Promise<ApiResponse<TransfertStock>> {
    return apiClient.put<TransfertStock>(`/transferts/${id}`, data);
  }

  async delete(id: number): Promise<ApiResponse<null>> {
    return apiClient.delete<null>(`/transferts/${id}`);
  }

  async changerEtat(id: number, etat: string): Promise<ApiResponse<TransfertStock>> {
    return apiClient.post<TransfertStock>(`/transferts/${id}/changer-etat`, { etat });
  }

  async valider(id: number): Promise<ApiResponse<TransfertStock>> {
    return apiClient.post<TransfertStock>(`/transferts/${id}/valider`);
  }

  async ajouterOperation(id: number, data: Partial<MouvementStock>): Promise<ApiResponse<MouvementStock>> {
    return apiClient.post<MouvementStock>(`/transferts/${id}/operations`, data);
  }
}

export const transfertsService = new TransfertsService();
