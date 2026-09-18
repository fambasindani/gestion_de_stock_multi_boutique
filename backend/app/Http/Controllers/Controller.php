<?php

namespace App\Http\Controllers;

use App\Models\AuditLog;
use Illuminate\Foundation\Auth\Access\AuthorizesRequests;
use Illuminate\Foundation\Validation\ValidatesRequests;
use Illuminate\Routing\Controller as BaseController;
use Illuminate\Validation\Rule;
use Illuminate\Validation\Rules\Unique;

class Controller extends BaseController
{
    use AuthorizesRequests, ValidatesRequests;

    /**
     * Règle d'unicité cloisonnée à la société courante.
     * Permet à chaque boutique d'avoir ses propres noms / codes.
     */
    protected function uniqueSociete(string $table, string $column, $ignoreId = null): Unique
    {
        $societeId = app()->bound('societe_id') ? app('societe_id') : null;

        $rule = Rule::unique($table, $column)->where(function ($q) use ($societeId) {
            if ($societeId === null || $societeId === '') {
                $q->whereNull('societe_id');
            } else {
                $q->where('societe_id', $societeId);
            }
        });

        if ($ignoreId !== null) {
            $rule->ignore($ignoreId);
        }

        return $rule;
    }

    protected function logActivity(string $action, string $entityType, int|string|null $entityId, string $description, ?array $oldValues = null, ?array $newValues = null, ?int $societeId = null): void
    {
        if ($societeId === null) {
            $societeId = app()->bound('societe_id') ? app('societe_id') : null;
        }
        if ($societeId === null && auth()->user()) {
            $societeId = auth()->user()->societe_id;
        }

        AuditLog::create([
            'societe_id' => $societeId,
            'user_id' => auth()->id(),
            'action' => $action,
            'entity_type' => $entityType,
            'entity_id' => $entityId,
            'description' => $description,
            'old_values' => $oldValues,
            'new_values' => $newValues,
            'ip_address' => request()->ip(),
            'user_agent' => request()->userAgent(),
        ]);
    }
}
