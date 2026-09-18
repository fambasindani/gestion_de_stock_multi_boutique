class LoginCredentials {
  final String email;
  final String motDePasse;
  LoginCredentials({required this.email, required this.motDePasse});
  Map<String, dynamic> toJson() => {'email': email, 'mot_de_passe': motDePasse};
}

class Societe {
  final int id;
  final String nom;
  final String? code;
  final String? logo;
  final bool actif;
  final String? dateExpiration;
  Societe.fromJson(Map<String, dynamic> json)
      : id = json['id'],
        nom = json['nom'],
        code = json['code'],
        logo = json['logo'],
        actif = json['actif'] == 1 || json['actif'] == true,
        dateExpiration = json['date_expiration'];
}

class LoginResponse {
  final String accessToken;
  final Utilisateur utilisateur;
  final List<String> roles;
  final List<String> permissions;
  final Societe? societe;
  final bool estSuperAdmin;
  LoginResponse.fromJson(Map<String, dynamic> json)
      : accessToken = json['access_token'],
        utilisateur = Utilisateur.fromJson(json['utilisateur']),
        roles = List<String>.from(json['roles'] ?? []),
        permissions = List<String>.from(json['permissions'] ?? []),
        societe = json['societe'] != null ? Societe.fromJson(json['societe']) : null,
        estSuperAdmin = json['est_super_admin'] == true || json['est_super_admin'] == 1;
}

class Utilisateur {
  final int id;
  final String nom;
  final String email;
  final String? telephone;
  final bool actif;
  final bool estSuperAdmin;
  final int? societeId;
  final Societe? societe;
  final String? derniereConnexion;
  final List<Role>? roles;
  Utilisateur.fromJson(Map<String, dynamic> json)
      : id = json['id'],
        nom = (json['nom'] ?? '').toString(),
        email = (json['email'] ?? '').toString(),
        telephone = json['telephone'],
        actif = json['actif'] == 1 || json['actif'] == true,
        estSuperAdmin = json['est_super_admin'] == true || json['est_super_admin'] == 1,
        societeId = json['societe_id'],
        societe = json['societe'] != null ? Societe.fromJson(json['societe']) : null,
        derniereConnexion = json['derniere_connexion'],
        roles = json['roles'] != null ? (json['roles'] as List).map((r) => Role.fromJson(r)).toList() : null;
}

class Partenaire {
  final int id;
  final String nom;
  final String? code;
  final String? email;
  final String? telephone;
  final String? adresse;
  final String? ville;
  final bool estClient;
  final bool estFournisseur;
  final bool actif;
  Partenaire.fromJson(Map<String, dynamic> json)
      : id = json['id'],
        nom = (json['nom'] ?? '').toString(),
        code = json['code'],
        email = json['email'],
        telephone = json['telephone'],
        adresse = json['adresse'],
        ville = json['ville'],
        estClient = json['est_client'] == 1 || json['est_client'] == true,
        estFournisseur = json['est_fournisseur'] == 1 || json['est_fournisseur'] == true,
        actif = json['actif'] == 1 || json['actif'] == true;
}

class CategorieProduit {
  final int id;
  final String nom;
  final String? description;
  final int? parentId;
  final bool actif;
  CategorieProduit.fromJson(Map<String, dynamic> json)
      : id = json['id'],
        nom = (json['nom'] ?? '').toString(),
        description = json['description'],
        parentId = json['parent_id'],
        actif = json['actif'] == 1 || json['actif'] == true;
}

class UniteMesure {
  final int id;
  final String nom;
  final String symbole;
  final bool actif;
  UniteMesure.fromJson(Map<String, dynamic> json)
      : id = json['id'],
        nom = (json['nom'] ?? '').toString(),
        symbole = (json['symbole'] ?? '').toString(),
        actif = json['actif'] == 1 || json['actif'] == true;
}

class VarianteProduit {
  final int id;
  final int modeleProduitId;
  final String? codeInterne;
  final String nom;
  final double prixAchat;
  final double prixVente;
  final bool actif;
  VarianteProduit.fromJson(Map<String, dynamic> json)
      : id = json['id'],
        modeleProduitId = json['modele_produit_id'] ?? 0,
        codeInterne = json['code_interne'],
        nom = (json['nom'] ?? json['code_interne'] ?? '').toString(),
        prixAchat = _parseDouble(json['prix_achat']),
        prixVente = _parseDouble(json['prix_vente']),
        actif = json['actif'] == 1 || json['actif'] == true;
}

