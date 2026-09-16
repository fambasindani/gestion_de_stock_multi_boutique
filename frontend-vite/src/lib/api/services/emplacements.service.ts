import { apiClient } from '../client';
import { ApiResponse } from '../types';
import { EmplacementStock } from '../typess';

export class EmplacementsService {
  async getAll(params?: { search?: string; page?: number; per_page?: number }): Promise<ApiResponse<EmplacementStock[]>> {
    let url = '/emplacements';
    if (params) {
      const searchParams = new URLSearchParams();
      if (params.search) searchParams.append('search', params.search);
      if (params.page) searchParams.append('page', String(params.page));
      if (params.per_page) searchParams.append('per_page', String(params.per_page));
      const qs = searchParams.toString();
      if (qs) url += `?${qs}`;
    }
    return apiClient.get<EmplacementStock[]>(url);
  }

  async getArborescence(): Promise<ApiResponse<EmplacementStock[]>> {
    return apiClient.get<EmplacementStock[]>('/emplacements/arborescence');
  }

  async getById(id: number): Promise<ApiResponse<EmplacementStock>> {
    return apiClient.get<EmplacementStock>(`/emplacements/${id}`);
  }

  async getChemin(id: number): Promise<ApiResponse<EmplacementStock[]>> {
    return apiClient.get<EmplacementStock[]>(`/emplacements/${id}/chemin`);
  }

  async create(data: Partial<EmplacementStock>): Promise<ApiResponse<EmplacementStock>> {
    return apiClient.post<EmplacementStock>('/emplacements', data);
  }

  async update(id: number, data: Partial<EmplacementStock>): Promise<ApiResponse<EmplacementStock>> {
    return apiClient.put<EmplacementStock>(`/emplacements/${id}`, data);
  }

  async delete(id: number): Promise<ApiResponse<null>> {
    return apiClient.delete<null>(`/emplacements/${id}`);
  }

  async activer(id: number): Promise<ApiResponse<EmplacementStock>> {
    return apiClient.post<EmplacementStock>(`/emplacements/${id}/activer`);
  }

  async desactiver(id: number): Promise<ApiResponse<EmplacementStock>> {
    return apiClient.post<EmplacementStock>(`/emplacements/${id}/desactiver`);
  }
}

export const emplacementsService = new EmplacementsService();
