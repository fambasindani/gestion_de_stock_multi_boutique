<?php

namespace App\Models;

use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Laravel\Sanctum\HasApiTokens;

class Utilisateur extends Authenticatable
{
    use HasApiTokens, Notifiable, \App\Models\Concerns\BelongsToSociete;

    // ✅ AJOUTER CETTE LIGNE
    protected $table = 'utilisateurs';
    
    protected $primaryKey = 'id';

    protected $fillable = [
        'nom', 'email', 'mot_de_passe', 'telephone', 'actif', 'societe_id',
        'est_super_admin', 'derniere_connexion'
    ];

    protected $casts = [
        'actif' => 'boolean',
        'est_super_admin' => 'boolean',
        'derniere_connexion' => 'datetime',
    ];

    public function societe()
    {
        return $this->belongsTo(Societe::class, 'societe_id');
    }

    protected $hidden = [
        'mot_de_passe', 'remember_token',
    ];

    public function setMotDePasseAttribute($value)
    {
        $this->attributes['mot_de_passe'] = bcrypt($value);
    }

    public function roles()
    {
        return $this->belongsToMany(Role::class, 'utilisateur_role', 'utilisateur_id', 'role_id')
                    ->withTimestamps();
    }

    public function hasRole($roleName)
    {
        return $this->roles()->where('nom', $roleName)->exists();
    }

    public function hasPermission($permissionName)
    {
        foreach ($this->roles as $role) {
            if ($role->permissions()->where('nom', $permissionName)->exists()) {
                return true;
            }
        }
        return false;
    }
}