import 'package:flutter_dotenv/flutter_dotenv.dart';

/// Configuration de l'API, lue depuis le fichier `.env` (racine du projet).
class ApiConfig {
  /// URL de base de l'API (clé `API_URL` du fichier assets/.env).
  static String get baseUrl {
    final value = dotenv.env['API_URL']?.trim();
    if (value != null && value.isNotEmpty) return value;
    // Valeur de secours si le .env n'est pas chargé
    return "https://totalconceptrdc.org/odoo/api";
  }

  /// Délai des requêtes (clé `API_TIMEOUT`), en secondes.
  static Duration get timeout {
    final value = int.tryParse(dotenv.env['API_TIMEOUT'] ?? '');
    return Duration(seconds: value ?? 120);
  }
}
