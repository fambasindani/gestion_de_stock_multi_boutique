import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import 'package:gst_stock_mobile/config/theme.dart';
import 'package:gst_stock_mobile/models/models.dart';
import 'package:gst_stock_mobile/providers/auth_provider.dart';
import 'package:gst_stock_mobile/services/api_client.dart';
import 'package:gst_stock_mobile/services/services.dart';
import 'package:gst_stock_mobile/services/ticket_pdf_generator.dart';
import 'package:gst_stock_mobile/screens/pos/pos_journal_screen.dart';

class _ProduitItem {
  final int id;
  final String nom;
  final String? code;
  final double prixVente;
  _ProduitItem({required this.id, required this.nom, this.code, required this.prixVente});
}

class PosScreen extends StatefulWidget {
  const PosScreen({super.key});

  @override
  State<PosScreen> createState() => _PosScreenState();
}

class _PosScreenState extends State<PosScreen> {
  final _produitService = ProduitService();
  final _posService = PosService();
  final _searchController = TextEditingController();

  final List<PosCartLine> _cart = [];
  List<_ProduitItem> _produits = [];
  bool _loadingProduits = false;
  bool _saving = false;
  double _tvaTaux = 0;
  String _devise = 'CDF';

  @override
  void initState() {
    super.initState();
    _loadParams();
    _search();
  }

  @override
  void dispose() {
    _searchController.dispose();
    super.dispose();
  }

  Future<void> _loadParams() async {
    try {
      final p = await ParametreService().getAll();
      setState(() {
        _tvaTaux = double.tryParse('${p['tva_taux'] ?? 0}') ?? 0;
        _devise = (p['devise'] as String?)?.isNotEmpty == true ? p['devise'] as String : 'CDF';
      });
    } catch (_) {}
  }

  Future<void> _search() async {
    setState(() => _loadingProduits = true);
    try {
      final modeles = await _produitService.getAll(search: _searchController.text.trim());
      final items = <_ProduitItem>[];
      for (final m in modeles) {
        if (m.variantes != null && m.variantes!.isNotEmpty) {
          for (final v in m.variantes!) {
            items.add(_ProduitItem(
              id: v.id,
              nom: v.nom.isNotEmpty && v.nom != m.nom ? '${m.nom} — ${v.nom}' : m.nom,
              code: v.codeInterne,
              prixVente: v.prixVente,
            ));
          }
        } else {
          items.add(_ProduitItem(id: m.id, nom: m.nom, prixVente: 0));
        }
      }
      setState(() => _produits = items);
    } catch (_) {
      setState(() => _produits = []);
    } finally {
      if (mounted) setState(() => _loadingProduits = false);
    }
  }

  void _addToCart(_ProduitItem p) {
    final index = _cart.indexWhere((l) => l.produitId == p.id);
    setState(() {
      if (index >= 0) {
        _cart[index].quantite += 1;
      } else {
        _cart.add(PosCartLine(
          produitId: p.id,
          nom: p.nom,
          code: p.code,
          prixUnitaireHt: p.prixVente,
          tauxTva: _tvaTaux,
        ));
      }
    });
  }

  double get _totalTtc => _cart.fold(0.0, (s, l) => s + l.montantTtc);
  double get _totalHt => _cart.fold(0.0, (s, l) => s + l.montantHt);
  double get _totalTva => _cart.fold(0.0, (s, l) => s + l.montantTva);

