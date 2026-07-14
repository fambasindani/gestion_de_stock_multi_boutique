<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\LigneOperationStock;
use Illuminate\Http\Request;
use Illuminate\Database\Eloquent\ModelNotFoundException;
use Illuminate\Validation\ValidationException;
use Exception;

class LigneOperationStockController extends Controller
{
    /**
     * Liste des opérations avec recherche, filtres et pagination
     */
    public function index(Request $request)
    {
        try {
            $query = LigneOperationStock::with([
                'mouvement',
                'mouvement.transfert',
                'produit',
                'produit.modele',
                'lot',
                'emplacementSource',
                'emplacementDestination',
                'utilisateur'
            ]);

            // Recherche par code-barres
            if ($request->filled('search')) {
                $search = $request->search;
                $query->where('code_barres', 'LIKE', "%{$search}%")
                      ->orWhere('notes', 'LIKE', "%{$search}%");
            }

            // Filtre par mouvement
            if ($request->filled('mouvement_id')) {
                $query->where('mouvement_id', $request->mouvement_id);
            }

            // Filtre par produit
            if ($request->filled('produit_id')) {
                $query->where('produit_id', $request->produit_id);
            }

            // Filtre par lot
            if ($request->filled('lot_id')) {
                $query->where('lot_id', $request->lot_id);
            }

            // Filtre par type d'opération
            if ($request->filled('type_operation')) {
                $query->where('type_operation', $request->type_operation);
            }

            // Filtre par date
            if ($request->filled('date_debut')) {
                $query->whereDate('date_operation', '>=', $request->date_debut);
            }
            if ($request->filled('date_fin')) {
                $query->whereDate('date_operation', '<=', $request->date_fin);
            }

            // Pagination
            $perPage = $request->input('per_page', 15);
            $operations = $query->orderBy('date_operation', 'desc')->paginate($perPage);

            return response()->json([
                'success' => true,
                'data' => $operations,
                'message' => 'Liste des opérations récupérée avec succès'
            ], 200);

        } catch (Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Erreur lors de la récupération des opérations',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Voir une opération spécifique
     */
    public function show($id)
    {
        try {
            $operation = LigneOperationStock::with([
                'mouvement',
                'mouvement.transfert',
                'produit',
                'produit.modele',
                'lot',
                'emplacementSource',
                'emplacementDestination',
                'utilisateur'
            ])->findOrFail($id);

            return response()->json([
                'success' => true,
                'data' => $operation,
                'message' => 'Opération récupérée avec succès'
            ], 200);

        } catch (ModelNotFoundException $e) {
            return response()->json([
                'success' => false,
                'message' => 'Opération non trouvée'
            ], 404);

        } catch (Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Erreur lors de la récupération de l\'opération',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Créer une nouvelle opération
     */
    public function store(Request $request)
    {
        try {
            $validated = $request->validate([
                'mouvement_id' => 'required|exists:mouvement_stock,id',
                'produit_id' => 'required|exists:variante_produit,id',
                'lot_id' => 'nullable|exists:lot_tracabilite,id',
                'code_barres' => 'nullable|string|max:255',
                'quantite_traitee' => 'required|numeric|min:0.01',
                'emplacement_source_id' => 'required|exists:emplacement_stock,id',
                'emplacement_destination_id' => 'required|exists:emplacement_stock,id',
                'type_operation' => 'required|in:prelevement,reception,scan',
                'notes' => 'nullable|string',
            ]);

            $validated['utilisateur_id'] = auth()->id();
            $validated['date_operation'] = now();

            $operation = LigneOperationStock::create($validated);

            $operation->load([
                'mouvement',
                'mouvement.transfert',
                'produit',
                'produit.modele',
                'lot',
                'emplacementSource',
                'emplacementDestination',
                'utilisateur'
            ]);

            return response()->json([
                'success' => true,
                'data' => $operation,
                'message' => 'Opération créée avec succès'
            ], 201);

        } catch (ValidationException $e) {
            return response()->json([
                'success' => false,
                'message' => 'Erreur de validation',
                'errors' => $e->errors()
            ], 422);

        } catch (Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Erreur lors de la création de l\'opération',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Supprimer une opération
     */
    public function destroy($id)
    {
        try {
            $operation = LigneOperationStock::findOrFail($id);
            $operation->delete();

            return response()->json([
                'success' => true,
                'message' => 'Opération supprimée avec succès'
            ], 200);

        } catch (ModelNotFoundException $e) {
            return response()->json([
                'success' => false,
                'message' => 'Opération non trouvée'
            ], 404);

        } catch (Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Erreur lors de la suppression de l\'opération',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Récupérer les opérations d'un mouvement spécifique
     */
    public function parMouvement($mouvementId)
    {
        try {
            $operations = LigneOperationStock::with([
                'produit',
                'produit.modele',
                'lot',
                'emplacementSource',
                'emplacementDestination',
                'utilisateur'
            ])->where('mouvement_id', $mouvementId)
              ->orderBy('date_operation', 'desc')
              ->get();

            return response()->json([
                'success' => true,
                'data' => $operations,
                'message' => 'Opérations du mouvement récupérées avec succès'
            ], 200);

        } catch (Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Erreur lors de la récupération des opérations',
                'error' => $e->getMessage()
            ], 500);
        }
    }
}