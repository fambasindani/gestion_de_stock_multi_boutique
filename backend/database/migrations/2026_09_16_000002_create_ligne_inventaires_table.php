<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up()
    {
        Schema::create('ligne_inventaires', function (Blueprint $table) {
            $table->id();
            $table->unsignedBigInteger('inventaire_id');
            $table->unsignedBigInteger('produit_id');
            $table->unsignedBigInteger('emplacement_id')->nullable();
            $table->decimal('quantite_theorique', 16, 2)->default(0);
            $table->decimal('quantite_physique', 16, 2)->default(0);
            $table->decimal('ecart', 16, 2)->default(0);
            $table->boolean('ajuste')->default(false);
            $table->text('notes')->nullable();
            $table->timestamps();

            $table->foreign('inventaire_id')
                  ->references('id')
                  ->on('inventaires')
                  ->onDelete('cascade');

            $table->foreign('produit_id')
                  ->references('id')
                  ->on('variante_produit')
                  ->onDelete('restrict');

            $table->foreign('emplacement_id')
                  ->references('id')
                  ->on('emplacement_stock')
                  ->onDelete('set null');

            $table->unique(['inventaire_id', 'produit_id', 'emplacement_id'], 'unique_ligne_inventaire');
            $table->index('inventaire_id');
        });
    }

    public function down()
    {
        Schema::dropIfExists('ligne_inventaires');
    }
};
