<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Carbon\Carbon;

class LotTracabilite extends Model
{
    protected $table = 'lot_tracabilite';
    protected $primaryKey = 'id';

    protected $fillable = [
        'nom',
        'code',
        'produit_id',
        'type',
        'date_production',
        'date_peremption',
        'date_reception',
        'fournisseur',
        'reference_fournisseur',
        'quantite_initiale',
        'quantite_actuelle',
        'quantite_reservee',
        'unite',
        'statut',
        'notes',
        'societe_id',
        'cree_par_utilisateur_id',
        'modifie_par_utilisateur_id',
        'actif'
    ];

    protected $casts = [
        'date_production' => 'date',
        'date_peremption' => 'date',
        'date_reception' => 'date',
        'quantite_initiale' => 'decimal:2',
        'quantite_actuelle' => 'decimal:2',
        'quantite_reservee' => 'decimal:2',
        'actif' => 'boolean',
    ];

    // Relations
    public function produit()
    {
        return $this->belongsTo(VarianteProduit::class, 'produit_id');
    }

    public function societe()
    {
        return $this->belongsTo(Societe::class, 'societe_id');
    }

    public function creePar()
    {
        return $this->belongsTo(Utilisateur::class, 'cree_par_utilisateur_id');
    }

    public function modifiePar()
    {
        return $this->belongsTo(Utilisateur::class, 'modifie_par_utilisateur_id');
    }

    public function quantites()
    {
        return $this->hasMany(QuantiteStock::class, 'lot_id');
    }

    public function operations()
    {
        return $this->hasMany(LigneOperationStock::class, 'lot_id');
    }

    // Accesseurs
    public function getTypeLabelAttribute()
    {
        $labels = [
            'lot' => 'Lot',
            'serie' => 'Numéro de série'
        ];
        return $labels[$this->type] ?? $this->type;
    }

    public function getStatutLabelAttribute()
    {
        $labels = [
            'actif' => 'Actif',
            'epuise' => 'Épuisé',
            'perime' => 'Périmé',
            'bloque' => 'Bloqué'
        ];
        return $labels[$this->statut] ?? $this->statut;
    }

    public function getStatutColorAttribute()
    {
        $colors = [
            'actif' => 'green',
            'epuise' => 'gray',
            'perime' => 'red',
            'bloque' => 'orange'
        ];
        return $colors[$this->statut] ?? 'gray';
    }

    public function getQuantiteDisponibleAttribute()
    {
        return $this->quantite_actuelle - $this->quantite_reservee;
    }

    public function getEstPerimeAttribute()
    {
        if (!$this->date_peremption) return false;
        return Carbon::now()->greaterThan($this->date_peremption);
    }

    public function getJoursAvantPeremptionAttribute()
    {
        if (!$this->date_peremption) return null;
        return Carbon::now()->diffInDays($this->date_peremption, false);
    }

    public function getNomCompletAttribute()
    {
        return $this->nom . ' (' . $this->code . ')';
    }

    // Scopes
    public function scopeActif($query)
    {
        return $query->where('statut', 'actif');
    }

    public function scopeParProduit($query, $produitId)
    {
        return $query->where('produit_id', $produitId);
    }

    public function scopeParStatut($query, $statut)
    {
        return $query->where('statut', $statut);
    }

    public function scopeParType($query, $type)
    {
        return $query->where('type', $type);
    }

    public function scopeNonPerime($query)
    {
        return $query->where(function($q) {
            $q->whereNull('date_peremption')
              ->orWhere('date_peremption', '>=', Carbon::now()->toDateString());
        });
    }

    public function scopePerime($query)
    {
        return $query->whereNotNull('date_peremption')
                     ->where('date_peremption', '<', Carbon::now()->toDateString());
    }

    public function scopeRecherche($query, $search)
    {
        return $query->where('nom', 'LIKE', "%{$search}%")
                     ->orWhere('code', 'LIKE', "%{$search}%")
                     ->orWhere('reference_fournisseur', 'LIKE', "%{$search}%")
                     ->orWhere('fournisseur', 'LIKE', "%{$search}%");
    }

    // Méthodes
    public function reserve($quantite)
    {
        if ($this->quantite_actuelle < $quantite) {
            throw new \Exception('Quantité insuffisante pour réserver');
        }
        $this->quantite_reservee += $quantite;
        $this->save();
    }

    public function liberer($quantite)
    {
        if ($this->quantite_reservee < $quantite) {
            throw new \Exception('Quantité réservée insuffisante pour libérer');
        }
        $this->quantite_reservee -= $quantite;
        $this->save();
    }

    public function prelever($quantite)
    {
        if ($this->quantite_actuelle < $quantite) {
            throw new \Exception('Quantité insuffisante pour prélever');
        }
        $this->quantite_actuelle -= $quantite;
        if ($this->quantite_actuelle <= 0) {
            $this->statut = 'epuise';
        }
        $this->save();
    }

    public function approvisionner($quantite)
    {
        $this->quantite_actuelle += $quantite;
        $this->quantite_initiale += $quantite;
        if ($this->statut === 'epuise') {
            $this->statut = 'actif';
        }
        $this->save();
    }
}