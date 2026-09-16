<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class CleanDataSeeder extends Seeder
{
    public function run()
    {
        DB::statement('SET FOREIGN_KEY_CHECKS=0');

        // Tables à vider (ordre inverse des dépendances)
        $tables = [
            'ligne_ecriture_comptable',
            'ecriture_comptable',
            'ligne_operation_stock',
            'mouvement_stock',
            'transfert_stock',
            'quantite_stock',
            'lot_tracabilite',
            'ligne_commande_achat',
            'commande_achat',
            'ligne_commande_vente',
            'commande_vente',
            'variante_produit',
            'produit_modele',
            'audit_logs',
            'personal_access_tokens',
        ];

        foreach ($tables as $table) {
            DB::table($table)->truncate();
            $this->command->info("  ✅ Vidé : $table");
        }

        DB::statement('SET FOREIGN_KEY_CHECKS=1');

        $this->command->info('');
        $this->command->info('✅ Données nettoyées avec succès !');
        $this->command->info('Tables conservées : utilisateurs, roles, permissions, catégories, partenaires, emplacements');
    }
}
