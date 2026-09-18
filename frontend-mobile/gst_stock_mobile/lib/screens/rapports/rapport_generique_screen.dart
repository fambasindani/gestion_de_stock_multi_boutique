import 'package:flutter/material.dart';
import 'package:pdf/pdf.dart';
import 'package:pdf/widgets.dart' as pw;
import 'package:printing/printing.dart';
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

  Widget _totauxBar() {
    if (_totaux.isEmpty) return const SizedBox.shrink();
    final entries = _totaux.entries.take(4).toList();
    return Container(
      margin: const EdgeInsets.only(bottom: 12),
      padding: const EdgeInsets.all(14),
      decoration: BoxDecoration(
        color: const Color(0xFFF8FAFC),
        borderRadius: BorderRadius.circular(10),
        border: Border.all(color: const Color(0xFFE2E8F0)),
      ),
      child: Wrap(
        spacing: 24,
        runSpacing: 12,
        children: entries
            .map((e) => Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(
                      e.key.replaceAll('_', ' ').toUpperCase(),
                      style: TextStyle(color: Colors.grey[500], fontSize: 10, letterSpacing: 0.5),
                    ),
                    const SizedBox(height: 2),
                    Text(
                      e.value is num ? formatCurrency(e.value) : '${e.value}',
                      style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 15),
                    ),
                  ],
                ))
            .toList(),
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
          IconButton(icon: const Icon(Icons.refresh), onPressed: _load, tooltip: 'Actualiser'),
        ],
      ),
      body: _loading
          ? const Center(child: CircularProgressIndicator())
          : _error != null
              ? Center(child: Padding(padding: const EdgeInsets.all(24), child: Text(_error!, textAlign: TextAlign.center)))
              : Column(
                  crossAxisAlignment: CrossAxisAlignment.stretch,
                  children: [
                    if (_range != null)
                      Padding(
                        padding: const EdgeInsets.fromLTRB(12, 12, 12, 0),
                        child: Text(
                          'Période : ${formatDate(_iso(_range!.start))} → ${formatDate(_iso(_range!.end))}',
                          style: TextStyle(color: Colors.grey[600], fontSize: 12),
                        ),
                      ),
                    Expanded(
                      child: _lignes.isEmpty
                          ? const Center(child: Text('Aucune donnée', style: TextStyle(color: Colors.grey)))
                          : SingleChildScrollView(
                              padding: const EdgeInsets.all(12),
                              child: Column(
                                crossAxisAlignment: CrossAxisAlignment.start,
                                children: [
                                  _totauxBar(),
                                  SingleChildScrollView(
                                    scrollDirection: Axis.horizontal,
                                    child: DataTable(
                                      headingRowColor: WidgetStateProperty.all(const Color(0xFFF1F5F9)),
                                      columnSpacing: 18,
                                      columns: widget.columns
                                          .map((c) => DataColumn(label: Text(c.header, style: const TextStyle(fontWeight: FontWeight.w600, fontSize: 12))))
                                          .toList(),
                                      rows: _lignes.asMap().entries.map((entry) {
                                        final row = entry.value is Map<String, dynamic> ? entry.value as Map<String, dynamic> : <String, dynamic>{};
                                        return DataRow(
                                          color: WidgetStateProperty.all(entry.key.isEven ? Colors.white : const Color(0xFFFAFAFA)),
                                          cells: widget.columns
                                              .map((c) => DataCell(Text(
                                                    c.value(row),
                                                    style: TextStyle(fontSize: 13, fontWeight: c.numeric ? FontWeight.w600 : FontWeight.normal),
                                                  )))
                                              .toList(),
                                        );
                                      }).toList(),
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
