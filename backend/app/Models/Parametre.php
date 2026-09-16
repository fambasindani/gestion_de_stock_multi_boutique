<?php

namespace App\Models;

use App\Models\Concerns\BelongsToSociete;
use Illuminate\Database\Eloquent\Model;

class Parametre extends Model
{
    use BelongsToSociete;

    protected $table = 'parametres';
    protected $primaryKey = 'id';

    protected $fillable = ['societe_id', 'cle', 'valeur', 'description'];

    public static function get(string $cle, $default = null)
    {
        $valeur = static::where('cle', $cle)->value('valeur');
        return $valeur !== null && $valeur !== '' ? $valeur : $default;
    }

    public static function allKeyed(): array
    {
        return static::pluck('valeur', 'cle')->toArray();
    }
}
