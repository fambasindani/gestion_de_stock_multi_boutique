<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Mail\ResetPasswordMail;
use App\Models\Utilisateur;
use Illuminate\Http\Request;
use Illuminate\Support\Carbon;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Mail;
use Illuminate\Support\Str;
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

    /**
     * Demande de réinitialisation : envoie un lien par email.
     */
    public function forgotPassword(Request $request)
    {
        $validated = $request->validate([
            'email' => 'required|email',
        ]);

        $user = Utilisateur::withoutGlobalScopes()->where('email', $validated['email'])->first();

        // Réponse générique (évite de révéler si un compte existe)
        if ($user) {
            $token = Str::random(64);

            DB::table('password_reset_tokens')->updateOrInsert(
                ['email' => $user->email],
                ['token' => hash('sha256', $token), 'created_at' => now()]
            );

            $resetUrl = rtrim((string) config('app.frontend_url'), '/')
                . '/auth/reset-password?token=' . $token
                . '&email=' . urlencode($user->email);

            try {
                Mail::to($user->email)->send(new ResetPasswordMail($user->nom, $resetUrl));
            } catch (\Throwable $e) {
                return response()->json([
                    'success' => false,
                    'message' => "Impossible d'envoyer l'email de réinitialisation. Vérifiez la configuration mail.",
                    'error' => $e->getMessage(),
                ], 500);
            }

            $this->logActivity('forgot_password', 'Utilisateur', $user->id, "Demande de réinitialisation pour {$user->email}", null, null, $user->societe_id);
        }

        return response()->json([
            'success' => true,
            'message' => "Si un compte existe pour cet email, un lien de réinitialisation a été envoyé.",
        ]);
    }

    /**
     * Réinitialisation effective du mot de passe avec le token reçu par email.
     */
    public function resetPassword(Request $request)
    {
        $validated = $request->validate([
            'email' => 'required|email',
            'token' => 'required|string',
            'mot_de_passe' => 'required|string|min:8|confirmed',
        ]);

        $row = DB::table('password_reset_tokens')->where('email', $validated['email'])->first();

        if (!$row || !hash_equals($row->token, hash('sha256', $validated['token']))) {
            return response()->json([
                'success' => false,
                'message' => 'Lien de réinitialisation invalide ou déjà utilisé.',
            ], 422);
        }

        if (Carbon::parse($row->created_at)->addMinutes(60)->isPast()) {
            DB::table('password_reset_tokens')->where('email', $validated['email'])->delete();
            return response()->json([
                'success' => false,
                'message' => 'Lien expiré. Veuillez refaire une demande.',
            ], 422);
        }

        $user = Utilisateur::withoutGlobalScopes()->where('email', $validated['email'])->first();

        if (!$user) {
            return response()->json([
                'success' => false,
                'message' => 'Compte introuvable.',
            ], 404);
        }

        $user->mot_de_passe = $validated['mot_de_passe'];
        $user->save();

        // Sécurité : on invalide les sessions et le token de réinitialisation
        $user->tokens()->delete();
        DB::table('password_reset_tokens')->where('email', $validated['email'])->delete();

        $this->logActivity('reset_password', 'Utilisateur', $user->id, "Réinitialisation du mot de passe de {$user->email}", null, null, $user->societe_id);

        return response()->json([
            'success' => true,
            'message' => 'Mot de passe réinitialisé avec succès. Vous pouvez vous connecter.',
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