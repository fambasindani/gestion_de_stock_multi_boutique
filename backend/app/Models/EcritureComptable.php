<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class EcritureComptable extends Model
{
    use Concerns\BelongsToSociete;

    protected $table = 'ecriture_comptable';
    protected $primaryKey = 'id';

    protected $fillable = [
        'reference',
        'numero_facture',
        'partenaire_id',
        'type',
        'date_emission',
        'date_echeance',
        'date_paiement',
        'montant_ht',
        'montant_tva',
        'montant_ttc',
        'montant_remise',
        'taux_remise',
        'montant_paye',
        'montant_restant',
        'devise',
        'taux_change',
        'commande_vente_id',
        'commande_achat_id',
        'transfert_id',
        'statut',
        'mode_paiement',
        'notes',
        'adresse_facturation',
        'adresse_livraison',
        'societe_id',
        'cree_par_utilisateur_id',
        'modifie_par_utilisateur_id',
        'actif'
    ];

    protected $casts = [
        'date_emission' => 'date',
        'date_echeance' => 'date',
        'date_paiement' => 'date',
        'montant_ht' => 'decimal:2',
        'montant_tva' => 'decimal:2',
        'montant_ttc' => 'decimal:2',
        'montant_remise' => 'decimal:2',
        'taux_remise' => 'decimal:2',
        'montant_paye' => 'decimal:2',
        'montant_restant' => 'decimal:2',
        'taux_change' => 'decimal:4',
        'actif' => 'boolean',
    ];

    // Relations
    public function partenaire()
    {
        return $this->belongsTo(Partenaire::class, 'partenaire_id');
    }

    public function commandeVente()
    {
        return $this->belongsTo(CommandeVente::class, 'commande_vente_id');
    }

    public function commandeAchat()
    {
        return $this->belongsTo(CommandeAchat::class, 'commande_achat_id');
    }

    public function transfert()
    {
        return $this->belongsTo(TransfertStock::class, 'transfert_id');
    }

    public function lignes()
    {
        return $this->hasMany(LigneEcritureComptable::class, 'ecriture_comptable_id');
    }

    public function creePar()
    {
        return $this->belongsTo(Utilisateur::class, 'cree_par_utilisateur_id');
    }

    public function modifiePar()
    {
        return $this->belongsTo(Utilisateur::class, 'modifie_par_utilisateur_id');
    }

    public function societe()
    {
        return $this->belongsTo(Societe::class, 'societe_id');
    }

    // Accesseurs
    public function getTypeLabelAttribute()
    {
        $labels = [
            'facture_client' => 'Facture Client',
            'avoir_client' => 'Avoir Client',
            'facture_fournisseur' => 'Facture Fournisseur',
            'avoir_fournisseur' => 'Avoir Fournisseur'
        ];
        return $labels[$this->type] ?? $this->type;
    }

    public function getStatutLabelAttribute()
    {
        $labels = [
            'brouillon' => 'Brouillon',
            'validee' => 'Validée',
            'envoyee' => 'Envoyée',
            'payee' => 'Payée',
            'annulee' => 'Annulée'
        ];
        return $labels[$this->statut] ?? $this->statut;
    }

    public function getStatutColorAttribute()
    {
        $colors = [
            'brouillon' => 'gray',
            'validee' => 'blue',
            'envoyee' => 'orange',
            'payee' => 'green',
            'annulee' => 'red'
        ];
        return $colors[$this->statut] ?? 'gray';
    }

    public function getEstPayeeAttribute()
    {
        return $this->statut === 'payee' || $this->montant_restant <= 0;
    }

    public function getEstImpayeeAttribute()
    {
        return $this->statut !== 'payee' && $this->montant_restant > 0;
    }

    public function getPourcentagePayeAttribute()
    {
        if ($this->montant_ttc == 0) return 0;
        return round(($this->montant_paye / $this->montant_ttc) * 100, 2);
    }

    // Scopes
    public function scopeClient($query)
    {
        return $query->whereIn('type', ['facture_client', 'avoir_client']);
    }

    public function scopeFournisseur($query)
    {
        return $query->whereIn('type', ['facture_fournisseur', 'avoir_fournisseur']);
    }

    public function scopeParPartenaire($query, $partenaireId)
    {
        return $query->where('partenaire_id', $partenaireId);
    }

    public function scopeParStatut($query, $statut)
    {
        return $query->where('statut', $statut);
    }

    public function scopeNonPayee($query)
    {
        return $query->where('statut', '!=', 'payee')
                     ->where('montant_restant', '>', 0);
    }

    public function scopeParDate($query, $dateDebut, $dateFin)
    {
        return $query->whereBetween('date_emission', [$dateDebut, $dateFin]);
    }

    public function scopeRecherche($query, $search)
    {
        return $query->where('reference', 'LIKE', "%{$search}%")
                     ->orWhere('numero_facture', 'LIKE', "%{$search}%")
                     ->orWhereHas('partenaire', function($q) use ($search) {
                         $q->where('nom', 'LIKE', "%{$search}%");
                     });
    }
}