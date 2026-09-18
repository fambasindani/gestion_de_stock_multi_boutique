import 'package:flutter/material.dart';
import 'package:gst_stock_mobile/config/theme.dart';
import 'package:gst_stock_mobile/models/models.dart';
import 'package:gst_stock_mobile/services/services.dart';

class RolesScreen extends StatefulWidget {
  const RolesScreen({super.key});

  @override
  State<RolesScreen> createState() => _RolesScreenState();
}

class _RolesScreenState extends State<RolesScreen> {
  final _roleService = RoleService();
  final _searchController = TextEditingController();
  List<Role> _roles = [];
  bool _isLoading = true;
  String? _error;

  @override
  void initState() {
    super.initState();
    _load();
  }

  @override
  void dispose() {
    _searchController.dispose();
    super.dispose();
  }

  Future<void> _load({String? search}) async {
    setState(() { _isLoading = true; _error = null; });
    try {
      final data = await _roleService.getAll(search: search);
      if (mounted) setState(() => _roles = data);
    } catch (e) {
      if (mounted) setState(() => _error = e.toString());
    } finally {
      if (mounted) setState(() => _isLoading = false);
    }
  }

  void _onSearch(String value) {
    _load(search: value.isEmpty ? null : value);
  }

  Future<void> _openForm() async {
    final ok = await Navigator.push<bool>(context, MaterialPageRoute(builder: (_) => const RoleFormScreen()));
    if (ok == true) _load();
  }

  Future<void> _confirmDelete(Role r) async {
    if (r.nom == 'administrateur' || r.nom == 'responsable_boutique') {
      if (mounted) ScaffoldMessenger.of(context).showSnackBar(const SnackBar(content: Text('Ce rôle système ne peut pas être supprimé')));
      return;
    }
    final ok = await showDialog<bool>(context: context, builder: (ctx) => AlertDialog(
      title: const Text('Confirmer'), content: Text('Supprimer le rôle "${r.nom}" ?'),
      actions: [TextButton(onPressed: () => Navigator.pop(ctx, false), child: const Text('Annuler')),
        TextButton(onPressed: () => Navigator.pop(ctx, true), child: const Text('Supprimer', style: TextStyle(color: AppTheme.danger)))],
    ));
    if (ok != true) return;
    try {
      await _roleService.delete(r.id);
      _load();
    } catch (e) {
      if (mounted) ScaffoldMessenger.of(context).showSnackBar(SnackBar(content: Text('$e')));
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: const Text('Rôles')),
      floatingActionButton: FloatingActionButton(onPressed: _openForm, backgroundColor: AppTheme.primary, child: const Icon(Icons.add, color: Colors.white)),
      body: _buildBody(),
    );
  }

  Widget _buildBody() {
    if (_isLoading) return const Center(child: CircularProgressIndicator());
    if (_error != null) return Center(child: Column(mainAxisSize: MainAxisSize.min, children: [
      const Icon(Icons.error_outline, size: 48, color: Colors.grey), const SizedBox(height: 12),
      Text('Erreur: $_error'), const SizedBox(height: 16),
      ElevatedButton(onPressed: () => _load(), child: const Text('Réessayer')),
    ]));
    return Column(children: [
      Padding(padding: const EdgeInsets.fromLTRB(16, 16, 16, 8), child: TextField(
        controller: _searchController,
        decoration: const InputDecoration(hintText: 'Rechercher...', prefixIcon: Icon(Icons.search)),
        onChanged: _onSearch,
      )),
      Expanded(child: _roles.isEmpty
        ? Center(child: Column(mainAxisSize: MainAxisSize.min, children: [
            Icon(Icons.shield_outlined, size: 64, color: Colors.grey[400]),
            const SizedBox(height: 16), Text('Aucun rôle', style: TextStyle(color: Colors.grey[600])),
            const SizedBox(height: 24), ElevatedButton.icon(icon: const Icon(Icons.add), onPressed: _openForm, label: const Text('Créer')),
          ]))
        : RefreshIndicator(onRefresh: () => _load(), child: ListView.builder(
            padding: const EdgeInsets.fromLTRB(16, 0, 16, 80),
            itemCount: _roles.length,
            itemBuilder: (_, i) => _buildRoleCard(_roles[i]),
          ))),
    ]);
  }

  Widget _buildRoleCard(Role r) {
    final permCount = r.permissions?.length ?? 0;
    return Card(margin: const EdgeInsets.only(bottom: 10), child: Padding(padding: const EdgeInsets.all(14), child: Row(children: [
      Container(width: 44, height: 44, decoration: BoxDecoration(color: AppTheme.primary.withValues(alpha: 0.1), borderRadius: BorderRadius.circular(10)),
        child: const Icon(Icons.shield_outlined, color: AppTheme.primary, size: 22)),
      const SizedBox(width: 12),
      Expanded(child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
        Text(r.nom, style: const TextStyle(fontSize: 15, fontWeight: FontWeight.w600)),
        if (r.description != null && r.description!.isNotEmpty)
          Text(r.description!, style: const TextStyle(fontSize: 12, color: AppTheme.textSecondary), maxLines: 1, overflow: TextOverflow.ellipsis),
        const SizedBox(height: 4),
        Row(children: [
          Container(padding: const EdgeInsets.symmetric(horizontal: 6, vertical: 2),
            decoration: BoxDecoration(color: (r.actif ? AppTheme.success : AppTheme.danger).withValues(alpha: 0.1), borderRadius: BorderRadius.circular(4)),
            child: Text(r.actif ? 'Actif' : 'Inactif', style: TextStyle(fontSize: 10, fontWeight: FontWeight.w600, color: r.actif ? AppTheme.success : AppTheme.danger))),
          const SizedBox(width: 8),
          Text('$permCount permission(s)', style: const TextStyle(fontSize: 11, color: AppTheme.textSecondary)),
          const SizedBox(width: 8),
          Container(padding: const EdgeInsets.symmetric(horizontal: 6, vertical: 2),
            decoration: BoxDecoration(color: AppTheme.textSecondary.withValues(alpha: 0.1), borderRadius: BorderRadius.circular(4)),
            child: Text(r.societeId != null ? 'Boutique' : 'Global', style: const TextStyle(fontSize: 10, color: AppTheme.textSecondary))),
          if (r.utilisateursCount > 0) ...[
            const SizedBox(width: 8),
            Text('${r.utilisateursCount} utilisateur(s)', style: const TextStyle(fontSize: 11, color: AppTheme.textSecondary)),
          ],
        ]),
      ])),
      PopupMenuButton<String>(onSelected: (v) async {
        if (v == 'edit') {
          final ok = await Navigator.push<bool>(context, MaterialPageRoute(builder: (_) => RoleFormScreen(role: r)));
          if (ok == true) _load();
        }
        if (v == 'delete') _confirmDelete(r);
      }, itemBuilder: (_) => [
        const PopupMenuItem(value: 'edit', child: Row(children: [Icon(Icons.edit_outlined, size: 18), SizedBox(width: 8), Text('Modifier')])),
        const PopupMenuItem(value: 'delete', child: Row(children: [Icon(Icons.delete_outline, size: 18, color: AppTheme.danger), SizedBox(width: 8), Text('Supprimer', style: TextStyle(color: AppTheme.danger))])),
      ]),
    ])));
  }
}

