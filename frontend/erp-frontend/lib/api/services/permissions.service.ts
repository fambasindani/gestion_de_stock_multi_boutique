import { apiClient } from '../client';
import { ApiResponse } from '../types';
import { Permission } from '../typess';
import { CreatePermissionData, UpdatePermissionData } from '../typess';

export class PermissionsService {
  async getAll(): Promise<ApiResponse<Permission[]>> {
    return apiClient.get<Permission[]>('/permissions');
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
