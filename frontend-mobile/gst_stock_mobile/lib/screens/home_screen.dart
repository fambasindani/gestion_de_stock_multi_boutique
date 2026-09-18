import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import 'package:gst_stock_mobile/providers/auth_provider.dart';
import 'package:gst_stock_mobile/config/theme.dart';
import 'package:gst_stock_mobile/models/models.dart';
import 'package:gst_stock_mobile/services/services.dart';
import 'dashboard/dashboard_screen.dart';
import 'produits/produits_list_screen.dart';
import 'commandes/ventes_list_screen.dart' as cmd;
import 'stock/stock_list_screen.dart';
import 'stock/transferts_screen.dart';
import 'partenaires/partenaires_list_screen.dart';
import 'factures/factures_list_screen.dart';
import 'rapports/rapports_screen.dart';
import 'plus/plus_screen.dart';
import 'pos/pos_screen.dart';
import 'profil/profil_screen.dart';
import 'retours/retours_screen.dart';
import 'inventaire/inventaires_screen.dart';
import 'parametres/parametres_screen.dart';
import 'produits/categories_screen.dart';
import 'produits/unites_screen.dart';
import 'achats/receptions_screen.dart';
import 'recherche/recherche_screen.dart';
import 'societes/societes_screen.dart';
import 'package:gst_stock_mobile/widgets/notification_bell.dart';

class HomeScreen extends StatefulWidget {
  const HomeScreen({super.key});

  @override
  State<HomeScreen> createState() => _HomeScreenState();
}

class _HomeScreenState extends State<HomeScreen> {
  int _currentIndex = 0;
  final GlobalKey<ScaffoldState> _scaffoldKey = GlobalKey<ScaffoldState>();

  static const List<_TabDef> _allTabs = [
    _TabDef(null, Icons.dashboard_rounded, 'Dashboard', DashboardScreen()),
    _TabDef('voir_produits', Icons.inventory_2_rounded, 'Produits', ProduitsListScreen()),
    _TabDef('voir_commandes', Icons.receipt_long_rounded, 'Commandes', cmd.CommandesListScreen()),
    _TabDef('voir_stock', Icons.warehouse_rounded, 'Stock', StockListScreen()),
    _TabDef(null, Icons.more_horiz_rounded, 'Plus', PlusScreen()),
  ];

  void _navigateTo(int index) {
    setState(() => _currentIndex = index);
    Navigator.pop(context);
  }

  void _pushScreen(Widget screen) {
    Navigator.pop(context);
    Navigator.of(context).push(MaterialPageRoute(builder: (_) => screen));
  }

