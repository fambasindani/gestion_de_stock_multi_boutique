<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Retour;
use App\Models\LigneRetour;
use App\Models\QuantiteStock;
use App\Models\VarianteProduit;
use App\Models\EmplacementStock;
use Illuminate\Http\Request;
use Illuminate\Database\Eloquent\ModelNotFoundException;
use Illuminate\Validation\ValidationException;
use Illuminate\Support\Facades\DB;
use Exception;

class RetourController extends Controller
{
    public function index(Request $request)
    {
        try {
            $query = Retour::with(['partenaire', 'emplacement', 'utilisateur'])
                ->withCount('lignes');

            if ($request->filled('type') && $request->type !== 'all') {
                $query->where('type', $request->type);
            }
            if ($request->filled('search')) {
                $query->where('reference', 'LIKE', '%' . $request->search . '%');
            }
            if ($request->filled('date_debut')) {
                $query->whereDate('date_retour', '>=', $request->date_debut);
            }
            if ($request->filled('date_fin')) {
                $query->whereDate('date_retour', '<=', $request->date_fin);
            }

            $perPage = $request->input('per_page', 15);
            $retours = $query->orderBy('created_at', 'desc')->paginate($perPage);

            return response()->json([
                'success' => true,
                'data' => $retours,
                'message' => 'Liste des retours récupérée avec succès',
            ], 200);

        } catch (Exception $e) {
            return response()->json(['success' => false, 'message' => 'Erreur lors de la récupération des retours', 'error' => $e->getMessage()], 500);
        }
    }

    public function store(Request $request)
    {
        try {
            DB::beginTransaction();

            $validated = $request->validate([
                'type' => 'required|in:client,fournisseur,casse',
                'date_retour' => 'nullable|date',
                'partenaire_id' => 'nullable|exists:partenaire,id',
                'emplacement_id' => 'nullable|exists:emplacement_stock,id',
                'motif' => 'nullable|string|max:255',
                'notes' => 'nullable|string',
                'lignes' => 'required|array|min:1',
                'lignes.*.produit_id' => 'required|exists:variante_produit,id',
                'lignes.*.quantite' => 'required|numeric|min:0.01',
                'lignes.*.prix_unitaire_ht' => 'nullable|numeric|min:0',
                'lignes.*.notes' => 'nullable|string',
            ]);

            $retour = Retour::create([
                'reference' => $this->generateReference(),
                'date_retour' => $validated['date_retour'] ?? now()->toDateString(),
                'type' => $validated['type'],
                'statut' => 'brouillon',
                'partenaire_id' => $validated['partenaire_id'] ?? null,
                'emplacement_id' => $validated['emplacement_id'] ?? null,
                'motif' => $validated['motif'] ?? null,
                'notes' => $validated['notes'] ?? null,
                'utilisateur_id' => auth()->id(),
            ]);

            foreach ($validated['lignes'] as $l) {
                $produit = VarianteProduit::find($l['produit_id']);
                $prix = (float) ($l['prix_unitaire_ht'] ?? 0);
                $qte = (float) $l['quantite'];

                LigneRetour::create([
                    'retour_id' => $retour->id,
                    'produit_id' => $l['produit_id'],
                    'quantite' => $qte,
                    'prix_unitaire_ht' => $prix,
                    'montant_ht' => $prix * $qte,
                    'notes' => $l['notes'] ?? null,
                ]);
            }

            DB::commit();

            $retour->load(['partenaire', 'emplacement', 'utilisateur', 'lignes.produit.modele']);

            $this->logActivity('create', 'Retour', $retour->id, "Création retour {$retour->reference} ({$retour->type}) — en attente de validation");

            return response()->json([
                'success' => true,
                'data' => $retour,
                'message' => 'Retour enregistré (en attente de validation)',
            ], 201);

        } catch (ValidationException $e) {
            DB::rollBack();
            return response()->json(['success' => false, 'message' => 'Erreur de validation', 'errors' => $e->errors()], 422);
        } catch (Exception $e) {
            DB::rollBack();
            return response()->json(['success' => false, 'message' => $e->getMessage() ?: 'Erreur lors de l\'enregistrement du retour', 'error' => $e->getMessage()], 500);
        }
    }

    /**
     * Valider un retour : applique le mouvement de stock puis marque comme validé.
     * Nécessite la permission valider_retours.
     */
    public function valider($id)
    {
        try {
            DB::beginTransaction();

            $retour = Retour::with('lignes')->findOrFail($id);

            if ($retour->statut === 'valide') {
                return response()->json([
                    'success' => false,
                    'message' => 'Ce retour est déjà validé.',
                ], 422);
            }

            foreach ($retour->lignes as $ligne) {
                $produit = VarianteProduit::find($ligne->produit_id);
                $this->appliquerMouvement($retour, $ligne->produit_id, (float) $ligne->quantite, $produit->nom ?? 'Produit');
            }

            $retour->update([
                'statut' => 'valide',
                'valide_par' => auth()->id(),
                'date_validation' => now(),
            ]);

            DB::commit();

            $retour->load(['partenaire', 'emplacement', 'utilisateur', 'lignes.produit.modele']);

            $this->logActivity('valider', 'Retour', $retour->id, "Validation retour {$retour->reference}");

            return response()->json([
                'success' => true,
                'data' => $retour,
                'message' => 'Retour validé, stock mis à jour',
            ], 200);

        } catch (ModelNotFoundException $e) {
            DB::rollBack();
            return response()->json(['success' => false, 'message' => 'Retour non trouvé'], 404);
        } catch (Exception $e) {
            DB::rollBack();
            return response()->json(['success' => false, 'message' => $e->getMessage() ?: 'Erreur lors de la validation', 'error' => $e->getMessage()], 500);
        }
    }

