<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Utilisateur;
use App\Models\Role;
use App\Models\CommandeVente;
use App\Models\AuditLog;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Database\Eloquent\ModelNotFoundException;
use Illuminate\Validation\ValidationException;
use Exception;

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
            $utilisateur = Utilisateur::with(['roles.permissions', 'societe'])->findOrFail($id);

            // Permissions distinctes (via les rôles)
            $permissions = [];
            foreach ($utilisateur->roles as $role) {
                foreach ($role->permissions as $perm) {
                    $permissions[] = ['nom' => $perm->nom, 'garde' => $perm->garde ?? null];
                }
            }
            $permissions = collect($permissions)->unique('nom')->values();

            // Statistiques de vente du vendeur
            $ventes = CommandeVente::where('cree_par_utilisateur_id', $utilisateur->id)
                ->whereNotIn('etat', ['brouillon', 'annule'])
                ->selectRaw('COUNT(*) as nombre_ventes, COALESCE(SUM(montant_total_ht),0) as total_ht, COALESCE(SUM(montant_total_ttc),0) as total_ttc')
                ->first();

            // Activité récente (logs)
            $activite = AuditLog::where('user_id', $utilisateur->id)
                ->orderBy('created_at', 'desc')
                ->limit(10)
                ->get(['id', 'action', 'description', 'created_at']);

            return response()->json([
                'success' => true,
                'data' => $utilisateur,
                'permissions' => $permissions,
                'statistiques' => [
                    'nombre_ventes' => (int) ($ventes->nombre_ventes ?? 0),
                    'total_ht' => round((float) ($ventes->total_ht ?? 0), 2),
                    'total_ttc' => round((float) ($ventes->total_ttc ?? 0), 2),
                ],
                'activite_recente' => $activite,
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
            'societe_id' => 'nullable|integer|exists:societes,id',
            'roles' => 'nullable|array',
            'roles.*' => 'exists:roles,id',  // ← 'roles' avec 's'
        ]);

        // Création — un non super-admin ne peut créer que dans SA société
        $estSuperAdmin = (bool) (auth()->user()->est_super_admin ?? false);
        $societeId = $estSuperAdmin
            ? ($validated['societe_id'] ?? null)
            : (app()->bound('societe_id') ? app('societe_id') : null);

        $utilisateur = Utilisateur::create([
            'nom' => $validated['nom'],
            'email' => $validated['email'],
            'mot_de_passe' => $validated['mot_de_passe'],
            'telephone' => $validated['telephone'] ?? null,
            'actif' => $validated['actif'] ?? true,
            'societe_id' => $societeId,
        ]);

        // Assigner les rôles (un non super-admin ne peut attribuer que des rôles "assignables")
        $roleIds = $this->filtrerRolesAssignables($validated['roles'] ?? []);
        if (!empty($roleIds)) {
            $utilisateur->roles()->sync($roleIds);
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
            'societe_id' => 'nullable|integer|exists:societes,id',
            'roles' => 'nullable|array',
            'roles.*' => 'exists:roles,id',  // ← 'roles' avec 's'
        ]);

        // Mise à jour des champs
        if (isset($validated['nom'])) $utilisateur->nom = $validated['nom'];
        if (isset($validated['email'])) $utilisateur->email = $validated['email'];
        if (isset($validated['telephone'])) $utilisateur->telephone = $validated['telephone'];
        if (isset($validated['actif'])) $utilisateur->actif = $validated['actif'];
        // Un non super-admin ne peut pas déplacer un utilisateur vers une autre société
        if ((auth()->user()->est_super_admin ?? false) && isset($validated['societe_id'])) {
            $utilisateur->societe_id = $validated['societe_id'];
        }
        if (!empty($validated['mot_de_passe'])) {
            $utilisateur->mot_de_passe = $validated['mot_de_passe'];
        }

        $utilisateur->save();

        // Synchroniser les rôles si fournis (filtrés pour un non super-admin)
        if (isset($validated['roles'])) {
            $utilisateur->roles()->sync($this->filtrerRolesAssignables($validated['roles']));
        }

        return response()->json([
            'success' => true,
            'data' => $utilisateur->load('roles'),
            'message' => 'Utilisateur mis à jour avec succès'
        ]);
    }

    /**
     * Attribuer des rôles à un utilisateur.
     */
    public function assignerRoles(Request $request, $id)
    {
        try {
            $utilisateur = Utilisateur::findOrFail($id);

            $validated = $request->validate([
                'roles' => 'nullable|array',
                'roles.*' => 'exists:roles,id',
            ]);

            $roleIds = $this->filtrerRolesAssignables($validated['roles'] ?? []);
            $utilisateur->roles()->sync($roleIds);

            return response()->json([
                'success' => true,
                'data' => $utilisateur->load('roles'),
                'message' => 'Rôles assignés avec succès',
            ], 200);

        } catch (ModelNotFoundException $e) {
            return response()->json(['success' => false, 'message' => 'Utilisateur non trouvé'], 404);
        } catch (ValidationException $e) {
            return response()->json([
                'success' => false,
                'message' => 'Erreur de validation',
                'errors' => $e->errors(),
            ], 422);
        } catch (Exception $e) {
            return response()->json([
                'success' => false,
                'message' => "Erreur lors de l'assignation des rôles",
                'error' => $e->getMessage(),
            ], 500);
        }
    }

    /**
     * Filtre les rôles demandés : un non super-admin ne peut attribuer
     * que des rôles sans droits globaux.
     */
    private function filtrerRolesAssignables(array $roleIds): array
    {
        if (auth()->user()->est_super_admin ?? false) {
            return $roleIds;
        }

        $societeId = app()->bound('societe_id') ? app('societe_id') : null;
        $autorises = Role::where('societe_id', $societeId)->pluck('id')->all();

        return array_values(array_intersect($roleIds, $autorises));
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