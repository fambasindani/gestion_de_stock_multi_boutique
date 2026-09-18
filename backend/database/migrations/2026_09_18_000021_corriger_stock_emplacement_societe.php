<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    /**
     * Corrige les lignes de stock dont l'emplacement appartient à une autre société.
     * Elles sont rattachées au premier emplacement de leur société (les quantités
     * sont fusionnées si une ligne équivalente existe déjà).
     */
    public function up(): void
    {
        $rows = DB::table('quantite_stock as qs')
            ->join('emplacement_stock as es', 'es.id', '=', 'qs.emplacement_id')
            ->whereNotNull('qs.societe_id')
            ->whereNotNull('es.societe_id')
            ->whereColumn('es.societe_id', '!=', 'qs.societe_id')
            ->select('qs.id', 'qs.produit_id', 'qs.lot_id', 'qs.societe_id', 'qs.quantite_disponible', 'qs.quantite_reservee')
            ->get();

        foreach ($rows as $row) {
            $target = DB::table('emplacement_stock')
                ->where('societe_id', $row->societe_id)
                ->orderBy('id')
                ->value('id');

            if (!$target) {
                continue;
            }

            $existing = DB::table('quantite_stock')
                ->where('produit_id', $row->produit_id)
                ->where('emplacement_id', $target)
                ->where('lot_id', $row->lot_id)
                ->where('id', '!=', $row->id)
                ->first();

            if ($existing) {
                DB::table('quantite_stock')->where('id', $existing->id)->update([
                    'quantite_disponible' => (float) $existing->quantite_disponible + (float) $row->quantite_disponible,
                    'quantite_reservee' => (float) $existing->quantite_reservee + (float) $row->quantite_reservee,
                ]);
                DB::table('quantite_stock')->where('id', $row->id)->delete();
            } else {
                DB::table('quantite_stock')->where('id', $row->id)->update(['emplacement_id' => $target]);
            }
        }
    }

    public function down(): void
    {
        // Réparation de données : pas de retour.
    }
};
