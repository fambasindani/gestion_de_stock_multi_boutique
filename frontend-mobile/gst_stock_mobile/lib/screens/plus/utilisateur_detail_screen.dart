import 'package:flutter/material.dart';
import 'package:gst_stock_mobile/config/theme.dart';
import 'package:gst_stock_mobile/models/models.dart';
import 'package:gst_stock_mobile/services/services.dart';

class UtilisateurDetailScreen extends StatefulWidget {
  final int id;
  const UtilisateurDetailScreen({super.key, required this.id});

  @override
  State<UtilisateurDetailScreen> createState() => _UtilisateurDetailScreenState();
}

class _UtilisateurDetailScreenState extends State<UtilisateurDetailScreen> {
  final _userService = UserService();
  final _roleService = RoleService();
  Utilisateur? _user;
  Map<String, dynamic> _details = {};
  bool _loading = true;
  String? _error;

  @override
  void initState() {
    super.initState();
    _load();
  }

  Future<void> _load() async {
    setState(() { _loading = true; _error = null; });
    try {
      final details = await _userService.getDetails(widget.id);
      final raw = details['data'];
      final user = Utilisateur.fromJson((raw ?? details) as Map<String, dynamic>);
      if (mounted) {
        setState(() {
          _user = user;
          _details = details;
        });
      }
    } catch (e) {
      if (mounted) setState(() => _error = e.toString());
    } finally {
      if (mounted) setState(() => _loading = false);
    }
  }

  Future<void> _confirmDelete() async {
    final ok = await showDialog<bool>(context: context, builder: (ctx) => AlertDialog(
      title: const Text('Confirmer'), content: Text("Supprimer ${_user?.nom ?? "l'utilisateur"} ?"),
      actions: [TextButton(onPressed: () => Navigator.pop(ctx, false), child: const Text('Annuler')),
        TextButton(onPressed: () => Navigator.pop(ctx, true), child: const Text('Supprimer', style: TextStyle(color: AppTheme.danger)))],
    ));
    if (ok != true) return;
    try {
      await _userService.delete(widget.id);
      if (mounted) Navigator.pop(context, true);
    } catch (e) {
      if (mounted) ScaffoldMessenger.of(context).showSnackBar(SnackBar(content: Text('$e')));
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: Text(_user?.nom ?? 'Utilisateur'), actions: [
        if (_user != null) ...[
          IconButton(icon: const Icon(Icons.edit_outlined), onPressed: () async {
            final ok = await Navigator.push<bool>(context, MaterialPageRoute(builder: (_) => UtilisateurFormScreen(user: _user)));
            if (ok == true) _load();
          }),
          IconButton(icon: const Icon(Icons.delete_outline, color: AppTheme.danger), onPressed: _confirmDelete),
        ],
      ]),
      body: _loading ? const Center(child: CircularProgressIndicator())
          : _error != null ? Center(child: Text('Erreur: $_error'))
          : _user == null ? const Center(child: Text('Utilisateur introuvable'))
          : ListView(padding: const EdgeInsets.all(16), children: [
              _buildInfoCard(),
              const SizedBox(height: 16),
              _buildRolesCard(),
              const SizedBox(height: 16),
              _buildPermissionsCard(),
              const SizedBox(height: 16),
              _buildStatsCard(),
              const SizedBox(height: 16),
              _buildActiviteCard(),
            ]),
    );
  }

  Widget _buildPermissionsCard() {
    final perms = (_details['permissions'] as List?)?.map((e) => e is Map ? (e['nom'] ?? '').toString() : e.toString()).where((e) => e.isNotEmpty).toList() ?? [];
    if (perms.isEmpty) return const SizedBox.shrink();
    return Card(
      child: Padding(
        padding: const EdgeInsets.all(16),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Text('Permissions (${perms.length})', style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 15)),
            const SizedBox(height: 10),
            Wrap(
              spacing: 6,
              runSpacing: 6,
              children: perms
                  .map((p) => Container(
                        padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
                        decoration: BoxDecoration(color: AppTheme.primary.withValues(alpha: 0.1), borderRadius: BorderRadius.circular(6)),
                        child: Text(p.replaceAll('_', ' '), style: const TextStyle(fontSize: 11, color: AppTheme.primary)),
                      ))
                  .toList(),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildStatsCard() {
    final stats = (_details['statistiques'] as Map<String, dynamic>?) ?? {};
    if (stats.isEmpty) return const SizedBox.shrink();
    Widget item(String label, String value) => Expanded(
          child: Column(
            children: [
              Text(value, style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 16)),
              const SizedBox(height: 2),
              Text(label, style: const TextStyle(fontSize: 11, color: AppTheme.textSecondary)),
            ],
          ),
        );
    return Card(
      child: Padding(
        padding: const EdgeInsets.all(16),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            const Text('Statistiques de vente', style: TextStyle(fontWeight: FontWeight.bold, fontSize: 15)),
            const SizedBox(height: 12),
            Row(children: [
              item('Ventes', '${stats['nombre_ventes'] ?? 0}'),
              item('Total HT', '${stats['total_ht'] ?? 0}'),
              item('Total TTC', '${stats['total_ttc'] ?? 0}'),
            ]),
          ],
        ),
      ),
    );
  }

