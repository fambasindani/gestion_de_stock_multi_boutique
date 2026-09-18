import 'package:flutter/material.dart';
import 'package:gst_stock_mobile/config/theme.dart';
import 'package:gst_stock_mobile/models/models.dart';
import 'package:gst_stock_mobile/services/services.dart';
import 'package:gst_stock_mobile/services/api_client.dart';

class _LigneForm {
  int produitId;
  String nom;
  double quantite = 1;
  double prix;
  _LigneForm({required this.produitId, required this.nom, this.prix = 0});
}

class RetoursScreen extends StatefulWidget {
  const RetoursScreen({super.key});

  @override
  State<RetoursScreen> createState() => _RetoursScreenState();
}

class _RetoursScreenState extends State<RetoursScreen> {
  final _service = RetourService();
  List<Retour> _items = [];
  bool _loading = true;
  String _type = 'all';

  @override
  void initState() {
    super.initState();
    _load();
  }

  Future<void> _load() async {
    setState(() => _loading = true);
    try {
      final items = await _service.getAll(type: _type);
      setState(() => _items = items);
    } catch (_) {
      setState(() => _items = []);
    } finally {
      if (mounted) setState(() => _loading = false);
    }
  }

  Color _typeColor(String t) {
    switch (t) {
      case 'fournisseur':
        return Colors.blue;
      case 'casse':
        return Colors.red;
      default:
        return Colors.green;
    }
  }

  Future<void> _valider(Retour r) async {
    final ok = await showDialog<bool>(
      context: context,
      builder: (ctx) => AlertDialog(
        title: const Text('Valider le retour'),
        content: Text('Valider ${r.reference} ? Le stock sera mis à jour.'),
        actions: [
          TextButton(onPressed: () => Navigator.pop(ctx, false), child: const Text('Annuler')),
          TextButton(onPressed: () => Navigator.pop(ctx, true), child: const Text('Valider')),
        ],
      ),
    );
    if (ok != true) return;
    try {
      await _service.valider(r.id);
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(const SnackBar(content: Text('Retour validé')));
      }
      _load();
    } on ApiException catch (e) {
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(SnackBar(content: Text(e.message), backgroundColor: Colors.redAccent));
      }
    }
  }

  void _openForm() {
    Navigator.of(context).push(MaterialPageRoute(builder: (_) => const RetourFormScreen())).then((_) => _load());
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: AppTheme.surface,
      appBar: AppBar(
        title: const Text('Retours'),
        bottom: PreferredSize(
          preferredSize: const Size.fromHeight(48),
          child: Padding(
            padding: const EdgeInsets.symmetric(horizontal: 12),
            child: Row(
              children: [
                for (final t in ['all', 'client', 'fournisseur', 'casse'])
                  Padding(
                    padding: const EdgeInsets.only(right: 6),
                    child: ChoiceChip(
                      label: Text(t == 'all' ? 'Tous' : t[0].toUpperCase() + t.substring(1)),
                      selected: _type == t,
                      onSelected: (_) {
                        setState(() => _type = t);
                        _load();
                      },
                    ),
                  ),
              ],
            ),
          ),
        ),
      ),
      floatingActionButton: FloatingActionButton(
        onPressed: _openForm,
        backgroundColor: AppTheme.primary,
        child: const Icon(Icons.add, color: Colors.white),
      ),
      body: _loading
          ? const Center(child: CircularProgressIndicator())
          : RefreshIndicator(
              onRefresh: _load,
              child: _items.isEmpty
                  ? ListView(children: const [
                      SizedBox(height: 120),
                      Center(child: Text('Aucun retour', style: TextStyle(color: Colors.grey))),
                    ])
                  : ListView.separated(
                      padding: const EdgeInsets.all(12),
                      itemCount: _items.length,
                      separatorBuilder: (_, __) => const SizedBox(height: 8),
                      itemBuilder: (context, i) {
                        final r = _items[i];
                        return Card(
                          elevation: 0,
                          shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12), side: BorderSide(color: Colors.grey.shade200)),
                          child: ListTile(
                            title: Text(r.reference, style: const TextStyle(fontWeight: FontWeight.w600)),
                            subtitle: Text('${r.type} • ${r.lignesCount} ligne(s) • ${r.statut}'),
                            leading: Container(
                              width: 40,
                              height: 40,
                              decoration: BoxDecoration(color: _typeColor(r.type).withValues(alpha: 0.12), borderRadius: BorderRadius.circular(10)),
                              child: Icon(Icons.assignment_return, color: _typeColor(r.type), size: 20),
                            ),
                            trailing: r.statut == 'brouillon'
                                ? IconButton(
                                    icon: const Icon(Icons.check_circle_outline, color: Colors.green),
                                    tooltip: 'Valider',
                                    onPressed: () => _valider(r),
                                  )
                                : const Icon(Icons.verified, color: Colors.green),
                            onTap: () => _valider(r),
                          ),
                        );
                      },
                    ),
            ),
    );
  }
}

class RetourFormScreen extends StatefulWidget {
  const RetourFormScreen({super.key});

  @override
  State<RetourFormScreen> createState() => _RetourFormScreenState();
}

class _RetourFormScreenState extends State<RetourFormScreen> {
  final _service = RetourService();
  String _type = 'client';
  final _motif = TextEditingController();
  final _notes = TextEditingController();
  final List<_LigneForm> _lignes = [];
  bool _saving = false;

  @override
  void dispose() {
    _motif.dispose();
    _notes.dispose();
    super.dispose();
  }

