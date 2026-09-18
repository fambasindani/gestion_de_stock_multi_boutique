import 'package:flutter_test/flutter_test.dart';
import 'package:gst_stock_mobile/models/models.dart';
import 'package:gst_stock_mobile/utils/utils.dart';

void main() {
  group('formatCurrency', () {
    test('formate un entier', () {
      expect(formatCurrency(1000000), contains('1 000 000'));
    });

    test('gère une chaîne décimale', () {
      expect(formatCurrency('1500.5'), contains('1 500,50'));
    });

    test('gère null', () {
      expect(formatCurrency(null), isNotEmpty);
    });
  });

  group('formatDate', () {
    test('formate une date ISO', () {
      expect(formatDate('2026-09-18'), '18/09/2026');
    });

    test('retourne "-" pour null', () {
      expect(formatDate(null), '-');
    });
  });

  group('PosCartLine', () {
    test('calcule HT, TVA et TTC', () {
      final line = PosCartLine(produitId: 1, nom: 'Test', prixUnitaireHt: 1000, quantite: 2, tauxTva: 16);
      expect(line.montantHt, 2000);
      expect(line.montantTva, closeTo(320, 0.001));
      expect(line.montantTtc, closeTo(2320, 0.001));
    });

    test('applique la remise avant TVA', () {
      final line = PosCartLine(produitId: 1, nom: 'Test', prixUnitaireHt: 100, quantite: 1, tauxTva: 10, tauxRemise: 50);
      expect(line.montantHt, 50);
      expect(line.montantTva, 5);
      expect(line.montantTtc, 55);
    });
  });

  group('LoginResponse', () {
    test('parse les permissions et la société', () {
      final res = LoginResponse.fromJson({
        'access_token': 'abc',
        'utilisateur': {'id': 1, 'nom': 'Pierre', 'email': 'p@x.com', 'actif': 1},
        'roles': ['administrateur'],
        'permissions': ['vendre_pos', 'voir_stock'],
        'est_super_admin': false,
        'societe': {'id': 4, 'nom': 'ALIMA', 'actif': 1},
      });
      expect(res.permissions.length, 2);
      expect(res.estSuperAdmin, false);
      expect(res.societe?.nom, 'ALIMA');
    });
  });

  group('AppNotification', () {
    test('parse une notification', () {
      final n = AppNotification.fromJson({'title': 'Rupture', 'message': 'Stock 0', 'type': 'stock', 'level': 'danger'});
      expect(n.title, 'Rupture');
      expect(n.level, 'danger');
    });
  });
}
