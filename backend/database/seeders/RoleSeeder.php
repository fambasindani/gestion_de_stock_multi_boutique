<?php

namespace Database\Seeders;

use App\Models\Role;
use Illuminate\Database\Seeder;

class RoleSeeder extends Seeder
{
    public function run()
    {
        // Utiliser le modèle Role qui pointe vers 'roles'
        Role::create([
            'nom' => 'administrateur',
            'description' => 'Accès total',
            'actif' => 1
        ]);

        Role::create([
            'nom' => 'gestionnaire_stock',
            'description' => 'Gestion des stocks',
            'actif' => 1
        ]);

        Role::create([
            'nom' => 'commercial',
            'description' => 'Ventes et commandes',
            'actif' => 1
        ]);

        Role::create([
            'nom' => 'comptable',
            'description' => 'Facturation',
            'actif' => 1
        ]);

        Role::create([
            'nom' => 'lecteur',
            'description' => 'Lecture seule',
            'actif' => 1
        ]);
    }
}