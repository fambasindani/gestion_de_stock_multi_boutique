import 'package:dio/dio.dart';
import '../models/models.dart';
import 'api_client.dart';

List<dynamic> _extractList(Map<String, dynamic> response) {
  final raw = response['data'];
  if (raw is List) return raw;
  if (raw is Map) return (raw['data'] as List?) ?? [];
  return [];
}

class ProduitService {
  final ApiClient _api = ApiClient();

  Future<List<ProduitModele>> getAll({String? search, int page = 1}) async {
    final params = <String, dynamic>{'page': page, 'modele': true};
    if (search != null && search.isNotEmpty) params['search'] = search;
    final data = await _api.get('/produits', params: params);
    return _extractList(data).map((e) => ProduitModele.fromJson(e)).toList();
  }

  Future<ProduitModele> getById(int id) async {
    final data = await _api.get('/produits/$id');
    return ProduitModele.fromJson(data['data'] ?? data);
  }

  Future<ProduitModele> create(Map<String, dynamic> body) async {
    final data = await _api.post('/produits', data: body);
    return ProduitModele.fromJson(data['data'] ?? data);
  }

  Future<ProduitModele> update(int id, Map<String, dynamic> body) async {
    final data = await _api.put('/produits/$id', data: body);
    return ProduitModele.fromJson(data['data'] ?? data);
  }

  Future<void> delete(int id) async {
    await _api.delete('/produits/$id');
  }

  Future<List<ProduitModele>> searchByBarcode(String barcode) async {
    // Endpoint dédié au scan (code-barres / QR)
    final data = await _api.get('/produits/scan/${Uri.encodeComponent(barcode)}');
    final raw = data['data'];
    if (raw is List) {
      return raw.map((e) => ProduitModele.fromJson(e)).toList();
    }
    if (raw is Map<String, dynamic>) {
      if (raw['variantes'] != null || raw['nom'] != null) {
        return [ProduitModele.fromJson(raw)];
      }
      final inner = raw['data'];
      if (inner is List) return inner.map((e) => ProduitModele.fromJson(e)).toList();
    }
    return [];
  }
}

class PartenaireService {
  final ApiClient _api = ApiClient();

  Future<List<Partenaire>> getAll({String? search}) async {
    final params = <String, dynamic>{};
    if (search != null && search.isNotEmpty) params['search'] = search;
    final data = await _api.get('/partenaires', params: params);
    return _extractList(data).map((e) => Partenaire.fromJson(e)).toList();
  }

  Future<Partenaire> getById(int id) async {
    final data = await _api.get('/partenaires/$id');
    return Partenaire.fromJson(data['data'] ?? data);
  }

  Future<Partenaire> create(Map<String, dynamic> body) async {
    final data = await _api.post('/partenaires', data: body);
    return Partenaire.fromJson(data['data'] ?? data);
  }

  Future<Partenaire> update(int id, Map<String, dynamic> body) async {
    final data = await _api.put('/partenaires/$id', data: body);
    return Partenaire.fromJson(data['data'] ?? data);
  }

  Future<void> delete(int id) async {
    await _api.delete('/partenaires/$id');
  }
}

class CommandeVenteService {
  final ApiClient _api = ApiClient();

  Future<List<CommandeVente>> getAll({String? search, String? etat}) async {
    final params = <String, dynamic>{};
    if (search != null && search.isNotEmpty) params['search'] = search;
    if (etat != null) params['etat'] = etat;
    final data = await _api.get('/commandes-vente', params: params);
    return _extractList(data).map((e) => CommandeVente.fromJson(e)).toList();
  }

  Future<CommandeVente> getById(int id) async {
    final data = await _api.get('/commandes-vente/$id');
    return CommandeVente.fromJson(data['data'] ?? data);
  }

  Future<CommandeVente> create(Map<String, dynamic> body) async {
    final data = await _api.post('/commandes-vente', data: body);
    return CommandeVente.fromJson(data['data'] ?? data);
  }

  Future<CommandeVente> update(int id, Map<String, dynamic> body) async {
    final data = await _api.put('/commandes-vente/$id', data: body);
    return CommandeVente.fromJson(data['data'] ?? data);
  }

