import 'package:flutter/material.dart';
import 'package:gst_stock_mobile/models/models.dart';
import 'package:gst_stock_mobile/services/api_client.dart';
import 'package:gst_stock_mobile/services/services.dart';

class ProduitFormScreen extends StatefulWidget {
  final ProduitModele? produit;
  const ProduitFormScreen({super.key, this.produit});
  bool get isEdit => produit != null;

  @override
  State<ProduitFormScreen> createState() => _ProduitFormScreenState();
}

class _VarianteLine {
  final TextEditingController codeCtrl;
  final TextEditingController nomCtrl;
  final TextEditingController achatCtrl;
  final TextEditingController venteCtrl;
  final TextEditingController refCtrl;
  _VarianteLine()
      : codeCtrl = TextEditingController(),
        nomCtrl = TextEditingController(),
        achatCtrl = TextEditingController(),
        venteCtrl = TextEditingController(),
        refCtrl = TextEditingController();
  void dispose() {
    codeCtrl.dispose(); nomCtrl.dispose(); achatCtrl.dispose(); venteCtrl.dispose(); refCtrl.dispose();
  }
  Map<String, dynamic> toJson() => {
    'code_interne': codeCtrl.text,
    'nom': nomCtrl.text,
    'prix_achat': double.tryParse(achatCtrl.text) ?? 0,
    'prix_vente': double.tryParse(venteCtrl.text) ?? 0,
    'reference_fournisseur': refCtrl.text,
  };
}

class _ProduitFormScreenState extends State<ProduitFormScreen> {
  final _formKey = GlobalKey<FormState>();
  final _nomCtrl = TextEditingController();
  final _descCtrl = TextEditingController();
  late String _type;
  int? _categorieId;
  int? _uniteId;
  late int _actif;
  List<CategorieProduit> _categories = [];
  List<UniteMesure> _unites = [];
  final List<_VarianteLine> _variantes = [];
  bool _saving = false;
  bool _loadingData = true;

  @override
  void initState() {
    super.initState();
    final p = widget.produit;
    _nomCtrl.text = p?.nom ?? '';
    _descCtrl.text = '';
    _type = ['consommable', 'service', 'stockable'].contains(p?.type) ? p!.type : 'stockable';
    _categorieId = p?.categorieId;
    _uniteId = p?.uniteId;
    _actif = (p?.actif ?? true) ? 1 : 0;
    if (p?.variantes != null) {
      for (final v in p!.variantes!) {
        final vl = _VarianteLine();
        vl.codeCtrl.text = v.codeInterne ?? '';
        vl.nomCtrl.text = v.nom;
        vl.achatCtrl.text = v.prixAchat.toStringAsFixed(2);
        vl.venteCtrl.text = v.prixVente.toStringAsFixed(2);
        _variantes.add(vl);
      }
    }
    _loadData();
  }

  @override
  void dispose() {
    _nomCtrl.dispose(); _descCtrl.dispose();
    for (final v in _variantes) { v.dispose(); }
    super.dispose();
  }

  List<dynamic> _extract(Map<String, dynamic> r) {
    final raw = r['data'];
    if (raw is List) return raw;
    if (raw is Map) return (raw['data'] as List?) ?? [];
    return [];
  }

  Future<void> _loadData() async {
    final api = ApiClient();
    // Chargements indépendants : si l'un échoue (permission), l'autre reste disponible.
    try {
      final cats = await api.get('/categories', params: {'per_page': 200});
      _categories = _extract(cats).map((e) => CategorieProduit.fromJson(e)).toList();
    } catch (_) {}
    try {
      final unts = await api.get('/unites-mesure', params: {'per_page': 200});
      _unites = _extract(unts).map((e) => UniteMesure.fromJson(e)).toList();
    } catch (_) {}
    if (mounted) setState(() => _loadingData = false);
  }

  void _addVariante() => setState(() => _variantes.add(_VarianteLine()));
  void _removeVariante(int i) {
    _variantes[i].dispose();
    setState(() => _variantes.removeAt(i));
  }

