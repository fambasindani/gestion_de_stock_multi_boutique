<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up()
    {
        if (!Schema::hasTable('parametres')) {
            return;
        }

        $defaults = [
            'tva_taux' => ['16', 'Taux de TVA par défaut (%)'],
            'entreprise_nom' => ['', 'Nom affiché sur le ticket'],
            'entreprise_adresse' => ['', 'Adresse affichée sur le ticket'],
            'entreprise_telephone' => ['', 'Téléphone affiché sur le ticket'],
            'ticket_message' => ['Merci de votre visite !', 'Message de bas de ticket'],
        ];

        $societes = DB::table('societes')->get(['id', 'nom']);

        foreach ($societes as $societe) {
            foreach ($defaults as $cle => [$valeur, $description]) {
                $exists = DB::table('parametres')
                    ->where('societe_id', $societe->id)
                    ->where('cle', $cle)
                    ->exists();

                if (!$exists) {
                    DB::table('parametres')->insert([
                        'societe_id' => $societe->id,
                        'cle' => $cle,
                        'valeur' => $cle === 'entreprise_nom' ? $societe->nom : $valeur,
                        'description' => $description,
                        'created_at' => now(),
                        'updated_at' => now(),
                    ]);
                }
            }
        }
    }

    public function down()
    {
        // Pas de suppression (données de configuration).
    }
};
