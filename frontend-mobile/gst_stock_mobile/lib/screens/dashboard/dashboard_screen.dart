import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import 'package:gst_stock_mobile/providers/auth_provider.dart';
import 'package:gst_stock_mobile/models/models.dart';
import 'package:gst_stock_mobile/services/services.dart';

class DashboardScreen extends StatefulWidget {
  const DashboardScreen({super.key});

  @override
  State<DashboardScreen> createState() => _DashboardScreenState();
}

class _DashboardScreenState extends State<DashboardScreen> {
  final _dashboardService = DashboardService();
  Map<String, dynamic>? _data;
  Map<String, dynamic> _subCommandes = {};
  Map<String, dynamic> _subStock = {};
  Map<String, dynamic> _subFacturation = {};
  bool _isLoading = true;
  String? _error;
  String _periode = 'mois';

  @override
  void initState() {
    super.initState();
    _loadStats();
  }

  Map<String, String> _rangeParams() {
    final now = DateTime.now();
    DateTime start;
    switch (_periode) {
      case 'jour':
        start = DateTime(now.year, now.month, now.day);
        break;
      case 'semaine':
        start = now.subtract(Duration(days: now.weekday - 1));
        break;
      case 'annee':
        start = DateTime(now.year, 1, 1);
        break;
      case 'tout':
        start = DateTime(2020, 1, 1);
        break;
      default:
        start = DateTime(now.year, now.month, 1);
    }
    String iso(DateTime d) => d.toIso8601String().split('T').first;
    return {'date_debut': iso(start), 'date_fin': iso(now)};
  }

  Future<void> _loadStats() async {
    setState(() { _isLoading = true; _error = null; });
    try {
      final range = _rangeParams();
      final results = await Future.wait([
        _dashboardService.getStats(dateDebut: range['date_debut'], dateFin: range['date_fin']),
        _dashboardService.getCommandesStats(),
        _dashboardService.getStockStats(),
        _dashboardService.getFacturationStats(),
      ]);
      if (mounted) {
        setState(() {
          _data = results[0];
          _subCommandes = results[1];
          _subStock = results[2];
          _subFacturation = results[3];
        });
      }
    } catch (e) {
      if (mounted) setState(() => _error = e.toString());
    } finally {
      if (mounted) setState(() => _isLoading = false);
    }
  }

  String _formatCurrency(dynamic v) {
    if (v == null) return '0,00 CDF';
    final n = (v is num) ? v.toDouble() : double.tryParse(v.toString()) ?? 0;
    final parts = n.toStringAsFixed(2).split('.');
    final intPart = parts[0].replaceAllMapped(RegExp(r'(\d{1,3})(?=(\d{3})+(?!\d))'), (m) => '${m[1]} ');
    return '$intPart,${parts[1]} CDF';
  }

  String _formatDate(DateTime d) {
    const days = ['dimanche', 'lundi', 'mardi', 'mercredi', 'jeudi', 'vendredi', 'samedi'];
    const months = ['janvier', 'février', 'mars', 'avril', 'mai', 'juin', 'juillet', 'août', 'septembre', 'octobre', 'novembre', 'décembre'];
    return '${days[d.weekday - 1]} ${d.day} ${months[d.month - 1]} ${d.year}';
  }

