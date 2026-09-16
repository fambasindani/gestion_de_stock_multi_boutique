<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up()
    {
        Schema::create('ligne_ecriture_comptable', function (Blueprint $table) {
            $table->id();
            $table->unsignedBigInteger('ecriture_comptable_id');
            $table->unsignedBigInteger('produit_id')->nullable();
            $table->string('code_produit', 255)->nullable();
            $table->string('nom_produit', 255);
            $table->text('description')->nullable();
            $table->decimal('quantite', 16, 2)->default(1);
            $table->decimal('prix_unitaire_ht', 16, 2);
            $table->decimal('prix_unitaire_ttc', 16, 2)->default(0);
            $table->decimal('taux_remise', 5, 2)->default(0);
            $table->decimal('montant_remise', 16, 2)->default(0);
            $table->decimal('montant_ht', 16, 2)->default(0);
            $table->decimal('montant_tva', 16, 2)->default(0);
            $table->decimal('montant_ttc', 16, 2)->default(0);
            $table->decimal('taux_tva', 5, 2)->default(0);
            $table->string('compte_comptable', 20)->nullable();
            $table->string('compte_tva', 20)->nullable();
            $table->text('notes')->nullable();
            $table->timestamps();

            // Clés étrangères
            $table->foreign('ecriture_comptable_id')
                  ->references('id')
                  ->on('ecriture_comptable')
                  ->onDelete('cascade');

            $table->foreign('produit_id')
                  ->references('id')
                  ->on('variante_produit')
                  ->onDelete('set null');

            // Index
            $table->index('ecriture_comptable_id');
            $table->index('produit_id');
            $table->index('code_produit');
        });
    }

    public function down()
    {
        Schema::dropIfExists('ligne_ecriture_comptable');
    }
};