import 'package:flutter/material.dart';
import 'package:gst_stock_mobile/models/models.dart';
import 'package:gst_stock_mobile/services/services.dart';
import 'package:gst_stock_mobile/config/theme.dart';
import 'package:gst_stock_mobile/utils/utils.dart';

class _LigneLine {
  int? varianteId;
  String nomProduit = '';
  final TextEditingController qteCtrl;
  final TextEditingController prixCtrl;
  final TextEditingController remiseCtrl;
  _LigneLine()
      : qteCtrl = TextEditingController(text: '1'),
        prixCtrl = TextEditingController(),
        remiseCtrl = TextEditingController(text: '0');
  void dispose() { qteCtrl.dispose(); prixCtrl.dispose(); remiseCtrl.dispose(); }
  double get quantite => double.tryParse(qteCtrl.text) ?? 0;
  double get prixUnitaire => double.tryParse(prixCtrl.text) ?? 0;
  double get tauxRemise => double.tryParse(remiseCtrl.text) ?? 0;
  double get totalLigneHt => quantite * prixUnitaire * (1 - tauxRemise / 100);
  double get tvaLigne => totalLigneHt * 0.20;
  double get totalLigneTtc => totalLigneHt + tvaLigne;
  Map<String, dynamic> toJson() => {
    'produit_id': varianteId,
    'quantite': quantite,
    'prix_unitaire_ht': prixUnitaire,
    if (tauxRemise > 0) 'taux_remise': tauxRemise,
  };
}

class CommandeFormScreen extends StatefulWidget {
  final String type;
  final dynamic commande;
  const CommandeFormScreen({super.key, required this.type, this.commande});
  bool get isEdit => commande != null;
  bool get isVente => type == 'vente';

  @override
  State<CommandeFormScreen> createState() => _CommandeFormScreenState();
}

class _CommandeFormScreenState extends State<CommandeFormScreen> {
  final _formKey = GlobalKey<FormState>();
  final _dateCtrl = TextEditingController();
  final _dateLivCtrl = TextEditingController();
  final _notesCtrl = TextEditingController();
  final _adresseCtrl = TextEditingController();
  final _clientSearchCtrl = TextEditingController();
  int? _partenaireId;
  String _partenaireNom = '';
  List<Partenaire> _partenaires = [];
  List<ProduitModele> _produits = [];
  final List<_LigneLine> _lignes = [];
  bool _saving = false;
  bool _showClientDropdown = false;
  String _clientFilter = '';

  @override
  void initState() {
    super.initState();
    final now = DateTime.now();
    _dateCtrl.text = '${now.year}-${now.month.toString().padLeft(2, '0')}-${now.day.toString().padLeft(2, '0')}';
    final cmd = widget.commande;
    if (cmd != null) {
      _partenaireId = cmd.partenaireId;
      _partenaireNom = cmd.partenaire?.nom ?? '';
      _dateCtrl.text = cmd.dateCommande;
      if (widget.isVente && cmd.dateLivraisonSouhaitee != null) _dateLivCtrl.text = cmd.dateLivraisonSouhaitee;
      if (!widget.isVente && cmd.dateLivraisonPrevue != null) _dateLivCtrl.text = cmd.dateLivraisonPrevue;
      if (cmd.notes != null) _notesCtrl.text = cmd.notes;
      if (cmd.adresseLivraison != null) _adresseCtrl.text = cmd.adresseLivraison;
      if (cmd.lignes != null) {
        for (final l in cmd.lignes!) {
          final ll = _LigneLine();
          ll.varianteId = l.produitId;
          ll.nomProduit = l.nomProduit ?? 'Produit #${l.produitId}';
          ll.qteCtrl.text = l.quantite.toStringAsFixed(0);
          ll.prixCtrl.text = l.prixUnitaireHt.toStringAsFixed(2);
          _lignes.add(ll);
        }
      }
    }
    _loadData();
  }

  @override
  void dispose() {
    _dateCtrl.dispose(); _dateLivCtrl.dispose(); _notesCtrl.dispose(); _adresseCtrl.dispose(); _clientSearchCtrl.dispose();
    for (final l in _lignes) { l.dispose(); }
    super.dispose();
  }

  List<Partenaire> get _filteredPartenaires {
    final all = _partenaires.where((p) => p.actif && (widget.isVente ? p.estClient : p.estFournisseur)).toList();
    if (_clientFilter.isEmpty) return all;
    return all.where((p) => p.nom.toLowerCase().contains(_clientFilter.toLowerCase())).toList();
  }

  Future<void> _loadData() async {
    try {
      final allPartenaires = await PartenaireService().getAll();
      final allProduits = await ProduitService().getAll();
      if (!mounted) return;
      setState(() {
        _partenaires = allPartenaires;
        _produits = allProduits;
      });
    } catch (_) {}
  }

