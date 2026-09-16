import 'package:flutter/material.dart';
import 'package:gst_stock_mobile/config/theme.dart';
import 'package:gst_stock_mobile/models/models.dart';
import 'package:gst_stock_mobile/services/services.dart';

class PermissionsScreen extends StatefulWidget {
  const PermissionsScreen({super.key});

  @override
  State<PermissionsScreen> createState() => _PermissionsScreenState();
}

class _PermissionsScreenState extends State<PermissionsScreen> {
  final _permService = PermissionService();
  List<Permission> _permissions = [];
  bool _isLoading = true;
  String? _error;

  @override
  void initState() {
    super.initState();
    _load();
  }

  Future<void> _load() async {
    setState(() { _isLoading = true; _error = null; });
    try {
      final data = await _permService.getAll();
      if (mounted) setState(() => _permissions = data);
    } catch (e) {
      if (mounted) setState(() => _error = e.toString());
    } finally {
      if (mounted) setState(() => _isLoading = false);
    }
  }

  Future<void> _openForm() async {
    final ok = await Navigator.push<bool>(context, MaterialPageRoute(builder: (_) => const PermissionFormScreen()));
    if (ok == true) _load();
  }

  Future<void> _confirmDelete(Permission p) async {
    final ok = await showDialog<bool>(context: context, builder: (ctx) => AlertDialog(
      title: const Text('Confirmer'), content: Text('Supprimer la permission "${p.nom}" ?'),
      actions: [TextButton(onPressed: () => Navigator.pop(ctx, false), child: const Text('Annuler')),
        TextButton(onPressed: () => Navigator.pop(ctx, true), child: const Text('Supprimer', style: TextStyle(color: AppTheme.danger)))],
    ));
    if (ok != true) return;
    try {
      await _permService.delete(p.id);
      _load();
    } catch (e) {
      if (mounted) ScaffoldMessenger.of(context).showSnackBar(SnackBar(content: Text('$e')));
    }
  }

  @override
  Widget build(BuildContext context) {
    final grouped = <String, List<Permission>>{};
    for (final p in _permissions) {
      grouped.putIfAbsent(p.garde ?? 'autres', () => []).add(p);
    }
    final groupKeys = grouped.keys.toList()..sort();

    return Scaffold(
      appBar: AppBar(title: const Text('Permissions')),
      floatingActionButton: FloatingActionButton(onPressed: _openForm, backgroundColor: AppTheme.primary, child: const Icon(Icons.add, color: Colors.white)),
      body: _isLoading
        ? const Center(child: CircularProgressIndicator())
        : _error != null
          ? Center(child: Column(mainAxisSize: MainAxisSize.min, children: [const Icon(Icons.error_outline, size: 48, color: Colors.grey), const SizedBox(height: 12), Text('Erreur: $_error'), const SizedBox(height: 16), ElevatedButton(onPressed: () => _load(), child: const Text('Réessayer'))]))
          : _permissions.isEmpty
            ? Center(child: Column(mainAxisSize: MainAxisSize.min, children: [Icon(Icons.vpn_key_outlined, size: 64, color: Colors.grey[400]), const SizedBox(height: 16), Text('Aucune permission', style: TextStyle(color: Colors.grey[600])), const SizedBox(height: 24), ElevatedButton.icon(icon: const Icon(Icons.add), onPressed: _openForm, label: const Text('Créer'))]))
            : RefreshIndicator(onRefresh: () => _load(), child: ListView(padding: const EdgeInsets.fromLTRB(16, 16, 16, 100), children: [
              ...groupKeys.map((garde) => Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
                Padding(padding: const EdgeInsets.only(left: 4, bottom: 8, top: 8), child: Text(garde.toUpperCase(), style: const TextStyle(fontSize: 11, fontWeight: FontWeight.w600, color: AppTheme.textSecondary, letterSpacing: 1))),
                ...grouped[garde]!.map((p) => Card(
                  margin: const EdgeInsets.only(bottom: 6),
                  child: ListTile(
                    dense: true,
                    leading: Container(width: 36, height: 36, decoration: BoxDecoration(color: AppTheme.primary.withValues(alpha: 0.1), borderRadius: BorderRadius.circular(8)),
                      child: const Icon(Icons.vpn_key_outlined, color: AppTheme.primary, size: 18)),
                    title: Text(p.nom.replaceAll('_', ' '), style: const TextStyle(fontSize: 14)),
                    subtitle: p.description != null ? Text(p.description!, style: const TextStyle(fontSize: 11)) : null,
                    trailing: PopupMenuButton<String>(onSelected: (v) async {
                      if (v == 'edit') {
                        final ok = await Navigator.push<bool>(context, MaterialPageRoute(builder: (_) => PermissionFormScreen(permission: p)));
                        if (ok == true) _load();
                      }
                      if (v == 'delete') _confirmDelete(p);
                    }, itemBuilder: (_) => [
                      const PopupMenuItem(value: 'edit', child: Row(children: [Icon(Icons.edit_outlined, size: 18), SizedBox(width: 8), Text('Modifier')])),
                      const PopupMenuItem(value: 'delete', child: Row(children: [Icon(Icons.delete_outline, size: 18, color: AppTheme.danger), SizedBox(width: 8), Text('Supprimer', style: TextStyle(color: AppTheme.danger))])),
                    ]),
                  ),
                )),
              ])),
            ])),
    );
  }
}

