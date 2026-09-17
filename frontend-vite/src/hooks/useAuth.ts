'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { Cookies } from '@/lib/utils/cookies';

const AUTH_TOKEN_KEY = 'auth_token';

export const AUTH_KEYS = {
  currentUser: ['currentUser'] as const,
};

function getToken(): string | null {
  if (typeof window === 'undefined') return null;
  return Cookies.get(AUTH_TOKEN_KEY);
}

export function useAuth() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const token = getToken();

  const {
    data: authData,
    isLoading: isLoadingUser,
    isError,
  } = useQuery({
    queryKey: AUTH_KEYS.currentUser,
    queryFn: async () => {
      const t = getToken();
      if (!t) return null;

      try {
        const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/auth/me`, {
          headers: {
            'Authorization': `Bearer ${t}`,
            'Content-Type': 'application/json',
            'Accept': 'application/json',
          },
        });

        let data: any;
        try {
          data = await response.json();
        } catch {
          Cookies.remove(AUTH_TOKEN_KEY);
          return null;
        }

        if (response.ok && data.utilisateur) {
          return data;
        }

        if (response.status === 401) {
          Cookies.remove(AUTH_TOKEN_KEY);
        }

        return null;
      } catch {
        return null;
      }
    },
    staleTime: 5 * 60 * 1000,
    retry: false,
    enabled: !!token,
  });

  const loginMutation = useMutation({
    mutationFn: async (credentials: { email: string; mot_de_passe: string }) => {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        body: JSON.stringify(credentials),
      });

      let data: any;
      try {
        data = await response.json();
      } catch {
        throw new Error(`Erreur de connexion au serveur (HTTP ${response.status})`);
      }

      if (!response.ok) {
        throw new Error(data.message || data.error || 'Identifiants incorrects');
      }

      return data;
    },
    onSuccess: (data) => {
      if (data.access_token && data.utilisateur) {
        // Vider le cache : évite de réutiliser les données d'un autre compte
        // (rôles, permissions, listes) quand on change d'utilisateur.
        queryClient.clear();
        Cookies.set(AUTH_TOKEN_KEY, data.access_token, 7);
        queryClient.setQueryData(AUTH_KEYS.currentUser, data);
        router.replace('/dashboard');
      }
    },
  });

  const logoutMutation = useMutation({
    mutationFn: async () => {
      const t = getToken();
      if (t) {
        try {
          await fetch(`${process.env.NEXT_PUBLIC_API_URL}/auth/logout`, {
            method: 'POST',
            headers: {
              'Authorization': `Bearer ${t}`,
              'Accept': 'application/json',
            },
          });
        } catch {}
      }
    },
    onSuccess: () => {
      Cookies.remove(AUTH_TOKEN_KEY);
      // Vider le cache pour ne rien laisser à l'utilisateur suivant.
      queryClient.clear();
      queryClient.setQueryData(AUTH_KEYS.currentUser, null);
      router.replace('/auth/login');
    },
  });

  const currentUser = authData?.utilisateur ?? null;
  const permissions: string[] = authData?.permissions ?? [];
  const isSuperAdmin = !!authData?.est_super_admin;
  const societe = authData?.societe ?? null;
  const isAuthenticated = !!currentUser;

  return {
    currentUser,
    permissions,
    isSuperAdmin,
    societe,
    isLoadingUser,
    isAuthenticated,
    isError,
    login: loginMutation.mutate,
    loginAsync: loginMutation.mutateAsync,
    logout: logoutMutation.mutate,
    logoutAsync: logoutMutation.mutateAsync,
    isLoggingIn: loginMutation.isPending,
    isLoggingOut: logoutMutation.isPending,
    loginError: loginMutation.error,
    logoutError: logoutMutation.error,
  };
}
