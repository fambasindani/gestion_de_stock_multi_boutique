import 'package:flutter/material.dart';
import 'package:gst_stock_mobile/models/models.dart';
import 'package:gst_stock_mobile/services/services.dart';
import 'package:gst_stock_mobile/config/theme.dart';
import 'package:gst_stock_mobile/utils/utils.dart';
import 'package:gst_stock_mobile/screens/commandes/commande_form_screen.dart';

class CommandeDetailScreen extends StatefulWidget {
  final int id;
  final String type;

  const CommandeDetailScreen({super.key, required this.id, required this.type});

  @override
  State<CommandeDetailScreen> createState() => _CommandeDetailScreenState();
}

class _CommandeDetailScreenState extends State<CommandeDetailScreen> {
  CommandeVente? _vente;
  CommandeAchat? _achat;
  bool _loading = true;
  bool _changingStatus = false;
  String? _error;

  @override
  void initState() {
    super.initState();
    _loadDetail();
  }

  Future<void> _loadDetail() async {
    setState(() { _loading = true; _error = null; });
    try {
      if (widget.type == 'vente') {
        final v = await CommandeVenteService().getById(widget.id);
        if (!mounted) return;
        setState(() { _vente = v; _loading = false; });
      } else {
        final a = await CommandeAchatService().getById(widget.id);
        if (!mounted) return;
        setState(() { _achat = a; _loading = false; });
      }
    } catch (e) {
      if (!mounted) return;
      setState(() { _error = e.toString(); _loading = false; });
    }
  }

  String get _reference => _vente?.reference ?? _achat?.reference ?? '';
  String get _partenaireNom => _vente?.partenaire?.nom ?? _achat?.partenaire?.nom ?? '';
  String get _date => _vente?.dateCommande ?? _achat?.dateCommande ?? '';
  String get _etat => _vente?.etat ?? _achat?.etat ?? '';
  double get _totalHt => _vente?.totalHt ?? _achat?.totalHt ?? 0;
  double get _totalTtc => _vente?.totalTtc ?? _achat?.totalTtc ?? 0;
  double get _totalTva => _totalTtc - _totalHt;
  List<LigneCommande> get _lignes => _vente?.lignes ?? _achat?.lignes ?? [];
  dynamic get _commande => _vente ?? _achat;

  // État de paiement (d'après les factures liées)
  List<EcritureComptable> get _facturesVente => _vente?.factures ?? [];
  double get _resteAPayer => _facturesVente.isEmpty
      ? _totalTtc
      : _facturesVente.fold<double>(0, (s, f) => s + f.montantRestant);
  bool get _estPayee => _facturesVente.isNotEmpty && _resteAPayer <= 0.001;

  static const _nextStatusVente = <String, String>{
    'brouillon': 'confirme',
    'confirme': 'en_cours',
    'en_cours': 'termine',
  };

  static const _nextStatusAchat = <String, String>{
    'brouillon': 'confirme',
    'confirme': 'envoye',
    'envoye': 'recu',
    'recu': 'termine',
  };

  Map<String, String> get _nextStatus => widget.type == 'vente' ? _nextStatusVente : _nextStatusAchat;

  static const _statusLabels = <String, String>{
    'brouillon': 'Brouillon',
    'confirme': 'Confirmé',
    'en_cours': 'En cours',
    'envoye': 'Envoyé',
    'recu': 'Reçu',
    'termine': 'Terminé',
    'annule': 'Annulé',
  };

  bool get _canProgress => _nextStatus.containsKey(_etat);
  bool get _canCancel => _etat != 'annule' && _etat != 'termine';
  bool get _canModify => _etat == 'brouillon';
  bool get _canDelete => _etat == 'brouillon' || _etat == 'annule';

  Future<void> _edit() async {
    final ok = await Navigator.push<bool>(context, MaterialPageRoute(builder: (_) => CommandeFormScreen(type: widget.type, commande: _commande)));
    if (ok == true) _loadDetail();
  }