class RoleFormScreen extends StatefulWidget {
  final Role? role;
  const RoleFormScreen({super.key, this.role});
  bool get isEdit => role != null;

  @override
  State<RoleFormScreen> createState() => _RoleFormScreenState();
}

class _RoleFormScreenState extends State<RoleFormScreen> {
  final _formKey = GlobalKey<FormState>();
  final _nomCtrl = TextEditingController();
  final _descCtrl = TextEditingController();
  final _roleService = RoleService();
  final _permService = PermissionService();
  List<Permission> _allPermissions = [];
  List<int> _selectedPermIds = [];
  bool _actif = true;
  bool _saving = false;
  bool _loadingPerms = true;
  String _permQuery = '';

  @override
  void initState() {
    super.initState();
    if (widget.role != null) {
      _nomCtrl.text = widget.role!.nom;
      _descCtrl.text = widget.role!.description ?? '';
      _actif = widget.role!.actif;
    }
    _loadPermissions();
  }

  Future<void> _loadPermissions() async {
    try {
      final perms = await _permService.getAll();
      if (mounted) {
        setState(() {
          _allPermissions = perms;
          if (widget.role?.permissions != null) {
            _selectedPermIds = widget.role!.permissions!.map((p) => p.id).toList();
          }
          _loadingPerms = false;
        });
      }
    } catch (_) {
      if (mounted) setState(() => _loadingPerms = false);
    }
  }

  @override
  void dispose() {
    _nomCtrl.dispose();
    _descCtrl.dispose();
    super.dispose();
  }

  Future<void> _save() async {
    if (!_formKey.currentState!.validate()) return;
    setState(() => _saving = true);
    try {
      final body = <String, dynamic>{'nom': _nomCtrl.text, 'description': _descCtrl.text.isEmpty ? null : _descCtrl.text, 'actif': _actif};
      if (_selectedPermIds.isNotEmpty) body['permissions'] = _selectedPermIds;
      if (widget.isEdit) { await _roleService.update(widget.role!.id, body); }
      else { await _roleService.create(body); }
      if (mounted) Navigator.pop(context, true);
    } catch (e) {
      if (mounted) ScaffoldMessenger.of(context).showSnackBar(SnackBar(content: Text('$e')));
    } finally { if (mounted) setState(() => _saving = false); }
  }

