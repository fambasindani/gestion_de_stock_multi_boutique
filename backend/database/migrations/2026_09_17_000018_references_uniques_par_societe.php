<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Les références sont générées par société (le modèle est filtré par société).
     * L'unicité doit donc être par société et non globale, sinon la 2e boutique
     * ne peut pas créer sa propre commande PO-2026-00001, etc.
     */
    public function up(): void
    {
        $this->dropUniqueSafe('commande_achat', 'commande_achat_reference_unique');
        $this->addUniqueSafe('commande_achat', ['societe_id', 'reference'], 'commande_achat_societe_reference_unique');

        $this->dropUniqueSafe('commande_vente', 'commande_vente_reference_unique');
        $this->addUniqueSafe('commande_vente', ['societe_id', 'reference'], 'commande_vente_societe_reference_unique');

        $this->dropUniqueSafe('ecriture_comptable', 'ecriture_comptable_reference_unique');
        $this->dropUniqueSafe('ecriture_comptable', 'ecriture_comptable_numero_facture_unique');
        $this->addUniqueSafe('ecriture_comptable', ['societe_id', 'reference'], 'ecriture_comptable_societe_reference_unique');
        $this->addUniqueSafe('ecriture_comptable', ['societe_id', 'numero_facture'], 'ecriture_comptable_societe_numero_unique');

        $this->dropUniqueSafe('inventaires', 'inventaires_reference_unique');
        $this->addUniqueSafe('inventaires', ['societe_id', 'reference'], 'inventaires_societe_reference_unique');

        $this->dropUniqueSafe('retours', 'retours_reference_unique');
        $this->addUniqueSafe('retours', ['societe_id', 'reference'], 'retours_societe_reference_unique');

        $this->dropUniqueSafe('transfert_stock', 'transfert_stock_reference_unique');
        $this->addUniqueSafe('transfert_stock', ['societe_id', 'reference'], 'transfert_stock_societe_reference_unique');
    }

    public function down(): void
    {
        $this->dropUniqueSafe('commande_achat', 'commande_achat_societe_reference_unique');
        $this->addUniqueSafe('commande_achat', ['reference'], 'commande_achat_reference_unique');

        $this->dropUniqueSafe('commande_vente', 'commande_vente_societe_reference_unique');
        $this->addUniqueSafe('commande_vente', ['reference'], 'commande_vente_reference_unique');

        $this->dropUniqueSafe('ecriture_comptable', 'ecriture_comptable_societe_reference_unique');
        $this->dropUniqueSafe('ecriture_comptable', 'ecriture_comptable_societe_numero_unique');
        $this->addUniqueSafe('ecriture_comptable', ['reference'], 'ecriture_comptable_reference_unique');
        $this->addUniqueSafe('ecriture_comptable', ['numero_facture'], 'ecriture_comptable_numero_facture_unique');

        $this->dropUniqueSafe('inventaires', 'inventaires_societe_reference_unique');
        $this->addUniqueSafe('inventaires', ['reference'], 'inventaires_reference_unique');

        $this->dropUniqueSafe('retours', 'retours_societe_reference_unique');
        $this->addUniqueSafe('retours', ['reference'], 'retours_reference_unique');

        $this->dropUniqueSafe('transfert_stock', 'transfert_stock_societe_reference_unique');
        $this->addUniqueSafe('transfert_stock', ['reference'], 'transfert_stock_reference_unique');
    }

    private function dropUniqueSafe(string $table, string $index): void
    {
        try {
            Schema::table($table, function (Blueprint $t) use ($index) {
                $t->dropUnique($index);
            });
        } catch (\Throwable $e) {
        }
    }

    private function addUniqueSafe(string $table, array $columns, string $index): void
    {
        try {
            Schema::table($table, function (Blueprint $t) use ($columns, $index) {
                $t->unique($columns, $index);
            });
        } catch (\Throwable $e) {
        }
    }
};
