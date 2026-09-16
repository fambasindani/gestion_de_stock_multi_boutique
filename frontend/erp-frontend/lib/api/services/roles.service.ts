import { apiClient } from '../client';
import { ApiResponse } from '../types';
import { Role, Permission } from '../typess';
import { CreateRoleData, UpdateRoleData } from '../typess';

export class RolesService {
  async getAll(): Promise<ApiResponse<Role[]>> {
    return apiClient.get<Role[]>('/roles');
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