  @override
  Widget build(BuildContext context) {
    final user = context.watch<AuthProvider>().user;

    if (_isLoading) return const Center(child: CircularProgressIndicator());
    if (_error != null) {
      return Center(child: Padding(padding: const EdgeInsets.all(24), child: Column(mainAxisAlignment: MainAxisAlignment.center, children: [
        const Icon(Icons.error_outline, size: 48, color: Colors.red),
        const SizedBox(height: 16), const Text('Erreur', style: TextStyle(fontSize: 18, fontWeight: FontWeight.bold)),
        const SizedBox(height: 8), Text(_error!, textAlign: TextAlign.center, style: const TextStyle(color: Colors.red)),
        const SizedBox(height: 24), ElevatedButton(onPressed: _loadStats, child: const Text('Réessayer')),
      ])));
    }

    final d = _data ?? {};
    final sg = d['stats_generales'] as Map<String, dynamic>? ?? {};
    final ca = d['chiffres_affaires'] as Map<String, dynamic>? ?? {};
    final cmd = d['commandes'] as Map<String, dynamic>? ?? {};
    final stock = d['stock'] as Map<String, dynamic>? ?? {};

    return RefreshIndicator(
      onRefresh: _loadStats,
      child: ListView(padding: const EdgeInsets.all(16), children: [
        _buildHeader(user),
        const SizedBox(height: 20),
        _buildPeriodeSelector(),
        const SizedBox(height: 16),
        _buildKpiGrid(sg),
        const SizedBox(height: 20),
        _buildRevenueCards(ca),
        const SizedBox(height: 20),
        _buildOrdersSection(cmd),
        const SizedBox(height: 20),
        _buildStockSection(stock),
        const SizedBox(height: 20),
        _buildTopProduits(d['top_produits'] as List? ?? []),
        const SizedBox(height: 20),
        _buildUserActivity(d['activite_utilisateurs'] as Map<String, dynamic>? ?? {}),
        const SizedBox(height: 20),
        _buildTransferts(d['transferts_recents'] as List? ?? []),
        const SizedBox(height: 20),
        _buildFactures(d['factures_recents'] as List? ?? []),
        const SizedBox(height: 20),
        _buildAlertes(d['alertes_stock'] as List? ?? []),
        const SizedBox(height: 20),
        _buildSubSections(),
        const SizedBox(height: 32),
      ]),
    );
  }