class ProduitModele {
  final int id;
  final String nom;
  final String type;
  final int? categorieId;
  final int? uniteId;
  final bool actif;
  final List<VarianteProduit>? variantes;
  final CategorieProduit? categorie;
  final UniteMesure? unite;
  ProduitModele.fromJson(Map<String, dynamic> json)
      : id = json['id'],
        nom = (json['nom'] ?? '').toString(),
        type = (json['type'] ?? 'stockable').toString(),
        categorieId = json['categorie_id'],
        uniteId = json['unite_id'],
        actif = json['actif'] == 1 || json['actif'] == true,
        variantes = json['variantes'] != null ? (json['variantes'] as List).map((v) => VarianteProduit.fromJson(v)).toList() : null,
        categorie = json['categorie'] != null ? CategorieProduit.fromJson(json['categorie']) : null,
        unite = json['unite'] != null ? UniteMesure.fromJson(json['unite']) : null;
}

class EmplacementStock {
  final int id;
  final String nom;
  final String code;
  final String type;
  final String usage;
  final bool actif;
  final int? parentId;
  final String? description;
  final double? capaciteMaximale;
  final String? codeBarres;
  EmplacementStock.fromJson(Map<String, dynamic> json)
      : id = json['id'],
        nom = json['nom'],
        code = json['code'] ?? '',
        type = json['type'] ?? '',
        usage = json['usage'] ?? '',
        actif = json['actif'] == 1 || json['actif'] == true,
        parentId = json['parent_id'] ?? json['emplacement_parent_id'],
        description = json['description'],
        capaciteMaximale = json['capacite_maximale'] != null ? _parseDouble(json['capacite_maximale']) : null,
        codeBarres = json['code_barres'];
}

class LotTracabilite {
  final int id;
  final String nom;
  final String code;
  final int produitId;
  final String type; // 'lot' | 'serie'
  final String? dateProduction;
  final String? datePeremption;
  final String? dateReception;
  final double quantiteInitiale;
  final double quantiteActuelle;
  final double quantiteReservee;
  final String statut; // 'actif' | 'epuise' | 'perime' | 'bloque'
  final String? fournisseur;
  final String? referenceFournisseur;
  final String? unite;
  final String? notes;
  final bool actif;
  final VarianteProduit? produit;
  LotTracabilite.fromJson(Map<String, dynamic> json)
      : id = json['id'],
        nom = json['nom'],
        code = json['code'] ?? '',
        produitId = json['produit_id'],
        type = json['type'] ?? 'lot',
        dateProduction = json['date_production'],
        datePeremption = json['date_peremption'],
        dateReception = json['date_reception'],
        quantiteInitiale = _parseDouble(json['quantite_initiale']),
        quantiteActuelle = _parseDouble(json['quantite_actuelle']),
        quantiteReservee = _parseDouble(json['quantite_reservee']),
        statut = json['statut'] ?? 'actif',
        fournisseur = json['fournisseur'],
        referenceFournisseur = json['reference_fournisseur'],
        unite = json['unite'],
        notes = json['notes'],
        actif = json['actif'] == 1 || json['actif'] == true,
        produit = json['produit'] != null ? VarianteProduit.fromJson(json['produit']) : null;
}

