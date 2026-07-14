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
}