<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    /**
     * La gestion des sociétés est réservée au compte plateforme (super-admin).
     * On retire donc la permission `gerer_societes` des rôles clients (ex. administrateur),
     * sinon un admin de boutique verrait le menu Sociétés.
     */
    public function up()
    {
        $permId = DB::table('permissions')->where('nom', 'gerer_societes')->value('id');
        if ($permId) {
            DB::table('role_permission')->where('permission_id', $permId)->delete();
        }
    }

    public function down()
    {
        // Pas de restauration automatique (décision de sécurité).
    }
};
