<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\UniteMesure;
use Illuminate\Http\Request;
use Illuminate\Database\Eloquent\ModelNotFoundException;
use Illuminate\Validation\ValidationException;
use Exception;

class UniteMesureController extends Controller
{
    /**
     * Liste des unités de mesure avec recherche, filtres et pagination
     */
    public function index(Request $request)
    {
        try {
            $query = UniteMesure::query();

            // Recherche par nom, symbole ou description
            if ($request->filled('search')) {
                $search = $request->search;
                $query->where(function($q) use ($search) {
                    $q->where('nom', 'LIKE', "%{$search}%")
                      ->orWhere('symbole', 'LIKE', "%{$search}%")
                      ->orWhere('description', 'LIKE', "%{$search}%");
                });
            }

            // Filtre par statut actif
            if ($request->filled('actif')) {
                $query->where('actif', $request->actif);
            }

            // Tri
            if ($request->filled('order_by')) {
                $query->orderBy($request->order_by, $request->order_direction ?? 'asc');
            } else {
                $query->orderBy('nom', 'asc');
            }

            // Pagination
            $perPage = $request->input('per_page', 15);
            $unites = $query->paginate($perPage);

            return response()->json([
                'success' => true,
                'data' => $unites,
                'message' => 'Liste des unités de mesure récupérée avec succès'
            ], 200);

        } catch (Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Erreur lors de la récupération des unités de mesure',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Voir une unité de mesure spécifique
     */
    public function show($id)
    {
        try {
            $unite = UniteMesure::findOrFail($id);

            return response()->json([
                'success' => true,
                'data' => $unite,
                'message' => 'Unité de mesure récupérée avec succès'
            ], 200);

        } catch (ModelNotFoundException $e) {
            return response()->json([
                'success' => false,
                'message' => 'Unité de mesure non trouvée'
            ], 404);

        } catch (Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Erreur lors de la récupération de l\'unité de mesure',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Créer une nouvelle unité de mesure
     */
    public function store(Request $request)
    {
        try {
            $validated = $request->validate([
                'nom' => ['required', 'string', 'max:100', $this->uniqueSociete('unite_mesure', 'nom')],
                'symbole' => ['required', 'string', 'max:10', $this->uniqueSociete('unite_mesure', 'symbole')],
                'description' => 'nullable|string',
                'actif' => 'boolean',
            ]);

            $unite = UniteMesure::create([
                'nom' => $validated['nom'],
                'symbole' => $validated['symbole'],
                'description' => $validated['description'] ?? null,
                'actif' => $validated['actif'] ?? true,
            ]);

            return response()->json([
                'success' => true,
                'data' => $unite,
                'message' => 'Unité de mesure créée avec succès'
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
                'message' => 'Erreur lors de la création de l\'unité de mesure',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Modifier une unité de mesure
     */
    public function update(Request $request, $id)
    {
        try {
            $unite = UniteMesure::findOrFail($id);

            $validated = $request->validate([
                'nom' => ['sometimes', 'string', 'max:100', $this->uniqueSociete('unite_mesure', 'nom', $id)],
                'symbole' => ['sometimes', 'string', 'max:10', $this->uniqueSociete('unite_mesure', 'symbole', $id)],
                'description' => 'nullable|string',
                'actif' => 'boolean',
            ]);

            // Mise à jour
            if (isset($validated['nom'])) $unite->nom = $validated['nom'];
            if (isset($validated['symbole'])) $unite->symbole = $validated['symbole'];
            if (isset($validated['description'])) $unite->description = $validated['description'];
            if (isset($validated['actif'])) $unite->actif = $validated['actif'];

            $unite->save();

            return response()->json([
                'success' => true,
                'data' => $unite,
                'message' => 'Unité de mesure modifiée avec succès'
            ], 200);

        } catch (ModelNotFoundException $e) {
            return response()->json([
                'success' => false,
                'message' => 'Unité de mesure non trouvée'
            ], 404);

        } catch (ValidationException $e) {
            return response()->json([
                'success' => false,
                'message' => 'Erreur de validation',
                'errors' => $e->errors()
            ], 422);

        } catch (Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Erreur lors de la modification de l\'unité de mesure',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Supprimer une unité de mesure
     */
    public function destroy($id)
    {
        try {
            $unite = UniteMesure::findOrFail($id);

            // Vérifier si l'unité est utilisée par des produits
            if ($unite->produits()->count() > 0) {
                return response()->json([
                    'success' => false,
                    'message' => 'Cette unité de mesure est utilisée par des produits. Supprimez-les d\'abord.'
                ], 422);
            }

            $unite->delete();

            return response()->json([
                'success' => true,
                'message' => 'Unité de mesure supprimée avec succès'
            ], 200);

        } catch (ModelNotFoundException $e) {
            return response()->json([
                'success' => false,
                'message' => 'Unité de mesure non trouvée'
            ], 404);

        } catch (Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Erreur lors de la suppression de l\'unité de mesure',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Activer une unité de mesure
     */
    public function activer($id)
    {
        try {
            $unite = UniteMesure::findOrFail($id);
            $unite->actif = true;
            $unite->save();

            return response()->json([
                'success' => true,
                'data' => $unite,
                'message' => 'Unité de mesure activée avec succès'
            ], 200);

        } catch (ModelNotFoundException $e) {
            return response()->json([
                'success' => false,
                'message' => 'Unité de mesure non trouvée'
            ], 404);

        } catch (Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Erreur lors de l\'activation de l\'unité de mesure',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Désactiver une unité de mesure
     */
    public function desactiver($id)
    {
        try {
            $unite = UniteMesure::findOrFail($id);
            $unite->actif = false;
            $unite->save();

            return response()->json([
                'success' => true,
                'data' => $unite,
                'message' => 'Unité de mesure désactivée avec succès'
            ], 200);

        } catch (ModelNotFoundException $e) {
            return response()->json([
                'success' => false,
                'message' => 'Unité de mesure non trouvée'
            ], 404);

        } catch (Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Erreur lors de la désactivation de l\'unité de mesure',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Récupérer toutes les unités actives (pour les formulaires)
     */
    public function actives()
    {
        try {
            $unites = UniteMesure::where('actif', true)
                                ->orderBy('nom')
                                ->get(['id', 'nom', 'symbole']);

            return response()->json([
                'success' => true,
                'data' => $unites,
                'message' => 'Unités de mesure actives récupérées avec succès'
            ], 200);

        } catch (Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Erreur lors de la récupération des unités de mesure actives',
                'error' => $e->getMessage()
            ], 500);
        }
    }
}