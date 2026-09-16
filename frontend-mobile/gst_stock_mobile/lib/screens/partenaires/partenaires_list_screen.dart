import 'package:flutter/material.dart';
import 'package:gst_stock_mobile/models/models.dart';
import 'package:gst_stock_mobile/services/services.dart';
import 'package:gst_stock_mobile/config/theme.dart';
import 'partenaire_detail_screen.dart';
import 'partenaire_form_screen.dart';

class PartenairesListScreen extends StatefulWidget {
  const PartenairesListScreen({super.key});

  @override
  State<PartenairesListScreen> createState() => _PartenairesListScreenState();
}

class _PartenairesListScreenState extends State<PartenairesListScreen> {
  final _partenaireService = PartenaireService();
  final _searchController = TextEditingController();
  List<Partenaire> _partenaires = [];
  bool _isLoading = true;
  String? _error;

  @override
  void initState() {
    super.initState();
    _loadPartenaires();
  }

  @override
  void dispose() {
    _searchController.dispose();
    super.dispose();
  }

  Future<void> _loadPartenaires({String? search}) async {
    setState(() { _isLoading = true; _error = null; });
    try {
      final partenaires = await _partenaireService.getAll(search: search);
      if (mounted) setState(() => _partenaires = partenaires);
    } catch (e) {
      if (mounted) setState(() => _error = e.toString());
    } finally {
      if (mounted) setState(() => _isLoading = false);
    }
  }

  void _onSearch(String value) {
    _loadPartenaires(search: value.isEmpty ? null : value);
  }

  Future<void> _openForm() async {
    final ok = await Navigator.push<bool>(context, MaterialPageRoute(builder: (_) => const PartenaireFormScreen()));
    if (ok == true) _loadPartenaires();
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: const Text('Partenaires'),),
      floatingActionButton: FloatingActionButton(onPressed: _openForm, backgroundColor: AppTheme.primary, child: const Icon(Icons.add, color: Colors.white)),
      body: Column(children: [
        Padding(padding: const EdgeInsets.fromLTRB(16, 16, 16, 8), child: TextField(
          controller: _searchController,
          decoration: InputDecoration(hintText: 'Rechercher...', prefixIcon: const Icon(Icons.search), suffixIcon: _searchController.text.isNotEmpty ? IconButton(icon: const Icon(Icons.clear), onPressed: () { _searchController.clear(); _onSearch(''); }) : null),
          onChanged: _onSearch,
        )),
        Expanded(child: _isLoading ? const Center(child: CircularProgressIndicator())
            : _error != null ? Center(child: Column(mainAxisSize: MainAxisSize.min, children: [Text('Erreur: $_error'), const SizedBox(height: 16), ElevatedButton(onPressed: () => _loadPartenaires(), child: const Text('Réessayer'))]))
            : _partenaires.isEmpty
                ? Center(child: Column(mainAxisSize: MainAxisSize.min, children: [Icon(Icons.people_outline, size: 64, color: Colors.grey[400]), const SizedBox(height: 16), Text('Aucun partenaire', style: TextStyle(color: Colors.grey[600])), const SizedBox(height: 24), ElevatedButton.icon(icon: const Icon(Icons.add), onPressed: _openForm, label: const Text('Ajouter'))]))
                : RefreshIndicator(onRefresh: () => _loadPartenaires(), child: ListView.builder(padding: const EdgeInsets.fromLTRB(16, 0, 16, 80), itemCount: _partenaires.length, itemBuilder: (context, index) => _PartenaireCard(partenaire: _partenaires[index], onTap: () => Navigator.push(context, MaterialPageRoute(builder: (_) => PartenaireDetailScreen(id: _partenaires[index].id))).then((_) => _loadPartenaires()))))),
      ]),
    );
  }
}

class _PartenaireCard extends StatelessWidget {
  final Partenaire partenaire;
  final VoidCallback onTap;

  const _PartenaireCard({required this.partenaire, required this.onTap});

  @override
  Widget build(BuildContext context) {
    return Card(
      margin: const EdgeInsets.only(bottom: 10),
      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(10)),
      elevation: 1,
      child: InkWell(
        borderRadius: BorderRadius.circular(10),
        onTap: onTap,
        child: Padding(padding: const EdgeInsets.all(14), child: Row(children: [
          Container(width: 44, height: 44, decoration: BoxDecoration(color: const Color(0xFF7C3AED).withValues(alpha: 0.1), borderRadius: BorderRadius.circular(10)), child: const Icon(Icons.person_outline, color: Color(0xFF7C3AED), size: 22)),
          const SizedBox(width: 12),
          Expanded(child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
            Text(partenaire.nom, style: const TextStyle(fontSize: 15, fontWeight: FontWeight.w600)),
            const SizedBox(height: 4),
            if (partenaire.email != null && partenaire.email!.isNotEmpty) Row(children: [const Icon(Icons.email_outlined, size: 13, color: Color(0xFF64748B)), const SizedBox(width: 4), Text(partenaire.email!, style: const TextStyle(fontSize: 13, color: Color(0xFF64748B)))]),
            if (partenaire.telephone != null && partenaire.telephone!.isNotEmpty) Row(children: [const Icon(Icons.phone_outlined, size: 13, color: Color(0xFF64748B)), const SizedBox(width: 4), Text(partenaire.telephone!, style: const TextStyle(fontSize: 13, color: Color(0xFF64748B)))]),
            const SizedBox(height: 6),
            Row(children: [
              if (partenaire.estClient) Container(padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 2), decoration: BoxDecoration(color: const Color(0xFF2563EB).withValues(alpha: 0.1), borderRadius: BorderRadius.circular(4)), child: const Text('Client', style: TextStyle(fontSize: 11, color: Color(0xFF2563EB), fontWeight: FontWeight.w500))),
              if (partenaire.estClient && partenaire.estFournisseur) const SizedBox(width: 6),
              if (partenaire.estFournisseur) Container(padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 2), decoration: BoxDecoration(color: const Color(0xFFD97706).withValues(alpha: 0.1), borderRadius: BorderRadius.circular(4)), child: const Text('Fournisseur', style: TextStyle(fontSize: 11, color: Color(0xFFD97706), fontWeight: FontWeight.w500))),
            ]),
          ])),
          const Icon(Icons.chevron_right, color: Color(0xFFCBD5E1)),
        ])),
      ),
    );
  }
}
