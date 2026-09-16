<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Partenaire extends Model
{
    use Concerns\BelongsToSociete;

    protected $table = 'partenaire';
    protected $primaryKey = 'id';

    protected $fillable = [
        'nom',
        'code',
        'est_client',
        'est_fournisseur',
        'email',
        'telephone',
        'mobile',
        'adresse',
        'ville',
        'code_postal',
        'pays',
        'numero_tva',
        'siret',
        'site_web',
        'notes',
        'remise',
        'delai_paiement',
        'actif'
    ];

    protected $casts = [
        'est_client' => 'boolean',
        'est_fournisseur' => 'boolean',
        'actif' => 'boolean',
        'remise' => 'decimal:2',
    ];

    // Relations
    public function commandesVente()
    {
        return $this->hasMany(CommandeVente::class, 'partenaire_id');
    }

    public function commandesAchat()
    {
        return $this->hasMany(CommandeAchat::class, 'partenaire_id');
    }

    public function factures()
    {
        return $this->hasMany(EcritureComptable::class, 'partenaire_id');
    }

    // Scopes
    public function scopeClient($query)
    {
        return $query->where('est_client', true);
    }

    public function scopeFournisseur($query)
    {
        return $query->where('est_fournisseur', true);
    }

    public function scopeActif($query)
    {
        return $query->where('actif', true);
    }

    public function scopeRecherche($query, $search)
    {
        return $query->where('nom', 'LIKE', "%{$search}%")
                     ->orWhere('email', 'LIKE', "%{$search}%")
                     ->orWhere('code', 'LIKE', "%{$search}%")
                     ->orWhere('telephone', 'LIKE', "%{$search}%");
    }

    // Accesseurs
    public function getTypeAttribute()
    {
        $types = [];
        if ($this->est_client) $types[] = 'Client';
        if ($this->est_fournisseur) $types[] = 'Fournisseur';
        return implode(' / ', $types);
    }

    public function getNomCompletAttribute()
    {
        return $this->nom . ' (' . $this->code . ')';
    }

    public function getAdresseCompleteAttribute()
    {
        $parts = array_filter([
            $this->adresse,
            $this->code_postal . ' ' . $this->ville,
            $this->pays
        ]);
        return implode(', ', $parts);
    }
}