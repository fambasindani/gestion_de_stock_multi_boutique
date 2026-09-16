<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up()
    {
        Schema::create('transfert_stock', function (Blueprint $table) {
            $table->id();
            $table->string('reference', 50)->unique();
            $table->string('origine', 255)->nullable()->comment('Référence d\'origine: commande, fabrication, etc.');
            $table->unsignedBigInteger('commande_vente_id')->nullable();
            $table->unsignedBigInteger('commande_achat_id')->nullable();
            $table->unsignedBigInteger('emplacement_source_id');
            $table->unsignedBigInteger('emplacement_destination_id');
            $table->enum('type', ['reception', 'livraison', 'interne', 'production'])->default('interne');
            $table->enum('etat', ['brouillon', 'attente', 'confirme', 'assigne', 'termine', 'annule'])->default('brouillon');
            $table->date('date_transfert')->nullable();
            $table->date('date_prevue')->nullable();
            $table->date('date_reelle')->nullable();
            $table->text('notes')->nullable();
            $table->string('adresse_livraison')->nullable();
            $table->string('adresse_expedition')->nullable();
            $table->string('mode_transport', 100)->nullable();
            $table->string('num_facture_transport', 100)->nullable();
            $table->decimal('poids_total', 16, 2)->nullable();
            $table->decimal('volume_total', 16, 2)->nullable();
            $table->unsignedBigInteger('societe_id')->nullable();
            $table->unsignedBigInteger('cree_par_utilisateur_id')->nullable();
            $table->unsignedBigInteger('modifie_par_utilisateur_id')->nullable();
            $table->boolean('actif')->default(1);
            $table->timestamps();

            // Clés étrangères
            $table->foreign('commande_vente_id')
                  ->references('id')
                  ->on('commande_vente')
                  ->onDelete('set null');

            $table->foreign('commande_achat_id')
                  ->references('id')
                  ->on('commande_achat')
                  ->onDelete('set null');

            $table->foreign('emplacement_source_id')
                  ->references('id')
                  ->on('emplacement_stock')
                  ->onDelete('restrict');

            $table->foreign('emplacement_destination_id')
                  ->references('id')
                  ->on('emplacement_stock')
                  ->onDelete('restrict');

            $table->foreign('cree_par_utilisateur_id')
                  ->references('id')
                  ->on('utilisateurs')
                  ->onDelete('set null');

            $table->foreign('modifie_par_utilisateur_id')
                  ->references('id')
                  ->on('utilisateurs')
                  ->onDelete('set null');

            // ✅ Index avec noms raccourcis
            $table->index('reference', 'idx_transfert_ref');
            $table->index('type', 'idx_transfert_type');
            $table->index('etat', 'idx_transfert_etat');
            $table->index(['emplacement_source_id', 'emplacement_destination_id'], 'idx_transfert_src_dest');
        });
    }

    public function down()
    {
        Schema::dropIfExists('transfert_stock');
    }
};