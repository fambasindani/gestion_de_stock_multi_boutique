import 'package:flutter/material.dart';
import 'package:gst_stock_mobile/models/models.dart';
import 'package:gst_stock_mobile/services/services.dart';
import 'package:gst_stock_mobile/config/theme.dart';
import 'package:gst_stock_mobile/utils/utils.dart';
import 'facture_detail_screen.dart';
import 'facture_form_screen.dart';

class FacturesListScreen extends StatefulWidget {
  const FacturesListScreen({super.key});

  @override
  State<FacturesListScreen> createState() => _FacturesListScreenState();
}

class _FacturesListScreenState extends State<FacturesListScreen> {
  final _service = FactureService();
  List<EcritureComptable> _factures = [];
  bool _loading = true;
  String? _error;

  @override
  void initState() {
    super.initState();
    _loadFactures();
  }

  Future<void> _loadFactures() async {
    setState(() { _loading = true; _error = null; });
    try {
      final data = await _service.getAll();
      if (!mounted) return;
      setState(() { _factures = data; _loading = false; });
    } catch (e) {
      if (!mounted) return;
      setState(() { _error = e.toString(); _loading = false; });
    }
  }

  Future<void> _openForm([EcritureComptable? f]) async {
    final ok = await Navigator.push<bool>(context, MaterialPageRoute(builder: (_) => FactureFormScreen(facture: f)));
    if (ok == true) _loadFactures();
  }

  void _openDetail(int id) {
    Navigator.push(context, MaterialPageRoute(builder: (_) => FactureDetailScreen(id: id))).then((_) => _loadFactures());
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: const Text('Factures'),),
      floatingActionButton: FloatingActionButton(
        onPressed: () => _openForm(),
        backgroundColor: AppTheme.primary,
        child: const Icon(Icons.add, color: Colors.white),
      ),
      body: _buildBody(),
    );
  }

  Widget _buildBody() {
    if (_loading) return const Center(child: CircularProgressIndicator());
    if (_error != null) {
      return Center(child: Column(mainAxisSize: MainAxisSize.min, children: [
        Text('Erreur: $_error', textAlign: TextAlign.center),
        const SizedBox(height: 16),
        ElevatedButton(onPressed: _loadFactures, child: const Text('Réessayer')),
      ]));
    }
    if (_factures.isEmpty) {
      return Center(child: Column(mainAxisSize: MainAxisSize.min, children: [
        Icon(Icons.description_outlined, size: 64, color: Colors.grey[400]),
        const SizedBox(height: 16),
        Text('Aucune facture', style: TextStyle(color: Colors.grey[600])),
        const SizedBox(height: 24),
        ElevatedButton.icon(icon: const Icon(Icons.add), onPressed: () => _openForm(), label: const Text('Créer une facture')),
      ]));
    }
    return RefreshIndicator(
      onRefresh: _loadFactures,
      child: ListView.builder(padding: const EdgeInsets.fromLTRB(16, 0, 16, 80), itemCount: _factures.length, itemBuilder: (context, index) => _buildFactureCard(_factures[index])),
    );
  }

  Widget _buildFactureCard(EcritureComptable f) {
    final ratio = f.montantTtc > 0 ? (f.montantPaye / f.montantTtc).clamp(0.0, 1.0) : 0.0;
    return Card(
      margin: const EdgeInsets.only(bottom: 12),
      child: InkWell(
        borderRadius: BorderRadius.circular(12),
        onTap: () => _openDetail(f.id),
        child: Padding(padding: const EdgeInsets.all(16), child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
          Row(mainAxisAlignment: MainAxisAlignment.spaceBetween, children: [
            Expanded(child: Text(f.reference, style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 16))),
            const SizedBox(width: 8),
            Container(padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 3), decoration: BoxDecoration(color: Colors.purple.withValues(alpha: 0.1), borderRadius: BorderRadius.circular(12)), child: Text(f.type, style: const TextStyle(color: Colors.purple, fontSize: 11))),
            const SizedBox(width: 6),
            Container(padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 3), decoration: BoxDecoration(color: getEtatColor(f.statut).withValues(alpha: 0.15), borderRadius: BorderRadius.circular(12)), child: Text(f.statut, style: TextStyle(color: getEtatColor(f.statut), fontSize: 11))),
          ]),
          const SizedBox(height: 8),
          Row(children: [Icon(Icons.person_outline, size: 16, color: Colors.grey[600]), const SizedBox(width: 6), Text(f.partenaire?.nom ?? 'Partenaire #${f.partenaireId}', style: TextStyle(color: Colors.grey[700]))]),
          const SizedBox(height: 4),
          Row(children: [Icon(Icons.calendar_today, size: 16, color: Colors.grey[600]), const SizedBox(width: 6), Text(formatDate(f.dateEmission), style: TextStyle(color: Colors.grey[600])), const Spacer(), Text(formatCurrency(f.montantTtc), style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 16))]),
          const SizedBox(height: 12),
          ClipRRect(borderRadius: BorderRadius.circular(4), child: LinearProgressIndicator(value: ratio, backgroundColor: Colors.grey[200], valueColor: AlwaysStoppedAnimation<Color>(f.montantRestant <= 0 ? Colors.green : Colors.orange), minHeight: 6)),
          const SizedBox(height: 4),
          Text('Payé: ${formatCurrency(f.montantPaye)} / Restant: ${formatCurrency(f.montantRestant)}', style: TextStyle(color: Colors.grey[500], fontSize: 11)),
        ])),
      ),
    );
  }
}
