import 'package:flutter/material.dart';
import 'package:gst_stock_mobile/models/models.dart';
import 'package:gst_stock_mobile/services/services.dart';

class PartenaireFormScreen extends StatefulWidget {
  final Partenaire? partenaire;
  const PartenaireFormScreen({super.key, this.partenaire});
  bool get isEdit => partenaire != null;

  @override
  State<PartenaireFormScreen> createState() => _PartenaireFormScreenState();
}

class _PartenaireFormScreenState extends State<PartenaireFormScreen> {
  final _formKey = GlobalKey<FormState>();
  final _nomCtrl = TextEditingController();
  final _codeCtrl = TextEditingController();
  final _emailCtrl = TextEditingController();
  final _telCtrl = TextEditingController();
  final _mobileCtrl = TextEditingController();
  final _adresseCtrl = TextEditingController();
  final _villeCtrl = TextEditingController();
  final _cpCtrl = TextEditingController();
  final _tvaCtrl = TextEditingController();
  final _siretCtrl = TextEditingController();
  final _siteCtrl = TextEditingController();
  final _notesCtrl = TextEditingController();
  final _remiseCtrl = TextEditingController(text: '0');
  final _delaiCtrl = TextEditingController(text: '30');
  bool _estClient = true;
  bool _estFournisseur = false;
  String _pays = 'France';
  late int _actif;
  bool _saving = false;

  @override
  void initState() {
    super.initState();
    final p = widget.partenaire;
    if (p != null) {
      _nomCtrl.text = p.nom;
      _codeCtrl.text = p.code ?? '';
      _emailCtrl.text = p.email ?? '';
      _telCtrl.text = p.telephone ?? '';
      _adresseCtrl.text = p.adresse ?? '';
      _villeCtrl.text = p.ville ?? '';
      _estClient = p.estClient;
      _estFournisseur = p.estFournisseur;
    }
    _actif = 1;
  }

  @override
  void dispose() {
    _nomCtrl.dispose(); _codeCtrl.dispose(); _emailCtrl.dispose(); _telCtrl.dispose();
    _mobileCtrl.dispose(); _adresseCtrl.dispose(); _villeCtrl.dispose(); _cpCtrl.dispose();
    _tvaCtrl.dispose(); _siretCtrl.dispose(); _siteCtrl.dispose(); _notesCtrl.dispose();
    _remiseCtrl.dispose(); _delaiCtrl.dispose();
    super.dispose();
  }

