import 'package:flutter/material.dart';
import 'package:gst_stock_mobile/services/services.dart';
import 'package:gst_stock_mobile/utils/utils.dart';

class RapportsScreen extends StatefulWidget {
  const RapportsScreen({super.key});

  @override
  State<RapportsScreen> createState() => _RapportsScreenState();
}

class _RapportsScreenState extends State<RapportsScreen> {
  String? _activeSection;

  DateTimeRange? _venteRange;
  DateTimeRange? _achatRange;
  DateTimeRange? _mouvementRange;

  List<dynamic>? _venteData;
  List<dynamic>? _achatData;
  List<dynamic>? _mouvementData;
  bool _loadingVentes = false;
  bool _loadingAchats = false;
  bool _loadingMouvements = false;

  void _toggleSection(String section) {
    setState(() {
      if (_activeSection == section) {
        _activeSection = null;
      } else {
        _activeSection = section;
      }
    });
  }

  Future<void> _pickDates(String section) async {
    final initial = DateTimeRange(
      start: DateTime.now().subtract(const Duration(days: 30)),
      end: DateTime.now(),
    );
    final picked = await showDateRangePicker(
      context: context,
      firstDate: DateTime(2020),
      lastDate: DateTime(2030),
      initialDateRange: initial,
    );
    if (picked == null) return;

    setState(() {
      _activeSection = section;
      if (section == 'ventes') {
        _venteRange = picked;
        _loadingVentes = true;
      } else if (section == 'achats') {
        _achatRange = picked;
        _loadingAchats = true;
      } else if (section == 'mouvements') {
        _mouvementRange = picked;
        _loadingMouvements = true;
      }
    });
    _fetchReport(section, picked);
  }

