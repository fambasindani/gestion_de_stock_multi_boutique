<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up()
    {
        Schema::create('categorie_produit', function (Blueprint $table) {
            $table->id();
            $table->string('nom', 100)->unique();
            $table->text('description')->nullable();
            $table->unsignedBigInteger('parent_id')->nullable();
            $table->boolean('actif')->default(1);
            $table->timestamps();

            // Clé étrangère pour l'arborescence
            $table->foreign('parent_id')
                  ->references('id')
                  ->on('categorie_produit')
                  ->onDelete('set null');
        });
    }

    public function down()
    {
        Schema::dropIfExists('categorie_produit');
    }
};