  Future<void> _delete() async {
    final confirm = await showDialog<bool>(context: context, builder: (ctx) => AlertDialog(
      title: const Text('Confirmer'),
      content: Text('Supprimer $_reference ?'),
      actions: [
        TextButton(onPressed: () => Navigator.pop(ctx, false), child: const Text('Annuler')),
        TextButton(onPressed: () => Navigator.pop(ctx, true), child: const Text('Supprimer', style: TextStyle(color: AppTheme.danger))),
      ],
    ));
    if (confirm != true) return;
    try {
      if (widget.type == 'vente') {
        await CommandeVenteService().delete(widget.id);
      } else {
        await CommandeAchatService().delete(widget.id);
      }
      if (mounted) Navigator.pop(context, true);
    } catch (e) {
      if (mounted) ScaffoldMessenger.of(context).showSnackBar(SnackBar(content: Text('Erreur: $e'), backgroundColor: AppTheme.danger));
    }
  }

  Future<void> _changerEtat(String etat) async {
    setState(() => _changingStatus = true);
    try {
      if (widget.type == 'vente') {
        await CommandeVenteService().changerEtat(widget.id, etat);
      } else {
        await CommandeAchatService().changerEtat(widget.id, etat);
      }
      if (!mounted) return;
      ScaffoldMessenger.of(context).showSnackBar(SnackBar(content: Text('Statut changé en "${_statusLabels[etat]}"'), backgroundColor: AppTheme.success));
      _loadDetail();
    } catch (e) {
      if (!mounted) return;
      ScaffoldMessenger.of(context).showSnackBar(SnackBar(content: Text('Erreur: $e'), backgroundColor: AppTheme.danger));
    } finally {
      if (mounted) setState(() => _changingStatus = false);
    }
  }

  Future<void> _openPaiementDialog() async {
    if (_vente == null) return;
    final montantCtrl = TextEditingController(text: _totalTtc.toStringAsFixed(2));
    final result = await showDialog<double>(context: context, builder: (ctx) {
      return AlertDialog(
        title: const Text('Confirmer le paiement'),
        content: Column(mainAxisSize: MainAxisSize.min, children: [
          Text('Total TTC : ${formatCurrency(_totalTtc)}', style: const TextStyle(fontSize: 15, fontWeight: FontWeight.w600)),
          const SizedBox(height: 16),
          TextField(
            controller: montantCtrl,
            decoration: const InputDecoration(labelText: 'Montant', border: OutlineInputBorder()),
            keyboardType: TextInputType.number,
          ),
        ]),
        actions: [
          TextButton(onPressed: () => Navigator.pop(ctx), child: const Text('Annuler')),
          ElevatedButton(
            onPressed: () => Navigator.pop(ctx, double.tryParse(montantCtrl.text)),
            style: ElevatedButton.styleFrom(backgroundColor: AppTheme.success),
            child: const Text('Confirmer le paiement'),
          ),
        ],
      );
    });
    montantCtrl.dispose();
    if (result == null || result <= 0) return;
    await _confirmerPaiement(result);
  }

