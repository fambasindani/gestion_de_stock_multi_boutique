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
use App\Http\Controllers\Api\InventaireController;
use App\Http\Controllers\Api\SocieteController;
use App\Http\Controllers\Api\PosController;
use App\Http\Controllers\Api\ParametreController;
use App\Http\Controllers\Api\ProfilController;
use App\Http\Controllers\Api\RetourController;
use App\Http\Controllers\Api\NotificationController;















// Routes publiques
Route::post('/auth/login', [AuthController::class, 'login']);

// Logo de la société (public, via l'API pour bénéficier du CORS)
Route::get('/logo/{societe}', function ($societeId) {
    $societe = \App\Models\Societe::find($societeId);
    if (!$societe || !$societe->logo) {
        abort(404);
    }
    $path = public_path(ltrim($societe->logo, '/'));
    if (!is_file($path)) {
        abort(404);
    }
    return response()->file($path);
});

// Routes protégées par authentification
Route::middleware(['auth:sanctum', 'societe'])->group(function () {

    // Auth
    Route::post('/auth/logout', [AuthController::class, 'logout']);
    Route::get('/auth/me', [AuthController::class, 'me']);

    // Utilisateurs
    Route::get('/utilisateurs', [UtilisateurController::class, 'index'])->middleware('permission:gerer_utilisateurs');
    Route::get('/utilisateurs/{id}', [UtilisateurController::class, 'show'])->middleware('permission:gerer_utilisateurs');
    Route::post('/utilisateurs', [UtilisateurController::class, 'store'])->middleware('permission:gerer_utilisateurs');
    Route::put('/utilisateurs/{id}', [UtilisateurController::class, 'update'])->middleware('permission:gerer_utilisateurs');
    Route::delete('/utilisateurs/{id}', [UtilisateurController::class, 'destroy'])->middleware('permission:gerer_utilisateurs');

    // Rôles
    Route::get('/roles', [RoleController::class, 'index'])->middleware('permission:gerer_roles|assigner_roles');
    Route::get('/roles/{id}', [RoleController::class, 'show'])->middleware('permission:gerer_roles|assigner_roles');
    Route::post('/roles', [RoleController::class, 'store'])->middleware('permission:gerer_roles');
    Route::put('/roles/{id}', [RoleController::class, 'update'])->middleware('permission:gerer_roles');
    Route::delete('/roles/{id}', [RoleController::class, 'destroy'])->middleware('permission:gerer_roles');

    // Permissions
    Route::get('/permissions', [PermissionController::class, 'index'])->middleware('permission:gerer_permissions|gerer_roles');
    Route::get('/permissions/{id}', [PermissionController::class, 'show'])->middleware('permission:gerer_permissions');
    Route::post('/permissions', [PermissionController::class, 'store'])->middleware('permission:gerer_permissions');
    Route::put('/permissions/{id}', [PermissionController::class, 'update'])->middleware('permission:gerer_permissions');
    Route::delete('/permissions/{id}', [PermissionController::class, 'destroy'])->middleware('permission:gerer_permissions');

    // Assigner des rôles à un utilisateur
    Route::post('/utilisateurs/{id}/assign-roles', [UtilisateurController::class, 'assignerRoles'])
        ->middleware('permission:assigner_roles');


      // ✅ Catégories de produits
    Route::get('/categories', [CategorieProduitController::class, 'index'])->middleware('permission:voir_categories');
    Route::get('/categories/arborescence', [CategorieProduitController::class, 'arborescence'])->middleware('permission:voir_categories');
    Route::get('/categories/{id}', [CategorieProduitController::class, 'show'])->middleware('permission:voir_categories');
    Route::post('/categories', [CategorieProduitController::class, 'store'])->middleware('permission:gerer_categories');
    Route::put('/categories/{id}', [CategorieProduitController::class, 'update'])->middleware('permission:gerer_categories');
    Route::delete('/categories/{id}', [CategorieProduitController::class, 'destroy'])->middleware('permission:gerer_categories');





        Route::get('/produits', [ProduitModeleController::class, 'index'])->middleware('permission:voir_produits');
    Route::get('/produits/scan/{code}', [ProduitModeleController::class, 'scan'])->middleware('permission:voir_produits');
    Route::get('/produits/{id}', [ProduitModeleController::class, 'show'])->middleware('permission:voir_produits');
    Route::post('/produits', [ProduitModeleController::class, 'store'])->middleware('permission:gerer_produits');
    Route::put('/produits/{id}', [ProduitModeleController::class, 'update'])->middleware('permission:gerer_produits');
    Route::delete('/produits/{id}', [ProduitModeleController::class, 'destroy'])->middleware('permission:supprimer_produits');
    Route::post('/produits/{id}/activer', [ProduitModeleController::class, 'activer'])->middleware('permission:gerer_produits');
    Route::post('/produits/{id}/desactiver', [ProduitModeleController::class, 'desactiver'])->middleware('permission:gerer_produits');
    Route::delete('/variantes/{id}', [ProduitModeleController::class, 'supprimerVariante'])->middleware('permission:gerer_produits');



    // ✅ Unités de mesure
    Route::get('/unites-mesure', [UniteMesureController::class, 'index'])->middleware('permission:voir_unites');
    Route::get('/unites-mesure/actives', [UniteMesureController::class, 'actives'])->middleware('permission:voir_unites');
    Route::get('/unites-mesure/{id}', [UniteMesureController::class, 'show'])->middleware('permission:voir_unites');
    Route::post('/unites-mesure', [UniteMesureController::class, 'store'])->middleware('permission:gerer_unites');
    Route::put('/unites-mesure/{id}', [UniteMesureController::class, 'update'])->middleware('permission:gerer_unites');
    Route::delete('/unites-mesure/{id}', [UniteMesureController::class, 'destroy'])->middleware('permission:gerer_unites');
    Route::post('/unites-mesure/{id}/activer', [UniteMesureController::class, 'activer'])->middleware('permission:gerer_unites');
    Route::post('/unites-mesure/{id}/desactiver', [UniteMesureController::class, 'desactiver'])->middleware('permission:gerer_unites');





     // ✅ Partenaires (Clients & Fournisseurs)
    Route::get('/partenaires', [PartenaireController::class, 'index'])->middleware('permission:voir_partenaires');
    Route::get('/partenaires/clients', [PartenaireController::class, 'clients'])->middleware('permission:voir_partenaires');
    Route::get('/partenaires/fournisseurs', [PartenaireController::class, 'fournisseurs'])->middleware('permission:voir_partenaires');
    Route::get('/partenaires/{id}', [PartenaireController::class, 'show'])->middleware('permission:voir_partenaires');
    Route::post('/partenaires', [PartenaireController::class, 'store'])->middleware('permission:gerer_partenaires');
    Route::put('/partenaires/{id}', [PartenaireController::class, 'update'])->middleware('permission:gerer_partenaires');
    Route::delete('/partenaires/{id}', [PartenaireController::class, 'destroy'])->middleware('permission:gerer_partenaires');
    Route::post('/partenaires/{id}/activer', [PartenaireController::class, 'activer'])->middleware('permission:gerer_partenaires');
    Route::post('/partenaires/{id}/desactiver', [PartenaireController::class, 'desactiver'])->middleware('permission:gerer_partenaires');


     // ✅ Commandes de vente
    Route::get('/commandes-vente', [CommandeVenteController::class, 'index'])->middleware('permission:voir_commandes');
    Route::get('/commandes-vente/{id}', [CommandeVenteController::class, 'show'])->middleware('permission:voir_commandes');
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
    Route::get('/commandes-achat', [CommandeAchatController::class, 'index'])->middleware('permission:gerer_achats');
    Route::get('/commandes-achat/{id}', [CommandeAchatController::class, 'show'])->middleware('permission:gerer_achats');
    Route::post('/commandes-achat', [CommandeAchatController::class, 'store'])->middleware('permission:gerer_achats');
    Route::put('/commandes-achat/{id}', [CommandeAchatController::class, 'update'])->middleware('permission:gerer_achats');
    Route::delete('/commandes-achat/{id}', [CommandeAchatController::class, 'destroy'])->middleware('permission:gerer_achats');
    Route::post('/commandes-achat/{id}/changer-etat', [CommandeAchatController::class, 'changerEtat'])->middleware('permission:gerer_achats');
    Route::post('/commandes-achat/{id}/ajouter-ligne', [CommandeAchatController::class, 'ajouterLigne'])->middleware('permission:gerer_achats');
    Route::delete('/commandes-achat/{commandeId}/lignes/{ligneId}', [CommandeAchatController::class, 'supprimerLigne'])->middleware('permission:gerer_achats');
    Route::post('/commandes-achat/{id}/receptionner', [CommandeAchatController::class, 'receptionner'])->middleware('permission:gerer_achats');



      // ✅ Emplacements de stock
    Route::get('/emplacements', [EmplacementStockController::class, 'index'])->middleware('permission:voir_emplacements');
    Route::get('/emplacements/arborescence', [EmplacementStockController::class, 'arborescence'])->middleware('permission:voir_emplacements');
    Route::get('/emplacements/{id}', [EmplacementStockController::class, 'show'])->middleware('permission:voir_emplacements');
    Route::get('/emplacements/{id}/chemin', [EmplacementStockController::class, 'chemin'])->middleware('permission:voir_emplacements');
    Route::post('/emplacements', [EmplacementStockController::class, 'store'])->middleware('permission:gerer_emplacements');
    Route::put('/emplacements/{id}', [EmplacementStockController::class, 'update'])->middleware('permission:gerer_emplacements');
    Route::delete('/emplacements/{id}', [EmplacementStockController::class, 'destroy'])->middleware('permission:gerer_emplacements');
    Route::post('/emplacements/{id}/activer', [EmplacementStockController::class, 'activer'])->middleware('permission:gerer_emplacements');
    Route::post('/emplacements/{id}/desactiver', [EmplacementStockController::class, 'desactiver'])->middleware('permission:gerer_emplacements');


    
 // ✅ Lots de traçabilité
    Route::get('/lots', [LotTracabiliteController::class, 'index'])->middleware('permission:voir_lots');
    Route::get('/lots/perimes', [LotTracabiliteController::class, 'perimes'])->middleware('permission:voir_lots');
    Route::get('/lots/peremption-proche', [LotTracabiliteController::class, 'peremptionProche'])->middleware('permission:voir_lots');
    Route::get('/lots/{id}', [LotTracabiliteController::class, 'show'])->middleware('permission:voir_lots');
    Route::post('/lots', [LotTracabiliteController::class, 'store'])->middleware('permission:gerer_lots');
    Route::put('/lots/{id}', [LotTracabiliteController::class, 'update'])->middleware('permission:gerer_lots');
    Route::delete('/lots/{id}', [LotTracabiliteController::class, 'destroy'])->middleware('permission:gerer_lots');
    Route::post('/lots/{id}/reserver', [LotTracabiliteController::class, 'reserver'])->middleware('permission:gerer_lots');
    Route::post('/lots/{id}/liberer', [LotTracabiliteController::class, 'liberer'])->middleware('permission:gerer_lots');


      // ✅ Quantités de stock
    Route::get('/stocks', [QuantiteStockController::class, 'index'])->middleware('permission:voir_stock');
    Route::get('/stocks/{id}', [QuantiteStockController::class, 'show'])->middleware('permission:voir_stock');
    Route::post('/stocks', [QuantiteStockController::class, 'store'])->middleware('permission:gerer_stock');
    Route::put('/stocks/{id}', [QuantiteStockController::class, 'update'])->middleware('permission:gerer_stock');
    Route::delete('/stocks/{id}', [QuantiteStockController::class, 'destroy'])->middleware('permission:gerer_stock');
    Route::post('/stocks/mouvement', [QuantiteStockController::class, 'mouvement'])->middleware('permission:gerer_stock');
    Route::get('/stocks/resume/produit/{produitId}', [QuantiteStockController::class, 'resumerProduit'])->middleware('permission:voir_stock');
    Route::get('/stocks/resume/emplacement/{emplacementId}', [QuantiteStockController::class, 'resumerEmplacement'])->middleware('permission:voir_stock');

    // Retours en stock (client / fournisseur / casse)
    Route::get('/retours', [RetourController::class, 'index'])->middleware('permission:voir_retours');
    Route::post('/retours', [RetourController::class, 'store'])->middleware('permission:gerer_retours');
    Route::get('/retours/{id}', [RetourController::class, 'show'])->middleware('permission:voir_retours');
    Route::post('/retours/{id}/valider', [RetourController::class, 'valider'])->middleware('permission:valider_retours');
    Route::delete('/retours/{id}', [RetourController::class, 'destroy'])->middleware('permission:gerer_retours');

    // Inventaires & ajustements
    Route::get('/inventaires', [InventaireController::class, 'index'])->middleware('permission:voir_inventaire');
    Route::post('/inventaires', [InventaireController::class, 'store'])->middleware('permission:gerer_inventaire');
    Route::get('/inventaires/{id}', [InventaireController::class, 'show'])->middleware('permission:voir_inventaire');
    Route::put('/inventaires/{id}', [InventaireController::class, 'update'])->middleware('permission:gerer_inventaire');
    Route::delete('/inventaires/{id}', [InventaireController::class, 'destroy'])->middleware('permission:gerer_inventaire');
    Route::post('/inventaires/{id}/generer-lignes', [InventaireController::class, 'genererLignes'])->middleware('permission:gerer_inventaire');
    Route::post('/inventaires/{id}/lignes', [InventaireController::class, 'ajouterLigne'])->middleware('permission:gerer_inventaire');
    Route::put('/inventaires/{id}/lignes/{ligneId}', [InventaireController::class, 'updateLigne'])->middleware('permission:gerer_inventaire');
    Route::delete('/inventaires/{id}/lignes/{ligneId}', [InventaireController::class, 'supprimerLigne'])->middleware('permission:gerer_inventaire');
    Route::post('/inventaires/{id}/cloturer', [InventaireController::class, 'cloturer'])->middleware('permission:gerer_inventaire');
    Route::post('/inventaires/{id}/ajuster', [InventaireController::class, 'ajuster'])->middleware('permission:valider_inventaire');

    // Notifications (stock, retours, abonnement)
    Route::get('/notifications', [NotificationController::class, 'index']);

    // Profil de l'utilisateur connecté
    Route::get('/profil', [ProfilController::class, 'show']);
    Route::put('/profil', [ProfilController::class, 'update']);
    Route::put('/profil/password', [ProfilController::class, 'updatePassword']);

    // Point de vente (vente comptoir) + ticket
    Route::post('/pos/vendre', [PosController::class, 'vendre'])->middleware('permission:vendre_pos');
    Route::get('/pos/journal', [PosController::class, 'journal'])->middleware('permission:vendre_pos');
    Route::post('/pos/cloturer', [PosController::class, 'cloturer'])->middleware('permission:vendre_pos');
    Route::post('/pos/reouvrir', [PosController::class, 'reouvrir'])->middleware('permission:gerer_parametres');

    // Paramètres (TVA, entreprise, ticket)
    Route::get('/parametres', [ParametreController::class, 'index']);
    Route::put('/parametres', [ParametreController::class, 'update'])->middleware('permission:gerer_parametres');

    // Logo de sa propre boutique (propriétaire / gérant)
    Route::post('/societe/logo', [SocieteController::class, 'uploadMonLogo'])->middleware('permission:gerer_parametres');
    Route::delete('/societe/logo', [SocieteController::class, 'deleteMonLogo'])->middleware('permission:gerer_parametres');

    // Sociétés / abonnements (permission gerer_societes ou super-admin)
    Route::middleware('permission:gerer_societes')->group(function () {
        Route::get('/societes', [SocieteController::class, 'index']);
        Route::post('/societes', [SocieteController::class, 'store']);
        Route::get('/societes/{id}', [SocieteController::class, 'show']);
        Route::put('/societes/{id}', [SocieteController::class, 'update']);
        Route::delete('/societes/{id}', [SocieteController::class, 'destroy']);
        Route::post('/societes/{id}/activer', [SocieteController::class, 'activer']);
        Route::post('/societes/{id}/desactiver', [SocieteController::class, 'desactiver']);
        Route::post('/societes/{id}/logo', [SocieteController::class, 'uploadLogo']);
    });




  // ✅ Transferts de stock
    Route::get('/transferts', [TransfertStockController::class, 'index'])->middleware('permission:voir_stock');
    Route::get('/transferts/{id}', [TransfertStockController::class, 'show'])->middleware('permission:voir_stock');
    Route::post('/transferts', [TransfertStockController::class, 'store'])->middleware('permission:transferer_stock');
    Route::put('/transferts/{id}', [TransfertStockController::class, 'update'])->middleware('permission:transferer_stock');
    Route::delete('/transferts/{id}', [TransfertStockController::class, 'destroy'])->middleware('permission:transferer_stock');
    Route::post('/transferts/{id}/changer-etat', [TransfertStockController::class, 'changerEtat'])->middleware('permission:valider_transferts');
    Route::post('/transferts/{id}/valider', [TransfertStockController::class, 'valider'])->middleware('permission:valider_transferts');
    Route::post('/transferts/{id}/operations', [TransfertStockController::class, 'ajouterOperation'])->middleware('permission:transferer_stock');





 // ✅ Lignes d'opérations stock
    Route::get('/operations', [LigneOperationStockController::class, 'index'])->middleware('permission:voir_stock');
    Route::get('/operations/{id}', [LigneOperationStockController::class, 'show'])->middleware('permission:voir_stock');
    Route::get('/operations/mouvement/{mouvementId}', [LigneOperationStockController::class, 'parMouvement'])->middleware('permission:voir_stock');
    Route::post('/operations', [LigneOperationStockController::class, 'store'])->middleware('permission:transferer_stock');
    Route::delete('/operations/{id}', [LigneOperationStockController::class, 'destroy'])->middleware('permission:transferer_stock');


   // ✅ Écritures comptables (Facturation)
    Route::get('/factures', [EcritureComptableController::class, 'index'])->middleware('permission:voir_factures');
    Route::get('/factures/{id}', [EcritureComptableController::class, 'show'])->middleware('permission:voir_factures');
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
    Route::get('/audit-logs', [AuditLogController::class, 'index'])->middleware('permission:gerer_utilisateurs');
    Route::get('/audit-logs/{id}', [AuditLogController::class, 'show'])->middleware('permission:gerer_utilisateurs');

    // ✅ Rapports
    Route::get('/rapports/ventes', [RapportController::class, 'ventes'])->middleware('permission:voir_rapports');
    Route::get('/rapports/achats', [RapportController::class, 'achats'])->middleware('permission:voir_rapports');
    Route::get('/rapports/mouvements', [RapportController::class, 'mouvements'])->middleware('permission:voir_rapports');
    Route::get('/rapports/stock', [RapportController::class, 'stock'])->middleware('permission:voir_rapports');
    Route::get('/rapports/bons-commande', [RapportController::class, 'bonsCommande'])->middleware('permission:voir_rapports');
    Route::get('/rapports/rupture-stock', [RapportController::class, 'ruptureStock'])->middleware('permission:voir_rapports');
    Route::get('/rapports/stock-bas', [RapportController::class, 'stockBas'])->middleware('permission:voir_rapports');
    Route::get('/rapports/variations-prix', [RapportController::class, 'variationsPrix'])->middleware('permission:voir_rapports');
    Route::get('/rapports/ca-partenaires', [RapportController::class, 'caPartenaires'])->middleware('permission:voir_rapports');
    Route::get('/rapports/ventes-vendeurs', [RapportController::class, 'ventesVendeurs'])->middleware('permission:voir_rapports');
    Route::get('/rapports/ventes-vendeurs/{utilisateurId}', [RapportController::class, 'ventesVendeurDetails'])->middleware('permission:voir_rapports');





























































});