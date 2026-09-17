<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up()
    {
        if (Schema::hasTable('commande_vente') && !Schema::hasColumn('commande_vente', 'source')) {
            Schema::table('commande_vente', function (Blueprint $table) {
                $table->string('source', 20)->nullable()->after('etat');
            });
        }
    }

    public function down()
    {
        if (Schema::hasTable('commande_vente') && Schema::hasColumn('commande_vente', 'source')) {
            Schema::table('commande_vente', function (Blueprint $table) {
                $table->dropColumn('source');
            });
        }
    }
};
