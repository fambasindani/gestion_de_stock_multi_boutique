import { apiClient } from "../client";
import type { ApiResponse } from "../types";

export interface ProfilSociete {
  id: number;
  nom: string;
  code: string;
  logo?: string | null;
}

export interface ProfilUtilisateur {
  id: number;
  nom: string;
  email: string;
  telephone: string | null;
  actif: boolean | number;
  est_super_admin: boolean;
  societe_id: number | null;
  derniere_connexion: string | null;
  created_at?: string;
}

export interface ProfilData {
  utilisateur: ProfilUtilisateur;
  societe: ProfilSociete | null;
  roles: string[];
  permissions: string[];
}

export class ProfilService {
  async get(): Promise<ApiResponse<ProfilData>> {
    return apiClient.get<ProfilData>("/profil");
  }

  async update(data: {
    nom: string;
    email: string;
    telephone?: string | null;
  }): Promise<ApiResponse<ProfilUtilisateur>> {
    return apiClient.put<ProfilUtilisateur>("/profil", data);
  }

  async updatePassword(data: {
    mot_de_passe_actuel: string;
    mot_de_passe: string;
    mot_de_passe_confirmation: string;
  }): Promise<ApiResponse<null>> {
    return apiClient.put<null>("/profil/password", data);
  }
}

export const profilService = new ProfilService();
