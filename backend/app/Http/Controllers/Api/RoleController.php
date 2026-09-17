<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Role;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class RoleController extends Controller
{
    /**
     * Unique permission réellement réservée au compte plateforme :
     * donner gerer_societes à une boutique lui ouvrirait la gestion des autres sociétés.
     * (gerer_roles / gerer_permissions restent possibles : l'édition des permissions
     *  est de toute façon bloquée côté serveur pour les non-plateformes.)
     */
    private function permissionsReservees(): array
    {
        return ['gerer_societes'];
    }

    private function estSuperAdmin(): bool
    {
        return (bool) (auth()->user()->est_super_admin ?? false);
    }

    private function societeId()
    {
        return app()->bound('societe_id') ? app('societe_id') : null;
    }

    /**
     * Un non-plateforme ne voit / ne gère que les rôles de SA société.
     */
    private function scopeVisible($query)
    {
        if ($this->estSuperAdmin()) {
            return $query;
        }

        return $query->where('societe_id', $this->societeId());
    }

    public function index(Request $request)
    {
        $query = $this->scopeVisible(Role::with('permissions')->withCount('utilisateurs'));

        if ($request->filled('search')) {
            $search = $request->search;
            $query->where(function ($q) use ($search) {
                $q->where('nom', 'LIKE', "%{$search}%")
                  ->orWhere('description', 'LIKE', "%{$search}%");
            });
        }

        $perPage = $request->input('per_page', 15);
        $roles = $query->orderBy('nom')->paginate($perPage);

        return response()->json($roles);
    }

    public function show($id)
    {
        $role = $this->scopeVisible(Role::with('permissions'))->findOrFail($id);
        return response()->json($role);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'nom' => 'required|string|max:100',
            'description' => 'nullable|string',
            'actif' => 'boolean',
            'permissions' => 'nullable|array',
            'permissions.*' => 'exists:permissions,id',
        ]);

        $estSuper = $this->estSuperAdmin();
        $societeId = $estSuper ? ($validated['societe_id'] ?? null) : $this->societeId();

        // Unicité du nom par société
        $existe = Role::where('societe_id', $societeId)->where('nom', $validated['nom'])->exists();
        if ($existe) {
            return response()->json([
                'success' => false,
                'message' => 'Un rôle avec ce nom existe déjà.',
                'errors' => ['nom' => ['Un rôle avec ce nom existe déjà.']],
            ], 422);
        }

        $role = Role::create([
            'nom' => $validated['nom'],
            'description' => $validated['description'] ?? null,
            'actif' => $validated['actif'] ?? true,
            'societe_id' => $societeId,
        ]);

        if (!empty($validated['permissions'])) {
            $role->permissions()->sync($this->filtrerPermissions($validated['permissions'], $estSuper));
        }

        return response()->json($role->load('permissions'), 201);
    }

    public function update(Request $request, $id)
    {
        $role = Role::findOrFail($id);

        if (!$this->estSuperAdmin() && (int) $role->societe_id !== (int) $this->societeId()) {
            return response()->json([
                'message' => 'Vous ne pouvez modifier que les rôles de votre boutique.',
            ], 403);
        }

        $validated = $request->validate([
            'nom' => 'sometimes|string|max:100',
            'description' => 'nullable|string',
            'actif' => 'boolean',
            'permissions' => 'nullable|array',
            'permissions.*' => 'exists:permissions,id',
        ]);

        if (isset($validated['nom'])) {
            $doublon = Role::where('societe_id', $role->societe_id)
                ->where('nom', $validated['nom'])
                ->where('id', '!=', $role->id)
                ->exists();
            if ($doublon) {
                return response()->json([
                    'success' => false,
                    'message' => 'Un rôle avec ce nom existe déjà.',
                    'errors' => ['nom' => ['Un rôle avec ce nom existe déjà.']],
                ], 422);
            }
            $role->nom = $validated['nom'];
        }
        if (isset($validated['description'])) $role->description = $validated['description'];
        if (isset($validated['actif'])) $role->actif = $validated['actif'];

        $role->save();

        if (isset($validated['permissions'])) {
            $role->permissions()->sync(
                $this->filtrerPermissions($validated['permissions'], $this->estSuperAdmin())
            );
        }

        return response()->json($role->load('permissions'));
    }

    public function destroy($id)
    {
        $role = Role::findOrFail($id);

        if (!$this->estSuperAdmin() && (int) $role->societe_id !== (int) $this->societeId()) {
            return response()->json([
                'message' => 'Vous ne pouvez supprimer que les rôles de votre boutique.',
            ], 403);
        }

        if (in_array($role->nom, ['responsable_boutique'])) {
            return response()->json(['message' => 'Ce rôle système ne peut pas être supprimé.'], 403);
        }

        $role->delete();
        return response()->json(null, 204);
    }

    /**
     * Retire la permission réservée (gestion des sociétés) pour un non-plateforme.
     */
    private function filtrerPermissions(array $ids, bool $estSuper): array
    {
        if ($estSuper) {
            return $ids;
        }

        $reservees = DB::table('permissions')
            ->whereIn('nom', $this->permissionsReservees())
            ->pluck('id')
            ->all();

        return array_values(array_diff($ids, $reservees));
    }
}
