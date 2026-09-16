<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class LigneOperationStock extends Model
{
    protected $table = 'ligne_operation_stock';
    protected $primaryKey = 'id';

    protected $fillable = [
        'mouvement_id',
        'produit_id',
        'lot_id',
        'code_barres',
        'quantite_traitee',
        'emplacement_source_id',
        'emplacement_destination_id',
        'utilisateur_id',
        'date_operation',
        'type_operation',
        'notes'
    ];

    protected $casts = [
        'quantite_traitee' => 'decimal:2',
        'date_operation' => 'datetime',
    ];

    // Relations
    public function mouvement()
    {
        return $this->belongsTo(MouvementStock::class, 'mouvement_id');
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

    public function utilisateur()
    {
        return $this->belongsTo(Utilisateur::class, 'utilisateur_id');
    }

    // Accesseurs
    public function getTypeOperationLabelAttribute()
    {
        $labels = [
            'prelevement' => 'Prélèvement',
            'reception' => 'Réception',
            'scan' => 'Scan'
        ];
        return $labels[$this->type_operation] ?? $this->type_operation;
    }

    public function getTypeOperationColorAttribute()
    {
        $colors = [
            'prelevement' => 'orange',
            'reception' => 'green',
            'scan' => 'blue'
        ];
        return $colors[$this->type_operation] ?? 'gray';
    }

    // Scopes
    public function scopeParMouvement($query, $mouvementId)
    {
        return $query->where('mouvement_id', $mouvementId);
    }

    public function scopeParType($query, $type)
    {
        return $query->where('type_operation', $type);
    }

    public function scopeParProduit($query, $produitId)
    {
        return $query->where('produit_id', $produitId);
    }

    public function scopeParLot($query, $lotId)
    {
        return $query->where('lot_id', $lotId);
    }

    public function scopeParDate($query, $dateDebut, $dateFin)
    {
        return $query->whereBetween('date_operation', [$dateDebut, $dateFin]);
    }

    public function scopePrelevement($query)
    {
        return $query->where('type_operation', 'prelevement');
    }

    public function scopeReception($query)
    {
        return $query->where('type_operation', 'reception');
    }

    public function scopeScan($query)
    {
        return $query->where('type_operation', 'scan');
    }

    // Méthodes
    public function getQuantiteFormateeAttribute()
    {
        return number_format($this->quantite_traitee, 2, ',', ' ');
    }

    public function getDateOperationFormateeAttribute()
    {
        return $this->date_operation ? $this->date_operation->format('d/m/Y H:i:s') : null;
    }
}