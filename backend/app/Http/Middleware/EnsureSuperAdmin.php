<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;

class EnsureSuperAdmin
{
    public function handle(Request $request, Closure $next)
    {
        if (!$request->user() || !$request->user()->est_super_admin) {
            return response()->json([
                'success' => false,
                'message' => 'Accès réservé au super-administrateur.',
            ], 403);
        }

        return $next($request);
    }
}
