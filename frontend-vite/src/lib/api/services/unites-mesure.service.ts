import { apiClient } from '../client';
import { ApiResponse } from '../types';
import { UniteMesure } from '../typess';

export class UnitesMesureService {
  async getAll(params?: { search?: string; page?: number; per_page?: number }): Promise<ApiResponse<UniteMesure[]>> {
    let url = '/unites-mesure';
    if (params) {
      const searchParams = new URLSearchParams();
      if (params.search) searchParams.append('search', params.search);
      if (params.page) searchParams.append('page', String(params.page));
      if (params.per_page) searchParams.append('per_page', String(params.per_page));
      const qs = searchParams.toString();
      if (qs) url += `?${qs}`;
    }
    return apiClient.get<UniteMesure[]>(url);
  }

  async getActives(): Promise<ApiResponse<UniteMesure[]>> {
    return apiClient.get<UniteMesure[]>('/unites-mesure/actives');
  }

  async getById(id: number): Promise<ApiResponse<UniteMesure>> {
    return apiClient.get<UniteMesure>(`/unites-mesure/${id}`);
  }

  async create(data: Partial<UniteMesure>): Promise<ApiResponse<UniteMesure>> {
    return apiClient.post<UniteMesure>('/unites-mesure', data);
  }

  async update(id: number, data: Partial<UniteMesure>): Promise<ApiResponse<UniteMesure>> {
    return apiClient.put<UniteMesure>(`/unites-mesure/${id}`, data);
  }

  async delete(id: number): Promise<ApiResponse<null>> {
    return apiClient.delete<null>(`/unites-mesure/${id}`);
  }

  async activer(id: number): Promise<ApiResponse<UniteMesure>> {
    return apiClient.post<UniteMesure>(`/unites-mesure/${id}/activer`);
  }

  async desactiver(id: number): Promise<ApiResponse<UniteMesure>> {
    return apiClient.post<UniteMesure>(`/unites-mesure/${id}/desactiver`);
  }
}

export const unitesMesureService = new UnitesMesureService();
