<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up()
    {
        Schema::create('commande_achat', function (Blueprint $table) {
            $table->id();
            $table->string('reference', 50)->unique();
            $table->unsignedBigInteger('partenaire_id');
            $table->date('date_commande');
            $table->date('date_livraison_prevue')->nullable();
            $table->date('date_livraison_reelle')->nullable();
            $table->enum('etat', ['brouillon', 'confirme', 'envoye', 'recu', 'termine', 'annule'])->default('brouillon');
            $table->decimal('montant_total_ht', 16, 2)->default(0);
            $table->decimal('montant_total_ttc', 16, 2)->default(0);
            $table->decimal('montant_remise', 16, 2)->default(0);
            $table->decimal('taux_remise', 5, 2)->default(0);
            $table->decimal('frais_livraison', 16, 2)->default(0);
            $table->text('notes')->nullable();
            $table->string('adresse_livraison')->nullable();
            $table->string('adresse_facturation')->nullable();
            $table->string('mode_paiement', 50)->nullable();
            $table->string('reference_commande_fournisseur', 100)->nullable();
            $table->unsignedBigInteger('cree_par_utilisateur_id')->nullable();
            $table->unsignedBigInteger('modifie_par_utilisateur_id')->nullable();
            $table->boolean('actif')->default(1);
            $table->timestamps();

            // Clés étrangères
            $table->foreign('partenaire_id')
                  ->references('id')
                  ->on('partenaire')
                  ->onDelete('restrict');

            $table->foreign('cree_par_utilisateur_id')
                  ->references('id')
                  ->on('utilisateurs')
                  ->onDelete('set null');

            $table->foreign('modifie_par_utilisateur_id')
                  ->references('id')
                  ->on('utilisateurs')
                  ->onDelete('set null');

            // Index
            $table->index('reference');
            $table->index('date_commande');
            $table->index('etat');
            $table->index(['partenaire_id', 'etat']);
        });
    }

    public function down()
    {
        Schema::dropIfExists('commande_achat');
    }
};