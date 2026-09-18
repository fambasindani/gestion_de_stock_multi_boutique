import 'package:flutter/material.dart';
import '../models/models.dart';
import '../services/auth_service.dart';
import '../services/api_client.dart';

class AuthProvider extends ChangeNotifier {
  final AuthService _authService = AuthService();
  final ApiClient _api = ApiClient();

  Utilisateur? _user;
  Societe? _societe;
  List<String> _permissions = [];
  bool _estSuperAdmin = false;
  String? _selectedSocieteId;
  bool _isLoading = false;
  String? _error;
  bool _initialized = false;

  Utilisateur? get user => _user;
  Societe? get societe => _societe;
  List<String> get permissions => _permissions;
  bool get estSuperAdmin => _estSuperAdmin;
  bool get isAuthenticated => _user != null;
  bool get isLoading => _isLoading;
  String? get error => _error;
  bool get initialized => _initialized;

  /// Société ciblée (compte plateforme) : id ou null = toutes.
  String? get selectedSocieteId => _selectedSocieteId;

  bool hasPermission(String name) {
    if (_estSuperAdmin) return true;
    return _permissions.contains(name);
  }

  void _applySession({
    required Utilisateur user,
    Societe? societe,
    List<String> permissions = const [],
    bool estSuperAdmin = false,
  }) {
    _user = user;
    _societe = societe ?? user.societe;
    _permissions = permissions;
    _estSuperAdmin = estSuperAdmin || user.estSuperAdmin;
  }

  Future<void> init() async {
    final token = await _api.getToken();
    if (token != null) {
      try {
        final me = await _authService.getMe();
        _applySession(
          user: me.utilisateur,
          societe: me.societe,
          permissions: me.permissions,
          estSuperAdmin: me.estSuperAdmin,
        );
        _selectedSocieteId = await _api.getSociete();
      } catch (_) {
        await _api.setToken(null);
      }
    }
    _initialized = true;
    notifyListeners();
  }

  Future<bool> login(String email, String password) async {
    _isLoading = true;
    _error = null;
    notifyListeners();
    try {
      final response = await _authService.login(email, password);
      _applySession(
        user: response.utilisateur,
        societe: response.societe,
        permissions: response.permissions,
        estSuperAdmin: response.estSuperAdmin,
      );
      _isLoading = false;
      notifyListeners();
      return true;
    } on ApiException catch (e) {
      _error = e.message;
      _isLoading = false;
      notifyListeners();
      return false;
    } catch (e) {
      _error = 'Erreur de connexion';
      _isLoading = false;
      notifyListeners();
      return false;
    }
  }

  /// Changer la société ciblée (compte plateforme uniquement).
  Future<void> setSelectedSociete(String? societeId) async {
    _selectedSocieteId = societeId;
    await _api.setSociete(societeId);
    notifyListeners();
  }

  Future<void> logout() async {
    await _authService.logout();
    await _api.setSociete(null);
    _user = null;
    _societe = null;
    _permissions = [];
    _estSuperAdmin = false;
    _selectedSocieteId = null;
    notifyListeners();
  }
}
