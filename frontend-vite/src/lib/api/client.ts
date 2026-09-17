import { ApiResponse } from './types';
import { Cookies } from '@/lib/utils/cookies';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api';

interface FetchOptions extends RequestInit {
  token?: string | null;
}

type RequestBody = Record<string, unknown> | null | undefined;

export class ApiClient {
  private baseUrl: string;
  private token: string | null = null;

  constructor(baseUrl: string = API_URL) {
    this.baseUrl = baseUrl;
  }

  setToken(token: string | null) {
    this.token = token;
    if (token) {
      Cookies.set('auth_token', token, 7);
    } else {
      Cookies.remove('auth_token');
    }
  }

  getToken(): string | null {
    if (this.token) return this.token;
    return Cookies.get('auth_token');
  }

  private async request<T>(
    endpoint: string,
    options: FetchOptions = {}
  ): Promise<ApiResponse<T>> {
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
    };

    const token = options.token ?? this.getToken();
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
      console.log('🔑 Token utilisé:', token.substring(0, 20) + '...');
    } else {
      console.log('⚠️ Pas de token disponible');
    }

    // Super-admin : société ciblée (null = toutes)
    if (typeof window !== 'undefined') {
      const societeId = localStorage.getItem('selected_societe');
      if (societeId) {
        headers['X-Societe-Id'] = societeId;
      }
    }

    const url = `${this.baseUrl}${endpoint}`;
    
    console.log(`📤 ${options.method || 'GET'} ${url}`);
    if (options.body) {
      console.log('📦 Body:', options.body);
    }

    const config: RequestInit = {
      ...options,
      headers: {
        ...headers,
        ...options.headers,
      },
    };

    try {
      const response = await fetch(url, config);
      const data = await response.json();

      console.log(`📥 Réponse ${response.status}:`, data);

      // ✅ Gérer 401 - Token invalide
      if (response.status === 401) {
        console.log('🔴 Token invalide ou expiré, suppression...');
        this.setToken(null);
        
        // ✅ Rediriger vers login UNIQUEMENT si on n'y est pas déjà
        if (typeof window !== 'undefined') {
          const pathname = window.location.pathname;
          if (!pathname.includes('/auth/login') && !pathname.includes('/login')) {
            console.log('🔴 Redirection vers /auth/login depuis client.ts');
            window.location.href = '/auth/login';
          }
        }
        
        return {
          success: false,
          message: data.message || 'Session expirée, veuillez vous reconnecter',
        };
      }

      // ✅ Gérer 422 - Validation
      if (response.status === 422) {
        console.log('🔴 Erreur de validation (422):', data.errors);
        return {
          success: false,
          message: data.message || 'Erreur de validation',
          errors: data.errors,
        };
      }

      // ✅ Gérer 403 - Permission
      if (response.status === 403) {
        console.log('🔴 Permission refusée (403):', data.message);
        return {
          success: false,
          message: data.message || 'Accès refusé',
          isPermissionError: true,
        };
      }

      if (!response.ok) {
        return {
          success: false,
          message: data.message || data.error || 'Une erreur est survenue',
        };
      }

      return data;
    } catch (error) {
      console.error('❌ Erreur réseau:', error);
      if (error instanceof Error) {
        return {
          success: false,
          message: error.message,
        };
      }
      return {
        success: false,
        message: 'Une erreur inconnue est survenue',
      };
    }
  }

  get<T>(endpoint: string, token?: string): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, { method: 'GET', token });
  }

  post<T>(endpoint: string, body?: unknown, token?: string): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, {
      method: 'POST',
      body: body ? JSON.stringify(body) : undefined,
      token,
    });
  }

  put<T>(endpoint: string, body?: unknown, token?: string): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, {
      method: 'PUT',
      body: body ? JSON.stringify(body) : undefined,
      token,
    });
  }

  delete<T>(endpoint: string, token?: string): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, { method: 'DELETE', token });
  }
}

export const apiClient = new ApiClient();