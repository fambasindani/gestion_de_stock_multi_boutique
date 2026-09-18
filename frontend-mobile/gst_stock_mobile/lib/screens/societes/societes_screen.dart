import 'package:flutter/material.dart';
import 'package:gst_stock_mobile/config/theme.dart';
import 'package:gst_stock_mobile/models/models.dart';
import 'package:gst_stock_mobile/services/services.dart';
import 'package:gst_stock_mobile/services/api_client.dart';

class SocietesScreen extends StatefulWidget {
  const SocietesScreen({super.key});

  @override
  State<SocietesScreen> createState() => _SocietesScreenState();
}

class _SocietesScreenState extends State<SocietesScreen> {
  final _service = SocieteService();
  List<Societe> _items = [];
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

  Future<void> _create() async {
    final nom = TextEditingController();
    final email = TextEditingController();
    final pwd = TextEditingController();
    final ok = await showDialog<bool>(
      context: context,
      builder: (ctx) => AlertDialog(
        title: const Text('Nouvelle société'),
        content: Column(mainAxisSize: MainAxisSize.min, children: [
          TextField(controller: nom, decoration: const InputDecoration(labelText: 'Nom')),
          const SizedBox(height: 10),
          TextField(controller: email, keyboardType: TextInputType.emailAddress, decoration: const InputDecoration(labelText: 'Email admin')),
          const SizedBox(height: 10),
          TextField(controller: pwd, obscureText: true, decoration: const InputDecoration(labelText: 'Mot de passe admin')),
        ]),
        actions: [
          TextButton(onPressed: () => Navigator.pop(ctx, false), child: const Text('Annuler')),
          ElevatedButton(
            onPressed: () => Navigator.pop(ctx, true),
            style: ElevatedButton.styleFrom(backgroundColor: AppTheme.primary, foregroundColor: Colors.white),
            child: const Text('Créer'),
          ),
        ],
      ),
    );
    if (ok != true) return;
    try {
      await _service.create({
        'nom': nom.text.trim(),
        'admin_nom': nom.text.trim(),
        'admin_email': email.text.trim(),
        'admin_mot_de_passe': pwd.text,
      });
      _load();
    } on ApiException catch (e) {
      if (mounted) ScaffoldMessenger.of(context).showSnackBar(SnackBar(content: Text(e.message), backgroundColor: Colors.redAccent));
    }
  }

  Future<void> _toggle(Societe s) async {
    try {
      if (s.actif) {
        await _service.desactiver(s.id);
      } else {
        await _service.activer(s.id);
      }
      _load();
    } on ApiException catch (e) {
      if (mounted) ScaffoldMessenger.of(context).showSnackBar(SnackBar(content: Text(e.message), backgroundColor: Colors.redAccent));
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: AppTheme.surface,
      appBar: AppBar(title: const Text('Sociétés & abonnements')),
      floatingActionButton: FloatingActionButton(
        onPressed: _create,
        backgroundColor: AppTheme.primary,
        child: const Icon(Icons.add, color: Colors.white),
      ),
      body: _loading
          ? const Center(child: CircularProgressIndicator())
          : _items.isEmpty
              ? const Center(child: Text('Aucune société', style: TextStyle(color: Colors.grey)))
              : ListView.separated(
                  padding: const EdgeInsets.fromLTRB(12, 12, 12, 80),
                  itemCount: _items.length,
                  separatorBuilder: (_, __) => const SizedBox(height: 8),
                  itemBuilder: (context, i) {
                    final s = _items[i];
                    return Card(
                      elevation: 0,
                      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12), side: BorderSide(color: Colors.grey.shade200)),
                      child: ListTile(
                        leading: CircleAvatar(
                          backgroundColor: AppTheme.primary.withValues(alpha: 0.1),
                          child: Text(s.nom.isNotEmpty ? s.nom[0].toUpperCase() : '?', style: const TextStyle(color: AppTheme.primary, fontWeight: FontWeight.bold)),
                        ),
                        title: Text(s.nom, style: const TextStyle(fontWeight: FontWeight.w600)),
                        subtitle: Text('${s.code ?? ''} • ${s.actif ? 'Active' : 'Inactive'}${s.dateExpiration != null ? ' • exp. ${s.dateExpiration}' : ''}'),
                        trailing: Switch(
                          value: s.actif,
                          onChanged: (_) => _toggle(s),
                        ),
                      ),
                    );
                  },
                ),
    );
  }
}