  Future<void> delete(int id) async {
    await _api.delete('/commandes-vente/$id');
  }

  Future<void> changerEtat(int id, String etat) async {
    await _api.post('/commandes-vente/$id/changer-etat', data: {'etat': etat});
  }

  Future<EcritureComptable> genererFacture(int id) async {
    final data = await _api.post('/commandes-vente/$id/generer-facture');
    return EcritureComptable.fromJson(data['data'] ?? data);
  }
}

class CommandeAchatService {
  final ApiClient _api = ApiClient();

  Future<List<CommandeAchat>> getAll({String? search, String? etat}) async {
    final params = <String, dynamic>{};
    if (search != null && search.isNotEmpty) params['search'] = search;
    if (etat != null) params['etat'] = etat;
    final data = await _api.get('/commandes-achat', params: params);
    return _extractList(data).map((e) => CommandeAchat.fromJson(e)).toList();
  }

  Future<CommandeAchat> getById(int id) async {
    final data = await _api.get('/commandes-achat/$id');
    return CommandeAchat.fromJson(data['data'] ?? data);
  }

  Future<CommandeAchat> create(Map<String, dynamic> body) async {
    final data = await _api.post('/commandes-achat', data: body);
    return CommandeAchat.fromJson(data['data'] ?? data);
  }

  Future<CommandeAchat> update(int id, Map<String, dynamic> body) async {
    final data = await _api.put('/commandes-achat/$id', data: body);
    return CommandeAchat.fromJson(data['data'] ?? data);
  }

  Future<void> delete(int id) async {
    await _api.delete('/commandes-achat/$id');
  }

  Future<void> changerEtat(int id, String etat) async {
    await _api.post('/commandes-achat/$id/changer-etat', data: {'etat': etat});
  }

  Future<void> receptionner(int id, {List<Map<String, dynamic>>? lignes}) async {
    await _api.post('/commandes-achat/$id/receptionner', data: {
      if (lignes != null) 'lignes': lignes,
    });
  }
}

class StockService {
  final ApiClient _api = ApiClient();

  // -- Quantités --
  Future<List<QuantiteStock>> getQuantites({int? emplacementId, String? search, int page = 1}) async {
    final params = <String, dynamic>{'page': page};
    if (emplacementId != null) params['emplacement_id'] = emplacementId;
    if (search != null && search.isNotEmpty) params['search'] = search;
    final data = await _api.get('/stocks', params: params);
    return _extractList(data).map((e) => QuantiteStock.fromJson(e)).toList();
  }

  Future<QuantiteStock> createQuantite(Map<String, dynamic> body) async {
    final data = await _api.post('/stocks', data: body);
    return QuantiteStock.fromJson(data['data'] ?? data);
  }

  Future<QuantiteStock> updateQuantite(int id, Map<String, dynamic> body) async {
    final data = await _api.put('/stocks/$id', data: body);
    return QuantiteStock.fromJson(data['data'] ?? data);
  }

  Future<void> deleteQuantite(int id) async {
    await _api.delete('/stocks/$id');
  }

  // -- Emplacements --
  Future<List<EmplacementStock>> getEmplacements({String? search}) async {
    final params = <String, dynamic>{};
    if (search != null && search.isNotEmpty) params['search'] = search;
    final data = await _api.get('/emplacements', params: params);
    return _extractList(data).map((e) => EmplacementStock.fromJson(e)).toList();
  }

  Future<List<EmplacementStock>> getArborescence() async {
    final data = await _api.get('/emplacements/arborescence');
    return (data['data'] as List?)?.map((e) => EmplacementStock.fromJson(e)).toList() ?? [];
  }

  Future<EmplacementStock> getEmplacement(int id) async {
    final data = await _api.get('/emplacements/$id');
    return EmplacementStock.fromJson(data['data'] ?? data);
  }

  Future<EmplacementStock> createEmplacement(Map<String, dynamic> body) async {
    final data = await _api.post('/emplacements', data: body);
    return EmplacementStock.fromJson(data['data'] ?? data);
  }

  Future<EmplacementStock> updateEmplacement(int id, Map<String, dynamic> body) async {
    final data = await _api.put('/emplacements/$id', data: body);
    return EmplacementStock.fromJson(data['data'] ?? data);
  }

