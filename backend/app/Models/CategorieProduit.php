<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class CategorieProduit extends Model
{
    protected $table = 'categorie_produit';
    protected $primaryKey = 'id';

    protected $fillable = [
        'nom', 'description', 'parent_id', 'actif'
    ];

    // Relation : une catégorie peut avoir une catégorie parent
    public function parent()
    {
        return $this->belongsTo(CategorieProduit::class, 'parent_id');
    }

    // Relation : une catégorie peut avoir plusieurs sous-catégories
    public function enfants()
    {
        return $this->hasMany(CategorieProduit::class, 'parent_id');
    }

    // Relation : une catégorie peut avoir plusieurs produits
    public function produits()
    {
        return $this->hasMany(ProduitModele::class, 'categorie_id');
    }

    // Récupérer toutes les sous-catégories récursivement
    public function getAllEnfants()
    {
        $enfants = collect();
        foreach ($this->enfants as $enfant) {
            $enfants->push($enfant);
            $enfants = $enfants->merge($enfant->getAllEnfants());
        }
        return $enfants;
    }
}