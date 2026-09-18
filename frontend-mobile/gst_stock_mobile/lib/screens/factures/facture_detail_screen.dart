import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import 'package:gst_stock_mobile/providers/auth_provider.dart';
import 'package:gst_stock_mobile/utils/assets.dart';
import 'package:gst_stock_mobile/models/models.dart';
import 'package:gst_stock_mobile/services/services.dart';
import 'package:gst_stock_mobile/services/invoice_pdf_generator.dart';
import 'package:gst_stock_mobile/config/theme.dart';
import 'package:gst_stock_mobile/utils/utils.dart';
import 'package:gst_stock_mobile/screens/factures/facture_form_screen.dart';

class FactureDetailScreen extends StatefulWidget {
  final int id;
  const FactureDetailScreen({super.key, required this.id});

  @override
  State<FactureDetailScreen> createState() => _FactureDetailScreenState();
}

class _FactureDetailScreenState extends State<FactureDetailScreen> {
  final _service = FactureService();
  EcritureComptable? _facture;
  bool _loading = true;
  String? _error;

  @override
  void initState() {
    super.initState();
    _load();
  }

  Future<void> _load() async {
    setState(() { _loading = true; _error = null; });
    try {
      final f = await _service.getById(widget.id);
      if (mounted) setState(() => _facture = f);
    } catch (e) {
      if (mounted) setState(() => _error = e.toString());
    } finally {
      if (mounted) setState(() => _loading = false);
    }
  }

