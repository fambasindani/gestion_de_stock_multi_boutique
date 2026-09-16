<?php

namespace App\Models\Concerns;

use Illuminate\Database\Eloquent\Builder;

/**
 * Scope automatiquement les modèles par la société courante.
 * La société courante est injectée par le middleware SetSocieteContext
 * (null = super-admin sans filtre = voit toutes les sociétés).
 */
trait BelongsToSociete
{
    protected static function bootBelongsToSociete(): void
    {
        static::addGlobalScope('societe', function (Builder $builder) {
            $societeId = app()->bound('societe_id') ? app('societe_id') : null;
            if ($societeId !== null && $societeId !== '') {
                $builder->where(
                    $builder->getModel()->getTable() . '.societe_id',
                    $societeId
                );
            }
        });

        static::creating(function ($model) {
            $societeId = app()->bound('societe_id') ? app('societe_id') : null;
            if ($societeId !== null && $societeId !== '' && empty($model->societe_id)) {
                $model->societe_id = $societeId;
            }
        });
    }
}
