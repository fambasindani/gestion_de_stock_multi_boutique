import { apiClient } from '../client';
import { ApiResponse } from '../types';
import { Role, Permission } from '../typess';
import { CreateRoleData, UpdateRoleData } from '../typess';

export interface RolesQuery {
  page?: number;
  per_page?: number;
  search?: string;
  assignables?: boolean;
}

export class RolesService {
  async getAll(params: RolesQuery = {}): Promise<ApiResponse<Role[]>> {
    const query = new URLSearchParams();
    if (params.page) query.append('page', String(params.page));
    if (params.per_page) query.append('per_page', String(params.per_page));
    if (params.search) query.append('search', params.search);
    if (params.assignables) query.append('assignables', '1');
    const qs = query.toString();
    return apiClient.get<Role[]>(`/roles${qs ? `?${qs}` : ''}`);
  }

  async getById(id: number): Promise<ApiResponse<Role>> {
    return apiClient.get<Role>(`/roles/${id}`);
  }

  async create(data: CreateRoleData): Promise<ApiResponse<Role>> {
    return apiClient.post<Role>('/roles', data);
  }

  async update(id: number, data: UpdateRoleData): Promise<ApiResponse<Role>> {
    return apiClient.put<Role>(`/roles/${id}`, data);
  }

  async delete(id: number): Promise<ApiResponse<null>> {
    return apiClient.delete<null>(`/roles/${id}`);
  }
}

export const rolesService = new RolesService();
