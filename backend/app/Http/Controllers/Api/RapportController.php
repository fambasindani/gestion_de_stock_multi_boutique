<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\LigneOperationStock;
use App\Models\QuantiteStock;
use App\Models\VarianteProduit;
use App\Models\ProduitModele;
use App\Models\CommandeVente;
use App\Models\LigneCommandeVente;
use App\Models\CommandeAchat;
use App\Models\LigneCommandeAchat;
use App\Models\Utilisateur;
use App\Models\EcritureComptable;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Exception;

class RapportController extends Controller
{
    public function ventes(Request $request)
    {
        try {
            $request->validate([
                'date_debut' => 'nullable|date',
                'date_fin' => 'nullable|date|after_or_equal:date_debut',
                'partenaire_id' => 'nullable|exists:partenaires,id',
            ]);

            $query = LigneCommandeVente::query()
                ->select(
                    'produit_id',
                    DB::raw('SUM(quantite) as total_quantite'),
                    DB::raw('SUM(montant_total_ht) as total_montant_ht'),
                    DB::raw('COUNT(DISTINCT commande_vente_id) as nombre_commandes')
                )
                ->with('produit.modele.categorie')
                ->whereHas('commande', function ($q) {
                    $q->whereNotIn('etat', ['brouillon', 'annule']);
                });

            if ($request->filled('date_debut')) {
                $query->whereHas('commande', function ($q) use ($request) {
                    $q->whereDate('date_commande', '>=', $request->date_debut);
                });
            }
            if ($request->filled('date_fin')) {
                $query->whereHas('commande', function ($q) use ($request) {
                    $q->whereDate('date_commande', '<=', $request->date_fin);
                });
            }
            if ($request->filled('partenaire_id')) {
                $query->whereHas('commande', function ($q) use ($request) {
                    $q->where('partenaire_id', $request->partenaire_id);
                });
            }

            $query->groupBy('produit_id');

            $lignes = $query->get();

            $totaux = [
                'total_quantite' => $lignes->sum('total_quantite'),
                'total_montant_ht' => $lignes->sum('total_montant_ht'),
                'nombre_commandes' => $lignes->sum('nombre_commandes'),
            ];

            return response()->json([
                'success' => true,
                'data' => ['lignes' => $lignes, 'totaux' => $totaux],
                'message' => 'Rapport des ventes généré avec succès'
            ]);
        } catch (Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Erreur lors de la génération du rapport',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    public function achats(Request $request)
    {
        try {
            $request->validate([
                'date_debut' => 'nullable|date',
                'date_fin' => 'nullable|date|after_or_equal:date_debut',
                'partenaire_id' => 'nullable|exists:partenaires,id',
            ]);

            $query = LigneCommandeAchat::query()
                ->select(
                    'produit_id',
                    DB::raw('SUM(quantite) as total_quantite'),
                    DB::raw('SUM(montant_total_ht) as total_montant_ht'),
                    DB::raw('COUNT(DISTINCT commande_achat_id) as nombre_commandes')
                )
                ->with('produit.modele.categorie')
                ->whereHas('commande', function ($q) {
                    $q->whereNotIn('etat', ['brouillon', 'annule']);
                });

            if ($request->filled('date_debut')) {
                $query->whereHas('commande', function ($q) use ($request) {
                    $q->whereDate('date_commande', '>=', $request->date_debut);
                });
            }
            if ($request->filled('date_fin')) {
                $query->whereHas('commande', function ($q) use ($request) {
                    $q->whereDate('date_commande', '<=', $request->date_fin);
                });
            }
            if ($request->filled('partenaire_id')) {
                $query->whereHas('commande', function ($q) use ($request) {
                    $q->where('partenaire_id', $request->partenaire_id);
                });
            }

            $query->groupBy('produit_id');

            $lignes = $query->get();

            $totaux = [
                'total_quantite' => $lignes->sum('total_quantite'),
                'total_montant_ht' => $lignes->sum('total_montant_ht'),
                'nombre_commandes' => $lignes->sum('nombre_commandes'),
            ];

            return response()->json([
                'success' => true,
                'data' => ['lignes' => $lignes, 'totaux' => $totaux],
                'message' => 'Rapport des achats généré avec succès'
            ]);
        } catch (Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Erreur lors de la génération du rapport',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    public function mouvements(Request $request)
    {
        try {
            $request->validate([
                'date_debut' => 'nullable|date',
                'date_fin' => 'nullable|date|after_or_equal:date_debut',
                'categorie_id' => 'nullable|exists:categorie_produit,id',
                'type_operation' => 'nullable|in:prelevement,reception,scan',
            ]);

            $query = LigneOperationStock::query()
                ->select(
                    'produit_id',
                    DB::raw("SUM(CASE WHEN type_operation = 'reception' THEN quantite_traitee ELSE 0 END) as total_entree"),
                    DB::raw("SUM(CASE WHEN type_operation = 'prelevement' THEN quantite_traitee ELSE 0 END) as total_sortie"),
                    DB::raw("COUNT(*) as nombre_operations")
                )
                ->with('produit.modele.categorie');

            if ($request->filled('date_debut')) {
                $query->whereDate('date_operation', '>=', $request->date_debut);
            }
            if ($request->filled('date_fin')) {
                $query->whereDate('date_operation', '<=', $request->date_fin);
            }
            if ($request->filled('type_operation') && $request->type_operation !== 'all') {
                $query->where('type_operation', $request->type_operation);
            }

            $query->groupBy('produit_id');

            $mouvements = $query->get();

            $mouvements->each(function ($item) {
                $item->solde = $item->total_entree - $item->total_sortie;
                $produit = $item->produit;
                if ($produit) {
                    $stockActuel = QuantiteStock::where('produit_id', $item->produit_id)
                        ->sum('quantite_disponible');
                    $item->stock_actuel = $stockActuel;
                    $item->valeur_stock = $stockActuel * ($produit->prix_achat ?? 0);
                    $item->valeur_entree = $item->total_entree * ($produit->prix_achat ?? 0);
                    $item->valeur_sortie = $item->total_sortie * ($produit->prix_achat ?? 0);
                }
            });

            $totaux = [
                'total_entree' => $mouvements->sum('total_entree'),
                'total_sortie' => $mouvements->sum('total_sortie'),
                'solde' => $mouvements->sum('solde'),
                'valeur_stock' => $mouvements->sum('valeur_stock'),
                'valeur_entree' => $mouvements->sum('valeur_entree'),
                'valeur_sortie' => $mouvements->sum('valeur_sortie'),
                'nombre_operations' => $mouvements->sum('nombre_operations'),
            ];

            if ($request->filled('categorie_id')) {
                $categorieId = $request->categorie_id;
                $mouvements = $mouvements->filter(function ($item) use ($categorieId) {
                    return $item->produit &&
                        $item->produit->modele &&
                        $item->produit->modele->categorie_id == $categorieId;
                })->values();
            }

            return response()->json([
                'success' => true,
                'data' => [
                    'lignes' => $mouvements,
                    'totaux' => $totaux,
                ],
                'message' => 'Rapport des mouvements généré avec succès'
            ]);
        } catch (Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Erreur lors de la génération du rapport',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Chiffre d'affaires par client ou par fournisseur (factures)
     */
    public function caPartenaires(Request $request)
    {
        try {
            $request->validate([
                'type' => 'required|in:client,fournisseur',
                'date_debut' => 'nullable|date',
                'date_fin' => 'nullable|date|after_or_equal:date_debut',
            ]);

            $typeFacture = $request->type === 'fournisseur' ? 'facture_fournisseur' : 'facture_client';

            $query = EcritureComptable::with('partenaire:id,nom')
                ->where('type', $typeFacture)
                ->where('statut', '!=', 'annulee')
                ->select(
                    'partenaire_id',
                    \DB::raw('COUNT(*) as nombre_factures'),
                    \DB::raw('COALESCE(SUM(montant_ht),0) as total_ht'),
                    \DB::raw('COALESCE(SUM(montant_ttc),0) as total_ttc'),
                    \DB::raw('COALESCE(SUM(montant_restant),0) as total_impaye')
                )
                ->groupBy('partenaire_id')
                ->orderByDesc('total_ttc');

            if ($request->filled('date_debut')) {
                $query->whereDate('date_emission', '>=', $request->date_debut);
            }
            if ($request->filled('date_fin')) {
                $query->whereDate('date_emission', '<=', $request->date_fin);
            }

            $rows = $query->get();

            $lignes = $rows->map(function ($r) {
                return [
                    'partenaire_id' => $r->partenaire_id,
                    'partenaire' => $r->partenaire->nom ?? 'N/A',
                    'nombre_factures' => (int) $r->nombre_factures,
                    'total_ht' => round((float) $r->total_ht, 2),
                    'total_ttc' => round((float) $r->total_ttc, 2),
                    'total_impaye' => round((float) $r->total_impaye, 2),
                ];
            })->values();

            return response()->json([
                'success' => true,
                'data' => [
                    'type' => $request->type,
                    'lignes' => $lignes,
                    'totaux' => [
                        'nombre_partenaires' => $lignes->count(),
                        'nombre_factures' => (int) $rows->sum('nombre_factures'),
                        'total_ht' => round((float) $rows->sum('total_ht'), 2),
                        'total_ttc' => round((float) $rows->sum('total_ttc'), 2),
                        'total_impaye' => round((float) $rows->sum('total_impaye'), 2),
                    ],
                ],
                'message' => 'Rapport généré avec succès',
            ], 200);

        } catch (Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Erreur lors de la génération du rapport',
                'error' => $e->getMessage(),
            ], 500);
        }
    }

    /**
     * Variations des prix d'achat par produit (sur une période)
     */
    public function variationsPrix(Request $request)
    {
        try {
            $request->validate([
                'date_debut' => 'nullable|date',
                'date_fin' => 'nullable|date|after_or_equal:date_debut',
                'produit_id' => 'nullable|exists:variante_produit,id',
            ]);

            $query = LigneCommandeAchat::query()
                ->join('commande_achat', 'ligne_commande_achat.commande_achat_id', '=', 'commande_achat.id')
                ->leftJoin('variante_produit', 'ligne_commande_achat.produit_id', '=', 'variante_produit.id')
                ->whereNotIn('commande_achat.etat', ['brouillon', 'annule'])
                ->select(
                    'ligne_commande_achat.produit_id',
                    'ligne_commande_achat.nom_produit',
                    'variante_produit.code_interne',
                    'commande_achat.date_commande',
                    'ligne_commande_achat.prix_unitaire_ht'
                );

            if ($request->filled('date_debut')) {
                $query->whereDate('commande_achat.date_commande', '>=', $request->date_debut);
            }
            if ($request->filled('date_fin')) {
                $query->whereDate('commande_achat.date_commande', '<=', $request->date_fin);
            }
            if ($request->filled('produit_id')) {
                $query->where('ligne_commande_achat.produit_id', $request->produit_id);
            }

            $rows = $query->orderBy('commande_achat.date_commande')->get();

            $lignes = $rows->groupBy('produit_id')->map(function ($group, $produitId) {
                $prix = $group->pluck('prix_unitaire_ht')->map(fn ($p) => (float) $p);
                $premier = $prix->first();
                $dernier = $prix->last();
                $variation = $premier > 0 ? round((($dernier - $premier) / $premier) * 100, 2) : 0;

                return [
                    'produit_id' => (int) $produitId,
                    'produit' => $group->first()->nom_produit,
                    'code' => $group->first()->code_interne,
                    'nombre_achats' => $group->count(),
                    'prix_min' => round($prix->min(), 2),
                    'prix_max' => round($prix->max(), 2),
                    'premier_prix' => round($premier, 2),
                    'dernier_prix' => round($dernier, 2),
                    'variation_pct' => $variation,
                    'tendance' => $variation > 0 ? 'hausse' : ($variation < 0 ? 'baisse' : 'stable'),
                ];
            })->sortByDesc(fn ($l) => abs($l['variation_pct']))->values();

            return response()->json([
                'success' => true,
                'data' => [
                    'lignes' => $lignes,
                    'totaux' => [
                        'nombre_produits' => $lignes->count(),
                        'en_hausse' => $lignes->where('tendance', 'hausse')->count(),
                        'en_baisse' => $lignes->where('tendance', 'baisse')->count(),
                        'stables' => $lignes->where('tendance', 'stable')->count(),
                    ],
                ],
                'message' => 'Rapport des variations de prix généré avec succès',
            ], 200);

        } catch (Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Erreur lors de la génération du rapport',
                'error' => $e->getMessage(),
            ], 500);
        }
    }

    /**
     * Produits en rupture de stock (quantité <= 0)
     */
    public function ruptureStock(Request $request)
    {
        return $this->rapportSeuils($request, 'rupture');
    }

    /**
     * Produits en stock bas (0 < quantité <= seuil minimum)
     */
    public function stockBas(Request $request)
    {
        return $this->rapportSeuils($request, 'bas');
    }

    private function rapportSeuils(Request $request, string $mode)
    {
        try {
            $query = QuantiteStock::with(['produit.modele.categorie', 'emplacement']);

            if ($mode === 'rupture') {
                $query->where('quantite_disponible', '<=', 0);
            } else {
                $query->where('quantite_disponible', '>', 0)
                      ->whereNotNull('seuil_minimum')
                      ->whereRaw('quantite_disponible <= seuil_minimum');
            }

            if ($request->filled('emplacement_id')) {
                $query->where('emplacement_id', $request->emplacement_id);
            }

            $lignes = $query->orderBy('quantite_disponible')->get()->map(function ($s) {
                $produit = $s->produit;
                $seuil = $s->seuil_minimum !== null ? (float) $s->seuil_minimum : null;
                $qte = (float) $s->quantite_disponible;
                return [
                    'produit_id' => $s->produit_id,
                    'produit' => $produit->nom ?? $produit->modele->nom ?? ('#' . $s->produit_id),
                    'code' => $produit->code_interne ?? null,
                    'categorie' => $produit->modele->categorie->nom ?? null,
                    'emplacement' => $s->emplacement->nom ?? null,
                    'quantite' => round($qte, 2),
                    'seuil_minimum' => $seuil,
                    'manque' => $seuil !== null ? round(max(0, $seuil - $qte), 2) : null,
                    'valeur' => round($qte * (float) ($produit->prix_achat ?? 0), 2),
                ];
            })->values();

            $totaux = [
                'nombre_produits' => $lignes->count(),
                'quantite_totale' => round($lignes->sum('quantite'), 2),
                'manque_total' => round($lignes->sum('manque'), 2),
                'valeur_totale' => round($lignes->sum('valeur'), 2),
            ];

            return response()->json([
                'success' => true,
                'data' => ['lignes' => $lignes, 'totaux' => $totaux],
                'message' => 'Rapport généré avec succès',
            ], 200);

        } catch (Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Erreur lors de la génération du rapport',
                'error' => $e->getMessage(),
            ], 500);
        }
    }