  Future<void> _fetchReport(String section, DateTimeRange range) async {
    try {
      final dateDebut = range.start.toIso8601String().split('T')[0];
      final dateFin = range.end.toIso8601String().split('T')[0];
      final service = RapportService();

      List<dynamic>? data;
      if (section == 'ventes') {
        data = await service.getVentes(dateDebut: dateDebut, dateFin: dateFin);
      } else if (section == 'achats') {
        data = await service.getAchats(dateDebut: dateDebut, dateFin: dateFin);
      } else if (section == 'mouvements') {
        data = await service.getMouvements(dateDebut: dateDebut, dateFin: dateFin);
      }

      if (!mounted) return;
      setState(() {
        if (section == 'ventes') { _venteData = data; _loadingVentes = false; }
        else if (section == 'achats') { _achatData = data; _loadingAchats = false; }
        else if (section == 'mouvements') { _mouvementData = data; _loadingMouvements = false; }
      });
    } catch (e) {
      if (!mounted) return;
      setState(() {
        if (section == 'ventes') _loadingVentes = false;
        if (section == 'achats') _loadingAchats = false;
        if (section == 'mouvements') _loadingMouvements = false;
      });
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: const Text('Rapports')),
      body: ListView(padding: const EdgeInsets.all(16), children: [
        _buildSectionCard(
          title: 'Ventes', icon: Icons.trending_up, color: Colors.green,
          range: _venteRange, loading: _loadingVentes, data: _venteData,
          section: 'ventes', isVenteAchat: true,
        ),
        const SizedBox(height: 12),
        _buildSectionCard(
          title: 'Achats', icon: Icons.shopping_cart, color: Colors.blue,
          range: _achatRange, loading: _loadingAchats, data: _achatData,
          section: 'achats', isVenteAchat: true,
        ),
        const SizedBox(height: 12),
        _buildSectionCard(
          title: 'Mouvements de stock', icon: Icons.swap_horiz, color: Colors.orange,
          range: _mouvementRange, loading: _loadingMouvements, data: _mouvementData,
          section: 'mouvements', isVenteAchat: false,
        ),
      ]),
    );
  }

  Widget _buildSectionCard({
    required String title, required IconData icon, required Color color,
    required DateTimeRange? range, required bool loading, required List<dynamic>? data,
    required String section, required bool isVenteAchat,
  }) {
    final isExpanded = _activeSection == section;
    return Card(
      elevation: isExpanded ? 2 : 1,
      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(14)),
      margin: EdgeInsets.zero,
      clipBehavior: Clip.antiAlias,
      child: Column(children: [
        InkWell(
          onTap: isExpanded ? () => _toggleSection(section) : (data != null ? () => _toggleSection(section) : () => _pickDates(section)),
          child: Padding(padding: const EdgeInsets.fromLTRB(16, 14, 8, 14), child: Row(children: [
            Container(width: 40, height: 40, decoration: BoxDecoration(color: color.withValues(alpha: 0.12), borderRadius: BorderRadius.circular(10)),
              child: Icon(icon, color: color, size: 22)),
            const SizedBox(width: 12),
            Expanded(child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
              Text(title, style: const TextStyle(fontWeight: FontWeight.w600, fontSize: 15)),
              if (range != null) Text('${formatDate(range.start.toIso8601String())} - ${formatDate(range.end.toIso8601String())}',
                style: TextStyle(color: Colors.grey[500], fontSize: 11)),
            ])),
            Icon(isExpanded ? Icons.expand_less : Icons.expand_more, color: Colors.grey[500]),
          ])),
        ),
        if (isExpanded) ...[
          const Divider(height: 1, thickness: 1),
          Padding(padding: const EdgeInsets.all(16), child: _buildResults(loading, data, isVenteAchat, section)),
        ],
      ]),
    );
  }

  Widget _buildResults(bool loading, List<dynamic>? data, bool isVenteAchat, String section) {
    if (loading) return const Center(child: SizedBox(height: 48, width: 48, child: CircularProgressIndicator(strokeWidth: 3)));

    if (data == null) {
      return SizedBox(width: double.infinity, child: ElevatedButton.icon(
        onPressed: () => _pickDates(section),
        icon: const Icon(Icons.date_range, size: 18),
        label: const Text('Sélectionner des dates'),
        style: ElevatedButton.styleFrom(backgroundColor: const Color(0xFF2563EB), foregroundColor: Colors.white, shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(10))),
      ));
    }

    if (data.isEmpty) {
      return Column(children: [
        Icon(Icons.inbox_outlined, size: 48, color: Colors.grey[300]),
        const SizedBox(height: 8),
        const Text('Aucune donnée pour cette période', style: TextStyle(color: Colors.grey)),
        const SizedBox(height: 12),
        _changeDateButton(section),
      ]);
    }

    return Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
      _buildTotaux(data, isVenteAchat),
      const SizedBox(height: 16),
      const Text('DÉTAIL', style: TextStyle(fontSize: 11, fontWeight: FontWeight.w600, color: Color(0xFF94A3B8), letterSpacing: 1)),
      const SizedBox(height: 8),
      SingleChildScrollView(scrollDirection: Axis.horizontal,
        child: DataTable(
          headingRowColor: WidgetStateProperty.all(const Color(0xFFF1F5F9)),
          columnSpacing: 20,
          columns: (isVenteAchat
            ? const [DataColumn(label: Text('Produit', style: TextStyle(fontWeight: FontWeight.w600, fontSize: 12))),
                    DataColumn(label: Text('Qté', style: TextStyle(fontWeight: FontWeight.w600, fontSize: 12)), numeric: true),
                    DataColumn(label: Text('Montant HT', style: TextStyle(fontWeight: FontWeight.w600, fontSize: 12)), numeric: true)]
            : const [DataColumn(label: Text('Produit', style: TextStyle(fontWeight: FontWeight.w600, fontSize: 12))),
                    DataColumn(label: Text('Type', style: TextStyle(fontWeight: FontWeight.w600, fontSize: 12))),
                    DataColumn(label: Text('Qté', style: TextStyle(fontWeight: FontWeight.w600, fontSize: 12)), numeric: true),
                    DataColumn(label: Text('Source', style: TextStyle(fontWeight: FontWeight.w600, fontSize: 12))),
                    DataColumn(label: Text('Dest.', style: TextStyle(fontWeight: FontWeight.w600, fontSize: 12))),
                    DataColumn(label: Text('Date', style: TextStyle(fontWeight: FontWeight.w600, fontSize: 12))),
                    DataColumn(label: Text('État', style: TextStyle(fontWeight: FontWeight.w600, fontSize: 12)))]
          ).toList(),
          rows: data.asMap().entries.map((entry) => _buildRow(entry.value, entry.key, isVenteAchat)).toList(),
        ),
      ),
      const SizedBox(height: 16),
      _changeDateButton(section),
    ]);
  }

  Widget _buildTotaux(List<dynamic> data, bool isVenteAchat) {
    double totalQte = 0;
    double totalMontant = 0;
    for (final item in data) {
      final m = item is Map<String, dynamic> ? item : {};
      totalQte += double.tryParse((m['total_quantite'] ?? m['quantite_demandee'] ?? 0).toString()) ?? 0;
      totalMontant += double.tryParse((m['total_montant_ht'] ?? 0).toString()) ?? 0;
    }
    return Container(
      padding: const EdgeInsets.all(14),
      decoration: BoxDecoration(color: const Color(0xFFF8FAFC), borderRadius: BorderRadius.circular(10), border: Border.all(color: const Color(0xFFE2E8F0))),
      child: Row(children: [
        _totalItem('Total quantités', totalQte.toStringAsFixed(2)),
        Container(width: 1, height: 36, color: const Color(0xFFE2E8F0)),
        const SizedBox(width: 16),
        if (isVenteAchat) ...[
          Expanded(child: _totalItem('Total HT', formatCurrency(totalMontant))),
          Container(width: 1, height: 36, color: const Color(0xFFE2E8F0)),
          const SizedBox(width: 16),
        ],
        Expanded(child: _totalItem('Lignes', '${data.length}')),
      ]),
    );
  }

  Widget _totalItem(String label, String value) {
    return Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
      Text(label, style: TextStyle(color: Colors.grey[500], fontSize: 11)),
      const SizedBox(height: 2),
      Text(value, style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 15)),
    ]);
  }

  Widget _changeDateButton(String section) {
    return SizedBox(width: double.infinity, child: OutlinedButton.icon(
      onPressed: () => _pickDates(section),
      icon: const Icon(Icons.date_range, size: 16),
      label: const Text('Changer les dates'),
      style: OutlinedButton.styleFrom(foregroundColor: const Color(0xFF64748B), side: const BorderSide(color: Color(0xFFE2E8F0)), shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(8))),
    ));
  }

  DataRow _buildRow(dynamic item, int index, bool isVenteAchat) {
    final map = item is Map<String, dynamic> ? item : {};
    final style = TextStyle(fontSize: 13, color: index.isEven ? Colors.black : Colors.grey[800]);
    if (isVenteAchat) {
      return DataRow(color: WidgetStateProperty.all(index.isEven ? Colors.white : const Color(0xFFFAFAFA)), cells: [
        DataCell(Text(map['produit'] is Map ? (map['produit']['nom'] ?? '-') : (map['produit']?.toString() ?? map['nom']?.toString() ?? '-'), style: style)),
        DataCell(Text((map['total_quantite'] ?? map['quantite'] ?? 0).toString(), style: style)),
        DataCell(Text(formatCurrency(map['total_montant_ht'] ?? map['montant_ht'] ?? 0), style: style.copyWith(fontWeight: FontWeight.w600))),
      ]);
    }
    return DataRow(color: WidgetStateProperty.all(index.isEven ? Colors.white : const Color(0xFFFAFAFA)), cells: [
      DataCell(Text(map['nom_produit']?.toString() ?? map['produit']?.toString() ?? '-', style: style)),
      DataCell(Text(map['type_mouvement']?.toString() ?? map['type']?.toString() ?? '-', style: style)),
      DataCell(Text((map['quantite_demandee'] ?? map['quantite'] ?? 0).toString(), style: style)),
      DataCell(Text(map['emplacement_source_nom']?.toString() ?? '-', style: style)),
      DataCell(Text(map['emplacement_destination_nom']?.toString() ?? '-', style: style)),
      DataCell(Text(formatDate(map['date_prelevement']?.toString() ?? map['date']?.toString() ?? map['date_mouvement']?.toString()), style: style)),
      DataCell(Container(padding: const EdgeInsets.symmetric(horizontal: 6, vertical: 2),
        decoration: BoxDecoration(color: getEtatColor(map['etat']?.toString() ?? '').withValues(alpha: 0.12), borderRadius: BorderRadius.circular(6)),
        child: Text(map['etat']?.toString() ?? '-', style: TextStyle(fontSize: 11, color: getEtatColor(map['etat']?.toString() ?? ''), fontWeight: FontWeight.w600)))),
    ]);
  }
}
