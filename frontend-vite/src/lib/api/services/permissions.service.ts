import { apiClient } from '../client';
import { ApiResponse } from '../types';
import { Permission } from '../typess';
import { CreatePermissionData, UpdatePermissionData } from '../typess';

export interface PermissionsQuery {
  page?: number;
  per_page?: number;
  search?: string;
  garde?: string;
}

export class PermissionsService {
  async getAll(params: PermissionsQuery = {}): Promise<ApiResponse<Permission[]>> {
    const query = new URLSearchParams();
    if (params.page) query.append('page', String(params.page));
    if (params.per_page) query.append('per_page', String(params.per_page));
    if (params.search) query.append('search', params.search);
    if (params.garde) query.append('garde', params.garde);
    const qs = query.toString();
    return apiClient.get<Permission[]>(`/permissions${qs ? `?${qs}` : ''}`);
  }

  async getById(id: number): Promise<ApiResponse<Permission>> {
    return apiClient.get<Permission>(`/permissions/${id}`);
  }

  async create(data: CreatePermissionData): Promise<ApiResponse<Permission>> {
    return apiClient.post<Permission>('/permissions', data);
  }

  async update(id: number, data: UpdatePermissionData): Promise<ApiResponse<Permission>> {
    return apiClient.put<Permission>(`/permissions/${id}`, data);
  }

  async delete(id: number): Promise<ApiResponse<null>> {
    return apiClient.delete<null>(`/permissions/${id}`);
  }
}

export const permissionsService = new PermissionsService();
