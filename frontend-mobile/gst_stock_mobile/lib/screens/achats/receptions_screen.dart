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
  final _search = TextEditingController();
  List<CommandeAchat> _items = [];
  bool _loading = true;

  static const _labels = <String, String>{
    'brouillon': 'Brouillon',
    'confirme': 'Confirmé',
    'envoye': 'Envoyé',
    'recu': 'Reçu',
    'termine': 'Terminé',
    'annule': 'Annulé',
  };

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
      final all = await _service.getAll(search: _search.text.trim());
      // On garde les commandes non annulées, les plus récentes d'abord.
      setState(() => _items = all.where((c) => c.etat != 'annule').toList());
    } catch (_) {
      setState(() => _items = []);
    } finally {
      if (mounted) setState(() => _loading = false);
    }
  }

  bool _receptable(String etat) => etat == 'envoye' || etat == 'recu';

  Future<void> _recevoir(CommandeAchat c) async {
    if (!_receptable(c.etat)) {
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(
          content: Text("La commande doit être à l'état « Envoyé » pour être réceptionnée (état actuel : ${_labels[c.etat] ?? c.etat})."),
          backgroundColor: AppTheme.warning,
        ),
      );
      return;
    }

    final commande = await _service.getById(c.id);
    if (!mounted) return;
    final lignes = commande.lignes ?? [];
    if (lignes.isEmpty) {
      ScaffoldMessenger.of(context).showSnackBar(const SnackBar(content: Text('Aucune ligne à réceptionner')));
      return;
    }
    final controllers = <int, TextEditingController>{};
    for (final l in lignes) {
      controllers[l.id] = TextEditingController(text: l.quantite.toStringAsFixed(2));
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
                        decoration: InputDecoration(
                          labelText: l.nomProduit ?? 'Produit #${l.produitId}',
                          helperText: 'Commandé : ${l.quantite}',
                          isDense: true,
                        ),
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
      if (mounted) ScaffoldMessenger.of(context).showSnackBar(const SnackBar(content: Text('Réception enregistrée'), backgroundColor: AppTheme.success));
      _load();
    } on ApiException catch (e) {
      if (mounted) ScaffoldMessenger.of(context).showSnackBar(SnackBar(content: Text(e.message), backgroundColor: AppTheme.danger));
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: AppTheme.surface,
      appBar: AppBar(title: const Text('Réceptions')),
      body: Column(
        children: [
          Padding(
            padding: const EdgeInsets.fromLTRB(16, 16, 16, 8),
            child: TextField(
              controller: _search,
              decoration: const InputDecoration(hintText: 'Rechercher une commande...', prefixIcon: Icon(Icons.search)),
              onSubmitted: (_) => _load(),
            ),
          ),
          Expanded(
            child: _loading
                ? const Center(child: CircularProgressIndicator())
                : RefreshIndicator(
                    onRefresh: _load,
                    child: _items.isEmpty
                        ? ListView(children: const [
                            SizedBox(height: 120),
                            Center(child: Text('Aucune commande d\'achat', style: TextStyle(color: Colors.grey))),
                          ])
                        : ListView.separated(
                            padding: const EdgeInsets.fromLTRB(12, 4, 12, 24),
                            itemCount: _items.length,
                            separatorBuilder: (_, __) => const SizedBox(height: 8),
                            itemBuilder: (context, i) {
                              final c = _items[i];
                              final ok = _receptable(c.etat);
                              return Card(
                                elevation: 0,
                                shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12), side: BorderSide(color: AppTheme.border)),
                                child: ListTile(
                                  onTap: () => _recevoir(c),
                                  leading: Container(
                                    width: 42,
                                    height: 42,
                                    decoration: BoxDecoration(
                                      color: (ok ? AppTheme.success : AppTheme.textSecondary).withValues(alpha: 0.12),
                                      borderRadius: BorderRadius.circular(10),
                                    ),
                                    child: Icon(Icons.inventory_2_outlined, color: ok ? AppTheme.success : AppTheme.textSecondary, size: 20),
                                  ),
                                  title: Text(c.reference, style: const TextStyle(fontWeight: FontWeight.w600)),
                                  subtitle: Text('${c.partenaire?.nom ?? ''} • ${formatDate(c.dateCommande)}'),
                                  trailing: Column(
                                    mainAxisAlignment: MainAxisAlignment.center,
                                    crossAxisAlignment: CrossAxisAlignment.end,
                                    children: [
                                      Container(
                                        padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 3),
                                        decoration: BoxDecoration(color: AppTheme.statusBgColor(c.etat), borderRadius: BorderRadius.circular(8)),
                                        child: Text(_labels[c.etat] ?? c.etat, style: TextStyle(fontSize: 11, color: AppTheme.statusTextColor(c.etat), fontWeight: FontWeight.w600)),
                                      ),
                                      const SizedBox(height: 4),
                                      Text(ok ? 'Réceptionner' : '—', style: TextStyle(fontSize: 11, color: ok ? AppTheme.primary : Colors.grey)),
                                    ],
                                  ),
                                ),
                              );
                            },
                          ),
                  ),
          ),
        ],
      ),
    );
  }
}