  Widget _buildActiviteCard() {
    final activite = (_details['activite_recente'] as List?) ?? [];
    if (activite.isEmpty) return const SizedBox.shrink();
    return Card(
      child: Padding(
        padding: const EdgeInsets.all(16),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            const Text('Activité récente', style: TextStyle(fontWeight: FontWeight.bold, fontSize: 15)),
            const Divider(height: 20),
            ...activite.map((a) {
              final m = a is Map<String, dynamic> ? a : <String, dynamic>{};
              return ListTile(
                dense: true,
                contentPadding: EdgeInsets.zero,
                leading: const Icon(Icons.history, size: 18),
                title: Text((m['action'] ?? '').toString(), style: const TextStyle(fontSize: 13, fontWeight: FontWeight.w500)),
                subtitle: Text((m['description'] ?? '').toString(), style: const TextStyle(fontSize: 11)),
              );
            }),
          ],
        ),
      ),
    );
  }

  Widget _buildInfoCard() {
    final u = _user!;
    return Card(child: Padding(padding: const EdgeInsets.all(16), child: Row(children: [
      CircleAvatar(radius: 28, backgroundColor: AppTheme.primary.withValues(alpha: 0.1),
        child: Text(u.nom.isNotEmpty ? u.nom[0].toUpperCase() : '?', style: const TextStyle(fontWeight: FontWeight.bold, color: AppTheme.primary, fontSize: 24))),
      const SizedBox(width: 14),
      Expanded(child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
        Text(u.nom, style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 16)),
        if (u.email.isNotEmpty) Text(u.email, style: const TextStyle(color: AppTheme.textSecondary, fontSize: 13)),
        if (u.telephone != null) Text(u.telephone!, style: const TextStyle(color: AppTheme.textSecondary, fontSize: 13)),
        const SizedBox(height: 6),
        Container(padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 3),
          decoration: BoxDecoration(color: (u.actif ? AppTheme.success : AppTheme.danger).withValues(alpha: 0.1), borderRadius: BorderRadius.circular(6)),
          child: Text(u.actif ? 'Actif' : 'Inactif', style: TextStyle(fontSize: 11, fontWeight: FontWeight.w600, color: u.actif ? AppTheme.success : AppTheme.danger))),
      ])),
    ])));
  }

  Widget _buildRolesCard() {
    final u = _user!;
    return Card(child: Padding(padding: const EdgeInsets.all(16), child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
      Row(mainAxisAlignment: MainAxisAlignment.spaceBetween, children: [
        const Text('Rôles', style: TextStyle(fontWeight: FontWeight.bold, fontSize: 15)),
        TextButton.icon(icon: const Icon(Icons.edit, size: 16), label: const Text('Modifier'), onPressed: _assignRoles),
      ]),
      const Divider(height: 1),
      const SizedBox(height: 12),
      if (u.roles == null || u.roles!.isEmpty)
        const Text('Aucun rôle assigné', style: TextStyle(color: AppTheme.textSecondary))
      else
        ...u.roles!.map((r) => Padding(padding: const EdgeInsets.only(bottom: 8), child: Row(children: [
          Container(width: 36, height: 36, decoration: BoxDecoration(color: AppTheme.primary.withValues(alpha: 0.1), borderRadius: BorderRadius.circular(8)),
            child: const Icon(Icons.shield_outlined, color: AppTheme.primary, size: 18)),
          const SizedBox(width: 10),
          Expanded(child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
            Text(r.nom, style: const TextStyle(fontWeight: FontWeight.w500, fontSize: 14)),
            if (r.description != null && r.description!.isNotEmpty) Text(r.description!, style: const TextStyle(fontSize: 11, color: AppTheme.textSecondary)),
          ])),
        ]))),
    ])));
  }

  Future<void> _assignRoles() async {
    try {
      final allRoles = await _roleService.getAll();
      if (!mounted) return;
      final selected = <int>[];
      if (_user!.roles != null) {
        selected.addAll(_user!.roles!.map((r) => r.id));
      }
      final ok = await showDialog<bool>(context: context, builder: (ctx) => _AssignRolesDialog(allRoles: allRoles, selected: selected));
      if (ok != true) return;
      await _userService.assignRoles(widget.id, selected);
      _load();
    } catch (e) {
      if (mounted) ScaffoldMessenger.of(context).showSnackBar(SnackBar(content: Text('$e')));
    }
  }
}

class _AssignRolesDialog extends StatefulWidget {
  final List<Role> allRoles;
  final List<int> selected;
  const _AssignRolesDialog({required this.allRoles, required this.selected});

  @override
  State<_AssignRolesDialog> createState() => _AssignRolesDialogState();
}

