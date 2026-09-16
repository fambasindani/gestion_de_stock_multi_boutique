<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;

class CheckPermission
{
    public function handle(Request $request, Closure $next, $permission)
    {
        $user = auth()->user();

        // Le super-admin a tous les droits
        if ($user && $user->est_super_admin) {
            return $next($request);
        }

        if (!$user || !$user->hasPermission($permission)) {
            abort(403, "Vous n'avez pas la permission : $permission");
        }
        return $next($request);
    }
}