  Future<void> _save() async {
    if (!_formKey.currentState!.validate()) return;
    setState(() => _saving = true);
    final body = {
      'nom': _nomCtrl.text,
      'code': _codeCtrl.text,
      'email': _emailCtrl.text,
      'telephone': _telCtrl.text,
      'mobile': _mobileCtrl.text,
      'adresse': _adresseCtrl.text,
      'ville': _villeCtrl.text,
      'code_postal': _cpCtrl.text,
      'pays': _pays,
      'numero_tva': _tvaCtrl.text,
      'siret': _siretCtrl.text,
      'site_web': _siteCtrl.text,
      'notes': _notesCtrl.text,
      'est_client': _estClient,
      'est_fournisseur': _estFournisseur,
      'remise': double.tryParse(_remiseCtrl.text) ?? 0,
      'delai_paiement': int.tryParse(_delaiCtrl.text) ?? 30,
      'actif': _actif,
    };
    try {
      if (widget.isEdit) {
        await PartenaireService().update(widget.partenaire!.id, body);
      } else {
        await PartenaireService().create(body);
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
      appBar: AppBar(title: Text(widget.isEdit ? 'Modifier partenaire' : 'Nouveau partenaire'),),
      body: Form(
        key: _formKey,
        child: ListView(padding: const EdgeInsets.all(16), children: [
          Text('Type de partenaire', style: TextStyle(fontSize: 13, fontWeight: FontWeight.w600, color: Colors.grey[700])),
          const SizedBox(height: 4),
          Row(children: [
            FilterChip(label: const Text('Client'), selected: _estClient, onSelected: (v) => setState(() => _estClient = v)),
            const SizedBox(width: 8),
            FilterChip(label: const Text('Fournisseur'), selected: _estFournisseur, onSelected: (v) => setState(() => _estFournisseur = v)),
          ]),
          const SizedBox(height: 20),
          Text('Informations générales', style: TextStyle(fontSize: 13, fontWeight: FontWeight.w600, color: Colors.grey[700])),
          const SizedBox(height: 8),
          TextFormField(controller: _nomCtrl, decoration: const InputDecoration(labelText: 'Nom *', border: OutlineInputBorder()), validator: (v) => v == null || v.isEmpty ? 'Requis' : null),
          const SizedBox(height: 12),
          TextFormField(controller: _codeCtrl, decoration: const InputDecoration(labelText: 'Code', border: OutlineInputBorder())),
          const SizedBox(height: 20),
          Text('Contact', style: TextStyle(fontSize: 13, fontWeight: FontWeight.w600, color: Colors.grey[700])),
          const SizedBox(height: 8),
          TextFormField(controller: _emailCtrl, decoration: const InputDecoration(labelText: 'Email *', border: OutlineInputBorder()), keyboardType: TextInputType.emailAddress, validator: (v) => v == null || v.isEmpty ? 'Requis' : null),
          const SizedBox(height: 12),
          TextFormField(controller: _telCtrl, decoration: const InputDecoration(labelText: 'Téléphone *', border: OutlineInputBorder()), keyboardType: TextInputType.phone, validator: (v) => v == null || v.isEmpty ? 'Requis' : null),
          const SizedBox(height: 12),
          TextFormField(controller: _mobileCtrl, decoration: const InputDecoration(labelText: 'Mobile', border: OutlineInputBorder()), keyboardType: TextInputType.phone),
          const SizedBox(height: 12),
          TextFormField(controller: _siteCtrl, decoration: const InputDecoration(labelText: 'Site web', border: OutlineInputBorder())),
          const SizedBox(height: 20),
          Text('Adresse', style: TextStyle(fontSize: 13, fontWeight: FontWeight.w600, color: Colors.grey[700])),
          const SizedBox(height: 8),
          TextFormField(controller: _adresseCtrl, decoration: const InputDecoration(labelText: 'Adresse *', border: OutlineInputBorder()), validator: (v) => v == null || v.isEmpty ? 'Requis' : null),
          const SizedBox(height: 12),
          TextFormField(controller: _villeCtrl, decoration: const InputDecoration(labelText: 'Ville *', border: OutlineInputBorder()), validator: (v) => v == null || v.isEmpty ? 'Requis' : null),
          const SizedBox(height: 12),
          TextFormField(controller: _cpCtrl, decoration: const InputDecoration(labelText: 'Code postal', border: OutlineInputBorder())),
          const SizedBox(height: 12),
          DropdownButtonFormField<String>(initialValue: _pays, decoration: const InputDecoration(labelText: 'Pays', border: OutlineInputBorder()), items: ['France', 'Belgique', 'Suisse', 'Canada', 'Autre'].map((p) => DropdownMenuItem(value: p, child: Text(p))).toList(), onChanged: (v) => setState(() => _pays = v!)),
          const SizedBox(height: 20),
          Text('Informations fiscales', style: TextStyle(fontSize: 13, fontWeight: FontWeight.w600, color: Colors.grey[700])),
          const SizedBox(height: 8),
          TextFormField(controller: _tvaCtrl, decoration: const InputDecoration(labelText: 'N° TVA', border: OutlineInputBorder())),
          const SizedBox(height: 12),
          TextFormField(controller: _siretCtrl, decoration: const InputDecoration(labelText: 'SIRET', border: OutlineInputBorder())),
          const SizedBox(height: 20),
          Text('Notes', style: TextStyle(fontSize: 13, fontWeight: FontWeight.w600, color: Colors.grey[700])),
          const SizedBox(height: 8),
          TextFormField(controller: _notesCtrl, decoration: const InputDecoration(border: OutlineInputBorder()), maxLines: 4),
          const SizedBox(height: 20),
          Text('Configuration', style: TextStyle(fontSize: 13, fontWeight: FontWeight.w600, color: Colors.grey[700])),
          const SizedBox(height: 8),
          TextFormField(controller: _remiseCtrl, decoration: const InputDecoration(labelText: 'Remise (%)', border: OutlineInputBorder(), suffixText: '%'), keyboardType: TextInputType.number),
          const SizedBox(height: 12),
          TextFormField(controller: _delaiCtrl, decoration: const InputDecoration(labelText: 'Délai de paiement (jours)', border: OutlineInputBorder(), suffixText: 'jours'), keyboardType: TextInputType.number),
          const SizedBox(height: 12),
          DropdownButtonFormField<int>(initialValue: _actif, decoration: const InputDecoration(labelText: 'Statut', border: OutlineInputBorder()), items: const [DropdownMenuItem(value: 1, child: Text('Actif')), DropdownMenuItem(value: 0, child: Text('Inactif'))], onChanged: (v) => setState(() => _actif = v!)),
          const SizedBox(height: 80),
        ]),
      ),
      bottomNavigationBar: SafeArea(child: Padding(padding: const EdgeInsets.all(16), child: SizedBox(height: 48, child: ElevatedButton(onPressed: _saving ? null : _save, child: _saving ? const SizedBox(width: 20, height: 20, child: CircularProgressIndicator(strokeWidth: 2)) : Text(widget.isEdit ? 'Mettre à jour' : 'Créer le partenaire'))))),
    );
  }
}
