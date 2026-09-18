<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\TransfertStock;
use App\Models\MouvementStock;
use App\Models\LigneOperationStock;
use App\Models\QuantiteStock;
use App\Models\VarianteProduit;
use Illuminate\Http\Request;
use Illuminate\Database\Eloquent\ModelNotFoundException;
use Illuminate\Validation\ValidationException;
use Exception;
use DB;

class TransfertStockController extends Controller
{
    /**
     * Liste des transferts avec recherche, filtres et pagination
     */
    public function index(Request $request)
    {
        try {
            $query = TransfertStock::with([
                'emplacementSource',
                'emplacementDestination',
                'mouvements',
                'creePar'
            ]);

            // Recherche
            if ($request->filled('search')) {
                $search = $request->search;
                $query->where(function($q) use ($search) {
                    $q->where('reference', 'LIKE', "%{$search}%")
                      ->orWhere('origine', 'LIKE', "%{$search}%")
                      ->orWhere('notes', 'LIKE', "%{$search}%");
                });
            }

            // Filtre par type
            if ($request->filled('type')) {
                $query->where('type', $request->type);
            }

            // Filtre par état
            if ($request->filled('etat')) {
                $query->where('etat', $request->etat);
            }

            // Filtre par emplacement source
            if ($request->filled('emplacement_source_id')) {
                $query->where('emplacement_source_id', $request->emplacement_source_id);
            }

            // Filtre par emplacement destination
            if ($request->filled('emplacement_destination_id')) {
                $query->where('emplacement_destination_id', $request->emplacement_destination_id);
            }

            // Filtre par date
            if ($request->filled('date_debut')) {
                $query->whereDate('date_transfert', '>=', $request->date_debut);
            }
            if ($request->filled('date_fin')) {
                $query->whereDate('date_transfert', '<=', $request->date_fin);
            }

            // Pagination
            $perPage = $request->input('per_page', 15);
            $transferts = $query->orderBy('created_at', 'desc')->paginate($perPage);

            return response()->json([
                'success' => true,
                'data' => $transferts,
                'message' => 'Liste des transferts récupérée avec succès'
            ], 200);

        } catch (Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Erreur lors de la récupération des transferts',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Voir un transfert spécifique
     */
    public function show($id)
    {
        try {
            $transfert = TransfertStock::with([
                'emplacementSource',
                'emplacementDestination',
                'mouvements',
                'mouvements.produit',
                'mouvements.lot',
                'mouvements.emplacementSource',
                'mouvements.emplacementDestination',
                'creePar',
                'modifiePar'
            ])->findOrFail($id);

            return response()->json([
                'success' => true,
                'data' => $transfert,
                'message' => 'Transfert récupéré avec succès'
            ], 200);

        } catch (ModelNotFoundException $e) {
            return response()->json([
                'success' => false,
                'message' => 'Transfert non trouvé'
            ], 404);

        } catch (Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Erreur lors de la récupération du transfert',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Créer un nouveau transfert
     */
  /**
 * Créer un nouveau transfert
 */
public function store(Request $request)
{
    try {
        DB::beginTransaction();

        $validated = $request->validate([
            'type' => 'required|in:reception,livraison,interne,production',
            'emplacement_source_id' => 'required|exists:emplacement_stock,id',
            'emplacement_destination_id' => 'required|exists:emplacement_stock,id|different:emplacement_source_id',
            'commande_vente_id' => 'nullable|exists:commande_vente,id',
            'commande_achat_id' => 'nullable|exists:commande_achat,id',
            'date_prevue' => 'nullable|date',
            'notes' => 'nullable|string',
            'adresse_livraison' => 'nullable|string',
            'adresse_expedition' => 'nullable|string',
            'mode_transport' => 'nullable|string|max:100',
            'mouvements' => 'required|array|min:1',
            'mouvements.*.produit_id' => 'required|exists:variante_produit,id',
            'mouvements.*.quantite_demandee' => 'required|numeric|min:0.01',
            'mouvements.*.lot_id' => 'nullable|exists:lot_tracabilite,id',
            'mouvements.*.description' => 'nullable|string',
            'mouvements.*.notes' => 'nullable|string',
        ]);

        // Vérifier que les emplacements ne sont pas les mêmes
        if ($validated['emplacement_source_id'] == $validated['emplacement_destination_id']) {
            return response()->json([
                'success' => false,
                'message' => 'Les emplacements source et destination doivent être différents'
            ], 422);
        }

        // Générer la référence
        $lastTransfert = TransfertStock::latest('id')->first();
        $numero = $lastTransfert ? intval(substr($lastTransfert->reference, -5)) + 1 : 1;
        $reference = 'TRF-' . date('Y') . '-' . str_pad($numero, 5, '0', STR_PAD_LEFT);

        // ✅ CORRECTION ICI : Vérifier si les clés existent avant de les utiliser
        $origine = null;
        if (!empty($validated['commande_vente_id'])) {
            $origine = 'Commande vente #' . $validated['commande_vente_id'];
        } elseif (!empty($validated['commande_achat_id'])) {
            $origine = 'Commande achat #' . $validated['commande_achat_id'];
        }

        // Créer le transfert
        $transfert = TransfertStock::create([
            'reference' => $reference,
            'origine' => $origine,
            'commande_vente_id' => $validated['commande_vente_id'] ?? null,
            'commande_achat_id' => $validated['commande_achat_id'] ?? null,
            'emplacement_source_id' => $validated['emplacement_source_id'],
            'emplacement_destination_id' => $validated['emplacement_destination_id'],
            'type' => $validated['type'],
            'etat' => 'brouillon',
            'date_transfert' => now()->toDateString(),
            'date_prevue' => $validated['date_prevue'] ?? null,
            'notes' => $validated['notes'] ?? null,
            'adresse_livraison' => $validated['adresse_livraison'] ?? null,
            'adresse_expedition' => $validated['adresse_expedition'] ?? null,
            'mode_transport' => $validated['mode_transport'] ?? null,
            'cree_par_utilisateur_id' => auth()->id(),
            'actif' => true,
        ]);

        // Créer les mouvements
        $poidsTotal = 0;

        foreach ($validated['mouvements'] as $mvtData) {
            $produit = VarianteProduit::with('modele')->find($mvtData['produit_id']);

            // Vérifier si la quantité est disponible (pour les transferts internes et livraisons)
            if ($validated['type'] === 'interne' || $validated['type'] === 'livraison') {
                $quantiteDispo = QuantiteStock::where('produit_id', $mvtData['produit_id'])
                                              ->where('emplacement_id', $validated['emplacement_source_id'])
                                              ->when($mvtData['lot_id'] ?? null, function($q) use ($mvtData) {
                                                  return $q->where('lot_id', $mvtData['lot_id']);
                                              })
                                              ->sum('quantite_disponible');

                if ($quantiteDispo < $mvtData['quantite_demandee']) {
                    DB::rollBack();
                    return response()->json([
                        'success' => false,
                        'message' => "Quantité insuffisante pour le produit: {$produit->nom} (Disponible: {$quantiteDispo}, Demandée: {$mvtData['quantite_demandee']})"
                    ], 422);
                }
            }

            MouvementStock::create([
                'transfert_id' => $transfert->id,
                'produit_id' => $mvtData['produit_id'],
                'lot_id' => $mvtData['lot_id'] ?? null,
                'code_produit' => $produit->code_interne ?? null,
                'nom_produit' => $produit->nom ?? $produit->modele->nom ?? 'Produit',
                'description' => $mvtData['description'] ?? null,
                'quantite_demandee' => $mvtData['quantite_demandee'],
                'quantite_traitee' => 0,
                'quantite_reservee' => 0,
                'emplacement_source_id' => $validated['emplacement_source_id'],
                'emplacement_destination_id' => $validated['emplacement_destination_id'],
                'etat' => 'brouillon',
                'unite' => 'pièce',
                'poids_unitaire' => $produit->poids ?? null,
                'notes' => $mvtData['notes'] ?? null,
            ]);

            // Calculer les totaux
            if ($produit->poids) {
                $poidsTotal += $produit->poids * $mvtData['quantite_demandee'];
            }
        }

        // Mettre à jour les poids du transfert
        $transfert->poids_total = $poidsTotal;
        $transfert->save();

        DB::commit();

        $transfert->load(['emplacementSource', 'emplacementDestination', 'mouvements']);

        $this->logActivity('create', 'TransfertStock', $transfert->id, "Création transfert stock {$transfert->reference}");

        return response()->json([
            'success' => true,
            'data' => $transfert,
            'message' => 'Transfert créé avec succès'
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
            'message' => 'Erreur lors de la création du transfert',
            'error' => $e->getMessage()
        ], 500);
    }
}

    /**
     * Modifier un transfert
     */
    public function update(Request $request, $id)
    {
        try {
            DB::beginTransaction();

            $transfert = TransfertStock::findOrFail($id);

            if (in_array($transfert->etat, ['termine', 'annule'])) {
                return response()->json([
                    'success' => false,
                    'message' => 'Les transferts terminés ou annulés ne peuvent pas être modifiés'
                ], 422);
            }

            $validated = $request->validate([
                'date_prevue' => 'nullable|date',
                'notes' => 'nullable|string',
                'adresse_livraison' => 'nullable|string',
                'adresse_expedition' => 'nullable|string',
                'mode_transport' => 'nullable|string|max:100',
            ]);

            $transfert->update($validated);
            $transfert->modifie_par_utilisateur_id = auth()->id();
            $transfert->save();

            DB::commit();

            $transfert->load(['emplacementSource', 'emplacementDestination', 'mouvements']);

            $this->logActivity('update', 'TransfertStock', $transfert->id, "Modification transfert stock {$transfert->reference}");

            return response()->json([
                'success' => true,
                'data' => $transfert,
                'message' => 'Transfert modifié avec succès'
            ], 200);

        } catch (ModelNotFoundException $e) {
            DB::rollBack();
            return response()->json([
                'success' => false,
                'message' => 'Transfert non trouvé'
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
                'message' => 'Erreur lors de la modification du transfert',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Changer l'état d'un transfert
     */
    public function changerEtat(Request $request, $id)
    {
        try {
            DB::beginTransaction();

            $transfert = TransfertStock::findOrFail($id);

            $validated = $request->validate([
                'etat' => 'required|in:confirme,assigne,termine,annule',
                'notes' => 'nullable|string',
            ]);

            $transitions = [
                'brouillon' => ['confirme', 'annule'],
                'attente' => ['confirme', 'annule'],
                'confirme' => ['assigne', 'annule'],
                'assigne' => ['termine', 'annule'],
                'termine' => ['annule'],
                'annule' => [],
            ];

            if (!in_array($validated['etat'], $transitions[$transfert->etat] ?? [])) {
                return response()->json([
                    'success' => false,
                    'message' => "Transition d'état impossible de {$transfert->etat} à {$validated['etat']}"
                ], 422);
            }

            // Si le transfert est terminé, mettre à jour les stocks
            if ($validated['etat'] === 'termine') {
                $transfert->date_reelle = now()->toDateString();

                foreach ($transfert->mouvements as $mouvement) {
                    if ($mouvement->quantite_traitee > 0) {
                        // Mettre à jour les quantités de stock
                        $this->mettreAJourStock($mouvement);
                    }
                }
            }

            $transfert->etat = $validated['etat'];
            $transfert->notes = $request->notes ?? $transfert->notes;
            $transfert->modifie_par_utilisateur_id = auth()->id();
            $transfert->save();

            // Synchroniser l'état des mouvements avec celui du transfert
            $transfert->mouvements()->update(['etat' => $validated['etat']]);

            DB::commit();

            $transfert->load(['emplacementSource', 'emplacementDestination', 'mouvements']);

            return response()->json([
                'success' => true,
                'data' => $transfert,
                'message' => "Transfert passé à l'état: " . $transfert->etat_label
            ], 200);

        } catch (ModelNotFoundException $e) {
            DB::rollBack();
            return response()->json([
                'success' => false,
                'message' => 'Transfert non trouvé'
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
                'message' => 'Erreur lors du changement d\'état',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Mettre à jour le stock lors d'un transfert terminé
     */
    private function mettreAJourStock($mouvement)
    {
        // 1. Diminuer le stock source (disponible)
        $sourceStock = QuantiteStock::where('produit_id', $mouvement->produit_id)
                                    ->where('emplacement_id', $mouvement->emplacement_source_id)
                                    ->when($mouvement->lot_id, function($q) use ($mouvement) {
                                        return $q->where('lot_id', $mouvement->lot_id);
                                    })
                                    ->first();

        if ($sourceStock) {
            $sourceStock->diminuer($mouvement->quantite_traitee, 'disponible');
        }

        // 2. Augmenter le stock destination (disponible)
        $destStock = QuantiteStock::where('produit_id', $mouvement->produit_id)
                                  ->where('emplacement_id', $mouvement->emplacement_destination_id)
                                  ->when($mouvement->lot_id, function($q) use ($mouvement) {
                                      return $q->where('lot_id', $mouvement->lot_id);
                                  })
                                  ->first();

        if (!$destStock) {
            $destStock = QuantiteStock::create([
                'produit_id' => $mouvement->produit_id,
                'emplacement_id' => $mouvement->emplacement_destination_id,
                'lot_id' => $mouvement->lot_id,
                'quantite_disponible' => 0,
                'quantite_reservee' => 0,
                'date_dernier_mouvement' => now()->toDateString(),
            ]);
        }

        $destStock->augmenter($mouvement->quantite_traitee, 'disponible');
    }

    /**
     * Ajouter une opération détaillée (scannage)
     */
    public function ajouterOperation(Request $request, $id)
    {
        try {
            DB::beginTransaction();

            $transfert = TransfertStock::findOrFail($id);

            if (in_array($transfert->etat, ['termine', 'annule'])) {
                return response()->json([
                    'success' => false,
                    'message' => 'Impossible d\'ajouter des opérations à un transfert terminé ou annulé'
                ], 422);
            }

            $validated = $request->validate([
                'mouvement_id' => 'required|exists:mouvement_stock,id',
                'produit_id' => 'required|exists:variante_produit,id',
                'lot_id' => 'nullable|exists:lot_tracabilite,id',
                'quantite_traitee' => 'required|numeric|min:0.01',
                'emplacement_source_id' => 'required|exists:emplacement_stock,id',
                'emplacement_destination_id' => 'required|exists:emplacement_stock,id',
                'code_barres' => 'nullable|string|max:255',
                'type_operation' => 'required|in:prelevement,reception,scan',
                'notes' => 'nullable|string',
            ]);

            // Vérifier que le mouvement appartient au transfert
            $mouvement = MouvementStock::where('id', $validated['mouvement_id'])
                                       ->where('transfert_id', $transfert->id)
                                       ->firstOrFail();

            // Vérifier que la quantité ne dépasse pas la quantité demandée
            $quantiteRestante = $mouvement->quantite_demandee - $mouvement->quantite_traitee;
            if ($validated['quantite_traitee'] > $quantiteRestante) {
                return response()->json([
                    'success' => false,
                    'message' => "Quantité traitée ({$validated['quantite_traitee']}) supérieure à la quantité restante ({$quantiteRestante})"
                ], 422);
            }

            // Créer l'opération
            $operation = LigneOperationStock::create([
                'mouvement_id' => $mouvement->id,
                'produit_id' => $validated['produit_id'],
                'lot_id' => $validated['lot_id'] ?? null,
                'code_barres' => $validated['code_barres'] ?? null,
                'quantite_traitee' => $validated['quantite_traitee'],
                'emplacement_source_id' => $validated['emplacement_source_id'],
                'emplacement_destination_id' => $validated['emplacement_destination_id'],
                'utilisateur_id' => auth()->id(),
                'date_operation' => now(),
                'type_operation' => $validated['type_operation'],
                'notes' => $validated['notes'] ?? null,
            ]);

            // Mettre à jour la quantité traitée du mouvement
            $mouvement->quantite_traitee += $validated['quantite_traitee'];
            $mouvement->emplacement_source_reel_id = $validated['emplacement_source_id'];
            $mouvement->emplacement_destination_reel_id = $validated['emplacement_destination_id'];

            if ($mouvement->quantite_traitee >= $mouvement->quantite_demandee) {
                $mouvement->etat = 'assigne';
            } else {
                $mouvement->etat = 'confirme';
            }

            $mouvement->date_prelevement = now()->toDateString();
            $mouvement->save();

            DB::commit();

            return response()->json([
                'success' => true,
                'data' => $operation,
                'mouvement' => $mouvement,
                'message' => 'Opération ajoutée avec succès'
            ], 201);

        } catch (ModelNotFoundException $e) {
            DB::rollBack();
            return response()->json([
                'success' => false,
                'message' => 'Mouvement non trouvé'
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
                'message' => 'Erreur lors de l\'ajout de l\'opération',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Supprimer un transfert
     */
    public function destroy($id)
    {
        try {
            DB::beginTransaction();

            $transfert = TransfertStock::findOrFail($id);

            if (!in_array($transfert->etat, ['brouillon', 'annule'])) {
                return response()->json([
                    'success' => false,
                    'message' => 'Seuls les transferts en brouillon ou annulés peuvent être supprimés'
                ], 422);
            }

            $transfert->delete();

            DB::commit();

            $this->logActivity('delete', 'TransfertStock', $id, "Suppression transfert stock #{$id}");

            return response()->json([
                'success' => true,
                'message' => 'Transfert supprimé avec succès'
            ], 200);

        } catch (ModelNotFoundException $e) {
            DB::rollBack();
            return response()->json([
                'success' => false,
                'message' => 'Transfert non trouvé'
            ], 404);

        } catch (Exception $e) {
            DB::rollBack();
            return response()->json([
                'success' => false,
                'message' => 'Erreur lors de la suppression du transfert',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Valider un transfert (permet de passer à l'étape suivante)
     */
    public function valider($id)
    {
        try {
            DB::beginTransaction();

            $transfert = TransfertStock::findOrFail($id);

            if ($transfert->etat !== 'confirme' && $transfert->etat !== 'assigne') {
                return response()->json([
                    'success' => false,
                    'message' => 'Seuls les transferts confirmés ou assignés peuvent être validés'
                ], 422);
            }

            // Compléter automatiquement les quantités non encore traitées :
            // valider = transférer la totalité demandée.
            foreach ($transfert->mouvements as $mouvement) {
                if ((float) $mouvement->quantite_traitee < (float) $mouvement->quantite_demandee) {
                    $mouvement->quantite_traitee = $mouvement->quantite_demandee;
                    $mouvement->save();
                }
            }

            $transfert->etat = 'termine';
            $transfert->date_reelle = now()->toDateString();
            $transfert->modifie_par_utilisateur_id = auth()->id();
            $transfert->save();

            // Les mouvements passent aussi à "terminé"
            $transfert->mouvements()->update(['etat' => 'termine']);

            // Mettre à jour les stocks
            foreach ($transfert->mouvements as $mouvement) {
                $this->mettreAJourStock($mouvement);
            }

            DB::commit();

            $transfert->load(['emplacementSource', 'emplacementDestination', 'mouvements']);

            $this->logActivity('valider', 'TransfertStock', $transfert->id, "Validation transfert {$transfert->reference}");

            return response()->json([
                'success' => true,
                'data' => $transfert,
                'message' => 'Transfert validé avec succès'
            ], 200);

        } catch (ModelNotFoundException $e) {
            DB::rollBack();
            return response()->json([
                'success' => false,
                'message' => 'Transfert non trouvé'
            ], 404);

        } catch (Exception $e) {
            DB::rollBack();
            return response()->json([
                'success' => false,
                'message' => 'Erreur lors de la validation du transfert',
                'error' => $e->getMessage()
            ], 500);
        }
    }
}