  Future<void> deleteEmplacement(int id) async {
    await _api.delete('/emplacements/$id');
  }

  // -- Lots --
  Future<List<LotTracabilite>> getLots({String? search, String? statut}) async {
    final params = <String, dynamic>{};
    if (search != null && search.isNotEmpty) params['search'] = search;
    if (statut != null) params['statut'] = statut;
    final data = await _api.get('/lots', params: params);
    return _extractList(data).map((e) => LotTracabilite.fromJson(e)).toList();
  }

  Future<LotTracabilite> getLot(int id) async {
    final data = await _api.get('/lots/$id');
    return LotTracabilite.fromJson(data['data'] ?? data);
  }

  Future<LotTracabilite> createLot(Map<String, dynamic> body) async {
    final data = await _api.post('/lots', data: body);
    return LotTracabilite.fromJson(data['data'] ?? data);
  }

  Future<LotTracabilite> updateLot(int id, Map<String, dynamic> body) async {
    final data = await _api.put('/lots/$id', data: body);
    return LotTracabilite.fromJson(data['data'] ?? data);
  }

  Future<void> deleteLot(int id) async {
    await _api.delete('/lots/$id');
  }

  Future<void> reserverLot(int id, double quantite) async {
    await _api.post('/lots/$id/reserver', data: {'quantite': quantite});
  }

  Future<void> libererLot(int id, double quantite) async {
    await _api.post('/lots/$id/liberer', data: {'quantite': quantite});
  }

  // -- Transferts --
  Future<List<TransfertStock>> getTransferts({String? search, String? etat, String? type, int page = 1}) async {
    final params = <String, dynamic>{'page': page};
    if (search != null && search.isNotEmpty) params['search'] = search;
    if (etat != null) params['etat'] = etat;
    if (type != null) params['type'] = type;
    final data = await _api.get('/transferts', params: params);
    return _extractList(data).map((e) => TransfertStock.fromJson(e)).toList();
  }

  Future<TransfertStock> getTransfert(int id) async {
    final data = await _api.get('/transferts/$id');
    return TransfertStock.fromJson(data['data'] ?? data);
  }

  Future<TransfertStock> createTransfert(Map<String, dynamic> body) async {
    final data = await _api.post('/transferts', data: body);
    return TransfertStock.fromJson(data['data'] ?? data);
  }

  Future<TransfertStock> updateTransfert(int id, Map<String, dynamic> body) async {
    final data = await _api.put('/transferts/$id', data: body);
    return TransfertStock.fromJson(data['data'] ?? data);
  }

  Future<void> deleteTransfert(int id) async {
    await _api.delete('/transferts/$id');
  }

  Future<void> changerEtatTransfert(int id, String etat) async {
    await _api.post('/transferts/$id/changer-etat', data: {'etat': etat});
  }

  Future<void> validerTransfert(int id) async {
    await _api.post('/transferts/$id/valider');
  }

  Future<void> ajouterOperation(int transfertId, Map<String, dynamic> body) async {
    await _api.post('/transferts/$transfertId/operations', data: body);
  }
}

class FactureService {
  final ApiClient _api = ApiClient();

  Future<List<EcritureComptable>> getAll({String? search, String? statut, String? type}) async {
    final params = <String, dynamic>{};
    if (search != null && search.isNotEmpty) params['search'] = search;
    if (statut != null) params['statut'] = statut;
    if (type != null) params['type'] = type;
    final data = await _api.get('/factures', params: params);
    return _extractList(data).map((e) => EcritureComptable.fromJson(e)).toList();
  }

  Future<EcritureComptable> getById(int id) async {
    final data = await _api.get('/factures/$id');
    return EcritureComptable.fromJson(data['data'] ?? data);
  }

  Future<EcritureComptable> create(Map<String, dynamic> body) async {
    final data = await _api.post('/factures', data: body);
    return EcritureComptable.fromJson(data['data'] ?? data);
  }

  Future<EcritureComptable> update(int id, Map<String, dynamic> body) async {
    final data = await _api.put('/factures/$id', data: body);
    return EcritureComptable.fromJson(data['data'] ?? data);
  }

