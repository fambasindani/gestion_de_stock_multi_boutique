<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\CommandeVente;
use App\Models\LigneCommandeVente;
use App\Models\VarianteProduit;
use App\Models\QuantiteStock;
use App\Models\EcritureComptable;
use App\Models\LigneEcritureComptable;
use App\Models\Partenaire;
use App\Models\Parametre;
use Illuminate\Http\Request;
use Illuminate\Validation\ValidationException;
use Illuminate\Support\Facades\DB;
use Exception;

class PosController extends Controller
{
    /**
     * Vente comptoir : crée la commande + la facture, décrémente le stock
     * et renvoie les données du ticket à imprimer.
     */
    public function vendre(Request $request)
    {
        try {
            DB::beginTransaction();

            $validated = $request->validate([
                'lignes' => 'required|array|min:1',
                'lignes.*.produit_id' => 'required|exists:variante_produit,id',
                'lignes.*.quantite' => 'required|numeric|min:0.01',
                'lignes.*.prix_unitaire_ht' => 'required|numeric|min:0',
                'lignes.*.taux_tva' => 'nullable|numeric|min:0|max:100',
                'lignes.*.taux_remise' => 'nullable|numeric|min:0|max:100',
                'partenaire_id' => 'nullable|exists:partenaire,id',
                'client_nom' => 'nullable|string|max:255',
                'mode_paiement' => 'nullable|string|max:50',
                'montant_paye' => 'nullable|numeric|min:0',
                'emplacement_id' => 'nullable|exists:emplacement_stock,id',
                'notes' => 'nullable|string',
            ]);

            $tvaDefaut = (float) Parametre::get('tva_taux', 16);
            $emplacementId = $validated['emplacement_id'] ?? null;

            // Partenaire : comptoir par défaut
            if (!empty($validated['partenaire_id'])) {
                $partenaire = Partenaire::find($validated['partenaire_id']);
            } else {
                $partenaire = Partenaire::firstOrCreate(
                    ['code' => 'COMPTOIR'],
                    [
                        'nom' => $validated['client_nom'] ?? 'Client comptoir',
                        'est_client' => true,
                        'est_fournisseur' => false,
                        'actif' => true,
                    ]
                );
            }

            // Référence commande
            $lastCommande = CommandeVente::latest('id')->first();
            $numero = $lastCommande ? intval(substr($lastCommande->reference, -5)) + 1 : 1;
            $reference = 'SO-' . date('Y') . '-' . str_pad($numero, 5, '0', STR_PAD_LEFT);

            // Calculs
            $lignesPreparees = [];
            $totalHt = 0;
            $totalTva = 0;
            $totalTtc = 0;
            $totalRemise = 0;

            foreach ($validated['lignes'] as $l) {
                $produit = VarianteProduit::with('modele')->findOrFail($l['produit_id']);
                $qte = (float) $l['quantite'];
                $prixHt = (float) $l['prix_unitaire_ht'];
                $tauxTva = isset($l['taux_tva']) ? (float) $l['taux_tva'] : $tvaDefaut;
                $tauxRemise = isset($l['taux_remise']) ? (float) $l['taux_remise'] : 0;

                $montantHt = $prixHt * $qte;
                $remise = $montantHt * ($tauxRemise / 100);
                $htApresRemise = $montantHt - $remise;
                $tva = $htApresRemise * ($tauxTva / 100);
                $ttc = $htApresRemise + $tva;

                $totalHt += $montantHt;
                $totalRemise += $remise;
                $totalTva += $tva;
                $totalTtc += $ttc;

                $lignesPreparees[] = [
                    'produit_id' => $produit->id,
                    'code_produit' => $produit->code_interne,
                    'nom_produit' => $produit->nom ?: ($produit->modele->nom ?? 'Produit'),
                    'quantite' => $qte,
                    'prix_unitaire_ht' => $prixHt,
                    'prix_unitaire_ttc' => $prixHt * (1 + $tauxTva / 100),
                    'taux_remise' => $tauxRemise,
                    'montant_remise' => $remise,
                    'montant_total_ht' => $montantHt,
                    'montant_total_ttc' => $ttc,
                    'taux_tva' => $tauxTva,
                ];
            }

            // Commande de vente (comptoir = terminée)
            $commande = CommandeVente::create([
                'reference' => $reference,
                'partenaire_id' => $partenaire->id,
                'client_nom' => $validated['client_nom'] ?? null,
                'date_commande' => now()->toDateString(),
                'etat' => 'termine',
                'mode_paiement' => $validated['mode_paiement'] ?? 'especes',
                'montant_total_ht' => $totalHt,
                'montant_total_ttc' => $totalTtc,
                'montant_remise' => $totalRemise,
                'notes' => $validated['notes'] ?? 'Vente comptoir',
                'cree_par_utilisateur_id' => auth()->id(),
                'actif' => true,
            ]);

            foreach ($lignesPreparees as $lp) {
                LigneCommandeVente::create(array_merge($lp, [
                    'commande_vente_id' => $commande->id,
                ]));
            }

            // Décrément du stock
            foreach ($lignesPreparees as $lp) {
                $this->decrementerStock($lp['produit_id'], $lp['quantite'], $emplacementId, $lp['nom_produit']);
            }

            // Facture
            $lastEcriture = EcritureComptable::latest('id')->first();
            $numE = $lastEcriture ? intval(substr($lastEcriture->reference, -5)) + 1 : 1;
            $refFacture = 'INV-' . date('Y') . '-' . str_pad($numE, 5, '0', STR_PAD_LEFT);
            $numeroFacture = 'FACT-' . date('Y') . '-' . str_pad($numE, 5, '0', STR_PAD_LEFT);

            $montantPaye = isset($validated['montant_paye']) ? (float) $validated['montant_paye'] : $totalTtc;
            $montantRestant = max(0, $totalTtc - $montantPaye);

            $facture = EcritureComptable::create([
                'reference' => $refFacture,
                'numero_facture' => $numeroFacture,
                'partenaire_id' => $partenaire->id,
                'type' => 'facture_client',
                'date_emission' => now()->toDateString(),
                'date_paiement' => $montantRestant <= 0 ? now()->toDateString() : null,
                'montant_ht' => $totalHt,
                'montant_tva' => $totalTva,
                'montant_ttc' => $totalTtc,
                'montant_remise' => $totalRemise,
                'montant_paye' => $montantPaye,
                'montant_restant' => $montantRestant,
                'commande_vente_id' => $commande->id,
                'statut' => $montantRestant <= 0 ? 'payee' : 'validee',
                'mode_paiement' => $validated['mode_paiement'] ?? 'especes',
                'notes' => 'Vente comptoir ' . $reference,
                'cree_par_utilisateur_id' => auth()->id(),
                'actif' => true,
            ]);

            foreach ($lignesPreparees as $lp) {
                LigneEcritureComptable::create([
                    'ecriture_comptable_id' => $facture->id,
                    'produit_id' => $lp['produit_id'],
                    'code_produit' => $lp['code_produit'],
                    'nom_produit' => $lp['nom_produit'],
                    'quantite' => $lp['quantite'],
                    'prix_unitaire_ht' => $lp['prix_unitaire_ht'],
                    'prix_unitaire_ttc' => $lp['prix_unitaire_ttc'],
                    'taux_remise' => $lp['taux_remise'],
                    'montant_remise' => $lp['montant_remise'],
                    'montant_ht' => $lp['montant_total_ht'],
                    'montant_tva' => $lp['montant_total_ht'] - $lp['montant_remise'] > 0
                        ? ($lp['montant_total_ht'] - $lp['montant_remise']) * ($lp['taux_tva'] / 100)
                        : 0,
                    'montant_ttc' => $lp['montant_total_ttc'],
                    'taux_tva' => $lp['taux_tva'],
                    'compte_comptable' => '411',
                    'compte_tva' => '4457',
                ]);
            }

            DB::commit();

            $this->logActivity('vente_comptoir', 'CommandeVente', $commande->id, "Vente comptoir {$commande->reference}");

            return response()->json([
                'success' => true,
                'data' => [
                    'commande' => $commande,
                    'facture' => $facture,
                    'lignes' => $lignesPreparees,
                    'totaux' => [
                        'total_ht' => round($totalHt, 2),
                        'total_tva' => round($totalTva, 2),
                        'total_ttc' => round($totalTtc, 2),
                        'total_remise' => round($totalRemise, 2),
                        'montant_paye' => round($montantPaye, 2),
                        'monnaie' => round(max(0, $montantPaye - $totalTtc), 2),
                    ],
                    'client_nom' => $validated['client_nom'] ?? null,
                    'partenaire' => $partenaire->nom,
                    'vendeur' => auth()->user()->nom ?? 'Utilisateur',
                    'societe' => auth()->user()->societe ?? null,
                    'date' => now()->format('d/m/Y H:i'),
                ],
                'message' => 'Vente enregistrée avec succès',
            ], 201);

        } catch (ValidationException $e) {
            DB::rollBack();
            return response()->json([
                'success' => false,
                'message' => 'Erreur de validation',
                'errors' => $e->errors(),
            ], 422);
        } catch (Exception $e) {
            DB::rollBack();
            return response()->json([
                'success' => false,
                'message' => $e->getMessage() ?: 'Erreur lors de la vente',
                'error' => $e->getMessage(),
            ], 500);
        }
    }

    private function decrementerStock($produitId, $quantite, $emplacementId, $nomProduit): void
    {
        $query = QuantiteStock::where('produit_id', $produitId);
        if ($emplacementId) {
            $query->where('emplacement_id', $emplacementId);
        }
        $stocks = $query->orderByDesc('quantite_disponible')->get();

        if ($stocks->isEmpty()) {
            return; // produit non suivi en stock
        }

        $remaining = $quantite;
        $disponible = $stocks->sum('quantite_disponible');

        if ($disponible < $quantite) {
            throw new Exception("Stock insuffisant pour « {$nomProduit} » (disponible : {$disponible}, demandé : {$quantite})");
        }

        foreach ($stocks as $stock) {
            if ($remaining <= 0) break;
            if ($stock->quantite_disponible <= 0) continue;
            $dec = min($remaining, (float) $stock->quantite_disponible);
            $stock->quantite_disponible = $stock->quantite_disponible - $dec;
            $stock->date_dernier_mouvement = now()->toDateString();
            $stock->save();
            $remaining -= $dec;
        }
    }
}