  Future<void> _changerStatut(String statut) async {
    try {
      await _service.changerStatut(widget.id, statut);
      await _load();
    } catch (e) {
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(SnackBar(content: Text('Erreur: $e')));
      }
    }
  }

  Future<void> _paiementPartiel() async {
    final montant = _facture!.montantRestant;
    if (montant <= 0) return;
    final ctrl = TextEditingController(text: montant.toStringAsFixed(2));
    final ok = await showDialog<bool>(
      context: context,
      builder: (ctx) => AlertDialog(
        title: const Text('Paiement partiel'),
        content: TextField(controller: ctrl, keyboardType: TextInputType.number, decoration: const InputDecoration(labelText: 'Montant')),
        actions: [
          TextButton(onPressed: () => Navigator.pop(ctx, false), child: const Text('Annuler')),
          TextButton(onPressed: () => Navigator.pop(ctx, true), child: const Text('Payer')),
        ],
      ),
    );
    if (ok == true && mounted) {
      try {
        await _service.paiementPartiel(widget.id, double.tryParse(ctrl.text) ?? montant);
        await _load();
      } catch (e) {
        if (mounted) ScaffoldMessenger.of(context).showSnackBar(SnackBar(content: Text('Erreur: $e')));
      }
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: const Text('Détail facture'),
        actions: [
          if (_facture != null) PopupMenuButton<String>(onSelected: (v) async {
            if (v == 'edit') {
              final ok = await Navigator.push<bool>(context, MaterialPageRoute(builder: (_) => FactureFormScreen(facture: _facture)));
              if (ok == true) _load();
            } else if (v == 'delete') {
              final ok = await showDialog<bool>(context: context, builder: (ctx) => AlertDialog(title: const Text('Confirmation'), content: const Text('Supprimer cette facture ?'), actions: [TextButton(onPressed: () => Navigator.pop(ctx, false), child: const Text('Annuler')), TextButton(onPressed: () => Navigator.pop(ctx, true), child: const Text('Supprimer', style: TextStyle(color: Colors.red)))],));
              if (ok == true && mounted) { try { await _service.delete(widget.id); if (mounted) Navigator.pop(context); } catch (e) { if (mounted) ScaffoldMessenger.of(context).showSnackBar(SnackBar(content: Text('Erreur: $e'))); } }
            }
          }, itemBuilder: (_) => [
            const PopupMenuItem(value: 'edit', child: ListTile(leading: Icon(Icons.edit), title: Text('Modifier'))),
            const PopupMenuItem(value: 'delete', child: ListTile(leading: Icon(Icons.delete, color: Colors.red), title: Text('Supprimer', style: TextStyle(color: Colors.red)))),
          ]),
        ],
      ),
      body: _loading
          ? const Center(child: CircularProgressIndicator())
          : _error != null
              ? Center(child: Text('Erreur: $_error'))
              : _buildContent(),
    );
  }

  Widget _buildContent() {
    final f = _facture!;
    final ratio = f.montantTtc > 0 ? (f.montantPaye / f.montantTtc).clamp(0.0, 1.0) : 0.0;
    return SingleChildScrollView(
      padding: const EdgeInsets.fromLTRB(16, 16, 16, 100),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          _header(f),
          const SizedBox(height: 16),
          _infoRow('Référence', f.reference),
          if (f.numeroFacture != null) _infoRow('N° Facture', f.numeroFacture!),
          _infoRow('Type', f.type),
          _infoRow('Date émission', formatDate(f.dateEmission)),
          if (f.dateEcheance != null) _infoRow('Date échéance', formatDate(f.dateEcheance!)),
          _infoRow('Statut', f.statut, color: getEtatColor(f.statut)),
          if (f.modePaiement != null) _infoRow('Mode paiement', f.modePaiement!),
          const Divider(height: 32),
          Text('Partenaire', style: TextStyle(fontSize: 12, color: Colors.grey[600], fontWeight: FontWeight.w600)),
          const SizedBox(height: 4),
          Text(f.partenaire?.nom ?? 'N/A', style: const TextStyle(fontSize: 16)),
          if (f.partenaire?.email != null) Text(f.partenaire!.email!, style: TextStyle(color: Colors.grey[600])),
          const Divider(height: 32),
          if (f.lignes != null && f.lignes!.isNotEmpty) _buildLignes(f.lignes!),
          const Divider(height: 24),
          _buildTotaux(f),
          const SizedBox(height: 12),
          ClipRRect(borderRadius: BorderRadius.circular(4), child: LinearProgressIndicator(value: ratio, backgroundColor: Colors.grey[200], valueColor: AlwaysStoppedAnimation<Color>(f.montantRestant <= 0 ? Colors.green : Colors.orange), minHeight: 8)),
          const SizedBox(height: 4),
          Text('Payé: ${formatCurrency(f.montantPaye)} / Restant: ${formatCurrency(f.montantRestant)}', style: TextStyle(color: Colors.grey[500], fontSize: 12)),
          const SizedBox(height: 24),
          _buildActions(f),
        ],
      ),
    );
  }

  Widget _header(EcritureComptable f) {
    return Row(children: [
      Container(padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4), decoration: BoxDecoration(color: getEtatColor(f.statut).withValues(alpha: 0.15), borderRadius: BorderRadius.circular(12)), child: Text(f.statut, style: TextStyle(color: getEtatColor(f.statut), fontWeight: FontWeight.w600))),
      const Spacer(),
      Text(formatCurrency(f.montantTtc), style: const TextStyle(fontSize: 22, fontWeight: FontWeight.bold)),
    ]);
  }

  Widget _infoRow(String label, String value, {Color? color}) {
    return Padding(padding: const EdgeInsets.symmetric(vertical: 4), child: Row(children: [Text('$label: ', style: TextStyle(color: Colors.grey[600], fontSize: 13)), Text(value, style: TextStyle(color: color, fontWeight: color != null ? FontWeight.w600 : null))]));
  }

  Widget _buildLignes(List<LigneEcritureComptable> lignes) {
    return Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
      Text('LIGNES', style: TextStyle(fontSize: 12, color: Colors.grey[600], fontWeight: FontWeight.w600)),
      const SizedBox(height: 8),
      ...lignes.map((l) => Card(
        margin: const EdgeInsets.only(bottom: 8),
        child: Padding(padding: const EdgeInsets.all(12), child: Row(children: [
          Expanded(child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
            Text(l.nomProduit ?? 'Produit #${l.produitId}', style: const TextStyle(fontWeight: FontWeight.w500)),
            Text('${l.quantite.toStringAsFixed(2)} x ${formatCurrency(l.prixUnitaireHt)}', style: TextStyle(color: Colors.grey[600], fontSize: 12)),
          ])),
          Text(formatCurrency(l.montantHt), style: const TextStyle(fontWeight: FontWeight.w600)),
        ])),
      )),
    ]);
  }

  Widget _buildTotaux(EcritureComptable f) {
    return Column(children: [
      _totalRow('HT', f.montantHt),
      if (f.montantTva != null) _totalRow('TVA', f.montantTva!),
      _totalRow('TTC', f.montantTtc, bold: true),
    ]);
  }

  Widget _totalRow(String label, double amount, {bool bold = false}) {
    return Padding(padding: const EdgeInsets.symmetric(vertical: 2), child: Row(mainAxisAlignment: MainAxisAlignment.spaceBetween, children: [
      Text(label, style: TextStyle(fontWeight: bold ? FontWeight.w600 : null, color: Colors.grey[700])),
      Text(formatCurrency(amount), style: TextStyle(fontWeight: bold ? FontWeight.bold : FontWeight.w500)),
    ]));
  }

  bool _pdfLoading = false;

  Future<void> _downloadPdf() async {
    if (_facture == null) return;
    setState(() => _pdfLoading = true);
    try {
      final societe = context.read<AuthProvider>().societe;
      await InvoicePdfGenerator.download(
        _facture!,
        societeNom: societe?.nom,
        logoUrl: boutiqueLogoUrl(societe),
      );
    } catch (e) {
      if (mounted) ScaffoldMessenger.of(context).showSnackBar(SnackBar(content: Text('Erreur PDF: $e')));
    } finally {
      if (mounted) setState(() => _pdfLoading = false);
    }
  }

  Widget _buildActions(EcritureComptable f) {
    // Transitions : une facture validée ne s'annule pas (on émet un avoir).
    const nextStatut = <String, String>{
      'brouillon': 'validee',
      'validee': 'envoyee',
      'envoyee': 'payee',
    };
    const labels = <String, String>{
      'validee': 'Valider',
      'envoyee': 'Envoyer',
      'payee': 'Marquer payée',
    };
    final next = nextStatut[f.statut];
    return Column(crossAxisAlignment: CrossAxisAlignment.stretch, children: [
      ElevatedButton.icon(
        onPressed: _pdfLoading ? null : _downloadPdf,
        icon: _pdfLoading
            ? const SizedBox(width: 18, height: 18, child: CircularProgressIndicator(strokeWidth: 2, color: Colors.white))
            : const Icon(Icons.picture_as_pdf, size: 20),
        label: Text(_pdfLoading ? 'Génération...' : 'Télécharger PDF'),
        style: ElevatedButton.styleFrom(backgroundColor: AppTheme.danger, foregroundColor: Colors.white),
      ),
      const SizedBox(height: 8),
      if (f.montantRestant > 0) Padding(padding: const EdgeInsets.only(bottom: 8), child: ElevatedButton.icon(icon: const Icon(Icons.payment), label: const Text('Enregistrer un paiement'), onPressed: _paiementPartiel)),
      if (next != null)
        OutlinedButton(onPressed: () => _changerStatut(next), child: Text(labels[next] ?? 'Passer à "$next"')),
      if (f.statut == 'brouillon')
        TextButton.icon(icon: const Icon(Icons.delete, color: Colors.red), label: const Text('Supprimer', style: TextStyle(color: Colors.red)), onPressed: () async {
          final ok = await showDialog<bool>(context: context, builder: (ctx) => AlertDialog(title: const Text('Confirmation'), content: const Text('Supprimer cette facture ?'), actions: [TextButton(onPressed: () => Navigator.pop(ctx, false), child: const Text('Annuler')), TextButton(onPressed: () => Navigator.pop(ctx, true), child: const Text('Supprimer', style: TextStyle(color: Colors.red)))],));
          if (ok == true && mounted) {
            try { await _service.delete(widget.id); if (mounted) Navigator.pop(context); } catch (e) { if (mounted) ScaffoldMessenger.of(context).showSnackBar(SnackBar(content: Text('Erreur: $e'))); }
          }
        }),
    ]);
  }
}