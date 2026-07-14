<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\EcritureComptable;
use App\Models\LigneEcritureComptable;
use App\Models\CommandeVente;
use App\Models\CommandeAchat;
use Illuminate\Http\Request;
use Illuminate\Database\Eloquent\ModelNotFoundException;
use Illuminate\Validation\ValidationException;
use Exception;
use DB;

class EcritureComptableController extends Controller
{
    /**
     * Liste des écritures comptables avec recherche, filtres et pagination
     */
    public function index(Request $request)
    {
        try {
            $query = EcritureComptable::with(['partenaire', 'lignes']);

            // Recherche
            if ($request->filled('search')) {
                $search = $request->search;
                $query->where(function($q) use ($search) {
                    $q->where('reference', 'LIKE', "%{$search}%")
                      ->orWhere('numero_facture', 'LIKE', "%{$search}%")
                      ->orWhereHas('partenaire', function($sub) use ($search) {
                          $sub->where('nom', 'LIKE', "%{$search}%");
                      });
                });
            }

            // Filtre par type (support multiple: "avoir_client,avoir_fournisseur")
            if ($request->filled('type')) {
                $types = explode(',', $request->type);
                $query->whereIn('type', $types);
            }

            // Filtre par statut
            if ($request->filled('statut')) {
                $query->where('statut', $request->statut);
            }

            // Filtre par partenaire
            if ($request->filled('partenaire_id')) {
                $query->where('partenaire_id', $request->partenaire_id);
            }

            // Filtre par date
            if ($request->filled('date_debut')) {
                $query->whereDate('date_emission', '>=', $request->date_debut);
            }
            if ($request->filled('date_fin')) {
                $query->whereDate('date_emission', '<=', $request->date_fin);
            }

            // Pagination
            $perPage = $request->input('per_page', 15);
            $ecritures = $query->orderBy('created_at', 'desc')->paginate($perPage);

            return response()->json([
                'success' => true,
                'data' => $ecritures,
                'message' => 'Liste des écritures récupérée avec succès'
            ], 200);

        } catch (Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Erreur lors de la récupération des écritures',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Voir une écriture spécifique
     */
    public function show($id)
    {
        try {
            $ecriture = EcritureComptable::with([
                'partenaire',
                'lignes.produit',
                'commandeVente',
                'commandeAchat',
                'creePar',
                'modifiePar'
            ])->findOrFail($id);

            return response()->json([
                'success' => true,
                'data' => $ecriture,
                'message' => 'Écriture récupérée avec succès'
            ], 200);

        } catch (ModelNotFoundException $e) {
            return response()->json([
                'success' => false,
                'message' => 'Écriture non trouvée'
            ], 404);

        } catch (Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Erreur lors de la récupération de l\'écriture',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Créer une nouvelle écriture (facture)
     */
    public function store(Request $request)
    {
        try {
            DB::beginTransaction();

            $validated = $request->validate([
                'partenaire_id' => 'required|exists:partenaire,id',
                'type' => 'required|in:facture_client,avoir_client,facture_fournisseur,avoir_fournisseur',
                'date_emission' => 'required|date',
                'date_echeance' => 'nullable|date|after_or_equal:date_emission',
                'commande_vente_id' => 'nullable|exists:commande_vente,id',
                'commande_achat_id' => 'nullable|exists:commande_achat,id',
                'transfert_id' => 'nullable|exists:transfert_stock,id',
                'mode_paiement' => 'nullable|string|max:50',
                'notes' => 'nullable|string',
                'adresse_facturation' => 'nullable|string',
                'adresse_livraison' => 'nullable|string',
                'lignes' => 'required|array|min:1',
                'lignes.*.produit_id' => 'nullable|exists:variante_produit,id',
                'lignes.*.nom_produit' => 'required|string|max:255',
                'lignes.*.description' => 'nullable|string',
                'lignes.*.quantite' => 'required|numeric|min:0.01',
                'lignes.*.prix_unitaire_ht' => 'required|numeric|min:0',
                'lignes.*.taux_remise' => 'nullable|numeric|min:0|max:100',
                'lignes.*.taux_tva' => 'nullable|numeric|min:0|max:100',
                'lignes.*.compte_comptable' => 'nullable|string|max:20',
                'lignes.*.compte_tva' => 'nullable|string|max:20',
                'lignes.*.notes' => 'nullable|string',
            ]);

            // Générer la référence
            $lastEcriture = EcritureComptable::latest('id')->first();
            $numero = $lastEcriture ? intval(substr($lastEcriture->reference, -5)) + 1 : 1;
            $reference = 'INV-' . date('Y') . '-' . str_pad($numero, 5, '0', STR_PAD_LEFT);

            // Générer le numéro de facture
            $numeroFacture = 'FACT-' . date('Y') . '-' . str_pad($numero, 5, '0', STR_PAD_LEFT);

            // Calcul des totaux
            $montantHt = 0;
            $montantTva = 0;
            $montantTtc = 0;
            $montantRemise = 0;

            foreach ($validated['lignes'] as $ligne) {
                $tauxRemise = $ligne['taux_remise'] ?? 0;
                $tauxTva = $ligne['taux_tva'] ?? 0;

                $prixHt = $ligne['prix_unitaire_ht'];
                $quantite = $ligne['quantite'];
                $montantLigneHt = $prixHt * $quantite;
                $remiseLigne = $montantLigneHt * ($tauxRemise / 100);
                $montantLigneHtApresRemise = $montantLigneHt - $remiseLigne;
                $tvaLigne = $montantLigneHtApresRemise * ($tauxTva / 100);
                $montantLigneTtc = $montantLigneHtApresRemise + $tvaLigne;

                $montantHt += $montantLigneHt;
                $montantTva += $tvaLigne;
                $montantTtc += $montantLigneTtc;
                $montantRemise += $remiseLigne;
            }

            // Créer l'écriture
            $ecriture = EcritureComptable::create([
                'reference' => $reference,
                'numero_facture' => $numeroFacture,
                'partenaire_id' => $validated['partenaire_id'],
                'type' => $validated['type'],
                'date_emission' => $validated['date_emission'],
                'date_echeance' => $validated['date_echeance'] ?? null,
                'montant_ht' => $montantHt,
                'montant_tva' => $montantTva,
                'montant_ttc' => $montantTtc,
                'montant_remise' => $montantRemise,
                'taux_remise' => $validated['taux_remise'] ?? 0,
                'montant_paye' => 0,
                'montant_restant' => $montantTtc,
                'commande_vente_id' => $validated['commande_vente_id'] ?? null,
                'commande_achat_id' => $validated['commande_achat_id'] ?? null,
                'transfert_id' => $validated['transfert_id'] ?? null,
                'statut' => 'brouillon',
                'mode_paiement' => $validated['mode_paiement'] ?? null,
                'notes' => $validated['notes'] ?? null,
                'adresse_facturation' => $validated['adresse_facturation'] ?? null,
                'adresse_livraison' => $validated['adresse_livraison'] ?? null,
                'cree_par_utilisateur_id' => auth()->id(),
                'actif' => true,
            ]);

            // Créer les lignes
            foreach ($validated['lignes'] as $ligneData) {
                $tauxRemise = $ligneData['taux_remise'] ?? 0;
                $tauxTva = $ligneData['taux_tva'] ?? 0;

                $prixHt = $ligneData['prix_unitaire_ht'];
                $quantite = $ligneData['quantite'];
                $montantLigneHt = $prixHt * $quantite;
                $remiseLigne = $montantLigneHt * ($tauxRemise / 100);
                $montantLigneHtApresRemise = $montantLigneHt - $remiseLigne;
                $tvaLigne = $montantLigneHtApresRemise * ($tauxTva / 100);
                $montantLigneTtc = $montantLigneHtApresRemise + $tvaLigne;

                LigneEcritureComptable::create([
                    'ecriture_comptable_id' => $ecriture->id,
                    'produit_id' => $ligneData['produit_id'] ?? null,
                    'code_produit' => $ligneData['code_produit'] ?? null,
                    'nom_produit' => $ligneData['nom_produit'],
                    'description' => $ligneData['description'] ?? null,
                    'quantite' => $quantite,
                    'prix_unitaire_ht' => $prixHt,
                    'prix_unitaire_ttc' => $prixHt * (1 + ($tauxTva / 100)),
                    'taux_remise' => $tauxRemise,
                    'montant_remise' => $remiseLigne,
                    'montant_ht' => $montantLigneHt,
                    'montant_tva' => $tvaLigne,
                    'montant_ttc' => $montantLigneTtc,
                    'taux_tva' => $tauxTva,
                    'compte_comptable' => $ligneData['compte_comptable'] ?? null,
                    'compte_tva' => $ligneData['compte_tva'] ?? null,
                    'notes' => $ligneData['notes'] ?? null,
                ]);
            }

            DB::commit();

            $ecriture->load(['partenaire', 'lignes']);

            $this->logActivity('create', 'Facture', $ecriture->id, "Création {$ecriture->type} {$ecriture->reference}");

            return response()->json([
                'success' => true,
                'data' => $ecriture,
                'message' => 'Facture créée avec succès'
            ], 201);

        } catch (ValidationException $e) {
            DB::rollBack();
            return response()->json([
                'success' => false,
                'message' => 'Erreur de validation',
                'errors' => $e->errors()
            ], 422);

        } catch (Exception $e) {
            DB::rollBack();
            return response()->json([
                'success' => false,
                'message' => 'Erreur lors de la création de la facture',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Modifier une écriture
     */
    public function update(Request $request, $id)
    {
        try {
            DB::beginTransaction();

            $ecriture = EcritureComptable::findOrFail($id);

            if (in_array($ecriture->statut, ['validee', 'envoyee', 'payee', 'annulee'])) {
                return response()->json([
                    'success' => false,
                    'message' => 'Les écritures validées, envoyées, payées ou annulées ne peuvent pas être modifiées'
                ], 422);
            }

            $validated = $request->validate([
                'date_emission' => 'sometimes|date',
                'date_echeance' => 'nullable|date|after_or_equal:date_emission',
                'mode_paiement' => 'nullable|string|max:50',
                'notes' => 'nullable|string',
                'adresse_facturation' => 'nullable|string',
                'adresse_livraison' => 'nullable|string',
            ]);

            $ecriture->update($validated);
            $ecriture->modifie_par_utilisateur_id = auth()->id();
            $ecriture->save();

            DB::commit();

            $ecriture->load(['partenaire', 'lignes']);

            $this->logActivity('update', 'Facture', $ecriture->id, "Modification {$ecriture->type} {$ecriture->reference}");

            return response()->json([
                'success' => true,
                'data' => $ecriture,
                'message' => 'Écriture modifiée avec succès'
            ], 200);

        } catch (ModelNotFoundException $e) {
            DB::rollBack();
            return response()->json([
                'success' => false,
                'message' => 'Écriture non trouvée'
            ], 404);

        } catch (ValidationException $e) {
            DB::rollBack();
            return response()->json([
                'success' => false,
                'message' => 'Erreur de validation',
                'errors' => $e->errors()
            ], 422);

        } catch (Exception $e) {
            DB::rollBack();
            return response()->json([
                'success' => false,
                'message' => 'Erreur lors de la modification de l\'écriture',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Changer le statut d'une écriture
     */
    public function changerStatut(Request $request, $id)
    {
        try {
            DB::beginTransaction();

            $ecriture = EcritureComptable::findOrFail($id);

            $validated = $request->validate([
                'statut' => 'required|in:validee,envoyee,payee,annulee',
                'notes' => 'nullable|string',
            ]);

            $transitions = [
                'brouillon' => ['validee', 'annulee'],
                'validee' => ['envoyee', 'annulee'],
                'envoyee' => ['payee', 'annulee'],
                'payee' => ['annulee'],
                'annulee' => [],
            ];

            if (!in_array($validated['statut'], $transitions[$ecriture->statut] ?? [])) {
                return response()->json([
                    'success' => false,
                    'message' => "Transition de statut impossible de {$ecriture->statut} à {$validated['statut']}"
                ], 422);
            }

            if ($validated['statut'] === 'payee') {
                $ecriture->date_paiement = now()->toDateString();
                $ecriture->montant_paye = $ecriture->montant_ttc;
                $ecriture->montant_restant = 0;
            }

            $ecriture->statut = $validated['statut'];
            $ecriture->notes = $request->notes ?? $ecriture->notes;
            $ecriture->modifie_par_utilisateur_id = auth()->id();
            $ecriture->save();

            DB::commit();

            $ecriture->load(['partenaire', 'lignes']);

            $this->logActivity('changer_etat', 'Facture', $ecriture->id, "Changement statut {$ecriture->reference}: → {$ecriture->statut}");

            return response()->json([
                'success' => true,
                'data' => $ecriture,
                'message' => "Statut changé à: " . $ecriture->statut_label
            ], 200);

        } catch (ModelNotFoundException $e) {
            DB::rollBack();
            return response()->json([
                'success' => false,
                'message' => 'Écriture non trouvée'
            ], 404);

        } catch (ValidationException $e) {
            DB::rollBack();
            return response()->json([
                'success' => false,
                'message' => 'Erreur de validation',
                'errors' => $e->errors()
            ], 422);

        } catch (Exception $e) {
            DB::rollBack();
            return response()->json([
                'success' => false,
                'message' => 'Erreur lors du changement de statut',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Enregistrer un paiement partiel
     */
    public function paiementPartiel(Request $request, $id)
    {
        try {
            DB::beginTransaction();

            $ecriture = EcritureComptable::findOrFail($id);

            if ($ecriture->statut === 'payee' || $ecriture->statut === 'annulee') {
                return response()->json([
                    'success' => false,
                    'message' => 'Cette facture est déjà payée ou annulée'
                ], 422);
            }

            $validated = $request->validate([
                'montant' => 'required|numeric|min:0.01',
                'notes' => 'nullable|string',
            ]);

            if ($validated['montant'] > $ecriture->montant_restant) {
                return response()->json([
                    'success' => false,
                    'message' => "Le montant du paiement ({$validated['montant']}) dépasse le montant restant ({$ecriture->montant_restant})"
                ], 422);
            }

            $ecriture->montant_paye += $validated['montant'];
            $ecriture->montant_restant -= $validated['montant'];

            if ($ecriture->montant_restant <= 0) {
                $ecriture->statut = 'payee';
                $ecriture->date_paiement = now()->toDateString();
            }

            $notesPaiement = $validated['notes'] ?? '';
            $ecriture->notes = ($ecriture->notes ? $ecriture->notes . "\n" : '') . 
                               "Paiement partiel de " . number_format($validated['montant'], 2) . " € le " . now()->toDateString() . 
                               ($notesPaiement ? " - " . $notesPaiement : '');

            $ecriture->modifie_par_utilisateur_id = auth()->id();
            $ecriture->save();

            DB::commit();

            $ecriture->load(['partenaire', 'lignes']);

            $this->logActivity('payer', 'Facture', $ecriture->id, "Paiement partiel de {$validated['montant']}€ sur {$ecriture->reference}");

            return response()->json([
                'success' => true,
                'data' => $ecriture,
                'message' => 'Paiement partiel enregistré avec succès'
            ], 200);

        } catch (ModelNotFoundException $e) {
            DB::rollBack();
            return response()->json([
                'success' => false,
                'message' => 'Écriture non trouvée'
            ], 404);

        } catch (ValidationException $e) {
            DB::rollBack();
            return response()->json([
                'success' => false,
                'message' => 'Erreur de validation',
                'errors' => $e->errors()
            ], 422);

        } catch (Exception $e) {
            DB::rollBack();
            return response()->json([
                'success' => false,
                'message' => 'Erreur lors du paiement',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Supprimer une écriture
     */
    public function destroy($id)
    {
        try {
            DB::beginTransaction();

            $ecriture = EcritureComptable::findOrFail($id);

            if (!in_array($ecriture->statut, ['brouillon', 'annulee'])) {
                return response()->json([
                    'success' => false,
                    'message' => 'Seules les écritures en brouillon ou annulées peuvent être supprimées'
                ], 422);
            }

            $ecriture->delete();

            DB::commit();

            $this->logActivity('delete', 'Facture', $id, "Suppression {$ecriture->type} #{$id}");

            return response()->json([
                'success' => true,
                'message' => 'Écriture supprimée avec succès'
            ], 200);

        } catch (ModelNotFoundException $e) {
            DB::rollBack();
            return response()->json([
                'success' => false,
                'message' => 'Écriture non trouvée'
            ], 404);

        } catch (Exception $e) {
            DB::rollBack();
            return response()->json([
                'success' => false,
                'message' => 'Erreur lors de la suppression de l\'écriture',
                'error' => $e->getMessage()
            ], 500);
        }
    }
}