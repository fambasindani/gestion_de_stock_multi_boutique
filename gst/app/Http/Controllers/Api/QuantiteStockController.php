<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\QuantiteStock;
use App\Models\VarianteProduit;
use App\Models\EmplacementStock;
use Illuminate\Http\Request;
use Illuminate\Database\Eloquent\ModelNotFoundException;
use Illuminate\Validation\ValidationException;
use Exception;
use DB;

class QuantiteStockController extends Controller
{
    /**
     * Liste des stocks avec recherche, filtres et pagination
     */
    public function index(Request $request)
    {
        try {
            $query = QuantiteStock::with(['produit', 'produit.modele', 'emplacement', 'lot']);

            // Recherche par produit
            if ($request->filled('search')) {
                $search = $request->search;
                $query->whereHas('produit', function($q) use ($search) {
                    $q->where('code_interne', 'LIKE', "%{$search}%")
                      ->orWhere('nom', 'LIKE', "%{$search}%")
                      ->orWhereHas('modele', function($sub) use ($search) {
                          $sub->where('nom', 'LIKE', "%{$search}%");
                      });
                });
            }

            // Filtre par produit
            if ($request->filled('produit_id')) {
                $query->where('produit_id', $request->produit_id);
            }

            // Filtre par emplacement
            if ($request->filled('emplacement_id')) {
                $query->where('emplacement_id', $request->emplacement_id);
            }

            // Filtre par lot
            if ($request->filled('lot_id')) {
                $query->where('lot_id', $request->lot_id);
            }

            // Filtre par statut (en rupture, alerte, normal)
            if ($request->filled('statut')) {
                if ($request->statut === 'rupture') {
                    $query->where('quantite_disponible', '<=', 0);
                } elseif ($request->statut === 'alerte') {
                    $query->whereRaw('quantite_disponible <= seuil_minimum')
                          ->whereNotNull('seuil_minimum')
                          ->where('quantite_disponible', '>', 0);
                } elseif ($request->statut === 'normal') {
                    $query->where(function($q) {
                        $q->whereNull('seuil_minimum')
                          ->orWhereRaw('quantite_disponible > seuil_minimum');
                    })->where('quantite_disponible', '>', 0);
                }
            }

            // Filtre par disponibilité
            if ($request->filled('disponible')) {
                if ($request->disponible) {
                    $query->where('quantite_disponible', '>', 0);
                } else {
                    $query->where('quantite_disponible', '<=', 0);
                }
            }

            // Pagination
            $perPage = $request->input('per_page', 15);
            $stocks = $query->orderBy('created_at', 'desc')->paginate($perPage);

            return response()->json([
                'success' => true,
                'data' => $stocks,
                'message' => 'Liste des stocks récupérée avec succès'
            ], 200);

        } catch (Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Erreur lors de la récupération des stocks',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Voir un stock spécifique
     */
    public function show($id)
    {
        try {
            $stock = QuantiteStock::with(['produit', 'produit.modele', 'emplacement', 'lot'])
                                  ->findOrFail($id);

            return response()->json([
                'success' => true,
                'data' => $stock,
                'message' => 'Stock récupéré avec succès'
            ], 200);

        } catch (ModelNotFoundException $e) {
            return response()->json([
                'success' => false,
                'message' => 'Stock non trouvé'
            ], 404);

        } catch (Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Erreur lors de la récupération du stock',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Créer ou mettre à jour une quantité de stock
     */
    public function store(Request $request)
    {
        try {
            DB::beginTransaction();

            $validated = $request->validate([
                'produit_id' => 'required|exists:variante_produit,id',
                'emplacement_id' => 'required|exists:emplacement_stock,id',
                'lot_id' => 'nullable|exists:lot_tracabilite,id',
                'quantite_disponible' => 'nullable|numeric|min:0',
                'quantite_reservee' => 'nullable|numeric|min:0',
                'quantite_commande' => 'nullable|numeric|min:0',
                'quantite_controlee' => 'nullable|numeric|min:0',
                'seuil_minimum' => 'nullable|numeric|min:0',
                'seuil_maximum' => 'nullable|numeric|min:0',
                'date_prochaine_reception' => 'nullable|date',
                'notes' => 'nullable|string',
            ]);

            // Vérifier si la ligne existe déjà
            $stock = QuantiteStock::where('produit_id', $validated['produit_id'])
                                  ->where('emplacement_id', $validated['emplacement_id'])
                                  ->when($validated['lot_id'] ?? null, function($q) use ($validated) {
                                      return $q->where('lot_id', $validated['lot_id']);
                                  })
                                  ->first();

            if ($stock) {
                // Mettre à jour
                if (isset($validated['quantite_disponible'])) $stock->quantite_disponible += $validated['quantite_disponible'];
                if (isset($validated['quantite_reservee'])) $stock->quantite_reservee += $validated['quantite_reservee'];
                if (isset($validated['quantite_commande'])) $stock->quantite_commande += $validated['quantite_commande'];
                if (isset($validated['quantite_controlee'])) $stock->quantite_controlee += $validated['quantite_controlee'];
                if (isset($validated['seuil_minimum'])) $stock->seuil_minimum = $validated['seuil_minimum'];
                if (isset($validated['seuil_maximum'])) $stock->seuil_maximum = $validated['seuil_maximum'];
                if (isset($validated['date_prochaine_reception'])) $stock->date_prochaine_reception = $validated['date_prochaine_reception'];
                if (isset($validated['notes'])) $stock->notes = $validated['notes'];

                $stock->date_dernier_mouvement = now()->toDateString();
                $stock->save();
                $message = 'Stock mis à jour avec succès';
            } else {
                // Créer
                $validated['quantite_disponible'] = $validated['quantite_disponible'] ?? 0;
                $validated['quantite_reservee'] = $validated['quantite_reservee'] ?? 0;
                $validated['quantite_commande'] = $validated['quantite_commande'] ?? 0;
                $validated['quantite_controlee'] = $validated['quantite_controlee'] ?? 0;
                $validated['date_dernier_mouvement'] = now()->toDateString();

                $stock = QuantiteStock::create($validated);
                $message = 'Stock créé avec succès';
            }

            DB::commit();

            $stock->load(['produit', 'emplacement', 'lot']);

            return response()->json([
                'success' => true,
                'data' => $stock,
                'message' => $message
            ], 201);

        } catch (ValidationException $e) {
            DB::rollBack();
            return response()->json([
                'success' => false,
                'message' => 'Erreur de validation',
                'errors' => $e->errors()
            ], 422);

        } catch (Exception $e) {
            DB::rollBack();
            return response()->json([
                'success' => false,
                'message' => 'Erreur lors de la création/mise à jour du stock',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Modifier une quantité de stock
     */
    public function update(Request $request, $id)
    {
        try {
            DB::beginTransaction();

            $stock = QuantiteStock::findOrFail($id);

            $validated = $request->validate([
                'quantite_disponible' => 'nullable|numeric|min:0',
                'quantite_reservee' => 'nullable|numeric|min:0',
                'quantite_commande' => 'nullable|numeric|min:0',
                'quantite_controlee' => 'nullable|numeric|min:0',
                'seuil_minimum' => 'nullable|numeric|min:0',
                'seuil_maximum' => 'nullable|numeric|min:0',
                'date_prochaine_reception' => 'nullable|date',
                'notes' => 'nullable|string',
            ]);

            if (isset($validated['quantite_disponible'])) $stock->quantite_disponible = $validated['quantite_disponible'];
            if (isset($validated['quantite_reservee'])) $stock->quantite_reservee = $validated['quantite_reservee'];
            if (isset($validated['quantite_commande'])) $stock->quantite_commande = $validated['quantite_commande'];
            if (isset($validated['quantite_controlee'])) $stock->quantite_controlee = $validated['quantite_controlee'];
            if (isset($validated['seuil_minimum'])) $stock->seuil_minimum = $validated['seuil_minimum'];
            if (isset($validated['seuil_maximum'])) $stock->seuil_maximum = $validated['seuil_maximum'];
            if (isset($validated['date_prochaine_reception'])) $stock->date_prochaine_reception = $validated['date_prochaine_reception'];
            if (isset($validated['notes'])) $stock->notes = $validated['notes'];

            $stock->date_dernier_mouvement = now()->toDateString();
            $stock->save();

            DB::commit();

            $stock->load(['produit', 'emplacement', 'lot']);

            return response()->json([
                'success' => true,
                'data' => $stock,
                'message' => 'Stock modifié avec succès'
            ], 200);

        } catch (ModelNotFoundException $e) {
            DB::rollBack();
            return response()->json([
                'success' => false,
                'message' => 'Stock non trouvé'
            ], 404);

        } catch (ValidationException $e) {
            DB::rollBack();
            return response()->json([
                'success' => false,
                'message' => 'Erreur de validation',
                'errors' => $e->errors()
            ], 422);

        } catch (Exception $e) {
            DB::rollBack();
            return response()->json([
                'success' => false,
                'message' => 'Erreur lors de la modification du stock',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Supprimer une ligne de stock
     */
    public function destroy($id)
    {
        try {
            DB::beginTransaction();

            $stock = QuantiteStock::findOrFail($id);

            if ($stock->quantite_disponible > 0 || $stock->quantite_reservee > 0) {
                return response()->json([
                    'success' => false,
                    'message' => 'Impossible de supprimer un stock avec des quantités disponibles ou réservées'
                ], 422);
            }

            $stock->delete();

            DB::commit();

            return response()->json([
                'success' => true,
                'message' => 'Stock supprimé avec succès'
            ], 200);

        } catch (ModelNotFoundException $e) {
            DB::rollBack();
            return response()->json([
                'success' => false,
                'message' => 'Stock non trouvé'
            ], 404);

        } catch (Exception $e) {
            DB::rollBack();
            return response()->json([
                'success' => false,
                'message' => 'Erreur lors de la suppression du stock',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Résumer le stock d'un produit sur tous les emplacements
     */
    public function resumerProduit($produitId)
    {
        try {
            $produit = VarianteProduit::with('modele')->findOrFail($produitId);

            $stocks = QuantiteStock::with(['emplacement', 'lot'])
                                   ->where('produit_id', $produitId)
                                   ->get();

            $totalDisponible = $stocks->sum('quantite_disponible');
            $totalReservee = $stocks->sum('quantite_reservee');
            $totalCommande = $stocks->sum('quantite_commande');
            $totalControlee = $stocks->sum('quantite_controlee');

            return response()->json([
                'success' => true,
                'data' => [
                    'produit' => $produit,
                    'stocks' => $stocks,
                    'totaux' => [
                        'quantite_disponible' => $totalDisponible,
                        'quantite_reservee' => $totalReservee,
                        'quantite_commande' => $totalCommande,
                        'quantite_controlee' => $totalControlee,
                        'quantite_totale' => $totalDisponible + $totalReservee
                    ]
                ],
                'message' => 'Résumé du stock récupéré avec succès'
            ], 200);

        } catch (ModelNotFoundException $e) {
            return response()->json([
                'success' => false,
                'message' => 'Produit non trouvé'
            ], 404);

        } catch (Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Erreur lors de la récupération du résumé',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Résumer le stock d'un emplacement
     */
    public function resumerEmplacement($emplacementId)
    {
        try {
            $emplacement = EmplacementStock::findOrFail($emplacementId);

            $stocks = QuantiteStock::with(['produit', 'produit.modele', 'lot'])
                                   ->where('emplacement_id', $emplacementId)
                                   ->get();

            $totalDisponible = $stocks->sum('quantite_disponible');
            $totalReservee = $stocks->sum('quantite_reservee');

            return response()->json([
                'success' => true,
                'data' => [
                    'emplacement' => $emplacement,
                    'stocks' => $stocks,
                    'totaux' => [
                        'quantite_disponible' => $totalDisponible,
                        'quantite_reservee' => $totalReservee,
                        'nombre_produits' => $stocks->count()
                    ]
                ],
                'message' => 'Résumé de l\'emplacement récupéré avec succès'
            ], 200);

        } catch (ModelNotFoundException $e) {
            return response()->json([
                'success' => false,
                'message' => 'Emplacement non trouvé'
            ], 404);

        } catch (Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Erreur lors de la récupération du résumé',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Mouvement de stock (transfert entre emplacements)
     */
    public function mouvement(Request $request)
    {
        try {
            DB::beginTransaction();

            $validated = $request->validate([
                'produit_id' => 'required|exists:variante_produit,id',
                'source_emplacement_id' => 'required|exists:emplacement_stock,id',
                'dest_emplacement_id' => 'required|exists:emplacement_stock,id|different:source_emplacement_id',
                'quantite' => 'required|numeric|min:0.01',
                'lot_id' => 'nullable|exists:lot_tracabilite,id',
                'notes' => 'nullable|string',
            ]);

            // Trouver ou créer la ligne de stock source
            $sourceStock = QuantiteStock::where('produit_id', $validated['produit_id'])
                                        ->where('emplacement_id', $validated['source_emplacement_id'])
                                        ->when($validated['lot_id'] ?? null, function($q) use ($validated) {
                                            return $q->where('lot_id', $validated['lot_id']);
                                        })
                                        ->first();

            if (!$sourceStock) {
                return response()->json([
                    'success' => false,
                    'message' => 'Stock source non trouvé'
                ], 404);
            }

            if ($sourceStock->quantite_disponible < $validated['quantite']) {
                return response()->json([
                    'success' => false,
                    'message' => 'Quantité disponible insuffisante dans le stock source'
                ], 422);
            }

            // Trouver ou créer la ligne de stock destination
            $destStock = QuantiteStock::where('produit_id', $validated['produit_id'])
                                      ->where('emplacement_id', $validated['dest_emplacement_id'])
                                      ->when($validated['lot_id'] ?? null, function($q) use ($validated) {
                                          return $q->where('lot_id', $validated['lot_id']);
                                      })
                                      ->first();

            if (!$destStock) {
                $destStock = QuantiteStock::create([
                    'produit_id' => $validated['produit_id'],
                    'emplacement_id' => $validated['dest_emplacement_id'],
                    'lot_id' => $validated['lot_id'] ?? null,
                    'quantite_disponible' => 0,
                    'quantite_reservee' => 0,
                    'date_dernier_mouvement' => now()->toDateString(),
                    'notes' => 'Créé lors d\'un mouvement',
                ]);
            }

            // Effectuer le mouvement
            $sourceStock->diminuer($validated['quantite'], 'disponible');
            $destStock->augmenter($validated['quantite'], 'disponible');

            // Ajouter des notes
            $sourceStock->notes = ($sourceStock->notes ?? '') . "\nMouvement vers " . $destStock->emplacement->nom . " le " . now()->toDateString() . " - " . $validated['quantite'] . " unités";
            $sourceStock->save();

            $destStock->notes = ($destStock->notes ?? '') . "\nMouvement depuis " . $sourceStock->emplacement->nom . " le " . now()->toDateString() . " - " . $validated['quantite'] . " unités";
            $destStock->save();

            DB::commit();

            return response()->json([
                'success' => true,
                'data' => [
                    'source' => $sourceStock,
                    'destination' => $destStock
                ],
                'message' => 'Mouvement de stock effectué avec succès'
            ], 200);

        } catch (ValidationException $e) {
            DB::rollBack();
            return response()->json([
                'success' => false,
                'message' => 'Erreur de validation',
                'errors' => $e->errors()
            ], 422);

        } catch (Exception $e) {
            DB::rollBack();
            return response()->json([
                'success' => false,
                'message' => 'Erreur lors du mouvement de stock',
                'error' => $e->getMessage()
            ], 500);
        }
    }
}