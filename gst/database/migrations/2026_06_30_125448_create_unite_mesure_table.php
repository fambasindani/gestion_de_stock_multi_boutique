<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up()
    {
        Schema::create('unite_mesure', function (Blueprint $table) {
            $table->id();
            $table->string('nom', 100);
            $table->string('symbole', 10);
            $table->text('description')->nullable();
            $table->boolean('actif')->default(1);
            $table->timestamps();

            // Index
            $table->unique(['nom', 'symbole']);
            $table->index('nom');
        });
    }

    public function down()
    {
        Schema::dropIfExists('unite_mesure');
    }
};