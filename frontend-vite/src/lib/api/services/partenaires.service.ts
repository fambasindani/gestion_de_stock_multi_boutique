import { apiClient } from '../client';
import { CreatePartenaireData, Partenaire, PartenaireFilters, UpdatePartenaireData } from '../partenaire';
import { ApiResponse, PaginatedResponse } from '../types';

export class PartenairesService {
  /**
   * Récupérer la liste des partenaires
   */
  async getAll(filters: PartenaireFilters = {}): Promise<PaginatedResponse<Partenaire>> {
    const params = new URLSearchParams();
    if (filters.page) params.append('page', String(filters.page));
    if (filters.perPage) params.append('per_page', String(filters.perPage));
    if (filters.search) params.append('search', filters.search);
    if (filters.type && filters.type !== 'all') params.append('type', filters.type);

    const url = `/partenaires${params.toString() ? `?${params.toString()}` : ''}`;
    const response = await apiClient.get<PaginatedResponse<Partenaire>>(url);
    return response.data as PaginatedResponse<Partenaire>;
  }

  /**
   * Récupérer un partenaire par son ID
   */
  async getById(id: number): Promise<ApiResponse<Partenaire>> {
    return apiClient.get<Partenaire>(`/partenaires/${id}`);
  }

  /**
   * Créer un nouveau partenaire
   */
  async create(data: CreatePartenaireData): Promise<ApiResponse<Partenaire>> {
    return apiClient.post<Partenaire>('/partenaires', data);
  }

  /**
   * Mettre à jour un partenaire
   */
  async update(id: number, data: UpdatePartenaireData): Promise<ApiResponse<Partenaire>> {
    return apiClient.put<Partenaire>(`/partenaires/${id}`, data);
  }

  /**
   * Supprimer un partenaire
   */
  async delete(id: number): Promise<ApiResponse<null>> {
    return apiClient.delete<null>(`/partenaires/${id}`);
  }

  /**
   * ✅ Activer un partenaire
   */
  async activer(id: number): Promise<ApiResponse<Partenaire>> {
    return apiClient.post<Partenaire>(`/partenaires/${id}/activer`);
  }

  /**
   * ✅ Désactiver un partenaire
   */
  async desactiver(id: number): Promise<ApiResponse<Partenaire>> {
    return apiClient.post<Partenaire>(`/partenaires/${id}/desactiver`);
  }

  /**
   * Récupérer les clients
   */
  async getClients(filters: Omit<PartenaireFilters, 'type'> = {}): Promise<PaginatedResponse<Partenaire>> {
    return this.getAll({ ...filters, type: 'client' });
  }

  /**
   * Récupérer les fournisseurs
   */
  async getFournisseurs(filters: Omit<PartenaireFilters, 'type'> = {}): Promise<PaginatedResponse<Partenaire>> {
    return this.getAll({ ...filters, type: 'fournisseur' });
  }
}

export const partenairesService = new PartenairesService();