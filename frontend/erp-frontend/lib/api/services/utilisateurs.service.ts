import { apiClient } from '../client';
import { ApiResponse } from '../types';
import { Utilisateur } from '../typess';
import { CreateUtilisateurData, UpdateUtilisateurData } from '../typess';

export class UtilisateursService {
  async getAll(params?: { search?: string; page?: number; per_page?: number }): Promise<ApiResponse<Utilisateur[]>> {
    let url = '/utilisateurs';
    if (params) {
      const searchParams = new URLSearchParams();
      if (params.search) searchParams.append('search', params.search);
      if (params.page) searchParams.append('page', String(params.page));
      if (params.per_page) searchParams.append('per_page', String(params.per_page));
      const qs = searchParams.toString();
      if (qs) url += `?${qs}`;
    }
    return apiClient.get<Utilisateur[]>(url);
  }

  async getById(id: number): Promise<ApiResponse<Utilisateur>> {
    return apiClient.get<Utilisateur>(`/utilisateurs/${id}`);
  }

  async create(data: CreateUtilisateurData): Promise<ApiResponse<Utilisateur>> {
    return apiClient.post<Utilisateur>('/utilisateurs', data);
  }

  async update(id: number, data: UpdateUtilisateurData): Promise<ApiResponse<Utilisateur>> {
    return apiClient.put<Utilisateur>(`/utilisateurs/${id}`, data);
  }

  async delete(id: number): Promise<ApiResponse<null>> {
    return apiClient.delete<null>(`/utilisateurs/${id}`);
  }

  async assignerRoles(id: number, roleIds: number[]): Promise<ApiResponse<Utilisateur>> {
    return apiClient.post<Utilisateur>(`/utilisateurs/${id}/assign-roles`, { roles: roleIds });
  }
}

export const utilisateursService = new UtilisateursService();
