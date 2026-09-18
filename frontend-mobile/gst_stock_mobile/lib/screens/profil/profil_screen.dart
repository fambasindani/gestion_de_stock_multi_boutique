import 'package:flutter/material.dart';
import 'package:gst_stock_mobile/config/theme.dart';
import 'package:gst_stock_mobile/services/services.dart';
import 'package:gst_stock_mobile/services/api_client.dart';

class ProfilScreen extends StatefulWidget {
  const ProfilScreen({super.key});

  @override
  State<ProfilScreen> createState() => _ProfilScreenState();
}

class _ProfilScreenState extends State<ProfilScreen> {
  final _service = ProfilService();
  final _nom = TextEditingController();
  final _email = TextEditingController();
  final _telephone = TextEditingController();
  final _passActuel = TextEditingController();
  final _passNouveau = TextEditingController();
  final _passConfirm = TextEditingController();

  bool _loading = true;
  bool _saving = false;
  bool _changing = false;

  @override
  void initState() {
    super.initState();
    _load();
  }

  @override
  void dispose() {
    _nom.dispose();
    _email.dispose();
    _telephone.dispose();
    _passActuel.dispose();
    _passNouveau.dispose();
    _passConfirm.dispose();
    super.dispose();
  }

  Future<void> _load() async {
    try {
      final u = await _service.get();
      _nom.text = u.nom;
      _email.text = u.email;
      _telephone.text = u.telephone ?? '';
    } catch (_) {}
    if (mounted) setState(() => _loading = false);
  }

  void _snack(String msg, {bool error = false}) {
    if (!mounted) return;
    ScaffoldMessenger.of(context).showSnackBar(
      SnackBar(content: Text(msg), backgroundColor: error ? Colors.redAccent : AppTheme.primary),
    );
  }

  Future<void> _save() async {
    setState(() => _saving = true);
    try {
      await _service.update({
        'nom': _nom.text.trim(),
        'email': _email.text.trim(),
        'telephone': _telephone.text.trim(),
      });
      _snack('Profil mis à jour');
    } on ApiException catch (e) {
      _snack(e.message, error: true);
    } catch (_) {
      _snack('Erreur lors de la mise à jour', error: true);
    } finally {
      if (mounted) setState(() => _saving = false);
    }
  }

  Future<void> _changePassword() async {
    if (_passNouveau.text.length < 8) {
      _snack('Le mot de passe doit contenir au moins 8 caractères', error: true);
      return;
    }
    if (_passNouveau.text != _passConfirm.text) {
      _snack('Les mots de passe ne correspondent pas', error: true);
      return;
    }
    setState(() => _changing = true);
    try {
      await _service.updatePassword({
        'mot_de_passe_actuel': _passActuel.text,
        'mot_de_passe': _passNouveau.text,
        'mot_de_passe_confirmation': _passConfirm.text,
      });
      _passActuel.clear();
      _passNouveau.clear();
      _passConfirm.clear();
      _snack('Mot de passe modifié');
    } on ApiException catch (e) {
      _snack(e.message, error: true);
    } catch (_) {
      _snack('Erreur lors du changement de mot de passe', error: true);
    } finally {
      if (mounted) setState(() => _changing = false);
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: AppTheme.surface,
      appBar: AppBar(title: const Text('Mon profil')),
      body: _loading
          ? const Center(child: CircularProgressIndicator())
          : ListView(
              padding: const EdgeInsets.all(16),
              children: [
                Card(
                  elevation: 0,
                  shape: RoundedRectangleBorder(
                    borderRadius: BorderRadius.circular(14),
                    side: BorderSide(color: Colors.grey.shade200),
                  ),
                  child: Padding(
                    padding: const EdgeInsets.all(16),
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        const Text('Informations', style: TextStyle(fontWeight: FontWeight.bold, fontSize: 16)),
                        const SizedBox(height: 12),
                        TextField(controller: _nom, decoration: const InputDecoration(labelText: 'Nom')),
                        const SizedBox(height: 12),
                        TextField(controller: _email, keyboardType: TextInputType.emailAddress, decoration: const InputDecoration(labelText: 'Email')),
                        const SizedBox(height: 12),
                        TextField(controller: _telephone, keyboardType: TextInputType.phone, decoration: const InputDecoration(labelText: 'Téléphone')),
                        const SizedBox(height: 16),
                        SizedBox(
                          width: double.infinity,
                          child: ElevatedButton(
                            onPressed: _saving ? null : _save,
                            style: ElevatedButton.styleFrom(backgroundColor: AppTheme.primary, foregroundColor: Colors.white),
                            child: _saving
                                ? const SizedBox(width: 20, height: 20, child: CircularProgressIndicator(strokeWidth: 2.5, color: Colors.white))
                                : const Text('Enregistrer'),
                          ),
                        ),
                      ],
                    ),
                  ),
                ),
                const SizedBox(height: 16),
                Card(
                  elevation: 0,
                  shape: RoundedRectangleBorder(
                    borderRadius: BorderRadius.circular(14),
                    side: BorderSide(color: Colors.grey.shade200),
                  ),
                  child: Padding(
                    padding: const EdgeInsets.all(16),
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        const Text('Changer le mot de passe', style: TextStyle(fontWeight: FontWeight.bold, fontSize: 16)),
                        const SizedBox(height: 12),
                        TextField(controller: _passActuel, obscureText: true, decoration: const InputDecoration(labelText: 'Mot de passe actuel')),
                        const SizedBox(height: 12),
                        TextField(controller: _passNouveau, obscureText: true, decoration: const InputDecoration(labelText: 'Nouveau mot de passe')),
                        const SizedBox(height: 12),
                        TextField(controller: _passConfirm, obscureText: true, decoration: const InputDecoration(labelText: 'Confirmer le mot de passe')),
                        const SizedBox(height: 16),
                        SizedBox(
                          width: double.infinity,
                          child: OutlinedButton(
                            onPressed: _changing ? null : _changePassword,
                            child: _changing
                                ? const SizedBox(width: 20, height: 20, child: CircularProgressIndicator(strokeWidth: 2.5))
                                : const Text('Modifier le mot de passe'),
                          ),
                        ),
                      ],
                    ),
                  ),
                ),
              ],
            ),
    );
  }
}