  void _addLigne() => setState(() => _lignes.add(_LigneLine()));
  void _removeLigne(int i) { _lignes[i].dispose(); setState(() => _lignes.removeAt(i)); }

  double get _totalHt => _lignes.fold(0, (s, l) => s + l.totalLigneHt);
  double get _totalTva => _lignes.fold(0, (s, l) => s + l.tvaLigne);
  double get _totalTtc => _totalHt + _totalTva;

  Future<void> _save() async {
    if (!_formKey.currentState!.validate()) return;
    setState(() => _saving = true);
    final lignesValid = _lignes.where((l) => l.varianteId != null && l.quantite > 0).toList();
    final body = <String, dynamic>{
      'partenaire_id': _partenaireId,
      'date_commande': _dateCtrl.text,
      if (_notesCtrl.text.isNotEmpty) 'notes': _notesCtrl.text,
      if (_adresseCtrl.text.isNotEmpty) 'adresse_livraison': _adresseCtrl.text,
      'montant_total_ht': _totalHt,
      'montant_total_ttc': _totalTtc,
      'lignes': lignesValid.map((l) => l.toJson()).toList(),
    };
    if (_dateLivCtrl.text.isNotEmpty) {
      body[widget.isVente ? 'date_livraison_souhaitee' : 'date_livraison_prevue'] = _dateLivCtrl.text;
    }
    try {
      if (widget.isVente) {
        if (widget.isEdit) {
          await CommandeVenteService().update(widget.commande.id, body);
        } else {
          await CommandeVenteService().create(body);
        }
      } else {
        if (widget.isEdit) {
          await CommandeAchatService().update(widget.commande.id, body);
        } else {
          await CommandeAchatService().create(body);
        }
      }
      if (mounted) Navigator.pop(context, true);
    } catch (e) {
      if (mounted) ScaffoldMessenger.of(context).showSnackBar(SnackBar(content: Text('Erreur: $e')));
    } finally {
      if (mounted) setState(() => _saving = false);
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: Text(widget.isEdit ? 'Modifier ${widget.isVente ? "vente" : "achat"}' : 'Nouvelle ${widget.isVente ? "vente" : "achat"}')),
      body: Form(
        key: _formKey,
        child: ListView(padding: const EdgeInsets.all(16), children: [
          _buildSectionHeader('PARTENAIRE'),
          const SizedBox(height: 8),
          _buildClientSelector(),
          const SizedBox(height: 16),
          _buildSectionHeader('DATES'),
          const SizedBox(height: 8),
          Row(children: [
            Expanded(child: _buildDateField(_dateCtrl, 'Date commande *', true)),
            const SizedBox(width: 12),
            Expanded(child: _buildDateField(_dateLivCtrl, widget.isVente ? 'Livraison souhaitée' : 'Livraison prévue', false)),
          ]),
          const SizedBox(height: 16),
          _buildSectionHeader('ADRESSE & NOTES'),
          const SizedBox(height: 8),
          TextFormField(controller: _adresseCtrl, decoration: const InputDecoration(labelText: 'Adresse livraison', border: OutlineInputBorder()), maxLines: 2),
          const SizedBox(height: 12),
          TextFormField(controller: _notesCtrl, decoration: const InputDecoration(labelText: 'Notes', border: OutlineInputBorder()), maxLines: 3),
          const SizedBox(height: 24),
          Row(mainAxisAlignment: MainAxisAlignment.spaceBetween, children: [
            _buildSectionHeader('LIGNES'),
            TextButton.icon(
              icon: const Icon(Icons.add_circle_outline, size: 18, color: AppTheme.primary),
              onPressed: _addLigne,
              label: const Text('Ajouter un produit', style: TextStyle(color: AppTheme.primary)),
            ),
          ]),
          ..._lignes.asMap().entries.map((e) => _buildLigneCard(e.key, e.value)),
          if (_lignes.isNotEmpty) ...[
            const SizedBox(height: 16),
            _buildTotalsCard(),
          ],
          const SizedBox(height: 80),
        ]),
      ),
      bottomNavigationBar: SafeArea(child: Padding(padding: const EdgeInsets.all(16), child: SizedBox(
        height: 50,
        child: ElevatedButton(
          onPressed: _saving ? null : _save,
          style: ElevatedButton.styleFrom(
            backgroundColor: AppTheme.primary,
            shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
          ),
          child: _saving
              ? const SizedBox(width: 22, height: 22, child: CircularProgressIndicator(strokeWidth: 2.5, color: Colors.white))
              : Text(widget.isEdit ? 'Mettre à jour' : 'Créer la commande', style: const TextStyle(fontSize: 16, fontWeight: FontWeight.w600)),
        ),
      ))),
    );
  }

  Widget _buildSectionHeader(String title) {
    return Text(title, style: const TextStyle(fontSize: 12, fontWeight: FontWeight.w700, color: AppTheme.textSecondary, letterSpacing: 0.8));
  }

  Widget _buildClientSelector() {
    return Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
      InkWell(
        borderRadius: BorderRadius.circular(10),
        onTap: () => setState(() => _showClientDropdown = !_showClientDropdown),
        child: Container(
          width: double.infinity,
          padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 14),
          decoration: BoxDecoration(
            border: Border.all(color: AppTheme.border),
            borderRadius: BorderRadius.circular(10),
            color: Colors.white,
          ),
          child: Row(children: [
            Icon(Icons.business, size: 18, color: AppTheme.textSecondary),
            const SizedBox(width: 10),
            Expanded(
              child: Text(
                _partenaireNom.isNotEmpty ? _partenaireNom : 'Sélectionner ${widget.isVente ? "un client" : "un fournisseur"} *',
                style: TextStyle(
                  color: _partenaireNom.isNotEmpty ? AppTheme.text : AppTheme.textSecondary,
                  fontSize: 15,
                ),
              ),
            ),
            Icon(_showClientDropdown ? Icons.expand_less : Icons.expand_more, color: AppTheme.textSecondary),
          ]),
        ),
      ),
      if (_showClientDropdown) ...[
        const SizedBox(height: 4),
        Container(
          decoration: BoxDecoration(
            border: Border.all(color: AppTheme.border),
            borderRadius: BorderRadius.circular(10),
            color: Colors.white,
          ),
          constraints: const BoxConstraints(maxHeight: 220),
          child: Column(mainAxisSize: MainAxisSize.min, children: [
            Padding(
              padding: const EdgeInsets.fromLTRB(8, 4, 8, 0),
              child: TextField(
                controller: _clientSearchCtrl,
                decoration: InputDecoration(
                  hintText: 'Rechercher...',
                  prefixIcon: const Icon(Icons.search, size: 18),
                  border: OutlineInputBorder(borderRadius: BorderRadius.circular(8)),
                  isDense: true,
                  contentPadding: const EdgeInsets.symmetric(horizontal: 10, vertical: 10),
                ),
                onChanged: (v) => setState(() => _clientFilter = v),
              ),
            ),
            const SizedBox(height: 4),
            Flexible(
              child: _filteredPartenaires.isEmpty
                  ? const Padding(padding: EdgeInsets.all(16), child: Text('Aucun résultat', style: TextStyle(color: AppTheme.textSecondary)))
                  : ListView.separated(
                      shrinkWrap: true,
                      itemCount: _filteredPartenaires.length,
                      separatorBuilder: (_, __) => const Divider(height: 1),
                      itemBuilder: (ctx, i) {
                        final p = _filteredPartenaires[i];
                        return InkWell(
                          onTap: () {
                            setState(() {
                              _partenaireId = p.id;
                              _partenaireNom = p.nom;
                              _showClientDropdown = false;
                              _clientSearchCtrl.clear();
                              _clientFilter = '';
                            });
                          },
                          child: Padding(
                            padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 12),
                            child: Row(children: [
                              Expanded(child: Text(p.nom, style: const TextStyle(fontSize: 14))),
                              if (p.code != null && p.code!.isNotEmpty)
                                Text(p.code!, style: TextStyle(fontSize: 12, color: AppTheme.textSecondary)),
                            ]),
                          ),
                        );
                      },
                    ),
            ),
          ]),
        ),
      ],
    ]);
  }

  Widget _buildDateField(TextEditingController ctrl, String label, bool required) {
    return TextFormField(
      controller: ctrl,
      decoration: InputDecoration(
        labelText: label,
        border: const OutlineInputBorder(),
        suffixIcon: const Icon(Icons.calendar_today, size: 18),
      ),
      readOnly: true,
      onTap: () async {
        final d = await showDatePicker(context: context, initialDate: DateTime.now(), firstDate: DateTime(2020), lastDate: DateTime(2030));
        if (d != null) ctrl.text = '${d.year}-${d.month.toString().padLeft(2, '0')}-${d.day.toString().padLeft(2, '0')}';
      },
      validator: required ? (v) => (v == null || v.isEmpty) ? 'Requis' : null : null,
    );
  }

  Widget _buildLigneCard(int index, _LigneLine l) {
    final produitItems = <DropdownMenuItem<int?>>[];
    for (final p in _produits) {
      if (p.variantes == null || p.variantes!.isEmpty) continue;
      for (final v in p.variantes!) {
        produitItems.add(DropdownMenuItem(
          value: v.id,
          child: Text('${p.nom} - ${v.nom}', overflow: TextOverflow.ellipsis),
        ));
      }
    }

    return Card(
      margin: const EdgeInsets.only(bottom: 12),
      child: Padding(padding: const EdgeInsets.all(14), child: Column(children: [
        Row(mainAxisAlignment: MainAxisAlignment.spaceBetween, children: [
          Row(children: [
            Container(
              width: 24, height: 24,
              decoration: BoxDecoration(color: AppTheme.primaryLight, borderRadius: BorderRadius.circular(6)),
              child: Center(child: Text('${index + 1}', style: const TextStyle(fontSize: 12, fontWeight: FontWeight.w700, color: AppTheme.primary))),
            ),
            const SizedBox(width: 8),
            const Text('Produit', style: TextStyle(fontWeight: FontWeight.w600, fontSize: 14)),
          ]),
          IconButton(
            icon: const Icon(Icons.delete_outline, color: AppTheme.danger, size: 20),
            onPressed: () => _removeLigne(index),
            padding: EdgeInsets.zero,
            constraints: const BoxConstraints(),
          ),
        ]),
        const SizedBox(height: 10),
        DropdownButtonFormField<int?>(
          initialValue: l.varianteId,
          decoration: const InputDecoration(labelText: 'Produit *', border: OutlineInputBorder(), isDense: true, contentPadding: EdgeInsets.symmetric(horizontal: 12, vertical: 10)),
          isExpanded: true,
          items: produitItems,
          onChanged: (v) {
            setState(() {
              l.varianteId = v;
              if (v != null) {
                for (final p in _produits) {
                  if (p.variantes == null) continue;
                  for (final vp in p.variantes!) {
                    if (vp.id == v) {
                      l.nomProduit = '${p.nom} - ${vp.nom}';
                      l.prixCtrl.text = (widget.isVente ? vp.prixVente : vp.prixAchat).toStringAsFixed(2);
                      return;
                    }
                  }
                }
              }
            });
          },
          validator: (v) => v == null ? 'Requis' : null,
        ),
        const SizedBox(height: 10),
        Row(children: [
          Expanded(
            child: TextFormField(
              controller: l.qteCtrl,
              decoration: const InputDecoration(labelText: 'Quantité *', border: OutlineInputBorder(), isDense: true, contentPadding: EdgeInsets.symmetric(horizontal: 12, vertical: 10)),
              keyboardType: TextInputType.number,
              onChanged: (_) => setState(() {}),
            ),
          ),
          const SizedBox(width: 8),
          Expanded(
            child: TextFormField(
              controller: l.prixCtrl,
              decoration: const InputDecoration(labelText: 'Prix unit. HT *', border: OutlineInputBorder(), isDense: true, contentPadding: EdgeInsets.symmetric(horizontal: 12, vertical: 10)),
              keyboardType: TextInputType.number,
              onChanged: (_) => setState(() {}),
            ),
          ),
          const SizedBox(width: 8),
          Expanded(
            child: TextFormField(
              controller: l.remiseCtrl,
              decoration: const InputDecoration(labelText: 'Remise %', border: OutlineInputBorder(), isDense: true, contentPadding: EdgeInsets.symmetric(horizontal: 12, vertical: 10)),
              keyboardType: TextInputType.number,
              onChanged: (_) => setState(() {}),
            ),
          ),
        ]),
        const SizedBox(height: 8),
        Container(
          width: double.infinity,
          padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 8),
          decoration: BoxDecoration(
            color: AppTheme.primaryLight.withValues(alpha: 0.4),
            borderRadius: BorderRadius.circular(8),
          ),
          child: Row(mainAxisAlignment: MainAxisAlignment.spaceBetween, children: [
            Text('Total ligne HT', style: TextStyle(fontSize: 12, color: AppTheme.textSecondary)),
            Text(formatCurrency(l.totalLigneHt), style: const TextStyle(fontWeight: FontWeight.w700, fontSize: 13, color: AppTheme.primary)),
          ]),
        ),
      ])),
    );
  }

  Widget _buildTotalsCard() {
    return Card(
      child: Padding(padding: const EdgeInsets.all(16), child: Column(children: [
        _totalRow('Total HT', formatCurrency(_totalHt), AppTheme.text),
        const SizedBox(height: 6),
        _totalRow('TVA (20%)', formatCurrency(_totalTva), AppTheme.textSecondary),
        const Divider(height: 20),
        _totalRow('Total TTC', formatCurrency(_totalTtc), AppTheme.primary, bold: true, large: true),
      ])),
    );
  }

  Widget _totalRow(String label, String value, Color color, {bool bold = false, bool large = false}) {
    return Row(mainAxisAlignment: MainAxisAlignment.spaceBetween, children: [
      Text(label, style: TextStyle(fontSize: large ? 15 : 14, color: AppTheme.textSecondary)),
      Text(value, style: TextStyle(fontSize: large ? 20 : 15, fontWeight: bold ? FontWeight.w700 : FontWeight.w600, color: color)),
    ]);
  }
}
