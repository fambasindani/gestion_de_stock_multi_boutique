<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Permission;
use Illuminate\Http\Request;

class PermissionController extends Controller
{
    public function index(Request $request)
    {
        $query = Permission::query();

        if ($request->filled('search')) {
            $search = $request->search;
            $query->where('nom', 'LIKE', "%{$search}%")
                  ->orWhere('description', 'LIKE', "%{$search}%");
        }

        // Filtre par garde
        if ($request->filled('garde')) {
            $query->where('garde', $request->garde);
        }

        $perPage = $request->input('per_page', 50);
        $permissions = $query->paginate($perPage);

        return response()->json($permissions);
    }

    public function show($id)
    {
        $permission = Permission::findOrFail($id);
        return response()->json($permission);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'nom' => 'required|string|max:255|unique:permissions',
            'garde' => 'nullable|string|max:100',
            'description' => 'nullable|string',
        ]);

        $permission = Permission::create($validated);
        return response()->json($permission, 201);
    }

    public function update(Request $request, $id)
    {
        $permission = Permission::findOrFail($id);

        $validated = $request->validate([
            'nom' => 'sometimes|string|max:255|unique:permissions,nom,'.$id,
            'garde' => 'nullable|string|max:100',
            'description' => 'nullable|string',
        ]);

        $permission->update($validated);
        return response()->json($permission);
    }

    public function destroy($id)
    {
        $permission = Permission::findOrFail($id);
        $permission->delete();
        return response()->json(null, 204);
    }
}