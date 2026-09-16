<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class CommandeVente extends Model
{
    use Concerns\BelongsToSociete;

    protected $table = 'commande_vente';
    protected $primaryKey = 'id';

    protected $fillable = [
        'reference',
        'partenaire_id',
        'date_commande',
        'date_livraison_souhaitee',
        'date_livraison_prevue',
        'date_livraison_reelle',
        'etat',
        'montant_total_ht',
        'montant_total_ttc',
        'montant_remise',
        'taux_remise',
        'frais_livraison',
        'notes',
        'adresse_livraison',
        'adresse_facturation',
        'mode_paiement',
        'reference_commande_client',
        'cree_par_utilisateur_id',
        'modifie_par_utilisateur_id',
        'actif'
    ];

    protected $casts = [
        'date_commande' => 'date',
        'date_livraison_souhaitee' => 'date',
        'date_livraison_prevue' => 'date',
        'date_livraison_reelle' => 'date',
        'montant_total_ht' => 'decimal:2',
        'montant_total_ttc' => 'decimal:2',
        'montant_remise' => 'decimal:2',
        'taux_remise' => 'decimal:2',
        'frais_livraison' => 'decimal:2',
        'actif' => 'boolean',
    ];

    // Relations
    public function partenaire()
    {
        return $this->belongsTo(Partenaire::class, 'partenaire_id');
    }

    public function lignes()
    {
        return $this->hasMany(LigneCommandeVente::class, 'commande_vente_id');
    }

    public function creePar()
    {
        return $this->belongsTo(Utilisateur::class, 'cree_par_utilisateur_id');
    }

    public function modifiePar()
    {
        return $this->belongsTo(Utilisateur::class, 'modifie_par_utilisateur_id');
    }

    public function transferts()
    {
        return $this->hasMany(TransfertStock::class, 'commande_vente_id');
    }

    public function factures()
    {
        return $this->hasMany(EcritureComptable::class, 'commande_vente_id');
    }

    // Accesseurs
    public function getTotalTtcAttribute()
    {
        return $this->montant_total_ttc;
    }

    public function getTotalHtAttribute()
    {
        return $this->montant_total_ht;
    }

    public function getEtatLabelAttribute()
    {
        $labels = [
            'brouillon' => 'Brouillon',
            'confirme' => 'Confirmée',
            'en_cours' => 'En cours de traitement',
            'termine' => 'Terminée',
            'annule' => 'Annulée'
        ];
        return $labels[$this->etat] ?? $this->etat;
    }

    public function getEtatColorAttribute()
    {
        $colors = [
            'brouillon' => 'gray',
            'confirme' => 'blue',
            'en_cours' => 'orange',
            'termine' => 'green',
            'annule' => 'red'
        ];
        return $colors[$this->etat] ?? 'gray';
    }

    // Scopes
    public function scopeEnCours($query)
    {
        return $query->whereIn('etat', ['confirme', 'en_cours']);
    }

    public function scopeNonTermine($query)
    {
        return $query->whereNotIn('etat', ['termine', 'annule']);
    }

    public function scopeParClient($query, $clientId)
    {
        return $query->where('partenaire_id', $clientId);
    }

    public function scopeParDate($query, $dateDebut, $dateFin)
    {
        return $query->whereBetween('date_commande', [$dateDebut, $dateFin]);
    }
}