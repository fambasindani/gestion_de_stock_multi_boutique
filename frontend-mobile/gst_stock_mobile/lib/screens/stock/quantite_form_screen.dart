import 'package:flutter/material.dart';
import 'package:gst_stock_mobile/models/models.dart';
import 'package:gst_stock_mobile/services/services.dart';

class QuantiteFormScreen extends StatefulWidget {
  final QuantiteStock? quantite;
  const QuantiteFormScreen({super.key, this.quantite});
  bool get isEdit => quantite != null;

  @override
  State<QuantiteFormScreen> createState() => _QuantiteFormScreenState();
}

class _QuantiteFormScreenState extends State<QuantiteFormScreen> {
  final _formKey = GlobalKey<FormState>();
  final _qteDispCtrl = TextEditingController(text: '0');
  final _qteResCtrl = TextEditingController(text: '0');
  final _qteCmdCtrl = TextEditingController(text: '0');
  final _qteCtrlCtrl = TextEditingController(text: '0');
  final _seuilMinCtrl = TextEditingController();
  final _seuilMaxCtrl = TextEditingController();
  final _dateRecepCtrl = TextEditingController();
  final _notesCtrl = TextEditingController();
  int? _produitId;
  int? _emplacementId;
  int? _lotId;
  List<ProduitModele> _produits = [];
  List<EmplacementStock> _emplacements = [];
  List<LotTracabilite> _lots = [];
  bool _loadingData = true;
  bool _saving = false;

  @override
  void initState() {
    super.initState();
    final q = widget.quantite;
    if (q != null) {
      _produitId = q.produitId;
      _emplacementId = q.emplacementId;
      _lotId = q.lotId;
      _qteDispCtrl.text = q.quantiteDisponible.toStringAsFixed(2);
      _qteResCtrl.text = q.quantiteReservee.toStringAsFixed(2);
      _qteCmdCtrl.text = q.quantiteCommande.toStringAsFixed(2);
      _qteCtrlCtrl.text = q.quantiteControlee.toStringAsFixed(2);
      if (q.seuilMinimum != null) _seuilMinCtrl.text = q.seuilMinimum!.toStringAsFixed(2);
      if (q.seuilMaximum != null) _seuilMaxCtrl.text = q.seuilMaximum!.toStringAsFixed(2);
      if (q.dateProchaineReception != null) _dateRecepCtrl.text = q.dateProchaineReception!;
      if (q.notes != null) _notesCtrl.text = q.notes!;
    }
    _loadData();
  }

  @override
  void dispose() {
    _qteDispCtrl.dispose(); _qteResCtrl.dispose(); _qteCmdCtrl.dispose(); _qteCtrlCtrl.dispose();
    _seuilMinCtrl.dispose(); _seuilMaxCtrl.dispose(); _dateRecepCtrl.dispose(); _notesCtrl.dispose();
    super.dispose();
  }

  Future<void> _loadData() async {
    try {
      final s = StockService();
      final prods = await ProduitService().getAll();
      final emps = await s.getEmplacements();
      final lots = await s.getLots();
      if (!mounted) return;
      setState(() { _produits = prods; _emplacements = emps.where((e) => e.actif).toList(); _lots = lots; _loadingData = false; });
    } catch (_) { if (mounted) setState(() => _loadingData = false); }
  }

  List<LotTracabilite> get _lotsFiltres => _produitId != null ? _lots.where((l) => l.produitId == _produitId).toList() : _lots;

