<?php

namespace Database\Seeders;

use App\Models\Utilisateur;
use App\Models\Role;
use Illuminate\Database\Seeder;

class UtilisateurSeeder extends Seeder
{
    public function run()
    {
        // Créer un admin
        $admin = Utilisateur::create([
            'nom' => 'Administrateur',
            'email' => 'admin@exemple.com',
            'mot_de_passe' => 'admin123', // sera hashé
            'actif' => 1,
        ]);

        $adminRole = Role::where('nom', 'administrateur')->first();
        if ($adminRole) {
            $admin->roles()->attach($adminRole->id);
        }

        // Autres utilisateurs de test
        $user1 = Utilisateur::create([
            'nom' => 'FAMBA NGOY',
            'email' => 'pierre@gmail.com',
            'mot_de_passe' => '12345678',
            'actif' => 1,
        ]);
        $roleStock = Role::where('nom', 'gestionnaire_stock')->first();
        if ($roleStock) {
            $user1->roles()->attach($roleStock->id);
        }
    }
}