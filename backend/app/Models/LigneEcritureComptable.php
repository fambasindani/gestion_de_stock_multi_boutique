<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class LigneEcritureComptable extends Model
{
    protected $table = 'ligne_ecriture_comptable';
    protected $primaryKey = 'id';

    protected $fillable = [
        'ecriture_comptable_id',
        'produit_id',
        'code_produit',
        'nom_produit',
        'description',
        'quantite',
        'prix_unitaire_ht',
        'prix_unitaire_ttc',
        'taux_remise',
        'montant_remise',
        'montant_ht',
        'montant_tva',
        'montant_ttc',
        'taux_tva',
        'compte_comptable',
        'compte_tva',
        'notes'
    ];

    protected $casts = [
        'quantite' => 'decimal:2',
        'prix_unitaire_ht' => 'decimal:2',
        'prix_unitaire_ttc' => 'decimal:2',
        'taux_remise' => 'decimal:2',
        'montant_remise' => 'decimal:2',
        'montant_ht' => 'decimal:2',
        'montant_tva' => 'decimal:2',
        'montant_ttc' => 'decimal:2',
        'taux_tva' => 'decimal:2',
    ];

    // Relations
    public function ecriture()
    {
        return $this->belongsTo(EcritureComptable::class, 'ecriture_comptable_id');
    }

    public function produit()
    {
        return $this->belongsTo(VarianteProduit::class, 'produit_id');
    }

    // Accesseurs
    public function getMontantHtFormateAttribute()
    {
        return number_format($this->montant_ht, 2, ',', ' ');
    }

    public function getMontantTtcFormateAttribute()
    {
        return number_format($this->montant_ttc, 2, ',', ' ');
    }

    public function getPrixUnitaireHtFormateAttribute()
    {
        return number_format($this->prix_unitaire_ht, 2, ',', ' ');
    }

    // Scopes
    public function scopeParEcriture($query, $ecritureId)
    {
        return $query->where('ecriture_comptable_id', $ecritureId);
    }

    public function scopeParProduit($query, $produitId)
    {
        return $query->where('produit_id', $produitId);
    }
}