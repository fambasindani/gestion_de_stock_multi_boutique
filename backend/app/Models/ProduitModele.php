<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class ProduitModele extends Model
{
    use Concerns\BelongsToSociete;

    protected $table = 'produit_modele';
    protected $primaryKey = 'id';

    protected $fillable = [
        'nom', 'description', 'type', 'categorie_id', 'unite_id', 'actif'
    ];

    protected $casts = [
        'actif' => 'boolean',
    ];

    // Relations
    public function categorie()
    {
        return $this->belongsTo(CategorieProduit::class, 'categorie_id');
    }

    public function unite()
    {
        return $this->belongsTo(UniteMesure::class, 'unite_id');
    }

    public function variantes()
    {
        return $this->hasMany(VarianteProduit::class, 'modele_produit_id');
    }
}