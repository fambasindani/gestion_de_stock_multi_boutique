<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Api\AuthController;
use App\Http\Controllers\Api\UtilisateurController;
use App\Http\Controllers\Api\RoleController;
use App\Http\Controllers\Api\PermissionController;
use App\Http\Controllers\Api\CategorieProduitController;
use App\Http\Controllers\Api\ProduitModeleController;
use App\Http\Controllers\Api\UniteMesureController;
use App\Http\Controllers\Api\PartenaireController;
use App\Http\Controllers\Api\CommandeVenteController;
use App\Http\Controllers\Api\CommandeAchatController;
use App\Http\Controllers\Api\EmplacementStockController;
use App\Http\Controllers\Api\LotTracabiliteController;
use App\Http\Controllers\Api\QuantiteStockController;
use App\Http\Controllers\Api\TransfertStockController;
use App\Http\Controllers\Api\LigneOperationStockController;
use App\Http\Controllers\Api\EcritureComptableController;
use App\Http\Controllers\Api\DashboardController;
use App\Http\Controllers\Api\AuditLogController;
use App\Http\Controllers\Api\RapportController;















// Routes publiques
Route::post('/auth/login', [AuthController::class, 'login']);

// Routes protégées par authentification
Route::middleware('auth:sanctum')->group(function () {

    // Auth
    Route::post('/auth/logout', [AuthController::class, 'logout']);
    Route::get('/auth/me', [AuthController::class, 'me']);

    // Utilisateurs
    Route::get('/utilisateurs', [UtilisateurController::class, 'index']);
    Route::get('/utilisateurs/{id}', [UtilisateurController::class, 'show']);
    Route::post('/utilisateurs', [UtilisateurController::class, 'store']);
    Route::put('/utilisateurs/{id}', [UtilisateurController::class, 'update']);
    Route::delete('/utilisateurs/{id}', [UtilisateurController::class, 'destroy']);

    // Rôles
    Route::get('/roles', [RoleController::class, 'index']);
    Route::get('/roles/{id}', [RoleController::class, 'show']);
    Route::post('/roles', [RoleController::class, 'store'])->middleware('permission:gerer_roles');
    Route::put('/roles/{id}', [RoleController::class, 'update'])->middleware('permission:gerer_roles');
    Route::delete('/roles/{id}', [RoleController::class, 'destroy'])->middleware('permission:gerer_roles');

    // Permissions
    Route::get('/permissions', [PermissionController::class, 'index']);
    Route::get('/permissions/{id}', [PermissionController::class, 'show']);
    Route::post('/permissions', [PermissionController::class, 'store'])->middleware('permission:gerer_permissions');
    Route::put('/permissions/{id}', [PermissionController::class, 'update'])->middleware('permission:gerer_permissions');
    Route::delete('/permissions/{id}', [PermissionController::class, 'destroy'])->middleware('permission:gerer_permissions');

    // Exemple de route supplémentaire pour assigner des rôles à un utilisateur
    Route::post('/utilisateurs/{id}/assign-roles', function (Request $request, $id) {
        // On peut l'ajouter dans le contrôleur ou ici
    })->middleware('permission:assigner_roles');


      // ✅ Catégories de produits
    Route::get('/categories', [CategorieProduitController::class, 'index']);
    Route::get('/categories/arborescence', [CategorieProduitController::class, 'arborescence']);
    Route::get('/categories/{id}', [CategorieProduitController::class, 'show']);
    Route::post('/categories', [CategorieProduitController::class, 'store'])->middleware('permission:gerer_categories');
    Route::put('/categories/{id}', [CategorieProduitController::class, 'update'])->middleware('permission:gerer_categories');
    Route::delete('/categories/{id}', [CategorieProduitController::class, 'destroy'])->middleware('permission:gerer_categories');





        Route::get('/produits', [ProduitModeleController::class, 'index']);
    Route::get('/produits/{id}', [ProduitModeleController::class, 'show']);
    Route::post('/produits', [ProduitModeleController::class, 'store'])->middleware('permission:gerer_produits');
    Route::put('/produits/{id}', [ProduitModeleController::class, 'update'])->middleware('permission:gerer_produits');
    Route::delete('/produits/{id}', [ProduitModeleController::class, 'destroy'])->middleware('permission:supprimer_produits');
    Route::post('/produits/{id}/activer', [ProduitModeleController::class, 'activer'])->middleware('permission:gerer_produits');
    Route::post('/produits/{id}/desactiver', [ProduitModeleController::class, 'desactiver'])->middleware('permission:gerer_produits');
    Route::delete('/variantes/{id}', [ProduitModeleController::class, 'supprimerVariante'])->middleware('permission:gerer_produits');



    // ✅ Unités de mesure
    Route::get('/unites-mesure', [UniteMesureController::class, 'index']);
    Route::get('/unites-mesure/actives', [UniteMesureController::class, 'actives']);
    Route::get('/unites-mesure/{id}', [UniteMesureController::class, 'show']);
    Route::post('/unites-mesure', [UniteMesureController::class, 'store'])->middleware('permission:gerer_unites');
    Route::put('/unites-mesure/{id}', [UniteMesureController::class, 'update'])->middleware('permission:gerer_unites');
    Route::delete('/unites-mesure/{id}', [UniteMesureController::class, 'destroy'])->middleware('permission:gerer_unites');
    Route::post('/unites-mesure/{id}/activer', [UniteMesureController::class, 'activer'])->middleware('permission:gerer_unites');
    Route::post('/unites-mesure/{id}/desactiver', [UniteMesureController::class, 'desactiver'])->middleware('permission:gerer_unites');





     // ✅ Partenaires (Clients & Fournisseurs)
    Route::get('/partenaires', [PartenaireController::class, 'index']);
    Route::get('/partenaires/clients', [PartenaireController::class, 'clients']);
    Route::get('/partenaires/fournisseurs', [PartenaireController::class, 'fournisseurs']);
    Route::get('/partenaires/{id}', [PartenaireController::class, 'show']);
    Route::post('/partenaires', [PartenaireController::class, 'store'])->middleware('permission:gerer_partenaires');
    Route::put('/partenaires/{id}', [PartenaireController::class, 'update'])->middleware('permission:gerer_partenaires');
    Route::delete('/partenaires/{id}', [PartenaireController::class, 'destroy'])->middleware('permission:gerer_partenaires');
    Route::post('/partenaires/{id}/activer', [PartenaireController::class, 'activer'])->middleware('permission:gerer_partenaires');
    Route::post('/partenaires/{id}/desactiver', [PartenaireController::class, 'desactiver'])->middleware('permission:gerer_partenaires');


     // ✅ Commandes de vente
    Route::get('/commandes-vente', [CommandeVenteController::class, 'index']);
    Route::get('/commandes-vente/{id}', [CommandeVenteController::class, 'show']);
    Route::post('/commandes-vente', [CommandeVenteController::class, 'store'])->middleware('permission:gerer_commandes');
    Route::put('/commandes-vente/{id}', [CommandeVenteController::class, 'update'])->middleware('permission:gerer_commandes');
    Route::delete('/commandes-vente/{id}', [CommandeVenteController::class, 'destroy'])->middleware('permission:gerer_commandes');
    Route::post('/commandes-vente/{id}/changer-etat', [CommandeVenteController::class, 'changerEtat'])->middleware('permission:gerer_commandes');
    Route::post('/commandes-vente/{id}/ajouter-ligne', [CommandeVenteController::class,
'ajouterLigne'])->middleware('permission:gerer_commandes');
    Route::post('/commandes-vente/{id}/generer-facture', [CommandeVenteController::class,
'genererFacture'])->middleware('permission:gerer_factures');
    Route::delete('/commandes-vente/{commandeId}/lignes/{ligneId}', [CommandeVenteController::class, 'supprimerLigne'])->middleware('permission:gerer_commandes');


      // ✅ Commandes d'achat
    Route::get('/commandes-achat', [CommandeAchatController::class, 'index']);
    Route::get('/commandes-achat/{id}', [CommandeAchatController::class, 'show']);
    Route::post('/commandes-achat', [CommandeAchatController::class, 'store'])->middleware('permission:gerer_achats');
    Route::put('/commandes-achat/{id}', [CommandeAchatController::class, 'update'])->middleware('permission:gerer_achats');
    Route::delete('/commandes-achat/{id}', [CommandeAchatController::class, 'destroy'])->middleware('permission:gerer_achats');
    Route::post('/commandes-achat/{id}/changer-etat', [CommandeAchatController::class, 'changerEtat'])->middleware('permission:gerer_achats');
    Route::post('/commandes-achat/{id}/ajouter-ligne', [CommandeAchatController::class, 'ajouterLigne'])->middleware('permission:gerer_achats');
    Route::delete('/commandes-achat/{commandeId}/lignes/{ligneId}', [CommandeAchatController::class, 'supprimerLigne'])->middleware('permission:gerer_achats');
    Route::post('/commandes-achat/{id}/receptionner', [CommandeAchatController::class, 'receptionner'])->middleware('permission:gerer_achats');



      // ✅ Emplacements de stock
    Route::get('/emplacements', [EmplacementStockController::class, 'index']);
    Route::get('/emplacements/arborescence', [EmplacementStockController::class, 'arborescence']);
    Route::get('/emplacements/{id}', [EmplacementStockController::class, 'show']);
    Route::get('/emplacements/{id}/chemin', [EmplacementStockController::class, 'chemin']);
    Route::post('/emplacements', [EmplacementStockController::class, 'store'])->middleware('permission:gerer_emplacements');
    Route::put('/emplacements/{id}', [EmplacementStockController::class, 'update'])->middleware('permission:gerer_emplacements');
    Route::delete('/emplacements/{id}', [EmplacementStockController::class, 'destroy'])->middleware('permission:gerer_emplacements');
    Route::post('/emplacements/{id}/activer', [EmplacementStockController::class, 'activer'])->middleware('permission:gerer_emplacements');
    Route::post('/emplacements/{id}/desactiver', [EmplacementStockController::class, 'desactiver'])->middleware('permission:gerer_emplacements');


    
 // ✅ Lots de traçabilité
    Route::get('/lots', [LotTracabiliteController::class, 'index']);
    Route::get('/lots/perimes', [LotTracabiliteController::class, 'perimes']);
    Route::get('/lots/peremption-proche', [LotTracabiliteController::class, 'peremptionProche']);
    Route::get('/lots/{id}', [LotTracabiliteController::class, 'show']);
    Route::post('/lots', [LotTracabiliteController::class, 'store'])->middleware('permission:gerer_lots');
    Route::put('/lots/{id}', [LotTracabiliteController::class, 'update'])->middleware('permission:gerer_lots');
    Route::delete('/lots/{id}', [LotTracabiliteController::class, 'destroy'])->middleware('permission:gerer_lots');
    Route::post('/lots/{id}/reserver', [LotTracabiliteController::class, 'reserver'])->middleware('permission:gerer_lots');
    Route::post('/lots/{id}/liberer', [LotTracabiliteController::class, 'liberer'])->middleware('permission:gerer_lots');


      // ✅ Quantités de stock
    Route::get('/stocks', [QuantiteStockController::class, 'index']);
    Route::get('/stocks/{id}', [QuantiteStockController::class, 'show']);
    Route::post('/stocks', [QuantiteStockController::class, 'store'])->middleware('permission:gerer_stock');
    Route::put('/stocks/{id}', [QuantiteStockController::class, 'update'])->middleware('permission:gerer_stock');
    Route::delete('/stocks/{id}', [QuantiteStockController::class, 'destroy'])->middleware('permission:gerer_stock');
    Route::post('/stocks/mouvement', [QuantiteStockController::class, 'mouvement'])->middleware('permission:gerer_stock');
    Route::get('/stocks/resume/produit/{produitId}', [QuantiteStockController::class, 'resumerProduit']);
    Route::get('/stocks/resume/emplacement/{emplacementId}', [QuantiteStockController::class, 'resumerEmplacement']);




  // ✅ Transferts de stock
    Route::get('/transferts', [TransfertStockController::class, 'index']);
    Route::get('/transferts/{id}', [TransfertStockController::class, 'show']);
    Route::post('/transferts', [TransfertStockController::class, 'store'])->middleware('permission:transferer_stock');
    Route::put('/transferts/{id}', [TransfertStockController::class, 'update'])->middleware('permission:transferer_stock');
    Route::delete('/transferts/{id}', [TransfertStockController::class, 'destroy'])->middleware('permission:transferer_stock');
    Route::post('/transferts/{id}/changer-etat', [TransfertStockController::class, 'changerEtat'])->middleware('permission:valider_transferts');
    Route::post('/transferts/{id}/valider', [TransfertStockController::class, 'valider'])->middleware('permission:valider_transferts');
    Route::post('/transferts/{id}/operations', [TransfertStockController::class, 'ajouterOperation'])->middleware('permission:transferer_stock');





 // ✅ Lignes d'opérations stock
    Route::get('/operations', [LigneOperationStockController::class, 'index']);
    Route::get('/operations/{id}', [LigneOperationStockController::class, 'show']);
    Route::get('/operations/mouvement/{mouvementId}', [LigneOperationStockController::class, 'parMouvement']);
    Route::post('/operations', [LigneOperationStockController::class, 'store'])->middleware('permission:transferer_stock');
    Route::delete('/operations/{id}', [LigneOperationStockController::class, 'destroy'])->middleware('permission:transferer_stock');


   // ✅ Écritures comptables (Facturation)
    Route::get('/factures', [EcritureComptableController::class, 'index']);
    Route::get('/factures/{id}', [EcritureComptableController::class, 'show']);
    Route::post('/factures', [EcritureComptableController::class, 'store'])->middleware('permission:gerer_factures');
    Route::put('/factures/{id}', [EcritureComptableController::class, 'update'])->middleware('permission:gerer_factures');
    Route::delete('/factures/{id}', [EcritureComptableController::class, 'destroy'])->middleware('permission:gerer_factures');
    Route::post('/factures/{id}/changer-statut', [EcritureComptableController::class, 'changerStatut'])->middleware('permission:gerer_factures');
    Route::post('/factures/{id}/paiement-partiel', [EcritureComptableController::class, 'paiementPartiel'])->middleware('permission:gerer_factures');


    // ... autres routes

    // ✅ Tableaux de bord (Dashboards)
    Route::get('/dashboard', [DashboardController::class, 'index']);
    Route::get('/dashboard/commandes', [DashboardController::class, 'commandes']);
    Route::get('/dashboard/stock', [DashboardController::class, 'stock']);
    Route::get('/dashboard/facturation', [DashboardController::class, 'facturation']);

    // ✅ Audit Logs
    Route::get('/audit-logs', [AuditLogController::class, 'index']);
    Route::get('/audit-logs/{id}', [AuditLogController::class, 'show']);

    // ✅ Rapports
    Route::get('/rapports/ventes', [RapportController::class, 'ventes']);
    Route::get('/rapports/achats', [RapportController::class, 'achats']);
    Route::get('/rapports/mouvements', [RapportController::class, 'mouvements']);
    Route::get('/rapports/stock', [RapportController::class, 'stock']);





























































});