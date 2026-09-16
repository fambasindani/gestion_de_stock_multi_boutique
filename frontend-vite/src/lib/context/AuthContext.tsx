'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import { authService } from '@/lib/api/services/auth.service';
import { LoginCredentials, Utilisateur } from '@/lib/api/types';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';

// ============================================
// TYPES
// ============================================

interface AuthContextType {
  user: Utilisateur | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (credentials: LoginCredentials) => Promise<void>;
  logout: () => void;
}

// ============================================
// CONTEXT
// ============================================

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

// ============================================
// PROVIDER
// ============================================

interface AuthProviderProps {
  children: React.ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const router = useRouter();
  const [user, setUser] = useState<Utilisateur | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // ✅ Initialisation de l'auth
  useEffect(() => {
    let isMounted = true;
    
    const initAuth = async () => {
      const token = authService.getStoredToken();
      const storedUser = authService.getStoredUser();
      
      console.log('🔍 AuthProvider - Token initial:', token ? 'Présent' : 'Absent');
      console.log('🔍 AuthProvider - User initial:', storedUser?.nom || 'null');
      
      if (!token || !storedUser) {
        if (isMounted) {
          setIsLoading(false);
        }
        return;
      }

      try {
        const currentUser = await authService.getCurrentUser();
        if (isMounted) {
          setUser(currentUser);
          console.log('✅ AuthProvider - Utilisateur récupéré:', currentUser?.nom || 'null');
        }
      } catch (error) {
        console.error('Token validation failed', error);
        if (isMounted) {
          authService.logout();
          setUser(null);
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    };

    initAuth();
    
    return () => {
      isMounted = false;
    };
  }, []);

  // ✅ Connexion
  const login = async (credentials: LoginCredentials): Promise<void> => {
    console.log('🔐 AuthProvider - login appelé');
    
    try {
      const response = await authService.login(credentials);
      console.log('✅ AuthProvider - login success:', response);
      
      setUser(response.utilisateur);
      toast.success(`Bonjour ${response.utilisateur.nom} !`);
      router.push('/dashboard');
    } catch (error) {
      console.error('❌ AuthProvider - login error:', error);
      toast.error(error instanceof Error ? error.message : 'Erreur de connexion');
    }
  };

  // ✅ Déconnexion
  const logout = (): void => {
    console.log('🔐 AuthProvider - logout appelé');
    authService.logout();
    setUser(null);
    toast.success('Déconnecté avec succès');
    router.push('/auth/login');
  };

  const isAuthenticated = !!user && authService.isAuthenticated();
  console.log('🔍 AuthProvider - isAuthenticated:', isAuthenticated);
  console.log('🔍 AuthProvider - user:', user?.nom || 'null');

  return (
    <AuthContext.Provider value={{ user, isLoading, isAuthenticated, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};