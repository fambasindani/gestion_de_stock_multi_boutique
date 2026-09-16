<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up()
    {
        Schema::create('ligne_operation_stock', function (Blueprint $table) {
            $table->id();
            $table->unsignedBigInteger('mouvement_id');
            $table->unsignedBigInteger('produit_id');
            $table->unsignedBigInteger('lot_id')->nullable();
            $table->string('code_barres', 255)->nullable();
            $table->decimal('quantite_traitee', 16, 2);
            $table->unsignedBigInteger('emplacement_source_id');
            $table->unsignedBigInteger('emplacement_destination_id');
            $table->unsignedBigInteger('utilisateur_id')->nullable();
            $table->datetime('date_operation');
            $table->string('type_operation', 50)->comment('prelevement, reception, scan, etc.');
            $table->text('notes')->nullable();
            $table->timestamps();

            // Clés étrangères
            $table->foreign('mouvement_id')
                  ->references('id')
                  ->on('mouvement_stock')
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

            $table->foreign('utilisateur_id')
                  ->references('id')
                  ->on('utilisateurs')
                  ->onDelete('set null');

            // Index
            $table->index('mouvement_id');
            $table->index('date_operation');
            $table->index('type_operation');
            $table->index(['mouvement_id', 'type_operation']);
        });
    }

    public function down()
    {
        Schema::dropIfExists('ligne_operation_stock');
    }
};