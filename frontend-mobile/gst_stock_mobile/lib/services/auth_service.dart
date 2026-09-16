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
}
