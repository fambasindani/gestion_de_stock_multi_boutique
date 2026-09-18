<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    /**
     * Un commercial ne gère pas le stock ni les transferts.
     * On retire ces droits du rôle "commercial".
     */
    public function up(): void
    {
        $roleId = DB::table('roles')->where('nom', 'commercial')->value('id');
        if (!$roleId) {
            return;
        }

        $aRetirer = ['transferer_stock', 'valider_transferts', 'gerer_stock', 'inventorier_stock'];

        $permissionIds = DB::table('permissions')->whereIn('nom', $aRetirer)->pluck('id');

        DB::table('role_permission')
            ->where('role_id', $roleId)
            ->whereIn('permission_id', $permissionIds)
            ->delete();
    }

    public function down(): void
    {
        // Pas de retour (correction de données).
    }
};
