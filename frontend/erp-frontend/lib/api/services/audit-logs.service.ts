import { apiClient } from '../client';
import { ApiResponse } from '../types';

export interface AuditLog {
  id: number;
  user_id: number | null;
  action: string;
  entity_type: string | null;
  entity_id: number | null;
  description: string | null;
  old_values: Record<string, unknown> | null;
  new_values: Record<string, unknown> | null;
  ip_address: string | null;
  user_agent: string | null;
  created_at: string;
  updated_at: string;
  user?: { id: number; nom: string; email: string } | null;
}

export class AuditLogsService {
  async getAll(params?: { search?: string; page?: number; per_page?: number; action?: string; entity_type?: string; user_id?: number; date_debut?: string; date_fin?: string }): Promise<ApiResponse<AuditLog[]>> {
    let url = '/audit-logs';
    if (params) {
      const searchParams = new URLSearchParams();
      if (params.search) searchParams.append('search', params.search);
      if (params.page) searchParams.append('page', String(params.page));
      if (params.per_page) searchParams.append('per_page', String(params.per_page));
      if (params.action) searchParams.append('action', params.action);
      if (params.entity_type) searchParams.append('entity_type', params.entity_type);
      if (params.user_id) searchParams.append('user_id', String(params.user_id));
      if (params.date_debut) searchParams.append('date_debut', params.date_debut);
      if (params.date_fin) searchParams.append('date_fin', params.date_fin);
      const qs = searchParams.toString();
      if (qs) url += `?${qs}`;
    }
    return apiClient.get<AuditLog[]>(url);
  }

  async getById(id: number): Promise<ApiResponse<AuditLog>> {
    return apiClient.get<AuditLog>(`/audit-logs/${id}`);
  }
}

export const auditLogsService = new AuditLogsService();
