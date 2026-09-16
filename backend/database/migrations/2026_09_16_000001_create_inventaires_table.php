<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up()
    {
        Schema::create('inventaires', function (Blueprint $table) {
            $table->id();
            $table->string('reference')->unique();
            $table->date('date_inventaire');
            $table->unsignedBigInteger('emplacement_id')->nullable();
            $table->string('statut')->default('brouillon')->comment('brouillon|en_cours|cloture');
            $table->text('notes')->nullable();
            $table->unsignedBigInteger('utilisateur_id')->nullable();
            $table->timestamp('date_cloture')->nullable();
            $table->timestamps();

            $table->foreign('emplacement_id')
                  ->references('id')
                  ->on('emplacement_stock')
                  ->onDelete('set null');

            $table->index('statut');
            $table->index('date_inventaire');
        });
    }

    public function down()
    {
        Schema::dropIfExists('inventaires');
    }
};
