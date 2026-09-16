<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Validation\ValidationException;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\Rule;
use Exception;

class ProfilController extends Controller
{
    /**
     * Profil de l'utilisateur connecté
     */
    public function show(Request $request)
    {
        try {
            $user = $request->user();
            $user->load('societe', 'roles');

            $permissions = [];
            foreach ($user->roles as $role) {
                foreach ($role->permissions as $perm) {
                    $permissions[] = $perm->nom;
                }
            }

            return response()->json([
                'success' => true,
                'data' => [
                    'utilisateur' => $user,
                    'societe' => $user->societe,
                    'roles' => $user->roles->pluck('nom'),
                    'permissions' => array_values(array_unique($permissions)),
                ],
                'message' => 'Profil récupéré avec succès',
            ], 200);
        } catch (Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Erreur lors de la récupération du profil',
                'error' => $e->getMessage(),
            ], 500);
        }
    }

    /**
     * Mise à jour de ses propres informations
     */
    public function update(Request $request)
    {
        try {
            $user = $request->user();

            $validated = $request->validate([
                'nom' => 'required|string|max:255',
                'email' => ['required', 'email', 'max:255', Rule::unique('utilisateurs', 'email')->ignore($user->id)],
                'telephone' => 'nullable|string|max:50',
            ]);

            $user->nom = $validated['nom'];
            $user->email = $validated['email'];
            $user->telephone = $validated['telephone'] ?? null;
            $user->save();

            $this->logActivity('update_profil', 'Utilisateur', $user->id, "Mise à jour de son profil");

            return response()->json([
                'success' => true,
                'data' => $user->load('societe'),
                'message' => 'Profil mis à jour avec succès',
            ], 200);

        } catch (ValidationException $e) {
            return response()->json([
                'success' => false,
                'message' => 'Erreur de validation',
                'errors' => $e->errors(),
            ], 422);
        } catch (Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Erreur lors de la mise à jour du profil',
                'error' => $e->getMessage(),
            ], 500);
        }
    }

    /**
     * Changement de mot de passe
     */
    public function updatePassword(Request $request)
    {
        try {
            $user = $request->user();

            $validated = $request->validate([
                'mot_de_passe_actuel' => 'required|string',
                'mot_de_passe' => 'required|string|min:8|confirmed',
            ]);

            if (!Hash::check($validated['mot_de_passe_actuel'], $user->mot_de_passe)) {
                return response()->json([
                    'success' => false,
                    'message' => 'Le mot de passe actuel est incorrect.',
                ], 422);
            }

            $user->mot_de_passe = $validated['mot_de_passe'];
            $user->save();

            $this->logActivity('update_password', 'Utilisateur', $user->id, "Changement de mot de passe");

            return response()->json([
                'success' => true,
                'message' => 'Mot de passe modifié avec succès',
            ], 200);

        } catch (ValidationException $e) {
            return response()->json([
                'success' => false,
                'message' => 'Erreur de validation',
                'errors' => $e->errors(),
            ], 422);
        } catch (Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Erreur lors du changement de mot de passe',
                'error' => $e->getMessage(),
            ], 500);
        }
    }
}
