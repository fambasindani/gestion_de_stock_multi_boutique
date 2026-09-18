import 'package:flutter/material.dart';
import 'package:gst_stock_mobile/config/theme.dart';
import 'package:gst_stock_mobile/models/models.dart';
import 'package:gst_stock_mobile/services/services.dart';
import 'package:gst_stock_mobile/services/api_client.dart';
import 'package:gst_stock_mobile/utils/utils.dart';

class ReceptionsScreen extends StatefulWidget {
  const ReceptionsScreen({super.key});

  @override
  State<ReceptionsScreen> createState() => _ReceptionsScreenState();
}

class _ReceptionsScreenState extends State<ReceptionsScreen> {
  final _service = CommandeAchatService();
  List<CommandeAchat> _items = [];
  bool _loading = true;

  @override
  void initState() {
    super.initState();
    _load();
  }

  Future<void> _load() async {
    setState(() => _loading = true);
    try {
      final envoye = await _service.getAll(etat: 'envoye');
      final recu = await _service.getAll(etat: 'recu');
      setState(() => _items = [...envoye, ...recu]);
    } catch (_) {
      setState(() => _items = []);
    } finally {
      if (mounted) setState(() => _loading = false);
    }
  }

  Future<void> _recevoir(CommandeAchat c) async {
    final commande = await _service.getById(c.id);
    if (!mounted) return;
    final lignes = commande.lignes ?? [];
    if (lignes.isEmpty) {
      if (mounted) ScaffoldMessenger.of(context).showSnackBar(const SnackBar(content: Text('Aucune ligne à réceptionner')));
      return;
    }
    final controllers = <int, TextEditingController>{};
    for (final l in lignes) {
      final restant = (l.quantite - ((l as dynamic).quantiteRecue ?? 0));
      controllers[l.id] = TextEditingController(text: (restant > 0 ? restant : 0).toStringAsFixed(2));
    }

    final ok = await showDialog<bool>(
      context: context,
      builder: (ctx) => AlertDialog(
        title: Text('Réception ${commande.reference}'),
        content: SizedBox(
          width: double.maxFinite,
          child: ListView(
            shrinkWrap: true,
            children: lignes
                .map((l) => Padding(
                      padding: const EdgeInsets.only(bottom: 10),
                      child: TextField(
                        controller: controllers[l.id],
                        keyboardType: const TextInputType.numberWithOptions(decimal: true),
                        decoration: InputDecoration(labelText: l.nomProduit ?? 'Produit #${l.produitId}', isDense: true),
                      ),
                    ))
                .toList(),
          ),
        ),
        actions: [
          TextButton(onPressed: () => Navigator.pop(ctx, false), child: const Text('Annuler')),
          ElevatedButton(
            onPressed: () => Navigator.pop(ctx, true),
            style: ElevatedButton.styleFrom(backgroundColor: AppTheme.primary, foregroundColor: Colors.white),
            child: const Text('Réceptionner'),
          ),
        ],
      ),
    );
    if (ok != true) return;

    try {
      await _service.receptionner(c.id, lignes: [
        for (final l in lignes)
          {
            'id': l.id,
            'quantite_recue': double.tryParse(controllers[l.id]!.text.replaceAll(',', '.')) ?? 0,
          }
      ]);
      if (mounted) ScaffoldMessenger.of(context).showSnackBar(const SnackBar(content: Text('Réception enregistrée')));
      _load();
    } on ApiException catch (e) {
      if (mounted) ScaffoldMessenger.of(context).showSnackBar(SnackBar(content: Text(e.message), backgroundColor: Colors.redAccent));
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: AppTheme.surface,
      appBar: AppBar(title: const Text('Réceptions')),
      body: _loading
          ? const Center(child: CircularProgressIndicator())
          : RefreshIndicator(
              onRefresh: _load,
              child: _items.isEmpty
                  ? ListView(children: const [
                      SizedBox(height: 120),
                      Center(child: Text('Aucune commande à réceptionner', style: TextStyle(color: Colors.grey))),
                    ])
                  : ListView.separated(
                      padding: const EdgeInsets.all(12),
                      itemCount: _items.length,
                      separatorBuilder: (_, __) => const SizedBox(height: 8),
                      itemBuilder: (context, i) {
                        final c = _items[i];
                        return Card(
                          elevation: 0,
                          shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12), side: BorderSide(color: Colors.grey.shade200)),
                          child: ListTile(
                            title: Text(c.reference, style: const TextStyle(fontWeight: FontWeight.w600)),
                            subtitle: Text('${c.partenaire?.nom ?? ''} • ${formatDate(c.dateCommande)} • ${c.etat}'),
                            trailing: const Icon(Icons.inventory, color: AppTheme.primary),
                            onTap: () => _recevoir(c),
                          ),
                        );
                      },
                    ),
            ),
    );
  }
}
