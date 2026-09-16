import { apiClient } from '../client';
import { ApiResponse } from '../types';
import { QuantiteStock } from '../typess';

export class StockService {
  async getAll(params?: { search?: string; page?: number; per_page?: number; emplacement_id?: number; produit_id?: number }): Promise<ApiResponse<QuantiteStock[]>> {
    let url = '/stocks';
    if (params) {
      const searchParams = new URLSearchParams();
      if (params.search) searchParams.append('search', params.search);
      if (params.page) searchParams.append('page', String(params.page));
      if (params.per_page) searchParams.append('per_page', String(params.per_page));
      if (params.emplacement_id) searchParams.append('emplacement_id', String(params.emplacement_id));
      if (params.produit_id) searchParams.append('produit_id', String(params.produit_id));
      const qs = searchParams.toString();
      if (qs) url += `?${qs}`;
    }
    return apiClient.get<QuantiteStock[]>(url);
  }

  async getById(id: number): Promise<ApiResponse<QuantiteStock>> {
    return apiClient.get<QuantiteStock>(`/stocks/${id}`);
  }

  async create(data: Partial<QuantiteStock>): Promise<ApiResponse<QuantiteStock>> {
    return apiClient.post<QuantiteStock>('/stocks', data);
  }

  async update(id: number, data: Partial<QuantiteStock>): Promise<ApiResponse<QuantiteStock>> {
    return apiClient.put<QuantiteStock>(`/stocks/${id}`, data);
  }

  async delete(id: number): Promise<ApiResponse<null>> {
    return apiClient.delete<null>(`/stocks/${id}`);
  }

  async mouvement(data: { produit_id: number; emplacement_source_id: number; emplacement_destination_id: number; quantite: number; lot_id?: number; notes?: string }): Promise<ApiResponse<QuantiteStock>> {
    return apiClient.post<QuantiteStock>('/stocks/mouvement', data);
  }

  async resumerProduit(produitId: number): Promise<ApiResponse<QuantiteStock[]>> {
    return apiClient.get<QuantiteStock[]>(`/stocks/resume/produit/${produitId}`);
  }

  async resumerEmplacement(emplacementId: number): Promise<ApiResponse<QuantiteStock[]>> {
    return apiClient.get<QuantiteStock[]>(`/stocks/resume/emplacement/${emplacementId}`);
  }
}

export const stockService = new StockService();
