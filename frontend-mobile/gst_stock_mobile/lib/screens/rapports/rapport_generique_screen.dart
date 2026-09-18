import 'dart:io';
import 'package:flutter/material.dart';
import 'package:pdf/pdf.dart';
import 'package:pdf/widgets.dart' as pw;
import 'package:printing/printing.dart';
import 'package:path_provider/path_provider.dart';
import 'package:share_plus/share_plus.dart';
import 'package:gst_stock_mobile/config/theme.dart';
import 'package:gst_stock_mobile/utils/utils.dart';

class RapportColumn {
  final String header;
  final String Function(Map<String, dynamic> row) value;
  final bool numeric;
  const RapportColumn(this.header, this.value, {this.numeric = false});
}

class RapportGeneriqueScreen extends StatefulWidget {
  final String title;
  final Future<Map<String, dynamic>> Function(Map<String, dynamic> params) loader;
  final List<RapportColumn> columns;
  final bool dateFilter;
  final Map<String, dynamic> fixedParams;

  const RapportGeneriqueScreen({
    super.key,
    required this.title,
    required this.loader,
    required this.columns,
    this.dateFilter = false,
    this.fixedParams = const {},
  });

  @override
  State<RapportGeneriqueScreen> createState() => _RapportGeneriqueScreenState();
}

class _RapportGeneriqueScreenState extends State<RapportGeneriqueScreen> {
  DateTimeRange? _range;
  List<dynamic> _lignes = [];
  Map<String, dynamic> _totaux = {};
  bool _loading = true;
  String? _error;

  @override
  void initState() {
    super.initState();
    if (widget.dateFilter) {
      _range = DateTimeRange(
        start: DateTime.now().subtract(const Duration(days: 30)),
        end: DateTime.now(),
      );
    }
    _load();
  }

  String _iso(DateTime d) => d.toIso8601String().split('T').first;

  Future<void> _load() async {
    setState(() {
      _loading = true;
      _error = null;
    });
    try {
      final params = <String, dynamic>{...widget.fixedParams};
      if (widget.dateFilter && _range != null) {
        params['date_debut'] = _iso(_range!.start);
        params['date_fin'] = _iso(_range!.end);
      }
      final result = await widget.loader(params);
      setState(() {
        _lignes = (result['lignes'] as List?) ?? [];
        _totaux = (result['totaux'] as Map<String, dynamic>?) ?? {};
      });
    } catch (e) {
      setState(() => _error = e.toString());
    } finally {
      if (mounted) setState(() => _loading = false);
    }
  }

  Future<void> _pickDates() async {
    final picked = await showDateRangePicker(
      context: context,
      firstDate: DateTime(2020),
      lastDate: DateTime(2030),
      initialDateRange: _range,
    );
    if (picked != null) {
      setState(() => _range = picked);
      _load();
    }
  }

  String _formatTotal(String key, dynamic value) {
    final k = key.toLowerCase();
    final isMoney = k.contains('ht') || k.contains('ttc') || k.contains('montant') ||
        k.contains('valeur') || k.contains('ca') || k.contains('impaye') || k.contains('manque');
    if (value is num || (value is String && double.tryParse(value) != null)) {
      return isMoney ? formatCurrency(value) : '$value';
    }
    return '$value';
  }

