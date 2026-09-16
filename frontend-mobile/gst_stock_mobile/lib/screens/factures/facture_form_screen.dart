import 'package:flutter/material.dart';
import 'package:gst_stock_mobile/models/models.dart';
import 'package:gst_stock_mobile/services/services.dart';

class FactureFormScreen extends StatefulWidget {
  final EcritureComptable? facture;
  const FactureFormScreen({super.key, this.facture});
  bool get isEdit => facture != null;

  @override
  State<FactureFormScreen> createState() => _FactureFormScreenState();
}

class _FactureFormScreenState extends State<FactureFormScreen> {
  final _formKey = GlobalKey<FormState>();
  final _service = FactureService();

  late String _type;
  late int? _partenaireId;
  late String _dateEmission;
  late String _dateEcheance;
  late TextEditingController _montantHtCtrl;
  late TextEditingController _montantTvaCtrl;
  late TextEditingController _montantTtcCtrl;
  bool _saving = false;
  List<Partenaire> _partenaires = [];
  bool _loadingPartenaires = true;

  @override
  void initState() {
    super.initState();
    final f = widget.facture;
    _type = f?.type ?? 'facture_client';
    _partenaireId = f?.partenaireId;
    _dateEmission = f?.dateEmission ?? DateTime.now().toIso8601String().split('T')[0];
    _dateEcheance = f?.dateEcheance ?? DateTime.now().add(const Duration(days: 30)).toIso8601String().split('T')[0];
    _montantHtCtrl = TextEditingController(text: f != null ? f.montantHt.toStringAsFixed(2) : '');
    _montantTvaCtrl = TextEditingController(text: f?.montantTva?.toStringAsFixed(2) ?? '');
    _montantTtcCtrl = TextEditingController(text: f != null ? f.montantTtc.toStringAsFixed(2) : '');
    _loadPartenaires();
  }

  @override
  void dispose() {
    _montantHtCtrl.dispose();
    _montantTvaCtrl.dispose();
    _montantTtcCtrl.dispose();
    super.dispose();
  }

  Future<void> _loadPartenaires() async {
    try {
      _partenaires = await PartenaireService().getAll();
    } catch (_) {}
    if (mounted) setState(() => _loadingPartenaires = false);
  }

  void _calcTtc() {
    final ht = double.tryParse(_montantHtCtrl.text) ?? 0;
    final tva = double.tryParse(_montantTvaCtrl.text) ?? 0;
    _montantTtcCtrl.text = (ht + tva).toStringAsFixed(2);
  }

  Future<void> _save() async {
    if (!_formKey.currentState!.validate()) return;
    if (_partenaireId == null) { ScaffoldMessenger.of(context).showSnackBar(const SnackBar(content: Text('Sélectionnez un partenaire'))); return; }
    setState(() => _saving = true);
    final body = {
      'type': _type,
      'partenaire_id': _partenaireId,
      'date_emission': _dateEmission,
      'date_echeance': _dateEcheance,
      'montant_ht': double.tryParse(_montantHtCtrl.text) ?? 0,
      'montant_tva': double.tryParse(_montantTvaCtrl.text) ?? 0,
      'montant_ttc': double.tryParse(_montantTtcCtrl.text) ?? 0,
      'lignes': [],
    };
    try {
      if (widget.isEdit) {
        await _service.update(widget.facture!.id, body);
      } else {
        await _service.create(body);
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
      appBar: AppBar(title: Text(widget.isEdit ? 'Modifier facture' : 'Nouvelle facture'),),
      body: _loadingPartenaires
          ? const Center(child: CircularProgressIndicator())
          : Form(
              key: _formKey,
              child: ListView(padding: const EdgeInsets.fromLTRB(16, 16, 16, 80), children: [
                DropdownButtonFormField<String>(
                  initialValue: _type,
                  decoration: const InputDecoration(labelText: 'Type', border: OutlineInputBorder()),
                  items: const [
                    DropdownMenuItem(value: 'facture_client', child: Text('Facture client')),
                    DropdownMenuItem(value: 'facture_fournisseur', child: Text('Facture fournisseur')),
                    DropdownMenuItem(value: 'avoir_client', child: Text('Avoir client')),
                    DropdownMenuItem(value: 'avoir_fournisseur', child: Text('Avoir fournisseur')),
                  ],
                  onChanged: (v) => setState(() => _type = v!),
                ),
                const SizedBox(height: 16),
                DropdownButtonFormField<int>(
                  initialValue: _partenaireId,
                  decoration: const InputDecoration(labelText: 'Partenaire', border: OutlineInputBorder()),
                  items: _partenaires.map((p) => DropdownMenuItem(value: p.id, child: Text(p.nom))).toList(),
                  onChanged: (v) => setState(() => _partenaireId = v),
                ),
                const SizedBox(height: 16),
                TextFormField(
                  decoration: const InputDecoration(labelText: 'Date émission', border: OutlineInputBorder()),
                  readOnly: true,
                  controller: TextEditingController(text: _dateEmission),
                  onTap: () async {
                    final d = await showDatePicker(context: context, initialDate: DateTime.parse(_dateEmission), firstDate: DateTime(2020), lastDate: DateTime(2030));
                    if (d != null) setState(() => _dateEmission = d.toIso8601String().split('T')[0]);
                  },
                ),
                const SizedBox(height: 16),
                TextFormField(
                  decoration: const InputDecoration(labelText: 'Date échéance', border: OutlineInputBorder()),
                  readOnly: true,
                  controller: TextEditingController(text: _dateEcheance),
                  onTap: () async {
                    final d = await showDatePicker(context: context, initialDate: DateTime.parse(_dateEcheance), firstDate: DateTime(2020), lastDate: DateTime(2030));
                    if (d != null) setState(() => _dateEcheance = d.toIso8601String().split('T')[0]);
                  },
                ),
                const SizedBox(height: 24),
                Text('Montants', style: TextStyle(fontSize: 14, fontWeight: FontWeight.w600, color: Colors.grey[700])),
                const SizedBox(height: 8),
                TextFormField(controller: _montantHtCtrl, decoration: const InputDecoration(labelText: 'Montant HT', border: OutlineInputBorder(), prefixText: 'CDF '), keyboardType: TextInputType.number, onChanged: (_) => _calcTtc()),
                const SizedBox(height: 8),
                TextFormField(controller: _montantTvaCtrl, decoration: const InputDecoration(labelText: 'TVA', border: OutlineInputBorder(), prefixText: 'CDF '), keyboardType: TextInputType.number, onChanged: (_) => _calcTtc()),
                const SizedBox(height: 8),
                TextFormField(controller: _montantTtcCtrl, decoration: const InputDecoration(labelText: 'Montant TTC', border: OutlineInputBorder(), prefixText: 'CDF '), keyboardType: TextInputType.number),
                const SizedBox(height: 32),
                SizedBox(height: 48, child: ElevatedButton(onPressed: _saving ? null : _save, child: _saving ? const SizedBox(width: 20, height: 20, child: CircularProgressIndicator(strokeWidth: 2)) : Text(widget.isEdit ? 'Enregistrer' : 'Créer la facture'))),
                const SizedBox(height: 16),
              ]),
            ),
    );
  }
}