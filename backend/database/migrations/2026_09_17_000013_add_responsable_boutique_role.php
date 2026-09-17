<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    /**
     * Rôle "responsable_boutique" : accès complet à sa boutique,
     * mais sans gestion des référentiels globaux (rôles, permissions, sociétés).
     */
    public function up(): void
    {
        $now = now();

        $roleId = DB::table('roles')->where('nom', 'responsable_boutique')->value('id');

        if (!$roleId) {
            $roleId = DB::table('roles')->insertGetId([
                'nom' => 'responsable_boutique',
                'description' => 'Responsable d\'une boutique : accès complet, limité à sa société',
                'societe_id' => null,
                'actif' => 1,
                'created_at' => $now,
                'updated_at' => $now,
            ]);
        }

        $exclus = ['gerer_roles', 'gerer_permissions', 'gerer_societes'];

        $permissionIds = DB::table('role_permission')
            ->join('roles', 'roles.id', '=', 'role_permission.role_id')
            ->join('permissions', 'permissions.id', '=', 'role_permission.permission_id')
            ->where('roles.nom', 'administrateur')
            ->whereNotIn('permissions.nom', $exclus)
            ->pluck('permissions.id')
            ->unique()
            ->values();

        DB::table('role_permission')->where('role_id', $roleId)->delete();

        $rows = $permissionIds->map(fn ($pid) => [
            'role_id' => $roleId,
            'permission_id' => $pid,
            'created_at' => $now,
            'updated_at' => $now,
        ])->all();

        if (!empty($rows)) {
            DB::table('role_permission')->insert($rows);
        }
    }

    public function down(): void
    {
        $roleId = DB::table('roles')->where('nom', 'responsable_boutique')->value('id');
        if ($roleId) {
            DB::table('role_permission')->where('role_id', $roleId)->delete();
            DB::table('roles')->where('id', $roleId)->delete();
        }
    }
};
