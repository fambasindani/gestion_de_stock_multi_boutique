import { apiClient } from "../client";
import type { ApiResponse } from "../types";

export interface AppNotification {
  type: string;
  level: "danger" | "warning" | "info" | string;
  title: string;
  message: string;
  link: string;
}

export class NotificationsService {
  async getAll(): Promise<ApiResponse<AppNotification[]>> {
    return apiClient.get<AppNotification[]>("/notifications");
  }
}

export const notificationsService = new NotificationsService();
