<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class LigneRetour extends Model
{
    protected $table = 'ligne_retours';
    protected $primaryKey = 'id';

    protected $fillable = [
        'retour_id',
        'produit_id',
        'quantite',
        'prix_unitaire_ht',
        'montant_ht',
        'notes',
    ];

    protected $casts = [
        'quantite' => 'decimal:2',
        'prix_unitaire_ht' => 'decimal:2',
        'montant_ht' => 'decimal:2',
    ];

    public function retour()
    {
        return $this->belongsTo(Retour::class, 'retour_id');
    }

    public function produit()
    {
        return $this->belongsTo(VarianteProduit::class, 'produit_id');
    }
}
