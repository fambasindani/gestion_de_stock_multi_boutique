<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\LotTracabilite;
use App\Models\VarianteProduit;
use Illuminate\Http\Request;
use Illuminate\Database\Eloquent\ModelNotFoundException;
use Illuminate\Validation\ValidationException;
use Exception;
use DB;
use Carbon\Carbon;

class LotTracabiliteController extends Controller
{
    /**
     * Liste des lots avec recherche, filtres et pagination
     */
    public function index(Request $request)
    {
        try {
            $query = LotTracabilite::with(['produit', 'produit.modele']);

            // Recherche
            if ($request->filled('search')) {
                $search = $request->search;
                $query->where(function($q) use ($search) {
                    $q->where('nom', 'LIKE', "%{$search}%")
                      ->orWhere('code', 'LIKE', "%{$search}%")
                      ->orWhere('reference_fournisseur', 'LIKE', "%{$search}%")
                      ->orWhere('fournisseur', 'LIKE', "%{$search}%")
                      ->orWhereHas('produit', function($sub) use ($search) {
                          $sub->where('code_interne', 'LIKE', "%{$search}%")
                              ->orWhere('nom', 'LIKE', "%{$search}%");
                      });
                });
            }

            // Filtre par produit
            if ($request->filled('produit_id')) {
                $query->where('produit_id', $request->produit_id);
            }

            // Filtre par type (lot ou série)
            if ($request->filled('type')) {
                $query->where('type', $request->type);
            }

            // Filtre par statut
            if ($request->filled('statut')) {
                $query->where('statut', $request->statut);
            }

            // Filtre pour les lots non périmés
            if ($request->filled('non_perime')) {
                $query->nonPerime();
            }

            // Filtre pour les lots périmés
            if ($request->filled('perime')) {
                $query->perime();
            }

            // Filtre par date de péremption
            if ($request->filled('date_peremption_debut')) {
                $query->whereDate('date_peremption', '>=', $request->date_peremption_debut);
            }
            if ($request->filled('date_peremption_fin')) {
                $query->whereDate('date_peremption', '<=', $request->date_peremption_fin);
            }

            // Filtre par statut actif
            if ($request->filled('actif')) {
                $query->where('actif', $request->actif);
            }

            // Tri
            if ($request->filled('order_by')) {
                $query->orderBy($request->order_by, $request->order_direction ?? 'asc');
            } else {
                $query->orderBy('created_at', 'desc');
            }

            // Pagination
            $perPage = $request->input('per_page', 15);
            $lots = $query->paginate($perPage);

            return response()->json([
                'success' => true,
                'data' => $lots,
                'message' => 'Liste des lots récupérée avec succès'
            ], 200);

        } catch (Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Erreur lors de la récupération des lots',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Voir un lot spécifique
     */
    public function show($id)
    {
        try {
            $lot = LotTracabilite::with([
                'produit',
                'produit.modele',
                'creePar',
                'modifiePar'
            ])->findOrFail($id);

            return response()->json([
                'success' => true,
                'data' => $lot,
                'message' => 'Lot récupéré avec succès'
            ], 200);

        } catch (ModelNotFoundException $e) {
            return response()->json([
                'success' => false,
                'message' => 'Lot non trouvé'
            ], 404);

        } catch (Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Erreur lors de la récupération du lot',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Créer un nouveau lot
     */
    public function store(Request $request)
    {
        try {
            DB::beginTransaction();

            $validated = $request->validate([
                'nom' => 'required|string|max:255',
                'code' => 'nullable|string|max:100|unique:lot_tracabilite',
                'produit_id' => 'required|exists:variante_produit,id',
                'type' => 'required|in:lot,serie',
                'date_production' => 'nullable|date',
                'date_peremption' => 'nullable|date|after_or_equal:date_production',
                'date_reception' => 'nullable|date',
                'fournisseur' => 'nullable|string|max:255',
                'reference_fournisseur' => 'nullable|string|max:255',
                'quantite_initiale' => 'required|numeric|min:0.01',
                'unite' => 'nullable|string|max:50',
                'statut' => 'nullable|in:actif,epuise,perime,bloque',
                'notes' => 'nullable|string',
                'societe_id' => 'nullable|exists:societe,id',
                'actif' => 'boolean',
            ]);

            // Génération automatique du code si non fourni
            if (empty($validated['code'])) {
                $prefix = $validated['type'] === 'serie' ? 'SER-' : 'LOT-';
                $lastLot = LotTracabilite::where('code', 'LIKE', $prefix . '%')
                                         ->orderBy('id', 'desc')
                                         ->first();
                $nextNumber = $lastLot ? intval(substr($lastLot->code, -6)) + 1 : 1;
                $validated['code'] = $prefix . str_pad($nextNumber, 6, '0', STR_PAD_LEFT);
            }

            // Vérifier que le produit existe
            $produit = VarianteProduit::find($validated['produit_id']);

            $validated['quantite_actuelle'] = $validated['quantite_initiale'];
            $validated['quantite_reservee'] = 0;
            $validated['statut'] = $validated['statut'] ?? 'actif';
            $validated['cree_par_utilisateur_id'] = auth()->id();

            // Pour les numéros de série, la quantité doit être 1
            if ($validated['type'] === 'serie' && $validated['quantite_initiale'] != 1) {
                return response()->json([
                    'success' => false,
                    'message' => 'Pour un numéro de série, la quantité doit être égale à 1'
                ], 422);
            }

            $lot = LotTracabilite::create($validated);

            DB::commit();

            $lot->load(['produit', 'creePar']);

            $this->logActivity('create', 'Lot', $lot->id, "Création lot {$lot->nom} ({$lot->code})");

            return response()->json([
                'success' => true,
                'data' => $lot,
                'message' => 'Lot créé avec succès'
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
                'message' => 'Erreur lors de la création du lot',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Modifier un lot
     */
    public function update(Request $request, $id)
    {
        try {
            DB::beginTransaction();

            $lot = LotTracabilite::findOrFail($id);

            $validated = $request->validate([
                'nom' => 'sometimes|string|max:255',
                'code' => 'nullable|string|max:100|unique:lot_tracabilite,code,'.$id,
                'date_production' => 'nullable|date',
                'date_peremption' => 'nullable|date|after_or_equal:date_production',
                'date_reception' => 'nullable|date',
                'fournisseur' => 'nullable|string|max:255',
                'reference_fournisseur' => 'nullable|string|max:255',
                'statut' => 'nullable|in:actif,epuise,perime,bloque',
                'notes' => 'nullable|string',
                'societe_id' => 'nullable|exists:societe,id',
                'actif' => 'boolean',
            ]);

            // Vérification de cohérence pour les séries
            if ($lot->type === 'serie') {
                unset($validated['quantite_initiale']);
            }

            $validated['modifie_par_utilisateur_id'] = auth()->id();

            $lot->update($validated);

            DB::commit();

            $lot->load(['produit']);

            $this->logActivity('update', 'Lot', $lot->id, "Modification lot {$lot->nom} ({$lot->code})");

            return response()->json([
                'success' => true,
                'data' => $lot,
                'message' => 'Lot modifié avec succès'
            ], 200);

        } catch (ModelNotFoundException $e) {
            DB::rollBack();
            return response()->json([
                'success' => false,
                'message' => 'Lot non trouvé'
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
                'message' => 'Erreur lors de la modification du lot',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Supprimer un lot
     */
    public function destroy($id)
    {
        try {
            DB::beginTransaction();

            $lot = LotTracabilite::findOrFail($id);

            // Vérifier si le lot est utilisé
            if ($lot->quantites()->count() > 0) {
                return response()->json([
                    'success' => false,
                    'message' => 'Ce lot est utilisé dans des quantités de stock. Supprimez-les d\'abord.'
                ], 422);
            }

            if ($lot->operations()->count() > 0) {
                return response()->json([
                    'success' => false,
                    'message' => 'Ce lot est utilisé dans des opérations de stock. Supprimez-les d\'abord.'
                ], 422);
            }

            $lot->delete();

            DB::commit();

            $this->logActivity('delete', 'Lot', $id, "Suppression lot #{$id}");

            return response()->json([
                'success' => true,
                'message' => 'Lot supprimé avec succès'
            ], 200);

        } catch (ModelNotFoundException $e) {
            DB::rollBack();
            return response()->json([
                'success' => false,
                'message' => 'Lot non trouvé'
            ], 404);

        } catch (Exception $e) {
            DB::rollBack();
            return response()->json([
                'success' => false,
                'message' => 'Erreur lors de la suppression du lot',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Vérifier les lots périmés
     */
    public function perimes(Request $request)
    {
        try {
            $query = LotTracabilite::with(['produit', 'produit.modele'])
                                   ->whereNotNull('date_peremption')
                                   ->where('date_peremption', '<', Carbon::now()->toDateString());

            if ($request->filled('produit_id')) {
                $query->where('produit_id', $request->produit_id);
            }

            $perPage = $request->input('per_page', 15);
            $lots = $query->paginate($perPage);

            return response()->json([
                'success' => true,
                'data' => $lots,
                'message' => 'Lots périmés récupérés avec succès'
            ], 200);

        } catch (Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Erreur lors de la récupération des lots périmés',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Vérifier les lots avec péremption proche
     */
    public function peremptionProche(Request $request)
    {
        try {
            $jours = $request->input('jours', 30);

            $query = LotTracabilite::with(['produit', 'produit.modele'])
                                   ->whereNotNull('date_peremption')
                                   ->where('date_peremption', '>=', Carbon::now()->toDateString())
                                   ->where('date_peremption', '<=', Carbon::now()->addDays($jours)->toDateString());

            if ($request->filled('produit_id')) {
                $query->where('produit_id', $request->produit_id);
            }

            $perPage = $request->input('per_page', 15);
            $lots = $query->paginate($perPage);

            return response()->json([
                'success' => true,
                'data' => $lots,
                'message' => "Lots avec péremption dans les {$jours} jours récupérés avec succès"
            ], 200);

        } catch (Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Erreur lors de la récupération des lots',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Réserver une quantité d'un lot
     */
    public function reserver(Request $request, $id)
    {
        try {
            DB::beginTransaction();

            $lot = LotTracabilite::findOrFail($id);

            $validated = $request->validate([
                'quantite' => 'required|numeric|min:0.01'
            ]);

            if ($lot->quantite_actuelle < $validated['quantite']) {
                return response()->json([
                    'success' => false,
                    'message' => 'Quantité insuffisante pour réserver'
                ], 422);
            }

            $lot->reserve($validated['quantite']);

            DB::commit();

            return response()->json([
                'success' => true,
                'data' => $lot,
                'message' => "{$validated['quantite']} unités réservées avec succès"
            ], 200);

        } catch (ModelNotFoundException $e) {
            DB::rollBack();
            return response()->json([
                'success' => false,
                'message' => 'Lot non trouvé'
            ], 404);

        } catch (Exception $e) {
            DB::rollBack();
            return response()->json([
                'success' => false,
                'message' => 'Erreur lors de la réservation',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Libérer une quantité d'un lot
     */
    public function liberer(Request $request, $id)
    {
        try {
            DB::beginTransaction();

            $lot = LotTracabilite::findOrFail($id);

            $validated = $request->validate([
                'quantite' => 'required|numeric|min:0.01'
            ]);

            if ($lot->quantite_reservee < $validated['quantite']) {
                return response()->json([
                    'success' => false,
                    'message' => 'Quantité réservée insuffisante pour libérer'
                ], 422);
            }

            $lot->liberer($validated['quantite']);

            DB::commit();

            return response()->json([
                'success' => true,
                'data' => $lot,
                'message' => "{$validated['quantite']} unités libérées avec succès"
            ], 200);

        } catch (ModelNotFoundException $e) {
            DB::rollBack();
            return response()->json([
                'success' => false,
                'message' => 'Lot non trouvé'
            ], 404);

        } catch (Exception $e) {
            DB::rollBack();
            return response()->json([
                'success' => false,
                'message' => 'Erreur lors de la libération',
                'error' => $e->getMessage()
            ], 500);
        }
    }
}