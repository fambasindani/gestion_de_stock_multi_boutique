<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    public function up()
    {
        if (Schema::hasTable('audit_logs') && !Schema::hasColumn('audit_logs', 'societe_id')) {
            Schema::table('audit_logs', function (Blueprint $table) {
                $table->unsignedBigInteger('societe_id')->nullable()->after('user_id')->index();
            });
        }

        // Rattacher les logs existants à la société de leur utilisateur
        if (Schema::hasColumn('audit_logs', 'societe_id')) {
            DB::statement(
                'UPDATE audit_logs al
                 JOIN utilisateurs u ON u.id = al.user_id
                 SET al.societe_id = u.societe_id
                 WHERE al.societe_id IS NULL AND u.societe_id IS NOT NULL'
            );
        }
    }

    public function down()
    {
        if (Schema::hasTable('audit_logs') && Schema::hasColumn('audit_logs', 'societe_id')) {
            Schema::table('audit_logs', function (Blueprint $table) {
                $table->dropColumn('societe_id');
            });
        }
    }
};