  Future<void> _save() async {
    if (!_formKey.currentState!.validate()) return;
    setState(() => _saving = true);
    final body = <String, dynamic>{
      'produit_id': _produitId,
      'emplacement_id': _emplacementId,
      'quantite_disponible': double.tryParse(_qteDispCtrl.text) ?? 0,
      'quantite_reservee': double.tryParse(_qteResCtrl.text) ?? 0,
      'quantite_commande': double.tryParse(_qteCmdCtrl.text) ?? 0,
      'quantite_controlee': double.tryParse(_qteCtrlCtrl.text) ?? 0,
      if (_lotId != null) 'lot_id': _lotId,
      if (_seuilMinCtrl.text.isNotEmpty) 'seuil_minimum': double.tryParse(_seuilMinCtrl.text),
      if (_seuilMaxCtrl.text.isNotEmpty) 'seuil_maximum': double.tryParse(_seuilMaxCtrl.text),
      if (_dateRecepCtrl.text.isNotEmpty) 'date_prochaine_reception': _dateRecepCtrl.text,
      if (_notesCtrl.text.isNotEmpty) 'notes': _notesCtrl.text,
    };
    try {
      if (widget.isEdit) {
        await StockService().updateQuantite(widget.quantite!.id, body);
      } else {
        await StockService().createQuantite(body);
      }
      if (mounted) Navigator.pop(context, true);
    } catch (e) {
      if (mounted) ScaffoldMessenger.of(context).showSnackBar(SnackBar(content: Text('Erreur: $e')));
    } finally { if (mounted) setState(() => _saving = false); }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: Text(widget.isEdit ? 'Modifier quantité' : 'Nouvelle quantité'),),
      body: _loadingData
          ? const Center(child: CircularProgressIndicator())
          : Form(key: _formKey, child: ListView(padding: const EdgeInsets.all(16), children: [
        DropdownButtonFormField<int?>(initialValue: _produitId, decoration: const InputDecoration(labelText: 'Produit *', border: OutlineInputBorder()), items: () {
          final items = <DropdownMenuItem<int?>>[];
          for (final p in _produits) { if (p.variantes == null) continue; for (final v in p.variantes!) { items.add(DropdownMenuItem(value: v.id, child: Text('${p.nom} - ${v.nom}'))); } }
          return items;
        }(), onChanged: (v) => setState(() { _produitId = v; _lotId = null; }), validator: (v) => v == null ? 'Requis' : null),
        const SizedBox(height: 12),
        DropdownButtonFormField<int?>(initialValue: _emplacementId, decoration: const InputDecoration(labelText: 'Emplacement *', border: OutlineInputBorder()), items: [
          ..._emplacements.map((e) => DropdownMenuItem(value: e.id, child: Text(e.nom))),
        ], onChanged: (v) => setState(() => _emplacementId = v), validator: (v) => v == null ? 'Requis' : null),
        const SizedBox(height: 12),
        DropdownButtonFormField<int?>(initialValue: _lotId, decoration: const InputDecoration(labelText: 'Lot', border: OutlineInputBorder()), items: [
          const DropdownMenuItem(value: null, child: Text('Aucun')),
          ..._lotsFiltres.map((l) => DropdownMenuItem(value: l.id, child: Text(l.nom))),
        ], onChanged: (v) => setState(() => _lotId = v)),
        const SizedBox(height: 20),
        Text('QUANTITÉS', style: TextStyle(fontSize: 13, fontWeight: FontWeight.w600, color: Colors.grey[700])),
        const SizedBox(height: 8),
        Row(children: [
          Expanded(child: TextFormField(controller: _qteDispCtrl, decoration: const InputDecoration(labelText: 'Disponible', border: OutlineInputBorder(), isDense: true), keyboardType: TextInputType.number)),
          const SizedBox(width: 8),
          Expanded(child: TextFormField(controller: _qteResCtrl, decoration: const InputDecoration(labelText: 'Réservée', border: OutlineInputBorder(), isDense: true), keyboardType: TextInputType.number)),
        ]),
        const SizedBox(height: 12),
        Row(children: [
          Expanded(child: TextFormField(controller: _qteCmdCtrl, decoration: const InputDecoration(labelText: 'Commandée', border: OutlineInputBorder(), isDense: true), keyboardType: TextInputType.number)),
          const SizedBox(width: 8),
          Expanded(child: TextFormField(controller: _qteCtrlCtrl, decoration: const InputDecoration(labelText: 'Contrôlée', border: OutlineInputBorder(), isDense: true), keyboardType: TextInputType.number)),
        ]),
        const SizedBox(height: 20),
        Text('SEUILS', style: TextStyle(fontSize: 13, fontWeight: FontWeight.w600, color: Colors.grey[700])),
        const SizedBox(height: 8),
        Row(children: [
          Expanded(child: TextFormField(controller: _seuilMinCtrl, decoration: const InputDecoration(labelText: 'Seuil min', hintText: 'Ex: 10', border: OutlineInputBorder(), isDense: true), keyboardType: TextInputType.number)),
          const SizedBox(width: 8),
          Expanded(child: TextFormField(controller: _seuilMaxCtrl, decoration: const InputDecoration(labelText: 'Seuil max', hintText: 'Ex: 500', border: OutlineInputBorder(), isDense: true), keyboardType: TextInputType.number)),
        ]),
        const SizedBox(height: 20),
        Text('AUTRES', style: TextStyle(fontSize: 13, fontWeight: FontWeight.w600, color: Colors.grey[700])),
        const SizedBox(height: 8),
        TextFormField(controller: _dateRecepCtrl, decoration: const InputDecoration(labelText: 'Prochaine réception', border: OutlineInputBorder(), suffixIcon: Icon(Icons.calendar_today, size: 18)), readOnly: true, onTap: () async {
          final d = await showDatePicker(context: context, initialDate: DateTime.now(), firstDate: DateTime(2020), lastDate: DateTime(2030));
          if (d != null) _dateRecepCtrl.text = '${d.year}-${d.month.toString().padLeft(2, '0')}-${d.day.toString().padLeft(2, '0')}';
        }),
        const SizedBox(height: 12),
        TextFormField(controller: _notesCtrl, decoration: const InputDecoration(labelText: 'Notes', border: OutlineInputBorder()), maxLines: 3),
        const SizedBox(height: 80),
      ])),
      bottomNavigationBar: SafeArea(child: Padding(padding: const EdgeInsets.all(16), child: SizedBox(height: 48, child: ElevatedButton(onPressed: _saving ? null : _save, child: _saving ? const SizedBox(width: 20, height: 20, child: CircularProgressIndicator(strokeWidth: 2)) : Text(widget.isEdit ? 'Mettre à jour' : 'Créer'))))),
    );
  }
}