  Future<void> delete(int id) async {
    await _api.delete('/factures/$id');
  }

  Future<void> changerStatut(int id, String statut) async {
    await _api.post('/factures/$id/changer-statut', data: {'statut': statut});
  }

  Future<void> paiementPartiel(int id, double montant, {String? modePaiement}) async {
    await _api.post('/factures/$id/paiement-partiel', data: {
      'montant': montant,
      if (modePaiement != null) 'mode_paiement': modePaiement,
    });
  }
}


class UserService {
  final ApiClient _api = ApiClient();

  Future<List<Utilisateur>> getAll({String? search}) async {
    final params = <String, dynamic>{};
    if (search != null && search.isNotEmpty) params['search'] = search;
    final data = await _api.get('/utilisateurs', params: params);
    return _extractList(data).map((e) => Utilisateur.fromJson(e)).toList();
  }

  Future<Utilisateur> getById(int id) async {
    final data = await _api.get('/utilisateurs/$id');
    return Utilisateur.fromJson(data['data'] ?? data);
  }

  /// Détail complet : utilisateur + permissions + statistiques + activité.
  Future<Map<String, dynamic>> getDetails(int id) async {
    return await _api.get('/utilisateurs/$id');
  }

  /// Liste paginée.
  Future<Map<String, dynamic>> getPage({String? search, int page = 1, int perPage = 15}) async {
    final params = <String, dynamic>{'page': page, 'per_page': perPage};
    if (search != null && search.isNotEmpty) params['search'] = search;
    final data = await _api.get('/utilisateurs', params: params);
    final raw = data['data'];
    final items = raw is List ? raw.map((e) => Utilisateur.fromJson(e as Map<String, dynamic>)).toList() : <Utilisateur>[];
    return {
      'items': items,
      'total': data['total'] ?? items.length,
      'last_page': data['last_page'] ?? 1,
    };
  }

  Future<Utilisateur> create(Map<String, dynamic> body) async {
    final data = await _api.post('/utilisateurs', data: body);
    return Utilisateur.fromJson(data['data'] ?? data);
  }

  Future<Utilisateur> update(int id, Map<String, dynamic> body) async {
    final data = await _api.put('/utilisateurs/$id', data: body);
    return Utilisateur.fromJson(data['data'] ?? data);
  }

  Future<void> delete(int id) async {
    await _api.delete('/utilisateurs/$id');
  }

  Future<void> assignRoles(int id, List<int> roleIds) async {
    await _api.post('/utilisateurs/$id/assign-roles', data: {'roles': roleIds});
  }
}

class RoleService {
  final ApiClient _api = ApiClient();

  Future<List<Role>> getAll({String? search}) async {
    final params = <String, dynamic>{};
    if (search != null && search.isNotEmpty) params['search'] = search;
    final data = await _api.get('/roles', params: params);
    return _extractList(data).map((e) => Role.fromJson(e)).toList();
  }

  Future<Role> getById(int id) async {
    final data = await _api.get('/roles/$id');
    return Role.fromJson(data['data'] ?? data);
  }

  Future<Role> create(Map<String, dynamic> body) async {
    final data = await _api.post('/roles', data: body);
    return Role.fromJson(data['data'] ?? data);
  }

  Future<Role> update(int id, Map<String, dynamic> body) async {
    final data = await _api.put('/roles/$id', data: body);
    return Role.fromJson(data['data'] ?? data);
  }

  Future<void> delete(int id) async {
    await _api.delete('/roles/$id');
  }
}

class PermissionService {
  final ApiClient _api = ApiClient();

  Future<List<Permission>> getAll({String? search, String? garde}) async {
    final params = <String, dynamic>{};
    if (search != null && search.isNotEmpty) params['search'] = search;
    if (garde != null && garde.isNotEmpty) params['garde'] = garde;
    final data = await _api.get('/permissions', params: params);
    return _extractList(data).map((e) => Permission.fromJson(e)).toList();
  }

  Future<Permission> getById(int id) async {
    final data = await _api.get('/permissions/$id');
    return Permission.fromJson(data['data'] ?? data);
  }

