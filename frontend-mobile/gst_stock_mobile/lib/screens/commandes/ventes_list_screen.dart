import 'package:flutter/material.dart';
import 'package:gst_stock_mobile/models/models.dart';
import 'package:gst_stock_mobile/services/services.dart';
import 'package:gst_stock_mobile/config/theme.dart';
import 'package:gst_stock_mobile/utils/utils.dart';
import 'package:gst_stock_mobile/screens/commandes/commande_detail_screen.dart';
import 'package:gst_stock_mobile/screens/commandes/commande_form_screen.dart';

class CommandesListScreen extends StatefulWidget {
  const CommandesListScreen({super.key});

  @override
  State<CommandesListScreen> createState() => _CommandesListScreenState();
}

class _CommandesListScreenState extends State<CommandesListScreen>
    with SingleTickerProviderStateMixin {
  late TabController _tabController;
  final _searchCtrl = TextEditingController();

  List<CommandeVente> _ventes = [];
  List<CommandeAchat> _achats = [];
  bool _loadingVentes = true;
  bool _loadingAchats = true;
  String? _error;

  @override
  void initState() {
    super.initState();
    _tabController = TabController(length: 2, vsync: this);
    _loadData();
  }

  @override
  void dispose() {
    _tabController.dispose();
    _searchCtrl.dispose();
    super.dispose();
  }

  Future<void> _loadData({String? search}) async {
    setState(() {
      _loadingVentes = true;
      _loadingAchats = true;
      _error = null;
    });
    try {
      final ventes = await CommandeVenteService().getAll(search: search);
      final achats = await CommandeAchatService().getAll(search: search);
      if (!mounted) return;
      setState(() {
        _ventes = ventes;
        _achats = achats;
        _loadingVentes = false;
        _loadingAchats = false;
      });
    } catch (e) {
      if (!mounted) return;
      setState(() {
        _error = e.toString();
        _loadingVentes = false;
        _loadingAchats = false;
      });
    }
  }

  void _onSearch(String value) {
    _loadData(search: value.isEmpty ? null : value);
  }

  Future<void> _openForm(String type) async {
    final ok = await Navigator.push<bool>(context, MaterialPageRoute(builder: (_) => CommandeFormScreen(type: type)));
    if (ok == true) _loadData();
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      floatingActionButton: FloatingActionButton(
        onPressed: () => _openForm(_tabController.index == 0 ? 'vente' : 'achat'),
        backgroundColor: AppTheme.primary,
        child: const Icon(Icons.add, color: Colors.white),
      ),
      body: Column(children: [
        Padding(padding: const EdgeInsets.fromLTRB(16, 16, 16, 8), child: TextField(
          controller: _searchCtrl,
          decoration: InputDecoration(hintText: 'Rechercher...', prefixIcon: const Icon(Icons.search), border: OutlineInputBorder(borderRadius: BorderRadius.circular(10)), suffixIcon: _searchCtrl.text.isNotEmpty ? IconButton(icon: const Icon(Icons.clear), onPressed: () { _searchCtrl.clear(); _onSearch(''); }) : null),
          onChanged: _onSearch,
        )),
        TabBar(
          controller: _tabController,
          tabs: const [Tab(text: 'Ventes'), Tab(text: 'Achats')],
        ),
        Expanded(
          child: TabBarView(
            controller: _tabController,
            children: [
              _buildVentesTab(),
              _buildAchatsTab(),
            ],
          ),
        ),
      ]),
    );
  }

  Widget _buildVentesTab() {
    if (_loadingVentes) return const Center(child: CircularProgressIndicator());
    if (_error != null) {
      return Center(child: Column(mainAxisSize: MainAxisSize.min, children: [
        Text('Erreur: $_error', textAlign: TextAlign.center),
        const SizedBox(height: 16),
        ElevatedButton(onPressed: () => _loadData(), child: const Text('Réessayer')),
      ]));
    }
    if (_ventes.isEmpty) {
      return Center(child: Column(mainAxisSize: MainAxisSize.min, children: [
        Icon(Icons.receipt_long_outlined, size: 64, color: Colors.grey[400]),
        const SizedBox(height: 16),
        Text('Aucune commande vente', style: TextStyle(color: Colors.grey[600])),
      ]));
    }
    return RefreshIndicator(
      onRefresh: () => _loadData(),
      child: ListView.builder(
        padding: const EdgeInsets.fromLTRB(16, 0, 16, 80),
        itemCount: _ventes.length,
        itemBuilder: (context, index) => _buildCommandeVenteCard(_ventes[index]),
      ),
    );
  }

  Widget _buildAchatsTab() {
    if (_loadingAchats) return const Center(child: CircularProgressIndicator());
    if (_error != null) {
      return Center(child: Column(mainAxisSize: MainAxisSize.min, children: [
        Text('Erreur: $_error', textAlign: TextAlign.center),
        const SizedBox(height: 16),
        ElevatedButton(onPressed: () => _loadData(), child: const Text('Réessayer')),
      ]));
    }
    if (_achats.isEmpty) {
      return Center(child: Column(mainAxisSize: MainAxisSize.min, children: [
        Icon(Icons.shopping_cart_outlined, size: 64, color: Colors.grey[400]),
        const SizedBox(height: 16),
        Text('Aucune commande achat', style: TextStyle(color: Colors.grey[600])),
      ]));
    }
    return RefreshIndicator(
      onRefresh: () => _loadData(),
      child: ListView.builder(
        padding: const EdgeInsets.fromLTRB(16, 0, 16, 80),
        itemCount: _achats.length,
        itemBuilder: (context, index) => _buildCommandeAchatCard(_achats[index]),
      ),
    );
  }

  Widget _buildCommandeVenteCard(CommandeVente cmd) {
    return Card(
      margin: const EdgeInsets.only(bottom: 12),
      child: InkWell(
        borderRadius: BorderRadius.circular(12),
        onTap: () => Navigator.push(context, MaterialPageRoute(builder: (_) => CommandeDetailScreen(id: cmd.id, type: 'vente'))).then((_) => _loadData()),
        child: Padding(padding: const EdgeInsets.all(16), child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
          Row(mainAxisAlignment: MainAxisAlignment.spaceBetween, children: [
            Text(cmd.reference, style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 16)),
            Container(
              padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
              decoration: BoxDecoration(color: getEtatColor(cmd.etat).withValues(alpha: 0.15), borderRadius: BorderRadius.circular(20)),
              child: Text(cmd.etat, style: TextStyle(color: getEtatColor(cmd.etat), fontSize: 12, fontWeight: FontWeight.w600)),
            ),
          ]),
          const SizedBox(height: 8),
          Row(children: [
            Icon(Icons.person_outline, size: 16, color: Colors.grey[600]),
            const SizedBox(width: 6),
            Text(cmd.partenaire?.nom ?? 'Client #${cmd.partenaireId}', style: TextStyle(color: Colors.grey[700])),
          ]),
          const SizedBox(height: 4),
          Row(children: [
            Icon(Icons.calendar_today, size: 16, color: Colors.grey[600]),
            const SizedBox(width: 6),
            Text(formatDate(cmd.dateCommande), style: TextStyle(color: Colors.grey[600])),
            const Spacer(),
            Text(formatCurrency(cmd.totalTtc), style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 16)),
          ]),
        ])),
      ),
    );
  }

  Widget _buildCommandeAchatCard(CommandeAchat cmd) {
    return Card(
      margin: const EdgeInsets.only(bottom: 12),
      child: InkWell(
        borderRadius: BorderRadius.circular(12),
        onTap: () => Navigator.push(context, MaterialPageRoute(builder: (_) => CommandeDetailScreen(id: cmd.id, type: 'achat'))).then((_) => _loadData()),
        child: Padding(padding: const EdgeInsets.all(16), child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
          Row(mainAxisAlignment: MainAxisAlignment.spaceBetween, children: [
            Text(cmd.reference, style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 16)),
            Container(
              padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
              decoration: BoxDecoration(color: getEtatColor(cmd.etat).withValues(alpha: 0.15), borderRadius: BorderRadius.circular(20)),
              child: Text(cmd.etat, style: TextStyle(color: getEtatColor(cmd.etat), fontSize: 12, fontWeight: FontWeight.w600)),
            ),
          ]),
          const SizedBox(height: 8),
          Row(children: [
            Icon(Icons.person_outline, size: 16, color: Colors.grey[600]),
            const SizedBox(width: 6),
            Text(cmd.partenaire?.nom ?? 'Fournisseur #${cmd.partenaireId}', style: TextStyle(color: Colors.grey[700])),
          ]),
          const SizedBox(height: 4),
          Row(children: [
            Icon(Icons.calendar_today, size: 16, color: Colors.grey[600]),
            const SizedBox(width: 6),
            Text(formatDate(cmd.dateCommande), style: TextStyle(color: Colors.grey[600])),
            const Spacer(),
            Text(formatCurrency(cmd.totalTtc), style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 16)),
          ]),
        ])),
      ),
    );
  }
}
