import 'package:flutter/material.dart';
import 'package:gst_stock_mobile/config/theme.dart';
import 'package:gst_stock_mobile/models/models.dart';
import 'package:gst_stock_mobile/services/services.dart';
import 'package:gst_stock_mobile/services/api_client.dart';
import 'package:gst_stock_mobile/utils/utils.dart';

class InventairesScreen extends StatefulWidget {
  const InventairesScreen({super.key});

  @override
  State<InventairesScreen> createState() => _InventairesScreenState();
}

class _InventairesScreenState extends State<InventairesScreen> {
  final _service = InventaireService();
  List<Inventaire> _items = [];
  bool _loading = true;

  @override
  void initState() {
    super.initState();
    _load();
  }

  Future<void> _load() async {
    setState(() => _loading = true);
    try {
      final items = await _service.getAll();
      setState(() => _items = items);
    } catch (_) {
      setState(() => _items = []);
    } finally {
      if (mounted) setState(() => _loading = false);
    }
  }

  Color _statutColor(String s) {
    switch (s) {
      case 'cloture':
        return Colors.green;
      case 'en_cours':
        return Colors.orange;
      default:
        return Colors.blueGrey;
    }
  }

  Future<void> _create() async {
    final notes = TextEditingController();
    bool generer = true;
    List<EmplacementStock> emplacements = [];
    int? emplacementId;
    try {
      emplacements = await StockService().getEmplacements();
    } catch (_) {}

    if (!mounted) return;
    final created = await showDialog<bool>(
      context: context,
      builder: (ctx) => StatefulBuilder(
        builder: (ctx, setModal) => AlertDialog(
          title: const Text('Nouvel inventaire'),
          content: Column(
            mainAxisSize: MainAxisSize.min,
            children: [
              DropdownButtonFormField<int?>(
                initialValue: emplacementId,
                decoration: const InputDecoration(labelText: 'Emplacement (optionnel)'),
                items: [
                  const DropdownMenuItem(value: null, child: Text('Tous')),
                  ...emplacements.map((e) => DropdownMenuItem(value: e.id, child: Text(e.nom))),
                ],
                onChanged: (v) => setModal(() => emplacementId = v),
              ),
              const SizedBox(height: 12),
              TextField(controller: notes, decoration: const InputDecoration(labelText: 'Notes')),
              const SizedBox(height: 8),
              SwitchListTile(
                contentPadding: EdgeInsets.zero,
                title: const Text('Générer les lignes automatiquement'),
                value: generer,
                onChanged: (v) => setModal(() => generer = v),
              ),
            ],
          ),
          actions: [
            TextButton(onPressed: () => Navigator.pop(ctx, false), child: const Text('Annuler')),
            ElevatedButton(
              onPressed: () => Navigator.pop(ctx, true),
              style: ElevatedButton.styleFrom(backgroundColor: AppTheme.primary, foregroundColor: Colors.white),
              child: const Text('Créer'),
            ),
          ],
        ),
      ),
    );
    if (created != true) return;

    try {
      await _service.create({
        'notes': notes.text.trim().isEmpty ? null : notes.text.trim(),
        'emplacement_id': emplacementId,
        'generer_lignes': generer,
      });
      _load();
    } on ApiException catch (e) {
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(SnackBar(content: Text(e.message), backgroundColor: Colors.redAccent));
      }
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: AppTheme.surface,
      appBar: AppBar(title: const Text('Inventaires')),
      floatingActionButton: FloatingActionButton(
        onPressed: _create,
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
                      Center(child: Text('Aucun inventaire', style: TextStyle(color: Colors.grey))),
                    ])
                  : ListView.separated(
                      padding: const EdgeInsets.all(12),
                      itemCount: _items.length,
                      separatorBuilder: (_, __) => const SizedBox(height: 8),
                      itemBuilder: (context, i) {
                        final inv = _items[i];
                        return Card(
                          elevation: 0,
                          shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12), side: BorderSide(color: Colors.grey.shade200)),
                          child: ListTile(
                            title: Text(inv.reference, style: const TextStyle(fontWeight: FontWeight.w600)),
                            subtitle: Text('${formatDate(inv.dateInventaire)} • ${inv.lignesCount} ligne(s)${inv.emplacementNom != null ? ' • ${inv.emplacementNom}' : ''}'),
                            leading: Container(
                              width: 40,
                              height: 40,
                              decoration: BoxDecoration(color: _statutColor(inv.statut).withValues(alpha: 0.12), borderRadius: BorderRadius.circular(10)),
                              child: Icon(Icons.fact_check_outlined, color: _statutColor(inv.statut), size: 20),
                            ),
                            trailing: const Icon(Icons.chevron_right),
                            onTap: () => Navigator.of(context)
                                .push(MaterialPageRoute(builder: (_) => InventaireDetailScreen(id: inv.id, reference: inv.reference)))
                                .then((_) => _load()),
                          ),
                        );
                      },
                    ),
            ),
    );
  }
}

class InventaireDetailScreen extends StatefulWidget {
  final int id;
  final String reference;
  const InventaireDetailScreen({super.key, required this.id, required this.reference});

  @override
  State<InventaireDetailScreen> createState() => _InventaireDetailScreenState();
}

class _InventaireDetailScreenState extends State<InventaireDetailScreen> {
  final _service = InventaireService();
  List<LigneInventaire> _lignes = [];
  Map<String, dynamic> _totaux = {};
  bool _loading = true;
  String _statut = 'brouillon';

