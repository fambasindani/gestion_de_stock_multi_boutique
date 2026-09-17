<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    /**
     * Complète le jeu de permissions (modules emplacements, unités, inventaire,
     * POS, paramètres, rapports, + permissions de lecture manquantes).
     */
    public function up()
    {
        $permissions = [
            // Lecture
            'voir_partenaires' => ['partenaire', 'Consulter les partenaires'],
            'voir_categories' => ['produit', 'Consulter les catégories'],
            'voir_unites' => ['produit', 'Consulter les unités de mesure'],
            'voir_emplacements' => ['stock', 'Consulter les emplacements'],
            'voir_lots' => ['stock', 'Consulter les lots / séries'],
            'voir_inventaire' => ['stock', 'Consulter les inventaires'],
            'voir_rapports' => ['rapport', 'Accéder aux rapports'],
            // Écriture
            'gerer_emplacements' => ['stock', 'Créer / modifier / supprimer les emplacements'],
            'gerer_unites' => ['produit', 'Créer / modifier / supprimer les unités de mesure'],
            'gerer_inventaire' => ['stock', 'Créer et saisir les inventaires'],
            'valider_inventaire' => ['stock', 'Valider un inventaire (ajuste le stock)'],
            'vendre_pos' => ['vente', 'Réaliser des ventes comptoir (POS)'],
            'gerer_parametres' => ['admin', 'Modifier les paramètres (TVA, société, ticket)'],
        ];

        $roleIds = DB::table('roles')
            ->whereIn('nom', ['administrateur', 'Administrateur', 'ADMIN'])
            ->pluck('id');

        foreach ($permissions as $nom => [$garde, $description]) {
            $id = DB::table('permissions')->where('nom', $nom)->value('id');
            if (!$id) {
                $id = DB::table('permissions')->insertGetId([
                    'nom' => $nom,
                    'garde' => $garde,
                    'description' => $description,
                    'created_at' => now(),
                    'updated_at' => now(),
                ]);
            }

            foreach ($roleIds as $roleId) {
                $exists = DB::table('role_permission')
                    ->where('role_id', $roleId)
                    ->where('permission_id', $id)
                    ->exists();
                if (!$exists) {
                    DB::table('role_permission')->insert([
                        'role_id' => $roleId,
                        'permission_id' => $id,
                        'created_at' => now(),
                        'updated_at' => now(),
                    ]);
                }
            }
        }
    }

    public function down()
    {
        $noms = [
            'voir_partenaires', 'voir_categories', 'voir_unites', 'voir_emplacements',
            'voir_lots', 'voir_inventaire', 'voir_rapports', 'gerer_emplacements',
            'gerer_unites', 'gerer_inventaire', 'valider_inventaire', 'vendre_pos',
            'gerer_parametres',
        ];

        foreach ($noms as $nom) {
            $id = DB::table('permissions')->where('nom', $nom)->value('id');
            if ($id) {
                DB::table('role_permission')->where('permission_id', $id)->delete();
                DB::table('permissions')->where('id', $id)->delete();
            }
        }
    }
};
