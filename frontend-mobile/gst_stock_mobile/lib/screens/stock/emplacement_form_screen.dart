import 'package:flutter/material.dart';
import 'package:gst_stock_mobile/models/models.dart';
import 'package:gst_stock_mobile/services/services.dart';
import 'package:gst_stock_mobile/screens/stock/barcode_scanner_screen.dart';

class EmplacementFormScreen extends StatefulWidget {
  final EmplacementStock? emplacement;
  const EmplacementFormScreen({super.key, this.emplacement});
  bool get isEdit => emplacement != null;

  @override
  State<EmplacementFormScreen> createState() => _EmplacementFormScreenState();
}

class _EmplacementFormScreenState extends State<EmplacementFormScreen> {
  final _formKey = GlobalKey<FormState>();
  final _nomCtrl = TextEditingController();
  final _codeCtrl = TextEditingController();
  final _descCtrl = TextEditingController();
  final _capaciteCtrl = TextEditingController();
  final _codeBarreCtrl = TextEditingController();
  late String _type;
  late String _usage;
  int? _parentId;
  List<EmplacementStock> _parents = [];
  bool _saving = false;
  bool _loadingParents = true;

  @override
  void initState() {
    super.initState();
    final e = widget.emplacement;
    _nomCtrl.text = e?.nom ?? '';
    _codeCtrl.text = e?.code ?? '';
    _descCtrl.text = e?.description ?? '';
    _codeBarreCtrl.text = e?.codeBarres ?? '';
    _type = ['normal', 'reserve', 'qualite', 'quarantine', 'entrepot'].contains(e?.type) ? e!.type : 'normal';
    _usage = ['fournisseur', 'client', 'interne', 'inventaire', 'approvisionnement', 'production', 'transit', 'vue'].contains(e?.usage) ? e!.usage : 'interne';
    _parentId = e?.parentId;
    if (e?.capaciteMaximale != null) _capaciteCtrl.text = e!.capaciteMaximale!.toStringAsFixed(0);
    _loadParents();
  }

  @override
  void dispose() { _nomCtrl.dispose(); _codeCtrl.dispose(); _descCtrl.dispose(); _capaciteCtrl.dispose(); _codeBarreCtrl.dispose(); super.dispose(); }

  Future<void> _loadParents() async {
    try {
      final list = await StockService().getEmplacements();
      if (mounted) setState(() {
        _parents = list.where((e) => e.id != widget.emplacement?.id).toList();
        _loadingParents = false;
      });
    } catch (_) {
      if (mounted) setState(() => _loadingParents = false);
    }
  }

