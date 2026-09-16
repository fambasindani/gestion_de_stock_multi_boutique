import { apiClient } from '../client';
import { ApiResponse } from '../types';
import { CommandeAchat, LigneCommandeAchat } from '../typess';

export class CommandesAchatService {
  async getAll(params?: { search?: string; page?: number; per_page?: number; etat?: string; partenaire_id?: number }): Promise<ApiResponse<CommandeAchat[]>> {
    let url = '/commandes-achat';
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
    return apiClient.get<CommandeAchat[]>(url);
  }

  async getById(id: number): Promise<ApiResponse<CommandeAchat>> {
    return apiClient.get<CommandeAchat>(`/commandes-achat/${id}`);
  }

  async create(data: Partial<CommandeAchat> & { lignes?: Partial<LigneCommandeAchat>[] }): Promise<ApiResponse<CommandeAchat>> {
    return apiClient.post<CommandeAchat>('/commandes-achat', data);
  }

  async update(id: number, data: Partial<CommandeAchat>): Promise<ApiResponse<CommandeAchat>> {
    return apiClient.put<CommandeAchat>(`/commandes-achat/${id}`, data);
  }

  async delete(id: number): Promise<ApiResponse<null>> {
    return apiClient.delete<null>(`/commandes-achat/${id}`);
  }

  async changerEtat(id: number, etat: string): Promise<ApiResponse<CommandeAchat>> {
    return apiClient.post<CommandeAchat>(`/commandes-achat/${id}/changer-etat`, { etat });
  }

  async ajouterLigne(commandeId: number, data: Partial<LigneCommandeAchat>): Promise<ApiResponse<LigneCommandeAchat>> {
    return apiClient.post<LigneCommandeAchat>(`/commandes-achat/${commandeId}/ajouter-ligne`, data);
  }

  async supprimerLigne(commandeId: number, ligneId: number): Promise<ApiResponse<null>> {
    return apiClient.delete<null>(`/commandes-achat/${commandeId}/lignes/${ligneId}`);
  }

  async receptionner(id: number, data?: Record<string, unknown>): Promise<ApiResponse<CommandeAchat>> {
    return apiClient.post<CommandeAchat>(`/commandes-achat/${id}/receptionner`, data);
  }
}

export const commandesAchatService = new CommandesAchatService();
