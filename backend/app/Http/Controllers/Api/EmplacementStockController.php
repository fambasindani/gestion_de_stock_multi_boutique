<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\EmplacementStock;
use Illuminate\Http\Request;
use Illuminate\Database\Eloquent\ModelNotFoundException;
use Illuminate\Validation\ValidationException;
use Exception;
use DB;

class EmplacementStockController extends Controller
{
    /**
     * Liste des emplacements avec recherche, filtres et pagination
     */
    public function index(Request $request)
    {
        try {
            $query = EmplacementStock::with(['parent', 'enfants']);

            // Recherche
            if ($request->filled('search')) {
                $search = $request->search;
                $query->where(function($q) use ($search) {
                    $q->where('nom', 'LIKE', "%{$search}%")
                      ->orWhere('code', 'LIKE', "%{$search}%")
                      ->orWhere('description', 'LIKE', "%{$search}%");
                });
            }

            // Filtre par parent (pour afficher les sous-emplacements d'un emplacement)
            if ($request->filled('parent_id')) {
                $query->where('emplacement_parent_id', $request->parent_id);
            }

            // Filtre pour les emplacements racines (sans parent)
            if ($request->filled('racine')) {
                $query->whereNull('emplacement_parent_id');
            }

            // Filtre par usage
            if ($request->filled('usage')) {
                $query->where('usage', $request->usage);
            }

            // Filtre par type
            if ($request->filled('type')) {
                $query->where('type', $request->type);
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
            $emplacements = $query->paginate($perPage);

            return response()->json([
                'success' => true,
                'data' => $emplacements,
                'message' => 'Liste des emplacements récupérée avec succès'
            ], 200);

        } catch (Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Erreur lors de la récupération des emplacements',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Récupérer l'arborescence complète des emplacements
     */
    public function arborescence(Request $request)
    {
        try {
            $query = EmplacementStock::with(['enfants' => function($q) {
                $q->with('enfants');
            }])->whereNull('emplacement_parent_id');

            if ($request->filled('actif')) {
                $query->where('actif', $request->actif);
            }

            $emplacements = $query->get();

            return response()->json([
                'success' => true,
                'data' => $emplacements,
                'message' => 'Arborescence récupérée avec succès'
            ], 200);

        } catch (Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Erreur lors de la récupération de l\'arborescence',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Voir un emplacement spécifique
     */
    public function show($id)
    {
        try {
            $emplacement = EmplacementStock::with(['parent', 'enfants'])
                                           ->findOrFail($id);

            return response()->json([
                'success' => true,
                'data' => $emplacement,
                'message' => 'Emplacement récupéré avec succès'
            ], 200);

        } catch (ModelNotFoundException $e) {
            return response()->json([
                'success' => false,
                'message' => 'Emplacement non trouvé'
            ], 404);

        } catch (Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Erreur lors de la récupération de l\'emplacement',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Créer un nouvel emplacement
     */
    public function store(Request $request)
    {
        try {
            DB::beginTransaction();

            $validated = $request->validate([
                'nom' => 'required|string|max:255',
                'code' => ['nullable', 'string', 'max:50', $this->uniqueSociete('emplacement_stock', 'code')],
                'description' => 'nullable|string',
                'emplacement_parent_id' => 'nullable|exists:emplacement_stock,id',
                'usage' => 'required|in:fournisseur,client,interne,inventaire,approvisionnement,production,transit,vue',
                'type' => 'nullable|in:normal,reserve,qualite,quarantine',
                'est_entrepot' => 'boolean',
                'est_zone' => 'boolean',
                'est_rayon' => 'boolean',
                'est_casier' => 'boolean',
                'code_barres' => 'nullable|string|max:255',
                'capacite_maximale' => 'nullable|numeric|min:0',
                'unite_capacite' => 'nullable|string|max:50',
                'societe_id' => 'nullable|exists:societe,id',
                'actif' => 'boolean',
            ]);

            // Génération automatique du code si non fourni
            if (empty($validated['code'])) {
                $prefix = 'EMP-';
                $lastEmplacement = EmplacementStock::where('code', 'LIKE', $prefix . '%')
                                                   ->orderBy('id', 'desc')
                                                   ->first();
                $nextNumber = $lastEmplacement ? intval(substr($lastEmplacement->code, -5)) + 1 : 1;
                $validated['code'] = $prefix . str_pad($nextNumber, 5, '0', STR_PAD_LEFT);
            }

            // Vérifier qu'on ne crée pas une boucle infinie
            if ($validated['emplacement_parent_id'] ?? false) {
                $parent = EmplacementStock::find($validated['emplacement_parent_id']);
                if ($parent && $this->estDescendant($parent->id, $validated['emplacement_parent_id'])) {
                    return response()->json([
                        'success' => false,
                        'message' => 'Impossible de créer une boucle dans la hiérarchie'
                    ], 422);
                }
            }

            $emplacement = EmplacementStock::create($validated);

            DB::commit();

            $emplacement->load(['parent']);

            return response()->json([
                'success' => true,
                'data' => $emplacement,
                'message' => 'Emplacement créé avec succès'
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
                'message' => 'Erreur lors de la création de l\'emplacement',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Modifier un emplacement
     */
    public function update(Request $request, $id)
    {
        try {
            DB::beginTransaction();

            $emplacement = EmplacementStock::findOrFail($id);

            $validated = $request->validate([
                'nom' => 'sometimes|string|max:255',
                'code' => ['nullable', 'string', 'max:50', $this->uniqueSociete('emplacement_stock', 'code', $id)],
                'description' => 'nullable|string',
                'emplacement_parent_id' => 'nullable|exists:emplacement_stock,id',
                'usage' => 'sometimes|in:fournisseur,client,interne,inventaire,approvisionnement,production,transit,vue',
                'type' => 'nullable|in:normal,reserve,qualite,quarantine',
                'est_entrepot' => 'boolean',
                'est_zone' => 'boolean',
                'est_rayon' => 'boolean',
                'est_casier' => 'boolean',
                'code_barres' => 'nullable|string|max:255',
                'capacite_maximale' => 'nullable|numeric|min:0',
                'unite_capacite' => 'nullable|string|max:50',
                'societe_id' => 'nullable|exists:societe,id',
                'actif' => 'boolean',
            ]);

            // Vérifier qu'on ne crée pas une boucle infinie
            if (isset($validated['emplacement_parent_id'])) {
                if ($validated['emplacement_parent_id'] == $id) {
                    return response()->json([
                        'success' => false,
                        'message' => 'Un emplacement ne peut pas être son propre parent'
                    ], 422);
                }

                $parent = EmplacementStock::find($validated['emplacement_parent_id']);
                if ($parent && $this->estDescendant($parent->id, $id)) {
                    return response()->json([
                        'success' => false,
                        'message' => 'Impossible de créer une boucle dans la hiérarchie'
                    ], 422);
                }
            }

            $emplacement->update($validated);

            DB::commit();

            $emplacement->load(['parent']);

            return response()->json([
                'success' => true,
                'data' => $emplacement,
                'message' => 'Emplacement modifié avec succès'
            ], 200);

        } catch (ModelNotFoundException $e) {
            DB::rollBack();
            return response()->json([
                'success' => false,
                'message' => 'Emplacement non trouvé'
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
                'message' => 'Erreur lors de la modification de l\'emplacement',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Supprimer un emplacement
     */
    public function destroy($id)
    {
        try {
            DB::beginTransaction();

            $emplacement = EmplacementStock::findOrFail($id);

            // Vérifier si l'emplacement a des sous-emplacements
            if ($emplacement->enfants()->count() > 0) {
                return response()->json([
                    'success' => false,
                    'message' => 'Cet emplacement contient des sous-emplacements. Supprimez-les d\'abord.'
                ], 422);
            }

            // Vérifier si l'emplacement a du stock
            if ($emplacement->quantites()->where('quantite_disponible', '>', 0)->count() > 0) {
                return response()->json([
                    'success' => false,
                    'message' => 'Cet emplacement contient du stock. Déplacez-le d\'abord.'
                ], 422);
            }

            $emplacement->delete();

            DB::commit();

            return response()->json([
                'success' => true,
                'message' => 'Emplacement supprimé avec succès'
            ], 200);

        } catch (ModelNotFoundException $e) {
            DB::rollBack();
            return response()->json([
                'success' => false,
                'message' => 'Emplacement non trouvé'
            ], 404);

        } catch (Exception $e) {
            DB::rollBack();
            return response()->json([
                'success' => false,
                'message' => 'Erreur lors de la suppression de l\'emplacement',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Activer un emplacement
     */
    public function activer($id)
    {
        try {
            $emplacement = EmplacementStock::findOrFail($id);
            $emplacement->actif = true;
            $emplacement->save();

            return response()->json([
                'success' => true,
                'data' => $emplacement,
                'message' => 'Emplacement activé avec succès'
            ], 200);

        } catch (ModelNotFoundException $e) {
            return response()->json([
                'success' => false,
                'message' => 'Emplacement non trouvé'
            ], 404);

        } catch (Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Erreur lors de l\'activation de l\'emplacement',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Désactiver un emplacement
     */
    public function desactiver($id)
    {
        try {
            $emplacement = EmplacementStock::findOrFail($id);
            $emplacement->actif = false;
            $emplacement->save();

            return response()->json([
                'success' => true,
                'data' => $emplacement,
                'message' => 'Emplacement désactivé avec succès'
            ], 200);

        } catch (ModelNotFoundException $e) {
            return response()->json([
                'success' => false,
                'message' => 'Emplacement non trouvé'
            ], 404);

        } catch (Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Erreur lors de la désactivation de l\'emplacement',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Vérifier si un emplacement est descendant d'un autre
     */
    private function estDescendant($parentId, $childId)
    {
        $enfant = EmplacementStock::find($childId);
        while ($enfant && $enfant->emplacement_parent_id) {
            if ($enfant->emplacement_parent_id == $parentId) {
                return true;
            }
            $enfant = EmplacementStock::find($enfant->emplacement_parent_id);
        }
        return false;
    }

    /**
     * Récupérer le chemin complet d'un emplacement
     */
    public function chemin($id)
    {
        try {
            $emplacement = EmplacementStock::findOrFail($id);
            
            $chemins = [$emplacement->nom];
            $parent = $emplacement->parent;
            while ($parent) {
                array_unshift($chemins, $parent->nom);
                $parent = $parent->parent;
            }

            return response()->json([
                'success' => true,
                'data' => [
                    'emplacement' => $emplacement,
                    'chemin' => $chemins,
                    'chemin_complet' => implode(' / ', $chemins)
                ],
                'message' => 'Chemin récupéré avec succès'
            ], 200);

        } catch (ModelNotFoundException $e) {
            return response()->json([
                'success' => false,
                'message' => 'Emplacement non trouvé'
            ], 404);

        } catch (Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Erreur lors de la récupération du chemin',
                'error' => $e->getMessage()
            ], 500);
        }
    }
}