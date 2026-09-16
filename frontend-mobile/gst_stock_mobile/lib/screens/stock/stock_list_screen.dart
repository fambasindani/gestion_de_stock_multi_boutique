import 'package:flutter/material.dart';
import 'package:gst_stock_mobile/models/models.dart';
import 'package:gst_stock_mobile/services/services.dart';
import 'package:gst_stock_mobile/config/theme.dart';
import 'package:gst_stock_mobile/utils/utils.dart';
import 'package:gst_stock_mobile/screens/stock/emplacement_detail_screen.dart';
import 'package:gst_stock_mobile/screens/stock/emplacement_form_screen.dart';
import 'package:gst_stock_mobile/screens/stock/lot_detail_screen.dart';
import 'package:gst_stock_mobile/screens/stock/lot_form_screen.dart';
import 'package:gst_stock_mobile/screens/stock/quantite_form_screen.dart';

class StockListScreen extends StatefulWidget {
  const StockListScreen({super.key});

  @override
  State<StockListScreen> createState() => _StockListScreenState();
}

class _StockListScreenState extends State<StockListScreen>
    with SingleTickerProviderStateMixin {
  late TabController _tabController;
  bool _alerteFilter = false;

  List<QuantiteStock> _quantites = [];
  List<EmplacementStock> _emplacements = [];
  List<LotTracabilite> _lots = [];
  bool _loadingQuantites = true;
  bool _loadingEmplacements = true;
  bool _loadingLots = true;
  String? _error;

  @override
  void initState() {
    super.initState();
    _tabController = TabController(length: 3, vsync: this);
    _loadAll();
  }

  @override
  void dispose() { _tabController.dispose(); super.dispose(); }

  Future<void> _loadAll() async {
      setState(() { _loadingQuantites = true; _loadingEmplacements = true; _loadingLots = true; _error = null; }); // ignore: curly_braces_in_flow_control_structures
    try {
      final results = await Future.wait([StockService().getQuantites(), StockService().getEmplacements(), StockService().getLots()]);
      if (!mounted) return;
      setState(() { _quantites = results[0] as List<QuantiteStock>; _emplacements = results[1] as List<EmplacementStock>; _lots = results[2] as List<LotTracabilite>; _loadingQuantites = false; _loadingEmplacements = false; _loadingLots = false; });
    } catch (e) { if (mounted) setState(() { _error = e.toString(); _loadingQuantites = false; _loadingEmplacements = false; _loadingLots = false; }); }
  }

  List<QuantiteStock> get _filteredQuantites => _alerteFilter ? _quantites.where((q) => q.quantiteDisponible <= 5).toList() : _quantites;

  void _openForm(int tab) {
    if (tab == 0) { Navigator.push(context, MaterialPageRoute(builder: (_) => const QuantiteFormScreen())).then((_) => _loadAll()); }
    else if (tab == 1) { Navigator.push(context, MaterialPageRoute(builder: (_) => const EmplacementFormScreen())).then((_) => _loadAll()); }
    else if (tab == 2) { Navigator.push(context, MaterialPageRoute(builder: (_) => const LotFormScreen())).then((_) => _loadAll()); }
  }

  void _openEmplacement(int id) => Navigator.push(context, MaterialPageRoute(builder: (_) => EmplacementDetailScreen(id: id))).then((_) => _loadAll());
  void _openLot(int id) => Navigator.push(context, MaterialPageRoute(builder: (_) => LotDetailScreen(id: id))).then((_) => _loadAll());

  @override
  Widget build(BuildContext context) {
    return Stack(children: [
      Column(children: [
        Padding(padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 8), child: Row(children: [
          const Text('Stock', style: TextStyle(fontSize: 18, fontWeight: FontWeight.bold)),
          const Spacer(),
          IconButton(icon: Icon(Icons.warning_amber_rounded, color: _alerteFilter ? Colors.red : Colors.grey),
            onPressed: () => setState(() => _alerteFilter = !_alerteFilter), tooltip: 'Filtrer alertes'),
        ])),
        TabBar(controller: _tabController, tabs: const [Tab(text: 'Quantités'), Tab(text: 'Emplacements'), Tab(text: 'Lots')]),
        Expanded(child: _error != null && _loadingQuantites
          ? Center(child: Column(mainAxisSize: MainAxisSize.min, children: [Text('Erreur: $_error', textAlign: TextAlign.center), const SizedBox(height: 16), ElevatedButton(onPressed: _loadAll, child: const Text('Réessayer'))]))
          : TabBarView(controller: _tabController, children: [_buildQuantitesTab(), _buildEmplacementsTab(), _buildLotsTab()])),
      ]),
      Positioned(bottom: 16, right: 16, child: FloatingActionButton(
        onPressed: () => _openForm(_tabController.index),
        backgroundColor: AppTheme.primary,
        child: Icon(Icons.add, color: Colors.white),
      )),
    ]);
  }

  Widget _buildQuantitesTab() {
    if (_loadingQuantites) return const Center(child: CircularProgressIndicator());
    final items = _filteredQuantites;
    if (items.isEmpty) {
      return Center(child: Column(mainAxisSize: MainAxisSize.min, children: [
        Icon(Icons.inventory_2_outlined, size: 64, color: Colors.grey[400]),
        const SizedBox(height: 16), Text(_alerteFilter ? 'Aucun stock en alerte' : 'Aucune quantité en stock', style: TextStyle(color: Colors.grey[600])),
      ]));
    }
    return RefreshIndicator(onRefresh: _loadAll, child: ListView.builder(padding: const EdgeInsets.fromLTRB(16, 0, 16, 80), itemCount: items.length, itemBuilder: (context, index) => _buildQuantiteCard(items[index])));
  }

  Widget _buildQuantiteCard(QuantiteStock q) {
    final isLow = q.quantiteDisponible <= 5;
    return Card(margin: const EdgeInsets.only(bottom: 8),
      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12), side: isLow ? const BorderSide(color: Colors.red, width: 1.5) : BorderSide.none),
      child: InkWell(
        borderRadius: BorderRadius.circular(12),
        onTap: () async { final ok = await Navigator.push<bool>(context, MaterialPageRoute(builder: (_) => QuantiteFormScreen(quantite: q))); if (ok == true) _loadAll(); },
        child: Padding(padding: const EdgeInsets.all(12), child: Row(children: [
          Expanded(child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
            Text(q.produit?.nom ?? 'Produit #${q.produitId}', style: const TextStyle(fontWeight: FontWeight.w600)),
            const SizedBox(height: 4),
            Text('Empl.: ${q.emplacement?.nom ?? 'N/A'}', style: TextStyle(color: Colors.grey[600], fontSize: 13)),
            if (q.lot != null) Text('Lot: ${q.lot!.nom}', style: TextStyle(color: Colors.grey[600], fontSize: 13)),
          ])),
          Column(children: [
            Text(q.quantiteDisponible.toStringAsFixed(2), style: TextStyle(fontWeight: FontWeight.bold, fontSize: 18, color: isLow ? Colors.red : Colors.green[700])),
            Text('disp.', style: TextStyle(color: Colors.grey[500], fontSize: 11)),
          ]),
        ])),
      ),
    );
  }

  Widget _buildEmplacementsTab() {
    if (_loadingEmplacements) return const Center(child: CircularProgressIndicator());
    if (_emplacements.isEmpty) {
      return Center(child: Column(mainAxisSize: MainAxisSize.min, children: [
        Icon(Icons.location_on_outlined, size: 64, color: Colors.grey[400]), const SizedBox(height: 16),
        Text('Aucun emplacement', style: TextStyle(color: Colors.grey[600])),
      ]));
    }
    return RefreshIndicator(onRefresh: _loadAll, child: ListView.builder(padding: const EdgeInsets.fromLTRB(16, 0, 16, 80), itemCount: _emplacements.length, itemBuilder: (context, index) {
      final emp = _emplacements[index];
      return Card(margin: const EdgeInsets.only(bottom: 8), child: InkWell(borderRadius: BorderRadius.circular(12), onTap: () => _openEmplacement(emp.id),
        child: Padding(padding: const EdgeInsets.all(12), child: Row(children: [
          Expanded(child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
            Text(emp.nom, style: const TextStyle(fontWeight: FontWeight.w600)),
            const SizedBox(height: 4), Text('Code: ${emp.code}', style: TextStyle(color: Colors.grey[600], fontSize: 13)),
          ])),
          Container(padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 3), decoration: BoxDecoration(color: Colors.blue.withValues(alpha: 0.1), borderRadius: BorderRadius.circular(12)),
            child: Text(emp.type, style: const TextStyle(color: Colors.blue, fontSize: 11))),
          const SizedBox(width: 6),
          Container(padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 3), decoration: BoxDecoration(color: Colors.green.withValues(alpha: 0.1), borderRadius: BorderRadius.circular(12)),
            child: Text(emp.usage, style: const TextStyle(color: Colors.green, fontSize: 11))),
        ]))));
    }));
  }

  Widget _buildLotsTab() {
    if (_loadingLots) return const Center(child: CircularProgressIndicator());
    if (_lots.isEmpty) {
      return Center(child: Column(mainAxisSize: MainAxisSize.min, children: [
        Icon(Icons.qr_code_2_outlined, size: 64, color: Colors.grey[400]), const SizedBox(height: 16),
        Text('Aucun lot', style: TextStyle(color: Colors.grey[600])),
      ]));
    }
    return RefreshIndicator(onRefresh: _loadAll, child: ListView.builder(padding: const EdgeInsets.fromLTRB(16, 0, 16, 80), itemCount: _lots.length, itemBuilder: (context, index) {
      final lot = _lots[index];
      return Card(margin: const EdgeInsets.only(bottom: 8), child: InkWell(borderRadius: BorderRadius.circular(12), onTap: () => _openLot(lot.id),
        child: Padding(padding: const EdgeInsets.all(12), child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
          Row(mainAxisAlignment: MainAxisAlignment.spaceBetween, children: [
            Text(lot.nom, style: const TextStyle(fontWeight: FontWeight.w600)),
            Container(padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 3), decoration: BoxDecoration(color: getEtatColor(lot.statut).withValues(alpha: 0.15), borderRadius: BorderRadius.circular(12)),
              child: Text(lot.statut, style: TextStyle(color: getEtatColor(lot.statut), fontSize: 11))),
          ]),
          const SizedBox(height: 4), Text('Code: ${lot.code}', style: TextStyle(color: Colors.grey[600], fontSize: 13)),
          const SizedBox(height: 4),
          Row(children: [
            Text('Prod: ${formatDate(lot.dateProduction)}', style: TextStyle(color: Colors.grey[500], fontSize: 12)),
            const SizedBox(width: 16),
            Text('Exp: ${formatDate(lot.datePeremption)}', style: TextStyle(color: Colors.grey[500], fontSize: 12)),
          ]),
          const SizedBox(height: 4),
          Text('Qté: ${lot.quantiteActuelle} / ${lot.quantiteInitiale}', style: TextStyle(color: Colors.grey[700], fontSize: 13)),
        ]))));
    }));
  }
}
