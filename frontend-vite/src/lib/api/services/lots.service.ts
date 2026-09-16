import { apiClient } from '../client';
import { ApiResponse } from '../types';
import { LotTracabilite } from '../typess';

export class LotsService {
  async getAll(params?: { search?: string; page?: number; per_page?: number; produit_id?: number; statut?: string }): Promise<ApiResponse<LotTracabilite[]>> {
    let url = '/lots';
    if (params) {
      const searchParams = new URLSearchParams();
      if (params.search) searchParams.append('search', params.search);
      if (params.page) searchParams.append('page', String(params.page));
      if (params.per_page) searchParams.append('per_page', String(params.per_page));
      if (params.produit_id) searchParams.append('produit_id', String(params.produit_id));
      if (params.statut) searchParams.append('statut', params.statut);
      const qs = searchParams.toString();
      if (qs) url += `?${qs}`;
    }
    return apiClient.get<LotTracabilite[]>(url);
  }

  async getPerimes(): Promise<ApiResponse<LotTracabilite[]>> {
    return apiClient.get<LotTracabilite[]>('/lots/perimes');
  }

  async getPeremptionProche(): Promise<ApiResponse<LotTracabilite[]>> {
    return apiClient.get<LotTracabilite[]>('/lots/peremption-proche');
  }

  async getById(id: number): Promise<ApiResponse<LotTracabilite>> {
    return apiClient.get<LotTracabilite>(`/lots/${id}`);
  }

  async create(data: Partial<LotTracabilite>): Promise<ApiResponse<LotTracabilite>> {
    return apiClient.post<LotTracabilite>('/lots', data);
  }

  async update(id: number, data: Partial<LotTracabilite>): Promise<ApiResponse<LotTracabilite>> {
    return apiClient.put<LotTracabilite>(`/lots/${id}`, data);
  }

  async delete(id: number): Promise<ApiResponse<null>> {
    return apiClient.delete<null>(`/lots/${id}`);
  }

  async reserver(id: number, quantite?: number): Promise<ApiResponse<LotTracabilite>> {
    return apiClient.post<LotTracabilite>(`/lots/${id}/reserver`, { quantite });
  }

  async liberer(id: number, quantite?: number): Promise<ApiResponse<LotTracabilite>> {
    return apiClient.post<LotTracabilite>(`/lots/${id}/liberer`, { quantite });
  }
}

export const lotsService = new LotsService();
