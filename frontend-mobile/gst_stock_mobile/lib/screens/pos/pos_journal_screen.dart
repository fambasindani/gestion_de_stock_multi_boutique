import 'package:flutter/material.dart';
import 'package:gst_stock_mobile/config/theme.dart';
import 'package:gst_stock_mobile/services/services.dart';
import 'package:gst_stock_mobile/services/api_client.dart';
import 'package:gst_stock_mobile/utils/utils.dart';

class PosJournalScreen extends StatefulWidget {
  const PosJournalScreen({super.key});

  @override
  State<PosJournalScreen> createState() => _PosJournalScreenState();
}

class _PosJournalScreenState extends State<PosJournalScreen> {
  final _service = PosService();
  Map<String, dynamic> _journal = {};
  bool _loading = true;

  @override
  void initState() {
    super.initState();
    _load();
  }

  Future<void> _load() async {
    setState(() => _loading = true);
    try {
      final j = await _service.journal();
      setState(() => _journal = j);
    } catch (_) {
      setState(() => _journal = {});
    } finally {
      if (mounted) setState(() => _loading = false);
    }
  }

  Future<void> _cloturer() async {
    final ok = await showDialog<bool>(
      context: context,
      builder: (ctx) => AlertDialog(
        title: const Text('Clôturer la caisse'),
        content: const Text('Confirmer la clôture de la caisse du jour ? Les ventes comptoir seront bloquées jusqu\'à réouverture.'),
        actions: [
          TextButton(onPressed: () => Navigator.pop(ctx, false), child: const Text('Annuler')),
          TextButton(onPressed: () => Navigator.pop(ctx, true), child: const Text('Clôturer', style: TextStyle(color: AppTheme.danger))),
        ],
      ),
    );
    if (ok != true) return;
    try {
      await _service.cloturer();
      if (mounted) ScaffoldMessenger.of(context).showSnackBar(const SnackBar(content: Text('Caisse clôturée')));
      _load();
    } on ApiException catch (e) {
      if (mounted) ScaffoldMessenger.of(context).showSnackBar(SnackBar(content: Text(e.message), backgroundColor: Colors.redAccent));
    }
  }

  Future<void> _reouvrir() async {
    try {
      await _service.reouvrir();
      if (mounted) ScaffoldMessenger.of(context).showSnackBar(const SnackBar(content: Text('Caisse réouverte')));
      _load();
    } on ApiException catch (e) {
      if (mounted) ScaffoldMessenger.of(context).showSnackBar(SnackBar(content: Text(e.message), backgroundColor: Colors.redAccent));
    }
  }

  @override
  Widget build(BuildContext context) {
    final totaux = (_journal['totaux'] as Map<String, dynamic>?) ?? {};
    final ventes = (_journal['ventes'] as List?) ?? [];
    final cloture = _journal['cloture'] == true;

    return Scaffold(
      backgroundColor: AppTheme.surface,
      appBar: AppBar(
        title: const Text('Journal de caisse'),
        actions: [IconButton(icon: const Icon(Icons.refresh), onPressed: _load)],
      ),
      body: _loading
          ? const Center(child: CircularProgressIndicator())
          : ListView(
              padding: const EdgeInsets.all(16),
              children: [
                Row(
                  mainAxisAlignment: MainAxisAlignment.spaceBetween,
                  children: [
                    Text(cloture ? 'Caisse clôturée' : 'Caisse ouverte',
                        style: TextStyle(fontWeight: FontWeight.bold, color: cloture ? Colors.orange : Colors.green)),
                    ElevatedButton.icon(
                      onPressed: cloture ? _reouvrir : _cloturer,
                      icon: Icon(cloture ? Icons.lock_open : Icons.lock),
                      label: Text(cloture ? 'Réouvrir' : 'Clôturer'),
                      style: ElevatedButton.styleFrom(
                        backgroundColor: cloture ? Colors.green : AppTheme.danger,
                        foregroundColor: Colors.white,
                      ),
                    ),
                  ],
                ),
                const SizedBox(height: 16),
                Card(
                  child: Padding(
                    padding: const EdgeInsets.all(16),
                    child: Row(
                      mainAxisAlignment: MainAxisAlignment.spaceAround,
                      children: [
                        _stat('Ventes', '${totaux['nombre_ventes'] ?? 0}'),
                        _stat('Total HT', formatCurrency(totaux['montant_ht'])),
                        _stat('Total TTC', formatCurrency(totaux['montant_ttc'])),
                      ],
                    ),
                  ),
                ),
                const SizedBox(height: 16),
                const Text('VENTES DU JOUR', style: TextStyle(fontSize: 12, fontWeight: FontWeight.bold, color: AppTheme.textSecondary)),
                const SizedBox(height: 8),
                if (ventes.isEmpty)
                  const Card(child: Padding(padding: EdgeInsets.all(24), child: Center(child: Text('Aucune vente'))))
                else
                  ...ventes.map((v) {
                    final m = v is Map<String, dynamic> ? v : <String, dynamic>{};
                    return Card(
                      margin: const EdgeInsets.only(bottom: 8),
                      child: ListTile(
                        title: Text((m['reference'] ?? '').toString(), style: const TextStyle(fontWeight: FontWeight.w600)),
                        subtitle: Text('${m['client'] ?? ''} • ${m['mode_paiement'] ?? ''} • ${m['vendeur'] ?? ''}'),
                        trailing: Text(formatCurrency(m['montant_ttc']), style: const TextStyle(fontWeight: FontWeight.bold)),
                      ),
                    );
                  }),
              ],
            ),
    );
  }

  Widget _stat(String label, String value) {
    return Column(
      children: [
        Text(value, style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 16)),
        const SizedBox(height: 2),
        Text(label, style: const TextStyle(fontSize: 11, color: AppTheme.textSecondary)),
      ],
    );
  }
}
