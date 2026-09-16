<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    public function up()
    {
        if (!Schema::hasTable('parametres')) {
            Schema::create('parametres', function (Blueprint $table) {
                $table->id();
                $table->unsignedBigInteger('societe_id')->nullable()->index();
                $table->string('cle');
                $table->text('valeur')->nullable();
                $table->string('description')->nullable();
                $table->timestamps();
                $table->unique(['societe_id', 'cle'], 'unique_parametre_societe');
            });
        }

        if (Schema::hasTable('commande_vente') && !Schema::hasColumn('commande_vente', 'client_nom')) {
            Schema::table('commande_vente', function (Blueprint $table) {
                $table->string('client_nom')->nullable()->after('partenaire_id');
            });
        }

        // Valeurs par défaut pour la société par défaut
        $societeId = DB::table('societes')->value('id');
        $defaults = [
            'tva_taux' => ['16', 'Taux de TVA par défaut (%)'],
            'entreprise_nom' => ['', 'Nom affiché sur le ticket'],
            'entreprise_adresse' => ['', 'Adresse affichée sur le ticket'],
            'entreprise_telephone' => ['', 'Téléphone affiché sur le ticket'],
            'ticket_message' => ['Merci de votre visite !', 'Message de bas de ticket'],
        ];

        foreach ($defaults as $cle => [$valeur, $description]) {
            $exists = DB::table('parametres')->where('societe_id', $societeId)->where('cle', $cle)->exists();
            if (!$exists) {
                DB::table('parametres')->insert([
                    'societe_id' => $societeId,
                    'cle' => $cle,
                    'valeur' => $valeur,
                    'description' => $description,
                    'created_at' => now(),
                    'updated_at' => now(),
                ]);
            }
        }
    }

    public function down()
    {
        if (Schema::hasTable('commande_vente') && Schema::hasColumn('commande_vente', 'client_nom')) {
            Schema::table('commande_vente', function (Blueprint $table) {
                $table->dropColumn('client_nom');
            });
        }
        Schema::dropIfExists('parametres');
    }
};
