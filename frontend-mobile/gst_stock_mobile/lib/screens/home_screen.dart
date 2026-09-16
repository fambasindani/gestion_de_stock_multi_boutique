import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import 'package:gst_stock_mobile/providers/auth_provider.dart';
import 'package:gst_stock_mobile/config/theme.dart';
import 'dashboard/dashboard_screen.dart';
import 'produits/produits_list_screen.dart';
import 'commandes/ventes_list_screen.dart' as cmd;
import 'stock/stock_list_screen.dart';
import 'stock/transferts_screen.dart';
import 'partenaires/partenaires_list_screen.dart';
import 'factures/factures_list_screen.dart';
import 'rapports/rapports_screen.dart';
import 'plus/plus_screen.dart';

class HomeScreen extends StatefulWidget {
  const HomeScreen({super.key});

  @override
  State<HomeScreen> createState() => _HomeScreenState();
}

class _HomeScreenState extends State<HomeScreen> {
  int _currentIndex = 0;
  final GlobalKey<ScaffoldState> _scaffoldKey = GlobalKey<ScaffoldState>();

  final List<Widget> _screens = [
    const DashboardScreen(),
    const ProduitsListScreen(),
    const cmd.CommandesListScreen(),
    const StockListScreen(),
    const PlusScreen(),
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
        ),
        body: _screens[_currentIndex],
        bottomNavigationBar: BottomNavigationBar(
          currentIndex: _currentIndex,
          onTap: (i) => setState(() => _currentIndex = i),
          items: const [
            BottomNavigationBarItem(icon: Icon(Icons.dashboard_rounded), label: 'Dashboard'),
            BottomNavigationBarItem(icon: Icon(Icons.inventory_2_rounded), label: 'Produits'),
            BottomNavigationBarItem(icon: Icon(Icons.receipt_long_rounded), label: 'Commandes'),
            BottomNavigationBarItem(icon: Icon(Icons.warehouse_rounded), label: 'Stock'),
            BottomNavigationBarItem(icon: Icon(Icons.more_horiz_rounded), label: 'Plus'),
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
                Expanded(
                  child: ListView(
                    padding: EdgeInsets.zero,
                    children: [
                      _sectionHeader('PRINCIPAL'),
                      _drawerItem(Icons.dashboard_rounded, 'Dashboard', () => _navigateTo(0), index: 0),
                      _drawerItem(Icons.inventory_2_rounded, 'Produits', () => _navigateTo(1), index: 1),
                      _drawerItem(Icons.receipt_long_rounded, 'Commandes', () => _navigateTo(2), index: 2),
                      _drawerItem(Icons.warehouse_rounded, 'Stock', () => _navigateTo(3), index: 3),
                      Divider(color: AppTheme.sidebarBorder, height: 1, thickness: 1),
                      _sectionHeader('GESTION'),
                      _drawerItem(Icons.people_rounded, 'Partenaires', () => _pushScreen(const PartenairesListScreen())),
                      _drawerItem(Icons.description_rounded, 'Factures', () => _pushScreen(const FacturesListScreen())),
                      _drawerItem(Icons.swap_horiz_rounded, 'Transferts', () => _pushScreen(const TransfertsScreen())),
                      _drawerItem(Icons.bar_chart_rounded, 'Rapports', () => _pushScreen(const RapportsScreen())),
                      Divider(color: AppTheme.sidebarBorder, height: 1, thickness: 1),
                      _sectionHeader('COMPTE'),
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
