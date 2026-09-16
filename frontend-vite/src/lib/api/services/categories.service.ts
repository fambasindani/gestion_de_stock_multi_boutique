import { apiClient } from '../client';
import { ApiResponse } from '../types';
import { CategorieProduit } from '../typess';

export class CategoriesService {
  async getAll(params?: { search?: string; page?: number; per_page?: number }): Promise<ApiResponse<CategorieProduit[]>> {
    let url = '/categories';
    if (params) {
      const searchParams = new URLSearchParams();
      if (params.search) searchParams.append('search', params.search);
      if (params.page) searchParams.append('page', String(params.page));
      if (params.per_page) searchParams.append('per_page', String(params.per_page));
      const qs = searchParams.toString();
      if (qs) url += `?${qs}`;
    }
    return apiClient.get<CategorieProduit[]>(url);
  }

  async getArborescence(): Promise<ApiResponse<CategorieProduit[]>> {
    return apiClient.get<CategorieProduit[]>('/categories/arborescence');
  }

  async getById(id: number): Promise<ApiResponse<CategorieProduit>> {
    return apiClient.get<CategorieProduit>(`/categories/${id}`);
  }

  async create(data: Partial<CategorieProduit>): Promise<ApiResponse<CategorieProduit>> {
    return apiClient.post<CategorieProduit>('/categories', data);
  }

  async update(id: number, data: Partial<CategorieProduit>): Promise<ApiResponse<CategorieProduit>> {
    return apiClient.put<CategorieProduit>(`/categories/${id}`, data);
  }

  async delete(id: number): Promise<ApiResponse<null>> {
    return apiClient.delete<null>(`/categories/${id}`);
  }
}

export const categoriesService = new CategoriesService();
