import 'package:flutter/material.dart';

num _toNum(dynamic value) {
  if (value == null) return 0;
  if (value is num) return value;
  return double.tryParse(value.toString().replaceAll(' ', '').replaceAll(',', '.')) ?? 0;
}

String formatCurrency(dynamic value) {
  if (value == null) return '-';
  final num v = _toNum(value);
  final parts = v.toStringAsFixed(2).split('.');
  final intPart = parts[0].replaceAllMapped(RegExp(r'(\d{1,3})(?=(\d{3})+(?!\d))'), (m) => '${m[1]} ');
  return '$intPart,${parts[1]} CDF';
}

/// Montant compact pour les gros chiffres : k (milliers), M (millions), Md (milliards).
/// Ex : 1 000 000 -> "1 M CDF", 2500000 -> "2,5 M CDF", 12000 -> "12 k CDF".
String formatCompact(dynamic value) {
  if (value == null) return '-';
  final double v = _toNum(value).toDouble();
  final double abs = v.abs();

  String nombre(double x) {
    final double r = (x * 100).round() / 100;
    var s = r.toStringAsFixed(2);
    s = s.replaceAll(RegExp(r'0+$'), '').replaceAll(RegExp(r'\.$'), '');
    return s.replaceAll('.', ',');
  }

  if (abs >= 1000000000) return '${nombre(v / 1000000000)} Md CDF';
  if (abs >= 1000000) return '${nombre(v / 1000000)} M CDF';
  if (abs >= 1000) return '${nombre(v / 1000)} k CDF';
  return formatCurrency(v);
}

String formatDate(String? date) {
  if (date == null || date.isEmpty) return '-';
  try {
    final d = DateTime.parse(date);
    return '${d.day.toString().padLeft(2, '0')}/${d.month.toString().padLeft(2, '0')}/${d.year}';
  } catch (_) {
    return date;
  }
}

Color getEtatColor(String etat) {
  switch (etat) {
    case 'brouillon': return Colors.grey;
    case 'confirme': return Colors.blue;
    case 'envoye': return Colors.orange;
    case 'recu': return Colors.green;
    case 'termine': return Colors.green;
    case 'annule': return Colors.red;
    case 'en_cours': return Colors.blue;
    default: return Colors.grey;
  }
}
