<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    public function up()
    {
        // 1. Table des sociétés (boutiques / clients abonnés)
        if (!Schema::hasTable('societes')) {
            Schema::create('societes', function (Blueprint $table) {
                $table->id();
                $table->string('nom');
                $table->string('code', 50)->unique();
                $table->string('email')->nullable();
                $table->string('telephone')->nullable();
                $table->string('adresse')->nullable();
                $table->boolean('actif')->default(true);
                $table->date('date_abonnement')->nullable();
                $table->date('date_expiration')->nullable();
                $table->text('notes')->nullable();
                $table->timestamps();
            });
        }

        // Société par défaut pour les données existantes
        $defaultId = DB::table('societes')->value('id');
        if (!$defaultId) {
            $defaultId = DB::table('societes')->insertGetId([
                'nom' => 'GS Stock',
                'code' => 'GS-STOCK',
                'actif' => true,
                'date_abonnement' => now()->toDateString(),
                'created_at' => now(),
                'updated_at' => now(),
            ]);
        }

        // 2. Flag super-admin sur les utilisateurs
        if (!Schema::hasColumn('utilisateurs', 'est_super_admin')) {
            Schema::table('utilisateurs', function (Blueprint $table) {
                $table->boolean('est_super_admin')->default(false)->after('actif');
            });
        }

        DB::table('utilisateurs')->whereNull('societe_id')->update(['societe_id' => $defaultId]);
        // Le premier utilisateur devient super-admin
        if (!DB::table('utilisateurs')->where('est_super_admin', true)->exists()) {
            $first = DB::table('utilisateurs')->orderBy('id')->value('id');
            if ($first) {
                DB::table('utilisateurs')->where('id', $first)->update(['est_super_admin' => true]);
            }
        }

        // 3. Ajouter societe_id aux tables qui n'en ont pas
        $tables = [
            'categorie_produit',
            'produit_modele',
            'variante_produit',
            'unite_mesure',
            'partenaire',
            'commande_vente',
            'commande_achat',
            'inventaires',
            'mouvement_stock',
        ];

        foreach ($tables as $table) {
            if (Schema::hasTable($table) && !Schema::hasColumn($table, 'societe_id')) {
                Schema::table($table, function (Blueprint $t) {
                    $t->unsignedBigInteger('societe_id')->nullable()->index();
                });
            }
        }

        // 4. Reprendre les données existantes dans la société par défaut
        $allTables = array_merge($tables, [
            'transfert_stock',
            'quantite_stock',
            'emplacement_stock',
            'lot_tracabilite',
            'ecriture_comptable',
        ]);

        foreach ($allTables as $table) {
            if (Schema::hasTable($table) && Schema::hasColumn($table, 'societe_id')) {
                DB::table($table)->whereNull('societe_id')->update(['societe_id' => $defaultId]);
            }
        }
    }

    public function down()
    {
        $tables = [
            'categorie_produit',
            'produit_modele',
            'variante_produit',
            'unite_mesure',
            'partenaire',
            'commande_vente',
            'commande_achat',
            'inventaires',
            'mouvement_stock',
        ];

        foreach ($tables as $table) {
            if (Schema::hasTable($table) && Schema::hasColumn($table, 'societe_id')) {
                Schema::table($table, function (Blueprint $t) {
                    $t->dropColumn('societe_id');
                });
            }
        }

        if (Schema::hasColumn('utilisateurs', 'est_super_admin')) {
            Schema::table('utilisateurs', function (Blueprint $table) {
                $table->dropColumn('est_super_admin');
            });
        }

        Schema::dropIfExists('societes');
    }
};
