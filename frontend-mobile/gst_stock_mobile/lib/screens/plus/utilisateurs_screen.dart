import 'package:flutter/material.dart';
import 'package:gst_stock_mobile/config/theme.dart';
import 'package:gst_stock_mobile/models/models.dart';
import 'package:gst_stock_mobile/services/services.dart';
import 'utilisateur_detail_screen.dart';

class UtilisateursScreen extends StatefulWidget {
  const UtilisateursScreen({super.key});

  @override
  State<UtilisateursScreen> createState() => _UtilisateursScreenState();
}

class _UtilisateursScreenState extends State<UtilisateursScreen> {
  final _userService = UserService();
  final _searchController = TextEditingController();
  List<Utilisateur> _utilisateurs = [];
  bool _isLoading = true;
  String? _error;
  int _page = 1;
  int _lastPage = 1;
  int _total = 0;

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

  Future<void> _load({String? search, int? page}) async {
    if (page != null) _page = page;
    setState(() { _isLoading = true; _error = null; });
    try {
      final data = await _userService.getPage(
        search: search ?? (_searchController.text.isEmpty ? null : _searchController.text),
        page: _page,
      );
      if (mounted) {
        setState(() {
          _utilisateurs = (data['items'] as List).cast<Utilisateur>();
          _total = data['total'] as int;
          _lastPage = data['last_page'] as int;
        });
      }
    } catch (e) {
      if (mounted) setState(() => _error = e.toString());
    } finally {
      if (mounted) setState(() => _isLoading = false);
    }
  }

  void _onSearch(String value) {
    _page = 1;
    _load(search: value.isEmpty ? null : value);
  }

  Future<void> _openForm() async {
    final ok = await Navigator.push<bool>(context, MaterialPageRoute(builder: (_) => const UtilisateurFormScreen()));
    if (ok == true) _load();
  }