    /**
     * Rapport des bons de commande (achats)
     */
    public function bonsCommande(Request $request)
    {
        try {
            $request->validate([
                'date_debut' => 'nullable|date',
                'date_fin' => 'nullable|date|after_or_equal:date_debut',
                'partenaire_id' => 'nullable|exists:partenaire,id',
                'etat' => 'nullable|string',
            ]);

            $query = CommandeAchat::with(['partenaire:id,nom'])->withCount('lignes');

            if ($request->filled('date_debut')) {
                $query->whereDate('date_commande', '>=', $request->date_debut);
            }
            if ($request->filled('date_fin')) {
                $query->whereDate('date_commande', '<=', $request->date_fin);
            }
            if ($request->filled('partenaire_id')) {
                $query->where('partenaire_id', $request->partenaire_id);
            }
            if ($request->filled('etat') && $request->etat !== 'all') {
                $query->where('etat', $request->etat);
            }

            $commandes = $query->orderBy('date_commande', 'desc')->orderBy('id', 'desc')->get();

            $lignes = $commandes->map(function ($c) {
                return [
                    'id' => $c->id,
                    'reference' => $c->reference,
                    'date_commande' => optional($c->date_commande)->format('Y-m-d'),
                    'fournisseur' => $c->partenaire->nom ?? '-',
                    'etat' => $c->etat,
                    'etat_label' => $c->etat_label,
                    'nombre_lignes' => $c->lignes_count ?? 0,
                    'total_ht' => round((float) $c->montant_total_ht, 2),
                    'total_ttc' => round((float) $c->montant_total_ttc, 2),
                ];
            })->values();

            $totaux = [
                'nombre_commandes' => $commandes->count(),
                'total_ht' => round((float) $commandes->sum('montant_total_ht'), 2),
                'total_ttc' => round((float) $commandes->sum('montant_total_ttc'), 2),
                'total_lignes' => $commandes->sum('lignes_count'),
            ];

            return response()->json([
                'success' => true,
                'data' => ['lignes' => $lignes, 'totaux' => $totaux],
                'message' => 'Rapport des bons de commande généré avec succès',
            ], 200);

        } catch (Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Erreur lors de la génération du rapport',
                'error' => $e->getMessage(),
            ], 500);
        }
    }

    /**
     * Ventes par vendeur (utilisateur) sur une période
     */
    public function ventesVendeurs(Request $request)
    {
        try {
            $request->validate([
                'date_debut' => 'nullable|date',
                'date_fin' => 'nullable|date|after_or_equal:date_debut',
                'utilisateur_id' => 'nullable|exists:utilisateurs,id',
            ]);

            $query = CommandeVente::with('creePar:id,nom,email')
                ->whereNotIn('etat', ['brouillon', 'annule']);

            if ($request->filled('date_debut')) {
                $query->whereDate('date_commande', '>=', $request->date_debut);
            }
            if ($request->filled('date_fin')) {
                $query->whereDate('date_commande', '<=', $request->date_fin);
            }
            if ($request->filled('utilisateur_id')) {
                $query->where('cree_par_utilisateur_id', $request->utilisateur_id);
            }

            $commandes = $query->get();

            $lignes = $commandes->groupBy('cree_par_utilisateur_id')->map(function ($group) {
                $user = $group->first()->creePar;
                return [
                    'utilisateur_id' => $user->id ?? null,
                    'vendeur' => $user->nom ?? 'Non attribué',
                    'email' => $user->email ?? '',
                    'nombre_ventes' => $group->count(),
                    'total_ht' => round($group->sum('montant_total_ht'), 2),
                    'total_remise' => round($group->sum('montant_remise'), 2),
                    'total_ttc' => round($group->sum('montant_total_ttc'), 2),
                ];
            })->sortByDesc('total_ttc')->values();

            $totaux = [
                'nombre_ventes' => $commandes->count(),
                'total_ht' => round($commandes->sum('montant_total_ht'), 2),
                'total_remise' => round($commandes->sum('montant_remise'), 2),
                'total_ttc' => round($commandes->sum('montant_total_ttc'), 2),
                'nombre_vendeurs' => $lignes->count(),
            ];

            return response()->json([
                'success' => true,
                'data' => ['lignes' => $lignes, 'totaux' => $totaux],
                'message' => 'Rapport des ventes par vendeur généré avec succès',
            ], 200);

        } catch (Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Erreur lors de la génération du rapport',
                'error' => $e->getMessage(),
            ], 500);
        }
    }

    /**
     * Détail des ventes d'un vendeur sur une période
     */
    public function ventesVendeurDetails(Request $request, $utilisateurId)
    {
        try {
            $request->validate([
                'date_debut' => 'nullable|date',
                'date_fin' => 'nullable|date|after_or_equal:date_debut',
            ]);

            $vendeur = Utilisateur::findOrFail($utilisateurId);

            $query = CommandeVente::with(['partenaire:id,nom', 'lignes'])
                ->where('cree_par_utilisateur_id', $utilisateurId)
                ->whereNotIn('etat', ['brouillon', 'annule']);

            if ($request->filled('date_debut')) {
                $query->whereDate('date_commande', '>=', $request->date_debut);
            }
            if ($request->filled('date_fin')) {
                $query->whereDate('date_commande', '<=', $request->date_fin);
            }

            $commandes = $query->orderBy('date_commande', 'desc')->orderBy('id', 'desc')->get();

            $lignes = $commandes->map(function ($c) {
                return [
                    'id' => $c->id,
                    'reference' => $c->reference,
                    'date_commande' => optional($c->date_commande)->format('Y-m-d'),
                    'client' => $c->partenaire->nom ?? ($c->client_nom ?? 'Comptoir'),
                    'etat' => $c->etat,
                    'mode_paiement' => $c->mode_paiement,
                    'nombre_articles' => $c->lignes->count(),
                    'total_ht' => round((float) $c->montant_total_ht, 2),
                    'total_remise' => round((float) $c->montant_remise, 2),
                    'total_ttc' => round((float) $c->montant_total_ttc, 2),
                ];
            })->values();

            $totaux = [
                'nombre_ventes' => $commandes->count(),
                'total_ht' => round((float) $commandes->sum('montant_total_ht'), 2),
                'total_remise' => round((float) $commandes->sum('montant_remise'), 2),
                'total_ttc' => round((float) $commandes->sum('montant_total_ttc'), 2),
            ];

            return response()->json([
                'success' => true,
                'data' => [
                    'vendeur' => [
                        'id' => $vendeur->id,
                        'nom' => $vendeur->nom,
                        'email' => $vendeur->email,
                    ],
                    'lignes' => $lignes,
                    'totaux' => $totaux,
                ],
                'message' => 'Détail des ventes du vendeur récupéré avec succès',
            ], 200);

        } catch (\Illuminate\Database\Eloquent\ModelNotFoundException $e) {
            return response()->json(['success' => false, 'message' => 'Vendeur non trouvé'], 404);
        } catch (Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Erreur lors de la génération du détail',
                'error' => $e->getMessage(),
            ], 500);
        }
    }

    public function stock(Request $request)
    {
        try {
            // NB : ne pas aliaser en "quantite_totale" (collision avec l'accesseur
            // getQuantiteTotaleAttribute du modèle QuantiteStock → renverrait 0).
            $query = QuantiteStock::query()
                ->select(
                    'produit_id',
                    'emplacement_id',
                    DB::raw('SUM(quantite_disponible) as qte_dispo_sum'),
                    DB::raw('SUM(quantite_reservee) as qte_reservee_sum')
                )
                ->with('produit.modele.categorie', 'emplacement')
                ->groupBy('produit_id', 'emplacement_id');

            if ($request->filled('categorie_id')) {
                $query->whereHas('produit.modele', function ($q) use ($request) {
                    $q->where('categorie_id', $request->categorie_id);
                });
            }

            if ($request->filled('emplacement_id')) {
                $query->where('emplacement_id', $request->emplacement_id);
            }

            $lignes = $query->get()->map(function ($item) {
                $quantite = round((float) $item->qte_dispo_sum, 2);
                $reservee = round((float) $item->qte_reservee_sum, 2);
                $prixAchat = (float) ($item->produit->prix_achat ?? 0);

                return [
                    'produit_id' => $item->produit_id,
                    'emplacement_id' => $item->emplacement_id,
                    'quantite_totale' => $quantite,
                    'quantite_reservee_totale' => $reservee,
                    'valeur' => round($prixAchat * $quantite, 2),
                    'produit' => $item->produit,
                    'emplacement' => $item->emplacement,
                ];
            });

            $totaux = [
                'quantite_totale' => round($lignes->sum('quantite_totale'), 2),
                'valeur_totale' => round($lignes->sum('valeur'), 2),
                'nombre_produits' => $lignes->unique('produit_id')->count(),
            ];

            return response()->json([
                'success' => true,
                'data' => [
                    'lignes' => $lignes,
                    'totaux' => $totaux,
                ],
                'message' => 'Rapport de stock généré avec succès'
            ]);
        } catch (Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Erreur lors de la génération du rapport',
                'error' => $e->getMessage()
            ], 500);
        }
    }
}