class QuantiteStock {
  final int id;
  final int produitId;
  final int emplacementId;
  final int? lotId;
  final double quantiteDisponible;
  final double quantiteReservee;
  final double quantiteCommande;
  final double quantiteControlee;
  final double? seuilMinimum;
  final double? seuilMaximum;
  final String? dateDernierMouvement;
  final String? dateProchaineReception;
  final String? notes;
  final VarianteProduit? produit;
  final EmplacementStock? emplacement;
  final LotTracabilite? lot;
  QuantiteStock.fromJson(Map<String, dynamic> json)
      : id = json['id'],
        produitId = json['produit_id'],
        emplacementId = json['emplacement_id'],
        lotId = json['lot_id'],
        quantiteDisponible = _parseDouble(json['quantite_disponible']),
        quantiteReservee = _parseDouble(json['quantite_reservee']),
        quantiteCommande = _parseDouble(json['quantite_commande']),
        quantiteControlee = _parseDouble(json['quantite_controlee']),
        seuilMinimum = json['seuil_minimum'] != null ? _parseDouble(json['seuil_minimum']) : null,
        seuilMaximum = json['seuil_maximum'] != null ? _parseDouble(json['seuil_maximum']) : null,
        dateDernierMouvement = json['date_dernier_mouvement'],
        dateProchaineReception = json['date_prochaine_reception'],
        notes = json['notes'],
        produit = json['produit'] != null ? VarianteProduit.fromJson(json['produit']) : null,
        emplacement = json['emplacement'] != null ? EmplacementStock.fromJson(json['emplacement']) : null,
        lot = json['lot'] != null ? LotTracabilite.fromJson(json['lot']) : null;
}

class LigneCommande {
  final int id;
  final int? commandeId;
  final int produitId;
  final double quantite;
  final double prixUnitaireHt;
  final double totalHt;
  final String? nomProduit;
  final String? codeProduit;
  final VarianteProduit? produit;
  LigneCommande.fromJson(Map<String, dynamic> json)
      : id = json['id'],
        commandeId = json['commande_vente_id'] ?? json['commande_achat_id'],
        produitId = json['produit_id'],
        quantite = _parseDouble(json['quantite']),
        prixUnitaireHt = _parseDouble(json['prix_unitaire_ht']),
        totalHt = _parseDouble(json['montant_total_ht'] ?? json['total_ht']),
        nomProduit = json['nom_produit'],
        codeProduit = json['code_produit'],
        produit = json['produit'] != null ? VarianteProduit.fromJson(json['produit']) : null;
}

class CommandeVente {
  final int id;
  final String reference;
  final int partenaireId;
  final String dateCommande;
  final String? dateLivraisonSouhaitee;
  final String etat;
  final double totalHt;
  final double totalTtc;
  final String? notes;
  final String? adresseLivraison;
  final Partenaire? partenaire;
  final List<LigneCommande>? lignes;
  final List<EcritureComptable>? factures;
  CommandeVente.fromJson(Map<String, dynamic> json)
      : id = json['id'],
        reference = json['reference'] ?? '#${json['id']}',
        partenaireId = json['partenaire_id'],
        dateCommande = json['date_commande'],
        dateLivraisonSouhaitee = json['date_livraison_souhaitee'],
        etat = json['etat'],
        totalHt = _parseDouble(json['montant_total_ht'] ?? json['total_ht']),
        totalTtc = _parseDouble(json['montant_total_ttc'] ?? json['total_ttc']),
        notes = json['notes'],
        adresseLivraison = json['adresse_livraison'],
        partenaire = json['partenaire'] != null ? Partenaire.fromJson(json['partenaire']) : null,
        lignes = json['lignes'] != null ? (json['lignes'] as List).map((l) => LigneCommande.fromJson(l)).toList() : null,
        factures = json['factures'] != null ? (json['factures'] as List).map((f) => EcritureComptable.fromJson(f)).toList() : null;
}

class CommandeAchat {
  final int id;
  final String reference;
  final int partenaireId;
  final String dateCommande;
  final String? dateLivraisonPrevue;
  final String etat;
  final double totalHt;
  final double totalTtc;
  final String? notes;
  final String? adresseLivraison;
  final Partenaire? partenaire;
  final List<LigneCommande>? lignes;
  CommandeAchat.fromJson(Map<String, dynamic> json)
      : id = json['id'],
        reference = json['reference'] ?? '#${json['id']}',
        partenaireId = json['partenaire_id'],
        dateCommande = json['date_commande'],
        dateLivraisonPrevue = json['date_livraison_prevue'],
        etat = json['etat'],
        totalHt = _parseDouble(json['montant_total_ht'] ?? json['total_ht']),
        totalTtc = _parseDouble(json['montant_total_ttc'] ?? json['total_ttc']),
        notes = json['notes'],
        adresseLivraison = json['adresse_livraison'],
        partenaire = json['partenaire'] != null ? Partenaire.fromJson(json['partenaire']) : null,
        lignes = json['lignes'] != null ? (json['lignes'] as List).map((l) => LigneCommande.fromJson(l)).toList() : null;
}

