import 'package:flutter/material.dart';

String formatCurrency(dynamic value) {
  if (value == null) return '-';
  final num v = (value is num) ? value : double.tryParse(value.toString()) ?? 0;
  final parts = v.toStringAsFixed(2).split('.');
  final intPart = parts[0].replaceAllMapped(RegExp(r'(\d{1,3})(?=(\d{3})+(?!\d))'), (m) => '${m[1]} ');
  return '$intPart,${parts[1]} CDF';
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
