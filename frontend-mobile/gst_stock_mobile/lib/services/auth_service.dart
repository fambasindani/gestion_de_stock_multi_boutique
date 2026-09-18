import '../models/models.dart';
import 'api_client.dart';

class AuthService {
  final ApiClient _api = ApiClient();

  Future<LoginResponse> login(String email, String password) async {
    final data = await _api.post('/auth/login', data: {
      'email': email,
      'mot_de_passe': password,
    });
    final response = LoginResponse.fromJson(data);
    await _api.setToken(response.accessToken);
    return response;
  }

  Future<void> logout() async {
    try {
      await _api.post('/auth/logout');
    } catch (_) {}
    await _api.setToken(null);
  }

  Future<Utilisateur> getCurrentUser() async {
    final data = await _api.get('/auth/me');
    return Utilisateur.fromJson(data['utilisateur'] as Map<String, dynamic>);
  }

  /// Données complètes de /auth/me (utilisateur, societe, permissions...).
  Future<LoginResponse> getMe() async {
    final data = await _api.get('/auth/me');
    return LoginResponse.fromJson({
      'access_token': '',
      ...data,
    });
  }

  /// Demande l'envoi d'un lien de réinitialisation par email.
  Future<void> forgotPassword(String email) async {
    await _api.post('/auth/forgot-password', data: {'email': email});
  }

  /// Réinitialise le mot de passe avec le token reçu par email.
  Future<void> resetPassword({
    required String email,
    required String token,
    required String motDePasse,
    required String confirmation,
  }) async {
    await _api.post('/auth/reset-password', data: {
      'email': email,
      'token': token,
      'mot_de_passe': motDePasse,
      'mot_de_passe_confirmation': confirmation,
    });
  }
}
