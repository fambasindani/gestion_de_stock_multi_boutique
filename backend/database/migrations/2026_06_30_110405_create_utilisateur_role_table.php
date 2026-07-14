<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('utilisateur_role', function (Blueprint $table) {
            $table->id();
            $table->unsignedBigInteger('utilisateur_id');
            $table->unsignedBigInteger('role_id');
            $table->timestamps();

            $table->unique(['utilisateur_id', 'role_id']);
            
            // ✅ ICI on référence 'utilisateurs' et 'roles' (avec 's')
            $table->foreign('utilisateur_id')->references('id')->on('utilisateurs')->onDelete('cascade');
            $table->foreign('role_id')->references('id')->on('roles')->onDelete('cascade');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('utilisateur_role');
    }
};