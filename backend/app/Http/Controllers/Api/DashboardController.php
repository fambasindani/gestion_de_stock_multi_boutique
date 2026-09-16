<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\CommandeVente;
use App\Models\CommandeAchat;
use App\Models\EcritureComptable;
use App\Models\Partenaire;
use App\Models\ProduitModele;
use App\Models\VarianteProduit;
use App\Models\QuantiteStock;
use App\Models\TransfertStock;
use App\Models\Utilisateur;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Carbon\Carbon;

class DashboardController extends Controller
{
    /**
     * Dashboard principal - Vue d'ensemble
     * 
     * @param Request $request
     * @return \Illuminate\Http\JsonResponse
     */
    public function index(Request $request)
    {
        try {
            // Dates pour les filtres
            $dateDebut = $request->input('date_debut', Carbon::now()->subDays(30)->toDateString());
            $dateFin = $request->input('date_fin', Carbon::now()->toDateString());

            // 1. Statistiques générales
            $stats = $this->getGeneralStats();

            // 2. Chiffres d'affaires
            $chiffres = $this->getChiffresAffaires($dateDebut, $dateFin);

            // 3. Statistiques des commandes
            $commandes = $this->getCommandesStats($dateDebut, $dateFin);

            // 4. Statistiques de stock
            $stock = $this->getStockStats();

            // 5. Transferts récents
            $transfertsRecents = $this->getTransfertsRecents();

            // 6. Factures récentes
            $facturesRecentes = $this->getFacturesRecentes();

            // 7. Alertes stock
            $alertesStock = $this->getAlertesStock();

            // 8. Évolution des ventes (7 derniers jours)
            $evolutionVentes = $this->getEvolutionVentes();

            // 9. Top produits vendus
            $topProduits = $this->getTopProduits($dateDebut, $dateFin);

            // 10. Activité des utilisateurs
            $activiteUsers = $this->getActiviteUsers();

            return response()->json([
                'success' => true,
                'data' => [
                    'stats_generales' => $stats,
                    'chiffres_affaires' => $chiffres,
                    'commandes' => $commandes,
                    'stock' => $stock,
                    'transferts_recents' => $transfertsRecents,
                    'factures_recents' => $facturesRecentes,
                    'alertes_stock' => $alertesStock,
                    'evolution_ventes' => $evolutionVentes,
                    'top_produits' => $topProduits,
                    'activite_utilisateurs' => $activiteUsers,
                ],
                'message' => 'Dashboard récupéré avec succès'
            ], 200);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Erreur lors de la récupération du dashboard',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Société courante (null = super-admin = toutes les sociétés)
     */
    private function societeId()
    {
        return app()->bound('societe_id') ? app('societe_id') : null;
    }

    /**
     * Statistiques générales
     */
    private function getGeneralStats()
    {
        return [
            'total_utilisateurs' => Utilisateur::where('actif', 1)->count(),
            'total_clients' => Partenaire::where('est_client', 1)->where('actif', 1)->count(),
            'total_fournisseurs' => Partenaire::where('est_fournisseur', 1)->where('actif', 1)->count(),
            'total_produits' => VarianteProduit::where('actif', 1)->count(),
            'total_commandes_vente' => CommandeVente::where('actif', 1)->count(),
            'total_commandes_achat' => CommandeAchat::where('actif', 1)->count(),
            'total_factures' => EcritureComptable::where('actif', 1)->count(),
            'total_transferts' => TransfertStock::where('actif', 1)->count(),
        ];
    }

    /**
     * Chiffres d'affaires
     */
    private function getChiffresAffaires($dateDebut, $dateFin)
    {
        // CA des factures clients
        $caClients = EcritureComptable::where('type', 'facture_client')
                                      ->where('statut', '!=', 'annulee')
                                      ->whereBetween('date_emission', [$dateDebut, $dateFin])
                                      ->sum('montant_ttc');

        // CA des factures fournisseurs
        $caFournisseurs = EcritureComptable::where('type', 'facture_fournisseur')
                                           ->where('statut', '!=', 'annulee')
                                           ->whereBetween('date_emission', [$dateDebut, $dateFin])
                                           ->sum('montant_ttc');

        // Factures en attente de paiement
        $facturesImpayees = EcritureComptable::where('statut', '!=', 'payee')
                                             ->where('statut', '!=', 'annulee')
                                             ->where('montant_restant', '>', 0)
                                             ->sum('montant_restant');

        // Montant total des factures
        $totalFactures = EcritureComptable::where('statut', '!=', 'annulee')
                                          ->whereBetween('date_emission', [$dateDebut, $dateFin])
                                          ->sum('montant_ttc');

        return [
            'ca_clients' => round($caClients, 2),
            'ca_fournisseurs' => round($caFournisseurs, 2),
            'total_factures' => round($totalFactures, 2),
            'factures_impayees' => round($facturesImpayees, 2),
            'taux_paiement' => $totalFactures > 0 ? 
                round((($totalFactures - $facturesImpayees) / $totalFactures) * 100, 2) : 0,
            'date_debut' => $dateDebut,
            'date_fin' => $dateFin,
        ];
    }

    /**
     * Statistiques des commandes
     */
    private function getCommandesStats($dateDebut, $dateFin)
    {
        // Commandes de vente par statut
        $ventesParStatut = CommandeVente::whereBetween('date_commande', [$dateDebut, $dateFin])
                                        ->select('etat', DB::raw('count(*) as total'))
                                        ->groupBy('etat')
                                        ->get()
                                        ->pluck('total', 'etat')
                                        ->toArray();

        // Commandes d'achat par statut
        $achatsParStatut = CommandeAchat::whereBetween('date_commande', [$dateDebut, $dateFin])
                                         ->select('etat', DB::raw('count(*) as total'))
                                         ->groupBy('etat')
                                         ->get()
                                         ->pluck('total', 'etat')
                                         ->toArray();

        return [
            'ventes' => [
                'total' => array_sum($ventesParStatut),
                'par_statut' => $ventesParStatut,
                'brouillon' => $ventesParStatut['brouillon'] ?? 0,
                'confirme' => $ventesParStatut['confirme'] ?? 0,
                'en_cours' => $ventesParStatut['en_cours'] ?? 0,
                'termine' => $ventesParStatut['termine'] ?? 0,
                'annule' => $ventesParStatut['annule'] ?? 0,
            ],
            'achats' => [
                'total' => array_sum($achatsParStatut),
                'par_statut' => $achatsParStatut,
                'brouillon' => $achatsParStatut['brouillon'] ?? 0,
                'confirme' => $achatsParStatut['confirme'] ?? 0,
                'envoye' => $achatsParStatut['envoye'] ?? 0,
                'recu' => $achatsParStatut['recu'] ?? 0,
                'termine' => $achatsParStatut['termine'] ?? 0,
                'annule' => $achatsParStatut['annule'] ?? 0,
            ],
        ];
    }

    /**
     * Statistiques de stock
     */
    private function getStockStats()
    {
        // Quantité totale de stock
        $quantiteTotale = QuantiteStock::sum('quantite_disponible');

        // Produits en rupture de stock (quantité <= 0)
        $produitsRupture = QuantiteStock::where('quantite_disponible', '<=', 0)
                                        ->count();

        // Produits avec alerte stock (quantité <= seuil_minimum)
        $produitsAlerte = QuantiteStock::whereRaw('quantite_disponible <= seuil_minimum')
                                       ->whereNotNull('seuil_minimum')
                                       ->where('quantite_disponible', '>', 0)
                                       ->count();

        // Nombre total de produits en stock
        $produitsEnStock = QuantiteStock::where('quantite_disponible', '>', 0)
                                        ->count();

        // Produits avec stock normal
        $produitsNormal = QuantiteStock::where('quantite_disponible', '>', 0)
                                       ->where(function($q) {
                                           $q->whereNull('seuil_minimum')
                                             ->orWhereRaw('quantite_disponible > seuil_minimum');
                                       })
                                       ->count();

        return [
            'quantite_totale' => round($quantiteTotale, 2),
            'produits_en_stock' => $produitsEnStock,
            'produits_rupture' => $produitsRupture,
            'produits_alerte' => $produitsAlerte,
            'produits_normal' => $produitsNormal,
            'taux_rupture' => $produitsEnStock > 0 ? 
                round(($produitsRupture / ($produitsEnStock + $produitsRupture)) * 100, 2) : 0,
        ];
    }

    /**
     * Transferts récents
     */
    private function getTransfertsRecents()
    {
        return TransfertStock::with(['emplacementSource', 'emplacementDestination', 'creePar'])
                             ->orderBy('created_at', 'desc')
                             ->limit(10)
                             ->get()
                             ->map(function($transfert) {
                                 return [
                                     'id' => $transfert->id,
                                     'reference' => $transfert->reference,
                                     'type' => $transfert->type,
                                     'type_label' => $transfert->type_label,
                                     'etat' => $transfert->etat,
                                     'etat_label' => $transfert->etat_label,
                                     'source' => $transfert->emplacementSource->nom ?? null,
                                     'destination' => $transfert->emplacementDestination->nom ?? null,
                                     'created_at' => $transfert->created_at->format('d/m/Y H:i'),
                                     'cree_par' => $transfert->creePar->nom ?? null,
                                 ];
                             });
    }

    /**
     * Factures récentes
     */
    private function getFacturesRecentes()
    {
        return EcritureComptable::with(['partenaire', 'creePar'])
                                ->orderBy('created_at', 'desc')
                                ->limit(10)
                                ->get()
                                ->map(function($facture) {
                                    return [
                                        'id' => $facture->id,
                                        'reference' => $facture->reference,
                                        'numero_facture' => $facture->numero_facture,
                                        'type' => $facture->type,
                                        'type_label' => $facture->type_label,
                                        'statut' => $facture->statut,
                                        'statut_label' => $facture->statut_label,
                                        'montant_ttc' => round($facture->montant_ttc, 2),
                                        'partenaire' => $facture->partenaire->nom ?? null,
                                        'date_emission' => $facture->date_emission->format('d/m/Y'),
                                        'cree_par' => $facture->creePar->nom ?? null,
                                    ];
                                });
    }

    /**
     * Alertes stock
     */
    private function getAlertesStock()
    {
        // Produits en rupture
        $ruptures = QuantiteStock::with(['produit', 'produit.modele', 'emplacement'])
                                 ->where('quantite_disponible', '<=', 0)
                                 ->limit(10)
                                 ->get()
                                 ->map(function($stock) {
                                     return [
                                         'produit' => $stock->produit->nom ?? 'N/A',
                                         'code' => $stock->produit->code_interne ?? 'N/A',
                                         'emplacement' => $stock->emplacement->nom ?? 'N/A',
                                         'quantite' => round($stock->quantite_disponible, 2),
                                         'type' => 'rupture',
                                         'message' => 'Produit en rupture de stock',
                                     ];
                                 });

        // Produits en alerte (seuil minimum)
        $alertes = QuantiteStock::with(['produit', 'produit.modele', 'emplacement'])
                                ->whereRaw('quantite_disponible <= seuil_minimum')
                                ->whereNotNull('seuil_minimum')
                                ->where('quantite_disponible', '>', 0)
                                ->limit(10)
                                ->get()
                                ->map(function($stock) {
                                    return [
                                        'produit' => $stock->produit->nom ?? 'N/A',
                                        'code' => $stock->produit->code_interne ?? 'N/A',
                                        'emplacement' => $stock->emplacement->nom ?? 'N/A',
                                        'quantite' => round($stock->quantite_disponible, 2),
                                        'seuil_minimum' => round($stock->seuil_minimum, 2),
                                        'type' => 'alerte',
                                        'message' => 'Stock atteint le seuil minimum',
                                    ];
                                });

        return $ruptures->merge($alertes)->values();
    }

    /**
     * Évolution des ventes (7 derniers jours)
     */
    private function getEvolutionVentes()
    {
        $dates = collect();
        for ($i = 6; $i >= 0; $i--) {
            $date = Carbon::now()->subDays($i)->toDateString();
            $dates->push($date);
        }

        return $dates->map(function($date) {
            // Nombre de commandes
            $commandes = CommandeVente::whereDate('created_at', $date)->count();

            // Montant des commandes
            $montant = CommandeVente::whereDate('created_at', $date)
                                    ->sum('montant_total_ttc');

            // Nombre de factures
            $factures = EcritureComptable::whereDate('created_at', $date)
                                         ->where('type', 'facture_client')
                                         ->count();

            // Montant des factures
            $montantFactures = EcritureComptable::whereDate('created_at', $date)
                                                ->where('type', 'facture_client')
                                                ->sum('montant_ttc');

            return [
                'date' => Carbon::parse($date)->format('d/m/Y'),
                'commandes' => $commandes,
                'montant_commandes' => round($montant, 2),
                'factures' => $factures,
                'montant_factures' => round($montantFactures, 2),
            ];
        });
    }

    /**
     * Top produits vendus
     */
    private function getTopProduits($dateDebut, $dateFin)
    {
        // Lignes de commande de vente
        return DB::table('ligne_commande_vente')
                 ->join('commande_vente', 'ligne_commande_vente.commande_vente_id', '=', 'commande_vente.id')
                 ->when($this->societeId(), function ($q) {
                     $q->where('commande_vente.societe_id', $this->societeId());
                 })
                 ->whereBetween('commande_vente.date_commande', [$dateDebut, $dateFin])
                 ->where('commande_vente.etat', '!=', 'annule')
                 ->select(
                     'ligne_commande_vente.produit_id',
                     'ligne_commande_vente.nom_produit',
                     DB::raw('SUM(ligne_commande_vente.quantite) as total_quantite'),
                     DB::raw('SUM(ligne_commande_vente.montant_total_ht) as total_ht'),
                     DB::raw('COUNT(DISTINCT ligne_commande_vente.commande_vente_id) as nombre_commandes')
                 )
                 ->groupBy('ligne_commande_vente.produit_id', 'ligne_commande_vente.nom_produit')
                 ->orderBy('total_quantite', 'desc')
                 ->limit(10)
                 ->get()
                 ->map(function($item) {
                     return [
                         'produit_id' => $item->produit_id,
                         'nom' => $item->nom_produit,
                          'quantite_vendue' => round($item->total_quantite, 2),
                          'total_ht' => round($item->total_ht, 2),
                         'nombre_commandes' => $item->nombre_commandes,
                     ];
                 });
    }

    /**
     * Activité des utilisateurs
     */
    private function getActiviteUsers()
    {
        // Dernières connexions
        $dernieresConnexions = Utilisateur::whereNotNull('derniere_connexion')
                                          ->orderBy('derniere_connexion', 'desc')
                                          ->limit(10)
                                          ->get()
                                          ->map(function($user) {
                                              return [
                                                  'nom' => $user->nom,
                                                  'email' => $user->email,
                                                  'derniere_connexion' => $user->derniere_connexion 
                                                      ? Carbon::parse($user->derniere_connexion)->diffForHumans() 
                                                      : 'Jamais',
                                                  'role' => $user->roles()->first()->nom ?? 'N/A',
                                              ];
                                          });

        // Nombre d'utilisateurs par rôle
        $usersParRole = DB::table('utilisateur_role')
                          ->join('roles', 'utilisateur_role.role_id', '=', 'roles.id')
                          ->join('utilisateurs', 'utilisateurs.id', '=', 'utilisateur_role.utilisateur_id')
                          ->when($this->societeId(), function ($q) {
                              $q->where('utilisateurs.societe_id', $this->societeId());
                          })
                          ->select('roles.nom', DB::raw('count(*) as total'))
                          ->groupBy('roles.nom')
                          ->get()
                          ->pluck('total', 'nom')
                          ->toArray();

        return [
            'dernieres_connexions' => $dernieresConnexions,
            'utilisateurs_par_role' => $usersParRole,
            'total_actifs' => Utilisateur::where('actif', 1)->count(),
            'total_inactifs' => Utilisateur::where('actif', 0)->count(),
        ];
    }

    /**
     * Dashboard des commandes (spécifique)
     */
    public function commandes(Request $request)
    {
        try {
            $dateDebut = $request->input('date_debut', Carbon::now()->subDays(30)->toDateString());
            $dateFin = $request->input('date_fin', Carbon::now()->toDateString());

            // Commandes du jour
            $aujourdHui = Carbon::now()->toDateString();
            $commandesAujourdHui = CommandeVente::whereDate('created_at', $aujourdHui)->count();
            $montantAujourdHui = CommandeVente::whereDate('created_at', $aujourdHui)->sum('montant_total_ttc');

            // Évolution des commandes (par jour sur 30 jours)
            $evolution = collect();
            for ($i = 29; $i >= 0; $i--) {
                $date = Carbon::now()->subDays($i)->toDateString();
                $count = CommandeVente::whereDate('created_at', $date)->count();
                $montant = CommandeVente::whereDate('created_at', $date)->sum('montant_total_ttc');
                $evolution->push([
                    'date' => Carbon::parse($date)->format('d/m/Y'),
                    'commandes' => $count,
                    'montant' => round($montant, 2),
                ]);
            }

            return response()->json([
                'success' => true,
                'data' => [
                    'aujourd_hui' => [
                        'commandes' => $commandesAujourdHui,
                        'montant' => round($montantAujourdHui, 2),
                    ],
                    'evolution' => $evolution,
                    'total_periode' => [
                        'commandes' => CommandeVente::whereBetween('created_at', [$dateDebut, $dateFin])->count(),
                        'montant' => round(CommandeVente::whereBetween('created_at', [$dateDebut, $dateFin])->sum('montant_total_ttc'), 2),
                    ],
                ],
                'message' => 'Dashboard des commandes récupéré avec succès'
            ], 200);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Erreur lors de la récupération du dashboard des commandes',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Dashboard du stock (spécifique)
     */
    public function stock(Request $request)
    {
        try {
            // Total par emplacement
            $stockParEmplacement = QuantiteStock::with('emplacement')
                                                ->select(
                                                    'emplacement_id',
                                                    DB::raw('SUM(quantite_disponible) as total')
                                                )
                                                ->groupBy('emplacement_id')
                                                ->get()
                                                ->map(function($item) {
                                                    return [
                                                        'emplacement' => $item->emplacement->nom ?? 'N/A',
                                                        'total' => round($item->total, 2),
                                                    ];
                                                });

            // Top produits en stock
            $topProduitsStock = QuantiteStock::with(['produit', 'produit.modele'])
                                             ->select(
                                                 'produit_id',
                                                 DB::raw('SUM(quantite_disponible) as total')
                                             )
                                             ->groupBy('produit_id')
                                             ->orderBy('total', 'desc')
                                             ->limit(10)
                                             ->get()
                                             ->map(function($item) {
                                                 return [
                                                     'produit' => $item->produit->nom ?? 'N/A',
                                                     'code' => $item->produit->code_interne ?? 'N/A',
                                                     'quantite' => round($item->total, 2),
                                                 ];
                                             });

            // Valeur du stock (estimation)
            $valeurStock = DB::table('quantite_stock')
                             ->join('variante_produit', 'quantite_stock.produit_id', '=', 'variante_produit.id')
                             ->when($this->societeId(), function ($q) {
                                 $q->where('quantite_stock.societe_id', $this->societeId());
                             })
                             ->select(DB::raw('SUM(quantite_stock.quantite_disponible * variante_produit.prix_achat) as valeur_totale'))
                             ->first();

            return response()->json([
                'success' => true,
                'data' => [
                    'stock_par_emplacement' => $stockParEmplacement,
                    'top_produits_stock' => $topProduitsStock,
                    'valeur_totale_stock' => round($valeurStock->valeur_totale ?? 0, 2),
                    'total_quantite' => round(QuantiteStock::sum('quantite_disponible'), 2),
                    'nombre_produits' => QuantiteStock::where('quantite_disponible', '>', 0)->count(),
                ],
                'message' => 'Dashboard du stock récupéré avec succès'
            ], 200);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Erreur lors de la récupération du dashboard du stock',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Dashboard de facturation (spécifique)
     */
    public function facturation(Request $request)
    {
        try {
            $dateDebut = $request->input('date_debut', Carbon::now()->subDays(30)->toDateString());
            $dateFin = $request->input('date_fin', Carbon::now()->toDateString());

            // Factures par statut
            $facturesParStatut = EcritureComptable::select('statut', DB::raw('count(*) as total'), DB::raw('SUM(montant_ttc) as montant'))
                                                   ->whereBetween('date_emission', [$dateDebut, $dateFin])
                                                   ->groupBy('statut')
                                                   ->get()
                                                   ->map(function($item) {
                                                       return [
                                                           'statut' => $item->statut,
                                                           'statut_label' => (new \App\Models\EcritureComptable())->getStatutLabelAttribute(),
                                                           'total' => $item->total,
                                                            'montant' => round($item->montant ?? 0, 2),
                                                       ];
                                                   });

            // Top clients
            $topClients = EcritureComptable::with('partenaire')
                                           ->where('type', 'facture_client')
                                           ->where('statut', '!=', 'annulee')
                                           ->whereBetween('date_emission', [$dateDebut, $dateFin])
                                           ->select('partenaire_id', DB::raw('SUM(montant_ttc) as total'))
                                           ->groupBy('partenaire_id')
                                           ->orderBy('total', 'desc')
                                           ->limit(10)
                                           ->get()
                                           ->map(function($item) {
                                               return [
                                                   'partenaire' => $item->partenaire->nom ?? 'N/A',
                                                    'total' => round($item->total, 2),
                                               ];
                                           });

            return response()->json([
                'success' => true,
                'data' => [
                    'factures_par_statut' => $facturesParStatut,
                    'top_clients' => $topClients,
                    'total_factures' => EcritureComptable::whereBetween('date_emission', [$dateDebut, $dateFin])->count(),
                    'montant_total' => round(EcritureComptable::whereBetween('date_emission', [$dateDebut, $dateFin])->sum('montant_ttc'), 2),
                    'factures_impayees' => EcritureComptable::where('statut', '!=', 'payee')
                                                             ->where('montant_restant', '>', 0)
                                                             ->count(),
                    'montant_impaye' => round(EcritureComptable::where('statut', '!=', 'payee')
                                           ->where('montant_restant', '>', 0)
                                           ->sum('montant_restant'), 2),
                ],
                'message' => 'Dashboard de facturation récupéré avec succès'
            ], 200);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Erreur lors de la récupération du dashboard de facturation',
                'error' => $e->getMessage()
            ], 500);
        }
    }
}