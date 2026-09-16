<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Schema;

class UtilisateurSeeder extends Seeder
{
    public function run()
    {
        // ✅ DÉSACTIVER LES VÉRIFICATIONS DE CLÉS ÉTRANGÈRES
        DB::statement('SET FOREIGN_KEY_CHECKS=0');

        // ✅ VIDER LES TABLES DANS L'ORDRE INVERSE (en partant des tables de liaison)
        DB::table('role_permission')->truncate();
        DB::table('utilisateur_role')->truncate();
        DB::table('permissions')->truncate();
        DB::table('roles')->truncate();
        DB::table('utilisateurs')->truncate();

        // ✅ RÉACTIVER LES VÉRIFICATIONS DE CLÉS ÉTRANGÈRES
        DB::statement('SET FOREIGN_KEY_CHECKS=1');

        // ============================================
        // 1. INSÉRER LES RÔLES
        // ============================================
        DB::table('roles')->insert([
            [
                'nom' => 'administrateur',
                'description' => 'Accès total à toutes les fonctionnalités',
                'actif' => 1,
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'nom' => 'gestionnaire_stock',
                'description' => 'Gestion des stocks, transferts et mouvements',
                'actif' => 1,
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'nom' => 'commercial',
                'description' => 'Gestion des commandes clients et devis',
                'actif' => 1,
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'nom' => 'comptable',
                'description' => 'Gestion de la facturation et des paiements',
                'actif' => 1,
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'nom' => 'lecteur',
                'description' => 'Accès en lecture seule',
                'actif' => 1,
                'created_at' => now(),
                'updated_at' => now(),
            ],
        ]);

        // ============================================
        // 2. INSÉRER LES PERMISSIONS
        // ============================================
        DB::table('permissions')->insert([
            // Gestion des produits
            ['nom' => 'creer_produits', 'garde' => 'produit', 'description' => 'Créer des produits', 'created_at' => now(), 'updated_at' => now()],
            ['nom' => 'modifier_produits', 'garde' => 'produit', 'description' => 'Modifier des produits', 'created_at' => now(), 'updated_at' => now()],
            ['nom' => 'supprimer_produits', 'garde' => 'produit', 'description' => 'Supprimer des produits', 'created_at' => now(), 'updated_at' => now()],
            ['nom' => 'voir_produits', 'garde' => 'produit', 'description' => 'Voir les produits', 'created_at' => now(), 'updated_at' => now()],
            
            // Gestion des commandes
            ['nom' => 'creer_commandes', 'garde' => 'commande', 'description' => 'Créer des commandes', 'created_at' => now(), 'updated_at' => now()],
            ['nom' => 'modifier_commandes', 'garde' => 'commande', 'description' => 'Modifier des commandes', 'created_at' => now(), 'updated_at' => now()],
            ['nom' => 'valider_commandes', 'garde' => 'commande', 'description' => 'Valider des commandes', 'created_at' => now(), 'updated_at' => now()],
            ['nom' => 'annuler_commandes', 'garde' => 'commande', 'description' => 'Annuler des commandes', 'created_at' => now(), 'updated_at' => now()],
            ['nom' => 'voir_commandes', 'garde' => 'commande', 'description' => 'Voir les commandes', 'created_at' => now(), 'updated_at' => now()],
            
            // Gestion des stocks
            ['nom' => 'transferer_stock', 'garde' => 'stock', 'description' => 'Effectuer des transferts de stock', 'created_at' => now(), 'updated_at' => now()],
            ['nom' => 'valider_transferts', 'garde' => 'stock', 'description' => 'Valider des transferts de stock', 'created_at' => now(), 'updated_at' => now()],
            ['nom' => 'inventorier_stock', 'garde' => 'stock', 'description' => 'Effectuer des inventaires', 'created_at' => now(), 'updated_at' => now()],
            ['nom' => 'voir_stock', 'garde' => 'stock', 'description' => 'Voir les niveaux de stock', 'created_at' => now(), 'updated_at' => now()],
            
            // Gestion des factures
            ['nom' => 'creer_factures', 'garde' => 'facture', 'description' => 'Créer des factures', 'created_at' => now(), 'updated_at' => now()],
            ['nom' => 'modifier_factures', 'garde' => 'facture', 'description' => 'Modifier des factures', 'created_at' => now(), 'updated_at' => now()],
            ['nom' => 'valider_factures', 'garde' => 'facture', 'description' => 'Valider des factures', 'created_at' => now(), 'updated_at' => now()],
            ['nom' => 'annuler_factures', 'garde' => 'facture', 'description' => 'Annuler des factures', 'created_at' => now(), 'updated_at' => now()],
            ['nom' => 'voir_factures', 'garde' => 'facture', 'description' => 'Voir les factures', 'created_at' => now(), 'updated_at' => now()],
            
            // Gestion des utilisateurs
            ['nom' => 'gerer_utilisateurs', 'garde' => 'admin', 'description' => 'Gérer les utilisateurs', 'created_at' => now(), 'updated_at' => now()],
            ['nom' => 'gerer_roles', 'garde' => 'admin', 'description' => 'Gérer les rôles', 'created_at' => now(), 'updated_at' => now()],
            ['nom' => 'gerer_permissions', 'garde' => 'admin', 'description' => 'Gérer les permissions', 'created_at' => now(), 'updated_at' => now()],
            ['nom' => 'assigner_roles', 'garde' => 'admin', 'description' => 'Assigner des rôles', 'created_at' => now(), 'updated_at' => now()],
        ]);

        // ============================================
        // 3. RÉCUPÉRER LES IDS
        // ============================================
        $adminRoleId = DB::table('roles')->where('nom', 'administrateur')->value('id');
        $stockRoleId = DB::table('roles')->where('nom', 'gestionnaire_stock')->value('id');
        $commercialRoleId = DB::table('roles')->where('nom', 'commercial')->value('id');
        $comptableRoleId = DB::table('roles')->where('nom', 'comptable')->value('id');
        $lecteurRoleId = DB::table('roles')->where('nom', 'lecteur')->value('id');

        $allPermissionIds = DB::table('permissions')->pluck('id')->toArray();
        $produitPermissions = DB::table('permissions')->where('garde', 'produit')->pluck('id')->toArray();
        $commandePermissions = DB::table('permissions')->where('garde', 'commande')->pluck('id')->toArray();
        $stockPermissions = DB::table('permissions')->where('garde', 'stock')->pluck('id')->toArray();
        $facturePermissions = DB::table('permissions')->where('garde', 'facture')->pluck('id')->toArray();

        // ============================================
        // 4. ASSIGNER LES PERMISSIONS AUX RÔLES
        // ============================================
        
        // Administrateur : TOUTES les permissions
        foreach ($allPermissionIds as $permId) {
            DB::table('role_permission')->insert([
                'role_id' => $adminRoleId,
                'permission_id' => $permId,
                'created_at' => now(),
                'updated_at' => now(),
            ]);
        }

        // Gestionnaire de stock : produits + stock
        $stockAllPermissions = array_merge($produitPermissions, $stockPermissions);
        foreach ($stockAllPermissions as $permId) {
            DB::table('role_permission')->insert([
                'role_id' => $stockRoleId,
                'permission_id' => $permId,
                'created_at' => now(),
                'updated_at' => now(),
            ]);
        }

        // Commercial : produits (lecture) + commandes
        $commercialAllPermissions = array_merge(
            [DB::table('permissions')->where('nom', 'voir_produits')->value('id')],
            $commandePermissions,
            [DB::table('permissions')->where('nom', 'voir_stock')->value('id')]
        );
        foreach ($commercialAllPermissions as $permId) {
            if ($permId) {
                DB::table('role_permission')->insert([
                    'role_id' => $commercialRoleId,
                    'permission_id' => $permId,
                    'created_at' => now(),
                    'updated_at' => now(),
                ]);
            }
        }

        // Comptable : factures + lectures
        $comptableAllPermissions = array_merge(
            $facturePermissions,
            [
                DB::table('permissions')->where('nom', 'voir_produits')->value('id'),
                DB::table('permissions')->where('nom', 'voir_commandes')->value('id'),
                DB::table('permissions')->where('nom', 'voir_stock')->value('id'),
            ]
        );
        foreach ($comptableAllPermissions as $permId) {
            if ($permId) {
                DB::table('role_permission')->insert([
                    'role_id' => $comptableRoleId,
                    'permission_id' => $permId,
                    'created_at' => now(),
                    'updated_at' => now(),
                ]);
            }
        }

        // Lecteur : seulement les lectures
        $lecteurPermissions = DB::table('permissions')->whereIn('nom', [
            'voir_produits', 'voir_commandes', 'voir_stock', 'voir_factures'
        ])->pluck('id')->toArray();
        foreach ($lecteurPermissions as $permId) {
            DB::table('role_permission')->insert([
                'role_id' => $lecteurRoleId,
                'permission_id' => $permId,
                'created_at' => now(),
                'updated_at' => now(),
            ]);
        }

        // ============================================
        // 5. INSÉRER LES UTILISATEURS
        // ============================================
        DB::table('utilisateurs')->insert([
            [
                'nom' => 'Pierre Famba',
                'email' => 'pierre@gmail.com',
                'mot_de_passe' => Hash::make('12345678'),
                'actif' => 1,
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'nom' => 'Jean Dupont',
                'email' => 'jean@exemple.com',
                'mot_de_passe' => Hash::make('password123'),
                'actif' => 1,
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'nom' => 'Marie Martin',
                'email' => 'marie@exemple.com',
                'mot_de_passe' => Hash::make('password123'),
                'actif' => 1,
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'nom' => 'Pierre Durand',
                'email' => 'pierre.durand@exemple.com',
                'mot_de_passe' => Hash::make('password123'),
                'actif' => 1,
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'nom' => 'Sophie Lefèvre',
                'email' => 'sophie@exemple.com',
                'mot_de_passe' => Hash::make('password123'),
                'actif' => 1,
                'created_at' => now(),
                'updated_at' => now(),
            ],
        ]);

        // ============================================
        // 6. ASSIGNER LES RÔLES AUX UTILISATEURS
        // ============================================
        $pierreId = DB::table('utilisateurs')->where('email', 'pierre@gmail.com')->value('id');
        $jeanId = DB::table('utilisateurs')->where('email', 'jean@exemple.com')->value('id');
        $marieId = DB::table('utilisateurs')->where('email', 'marie@exemple.com')->value('id');
        $pierreDurandId = DB::table('utilisateurs')->where('email', 'pierre.durand@exemple.com')->value('id');
        $sophieId = DB::table('utilisateurs')->where('email', 'sophie@exemple.com')->value('id');

        // Assigner les rôles
        DB::table('utilisateur_role')->insert([
            ['utilisateur_id' => $pierreId, 'role_id' => $adminRoleId, 'created_at' => now(), 'updated_at' => now()],
            ['utilisateur_id' => $jeanId, 'role_id' => $stockRoleId, 'created_at' => now(), 'updated_at' => now()],
            ['utilisateur_id' => $marieId, 'role_id' => $commercialRoleId, 'created_at' => now(), 'updated_at' => now()],
            ['utilisateur_id' => $pierreDurandId, 'role_id' => $comptableRoleId, 'created_at' => now(), 'updated_at' => now()],
            ['utilisateur_id' => $sophieId, 'role_id' => $lecteurRoleId, 'created_at' => now(), 'updated_at' => now()],
        ]);

        $this->command->info('✅ Seeders exécutés avec succès !');
        $this->command->info('📧 Email administrateur: pierre@gmail.com');
        $this->command->info('🔑 Mot de passe: 12345678');
    }
}