import 'package:flutter/material.dart';
import 'package:gst_stock_mobile/config/theme.dart';
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
    setState(() {
      _loading = true;
      _error = null;
    });
    try {
      final p = await _service.getById(widget.id);
      if (mounted) setState(() => _p = p);
    } catch (e) {
      if (mounted) setState(() => _error = e.toString());
    } finally {
      if (mounted) setState(() => _loading = false);
    }
  }

  Future<void> _edit() async {
    final ok = await Navigator.push<bool>(context, MaterialPageRoute(builder: (_) => PartenaireFormScreen(partenaire: _p)));
    if (ok == true) _load();
  }

  Future<void> _delete() async {
    final ok = await showDialog<bool>(
      context: context,
      builder: (ctx) => AlertDialog(
        title: const Text('Confirmation'),
        content: const Text('Supprimer ce partenaire ?'),
        actions: [
          TextButton(onPressed: () => Navigator.pop(ctx, false), child: const Text('Annuler')),
          TextButton(onPressed: () => Navigator.pop(ctx, true), child: const Text('Supprimer', style: TextStyle(color: AppTheme.danger))),
        ],
      ),
    );
    if (ok != true) return;
    try {
      await _service.delete(widget.id);
      if (mounted) Navigator.pop(context);
    } catch (e) {
      if (mounted) ScaffoldMessenger.of(context).showSnackBar(SnackBar(content: Text('Erreur: $e')));
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: AppTheme.surface,
      appBar: AppBar(
        title: Text(_p?.nom ?? 'Détail partenaire'),
        actions: [
          if (_p != null) IconButton(icon: const Icon(Icons.edit_outlined), tooltip: 'Modifier', onPressed: _edit),
          if (_p != null) IconButton(icon: const Icon(Icons.delete_outline), tooltip: 'Supprimer', color: AppTheme.danger, onPressed: _delete),
        ],
      ),
      body: _loading
          ? const Center(child: CircularProgressIndicator())
          : _error != null
              ? Center(child: Text('Erreur: $_error'))
              : _p == null
                  ? const Center(child: Text('Introuvable'))
                  : ListView(
                      padding: const EdgeInsets.fromLTRB(16, 16, 16, 32),
                      children: [
                        _header(),
                        const SizedBox(height: 16),
                        _contactCard(),
                        const SizedBox(height: 16),
                        _actions(),
                      ],
                    ),
    );
  }

  Widget _header() {
    final p = _p!;
    final initiales = p.nom
        .trim()
        .split(RegExp(r'\s+'))
        .where((w) => w.isNotEmpty)
        .map((w) => w[0])
        .join()
        .toUpperCase();
    return Container(
      width: double.infinity,
      padding: const EdgeInsets.all(18),
      decoration: BoxDecoration(
        borderRadius: BorderRadius.circular(18),
        gradient: const LinearGradient(
          begin: Alignment.topLeft,
          end: Alignment.bottomRight,
          colors: [Color(0xFF1E40AF), Color(0xFF2563EB)],
        ),
        boxShadow: [BoxShadow(color: AppTheme.primary.withValues(alpha: 0.25), blurRadius: 14, offset: const Offset(0, 6))],
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            children: [
              CircleAvatar(
                radius: 28,
                backgroundColor: Colors.white.withValues(alpha: 0.2),
                child: Text(
                  initiales.length > 2 ? initiales.substring(0, 2) : initiales,
                  style: const TextStyle(color: Colors.white, fontWeight: FontWeight.bold, fontSize: 20),
                ),
              ),
              const SizedBox(width: 14),
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(p.nom, style: const TextStyle(color: Colors.white, fontSize: 20, fontWeight: FontWeight.bold)),
                    if (p.code != null && p.code!.isNotEmpty)
                      Text('Code : ${p.code}', style: TextStyle(color: Colors.white.withValues(alpha: 0.8), fontSize: 12)),
                  ],
                ),
              ),
            ],
          ),
          const SizedBox(height: 14),
          Wrap(
            spacing: 8,
            runSpacing: 8,
            children: [
              if (p.estClient) _badge('Client', Icons.person, Colors.white),
              if (p.estFournisseur) _badge('Fournisseur', Icons.local_shipping, Colors.white),
              _badge(p.actif ? 'Actif' : 'Inactif', p.actif ? Icons.check_circle : Icons.cancel, p.actif ? const Color(0xFFBBF7D0) : const Color(0xFFFECACA)),
            ],
          ),
        ],
      ),
    );
  }

  Widget _badge(String label, IconData icon, Color color) {
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 5),
      decoration: BoxDecoration(color: Colors.white.withValues(alpha: 0.18), borderRadius: BorderRadius.circular(20)),
      child: Row(mainAxisSize: MainAxisSize.min, children: [
        Icon(icon, size: 13, color: color),
        const SizedBox(width: 5),
        Text(label, style: TextStyle(color: color, fontSize: 12, fontWeight: FontWeight.w600)),
      ]),
    );
  }

  Widget _contactCard() {
    final p = _p!;
    final rows = <Widget>[
      if (p.email != null && p.email!.isNotEmpty) _infoTile(Icons.email_outlined, 'Email', p.email!),
      if (p.telephone != null && p.telephone!.isNotEmpty) _infoTile(Icons.phone_outlined, 'Téléphone', p.telephone!),
      if (p.adresse != null && p.adresse!.isNotEmpty) _infoTile(Icons.home_outlined, 'Adresse', p.adresse!),
      if (p.ville != null && p.ville!.isNotEmpty) _infoTile(Icons.location_city_outlined, 'Ville', p.ville!),
    ];
    if (rows.isEmpty) {
      rows.add(const Padding(
        padding: EdgeInsets.symmetric(vertical: 8),
        child: Text('Aucune coordonnée renseignée', style: TextStyle(color: AppTheme.textSecondary)),
      ));
    }
    return Container(
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(16),
        border: Border.all(color: AppTheme.border),
      ),
      padding: const EdgeInsets.all(16),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(children: const [
            Icon(Icons.contact_page_outlined, size: 18, color: AppTheme.text),
            SizedBox(width: 8),
            Text('Coordonnées', style: TextStyle(fontSize: 15, fontWeight: FontWeight.w700)),
          ]),
          const Divider(height: 20),
          ...rows,
        ],
      ),
    );
  }

  Widget _infoTile(IconData icon, String label, String value) {
    return Padding(
      padding: const EdgeInsets.symmetric(vertical: 8),
      child: Row(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Container(
            padding: const EdgeInsets.all(8),
            decoration: BoxDecoration(color: AppTheme.primaryLight, borderRadius: BorderRadius.circular(10)),
            child: Icon(icon, size: 16, color: AppTheme.primary),
          ),
          const SizedBox(width: 12),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(label, style: const TextStyle(fontSize: 11, color: AppTheme.textSecondary, fontWeight: FontWeight.w600)),
                const SizedBox(height: 2),
                Text(value, style: const TextStyle(fontSize: 14, fontWeight: FontWeight.w500)),
              ],
            ),
          ),
        ],
      ),
    );
  }

  Widget _actions() {
    return Row(
      children: [
        Expanded(
          child: SizedBox(
            height: 48,
            child: ElevatedButton.icon(
              onPressed: _edit,
              icon: const Icon(Icons.edit, size: 18),
              label: const Text('Modifier'),
              style: ElevatedButton.styleFrom(
                backgroundColor: AppTheme.primary,
                foregroundColor: Colors.white,
                shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
                elevation: 0,
              ),
            ),
          ),
        ),
        const SizedBox(width: 10),
        Expanded(
          child: SizedBox(
            height: 48,
            child: OutlinedButton.icon(
              onPressed: _delete,
              icon: const Icon(Icons.delete_outline, size: 18),
              label: const Text('Supprimer'),
              style: OutlinedButton.styleFrom(
                foregroundColor: AppTheme.danger,
                side: BorderSide(color: AppTheme.danger.withValues(alpha: 0.5)),
                shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
              ),
            ),
          ),
        ),
      ],
    );
  }
}