class MouvementStock {
  final int id;
  final int transfertId;
  final int produitId;
  final int? lotId;
  final String? codeProduit;
  final String nomProduit;
  final String? description;
  final double quantiteDemandee;
  final double quantiteTraitee;
  final double quantiteReservee;
  final int emplacementSourceId;
  final int emplacementDestinationId;
  final int? emplacementSourceReelId;
  final int? emplacementDestinationReelId;
  final String etat;
  final String? unite;
  final String? datePrelevement;
  final String? dateReception;
  final String? notes;
  final VarianteProduit? produit;
  final LotTracabilite? lot;
  MouvementStock.fromJson(Map<String, dynamic> json)
      : id = json['id'],
        transfertId = json['transfert_id'],
        produitId = json['produit_id'],
        lotId = json['lot_id'],
        codeProduit = json['code_produit'],
        nomProduit = json['nom_produit'] ?? '',
        description = json['description'],
        quantiteDemandee = _parseDouble(json['quantite_demandee']),
        quantiteTraitee = _parseDouble(json['quantite_traitee']),
        quantiteReservee = _parseDouble(json['quantite_reservee']),
        emplacementSourceId = json['emplacement_source_id'],
        emplacementDestinationId = json['emplacement_destination_id'],
        emplacementSourceReelId = json['emplacement_source_reel_id'],
        emplacementDestinationReelId = json['emplacement_destination_reel_id'],
        etat = json['etat'] ?? 'brouillon',
        unite = json['unite'],
        datePrelevement = json['date_prelevement'],
        dateReception = json['date_reception'],
        notes = json['notes'],
        produit = json['produit'] != null ? VarianteProduit.fromJson(json['produit']) : null,
        lot = json['lot'] != null ? LotTracabilite.fromJson(json['lot']) : null;
}

class TransfertStock {
  final int id;
  final String reference;
  final String type;
  final String etat;
  final String dateCreation;
  final int? partenaireId;
  final String? notes;
  final int? emplacementSourceId;
  final int? emplacementDestinationId;
  final String? datePrevue;
  final String? dateReelle;
  final List<MouvementStock>? mouvements;
  final EmplacementStock? emplacementSource;
  final EmplacementStock? emplacementDestination;
  TransfertStock.fromJson(Map<String, dynamic> json)
      : id = json['id'],
        reference = json['reference'],
        type = json['type'],
        etat = json['etat'],
        dateCreation = json['date_creation'],
        partenaireId = json['partenaire_id'],
        notes = json['notes'],
        emplacementSourceId = json['emplacement_source_id'],
        emplacementDestinationId = json['emplacement_destination_id'],
        datePrevue = json['date_prevue'],
        dateReelle = json['date_reelle'],
        mouvements = json['mouvements'] != null ? (json['mouvements'] as List).map((m) => MouvementStock.fromJson(m)).toList() : null,
        emplacementSource = json['emplacement_source'] != null ? EmplacementStock.fromJson(json['emplacement_source']) : null,
        emplacementDestination = json['emplacement_destination'] != null ? EmplacementStock.fromJson(json['emplacement_destination']) : null;
}

class LigneEcritureComptable {
  final int id;
  final int? ecritureComptableId;
  final int? produitId;
  final String? nomProduit;
  final double quantite;
  final double prixUnitaireHt;
  final double montantHt;
  LigneEcritureComptable.fromJson(Map<String, dynamic> json)
      : id = json['id'],
        ecritureComptableId = json['ecriture_comptable_id'],
        produitId = json['produit_id'],
        nomProduit = json['nom_produit'],
        quantite = _parseDouble(json['quantite']),
        prixUnitaireHt = _parseDouble(json['prix_unitaire_ht']),
        montantHt = _parseDouble(json['montant_ht']);
}

