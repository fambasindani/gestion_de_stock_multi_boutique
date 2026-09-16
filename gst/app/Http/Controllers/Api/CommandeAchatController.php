<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\CommandeAchat;
use App\Models\LigneCommandeAchat;
use App\Models\VarianteProduit;
use App\Models\QuantiteStock;
use App\Models\LotTracabilite;
use App\Models\EmplacementStock;
use Illuminate\Http\Request;
use Illuminate\Database\Eloquent\ModelNotFoundException;
use Illuminate\Validation\ValidationException;
use Exception;
use DB;

class CommandeAchatController extends Controller
{
    /**
     * Liste des commandes d'achat avec recherche, filtres et pagination
     */
    public function index(Request $request)
    {
        try {
            $query = CommandeAchat::with(['partenaire', 'lignes']);

            // Recherche
            if ($request->filled('search')) {
                $search = $request->search;
                $query->where(function($q) use ($search) {
                    $q->where('reference', 'LIKE', "%{$search}%")
                      ->orWhere('reference_commande_fournisseur', 'LIKE', "%{$search}%")
                      ->orWhereHas('partenaire', function($sub) use ($search) {
                          $sub->where('nom', 'LIKE', "%{$search}%");
                      });
                });
            }

            // Filtre par fournisseur
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
                'message' => 'Liste des commandes d\'achat récupérée avec succès'
            ], 200);

        } catch (Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Erreur lors de la récupération des commandes d\'achat',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Voir une commande d'achat spécifique
     */
    public function show($id)
    {
        try {
            $commande = CommandeAchat::with([
                'partenaire',
                'lignes.produit',
                'creePar',
                'modifiePar'
            ])->findOrFail($id);

            return response()->json([
                'success' => true,
                'data' => $commande,
                'message' => 'Commande d\'achat récupérée avec succès'
            ], 200);

        } catch (ModelNotFoundException $e) {
            return response()->json([
                'success' => false,
                'message' => 'Commande d\'achat non trouvée'
            ], 404);

        } catch (Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Erreur lors de la récupération de la commande d\'achat',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Créer une nouvelle commande d'achat
     */
    public function store(Request $request)
    {
        try {
            DB::beginTransaction();

            $validated = $request->validate([
                'partenaire_id' => 'required|exists:partenaire,id',
                'date_commande' => 'required|date',
                'date_livraison_prevue' => 'nullable|date',
                'mode_paiement' => 'nullable|string|max:50',
                'reference_commande_fournisseur' => 'nullable|string|max:100',
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
                'lignes.*.date_livraison_prevue' => 'nullable|date',
                'lignes.*.notes' => 'nullable|string',
            ]);

            // Génération de la référence
            $lastCommande = CommandeAchat::latest('id')->first();
            $numero = $lastCommande ? intval(substr($lastCommande->reference, -5)) + 1 : 1;
            $reference = 'PO-' . date('Y') . '-' . str_pad($numero, 5, '0', STR_PAD_LEFT);

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
            $commande = CommandeAchat::create([
                'reference' => $reference,
                'partenaire_id' => $validated['partenaire_id'],
                'date_commande' => $validated['date_commande'],
                'date_livraison_prevue' => $validated['date_livraison_prevue'] ?? null,
                'mode_paiement' => $validated['mode_paiement'] ?? null,
                'reference_commande_fournisseur' => $validated['reference_commande_fournisseur'] ?? null,
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

                LigneCommandeAchat::create([
                    'commande_achat_id' => $commande->id,
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
                    'date_livraison_prevue' => $ligneData['date_livraison_prevue'] ?? null,
                    'notes' => $ligneData['notes'] ?? null,
                ]);
            }

            DB::commit();

            $commande->load(['partenaire', 'lignes.produit']);

            $this->logActivity('create', 'CommandeAchat', $commande->id, "Création commande achat {$commande->reference}");

            return response()->json([
                'success' => true,
                'data' => $commande,
                'message' => 'Commande d\'achat créée avec succès'
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
                'message' => 'Erreur lors de la création de la commande d\'achat',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Mettre à jour une commande d'achat
     */
    public function update(Request $request, $id)
    {
        try {
            DB::beginTransaction();

            $commande = CommandeAchat::findOrFail($id);

            // Vérifier si la commande peut être modifiée
            if (in_array($commande->etat, ['termine', 'annule'])) {
                return response()->json([
                    'success' => false,
                    'message' => 'Les commandes terminées ou annulées ne peuvent pas être modifiées'
                ], 422);
            }

            $validated = $request->validate([
                'date_livraison_prevue' => 'nullable|date',
                'mode_paiement' => 'nullable|string|max:50',
                'reference_commande_fournisseur' => 'nullable|string|max:100',
                'notes' => 'nullable|string',
                'adresse_livraison' => 'nullable|string',
                'adresse_facturation' => 'nullable|string',
                'frais_livraison' => 'nullable|numeric|min:0',
                'taux_remise' => 'nullable|numeric|min:0|max:100',
                'etat' => 'nullable|in:brouillon,confirme,envoye,recu,termine,annule',
                'lignes' => 'nullable|array',
                'lignes.*.id' => 'nullable|exists:ligne_commande_achat,id',
                'lignes.*.produit_id' => 'required|exists:variante_produit,id',
                'lignes.*.quantite' => 'required|numeric|min:1',
                'lignes.*.prix_unitaire_ht' => 'required|numeric|min:0',
                'lignes.*.taux_remise' => 'nullable|numeric|min:0|max:100',
                'lignes.*.taux_tva' => 'nullable|numeric|min:0|max:100',
                'lignes.*.date_livraison_prevue' => 'nullable|date',
                'lignes.*.notes' => 'nullable|string',
            ]);

            // Mise à jour des champs de la commande
            if (isset($validated['date_livraison_prevue'])) $commande->date_livraison_prevue = $validated['date_livraison_prevue'];
            if (isset($validated['mode_paiement'])) $commande->mode_paiement = $validated['mode_paiement'];
            if (isset($validated['reference_commande_fournisseur'])) $commande->reference_commande_fournisseur = $validated['reference_commande_fournisseur'];
            if (isset($validated['notes'])) $commande->notes = $validated['notes'];
            if (isset($validated['adresse_livraison'])) $commande->adresse_livraison = $validated['adresse_livraison'];
            if (isset($validated['adresse_facturation'])) $commande->adresse_facturation = $validated['adresse_facturation'];
            if (isset($validated['frais_livraison'])) $commande->frais_livraison = $validated['frais_livraison'];
            if (isset($validated['taux_remise'])) $commande->taux_remise = $validated['taux_remise'];

            // Mise à jour de l'état
            if (isset($validated['etat'])) {
                if ($validated['etat'] === 'recu' || $validated['etat'] === 'termine') {
                    $commande->date_livraison_reelle = now()->toDateString();
                }
                $commande->etat = $validated['etat'];
            }

            $commande->modifie_par_utilisateur_id = auth()->id();
            $commande->save();

            // Mise à jour des lignes
            if (isset($validated['lignes'])) {
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
                        'date_livraison_prevue' => $ligneData['date_livraison_prevue'] ?? null,
                        'notes' => $ligneData['notes'] ?? null,
                    ];

                    if (!empty($ligneData['id'])) {
                        $ligne = LigneCommandeAchat::where('id', $ligneData['id'])
                                                   ->where('commande_achat_id', $commande->id)
                                                   ->first();
                        if ($ligne) {
                            $ligne->update($ligneDataFormatted);
                            $updatedIds[] = $ligne->id;
                        }
                    } else {
                        $newLigne = LigneCommandeAchat::create(array_merge(
                            $ligneDataFormatted,
                            ['commande_achat_id' => $commande->id]
                        ));
                        $updatedIds[] = $newLigne->id;
                    }
                }

                $toDelete = array_diff($existingIds, $updatedIds);
                if (!empty($toDelete)) {
                    LigneCommandeAchat::whereIn('id', $toDelete)->delete();
                }

                $this->recalculerTotaux($commande->id);
            }

            DB::commit();

            $commande->load(['partenaire', 'lignes.produit']);

            $this->logActivity('update', 'CommandeAchat', $commande->id, "Modification commande achat {$commande->reference}");

            return response()->json([
                'success' => true,
                'data' => $commande,
                'message' => 'Commande d\'achat modifiée avec succès'
            ], 200);

        } catch (ModelNotFoundException $e) {
            DB::rollBack();
            return response()->json([
                'success' => false,
                'message' => 'Commande d\'achat non trouvée'
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
                'message' => 'Erreur lors de la modification de la commande d\'achat',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Supprimer une commande d'achat
     */
    public function destroy($id)
    {
        try {
            DB::beginTransaction();

            $commande = CommandeAchat::findOrFail($id);

            if (!in_array($commande->etat, ['brouillon', 'annule'])) {
                return response()->json([
                    'success' => false,
                    'message' => 'Seules les commandes en brouillon ou annulées peuvent être supprimées'
                ], 422);
            }

            $commande->delete();

            DB::commit();

            $this->logActivity('delete', 'CommandeAchat', $id, "Suppression commande achat #{$id}");

            return response()->json([
                'success' => true,
                'message' => 'Commande d\'achat supprimée avec succès'
            ], 200);

        } catch (ModelNotFoundException $e) {
            DB::rollBack();
            return response()->json([
                'success' => false,
                'message' => 'Commande d\'achat non trouvée'
            ], 404);

        } catch (Exception $e) {
            DB::rollBack();
            return response()->json([
                'success' => false,
                'message' => 'Erreur lors de la suppression de la commande d\'achat',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Recalculer les totaux d'une commande d'achat
     */
    private function recalculerTotaux($commandeId)
    {
        $commande = CommandeAchat::find($commandeId);
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
     * Changer l'état d'une commande d'achat
     */
    public function changerEtat(Request $request, $id)
    {
        try {
            $commande = CommandeAchat::findOrFail($id);

            $oldEtat = $commande->getOriginal('etat');

            $validated = $request->validate([
                'etat' => 'required|in:confirme,envoye,recu,termine,annule',
                'notes' => 'nullable|string',
            ]);

            $transitions = [
                'brouillon' => ['confirme', 'annule'],
                'confirme' => ['envoye', 'annule'],
                'envoye' => ['recu', 'annule'],
                'recu' => ['termine', 'annule'],
                'termine' => ['annule'],
                'annule' => [],
            ];

            if (!in_array($validated['etat'], $transitions[$commande->etat] ?? [])) {
                return response()->json([
                    'success' => false,
                    'message' => "Transition d'état impossible de {$commande->etat} à {$validated['etat']}"
                ], 422);
            }

            if (in_array($validated['etat'], ['recu', 'termine'])) {
                $commande->date_livraison_reelle = now()->toDateString();

                if (!in_array($commande->etat, ['recu', 'termine'])) {
                    $emplacementDefaut = EmplacementStock::where('usage', 'interne')->orderBy('id')->first() ?? EmplacementStock::orderBy('id')->first();
                    $commande->load('lignes');
                    foreach ($commande->lignes as $ligne) {
                        $restant = $ligne->quantite - $ligne->quantite_recue;
                        if ($restant <= 0) continue;

                        $stock = QuantiteStock::firstOrNew([
                            'produit_id' => $ligne->produit_id,
                            'emplacement_id' => $emplacementDefaut ? $emplacementDefaut->id : 1,
                            'lot_id' => null,
                        ]);
                        $stock->quantite_disponible = ($stock->quantite_disponible ?? 0) + $restant;
                        $stock->date_dernier_mouvement = now()->toDateString();
                        if (!$stock->exists) { $stock->quantite_reservee = 0; $stock->quantite_commande = 0; $stock->quantite_controlee = 0; }
                        $stock->save();

                        $ligne->quantite_recue += $restant;
                        $ligne->save();
                    }
                }
            }

            $commande->etat = $validated['etat'];
            $commande->notes = $request->notes ?? $commande->notes;
            $commande->modifie_par_utilisateur_id = auth()->id();
            $commande->save();

            $commande->load(['partenaire', 'lignes.produit']);

            $this->logActivity('changer_etat', 'CommandeAchat', $commande->id, "Changement état commande achat {$commande->reference}: {$oldEtat} → {$commande->etat}");

            return response()->json([
                'success' => true,
                'data' => $commande,
                'message' => "Commande d'achat passée à l'état: " . $commande->etat_label
            ], 200);

        } catch (ModelNotFoundException $e) {
            return response()->json([
                'success' => false,
                'message' => 'Commande d\'achat non trouvée'
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
     * Ajouter une ligne à une commande d'achat
     */
    public function ajouterLigne(Request $request, $id)
    {
        try {
            DB::beginTransaction();

            $commande = CommandeAchat::findOrFail($id);

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
                'date_livraison_prevue' => 'nullable|date',
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

            $ligne = LigneCommandeAchat::create([
                'commande_achat_id' => $commande->id,
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
                'date_livraison_prevue' => $validated['date_livraison_prevue'] ?? null,
                'notes' => $validated['notes'] ?? null,
            ]);

            $this->recalculerTotaux($commande->id);

            DB::commit();

            $commande->load(['partenaire', 'lignes.produit']);

            $this->logActivity('update', 'CommandeAchat', $commande->id, "Ajout de lignes à la commande achat {$commande->reference}");

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
                'message' => 'Commande d\'achat non trouvée'
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
     * Supprimer une ligne de commande d'achat
     */
    public function supprimerLigne($commandeId, $ligneId)
    {
        try {
            DB::beginTransaction();

            $commande = CommandeAchat::findOrFail($commandeId);

            if (in_array($commande->etat, ['termine', 'annule'])) {
                return response()->json([
                    'success' => false,
                    'message' => 'Impossible de supprimer des lignes d\'une commande terminée ou annulée'
                ], 422);
            }

            $ligne = LigneCommandeAchat::where('id', $ligneId)
                                       ->where('commande_achat_id', $commandeId)
                                       ->firstOrFail();
            $ligne->delete();

            $this->recalculerTotaux($commandeId);

            DB::commit();

            $commande->load(['partenaire', 'lignes.produit']);

            $this->logActivity('update', 'CommandeAchat', $commande->id, "Suppression de lignes de la commande achat {$commande->reference}");

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

    /**
     * Enregistrer la réception d'une commande
     */
    public function receptionner(Request $request, $id)
    {
        try {
            DB::beginTransaction();

            $commande = CommandeAchat::findOrFail($id);

            if (!in_array($commande->etat, ['envoye', 'recu'])) {
                return response()->json([
                    'success' => false,
                    'message' => 'Seules les commandes envoyées ou partiellement reçues peuvent être réceptionnées'
                ], 422);
            }

            $validated = $request->validate([
                'lignes' => 'required|array|min:1',
                'lignes.*.id' => 'required|exists:ligne_commande_achat,id',
                'lignes.*.quantite_recue' => 'required|numeric|min:0',
                'lignes.*.lot' => 'nullable|array',
                'lignes.*.lot.nom' => 'required_with:lignes.*.lot|string|max:255',
                'lignes.*.lot.code' => 'nullable|string|max:100',
                'lignes.*.lot.type' => 'required_with:lignes.*.lot|in:lot,serie',
                'lignes.*.lot.date_production' => 'nullable|date',
                'lignes.*.lot.date_peremption' => 'nullable|date',
                'lignes.*.lot.fournisseur' => 'nullable|string|max:255',
                'lignes.*.lot.reference_fournisseur' => 'nullable|string|max:255',
                'lignes.*.lot.notes' => 'nullable|string',
            ]);

            $totalRecu = 0;
            $totalQuantite = 0;

            foreach ($validated['lignes'] as $ligneData) {
                $ligne = LigneCommandeAchat::where('id', $ligneData['id'])
                                           ->where('commande_achat_id', $commande->id)
                                           ->first();

                if (!$ligne) {
                    return response()->json([
                        'success' => false,
                        'message' => 'Ligne non trouvée dans cette commande'
                    ], 404);
                }

                $quantiteRecue = $ligneData['quantite_recue'];
                $quantiteRestante = $ligne->quantite - $ligne->quantite_recue;

                if ($quantiteRecue > $quantiteRestante) {
                    return response()->json([
                        'success' => false,
                        'message' => "Quantité reçue ($quantiteRecue) supérieure à la quantité restante ($quantiteRestante) pour le produit: {$ligne->nom_produit}"
                    ], 422);
                }

                $ligne->quantite_recue += $quantiteRecue;
                $ligne->save();

                $totalRecu += $ligne->quantite_recue;
                $totalQuantite += $ligne->quantite;
            }

            // Mettre à jour le stock
            $emplacementDefaut = EmplacementStock::where('usage', 'interne')->orderBy('id')->first();
            if (!$emplacementDefaut) {
                $emplacementDefaut = EmplacementStock::orderBy('id')->first();
            }

            foreach ($validated['lignes'] as $ligneData) {
                $ligne = LigneCommandeAchat::find($ligneData['id']);
                if (!$ligne || $ligneData['quantite_recue'] <= 0) continue;

                $lotId = null;

                // Créer un lot si demandé
                if (!empty($ligneData['lot'])) {
                    $lotData = $ligneData['lot'];
                    $prefix = ($lotData['type'] ?? 'lot') === 'serie' ? 'SER-' : 'LOT-';
                    $lastLot = LotTracabilite::where('code', 'LIKE', $prefix . '%')
                                             ->orderBy('id', 'desc')
                                             ->first();
                    $nextNumber = $lastLot ? intval(substr($lastLot->code, -6)) + 1 : 1;
                    $code = !empty($lotData['code']) ? $lotData['code'] : $prefix . str_pad($nextNumber, 6, '0', STR_PAD_LEFT);

                    $lot = LotTracabilite::create([
                        'nom' => $lotData['nom'],
                        'code' => $code,
                        'produit_id' => $ligne->produit_id,
                        'type' => $lotData['type'] ?? 'lot',
                        'date_production' => $lotData['date_production'] ?? null,
                        'date_peremption' => $lotData['date_peremption'] ?? null,
                        'date_reception' => now()->toDateString(),
                        'fournisseur' => $lotData['fournisseur'] ?? $commande->partenaire->nom ?? null,
                        'reference_fournisseur' => $lotData['reference_fournisseur'] ?? null,
                        'quantite_initiale' => $ligneData['quantite_recue'],
                        'quantite_actuelle' => $ligneData['quantite_recue'],
                        'quantite_reservee' => 0,
                        'statut' => 'actif',
                        'notes' => $lotData['notes'] ?? null,
                        'cree_par_utilisateur_id' => auth()->id(),
                        'actif' => true,
                    ]);
                    $lotId = $lot->id;
                }

                $stock = QuantiteStock::firstOrNew([
                    'produit_id' => $ligne->produit_id,
                    'emplacement_id' => $emplacementDefaut ? $emplacementDefaut->id : 1,
                    'lot_id' => $lotId,
                ]);

                $stock->quantite_disponible = ($stock->quantite_disponible ?? 0) + $ligneData['quantite_recue'];
                $stock->date_dernier_mouvement = now()->toDateString();
                if (!$stock->exists) {
                    $stock->quantite_reservee = 0;
                    $stock->quantite_commande = 0;
                    $stock->quantite_controlee = 0;
                }
                $stock->save();

                // Mettre à jour le lot si la ligne en référence un
                if ($ligne->lot_id) {
                    $lot = LotTracabilite::find($ligne->lot_id);
                    if ($lot) {
                        $lot->quantite_actuelle += $ligneData['quantite_recue'];
                        if ($lot->statut === 'epuise' && $lot->quantite_actuelle > 0) {
                            $lot->statut = 'actif';
                        }
                        $lot->save();
                    }
                }
            }

            // Mettre à jour l'état de la commande
            if ($totalRecu >= $totalQuantite) {
                $commande->etat = 'termine';
            } else {
                $commande->etat = 'recu';
            }

            $commande->date_livraison_reelle = now()->toDateString();
            $commande->modifie_par_utilisateur_id = auth()->id();
            $commande->save();

            DB::commit();

            $commande->load(['partenaire', 'lignes.produit']);

            $this->logActivity('receptionner', 'CommandeAchat', $commande->id, "Réception commande achat {$commande->reference}");

            return response()->json([
                'success' => true,
                'data' => $commande,
                'message' => 'Réception enregistrée avec succès'
            ], 200);

        } catch (ModelNotFoundException $e) {
            DB::rollBack();
            return response()->json([
                'success' => false,
                'message' => 'Commande d\'achat non trouvée'
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
                'message' => 'Erreur lors de la réception',
                'error' => $e->getMessage()
            ], 500);
        }
    }
}