  Widget _buildSubSections() {
    final cmd = _subCommandes;
    final st = _subStock;
    final fact = _subFacturation;

    Widget card(String title, IconData icon, List<Widget> children) => Card(
          margin: const EdgeInsets.only(bottom: 12),
          shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
          elevation: 1,
          child: Padding(
            padding: const EdgeInsets.all(14),
            child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
              Row(children: [
                Container(
                  width: 36,
                  height: 36,
                  decoration: BoxDecoration(color: const Color(0xFF2563EB).withValues(alpha: 0.1), borderRadius: BorderRadius.circular(8)),
                  child: Icon(icon, color: const Color(0xFF2563EB), size: 18),
                ),
                const SizedBox(width: 10),
                Text(title, style: const TextStyle(fontWeight: FontWeight.w600, fontSize: 15)),
              ]),
              const Divider(height: 20),
              ...children,
            ]),
          ),
        );

    Widget line(String label, String value) => Padding(
          padding: const EdgeInsets.symmetric(vertical: 3),
          child: Row(mainAxisAlignment: MainAxisAlignment.spaceBetween, children: [
            Text(label, style: const TextStyle(fontSize: 13, color: Color(0xFF64748B))),
            Text(value, style: const TextStyle(fontSize: 13, fontWeight: FontWeight.w600)),
          ]),
        );

    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        const Padding(
          padding: EdgeInsets.only(left: 4, bottom: 10),
          child: Text('DÉTAILS', style: TextStyle(fontSize: 11, fontWeight: FontWeight.w600, color: Color(0xFF94A3B8), letterSpacing: 1)),
        ),
        if (cmd.isNotEmpty)
          card('Commandes (détail)', Icons.receipt_long_outlined, [
            line("Aujourd'hui", '${cmd['aujourd_hui']?['commandes'] ?? 0} • ${_formatCurrency(cmd['aujourd_hui']?['montant'])}'),
            line('Total période', '${cmd['total_periode']?['commandes'] ?? 0} • ${_formatCurrency(cmd['total_periode']?['montant'])}'),
          ]),
        if (st.isNotEmpty)
          card('Stock (détail)', Icons.warehouse_outlined, [
            line('Valeur totale', _formatCurrency(st['valeur_totale_stock'])),
            line('Quantité totale', '${st['total_quantite'] ?? 0}'),
            line('Produits', '${st['nombre_produits'] ?? 0}'),
          ]),
        if (fact.isNotEmpty)
          card('Facturation (détail)', Icons.receipt_outlined, [
            line('Montant total', _formatCurrency(fact['montant_total'])),
            line('Factures', '${fact['total_factures'] ?? 0}'),
            line('Impayé', '${fact['factures_impayees'] ?? 0} • ${_formatCurrency(fact['montant_impaye'])}'),
          ]),
      ],
    );
  }

  Widget _buildHeader(Utilisateur? user) {
    final nom = user?.nom ?? 'Utilisateur';
    final role = (user?.roles != null && user!.roles!.isNotEmpty) ? user.roles!.first.nom : null;
    final initiales = nom
        .trim()
        .split(RegExp(r'\s+'))
        .where((w) => w.isNotEmpty)
        .map((w) => w[0])
        .join()
        .toUpperCase();
    return Row(
      children: [
        CircleAvatar(
          radius: 26,
          backgroundColor: const Color(0xFF2563EB).withValues(alpha: 0.1),
          child: Text(
            initiales.length > 2 ? initiales.substring(0, 2) : initiales,
            style: const TextStyle(fontWeight: FontWeight.bold, color: Color(0xFF2563EB), fontSize: 18),
          ),
        ),
        const SizedBox(width: 14),
        Expanded(
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              const Text('Tableau de bord', style: TextStyle(fontSize: 20, fontWeight: FontWeight.bold)),
              const SizedBox(height: 2),
              Text(
                role != null ? '$nom • $role' : nom,
                style: const TextStyle(fontSize: 13, color: Color(0xFF64748B)),
              ),
              const SizedBox(height: 2),
              Text(_formatDate(DateTime.now()), style: const TextStyle(fontSize: 12, color: Color(0xFF94A3B8))),
            ],
          ),
        ),
      ],
    );
  }

  Widget _buildPeriodeSelector() {
    const labels = {
      'jour': "Aujourd'hui",
      'semaine': 'Cette semaine',
      'mois': 'Ce mois',
      'annee': 'Cette année',
      'tout': 'Tout',
    };
    return Row(
      children: [
        const Icon(Icons.calendar_today_outlined, size: 16, color: Color(0xFF64748B)),
        const SizedBox(width: 8),
        Expanded(
          child: DropdownButtonHideUnderline(
            child: DropdownButton<String>(
              value: _periode,
              isExpanded: true,
              items: labels.entries
                  .map((e) => DropdownMenuItem(value: e.key, child: Text(e.value)))
                  .toList(),
              onChanged: (v) {
                if (v == null) return;
                setState(() => _periode = v);
                _loadStats();
              },
            ),
          ),
        ),
      ],
    );
  }

  Widget _buildKpiGrid(Map<String, dynamic> sg) {
    final items = [
      _KpiItem('Utilisateurs', '${sg['total_utilisateurs'] ?? 0}', Icons.people, const Color(0xFF7C3AED)),
      _KpiItem('Clients', '${sg['total_clients'] ?? 0}', Icons.store, const Color(0xFF2563EB)),
      _KpiItem('Produits', '${sg['total_produits'] ?? 0}', Icons.inventory_2_outlined, const Color(0xFF16A34A)),
      _KpiItem('Commandes', '${sg['total_commandes_vente'] ?? 0}', Icons.shopping_cart, const Color(0xFFD97706)),
    ];
    return GridView.builder(
      shrinkWrap: true, physics: const NeverScrollableScrollPhysics(),
      gridDelegate: const SliverGridDelegateWithFixedCrossAxisCount(crossAxisCount: 2, childAspectRatio: 1.3, crossAxisSpacing: 12, mainAxisSpacing: 12),
      itemCount: 4, itemBuilder: (_, i) => _MiniCard(icon: items[i].icon, label: items[i].label, value: items[i].value, color: items[i].color),
    );
  }

  Widget _buildRevenueCards(Map<String, dynamic> ca) {
    final taux = (ca['taux_paiement'] ?? 0);
    final tauxNum = (taux is num) ? taux.toDouble() : double.tryParse(taux.toString()) ?? 0;
    return Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
      const Padding(padding: EdgeInsets.only(left: 4, bottom: 10), child: Text('CHIFFRE D\'AFFAIRES', style: TextStyle(fontSize: 11, fontWeight: FontWeight.w600, color: Color(0xFF94A3B8), letterSpacing: 1))),
      _buildRevCard(Icons.trending_up, 'CA Clients', _formatCurrency(ca['ca_clients']), const Color(0xFF2563EB)),
      const SizedBox(height: 8),
      _buildRevCard(Icons.trending_down, 'CA Fournisseurs', _formatCurrency(ca['ca_fournisseurs']), const Color(0xFF16A34A)),
      const SizedBox(height: 8),
      _buildRevCard(Icons.warning_amber_rounded, 'Impayées', _formatCurrency(ca['factures_impayees']), const Color(0xFFDC2626)),
      const SizedBox(height: 8),
      _buildRevCard(Icons.payment, 'Taux de paiement', '${tauxNum.toStringAsFixed(0)}%', const Color(0xFFD97706), progress: tauxNum / 100),
    ]);
  }

  Widget _buildRevCard(IconData icon, String label, String value, Color color, {double? progress}) {
    return Card(margin: EdgeInsets.zero, shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)), elevation: 1,
      child: Padding(padding: const EdgeInsets.all(14), child: Row(children: [
        Container(width: 40, height: 40, decoration: BoxDecoration(color: color.withValues(alpha: 0.1), borderRadius: BorderRadius.circular(10)), child: Icon(icon, color: color, size: 20)),
        const SizedBox(width: 12),
        Expanded(child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
          Text(label, style: const TextStyle(fontSize: 12, color: Color(0xFF64748B))),
          const SizedBox(height: 2),
          Text(value, style: TextStyle(fontSize: 16, fontWeight: FontWeight.bold, color: color)),
          if (progress != null) ...[const SizedBox(height: 6), ClipRRect(borderRadius: BorderRadius.circular(4), child: LinearProgressIndicator(value: progress.clamp(0, 1), minHeight: 6, backgroundColor: const Color(0xFFE2E8F0), valueColor: AlwaysStoppedAnimation<Color>(color)))],
        ])),
      ])),
    );
  }

  Widget _buildOrdersSection(Map<String, dynamic> cmd) {
    return Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
      const Padding(padding: EdgeInsets.only(left: 4, bottom: 10), child: Text('COMMANDES', style: TextStyle(fontSize: 11, fontWeight: FontWeight.w600, color: Color(0xFF94A3B8), letterSpacing: 1))),
      _buildOrderBlock('Ventes', cmd['ventes'] as Map<String, dynamic>? ?? {}, const Color(0xFF2563EB)),
      const SizedBox(height: 10),
      _buildOrderBlock('Achats', cmd['achats'] as Map<String, dynamic>? ?? {}, const Color(0xFFD97706)),
    ]);
  }

  Widget _buildOrderBlock(String title, Map<String, dynamic> data, Color color) {
    final parStatut = data['par_statut'] as Map<String, dynamic>? ?? {};
    final statusLabels = <String, String>{
      'brouillon': 'Brouillon', 'confirme': 'Confirmé', 'en_cours': 'En cours',
      'envoye': 'Envoyé', 'recu': 'Reçu', 'termine': 'Terminé', 'annule': 'Annulé',
    };
    final statusColors = <String, Color>{
      'brouillon': Colors.grey, 'confirme': Colors.blue, 'en_cours': const Color(0xFFD97706),
      'envoye': Colors.orange, 'recu': Colors.green, 'termine': Colors.green, 'annule': Colors.red,
    };
    return Card(margin: EdgeInsets.zero, shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)), elevation: 1,
      child: Padding(padding: const EdgeInsets.all(14), child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
        Row(children: [
          Container(width: 36, height: 36, decoration: BoxDecoration(color: color.withValues(alpha: 0.1), borderRadius: BorderRadius.circular(8)), child: Icon(Icons.receipt_outlined, color: color, size: 18)),
          const SizedBox(width: 10),
          Text(title, style: const TextStyle(fontWeight: FontWeight.w600, fontSize: 15)),
          const Spacer(),
          Container(padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4), decoration: BoxDecoration(color: color.withValues(alpha: 0.1), borderRadius: BorderRadius.circular(8)),
            child: Text('${data['total'] ?? 0}', style: TextStyle(fontWeight: FontWeight.bold, color: color, fontSize: 14)),
          ),
        ]),
        const SizedBox(height: 12),
        Wrap(spacing: 6, runSpacing: 6, children: parStatut.entries.map((e) {
          final c = statusColors[e.key] ?? Colors.grey;
          return Container(padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
            decoration: BoxDecoration(color: c.withValues(alpha: 0.1), borderRadius: BorderRadius.circular(6)),
            child: Text('${statusLabels[e.key] ?? e.key} : ${e.value}', style: TextStyle(fontSize: 11, color: c, fontWeight: FontWeight.w500)));
        }).toList()),
      ])),
    );
  }

  Widget _buildStockSection(Map<String, dynamic> stock) {
    final totalQte = (stock['quantite_totale'] ?? '0').toString();
    final enStock = stock['produits_en_stock'] ?? 0;
    final rupture = stock['produits_rupture'] ?? 0;
    final alerte = stock['produits_alerte'] ?? 0;
    final total = (enStock is int ? enStock : 0) + (rupture is int ? rupture : 0);
    return Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
      const Padding(padding: EdgeInsets.only(left: 4, bottom: 10), child: Text('STOCK', style: TextStyle(fontSize: 11, fontWeight: FontWeight.w600, color: Color(0xFF94A3B8), letterSpacing: 1))),
      Card(margin: EdgeInsets.zero, shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)), elevation: 1,
        child: Padding(padding: const EdgeInsets.all(14), child: Column(children: [
          Row(children: [
            Container(width: 40, height: 40, decoration: BoxDecoration(color: const Color(0xFF16A34A).withValues(alpha: 0.1), borderRadius: BorderRadius.circular(10)), child: const Icon(Icons.inventory_outlined, color: Color(0xFF16A34A), size: 20)),
            const SizedBox(width: 12),
            const Text('Vue d\'ensemble', style: TextStyle(fontWeight: FontWeight.w600)),
            const Spacer(),
            Text('$totalQte unités', style: const TextStyle(fontSize: 13, color: Color(0xFF64748B))),
          ]),
          const SizedBox(height: 16),
          _stockBar('En stock', enStock is int ? enStock : 0, total, const Color(0xFF16A34A)),
          const SizedBox(height: 10),
          _stockBar('Rupture', rupture is int ? rupture : 0, total, const Color(0xFFDC2626)),
          const SizedBox(height: 10),
          Row(children: [
            Icon(Icons.warning_amber_rounded, size: 14, color: alerte > 0 ? const Color(0xFFD97706) : const Color(0xFF16A34A)),
            const SizedBox(width: 6),
            Text(alerte > 0 ? '$alerte produit(s) en alerte' : 'Aucune alerte', style: TextStyle(fontSize: 12, color: alerte > 0 ? const Color(0xFFD97706) : const Color(0xFF16A34A), fontWeight: FontWeight.w500)),
          ]),
        ])),
      ),
    ]);
  }

  Widget _stockBar(String label, int value, int total, Color color) {
    final pct = total > 0 ? value / total : 0.0;
    return Row(children: [
      SizedBox(width: 70, child: Text(label, style: const TextStyle(fontSize: 13, color: Color(0xFF64748B)))),
      Expanded(child: ClipRRect(borderRadius: BorderRadius.circular(4), child: LinearProgressIndicator(value: pct.clamp(0, 1), minHeight: 10, backgroundColor: color.withValues(alpha: 0.1), valueColor: AlwaysStoppedAnimation<Color>(color)))),
      const SizedBox(width: 8),
      Text('$value', style: TextStyle(fontSize: 13, fontWeight: FontWeight.w600, color: color)),
    ]);
  }

  Widget _buildTopProduits(List produits) {
    if (produits.isEmpty) return const SizedBox.shrink();
    final maxQte = produits.fold<double>(0, (m, e) {
      final q = (e is Map) ? (double.tryParse((e['quantite_vendue'] ?? '0').toString()) ?? 0.0) : 0.0;
      return q > m ? q : m;
    });
    return Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
      Padding(padding: const EdgeInsets.only(left: 4, bottom: 10), child: const Text('TOP PRODUITS VENDUS', style: TextStyle(fontSize: 11, fontWeight: FontWeight.w600, color: Color(0xFF94A3B8), letterSpacing: 1))),
      Card(margin: EdgeInsets.zero, shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)), elevation: 1,
        child: Padding(padding: const EdgeInsets.all(14), child: Column(children: produits.take(5).toList().asMap().entries.map((e) {
          final m = e.value as Map<String, dynamic>;
          final qte = double.tryParse((m['quantite_vendue'] ?? '0').toString()) ?? 0;
          final pct = maxQte > 0 ? qte / maxQte : 0.0;
          return Padding(padding: EdgeInsets.only(top: e.key > 0 ? 10 : 0), child: Row(children: [
            Container(width: 24, height: 24, decoration: BoxDecoration(color: const Color(0xFF2563EB).withValues(alpha: 0.1), borderRadius: BorderRadius.circular(6)),
              child: Center(child: Text('${e.key + 1}', style: const TextStyle(fontSize: 12, fontWeight: FontWeight.bold, color: Color(0xFF2563EB))))),
            const SizedBox(width: 10),
            Expanded(child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
              Text('${m['nom'] ?? '-'}', style: const TextStyle(fontSize: 13, fontWeight: FontWeight.w500)),
              const SizedBox(height: 4),
              ClipRRect(borderRadius: BorderRadius.circular(4), child: LinearProgressIndicator(value: pct.clamp(0, 1), minHeight: 8, backgroundColor: const Color(0xFF2563EB).withValues(alpha: 0.1), valueColor: const AlwaysStoppedAnimation<Color>(Color(0xFF2563EB)))),
            ])),
            const SizedBox(width: 10),
            Text('${qte.toStringAsFixed(0)} u', style: TextStyle(fontSize: 13, fontWeight: FontWeight.w600, color: const Color(0xFF2563EB))),
          ]));
        }).toList())),
      ),
    ]);
  }

  Widget _buildUserActivity(Map<String, dynamic> activite) {
    final rolesMap = activite['utilisateurs_par_role'] as Map<String, dynamic>? ?? {};
    final totalActifs = activite['total_actifs'] ?? 0;
    final totalInactifs = activite['total_inactifs'] ?? 0;
    if (rolesMap.isEmpty) return const SizedBox.shrink();
    final total = rolesMap.values.fold<int>(0, (s, v) => s + ((v is int) ? v : int.tryParse(v.toString()) ?? 0));
    return Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
      Padding(padding: const EdgeInsets.only(left: 4, bottom: 10), child: const Text('UTILISATEURS', style: TextStyle(fontSize: 11, fontWeight: FontWeight.w600, color: Color(0xFF94A3B8), letterSpacing: 1))),
      Card(margin: EdgeInsets.zero, shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)), elevation: 1,
        child: Padding(padding: const EdgeInsets.all(14), child: Column(children: [
          Row(children: [
            _badgeStat('Actifs', '$totalActifs', const Color(0xFF10B981)),
            const SizedBox(width: 16),
            _badgeStat('Inactifs', '$totalInactifs', const Color(0xFFEF4444)),
            const Spacer(),
            _badgeStat('Total', '$total', const Color(0xFF2563EB)),
          ]),
          const SizedBox(height: 16),
          ...rolesMap.entries.map((e) {
            final count = (e.value is int) ? e.value as int : int.tryParse(e.value.toString()) ?? 0;
            final pct = total > 0 ? count / total : 0.0;
            final color = const Color(0xFF06B6D4);
            return Padding(padding: const EdgeInsets.only(bottom: 8), child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
              Row(mainAxisAlignment: MainAxisAlignment.spaceBetween, children: [
                Text(e.key, style: const TextStyle(fontSize: 13)),
                Text('$count', style: const TextStyle(fontSize: 13, fontWeight: FontWeight.w600)),
              ]),
              const SizedBox(height: 4),
              ClipRRect(borderRadius: BorderRadius.circular(4), child: LinearProgressIndicator(value: pct.clamp(0, 1), minHeight: 8, backgroundColor: color.withValues(alpha: 0.1), valueColor: AlwaysStoppedAnimation<Color>(color))),
            ]));
          }),
        ])),
      ),
    ]);
  }

  Widget _badgeStat(String label, String value, Color color) {
    return Column(children: [
      Container(padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
        decoration: BoxDecoration(color: color.withValues(alpha: 0.1), borderRadius: BorderRadius.circular(8)),
        child: Text(value, style: TextStyle(fontWeight: FontWeight.bold, color: color))),
      const SizedBox(height: 4),
      Text(label, style: const TextStyle(fontSize: 11, color: Color(0xFF64748B))),
    ]);
  }

  Widget _buildTransferts(List transferts) {
    if (transferts.isEmpty) return const SizedBox.shrink();
    final statusColors = <String, Color>{'brouillon': Colors.grey, 'confirme': Colors.blue, 'en_cours': const Color(0xFFD97706), 'termine': Colors.green, 'annule': Colors.red};
    final statusLabels = <String, String>{'brouillon': 'Brouillon', 'confirme': 'Confirmé', 'en_cours': 'En cours', 'termine': 'Terminé', 'annule': 'Annulé'};
    return _buildListSection('TRANSFERTS RÉCENTS', transferts.take(5).toList(), (item, i) {
      final m = item as Map<String, dynamic>;
      final etat = (m['etat'] ?? '').toString();
      return ListTile(
        dense: true, contentPadding: EdgeInsets.zero,
        leading: Container(width: 36, height: 36, decoration: BoxDecoration(color: const Color(0xFFD97706).withValues(alpha: 0.1), borderRadius: BorderRadius.circular(8)), child: const Icon(Icons.swap_horiz, color: Color(0xFFD97706), size: 18)),
        title: Text(m['reference'] ?? '-', style: const TextStyle(fontWeight: FontWeight.w500, fontSize: 14)),
        subtitle: Text('${m['source'] ?? '-'} → ${m['destination'] ?? '-'}', style: const TextStyle(fontSize: 11, color: Color(0xFF64748B))),
        trailing: Row(mainAxisSize: MainAxisSize.min, children: [
          Container(padding: const EdgeInsets.symmetric(horizontal: 6, vertical: 3),
            decoration: BoxDecoration(color: (statusColors[etat] ?? Colors.grey).withValues(alpha: 0.1), borderRadius: BorderRadius.circular(6)),
            child: Text(statusLabels[etat] ?? etat, style: TextStyle(fontSize: 10, color: statusColors[etat] ?? Colors.grey, fontWeight: FontWeight.w600))),
        ]),
      );
    });
  }

  Widget _buildFactures(List factures) {
    if (factures.isEmpty) return const SizedBox.shrink();
    final statusColors = <String, Color>{'payee': const Color(0xFF10B981), 'en_attente': const Color(0xFFD97706), 'partielle': const Color(0xFF2563EB), 'impayee': const Color(0xFFDC2626), 'annulee': Colors.grey};
    final statusLabels = <String, String>{'payee': 'Payée', 'en_attente': 'En attente', 'partielle': 'Partielle', 'impayee': 'Impayée', 'annulee': 'Annulée'};
    return _buildListSection('FACTURES RÉCENTES', factures.take(5).toList(), (item, i) {
      final m = item as Map<String, dynamic>;
      final etat = (m['statut'] ?? '').toString();
      return ListTile(
        dense: true, contentPadding: EdgeInsets.zero,
        leading: Container(width: 36, height: 36, decoration: BoxDecoration(color: const Color(0xFF7C3AED).withValues(alpha: 0.1), borderRadius: BorderRadius.circular(8)), child: const Icon(Icons.receipt_outlined, color: Color(0xFF7C3AED), size: 18)),
        title: Text(m['reference'] ?? '-', style: const TextStyle(fontWeight: FontWeight.w500, fontSize: 14)),
        subtitle: Text(m['partenaire'] ?? '-', style: const TextStyle(fontSize: 11, color: Color(0xFF64748B))),
        trailing: Row(mainAxisSize: MainAxisSize.min, children: [
          Text(_formatCurrency(m['montant_ttc']), style: const TextStyle(fontWeight: FontWeight.w600, fontSize: 13)),
          const SizedBox(width: 8),
          Container(padding: const EdgeInsets.symmetric(horizontal: 6, vertical: 3),
            decoration: BoxDecoration(color: (statusColors[etat] ?? Colors.grey).withValues(alpha: 0.1), borderRadius: BorderRadius.circular(6)),
            child: Text(statusLabels[etat] ?? etat, style: TextStyle(fontSize: 10, color: statusColors[etat] ?? Colors.grey, fontWeight: FontWeight.w600))),
        ]),
      );
    });
  }

  Widget _buildListSection(String title, List items, Widget Function(dynamic, int) builder) {
    if (items.isEmpty) return const SizedBox.shrink();
    return Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
      Padding(padding: const EdgeInsets.only(left: 4, bottom: 10), child: Text(title, style: const TextStyle(fontSize: 11, fontWeight: FontWeight.w600, color: Color(0xFF94A3B8), letterSpacing: 1))),
      Card(margin: EdgeInsets.zero, shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)), elevation: 1,
        child: Padding(padding: const EdgeInsets.symmetric(horizontal: 14), child: Column(children: items.asMap().entries.map((e) => Column(children: [
          if (e.key > 0) const Divider(height: 1),
          builder(e.value, e.key),
        ])).toList())),
      ),
    ]);
  }

  Widget _buildAlertes(List alertes) {
    if (alertes.isEmpty) return const SizedBox.shrink();
    return Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
      const Padding(padding: EdgeInsets.only(left: 4, bottom: 10), child: Text('ALERTES STOCK', style: TextStyle(fontSize: 11, fontWeight: FontWeight.w600, color: Color(0xFF94A3B8), letterSpacing: 1))),
      ...alertes.map((a) {
        final m = a is Map<String, dynamic> ? a : {};
        final isRupture = m['type'] == 'rupture';
        return Container(
          margin: const EdgeInsets.only(bottom: 8),
          padding: const EdgeInsets.all(12),
          decoration: BoxDecoration(
            color: isRupture ? const Color(0xFFFEF2F2) : const Color(0xFFFFFBEB),
            borderRadius: BorderRadius.circular(10),
            border: Border.all(color: isRupture ? const Color(0xFFFECACA) : const Color(0xFFFDE68A)),
          ),
          child: Row(children: [
            Icon(isRupture ? Icons.error_outline : Icons.warning_amber_rounded, color: isRupture ? const Color(0xFFDC2626) : const Color(0xFFD97706), size: 20),
            const SizedBox(width: 10),
            Expanded(child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
              Text('${m['produit'] ?? '-'}', style: const TextStyle(fontWeight: FontWeight.w600, fontSize: 13)),
              Text('${m['message'] ?? ''}', style: TextStyle(fontSize: 11, color: isRupture ? const Color(0xFFDC2626) : const Color(0xFFD97706))),
            ])),
          ]),
        );
      }),
    ]);
  }
}

class _KpiItem {
  final String label, value;
  final IconData icon;
  final Color color;
  _KpiItem(this.label, this.value, this.icon, this.color);
}

class _MiniCard extends StatelessWidget {
  final IconData icon; final String label, value; final Color color;
  const _MiniCard({required this.icon, required this.label, required this.value, required this.color});
  @override
  Widget build(BuildContext context) {
    return Card(shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)), elevation: 1,
      child: Padding(padding: const EdgeInsets.all(14), child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
        Container(padding: const EdgeInsets.all(8), decoration: BoxDecoration(color: color.withValues(alpha: 0.1), borderRadius: BorderRadius.circular(8)), child: Icon(icon, color: color, size: 20)),
        const Spacer(),
        Text(value, style: TextStyle(fontSize: 24, fontWeight: FontWeight.bold, color: color)),
        Text(label, style: const TextStyle(fontSize: 12, color: Color(0xFF64748B))),
      ])),
    );
  }
}
