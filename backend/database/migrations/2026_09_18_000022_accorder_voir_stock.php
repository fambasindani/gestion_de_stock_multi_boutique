<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    /**
     * Cohérence : tout rôle pouvant agir sur le stock (transférer, gérer,
     * inventorier) doit aussi pouvoir le LIRE (voir_stock).
     */
    public function up(): void
    {
        $voirStockId = DB::table('permissions')->where('nom', 'voir_stock')->value('id');
        if (!$voirStockId) {
            return;
        }

        $rolesConcernes = DB::table('role_permission as rp')
            ->join('permissions as p', 'p.id', '=', 'rp.permission_id')
            ->whereIn('p.nom', ['transferer_stock', 'gerer_stock', 'inventorier_stock'])
            ->pluck('rp.role_id')
            ->unique();

        $now = now();

        foreach ($rolesConcernes as $roleId) {
            $existe = DB::table('role_permission')
                ->where('role_id', $roleId)
                ->where('permission_id', $voirStockId)
                ->exists();

            if (!$existe) {
                DB::table('role_permission')->insert([
                    'role_id' => $roleId,
                    'permission_id' => $voirStockId,
                    'created_at' => $now,
                    'updated_at' => $now,
                ]);
            }
        }
    }

    public function down(): void
    {
        // Réparation de données : pas de retour.
    }
};