class EcritureComptable {
  final int id;
  final String reference;
  final String? numeroFacture;
  final String type;
  final int? partenaireId;
  final String dateEmission;
  final String? dateEcheance;
  final String statut;
  final double montantHt;
  final double? montantTva;
  final double montantTtc;
  final double montantPaye;
  final double montantRestant;
  final String? modePaiement;
  final String? notes;
  final Partenaire? partenaire;
  final List<LigneEcritureComptable>? lignes;
  EcritureComptable.fromJson(Map<String, dynamic> json)
      : id = json['id'],
        reference = json['reference'] ?? json['numero_facture'] ?? '#${json['id']}',
        numeroFacture = json['numero_facture'],
        type = json['type'],
        partenaireId = json['partenaire_id'],
        dateEmission = json['date_emission'] ?? json['created_at'],
        dateEcheance = json['date_echeance'],
        statut = json['statut'],
        montantHt = _parseDouble(json['montant_ht']),
        montantTva = json['montant_tva'] != null ? _parseDouble(json['montant_tva']) : null,
        montantTtc = _parseDouble(json['montant_ttc']),
        montantPaye = _parseDouble(json['montant_paye']),
        montantRestant = _parseDouble(json['montant_restant']),
        modePaiement = json['mode_paiement'],
        notes = json['notes'],
        partenaire = json['partenaire'] != null ? Partenaire.fromJson(json['partenaire']) : null,
        lignes = json['lignes'] != null ? (json['lignes'] as List).map((l) => LigneEcritureComptable.fromJson(l)).toList() : null;
}

class Role {
  final int id;
  final String nom;
  final String? description;
  final int? societeId;
  final int utilisateursCount;
  final bool actif;
  final List<Permission>? permissions;
  Role.fromJson(Map<String, dynamic> json)
      : id = json['id'],
        nom = (json['nom'] ?? '').toString(),
        description = json['description'],
        societeId = json['societe_id'],
        utilisateursCount = json['utilisateurs_count'] ?? 0,
        actif = json['actif'] == 1 || json['actif'] == true,
        permissions = json['permissions'] != null ? (json['permissions'] as List).map((p) => Permission.fromJson(p)).toList() : null;
}

class Permission {
  final int id;
  final String nom;
  final String? garde;
  final String? description;
  Permission.fromJson(Map<String, dynamic> json)
      : id = json['id'],
        nom = json['nom'],
        garde = json['garde'],
        description = json['description'];
}

class DashboardStats {
  final int totalProduits;
  final int totalVentes;
  final int totalAchats;
  final int totalPartenaires;
  final int totalUtilisateurs;
  final double caClients;
  final double caFournisseurs;
  final double totalFactures;
  final double valeurStock;
  final int stockAlerte;
  DashboardStats.fromJson(Map<String, dynamic> json)
      : totalProduits = json['stats_generales']?['total_produits'] ?? 0,
        totalVentes = json['stats_generales']?['total_commandes_vente'] ?? 0,
        totalAchats = json['stats_generales']?['total_commandes_achat'] ?? 0,
        totalPartenaires = (json['stats_generales']?['total_clients'] ?? 0) + (json['stats_generales']?['total_fournisseurs'] ?? 0),
        totalUtilisateurs = json['stats_generales']?['total_utilisateurs'] ?? 0,
        caClients = _parseDouble(json['chiffres_affaires']?['ca_clients']),
        caFournisseurs = _parseDouble(json['chiffres_affaires']?['ca_fournisseurs']),
        totalFactures = _parseDouble(json['chiffres_affaires']?['total_factures']),
        valeurStock = _parseDouble(json['stock']?['quantite_totale']),
        stockAlerte = json['stock']?['produits_alerte'] ?? 0;
}

class PosCartLine {
  final int produitId;
  final String nom;
  final String? code;
  double prixUnitaireHt;
  double quantite;
  double tauxTva;
  double tauxRemise;
  PosCartLine({
    required this.produitId,
    required this.nom,
    this.code,
    required this.prixUnitaireHt,
    this.quantite = 1,
    this.tauxTva = 0,
    this.tauxRemise = 0,
  });

  double get montantHt => quantite * prixUnitaireHt * (1 - tauxRemise / 100);
  double get montantTva => montantHt * (tauxTva / 100);
  double get montantTtc => montantHt + montantTva;
}

class PosVenteResult {
  final CommandeVente commande;
  final EcritureComptable facture;
  final Map<String, dynamic> totaux;
  final String? clientNom;
  final String? vendeur;
  PosVenteResult.fromJson(Map<String, dynamic> json)
      : commande = CommandeVente.fromJson(json['commande']),
        facture = EcritureComptable.fromJson(json['facture']),
        totaux = (json['totaux'] as Map<String, dynamic>?) ?? {},
        clientNom = json['client_nom'],
        vendeur = json['vendeur'];
}

