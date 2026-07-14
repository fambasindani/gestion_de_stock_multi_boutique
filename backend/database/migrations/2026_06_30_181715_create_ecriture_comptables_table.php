<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up()
    {
        Schema::create('ecriture_comptable', function (Blueprint $table) {
            $table->id();
            $table->string('reference', 50)->unique();
            $table->string('numero_facture', 50)->nullable()->unique();
            $table->unsignedBigInteger('partenaire_id');
            $table->enum('type', ['facture_client', 'avoir_client', 'facture_fournisseur', 'avoir_fournisseur'])->default('facture_client');
            $table->date('date_emission');
            $table->date('date_echeance')->nullable();
            $table->date('date_paiement')->nullable();
            $table->decimal('montant_ht', 16, 2)->default(0);
            $table->decimal('montant_tva', 16, 2)->default(0);
            $table->decimal('montant_ttc', 16, 2)->default(0);
            $table->decimal('montant_remise', 16, 2)->default(0);
            $table->decimal('taux_remise', 5, 2)->default(0);
            $table->decimal('montant_paye', 16, 2)->default(0);
            $table->decimal('montant_restant', 16, 2)->default(0);
            $table->string('devise', 3)->default('EUR');
            $table->decimal('taux_change', 10, 4)->default(1);
            $table->unsignedBigInteger('commande_vente_id')->nullable();
            $table->unsignedBigInteger('commande_achat_id')->nullable();
            $table->unsignedBigInteger('transfert_id')->nullable();
            $table->enum('statut', ['brouillon', 'validee', 'envoyee', 'payee', 'annulee'])->default('brouillon');
            $table->string('mode_paiement', 50)->nullable();
            $table->text('notes')->nullable();
            $table->string('adresse_facturation')->nullable();
            $table->string('adresse_livraison')->nullable();
            $table->unsignedBigInteger('societe_id')->nullable();
            $table->unsignedBigInteger('cree_par_utilisateur_id')->nullable();
            $table->unsignedBigInteger('modifie_par_utilisateur_id')->nullable();
            $table->boolean('actif')->default(1);
            $table->timestamps();

            // Clés étrangères
            $table->foreign('partenaire_id')
                  ->references('id')
                  ->on('partenaire')
                  ->onDelete('restrict');

            $table->foreign('commande_vente_id')
                  ->references('id')
                  ->on('commande_vente')
                  ->onDelete('set null');

            $table->foreign('commande_achat_id')
                  ->references('id')
                  ->on('commande_achat')
                  ->onDelete('set null');

            $table->foreign('transfert_id')
                  ->references('id')
                  ->on('transfert_stock')
                  ->onDelete('set null');

           /*  $table->foreign('societe_id')
                  ->references('id')
                  ->on('societe')
                  ->onDelete('set null'); */

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
            $table->index('numero_facture');
            $table->index('type');
            $table->index('statut');
            $table->index('date_emission');
            $table->index(['partenaire_id', 'statut']);
        });
    }

    public function down()
    {
        Schema::dropIfExists('ecriture_comptable');
    }
};