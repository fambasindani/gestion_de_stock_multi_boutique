<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class LigneInventaire extends Model
{
    protected $table = 'ligne_inventaires';
    protected $primaryKey = 'id';

    protected $fillable = [
        'inventaire_id',
        'produit_id',
        'emplacement_id',
        'quantite_theorique',
        'quantite_physique',
        'ecart',
        'ajuste',
        'notes',
    ];

    protected $casts = [
        'quantite_theorique' => 'decimal:2',
        'quantite_physique' => 'decimal:2',
        'ecart' => 'decimal:2',
        'ajuste' => 'boolean',
    ];

    public function inventaire()
    {
        return $this->belongsTo(Inventaire::class, 'inventaire_id');
    }

    public function produit()
    {
        return $this->belongsTo(VarianteProduit::class, 'produit_id');
    }

    public function emplacement()
    {
        return $this->belongsTo(EmplacementStock::class, 'emplacement_id');
    }
}
