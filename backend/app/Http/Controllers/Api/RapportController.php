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
            $query = QuantiteStock::query()
                ->select(
                    'produit_id',
                    'emplacement_id',
                    DB::raw('SUM(quantite_disponible) as quantite_totale'),
                    DB::raw('SUM(quantite_reservee) as quantite_reservee_totale')
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

            $lignes = $query->get();

            $lignes->each(function ($item) {
                $item->valeur = ($item->produit->prix_achat ?? 0) * $item->quantite_totale;
            });

            $totaux = [
                'quantite_totale' => $lignes->sum('quantite_totale'),
                'valeur_totale' => $lignes->sum('valeur'),
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
