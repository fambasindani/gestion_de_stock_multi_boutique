<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Les rôles deviennent propres à chaque boutique :
     * - le nom n'est plus unique globalement mais par société ;
     * - chaque société reçoit une copie de ses rôles par défaut ;
     * - les utilisateurs existants sont re-pointés vers les rôles de leur société.
     */
    public function up(): void
    {
        // 1) Unicité : nom unique par société (les rôles globaux gardent societe_id = null)
        try {
            Schema::table('roles', function (Blueprint $table) {
                $table->dropUnique('roles_nom_unique');
            });
        } catch (\Throwable $e) {
            // index déjà supprimé
        }

        try {
            Schema::table('roles', function (Blueprint $table) {
                $table->unique(['societe_id', 'nom'], 'roles_societe_nom_unique');
            });
        } catch (\Throwable $e) {
            // index déjà présent
        }

        $now = now();
        $globaux = DB::table('roles')->whereNull('societe_id')->get();
        $societes = DB::table('societes')->pluck('id');

        // 2) Copier les rôles globaux pour chaque société
        foreach ($societes as $societeId) {
            foreach ($globaux as $modele) {
                $existant = DB::table('roles')
                    ->where('societe_id', $societeId)
                    ->where('nom', $modele->nom)
                    ->first();

                if ($existant) {
                    $copieId = $existant->id;
                } else {
                    $copieId = DB::table('roles')->insertGetId([
                        'nom' => $modele->nom,
                        'description' => $modele->description,
                        'societe_id' => $societeId,
                        'actif' => $modele->actif,
                        'created_at' => $now,
                        'updated_at' => $now,
                    ]);

                    DB::table('role_permission')
                        ->where('role_id', $modele->id)
                        ->get(['permission_id'])
                        ->each(function ($rp) use ($copieId, $now) {
                            DB::table('role_permission')->insert([
                                'role_id' => $copieId,
                                'permission_id' => $rp->permission_id,
                                'created_at' => $now,
                                'updated_at' => $now,
                            ]);
                        });
                }
            }
        }

        // 3) Re-pointer les utilisateurs vers les rôles de leur société
        $utilisateurs = DB::table('utilisateurs')->whereNotNull('societe_id')->get(['id', 'societe_id']);

        foreach ($utilisateurs as $u) {
            $roleIds = DB::table('utilisateur_role')
                ->where('utilisateur_id', $u->id)
                ->pluck('role_id');

            foreach ($roleIds as $rid) {
                $role = DB::table('roles')->where('id', $rid)->first(['id', 'nom', 'societe_id']);

                // Déjà un rôle de société : on ne touche pas
                if (!$role || $role->societe_id !== null) {
                    continue;
                }

                $cible = DB::table('roles')
                    ->where('societe_id', $u->societe_id)
                    ->where('nom', $role->nom)
                    ->value('id');

                if (!$cible) {
                    continue;
                }

                $dejaLa = DB::table('utilisateur_role')
                    ->where('utilisateur_id', $u->id)
                    ->where('role_id', $cible)
                    ->exists();

                if ($dejaLa) {
                    DB::table('utilisateur_role')
                        ->where('utilisateur_id', $u->id)
                        ->where('role_id', $rid)
                        ->delete();
                } else {
                    DB::table('utilisateur_role')
                        ->where('utilisateur_id', $u->id)
                        ->where('role_id', $rid)
                        ->update(['role_id' => $cible, 'updated_at' => $now]);
                }
            }
        }
    }

    public function down(): void
    {
        try {
            Schema::table('roles', function (Blueprint $table) {
                $table->dropUnique('roles_societe_nom_unique');
            });
        } catch (\Throwable $e) {
        }

        try {
            Schema::table('roles', function (Blueprint $table) {
                $table->unique('nom', 'roles_nom_unique');
            });
        } catch (\Throwable $e) {
        }
    }
};
