<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\QuantiteStock;
use App\Models\Retour;
use App\Models\Societe;
use Exception;

class NotificationController extends Controller
{
    /**
     * Notifications calculées à la volée (stock, retours, abonnement).
     */
    public function index()
    {
        try {
            $notifications = [];

            // Rupture de stock
            $rupture = QuantiteStock::where('quantite_disponible', '<=', 0)->count();
            if ($rupture > 0) {
                $notifications[] = [
                    'type' => 'rupture_stock',
                    'level' => 'danger',
                    'title' => "{$rupture} produit(s) en rupture de stock",
                    'message' => 'Des produits sont épuisés.',
                    'link' => '/rapports/rupture-stock',
                ];
            }

            // Stock bas
            $stockBas = QuantiteStock::where('quantite_disponible', '>', 0)
                ->whereNotNull('seuil_minimum')
                ->whereRaw('quantite_disponible <= seuil_minimum')
                ->count();
            if ($stockBas > 0) {
                $notifications[] = [
                    'type' => 'stock_bas',
                    'level' => 'warning',
                    'title' => "{$stockBas} produit(s) en stock bas",
                    'message' => 'Le stock atteint le seuil minimum.',
                    'link' => '/rapports/stock-bas',
                ];
            }

            // Retours en attente de validation
            $retours = Retour::where('statut', 'brouillon')->count();
            if ($retours > 0) {
                $notifications[] = [
                    'type' => 'retour_attente',
                    'level' => 'info',
                    'title' => "{$retours} retour(s) à valider",
                    'message' => 'Des retours sont en attente de validation.',
                    'link' => '/dashboard/retours',
                ];
            }

            // Abonnement (expiration <= 5 jours)
            $societeId = app()->bound('societe_id') ? app('societe_id') : null;
            if ($societeId) {
                $societe = Societe::find($societeId);
                if ($societe && $societe->date_expiration) {
                    $jours = (int) now()->startOfDay()->diffInDays(
                        $societe->date_expiration->startOfDay(),
                        false
                    );
                    if ($jours <= 5) {
                        $notifications[] = [
                            'type' => 'abonnement',
                            'level' => $jours < 0 ? 'danger' : 'warning',
                            'title' => $jours < 0
                                ? "Abonnement expiré"
                                : "Abonnement expire dans {$jours} jour(s)",
                            'message' => "Boutique : {$societe->nom}",
                            'link' => '/dashboard/profil',
                        ];
                    }
                }
            }

            return response()->json([
                'success' => true,
                'data' => $notifications,
                'count' => count($notifications),
                'message' => 'Notifications récupérées',
            ], 200);

        } catch (Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Erreur lors de la récupération des notifications',
                'error' => $e->getMessage(),
            ], 500);
        }
    }
}