  Future<void> _addProduit() async {
    final search = TextEditingController();
    List<_ProduitItem> produits = [];
    bool loading = false;

    final picked = await showModalBottomSheet<_LigneForm>(
      context: context,
      isScrollControlled: true,
      builder: (ctx) => StatefulBuilder(
        builder: (ctx, setModal) {
          Future<void> run() async {
            setModal(() => loading = true);
            try {
              final modeles = await ProduitService().getAll(search: search.text.trim());
              final items = <_ProduitItem>[];
              for (final m in modeles) {
                for (final v in (m.variantes ?? [])) {
                  items.add(_ProduitItem(id: v.id, nom: v.nom != m.nom && v.nom.isNotEmpty ? '${m.nom} — ${v.nom}' : m.nom, prix: v.prixVente));
                }
                if ((m.variantes ?? []).isEmpty) {
                  items.add(_ProduitItem(id: m.id, nom: m.nom, prix: 0));
                }
              }
              setModal(() => produits = items);
            } catch (_) {
              setModal(() => produits = []);
            } finally {
              setModal(() => loading = false);
            }
          }

          if (!loading && produits.isEmpty && search.text.isEmpty) {
            run();
          }
          return Padding(
            padding: EdgeInsets.only(bottom: MediaQuery.of(ctx).viewInsets.bottom),
            child: SizedBox(
              height: MediaQuery.of(ctx).size.height * 0.7,
              child: Column(
                children: [
                  Padding(
                    padding: const EdgeInsets.all(12),
                    child: TextField(
                      controller: search,
                      decoration: const InputDecoration(hintText: 'Rechercher un produit...', prefixIcon: Icon(Icons.search)),
                      onSubmitted: (_) => run(),
                    ),
                  ),
                  Expanded(
                    child: loading
                        ? const Center(child: CircularProgressIndicator())
                        : ListView.builder(
                            itemCount: produits.length,
                            itemBuilder: (ctx, i) {
                              final p = produits[i];
                              return ListTile(
                                title: Text(p.nom),
                                onTap: () => Navigator.pop(
                                  ctx,
                                  _LigneForm(produitId: p.id, nom: p.nom, prix: p.prix),
                                ),
                              );
                            },
                          ),
                  ),
                ],
              ),
            ),
          );
        },
      ),
    );

    if (picked != null) setState(() => _lignes.add(picked));
  }

  Future<void> _save() async {
    if (_lignes.isEmpty) {
      ScaffoldMessenger.of(context).showSnackBar(const SnackBar(content: Text('Ajoutez au moins un produit')));
      return;
    }
    setState(() => _saving = true);
    try {
      await _service.create({
        'type': _type,
        'motif': _motif.text.trim().isEmpty ? null : _motif.text.trim(),
        'notes': _notes.text.trim().isEmpty ? null : _notes.text.trim(),
        'lignes': _lignes.map((l) => {'produit_id': l.produitId, 'quantite': l.quantite, 'prix_unitaire_ht': l.prix}).toList(),
      });
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(const SnackBar(content: Text('Retour créé')));
        Navigator.pop(context);
      }
    } on ApiException catch (e) {
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(SnackBar(content: Text(e.message), backgroundColor: Colors.redAccent));
      }
    } finally {
      if (mounted) setState(() => _saving = false);
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: AppTheme.surface,
      appBar: AppBar(title: const Text('Nouveau retour')),
      body: ListView(
        padding: const EdgeInsets.all(16),
        children: [
          DropdownButtonFormField<String>(
            initialValue: _type,
            decoration: const InputDecoration(labelText: 'Type de retour'),
            items: const [
              DropdownMenuItem(value: 'client', child: Text('Retour client')),
              DropdownMenuItem(value: 'fournisseur', child: Text('Retour fournisseur')),
              DropdownMenuItem(value: 'casse', child: Text('Casse / rebut')),
            ],
            onChanged: (v) => setState(() => _type = v ?? 'client'),
          ),
          const SizedBox(height: 12),
          TextField(controller: _motif, decoration: const InputDecoration(labelText: 'Motif')),
          const SizedBox(height: 12),
          TextField(controller: _notes, decoration: const InputDecoration(labelText: 'Notes'), maxLines: 2),
          const SizedBox(height: 16),
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              const Text('Produits', style: TextStyle(fontWeight: FontWeight.bold)),
              TextButton.icon(onPressed: _addProduit, icon: const Icon(Icons.add), label: const Text('Ajouter')),
            ],
          ),
          ..._lignes.asMap().entries.map((e) {
            final i = e.key;
            final l = e.value;
            return Card(
              elevation: 0,
              shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(10), side: BorderSide(color: Colors.grey.shade200)),
              child: ListTile(
                title: Text(l.nom),
                subtitle: Row(
                  children: [
                    const Text('Qté : '),
                    SizedBox(
                      width: 60,
                      child: TextField(
                        keyboardType: TextInputType.number,
                        decoration: const InputDecoration(isDense: true),
                        controller: TextEditingController(text: l.quantite.toStringAsFixed(0)),
                        onChanged: (v) => l.quantite = double.tryParse(v) ?? 1,
                      ),
                    ),
                  ],
                ),
                trailing: IconButton(icon: const Icon(Icons.delete_outline, color: Colors.red), onPressed: () => setState(() => _lignes.removeAt(i))),
              ),
            );
          }),
          const SizedBox(height: 20),
          SizedBox(
            height: 48,
            child: ElevatedButton(
              onPressed: _saving ? null : _save,
              style: ElevatedButton.styleFrom(backgroundColor: AppTheme.primary, foregroundColor: Colors.white),
              child: _saving
                  ? const SizedBox(width: 22, height: 22, child: CircularProgressIndicator(color: Colors.white, strokeWidth: 2.5))
                  : const Text('Créer le retour'),
            ),
          ),
        ],
      ),
    );
  }
}

class _ProduitItem {
  final int id;
  final String nom;
  final double prix;
  _ProduitItem({required this.id, required this.nom, required this.prix});
}
