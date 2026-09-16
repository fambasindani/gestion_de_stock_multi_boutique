<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Inventaire extends Model
{
    use Concerns\BelongsToSociete;

    protected $table = 'inventaires';
    protected $primaryKey = 'id';

    protected $fillable = [
        'reference',
        'date_inventaire',
        'emplacement_id',
        'statut',
        'notes',
        'utilisateur_id',
        'date_cloture',
    ];

    protected $casts = [
        'date_inventaire' => 'date',
        'date_cloture' => 'datetime',
    ];

    public function lignes()
    {
        return $this->hasMany(LigneInventaire::class, 'inventaire_id');
    }

    public function emplacement()
    {
        return $this->belongsTo(EmplacementStock::class, 'emplacement_id');
    }

    public function utilisateur()
    {
        return $this->belongsTo(Utilisateur::class, 'utilisateur_id');
    }

    public function getStatutLabelAttribute()
    {
        $labels = [
            'brouillon' => 'Brouillon',
            'en_cours' => 'En cours',
            'cloture' => 'Clôturé',
        ];
        return $labels[$this->statut] ?? 'Brouillon';
    }
}
