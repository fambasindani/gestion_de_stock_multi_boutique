<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Societe;
use App\Models\Utilisateur;
use App\Models\Parametre;
use Illuminate\Http\Request;
use Illuminate\Database\Eloquent\ModelNotFoundException;
use Illuminate\Validation\ValidationException;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;
use Exception;

class SocieteController extends Controller
{
    public function index(Request $request)
    {
        try {
            $query = Societe::withCount('utilisateurs');

            if ($request->filled('search')) {
                $query->where(function ($q) use ($request) {
                    $q->where('nom', 'LIKE', '%' . $request->search . '%')
                      ->orWhere('code', 'LIKE', '%' . $request->search . '%');
                });
            }
            if ($request->filled('actif')) {
                $query->where('actif', $request->boolean('actif'));
            }

            $perPage = $request->input('per_page', 15);
            $societes = $query->orderBy('created_at', 'desc')->paginate($perPage);

            return response()->json([
                'success' => true,
                'data' => $societes,
                'message' => 'Liste des sociétés récupérée avec succès',
            ], 200);

        } catch (Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Erreur lors de la récupération des sociétés',
                'error' => $e->getMessage(),
            ], 500);
        }
    }

    public function store(Request $request)
    {
        try {
            DB::beginTransaction();

            $validated = $request->validate([
                'nom' => 'required|string|max:255',
                'code' => 'nullable|string|max:50|unique:societes,code',
                'logo' => 'nullable|string',
                'email' => 'nullable|email|max:255',
                'telephone' => 'nullable|string|max:50',
                'adresse' => 'nullable|string|max:255',
                'date_abonnement' => 'nullable|date',
                'date_expiration' => 'nullable|date',
                'notes' => 'nullable|string',
                'admin_nom' => 'nullable|string|max:255',
                'admin_email' => 'nullable|email|unique:utilisateurs,email',
                'admin_mot_de_passe' => 'nullable|string|min:6',
            ]);

            $societe = Societe::create([
                'nom' => $validated['nom'],
                'code' => $validated['code'] ?? $this->generateCode($validated['nom']),
                'logo' => $validated['logo'] ?? null,
                'email' => $validated['email'] ?? null,
                'telephone' => $validated['telephone'] ?? null,
                'adresse' => $validated['adresse'] ?? null,
                'date_abonnement' => $validated['date_abonnement'] ?? now()->toDateString(),
                'date_expiration' => $validated['date_expiration'] ?? null,
                'notes' => $validated['notes'] ?? null,
                'actif' => true,
            ]);

            // Paramètres par défaut de la boutique (TVA, ticket...)
            foreach ([
                'tva_taux' => '16',
                'devise' => 'CDF',
                'entreprise_nom' => $societe->nom,
                'entreprise_adresse' => '',
                'entreprise_telephone' => '',
                'ticket_message' => 'Merci de votre visite !',
            ] as $cle => $valeur) {
                Parametre::create([
                    'societe_id' => $societe->id,
                    'cle' => $cle,
                    'valeur' => $valeur,
                ]);
            }

            // Rôles propres à la boutique (copies des modèles globaux)
            \App\Models\Role::seedPourSociete($societe->id);

            if (!empty($validated['admin_email']) && !empty($validated['admin_mot_de_passe'])) {
                $admin = Utilisateur::create([
                    'nom' => $validated['admin_nom'] ?? $validated['nom'],
                    'email' => $validated['admin_email'],
                    'mot_de_passe' => $validated['admin_mot_de_passe'],
                    'societe_id' => $societe->id,
                    'actif' => 1,
                ]);

                // Le propriétaire de la boutique reçoit le rôle complet (menu entier),
                // cloisonné à sa société.
                $roleProprietaire = \App\Models\Role::where('societe_id', $societe->id)
                    ->where('nom', 'responsable_boutique')
                    ->first();
                if ($roleProprietaire) {
                    $admin->roles()->sync([$roleProprietaire->id]);
                }
            }

            DB::commit();

            $societe->loadCount('utilisateurs');

            return response()->json([
                'success' => true,
                'data' => $societe,
                'message' => 'Société créée avec succès',
            ], 201);

        } catch (ValidationException $e) {
            DB::rollBack();
            return response()->json([
                'success' => false,
                'message' => 'Erreur de validation',
                'errors' => $e->errors(),
            ], 422);
        } catch (Exception $e) {
            DB::rollBack();
            return response()->json([
                'success' => false,
                'message' => 'Erreur lors de la création de la société',
                'error' => $e->getMessage(),
            ], 500);
        }
    }

    public function show($id)
    {
        try {
            $societe = Societe::withCount('utilisateurs')->findOrFail($id);

            return response()->json([
                'success' => true,
                'data' => $societe,
                'message' => 'Société récupérée avec succès',
            ], 200);

        } catch (ModelNotFoundException $e) {
            return response()->json(['success' => false, 'message' => 'Société non trouvée'], 404);
        } catch (Exception $e) {
            return response()->json(['success' => false, 'message' => 'Erreur', 'error' => $e->getMessage()], 500);
        }
    }

    public function update(Request $request, $id)
    {
        try {
            $societe = Societe::findOrFail($id);

            $validated = $request->validate([
                'nom' => 'sometimes|required|string|max:255',
                'code' => 'nullable|string|max:50|unique:societes,code,' . $id,
                'logo' => 'nullable|string',
                'email' => 'nullable|email|max:255',
                'telephone' => 'nullable|string|max:50',
                'adresse' => 'nullable|string|max:255',
                'date_abonnement' => 'nullable|date',
                'date_expiration' => 'nullable|date',
                'notes' => 'nullable|string',
            ]);

            $societe->update($validated);

            return response()->json([
                'success' => true,
                'data' => $societe,
                'message' => 'Société mise à jour avec succès',
            ], 200);

        } catch (ModelNotFoundException $e) {
            return response()->json(['success' => false, 'message' => 'Société non trouvée'], 404);
        } catch (ValidationException $e) {
            return response()->json(['success' => false, 'message' => 'Erreur de validation', 'errors' => $e->errors()], 422);
        } catch (Exception $e) {
            return response()->json(['success' => false, 'message' => 'Erreur lors de la mise à jour', 'error' => $e->getMessage()], 500);
        }
    }

    /**
     * Upload du logo de la société (affiché dans l'app et sur les documents)
     */
    public function uploadLogo(Request $request, $id)
    {
        try {
            $request->validate([
                'logo' => 'required|image|mimes:png,jpg,jpeg,webp,svg|max:2048',
            ]);

            $societe = Societe::findOrFail($id);
            $this->enregistrerLogo($societe, $request->file('logo'));

            return response()->json([
                'success' => true,
                'data' => $societe,
                'message' => 'Logo mis à jour avec succès',
            ], 200);

        } catch (ModelNotFoundException $e) {
            return response()->json(['success' => false, 'message' => 'Société non trouvée'], 404);
        } catch (ValidationException $e) {
            return response()->json(['success' => false, 'message' => 'Fichier invalide', 'errors' => $e->errors()], 422);
        } catch (Exception $e) {
            return response()->json(['success' => false, 'message' => 'Erreur lors de l\'upload', 'error' => $e->getMessage()], 500);
        }
    }

    /**
     * Upload du logo de SA propre boutique (accessible au propriétaire / gérant).
     */
    public function uploadMonLogo(Request $request)
    {
        try {
            $request->validate([
                'logo' => 'required|image|mimes:png,jpg,jpeg,webp,svg|max:2048',
            ]);

            $user = auth()->user();
            if (!$user || !$user->societe_id) {
                return response()->json([
                    'success' => false,
                    'message' => 'Aucune société associée à votre compte',
                ], 422);
            }

            $societe = Societe::findOrFail($user->societe_id);
            $this->enregistrerLogo($societe, $request->file('logo'));

            return response()->json([
                'success' => true,
                'data' => $societe,
                'message' => 'Logo mis à jour avec succès',
            ], 200);

        } catch (ModelNotFoundException $e) {
            return response()->json(['success' => false, 'message' => 'Société non trouvée'], 404);
        } catch (ValidationException $e) {
            return response()->json(['success' => false, 'message' => 'Fichier invalide', 'errors' => $e->errors()], 422);
        } catch (Exception $e) {
            return response()->json(['success' => false, 'message' => 'Erreur lors de l\'upload', 'error' => $e->getMessage()], 500);
        }
    }

    /**
     * Supprimer le logo de SA propre boutique.
     */
    public function deleteMonLogo()
    {
        try {
            $user = auth()->user();
            if (!$user || !$user->societe_id) {
                return response()->json([
                    'success' => false,
                    'message' => 'Aucune société associée à votre compte',
                ], 422);
            }

            $societe = Societe::findOrFail($user->societe_id);
            $this->supprimerLogo($societe);

            return response()->json([
                'success' => true,
                'data' => $societe,
                'message' => 'Logo supprimé',
            ], 200);

        } catch (Exception $e) {
            return response()->json(['success' => false, 'message' => 'Erreur lors de la suppression du logo', 'error' => $e->getMessage()], 500);
        }
    }

    /**
     * Enregistre un fichier logo pour une société (remplace l'ancien).
     */
    private function enregistrerLogo(Societe $societe, $file): void
    {
        $dir = public_path('logos');
        if (!is_dir($dir)) {
            @mkdir($dir, 0755, true);
        }

        $name = 'societe-' . $societe->id . '-' . time() . '.' . strtolower($file->getClientOriginalExtension());
        $file->move($dir, $name);

        if ($societe->logo) {
            $old = public_path(ltrim($societe->logo, '/'));
            if (is_file($old)) {
                @unlink($old);
            }
        }

        $societe->logo = '/logos/' . $name;
        $societe->save();
    }

    /**
     * Supprime le fichier logo d'une société.
     */
    private function supprimerLogo(Societe $societe): void
    {
        if ($societe->logo) {
            $old = public_path(ltrim($societe->logo, '/'));
            if (is_file($old)) {
                @unlink($old);
            }
        }
        $societe->logo = null;
        $societe->save();
    }

    public function activer($id)
    {
        try {
            $societe = Societe::findOrFail($id);
            $societe->update(['actif' => true]);

            return response()->json([
                'success' => true,
                'data' => $societe,
                'message' => 'Abonnement réactivé',
            ], 200);

        } catch (ModelNotFoundException $e) {
            return response()->json(['success' => false, 'message' => 'Société non trouvée'], 404);
        } catch (Exception $e) {
            return response()->json(['success' => false, 'message' => 'Erreur', 'error' => $e->getMessage()], 500);
        }
    }

    public function desactiver($id)
    {
        try {
            $societe = Societe::findOrFail($id);
            $societe->update(['actif' => false]);

            return response()->json([
                'success' => true,
                'data' => $societe,
                'message' => 'Abonnement désactivé',
            ], 200);

        } catch (ModelNotFoundException $e) {
            return response()->json(['success' => false, 'message' => 'Société non trouvée'], 404);
        } catch (Exception $e) {
            return response()->json(['success' => false, 'message' => 'Erreur', 'error' => $e->getMessage()], 500);
        }
    }

    public function destroy($id)
    {
        try {
            $societe = Societe::withCount('utilisateurs')->findOrFail($id);

            if ($societe->utilisateurs_count > 0) {
                return response()->json([
                    'success' => false,
                    'message' => 'Impossible de supprimer une société avec des utilisateurs. Désactivez-la plutôt.',
                ], 422);
            }

            // Nettoyer les données rattachées (paramètres, rôles) pour éviter les orphelins
            \Illuminate\Support\Facades\DB::table('role_permission')
                ->whereIn('role_id', function ($q) use ($societe) {
                    $q->select('id')->from('roles')->where('societe_id', $societe->id);
                })->delete();
            \App\Models\Role::where('societe_id', $societe->id)->delete();
            Parametre::withoutGlobalScopes()->where('societe_id', $societe->id)->delete();

            $societe->delete();

            return response()->json([
                'success' => true,
                'message' => 'Société supprimée avec succès',
            ], 200);

        } catch (ModelNotFoundException $e) {
            return response()->json(['success' => false, 'message' => 'Société non trouvée'], 404);
        } catch (Exception $e) {
            return response()->json(['success' => false, 'message' => 'Erreur lors de la suppression', 'error' => $e->getMessage()], 500);
        }
    }

    private function generateCode(string $nom): string
    {
        $base = Str::upper(Str::slug($nom, '-'));
        if ($base === '') {
            $base = 'SOC';
        }
        $code = $base;
        $i = 1;
        while (Societe::where('code', $code)->exists()) {
            $code = $base . '-' . $i++;
        }
        return $code;
    }
}
