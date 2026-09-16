import 'package:flutter/material.dart';
import 'package:gst_stock_mobile/models/models.dart';
import 'package:gst_stock_mobile/services/services.dart';
import 'package:gst_stock_mobile/services/api_client.dart';

class _MouvementLine {
  int? varianteId;
  String nomProduit = '';
  final TextEditingController qteCtrl;
  int? lotId;
  _MouvementLine() : qteCtrl = TextEditingController(text: '1');
  void dispose() { qteCtrl.dispose(); }
  double get quantite => double.tryParse(qteCtrl.text) ?? 0;
  Map<String, dynamic> toJson() => {
    'produit_id': varianteId,
    if (lotId != null) 'lot_id': lotId,
    'quantite_demandee': quantite,
  };
}

class TransfertFormScreen extends StatefulWidget {
  final TransfertStock? transfert;
  const TransfertFormScreen({super.key, this.transfert});
  bool get isEdit => transfert != null;

  @override
  State<TransfertFormScreen> createState() => _TransfertFormScreenState();
}

class _TransfertFormScreenState extends State<TransfertFormScreen> {
  final _formKey = GlobalKey<FormState>();
  late String _type;
  final _dateCtrl = TextEditingController();
  final _notesCtrl = TextEditingController();
  int? _srcId;
  int? _destId;
  List<EmplacementStock> _emplacements = [];
  List<ProduitModele> _produits = [];
  List<LotTracabilite> _lots = [];
  final List<_MouvementLine> _lignes = [];
  bool _saving = false;

  @override
  void initState() {
    super.initState();
    final t = widget.transfert;
    final now = DateTime.now();
    _dateCtrl.text = '${now.year}-${now.month.toString().padLeft(2, '0')}-${now.day.toString().padLeft(2, '0')}';
    _type = t?.type ?? 'interne';
    _srcId = t?.emplacementSourceId;
    _destId = t?.emplacementDestinationId;
    if (t?.notes != null) _notesCtrl.text = t!.notes!;
    if (t?.mouvements != null) {
      for (final m in t!.mouvements!) {
        final l = _MouvementLine();
        l.varianteId = m.produitId;
        l.nomProduit = m.nomProduit;
        l.qteCtrl.text = m.quantiteDemandee.toStringAsFixed(0);
        l.lotId = m.lotId;
        _lignes.add(l);
      }
    }
    _loadData();
  }

  @override
  void dispose() {
    _dateCtrl.dispose(); _notesCtrl.dispose();
    for (final l in _lignes) { l.dispose(); }
    super.dispose();
  }

  Future<void> _loadData() async {
    try {
      final s = StockService();
      final emps = await s.getEmplacements();
      final prods = await ProduitService().getAll();
      final lots = await s.getLots();
      if (!mounted) return;
      setState(() {
        _emplacements = emps.where((e) => e.actif).toList();
        _produits = prods;
        _lots = lots;
      });
    } catch (_) {}
  }

  void _addLigne() => setState(() => _lignes.add(_MouvementLine()));
  void _removeLigne(int i) { _lignes[i].dispose(); setState(() => _lignes.removeAt(i)); }

