import 'package:flutter/material.dart';
import 'package:gst_stock_mobile/models/models.dart';
import 'package:gst_stock_mobile/services/services.dart';
import 'package:gst_stock_mobile/utils/utils.dart';
import 'package:gst_stock_mobile/screens/stock/transfert_form_screen.dart';

class TransfertDetailScreen extends StatefulWidget {
  final int id;
  const TransfertDetailScreen({super.key, required this.id});

  @override
  State<TransfertDetailScreen> createState() => _TransfertDetailScreenState();
}

class _TransfertDetailScreenState extends State<TransfertDetailScreen> {
  TransfertStock? _transfert;
  bool _loading = true;
  String? _error;
  bool _deleting = false;

  @override
  void initState() {
    super.initState();
    _load();
  }

  Future<void> _load() async {
    setState(() { _loading = true; _error = null; });
    try {
      final t = await StockService().getTransfert(widget.id);
      if (!mounted) return;
      setState(() { _transfert = t; _loading = false; });
    } catch (e) {
      if (!mounted) return;
      setState(() { _error = e.toString(); _loading = false; });
    }
  }

  Future<void> _edit() async {
    final ok = await Navigator.push<bool>(context, MaterialPageRoute(builder: (_) => TransfertFormScreen(transfert: _transfert)));
    if (ok == true) _load();
  }

  Future<void> _delete() async {
    final confirm = await showDialog<bool>(context: context, builder: (ctx) => AlertDialog(
      title: const Text('Confirmer'),
      content: Text('Supprimer ${_transfert!.reference} ?'),
      actions: [
        TextButton(onPressed: () => Navigator.pop(ctx, false), child: const Text('Annuler')),
        TextButton(onPressed: () => Navigator.pop(ctx, true), child: const Text('Supprimer', style: TextStyle(color: Colors.red))),
      ],
    ));
    if (confirm != true) return;
    setState(() => _deleting = true);
    try {
      await StockService().deleteTransfert(widget.id);
      if (mounted) Navigator.pop(context, true);
    } catch (e) {
      if (mounted) ScaffoldMessenger.of(context).showSnackBar(SnackBar(content: Text('Erreur: $e')));
    } finally { if (mounted) setState(() => _deleting = false); }
  }

  Future<void> _changerEtat(String etat) async {
    try {
      await StockService().changerEtatTransfert(widget.id, etat);
      _load();
    } catch (e) {
      if (mounted) ScaffoldMessenger.of(context).showSnackBar(SnackBar(content: Text('Erreur: $e')));
    }
  }

