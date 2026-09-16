import { apiClient } from '../client';
import { ApiResponse } from '../types';
import { CommandeVente, LigneCommandeVente } from '../typess';

export class CommandesVenteService {
  async getAll(params?: { search?: string; page?: number; per_page?: number; etat?: string; partenaire_id?: number }): Promise<ApiResponse<CommandeVente[]>> {
    let url = '/commandes-vente';
    if (params) {
      const searchParams = new URLSearchParams();
      if (params.search) searchParams.append('search', params.search);
      if (params.page) searchParams.append('page', String(params.page));
      if (params.per_page) searchParams.append('per_page', String(params.per_page));
      if (params.etat) searchParams.append('etat', params.etat);
      if (params.partenaire_id) searchParams.append('partenaire_id', String(params.partenaire_id));
      const qs = searchParams.toString();
      if (qs) url += `?${qs}`;
    }
    return apiClient.get<CommandeVente[]>(url);
  }

  async getById(id: number): Promise<ApiResponse<CommandeVente>> {
    return apiClient.get<CommandeVente>(`/commandes-vente/${id}`);
  }

  async create(data: Partial<CommandeVente> & { lignes?: Partial<LigneCommandeVente>[] }): Promise<ApiResponse<CommandeVente>> {
    return apiClient.post<CommandeVente>('/commandes-vente', data);
  }

  async update(id: number, data: Partial<CommandeVente>): Promise<ApiResponse<CommandeVente>> {
    return apiClient.put<CommandeVente>(`/commandes-vente/${id}`, data);
  }

  async delete(id: number): Promise<ApiResponse<null>> {
    return apiClient.delete<null>(`/commandes-vente/${id}`);
  }

  async changerEtat(id: number, etat: string): Promise<ApiResponse<CommandeVente>> {
    return apiClient.post<CommandeVente>(`/commandes-vente/${id}/changer-etat`, { etat });
  }

  async ajouterLigne(commandeId: number, data: Partial<LigneCommandeVente>): Promise<ApiResponse<LigneCommandeVente>> {
    return apiClient.post<LigneCommandeVente>(`/commandes-vente/${commandeId}/ajouter-ligne`, data);
  }

  async supprimerLigne(commandeId: number, ligneId: number): Promise<ApiResponse<null>> {
    return apiClient.delete<null>(`/commandes-vente/${commandeId}/lignes/${ligneId}`);
  }
}

export const commandesVenteService = new CommandesVenteService();
