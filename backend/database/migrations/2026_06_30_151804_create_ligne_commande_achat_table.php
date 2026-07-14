<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up()
    {
        Schema::create('ligne_commande_achat', function (Blueprint $table) {
            $table->id();
            $table->unsignedBigInteger('commande_achat_id');
            $table->unsignedBigInteger('produit_id');
            $table->string('code_produit', 255)->nullable();
            $table->string('nom_produit', 255);
            $table->string('description', 255)->nullable();
            $table->decimal('quantite', 16, 2);
            $table->decimal('quantite_recue', 16, 2)->default(0);
            $table->decimal('prix_unitaire_ht', 16, 2);
            $table->decimal('prix_unitaire_ttc', 16, 2)->default(0);
            $table->decimal('taux_remise', 5, 2)->default(0);
            $table->decimal('montant_remise', 16, 2)->default(0);
            $table->decimal('montant_total_ht', 16, 2)->default(0);
            $table->decimal('montant_total_ttc', 16, 2)->default(0);
            $table->decimal('taux_tva', 5, 2)->default(0);
            $table->date('date_livraison_prevue')->nullable();
            $table->integer('delai_livraison')->nullable()->comment('Délai en jours');
            $table->text('notes')->nullable();
            $table->timestamps();

            // Clés étrangères
            $table->foreign('commande_achat_id')
                  ->references('id')
                  ->on('commande_achat')
                  ->onDelete('cascade');

            $table->foreign('produit_id')
                  ->references('id')
                  ->on('variante_produit')
                  ->onDelete('restrict');

            // Index
            $table->index(['commande_achat_id', 'produit_id']);
            $table->index('code_produit');
        });
    }

    public function down()
    {
        Schema::dropIfExists('ligne_commande_achat');
    }
};