  @override
  Widget build(BuildContext context) {
    final q = _permQuery.trim().toLowerCase();
    final filtered = q.isEmpty
        ? _allPermissions
        : _allPermissions.where((p) =>
            p.nom.toLowerCase().contains(q) ||
            (p.description ?? '').toLowerCase().contains(q) ||
            (p.garde ?? '').toLowerCase().contains(q)).toList();

    final grouped = <String, List<Permission>>{};
    for (final p in filtered) {
      grouped.putIfAbsent(p.garde ?? 'autres', () => []).add(p);
    }
    final groupKeys = grouped.keys.toList()..sort();

    return Scaffold(
      appBar: AppBar(title: Text(widget.isEdit ? 'Modifier rôle' : 'Nouveau rôle')),
      body: Form(key: _formKey, child: ListView(padding: const EdgeInsets.fromLTRB(16, 16, 16, 100), children: [
        TextFormField(controller: _nomCtrl, decoration: const InputDecoration(labelText: 'Nom', prefixIcon: Icon(Icons.shield_outlined)),
          validator: (v) => v == null || v.isEmpty ? 'Requis' : null),
        const SizedBox(height: 16),
        TextFormField(controller: _descCtrl, decoration: const InputDecoration(labelText: 'Description', prefixIcon: Icon(Icons.description_outlined)),
          maxLines: 2),
        const SizedBox(height: 8),
        SwitchListTile(title: const Text('Actif'), value: _actif, onChanged: (v) => setState(() => _actif = v), contentPadding: EdgeInsets.zero),
        const SizedBox(height: 16),
        Row(children: [
          const Text('PERMISSIONS', style: TextStyle(fontSize: 12, fontWeight: FontWeight.w600, color: AppTheme.textSecondary, letterSpacing: 1)),
          const Spacer(),
          Text('${_selectedPermIds.length} / ${_allPermissions.length}', style: const TextStyle(fontSize: 12, color: AppTheme.textSecondary)),
        ]),
        const SizedBox(height: 8),
        TextField(
          decoration: const InputDecoration(
            hintText: 'Rechercher une permission...',
            prefixIcon: Icon(Icons.search),
            isDense: true,
          ),
          onChanged: (v) => setState(() => _permQuery = v),
        ),
        const SizedBox(height: 8),
        Row(children: [
          TextButton.icon(
            onPressed: () => setState(() => _selectedPermIds = filtered.map((p) => p.id).toSet().toList()..addAll(_selectedPermIds)),
            icon: const Icon(Icons.check_circle_outline, size: 16),
            label: Text(q.isEmpty ? 'Tout sélectionner' : 'Sélectionner les résultats'),
          ),
          TextButton.icon(
            onPressed: () => setState(() => _selectedPermIds = []),
            icon: const Icon(Icons.remove_circle_outline, size: 16),
            label: const Text('Désélectionner'),
          ),
        ]),
        if (_loadingPerms) const Center(child: Padding(padding: EdgeInsets.all(24), child: CircularProgressIndicator()))
        else if (filtered.isEmpty) const Padding(padding: EdgeInsets.all(24), child: Center(child: Text('Aucune permission trouvée')))
        else ...groupKeys.map((garde) => Card(margin: const EdgeInsets.only(bottom: 10), child: Padding(padding: const EdgeInsets.all(12), child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
          Text(garde.toUpperCase(), style: const TextStyle(fontSize: 11, fontWeight: FontWeight.w600, color: AppTheme.textSecondary, letterSpacing: 1)),
          const Divider(height: 12),
          ...grouped[garde]!.map((p) => CheckboxListTile(
            value: _selectedPermIds.contains(p.id),
            title: Text(p.nom.replaceAll('_', ' '), style: const TextStyle(fontSize: 14)),
            subtitle: p.description != null ? Text(p.description!, style: const TextStyle(fontSize: 11)) : null,
            onChanged: (v) { setState(() { if (v == true) { _selectedPermIds.add(p.id); } else { _selectedPermIds.remove(p.id); } }); },
            contentPadding: EdgeInsets.zero, dense: true,
          )),
        ])))),
        const SizedBox(height: 24),
        SizedBox(width: double.infinity, child: ElevatedButton(onPressed: _save,
          child: _saving ? const SizedBox(height: 20, width: 20, child: CircularProgressIndicator(strokeWidth: 2, color: Colors.white))
              : Text(widget.isEdit ? 'Enregistrer' : 'Créer'))),
      ])),
    );
  }
}
