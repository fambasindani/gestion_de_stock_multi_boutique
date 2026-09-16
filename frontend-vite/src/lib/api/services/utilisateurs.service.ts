import { apiClient } from '../client';
import { ApiResponse } from '../types';
import { Utilisateur } from '../typess';
import { CreateUtilisateurData, UpdateUtilisateurData } from '../typess';

export interface UtilisateurPermission {
  nom: string;
  garde: string | null;
}

export interface UtilisateurStatistiques {
  nombre_ventes: number;
  total_ht: number;
  total_ttc: number;
}

export interface UtilisateurActivite {
  id: number;
  action: string;
  description: string | null;
  created_at: string;
}

export interface UtilisateurDetailsResponse {
  success: boolean;
  data: Utilisateur;
  permissions: UtilisateurPermission[];
  statistiques: UtilisateurStatistiques;
  activite_recente: UtilisateurActivite[];
  message?: string;
}

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

  async getDetails(id: number): Promise<UtilisateurDetailsResponse> {
    return apiClient.get<Utilisateur>(`/utilisateurs/${id}`) as unknown as Promise<UtilisateurDetailsResponse>;
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