  Future<Permission> create(Map<String, dynamic> body) async {
    final data = await _api.post('/permissions', data: body);
    return Permission.fromJson(data['data'] ?? data);
  }

  Future<Permission> update(int id, Map<String, dynamic> body) async {
    final data = await _api.put('/permissions/$id', data: body);
    return Permission.fromJson(data['data'] ?? data);
  }

  Future<void> delete(int id) async {
    await _api.delete('/permissions/$id');
  }
}

class DashboardService {
  final ApiClient _api = ApiClient();

  Future<Map<String, dynamic>> _getData(String path, {Map<String, dynamic>? params}) async {
    final data = await _api.get(path, params: params);
    return data['data'] is Map<String, dynamic> ? data['data'] as Map<String, dynamic> : {};
  }

  Future<Map<String, dynamic>> getStats({String? dateDebut, String? dateFin}) async {
    final params = <String, dynamic>{};
    if (dateDebut != null) params['date_debut'] = dateDebut;
    if (dateFin != null) params['date_fin'] = dateFin;
    return _getData('/dashboard', params: params.isEmpty ? null : params);
  }

  Future<Map<String, dynamic>> getCommandesStats() => _getData('/dashboard/commandes');
  Future<Map<String, dynamic>> getStockStats() => _getData('/dashboard/stock');
  Future<Map<String, dynamic>> getFacturationStats() => _getData('/dashboard/facturation');
}

class PosService {
  final ApiClient _api = ApiClient();

  Future<PosVenteResult> vendre({
    required List<Map<String, dynamic>> lignes,
    int? partenaireId,
    String? clientNom,
    String? modePaiement,
    double? montantPaye,
    int? emplacementId,
  }) async {
    final data = await _api.post('/pos/vendre', data: {
      'lignes': lignes,
      if (partenaireId != null) 'partenaire_id': partenaireId,
      if (clientNom != null && clientNom.isNotEmpty) 'client_nom': clientNom,
      if (modePaiement != null) 'mode_paiement': modePaiement,
      if (montantPaye != null) 'montant_paye': montantPaye,
      if (emplacementId != null) 'emplacement_id': emplacementId,
    });
    return PosVenteResult.fromJson(data['data'] as Map<String, dynamic>);
  }

  Future<Map<String, dynamic>> journal({String? date}) async {
    final data = await _api.get('/pos/journal', params: date != null ? {'date': date} : null);
    return (data['data'] as Map<String, dynamic>?) ?? {};
  }

  Future<void> cloturer() async {
    await _api.post('/pos/cloturer');
  }

  Future<void> reouvrir() async {
    await _api.post('/pos/reouvrir');
  }
}

class NotificationService {
  final ApiClient _api = ApiClient();

  Future<List<AppNotification>> getAll() async {
    final data = await _api.get('/notifications');
    final raw = data['data'];
    final list = raw is List ? raw : (raw is Map ? (raw['data'] as List? ?? []) : []);
    return list.map((e) => AppNotification.fromJson(e as Map<String, dynamic>)).toList();
  }
}

class ProfilService {
  final ApiClient _api = ApiClient();

  Future<Utilisateur> get() async {
    final data = await _api.get('/profil');
    return Utilisateur.fromJson((data['data'] ?? data['utilisateur'] ?? data) as Map<String, dynamic>);
  }

  Future<void> update(Map<String, dynamic> body) async {
    await _api.put('/profil', data: body);
  }

  Future<void> updatePassword(Map<String, dynamic> body) async {
    await _api.put('/profil/password', data: body);
  }
}

class ParametreService {
  final ApiClient _api = ApiClient();

  Future<Map<String, dynamic>> getAll() async {
    final data = await _api.get('/parametres');
    final raw = data['data'];
    return raw is Map<String, dynamic> ? raw : {};
  }

  Future<void> update(Map<String, dynamic> params) async {
    await _api.put('/parametres', data: {'parametres': params});
  }

  Future<void> uploadLogo(String filePath) async {
    final form = FormData();
    form.files.add(MapEntry(
      'logo',
      await MultipartFile.fromFile(filePath, filename: filePath.split(RegExp(r'[/\\]')).last),
    ));
    await _api.postMultipart('/societe/logo', form);
  }