class _AssignRolesDialogState extends State<_AssignRolesDialog> {
  late List<int> _selected;

  @override
  void initState() {
    super.initState();
    _selected = List.from(widget.selected);
  }

  @override
  Widget build(BuildContext context) {
    return AlertDialog(
      title: const Text('Assigner les rôles'),
      content: SizedBox(width: double.maxFinite, child: ListView(
        shrinkWrap: true,
        children: widget.allRoles.map((r) => CheckboxListTile(
          value: _selected.contains(r.id),
          title: Text(r.nom),
          subtitle: r.description != null ? Text(r.description!, style: const TextStyle(fontSize: 12)) : null,
          onChanged: (v) { setState(() { if (v == true) { _selected.add(r.id); } else { _selected.remove(r.id); } }); },
        )).toList(),
      )),
      actions: [
        TextButton(onPressed: () => Navigator.pop(context, false), child: const Text('Annuler')),
        ElevatedButton(onPressed: () => Navigator.pop(context, _selected), child: const Text('Enregistrer')),
      ],
    );
  }
}

class UtilisateurFormScreen extends StatefulWidget {
  final Utilisateur? user;
  const UtilisateurFormScreen({super.key, this.user});
  bool get isEdit => user != null;

  @override
  State<UtilisateurFormScreen> createState() => _UtilisateurFormScreenState();
}

class _UtilisateurFormScreenState extends State<UtilisateurFormScreen> {
  final _formKey = GlobalKey<FormState>();
  final _nomCtrl = TextEditingController();
  final _emailCtrl = TextEditingController();
  final _telCtrl = TextEditingController();
  final _pwdCtrl = TextEditingController();
  final _service = UserService();
  bool _actif = true;
  bool _saving = false;

  @override
  void initState() {
    super.initState();
    if (widget.user != null) {
      _nomCtrl.text = widget.user!.nom;
      _emailCtrl.text = widget.user!.email;
      _telCtrl.text = widget.user!.telephone ?? '';
      _actif = widget.user!.actif;
    }
  }

  @override
  void dispose() {
    _nomCtrl.dispose();
    _emailCtrl.dispose();
    _telCtrl.dispose();
    _pwdCtrl.dispose();
    super.dispose();
  }

  Future<void> _save() async {
    if (!_formKey.currentState!.validate()) return;
    setState(() => _saving = true);
    try {
      final body = <String, dynamic>{
        'nom': _nomCtrl.text,
        'email': _emailCtrl.text,
        'telephone': _telCtrl.text.isEmpty ? null : _telCtrl.text,
        'actif': _actif,
      };
      if (!widget.isEdit) body['mot_de_passe'] = _pwdCtrl.text;
      if (widget.isEdit) {
        await _service.update(widget.user!.id, body);
      } else {
        await _service.create(body);
      }
      if (mounted) Navigator.pop(context, true);
    } catch (e) {
      if (mounted) ScaffoldMessenger.of(context).showSnackBar(SnackBar(content: Text('$e')));
    } finally {
      if (mounted) setState(() => _saving = false);
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: Text(widget.isEdit ? 'Modifier' : 'Nouvel utilisateur')),
      body: Form(key: _formKey, child: ListView(padding: const EdgeInsets.all(16), children: [
        TextFormField(controller: _nomCtrl, decoration: const InputDecoration(labelText: 'Nom', prefixIcon: Icon(Icons.person_outline)),
          validator: (v) => v == null || v.isEmpty ? 'Requis' : null),
        const SizedBox(height: 16),
        TextFormField(controller: _emailCtrl, decoration: const InputDecoration(labelText: 'Email', prefixIcon: Icon(Icons.email_outlined)),
          keyboardType: TextInputType.emailAddress, validator: (v) => v == null || v.isEmpty ? 'Requis' : null),
        const SizedBox(height: 16),
        TextFormField(controller: _telCtrl, decoration: const InputDecoration(labelText: 'Téléphone', prefixIcon: Icon(Icons.phone_outlined)),
          keyboardType: TextInputType.phone),
        if (!widget.isEdit) ...[
          const SizedBox(height: 16),
          TextFormField(controller: _pwdCtrl, decoration: const InputDecoration(labelText: 'Mot de passe', prefixIcon: Icon(Icons.lock_outlined)),
            obscureText: true, validator: (v) => v == null || v.isEmpty ? 'Requis' : null),
        ],
        const SizedBox(height: 16),
        SwitchListTile(title: const Text('Actif'), value: _actif, onChanged: (v) => setState(() => _actif = v),
          contentPadding: EdgeInsets.zero),
        const SizedBox(height: 24),
        SizedBox(width: double.infinity, child: ElevatedButton(onPressed: _save,
          child: _saving ? const SizedBox(height: 20, width: 20, child: CircularProgressIndicator(strokeWidth: 2, color: Colors.white))
              : Text(widget.isEdit ? 'Enregistrer' : 'Créer'))),
      ])),
    );
  }
}
