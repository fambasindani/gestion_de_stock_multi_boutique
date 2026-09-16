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

        // Mettre à jour dernière connexion
        $user->update(['derniere_connexion' => now()]);

        $token = $user->createToken('auth_token')->plainTextToken;

        $this->logActivity('login', 'Utilisateur', $user->id, "Connexion de {$user->email}");

        return response()->json([
            'access_token' => $token,
            'token_type' => 'Bearer',
            'utilisateur' => $user,
            'roles' => $user->roles->pluck('nom'),
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
        return response()->json([
            'utilisateur' => $request->user(),
            'roles' => $request->user()->roles->pluck('nom'),
            'permissions' => $this->getUserPermissions($request->user()),
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