  @override
  void initState() {
    super.initState();
    _load();
  }

  Future<void> _load() async {
    setState(() => _loading = true);
    try {
      final data = await _service.getById(widget.id);
      final inv = (data['inventaire'] as Map<String, dynamic>?) ?? {};
      final lignes = (inv['lignes'] as List?)?.map((e) => LigneInventaire.fromJson(e as Map<String, dynamic>)).toList() ?? [];
      setState(() {
        _statut = inv['statut'] ?? 'brouillon';
        _lignes = lignes;
        _totaux = (data['totaux'] as Map<String, dynamic>?) ?? {};
      });
    } catch (_) {
      // ignore
    } finally {
      if (mounted) setState(() => _loading = false);
    }
  }

  Future<void> _editLigne(LigneInventaire l) async {
    final ctrl = TextEditingController(text: l.quantitePhysique.toStringAsFixed(2));
    final ok = await showDialog<bool>(
      context: context,
      builder: (ctx) => AlertDialog(
        title: Text(l.nomProduit ?? 'Produit #${l.produitId}'),
        content: TextField(
          controller: ctrl,
          keyboardType: const TextInputType.numberWithOptions(decimal: true),
          decoration: const InputDecoration(labelText: 'Quantité physique'),
        ),
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
      await _service.updateLigne(widget.id, l.id, {'quantite_physique': double.tryParse(ctrl.text.replaceAll(',', '.')) ?? 0});
      _load();
    } on ApiException catch (e) {
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(SnackBar(content: Text(e.message), backgroundColor: Colors.redAccent));
      }
    }
  }

  Future<void> _action(String label, Future<void> Function() run) async {
    final ok = await showDialog<bool>(
      context: context,
      builder: (ctx) => AlertDialog(
        title: Text(label),
        content: Text('Confirmer : $label ?'),
        actions: [
          TextButton(onPressed: () => Navigator.pop(ctx, false), child: const Text('Annuler')),
          TextButton(onPressed: () => Navigator.pop(ctx, true), child: const Text('Confirmer')),
        ],
      ),
    );
    if (ok != true) return;
    try {
      await run();
      _load();
    } on ApiException catch (e) {
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(SnackBar(content: Text(e.message), backgroundColor: Colors.redAccent));
      }
    }
  }

  @override
  Widget build(BuildContext context) {
    final cloture = _statut == 'cloture';
    return Scaffold(
      backgroundColor: AppTheme.surface,
      appBar: AppBar(
        title: Text(widget.reference),
        actions: [
          if (_lignes.isEmpty && !cloture)
            IconButton(
              icon: const Icon(Icons.playlist_add),
              tooltip: 'Générer les lignes',
              onPressed: () => _action('Générer les lignes', () => _service.genererLignes(widget.id)),
            ),
          if (!cloture)
            IconButton(
              icon: const Icon(Icons.lock_outline),
              tooltip: 'Clôturer',
              onPressed: () => _action('Clôturer l\'inventaire', () => _service.cloturer(widget.id)),
            ),
          if (cloture)
            IconButton(
              icon: const Icon(Icons.tune),
              tooltip: 'Ajuster le stock',
              onPressed: () => _action('Ajuster le stock', () => _service.ajuster(widget.id)),
            ),
        ],
      ),
      body: _loading
          ? const Center(child: CircularProgressIndicator())
          : Column(
              children: [
                if (_totaux.isNotEmpty)
                  Padding(
                    padding: const EdgeInsets.all(12),
                    child: Wrap(
                      spacing: 20,
                      children: _totaux.entries
                          .map((e) => Column(
                                crossAxisAlignment: CrossAxisAlignment.start,
                                children: [
                                  Text(e.key.replaceAll('_', ' ').toUpperCase(), style: TextStyle(color: Colors.grey[500], fontSize: 10)),
                                  Text(e.value is num ? formatCurrency(e.value) : '${e.value}', style: const TextStyle(fontWeight: FontWeight.bold)),
                                ],
                              ))
                          .toList(),
                    ),
                  ),
                Expanded(
                  child: _lignes.isEmpty
                      ? const Center(child: Text('Aucune ligne', style: TextStyle(color: Colors.grey)))
                      : ListView.builder(
                          itemCount: _lignes.length,
                          itemBuilder: (context, i) {
                            final l = _lignes[i];
                            final ecart = l.ecart;
                            return ListTile(
                              title: Text(l.nomProduit ?? 'Produit #${l.produitId}'),
                              subtitle: Text('Théorique : ${l.quantiteTheorique.toStringAsFixed(2)}  •  Physique : ${l.quantitePhysique.toStringAsFixed(2)}'),
                              trailing: Column(
                                mainAxisAlignment: MainAxisAlignment.center,
                                crossAxisAlignment: CrossAxisAlignment.end,
                                children: [
                                  Text(
                                    '${ecart > 0 ? '+' : ''}${ecart.toStringAsFixed(2)}',
                                    style: TextStyle(
                                      fontWeight: FontWeight.bold,
                                      color: ecart == 0 ? Colors.grey : (ecart > 0 ? Colors.green : Colors.red),
                                    ),
                                  ),
                                  if (l.ajuste) const Text('ajusté', style: TextStyle(fontSize: 10, color: Colors.grey)),
                                ],
                              ),
                              onTap: cloture ? null : () => _editLigne(l),
                            );
                          },
                        ),
                ),
              ],
            ),
    );
  }
}
