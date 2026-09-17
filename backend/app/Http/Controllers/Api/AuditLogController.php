<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\AuditLog;
use Illuminate\Http\Request;
use Exception;

class AuditLogController extends Controller
{
    public function index(Request $request)
    {
        try {
            $query = AuditLog::with(['user', 'societe:id,nom']);

            if ($request->filled('search')) {
                $search = $request->search;
                $query->where(function ($q) use ($search) {
                    $q->where('description', 'LIKE', "%{$search}%")
                      ->orWhere('action', 'LIKE', "%{$search}%")
                      ->orWhere('entity_type', 'LIKE', "%{$search}%");
                });
            }

            if ($request->filled('societe_id')) {
                $query->where('societe_id', $request->societe_id);
            }

            if ($request->filled('action')) {
                $query->where('action', $request->action);
            }

            if ($request->filled('entity_type')) {
                $query->where('entity_type', $request->entity_type);
            }

            if ($request->filled('user_id')) {
                $query->where('user_id', $request->user_id);
            }

            if ($request->filled('date_debut')) {
                $query->whereDate('created_at', '>=', $request->date_debut);
            }

            if ($request->filled('date_fin')) {
                $query->whereDate('created_at', '<=', $request->date_fin);
            }

            $perPage = $request->input('per_page', 15);
            $logs = $query->orderBy('created_at', 'desc')->paginate($perPage);

            return response()->json([
                'success' => true,
                'data' => $logs,
                'message' => 'Logs récupérés avec succès'
            ], 200);

        } catch (Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Erreur lors de la récupération des logs',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    public function show($id)
    {
        try {
            $log = AuditLog::with(['user', 'societe:id,nom'])->findOrFail($id);

            return response()->json([
                'success' => true,
                'data' => $log,
                'message' => 'Log récupéré avec succès'
            ], 200);

        } catch (Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Log non trouvé'
            ], 404);
        }
    }
}
