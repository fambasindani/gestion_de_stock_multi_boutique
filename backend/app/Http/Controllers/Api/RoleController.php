<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Role;
use Illuminate\Http\Request;

class RoleController extends Controller
{
    public function index(Request $request)
    {
        $query = Role::with('permissions');

        // Recherche
        if ($request->filled('search')) {
            $search = $request->search;
            $query->where('nom', 'LIKE', "%{$search}%")
                  ->orWhere('description', 'LIKE', "%{$search}%");
        }

        $perPage = $request->input('per_page', 15);
        $roles = $query->paginate($perPage);

        return response()->json($roles);
    }

    public function show($id)
    {
        $role = Role::with('permissions')->findOrFail($id);
        return response()->json($role);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'nom' => 'required|string|max:100|unique:roles',
            'description' => 'nullable|string',
            'actif' => 'boolean',
            'permissions' => 'nullable|array',
            'permissions.*' => 'exists:permissions,id',
        ]);

        $role = Role::create([
            'nom' => $validated['nom'],
            'description' => $validated['description'] ?? null,
            'actif' => $validated['actif'] ?? true,
        ]);

        if (!empty($validated['permissions'])) {
            $role->permissions()->sync($validated['permissions']);
        }

        return response()->json($role->load('permissions'), 201);
    }

    public function update(Request $request, $id)
    {
        $role = Role::findOrFail($id);

        $validated = $request->validate([
            'nom' => 'sometimes|string|max:100|unique:roles,nom,'.$id,
            'description' => 'nullable|string',
            'actif' => 'boolean',
            'permissions' => 'nullable|array',
            'permissions.*' => 'exists:permissions,id',
        ]);

        if (isset($validated['nom'])) $role->nom = $validated['nom'];
        if (isset($validated['description'])) $role->description = $validated['description'];
        if (isset($validated['actif'])) $role->actif = $validated['actif'];

        $role->save();

        if (isset($validated['permissions'])) {
            $role->permissions()->sync($validated['permissions']);
        }

        return response()->json($role->load('permissions'));
    }

    public function destroy($id)
    {
        $role = Role::findOrFail($id);
        // On peut empêcher la suppression de certains rôles système (ex: admin)
        if (in_array($role->nom, ['administrateur'])) {
            return response()->json(['message' => 'Ce rôle système ne peut pas être supprimé.'], 403);
        }
        $role->delete();
        return response()->json(null, 204);
    }
}