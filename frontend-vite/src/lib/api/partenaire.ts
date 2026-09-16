// ============================================
// TYPES PARTENAIRES
// ============================================

export interface Partenaire {
  id: number;
  nom: string;
  code: string | null;
  est_client: boolean;
  est_fournisseur: boolean;
  email: string | null;
  telephone: string | null;
  mobile: string | null;
  adresse: string | null;
  ville: string | null;
  code_postal: string | null;
  pays: string | null;
  numero_tva: string | null;
  siret: string | null;
  site_web: string | null;
  notes: string | null;
  remise: number;
  delai_paiement: number;
  actif: number;
  created_at: string;
  updated_at: string;
}

export interface CreatePartenaireData {
  nom: string;
  code?: string | null;
  est_client: boolean;
  est_fournisseur: boolean;
  email?: string | null;
  telephone?: string | null;
  mobile?: string | null;
  adresse?: string | null;
  ville?: string | null;
  code_postal?: string | null;
  pays?: string | null;
  numero_tva?: string | null;
  siret?: string | null;
  site_web?: string | null;
  notes?: string | null;
  remise?: number;
  delai_paiement?: number;
  actif?: number;
}

export interface UpdatePartenaireData extends Partial<CreatePartenaireData> {}

export interface PartenaireFilters {
  page?: number;
  perPage?: number;
  search?: string;
  type?: 'client' | 'fournisseur' | 'all';
}