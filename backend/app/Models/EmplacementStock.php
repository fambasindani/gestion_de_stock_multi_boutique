<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class EmplacementStock extends Model
{
    use Concerns\BelongsToSociete;

    protected $table = 'emplacement_stock';
    protected $primaryKey = 'id';

    protected $fillable = [
        'nom',
        'code',
        'description',
        'emplacement_parent_id',
        'usage',
        'type',
        'est_entrepot',
        'est_zone',
        'est_rayon',
        'est_casier',
        'code_barres',
        'capacite_maximale',
        'unite_capacite',
        'societe_id',
        'actif'
    ];

    protected $casts = [
        'est_entrepot' => 'boolean',
        'est_zone' => 'boolean',
        'est_rayon' => 'boolean',
        'est_casier' => 'boolean',
        'actif' => 'boolean',
        'capacite_maximale' => 'decimal:2',
    ];

    // Relations
    public function parent()
    {
        return $this->belongsTo(EmplacementStock::class, 'emplacement_parent_id');
    }

    public function enfants()
    {
        return $this->hasMany(EmplacementStock::class, 'emplacement_parent_id');
    }

    public function quantites()
    {
        return $this->hasMany(QuantiteStock::class, 'emplacement_id');
    }

    public function societe()
    {
        return $this->belongsTo(Societe::class, 'societe_id');
    }

    // Accesseurs
    public function getUsageLabelAttribute()
    {
        $labels = [
            'fournisseur' => 'Fournisseur',
            'client' => 'Client',
            'interne' => 'Interne',
            'inventaire' => 'Inventaire',
            'approvisionnement' => 'Approvisionnement',
            'production' => 'Production',
            'transit' => 'Transit',
            'vue' => 'Vue'
        ];
        return $labels[$this->usage] ?? $this->usage;
    }

    public function getTypeLabelAttribute()
    {
        $labels = [
            'normal' => 'Normal',
            'reserve' => 'Réservé',
            'qualite' => 'Qualité',
            'quarantine' => 'Quarantaine'
        ];
        return $labels[$this->type] ?? $this->type;
    }

    public function getNiveauAttribute()
    {
        $niveau = 0;
        $parent = $this->parent;
        while ($parent) {
            $niveau++;
            $parent = $parent->parent;
        }
        return $niveau;
    }

    public function getCheminCompletAttribute()
    {
        $chemins = [$this->nom];
        $parent = $this->parent;
        while ($parent) {
            array_unshift($chemins, $parent->nom);
            $parent = $parent->parent;
        }
        return implode(' / ', $chemins);
    }

    // Scopes
    public function scopeRacine($query)
    {
        return $query->whereNull('emplacement_parent_id');
    }

    public function scopeInterne($query)
    {
        return $query->where('usage', 'interne');
    }

    public function scopeActif($query)
    {
        return $query->where('actif', true);
    }

    public function scopeParType($query, $type)
    {
        return $query->where('type', $type);
    }

    public function scopeParUsage($query, $usage)
    {
        return $query->where('usage', $usage);
    }

    public function scopeRecherche($query, $search)
    {
        return $query->where('nom', 'LIKE', "%{$search}%")
                     ->orWhere('code', 'LIKE', "%{$search}%")
                     ->orWhere('description', 'LIKE', "%{$search}%");
    }

    // Méthodes
    public function getAllEnfants()
    {
        $enfants = collect();
        foreach ($this->enfants as $enfant) {
            $enfants->push($enfant);
            $enfants = $enfants->merge($enfant->getAllEnfants());
        }
        return $enfants;
    }

    public function getQuantiteTotale()
    {
        return $this->quantites()->sum('quantite_disponible');
    }

    public function getQuantiteReserveeTotale()
    {
        return $this->quantites()->sum('quantite_reservee');
    }
}