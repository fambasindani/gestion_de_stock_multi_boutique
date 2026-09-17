<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Role extends Model
{
    // ✅ Spécifier le nom exact de la table (avec 's')
    protected $table = 'roles';
    
    protected $primaryKey = 'id';

    protected $fillable = ['nom', 'description', 'societe_id', 'actif'];

    public function utilisateurs()
    {
        return $this->belongsToMany(Utilisateur::class, 'utilisateur_role', 'role_id', 'utilisateur_id')
                    ->withTimestamps();
    }

    public function permissions()
    {
        return $this->belongsToMany(Permission::class, 'role_permission', 'role_id', 'permission_id')
                    ->withTimestamps();
    }

    /**
     * Copie les rôles globaux (societe_id null) pour une société donnée.
     * Utilisé à la création d'une boutique et par migration.
     */
    public static function seedPourSociete(int $societeId): void
    {
        $globaux = static::whereNull('societe_id')->with('permissions')->get();

        foreach ($globaux as $modele) {
            $existe = static::where('societe_id', $societeId)
                ->where('nom', $modele->nom)
                ->exists();

            if ($existe) {
                continue;
            }

            $copie = static::create([
                'nom' => $modele->nom,
                'description' => $modele->description,
                'societe_id' => $societeId,
                'actif' => $modele->actif,
            ]);

            $copie->permissions()->sync($modele->permissions->pluck('id')->all());
        }
    }
}