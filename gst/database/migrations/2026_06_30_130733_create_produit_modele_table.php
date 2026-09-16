<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up()
    {
        Schema::create('produit_modele', function (Blueprint $table) {
            $table->id();
            $table->string('nom', 255);
            $table->text('description')->nullable();
            $table->enum('type', ['consommable', 'service', 'stockable'])->default('stockable');
            $table->unsignedBigInteger('categorie_id')->nullable();
            $table->unsignedBigInteger('unite_id')->nullable();
            $table->boolean('actif')->default(1);
            $table->timestamps();

            // Clés étrangères
            $table->foreign('categorie_id')
                  ->references('id')
                  ->on('categorie_produit')
                  ->onDelete('set null');

            $table->foreign('unite_id')
                  ->references('id')
                  ->on('unite_mesure')
                  ->onDelete('set null');

            // Index
            $table->index('nom');
        });
    }

    public function down()
    {
        Schema::dropIfExists('produit_modele');
    }
};