import 'package:flutter/material.dart';
import 'package:gst_stock_mobile/config/theme.dart';
import 'package:gst_stock_mobile/services/services.dart';
import 'package:gst_stock_mobile/utils/utils.dart';
import 'rapport_generique_screen.dart';

class RapportsScreen extends StatelessWidget {
  const RapportsScreen({super.key});

  static String _txt(dynamic v) {
    if (v == null) return '-';
    if (v is num) return formatCurrency(v);
    return v.toString();
  }

  static String _get(Map<String, dynamic> r, List<String> path) {
    dynamic v = r;
    for (final k in path) {
      if (v is Map && v.containsKey(k)) {
        v = v[k];
      } else {
        return '-';
      }
    }
    if (v is Map) return (v['nom'] ?? v['reference'] ?? '-').toString();
    return v == null ? '-' : v.toString();
  }

  @override
  Widget build(BuildContext context) {
    final service = RapportService();

    final entries = <_ReportEntry>[
      _ReportEntry('Ventes', Icons.trending_up, Colors.green, hasDate: true, columns: [
        RapportColumn('Produit', (r) => _get(r, ['produit', 'nom']) != '-' ? _get(r, ['produit', 'nom']) : _get(r, ['nom'])),
        RapportColumn('Qté', (r) => _txt(r['total_quantite'] ?? r['quantite']), numeric: true),
        RapportColumn('Montant HT', (r) => _txt(r['total_montant_ht'] ?? r['montant_ht']), numeric: true),
      ], loader: (p) => service.fetch('/rapports/ventes', params: p)),
      _ReportEntry('Achats', Icons.shopping_cart, Colors.blue, hasDate: true, columns: [
        RapportColumn('Produit', (r) => _get(r, ['produit', 'nom']) != '-' ? _get(r, ['produit', 'nom']) : _get(r, ['nom'])),
        RapportColumn('Qté', (r) => _txt(r['total_quantite'] ?? r['quantite']), numeric: true),
        RapportColumn('Montant HT', (r) => _txt(r['total_montant_ht'] ?? r['montant_ht']), numeric: true),
      ], loader: (p) => service.fetch('/rapports/achats', params: p)),
      _ReportEntry('Mouvements de stock', Icons.swap_horiz, Colors.orange, hasDate: true, columns: [
        RapportColumn('Produit', (r) => _get(r, ['nom_produit']) != '-' ? _get(r, ['nom_produit']) : _get(r, ['produit'])),
        RapportColumn('Type', (r) => _get(r, ['type_mouvement']) != '-' ? _get(r, ['type_mouvement']) : _get(r, ['type'])),
        RapportColumn('Qté', (r) => _txt(r['quantite_demandee'] ?? r['quantite']), numeric: true),
        RapportColumn('Source', (r) => _get(r, ['emplacement_source_nom'])),
        RapportColumn('Dest.', (r) => _get(r, ['emplacement_destination_nom'])),
        RapportColumn('Date', (r) => formatDate((r['date_mouvement'] ?? r['date'] ?? r['date_prelevement'] ?? '').toString())),
      ], loader: (p) => service.fetch('/rapports/mouvements', params: p)),
      _ReportEntry('État du stock', Icons.warehouse, Colors.indigo, columns: [
        RapportColumn('Produit', (r) => _get(r, ['produit', 'nom'])),
        RapportColumn('Code', (r) => _get(r, ['produit', 'code_interne'])),
        RapportColumn('Catégorie', (r) => _get(r, ['produit', 'modele', 'categorie', 'nom'])),
        RapportColumn('Emplacement', (r) => _get(r, ['emplacement', 'nom'])),
        RapportColumn('Quantité', (r) => _txt(r['quantite_totale']), numeric: true),
        RapportColumn('Valeur', (r) => _txt(r['valeur']), numeric: true),
      ], loader: (p) => service.fetch('/rapports/stock', params: p)),
      _ReportEntry('Rupture de stock', Icons.error_outline, Colors.red, columns: [
        RapportColumn('Produit', (r) => _txt(r['produit'])),
        RapportColumn('Code', (r) => _txt(r['code'])),
        RapportColumn('Emplacement', (r) => _txt(r['emplacement'])),
        RapportColumn('Quantité', (r) => _txt(r['quantite']), numeric: true),
      ], loader: (p) => service.fetch('/rapports/rupture-stock', params: p)),
      _ReportEntry('Stock bas', Icons.warning_amber, Colors.amber, columns: [
        RapportColumn('Produit', (r) => _txt(r['produit'])),
        RapportColumn('Code', (r) => _txt(r['code'])),
        RapportColumn('Emplacement', (r) => _txt(r['emplacement'])),
        RapportColumn('Quantité', (r) => _txt(r['quantite']), numeric: true),
        RapportColumn('Seuil', (r) => _txt(r['seuil_minimum']), numeric: true),
        RapportColumn('Manque', (r) => _txt(r['manque']), numeric: true),
      ], loader: (p) => service.fetch('/rapports/stock-bas', params: p)),
      _ReportEntry('Variations de prix', Icons.trending_up, Colors.purple, hasDate: true, columns: [
        RapportColumn('Produit', (r) => _txt(r['produit'])),
        RapportColumn('Achats', (r) => _txt(r['nombre_achats']), numeric: true),
        RapportColumn('Prix min', (r) => _txt(r['prix_min']), numeric: true),
        RapportColumn('Prix max', (r) => _txt(r['prix_max']), numeric: true),
        RapportColumn('Variation %', (r) => _txt(r['variation_pct']), numeric: true),
        RapportColumn('Tendance', (r) => _txt(r['tendance'])),
      ], loader: (p) => service.fetch('/rapports/variations-prix', params: p)),
      _ReportEntry('CA par client', Icons.person, Colors.teal, hasDate: true, fixed: {'type': 'client'}, columns: [
        RapportColumn('Client', (r) => _txt(r['partenaire'])),
        RapportColumn('Factures', (r) => _txt(r['nombre_factures']), numeric: true),
        RapportColumn('Total HT', (r) => _txt(r['total_ht']), numeric: true),
        RapportColumn('Total TTC', (r) => _txt(r['total_ttc']), numeric: true),
        RapportColumn('Impayé', (r) => _txt(r['total_impaye']), numeric: true),
      ], loader: (p) => service.fetch('/rapports/ca-partenaires', params: p)),
      _ReportEntry('Achats par fournisseur', Icons.local_shipping, Colors.brown, hasDate: true, fixed: {'type': 'fournisseur'}, columns: [
        RapportColumn('Fournisseur', (r) => _txt(r['partenaire'])),
        RapportColumn('Factures', (r) => _txt(r['nombre_factures']), numeric: true),
        RapportColumn('Total HT', (r) => _txt(r['total_ht']), numeric: true),
        RapportColumn('Total TTC', (r) => _txt(r['total_ttc']), numeric: true),
        RapportColumn('Impayé', (r) => _txt(r['total_impaye']), numeric: true),
      ], loader: (p) => service.fetch('/rapports/ca-partenaires', params: p)),
      _ReportEntry('Bons de commande', Icons.description, Colors.blueGrey, hasDate: true, columns: [
        RapportColumn('Référence', (r) => _txt(r['reference'])),
        RapportColumn('Fournisseur', (r) => _txt(r['fournisseur'])),
        RapportColumn('Date', (r) => formatDate((r['date_commande'] ?? '').toString())),
        RapportColumn('État', (r) => _txt(r['etat_label'] ?? r['etat'])),
        RapportColumn('Lignes', (r) => _txt(r['nombre_lignes']), numeric: true),
        RapportColumn('Total HT', (r) => _txt(r['total_ht']), numeric: true),
        RapportColumn('Total TTC', (r) => _txt(r['total_ttc']), numeric: true),
      ], loader: (p) => service.fetch('/rapports/bons-commande', params: p)),
      _ReportEntry('Ventes par vendeur', Icons.badge, Colors.cyan, hasDate: true, columns: [
        RapportColumn('Vendeur', (r) => _txt(r['vendeur'])),
        RapportColumn('Ventes', (r) => _txt(r['nombre_ventes']), numeric: true),
        RapportColumn('Total HT', (r) => _txt(r['total_ht']), numeric: true),
        RapportColumn('Remise', (r) => _txt(r['total_remise']), numeric: true),
        RapportColumn('Total TTC', (r) => _txt(r['total_ttc']), numeric: true),
      ], loader: (p) => service.fetch('/rapports/ventes-vendeurs', params: p)),
      _ReportEntry('Traçabilité', Icons.qr_code_2, Colors.deepPurple, loader: (p) async {
        final ops = await OperationService().getAll();
        return {'lignes': ops, 'totaux': {'total': ops.length}};
      }, columns: [
        RapportColumn('Date', (r) => formatDate((r['date_operation'] ?? r['created_at'] ?? '').toString())),
        RapportColumn('Produit', (r) => _get(r, ['produit', 'nom'])),
        RapportColumn('Lot', (r) => _get(r, ['lot', 'nom'])),
        RapportColumn('Type', (r) => _txt(r['type_operation'])),
        RapportColumn('Qté', (r) => _txt(r['quantite_traitee']), numeric: true),
      ]),
      _ReportEntry('Logs d\'activité', Icons.history, Colors.grey, loader: (p) async {
        final res = await AuditLogService().getAll(search: p['search'] as String?);
        return {'lignes': res['lignes'], 'totaux': {'total': res['total']}};
      }, columns: [
        RapportColumn('Date', (r) => formatDate((r['created_at'] ?? '').toString())),
        RapportColumn('Utilisateur', (r) => _get(r, ['user', 'nom'])),
        RapportColumn('Action', (r) => _txt(r['action'])),
        RapportColumn('Description', (r) => _txt(r['description'])),
        RapportColumn('Boutique', (r) => _get(r, ['societe', 'nom'])),
      ]),
    ];

    return Scaffold(
      backgroundColor: AppTheme.surface,
      appBar: AppBar(title: const Text('Rapports')),
      body: ListView.separated(
        padding: const EdgeInsets.all(12),
        itemCount: entries.length,
        separatorBuilder: (_, __) => const SizedBox(height: 8),
        itemBuilder: (context, i) {
          final e = entries[i];
          return Card(
            elevation: 0,
            shape: RoundedRectangleBorder(
              borderRadius: BorderRadius.circular(12),
              side: BorderSide(color: Colors.grey.shade200),
            ),
            child: ListTile(
              leading: Container(
                width: 40,
                height: 40,
                decoration: BoxDecoration(color: e.color.withValues(alpha: 0.12), borderRadius: BorderRadius.circular(10)),
                child: Icon(e.icon, color: e.color, size: 22),
              ),
              title: Text(e.title, style: const TextStyle(fontWeight: FontWeight.w600)),
              trailing: const Icon(Icons.chevron_right),
              onTap: () => Navigator.of(context).push(MaterialPageRoute(
                builder: (_) => RapportGeneriqueScreen(
                  title: e.title,
                  loader: e.loader,
                  columns: e.columns,
                  dateFilter: e.hasDate,
                  fixedParams: e.fixed,
                ),
              )),
            ),
          );
        },
      ),
    );
  }
}

class _ReportEntry {
  final String title;
  final IconData icon;
  final Color color;
  final bool hasDate;
  final Map<String, dynamic> fixed;
  final List<RapportColumn> columns;
  final Future<Map<String, dynamic>> Function(Map<String, dynamic> params) loader;
  _ReportEntry(
    this.title,
    this.icon,
    this.color, {
    required this.loader,
    required this.columns,
    this.hasDate = false,
    this.fixed = const {},
  });
}
