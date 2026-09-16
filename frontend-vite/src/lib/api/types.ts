// ============================================
// TYPES DE BASE
// ============================================

export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
  errors?: Record<string, string[]>;
  isPermissionError?: boolean;
  pagination?: {
    current_page: number;
    per_page: number;
    total: number;
    last_page: number;
  };
  total?: number;
}

// ============================================
// TYPES AUTH
// ============================================

// ✅ Ajouter l'index signature pour satisfaire RequestBody
export interface LoginCredentials {
  email: string;
  mot_de_passe: string;
  [key: string]: unknown;  // ← Ajouter cette ligne pour l'index signature
}

export interface LoginResponse {
  access_token: string;
  token_type: string;
  utilisateur: Utilisateur;
  roles: string[];
  permissions: string[];
}

export interface Utilisateur {
  id: number;
  nom: string;
  email: string;
  telephone: string | null;
  actif: number;
  derniere_connexion: string | null;
  societe_id: number | null;
  created_at: string;
  updated_at: string;
  roles?: Role[];
}


export interface PaginatedResponse<T = unknown> {
  current_page: number;
  data: T[];
  first_page_url: string;
  from: number;
  last_page: number;
  last_page_url: string;
  links: PaginationLink[];
  next_page_url: string | null;
  path: string;
  per_page: number;
  prev_page_url: string | null;
  to: number;
  total: number;
}

export interface PaginationLink {
  url: string | null;
  label: string;
  active: boolean;
}



export interface Role {
  id: number;
  nom: string;
  description: string | null;
  societe_id: number | null;
  actif: number;
  created_at: string;
  updated_at: string;
  pivot?: RolePivot;
}

export interface RolePivot {
  utilisateur_id: number;
  role_id: number;
  created_at: string;
  updated_at: string;
}

export interface Permission {
  id: number;
  nom: string;
  garde: string | null;
  description: string | null;
  created_at: string;
  updated_at: string;
}