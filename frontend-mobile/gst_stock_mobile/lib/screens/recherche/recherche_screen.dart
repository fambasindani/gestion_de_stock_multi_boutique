import 'package:flutter/material.dart';
import 'package:gst_stock_mobile/config/theme.dart';
import 'package:gst_stock_mobile/models/models.dart';
import 'package:gst_stock_mobile/services/services.dart';

class RechercheScreen extends StatefulWidget {
  const RechercheScreen({super.key});

  @override
  State<RechercheScreen> createState() => _RechercheScreenState();
}

class _RechercheScreenState extends State<RechercheScreen> {
  final _controller = TextEditingController();
  bool _loading = false;
  bool _searched = false;

  List<ProduitModele> _produits = [];
  List<Partenaire> _partenaires = [];
  List<CommandeVente> _ventes = [];
  List<CommandeAchat> _achats = [];

  @override
  void dispose() {
    _controller.dispose();
    super.dispose();
  }

  Future<void> _search() async {
    final q = _controller.text.trim();
    if (q.isEmpty) return;
    setState(() {
      _loading = true;
      _searched = true;
    });
    try {
      final results = await Future.wait([
        ProduitService().getAll(search: q),
        PartenaireService().getAll(search: q),
        CommandeVenteService().getAll(search: q),
        CommandeAchatService().getAll(search: q),
      ]);
      if (!mounted) return;
      setState(() {
        _produits = results[0] as List<ProduitModele>;
        _partenaires = results[1] as List<Partenaire>;
        _ventes = results[2] as List<CommandeVente>;
        _achats = results[3] as List<CommandeAchat>;
      });
    } catch (_) {
      // ignore
    } finally {
      if (mounted) setState(() => _loading = false);
    }
  }

  @override
  Widget build(BuildContext context) {
    final total = _produits.length + _partenaires.length + _ventes.length + _achats.length;
    return Scaffold(
      backgroundColor: AppTheme.surface,
      appBar: AppBar(title: const Text('Recherche')),
      body: Column(
        children: [
          Padding(
            padding: const EdgeInsets.all(12),
            child: TextField(
              controller: _controller,
              textInputAction: TextInputAction.search,
              decoration: const InputDecoration(
                hintText: 'Rechercher produits, partenaires, commandes...',
                prefixIcon: Icon(Icons.search),
              ),
              onSubmitted: (_) => _search(),
            ),
          ),
          if (_loading)
            const Expanded(child: Center(child: CircularProgressIndicator()))
          else if (!_searched)
            const Expanded(child: Center(child: Text('Saisissez un terme à rechercher', style: TextStyle(color: Colors.grey))))
          else if (total == 0)
            const Expanded(child: Center(child: Text('Aucun résultat', style: TextStyle(color: Colors.grey))))
          else
            Expanded(
              child: ListView(
                padding: const EdgeInsets.all(12),
                children: [
                  if (_produits.isNotEmpty) _section('Produits', _produits.map((p) => p.nom).toList(), Icons.inventory_2_outlined),
                  if (_partenaires.isNotEmpty) _section('Partenaires', _partenaires.map((p) => p.nom).toList(), Icons.people_outline),
                  if (_ventes.isNotEmpty) _section('Commandes vente', _ventes.map((c) => c.reference).toList(), Icons.receipt_long_outlined),
                  if (_achats.isNotEmpty) _section('Commandes achat', _achats.map((c) => c.reference).toList(), Icons.shopping_cart_outlined),
                ],
              ),
            ),
        ],
      ),
    );
  }

  Widget _section(String title, List<String> items, IconData icon) {
    return Card(
      margin: const EdgeInsets.only(bottom: 12),
      elevation: 0,
      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12), side: BorderSide(color: Colors.grey.shade200)),
      child: Padding(
        padding: const EdgeInsets.all(12),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Row(children: [
              Icon(icon, size: 18, color: AppTheme.primary),
              const SizedBox(width: 8),
              Text('$title (${items.length})', style: const TextStyle(fontWeight: FontWeight.bold)),
            ]),
            const Divider(height: 16),
            ...items.take(8).map((t) => Padding(
                  padding: const EdgeInsets.symmetric(vertical: 3),
                  child: Text(t, style: const TextStyle(fontSize: 13)),
                )),
          ],
        ),
      ),
    );
  }
}
