import 'package:flutter/material.dart';
import 'package:gst_stock_mobile/config/theme.dart';
import 'package:gst_stock_mobile/models/models.dart';
import 'package:gst_stock_mobile/services/services.dart';
import 'package:gst_stock_mobile/services/api_client.dart';

class UnitesScreen extends StatefulWidget {
  const UnitesScreen({super.key});

  @override
  State<UnitesScreen> createState() => _UnitesScreenState();
}

class _UnitesScreenState extends State<UnitesScreen> {
  final _service = UniteService();
  final _search = TextEditingController();
  List<UniteMesure> _items = [];
  bool _loading = true;

  @override
  void initState() {
    super.initState();
    _load();
  }

  @override
  void dispose() {
    _search.dispose();
    super.dispose();
  }

  Future<void> _load() async {
    setState(() => _loading = true);
    try {
      final items = await _service.getAll(search: _search.text.trim());
      setState(() => _items = items);
    } catch (_) {
      setState(() => _items = []);
    } finally {
      if (mounted) setState(() => _loading = false);
    }
  }

  Future<void> _form({UniteMesure? item}) async {
    final nom = TextEditingController(text: item?.nom ?? '');
    final sym = TextEditingController(text: item?.symbole ?? '');
    final ok = await showDialog<bool>(
      context: context,
      builder: (ctx) => AlertDialog(
        title: Text(item == null ? 'Nouvelle unité' : 'Modifier l\'unité'),
        content: Column(mainAxisSize: MainAxisSize.min, children: [
          TextField(controller: nom, decoration: const InputDecoration(labelText: 'Nom')),
          const SizedBox(height: 12),
          TextField(controller: sym, decoration: const InputDecoration(labelText: 'Symbole')),
        ]),
        actions: [
          TextButton(onPressed: () => Navigator.pop(ctx, false), child: const Text('Annuler')),
          ElevatedButton(
            onPressed: () => Navigator.pop(ctx, true),
            style: ElevatedButton.styleFrom(backgroundColor: AppTheme.primary, foregroundColor: Colors.white),
            child: const Text('Enregistrer'),
          ),
        ],
      ),
    );
    if (ok != true) return;
    try {
      final body = {'nom': nom.text.trim(), 'symbole': sym.text.trim()};
      if (item == null) {
        await _service.create(body);
      } else {
        await _service.update(item.id, body);
      }
      _load();
    } on ApiException catch (e) {
      if (mounted) ScaffoldMessenger.of(context).showSnackBar(SnackBar(content: Text(e.message), backgroundColor: Colors.redAccent));
    }
  }

  Future<void> _delete(UniteMesure u) async {
    final ok = await showDialog<bool>(
      context: context,
      builder: (ctx) => AlertDialog(
        title: const Text('Confirmer'),
        content: Text('Supprimer "${u.nom}" ?'),
        actions: [
          TextButton(onPressed: () => Navigator.pop(ctx, false), child: const Text('Annuler')),
          TextButton(onPressed: () => Navigator.pop(ctx, true), child: const Text('Supprimer', style: TextStyle(color: AppTheme.danger))),
        ],
      ),
    );
    if (ok != true) return;
    try {
      await _service.delete(u.id);
      _load();
    } on ApiException catch (e) {
      if (mounted) ScaffoldMessenger.of(context).showSnackBar(SnackBar(content: Text(e.message), backgroundColor: Colors.redAccent));
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: AppTheme.surface,
      appBar: AppBar(title: const Text('Unités de mesure')),
      floatingActionButton: FloatingActionButton(
        onPressed: () => _form(),
        backgroundColor: AppTheme.primary,
        child: const Icon(Icons.add, color: Colors.white),
      ),
      body: Column(children: [
        Padding(
          padding: const EdgeInsets.fromLTRB(16, 16, 16, 8),
          child: TextField(
            controller: _search,
            decoration: const InputDecoration(hintText: 'Rechercher...', prefixIcon: Icon(Icons.search)),
            onSubmitted: (_) => _load(),
          ),
        ),
        Expanded(
          child: _loading
              ? const Center(child: CircularProgressIndicator())
              : _items.isEmpty
                  ? const Center(child: Text('Aucune unité', style: TextStyle(color: Colors.grey)))
                  : ListView.separated(
                      padding: const EdgeInsets.fromLTRB(16, 0, 16, 80),
                      itemCount: _items.length,
                      separatorBuilder: (_, __) => const SizedBox(height: 8),
                      itemBuilder: (context, i) {
                        final u = _items[i];
                        return Card(
                          elevation: 0,
                          shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(10), side: BorderSide(color: Colors.grey.shade200)),
                          child: ListTile(
                            title: Text(u.nom, style: const TextStyle(fontWeight: FontWeight.w600)),
                            subtitle: Text(u.symbole),
                            trailing: PopupMenuButton<String>(
                              onSelected: (v) {
                                if (v == 'edit') _form(item: u);
                                if (v == 'delete') _delete(u);
                              },
                              itemBuilder: (_) => const [
                                PopupMenuItem(value: 'edit', child: Text('Modifier')),
                                PopupMenuItem(value: 'delete', child: Text('Supprimer', style: TextStyle(color: AppTheme.danger))),
                              ],
                            ),
                          ),
                        );
                      },
                    ),
        ),
      ]),
    );
  }
}
