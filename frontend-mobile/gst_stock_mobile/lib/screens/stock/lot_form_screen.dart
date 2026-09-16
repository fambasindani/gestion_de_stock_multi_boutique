import 'package:flutter/material.dart';
import 'package:gst_stock_mobile/models/models.dart';
import 'package:gst_stock_mobile/services/services.dart';
import 'package:gst_stock_mobile/screens/stock/barcode_scanner_screen.dart';

class LotFormScreen extends StatefulWidget {
  final LotTracabilite? lot;
  const LotFormScreen({super.key, this.lot});
  bool get isEdit => lot != null;

  @override
  State<LotFormScreen> createState() => _LotFormScreenState();
}

class _LotFormScreenState extends State<LotFormScreen> {
  final _formKey = GlobalKey<FormState>();
  final _nomCtrl = TextEditingController();
  final _codeCtrl = TextEditingController();
  final _codeBarreCtrl = TextEditingController();
  final _qteCtrl = TextEditingController(text: '1');
  final _fournisseurCtrl = TextEditingController();
  final _notesCtrl = TextEditingController();
  final _dateProdCtrl = TextEditingController();
  final _datePerempCtrl = TextEditingController();
  int? _produitId;
  late String _type;
  List<ProduitModele> _produits = [];
  bool _saving = false;

  @override
  void initState() {
    super.initState();
    final l = widget.lot;
    _nomCtrl.text = l?.nom ?? '';
    _codeCtrl.text = l?.code ?? '';
    _qteCtrl.text = (l?.quantiteInitiale ?? 1).toStringAsFixed(0);
    _fournisseurCtrl.text = l?.fournisseur ?? '';
    _notesCtrl.text = l?.notes ?? '';
    if (l?.dateProduction != null) _dateProdCtrl.text = l!.dateProduction!;
    if (l?.datePeremption != null) _datePerempCtrl.text = l!.datePeremption!;
    _produitId = l?.produitId;
    _type = l?.type ?? 'lot';
    _loadProduits();
  }

  @override
  void dispose() {
    _nomCtrl.dispose(); _codeCtrl.dispose(); _codeBarreCtrl.dispose(); _qteCtrl.dispose();
    _fournisseurCtrl.dispose(); _notesCtrl.dispose(); _dateProdCtrl.dispose(); _datePerempCtrl.dispose();
    super.dispose();
  }

  Future<void> _loadProduits() async {
    try { final prods = await ProduitService().getAll(); if (mounted) setState(() => _produits = prods); } catch (_) {}
  }

