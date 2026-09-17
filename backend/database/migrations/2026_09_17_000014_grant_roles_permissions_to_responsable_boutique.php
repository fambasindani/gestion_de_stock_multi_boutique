<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    /**
     * Le responsable de boutique peut voir/gestirer les rôles et permissions,
     * mais uniquement cloisonné à sa société (voir RoleController / PermissionController).
     */
    public function up(): void
    {
        $roleId = DB::table('roles')->where('nom', 'responsable_boutique')->value('id');
        if (!$roleId) {
            return;
        }

        $permissionIds = DB::table('permissions')
            ->whereIn('nom', ['gerer_roles', 'gerer_permissions'])
            ->pluck('id');

        $now = now();

        foreach ($permissionIds as $pid) {
            $exists = DB::table('role_permission')
                ->where('role_id', $roleId)
                ->where('permission_id', $pid)
                ->exists();

            if (!$exists) {
                DB::table('role_permission')->insert([
                    'role_id' => $roleId,
                    'permission_id' => $pid,
                    'created_at' => $now,
                    'updated_at' => $now,
                ]);
            }
        }
    }

    public function down(): void
    {
        $roleId = DB::table('roles')->where('nom', 'responsable_boutique')->value('id');
        if (!$roleId) {
            return;
        }

        $permissionIds = DB::table('permissions')
            ->whereIn('nom', ['gerer_roles', 'gerer_permissions'])
            ->pluck('id');

        DB::table('role_permission')
            ->where('role_id', $roleId)
            ->whereIn('permission_id', $permissionIds)
            ->delete();
    }
};
