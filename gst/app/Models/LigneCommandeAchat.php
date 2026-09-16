<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class LigneCommandeAchat extends Model
{
    protected $table = 'ligne_commande_achat';
    protected $primaryKey = 'id';

    protected $fillable = [
        'commande_achat_id',
        'produit_id',
        'code_produit',
        'nom_produit',
        'description',
        'quantite',
        'quantite_recue',
        'prix_unitaire_ht',
        'prix_unitaire_ttc',
        'taux_remise',
        'montant_remise',
        'montant_total_ht',
        'montant_total_ttc',
        'taux_tva',
        'date_livraison_prevue',
        'delai_livraison',
        'notes'
    ];

    protected $casts = [
        'quantite' => 'decimal:2',
        'quantite_recue' => 'decimal:2',
        'prix_unitaire_ht' => 'decimal:2',
        'prix_unitaire_ttc' => 'decimal:2',
        'taux_remise' => 'decimal:2',
        'montant_remise' => 'decimal:2',
        'montant_total_ht' => 'decimal:2',
        'montant_total_ttc' => 'decimal:2',
        'taux_tva' => 'decimal:2',
        'date_livraison_prevue' => 'date',
    ];

    // Relations
    public function commande()
    {
        return $this->belongsTo(CommandeAchat::class, 'commande_achat_id');
    }

    public function produit()
    {
        return $this->belongsTo(VarianteProduit::class, 'produit_id');
    }

    // Accesseurs
    public function getSousTotalHtAttribute()
    {
        return $this->quantite * $this->prix_unitaire_ht;
    }

    public function getSousTotalTtcAttribute()
    {
        return $this->quantite * $this->prix_unitaire_ttc;
    }

    public function getQuantiteRestanteAttribute()
    {
        return $this->quantite - $this->quantite_recue;
    }

    public function getEstTotalementRecueAttribute()
    {
        return $this->quantite_recue >= $this->quantite;
    }

    public function getEstPartiellementRecueAttribute()
    {
        return $this->quantite_recue > 0 && $this->quantite_recue < $this->quantite;
    }
}