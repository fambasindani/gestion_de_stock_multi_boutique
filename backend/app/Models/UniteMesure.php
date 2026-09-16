<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class UniteMesure extends Model
{
    use Concerns\BelongsToSociete;

    protected $table = 'unite_mesure';
    protected $primaryKey = 'id';

    protected $fillable = [
        'nom', 'symbole', 'description', 'actif'
    ];

    protected $casts = [
        'actif' => 'boolean',
    ];

    // Relation : une unité peut être utilisée par plusieurs produits
    public function produits()
    {
        return $this->hasMany(ProduitModele::class, 'unite_id');
    }
}