<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Societe extends Model
{
    protected $table = 'societes';
    protected $primaryKey = 'id';

    protected $fillable = [
        'nom',
        'code',
        'logo',
        'email',
        'telephone',
        'adresse',
        'actif',
        'date_abonnement',
        'date_expiration',
        'notes',
    ];

    protected $casts = [
        'actif' => 'boolean',
        'date_abonnement' => 'date',
        'date_expiration' => 'date',
    ];

    public function utilisateurs()
    {
        return $this->hasMany(Utilisateur::class, 'societe_id');
    }

    public function getEstExpireeAttribute()
    {
        return $this->date_expiration ? $this->date_expiration->isPast() : false;
    }

    public function getStatutAbonnementAttribute()
    {
        if (!$this->actif) return 'desactivee';
        if ($this->est_expiree) return 'expiree';
        return 'active';
    }
}