  Future<void> _save() async {
    if (!_formKey.currentState!.validate()) return;
    setState(() => _saving = true);
    final body = <String, dynamic>{
      'nom': _nomCtrl.text,
      'code': _codeCtrl.text,
      'produit_id': _produitId,
      'type': _type,
      'quantite_initiale': double.tryParse(_qteCtrl.text) ?? 1,
      if (_codeBarreCtrl.text.isNotEmpty) 'code_barres': _codeBarreCtrl.text,
      if (_dateProdCtrl.text.isNotEmpty) 'date_production': _dateProdCtrl.text,
      if (_datePerempCtrl.text.isNotEmpty) 'date_peremption': _datePerempCtrl.text,
      if (_fournisseurCtrl.text.isNotEmpty) 'fournisseur': _fournisseurCtrl.text,
      if (_notesCtrl.text.isNotEmpty) 'notes': _notesCtrl.text,
    };
    try {
      if (widget.isEdit) { await StockService().updateLot(widget.lot!.id, body); }
      else { await StockService().createLot(body); }
      if (mounted) Navigator.pop(context, true);
    } catch (e) {
      if (mounted) ScaffoldMessenger.of(context).showSnackBar(SnackBar(content: Text('Erreur: $e')));
    } finally { if (mounted) setState(() => _saving = false); }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: Text(widget.isEdit ? 'Modifier lot' : 'Nouveau lot'),),
      body: Form(key: _formKey, child: ListView(padding: const EdgeInsets.all(16), children: [
        TextFormField(controller: _nomCtrl, decoration: const InputDecoration(labelText: 'Nom *', border: OutlineInputBorder()), validator: (v) => v == null || v.isEmpty ? 'Requis' : null),
        const SizedBox(height: 12),
        TextFormField(controller: _codeCtrl, decoration: const InputDecoration(labelText: 'Code', hintText: 'LOT-001', border: OutlineInputBorder())),
        const SizedBox(height: 12),
        TextFormField(controller: _codeBarreCtrl, decoration: InputDecoration(labelText: 'Code-barres / QR code', border: const OutlineInputBorder(), hintText: 'Scanner ou saisir', suffixIcon: IconButton(icon: const Icon(Icons.qr_code_scanner), onPressed: () async { final r = await Navigator.push<String>(context, MaterialPageRoute(builder: (_) => const BarcodeScannerScreen())); if (r != null) _codeBarreCtrl.text = r; }))),
        const SizedBox(height: 12),
        DropdownButtonFormField<int?>(initialValue: _produitId, decoration: const InputDecoration(labelText: 'Produit *', border: OutlineInputBorder()), items: () {
          final items = <DropdownMenuItem<int?>>[];
          for (final p in _produits) { if (p.variantes == null || p.variantes!.isEmpty) continue; for (final v in p.variantes!) { items.add(DropdownMenuItem(value: v.id, child: Text('${p.nom} - ${v.nom}'))); } }
          return items;
        }(), onChanged: (v) => setState(() => _produitId = v), validator: (v) => v == null ? 'Requis' : null),
        const SizedBox(height: 12),
        DropdownButtonFormField<String>(initialValue: _type, decoration: const InputDecoration(labelText: 'Type', border: OutlineInputBorder()), items: const [
          DropdownMenuItem(value: 'lot', child: Text('Lot')), DropdownMenuItem(value: 'serie', child: Text('Série')),
        ], onChanged: (v) => setState(() => _type = v!)),
        const SizedBox(height: 12),
        TextFormField(controller: _qteCtrl, decoration: const InputDecoration(labelText: 'Quantité initiale *', border: OutlineInputBorder()), keyboardType: TextInputType.number, validator: (v) => v == null || v.isEmpty ? 'Requis' : null),
        const SizedBox(height: 12),
        TextFormField(controller: _dateProdCtrl, decoration: const InputDecoration(labelText: 'Date production', border: OutlineInputBorder(), suffixIcon: Icon(Icons.calendar_today, size: 18)), readOnly: true, onTap: () async {
          final d = await showDatePicker(context: context, initialDate: DateTime.now(), firstDate: DateTime(2020), lastDate: DateTime(2030));
          if (d != null) _dateProdCtrl.text = '${d.year}-${d.month.toString().padLeft(2, '0')}-${d.day.toString().padLeft(2, '0')}';
        }),
        const SizedBox(height: 12),
        TextFormField(controller: _datePerempCtrl, decoration: const InputDecoration(labelText: 'Date péremption', border: OutlineInputBorder(), suffixIcon: Icon(Icons.calendar_today, size: 18)), readOnly: true, onTap: () async {
          final d = await showDatePicker(context: context, initialDate: DateTime.now(), firstDate: DateTime(2020), lastDate: DateTime(2030));
          if (d != null) _datePerempCtrl.text = '${d.year}-${d.month.toString().padLeft(2, '0')}-${d.day.toString().padLeft(2, '0')}';
        }),
        const SizedBox(height: 12),
        TextFormField(controller: _fournisseurCtrl, decoration: const InputDecoration(labelText: 'Fournisseur', border: OutlineInputBorder())),
        const SizedBox(height: 12),
        TextFormField(controller: _notesCtrl, decoration: const InputDecoration(labelText: 'Notes', border: OutlineInputBorder()), maxLines: 3),
        const SizedBox(height: 80),
      ])),
      bottomNavigationBar: SafeArea(child: Padding(padding: const EdgeInsets.all(16), child: SizedBox(height: 48, child: ElevatedButton(onPressed: _saving ? null : _save, child: _saving ? const SizedBox(width: 20, height: 20, child: CircularProgressIndicator(strokeWidth: 2)) : Text(widget.isEdit ? 'Mettre à jour' : 'Créer le lot'))))),
    );
  }
}
