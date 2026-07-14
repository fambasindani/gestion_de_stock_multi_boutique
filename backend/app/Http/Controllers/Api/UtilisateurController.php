<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Utilisateur;
use App\Models\Role;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;

class UtilisateurController extends Controller
{
    // Liste avec recherche et pagination
    public function index(Request $request)
    {
        $query = Utilisateur::with('roles');

        // Recherche
        if ($request->filled('search')) {
            $search = $request->search;
            $query->where(function($q) use ($search) {
                $q->where('nom', 'LIKE', "%{$search}%")
                  ->orWhere('email', 'LIKE', "%{$search}%")
                  ->orWhere('telephone', 'LIKE', "%{$search}%");
            });
        }

        // Filtrage par rôle
        if ($request->filled('role_id')) {
            $roleId = $request->role_id;
            $query->whereHas('roles', function($q) use ($roleId) {
                $q->where('role_id', $roleId);
            });
        }

        // Pagination (par défaut 15)
        $perPage = $request->input('per_page', 15);
        $utilisateurs = $query->paginate($perPage);

        return response()->json($utilisateurs);
    }

    public function show($id)
    {
        try {
            $utilisateur = Utilisateur::with('roles')->findOrFail($id);
            return response()->json([
                'success' => true,
                'data' => $utilisateur,
                'message' => 'Utilisateur récupéré avec succès'
            ]);
        } catch (\Illuminate\Database\Eloquent\ModelNotFoundException $e) {
            return response()->json([
                'success' => false,
                'message' => 'Utilisateur non trouvé'
            ], 404);
        }
    }

    public function store(Request $request)
    {
        // ✅ CORRECTIONS ICI
        $validated = $request->validate([
            'nom' => 'required|string|max:255',
            'email' => 'required|email|unique:utilisateurs',  // ← 'utilisateurs' avec 's'
            'mot_de_passe' => 'required|string|min:8',
            'telephone' => 'nullable|string|max:50',
            'actif' => 'boolean',
            'societe_id' => 'nullable|integer|exists:societe,id',
            'roles' => 'nullable|array',
            'roles.*' => 'exists:roles,id',  // ← 'roles' avec 's'
        ]);

        // Création
        $utilisateur = Utilisateur::create([
            'nom' => $validated['nom'],
            'email' => $validated['email'],
            'mot_de_passe' => $validated['mot_de_passe'],
            'telephone' => $validated['telephone'] ?? null,
            'actif' => $validated['actif'] ?? true,
            'societe_id' => $validated['societe_id'] ?? null,
        ]);

        // Assigner les rôles
        if (!empty($validated['roles'])) {
            $utilisateur->roles()->sync($validated['roles']);
        }

        return response()->json([
            'success' => true,
            'data' => $utilisateur->load('roles'),
            'message' => 'Utilisateur créé avec succès'
        ], 201);
    }

    public function update(Request $request, $id)
    {
        $utilisateur = Utilisateur::findOrFail($id);

        // ✅ CORRECTIONS ICI AUSSI
        $validated = $request->validate([
            'nom' => 'sometimes|string|max:255',
            'email' => 'sometimes|email|unique:utilisateurs,email,'.$id,  // ← 'utilisateurs' avec 's'
            'mot_de_passe' => 'nullable|string|min:8',
            'telephone' => 'nullable|string|max:50',
            'actif' => 'boolean',
            'societe_id' => 'nullable|integer|exists:societe,id',
            'roles' => 'nullable|array',
            'roles.*' => 'exists:roles,id',  // ← 'roles' avec 's'
        ]);

        // Mise à jour des champs
        if (isset($validated['nom'])) $utilisateur->nom = $validated['nom'];
        if (isset($validated['email'])) $utilisateur->email = $validated['email'];
        if (isset($validated['telephone'])) $utilisateur->telephone = $validated['telephone'];
        if (isset($validated['actif'])) $utilisateur->actif = $validated['actif'];
        if (isset($validated['societe_id'])) $utilisateur->societe_id = $validated['societe_id'];
        if (!empty($validated['mot_de_passe'])) {
            $utilisateur->mot_de_passe = $validated['mot_de_passe'];
        }

        $utilisateur->save();

        // Synchroniser les rôles si fournis
        if (isset($validated['roles'])) {
            $utilisateur->roles()->sync($validated['roles']);
        }

        return response()->json([
            'success' => true,
            'data' => $utilisateur->load('roles'),
            'message' => 'Utilisateur mis à jour avec succès'
        ]);
    }

    public function destroy($id)
    {
        $utilisateur = Utilisateur::findOrFail($id);
        // Empêcher la suppression de son propre compte
        if ($utilisateur->id === auth()->id()) {
            return response()->json(['message' => 'Vous ne pouvez pas supprimer votre propre compte.'], 403);
        }
        $utilisateur->delete();
        return response()->json(['message' => 'Utilisateur supprimé.'], 204);
    }
}