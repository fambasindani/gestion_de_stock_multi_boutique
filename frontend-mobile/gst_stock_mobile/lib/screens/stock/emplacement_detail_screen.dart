import 'package:flutter/material.dart';
import 'package:gst_stock_mobile/models/models.dart';
import 'package:gst_stock_mobile/services/services.dart';
import 'package:gst_stock_mobile/screens/stock/emplacement_form_screen.dart';

class EmplacementDetailScreen extends StatefulWidget {
  final int id;
  const EmplacementDetailScreen({super.key, required this.id});

  @override
  State<EmplacementDetailScreen> createState() => _EmplacementDetailScreenState();
}

class _EmplacementDetailScreenState extends State<EmplacementDetailScreen> {
  EmplacementStock? _emp;
  bool _loading = true;
  String? _error;

  @override
  void initState() { super.initState(); _load(); }

  Future<void> _load() async {
    setState(() { _loading = true; _error = null; });
    try {
      final e = await StockService().getEmplacement(widget.id);
      if (!mounted) return;
      setState(() { _emp = e; _loading = false; });
    } catch (e) { if (mounted) setState(() { _error = e.toString(); _loading = false; }); }
  }

  Future<void> _edit() async {
    final ok = await Navigator.push<bool>(context, MaterialPageRoute(builder: (_) => EmplacementFormScreen(emplacement: _emp)));
    if (ok == true) _load();
  }

  Future<void> _delete() async {
    final confirm = await showDialog<bool>(context: context, builder: (ctx) => AlertDialog(
      title: const Text('Confirmer'), content: Text('Supprimer ${_emp!.nom} ?'),
      actions: [
        TextButton(onPressed: () => Navigator.pop(ctx, false), child: const Text('Annuler')),
        TextButton(onPressed: () => Navigator.pop(ctx, true), child: const Text('Supprimer', style: TextStyle(color: Colors.red))),
      ],
    ));
    if (confirm != true) return;
    try { await StockService().deleteEmplacement(widget.id); if (mounted) Navigator.pop(context, true); }
    catch (e) { if (mounted) ScaffoldMessenger.of(context).showSnackBar(SnackBar(content: Text('Erreur: $e'))); }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: Text(_emp?.nom ?? 'Emplacement #${widget.id}'),
        actions: [
          if (_emp != null) PopupMenuButton<String>(onSelected: (v) { if (v == 'edit') { _edit(); } else { _delete(); } },
            itemBuilder: (ctx) => [
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
                Text(_emp!.nom, style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 18)),
                const SizedBox(height: 4),
                Text('Code: ${_emp!.code}', style: TextStyle(color: Colors.grey[600])),
                const Divider(height: 24),
                _row('Type', _emp!.type),
                const SizedBox(height: 8), _row('Usage', _emp!.usage),
                const SizedBox(height: 8), _row('Actif', _emp!.actif ? 'Oui' : 'Non'),
              ]))),
            ]),
    );
  }

  Widget _row(String label, String value) => Row(children: [Text('$label : ', style: TextStyle(color: Colors.grey[600])), Text(value)]);
}
