<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;

class CheckPermission
{
    public function handle(Request $request, Closure $next, $permission)
    {
        if (!auth()->user() || !auth()->user()->hasPermission($permission)) {
            abort(403, "Vous n'avez pas la permission : $permission");
        }
        return $next($request);
    }
}