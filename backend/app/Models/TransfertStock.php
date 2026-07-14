<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class TransfertStock extends Model
{
    // ✅ Spécifier le nom exact de la table (sans 's')
    protected $table = 'transfert_stock';
    
    protected $primaryKey = 'id';

    protected $fillable = [
        'reference',
        'origine',
        'commande_vente_id',
        'commande_achat_id',
        'emplacement_source_id',
        'emplacement_destination_id',
        'type',
        'etat',
        'date_transfert',
        'date_prevue',
        'date_reelle',
        'notes',
        'adresse_livraison',
        'adresse_expedition',
        'mode_transport',
        'num_facture_transport',
        'poids_total',
        'volume_total',
        'societe_id',
        'cree_par_utilisateur_id',
        'modifie_par_utilisateur_id',
        'actif'
    ];

    protected $casts = [
        'date_transfert' => 'date',
        'date_prevue' => 'date',
        'date_reelle' => 'date',
        'poids_total' => 'decimal:2',
        'volume_total' => 'decimal:2',
        'actif' => 'boolean',
    ];

    // Relations
    public function commandeVente()
    {
        return $this->belongsTo(CommandeVente::class, 'commande_vente_id');
    }

    public function commandeAchat()
    {
        return $this->belongsTo(CommandeAchat::class, 'commande_achat_id');
    }

    public function emplacementSource()
    {
        return $this->belongsTo(EmplacementStock::class, 'emplacement_source_id');
    }

    public function emplacementDestination()
    {
        return $this->belongsTo(EmplacementStock::class, 'emplacement_destination_id');
    }

    public function mouvements()
    {
        return $this->hasMany(MouvementStock::class, 'transfert_id');
    }

    public function creePar()
    {
        return $this->belongsTo(Utilisateur::class, 'cree_par_utilisateur_id');
    }

    public function modifiePar()
    {
        return $this->belongsTo(Utilisateur::class, 'modifie_par_utilisateur_id');
    }

    // Accesseurs
    public function getTypeLabelAttribute()
    {
        $labels = [
            'reception' => 'Réception',
            'livraison' => 'Livraison',
            'interne' => 'Transfert interne',
            'production' => 'Production'
        ];
        return $labels[$this->type] ?? $this->type;
    }

    public function getEtatLabelAttribute()
    {
        $labels = [
            'brouillon' => 'Brouillon',
            'attente' => 'En attente',
            'confirme' => 'Confirmé',
            'assigne' => 'Assigné',
            'termine' => 'Terminé',
            'annule' => 'Annulé'
        ];
        return $labels[$this->etat] ?? $this->etat;
    }

    public function getEtatColorAttribute()
    {
        $colors = [
            'brouillon' => 'gray',
            'attente' => 'orange',
            'confirme' => 'blue',
            'assigne' => 'purple',
            'termine' => 'green',
            'annule' => 'red'
        ];
        return $colors[$this->etat] ?? 'gray';
    }

    // Scopes
    public function scopeParType($query, $type)
    {
        return $query->where('type', $type);
    }

    public function scopeParEtat($query, $etat)
    {
        return $query->where('etat', $etat);
    }

    public function scopeNonTermine($query)
    {
        return $query->whereNotIn('etat', ['termine', 'annule']);
    }

    public function scopeParEmplacementSource($query, $emplacementId)
    {
        return $query->where('emplacement_source_id', $emplacementId);
    }

    public function scopeParEmplacementDestination($query, $emplacementId)
    {
        return $query->where('emplacement_destination_id', $emplacementId);
    }
}