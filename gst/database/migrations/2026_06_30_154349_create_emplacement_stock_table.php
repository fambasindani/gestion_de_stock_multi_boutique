<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up()
    {
        Schema::create('emplacement_stock', function (Blueprint $table) {
            $table->id();
            $table->string('nom', 255);
            $table->string('code', 50)->nullable()->unique();
            $table->text('description')->nullable();
            $table->unsignedBigInteger('emplacement_parent_id')->nullable();
            $table->enum('usage', [
                'fournisseur',
                'client',
                'interne',
                'inventaire',
                'approvisionnement',
                'production',
                'transit',
                'vue'
            ])->default('interne');
            $table->string('type', 50)->default('normal')->comment('normal, reserve, qualite, quarantine');
            $table->boolean('est_entrepot')->default(0);
            $table->boolean('est_zone')->default(0);
            $table->boolean('est_rayon')->default(0);
            $table->boolean('est_casier')->default(0);
            $table->string('code_barres', 255)->nullable();
            $table->decimal('capacite_maximale', 16, 2)->nullable();
            $table->string('unite_capacite', 50)->nullable()->comment('m3, kg, pieces');
            $table->unsignedBigInteger('societe_id')->nullable();
            $table->boolean('actif')->default(1);
            $table->timestamps();

            // Clé étrangère pour l'arborescence
            $table->foreign('emplacement_parent_id')
                  ->references('id')
                  ->on('emplacement_stock')
                  ->onDelete('set null');

            // Index
            $table->index('nom');
            $table->index('code');
            $table->index('usage');
            $table->index(['emplacement_parent_id', 'usage']);
        });
    }

    public function down()
    {
        Schema::dropIfExists('emplacement_stock');
    }
};