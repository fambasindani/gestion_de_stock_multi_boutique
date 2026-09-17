<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up()
    {
        if (!Schema::hasTable('retours')) {
            Schema::create('retours', function (Blueprint $table) {
                $table->id();
                $table->unsignedBigInteger('societe_id')->nullable()->index();
                $table->string('reference')->unique();
                $table->date('date_retour');
                $table->string('type', 20)->comment('client|fournisseur|casse');
                $table->unsignedBigInteger('partenaire_id')->nullable();
                $table->unsignedBigInteger('emplacement_id')->nullable();
                $table->string('motif')->nullable();
                $table->text('notes')->nullable();
                $table->unsignedBigInteger('utilisateur_id')->nullable();
                $table->timestamps();

                $table->index('type');
                $table->index('date_retour');
            });
        }

        if (!Schema::hasTable('ligne_retours')) {
            Schema::create('ligne_retours', function (Blueprint $table) {
                $table->id();
                $table->unsignedBigInteger('retour_id');
                $table->unsignedBigInteger('produit_id');
                $table->decimal('quantite', 16, 2);
                $table->decimal('prix_unitaire_ht', 16, 2)->default(0);
                $table->decimal('montant_ht', 16, 2)->default(0);
                $table->text('notes')->nullable();
                $table->timestamps();

                $table->foreign('retour_id')
                      ->references('id')
                      ->on('retours')
                      ->onDelete('cascade');

                $table->foreign('produit_id')
                      ->references('id')
                      ->on('variante_produit')
                      ->onDelete('restrict');

                $table->index('retour_id');
            });
        }
    }

    public function down()
    {
        Schema::dropIfExists('ligne_retours');
        Schema::dropIfExists('retours');
    }
};