  Future<void> _confirmerPaiement(double montant) async {
    try {
      final factures = _vente!.factures ?? [];
      EcritureComptable? invoice = factures.isNotEmpty ? factures.first : null;

      if (invoice == null && _vente!.lignes != null) {
        final lignesData = _vente!.lignes!.map((l) => {
          'produit_id': l.produitId,
          'nom_produit': l.nomProduit ?? l.produit?.nom ?? 'Produit #${l.produitId}',
          'quantite': l.quantite,
          'prix_unitaire_ht': l.prixUnitaireHt,
          'taux_tva': 20,
          'montant_ht': l.totalHt,
        }).toList();

        final invoiceData = {
          'reference': 'INV-${_vente!.reference}',
          'partenaire_id': _vente!.partenaireId,
          'type': 'facture_client',
          'date_emission': DateTime.now().toIso8601String().substring(0, 10),
          'date_echeance': DateTime.now().add(const Duration(days: 30)).toIso8601String().substring(0, 10),
          'montant_ht': _totalHt,
          'montant_tva': _totalTva,
          'montant_ttc': _totalTtc,
          'montant_paye': 0,
          'montant_restant': _totalTtc,
          'statut': 'validee',
          'commande_vente_id': _vente!.id,
          'lignes': lignesData,
        };

        invoice = await FactureService().create(invoiceData);
      }

      if (invoice != null) {
        await FactureService().paiementPartiel(invoice.id, montant);
      }

      if (!mounted) return;
      ScaffoldMessenger.of(context).showSnackBar(const SnackBar(content: Text('Paiement confirmé'), backgroundColor: AppTheme.success));
      _loadDetail();
    } catch (e) {
      if (!mounted) return;
      ScaffoldMessenger.of(context).showSnackBar(SnackBar(content: Text('Erreur: $e'), backgroundColor: AppTheme.danger));
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: Text('${widget.type == 'vente' ? 'Vente' : 'Achat'} #${widget.id}')),
      body: _buildBody(),
    );
  }

  Widget _buildBody() {
    if (_loading) return const Center(child: CircularProgressIndicator());
    if (_error != null) {
      return Center(
        child: Column(mainAxisSize: MainAxisSize.min, children: [
          Text('Erreur: $_error', textAlign: TextAlign.center),
          const SizedBox(height: 16),
          ElevatedButton(onPressed: _loadDetail, child: const Text('Réessayer')),
        ]),
      );
    }
    return ListView(padding: const EdgeInsets.fromLTRB(16, 16, 16, 100), children: [
      _buildHeader(),
      const SizedBox(height: 16),
      _buildInfoCards(),
      const SizedBox(height: 16),
      _buildLignesSection(),
      if (_vente?.notes != null || _achat?.notes != null) ...[
        const SizedBox(height: 16),
        _buildNotesCard(),
      ],
      const SizedBox(height: 16),
      _buildActions(),
      const SizedBox(height: 20),
    ]);
  }

  Widget _buildHeader() {
    return Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
      Text(_reference, style: const TextStyle(fontSize: 28, fontWeight: FontWeight.w800, color: AppTheme.text)),
      const SizedBox(height: 8),
      Row(children: [
        Container(
          padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 6),
          decoration: BoxDecoration(
            color: AppTheme.statusBgColor(_etat),
            borderRadius: BorderRadius.circular(20),
          ),
          child: Text(
            _statusLabels[_etat] ?? _etat,
            style: TextStyle(color: AppTheme.statusTextColor(_etat), fontWeight: FontWeight.w600, fontSize: 13),
          ),
        ),
        const SizedBox(width: 8),
        Container(
          padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 6),
          decoration: BoxDecoration(
            color: AppTheme.primaryLight,
            borderRadius: BorderRadius.circular(20),
          ),
          child: Text(_partenaireNom, style: const TextStyle(color: AppTheme.primary, fontWeight: FontWeight.w500, fontSize: 13)),
        ),
        if (widget.type == 'vente' && _estPayee) ...[
          const SizedBox(width: 8),
          Container(
            padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 6),
            decoration: BoxDecoration(color: AppTheme.success.withValues(alpha: 0.15), borderRadius: BorderRadius.circular(20)),
            child: Row(mainAxisSize: MainAxisSize.min, children: const [
              Icon(Icons.verified, size: 14, color: AppTheme.success),
              SizedBox(width: 4),
              Text('Payée', style: TextStyle(color: AppTheme.success, fontWeight: FontWeight.w600, fontSize: 12)),
            ]),
          ),
        ] else if (widget.type == 'vente' && _facturesVente.isNotEmpty) ...[
          const SizedBox(width: 8),
          Container(
            padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 6),
            decoration: BoxDecoration(color: AppTheme.warning.withValues(alpha: 0.15), borderRadius: BorderRadius.circular(20)),
            child: Text('Reste ${formatCompact(_resteAPayer)}', style: const TextStyle(color: AppTheme.warning, fontWeight: FontWeight.w600, fontSize: 12)),
          ),
        ],
      ]),
    ]);
  }

  Widget _buildInfoCards() {
    return Column(children: [
      Row(children: [
        Expanded(child: _buildInfoCard(
          Icons.business, 'CLIENT', _partenaireNom.isNotEmpty ? _partenaireNom : '-', AppTheme.info)),
        const SizedBox(width: 10),
        Expanded(child: _buildInfoCard(
          Icons.calendar_today, 'DATE', formatDate(_date), AppTheme.warning)),
      ]),
      const SizedBox(height: 10),
      Row(children: [
        Expanded(child: _buildInfoCard(
          Icons.payments, 'TOTAL TTC', formatCurrency(_totalTtc), AppTheme.success)),
        const SizedBox(width: 10),
        Expanded(child: _buildInfoCard(
          Icons.receipt, 'STATUT',
          _statusLabels[_etat] ?? _etat,
          _etat == 'termine' ? AppTheme.success : _etat == 'annule' ? AppTheme.danger : AppTheme.warning)),
      ]),
    ]);
  }

  Widget _buildInfoCard(IconData icon, String label, String value, Color color) {
    return Container(
      padding: const EdgeInsets.all(12),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(14),
        border: Border.all(color: AppTheme.border),
      ),
      child: Row(children: [
        Container(
          padding: const EdgeInsets.all(8),
          decoration: BoxDecoration(color: color.withValues(alpha: 0.12), borderRadius: BorderRadius.circular(10)),
          child: Icon(icon, size: 18, color: color),
        ),
        const SizedBox(width: 8),
        Expanded(child: Column(crossAxisAlignment: CrossAxisAlignment.start, mainAxisAlignment: MainAxisAlignment.center, children: [
          Text(label, style: const TextStyle(fontSize: 9, fontWeight: FontWeight.w700, color: AppTheme.textSecondary, letterSpacing: 0.5)),
          const SizedBox(height: 1),
          Text(value, style: const TextStyle(fontSize: 13, fontWeight: FontWeight.w700, color: AppTheme.text), overflow: TextOverflow.ellipsis),
        ])),
      ]),
    );
  }

  Widget _buildActions() {
    return Column(crossAxisAlignment: CrossAxisAlignment.stretch, children: [
      const Text('ACTIONS', style: TextStyle(fontSize: 12, fontWeight: FontWeight.w700, color: AppTheme.textSecondary, letterSpacing: 0.8)),
      const SizedBox(height: 10),
      ..._buildActionButtons(),
    ]);
  }

  List<Widget> _buildActionButtons() {
    final buttons = <Widget>[];
    if (_canModify) {
      buttons.add(_actionBtn('Modifier', Icons.edit, AppTheme.primary, _edit));
      buttons.add(const SizedBox(height: 8));
    }
    if (_canProgress) {
      final next = _nextStatus[_etat]!;
      buttons.add(_actionBtn('Passer à ${_statusLabels[next]}', Icons.send, AppTheme.info, () => _changerEtat(next), loading: _changingStatus));
      buttons.add(const SizedBox(height: 8));
    }
    if (_etat == 'termine' && widget.type == 'vente' && !_estPayee) {
      buttons.add(_actionBtn(
        _facturesVente.isEmpty ? 'Confirmer paiement' : 'Enregistrer un paiement',
        Icons.credit_card,
        AppTheme.success,
        _openPaiementDialog,
      ));
      buttons.add(const SizedBox(height: 8));
    }
    if (_canCancel) {
      buttons.add(_actionBtn('Annuler', Icons.cancel_outlined, AppTheme.danger, () => _changerEtat('annule'), loading: _changingStatus));
      buttons.add(const SizedBox(height: 8));
    }
    if (_canDelete) {
      buttons.add(_actionBtn('Supprimer', Icons.delete, AppTheme.danger, _delete));
      buttons.add(const SizedBox(height: 8));
    }
    return buttons;
  }

  Widget _actionBtn(String label, IconData icon, Color color, VoidCallback onPressed, {bool loading = false}) {
    return SizedBox(
      height: 48,
      child: ElevatedButton.icon(
        onPressed: loading ? null : onPressed,
        icon: loading
            ? const SizedBox(width: 18, height: 18, child: CircularProgressIndicator(strokeWidth: 2, color: Colors.white))
            : Icon(icon, size: 18),
        label: Text(label, style: const TextStyle(fontWeight: FontWeight.w600)),
        style: ElevatedButton.styleFrom(
          backgroundColor: color,
          foregroundColor: Colors.white,
          shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
          elevation: 0,
        ),
      ),
    );
  }

  Widget _buildLignesSection() {
    return Container(
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(14),
        border: Border.all(color: AppTheme.border),
      ),
      padding: const EdgeInsets.all(16),
      child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
          Row(children: [
          const Icon(Icons.shopping_bag, size: 18, color: AppTheme.text),
          const SizedBox(width: 8),
          const Text('Lignes de commande', style: TextStyle(fontSize: 16, fontWeight: FontWeight.w700)),
        ]),
        const SizedBox(height: 12),
        if (_lignes.isEmpty)
          const Padding(padding: EdgeInsets.all(16), child: Text('Aucune ligne', style: TextStyle(color: AppTheme.textSecondary)))
        else ...[
          ..._lignes.map((l) => _buildLigneRow(l)),
          const Divider(height: 24),
          _totalRow('Total HT', formatCurrency(_totalHt)),
          const SizedBox(height: 4),
          _totalRow('TVA (20%)', formatCurrency(_totalTva)),
          const Divider(height: 12),
          _totalRow('Total TTC', formatCurrency(_totalTtc), bold: true, color: AppTheme.primary),
        ],
      ]),
    );
  }

  Widget _buildLigneRow(LigneCommande ligne) {
    return Padding(
      padding: const EdgeInsets.symmetric(vertical: 8),
      child: Row(children: [
        Expanded(
          child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
            Text(ligne.produit?.nom ?? ligne.nomProduit ?? 'Produit #${ligne.produitId}',
                style: const TextStyle(fontWeight: FontWeight.w600, fontSize: 14)),
            const SizedBox(height: 2),
            Text('Qté: ${ligne.quantite} x ${formatCurrency(ligne.prixUnitaireHt)}',
                style: TextStyle(fontSize: 12, color: AppTheme.textSecondary)),
          ]),
        ),
        Text(formatCurrency(ligne.totalHt), style: const TextStyle(fontWeight: FontWeight.w700)),
      ]),
    );
  }

  Widget _totalRow(String label, String value, {bool bold = false, Color? color}) {
    return Row(mainAxisAlignment: MainAxisAlignment.end, children: [
      Text(label, style: TextStyle(fontSize: 13, color: AppTheme.textSecondary)),
      const SizedBox(width: 24),
      SizedBox(width: 120, child: Text(value, textAlign: TextAlign.right,
          style: TextStyle(fontSize: bold ? 18 : 14, fontWeight: bold ? FontWeight.w800 : FontWeight.w600, color: color ?? AppTheme.text))),
    ]);
  }

  Widget _buildNotesCard() {
    return Container(
      width: double.infinity,
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(14),
        border: Border.all(color: AppTheme.border),
      ),
      child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
        Row(children: [
          const Icon(Icons.notes, size: 16, color: AppTheme.text),
          const SizedBox(width: 8),
          const Text('Notes', style: TextStyle(fontSize: 16, fontWeight: FontWeight.w700)),
        ]),
        const SizedBox(height: 8),
        Container(
          width: double.infinity,
          padding: const EdgeInsets.all(12),
          decoration: BoxDecoration(color: AppTheme.surface, borderRadius: BorderRadius.circular(10)),
          child: Text(_vente?.notes ?? _achat?.notes ?? '', style: TextStyle(color: AppTheme.textSecondary, fontSize: 13)),
        ),
      ]),
    );
  }
}


