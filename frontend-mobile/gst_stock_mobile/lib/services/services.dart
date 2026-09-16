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
    final data = await _api.get('/produits', params: {'search': barcode, 'modele': true});
    return _extractList(data).map((e) => ProduitModele.fromJson(e)).toList();
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

  Future<void> receptionner(int id) async {
    await _api.post('/commandes-achat/$id/receptionner');
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

  Future<Map<String, dynamic>> getStats() async {
    final data = await _api.get('/dashboard');
    return data['data'] is Map<String, dynamic> ? data['data'] as Map<String, dynamic> : {};
  }
}

class RapportService {
  final ApiClient _api = ApiClient();

  Future<List<dynamic>> getVentes({String? dateDebut, String? dateFin}) async {
    final params = <String, dynamic>{};
    if (dateDebut != null) params['date_debut'] = dateDebut;
    if (dateFin != null) params['date_fin'] = dateFin;
    final data = await _api.get('/rapports/ventes', params: params);
    final inner = data['data'];
    if (inner is List) return inner;
    if (inner is Map) return (inner['lignes'] as List?) ?? [];
    return [];
  }

  Future<List<dynamic>> getAchats({String? dateDebut, String? dateFin}) async {
    final params = <String, dynamic>{};
    if (dateDebut != null) params['date_debut'] = dateDebut;
    if (dateFin != null) params['date_fin'] = dateFin;
    final data = await _api.get('/rapports/achats', params: params);
    final inner = data['data'];
    if (inner is List) return inner;
    if (inner is Map) return (inner['lignes'] as List?) ?? [];
    return [];
  }

  Future<List<dynamic>> getMouvements({String? dateDebut, String? dateFin}) async {
    final params = <String, dynamic>{};
    if (dateDebut != null) params['date_debut'] = dateDebut;
    if (dateFin != null) params['date_fin'] = dateFin;
    final data = await _api.get('/rapports/mouvements', params: params);
    final inner = data['data'];
    if (inner is List) return inner;
    if (inner is Map) return (inner['lignes'] as List?) ?? [];
    return [];
  }
}
