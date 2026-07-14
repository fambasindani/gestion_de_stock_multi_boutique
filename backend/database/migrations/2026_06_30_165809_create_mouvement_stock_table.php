<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up()
    {
        Schema::create('mouvement_stock', function (Blueprint $table) {
            $table->id();
            $table->unsignedBigInteger('transfert_id');
            $table->unsignedBigInteger('produit_id');
            $table->unsignedBigInteger('lot_id')->nullable();
            $table->string('code_produit', 255)->nullable();
            $table->string('nom_produit', 255);
            $table->text('description')->nullable();
            $table->decimal('quantite_demandee', 16, 2);
            $table->decimal('quantite_traitee', 16, 2)->default(0);
            $table->decimal('quantite_reservee', 16, 2)->default(0);
            $table->unsignedBigInteger('emplacement_source_id');
            $table->unsignedBigInteger('emplacement_destination_id');
            $table->unsignedBigInteger('emplacement_source_reel_id')->nullable();
            $table->unsignedBigInteger('emplacement_destination_reel_id')->nullable();
            $table->enum('etat', ['brouillon', 'attente', 'confirme', 'assigne', 'termine', 'annule'])->default('brouillon');
            $table->string('unite', 50)->nullable();
            $table->decimal('poids_unitaire', 16, 4)->nullable();
            $table->decimal('volume_unitaire', 16, 4)->nullable();
            $table->date('date_prelevement')->nullable();
            $table->date('date_reception')->nullable();
            $table->text('notes')->nullable();
            $table->timestamps();

            // Clés étrangères
            $table->foreign('transfert_id')
                  ->references('id')
                  ->on('transfert_stock')
                  ->onDelete('cascade');

            $table->foreign('produit_id')
                  ->references('id')
                  ->on('variante_produit')
                  ->onDelete('restrict');

            $table->foreign('lot_id')
                  ->references('id')
                  ->on('lot_tracabilite')
                  ->onDelete('set null');

            $table->foreign('emplacement_source_id')
                  ->references('id')
                  ->on('emplacement_stock')
                  ->onDelete('restrict');

            $table->foreign('emplacement_destination_id')
                  ->references('id')
                  ->on('emplacement_stock')
                  ->onDelete('restrict');

            $table->foreign('emplacement_source_reel_id')
                  ->references('id')
                  ->on('emplacement_stock')
                  ->onDelete('set null');

            $table->foreign('emplacement_destination_reel_id')
                  ->references('id')
                  ->on('emplacement_stock')
                  ->onDelete('set null');

            // ✅ Index avec noms raccourcis
            $table->index(['transfert_id', 'produit_id'], 'idx_mvt_transfert_produit');
            $table->index('etat', 'idx_mvt_etat');
        });
    }

    public function down()
    {
        Schema::dropIfExists('mouvement_stock');
    }
};