class PermissionFormScreen extends StatefulWidget {
  final Permission? permission;
  const PermissionFormScreen({super.key, this.permission});
  bool get isEdit => permission != null;

  @override
  State<PermissionFormScreen> createState() => _PermissionFormScreenState();
}

class _PermissionFormScreenState extends State<PermissionFormScreen> {
  final _formKey = GlobalKey<FormState>();
  final _nomCtrl = TextEditingController();
  final _gardeCtrl = TextEditingController();
  final _descCtrl = TextEditingController();
  final _service = PermissionService();
  bool _saving = false;

  @override
  void initState() {
    super.initState();
    if (widget.permission != null) {
      _nomCtrl.text = widget.permission!.nom;
      _gardeCtrl.text = widget.permission!.garde ?? '';
      _descCtrl.text = widget.permission!.description ?? '';
    }
  }

  @override
  void dispose() {
    _nomCtrl.dispose(); _gardeCtrl.dispose(); _descCtrl.dispose();
    super.dispose();
  }

  Future<void> _save() async {
    if (!_formKey.currentState!.validate()) return;
    setState(() => _saving = true);
    try {
      final body = <String, dynamic>{
        'nom': _nomCtrl.text,
        'garde': _gardeCtrl.text.isEmpty ? null : _gardeCtrl.text,
        'description': _descCtrl.text.isEmpty ? null : _descCtrl.text,
      };
      if (widget.isEdit) { await _service.update(widget.permission!.id, body); }
      else { await _service.create(body); }
      if (mounted) Navigator.pop(context, true);
    } catch (e) {
      if (mounted) ScaffoldMessenger.of(context).showSnackBar(SnackBar(content: Text('$e')));
    } finally { if (mounted) setState(() => _saving = false); }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: Text(widget.isEdit ? 'Modifier permission' : 'Nouvelle permission')),
      body: Form(key: _formKey, child: ListView(padding: const EdgeInsets.fromLTRB(16, 16, 16, 100), children: [
        TextFormField(controller: _nomCtrl, decoration: const InputDecoration(labelText: 'Nom', prefixIcon: Icon(Icons.vpn_key_outlined)),
          validator: (v) => v == null || v.isEmpty ? 'Requis' : null),
        const SizedBox(height: 16),
        TextFormField(controller: _gardeCtrl, decoration: const InputDecoration(labelText: 'Groupe (garde)', prefixIcon: Icon(Icons.folder_outlined),
          hintText: 'ex: produit, commande, admin')),
        const SizedBox(height: 16),
        TextFormField(controller: _descCtrl, decoration: const InputDecoration(labelText: 'Description', prefixIcon: Icon(Icons.description_outlined)),
          maxLines: 2),
        const SizedBox(height: 24),
        SizedBox(width: double.infinity, child: ElevatedButton(onPressed: _save,
          child: _saving ? const SizedBox(height: 20, width: 20, child: CircularProgressIndicator(strokeWidth: 2, color: Colors.white))
              : Text(widget.isEdit ? 'Enregistrer' : 'Créer'))),
      ])),
    );
  }
}
