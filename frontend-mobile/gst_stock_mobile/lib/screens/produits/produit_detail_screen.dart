import 'package:flutter/material.dart';
import 'package:gst_stock_mobile/models/models.dart';
import 'package:gst_stock_mobile/services/services.dart';
import 'package:gst_stock_mobile/utils/utils.dart';
import 'produit_form_screen.dart';

class ProduitDetailScreen extends StatefulWidget {
  final int id;
  const ProduitDetailScreen({super.key, required this.id});

  @override
  State<ProduitDetailScreen> createState() => _ProduitDetailScreenState();
}

class _ProduitDetailScreenState extends State<ProduitDetailScreen> {
  final _service = ProduitService();
  ProduitModele? _p;
  bool _loading = true;
  String? _error;

  @override
  void initState() {
    super.initState();
    _load();
  }

  Future<void> _load() async {
    setState(() { _loading = true; _error = null; });
    try { final p = await _service.getById(widget.id); if (mounted) setState(() => _p = p); }
    catch (e) { if (mounted) setState(() => _error = e.toString()); }
    finally { if (mounted) setState(() => _loading = false); }
  }

  Future<void> _edit() async {
    final ok = await Navigator.push<bool>(context, MaterialPageRoute(builder: (_) => ProduitFormScreen(produit: _p)));
    if (ok == true) _load();
  }

  Future<void> _delete() async {
    final ok = await showDialog<bool>(context: context, builder: (ctx) => AlertDialog(title: const Text('Confirmation'), content: const Text('Supprimer ce produit ?'), actions: [TextButton(onPressed: () => Navigator.pop(ctx, false), child: const Text('Annuler')), TextButton(onPressed: () => Navigator.pop(ctx, true), child: const Text('Supprimer', style: TextStyle(color: Colors.red)))],));
    if (ok == true) {
      try { await _service.delete(widget.id); if (mounted) Navigator.pop(context); }
      catch (e) { if (mounted) ScaffoldMessenger.of(context).showSnackBar(SnackBar(content: Text('Erreur: $e'))); }
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: Text(_p?.nom ?? 'Produit'), actions: [
        if (_p != null) PopupMenuButton<String>(onSelected: (v) { if (v == 'edit') _edit(); if (v == 'delete') _delete(); }, itemBuilder: (_) => [
          const PopupMenuItem(value: 'edit', child: ListTile(leading: Icon(Icons.edit), title: Text('Modifier'))),
          const PopupMenuItem(value: 'delete', child: ListTile(leading: Icon(Icons.delete, color: Colors.red), title: Text('Supprimer', style: TextStyle(color: Colors.red)))),
        ]),
      ]),
      body: _loading ? const Center(child: CircularProgressIndicator())
          : _error != null ? Center(child: Text('Erreur: $_error'))
          : _p == null ? const Center(child: Text('Introuvable'))
          : ListView(padding: const EdgeInsets.all(16), children: [
        Row(children: [
          Container(padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4), decoration: BoxDecoration(color: const Color(0xFF0284C7).withValues(alpha: 0.15), borderRadius: BorderRadius.circular(12)), child: Text(_p!.type, style: const TextStyle(color: Color(0xFF0284C7), fontWeight: FontWeight.w600))),
          const SizedBox(width: 8),
          if (_p!.categorie != null) Container(padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4), decoration: BoxDecoration(color: Colors.grey.withValues(alpha: 0.15), borderRadius: BorderRadius.circular(12)), child: Text(_p!.categorie!.nom, style: const TextStyle(color: Colors.grey, fontWeight: FontWeight.w600))),
        ]),
        const SizedBox(height: 20),
        if (_p!.variantes != null && _p!.variantes!.isNotEmpty) ...[
          Text('VARIANTES', style: TextStyle(fontSize: 12, color: Colors.grey[600], fontWeight: FontWeight.w600)),
          const SizedBox(height: 8),
          ..._p!.variantes!.map((v) => Card(margin: const EdgeInsets.only(bottom: 8), child: Padding(padding: const EdgeInsets.all(12), child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
            Text(v.nom, style: const TextStyle(fontWeight: FontWeight.w600)),
            if (v.codeInterne != null) Text('Code: ${v.codeInterne}', style: TextStyle(color: Colors.grey[600], fontSize: 12)),
            Row(children: [
              Text('Achat: ${formatCurrency(v.prixAchat)}', style: const TextStyle(fontSize: 13)),
              const SizedBox(width: 16),
              Text('Vente: ${formatCurrency(v.prixVente)}', style: const TextStyle(fontSize: 13, color: Color(0xFF16A34A), fontWeight: FontWeight.w500)),
            ]),
          ])))),
        ],
      ]),
    );
  }
}