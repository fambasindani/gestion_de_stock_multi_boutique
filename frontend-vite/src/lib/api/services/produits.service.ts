import { apiClient } from '../client';
import { ApiResponse } from '../types';
import { ProduitModele, VarianteProduit } from '../typess';

export class ProduitsService {
  async getAll(params?: { search?: string; page?: number; per_page?: number; categorie_id?: number; actif?: boolean }): Promise<ApiResponse<ProduitModele[]>> {
    let url = '/produits';
    if (params) {
      const searchParams = new URLSearchParams();
      if (params.search) searchParams.append('search', params.search);
      if (params.page) searchParams.append('page', String(params.page));
      if (params.per_page) searchParams.append('per_page', String(params.per_page));
      if (params.categorie_id) searchParams.append('categorie_id', String(params.categorie_id));
      if (params.actif !== undefined) searchParams.append('actif', params.actif ? '1' : '0');
      const qs = searchParams.toString();
      if (qs) url += `?${qs}`;
    }
    return apiClient.get<ProduitModele[]>(url);
  }

  async getById(id: number): Promise<ApiResponse<ProduitModele>> {
    return apiClient.get<ProduitModele>(`/produits/${id}`);
  }

  async create(data: Partial<ProduitModele> & { variantes?: Partial<VarianteProduit>[] }): Promise<ApiResponse<ProduitModele>> {
    return apiClient.post<ProduitModele>('/produits', data);
  }

  async update(id: number, data: Partial<ProduitModele>): Promise<ApiResponse<ProduitModele>> {
    return apiClient.put<ProduitModele>(`/produits/${id}`, data);
  }

  async delete(id: number): Promise<ApiResponse<null>> {
    return apiClient.delete<null>(`/produits/${id}`);
  }

  async activer(id: number): Promise<ApiResponse<ProduitModele>> {
    return apiClient.post<ProduitModele>(`/produits/${id}/activer`);
  }

  async desactiver(id: number): Promise<ApiResponse<ProduitModele>> {
    return apiClient.post<ProduitModele>(`/produits/${id}/desactiver`);
  }

  async supprimerVariante(id: number): Promise<ApiResponse<null>> {
    return apiClient.delete<null>(`/variantes/${id}`);
  }
}

export const produitsService = new ProduitsService();