  Future<void> deleteLogo() async {
    await _api.delete('/societe/logo');
  }
}

class SocieteService {
  final ApiClient _api = ApiClient();

  Future<List<Societe>> getAll() async {
    final data = await _api.get('/societes', params: {'per_page': 200});
    return _extractList(data).map((e) => Societe.fromJson(e)).toList();
  }

  Future<Societe> create(Map<String, dynamic> body) async {
    final data = await _api.post('/societes', data: body);
    return Societe.fromJson(data['data'] ?? data);
  }

  Future<Societe> update(int id, Map<String, dynamic> body) async {
    final data = await _api.put('/societes/$id', data: body);
    return Societe.fromJson(data['data'] ?? data);
  }

  Future<void> activer(int id) async {
    await _api.post('/societes/$id/activer');
  }

  Future<void> desactiver(int id) async {
    await _api.post('/societes/$id/desactiver');
  }

  Future<void> delete(int id) async {
    await _api.delete('/societes/$id');
  }
}

class CategorieService {
  final ApiClient _api = ApiClient();

  Future<List<CategorieProduit>> getAll({String? search}) async {
    final params = <String, dynamic>{'per_page': 500};
    if (search != null && search.isNotEmpty) params['search'] = search;
    final data = await _api.get('/categories', params: params);
    return _extractList(data).map((e) => CategorieProduit.fromJson(e)).toList();
  }

  Future<CategorieProduit> create(Map<String, dynamic> body) async {
    final data = await _api.post('/categories', data: body);
    return CategorieProduit.fromJson(data['data'] ?? data);
  }

  Future<CategorieProduit> update(int id, Map<String, dynamic> body) async {
    final data = await _api.put('/categories/$id', data: body);
    return CategorieProduit.fromJson(data['data'] ?? data);
  }

  Future<void> delete(int id) async {
    await _api.delete('/categories/$id');
  }
}

class UniteService {
  final ApiClient _api = ApiClient();

  Future<List<UniteMesure>> getAll({String? search}) async {
    final params = <String, dynamic>{'per_page': 500};
    if (search != null && search.isNotEmpty) params['search'] = search;
    final data = await _api.get('/unites-mesure', params: params);
    return _extractList(data).map((e) => UniteMesure.fromJson(e)).toList();
  }

  Future<UniteMesure> create(Map<String, dynamic> body) async {
    final data = await _api.post('/unites-mesure', data: body);
    return UniteMesure.fromJson(data['data'] ?? data);
  }

  Future<UniteMesure> update(int id, Map<String, dynamic> body) async {
    final data = await _api.put('/unites-mesure/$id', data: body);
    return UniteMesure.fromJson(data['data'] ?? data);
  }

  Future<void> delete(int id) async {
    await _api.delete('/unites-mesure/$id');
  }
}

class OperationService {
  final ApiClient _api = ApiClient();

  Future<List<dynamic>> getAll({String? search, int? produitId, int? lotId}) async {
    final params = <String, dynamic>{};
    if (search != null && search.isNotEmpty) params['search'] = search;
    if (produitId != null) params['produit_id'] = produitId;
    if (lotId != null) params['lot_id'] = lotId;
    final data = await _api.get('/operations', params: params.isEmpty ? null : params);
    return _extractList(data);
  }
}

class RapportService {
  final ApiClient _api = ApiClient();

  /// Requête générique : renvoie { lignes: [...], totaux: {...} }.
  Future<Map<String, dynamic>> fetch(String path, {Map<String, dynamic>? params}) async {
    final data = await _api.get(path, params: params);
    final inner = data['data'];
    if (inner is Map) {
      return {
        'lignes': inner['lignes'] ?? [],
        'totaux': inner['totaux'] ?? {},
      };
    }
    if (inner is List) {
      return {'lignes': inner, 'totaux': {}};
    }
    return {'lignes': [], 'totaux': {}};
  }

  Future<List<dynamic>> getVentes({String? dateDebut, String? dateFin}) async {
    final r = await fetch('/rapports/ventes', params: {
      if (dateDebut != null) 'date_debut': dateDebut,
      if (dateFin != null) 'date_fin': dateFin,
    });
    return r['lignes'] as List<dynamic>;
  }

