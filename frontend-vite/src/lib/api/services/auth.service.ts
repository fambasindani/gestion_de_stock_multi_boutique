import { apiClient } from '../client';
import {
  LoginCredentials,
  LoginResponse,
  Utilisateur,
  ApiResponse,
} from '../types';
import { Cookies } from '@/lib/utils/cookies';

// ✅ Clés de stockage
const STORAGE_KEYS = {
  TOKEN: 'auth_token',
  USER: 'auth_user',
};

export class AuthService {
  private token: string | null = null;
  private user: Utilisateur | null = null;

  /**
   * Récupérer le token stocké
   */
  getStoredToken(): string | null {
    if (this.token) return this.token;
    return Cookies.get(STORAGE_KEYS.TOKEN) || null;
  }

  /**
   * Récupérer l'utilisateur stocké
   */
  getStoredUser(): Utilisateur | null {
    if (this.user) return this.user;
    const userStr = Cookies.get(STORAGE_KEYS.USER);
    if (userStr) {
      try {
        return JSON.parse(userStr);
      } catch {
        return null;
      }
    }
    return null;
  }

  /**
   * Définir les données d'authentification
   */
  setAuthData(response: LoginResponse): void {
    this.token = response.access_token;
    this.user = response.utilisateur;
    
    Cookies.set(STORAGE_KEYS.TOKEN, response.access_token, 7);
    Cookies.set(STORAGE_KEYS.USER, JSON.stringify(response.utilisateur), 7);
    
    apiClient.setToken(response.access_token);
  }

  /**
   * Connexion de l'utilisateur
   */
  async login(credentials: LoginCredentials): Promise<LoginResponse> {
    console.log('🔐 AuthService.login - credentials:', { email: credentials.email });
    
    const response = await apiClient.post<LoginResponse>(
      '/auth/login',
      credentials as Record<string, unknown>
    );
    
    console.log('📡 AuthService.login - response:', response);
    
    if (!response.success || !response.data) {
      throw new Error(response.message || 'Erreur de connexion');
    }
    
    // ✅ Stocker les données
    this.setAuthData(response.data);
    
    return response.data;
  }

  /**
   * Déconnexion de l'utilisateur
   */
  logout(): void {
    this.token = null;
    this.user = null;
    Cookies.remove(STORAGE_KEYS.TOKEN);
    Cookies.remove(STORAGE_KEYS.USER);
    apiClient.setToken(null);
  }

  /**
   * Récupérer l'utilisateur courant depuis l'API
   */
  async getCurrentUser(): Promise<Utilisateur | null> {
    const token = this.getStoredToken();
    console.log('🔍 AuthService.getCurrentUser - Token:', token ? 'Présent' : 'Absent');
    
    if (!token) {
      console.log('🔍 AuthService.getCurrentUser - Pas de token, retour null');
      return null;
    }
    
    try {
      const response = await apiClient.get<{ utilisateur: Utilisateur }>('/auth/me');
      console.log('📡 getCurrentUser - response:', response);
      
      if (response.success && response.data?.utilisateur) {
        // ✅ Mettre à jour l'utilisateur stocké
        this.user = response.data.utilisateur;
        Cookies.set(STORAGE_KEYS.USER, JSON.stringify(response.data.utilisateur), 7);
        return response.data.utilisateur;
      }
    } catch (error) {
      console.error('❌ getCurrentUser - Erreur:', error);
      this.logout();
    }
    
    return null;
  }

  /**
   * Vérifier si l'utilisateur est authentifié
   */
  isAuthenticated(): boolean {
    const token = this.getStoredToken();
    return !!token;
  }

  /**
   * Demande l'envoi d'un lien de réinitialisation du mot de passe par email.
   */
  async forgotPassword(email: string) {
    return apiClient.post('/auth/forgot-password', { email });
  }

  /**
   * Réinitialise le mot de passe à partir du token reçu par email.
   */
  async resetPassword(payload: {
    email: string;
    token: string;
    mot_de_passe: string;
    mot_de_passe_confirmation: string;
  }) {
    return apiClient.post('/auth/reset-password', payload);
  }
}

export const authService = new AuthService();