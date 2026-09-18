import 'package:flutter/material.dart';
import 'package:image_picker/image_picker.dart';
import 'package:gst_stock_mobile/config/theme.dart';
import 'package:gst_stock_mobile/services/services.dart';
import 'package:gst_stock_mobile/services/api_client.dart';

class ParametresScreen extends StatefulWidget {
  const ParametresScreen({super.key});

  @override
  State<ParametresScreen> createState() => _ParametresScreenState();
}

class _ParametresScreenState extends State<ParametresScreen> {
  final _service = ParametreService();
  final _tva = TextEditingController();
  final _devise = TextEditingController();
  final _nom = TextEditingController();
  final _adresse = TextEditingController();
  final _telephone = TextEditingController();
  final _message = TextEditingController();

  bool _loading = true;
  bool _saving = false;
  bool _uploading = false;

  @override
  void initState() {
    super.initState();
    _load();
  }

  @override
  void dispose() {
    _tva.dispose();
    _devise.dispose();
    _nom.dispose();
    _adresse.dispose();
    _telephone.dispose();
    _message.dispose();
    super.dispose();
  }

  Future<void> _load() async {
    try {
      final p = await _service.getAll();
      _tva.text = '${p['tva_taux'] ?? ''}';
      _devise.text = '${p['devise'] ?? ''}';
      _nom.text = '${p['entreprise_nom'] ?? ''}';
      _adresse.text = '${p['entreprise_adresse'] ?? ''}';
      _telephone.text = '${p['entreprise_telephone'] ?? ''}';
      _message.text = '${p['ticket_message'] ?? ''}';
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
        'tva_taux': _tva.text.trim(),
        'devise': _devise.text.trim(),
        'entreprise_nom': _nom.text.trim(),
        'entreprise_adresse': _adresse.text.trim(),
        'entreprise_telephone': _telephone.text.trim(),
        'ticket_message': _message.text.trim(),
      });
      _snack('Paramètres enregistrés');
    } on ApiException catch (e) {
      _snack(e.message, error: true);
    } catch (_) {
      _snack('Erreur lors de l\'enregistrement', error: true);
    } finally {
      if (mounted) setState(() => _saving = false);
    }
  }

  Future<void> _pickLogo() async {
    final picker = ImagePicker();
    final file = await picker.pickImage(source: ImageSource.gallery, imageQuality: 90);
    if (file == null) return;
    setState(() => _uploading = true);
    try {
      await _service.uploadLogo(file.path);
      _snack('Logo mis à jour');
    } on ApiException catch (e) {
      _snack(e.message, error: true);
    } catch (_) {
      _snack('Erreur lors de l\'upload du logo', error: true);
    } finally {
      if (mounted) setState(() => _uploading = false);
    }
  }

  Future<void> _deleteLogo() async {
    setState(() => _uploading = true);
    try {
      await _service.deleteLogo();
      _snack('Logo supprimé');
    } catch (_) {
      _snack('Erreur lors de la suppression', error: true);
    } finally {
      if (mounted) setState(() => _uploading = false);
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: AppTheme.surface,
      appBar: AppBar(
        title: const Text('Paramètres'),
        actions: [
          IconButton(
            icon: const Icon(Icons.save),
            tooltip: 'Enregistrer',
            onPressed: _saving ? null : _save,
          ),
        ],
      ),
      body: _loading
          ? const Center(child: CircularProgressIndicator())
          : ListView(
              padding: const EdgeInsets.all(16),
              children: [
                Card(
                  elevation: 0,
                  shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(14), side: BorderSide(color: Colors.grey.shade200)),
                  child: Padding(
                    padding: const EdgeInsets.all(16),
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        const Text('Logo de la boutique', style: TextStyle(fontWeight: FontWeight.bold, fontSize: 16)),
                        const SizedBox(height: 12),
                        Row(
                          children: [
                            ElevatedButton.icon(
                              onPressed: _uploading ? null : _pickLogo,
                              icon: _uploading ? const SizedBox(width: 16, height: 16, child: CircularProgressIndicator(strokeWidth: 2)) : const Icon(Icons.upload),
                              label: const Text('Choisir une image'),
                              style: ElevatedButton.styleFrom(backgroundColor: AppTheme.primary, foregroundColor: Colors.white),
                            ),
                            const SizedBox(width: 10),
                            OutlinedButton.icon(
                              onPressed: _uploading ? null : _deleteLogo,
                              icon: const Icon(Icons.delete_outline),
                              label: const Text('Supprimer'),
                            ),
                          ],
                        ),
                        const SizedBox(height: 6),
                        Text('Affiché dans le menu, les tickets et les factures.', style: TextStyle(color: Colors.grey[500], fontSize: 12)),
                      ],
                    ),
                  ),
                ),
                const SizedBox(height: 16),
                Card(
                  elevation: 0,
                  shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(14), side: BorderSide(color: Colors.grey.shade200)),
                  child: Padding(
                    padding: const EdgeInsets.all(16),
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        const Text('TVA & devise', style: TextStyle(fontWeight: FontWeight.bold, fontSize: 16)),
                        const SizedBox(height: 12),
                        TextField(controller: _tva, keyboardType: TextInputType.number, decoration: const InputDecoration(labelText: 'Taux de TVA par défaut (%)')),
                        const SizedBox(height: 12),
                        TextField(controller: _devise, decoration: const InputDecoration(labelText: 'Devise (CDF, EUR, USD...)')),
                      ],
                    ),
                  ),
                ),
                const SizedBox(height: 16),
                Card(
                  elevation: 0,
                  shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(14), side: BorderSide(color: Colors.grey.shade200)),
                  child: Padding(
                    padding: const EdgeInsets.all(16),
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        const Text('Informations société (ticket)', style: TextStyle(fontWeight: FontWeight.bold, fontSize: 16)),
                        const SizedBox(height: 12),
                        TextField(controller: _nom, decoration: const InputDecoration(labelText: 'Nom affiché')),
                        const SizedBox(height: 12),
                        TextField(controller: _adresse, decoration: const InputDecoration(labelText: 'Adresse')),
                        const SizedBox(height: 12),
                        TextField(controller: _telephone, decoration: const InputDecoration(labelText: 'Téléphone')),
                        const SizedBox(height: 12),
                        TextField(controller: _message, decoration: const InputDecoration(labelText: 'Message bas de ticket'), maxLines: 2),
                      ],
                    ),
                  ),
                ),
                const SizedBox(height: 20),
                SizedBox(
                  height: 48,
                  child: ElevatedButton(
                    onPressed: _saving ? null : _save,
                    style: ElevatedButton.styleFrom(backgroundColor: AppTheme.primary, foregroundColor: Colors.white),
                    child: _saving
                        ? const SizedBox(width: 22, height: 22, child: CircularProgressIndicator(color: Colors.white, strokeWidth: 2.5))
                        : const Text('Enregistrer'),
                  ),
                ),
              ],
            ),
    );
  }
}
