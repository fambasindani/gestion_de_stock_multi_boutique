import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import 'package:gst_stock_mobile/providers/auth_provider.dart';
import 'package:gst_stock_mobile/screens/stock/transferts_screen.dart';
import 'package:gst_stock_mobile/screens/rapports/rapports_screen.dart';
import 'package:gst_stock_mobile/screens/partenaires/partenaires_list_screen.dart';
import 'package:gst_stock_mobile/screens/plus/utilisateurs_screen.dart';
import 'package:gst_stock_mobile/screens/plus/emplacements_screen.dart';
import 'package:gst_stock_mobile/screens/plus/roles_screen.dart';
import 'package:gst_stock_mobile/screens/plus/permissions_screen.dart';

class PlusScreen extends StatelessWidget {
  const PlusScreen({super.key});

  @override
  Widget build(BuildContext context) {
    final auth = context.watch<AuthProvider>();
    final user = auth.user;

    // Menu filtré selon les permissions de l'utilisateur (le super-admin voit tout)
    final canPartenaires = auth.hasPermission('voir_partenaires');
    final canTransferts = auth.hasAny(['transferer_stock', 'valider_transferts']);
    final canRapports = auth.hasPermission('voir_rapports');
    final canUtilisateurs = auth.hasPermission('gerer_utilisateurs');
    final canRoles = auth.hasAny(['gerer_roles', 'assigner_roles']);
    final canPermissions = auth.hasAny(['gerer_permissions', 'gerer_roles']);
    final canEmplacements = auth.hasAny(['voir_emplacements', 'gerer_emplacements']);
    final hasGestion = canPartenaires || canTransferts || canRapports;
    final hasAdmin = canUtilisateurs || canRoles || canPermissions || canEmplacements;

    return ListView(
      padding: const EdgeInsets.all(16),
      children: [
          if (user != null) ...[
            Row(
              children: [
                CircleAvatar(
                  radius: 28,
                  backgroundColor: Colors.blue[100],
                  child: Text(
                    user.nom.isNotEmpty ? user.nom[0].toUpperCase() : '?',
                    style: const TextStyle(fontSize: 24, fontWeight: FontWeight.bold, color: Colors.blue),
                  ),
                ),
                const SizedBox(width: 16),
                Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(user.nom, style: const TextStyle(fontSize: 18, fontWeight: FontWeight.bold)),
                    if (user.email.isNotEmpty)
                      Text(user.email, style: TextStyle(color: Colors.grey[600], fontSize: 14)),
                  ],
                ),
              ],
            ),
            const SizedBox(height: 24),
          ],
          if (hasGestion) ...[
            _sectionTitle('Gestion'),
            const SizedBox(height: 8),
            if (canPartenaires) ...[
              _menuCard(
                context,
                icon: Icons.people_outline,
                title: 'Partenaires',
                onTap: () => Navigator.push(context, MaterialPageRoute(builder: (_) => const PartenairesListScreen())),
              ),
              const SizedBox(height: 8),
            ],
            if (canTransferts) ...[
              _menuCard(
                context,
                icon: Icons.swap_horiz,
                title: 'Transferts',
                onTap: () => Navigator.push(context, MaterialPageRoute(builder: (_) => const TransfertsScreen())),
              ),
              const SizedBox(height: 8),
            ],
            if (canRapports)
              _menuCard(
                context,
                icon: Icons.assessment_outlined,
                title: 'Rapports',
                onTap: () => Navigator.push(context, MaterialPageRoute(builder: (_) => const RapportsScreen())),
              ),
            const SizedBox(height: 24),
          ],
          if (hasAdmin) ...[
            _sectionTitle('Administration'),
            const SizedBox(height: 8),
            if (canUtilisateurs) ...[
              _menuCard(
                context,
                icon: Icons.person_outline,
                title: 'Utilisateurs',
                onTap: () => Navigator.push(context, MaterialPageRoute(builder: (_) => const UtilisateursScreen())),
              ),
              const SizedBox(height: 8),
            ],
            if (canRoles) ...[
              _menuCard(
                context,
                icon: Icons.shield_outlined,
                title: 'Rôles',
                onTap: () => Navigator.push(context, MaterialPageRoute(builder: (_) => const RolesScreen())),
              ),
              const SizedBox(height: 8),
            ],
            if (canPermissions) ...[
              _menuCard(
                context,
                icon: Icons.vpn_key_outlined,
                title: 'Permissions',
                onTap: () => Navigator.push(context, MaterialPageRoute(builder: (_) => const PermissionsScreen())),
              ),
              const SizedBox(height: 8),
            ],
            if (canEmplacements)
              _menuCard(
                context,
                icon: Icons.location_on_outlined,
                title: 'Emplacements',
                onTap: () => Navigator.push(context, MaterialPageRoute(builder: (_) => const EmplacementsScreen())),
              ),
            const SizedBox(height: 24),
          ],
          if (!hasGestion && !hasAdmin)
            Container(
              padding: const EdgeInsets.all(16),
              margin: const EdgeInsets.only(bottom: 16),
              decoration: BoxDecoration(
                color: Colors.orange.withValues(alpha: 0.1),
                borderRadius: BorderRadius.circular(12),
              ),
              child: const Text(
                "Aucune rubrique d'administration disponible pour votre compte. Demandez à un responsable de vous attribuer un rôle.",
                style: TextStyle(fontSize: 13),
              ),
            ),
          _sectionTitle('Compte'),
          const SizedBox(height: 8),
          SizedBox(
            width: double.infinity,
            child: ElevatedButton.icon(
              onPressed: () async {
                await auth.logout();
              },
              icon: const Icon(Icons.logout),
              label: const Text('Se déconnecter'),
              style: ElevatedButton.styleFrom(
                backgroundColor: Colors.red,
                foregroundColor: Colors.white,
                padding: const EdgeInsets.symmetric(vertical: 14),
              ),
            ),
          ),
      ],
    );
  }

  Widget _sectionTitle(String title) {
    return Padding(
      padding: const EdgeInsets.only(left: 4),
      child: Text(title,
          style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 14, color: Colors.grey)),
    );
  }

  Widget _menuCard(BuildContext context,
      {required IconData icon, required String title, Widget? trailing, required VoidCallback onTap}) {
    return Card(
      child: ListTile(
        leading: Icon(icon, color: Colors.blue[700]),
        title: Text(title, style: const TextStyle(fontWeight: FontWeight.w600)),
        trailing: trailing ?? const Icon(Icons.chevron_right),
        onTap: onTap,
        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
      ),
    );
  }
}
