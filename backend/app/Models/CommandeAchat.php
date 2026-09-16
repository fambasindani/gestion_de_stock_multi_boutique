<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class CommandeAchat extends Model
{
    use Concerns\BelongsToSociete;

    protected $table = 'commande_achat';
    protected $primaryKey = 'id';

    protected $fillable = [
        'reference',
        'partenaire_id',
        'date_commande',
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
        'reference_commande_fournisseur',
        'cree_par_utilisateur_id',
        'modifie_par_utilisateur_id',
        'actif'
    ];

    protected $casts = [
        'date_commande' => 'date',
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
        return $this->hasMany(LigneCommandeAchat::class, 'commande_achat_id');
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
        return $this->hasMany(TransfertStock::class, 'commande_achat_id');
    }

    public function factures()
    {
        return $this->hasMany(EcritureComptable::class, 'commande_achat_id');
    }

    // Accesseurs
    public function getEtatLabelAttribute()
    {
        $labels = [
            'brouillon' => 'Brouillon',
            'confirme' => 'Confirmée',
            'envoye' => 'Envoyée au fournisseur',
            'recu' => 'Reçue partiellement',
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
            'envoye' => 'orange',
            'recu' => 'purple',
            'termine' => 'green',
            'annule' => 'red'
        ];
        return $colors[$this->etat] ?? 'gray';
    }

    // Scopes
    public function scopeEnCours($query)
    {
        return $query->whereIn('etat', ['confirme', 'envoye', 'recu']);
    }

    public function scopeNonTermine($query)
    {
        return $query->whereNotIn('etat', ['termine', 'annule']);
    }

    public function scopeParFournisseur($query, $fournisseurId)
    {
        return $query->where('partenaire_id', $fournisseurId);
    }

    public function scopeParDate($query, $dateDebut, $dateFin)
    {
        return $query->whereBetween('date_commande', [$dateDebut, $dateFin]);
    }
}