import 'package:flutter/material.dart';
import 'package:gst_stock_mobile/models/models.dart';
import 'package:gst_stock_mobile/services/services.dart';
import 'package:gst_stock_mobile/config/theme.dart';
import 'package:gst_stock_mobile/utils/utils.dart';
import 'package:gst_stock_mobile/screens/stock/transfert_detail_screen.dart';
import 'package:gst_stock_mobile/screens/stock/transfert_form_screen.dart';

class TransfertsScreen extends StatefulWidget {
  const TransfertsScreen({super.key});

  @override
  State<TransfertsScreen> createState() => _TransfertsScreenState();
}

class _TransfertsScreenState extends State<TransfertsScreen> {
  final _searchCtrl = TextEditingController();
  List<TransfertStock> _transferts = [];
  bool _loading = true;
  String? _error;

  @override
  void initState() {
    super.initState();
    _loadTransferts();
  }

  @override
  void dispose() {
    _searchCtrl.dispose();
    super.dispose();
  }

  Future<void> _loadTransferts({String? search}) async {
    setState(() { _loading = true; _error = null; });
    try {
      final data = await StockService().getTransferts(search: search);
      if (!mounted) return;
      setState(() { _transferts = data; _loading = false; });
    } catch (e) {
      if (!mounted) return;
      setState(() { _error = e.toString(); _loading = false; });
    }
  }

  void _onSearch(String value) => _loadTransferts(search: value.isEmpty ? null : value);

  Future<void> _openForm() async {
    final ok = await Navigator.push<bool>(context, MaterialPageRoute(builder: (_) => const TransfertFormScreen()));
    if (ok == true) _loadTransferts();
  }

  void _openDetail(int id) {
    Navigator.push(context, MaterialPageRoute(builder: (_) => TransfertDetailScreen(id: id))).then((_) => _loadTransferts());
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: const Text('Transferts'),),
      floatingActionButton: FloatingActionButton(onPressed: _openForm, backgroundColor: AppTheme.primary, child: const Icon(Icons.add, color: Colors.white)),
      body: Column(children: [
        Padding(padding: const EdgeInsets.fromLTRB(16, 16, 16, 8), child: TextField(
          controller: _searchCtrl,
          decoration: InputDecoration(hintText: 'Rechercher...', prefixIcon: const Icon(Icons.search), border: OutlineInputBorder(borderRadius: BorderRadius.circular(10)), suffixIcon: _searchCtrl.text.isNotEmpty ? IconButton(icon: const Icon(Icons.clear), onPressed: () { _searchCtrl.clear(); _onSearch(''); }) : null),
          onChanged: _onSearch,
        )),
        Expanded(child: _buildBody()),
      ]),
    );
  }

  Widget _buildBody() {
    if (_loading) return const Center(child: CircularProgressIndicator());
    if (_error != null) {
      return Center(child: Column(mainAxisSize: MainAxisSize.min, children: [
        Text('Erreur: $_error', textAlign: TextAlign.center), const SizedBox(height: 16),
        ElevatedButton(onPressed: () => _loadTransferts(), child: const Text('Réessayer')),
      ]));
    }
    if (_transferts.isEmpty) {
      return Center(child: Column(mainAxisSize: MainAxisSize.min, children: [
        Icon(Icons.swap_horiz, size: 64, color: Colors.grey[400]), const SizedBox(height: 16),
        Text('Aucun transfert', style: TextStyle(color: Colors.grey[600])),
      ]));
    }
    return RefreshIndicator(
      onRefresh: () => _loadTransferts(),
      child: ListView.builder(
        padding: const EdgeInsets.fromLTRB(16, 0, 16, 80),
        itemCount: _transferts.length,
        itemBuilder: (context, index) => _buildTransfertCard(_transferts[index]),
      ),
    );
  }

  Widget _buildTransfertCard(TransfertStock t) {
    return Card(
      margin: const EdgeInsets.only(bottom: 12),
      child: InkWell(
        borderRadius: BorderRadius.circular(12),
        onTap: () => _openDetail(t.id),
        child: Padding(padding: const EdgeInsets.all(16), child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
          Row(mainAxisAlignment: MainAxisAlignment.spaceBetween, children: [
            Text(t.reference, style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 16)),
            Row(children: [
              Container(padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 3),
                decoration: BoxDecoration(color: Colors.orange.withValues(alpha: 0.1), borderRadius: BorderRadius.circular(12)),
                child: Text(t.type, style: const TextStyle(color: Colors.orange, fontSize: 11))),
              const SizedBox(width: 6),
              Container(padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 3),
                decoration: BoxDecoration(color: getEtatColor(t.etat).withValues(alpha: 0.15), borderRadius: BorderRadius.circular(12)),
                child: Text(t.etat, style: TextStyle(color: getEtatColor(t.etat), fontSize: 11))),
            ]),
          ]),
          if (t.notes != null && t.notes!.isNotEmpty) ...[
            const SizedBox(height: 8),
            Text(t.notes!, style: TextStyle(color: Colors.grey[600], fontSize: 13)),
          ],
          const SizedBox(height: 8),
          Row(children: [
            Icon(Icons.calendar_today, size: 14, color: Colors.grey[500]),
            const SizedBox(width: 4),
            Text(formatDate(t.dateCreation), style: TextStyle(color: Colors.grey[500], fontSize: 12)),
            const Spacer(),
            if (t.mouvements != null) Text('${t.mouvements!.length} produit(s)', style: TextStyle(color: Colors.grey[500], fontSize: 12)),
          ]),
        ])),
      ),
    );
  }
}