  Future<void> _confirmDelete(Utilisateur u) async {
    final ok = await showDialog<bool>(context: context, builder: (ctx) => AlertDialog(
      title: const Text('Confirmer'), content: Text('Supprimer ${u.nom} ?'),
      actions: [TextButton(onPressed: () => Navigator.pop(ctx, false), child: const Text('Annuler')),
        TextButton(onPressed: () => Navigator.pop(ctx, true), child: const Text('Supprimer', style: TextStyle(color: AppTheme.danger)))],
    ));
    if (ok != true) return;
    try {
      await _userService.delete(u.id);
      _load();
    } catch (e) {
      if (mounted) ScaffoldMessenger.of(context).showSnackBar(SnackBar(content: Text('$e')));
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: const Text('Utilisateurs')),
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
      Expanded(child: _utilisateurs.isEmpty
        ? Center(child: Column(mainAxisSize: MainAxisSize.min, children: [
            Icon(Icons.person_outline, size: 64, color: Colors.grey[400]),
            const SizedBox(height: 16), Text('Aucun utilisateur', style: TextStyle(color: Colors.grey[600])),
            const SizedBox(height: 24), ElevatedButton.icon(icon: const Icon(Icons.add), onPressed: _openForm, label: const Text('Ajouter')),
          ]))
        : RefreshIndicator(onRefresh: () => _load(), child: ListView.builder(
            padding: const EdgeInsets.fromLTRB(16, 0, 16, 80),
            itemCount: _utilisateurs.length,
            itemBuilder: (_, i) => _buildUserCard(_utilisateurs[i]),
          ))),
      if (!_isLoading && _lastPage > 1)
        Padding(
          padding: const EdgeInsets.fromLTRB(16, 0, 16, 12),
          child: Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              IconButton(
                onPressed: _page > 1 ? () => _load(page: _page - 1) : null,
                icon: const Icon(Icons.chevron_left),
              ),
              Text('Page $_page / $_lastPage  ($_total au total)', style: const TextStyle(fontSize: 12, color: AppTheme.textSecondary)),
              IconButton(
                onPressed: _page < _lastPage ? () => _load(page: _page + 1) : null,
                icon: const Icon(Icons.chevron_right),
              ),
            ],
          ),
        ),
    ]);
  }

  Widget _buildUserCard(Utilisateur u) {
    return Card(margin: const EdgeInsets.only(bottom: 10), child: InkWell(borderRadius: BorderRadius.circular(10),
      onTap: () => Navigator.push(context, MaterialPageRoute(builder: (_) => UtilisateurDetailScreen(id: u.id))).then((_) => _load()),
      child: Padding(padding: const EdgeInsets.all(14), child: Row(children: [
        CircleAvatar(radius: 22, backgroundColor: AppTheme.primary.withValues(alpha: 0.1),
          child: Text(u.nom.isNotEmpty ? u.nom[0].toUpperCase() : '?', style: const TextStyle(fontWeight: FontWeight.bold, color: AppTheme.primary))),
        const SizedBox(width: 12),
        Expanded(child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
          Text(u.nom, style: const TextStyle(fontSize: 15, fontWeight: FontWeight.w600)),
          if (u.email.isNotEmpty) Text(u.email, style: const TextStyle(fontSize: 13, color: AppTheme.textSecondary)),
          if (u.roles != null && u.roles!.isNotEmpty)
            Text(u.roles!.map((r) => r.nom).join(', '), style: const TextStyle(fontSize: 11, color: AppTheme.textSecondary)),
        ])),
        Container(padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 3),
          decoration: BoxDecoration(color: (u.actif ? AppTheme.success : AppTheme.danger).withValues(alpha: 0.1), borderRadius: BorderRadius.circular(6)),
          child: Text(u.actif ? 'Actif' : 'Inactif', style: TextStyle(fontSize: 11, fontWeight: FontWeight.w600, color: u.actif ? AppTheme.success : AppTheme.danger))),
        PopupMenuButton<String>(onSelected: (v) {
          if (v == 'edit') Navigator.push(context, MaterialPageRoute(builder: (_) => UtilisateurFormScreen(user: u))).then((_) => _load());
          if (v == 'delete') _confirmDelete(u);
        }, itemBuilder: (_) => [
          const PopupMenuItem(value: 'edit', child: Row(children: [Icon(Icons.edit_outlined, size: 18), SizedBox(width: 8), Text('Modifier')])),
          const PopupMenuItem(value: 'delete', child: Row(children: [Icon(Icons.delete_outline, size: 18, color: AppTheme.danger), SizedBox(width: 8), Text('Supprimer', style: TextStyle(color: AppTheme.danger))])),
        ]),
      ])),
    ));
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
    _nomCtrl.dispose(); _emailCtrl.dispose(); _telCtrl.dispose(); _pwdCtrl.dispose();
    super.dispose();
  }

  Future<void> _save() async {
    if (!_formKey.currentState!.validate()) return;
    setState(() => _saving = true);
    try {
      final body = <String, dynamic>{
        'nom': _nomCtrl.text, 'email': _emailCtrl.text,
        'telephone': _telCtrl.text.isEmpty ? null : _telCtrl.text, 'actif': _actif,
      };
      if (!widget.isEdit) body['mot_de_passe'] = _pwdCtrl.text;
      if (widget.isEdit) { await _service.update(widget.user!.id, body); }
      else { await _service.create(body); }
      if (mounted) Navigator.pop(context, true);
    } catch (e) {
      if (mounted) ScaffoldMessenger.of(context).showSnackBar(SnackBar(content: Text('$e')));
    } finally { if (mounted) setState(() => _saving = false); }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: Text(widget.isEdit ? 'Modifier' : 'Nouvel utilisateur')),
      body: Form(key: _formKey, child: ListView(padding: const EdgeInsets.fromLTRB(16, 16, 16, 100), children: [
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
        SwitchListTile(title: const Text('Actif'), value: _actif, onChanged: (v) => setState(() => _actif = v), contentPadding: EdgeInsets.zero),
        const SizedBox(height: 24),
        SizedBox(width: double.infinity, child: ElevatedButton(onPressed: _save,
          child: _saving ? const SizedBox(height: 20, width: 20, child: CircularProgressIndicator(strokeWidth: 2, color: Colors.white))
              : Text(widget.isEdit ? 'Enregistrer' : 'Créer'))),
      ])),
    );
  }
}
