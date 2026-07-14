<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class LigneCommandeVente extends Model
{
    protected $table = 'ligne_commande_vente';
    protected $primaryKey = 'id';

    protected $fillable = [
        'commande_vente_id',
        'produit_id',
        'code_produit',
        'nom_produit',
        'description',
        'quantite',
        'quantite_livree',
        'prix_unitaire_ht',
        'prix_unitaire_ttc',
        'taux_remise',
        'montant_remise',
        'montant_total_ht',
        'montant_total_ttc',
        'taux_tva',
        'date_livraison_souhaitee',
        'delai_livraison',
        'notes'
    ];

    protected $casts = [
        'quantite' => 'decimal:2',
        'quantite_livree' => 'decimal:2',
        'prix_unitaire_ht' => 'decimal:2',
        'prix_unitaire_ttc' => 'decimal:2',
        'taux_remise' => 'decimal:2',
        'montant_remise' => 'decimal:2',
        'montant_total_ht' => 'decimal:2',
        'montant_total_ttc' => 'decimal:2',
        'taux_tva' => 'decimal:2',
        'date_livraison_souhaitee' => 'date',
    ];

    // Relations
    public function commande()
    {
        return $this->belongsTo(CommandeVente::class, 'commande_vente_id');
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

    public function getMontantApresRemiseAttribute()
    {
        return $this->montant_total_ht - $this->montant_remise;
    }

    public function getQuantiteRestanteAttribute()
    {
        return $this->quantite - $this->quantite_livree;
    }

    public function getEstTotalementLivreeAttribute()
    {
        return $this->quantite_livree >= $this->quantite;
    }

    public function getEstPartiellementLivreeAttribute()
    {
        return $this->quantite_livree > 0 && $this->quantite_livree < $this->quantite;
    }
}