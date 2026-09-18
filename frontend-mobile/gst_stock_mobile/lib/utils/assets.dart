import 'package:gst_stock_mobile/config/api_config.dart';
import 'package:gst_stock_mobile/models/models.dart';

/// URL du logo de la boutique, servi par l'API (`/api/logo/{societe}`).
/// Retourne null si la société n'a pas de logo.
String? boutiqueLogoUrl(Societe? societe) {
  if (societe == null || societe.logo == null || societe.logo!.isEmpty) return null;
  final origin = ApiConfig.baseUrl.replaceAll(RegExp(r'/api/?$'), '');
  return '$origin/api/logo/${societe.id}';
}