  Future<void> _save() async {
    if (!_formKey.currentState!.validate()) return;
    setState(() => _saving = true);
    final body = <String, dynamic>{
      'nom': _nomCtrl.text, 'code': _codeCtrl.text, 'type': _type, 'usage': _usage,
      if (_parentId != null) 'emplacement_parent_id': _parentId,
      if (_descCtrl.text.isNotEmpty) 'description': _descCtrl.text,
      if (_capaciteCtrl.text.isNotEmpty) 'capacite_maximale': double.tryParse(_capaciteCtrl.text),
      if (_codeBarreCtrl.text.isNotEmpty) 'code_barres': _codeBarreCtrl.text,
    };
    try {
      if (widget.isEdit) { await StockService().updateEmplacement(widget.emplacement!.id, body); }
      else { await StockService().createEmplacement(body); }
      if (mounted) Navigator.pop(context, true);
    } catch (e) {
      if (mounted) ScaffoldMessenger.of(context).showSnackBar(SnackBar(content: Text('Erreur: $e')));
    } finally { if (mounted) setState(() => _saving = false); }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: Text(widget.isEdit ? 'Modifier' : 'Nouvel emplacement'),),
      body: Form(key: _formKey, child: ListView(padding: const EdgeInsets.all(16), children: [
        TextFormField(controller: _nomCtrl, decoration: const InputDecoration(labelText: 'Nom *', border: OutlineInputBorder()), validator: (v) => v == null || v.isEmpty ? 'Requis' : null),
        const SizedBox(height: 12),
        TextFormField(controller: _codeCtrl, decoration: const InputDecoration(labelText: 'Code', border: OutlineInputBorder())),
        const SizedBox(height: 12),
        TextFormField(controller: _descCtrl, decoration: const InputDecoration(labelText: 'Description', border: OutlineInputBorder()), maxLines: 3),
        const SizedBox(height: 12),
        TextFormField(controller: _codeBarreCtrl, decoration: InputDecoration(labelText: 'Code-barres', border: const OutlineInputBorder(), suffixIcon: IconButton(icon: const Icon(Icons.qr_code_scanner), onPressed: () async { final r = await Navigator.push<String>(context, MaterialPageRoute(builder: (_) => const BarcodeScannerScreen())); if (r != null) _codeBarreCtrl.text = r; }))),
        const SizedBox(height: 12),
        DropdownButtonFormField<String>(initialValue: _type, decoration: const InputDecoration(labelText: 'Type', border: OutlineInputBorder()), items: const [
          DropdownMenuItem(value: 'normal', child: Text('Normal')), DropdownMenuItem(value: 'reserve', child: Text('Réserve')),
          DropdownMenuItem(value: 'entrepot', child: Text('Entrepôt')), DropdownMenuItem(value: 'qualite', child: Text('Qualité')),
          DropdownMenuItem(value: 'quarantine', child: Text('Quarantaine')),
        ], onChanged: (v) => setState(() => _type = v!)),
        const SizedBox(height: 12),
        DropdownButtonFormField<String>(initialValue: _usage, decoration: const InputDecoration(labelText: 'Usage', border: OutlineInputBorder()), items: const [
          DropdownMenuItem(value: 'fournisseur', child: Text('Fournisseur')), DropdownMenuItem(value: 'client', child: Text('Client')),
          DropdownMenuItem(value: 'interne', child: Text('Interne')), DropdownMenuItem(value: 'inventaire', child: Text('Inventaire')),
          DropdownMenuItem(value: 'approvisionnement', child: Text('Approvisionnement')), DropdownMenuItem(value: 'production', child: Text('Production')),
          DropdownMenuItem(value: 'transit', child: Text('Transit')), DropdownMenuItem(value: 'vue', child: Text('Vue')),
        ], onChanged: (v) => setState(() => _usage = v!)),
        const SizedBox(height: 12),
        _loadingParents
          ? const Padding(padding: EdgeInsets.symmetric(vertical: 16), child: Center(child: SizedBox(width: 20, height: 20, child: CircularProgressIndicator(strokeWidth: 2))))
          : DropdownButtonFormField<int?>(initialValue: _parentId, decoration: const InputDecoration(labelText: 'Emplacement parent', border: OutlineInputBorder()), items: [
            const DropdownMenuItem(value: null, child: Text('Aucun')),
            ..._parents.map((e) => DropdownMenuItem(value: e.id, child: Text(e.nom))),
          ], onChanged: (v) => setState(() => _parentId = v)),
        const SizedBox(height: 12),
        TextFormField(controller: _capaciteCtrl, decoration: const InputDecoration(labelText: 'Capacité maximale', border: OutlineInputBorder()), keyboardType: TextInputType.number),
        const SizedBox(height: 80),
      ])),
      bottomNavigationBar: SafeArea(child: Padding(padding: const EdgeInsets.all(16), child: SizedBox(height: 48, child: ElevatedButton(onPressed: _saving ? null : _save, child: _saving ? const SizedBox(width: 20, height: 20, child: CircularProgressIndicator(strokeWidth: 2)) : Text(widget.isEdit ? 'Mettre à jour' : 'Créer'))))),
    );
  }
}
