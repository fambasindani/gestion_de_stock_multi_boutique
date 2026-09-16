<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    public function up()
    {
        // Logo de la société
        if (Schema::hasTable('societes') && !Schema::hasColumn('societes', 'logo')) {
            Schema::table('societes', function (Blueprint $table) {
                $table->string('logo')->nullable()->after('code');
            });
        }

        // Permission de gestion des sociétés
        $permId = DB::table('permissions')->where('nom', 'gerer_societes')->value('id');
        if (!$permId) {
            $permId = DB::table('permissions')->insertGetId([
                'nom' => 'gerer_societes',
                'garde' => 'admin',
                'description' => 'Créer/désactiver des sociétés (boutiques) et gérer les abonnements',
                'created_at' => now(),
                'updated_at' => now(),
            ]);
        }

        // Attribuer aux administrateurs existants
        $roleIds = DB::table('roles')->whereIn('nom', ['administrateur', 'Administrateur', 'ADMIN'])->pluck('id');
        foreach ($roleIds as $roleId) {
            $exists = DB::table('role_permission')
                ->where('role_id', $roleId)
                ->where('permission_id', $permId)
                ->exists();
            if (!$exists) {
                DB::table('role_permission')->insert([
                    'role_id' => $roleId,
                    'permission_id' => $permId,
                    'created_at' => now(),
                    'updated_at' => now(),
                ]);
            }
        }
    }

    public function down()
    {
        $permId = DB::table('permissions')->where('nom', 'gerer_societes')->value('id');
        if ($permId) {
            DB::table('role_permission')->where('permission_id', $permId)->delete();
            DB::table('permissions')->where('id', $permId)->delete();
        }

        if (Schema::hasTable('societes') && Schema::hasColumn('societes', 'logo')) {
            Schema::table('societes', function (Blueprint $table) {
                $table->dropColumn('logo');
            });
        }
    }
};
