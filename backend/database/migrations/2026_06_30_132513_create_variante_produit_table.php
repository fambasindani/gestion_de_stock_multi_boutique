<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up()
    {
        Schema::create('variante_produit', function (Blueprint $table) {
            $table->id();
            $table->unsignedBigInteger('modele_produit_id');
            $table->string('code_interne', 255)->nullable();
            $table->string('nom', 255)->nullable()->comment('Nom spécifique de la variante ex: Rouge, XL, 128GB');
            $table->decimal('prix_achat', 16, 2)->default(0);
            $table->decimal('prix_vente', 16, 2)->default(0);
            $table->decimal('poids', 10, 2)->nullable()->comment('Poids en kg');
            $table->string('reference_fournisseur', 255)->nullable();
            $table->boolean('actif')->default(1);
            $table->timestamps();

            // Clé étrangère
            $table->foreign('modele_produit_id')
                  ->references('id')
                  ->on('produit_modele')
                  ->onDelete('cascade');

            // Index pour les recherches
            $table->index('code_interne');
            $table->index('nom');
            $table->unique(['modele_produit_id', 'code_interne']);
        });
    }

    public function down()
    {
        Schema::dropIfExists('variante_produit');
    }
};