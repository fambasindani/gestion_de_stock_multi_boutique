<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Inventaire;
use App\Models\LigneInventaire;
use App\Models\QuantiteStock;
use App\Models\EmplacementStock;
use App\Models\VarianteProduit;
use Illuminate\Http\Request;
use Illuminate\Database\Eloquent\ModelNotFoundException;
use Illuminate\Validation\ValidationException;
use Illuminate\Support\Facades\DB;
use Exception;

class InventaireController extends Controller
{
    /**
     * Liste des sessions d'inventaire
     */
    public function index(Request $request)
    {
        try {
            $query = Inventaire::with(['emplacement', 'utilisateur'])
                ->withCount('lignes');

            if ($request->filled('statut') && $request->statut !== 'all') {
                $query->where('statut', $request->statut);
            }
            if ($request->filled('emplacement_id')) {
                $query->where('emplacement_id', $request->emplacement_id);
            }
            if ($request->filled('search')) {
                $query->where('reference', 'LIKE', '%' . $request->search . '%');
            }

            $perPage = $request->input('per_page', 15);
            $inventaires = $query->orderBy('created_at', 'desc')->paginate($perPage);

            return response()->json([
                'success' => true,
                'data' => $inventaires,
                'message' => 'Liste des inventaires récupérée avec succès',
            ], 200);

        } catch (Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Erreur lors de la récupération des inventaires',
                'error' => $e->getMessage(),
            ], 500);
        }
    }

    /**
     * Créer une session d'inventaire (avec génération optionnelle des lignes)
     */
    public function store(Request $request)
    {
        try {
            DB::beginTransaction();

            $validated = $request->validate([
                'date_inventaire' => 'nullable|date',
                'emplacement_id' => 'nullable|exists:emplacement_stock,id',
                'notes' => 'nullable|string',
                'generer_lignes' => 'nullable|boolean',
            ]);

            $inventaire = Inventaire::create([
                'reference' => $this->generateReference(),
                'date_inventaire' => $validated['date_inventaire'] ?? now()->toDateString(),
                'emplacement_id' => $validated['emplacement_id'] ?? null,
                'statut' => 'en_cours',
                'notes' => $validated['notes'] ?? null,
                'utilisateur_id' => auth()->id(),
            ]);

            if ($request->boolean('generer_lignes', true)) {
                $this->genererLignesPour($inventaire);
            }

            DB::commit();

            $inventaire->load(['emplacement', 'utilisateur'])->loadCount('lignes');

            return response()->json([
                'success' => true,
                'data' => $inventaire,
                'message' => 'Inventaire créé avec succès',
            ], 201);

        } catch (ValidationException $e) {
            DB::rollBack();
            return response()->json([
                'success' => false,
                'message' => 'Erreur de validation',
                'errors' => $e->errors(),
            ], 422);

        } catch (Exception $e) {
            DB::rollBack();
            return response()->json([
                'success' => false,
                'message' => 'Erreur lors de la création de l\'inventaire',
                'error' => $e->getMessage(),
            ], 500);
        }
    }

    /**
     * Détail d'une session d'inventaire
     */
    public function show($id)
    {
        try {
            $inventaire = Inventaire::with([
                'emplacement',
                'utilisateur',
                'lignes.produit.modele',
                'lignes.produit.modele.categorie',
                'lignes.emplacement',
            ])->findOrFail($id);

            $lignes = $inventaire->lignes;
            $totaux = [
                'nombre_lignes' => $lignes->count(),
                'lignes_ajustees' => $lignes->where('ajuste', true)->count(),
                'total_ecart' => round($lignes->sum('ecart'), 2),
                'excédents' => round($lignes->where('ecart', '>', 0)->sum('ecart'), 2),
                'manquants' => round($lignes->where('ecart', '<', 0)->sum('ecart'), 2),
            ];

            return response()->json([
                'success' => true,
                'data' => [
                    'inventaire' => $inventaire,
                    'totaux' => $totaux,
                ],
                'message' => 'Inventaire récupéré avec succès',
            ], 200);

        } catch (ModelNotFoundException $e) {
            return response()->json([
                'success' => false,
                'message' => 'Inventaire non trouvé',
            ], 404);

        } catch (Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Erreur lors de la récupération de l\'inventaire',
                'error' => $e->getMessage(),
            ], 500);
        }
    }

    /**
     * Mettre à jour l'en-tête (date, notes, emplacement)
     */
    public function update(Request $request, $id)
    {
        try {
            $inventaire = Inventaire::findOrFail($id);

            $validated = $request->validate([
                'date_inventaire' => 'nullable|date',
                'emplacement_id' => 'nullable|exists:emplacement_stock,id',
                'notes' => 'nullable|string',
            ]);

            $inventaire->update($validated);

            return response()->json([
                'success' => true,
                'data' => $inventaire,
                'message' => 'Inventaire mis à jour avec succès',
            ], 200);

        } catch (ModelNotFoundException $e) {
            return response()->json(['success' => false, 'message' => 'Inventaire non trouvé'], 404);
        } catch (ValidationException $e) {
            return response()->json(['success' => false, 'message' => 'Erreur de validation', 'errors' => $e->errors()], 422);
        } catch (Exception $e) {
            return response()->json(['success' => false, 'message' => 'Erreur lors de la mise à jour', 'error' => $e->getMessage()], 500);
        }
    }

    /**
     * Supprimer une session non ajustée
     */
    public function destroy($id)
    {
        try {
            $inventaire = Inventaire::withCount(['lignes as lignes_ajustees_count' => function ($q) {
                $q->where('ajuste', true);
            }])->findOrFail($id);

            if ($inventaire->lignes_ajustees_count > 0) {
                return response()->json([
                    'success' => false,
                    'message' => 'Impossible de supprimer un inventaire déjà ajusté',
                ], 422);
            }

            $inventaire->delete();

            return response()->json([
                'success' => true,
                'message' => 'Inventaire supprimé avec succès',
            ], 200);

        } catch (ModelNotFoundException $e) {
            return response()->json(['success' => false, 'message' => 'Inventaire non trouvé'], 404);
        } catch (Exception $e) {
            return response()->json(['success' => false, 'message' => 'Erreur lors de la suppression', 'error' => $e->getMessage()], 500);
        }
    }

    /**
     * (Re)générer les lignes à partir du stock courant (ajoute les manquantes)
     */
    public function genererLignes($id)
    {
        try {
            DB::beginTransaction();

            $inventaire = Inventaire::findOrFail($id);
            $ajoutees = $this->genererLignesPour($inventaire);

            DB::commit();

            return response()->json([
                'success' => true,
                'data' => ['lignes_ajoutees' => $ajoutees],
                'message' => $ajoutees . ' ligne(s) générée(s)',
            ], 200);

        } catch (ModelNotFoundException $e) {
            DB::rollBack();
            return response()->json(['success' => false, 'message' => 'Inventaire non trouvé'], 404);
        } catch (Exception $e) {
            DB::rollBack();
            return response()->json(['success' => false, 'message' => 'Erreur lors de la génération des lignes', 'error' => $e->getMessage()], 500);
        }
    }

    /**
     * Ajouter une ligne manuellement
     */
    public function ajouterLigne(Request $request, $id)
    {
        try {
            DB::beginTransaction();

            $inventaire = Inventaire::findOrFail($id);

            $validated = $request->validate([
                'produit_id' => 'required|exists:variante_produit,id',
                'emplacement_id' => 'nullable|exists:emplacement_stock,id',
                'quantite_theorique' => 'nullable|numeric',
                'quantite_physique' => 'nullable|numeric|min:0',
                'notes' => 'nullable|string',
            ]);

            $emplacementId = $validated['emplacement_id'] ?? $inventaire->emplacement_id;

            $theorique = $validated['quantite_theorique']
                ?? QuantiteStock::where('produit_id', $validated['produit_id'])
                    ->when($emplacementId, fn ($q) => $q->where('emplacement_id', $emplacementId))
                    ->sum('quantite_disponible');

            $physique = $validated['quantite_physique'] ?? $theorique;

            $ligne = LigneInventaire::updateOrCreate(
                [
                    'inventaire_id' => $inventaire->id,
                    'produit_id' => $validated['produit_id'],
                    'emplacement_id' => $emplacementId,
                ],
                [
                    'quantite_theorique' => $theorique,
                    'quantite_physique' => $physique,
                    'ecart' => $physique - $theorique,
                    'notes' => $validated['notes'] ?? null,
                ]
            );

            $ligne->load(['produit.modele', 'emplacement']);

            DB::commit();

            return response()->json([
                'success' => true,
                'data' => $ligne,
                'message' => 'Ligne ajoutée avec succès',
            ], 201);

        } catch (ModelNotFoundException $e) {
            DB::rollBack();
            return response()->json(['success' => false, 'message' => 'Inventaire non trouvé'], 404);
        } catch (ValidationException $e) {
            DB::rollBack();
            return response()->json(['success' => false, 'message' => 'Erreur de validation', 'errors' => $e->errors()], 422);
        } catch (Exception $e) {
            DB::rollBack();
            return response()->json(['success' => false, 'message' => 'Erreur lors de l\'ajout de la ligne', 'error' => $e->getMessage()], 500);
        }
    }

    /**
     * Saisir / corriger la quantité physique d'une ligne
     */
    public function updateLigne(Request $request, $id, $ligneId)
    {
        try {
            $inventaire = Inventaire::findOrFail($id);
            $ligne = LigneInventaire::where('inventaire_id', $inventaire->id)->findOrFail($ligneId);

            if ($ligne->ajuste) {
                return response()->json([
                    'success' => false,
                    'message' => 'Cette ligne a déjà été ajustée',
                ], 422);
            }

            $validated = $request->validate([
                'quantite_physique' => 'required|numeric|min:0',
                'notes' => 'nullable|string',
            ]);

            $ligne->quantite_physique = $validated['quantite_physique'];
            $ligne->ecart = $ligne->quantite_physique - $ligne->quantite_theorique;
            if (array_key_exists('notes', $validated)) {
                $ligne->notes = $validated['notes'];
            }
            $ligne->save();

            return response()->json([
                'success' => true,
                'data' => $ligne,
                'message' => 'Ligne mise à jour avec succès',
            ], 200);

        } catch (ModelNotFoundException $e) {
            return response()->json(['success' => false, 'message' => 'Ligne non trouvée'], 404);
        } catch (ValidationException $e) {
            return response()->json(['success' => false, 'message' => 'Erreur de validation', 'errors' => $e->errors()], 422);
        } catch (Exception $e) {
            return response()->json(['success' => false, 'message' => 'Erreur lors de la mise à jour de la ligne', 'error' => $e->getMessage()], 500);
        }
    }

    /**
     * Supprimer une ligne non ajustée
     */
    public function supprimerLigne($id, $ligneId)
    {
        try {
            $inventaire = Inventaire::findOrFail($id);
            $ligne = LigneInventaire::where('inventaire_id', $inventaire->id)->findOrFail($ligneId);

            if ($ligne->ajuste) {
                return response()->json([
                    'success' => false,
                    'message' => 'Impossible de supprimer une ligne déjà ajustée',
                ], 422);
            }

            $ligne->delete();

            return response()->json([
                'success' => true,
                'message' => 'Ligne supprimée avec succès',
            ], 200);

        } catch (ModelNotFoundException $e) {
            return response()->json(['success' => false, 'message' => 'Ligne non trouvée'], 404);
        } catch (Exception $e) {
            return response()->json(['success' => false, 'message' => 'Erreur lors de la suppression de la ligne', 'error' => $e->getMessage()], 500);
        }
    }

    /**
     * Clôturer (sans appliquer les ajustements)
     */
    public function cloturer($id)
    {
        try {
            $inventaire = Inventaire::findOrFail($id);
            $inventaire->update([
                'statut' => 'cloture',
                'date_cloture' => now(),
            ]);

            return response()->json([
                'success' => true,
                'data' => $inventaire,
                'message' => 'Inventaire clôturé avec succès',
            ], 200);

        } catch (ModelNotFoundException $e) {
            return response()->json(['success' => false, 'message' => 'Inventaire non trouvé'], 404);
        } catch (Exception $e) {
            return response()->json(['success' => false, 'message' => 'Erreur lors de la clôture', 'error' => $e->getMessage()], 500);
        }
    }

    /**
     * Ajuster le stock : applique les écarts aux quantités disponibles puis clôture
     */
    public function ajuster($id)
    {
        try {
            DB::beginTransaction();

            $inventaire = Inventaire::with('lignes')->findOrFail($id);

            $ajustees = 0;
            foreach ($inventaire->lignes as $ligne) {
                if ($ligne->ajuste) {
                    continue;
                }

                $emplacementId = $ligne->emplacement_id ?? $inventaire->emplacement_id;
                if (!$emplacementId) {
                    continue;
                }

                $ecart = (float) $ligne->ecart;

                $stock = QuantiteStock::firstOrNew([
                    'produit_id' => $ligne->produit_id,
                    'emplacement_id' => $emplacementId,
                    'lot_id' => null,
                ]);

                if ($ecart !== 0.0) {
                    $stock->quantite_disponible = max(0, (float) ($stock->quantite_disponible ?? 0) + $ecart);
                    $stock->date_dernier_mouvement = now()->toDateString();
                    $stock->notes = trim(($stock->notes ?? '') . "\nAjustement inventaire {$inventaire->reference} le " . now()->toDateString());
                    $stock->save();
                }

                $ligne->ajuste = true;
                $ligne->save();
                $ajustees++;
            }

            $inventaire->update([
                'statut' => 'cloture',
                'date_cloture' => now(),
            ]);

            DB::commit();

            return response()->json([
                'success' => true,
                'data' => ['lignes_ajustees' => $ajustees],
                'message' => "Stock ajusté ({$ajustees} ligne(s)) et inventaire clôturé",
            ], 200);

        } catch (ModelNotFoundException $e) {
            DB::rollBack();
            return response()->json(['success' => false, 'message' => 'Inventaire non trouvé'], 404);
        } catch (Exception $e) {
            DB::rollBack();
            return response()->json(['success' => false, 'message' => 'Erreur lors de l\'ajustement', 'error' => $e->getMessage()], 500);
        }
    }

    /**
     * Génère les lignes d'inventaire à partir du stock courant.
     * Retourne le nombre de lignes créées.
     */
    private function genererLignesPour(Inventaire $inventaire): int
    {
        $query = QuantiteStock::query();

        if ($inventaire->emplacement_id) {
            $query->where('emplacement_id', $inventaire->emplacement_id);
        }

        $ajoutees = 0;
        $produitsVus = [];

        foreach ($query->get() as $stock) {
            $ligne = LigneInventaire::firstOrCreate(
                [
                    'inventaire_id' => $inventaire->id,
                    'produit_id' => $stock->produit_id,
                    'emplacement_id' => $stock->emplacement_id,
                ],
                [
                    'quantite_theorique' => $stock->quantite_disponible,
                    'quantite_physique' => $stock->quantite_disponible,
                    'ecart' => 0,
                ]
            );
            $produitsVus[$stock->produit_id] = true;
            if ($ligne->wasRecentlyCreated) {
                $ajoutees++;
            }
        }

        // Inclure aussi les produits actifs sans stock (quantité théorique = 0)
        $emplacementId = $inventaire->emplacement_id;
        $produits = VarianteProduit::where('actif', true)
            ->whereNotIn('id', array_keys($produitsVus) ?: [0])
            ->get();

        foreach ($produits as $produit) {
            $ligne = LigneInventaire::firstOrCreate(
                [
                    'inventaire_id' => $inventaire->id,
                    'produit_id' => $produit->id,
                    'emplacement_id' => $emplacementId,
                ],
                [
                    'quantite_theorique' => 0,
                    'quantite_physique' => 0,
                    'ecart' => 0,
                ]
            );
            if ($ligne->wasRecentlyCreated) {
                $ajoutees++;
            }
        }

        return $ajoutees;
    }

    /**
     * Référence unique du type INV-YYYYMM-0001
     */
    private function generateReference(): string
    {
        $prefix = 'INV-' . now()->format('Ym') . '-';
        $count = Inventaire::where('reference', 'LIKE', $prefix . '%')->count() + 1;

        do {
            $reference = $prefix . str_pad((string) $count, 4, '0', STR_PAD_LEFT);
            $count++;
        } while (Inventaire::where('reference', $reference)->exists());

        return $reference;
    }
}
