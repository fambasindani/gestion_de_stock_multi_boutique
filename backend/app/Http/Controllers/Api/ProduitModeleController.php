<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\ProduitModele;
use App\Models\VarianteProduit;
use Illuminate\Http\Request;
use Illuminate\Database\Eloquent\ModelNotFoundException;
use Illuminate\Validation\ValidationException;
use Exception;

class ProduitModeleController extends Controller
{
    /**
     * Recherche d'un produit (variante) par code-barres / code interne
     */
    public function scan($code)
    {
        try {
            $variante = VarianteProduit::with('modele')
                ->where('code_interne', $code)
                ->orWhere('reference_fournisseur', $code)
                ->first();

            if (!$variante) {
                return response()->json([
                    'success' => false,
                    'message' => "Aucun produit pour le code « {$code} »",
                ], 404);
            }

            return response()->json([
                'success' => true,
                'data' => [
                    'id' => $variante->id,
                    'nom' => $variante->nom ?: ($variante->modele->nom ?? 'Produit'),
                    'code_interne' => $variante->code_interne,
                    'prix_vente' => $variante->prix_vente,
                ],
                'message' => 'Produit trouvé',
            ], 200);

        } catch (Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Erreur lors de la recherche du produit',
                'error' => $e->getMessage(),
            ], 500);
        }
    }

    /**
     * Liste des produits avec recherche, filtres et pagination
     */
    public function index(Request $request)
    {
        try {
            $query = ProduitModele::with(['categorie', 'unite', 'variantes']);

            // Recherche par nom ou description
            if ($request->filled('search')) {
                $search = $request->search;
                $query->where(function($q) use ($search) {
                    $q->where('nom', 'LIKE', "%{$search}%")
                      ->orWhere('description', 'LIKE', "%{$search}%");
                });
            }

            // Filtre par catégorie
            if ($request->filled('categorie_id')) {
                $query->where('categorie_id', $request->categorie_id);
            }

            // Filtre par type
            if ($request->filled('type')) {
                $query->where('type', $request->type);
            }

            // Filtre par statut actif
            if ($request->filled('actif')) {
                $query->where('actif', $request->actif);
            }

            // Pagination
            $perPage = $request->input('per_page', 15);
            $produits = $query->paginate($perPage);

            return response()->json([
                'success' => true,
                'data' => $produits,
                'message' => 'Liste des produits récupérée avec succès'
            ], 200);

        } catch (Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Erreur lors de la récupération des produits',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Voir un produit spécifique
     */
    public function show($id)
    {
        try {
            $produit = ProduitModele::with(['categorie', 'unite', 'variantes'])
                                   ->findOrFail($id);

            return response()->json([
                'success' => true,
                'data' => $produit,
                'message' => 'Produit récupéré avec succès'
            ], 200);

        } catch (ModelNotFoundException $e) {
            return response()->json([
                'success' => false,
                'message' => 'Produit non trouvé'
            ], 404);

        } catch (Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Erreur lors de la récupération du produit',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Créer un nouveau produit avec ses variantes
     */
    public function store(Request $request)
    {
        try {
            $validated = $request->validate([
                'nom' => 'required|string|max:255',
                'description' => 'nullable|string',
                'type' => 'required|in:consommable,service,stockable',
                'categorie_id' => 'nullable|exists:categorie_produit,id',
                'unite_id' => 'nullable|exists:unite_mesure,id',
                'actif' => 'boolean',
                'variantes' => 'nullable|array',
                'variantes.*.code_interne' => 'required|string|max:255',
                'variantes.*.nom' => 'nullable|string|max:255',
                'variantes.*.prix_achat' => 'nullable|numeric|min:0',
                'variantes.*.prix_vente' => 'nullable|numeric|min:0',
                'variantes.*.poids' => 'nullable|numeric|min:0',
                'variantes.*.reference_fournisseur' => 'nullable|string|max:255',
                'variantes.*.actif' => 'boolean',
            ]);

            // Création du produit
            $produit = ProduitModele::create([
                'nom' => $validated['nom'],
                'description' => $validated['description'] ?? null,
                'type' => $validated['type'],
                'categorie_id' => $validated['categorie_id'] ?? null,
                'unite_id' => $validated['unite_id'] ?? null,
                'actif' => $validated['actif'] ?? true,
            ]);

            // Création des variantes
            if (!empty($validated['variantes'])) {
                foreach ($validated['variantes'] as $variante) {
                    VarianteProduit::create([
                        'modele_produit_id' => $produit->id,
                        'code_interne' => $variante['code_interne'],
                        'nom' => $variante['nom'] ?? null,
                        'prix_achat' => $variante['prix_achat'] ?? 0,
                        'prix_vente' => $variante['prix_vente'] ?? 0,
                        'poids' => $variante['poids'] ?? null,
                        'reference_fournisseur' => $variante['reference_fournisseur'] ?? null,
                        'actif' => $variante['actif'] ?? true,
                    ]);
                }
            }

            // Recharger avec les relations
            $produit->load(['categorie', 'unite', 'variantes']);

            $this->logActivity('create', 'Produit', $produit->id, "Création du produit {$produit->nom}");

            return response()->json([
                'success' => true,
                'data' => $produit,
                'message' => 'Produit créé avec succès'
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
                'message' => 'Erreur lors de la création du produit',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Modifier un produit et ses variantes
     */
    public function update(Request $request, $id)
    {
        try {
            $produit = ProduitModele::findOrFail($id);

            $validated = $request->validate([
                'nom' => 'sometimes|string|max:255',
                'description' => 'nullable|string',
                'type' => 'sometimes|in:consommable,service,stockable',
                'categorie_id' => 'nullable|exists:categorie_produit,id',
                'unite_id' => 'nullable|exists:unite_mesure,id',
                'actif' => 'boolean',
                'variantes' => 'nullable|array',
                'variantes.*.id' => 'nullable|exists:variante_produit,id',
                'variantes.*.code_interne' => 'required|string|max:255',
                'variantes.*.nom' => 'nullable|string|max:255',
                'variantes.*.prix_achat' => 'nullable|numeric|min:0',
                'variantes.*.prix_vente' => 'nullable|numeric|min:0',
                'variantes.*.poids' => 'nullable|numeric|min:0',
                'variantes.*.reference_fournisseur' => 'nullable|string|max:255',
                'variantes.*.actif' => 'boolean',
            ]);

            // Mise à jour du produit
            if (isset($validated['nom'])) $produit->nom = $validated['nom'];
            if (isset($validated['description'])) $produit->description = $validated['description'];
            if (isset($validated['type'])) $produit->type = $validated['type'];
            if (isset($validated['categorie_id'])) $produit->categorie_id = $validated['categorie_id'];
            if (isset($validated['unite_id'])) $produit->unite_id = $validated['unite_id'];
            if (isset($validated['actif'])) $produit->actif = $validated['actif'];

            $produit->save();

            // Mise à jour des variantes
            if (isset($validated['variantes'])) {
                // Récupérer les IDs des variantes existantes
                $existingIds = $produit->variantes()->pluck('id')->toArray();
                $updatedIds = [];

                foreach ($validated['variantes'] as $varianteData) {
                    if (!empty($varianteData['id'])) {
                        // Mise à jour d'une variante existante
                        $variante = VarianteProduit::where('id', $varianteData['id'])
                                                    ->where('modele_produit_id', $produit->id)
                                                    ->first();
                        if ($variante) {
                            $variante->update([
                                'code_interne' => $varianteData['code_interne'],
                                'nom' => $varianteData['nom'] ?? null,
                                'prix_achat' => $varianteData['prix_achat'] ?? 0,
                                'prix_vente' => $varianteData['prix_vente'] ?? 0,
                                'poids' => $varianteData['poids'] ?? null,
                                'reference_fournisseur' => $varianteData['reference_fournisseur'] ?? null,
                                'actif' => $varianteData['actif'] ?? true,
                            ]);
                            $updatedIds[] = $variante->id;
                        }
                    } else {
                        // Création d'une nouvelle variante
                        $newVariante = VarianteProduit::create([
                            'modele_produit_id' => $produit->id,
                            'code_interne' => $varianteData['code_interne'],
                            'nom' => $varianteData['nom'] ?? null,
                            'prix_achat' => $varianteData['prix_achat'] ?? 0,
                            'prix_vente' => $varianteData['prix_vente'] ?? 0,
                            'poids' => $varianteData['poids'] ?? null,
                            'reference_fournisseur' => $varianteData['reference_fournisseur'] ?? null,
                            'actif' => $varianteData['actif'] ?? true,
                        ]);
                        $updatedIds[] = $newVariante->id;
                    }
                }

                // Supprimer les variantes qui ne sont plus dans la liste
                $toDelete = array_diff($existingIds, $updatedIds);
                if (!empty($toDelete)) {
                    VarianteProduit::whereIn('id', $toDelete)->delete();
                }
            }

            // Recharger avec les relations
            $produit->load(['categorie', 'unite', 'variantes']);

            $this->logActivity('update', 'Produit', $produit->id, "Modification du produit {$produit->nom}");

            return response()->json([
                'success' => true,
                'data' => $produit,
                'message' => 'Produit modifié avec succès'
            ], 200);

        } catch (ModelNotFoundException $e) {
            return response()->json([
                'success' => false,
                'message' => 'Produit non trouvé'
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
                'message' => 'Erreur lors de la modification du produit',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Supprimer un produit
     */
    public function destroy($id)
    {
        try {
            $produit = ProduitModele::findOrFail($id);

            // Vérifier si le produit a des variantes
            if ($produit->variantes()->count() > 0) {
                return response()->json([
                    'success' => false,
                    'message' => 'Ce produit a des variantes. Supprimez-les d\'abord ou désactivez le produit.'
                ], 422);
            }

            $produit->delete();

            $this->logActivity('delete', 'Produit', $id, "Suppression du produit #{$id}");

            return response()->json([
                'success' => true,
                'message' => 'Produit supprimé avec succès'
            ], 200);

        } catch (ModelNotFoundException $e) {
            return response()->json([
                'success' => false,
                'message' => 'Produit non trouvé'
            ], 404);

        } catch (Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Erreur lors de la suppression du produit',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Désactiver un produit
     */
    public function desactiver($id)
    {
        try {
            $produit = ProduitModele::findOrFail($id);
            $produit->actif = false;
            $produit->save();

            return response()->json([
                'success' => true,
                'data' => $produit,
                'message' => 'Produit désactivé avec succès'
            ], 200);

        } catch (ModelNotFoundException $e) {
            return response()->json([
                'success' => false,
                'message' => 'Produit non trouvé'
            ], 404);

        } catch (Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Erreur lors de la désactivation du produit',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Activer un produit
     */
    public function activer($id)
    {
        try {
            $produit = ProduitModele::findOrFail($id);
            $produit->actif = true;
            $produit->save();

            return response()->json([
                'success' => true,
                'data' => $produit,
                'message' => 'Produit activé avec succès'
            ], 200);

        } catch (ModelNotFoundException $e) {
            return response()->json([
                'success' => false,
                'message' => 'Produit non trouvé'
            ], 404);

        } catch (Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Erreur lors de l\'activation du produit',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Supprimer une variante spécifique
     */
    public function supprimerVariante($id)
    {
        try {
            $variante = VarianteProduit::findOrFail($id);
            $variante->delete();

            return response()->json([
                'success' => true,
                'message' => 'Variante supprimée avec succès'
            ], 200);

        } catch (ModelNotFoundException $e) {
            return response()->json([
                'success' => false,
                'message' => 'Variante non trouvée'
            ], 404);

        } catch (Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Erreur lors de la suppression de la variante',
                'error' => $e->getMessage()
            ], 500);
        }
    }
}