  @override
  Widget build(BuildContext context) {
    final auth = context.watch<AuthProvider>();

    // Onglets visibles selon les permissions de l'utilisateur
    final tabs = _allTabs
        .where((t) => t.permission == null || auth.hasPermission(t.permission!))
        .toList();
    final index = _currentIndex < tabs.length ? _currentIndex : 0;

    return PopScope(
      canPop: false,
      onPopInvokedWithResult: (didPop, _) async {
        if (didPop) return;
        if (_currentIndex != 0) {
          setState(() => _currentIndex = 0);
        } else {
          final shouldPop = await showDialog<bool>(
            context: context,
            builder: (ctx) => AlertDialog(
              title: const Text('Quitter'),
              content: const Text('Voulez-vous vraiment quitter ?'),
              actions: [
                TextButton(onPressed: () => Navigator.pop(ctx, false), child: const Text('Non')),
                TextButton(onPressed: () => Navigator.pop(ctx, true), child: const Text('Oui')),
              ],
            ),
          );
          if (shouldPop == true && context.mounted) {
            Navigator.of(context).pop();
          }
        }
      },
      child: Scaffold(
        key: _scaffoldKey,
        backgroundColor: AppTheme.surface,
        appBar: AppBar(
          title: const Text('GS Stock'),
          leading: IconButton(
            icon: const Icon(Icons.menu),
            onPressed: () => _scaffoldKey.currentState?.openDrawer(),
            tooltip: 'Menu',
          ),
          actions: [
            IconButton(
              icon: const Icon(Icons.search),
              tooltip: 'Recherche',
              onPressed: () => _pushScreen(const RechercheScreen()),
            ),
            const NotificationBell(),
            const SizedBox(width: 4),
          ],
        ),
        body: tabs[index].screen,
        bottomNavigationBar: BottomNavigationBar(
          currentIndex: index,
          onTap: (i) => setState(() => _currentIndex = i),
          items: [
            for (final t in tabs)
              BottomNavigationBarItem(icon: Icon(t.icon), label: t.label),
          ],
        ),
        drawer: Drawer(
          child: Container(
            color: AppTheme.sidebarBg,
            child: Column(
              children: [
                Container(
                  color: AppTheme.sidebarBg,
                  child: SafeArea(
                    child: Padding(
                      padding: const EdgeInsets.fromLTRB(16, 16, 16, 16),
                      child: Row(children: [
                        ClipRRect(
                          borderRadius: BorderRadius.circular(8),
                          child: Image.asset('assets/images/logo.png', width: 40, height: 40, fit: BoxFit.cover),
                        ),
                        const SizedBox(width: 10),
                        Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
                          Row(children: [
                            Text('GS', style: TextStyle(color: AppTheme.primary, fontWeight: FontWeight.bold, fontSize: 18)),
                            const SizedBox(width: 2),
                            const Text('Stock', style: TextStyle(color: Colors.white, fontWeight: FontWeight.bold, fontSize: 18)),
                          ]),
                          Text('Gestion de stock', style: TextStyle(color: AppTheme.sidebarText, fontSize: 11)),
                        ]),
                      ]),
                    ),
                  ),
                ),
                if (auth.estSuperAdmin) _societeSelector(auth),
                Expanded(
                  child: ListView(
                    padding: EdgeInsets.zero,
                    children: [
                      _sectionHeader('PRINCIPAL'),
                      for (var i = 0; i < tabs.length - 1; i++)
                        _drawerItem(tabs[i].icon, tabs[i].label, () => _navigateTo(i), index: i),
                      Divider(color: AppTheme.sidebarBorder, height: 1, thickness: 1),
                      _sectionHeader('GESTION'),
                      if (auth.hasPermission('vendre_pos'))
                        _drawerItem(Icons.point_of_sale_rounded, 'Vente comptoir (POS)', () => _pushScreen(const PosScreen())),
                      if (auth.hasPermission('voir_partenaires'))
                        _drawerItem(Icons.people_rounded, 'Partenaires', () => _pushScreen(const PartenairesListScreen())),
                      if (auth.hasPermission('gerer_achats'))
                        _drawerItem(Icons.inventory_rounded, 'Réceptions', () => _pushScreen(const ReceptionsScreen())),
                      if (auth.hasPermission('voir_categories'))
                        _drawerItem(Icons.category_rounded, 'Catégories', () => _pushScreen(const CategoriesScreen())),
                      if (auth.hasPermission('voir_unites'))
                        _drawerItem(Icons.straighten_rounded, 'Unités de mesure', () => _pushScreen(const UnitesScreen())),
                      if (auth.hasPermission('voir_factures'))
                        _drawerItem(Icons.description_rounded, 'Factures', () => _pushScreen(const FacturesListScreen())),
                      if (auth.estSuperAdmin)
                        _drawerItem(Icons.business_rounded, 'Sociétés', () => _pushScreen(const SocietesScreen())),
                      if (auth.hasAny(['transferer_stock', 'valider_transferts']))
                        _drawerItem(Icons.swap_horiz_rounded, 'Transferts', () => _pushScreen(const TransfertsScreen())),
                      if (auth.hasPermission('voir_retours'))
                        _drawerItem(Icons.assignment_return_rounded, 'Retours', () => _pushScreen(const RetoursScreen())),
                      if (auth.hasPermission('voir_inventaire'))
                        _drawerItem(Icons.fact_check_rounded, 'Inventaires', () => _pushScreen(const InventairesScreen())),
                      if (auth.hasPermission('voir_rapports'))
                        _drawerItem(Icons.bar_chart_rounded, 'Rapports', () => _pushScreen(const RapportsScreen())),
                      if (auth.hasPermission('gerer_parametres'))
                        _drawerItem(Icons.settings_rounded, 'Paramètres', () => _pushScreen(const ParametresScreen())),
                      Divider(color: AppTheme.sidebarBorder, height: 1, thickness: 1),
                      _sectionHeader('COMPTE'),
                      _drawerItem(Icons.person_rounded, 'Mon profil', () => _pushScreen(const ProfilScreen())),
                      _drawerItem(Icons.logout_rounded, 'Déconnexion', () {
                        Navigator.pop(context);
                        showDialog(
                          context: context,
                          builder: (ctx) => AlertDialog(
                            title: const Text('Déconnexion'),
                            content: const Text('Voulez-vous vraiment vous déconnecter ?'),
                            actions: [
                              TextButton(onPressed: () => Navigator.pop(ctx), child: const Text('Annuler')),
                              TextButton(
                                onPressed: () {
                                  Navigator.pop(ctx);
                                  auth.logout();
                                },
                                child: const Text('Déconnexion', style: TextStyle(color: Colors.red)),
                              ),
                            ],
                          ),
                        );
                      }),
                    ],
                  ),
                ),
                SafeArea(
                  bottom: true,
                  child: Container(
                    padding: const EdgeInsets.fromLTRB(14, 14, 14, 20),
                    decoration: BoxDecoration(
                      border: Border(top: BorderSide(color: AppTheme.sidebarBorder)),
                      color: AppTheme.sidebarHover,
                    ),
                    child: Row(children: [
                      CircleAvatar(radius: 20, backgroundColor: AppTheme.primary,
                        child: Text((auth.user?.nom ?? 'U').substring(0, 1).toUpperCase(), style: const TextStyle(fontSize: 18, color: Colors.white, fontWeight: FontWeight.bold))),
                      const SizedBox(width: 12),
                      Expanded(child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
                        Text(auth.user?.nom ?? 'Utilisateur', style: const TextStyle(color: Colors.white, fontSize: 16, fontWeight: FontWeight.w700)),
                        Text(auth.user?.email ?? '', style: TextStyle(color: Colors.white70, fontSize: 12)),
                      ])),
                    ]),
                  ),
                ),
              ],
            ),
          ),
        ),
      ),
    );
  }

  Widget _societeSelector(AuthProvider auth) {
    return Container(
      padding: const EdgeInsets.fromLTRB(16, 4, 16, 12),
      child: FutureBuilder<List<Societe>>(
        future: SocieteService().getAll(),
        builder: (context, snapshot) {
          final societes = snapshot.data ?? [];
          final value = auth.selectedSocieteId?.toString() ?? '';
          return DropdownButtonFormField<String>(
            initialValue: value,
            dropdownColor: AppTheme.sidebarBg,
            style: const TextStyle(color: Colors.white, fontSize: 14),
            decoration: InputDecoration(
              labelText: 'Société ciblée',
              labelStyle: TextStyle(color: AppTheme.sidebarText),
              isDense: true,
              filled: true,
              fillColor: AppTheme.sidebarHover,
              border: OutlineInputBorder(borderRadius: BorderRadius.circular(8), borderSide: BorderSide.none),
            ),
            items: [
              const DropdownMenuItem(value: '', child: Text('Toutes les sociétés')),
              ...societes.map((s) => DropdownMenuItem(value: s.id.toString(), child: Text(s.nom))),
            ],
            onChanged: (v) async {
              await auth.setSelectedSociete(v);
              if (context.mounted) {
                ScaffoldMessenger.of(context).showSnackBar(
                  const SnackBar(content: Text('Société sélectionnée. Rouvrez les écrans pour rafraîchir.')),
                );
              }
            },
          );
        },
      ),
    );
  }

  Widget _sectionHeader(String title) {
    return Padding(
      padding: const EdgeInsets.fromLTRB(16, 20, 16, 6),
      child: Text(title, style: TextStyle(fontSize: 11, fontWeight: FontWeight.w600, color: AppTheme.sidebarText, letterSpacing: 1)),
    );
  }

  Widget _drawerItem(IconData icon, String label, VoidCallback onTap, {int? index}) {
    final isActive = index != null && _currentIndex == index;
    return Container(
      margin: const EdgeInsets.symmetric(horizontal: 8, vertical: 1),
      decoration: BoxDecoration(
        color: isActive ? AppTheme.sidebarHover : Colors.transparent,
        borderRadius: BorderRadius.circular(6),
      ),
      child: ListTile(
        leading: Icon(icon, color: isActive ? AppTheme.sidebarTextActive : AppTheme.sidebarText, size: 20),
        title: Text(label, style: TextStyle(color: isActive ? AppTheme.sidebarTextActive : AppTheme.sidebarText, fontSize: 14, fontWeight: isActive ? FontWeight.w600 : FontWeight.normal)),
        onTap: onTap,
        dense: true,
        contentPadding: const EdgeInsets.symmetric(horizontal: 12),
      ),
    );
  }
}

class _TabDef {
  final String? permission;
  final IconData icon;
  final String label;
  final Widget screen;
  const _TabDef(this.permission, this.icon, this.label, this.screen);
}
