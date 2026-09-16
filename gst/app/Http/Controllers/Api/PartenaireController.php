<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Partenaire;
use Illuminate\Http\Request;
use Illuminate\Database\Eloquent\ModelNotFoundException;
use Illuminate\Validation\ValidationException;
use Exception;

class PartenaireController extends Controller
{
    /**
     * Liste des partenaires avec recherche, filtres et pagination
     */
    public function index(Request $request)
    {
        try {
            $query = Partenaire::query();

            // Recherche
            if ($request->filled('search')) {
                $search = $request->search;
                $query->where(function($q) use ($search) {
                    $q->where('nom', 'LIKE', "%{$search}%")
                      ->orWhere('email', 'LIKE', "%{$search}%")
                      ->orWhere('code', 'LIKE', "%{$search}%")
                      ->orWhere('telephone', 'LIKE', "%{$search}%")
                      ->orWhere('ville', 'LIKE', "%{$search}%");
                });
            }

            // Filtre par type
            if ($request->filled('type')) {
                if ($request->type === 'client') {
                    $query->where('est_client', true);
                } elseif ($request->type === 'fournisseur') {
                    $query->where('est_fournisseur', true);
                }
            }

            // Filtre par statut actif
            if ($request->filled('actif')) {
                $query->where('actif', $request->actif);
            }

            // Filtre par pays
            if ($request->filled('pays')) {
                $query->where('pays', $request->pays);
            }

            // Tri
            if ($request->filled('order_by')) {
                $query->orderBy($request->order_by, $request->order_direction ?? 'asc');
            } else {
                $query->orderBy('nom', 'asc');
            }

            // Pagination
            $perPage = $request->input('per_page', 15);
            $partenaires = $query->paginate($perPage);

            return response()->json([
                'success' => true,
                'data' => $partenaires,
                'message' => 'Liste des partenaires récupérée avec succès'
            ], 200);

        } catch (Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Erreur lors de la récupération des partenaires',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Voir un partenaire spécifique
     */
    public function show($id)
    {
        try {
            $partenaire = Partenaire::findOrFail($id);

            return response()->json([
                'success' => true,
                'data' => $partenaire,
                'message' => 'Partenaire récupéré avec succès'
            ], 200);

        } catch (ModelNotFoundException $e) {
            return response()->json([
                'success' => false,
                'message' => 'Partenaire non trouvé'
            ], 404);

        } catch (Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Erreur lors de la récupération du partenaire',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Créer un nouveau partenaire
     */
    public function store(Request $request)
    {
        try {
            $validated = $request->validate([
                'nom' => 'required|string|max:255',
                'code' => 'nullable|string|max:50|unique:partenaire',
                'est_client' => 'boolean',
                'est_fournisseur' => 'boolean',
                'email' => 'required|email|max:255',
                'telephone' => 'required|string|max:50',
                'mobile' => 'nullable|string|max:50',
                'adresse' => 'required|string',
                'ville' => 'nullable|string|max:100',
                'code_postal' => 'nullable|string|max:20',
                'pays' => 'nullable|string|max:100',
                'numero_tva' => 'nullable|string|max:50',
                'siret' => 'nullable|string|max:50',
                'site_web' => 'nullable|url|max:255',
                'notes' => 'nullable|string',
                'remise' => 'nullable|numeric|min:0|max:100',
                'delai_paiement' => 'nullable|integer|min:0',
                'actif' => 'boolean',
            ]);

            // Génération automatique du code si non fourni
            if (empty($validated['code'])) {
                $prefix = $validated['est_client'] && $validated['est_fournisseur'] ? 'PF' :
                         ($validated['est_client'] ? 'CLI' : 'FOU');
                $lastCode = Partenaire::where('code', 'LIKE', $prefix . '%')
                                      ->orderBy('id', 'desc')
                                      ->first();
                $nextNumber = $lastCode ? intval(substr($lastCode->code, -5)) + 1 : 1;
                $validated['code'] = $prefix . '-' . str_pad($nextNumber, 5, '0', STR_PAD_LEFT);
            }

            $partenaire = Partenaire::create($validated);

            $this->logActivity('create', 'Partenaire', $partenaire->id, "Création partenaire {$partenaire->nom}");

            return response()->json([
                'success' => true,
                'data' => $partenaire,
                'message' => 'Partenaire créé avec succès'
            ], 201);

        } catch (ValidationException $e) {
            return response()->json([
                'success' => false,
                'message' => 'Erreur de validation',
                'errors' => $e->errors()
            ], 422);

        } catch (Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Erreur lors de la création du partenaire',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Modifier un partenaire
     */
    public function update(Request $request, $id)
    {
        try {
            $partenaire = Partenaire::findOrFail($id);

            $validated = $request->validate([
                'nom' => 'sometimes|string|max:255',
                'code' => 'nullable|string|max:50|unique:partenaire,code,'.$id,
                'est_client' => 'boolean',
                'est_fournisseur' => 'boolean',
                'email' => 'nullable|email|max:255',
                'telephone' => 'nullable|string|max:50',
                'mobile' => 'nullable|string|max:50',
                'adresse' => 'nullable|string',
                'ville' => 'nullable|string|max:100',
                'code_postal' => 'nullable|string|max:20',
                'pays' => 'nullable|string|max:100',
                'numero_tva' => 'nullable|string|max:50',
                'siret' => 'nullable|string|max:50',
                'site_web' => 'nullable|url|max:255',
                'notes' => 'nullable|string',
                'remise' => 'nullable|numeric|min:0|max:100',
                'delai_paiement' => 'nullable|integer|min:0',
                'actif' => 'boolean',
            ]);

            $partenaire->update($validated);

            $this->logActivity('update', 'Partenaire', $partenaire->id, "Modification partenaire {$partenaire->nom}");

            return response()->json([
                'success' => true,
                'data' => $partenaire,
                'message' => 'Partenaire modifié avec succès'
            ], 200);

        } catch (ModelNotFoundException $e) {
            return response()->json([
                'success' => false,
                'message' => 'Partenaire non trouvé'
            ], 404);

        } catch (ValidationException $e) {
            return response()->json([
                'success' => false,
                'message' => 'Erreur de validation',
                'errors' => $e->errors()
            ], 422);

        } catch (Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Erreur lors de la modification du partenaire',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Supprimer un partenaire
     */
    public function destroy($id)
    {
        try {
            $partenaire = Partenaire::findOrFail($id);

            // Vérifier si le partenaire a des commandes
            if ($partenaire->commandesVente()->count() > 0 || $partenaire->commandesAchat()->count() > 0) {
                return response()->json([
                    'success' => false,
                    'message' => 'Ce partenaire a des commandes associées. Supprimez-les d\'abord ou désactivez le partenaire.'
                ], 422);
            }

            if ($partenaire->factures()->count() > 0) {
                return response()->json([
                    'success' => false,
                    'message' => 'Ce partenaire a des factures associées. Supprimez-les d\'abord ou désactivez le partenaire.'
                ], 422);
            }

            $partenaire->delete();

            $this->logActivity('delete', 'Partenaire', $id, "Suppression partenaire #{$id}");

            return response()->json([
                'success' => true,
                'message' => 'Partenaire supprimé avec succès'
            ], 200);

        } catch (ModelNotFoundException $e) {
            return response()->json([
                'success' => false,
                'message' => 'Partenaire non trouvé'
            ], 404);

        } catch (Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Erreur lors de la suppression du partenaire',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Activer un partenaire
     */
    public function activer($id)
    {
        try {
            $partenaire = Partenaire::findOrFail($id);
            $partenaire->actif = true;
            $partenaire->save();

            return response()->json([
                'success' => true,
                'data' => $partenaire,
                'message' => 'Partenaire activé avec succès'
            ], 200);

        } catch (ModelNotFoundException $e) {
            return response()->json([
                'success' => false,
                'message' => 'Partenaire non trouvé'
            ], 404);

        } catch (Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Erreur lors de l\'activation du partenaire',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Désactiver un partenaire
     */
    public function desactiver($id)
    {
        try {
            $partenaire = Partenaire::findOrFail($id);
            $partenaire->actif = false;
            $partenaire->save();

            return response()->json([
                'success' => true,
                'data' => $partenaire,
                'message' => 'Partenaire désactivé avec succès'
            ], 200);

        } catch (ModelNotFoundException $e) {
            return response()->json([
                'success' => false,
                'message' => 'Partenaire non trouvé'
            ], 404);

        } catch (Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Erreur lors de la désactivation du partenaire',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Récupérer les clients
     */
    public function clients(Request $request)
    {
        try {
            $query = Partenaire::where('est_client', true);

            if ($request->filled('search')) {
                $search = $request->search;
                $query->where('nom', 'LIKE', "%{$search}%")
                      ->orWhere('email', 'LIKE', "%{$search}%");
            }

            $perPage = $request->input('per_page', 15);
            $clients = $query->paginate($perPage);

            return response()->json([
                'success' => true,
                'data' => $clients,
                'message' => 'Liste des clients récupérée avec succès'
            ], 200);

        } catch (Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Erreur lors de la récupération des clients',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Récupérer les fournisseurs
     */
    public function fournisseurs(Request $request)
    {
        try {
            $query = Partenaire::where('est_fournisseur', true);

            if ($request->filled('search')) {
                $search = $request->search;
                $query->where('nom', 'LIKE', "%{$search}%")
                      ->orWhere('email', 'LIKE', "%{$search}%");
            }

            $perPage = $request->input('per_page', 15);
            $fournisseurs = $query->paginate($perPage);

            return response()->json([
                'success' => true,
                'data' => $fournisseurs,
                'message' => 'Liste des fournisseurs récupérée avec succès'
            ], 200);

        } catch (Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Erreur lors de la récupération des fournisseurs',
                'error' => $e->getMessage()
            ], 500);
        }
    }
}