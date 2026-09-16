<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Utilisateur;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\ValidationException;

class AuthController extends Controller
{
    public function login(Request $request)
    {
        $request->validate([
            'email' => 'required|email',
            'mot_de_passe' => 'required|string',
        ]);

        $user = Utilisateur::where('email', $request->email)->first();

        if (!$user || !Hash::check($request->mot_de_passe, $user->mot_de_passe)) {
            throw ValidationException::withMessages([
                'email' => ['Identifiants incorrects.'],
            ]);
        }

        // Abonnement / société
        if (!$user->est_super_admin && $user->societe_id) {
            $societe = \App\Models\Societe::find($user->societe_id);
            if (!$societe || !$societe->actif) {
                return response()->json([
                    'success' => false,
                    'message' => 'Abonnement inactif : contactez l\'administrateur.',
                ], 403);
            }
        }

        // Mettre à jour dernière connexion
        $user->update(['derniere_connexion' => now()]);

        $token = $user->createToken('auth_token')->plainTextToken;

        $this->logActivity('login', 'Utilisateur', $user->id, "Connexion de {$user->email}", null, null, $user->societe_id);

        $user->load('societe');

        return response()->json([
            'access_token' => $token,
            'token_type' => 'Bearer',
            'utilisateur' => $user,
            'societe' => $user->societe,
            'est_super_admin' => (bool) $user->est_super_admin,
            'roles' => $user->roles->pluck('nom'),
            'permissions' => $this->getUserPermissions($user),
        ]);
    }

    public function logout(Request $request)
    {
        $request->user()->currentAccessToken()->delete();
        $this->logActivity('logout', 'Utilisateur', auth()->id(), "Déconnexion de " . (auth()->user()->email ?? ''));
        return response()->json(['message' => 'Déconnecté']);
    }

    public function me(Request $request)
    {
        $user = $request->user();
        $user->load('societe');

        return response()->json([
            'utilisateur' => $user,
            'societe' => $user->societe,
            'est_super_admin' => (bool) $user->est_super_admin,
            'roles' => $user->roles->pluck('nom'),
            'permissions' => $this->getUserPermissions($user),
        ]);
    }

    private function getUserPermissions($user)
    {
        $perms = [];
        foreach ($user->roles as $role) {
            foreach ($role->permissions as $perm) {
                $perms[] = $perm->nom;
            }
        }
        return array_unique($perms);
    }
}