class LigneRetour {
  final int id;
  final int produitId;
  final double quantite;
  final double prixUnitaireHt;
  final double montantHt;
  final String? nomProduit;
  LigneRetour.fromJson(Map<String, dynamic> json)
      : id = json['id'],
        produitId = json['produit_id'],
        quantite = _parseDouble(json['quantite']),
        prixUnitaireHt = _parseDouble(json['prix_unitaire_ht']),
        montantHt = _parseDouble(json['montant_ht']),
        nomProduit = json['produit'] is Map ? json['produit']['nom'] : json['nom_produit'];
}

class Retour {
  final int id;
  final String reference;
  final String dateRetour;
  final String type;
  final String statut;
  final int? partenaireId;
  final int? emplacementId;
  final String? motif;
  final String? notes;
  final String? partenaireNom;
  final String? emplacementNom;
  final int lignesCount;
  final List<LigneRetour>? lignes;
  Retour.fromJson(Map<String, dynamic> json)
      : id = json['id'],
        reference = json['reference'] ?? '#${json['id']}',
        dateRetour = json['date_retour'] ?? '',
        type = json['type'] ?? 'client',
        statut = json['statut'] ?? 'brouillon',
        partenaireId = json['partenaire_id'],
        emplacementId = json['emplacement_id'],
        motif = json['motif'],
        notes = json['notes'],
        partenaireNom = json['partenaire'] is Map ? json['partenaire']['nom'] : null,
        emplacementNom = json['emplacement'] is Map ? json['emplacement']['nom'] : null,
        lignesCount = json['lignes_count'] ?? (json['lignes'] is List ? (json['lignes'] as List).length : 0),
        lignes = json['lignes'] != null ? (json['lignes'] as List).map((l) => LigneRetour.fromJson(l)).toList() : null;
}

class Inventaire {
  final int id;
  final String reference;
  final String dateInventaire;
  final String statut;
  final String? emplacementNom;
  final int? emplacementId;
  final String? notes;
  final String? dateCloture;
  final int lignesCount;
  Inventaire.fromJson(Map<String, dynamic> json)
      : id = json['id'],
        reference = json['reference'] ?? '#${json['id']}',
        dateInventaire = json['date_inventaire'] ?? '',
        statut = json['statut'] ?? 'brouillon',
        emplacementNom = json['emplacement'] is Map ? json['emplacement']['nom'] : null,
        emplacementId = json['emplacement_id'],
        notes = json['notes'],
        dateCloture = json['date_cloture'],
        lignesCount = json['lignes_count'] ?? 0;
}

class LigneInventaire {
  final int id;
  final int produitId;
  final String? nomProduit;
  final String? codeProduit;
  final int? emplacementId;
  final String? emplacementNom;
  final double quantiteTheorique;
  final double quantitePhysique;
  final double ecart;
  final bool ajuste;
  LigneInventaire.fromJson(Map<String, dynamic> json)
      : id = json['id'],
        produitId = json['produit_id'],
        nomProduit = json['produit'] is Map ? json['produit']['nom'] : null,
        codeProduit = json['produit'] is Map ? json['produit']['code_interne'] : null,
        emplacementId = json['emplacement_id'],
        emplacementNom = json['emplacement'] is Map ? json['emplacement']['nom'] : null,
        quantiteTheorique = _parseDouble(json['quantite_theorique']),
        quantitePhysique = _parseDouble(json['quantite_physique']),
        ecart = _parseDouble(json['ecart']),
        ajuste = json['ajuste'] == 1 || json['ajuste'] == true;
}

class AppNotification {
  final String title;
  final String message;
  final String type;
  final String level; // info | warning | danger
  final String? link;
  AppNotification.fromJson(Map<String, dynamic> json)
      : title = json['title'] ?? '',
        message = json['message'] ?? '',
        type = json['type'] ?? 'info',
        level = json['level'] ?? 'info',
        link = json['link'];
}

double _parseDouble(dynamic value) {
  if (value == null) return 0.0;
  if (value is num) return value.toDouble();
  if (value is String) return double.tryParse(value) ?? 0.0;
  return 0.0;
}
