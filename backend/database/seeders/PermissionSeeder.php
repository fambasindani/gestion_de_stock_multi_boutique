<?php

namespace Database\Seeders;

use App\Models\Permission;
use Illuminate\Database\Seeder;

class PermissionSeeder extends Seeder
{
    public function run()
    {
        $permissions = [
            // Produits
            ['nom' => 'creer_produits', 'garde' => 'produit', 'description' => 'Créer des produits'],
            ['nom' => 'modifier_produits', 'garde' => 'produit', 'description' => 'Modifier des produits'],
            ['nom' => 'supprimer_produits', 'garde' => 'produit', 'description' => 'Supprimer des produits'],
            ['nom' => 'voir_produits', 'garde' => 'produit', 'description' => 'Voir les produits'],
            
            // Commandes
            ['nom' => 'creer_commandes', 'garde' => 'commande', 'description' => 'Créer des commandes'],
            ['nom' => 'modifier_commandes', 'garde' => 'commande', 'description' => 'Modifier des commandes'],
            ['nom' => 'valider_commandes', 'garde' => 'commande', 'description' => 'Valider des commandes'],
            ['nom' => 'annuler_commandes', 'garde' => 'commande', 'description' => 'Annuler des commandes'],
            ['nom' => 'voir_commandes', 'garde' => 'commande', 'description' => 'Voir les commandes'],
            
            // Stock
            ['nom' => 'transferer_stock', 'garde' => 'stock', 'description' => 'Effectuer des transferts'],
            ['nom' => 'valider_transferts', 'garde' => 'stock', 'description' => 'Valider des transferts'],
            ['nom' => 'inventorier_stock', 'garde' => 'stock', 'description' => 'Effectuer des inventaires'],
            ['nom' => 'voir_stock', 'garde' => 'stock', 'description' => 'Voir les niveaux de stock'],
            
            // Factures
            ['nom' => 'creer_factures', 'garde' => 'facture', 'description' => 'Créer des factures'],
            ['nom' => 'modifier_factures', 'garde' => 'facture', 'description' => 'Modifier des factures'],
            ['nom' => 'valider_factures', 'garde' => 'facture', 'description' => 'Valider des factures'],
            ['nom' => 'annuler_factures', 'garde' => 'facture', 'description' => 'Annuler des factures'],
            ['nom' => 'voir_factures', 'garde' => 'facture', 'description' => 'Voir les factures'],
            
            // Administration
            ['nom' => 'gerer_utilisateurs', 'garde' => 'admin', 'description' => 'Gérer les utilisateurs'],
            ['nom' => 'gerer_roles', 'garde' => 'admin', 'description' => 'Gérer les rôles'],
            ['nom' => 'gerer_permissions', 'garde' => 'admin', 'description' => 'Gérer les permissions'],
            ['nom' => 'assigner_roles', 'garde' => 'admin', 'description' => 'Assigner des rôles'],
        ];

        foreach ($permissions as $perm) {
            Permission::create($perm);
        }
    }
}