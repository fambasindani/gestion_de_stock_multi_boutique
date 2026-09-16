<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Parametre;
use Illuminate\Http\Request;
use Exception;

class ParametreController extends Controller
{
    public function index()
    {
        try {
            return response()->json([
                'success' => true,
                'data' => Parametre::allKeyed(),
                'message' => 'Paramètres récupérés avec succès',
            ], 200);
        } catch (Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Erreur lors de la récupération des paramètres',
                'error' => $e->getMessage(),
            ], 500);
        }
    }

    public function update(Request $request)
    {
        try {
            $validated = $request->validate([
                'parametres' => 'required|array',
            ]);

            $societeId = app()->bound('societe_id') ? app('societe_id') : null;

            foreach ($validated['parametres'] as $cle => $valeur) {
                Parametre::updateOrCreate(
                    ['societe_id' => $societeId, 'cle' => $cle],
                    ['valeur' => is_scalar($valeur) || is_null($valeur) ? (string) $valeur : json_encode($valeur)]
                );
            }

            return response()->json([
                'success' => true,
                'data' => Parametre::allKeyed(),
                'message' => 'Paramètres enregistrés avec succès',
            ], 200);

        } catch (Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Erreur lors de l\'enregistrement des paramètres',
                'error' => $e->getMessage(),
            ], 500);
        }
    }
}
