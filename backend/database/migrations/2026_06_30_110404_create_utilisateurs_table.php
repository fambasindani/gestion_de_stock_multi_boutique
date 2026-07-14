<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('utilisateurs', function (Blueprint $table) {
            $table->id();
            $table->string('nom');
            $table->string('email')->unique();
            $table->string('mot_de_passe');
            $table->string('remember_token', 100)->nullable();
            $table->string('telephone', 50)->nullable();
            $table->boolean('actif')->default(1);
            $table->datetime('derniere_connexion')->nullable();
            $table->unsignedBigInteger('societe_id')->nullable();
            $table->timestamps();
            $table->index('email');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('utilisateurs');
    }
};