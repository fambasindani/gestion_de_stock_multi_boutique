<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    /**
     * Cohérence des permissions : si un rôle peut GÉRER/CRÉER une ressource,
     * il doit aussi pouvoir la LIRE. On accorde la permission "voir_*" manquante.
     */
    private array $mapping = [
        'gerer_categories' => 'voir_categories',
        'gerer_unites' => 'voir_unites',
        'gerer_produits' => 'voir_produits',
        'creer_produits' => 'voir_produits',
        'modifier_produits' => 'voir_produits',
        'supprimer_produits' => 'voir_produits',
        'gerer_partenaires' => 'voir_partenaires',
        'gerer_emplacements' => 'voir_emplacements',
        'gerer_lots' => 'voir_lots',
        'gerer_commandes' => 'voir_commandes',
        'creer_commandes' => 'voir_commandes',
        'modifier_commandes' => 'voir_commandes',
        'valider_commandes' => 'voir_commandes',
        'annuler_commandes' => 'voir_commandes',
        'gerer_achats' => 'voir_commandes',
        'gerer_factures' => 'voir_factures',
        'creer_factures' => 'voir_factures',
        'modifier_factures' => 'voir_factures',
        'valider_factures' => 'voir_factures',
        'annuler_factures' => 'voir_factures',
        'gerer_retours' => 'voir_retours',
        'valider_retours' => 'voir_retours',
        'gerer_inventaire' => 'voir_inventaire',
        'inventorier_stock' => 'voir_inventaire',
        'valider_inventaire' => 'voir_inventaire',
        'gerer_stock' => 'voir_stock',
        'transferer_stock' => 'voir_stock',
        'valider_transferts' => 'voir_stock',
    ];

    public function up(): void
    {
        $now = now();

        // id de la permission "voir_X" cible
        $voirIds = DB::table('permissions')
            ->whereIn('nom', array_values($this->mapping))
            ->pluck('id', 'nom');

        // id de la permission source
        $sourceIds = DB::table('permissions')
            ->whereIn('nom', array_keys($this->mapping))
            ->pluck('id', 'nom');

        foreach ($this->mapping as $source => $voir) {
            if (!isset($sourceIds[$source], $voirIds[$voir])) {
                continue;
            }
            $roleIds = DB::table('role_permission')
                ->where('permission_id', $sourceIds[$source])
                ->pluck('role_id')
                ->unique();

            foreach ($roleIds as $roleId) {
                $existe = DB::table('role_permission')
                    ->where('role_id', $roleId)
                    ->where('permission_id', $voirIds[$voir])
                    ->exists();

                if (!$existe) {
                    DB::table('role_permission')->insert([
                        'role_id' => $roleId,
                        'permission_id' => $voirIds[$voir],
                        'created_at' => $now,
                        'updated_at' => $now,
                    ]);
                }
            }
        }
    }

    public function down(): void
    {
        // Réparation de données : pas de retour.
    }
};
