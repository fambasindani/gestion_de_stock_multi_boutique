import 'package:flutter/material.dart';
import 'package:gst_stock_mobile/models/models.dart';
import 'package:gst_stock_mobile/services/services.dart';
import 'package:gst_stock_mobile/screens/produits/produit_detail_screen.dart';
import 'package:gst_stock_mobile/screens/produits/produit_form_screen.dart';

class ProduitsListScreen extends StatefulWidget {
  const ProduitsListScreen({super.key});

  @override
  State<ProduitsListScreen> createState() => _ProduitsListScreenState();
}

class _ProduitsListScreenState extends State<ProduitsListScreen> {
  final _produitService = ProduitService();
  final _searchController = TextEditingController();
  List<ProduitModele> _produits = [];
  bool _isLoading = true;
  String? _error;

  @override
  void initState() {
    super.initState();
    _loadProduits();
  }

  @override
  void dispose() {
    _searchController.dispose();
    super.dispose();
  }

  Future<void> _loadProduits({String? search}) async {
    setState(() {
      _isLoading = true;
      _error = null;
    });
    try {
      final produits = await _produitService.getAll(search: search);
      if (mounted) setState(() => _produits = produits);
    } catch (e) {
      if (mounted) setState(() => _error = e.toString());
    } finally {
      if (mounted) setState(() => _isLoading = false);
    }
  }

  void _onSearch(String value) {
    _loadProduits(search: value.isEmpty ? null : value);
  }

  Future<void> _openForm() async {
    final ok = await Navigator.push<bool>(context, MaterialPageRoute(builder: (_) => const ProduitFormScreen()));
    if (ok == true) _loadProduits();
  }

  @override
  Widget build(BuildContext context) {
    return Column(
      children: [
        Padding(
          padding: const EdgeInsets.fromLTRB(16, 16, 16, 8),
          child: Row(children: [
            Expanded(child: TextField(
              controller: _searchController,
              decoration: InputDecoration(hintText: 'Rechercher...', prefixIcon: const Icon(Icons.search), suffixIcon: _searchController.text.isNotEmpty ? IconButton(icon: const Icon(Icons.clear), onPressed: () { _searchController.clear(); _onSearch(''); }) : null),
              onChanged: _onSearch,
            )),
            const SizedBox(width: 8),
            IconButton.filled(icon: const Icon(Icons.add), onPressed: _openForm, style: IconButton.styleFrom(backgroundColor: const Color(0xFF2563EB), foregroundColor: Colors.white)),
          ]),
        ),
        Expanded(
          child: _isLoading
              ? const Center(child: CircularProgressIndicator())
              : _error != null
                  ? Center(
                      child: Padding(
                        padding: const EdgeInsets.all(24),
                        child: Column(
                          mainAxisAlignment: MainAxisAlignment.center,
                          children: [
                            const Icon(Icons.error_outline, size: 48, color: Colors.red),
                            const SizedBox(height: 16),
                            Text(_error!, textAlign: TextAlign.center, style: const TextStyle(color: Colors.red)),
                            const SizedBox(height: 24),
                            ElevatedButton(
                              onPressed: () => _loadProduits(search: _searchController.text.isEmpty ? null : _searchController.text),
                              child: const Text('Réessayer'),
                            ),
                          ],
                        ),
                      ),
                    )
                  : RefreshIndicator(
                      onRefresh: () => _loadProduits(search: _searchController.text.isEmpty ? null : _searchController.text),
                      child: _produits.isEmpty
                          ? Center(
                              child: Column(mainAxisSize: MainAxisSize.min, children: [
                                const SizedBox(height: 100),
                                Icon(Icons.inventory_2_outlined, size: 64, color: Colors.grey[400]),
                                const SizedBox(height: 16),
                                Text('Aucun produit', style: TextStyle(color: Colors.grey[600])),
                                const SizedBox(height: 24),
                                ElevatedButton.icon(icon: const Icon(Icons.add), onPressed: _openForm, label: const Text('Ajouter un produit')),
                              ]),
                            )
                          : ListView.builder(
                              padding: const EdgeInsets.fromLTRB(16, 0, 16, 80),
                              itemCount: _produits.length,
                              itemBuilder: (context, index) => _ProduitCard(
                                produit: _produits[index],
                                onTap: () => Navigator.of(context).push(
                                  MaterialPageRoute(
                                    builder: (_) => ProduitDetailScreen(id: _produits[index].id),
                                  ),
                                ),
                              ),
                            ),
                    ),
        ),
      ],
    );
  }
}

class _ProduitCard extends StatelessWidget {
  final ProduitModele produit;
  final VoidCallback onTap;

  const _ProduitCard({required this.produit, required this.onTap});

  @override
  Widget build(BuildContext context) {
    final hasVariantes = produit.variantes != null && produit.variantes!.isNotEmpty;
    final minPrice = hasVariantes
        ? produit.variantes!.map((v) => v.prixVente).reduce((a, b) => a < b ? a : b)
        : 0.0;
    final maxPrice = hasVariantes
        ? produit.variantes!.map((v) => v.prixVente).reduce((a, b) => a > b ? a : b)
        : 0.0;

    return Card(
      margin: const EdgeInsets.only(bottom: 10),
      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(10)),
      elevation: 1,
      child: InkWell(
        borderRadius: BorderRadius.circular(10),
        onTap: onTap,
        child: Padding(
          padding: const EdgeInsets.all(14),
          child: Row(
            children: [
              Container(
                width: 44,
                height: 44,
                decoration: BoxDecoration(
                  color: const Color(0xFF2563EB).withValues(alpha: 0.1),
                  borderRadius: BorderRadius.circular(10),
                ),
                child: const Icon(Icons.inventory_2_outlined, color: Color(0xFF2563EB), size: 22),
              ),
              const SizedBox(width: 12),
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(
                      produit.nom,
                      style: const TextStyle(fontSize: 15, fontWeight: FontWeight.w600),
                    ),
                    const SizedBox(height: 4),
                    Row(
                      children: [
                        _Tag(text: produit.type, color: const Color(0xFF0284C7)),
                        if (produit.categorie != null) ...[
                          const SizedBox(width: 6),
                          _Tag(text: produit.categorie!.nom, color: const Color(0xFF64748B)),
                        ],
                      ],
                    ),
                    if (hasVariantes) ...[
                      const SizedBox(height: 6),
                      Text(
                        '${minPrice.toStringAsFixed(2)} - ${maxPrice.toStringAsFixed(2)} CDF',
                        style: const TextStyle(fontSize: 13, color: Color(0xFF16A34A), fontWeight: FontWeight.w500),
                      ),
                    ],
                  ],
                ),
              ),
              const Icon(Icons.chevron_right, color: Color(0xFFCBD5E1)),
            ],
          ),
        ),
      ),
    );
  }
}

class _Tag extends StatelessWidget {
  final String text;
  final Color color;

  const _Tag({required this.text, required this.color});

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 2),
      decoration: BoxDecoration(
        color: color.withValues(alpha: 0.1),
        borderRadius: BorderRadius.circular(4),
      ),
      child: Text(text, style: TextStyle(fontSize: 11, color: color, fontWeight: FontWeight.w500)),
    );
  }
}