  Future<void> _valider() async {
    try {
      await StockService().validerTransfert(widget.id);
      _load();
    } catch (e) {
      if (mounted) ScaffoldMessenger.of(context).showSnackBar(SnackBar(content: Text('Erreur: $e')));
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: Text(_transfert?.reference ?? 'Transfert #${widget.id}'),
        actions: [
          if (_transfert != null) PopupMenuButton<String>(onSelected: (v) {
            switch (v) {
              case 'edit': _edit();
              case 'delete': _delete();
              case 'confirme': _changerEtat('confirme');
              case 'assigne': _changerEtat('assigne');
              case 'annule': _changerEtat('annule');
              case 'valider': _valider();
            }
          }, itemBuilder: (ctx) => [
            const PopupMenuItem(value: 'edit', child: ListTile(leading: Icon(Icons.edit), title: Text('Modifier'), dense: true)),
            if (_transfert!.etat == 'brouillon') ...[
              const PopupMenuItem(value: 'confirme', child: ListTile(leading: Icon(Icons.check_circle_outline, color: Colors.blue), title: Text('Confirmer'), dense: true)),
            ],
            if (_transfert!.etat == 'confirme') ...[
              const PopupMenuItem(value: 'assigne', child: ListTile(leading: Icon(Icons.assignment_ind_outlined, color: Colors.indigo), title: Text('Assigner'), dense: true)),
              const PopupMenuItem(value: 'valider', child: ListTile(leading: Icon(Icons.done_all, color: Colors.green), title: Text('Valider'), dense: true)),
            ],
            if (_transfert!.etat == 'assigne') ...[
              const PopupMenuItem(value: 'valider', child: ListTile(leading: Icon(Icons.done_all, color: Colors.green), title: Text('Valider et terminer'), dense: true)),
            ],
            if (_transfert!.etat != 'termine' && _transfert!.etat != 'annule') ...[
              const PopupMenuItem(value: 'annule', child: ListTile(leading: Icon(Icons.cancel_outlined, color: Colors.red), title: Text('Annuler'), dense: true)),
            ],
            const PopupMenuDivider(),
            const PopupMenuItem(value: 'delete', child: ListTile(leading: Icon(Icons.delete, color: Colors.red), title: Text('Supprimer', style: TextStyle(color: Colors.red)), dense: true)),
          ]),
        ],
      ),
      body: _deleting ? const Center(child: CircularProgressIndicator()) : _buildBody(),
    );
  }

  Widget _buildBody() {
    if (_loading) return const Center(child: CircularProgressIndicator());
    if (_error != null) {
      return Center(child: Column(mainAxisSize: MainAxisSize.min, children: [
        Text('Erreur: $_error', textAlign: TextAlign.center),
        const SizedBox(height: 16), ElevatedButton(onPressed: _load, child: const Text('Réessayer')),
      ]));
    }
    final t = _transfert!;
    return ListView(
      padding: const EdgeInsets.fromLTRB(16, 16, 16, 80),
      children: [
        Card(child: Padding(padding: const EdgeInsets.all(16), child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
          Row(mainAxisAlignment: MainAxisAlignment.spaceBetween, children: [
            Text(t.reference, style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 18)),
            Container(padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 6),
              decoration: BoxDecoration(color: getEtatColor(t.etat).withValues(alpha: 0.15), borderRadius: BorderRadius.circular(20)),
              child: Text(t.etat, style: TextStyle(color: getEtatColor(t.etat), fontWeight: FontWeight.w600))),
          ]),
          const Divider(height: 24),
          _infoRow(Icons.category_outlined, 'Type: ${t.type}'),
          const SizedBox(height: 8),
          _infoRow(Icons.calendar_today, 'Date: ${formatDate(t.dateCreation)}'),
          if (t.emplacementSource != null) ...[
            const SizedBox(height: 8),
            _infoRow(Icons.move_down, 'Source: ${t.emplacementSource!.nom}'),
          ],
          if (t.emplacementDestination != null) ...[
            const SizedBox(height: 8),
            _infoRow(Icons.move_up, 'Destination: ${t.emplacementDestination!.nom}'),
          ],
          if (t.notes != null && t.notes!.isNotEmpty) ...[
            const SizedBox(height: 8),
            _infoRow(Icons.notes, t.notes!),
          ],
        ]))),
        const SizedBox(height: 16),
        Text('MOUVEMENTS', style: TextStyle(fontSize: 13, fontWeight: FontWeight.w600, color: Colors.grey[700])),
        const SizedBox(height: 8),
        if (t.mouvements == null || t.mouvements!.isEmpty)
          const Card(child: Padding(padding: EdgeInsets.all(24), child: Center(child: Text('Aucun mouvement'))))
        else
          ...t.mouvements!.map((m) => _buildMouvementCard(m)),
      ],
    );
  }

  Widget _infoRow(IconData icon, String value) {
    return Row(children: [
      Icon(icon, size: 18, color: Colors.grey[600]),
      const SizedBox(width: 8),
      Expanded(child: Text(value, style: TextStyle(color: Colors.grey[700]))),
    ]);
  }

  Widget _buildMouvementCard(MouvementStock m) {
    return Card(margin: const EdgeInsets.only(bottom: 8), child: Padding(padding: const EdgeInsets.all(12), child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
      Row(mainAxisAlignment: MainAxisAlignment.spaceBetween, children: [
        Expanded(child: Text(m.nomProduit, style: const TextStyle(fontWeight: FontWeight.w600))),
        Container(padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 3),
          decoration: BoxDecoration(color: getEtatColor(m.etat).withValues(alpha: 0.15), borderRadius: BorderRadius.circular(12)),
          child: Text(m.etat, style: TextStyle(color: getEtatColor(m.etat), fontSize: 11))),
      ]),
      const SizedBox(height: 8),
      Row(children: [
        Text('Demandé: ${m.quantiteDemandee.toStringAsFixed(1)}', style: TextStyle(color: Colors.grey[700], fontSize: 13)),
        const SizedBox(width: 16),
        Text('Traité: ${m.quantiteTraitee.toStringAsFixed(1)}', style: TextStyle(color: Colors.grey[500], fontSize: 13)),
      ]),
      if (m.lot != null) Padding(padding: const EdgeInsets.only(top: 4), child: Text('Lot: ${m.lot!.nom}', style: TextStyle(color: Colors.grey[600], fontSize: 12))),
      if (_transfert!.etat != 'termine' && _transfert!.etat != 'annule')
        Align(
          alignment: Alignment.centerRight,
          child: TextButton.icon(
            onPressed: () => _traiter(m),
            icon: const Icon(Icons.playlist_add_check, size: 16),
            label: const Text('Traiter'),
          ),
        ),
    ])));
  }

  Future<void> _traiter(MouvementStock m) async {
    final restante = m.quantiteDemandee - m.quantiteTraitee;
    final qteCtrl = TextEditingController(text: restante.toStringAsFixed(2));
    String typeOp = 'prelevement';
    final ok = await showDialog<bool>(
      context: context,
      builder: (ctx) => StatefulBuilder(
        builder: (ctx, setModal) => AlertDialog(
          title: Text(m.nomProduit),
          content: Column(
            mainAxisSize: MainAxisSize.min,
            children: [
              Text('Restant à traiter : ${restante.toStringAsFixed(2)}'),
              const SizedBox(height: 12),
              TextField(
                controller: qteCtrl,
                keyboardType: const TextInputType.numberWithOptions(decimal: true),
                decoration: const InputDecoration(labelText: 'Quantité traitée'),
              ),
              const SizedBox(height: 12),
              DropdownButtonFormField<String>(
                initialValue: typeOp,
                decoration: const InputDecoration(labelText: 'Type d\'opération'),
                items: const [
                  DropdownMenuItem(value: 'prelevement', child: Text('Prélèvement')),
                  DropdownMenuItem(value: 'reception', child: Text('Réception')),
                  DropdownMenuItem(value: 'scan', child: Text('Scan')),
                ],
                onChanged: (v) => setModal(() => typeOp = v ?? 'prelevement'),
              ),
            ],
          ),
          actions: [
            TextButton(onPressed: () => Navigator.pop(ctx, false), child: const Text('Annuler')),
            ElevatedButton(
              onPressed: () => Navigator.pop(ctx, true),
              style: ElevatedButton.styleFrom(backgroundColor: const Color(0xFF0D9488), foregroundColor: Colors.white),
              child: const Text('Enregistrer'),
            ),
          ],
        ),
      ),
    );
    if (ok != true) return;
    try {
      await StockService().ajouterOperation(widget.id, {
        'mouvement_id': m.id,
        'produit_id': m.produitId,
        if (m.lotId != null) 'lot_id': m.lotId,
        'quantite_traitee': double.tryParse(qteCtrl.text.replaceAll(',', '.')) ?? 0,
        'emplacement_source_id': m.emplacementSourceId,
        'emplacement_destination_id': m.emplacementDestinationId,
        'type_operation': typeOp,
      });
      _load();
    } catch (e) {
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(SnackBar(content: Text('Erreur: $e'), backgroundColor: Colors.redAccent));
      }
    }
  }
}
