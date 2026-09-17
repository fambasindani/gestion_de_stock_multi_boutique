import { apiClient } from "../client";
import type { ApiResponse } from "../types";
import { Cookies } from "@/lib/utils/cookies";

const API_URL =
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api";

export interface Societe {
  id: number;
  nom: string;
  code: string;
  logo: string | null;
  email: string | null;
  telephone: string | null;
  adresse: string | null;
  actif: boolean;
  date_abonnement: string | null;
  date_expiration: string | null;
  notes: string | null;
  utilisateurs_count?: number;
  created_at: string;
  updated_at: string;
}

export interface CreateSocieteData {
  nom: string;
  code?: string;
  logo?: string;
  email?: string;
  telephone?: string;
  adresse?: string;
  date_abonnement?: string;
  date_expiration?: string;
  notes?: string;
  admin_nom?: string;
  admin_email?: string;
  admin_mot_de_passe?: string;
}

export class SocietesService {
  async getAll(params?: {
    page?: number;
    per_page?: number;
    search?: string;
  }): Promise<
    ApiResponse<{
      data: Societe[];
      current_page: number;
      last_page: number;
      total: number;
      per_page: number;
    }>
  > {
    let url = "/societes";
    if (params) {
      const sp = new URLSearchParams();
      if (params.page) sp.append("page", String(params.page));
      if (params.per_page) sp.append("per_page", String(params.per_page));
      if (params.search) sp.append("search", params.search);
      const qs = sp.toString();
      if (qs) url += `?${qs}`;
    }
    return apiClient.get(url);
  }

  async getById(id: number): Promise<ApiResponse<Societe>> {
    return apiClient.get(`/societes/${id}`);
  }

  async create(data: CreateSocieteData): Promise<ApiResponse<Societe>> {
    return apiClient.post("/societes", data);
  }

  async update(id: number, data: Partial<CreateSocieteData>): Promise<ApiResponse<Societe>> {
    return apiClient.put(`/societes/${id}`, data);
  }

  async delete(id: number): Promise<ApiResponse<null>> {
    return apiClient.delete(`/societes/${id}`);
  }

  async uploadLogo(id: number, file: File): Promise<ApiResponse<Societe>> {
    const token = Cookies.get("auth_token");
    const form = new FormData();
    form.append("logo", file);
    const res = await fetch(`${API_URL}/societes/${id}/logo`, {
      method: "POST",
      headers: {
        Accept: "application/json",
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
      body: form,
    });
    return res.json();
  }

  async uploadMonLogo(file: File): Promise<ApiResponse<Societe>> {
    const token = Cookies.get("auth_token");
    const societeId =
      typeof window !== "undefined" ? localStorage.getItem("selected_societe") : null;
    const form = new FormData();
    form.append("logo", file);
    const res = await fetch(`${API_URL}/societe/logo`, {
      method: "POST",
      headers: {
        Accept: "application/json",
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
        ...(societeId ? { "X-Societe-Id": societeId } : {}),
      },
      body: form,
    });
    return res.json();
  }

  async supprimerMonLogo(): Promise<ApiResponse<Societe>> {
    return apiClient.delete("/societe/logo");
  }

  async activer(id: number): Promise<ApiResponse<Societe>> {
    return apiClient.post(`/societes/${id}/activer`);
  }

  async desactiver(id: number): Promise<ApiResponse<Societe>> {
    return apiClient.post(`/societes/${id}/desactiver`);
  }
}

export const societesService = new SocietesService();
