<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    /**
     * Réparation : certains rôles de société ont été créés sans leurs permissions
     * (la copie depuis le rôle modèle a échoué). On resynchronise uniquement les
     * rôles qui n'ont AUCUNE permission alors que leur modèle en a.
     */
    public function up(): void
    {
        $now = now();

        $rolesSociete = DB::table('roles')
            ->whereNotNull('societe_id')
            ->get(['id', 'nom', 'societe_id']);

        foreach ($rolesSociete as $role) {
            $deja = DB::table('role_permission')->where('role_id', $role->id)->count();
            if ($deja > 0) {
                continue;
            }

            $modeleId = DB::table('roles')
                ->whereNull('societe_id')
                ->where('nom', $role->nom)
                ->value('id');

            if (!$modeleId) {
                continue;
            }

            $permissionIds = DB::table('role_permission')
                ->where('role_id', $modeleId)
                ->pluck('permission_id');

            foreach ($permissionIds as $pid) {
                $existe = DB::table('role_permission')
                    ->where('role_id', $role->id)
                    ->where('permission_id', $pid)
                    ->exists();

                if (!$existe) {
                    DB::table('role_permission')->insert([
                        'role_id' => $role->id,
                        'permission_id' => $pid,
                        'created_at' => $now,
                        'updated_at' => $now,
                    ]);
                }
            }
        }
    }

    public function down(): void
    {
        // Réparation : pas de retour arrière.
    }
};
