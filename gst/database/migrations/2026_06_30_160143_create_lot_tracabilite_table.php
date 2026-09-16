<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up()
    {
        Schema::create('lot_tracabilite', function (Blueprint $table) {
            $table->id();
            $table->string('nom', 255);
            $table->string('code', 100)->nullable()->unique();
            $table->unsignedBigInteger('produit_id');
            $table->enum('type', ['lot', 'serie'])->default('lot');
            $table->date('date_production')->nullable();
            $table->date('date_peremption')->nullable();
            $table->date('date_reception')->nullable();
            $table->string('fournisseur', 255)->nullable();
            $table->string('reference_fournisseur', 255)->nullable();
            $table->decimal('quantite_initiale', 16, 2)->default(0);
            $table->decimal('quantite_actuelle', 16, 2)->default(0);
            $table->decimal('quantite_reservee', 16, 2)->default(0);
            $table->string('unite', 50)->nullable();
            $table->enum('statut', ['actif', 'epuise', 'perime', 'bloque'])->default('actif');
            $table->text('notes')->nullable();
            
            // ✅ SUPPRIMER societe_id pour l'instant ou le rendre nullable sans clé étrangère
            $table->unsignedBigInteger('societe_id')->nullable();
            
            $table->unsignedBigInteger('cree_par_utilisateur_id')->nullable();
            $table->unsignedBigInteger('modifie_par_utilisateur_id')->nullable();
            $table->boolean('actif')->default(1);
            $table->timestamps();

            // Clés étrangères
            $table->foreign('produit_id')
                  ->references('id')
                  ->on('variante_produit')
                  ->onDelete('restrict');

            // ✅ SUPPRIMER LA CLÉ ÉTRANGÈRE VERS societe
            // $table->foreign('societe_id')
            //       ->references('id')
            //       ->on('societe')
            //       ->onDelete('set null');

            $table->foreign('cree_par_utilisateur_id')
                  ->references('id')
                  ->on('utilisateurs')
                  ->onDelete('set null');

            $table->foreign('modifie_par_utilisateur_id')
                  ->references('id')
                  ->on('utilisateurs')
                  ->onDelete('set null');

            // Index
            $table->index('nom');
            $table->index('code');
            $table->index('produit_id');
            $table->index('date_peremption');
            $table->index('statut');
            $table->index(['produit_id', 'statut']);
        });
    }

    public function down()
    {
        Schema::dropIfExists('lot_tracabilite');
    }
};