  Future<void> _encaisser() async {
    if (_cart.isEmpty) return;

    final clientCtrl = TextEditingController();
    final payeCtrl = TextEditingController(text: _totalTtc.toStringAsFixed(2));
    String mode = 'especes';
    final modeCtrl = await showDialog<bool>(
      context: context,
      builder: (ctx) => StatefulBuilder(
        builder: (ctx, setModal) => AlertDialog(
          title: const Text('Encaisser'),
          content: Column(
            mainAxisSize: MainAxisSize.min,
            children: [
              Text('Total TTC : ${_totalTtc.toStringAsFixed(2)} $_devise',
                  style: const TextStyle(fontWeight: FontWeight.bold)),
              const SizedBox(height: 12),
              TextField(controller: clientCtrl, decoration: const InputDecoration(labelText: 'Client (optionnel)')),
              const SizedBox(height: 12),
              DropdownButtonFormField<String>(
                initialValue: mode,
                decoration: const InputDecoration(labelText: 'Mode de paiement'),
                items: const [
                  DropdownMenuItem(value: 'especes', child: Text('Espèces')),
                  DropdownMenuItem(value: 'mobile_money', child: Text('Mobile money')),
                  DropdownMenuItem(value: 'carte', child: Text('Carte')),
                  DropdownMenuItem(value: 'virement', child: Text('Virement')),
                ],
                onChanged: (v) => setModal(() => mode = v ?? 'especes'),
              ),
              const SizedBox(height: 12),
              TextField(
                controller: payeCtrl,
                keyboardType: const TextInputType.numberWithOptions(decimal: true),
                decoration: const InputDecoration(labelText: 'Montant payé'),
              ),
            ],
          ),
          actions: [
            TextButton(onPressed: () => Navigator.pop(ctx, false), child: const Text('Annuler')),
            ElevatedButton(
              onPressed: () => Navigator.pop(ctx, true),
              style: ElevatedButton.styleFrom(backgroundColor: AppTheme.primary, foregroundColor: Colors.white),
              child: const Text('Valider'),
            ),
          ],
        ),
      ),
    );
    if (modeCtrl != true) return;

    setState(() => _saving = true);
    try {
      final result = await _posService.vendre(
        lignes: _cart
            .map((l) => {
                  'produit_id': l.produitId,
                  'quantite': l.quantite,
                  'prix_unitaire_ht': l.prixUnitaireHt,
                  'taux_tva': l.tauxTva,
                  'taux_remise': l.tauxRemise,
                })
            .toList(),
        clientNom: clientCtrl.text.trim().isEmpty ? null : clientCtrl.text.trim(),
        modePaiement: mode,
        montantPaye: double.tryParse(payeCtrl.text.replaceAll(',', '.')),
      );
      if (!mounted) return;
      setState(() => _cart.clear());
      _showTicket(result);
    } on ApiException catch (e) {
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(content: Text(e.message), backgroundColor: Colors.redAccent),
        );
      }
    } catch (_) {
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(content: Text('Erreur lors de la vente'), backgroundColor: Colors.redAccent),
        );
      }
    } finally {
      if (mounted) setState(() => _saving = false);
    }
  }

  void _showTicket(PosVenteResult vente) {
    final societe = context.read<AuthProvider>().societe?.nom;
    showDialog(
      context: context,
      builder: (ctx) => AlertDialog(
        title: const Text('Vente enregistrée'),
        content: Text('Ticket ${vente.facture.numeroFacture ?? vente.facture.reference}\n'
            'Total TTC : ${vente.facture.montantTtc.toStringAsFixed(2)} $_devise'),
        actions: [
          TextButton(onPressed: () => Navigator.pop(ctx), child: const Text('Fermer')),
          ElevatedButton.icon(
            onPressed: () => TicketPdfGenerator.printTicket(vente, societeNom: societe),
            icon: const Icon(Icons.print),
            label: const Text('Imprimer'),
            style: ElevatedButton.styleFrom(backgroundColor: AppTheme.primary, foregroundColor: Colors.white),
          ),
        ],
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: AppTheme.surface,
      appBar: AppBar(
        title: const Text('Vente comptoir (POS)'),
        actions: [
          IconButton(
            icon: const Icon(Icons.receipt_long_outlined),
            tooltip: 'Journal / clôture de caisse',
            onPressed: () => Navigator.of(context).push(
              MaterialPageRoute(builder: (_) => const PosJournalScreen()),
            ),
          ),
        ],
      ),
      body: Column(
        children: [
          Padding(
            padding: const EdgeInsets.all(12),
            child: Row(
              children: [
                Expanded(
                  child: TextField(
                    controller: _searchController,
                    textInputAction: TextInputAction.search,
                    decoration: const InputDecoration(
                      hintText: 'Rechercher un produit ou scanner...',
                      prefixIcon: Icon(Icons.search),
                      isDense: true,
                    ),
                    onSubmitted: (_) => _search(),
                  ),
                ),
                const SizedBox(width: 8),
                IconButton.filled(
                  onPressed: _search,
                  icon: const Icon(Icons.qr_code_scanner),
                  tooltip: 'Rechercher',
                ),
              ],
            ),
          ),
          Expanded(
            flex: 3,
            child: _loadingProduits
                ? const Center(child: CircularProgressIndicator())
                : ListView.builder(
                    itemCount: _produits.length,
                    itemBuilder: (context, i) {
                      final p = _produits[i];
                      return ListTile(
                        dense: true,
                        title: Text(p.nom),
                        subtitle: p.code != null ? Text(p.code!) : null,
                        trailing: Text('${p.prixVente.toStringAsFixed(2)} $_devise'),
                        onTap: () => _addToCart(p),
                      );
                    },
                  ),
          ),
          const Divider(height: 1),
          Expanded(
            flex: 2,
            child: _cart.isEmpty
                ? const Center(child: Text('Panier vide', style: TextStyle(color: Colors.grey)))
                : ListView.builder(
                    itemCount: _cart.length,
                    itemBuilder: (context, i) {
                      final l = _cart[i];
                      return ListTile(
                        dense: true,
                        title: Text(l.nom),
                        subtitle: Text('${l.montantTtc.toStringAsFixed(2)} $_devise'),
                        leading: SizedBox(
                          width: 110,
                          child: Row(
                            mainAxisSize: MainAxisSize.min,
                            children: [
                              IconButton(
                                icon: const Icon(Icons.remove_circle_outline, size: 20),
                                onPressed: () => setState(() {
                                  if (l.quantite > 1) {
                                    l.quantite -= 1;
                                  } else {
                                    _cart.removeAt(i);
                                  }
                                }),
                              ),
                              Text(l.quantite.toStringAsFixed(0)),
                              IconButton(
                                icon: const Icon(Icons.add_circle_outline, size: 20),
                                onPressed: () => setState(() => l.quantite += 1),
                              ),
                            ],
                          ),
                        ),
                        trailing: IconButton(
                          icon: const Icon(Icons.delete_outline, color: Colors.red),
                          onPressed: () => setState(() => _cart.removeAt(i)),
                        ),
                      );
                    },
                  ),
          ),
          Container(
            padding: const EdgeInsets.all(12),
            decoration: BoxDecoration(
              color: Colors.white,
              boxShadow: [BoxShadow(color: Colors.black.withValues(alpha: 0.05), blurRadius: 8)],
            ),
            child: Column(
              children: [
                Row(mainAxisAlignment: MainAxisAlignment.spaceBetween, children: [
                  const Text('Total HT'),
                  Text('${_totalHt.toStringAsFixed(2)} $_devise'),
                ]),
                Row(mainAxisAlignment: MainAxisAlignment.spaceBetween, children: [
                  Text('TVA (${_tvaTaux.toStringAsFixed(0)}%)'),
                  Text('${_totalTva.toStringAsFixed(2)} $_devise'),
                ]),
                Row(mainAxisAlignment: MainAxisAlignment.spaceBetween, children: [
                  const Text('Total TTC', style: TextStyle(fontWeight: FontWeight.bold, fontSize: 16)),
                  Text('${_totalTtc.toStringAsFixed(2)} $_devise',
                      style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 16, color: AppTheme.primary)),
                ]),
                const SizedBox(height: 10),
                SizedBox(
                  width: double.infinity,
                  height: 48,
                  child: ElevatedButton(
                    onPressed: (_cart.isEmpty || _saving) ? null : _encaisser,
                    style: ElevatedButton.styleFrom(
                      backgroundColor: AppTheme.primary,
                      foregroundColor: Colors.white,
                      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
                    ),
                    child: _saving
                        ? const SizedBox(width: 22, height: 22, child: CircularProgressIndicator(color: Colors.white, strokeWidth: 2.5))
                        : const Text('Encaisser', style: TextStyle(fontSize: 16, fontWeight: FontWeight.w600)),
                  ),
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }
}
