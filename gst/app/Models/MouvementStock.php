<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

// ✅ La classe DOIT s'appeler MouvementStock
class MouvementStock extends Model
{
    protected $table = 'mouvement_stock';
    protected $primaryKey = 'id';

    protected $fillable = [
        'transfert_id',
        'produit_id',
        'lot_id',
        'code_produit',
        'nom_produit',
        'description',
        'quantite_demandee',
        'quantite_traitee',
        'quantite_reservee',
        'emplacement_source_id',
        'emplacement_destination_id',
        'emplacement_source_reel_id',
        'emplacement_destination_reel_id',
        'etat',
        'unite',
        'poids_unitaire',
        'volume_unitaire',
        'date_prelevement',
        'date_reception',
        'notes'
    ];

    protected $casts = [
        'quantite_demandee' => 'decimal:2',
        'quantite_traitee' => 'decimal:2',
        'quantite_reservee' => 'decimal:2',
        'poids_unitaire' => 'decimal:4',
        'volume_unitaire' => 'decimal:4',
        'date_prelevement' => 'date',
        'date_reception' => 'date',
    ];

    // Relations
    public function transfert()
    {
        return $this->belongsTo(TransfertStock::class, 'transfert_id');
    }

    public function produit()
    {
        return $this->belongsTo(VarianteProduit::class, 'produit_id');
    }

    public function lot()
    {
        return $this->belongsTo(LotTracabilite::class, 'lot_id');
    }

    public function emplacementSource()
    {
        return $this->belongsTo(EmplacementStock::class, 'emplacement_source_id');
    }

    public function emplacementDestination()
    {
        return $this->belongsTo(EmplacementStock::class, 'emplacement_destination_id');
    }

    public function emplacementSourceReel()
    {
        return $this->belongsTo(EmplacementStock::class, 'emplacement_source_reel_id');
    }

    public function emplacementDestinationReel()
    {
        return $this->belongsTo(EmplacementStock::class, 'emplacement_destination_reel_id');
    }

    public function operations()
    {
        return $this->hasMany(LigneOperationStock::class, 'mouvement_id');
    }

    // Accesseurs
    public function getEtatLabelAttribute()
    {
        $labels = [
            'brouillon' => 'Brouillon',
            'attente' => 'En attente',
            'confirme' => 'Confirmé',
            'assigne' => 'Assigné',
            'termine' => 'Terminé',
            'annule' => 'Annulé'
        ];
        return $labels[$this->etat] ?? $this->etat;
    }

    public function getQuantiteRestanteAttribute()
    {
        return $this->quantite_demandee - $this->quantite_traitee;
    }

    public function getEstTermineAttribute()
    {
        return $this->quantite_traitee >= $this->quantite_demandee;
    }

    // Scopes
    public function scopeParTransfert($query, $transfertId)
    {
        return $query->where('transfert_id', $transfertId);
    }

    public function scopeParProduit($query, $produitId)
    {
        return $query->where('produit_id', $produitId);
    }

    public function scopeParEtat($query, $etat)
    {
        return $query->where('etat', $etat);
    }

    public function scopeNonTermine($query)
    {
        return $query->whereNotIn('etat', ['termine', 'annule']);
    }
}