<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\CategorieProduit;
use Illuminate\Http\Request;

class CategorieProduitController extends Controller
{
    // Liste avec recherche, filtre et pagination
    public function index(Request $request)
    {
        $query = CategorieProduit::with('parent');

        // Recherche
        if ($request->filled('search')) {
            $search = $request->search;
            $query->where('nom', 'LIKE', "%{$search}%")
                  ->orWhere('description', 'LIKE', "%{$search}%");
        }

        // Filtre par catégorie parent
        if ($request->filled('parent_id')) {
            $query->where('parent_id', $request->parent_id);
        }

        // Filtre pour les catégories racines (sans parent)
        if ($request->filled('racine')) {
            $query->whereNull('parent_id');
        }

        // Filtre par statut actif
        if ($request->filled('actif')) {
            $query->where('actif', $request->actif);
        }

        $perPage = $request->input('per_page', 15);
        $categories = $query->paginate($perPage);

        return response()->json($categories);
    }

    // Voir une catégorie spécifique avec ses enfants
    public function show($id)
    {
        $categorie = CategorieProduit::with(['parent', 'enfants'])->findOrFail($id);
        return response()->json($categorie);
    }

    // Créer une catégorie
    public function store(Request $request)
    {
        $validated = $request->validate([
                'nom' => ['required', 'string', 'max:100', $this->uniqueSociete('categorie_produit', 'nom')],
            'description' => 'nullable|string',
            'parent_id' => 'nullable|exists:categorie_produit,id',
            'actif' => 'boolean',
        ]);

        $categorie = CategorieProduit::create([
            'nom' => $validated['nom'],
            'description' => $validated['description'] ?? null,
            'parent_id' => $validated['parent_id'] ?? null,
            'actif' => $validated['actif'] ?? true,
        ]);

        $this->logActivity('create', 'Categorie', $categorie->id, "Création catégorie {$categorie->nom}");

        return response()->json($categorie->load('parent'), 201);
    }

    // Modifier une catégorie
    public function update(Request $request, $id)
    {
        $categorie = CategorieProduit::findOrFail($id);

        $validated = $request->validate([
                'nom' => ['sometimes', 'string', 'max:100', $this->uniqueSociete('categorie_produit', 'nom', $id)],
            'description' => 'nullable|string',
            'parent_id' => 'nullable|exists:categorie_produit,id',
            'actif' => 'boolean',
        ]);

        // Empêcher une catégorie d'être son propre parent
        if (isset($validated['parent_id']) && $validated['parent_id'] == $id) {
            return response()->json([
                'message' => 'Une catégorie ne peut pas être son propre parent.'
            ], 422);
        }

        if (isset($validated['nom'])) $categorie->nom = $validated['nom'];
        if (isset($validated['description'])) $categorie->description = $validated['description'];
        if (isset($validated['parent_id'])) $categorie->parent_id = $validated['parent_id'];
        if (isset($validated['actif'])) $categorie->actif = $validated['actif'];

        $categorie->save();

        $this->logActivity('update', 'Categorie', $categorie->id, "Modification catégorie {$categorie->nom}");

        return response()->json($categorie->load('parent'));
    }

    // Supprimer une catégorie
    public function destroy($id)
    {
        $categorie = CategorieProduit::findOrFail($id);

        // Vérifier si la catégorie a des produits associés
        if ($categorie->produits()->count() > 0) {
            return response()->json([
                'message' => 'Cette catégorie contient des produits. Supprimez-les d\'abord ou réassignez-les.'
            ], 422);
        }

        // Vérifier si la catégorie a des sous-catégories
        if ($categorie->enfants()->count() > 0) {
            return response()->json([
                'message' => 'Cette catégorie contient des sous-catégories. Supprimez-les d\'abord.'
            ], 422);
        }

        $this->logActivity('delete', 'Categorie', $id, "Suppression catégorie {$categorie->nom}");

        $categorie->delete();
        return response()->json(['message' => 'Catégorie supprimée avec succès.'], 204);
    }

    // Récupérer l'arborescence complète des catégories
    public function arborescence()
    {
        $categories = CategorieProduit::whereNull('parent_id')
                                      ->with('enfants')
                                      ->get();
        return response()->json($categories);
    }
}