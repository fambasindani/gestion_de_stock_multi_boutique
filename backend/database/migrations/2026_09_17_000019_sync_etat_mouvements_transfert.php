<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    /**
     * Les statuts des mouvements n'étaient pas synchronisés avec le transfert.
     * On aligne les mouvements existants sur l'état de leur transfert.
     */
    public function up(): void
    {
        DB::statement(
            "UPDATE mouvement_stock m
             JOIN transfert_stock t ON t.id = m.transfert_id
             SET m.etat = t.etat
             WHERE m.etat <> t.etat"
        );
    }

    public function down(): void
    {
        // Pas de retour arrière (réparation de données).
    }
};