  Future<void> _save() async {
    if (!_formKey.currentState!.validate()) return;
    setState(() => _saving = true);
    final body = <String, dynamic>{
      'nom': _nomCtrl.text,
      'type': _type,
      'description': _descCtrl.text,
      'actif': _actif,
      if (_categorieId != null) 'categorie_id': _categorieId,
      if (_uniteId != null) 'unite_id': _uniteId,
    };
    if (_variantes.isNotEmpty) body['variantes'] = _variantes.map((v) => v.toJson()).toList();
    try {
      if (widget.isEdit) {
        await ProduitService().update(widget.produit!.id, body);
      } else {
        await ProduitService().create(body);
      }
      if (mounted) Navigator.pop(context, true);
    } catch (e) {
      if (mounted) ScaffoldMessenger.of(context).showSnackBar(SnackBar(content: Text('Erreur: $e')));
    } finally {
      if (mounted) setState(() => _saving = false);
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: Text(widget.isEdit ? 'Modifier produit' : 'Nouveau produit'),),
      body: _loadingData
        ? const Center(child: CircularProgressIndicator())
        : Form(
        key: _formKey,
        child: ListView(padding: const EdgeInsets.all(16), children: [
          TextFormField(controller: _nomCtrl, decoration: const InputDecoration(labelText: 'Nom *', border: OutlineInputBorder()), validator: (v) => v == null || v.isEmpty ? 'Requis' : null),
          const SizedBox(height: 12),
          DropdownButtonFormField<String>(initialValue: _type, decoration: const InputDecoration(labelText: 'Type *', border: OutlineInputBorder()), items: const [
            DropdownMenuItem(value: 'consommable', child: Text('Consommable')),
            DropdownMenuItem(value: 'service', child: Text('Service')),
            DropdownMenuItem(value: 'stockable', child: Text('Stockable')),
          ], onChanged: (v) => setState(() => _type = v!)),
          const SizedBox(height: 12),
          TextFormField(controller: _descCtrl, decoration: const InputDecoration(labelText: 'Description', border: OutlineInputBorder()), maxLines: 3),
          const SizedBox(height: 12),
          DropdownButtonFormField<int?>(initialValue: _categorieId, decoration: const InputDecoration(labelText: 'Catégorie', border: OutlineInputBorder()), items: [
            const DropdownMenuItem(value: null, child: Text('Sélectionner...')),
            ..._categories.map((c) => DropdownMenuItem(value: c.id, child: Text(c.nom))),
          ], onChanged: (v) => setState(() => _categorieId = v)),
          const SizedBox(height: 12),
          DropdownButtonFormField<int?>(initialValue: _uniteId, decoration: const InputDecoration(labelText: 'Unité de mesure', border: OutlineInputBorder()), items: [
            const DropdownMenuItem(value: null, child: Text('Sélectionner...')),
            ..._unites.map((u) => DropdownMenuItem(value: u.id, child: Text('${u.nom} (${u.symbole})'))),
          ], onChanged: (v) => setState(() => _uniteId = v)),
          const SizedBox(height: 12),
          DropdownButtonFormField<int>(initialValue: _actif, decoration: const InputDecoration(labelText: 'Statut', border: OutlineInputBorder()), items: const [
            DropdownMenuItem(value: 1, child: Text('Actif')),
            DropdownMenuItem(value: 0, child: Text('Inactif')),
          ], onChanged: (v) => setState(() => _actif = v!)),
          const SizedBox(height: 24),
          Row(mainAxisAlignment: MainAxisAlignment.spaceBetween, children: [
            Text('VARIANTES', style: TextStyle(fontSize: 13, fontWeight: FontWeight.w600, color: Colors.grey[700])),
            TextButton.icon(icon: const Icon(Icons.add, size: 18), onPressed: _addVariante, label: const Text('Ajouter')),
          ]),
          ..._variantes.asMap().entries.map((e) => _buildVarianteCard(e.key, e.value)),
          const SizedBox(height: 80),
        ]),
      ),
      bottomNavigationBar: SafeArea(child: Padding(padding: const EdgeInsets.all(16), child: SizedBox(height: 48, child: ElevatedButton(onPressed: _saving ? null : _save, child: _saving ? const SizedBox(width: 20, height: 20, child: CircularProgressIndicator(strokeWidth: 2)) : Text(widget.isEdit ? 'Mettre à jour' : 'Créer le produit'))))),
    );
  }

  Widget _buildVarianteCard(int index, _VarianteLine v) {
    return Card(margin: const EdgeInsets.only(bottom: 12), child: Padding(padding: const EdgeInsets.all(12), child: Column(children: [
      Row(mainAxisAlignment: MainAxisAlignment.spaceBetween, children: [
        Text('Variante ${index + 1}', style: const TextStyle(fontWeight: FontWeight.w600)),
        IconButton(icon: const Icon(Icons.delete_outline, color: Colors.red, size: 20), onPressed: () => _removeVariante(index)),
      ]),
      TextFormField(controller: v.codeCtrl, decoration: const InputDecoration(labelText: 'Code interne', border: OutlineInputBorder(), isDense: true, contentPadding: EdgeInsets.symmetric(horizontal: 10, vertical: 8))),
      const SizedBox(height: 8),
      TextFormField(controller: v.nomCtrl, decoration: const InputDecoration(labelText: 'Nom', border: OutlineInputBorder(), isDense: true, contentPadding: EdgeInsets.symmetric(horizontal: 10, vertical: 8))),
      const SizedBox(height: 8),
      Row(children: [
        Expanded(child: TextFormField(controller: v.achatCtrl, decoration: const InputDecoration(labelText: "Prix d'achat", border: OutlineInputBorder(), isDense: true, contentPadding: EdgeInsets.symmetric(horizontal: 10, vertical: 8)), keyboardType: TextInputType.number)),
        const SizedBox(width: 8),
        Expanded(child: TextFormField(controller: v.venteCtrl, decoration: const InputDecoration(labelText: 'Prix de vente', border: OutlineInputBorder(), isDense: true, contentPadding: EdgeInsets.symmetric(horizontal: 10, vertical: 8)), keyboardType: TextInputType.number)),
      ]),
      const SizedBox(height: 8),
      TextFormField(controller: v.refCtrl, decoration: const InputDecoration(labelText: 'Réf. fournisseur', border: OutlineInputBorder(), isDense: true, contentPadding: EdgeInsets.symmetric(horizontal: 10, vertical: 8))),
    ])));
  }
}