  Future<void> _save() async {
    if (!_formKey.currentState!.validate()) return;
    setState(() => _saving = true);
    final lignesOk = _lignes.where((l) => l.varianteId != null && l.quantite > 0).toList();
    final body = <String, dynamic>{
      'type': _type,
      'date_prevue': _dateCtrl.text,
      if (_notesCtrl.text.isNotEmpty) 'notes': _notesCtrl.text,
      'emplacement_source_id': _srcId,
      'emplacement_destination_id': _destId,
      'mouvements': lignesOk.map((l) => l.toJson()).toList(),
    };
    try {
      if (widget.isEdit) {
        await StockService().updateTransfert(widget.transfert!.id, body);
      } else {
        await StockService().createTransfert(body);
      }
      if (mounted) Navigator.pop(context, true);
    } catch (e) {
      String msg = 'Erreur: $e';
      if (e is ApiException && e.errors != null) {
        msg = e.errors!.entries.map((kv) => '${kv.key}: ${kv.value}').join('\n');
      } else if (e is ApiException) {
        msg = e.message;
      }
      if (mounted) ScaffoldMessenger.of(context).showSnackBar(SnackBar(content: Text(msg)));
    } finally {
      if (mounted) setState(() => _saving = false);
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: Text(widget.isEdit ? 'Modifier transfert' : 'Nouveau transfert'),),
      body: Form(
        key: _formKey,
        child: ListView(padding: const EdgeInsets.all(16), children: [
          Text('INFORMATIONS', style: TextStyle(fontSize: 13, fontWeight: FontWeight.w600, color: Colors.grey[700])),
          const SizedBox(height: 8),
          DropdownButtonFormField<String>(initialValue: _type, decoration: const InputDecoration(labelText: 'Type *', border: OutlineInputBorder()), items: const [
            DropdownMenuItem(value: 'reception', child: Text('Réception')),
            DropdownMenuItem(value: 'livraison', child: Text('Livraison')),
            DropdownMenuItem(value: 'interne', child: Text('Interne')),
            DropdownMenuItem(value: 'production', child: Text('Production')),
          ], onChanged: (v) => setState(() => _type = v!)),
          const SizedBox(height: 12),
          DropdownButtonFormField<int?>(initialValue: _srcId, decoration: const InputDecoration(labelText: 'Emplacement source *', border: OutlineInputBorder()), items: [
            const DropdownMenuItem(value: null, child: Text('Sélectionner...')),
            ..._emplacements.map((e) => DropdownMenuItem(value: e.id, child: Text(e.nom))),
          ], onChanged: (v) => setState(() => _srcId = v), validator: (v) => v == null ? 'Requis' : null),
          const SizedBox(height: 12),
          DropdownButtonFormField<int?>(initialValue: _destId, decoration: const InputDecoration(labelText: 'Emplacement destination *', border: OutlineInputBorder()), items: [
            const DropdownMenuItem(value: null, child: Text('Sélectionner...')),
            ..._emplacements.map((e) => DropdownMenuItem(value: e.id, child: Text(e.nom))),
          ], onChanged: (v) => setState(() => _destId = v), validator: (v) => v == null ? 'Requis' : null),
          const SizedBox(height: 12),
          TextFormField(controller: _dateCtrl, decoration: const InputDecoration(labelText: 'Date', border: OutlineInputBorder(), suffixIcon: Icon(Icons.calendar_today, size: 18)), readOnly: true, onTap: () async {
            final d = await showDatePicker(context: context, initialDate: DateTime.now(), firstDate: DateTime(2020), lastDate: DateTime(2030));
            if (d != null) _dateCtrl.text = '${d.year}-${d.month.toString().padLeft(2, '0')}-${d.day.toString().padLeft(2, '0')}';
          }),
          const SizedBox(height: 12),
          TextFormField(controller: _notesCtrl, decoration: const InputDecoration(labelText: 'Notes', border: OutlineInputBorder()), maxLines: 3),
          const SizedBox(height: 24),
          Row(mainAxisAlignment: MainAxisAlignment.spaceBetween, children: [
            Text('PRODUITS', style: TextStyle(fontSize: 13, fontWeight: FontWeight.w600, color: Colors.grey[700])),
            TextButton.icon(icon: const Icon(Icons.add, size: 18), onPressed: _addLigne, label: const Text('Ajouter')),
          ]),
          ..._lignes.asMap().entries.map((e) => _buildLigneCard(e.key, e.value)),
          const SizedBox(height: 80),
        ]),
      ),
      bottomNavigationBar: SafeArea(child: Padding(padding: const EdgeInsets.all(16), child: SizedBox(height: 48, child: ElevatedButton(onPressed: _saving ? null : _save, child: _saving ? const SizedBox(width: 20, height: 20, child: CircularProgressIndicator(strokeWidth: 2)) : Text(widget.isEdit ? 'Mettre à jour' : 'Créer le transfert'))))),
    );
  }

  Widget _buildLigneCard(int index, _MouvementLine l) {
    return Card(margin: const EdgeInsets.only(bottom: 12), child: Padding(padding: const EdgeInsets.all(12), child: Column(children: [
      Row(mainAxisAlignment: MainAxisAlignment.spaceBetween, children: [
        Text('Produit ${index + 1}', style: const TextStyle(fontWeight: FontWeight.w600)),
        IconButton(icon: const Icon(Icons.delete_outline, color: Colors.red, size: 20), onPressed: () => _removeLigne(index)),
      ]),
      DropdownButtonFormField<int?>(initialValue: l.varianteId, decoration: const InputDecoration(labelText: 'Produit *', border: OutlineInputBorder(), isDense: true, contentPadding: EdgeInsets.symmetric(horizontal: 10, vertical: 8)), items: () {
        final items = <DropdownMenuItem<int?>>[];
        for (final p in _produits) {
          if (p.variantes == null || p.variantes!.isEmpty) continue;
          for (final v in p.variantes!) {
            items.add(DropdownMenuItem(value: v.id, child: Text('${p.nom} - ${v.nom}', overflow: TextOverflow.ellipsis)));
          }
        }
        return items;
      }(), onChanged: (v) {
        setState(() {
          l.varianteId = v;
          if (v != null) {
            for (final p in _produits) {
              if (p.variantes == null) continue;
              for (final vp in p.variantes!) {
                if (vp.id == v) { l.nomProduit = '${p.nom} - ${vp.nom}'; return; }
              }
            }
          }
        });
      }, validator: (v) => v == null ? 'Requis' : null),
      const SizedBox(height: 8),
      Row(children: [
        Expanded(child: TextFormField(controller: l.qteCtrl, decoration: const InputDecoration(labelText: 'Qté demandée *', border: OutlineInputBorder(), isDense: true, contentPadding: EdgeInsets.symmetric(horizontal: 10, vertical: 8)), keyboardType: TextInputType.number, validator: (v) => v == null || v.isEmpty || double.tryParse(v)! <= 0 ? 'Invalide' : null)),
        const SizedBox(width: 8),
        Expanded(child: DropdownButtonFormField<int?>(initialValue: l.lotId, decoration: const InputDecoration(labelText: 'Lot', border: OutlineInputBorder(), isDense: true, contentPadding: EdgeInsets.symmetric(horizontal: 10, vertical: 8)), items: [
          const DropdownMenuItem(value: null, child: Text('Aucun')),
          ..._lots.map((lt) => DropdownMenuItem(value: lt.id, child: Text(lt.nom, overflow: TextOverflow.ellipsis))),
        ], onChanged: (v) => setState(() => l.lotId = v))),
      ]),
    ])));
  }
}
