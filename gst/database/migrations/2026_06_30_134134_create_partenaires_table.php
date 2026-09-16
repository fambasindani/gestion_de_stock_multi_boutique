<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up()
    {
        Schema::create('partenaire', function (Blueprint $table) {
            $table->id();
            $table->string('nom', 255);
            $table->string('code', 50)->nullable()->unique();
            $table->boolean('est_client')->default(0);
            $table->boolean('est_fournisseur')->default(0);
            $table->string('email', 255)->nullable();
            $table->string('telephone', 50)->nullable();
            $table->string('mobile', 50)->nullable();
            $table->text('adresse')->nullable();
            $table->string('ville', 100)->nullable();
            $table->string('code_postal', 20)->nullable();
            $table->string('pays', 100)->nullable();
            $table->string('numero_tva', 50)->nullable();
            $table->string('siret', 50)->nullable();
            $table->string('site_web', 255)->nullable();
            $table->text('notes')->nullable();
            $table->decimal('remise', 5, 2)->default(0);
            $table->integer('delai_paiement')->default(30)->comment('Délai de paiement en jours');
            $table->boolean('actif')->default(1);
            $table->timestamps();

            // Index
            $table->index('nom');
            $table->index('email');
            $table->index('code');
            $table->index(['est_client', 'est_fournisseur']);
        });
    }

    public function down()
    {
        Schema::dropIfExists('partenaire');
    }
};