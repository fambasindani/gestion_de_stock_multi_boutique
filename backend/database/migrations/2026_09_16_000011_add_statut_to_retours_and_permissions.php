<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    public function up()
    {
        // Statut de validation du retour
        if (Schema::hasTable('retours')) {
            Schema::table('retours', function (Blueprint $table) {
                if (!Schema::hasColumn('retours', 'statut')) {
                    $table->string('statut', 20)->default('brouillon')->after('type');
                }
                if (!Schema::hasColumn('retours', 'valide_par')) {
                    $table->unsignedBigInteger('valide_par')->nullable();
                }
                if (!Schema::hasColumn('retours', 'date_validation')) {
                    $table->timestamp('date_validation')->nullable();
                }
            });
        }

        // Permissions retours
        $permissions = [
            'voir_retours' => ['stock', 'Consulter les retours en stock'],
            'gerer_retours' => ['stock', 'Créer / supprimer des retours en stock'],
            'valider_retours' => ['stock', 'Valider un retour (applique le mouvement de stock)'],
        ];

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

            // Attribuer aux administrateurs existants
            $roleIds = DB::table('roles')->whereIn('nom', ['administrateur', 'Administrateur', 'ADMIN'])->pluck('id');
            foreach ($roleIds as $roleId) {
                if (!DB::table('role_permission')->where('role_id', $roleId)->where('permission_id', $id)->exists()) {
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
        foreach (['voir_retours', 'gerer_retours', 'valider_retours'] as $nom) {
            $id = DB::table('permissions')->where('nom', $nom)->value('id');
            if ($id) {
                DB::table('role_permission')->where('permission_id', $id)->delete();
                DB::table('permissions')->where('id', $id)->delete();
            }
        }

        if (Schema::hasTable('retours')) {
            Schema::table('retours', function (Blueprint $table) {
                foreach (['statut', 'valide_par', 'date_validation'] as $col) {
                    if (Schema::hasColumn('retours', $col)) {
                        $table->dropColumn($col);
                    }
                }
            });
        }
    }
};