  Future<List<dynamic>> getAchats({String? dateDebut, String? dateFin}) async {
    final r = await fetch('/rapports/achats', params: {
      if (dateDebut != null) 'date_debut': dateDebut,
      if (dateFin != null) 'date_fin': dateFin,
    });
    return r['lignes'] as List<dynamic>;
  }

  Future<List<dynamic>> getMouvements({String? dateDebut, String? dateFin}) async {
    final r = await fetch('/rapports/mouvements', params: {
      if (dateDebut != null) 'date_debut': dateDebut,
      if (dateFin != null) 'date_fin': dateFin,
    });
    return r['lignes'] as List<dynamic>;
  }
}

class RetourService {
  final ApiClient _api = ApiClient();

  Future<List<Retour>> getAll({String? search, String? type}) async {
    final params = <String, dynamic>{};
    if (search != null && search.isNotEmpty) params['search'] = search;
    if (type != null && type != 'all') params['type'] = type;
    final data = await _api.get('/retours', params: params.isEmpty ? null : params);
    return _extractList(data).map((e) => Retour.fromJson(e)).toList();
  }

  Future<Retour> getById(int id) async {
    final data = await _api.get('/retours/$id');
    final inner = data['data'];
    return Retour.fromJson(inner is Map<String, dynamic> ? inner : data);
  }

  Future<Retour> create(Map<String, dynamic> body) async {
    final data = await _api.post('/retours', data: body);
    return Retour.fromJson(data['data'] ?? data);
  }

  Future<void> valider(int id) async {
    await _api.post('/retours/$id/valider');
  }

  Future<void> delete(int id) async {
    await _api.delete('/retours/$id');
  }
}

class InventaireService {
  final ApiClient _api = ApiClient();

  Future<List<Inventaire>> getAll({String? search, String? statut}) async {
    final params = <String, dynamic>{};
    if (search != null && search.isNotEmpty) params['search'] = search;
    if (statut != null && statut != 'all') params['statut'] = statut;
    final data = await _api.get('/inventaires', params: params.isEmpty ? null : params);
    return _extractList(data).map((e) => Inventaire.fromJson(e)).toList();
  }

  Future<Map<String, dynamic>> getById(int id) async {
    final data = await _api.get('/inventaires/$id');
    final inner = data['data'];
    if (inner is Map<String, dynamic>) return inner;
    return {};
  }

  Future<Inventaire> create(Map<String, dynamic> body) async {
    final data = await _api.post('/inventaires', data: body);
    return Inventaire.fromJson(data['data'] ?? data);
  }

  Future<void> delete(int id) async {
    await _api.delete('/inventaires/$id');
  }

  Future<void> genererLignes(int id) async {
    await _api.post('/inventaires/$id/generer-lignes');
  }

  Future<void> ajouterLigne(int id, Map<String, dynamic> body) async {
    await _api.post('/inventaires/$id/lignes', data: body);
  }

  Future<void> updateLigne(int id, int ligneId, Map<String, dynamic> body) async {
    await _api.put('/inventaires/$id/lignes/$ligneId', data: body);
  }

  Future<void> supprimerLigne(int id, int ligneId) async {
    await _api.delete('/inventaires/$id/lignes/$ligneId');
  }

  Future<void> cloturer(int id) async {
    await _api.post('/inventaires/$id/cloturer');
  }

  Future<void> ajuster(int id) async {
    await _api.post('/inventaires/$id/ajuster');
  }
}

class AuditLogService {
  final ApiClient _api = ApiClient();

  Future<Map<String, dynamic>> getAll({String? search, String? action, String? societeId}) async {
    final params = <String, dynamic>{};
    if (search != null && search.isNotEmpty) params['search'] = search;
    if (action != null && action != 'all') params['action'] = action;
    if (societeId != null && societeId.isNotEmpty) params['societe_id'] = societeId;
    final data = await _api.get('/audit-logs', params: params.isEmpty ? null : params);
    final inner = data['data'];
    if (inner is Map) {
      return {'lignes': inner['data'] ?? [], 'total': inner['total'] ?? 0};
    }
    return {'lignes': [], 'total': 0};
  }
}
