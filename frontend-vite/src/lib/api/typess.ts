// ============================================
// TYPES DE BASE
// ============================================

export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
  errors?: Record<string, string[]>;
  pagination?: {
    current_page: number;
    per_page: number;
    total: number;
    last_page: number;
  };
  total?: number;
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

// ============================================
// TYPES AUTH
// ============================================

export interface LoginCredentials {
  email: string;
  mot_de_passe: string;
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

// ============================================
// TYPES UTILISATEURS
// ============================================

export interface CreateUtilisateurData {
  nom: string;
  email: string;
  mot_de_passe: string;
  telephone?: string | null;
  actif?: boolean;
  societe_id?: number | null;
  roles?: number[];
}

export interface UpdateUtilisateurData {
  nom?: string;
  email?: string;
  mot_de_passe?: string | null;
  telephone?: string | null;
  actif?: boolean;
  societe_id?: number | null;
  roles?: number[];
}

// ============================================
// TYPES RÔLES
// ============================================

export interface CreateRoleData {
  nom: string;
  description?: string | null;
  actif?: boolean;
  permissions?: number[];
}

export interface UpdateRoleData {
  nom?: string;
  description?: string | null;
  actif?: boolean;
  permissions?: number[];
}

// ============================================
// TYPES PERMISSIONS
// ============================================

export interface CreatePermissionData {
  nom: string;
  garde?: string | null;
  description?: string | null;
}

export interface UpdatePermissionData {
  nom?: string;
  garde?: string | null;
  description?: string | null;
}

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

// ============================================
// TYPES PRODUITS
// ============================================

export interface ProduitModele {
  id: number;
  nom: string;
  description: string | null;
  type: 'consommable' | 'service' | 'stockable';
  categorie_id: number | null;
  unite_id: number | null;
  actif: number;
  created_at: string;
  updated_at: string;
  categorie?: CategorieProduit;
  unite?: UniteMesure;
  variantes?: VarianteProduit[];
}

export interface VarianteProduit {
  id: number;
  modele_produit_id: number;
  code_interne: string | null;
  nom: string | null;
  prix_achat: number;
  prix_vente: number;
  poids: number | null;
  reference_fournisseur: string | null;
  actif: number;
  created_at: string;
  updated_at: string;
  modele?: ProduitModele;
}

export interface CategorieProduit {
  id: number;
  nom: string;
  description: string | null;
  parent_id: number | null;
  actif: number;
  created_at: string;
  updated_at: string;
  parent?: CategorieProduit;
  enfants?: CategorieProduit[];
}

export interface UniteMesure {
  id: number;
  nom: string;
  symbole: string;
  description: string | null;
  actif: number;
  created_at: string;
  updated_at: string;
}

// ============================================
// TYPES STOCK
// ============================================

export interface EmplacementStock {
  id: number;
  nom: string;
  code: string | null;
  description: string | null;
  emplacement_parent_id: number | null;
  usage: 'fournisseur' | 'client' | 'interne' | 'inventaire' | 'approvisionnement' | 'production' | 'transit' | 'vue';
  type: 'normal' | 'reserve' | 'qualite' | 'quarantine';
  est_entrepot: boolean;
  est_zone: boolean;
  est_rayon: boolean;
  est_casier: boolean;
  code_barres: string | null;
  capacite_maximale: number | null;
  unite_capacite: string | null;
  societe_id: number | null;
  actif: number;
  created_at: string;
  updated_at: string;
  parent?: EmplacementStock;
  enfants?: EmplacementStock[];
}

export interface LotTracabilite {
  id: number;
  nom: string;
  code: string | null;
  produit_id: number;
  type: 'lot' | 'serie';
  date_production: string | null;
  date_peremption: string | null;
  date_reception: string | null;
  fournisseur: string | null;
  reference_fournisseur: string | null;
  quantite_initiale: number;
  quantite_actuelle: number;
  quantite_reservee: number;
  unite: string | null;
  statut: 'actif' | 'epuise' | 'perime' | 'bloque';
  notes: string | null;
  societe_id: number | null;
  actif: number;
  created_at: string;
  updated_at: string;
  produit?: VarianteProduit;
}

export interface QuantiteStock {
  id: number;
  produit_id: number;
  emplacement_id: number;
  lot_id: number | null;
  quantite_disponible: number;
  quantite_reservee: number;
  quantite_commande: number;
  quantite_controlee: number;
  seuil_minimum: number | null;
  seuil_maximum: number | null;
  societe_id: number | null;
  date_dernier_mouvement: string | null;
  date_prochaine_reception: string | null;
  notes: string | null;
  created_at: string;
  updated_at: string;
  produit?: VarianteProduit;
  emplacement?: EmplacementStock;
  lot?: LotTracabilite;
}

// ============================================
// TYPES TRANSFERTS
// ============================================

export interface TransfertStock {
  id: number;
  reference: string;
  origine: string | null;
  commande_vente_id: number | null;
  commande_achat_id: number | null;
  emplacement_source_id: number;
  emplacement_destination_id: number;
  type: 'reception' | 'livraison' | 'interne' | 'production';
  etat: 'brouillon' | 'attente' | 'confirme' | 'assigne' | 'termine' | 'annule';
  date_transfert: string | null;
  date_prevue: string | null;
  date_reelle: string | null;
  notes: string | null;
  adresse_livraison: string | null;
  adresse_expedition: string | null;
  mode_transport: string | null;
  num_facture_transport: string | null;
  poids_total: number | null;
  volume_total: number | null;
  societe_id: number | null;
  actif: number;
  created_at: string;
  updated_at: string;
  mouvements?: MouvementStock[];
  emplacementSource?: EmplacementStock;
  emplacementDestination?: EmplacementStock;
}

export interface MouvementStock {
  id: number;
  transfert_id: number;
  produit_id: number;
  lot_id: number | null;
  code_produit: string | null;
  nom_produit: string;
  description: string | null;
  quantite_demandee: number;
  quantite_traitee: number;
  quantite_reservee: number;
  emplacement_source_id: number;
  emplacement_destination_id: number;
  emplacement_source_reel_id: number | null;
  emplacement_destination_reel_id: number | null;
  etat: 'brouillon' | 'attente' | 'confirme' | 'assigne' | 'termine' | 'annule';
  unite: string | null;
  poids_unitaire: number | null;
  volume_unitaire: number | null;
  date_prelevement: string | null;
  date_reception: string | null;
  notes: string | null;
  created_at: string;
  updated_at: string;
  produit?: VarianteProduit;
  lot?: LotTracabilite;
  transfert?: TransfertStock;
}

export interface LigneOperationStock {
  id: number;
  mouvement_id: number;
  produit_id: number;
  lot_id: number | null;
  code_barres: string | null;
  quantite_traitee: number;
  emplacement_source_id: number;
  emplacement_destination_id: number;
  utilisateur_id: number | null;
  date_operation: string;
  type_operation: 'prelevement' | 'reception' | 'scan';
  notes: string | null;
  created_at: string;
  updated_at: string;
  mouvement?: MouvementStock;
  produit?: VarianteProduit;
  lot?: LotTracabilite;
  emplacementSource?: EmplacementStock;
  emplacementDestination?: EmplacementStock;
}

// ============================================
// TYPES FACTURES
// ============================================

export interface EcritureComptable {
  id: number;
  reference: string;
  numero_facture: string | null;
  partenaire_id: number;
  type: 'facture_client' | 'avoir_client' | 'facture_fournisseur' | 'avoir_fournisseur';
  date_emission: string;
  date_echeance: string | null;
  date_paiement: string | null;
  montant_ht: number;
  montant_tva: number;
  montant_ttc: number;
  montant_remise: number;
  taux_remise: number;
  montant_paye: number;
  montant_restant: number;
  devise: string;
  taux_change: number;
  commande_vente_id: number | null;
  commande_achat_id: number | null;
  transfert_id: number | null;
  statut: 'brouillon' | 'validee' | 'envoyee' | 'payee' | 'annulee';
  mode_paiement: string | null;
  notes: string | null;
  adresse_facturation: string | null;
  adresse_livraison: string | null;
  societe_id: number | null;
  actif: number;
  created_at: string;
  updated_at: string;
  partenaire?: Partenaire;
  lignes?: LigneEcritureComptable[];
}

export interface LigneEcritureComptable {
  id: number;
  ecriture_comptable_id: number;
  produit_id: number | null;
  code_produit: string | null;
  nom_produit: string;
  description: string | null;
  quantite: number;
  prix_unitaire_ht: number;
  prix_unitaire_ttc: number;
  taux_remise: number;
  montant_remise: number;
  montant_ht: number;
  montant_tva: number;
  montant_ttc: number;
  taux_tva: number;
  compte_comptable: string | null;
  compte_tva: string | null;
  notes: string | null;
  created_at: string;
  updated_at: string;
  produit?: VarianteProduit;
  ecriture?: EcritureComptable;
}

// ============================================
// TYPES COMMANDES
// ============================================

export interface CommandeVente {
  id: number;
  reference: string;
  partenaire_id: number;
  date_commande: string;
  date_livraison_souhaitee: string | null;
  date_livraison_prevue: string | null;
  date_livraison_reelle: string | null;
  etat: 'brouillon' | 'confirme' | 'en_cours' | 'termine' | 'annule';
  montant_total_ht: number;
  montant_total_ttc: number;
  montant_remise: number;
  taux_remise: number;
  frais_livraison: number;
  notes: string | null;
  adresse_livraison: string | null;
  adresse_facturation: string | null;
  mode_paiement: string | null;
  reference_commande_client: string | null;
  actif: number;
  created_at: string;
  updated_at: string;
  partenaire?: Partenaire;
  lignes?: LigneCommandeVente[];
}

export interface LigneCommandeVente {
  id: number;
  commande_vente_id: number;
  produit_id: number;
  code_produit: string | null;
  nom_produit: string;
  description: string | null;
  quantite: number;
  quantite_livree: number;
  prix_unitaire_ht: number;
  prix_unitaire_ttc: number;
  taux_remise: number;
  montant_remise: number;
  montant_total_ht: number;
  montant_total_ttc: number;
  taux_tva: number;
  date_livraison_souhaitee: string | null;
  delai_livraison: number | null;
  notes: string | null;
  created_at: string;
  updated_at: string;
  produit?: VarianteProduit;
  commande?: CommandeVente;
}

export interface CommandeAchat {
  id: number;
  reference: string;
  partenaire_id: number;
  date_commande: string;
  date_livraison_prevue: string | null;
  date_livraison_reelle: string | null;
  etat: 'brouillon' | 'confirme' | 'envoye' | 'recu' | 'termine' | 'annule';
  montant_total_ht: number;
  montant_total_ttc: number;
  montant_remise: number;
  taux_remise: number;
  frais_livraison: number;
  notes: string | null;
  adresse_livraison: string | null;
  adresse_facturation: string | null;
  mode_paiement: string | null;
  reference_commande_fournisseur: string | null;
  actif: number;
  created_at: string;
  updated_at: string;
  partenaire?: Partenaire;
  lignes?: LigneCommandeAchat[];
}

export interface LigneCommandeAchat {
  id: number;
  commande_achat_id: number;
  produit_id: number;
  code_produit: string | null;
  nom_produit: string;
  description: string | null;
  quantite: number;
  quantite_recue: number;
  prix_unitaire_ht: number;
  prix_unitaire_ttc: number;
  taux_remise: number;
  montant_remise: number;
  montant_total_ht: number;
  montant_total_ttc: number;
  taux_tva: number;
  date_livraison_prevue: string | null;
  delai_livraison: number | null;
  notes: string | null;
  created_at: string;
  updated_at: string;
  produit?: VarianteProduit;
  commande?: CommandeAchat;
}

// ============================================
// TYPES DASHBOARD
// ============================================

export interface DashboardStats {
  stats_generales: {
    total_utilisateurs: number;
    total_clients: number;
    total_fournisseurs: number;
    total_produits: number;
    total_commandes_vente: number;
    total_commandes_achat: number;
    total_factures: number;
    total_transferts: number;
  };
  chiffres_affaires: {
    ca_clients: string;
    ca_fournisseurs: string;
    total_factures: string;
    factures_impayees: string;
    taux_paiement: number;
    date_debut: string;
    date_fin: string;
  };
  commandes: {
    ventes: {
      total: number;
      par_statut: Record<string, number>;
      brouillon: number;
      confirme: number;
      en_cours: number;
      termine: number;
      annule: number;
    };
    achats: {
      total: number;
      par_statut: Record<string, number>;
      brouillon: number;
      confirme: number;
      envoye: number;
      recu: number;
      termine: number;
      annule: number;
    };
  };
  stock: {
    quantite_totale: string;
    produits_en_stock: number;
    produits_rupture: number;
    produits_alerte: number;
    produits_normal: number;
    taux_rupture: number;
  };
  transferts_recents: TransfertRecent[];
  factures_recents: FactureRecent[];
  alertes_stock: AlerteStock[];
  evolution_ventes: EvolutionVente[];
  top_produits: TopProduit[];
  activite_utilisateurs: {
    dernieres_connexions: DerniereConnexion[];
    utilisateurs_par_role: Record<string, number>;
    total_actifs: number;
    total_inactifs: number;
  };
}

export interface TransfertRecent {
  id: number;
  reference: string;
  type: 'reception' | 'livraison' | 'interne' | 'production';
  type_label: string;
  etat: 'brouillon' | 'attente' | 'confirme' | 'assigne' | 'termine' | 'annule';
  etat_label: string;
  source: string | null;
  destination: string | null;
  created_at: string;
  cree_par: string | null;
}

export interface FactureRecent {
  id: number;
  reference: string;
  numero_facture: string | null;
  type: 'facture_client' | 'avoir_client' | 'facture_fournisseur' | 'avoir_fournisseur';
  type_label: string;
  statut: 'brouillon' | 'validee' | 'envoyee' | 'payee' | 'annulee';
  statut_label: string;
  montant_ttc: string;
  partenaire: string | null;
  date_emission: string;
  cree_par: string | null;
}

export interface AlerteStock {
  produit: string;
  code: string;
  emplacement: string;
  quantite: string;
  seuil_minimum?: string;
  type: 'rupture' | 'alerte';
  message: string;
}

export interface EvolutionVente {
  date: string;
  commandes: number;
  montant_commandes: string;
  factures: number;
  montant_factures: string;
}

export interface TopProduit {
  produit_id: number;
  nom: string;
  quantite_vendue: string;
  total_ht: string;
  nombre_commandes: number;
}

export interface DerniereConnexion {
  nom: string;
  email: string;
  derniere_connexion: string;
  role: string;
}

// ============================================
// TYPES RAPPORTS
// ============================================

export interface RapportMouvementLigne {
  produit_id: number;
  total_entree: number;
  total_sortie: number;
  nombre_operations: number;
  solde: number;
  stock_actuel: number;
  valeur_stock: number;
  valeur_entree: number;
  valeur_sortie: number;
  produit?: VarianteProduit;
}

export interface RapportMouvementTotaux {
  total_entree: number;
  total_sortie: number;
  solde: number;
  valeur_stock: number;
  valeur_entree: number;
  valeur_sortie: number;
  nombre_operations: number;
}

export interface RapportMouvementData {
  lignes: RapportMouvementLigne[];
  totaux: RapportMouvementTotaux;
}

export interface RapportStockLigne {
  produit_id: number;
  emplacement_id: number;
  quantite_totale: number;
  quantite_reservee_totale: number;
  valeur: number;
  produit?: VarianteProduit;
  emplacement?: EmplacementStock;
}

export interface RapportStockTotaux {
  quantite_totale: number;
  valeur_totale: number;
  nombre_produits: number;
}

export interface RapportStockData {
  lignes: RapportStockLigne[];
  totaux: RapportStockTotaux;
}

export interface RapportVentesLigne {
  produit_id: number;
  total_quantite: number;
  total_montant_ht: number;
  nombre_commandes: number;
  produit?: VarianteProduit;
}

export interface RapportVentesTotaux {
  total_quantite: number;
  total_montant_ht: number;
  nombre_commandes: number;
}

export interface RapportVentesData {
  lignes: RapportVentesLigne[];
  totaux: RapportVentesTotaux;
}

export interface RapportAchatsLigne {
  produit_id: number;
  total_quantite: number;
  total_montant_ht: number;
  nombre_commandes: number;
  produit?: VarianteProduit;
}

export interface RapportAchatsTotaux {
  total_quantite: number;
  total_montant_ht: number;
  nombre_commandes: number;
}

export interface RapportAchatsData {
  lignes: RapportAchatsLigne[];
  totaux: RapportAchatsTotaux;
}