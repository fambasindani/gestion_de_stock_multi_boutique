import 'package:flutter/material.dart';
import 'package:gst_stock_mobile/models/models.dart';
import 'package:gst_stock_mobile/services/services.dart';
import 'package:gst_stock_mobile/config/theme.dart';
import 'package:gst_stock_mobile/screens/stock/emplacement_detail_screen.dart';
import 'package:gst_stock_mobile/screens/stock/emplacement_form_screen.dart';

class EmplacementsScreen extends StatefulWidget {
  const EmplacementsScreen({super.key});

  @override
  State<EmplacementsScreen> createState() => _EmplacementsScreenState();
}

class _EmplacementsScreenState extends State<EmplacementsScreen> {
  final _stockService = StockService();
  final _searchController = TextEditingController();
  List<EmplacementStock> _emplacements = [];
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
      final data = await _stockService.getEmplacements(search: search);
      if (mounted) setState(() => _emplacements = data);
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
    final ok = await Navigator.push<bool>(context, MaterialPageRoute(builder: (_) => const EmplacementFormScreen()));
    if (ok == true) _load();
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: const Text('Emplacements'),),
      floatingActionButton: FloatingActionButton(onPressed: _openForm, backgroundColor: AppTheme.primary, child: const Icon(Icons.add, color: Colors.white)),
      body: Column(children: [
        Padding(padding: const EdgeInsets.fromLTRB(16, 16, 16, 8), child: TextField(
          controller: _searchController,
          decoration: InputDecoration(hintText: 'Rechercher...', prefixIcon: const Icon(Icons.search), suffixIcon: _searchController.text.isNotEmpty ? IconButton(icon: const Icon(Icons.clear), onPressed: () { _searchController.clear(); _onSearch(''); }) : null),
          onChanged: _onSearch,
        )),
        Expanded(child: _isLoading
          ? const Center(child: CircularProgressIndicator())
          : _error != null
            ? Center(child: Column(mainAxisSize: MainAxisSize.min, children: [Icon(Icons.error_outline, size: 48, color: Colors.grey[400]), const SizedBox(height: 12), Text('Erreur: $_error'), const SizedBox(height: 16), ElevatedButton(onPressed: () => _load(), child: const Text('Réessayer'))]))
            : _emplacements.isEmpty
              ? Center(child: Column(mainAxisSize: MainAxisSize.min, children: [Icon(Icons.location_off_outlined, size: 64, color: Colors.grey[400]), const SizedBox(height: 16), Text('Aucun emplacement', style: TextStyle(color: Colors.grey[600])), const SizedBox(height: 24), ElevatedButton.icon(icon: const Icon(Icons.add), onPressed: _openForm, label: const Text('Ajouter'))]))
              : RefreshIndicator(onRefresh: () => _load(), child: ListView.builder(
                  padding: const EdgeInsets.fromLTRB(16, 0, 16, 80),
                  itemCount: _emplacements.length,
                  itemBuilder: (context, i) => _EmplacementCard(
                    emplacement: _emplacements[i],
                    onTap: () async {
                      await Navigator.push(context, MaterialPageRoute(builder: (_) => EmplacementDetailScreen(id: _emplacements[i].id)));
                      _load();
                    },
                  ),
                ))),
      ]),
    );
  }
}

class _EmplacementCard extends StatelessWidget {
  final EmplacementStock emplacement;
  final VoidCallback onTap;
  const _EmplacementCard({required this.emplacement, required this.onTap});

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
          Container(width: 44, height: 44, decoration: BoxDecoration(color: const Color(0xFFD97706).withValues(alpha: 0.1), borderRadius: BorderRadius.circular(10)), child: const Icon(Icons.location_on_outlined, color: Color(0xFFD97706), size: 22)),
          const SizedBox(width: 12),
          Expanded(child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
            Text(emplacement.nom, style: const TextStyle(fontSize: 15, fontWeight: FontWeight.w600)),
            const SizedBox(height: 4),
            Row(children: [
              if (emplacement.code.isNotEmpty) Text(emplacement.code, style: const TextStyle(fontSize: 12, color: Color(0xFF64748B))),
              if (emplacement.code.isNotEmpty && emplacement.type.isNotEmpty) Text(' • ', style: TextStyle(color: Colors.grey[300])),
              if (emplacement.type.isNotEmpty) Text(emplacement.type, style: const TextStyle(fontSize: 12, color: Color(0xFF64748B))),
            ]),
            const SizedBox(height: 4),
            Container(padding: const EdgeInsets.symmetric(horizontal: 6, vertical: 2),
              decoration: BoxDecoration(color: emplacement.actif ? const Color(0xFF10B981).withValues(alpha: 0.1) : const Color(0xFFEF4444).withValues(alpha: 0.1), borderRadius: BorderRadius.circular(4)),
              child: Text(emplacement.actif ? 'Actif' : 'Inactif', style: TextStyle(fontSize: 10, fontWeight: FontWeight.w600, color: emplacement.actif ? const Color(0xFF10B981) : const Color(0xFFEF4444)))),
          ])),
          const Icon(Icons.chevron_right, color: Color(0xFFCBD5E1)),
        ])),
      ),
    );
  }
}
