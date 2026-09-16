import 'package:flutter/material.dart';
import 'package:gst_stock_mobile/models/models.dart';
import 'package:gst_stock_mobile/services/services.dart';
import 'package:gst_stock_mobile/utils/utils.dart';
import 'package:gst_stock_mobile/screens/stock/lot_form_screen.dart';

class LotDetailScreen extends StatefulWidget {
  final int id;
  const LotDetailScreen({super.key, required this.id});

  @override
  State<LotDetailScreen> createState() => _LotDetailScreenState();
}

class _LotDetailScreenState extends State<LotDetailScreen> {
  LotTracabilite? _lot;
  bool _loading = true;
  String? _error;

  @override
  void initState() { super.initState(); _load(); }

  Future<void> _load() async {
    setState(() { _loading = true; _error = null; });
    try {
      final l = await StockService().getLot(widget.id);
      if (!mounted) return;
      setState(() { _lot = l; _loading = false; });
    } catch (e) { if (mounted) setState(() { _error = e.toString(); _loading = false; }); }
  }

  Future<void> _edit() async {
    final ok = await Navigator.push<bool>(context, MaterialPageRoute(builder: (_) => LotFormScreen(lot: _lot)));
    if (ok == true) _load();
  }

  Future<void> _delete() async {
    final confirm = await showDialog<bool>(context: context, builder: (ctx) => AlertDialog(
      title: const Text('Confirmer'), content: Text('Supprimer ${_lot!.nom} ?'),
      actions: [
        TextButton(onPressed: () => Navigator.pop(ctx, false), child: const Text('Annuler')),
        TextButton(onPressed: () => Navigator.pop(ctx, true), child: const Text('Supprimer', style: TextStyle(color: Colors.red))),
      ],
    ));
    if (confirm != true) return;
    try { await StockService().deleteLot(widget.id); if (mounted) Navigator.pop(context, true); }
    catch (e) { if (mounted) ScaffoldMessenger.of(context).showSnackBar(SnackBar(content: Text('Erreur: $e'))); }
  }

  Future<void> _reserver() async {
    final qteCtrl = TextEditingController(text: _lot!.quantiteActuelle.toStringAsFixed(0));
    final qte = await showDialog<double>(context: context, builder: (ctx) => AlertDialog(
      title: const Text('Réserver quantité'), content: TextField(controller: qteCtrl, keyboardType: TextInputType.number, decoration: const InputDecoration(labelText: 'Quantité')),
      actions: [
        TextButton(onPressed: () => Navigator.pop(ctx), child: const Text('Annuler')),
        TextButton(onPressed: () => Navigator.pop(ctx, double.tryParse(qteCtrl.text) ?? 0), child: const Text('Réserver')),
      ],
    ));
    if (qte == null || qte <= 0) return;
    try { await StockService().reserverLot(widget.id, qte); _load(); }
    catch (e) { if (mounted) ScaffoldMessenger.of(context).showSnackBar(SnackBar(content: Text('Erreur: $e'))); }
    qteCtrl.dispose();
  }

  Future<void> _liberer() async {
    try { await StockService().libererLot(widget.id, _lot!.quantiteActuelle); _load(); }
    catch (e) { if (mounted) ScaffoldMessenger.of(context).showSnackBar(SnackBar(content: Text('Erreur: $e'))); }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: Text(_lot?.nom ?? 'Lot #${widget.id}'),
        actions: [
          if (_lot != null) PopupMenuButton<String>(onSelected: (v) {
            switch (v) { case 'edit': _edit(); case 'delete': _delete(); }
          }, itemBuilder: (ctx) => [
            const PopupMenuItem(value: 'edit', child: ListTile(leading: Icon(Icons.edit), title: Text('Modifier'), dense: true)),
            const PopupMenuDivider(),
            const PopupMenuItem(value: 'delete', child: ListTile(leading: Icon(Icons.delete, color: Colors.red), title: Text('Supprimer', style: TextStyle(color: Colors.red)), dense: true)),
          ]),
        ],
      ),
      body: _loading ? const Center(child: CircularProgressIndicator())
          : _error != null ? Center(child: Column(mainAxisSize: MainAxisSize.min, children: [Text('Erreur: $_error'), const SizedBox(height: 16), ElevatedButton(onPressed: _load, child: const Text('Réessayer'))]))
          : ListView(padding: const EdgeInsets.all(16), children: [
              Card(child: Padding(padding: const EdgeInsets.all(16), child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
                Text(_lot!.nom, style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 18)),
                const SizedBox(height: 4),
                Text('Code: ${_lot!.code}', style: TextStyle(color: Colors.grey[600])),
                const Divider(height: 24),
                _row('Produit', _lot!.produit?.nom ?? 'N/A'),
                const SizedBox(height: 8), _row('Type', _lot!.type),
                const SizedBox(height: 8), _row('Statut', _lot!.statut),
                const SizedBox(height: 8), _row('Qté initiale', _lot!.quantiteInitiale.toStringAsFixed(1)),
                const SizedBox(height: 8), _row('Qté actuelle', _lot!.quantiteActuelle.toStringAsFixed(1)),
                const SizedBox(height: 8), _row('Date production', formatDate(_lot!.dateProduction)),
                const SizedBox(height: 8), _row('Date péremption', formatDate(_lot!.datePeremption)),
                const SizedBox(height: 16),
                Row(children: [
                  Expanded(child: ElevatedButton.icon(icon: const Icon(Icons.lock_outline, size: 16), onPressed: _reserver, label: const Text('Réserver'))),
                  const SizedBox(width: 8),
                  Expanded(child: ElevatedButton.icon(icon: const Icon(Icons.lock_open, size: 16), onPressed: _liberer, label: const Text('Libérer'))),
                ]),
              ]))),
            ]),
    );
  }

  Widget _row(String label, String value) => Row(children: [Text('$label : ', style: TextStyle(color: Colors.grey[600])), Text(value)]);
}
