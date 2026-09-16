<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up()
    {
        Schema::create('quantite_stock', function (Blueprint $table) {
            $table->id();
            $table->unsignedBigInteger('produit_id');
            $table->unsignedBigInteger('emplacement_id');
            $table->unsignedBigInteger('lot_id')->nullable();
            $table->decimal('quantite_disponible', 16, 2)->default(0);
            $table->decimal('quantite_reservee', 16, 2)->default(0);
            $table->decimal('quantite_commande', 16, 2)->default(0)->comment('Quantité commandée mais pas encore reçue');
            $table->decimal('quantite_controlee', 16, 2)->default(0)->comment('Quantité en contrôle qualité');
            $table->decimal('seuil_minimum', 16, 2)->nullable();
            $table->decimal('seuil_maximum', 16, 2)->nullable();
            $table->unsignedBigInteger('societe_id')->nullable();
            $table->date('date_dernier_mouvement')->nullable();
            $table->date('date_prochaine_reception')->nullable();
            $table->text('notes')->nullable();
            $table->timestamps();

            // Clés étrangères
            $table->foreign('produit_id')
                  ->references('id')
                  ->on('variante_produit')
                  ->onDelete('restrict');

            $table->foreign('emplacement_id')
                  ->references('id')
                  ->on('emplacement_stock')
                  ->onDelete('restrict');

            $table->foreign('lot_id')
                  ->references('id')
                  ->on('lot_tracabilite')
                  ->onDelete('set null');

            // Index uniques : un produit, un emplacement, un lot = une seule ligne
            $table->unique(['produit_id', 'emplacement_id', 'lot_id'], 'unique_stock_quant');
            
            // Index pour les recherches
            $table->index('produit_id');
            $table->index('emplacement_id');
            $table->index('lot_id');
            $table->index('date_dernier_mouvement');
        });
    }

    public function down()
    {
        Schema::dropIfExists('quantite_stock');
    }
};