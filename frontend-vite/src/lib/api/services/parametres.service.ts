import { apiClient } from "../client";
import type { ApiResponse } from "../types";

export type ParametresMap = Record<string, string>;

export class ParametresService {
  async getAll(): Promise<ApiResponse<ParametresMap>> {
    return apiClient.get<ParametresMap>("/parametres");
  }

  async update(parametres: ParametresMap): Promise<ApiResponse<ParametresMap>> {
    return apiClient.put<ParametresMap>("/parametres", { parametres });
  }
}

export const parametresService = new ParametresService();
