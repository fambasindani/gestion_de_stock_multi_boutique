<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class VarianteProduit extends Model
{
    use Concerns\BelongsToSociete;

    protected $table = 'variante_produit';
    protected $primaryKey = 'id';

    protected $fillable = [
        'modele_produit_id',
        'code_interne',
        'nom',
        'prix_achat',
        'prix_vente',
        'poids',
        'reference_fournisseur',
        'actif'
    ];

    protected $casts = [
        'actif' => 'boolean',
        'prix_achat' => 'decimal:2',
        'prix_vente' => 'decimal:2',
        'poids' => 'decimal:2',
    ];

    // Relations
    public function modele()
    {
        return $this->belongsTo(ProduitModele::class, 'modele_produit_id');
    }

    public function lots()
    {
        return $this->hasMany(LotTracabilite::class, 'produit_id');
    }

    public function quantites()
    {
        return $this->hasMany(QuantiteStock::class, 'produit_id');
    }

    public function mouvements()
    {
        return $this->hasMany(MouvementStock::class, 'produit_id');
    }

    public function lignesCommandesVente()
    {
        return $this->hasMany(LigneCommandeVente::class, 'produit_id');
    }

    public function lignesCommandesAchat()
    {
        return $this->hasMany(LigneCommandeAchat::class, 'produit_id');
    }

    public function lignesFactures()
    {
        return $this->hasMany(LigneEcritureComptable::class, 'produit_id');
    }

    // Accesseurs
    public function getPrixAchatFormatteAttribute()
    {
        return number_format($this->prix_achat, 2, ',', ' ') . ' €';
    }

    public function getPrixVenteFormatteAttribute()
    {
        return number_format($this->prix_vente, 2, ',', ' ') . ' €';
    }

    // Scopes
    public function scopeActif($query)
    {
        return $query->where('actif', true);
    }

    public function scopeInactif($query)
    {
        return $query->where('actif', false);
    }

    public function scopeParCode($query, $code)
    {
        return $query->where('code_interne', $code);
    }
}