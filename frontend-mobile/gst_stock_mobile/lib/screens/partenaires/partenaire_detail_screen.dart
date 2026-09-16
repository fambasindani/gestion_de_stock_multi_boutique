import 'package:flutter/material.dart';
import 'package:gst_stock_mobile/models/models.dart';
import 'package:gst_stock_mobile/services/services.dart';
import 'partenaire_form_screen.dart';

class PartenaireDetailScreen extends StatefulWidget {
  final int id;
  const PartenaireDetailScreen({super.key, required this.id});

  @override
  State<PartenaireDetailScreen> createState() => _PartenaireDetailScreenState();
}

class _PartenaireDetailScreenState extends State<PartenaireDetailScreen> {
  final _service = PartenaireService();
  Partenaire? _p;
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
    final ok = await Navigator.push<bool>(context, MaterialPageRoute(builder: (_) => PartenaireFormScreen(partenaire: _p)));
    if (ok == true) _load();
  }

  Future<void> _delete() async {
    final ok = await showDialog<bool>(context: context, builder: (ctx) => AlertDialog(title: const Text('Confirmation'), content: const Text('Supprimer ce partenaire ?'), actions: [TextButton(onPressed: () => Navigator.pop(ctx, false), child: const Text('Annuler')), TextButton(onPressed: () => Navigator.pop(ctx, true), child: const Text('Supprimer', style: TextStyle(color: Colors.red)))],));
    if (ok == true) {
      try { await _service.delete(widget.id); if (mounted) Navigator.pop(context); }
      catch (e) { if (mounted) ScaffoldMessenger.of(context).showSnackBar(SnackBar(content: Text('Erreur: $e'))); }
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: Text(_p?.nom ?? 'Détail'), actions: [
        if (_p != null) IconButton(icon: const Icon(Icons.edit), onPressed: _edit),
        if (_p != null) IconButton(icon: const Icon(Icons.delete), onPressed: _delete),
      ]),
      body: _loading ? const Center(child: CircularProgressIndicator())
          : _error != null ? Center(child: Text('Erreur: $_error'))
          : _p == null ? const Center(child: Text('Introuvable'))
          : ListView(padding: const EdgeInsets.all(16), children: [
        _field('Nom', _p!.nom),
        _field('Code', _p!.code),
        _field('Email', _p!.email),
        _field('Téléphone', _p!.telephone),
        _field('Adresse', _p!.adresse),
        _field('Ville', _p!.ville),
        const SizedBox(height: 16),
        Row(children: [
          if (_p!.estClient) Container(padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4), decoration: BoxDecoration(color: Colors.blue.withValues(alpha: 0.15), borderRadius: BorderRadius.circular(12)), child: const Text('Client', style: TextStyle(color: Colors.blue, fontWeight: FontWeight.w600))),
          const SizedBox(width: 8),
          if (_p!.estFournisseur) Container(padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4), decoration: BoxDecoration(color: Colors.orange.withValues(alpha: 0.15), borderRadius: BorderRadius.circular(12)), child: const Text('Fournisseur', style: TextStyle(color: Colors.orange, fontWeight: FontWeight.w600))),
        ]),
      ]),
    );
  }

  Widget _field(String label, String? value) {
    return Padding(padding: const EdgeInsets.symmetric(vertical: 6), child: Row(crossAxisAlignment: CrossAxisAlignment.start, children: [
      SizedBox(width: 120, child: Text(label, style: TextStyle(color: Colors.grey[600], fontSize: 13))),
      Expanded(child: Text(value ?? '-', style: const TextStyle(fontSize: 15))),
    ]));
  }
}