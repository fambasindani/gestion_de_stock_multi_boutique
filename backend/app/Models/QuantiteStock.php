<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class QuantiteStock extends Model
{
    protected $table = 'quantite_stock';
    protected $primaryKey = 'id';

    protected $fillable = [
        'produit_id',
        'emplacement_id',
        'lot_id',
        'quantite_disponible',
        'quantite_reservee',
        'quantite_commande',
        'quantite_controlee',
        'seuil_minimum',
        'seuil_maximum',
        'societe_id',
        'date_dernier_mouvement',
        'date_prochaine_reception',
        'notes'
    ];

    protected $casts = [
        'quantite_disponible' => 'decimal:2',
        'quantite_reservee' => 'decimal:2',
        'quantite_commande' => 'decimal:2',
        'quantite_controlee' => 'decimal:2',
        'seuil_minimum' => 'decimal:2',
        'seuil_maximum' => 'decimal:2',
        'date_dernier_mouvement' => 'date',
        'date_prochaine_reception' => 'date',
    ];

    // Relations
    public function produit()
    {
        return $this->belongsTo(VarianteProduit::class, 'produit_id');
    }

    public function emplacement()
    {
        return $this->belongsTo(EmplacementStock::class, 'emplacement_id');
    }

    public function lot()
    {
        return $this->belongsTo(LotTracabilite::class, 'lot_id');
    }

    public function societe()
    {
        return $this->belongsTo(Societe::class, 'societe_id');
    }

    // Accesseurs
    public function getQuantiteTotaleAttribute()
    {
        return $this->quantite_disponible + $this->quantite_reservee;
    }

    public function getQuantiteDisponibleLocaleAttribute()
    {
        return $this->quantite_disponible - $this->quantite_reservee;
    }

    public function getEstEnRuptureAttribute()
    {
        if ($this->seuil_minimum === null) return false;
        return $this->quantite_disponible <= $this->seuil_minimum;
    }

    public function getEstEnSurplusAttribute()
    {
        if ($this->seuil_maximum === null) return false;
        return $this->quantite_disponible >= $this->seuil_maximum;
    }

    public function getStatutAttribute()
    {
        if ($this->quantite_disponible <= 0) {
            return 'rupture';
        } elseif ($this->estEnRupture) {
            return 'alerte';
        } elseif ($this->estEnSurplus) {
            return 'surplus';
        }
        return 'normal';
    }

    public function getStatutLabelAttribute()
    {
        $labels = [
            'rupture' => 'Rupture de stock',
            'alerte' => 'Stock minimum',
            'surplus' => 'Stock maximum',
            'normal' => 'Stock normal'
        ];
        return $labels[$this->statut] ?? 'Normal';
    }

    public function getStatutColorAttribute()
    {
        $colors = [
            'rupture' => 'red',
            'alerte' => 'orange',
            'surplus' => 'yellow',
            'normal' => 'green'
        ];
        return $colors[$this->statut] ?? 'green';
    }

    // Scopes
    public function scopeDisponible($query)
    {
        return $query->where('quantite_disponible', '>', 0);
    }

    public function scopeEnRupture($query)
    {
        return $query->where('quantite_disponible', '<=', 0);
    }

    public function scopeAlerte($query)
    {
        return $query->whereRaw('quantite_disponible <= seuil_minimum')
                     ->whereNotNull('seuil_minimum')
                     ->where('quantite_disponible', '>', 0);
    }

    public function scopeParProduit($query, $produitId)
    {
        return $query->where('produit_id', $produitId);
    }

    public function scopeParEmplacement($query, $emplacementId)
    {
        return $query->where('emplacement_id', $emplacementId);
    }

    public function scopeParLot($query, $lotId)
    {
        return $query->where('lot_id', $lotId);
    }

    // Méthodes
    public function augmenter($quantite, $type = 'disponible')
    {
        if ($type === 'disponible') {
            $this->quantite_disponible += $quantite;
        } elseif ($type === 'commande') {
            $this->quantite_commande += $quantite;
        } elseif ($type === 'controlee') {
            $this->quantite_controlee += $quantite;
        }
        $this->date_dernier_mouvement = now()->toDateString();
        $this->save();
    }

    public function diminuer($quantite, $type = 'disponible')
    {
        if ($type === 'disponible') {
            if ($this->quantite_disponible < $quantite) {
                throw new \Exception('Quantité disponible insuffisante');
            }
            $this->quantite_disponible -= $quantite;
        } elseif ($type === 'commande') {
            if ($this->quantite_commande < $quantite) {
                throw new \Exception('Quantité commandée insuffisante');
            }
            $this->quantite_commande -= $quantite;
        } elseif ($type === 'controlee') {
            if ($this->quantite_controlee < $quantite) {
                throw new \Exception('Quantité en contrôle insuffisante');
            }
            $this->quantite_controlee -= $quantite;
        } elseif ($type === 'reservee') {
            if ($this->quantite_reservee < $quantite) {
                throw new \Exception('Quantité réservée insuffisante');
            }
            $this->quantite_reservee -= $quantite;
        }
        $this->date_dernier_mouvement = now()->toDateString();
        $this->save();
    }

    public function reserver($quantite)
    {
        if ($this->quantite_disponible < $quantite) {
            throw new \Exception('Quantité disponible insuffisante pour la réservation');
        }
        $this->quantite_disponible -= $quantite;
        $this->quantite_reservee += $quantite;
        $this->date_dernier_mouvement = now()->toDateString();
        $this->save();
    }

    public function liberer($quantite)
    {
        if ($this->quantite_reservee < $quantite) {
            throw new \Exception('Quantité réservée insuffisante pour la libération');
        }
        $this->quantite_reservee -= $quantite;
        $this->quantite_disponible += $quantite;
        $this->date_dernier_mouvement = now()->toDateString();
        $this->save();
    }

    public function receptionner($quantite)
    {
        $this->quantite_commande -= $quantite;
        $this->quantite_controlee += $quantite;
        $this->date_dernier_mouvement = now()->toDateString();
        $this->save();
    }

    public function validerControle($quantite)
    {
        if ($this->quantite_controlee < $quantite) {
            throw new \Exception('Quantité en contrôle insuffisante');
        }
        $this->quantite_controlee -= $quantite;
        $this->quantite_disponible += $quantite;
        $this->date_dernier_mouvement = now()->toDateString();
        $this->save();
    }

    public function rejeterControle($quantite)
    {
        if ($this->quantite_controlee < $quantite) {
            throw new \Exception('Quantité en contrôle insuffisante');
        }
        $this->quantite_controlee -= $quantite;
        $this->date_dernier_mouvement = now()->toDateString();
        $this->save();
    }
}