  /// Cartes de synthèse horizontales (totaux).
  Widget _totauxCards() {
    if (_totaux.isEmpty) return const SizedBox.shrink();
    final entries = _totaux.entries.take(6).toList();
    const colors = [Color(0xFF2563EB), Color(0xFF16A34A), Color(0xFFD97706), Color(0xFF7C3AED), Color(0xFFDC2626), Color(0xFF0D9488)];
    return SizedBox(
      height: 86,
      child: ListView.separated(
        scrollDirection: Axis.horizontal,
        padding: const EdgeInsets.symmetric(horizontal: 12),
        itemCount: entries.length,
        separatorBuilder: (_, __) => const SizedBox(width: 8),
        itemBuilder: (context, i) {
          final e = entries[i];
          final color = colors[i % colors.length];
          return Container(
            width: 160,
            padding: const EdgeInsets.all(12),
            decoration: BoxDecoration(
              color: Colors.white,
              borderRadius: BorderRadius.circular(14),
              border: Border.all(color: Colors.grey.shade200),
              boxShadow: [BoxShadow(color: color.withValues(alpha: 0.06), blurRadius: 8, offset: const Offset(0, 2))],
            ),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Container(
                  padding: const EdgeInsets.symmetric(horizontal: 6, vertical: 2),
                  decoration: BoxDecoration(color: color.withValues(alpha: 0.1), borderRadius: BorderRadius.circular(6)),
                  child: Text(
                    e.key.replaceAll('_', ' ').toUpperCase(),
                    style: TextStyle(fontSize: 9, fontWeight: FontWeight.w700, color: color, letterSpacing: 0.5),
                    maxLines: 1,
                    overflow: TextOverflow.ellipsis,
                  ),
                ),
                const Spacer(),
                Text(
                  _formatTotal(e.key, e.value),
                  style: const TextStyle(fontSize: 18, fontWeight: FontWeight.bold),
                  maxLines: 1,
                  overflow: TextOverflow.ellipsis,
                ),
              ],
            ),
          );
        },
      ),
    );
  }

  /// Une ligne du rapport sous forme de carte lisible.
  Widget _rowCard(Map<String, dynamic> row, int index) {
    final first = widget.columns.first;
    final rest = widget.columns.skip(1).toList();
    return Card(
      margin: const EdgeInsets.only(bottom: 8),
      elevation: 0,
      shape: RoundedRectangleBorder(
        borderRadius: BorderRadius.circular(12),
        side: BorderSide(color: Colors.grey.shade200),
      ),
      child: Padding(
        padding: const EdgeInsets.all(12),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Row(
              children: [
                Container(
                  width: 24,
                  height: 24,
                  alignment: Alignment.center,
                  decoration: BoxDecoration(color: AppTheme.primary.withValues(alpha: 0.1), borderRadius: BorderRadius.circular(6)),
                  child: Text('${index + 1}', style: const TextStyle(fontSize: 11, fontWeight: FontWeight.bold, color: AppTheme.primary)),
                ),
                const SizedBox(width: 8),
                Expanded(
                  child: Text(
                    first.value(row),
                    style: const TextStyle(fontSize: 14, fontWeight: FontWeight.w600),
                    maxLines: 1,
                    overflow: TextOverflow.ellipsis,
                  ),
                ),
              ],
            ),
            if (rest.isNotEmpty) ...[
              const Divider(height: 16),
              ...rest.map((c) => Padding(
                    padding: const EdgeInsets.symmetric(vertical: 2),
                    child: Row(
                      mainAxisAlignment: MainAxisAlignment.spaceBetween,
                      children: [
                        Text(c.header, style: TextStyle(fontSize: 12, color: Colors.grey[600])),
                        const SizedBox(width: 12),
                        Flexible(
                          child: Text(
                            c.value(row),
                            textAlign: TextAlign.right,
                            style: TextStyle(
                              fontSize: 13,
                              fontWeight: c.numeric ? FontWeight.w700 : FontWeight.w500,
                              color: c.numeric ? AppTheme.primary : Colors.black87,
                            ),
                          ),
                        ),
                      ],
                    ),
                  )),
            ],
          ],
        ),
      ),
    );
  }

  Future<void> _exportPdf() async {
    if (_lignes.isEmpty) return;
    final doc = pw.Document();
    doc.addPage(pw.MultiPage(
      pageFormat: PdfPageFormat.a4,
      margin: const pw.EdgeInsets.all(24),
      build: (ctx) => [
        pw.Text(widget.title, style: pw.TextStyle(fontSize: 18, fontWeight: pw.FontWeight.bold)),
        if (_range != null)
          pw.Text('Période : ${_iso(_range!.start)} → ${_iso(_range!.end)}', style: const pw.TextStyle(fontSize: 9, color: PdfColors.grey700)),
        pw.SizedBox(height: 12),
        pw.TableHelper.fromTextArray(
          headers: widget.columns.map((c) => c.header).toList(),
          data: _lignes.map((row) {
            final r = row is Map<String, dynamic> ? row : <String, dynamic>{};
            return widget.columns.map((c) => c.value(r)).toList();
          }).toList(),
          headerStyle: pw.TextStyle(fontSize: 9, fontWeight: pw.FontWeight.bold),
          cellStyle: const pw.TextStyle(fontSize: 8),
          headerDecoration: const pw.BoxDecoration(color: PdfColors.grey200),
          cellAlignment: pw.Alignment.centerRight,
        ),
      ],
    ));
    await Printing.layoutPdf(onLayout: (format) async => doc.save());
  }

  String _csv(String v) => '"${v.replaceAll('"', '""')}"';

  Future<void> _exportCsv() async {
    if (_lignes.isEmpty) return;
    final buffer = StringBuffer();
    buffer.writeln(widget.columns.map((c) => _csv(c.header)).join(';'));
    for (final row in _lignes) {
      final r = row is Map<String, dynamic> ? row : <String, dynamic>{};
      buffer.writeln(widget.columns.map((c) => _csv(c.value(r))).join(';'));
    }
    final dir = await getTemporaryDirectory();
    final file = File('${dir.path}/rapport-${DateTime.now().millisecondsSinceEpoch}.csv');
    await file.writeAsString(buffer.toString());
    await SharePlus.instance.share(ShareParams(files: [XFile(file.path)], text: widget.title));
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: AppTheme.surface,
      appBar: AppBar(
        title: Text(widget.title),
        actions: [
          if (widget.dateFilter)
            IconButton(icon: const Icon(Icons.date_range), onPressed: _pickDates, tooltip: 'Période'),
          IconButton(icon: const Icon(Icons.picture_as_pdf), onPressed: _exportPdf, tooltip: 'PDF'),
          IconButton(icon: const Icon(Icons.grid_on), onPressed: _exportCsv, tooltip: 'Excel / CSV'),
          IconButton(icon: const Icon(Icons.refresh), onPressed: _load, tooltip: 'Actualiser'),
        ],
      ),
      body: SafeArea(
        child: _loading
            ? const Center(child: CircularProgressIndicator())
            : _error != null
                ? Center(
                    child: Padding(
                      padding: const EdgeInsets.all(24),
                      child: Column(
                        mainAxisSize: MainAxisSize.min,
                        children: [
                          const Icon(Icons.error_outline, size: 48, color: Colors.grey),
                          const SizedBox(height: 12),
                          Text(_error!, textAlign: TextAlign.center),
                          const SizedBox(height: 16),
                          ElevatedButton(onPressed: _load, child: const Text('Réessayer')),
                        ],
                      ),
                    ),
                  )
                : Column(
                    crossAxisAlignment: CrossAxisAlignment.stretch,
                    children: [
                      const SizedBox(height: 12),
                      _totauxCards(),
                      if (_range != null)
                        Padding(
                          padding: const EdgeInsets.fromLTRB(16, 10, 16, 0),
                          child: Row(
                            children: [
                              Icon(Icons.calendar_today, size: 13, color: Colors.grey[500]),
                              const SizedBox(width: 6),
                              Text(
                                '${formatDate(_iso(_range!.start))} → ${formatDate(_iso(_range!.end))}',
                                style: TextStyle(color: Colors.grey[600], fontSize: 12),
                              ),
                              const Spacer(),
                              Text('${_lignes.length} ligne(s)', style: TextStyle(color: Colors.grey[500], fontSize: 12)),
                            ],
                          ),
                        ),
                      const SizedBox(height: 8),
                      Expanded(
                        child: _lignes.isEmpty
                            ? const Center(child: Text('Aucune donnée', style: TextStyle(color: Colors.grey)))
                            : ListView.builder(
                                padding: const EdgeInsets.fromLTRB(12, 4, 12, 32),
                                itemCount: _lignes.length,
                                itemBuilder: (context, i) {
                                  final row = _lignes[i] is Map<String, dynamic>
                                      ? _lignes[i] as Map<String, dynamic>
                                      : <String, dynamic>{};
                                  return _rowCard(row, i);
                                },
                              ),
                      ),
                    ],
                  ),
      ),
    );
  }
}
