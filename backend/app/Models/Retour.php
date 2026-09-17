<?php

namespace App\Models;

use App\Models\Concerns\BelongsToSociete;
use Illuminate\Database\Eloquent\Model;

class Retour extends Model
{
    use BelongsToSociete;

    protected $table = 'retours';
    protected $primaryKey = 'id';

    protected $fillable = [
        'societe_id',
        'reference',
        'date_retour',
        'type',
        'statut',
        'valide_par',
        'date_validation',
        'partenaire_id',
        'emplacement_id',
        'motif',
        'notes',
        'utilisateur_id',
    ];

    protected $casts = [
        'date_retour' => 'date',
        'date_validation' => 'datetime',
    ];

    public function getStatutLabelAttribute()
    {
        return $this->statut === 'valide' ? 'Validé' : 'Brouillon';
    }

    public function lignes()
    {
        return $this->hasMany(LigneRetour::class, 'retour_id');
    }

    public function partenaire()
    {
        return $this->belongsTo(Partenaire::class, 'partenaire_id');
    }

    public function emplacement()
    {
        return $this->belongsTo(EmplacementStock::class, 'emplacement_id');
    }

    public function utilisateur()
    {
        return $this->belongsTo(Utilisateur::class, 'utilisateur_id');
    }

    public function getTypeLabelAttribute()
    {
        $labels = [
            'client' => 'Retour client',
            'fournisseur' => 'Retour fournisseur',
            'casse' => 'Casse / Avarie',
        ];
        return $labels[$this->type] ?? $this->type;
    }
}