    public function show($id)
    {
        try {
            $retour = Retour::with(['partenaire', 'emplacement', 'utilisateur', 'lignes.produit.modele'])
                ->findOrFail($id);

            return response()->json(['success' => true, 'data' => $retour, 'message' => 'Retour récupéré avec succès'], 200);

        } catch (ModelNotFoundException $e) {
            return response()->json(['success' => false, 'message' => 'Retour non trouvé'], 404);
        } catch (Exception $e) {
            return response()->json(['success' => false, 'message' => 'Erreur', 'error' => $e->getMessage()], 500);
        }
    }

    public function destroy($id)
    {
        try {
            DB::beginTransaction();

            $retour = Retour::findOrFail($id);

            // Un retour validé ne peut plus être supprimé
            if ($retour->statut === 'valide') {
                DB::rollBack();
                return response()->json([
                    'success' => false,
                    'message' => 'Un retour validé ne peut plus être supprimé.',
                ], 422);
            }

            $retour->delete();

            DB::commit();

            $this->logActivity('delete', 'Retour', $id, "Suppression retour {$retour->reference}");

            return response()->json(['success' => true, 'message' => 'Retour supprimé'], 200);

        } catch (ModelNotFoundException $e) {
            DB::rollBack();
            return response()->json(['success' => false, 'message' => 'Retour non trouvé'], 404);
        } catch (Exception $e) {
            DB::rollBack();
            return response()->json(['success' => false, 'message' => 'Erreur lors de la suppression', 'error' => $e->getMessage()], 500);
        }
    }

    /**
     * Impact du retour sur le stock :
     * - client : + (marchandise remise en stock)
     * - fournisseur : - (renvoyée au fournisseur)
     * - casse : - (mise au rebut)
     */
    private function appliquerMouvement(Retour $retour, $produitId, float $quantite, string $nomProduit): void
    {
        if ($retour->type === 'client') {
            $this->augmenterStock($retour->emplacement_id, $produitId, $quantite, $retour->reference);
        } else {
            $this->diminuerStock($retour->emplacement_id, $produitId, $quantite, $nomProduit);
        }
    }

    private function annulerMouvement(Retour $retour, $produitId, float $quantite, string $nomProduit): void
    {
        if ($retour->type === 'client') {
            $this->diminuerStock($retour->emplacement_id, $produitId, $quantite, $nomProduit);
        } else {
            $this->augmenterStock($retour->emplacement_id, $produitId, $quantite, $retour->reference);
        }
    }

    private function augmenterStock($emplacementId, $produitId, float $quantite, string $ref): void
    {
        if (!$emplacementId) {
            $emplacementId = EmplacementStock::where('actif', true)->value('id');
        }
        if (!$emplacementId) {
            throw new Exception('Aucun emplacement disponible pour remettre le stock');
        }

        $stock = QuantiteStock::firstOrNew([
            'produit_id' => $produitId,
            'emplacement_id' => $emplacementId,
            'lot_id' => null,
        ]);
        $stock->quantite_disponible = (float) ($stock->quantite_disponible ?? 0) + $quantite;
        $stock->date_dernier_mouvement = now()->toDateString();
        $stock->notes = trim(($stock->notes ?? '') . "\nRetour {$ref} le " . now()->toDateString());
        $stock->save();
    }

    private function diminuerStock($emplacementId, $produitId, float $quantite, string $nomProduit): void
    {
        $query = QuantiteStock::where('produit_id', $produitId);
        if ($emplacementId) {
            $query->where('emplacement_id', $emplacementId);
        }
        $stocks = $query->orderByDesc('quantite_disponible')->get();

        if ($stocks->isEmpty()) {
            throw new Exception("Aucun stock enregistré pour « {$nomProduit} »");
        }

        $disponible = $stocks->sum('quantite_disponible');
        if ($disponible < $quantite) {
            throw new Exception("Stock insuffisant pour « {$nomProduit} » (disponible : {$disponible}, demandé : {$quantite})");
        }

        $remaining = $quantite;
        foreach ($stocks as $stock) {
            if ($remaining <= 0) break;
            if ($stock->quantite_disponible <= 0) continue;
            $dec = min($remaining, (float) $stock->quantite_disponible);
            $stock->quantite_disponible = (float) $stock->quantite_disponible - $dec;
            $stock->date_dernier_mouvement = now()->toDateString();
            $stock->save();
            $remaining -= $dec;
        }
    }

    private function generateReference(): string
    {
        $prefix = 'RET-' . now()->format('Ym') . '-';
        $count = Retour::withoutGlobalScopes()->where('reference', 'LIKE', $prefix . '%')->count() + 1;

        do {
            $reference = $prefix . str_pad((string) $count, 4, '0', STR_PAD_LEFT);
            $count++;
        } while (Retour::withoutGlobalScopes()->where('reference', $reference)->exists());

        return $reference;
    }
}
