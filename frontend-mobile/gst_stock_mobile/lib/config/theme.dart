import 'package:flutter/material.dart';

class AppTheme {
  // React / Odoo color palette
  static const Color primary = Color(0xFF2563EB);
  static const Color primaryLight = Color(0xFFDBEAFE);
  static const Color primaryDark = Color(0xFF1D4ED8);
  static const Color secondary = Color(0xFF64748B);
  static const Color success = Color(0xFF10B981);
  static const Color warning = Color(0xFFF59E0B);
  static const Color danger = Color(0xFFDC2626);
  static const Color info = Color(0xFF3B82F6);

  // Surface / bg
  static const Color surface = Color(0xFFF9FAFB);      // React gray-50
  static const Color card = Color(0xFFFFFFFF);          // white
  static const Color text = Color(0xFF374151);           // React gray-700
  static const Color textSecondary = Color(0xFF6B7280); // React gray-500
  static const Color border = Color(0xFFE5E7EB);        // React gray-200

  // Odoo sidebar (dark)
  static const Color sidebarBg = Color(0xFF1A1D21);
  static const Color sidebarHover = Color(0xFF2D3136);
  static const Color sidebarBorder = Color(0xFF2D3136);
  static const Color sidebarText = Color(0xFF9AA0A8);
  static const Color sidebarTextActive = Color(0xFFFFFFFF);

  // Status badge colors (React exact)
  static const Map<String, Color> statusBg = {
    'brouillon': Color(0xFFF1F5F9),
    'confirme': Color(0xFFEFF6FF),
    'envoye': Color(0xFFFFFBEB),
    'recu': Color(0xFFFAF5FF),
    'termine': Color(0xFFECFDF5),
    'annule': Color(0xFFFEF2F2),
    'en_cours': Color(0xFFEFF6FF),
    'payee': Color(0xFFECFDF5),
    'en_attente': Color(0xFFFFFBEB),
    'partielle': Color(0xFFEFF6FF),
    'impayee': Color(0xFFFEF2F2),
    'annulee': Color(0xFFFEF2F2),
  };
  static const Map<String, Color> statusText = {
    'brouillon': Color(0xFF334155),
    'confirme': Color(0xFF1D4ED8),
    'envoye': Color(0xFFB45309),
    'recu': Color(0xFF7E22CE),
    'termine': Color(0xFF047857),
    'annule': Color(0xFFB91C1C),
    'en_cours': Color(0xFF1D4ED8),
    'payee': Color(0xFF047857),
    'en_attente': Color(0xFFB45309),
    'partielle': Color(0xFF1D4ED8),
    'impayee': Color(0xFFB91C1C),
    'annulee': Color(0xFFB91C1C),
  };

  // KPI card gradients (React exact)
  static const List<Color> kpiGradients = [
    Color(0xFF3B82F6), // blue-500 - Utilisateurs
    Color(0xFF10B981), // emerald-500 - Clients
    Color(0xFF8B5CF6), // violet-500 - Produits
    Color(0xFFF59E0B), // amber-500 - Commandes
  ];

  static ThemeData get lightTheme {
    return ThemeData(
      useMaterial3: true,
      colorScheme: ColorScheme.fromSeed(
        seedColor: primary,
        surface: surface,
        primary: primary,
        error: danger,
      ),
      scaffoldBackgroundColor: surface,
      appBarTheme: const AppBarTheme(
        backgroundColor: Colors.white,
        foregroundColor: text,
        elevation: 0,
        centerTitle: true,
        surfaceTintColor: Colors.transparent,
      ),
      cardTheme: CardThemeData(
        color: card,
        elevation: 0,
        surfaceTintColor: Colors.transparent,
        shape: RoundedRectangleBorder(
          borderRadius: BorderRadius.circular(10),
          side: const BorderSide(color: border),
        ),
      ),
      inputDecorationTheme: InputDecorationTheme(
        filled: true,
        fillColor: Colors.white,
        border: OutlineInputBorder(
          borderRadius: BorderRadius.circular(10),
          borderSide: const BorderSide(color: border),
        ),
        enabledBorder: OutlineInputBorder(
          borderRadius: BorderRadius.circular(10),
          borderSide: const BorderSide(color: border),
        ),
        focusedBorder: OutlineInputBorder(
          borderRadius: BorderRadius.circular(10),
          borderSide: const BorderSide(color: primary, width: 2),
        ),
        contentPadding: const EdgeInsets.symmetric(horizontal: 16, vertical: 14),
      ),
      elevatedButtonTheme: ElevatedButtonThemeData(
        style: ElevatedButton.styleFrom(
          backgroundColor: primary,
          foregroundColor: Colors.white,
          padding: const EdgeInsets.symmetric(horizontal: 24, vertical: 14),
          shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(10)),
          elevation: 0,
        ),
      ),
      dividerTheme: const DividerThemeData(color: border, thickness: 1),
      bottomNavigationBarTheme: const BottomNavigationBarThemeData(
        backgroundColor: Colors.white,
        selectedItemColor: primary,
        unselectedItemColor: textSecondary,
        type: BottomNavigationBarType.fixed,
        elevation: 8,
      ),
    );
  }

  static Color statusBgColor(String status) => statusBg[status] ?? const Color(0xFFF3F4F6);
  static Color statusTextColor(String status) => statusText[status] ?? const Color(0xFF4B5563);
}
