<?php

namespace App\Http\Middleware;

use App\Models\Societe;
use Closure;
use Illuminate\Http\Request;

class SetSocieteContext
{
    public function handle(Request $request, Closure $next)
    {
        $user = $request->user();

        if ($user && $user->est_super_admin) {
            // Le super-admin peut cibler une société via l'en-tête X-Societe-Id
            // (sinon il voit toutes les sociétés).
            $sid = $request->header('X-Societe-Id');
            app()->instance('societe_id', $sid ? (int) $sid : null);
            return $next($request);
        }

        if ($user) {
            if (!$user->societe_id) {
                return response()->json([
                    'success' => false,
                    'message' => 'Aucune société associée à ce compte.',
                ], 403);
            }

            $societe = Societe::find($user->societe_id);
            if (!$societe || !$societe->actif) {
                return response()->json([
                    'success' => false,
                    'message' => 'Abonnement inactif ou société désactivée.',
                ], 403);
            }

            app()->instance('societe_id', (int) $user->societe_id);
        }

        return $next($request);
    }
}
