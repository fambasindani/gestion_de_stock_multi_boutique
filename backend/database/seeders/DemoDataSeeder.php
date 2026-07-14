<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;
use Carbon\Carbon;

class DemoDataSeeder extends Seeder
{
    public function run()
    {
        $now = Carbon::now();

        // Unité
        foreach ([
            ['id' => 1, 'nom' => 'Unité', 'symbole' => 'u', 'actif' => 1],
            ['id' => 2, 'nom' => 'Kilogramme', 'symbole' => 'kg', 'actif' => 1],
            ['id' => 3, 'nom' => 'Litre', 'symbole' => 'L', 'actif' => 1],
            ['id' => 4, 'nom' => 'Mètre', 'symbole' => 'm', 'actif' => 1],
            ['id' => 5, 'nom' => 'Boîte', 'symbole' => 'bt', 'actif' => 1],
        ] as $d) { DB::table('unite_mesure')->insert($d + ['created_at' => $now, 'updated_at' => $now]); }

        // Catégorie
        foreach ([
            ['id' => 1, 'nom' => 'Électronique', 'description' => 'Produits électroniques', 'parent_id' => null, 'actif' => 1],
            ['id' => 2, 'nom' => 'Informatique', 'description' => 'Matériel informatique', 'parent_id' => 1, 'actif' => 1],
            ['id' => 3, 'nom' => 'Bureau', 'description' => 'Fournitures de bureau', 'parent_id' => null, 'actif' => 1],
            ['id' => 4, 'nom' => 'Alimentaire', 'description' => 'Produits alimentaires', 'parent_id' => null, 'actif' => 1],
        ] as $d) { DB::table('categorie_produit')->insert($d + ['created_at' => $now, 'updated_at' => $now]); }

        // Produit
        foreach ([
            ['id' => 1, 'nom' => 'Ordinateur Portable', 'description' => 'Ordinateur portable professionnel', 'type' => 'stockable', 'categorie_id' => 2, 'unite_id' => 1, 'actif' => 1],
            ['id' => 2, 'nom' => 'Souris USB', 'description' => 'Souris optique USB', 'type' => 'stockable', 'categorie_id' => 2, 'unite_id' => 1, 'actif' => 1],
            ['id' => 3, 'nom' => 'Papier A4', 'description' => 'Papier blanc A4 500 feuilles', 'type' => 'consommable', 'categorie_id' => 3, 'unite_id' => 5, 'actif' => 1],
            ['id' => 4, 'nom' => 'Café en grains', 'description' => 'Café arabica 1kg', 'type' => 'consommable', 'categorie_id' => 4, 'unite_id' => 2, 'actif' => 1],
            ['id' => 5, 'nom' => 'Service de nettoyage', 'description' => 'Prestation de nettoyage mensuelle', 'type' => 'service', 'categorie_id' => null, 'unite_id' => null, 'actif' => 1],
        ] as $d) { DB::table('produit_modele')->insert($d + ['created_at' => $now, 'updated_at' => $now]); }

        // Variante
        foreach ([
            ['id' => 1, 'modele_produit_id' => 1, 'nom' => 'Dell Latitude 14"', 'code_interne' => 'PC-DELL-001', 'reference_fournisseur' => 'DEL-LAT-001', 'prix_achat' => 850.00, 'prix_vente' => 1299.99, 'poids' => 1.8, 'actif' => 1],
            ['id' => 2, 'modele_produit_id' => 1, 'nom' => 'HP ProBook 15"', 'code_interne' => 'PC-HP-001', 'reference_fournisseur' => 'HP-PRO-001', 'prix_achat' => 720.00, 'prix_vente' => 1099.99, 'poids' => 2.0, 'actif' => 1],
            ['id' => 3, 'modele_produit_id' => 2, 'nom' => 'Souris Logitech M90', 'code_interne' => 'SOU-LOG-001', 'reference_fournisseur' => 'LOG-M90', 'prix_achat' => 12.00, 'prix_vente' => 24.99, 'poids' => 0.1, 'actif' => 1],
            ['id' => 4, 'modele_produit_id' => 3, 'nom' => 'Papier A4 80g', 'code_interne' => 'PAP-A4-001', 'reference_fournisseur' => 'CLA-A4-80', 'prix_achat' => 4.50, 'prix_vente' => 8.50, 'poids' => 2.5, 'actif' => 1],
            ['id' => 5, 'modele_produit_id' => 4, 'nom' => 'Café Arabica 1kg', 'code_interne' => 'CAFE-AR-001', 'reference_fournisseur' => 'MAX-ARAB-1KG', 'prix_achat' => 15.00, 'prix_vente' => 28.00, 'poids' => 1.0, 'actif' => 1],
        ] as $d) { DB::table('variante_produit')->insert($d + ['created_at' => $now, 'updated_at' => $now]); }

        // Partenaire
        foreach ([
            ['id' => 1, 'nom' => 'Jean Dupont', 'est_client' => 1, 'est_fournisseur' => 0, 'email' => 'jean.dupont@email.com', 'telephone' => '0123456789', 'adresse' => '12 rue de la Paix', 'code_postal' => '75001', 'ville' => 'Paris', 'pays' => 'France', 'numero_tva' => null, 'siret' => null, 'notes' => 'Client fidèle', 'actif' => 1],
            ['id' => 2, 'nom' => 'SARL Martin', 'est_client' => 1, 'est_fournisseur' => 0, 'email' => 'contact@sarlmartin.fr', 'telephone' => '0987654321', 'adresse' => '45 avenue des Champs', 'code_postal' => '69001', 'ville' => 'Lyon', 'pays' => 'France', 'numero_tva' => 'FR12345678901', 'siret' => '12345678901234', 'notes' => 'Société de services', 'actif' => 1],
            ['id' => 3, 'nom' => 'TechDistrib', 'est_client' => 0, 'est_fournisseur' => 1, 'email' => 'commandes@techdistrib.fr', 'telephone' => '0147258369', 'adresse' => '8 rue du Commerce', 'code_postal' => '75011', 'ville' => 'Paris', 'pays' => 'France', 'numero_tva' => 'FR98765432109', 'siret' => '98765432109876', 'notes' => 'Fournisseur informatique', 'actif' => 1],
            ['id' => 4, 'nom' => 'FournBureau', 'est_client' => 0, 'est_fournisseur' => 1, 'email' => 'ventes@fournbureau.fr', 'telephone' => '0147258360', 'adresse' => '25 rue des Écoles', 'code_postal' => '75005', 'ville' => 'Paris', 'pays' => 'France', 'numero_tva' => 'FR45678912304', 'siret' => '45678912304567', 'notes' => 'Fournitures de bureau', 'actif' => 1],
            ['id' => 5, 'nom' => 'Sophie Bernard', 'est_client' => 1, 'est_fournisseur' => 0, 'email' => 'sophie.b@email.fr', 'telephone' => '0654789123', 'adresse' => '3 rue des Lilas', 'code_postal' => '33100', 'ville' => 'Bordeaux', 'pays' => 'France', 'numero_tva' => null, 'siret' => null, 'notes' => null, 'actif' => 1],
        ] as $d) { DB::table('partenaire')->insert($d + ['created_at' => $now, 'updated_at' => $now]); }

        // Emplacement
        foreach ([
            ['id' => 1, 'nom' => 'Entrepôt Principal', 'code' => 'EP01', 'type' => 'entrepot', 'emplacement_parent_id' => null, 'actif' => 1],
            ['id' => 2, 'nom' => 'Zone A - Informatique', 'code' => 'EP01-A', 'type' => 'rayonnage', 'emplacement_parent_id' => 1, 'actif' => 1],
            ['id' => 3, 'nom' => 'Zone B - Bureau', 'code' => 'EP01-B', 'type' => 'rayonnage', 'emplacement_parent_id' => 1, 'actif' => 1],
            ['id' => 4, 'nom' => 'Zone C - Alimentaire', 'code' => 'EP01-C', 'type' => 'rayonnage', 'emplacement_parent_id' => 1, 'actif' => 1],
            ['id' => 5, 'nom' => 'Quai de réception', 'code' => 'QR01', 'type' => 'quai', 'emplacement_parent_id' => 1, 'actif' => 1],
        ] as $d) { DB::table('emplacement_stock')->insert($d + ['created_at' => $now, 'updated_at' => $now]); }

        // Lot
        foreach ([
            ['id' => 1, 'nom' => 'LOT-CAFE-001', 'code' => 'CAFE-2024-001', 'produit_id' => 5, 'type' => 'lot', 'quantite_initiale' => 50, 'quantite_actuelle' => 20, 'date_production' => '2024-01-15', 'date_peremption' => '2025-01-15', 'fournisseur' => 'MaxiCoffee', 'statut' => 'actif'],
            ['id' => 2, 'nom' => 'LOT-PAP-001', 'code' => 'PAP-2024-001', 'produit_id' => 4, 'type' => 'lot', 'quantite_initiale' => 100, 'quantite_actuelle' => 50, 'date_production' => '2024-06-01', 'fournisseur' => 'Clairefontaine', 'statut' => 'actif'],
        ] as $d) { DB::table('lot_tracabilite')->insert($d + ['created_at' => $now, 'updated_at' => $now]); }

        // Stock
        foreach ([
            ['id' => 1, 'produit_id' => 1, 'emplacement_id' => 2, 'quantite_disponible' => 10, 'quantite_reservee' => 2, 'quantite_commande' => 5, 'seuil_minimum' => 2, 'seuil_maximum' => 20],
            ['id' => 2, 'produit_id' => 2, 'emplacement_id' => 2, 'quantite_disponible' => 5, 'seuil_minimum' => 2, 'seuil_maximum' => 15],
            ['id' => 3, 'produit_id' => 3, 'emplacement_id' => 2, 'quantite_disponible' => 30, 'quantite_reservee' => 5, 'quantite_commande' => 10, 'seuil_minimum' => 10, 'seuil_maximum' => 100],
            ['id' => 4, 'produit_id' => 4, 'emplacement_id' => 3, 'quantite_disponible' => 50, 'quantite_commande' => 20, 'seuil_minimum' => 20, 'seuil_maximum' => 200],
            ['id' => 5, 'produit_id' => 5, 'emplacement_id' => 4, 'quantite_disponible' => 20, 'quantite_commande' => 10, 'seuil_minimum' => 5, 'seuil_maximum' => 50],
        ] as $d) { DB::table('quantite_stock')->insert($d + ['created_at' => $now, 'updated_at' => $now]); }

        // Commande achat
        foreach ([
            ['id' => 1, 'reference' => 'CA-2024-0001', 'partenaire_id' => 3, 'date_commande' => '2024-12-01', 'date_livraison_prevue' => '2024-12-10', 'date_livraison_reelle' => '2024-12-09', 'montant_total_ht' => 1970.00, 'montant_total_ttc' => 2364.00, 'etat' => 'recu', 'adresse_livraison' => '1 rue du Stock, 75001 Paris'],
            ['id' => 2, 'reference' => 'CA-2024-0002', 'partenaire_id' => 4, 'date_commande' => '2024-12-05', 'date_livraison_prevue' => '2024-12-12', 'montant_total_ht' => 213.75, 'montant_total_ttc' => 256.50, 'etat' => 'envoye', 'adresse_livraison' => '1 rue du Stock, 75001 Paris'],
        ] as $d) { DB::table('commande_achat')->insert($d + ['created_at' => $now, 'updated_at' => $now]); }

        // Ligne commande achat
        foreach ([
            ['id' => 1, 'commande_achat_id' => 1, 'produit_id' => 1, 'nom_produit' => 'Ordinateur Portable Dell', 'quantite' => 2, 'prix_unitaire_ht' => 850.00, 'taux_tva' => 20.0, 'montant_total_ht' => 1700.00],
            ['id' => 2, 'commande_achat_id' => 1, 'produit_id' => 3, 'nom_produit' => 'Souris Logitech', 'quantite' => 10, 'prix_unitaire_ht' => 12.00, 'taux_tva' => 20.0, 'montant_total_ht' => 120.00],
            ['id' => 3, 'commande_achat_id' => 1, 'produit_id' => 5, 'nom_produit' => 'Café Arabica 1kg', 'quantite' => 10, 'prix_unitaire_ht' => 15.00, 'taux_tva' => 20.0, 'montant_total_ht' => 150.00],
            ['id' => 4, 'commande_achat_id' => 2, 'produit_id' => 4, 'nom_produit' => 'Papier A4 80g', 'quantite' => 50, 'prix_unitaire_ht' => 4.50, 'taux_tva' => 20.0, 'taux_remise' => 5, 'montant_total_ht' => 213.75],
        ] as $d) { DB::table('ligne_commande_achat')->insert($d + ['created_at' => $now, 'updated_at' => $now]); }

        // Commande vente
        foreach ([
            ['id' => 1, 'reference' => 'CV-2024-0001', 'partenaire_id' => 1, 'date_commande' => '2024-12-10', 'date_livraison_souhaitee' => '2024-12-15', 'montant_total_ht' => 1299.99, 'montant_total_ttc' => 1559.99, 'etat' => 'confirme', 'adresse_livraison' => '12 rue de la Paix, 75001 Paris'],
            ['id' => 2, 'reference' => 'CV-2024-0002', 'partenaire_id' => 2, 'date_commande' => '2024-12-12', 'date_livraison_souhaitee' => '2024-12-20', 'montant_total_ht' => 114.97, 'montant_total_ttc' => 137.96, 'etat' => 'brouillon', 'adresse_livraison' => '45 avenue des Champs, 69001 Lyon'],
        ] as $d) { DB::table('commande_vente')->insert($d + ['created_at' => $now, 'updated_at' => $now]); }

        // Ligne commande vente
        foreach ([
            ['id' => 1, 'commande_vente_id' => 1, 'produit_id' => 1, 'nom_produit' => 'Ordinateur Portable Dell', 'quantite' => 1, 'prix_unitaire_ht' => 1299.99, 'taux_tva' => 20.0, 'montant_total_ht' => 1299.99],
            ['id' => 2, 'commande_vente_id' => 2, 'produit_id' => 3, 'nom_produit' => 'Souris Logitech', 'quantite' => 3, 'prix_unitaire_ht' => 24.99, 'taux_tva' => 20.0, 'montant_total_ht' => 74.97],
            ['id' => 3, 'commande_vente_id' => 2, 'produit_id' => 4, 'nom_produit' => 'Papier A4 80g', 'quantite' => 5, 'prix_unitaire_ht' => 8.00, 'taux_tva' => 20.0, 'montant_total_ht' => 40.00],
        ] as $d) { DB::table('ligne_commande_vente')->insert($d + ['created_at' => $now, 'updated_at' => $now]); }

        // Facture
        foreach ([
            ['id' => 1, 'reference' => 'FACT-2024-0001', 'numero_facture' => 'F2024-001', 'partenaire_id' => 1, 'type' => 'facture_client', 'date_emission' => '2024-12-10', 'date_echeance' => '2024-12-31', 'montant_ht' => 1299.99, 'montant_tva' => 260.00, 'montant_ttc' => 1559.99, 'montant_paye' => 1559.99, 'montant_restant' => 0, 'date_paiement' => '2024-12-20', 'mode_paiement' => 'carte', 'statut' => 'payee'],
            ['id' => 2, 'reference' => 'FACT-2025-0001', 'partenaire_id' => 3, 'type' => 'facture_fournisseur', 'date_emission' => '2025-01-05', 'date_echeance' => '2025-01-31', 'montant_ht' => 1700.00, 'montant_tva' => 340.00, 'montant_ttc' => 2040.00, 'montant_paye' => 0, 'montant_restant' => 2040.00, 'mode_paiement' => 'virement', 'statut' => 'brouillon'],
            ['id' => 3, 'reference' => 'AV-2025-0001', 'numero_facture' => 'A2025-001', 'partenaire_id' => 1, 'type' => 'avoir_client', 'date_emission' => '2025-02-01', 'montant_ht' => -200.00, 'montant_tva' => -40.00, 'montant_ttc' => -240.00, 'montant_paye' => 0, 'montant_restant' => -240.00, 'notes' => 'Avoir pour retour marchandise', 'statut' => 'validee'],
            ['id' => 4, 'reference' => 'AV-2025-0002', 'numero_facture' => 'A2025-002', 'partenaire_id' => 3, 'type' => 'avoir_fournisseur', 'date_emission' => '2025-02-15', 'montant_ht' => -150.00, 'montant_tva' => -30.00, 'montant_ttc' => -180.00, 'montant_paye' => 0, 'montant_restant' => -180.00, 'notes' => 'Avoir pour remise commerciale', 'statut' => 'brouillon'],
        ] as $d) { DB::table('ecriture_comptable')->insert($d + ['created_at' => $now, 'updated_at' => $now]); }

        // Ligne facture
        foreach ([
            ['id' => 1, 'ecriture_comptable_id' => 1, 'produit_id' => 1, 'nom_produit' => 'Ordinateur Portable Dell', 'quantite' => 1, 'prix_unitaire_ht' => 1299.99, 'taux_tva' => 20.0, 'montant_ht' => 1299.99],
            ['id' => 2, 'ecriture_comptable_id' => 2, 'produit_id' => 1, 'nom_produit' => 'Ordinateur Portable Dell', 'quantite' => 2, 'prix_unitaire_ht' => 850.00, 'taux_tva' => 20.0, 'montant_ht' => 1700.00],
            ['id' => 3, 'ecriture_comptable_id' => 3, 'produit_id' => 1, 'nom_produit' => 'Ordinateur Portable Dell - Retour', 'quantite' => 1, 'prix_unitaire_ht' => -200.00, 'taux_tva' => 20.0, 'montant_ht' => -200.00],
            ['id' => 4, 'ecriture_comptable_id' => 4, 'produit_id' => 3, 'nom_produit' => 'Remise commerciale Souris', 'quantite' => 1, 'prix_unitaire_ht' => -150.00, 'taux_tva' => 20.0, 'montant_ht' => -150.00],
        ] as $d) { DB::table('ligne_ecriture_comptable')->insert($d + ['created_at' => $now, 'updated_at' => $now]); }

        $this->command->info('✅ Données de démonstration créées avec succès !');

        // Audit logs
        foreach ([
            ['action' => 'Connexion', 'entity_type' => 'auth', 'entity_id' => 1, 'description' => 'Connexion de l\'utilisateur Pierre Famba', 'user_id' => 1],
            ['action' => 'Création', 'entity_type' => 'commande_achat', 'entity_id' => 1, 'description' => 'Création de la commande d\'achat CA-2024-0001', 'user_id' => 1],
            ['action' => 'Validation', 'entity_type' => 'commande_achat', 'entity_id' => 1, 'description' => 'Validation de la commande d\'achat CA-2024-0001', 'user_id' => 1],
            ['action' => 'Réception', 'entity_type' => 'commande_achat', 'entity_id' => 1, 'description' => 'Réception de la commande d\'achat CA-2024-0001', 'user_id' => 1],
            ['action' => 'Création', 'entity_type' => 'commande_vente', 'entity_id' => 1, 'description' => 'Création de la commande vente CV-2024-0001', 'user_id' => 2],
            ['action' => 'Création', 'entity_type' => 'produit', 'entity_id' => 5, 'description' => 'Création du produit Service de nettoyage', 'user_id' => 1],
            ['action' => 'Modification', 'entity_type' => 'produit', 'entity_id' => 1, 'description' => 'Modification du prix de vente de l\'ordinateur portable', 'user_id' => 1],
        ] as $d) {
            DB::table('audit_logs')->insert($d + ['created_at' => $now, 'updated_at' => $now]);
        }

        $this->command->info('✅ Données de démonstration créées avec succès !');
    }
}
