<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Rend l'unicité des référentiels "par société" au lieu de globale :
     * deux boutiques peuvent avoir une catégorie, une unité, un emplacement,
     * un lot ou un partenaire portant le même nom / code.
     */
    public function up(): void
    {
        // Catégories : nom unique par société
        $this->dropUniqueSafe('categorie_produit', 'categorie_produit_nom_unique');
        $this->addUniqueSafe('categorie_produit', ['societe_id', 'nom'], 'categorie_produit_societe_nom_unique');

        // Unités : nom et symbole uniques par société
        $this->dropUniqueSafe('unite_mesure', 'unite_mesure_nom_symbole_unique');
        $this->addUniqueSafe('unite_mesure', ['societe_id', 'nom'], 'unite_mesure_societe_nom_unique');
        $this->addUniqueSafe('unite_mesure', ['societe_id', 'symbole'], 'unite_mesure_societe_symbole_unique');

        // Emplacements : code unique par société
        $this->dropUniqueSafe('emplacement_stock', 'emplacement_stock_code_unique');
        $this->addUniqueSafe('emplacement_stock', ['societe_id', 'code'], 'emplacement_stock_societe_code_unique');

        // Lots : code unique par société
        $this->dropUniqueSafe('lot_tracabilite', 'lot_tracabilite_code_unique');
        $this->addUniqueSafe('lot_tracabilite', ['societe_id', 'code'], 'lot_tracabilite_societe_code_unique');

        // Partenaires : code unique par société
        $this->dropUniqueSafe('partenaire', 'partenaire_code_unique');
        $this->addUniqueSafe('partenaire', ['societe_id', 'code'], 'partenaire_societe_code_unique');
    }

    public function down(): void
    {
        $this->dropUniqueSafe('categorie_produit', 'categorie_produit_societe_nom_unique');
        $this->addUniqueSafe('categorie_produit', ['nom'], 'categorie_produit_nom_unique');

        $this->dropUniqueSafe('unite_mesure', 'unite_mesure_societe_nom_unique');
        $this->dropUniqueSafe('unite_mesure', 'unite_mesure_societe_symbole_unique');
        $this->addUniqueSafe('unite_mesure', ['nom', 'symbole'], 'unite_mesure_nom_symbole_unique');

        $this->dropUniqueSafe('emplacement_stock', 'emplacement_stock_societe_code_unique');
        $this->addUniqueSafe('emplacement_stock', ['code'], 'emplacement_stock_code_unique');

        $this->dropUniqueSafe('lot_tracabilite', 'lot_tracabilite_societe_code_unique');
        $this->addUniqueSafe('lot_tracabilite', ['code'], 'lot_tracabilite_code_unique');

        $this->dropUniqueSafe('partenaire', 'partenaire_societe_code_unique');
        $this->addUniqueSafe('partenaire', ['code'], 'partenaire_code_unique');
    }

    private function dropUniqueSafe(string $table, string $index): void
    {
        try {
            Schema::table($table, function (Blueprint $t) use ($index) {
                $t->dropUnique($index);
            });
        } catch (\Throwable $e) {
            // index absent
        }
    }

    private function addUniqueSafe(string $table, array $columns, string $index): void
    {
        try {
            Schema::table($table, function (Blueprint $t) use ($columns, $index) {
                $t->unique($columns, $index);
            });
        } catch (\Throwable $e) {
            // index déjà présent
        }
    }
};
