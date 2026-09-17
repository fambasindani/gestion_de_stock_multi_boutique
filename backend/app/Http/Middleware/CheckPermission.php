<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;

class CheckPermission
{
    /**
     * Accepte une ou plusieurs permissions séparées par "|" (au moins une suffit).
     * Ex : permission:gerer_roles|assigner_roles
     */
    public function handle(Request $request, Closure $next, $permission)
    {
        $user = auth()->user();

        // Le super-admin a tous les droits
        if ($user && $user->est_super_admin) {
            return $next($request);
        }

        $requises = array_filter(array_map('trim', explode('|', (string) $permission)));

        foreach ($requises as $perm) {
            if ($user && $user->hasPermission($perm)) {
                return $next($request);
            }
        }

        abort(403, "Vous n'avez pas la permission : $permission");
    }
}