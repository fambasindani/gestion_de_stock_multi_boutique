<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\CommandeVente;
use App\Models\LigneCommandeVente;
use App\Models\VarianteProduit;
use App\Models\QuantiteStock;
use App\Models\LotTracabilite;
use Illuminate\Http\Request;
use Illuminate\Database\Eloquent\ModelNotFoundException;
use Illuminate\Validation\ValidationException;
use Exception;
use DB;

class CommandeVenteController extends Controller
{
    /**
     * Liste des commandes avec recherche, filtres et pagination
     */
    public function index(Request $request)
    {
        try {
            $query = CommandeVente::with(['partenaire', 'lignes']);

            // Recherche
            if ($request->filled('search')) {
                $search = $request->search;
                $query->where(function($q) use ($search) {
                    $q->where('reference', 'LIKE', "%{$search}%")
                      ->orWhere('reference_commande_client', 'LIKE', "%{$search}%")
                      ->orWhereHas('partenaire', function($sub) use ($search) {
                          $sub->where('nom', 'LIKE', "%{$search}%");
                      });
                });
            }

            // Filtre par partenaire
            if ($request->filled('partenaire_id')) {
                $query->where('partenaire_id', $request->partenaire_id);
            }

            // Filtre par état
            if ($request->filled('etat')) {
                $query->where('etat', $request->etat);
            }

            // Filtre par date
            if ($request->filled('date_debut')) {
                $query->whereDate('date_commande', '>=', $request->date_debut);
            }
            if ($request->filled('date_fin')) {
                $query->whereDate('date_commande', '<=', $request->date_fin);
            }

            // Filtre par statut actif
            if ($request->filled('actif')) {
                $query->where('actif', $request->actif);
            }

            // Pagination
            $perPage = $request->input('per_page', 15);
            $commandes = $query->orderBy('created_at', 'desc')->paginate($perPage);

            return response()->json([
                'success' => true,
                'data' => $commandes,
                'message' => 'Liste des commandes récupérée avec succès'
            ], 200);

        } catch (Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Erreur lors de la récupération des commandes',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Voir une commande spécifique
     */
    public function show($id)
    {
        try {
            $commande = CommandeVente::with([
                'partenaire',
                'lignes.produit',
                'creePar',
                'modifiePar',
                'factures'
            ])->findOrFail($id);

            return response()->json([
                'success' => true,
                'data' => $commande,
                'message' => 'Commande récupérée avec succès'
            ], 200);

        } catch (ModelNotFoundException $e) {
            return response()->json([
                'success' => false,
                'message' => 'Commande non trouvée'
            ], 404);

        } catch (Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Erreur lors de la récupération de la commande',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Créer une nouvelle commande
     */
    public function store(Request $request)
    {
        try {
            DB::beginTransaction();

            $validated = $request->validate([
                'partenaire_id' => 'required|exists:partenaire,id',
                'date_commande' => 'required|date',
                'date_livraison_souhaitee' => 'nullable|date',
                'mode_paiement' => 'nullable|string|max:50',
                'reference_commande_client' => 'nullable|string|max:100',
                'notes' => 'nullable|string',
                'adresse_livraison' => 'nullable|string',
                'adresse_facturation' => 'nullable|string',
                'frais_livraison' => 'nullable|numeric|min:0',
                'taux_remise' => 'nullable|numeric|min:0|max:100',
                'lignes' => 'required|array|min:1',
                'lignes.*.produit_id' => 'required|exists:variante_produit,id',
                'lignes.*.quantite' => 'required|numeric|min:1',
                'lignes.*.prix_unitaire_ht' => 'required|numeric|min:0',
                'lignes.*.taux_remise' => 'nullable|numeric|min:0|max:100',
                'lignes.*.taux_tva' => 'nullable|numeric|min:0|max:100',
                'lignes.*.date_livraison_souhaitee' => 'nullable|date',
                'lignes.*.notes' => 'nullable|string',
            ]);

            // Génération de la référence
            $lastCommande = CommandeVente::latest('id')->first();
            $numero = $lastCommande ? intval(substr($lastCommande->reference, -5)) + 1 : 1;
            $reference = 'SO-' . date('Y') . '-' . str_pad($numero, 5, '0', STR_PAD_LEFT);

            // Calcul des totaux
            $montantTotalHt = 0;
            $montantTotalTtc = 0;
            $montantTotalRemise = 0;

            foreach ($validated['lignes'] as $ligne) {
                $tauxRemise = $ligne['taux_remise'] ?? 0;
                $tauxTva = $ligne['taux_tva'] ?? 0;

                $prixHt = $ligne['prix_unitaire_ht'];
                $montantHt = $prixHt * $ligne['quantite'];
                $montantRemise = $montantHt * ($tauxRemise / 100);
                $montantApresRemise = $montantHt - $montantRemise;
                $montantTtc = $montantApresRemise * (1 + ($tauxTva / 100));

                $montantTotalHt += $montantHt;
                $montantTotalRemise += $montantRemise;
                $montantTotalTtc += $montantTtc;
            }

            // Création de la commande
            $commande = CommandeVente::create([
                'reference' => $reference,
                'partenaire_id' => $validated['partenaire_id'],
                'date_commande' => $validated['date_commande'],
                'date_livraison_souhaitee' => $validated['date_livraison_souhaitee'] ?? null,
                'mode_paiement' => $validated['mode_paiement'] ?? null,
                'reference_commande_client' => $validated['reference_commande_client'] ?? null,
                'notes' => $validated['notes'] ?? null,
                'adresse_livraison' => $validated['adresse_livraison'] ?? null,
                'adresse_facturation' => $validated['adresse_facturation'] ?? null,
                'frais_livraison' => $validated['frais_livraison'] ?? 0,
                'taux_remise' => $validated['taux_remise'] ?? 0,
                'montant_total_ht' => $montantTotalHt,
                'montant_total_ttc' => $montantTotalTtc,
                'montant_remise' => $montantTotalRemise,
                'etat' => 'brouillon',
                'cree_par_utilisateur_id' => auth()->id(),
                'actif' => true,
            ]);

            // Création des lignes
            foreach ($validated['lignes'] as $ligneData) {
                $produit = VarianteProduit::find($ligneData['produit_id']);
                $tauxRemise = $ligneData['taux_remise'] ?? 0;
                $tauxTva = $ligneData['taux_tva'] ?? 0;

                $prixHt = $ligneData['prix_unitaire_ht'];
                $montantHt = $prixHt * $ligneData['quantite'];
                $montantRemise = $montantHt * ($tauxRemise / 100);
                $montantApresRemise = $montantHt - $montantRemise;
                $montantTtc = $montantApresRemise * (1 + ($tauxTva / 100));

                LigneCommandeVente::create([
                    'commande_vente_id' => $commande->id,
                    'produit_id' => $ligneData['produit_id'],
                    'code_produit' => $produit->code_interne ?? null,
                    'nom_produit' => $produit->nom ?? $produit->modele->nom ?? 'Produit',
                    'description' => $ligneData['description'] ?? null,
                    'quantite' => $ligneData['quantite'],
                    'prix_unitaire_ht' => $prixHt,
                    'prix_unitaire_ttc' => $prixHt * (1 + ($tauxTva / 100)),
                    'taux_remise' => $tauxRemise,
                    'montant_remise' => $montantRemise,
                    'montant_total_ht' => $montantHt,
                    'montant_total_ttc' => $montantTtc,
                    'taux_tva' => $tauxTva,
                    'date_livraison_souhaitee' => $ligneData['date_livraison_souhaitee'] ?? null,
                    'notes' => $ligneData['notes'] ?? null,
                ]);
            }

            DB::commit();

            $commande->load(['partenaire', 'lignes.produit']);

            $this->logActivity('create', 'CommandeVente', $commande->id, "Création commande vente {$commande->reference}");

            return response()->json([
                'success' => true,
                'data' => $commande,
                'message' => 'Commande créée avec succès'
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
                'message' => 'Erreur lors de la création de la commande',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Mettre à jour une commande
     */
    public function update(Request $request, $id)
    {
        try {
            DB::beginTransaction();

            $commande = CommandeVente::findOrFail($id);

            // Vérifier si la commande peut être modifiée
            if (in_array($commande->etat, ['termine', 'annule'])) {
                return response()->json([
                    'success' => false,
                    'message' => 'Les commandes terminées ou annulées ne peuvent pas être modifiées'
                ], 422);
            }

            $validated = $request->validate([
                'date_livraison_souhaitee' => 'nullable|date',
                'mode_paiement' => 'nullable|string|max:50',
                'reference_commande_client' => 'nullable|string|max:100',
                'notes' => 'nullable|string',
                'adresse_livraison' => 'nullable|string',
                'adresse_facturation' => 'nullable|string',
                'frais_livraison' => 'nullable|numeric|min:0',
                'taux_remise' => 'nullable|numeric|min:0|max:100',
                'etat' => 'nullable|in:brouillon,confirme,en_cours,termine,annule',
                'lignes' => 'nullable|array',
                'lignes.*.id' => 'nullable|exists:ligne_commande_vente,id',
                'lignes.*.produit_id' => 'required|exists:variante_produit,id',
                'lignes.*.quantite' => 'required|numeric|min:1',
                'lignes.*.prix_unitaire_ht' => 'required|numeric|min:0',
                'lignes.*.taux_remise' => 'nullable|numeric|min:0|max:100',
                'lignes.*.taux_tva' => 'nullable|numeric|min:0|max:100',
                'lignes.*.date_livraison_souhaitee' => 'nullable|date',
                'lignes.*.notes' => 'nullable|string',
            ]);

            // Mise à jour des champs de la commande
            if (isset($validated['date_livraison_souhaitee'])) $commande->date_livraison_souhaitee = $validated['date_livraison_souhaitee'];
            if (isset($validated['mode_paiement'])) $commande->mode_paiement = $validated['mode_paiement'];
            if (isset($validated['reference_commande_client'])) $commande->reference_commande_client = $validated['reference_commande_client'];
            if (isset($validated['notes'])) $commande->notes = $validated['notes'];
            if (isset($validated['adresse_livraison'])) $commande->adresse_livraison = $validated['adresse_livraison'];
            if (isset($validated['adresse_facturation'])) $commande->adresse_facturation = $validated['adresse_facturation'];
            if (isset($validated['frais_livraison'])) $commande->frais_livraison = $validated['frais_livraison'];
            if (isset($validated['taux_remise'])) $commande->taux_remise = $validated['taux_remise'];

            // Mise à jour de l'état
            if (isset($validated['etat'])) {
                if ($validated['etat'] === 'termine' && $commande->etat !== 'termine') {
                    $commande->date_livraison_reelle = now()->toDateString();
                }
                $commande->etat = $validated['etat'];
            }

            $commande->modifie_par_utilisateur_id = auth()->id();
            $commande->save();

            // Mise à jour des lignes
            if (isset($validated['lignes'])) {
                // Récupérer les IDs des lignes existantes
                $existingIds = $commande->lignes()->pluck('id')->toArray();
                $updatedIds = [];

                foreach ($validated['lignes'] as $ligneData) {
                    $produit = VarianteProduit::find($ligneData['produit_id']);
                    $tauxRemise = $ligneData['taux_remise'] ?? 0;
                    $tauxTva = $ligneData['taux_tva'] ?? 0;

                    $prixHt = $ligneData['prix_unitaire_ht'];
                    $quantite = $ligneData['quantite'];
                    $montantHt = $prixHt * $quantite;
                    $montantRemise = $montantHt * ($tauxRemise / 100);
                    $montantApresRemise = $montantHt - $montantRemise;
                    $montantTtc = $montantApresRemise * (1 + ($tauxTva / 100));

                    $ligneDataFormatted = [
                        'produit_id' => $ligneData['produit_id'],
                        'code_produit' => $produit->code_interne ?? null,
                        'nom_produit' => $produit->nom ?? $produit->modele->nom ?? 'Produit',
                        'description' => $ligneData['description'] ?? null,
                        'quantite' => $quantite,
                        'prix_unitaire_ht' => $prixHt,
                        'prix_unitaire_ttc' => $prixHt * (1 + ($tauxTva / 100)),
                        'taux_remise' => $tauxRemise,
                        'montant_remise' => $montantRemise,
                        'montant_total_ht' => $montantHt,
                        'montant_total_ttc' => $montantTtc,
                        'taux_tva' => $tauxTva,
                        'date_livraison_souhaitee' => $ligneData['date_livraison_souhaitee'] ?? null,
                        'notes' => $ligneData['notes'] ?? null,
                    ];

                    if (!empty($ligneData['id'])) {
                        // Mise à jour d'une ligne existante
                        $ligne = LigneCommandeVente::where('id', $ligneData['id'])
                                                   ->where('commande_vente_id', $commande->id)
                                                   ->first();
                        if ($ligne) {
                            $ligne->update($ligneDataFormatted);
                            $updatedIds[] = $ligne->id;
                        }
                    } else {
                        // Création d'une nouvelle ligne
                        $newLigne = LigneCommandeVente::create(array_merge(
                            $ligneDataFormatted,
                            ['commande_vente_id' => $commande->id]
                        ));
                        $updatedIds[] = $newLigne->id;
                    }
                }

                // Supprimer les lignes qui ne sont plus dans la liste
                $toDelete = array_diff($existingIds, $updatedIds);
                if (!empty($toDelete)) {
                    LigneCommandeVente::whereIn('id', $toDelete)->delete();
                }

                // Recalculer les totaux
                $this->recalculerTotaux($commande->id);
            }

            DB::commit();

            $commande->load(['partenaire', 'lignes.produit']);

            $this->logActivity('update', 'CommandeVente', $commande->id, "Modification commande vente {$commande->reference}");

            return response()->json([
                'success' => true,
                'data' => $commande,
                'message' => 'Commande modifiée avec succès'
            ], 200);

        } catch (ModelNotFoundException $e) {
            DB::rollBack();
            return response()->json([
                'success' => false,
                'message' => 'Commande non trouvée'
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
                'message' => 'Erreur lors de la modification de la commande',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Supprimer une commande
     */
    public function destroy($id)
    {
        try {
            DB::beginTransaction();

            $commande = CommandeVente::findOrFail($id);

            if (!in_array($commande->etat, ['brouillon', 'annule'])) {
                return response()->json([
                    'success' => false,
                    'message' => 'Seules les commandes en brouillon ou annulées peuvent être supprimées'
                ], 422);
            }

            $commande->delete();

            DB::commit();

            $this->logActivity('delete', 'CommandeVente', $id, "Suppression commande vente #{$id}");

            return response()->json([
                'success' => true,
                'message' => 'Commande supprimée avec succès'
            ], 200);

        } catch (ModelNotFoundException $e) {
            DB::rollBack();
            return response()->json([
                'success' => false,
                'message' => 'Commande non trouvée'
            ], 404);

        } catch (Exception $e) {
            DB::rollBack();
            return response()->json([
                'success' => false,
                'message' => 'Erreur lors de la suppression de la commande',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Recalculer les totaux d'une commande
     */
    private function recalculerTotaux($commandeId)
    {
        $commande = CommandeVente::find($commandeId);
        if (!$commande) return;

        $lignes = $commande->lignes;

        $montantTotalHt = $lignes->sum('montant_total_ht');
        $montantTotalTtc = $lignes->sum('montant_total_ttc');
        $montantRemise = $lignes->sum('montant_remise');

        $commande->update([
            'montant_total_ht' => $montantTotalHt,
            'montant_total_ttc' => $montantTotalTtc,
            'montant_remise' => $montantRemise,
        ]);
    }

    /**
     * Changer l'état d'une commande
     */
    public function changerEtat(Request $request, $id)
    {
        try {
            $commande = CommandeVente::findOrFail($id);

            $oldEtat = $commande->getOriginal('etat');

            $validated = $request->validate([
                'etat' => 'required|in:confirme,en_cours,termine,annule',
                'notes' => 'nullable|string',
            ]);

            // Vérifier les transitions autorisées
            $transitions = [
                'brouillon' => ['confirme', 'annule'],
                'confirme' => ['en_cours', 'annule'],
                'en_cours' => ['termine', 'annule'],
                'termine' => ['annule'],
                'annule' => [],
            ];

            if (!in_array($validated['etat'], $transitions[$commande->etat] ?? [])) {
                return response()->json([
                    'success' => false,
                    'message' => "Transition d'état impossible de {$commande->etat} à {$validated['etat']}"
                ], 422);
            }

            if ($validated['etat'] === 'termine') {
                $commande->date_livraison_reelle = now()->toDateString();

                foreach ($commande->lignes as $ligne) {
                    $quantite = $ligne->quantite - ($ligne->quantite_livree ?? 0);
                    if ($quantite <= 0) continue;

                    $stock = QuantiteStock::where('produit_id', $ligne->produit_id)
                        ->where('quantite_disponible', '>', 0)
                        ->orderBy('quantite_disponible', 'desc')
                        ->first();

                    if ($stock) {
                        $decrement = min($quantite, $stock->quantite_disponible);
                        $stock->quantite_disponible -= $decrement;
                        $stock->date_dernier_mouvement = now()->toDateString();
                        $stock->save();

                        if ($stock->lot_id) {
                            $lot = LotTracabilite::find($stock->lot_id);
                            if ($lot && $lot->quantite_actuelle > 0) {
                                $lot->quantite_actuelle -= $decrement;
                                if ($lot->quantite_actuelle <= 0) {
                                    $lot->statut = 'epuise';
                                }
                                $lot->save();
                            }
                        }
                    }
                }
            }

            $commande->etat = $validated['etat'];
            $commande->notes = $request->notes ?? $commande->notes;
            $commande->modifie_par_utilisateur_id = auth()->id();
            $commande->save();

            $commande->load(['partenaire', 'lignes.produit']);

            $this->logActivity('changer_etat', 'CommandeVente', $commande->id, "Changement état commande vente {$commande->reference}: {$oldEtat} → {$commande->etat}");

            return response()->json([
                'success' => true,
                'data' => $commande,
                'message' => "Commande passée à l'état: " . $commande->etat_label
            ], 200);

        } catch (ModelNotFoundException $e) {
            return response()->json([
                'success' => false,
                'message' => 'Commande non trouvée'
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
                'message' => 'Erreur lors du changement d\'état',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Ajouter une ligne à une commande
     */
    public function ajouterLigne(Request $request, $id)
    {
        try {
            DB::beginTransaction();

            $commande = CommandeVente::findOrFail($id);

            if (in_array($commande->etat, ['termine', 'annule'])) {
                return response()->json([
                    'success' => false,
                    'message' => 'Impossible d\'ajouter des lignes à une commande terminée ou annulée'
                ], 422);
            }

            $validated = $request->validate([
                'produit_id' => 'required|exists:variante_produit,id',
                'quantite' => 'required|numeric|min:1',
                'prix_unitaire_ht' => 'required|numeric|min:0',
                'taux_remise' => 'nullable|numeric|min:0|max:100',
                'taux_tva' => 'nullable|numeric|min:0|max:100',
                'date_livraison_souhaitee' => 'nullable|date',
                'notes' => 'nullable|string',
            ]);

            $produit = VarianteProduit::find($validated['produit_id']);
            $tauxRemise = $validated['taux_remise'] ?? 0;
            $tauxTva = $validated['taux_tva'] ?? 0;

            $prixHt = $validated['prix_unitaire_ht'];
            $quantite = $validated['quantite'];
            $montantHt = $prixHt * $quantite;
            $montantRemise = $montantHt * ($tauxRemise / 100);
            $montantApresRemise = $montantHt - $montantRemise;
            $montantTtc = $montantApresRemise * (1 + ($tauxTva / 100));

            $ligne = LigneCommandeVente::create([
                'commande_vente_id' => $commande->id,
                'produit_id' => $validated['produit_id'],
                'code_produit' => $produit->code_interne ?? null,
                'nom_produit' => $produit->nom ?? $produit->modele->nom ?? 'Produit',
                'quantite' => $quantite,
                'prix_unitaire_ht' => $prixHt,
                'prix_unitaire_ttc' => $prixHt * (1 + ($tauxTva / 100)),
                'taux_remise' => $tauxRemise,
                'montant_remise' => $montantRemise,
                'montant_total_ht' => $montantHt,
                'montant_total_ttc' => $montantTtc,
                'taux_tva' => $tauxTva,
                'date_livraison_souhaitee' => $validated['date_livraison_souhaitee'] ?? null,
                'notes' => $validated['notes'] ?? null,
            ]);

            // Recalculer les totaux
            $this->recalculerTotaux($commande->id);

            DB::commit();

            $commande->load(['partenaire', 'lignes.produit']);

            return response()->json([
                'success' => true,
                'data' => $ligne,
                'commande' => $commande,
                'message' => 'Ligne ajoutée avec succès'
            ], 201);

        } catch (ModelNotFoundException $e) {
            DB::rollBack();
            return response()->json([
                'success' => false,
                'message' => 'Commande non trouvée'
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
                'message' => 'Erreur lors de l\'ajout de la ligne',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Générer une facture à partir d'une commande terminée (facture matriciel)
     */
    public function genererFacture($id)
    {
        try {
            DB::beginTransaction();

            $commande = CommandeVente::with(['partenaire', 'lignes'])->findOrFail($id);

            if ($commande->etat !== 'termine') {
                return response()->json([
                    'success' => false,
                    'message' => "Seules les commandes terminées peuvent générer une facture (état actuel: {$commande->etat})"
                ], 422);
            }

            // Vérifier qu'une facture n'existe pas déjà
            $existingFacture = \App\Models\EcritureComptable::where('commande_vente_id', $id)
                ->whereIn('statut', ['brouillon', 'validee', 'envoyee', 'payee'])
                ->first();
            if ($existingFacture) {
                return response()->json([
                    'success' => false,
                    'message' => "Une facture ({$existingFacture->reference}) existe déjà pour cette commande"
                ], 422);
            }

            // Générer référence et numéro
            $lastEcriture = \App\Models\EcritureComptable::latest('id')->first();
            $numero = $lastEcriture ? intval(substr($lastEcriture->reference, -5)) + 1 : 1;
            $reference = 'INV-' . date('Y') . '-' . str_pad($numero, 5, '0', STR_PAD_LEFT);
            $numeroFacture = 'FACT-' . date('Y') . '-' . str_pad($numero, 5, '0', STR_PAD_LEFT);

            // Calcul des totaux depuis les lignes de la commande
            $montantHt = 0;
            $montantTva = 0;
            $montantTtc = 0;
            $montantRemise = 0;
            $lignesData = [];

            foreach ($commande->lignes as $ligne) {
                $tauxRemise = $ligne->taux_remise ?? 0;
                $tauxTva = $ligne->taux_tva ?? 0;

                $prixHt = $ligne->prix_unitaire_ht;
                $quantite = $ligne->quantite;
                $montantLigneHt = $prixHt * $quantite;
                $remiseLigne = $montantLigneHt * ($tauxRemise / 100);
                $montantLigneHtApresRemise = $montantLigneHt - $remiseLigne;
                $tvaLigne = $montantLigneHtApresRemise * ($tauxTva / 100);
                $montantLigneTtc = $montantLigneHtApresRemise + $tvaLigne;

                $montantHt += $montantLigneHt;
                $montantTva += $tvaLigne;
                $montantTtc += $montantLigneTtc;
                $montantRemise += $remiseLigne;

                $lignesData[] = [
                    'produit_id' => $ligne->produit_id,
                    'code_produit' => $ligne->code_produit,
                    'nom_produit' => $ligne->nom_produit,
                    'description' => $ligne->description,
                    'quantite' => $quantite,
                    'prix_unitaire_ht' => $prixHt,
                    'taux_remise' => $tauxRemise,
                    'montant_remise' => $remiseLigne,
                    'montant_ht' => $montantLigneHt,
                    'montant_tva' => $tvaLigne,
                    'montant_ttc' => $montantLigneTtc,
                    'taux_tva' => $tauxTva,
                    'compte_comptable' => '411',
                    'compte_tva' => '4457',
                ];
            }

            // Créer l'écriture comptable (facture)
            $ecriture = \App\Models\EcritureComptable::create([
                'reference' => $reference,
                'numero_facture' => $numeroFacture,
                'partenaire_id' => $commande->partenaire_id,
                'type' => 'facture_client',
                'date_emission' => now()->toDateString(),
                'date_echeance' => now()->addDays(30)->toDateString(),
                'montant_ht' => $montantHt,
                'montant_tva' => $montantTva,
                'montant_ttc' => $montantTtc,
                'montant_remise' => $montantRemise,
                'montant_paye' => 0,
                'montant_restant' => $montantTtc,
                'commande_vente_id' => $commande->id,
                'statut' => 'brouillon',
                'notes' => "Facture générée depuis la commande {$commande->reference}",
                'adresse_facturation' => $commande->adresse_facturation,
                'adresse_livraison' => $commande->adresse_livraison,
                'cree_par_utilisateur_id' => auth()->id(),
                'actif' => true,
            ]);

            // Créer les lignes de facture
            foreach ($lignesData as $ligneData) {
                \App\Models\LigneEcritureComptable::create(array_merge(
                    $ligneData,
                    ['ecriture_comptable_id' => $ecriture->id]
                ));
            }

            DB::commit();

            $ecriture->load(['partenaire', 'lignes']);

            $this->logActivity('generer_facture', 'CommandeVente', $commande->id, "Génération facture {$ecriture->reference} depuis commande {$commande->reference}");

            return response()->json([
                'success' => true,
                'data' => $ecriture,
                'message' => 'Facture générée avec succès'
            ], 201);

        } catch (ModelNotFoundException $e) {
            DB::rollBack();
            return response()->json([
                'success' => false,
                'message' => 'Commande non trouvée'
            ], 404);

        } catch (Exception $e) {
            DB::rollBack();
            return response()->json([
                'success' => false,
                'message' => 'Erreur lors de la génération de la facture',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Supprimer une ligne de commande
     */
    public function supprimerLigne($commandeId, $ligneId)
    {
        try {
            DB::beginTransaction();

            $commande = CommandeVente::findOrFail($commandeId);

            if (in_array($commande->etat, ['termine', 'annule'])) {
                return response()->json([
                    'success' => false,
                    'message' => 'Impossible de supprimer des lignes d\'une commande terminée ou annulée'
                ], 422);
            }

            $ligne = LigneCommandeVente::where('id', $ligneId)
                                       ->where('commande_vente_id', $commandeId)
                                       ->firstOrFail();
            $ligne->delete();

            // Recalculer les totaux
            $this->recalculerTotaux($commandeId);

            DB::commit();

            $commande->load(['partenaire', 'lignes.produit']);

            return response()->json([
                'success' => true,
                'commande' => $commande,
                'message' => 'Ligne supprimée avec succès'
            ], 200);

        } catch (ModelNotFoundException $e) {
            DB::rollBack();
            return response()->json([
                'success' => false,
                'message' => 'Commande ou ligne non trouvée'
            ], 404);

        } catch (Exception $e) {
            DB::rollBack();
            return response()->json([
                'success' => false,
                'message' => 'Erreur lors de la suppression de la ligne',
                'error' => $e->getMessage()
            ], 500);
        }
    }
}