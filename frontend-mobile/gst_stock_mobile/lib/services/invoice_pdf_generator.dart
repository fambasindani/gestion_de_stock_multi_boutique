import 'dart:typed_data';
import 'package:dio/dio.dart';
import 'package:pdf/pdf.dart';
import 'package:pdf/widgets.dart' as pw;
import 'package:printing/printing.dart';
import 'package:gst_stock_mobile/models/models.dart';

String _formatDate(String? date) {
  if (date == null || date.isEmpty) return '-';
  try {
    final d = DateTime.parse(date);
    return '${d.day.toString().padLeft(2, '0')}/${d.month.toString().padLeft(2, '0')}/${d.year}';
  } catch (_) {
    return date;
  }
}

class InvoicePdfGenerator {
  static Future<pw.MemoryImage?> _loadLogo(String? logoUrl) async {
    if (logoUrl == null || logoUrl.isEmpty) return null;
    try {
      final res = await Dio().get<List<int>>(
        logoUrl,
        options: Options(responseType: ResponseType.bytes, followRedirects: true),
      );
      final data = res.data;
      if (data == null || data.isEmpty) return null;
      return pw.MemoryImage(Uint8List.fromList(data));
    } catch (_) {
      return null;
    }
  }

  static Future<Uint8List> generate(
    EcritureComptable facture, {
    String? societeNom,
    String? logoUrl,
  }) async {
    final doc = pw.Document();

    final lignes = facture.lignes ?? [];
    final tva = facture.montantTva ?? (facture.montantTtc - facture.montantHt);
    final logo = await _loadLogo(logoUrl);

    doc.addPage(pw.Page(
      pageFormat: PdfPageFormat.a4,
      margin: const pw.EdgeInsets.all(40),
      build: (pw.Context ctx) => pw.Column(children: [
        pw.Expanded(child: pw.Column(crossAxisAlignment: pw.CrossAxisAlignment.stretch, children: [
          _buildHeader(facture, logo, societeNom),
          pw.SizedBox(height: 8),
          _buildInvoiceInfo(facture),
          pw.SizedBox(height: 24),
          _buildPartnerInfo(facture),
          pw.SizedBox(height: 24),
          _buildTable(lignes),
          pw.SizedBox(height: 24),
          _buildTotals(facture, tva),
          pw.SizedBox(height: 24),
          if (facture.modePaiement != null) _buildPaymentInfo(facture),
          if (facture.notes != null && facture.notes!.isNotEmpty) ...[
            pw.SizedBox(height: 16),
            _buildNotes(facture),
          ],
        ])),
        _buildFooter(societeNom),
      ]),
    ));

    return doc.save();
  }

  static pw.Widget _buildHeader(EcritureComptable facture, pw.MemoryImage? logo, String? societeNom) {
    return pw.Row(mainAxisAlignment: pw.MainAxisAlignment.spaceBetween, children: [
      pw.Column(crossAxisAlignment: pw.CrossAxisAlignment.start, children: [
        if (logo != null) pw.Image(logo, height: 46),
        if (logo != null) pw.SizedBox(height: 6),
        pw.Text(
          societeNom ?? 'GS STOCK',
          style: pw.TextStyle(font: pw.Font.helveticaBold(), fontSize: 22, color: PdfColors.blue700),
        ),
      ]),
      pw.Column(crossAxisAlignment: pw.CrossAxisAlignment.end, children: [
        pw.Container(
          padding: const pw.EdgeInsets.symmetric(horizontal: 16, vertical: 8),
          decoration: pw.BoxDecoration(
            color: PdfColors.blue50,
            borderRadius: const pw.BorderRadius.all(pw.Radius.circular(6)),
          ),
          child: pw.Text('FACTURE',
              style: pw.TextStyle(font: pw.Font.helveticaBold(), fontSize: 28, color: PdfColors.blue800, letterSpacing: 4)),
        ),
      ]),
    ]);
  }

  static pw.Widget _buildInvoiceInfo(EcritureComptable facture) {
    return pw.Container(
      padding: const pw.EdgeInsets.all(16),
      decoration: pw.BoxDecoration(
        color: PdfColors.grey50,
        borderRadius: const pw.BorderRadius.all(pw.Radius.circular(8)),
      ),
      child: pw.Row(mainAxisAlignment: pw.MainAxisAlignment.spaceBetween, children: [
        pw.Column(crossAxisAlignment: pw.CrossAxisAlignment.start, children: [
          _infoField('Référence', facture.reference),
          pw.SizedBox(height: 4),
          if (facture.numeroFacture != null)
            _infoField('N° Facture', facture.numeroFacture!),
        ]),
        pw.Column(crossAxisAlignment: pw.CrossAxisAlignment.end, children: [
          _infoField("Date d'émission", _formatDate(facture.dateEmission)),
          pw.SizedBox(height: 4),
          if (facture.dateEcheance != null)
            _infoField("Date d'échéance", _formatDate(facture.dateEcheance)),
        ]),
      ]),
    );
  }

  static pw.Widget _infoField(String label, String value) {
    return pw.Row(children: [
      pw.Text('$label : ', style: pw.TextStyle(font: pw.Font.helveticaBold(), fontSize: 9, color: PdfColors.grey600)),
      pw.Text(value, style: pw.TextStyle(fontSize: 9, color: PdfColors.grey800)),
    ]);
  }

  static pw.Widget _buildPartnerInfo(EcritureComptable facture) {
    final p = facture.partenaire;
    return pw.Column(crossAxisAlignment: pw.CrossAxisAlignment.start, children: [
      pw.Text('CLIENT', style: pw.TextStyle(font: pw.Font.helveticaBoldOblique(), fontSize: 10, color: PdfColors.grey500, letterSpacing: 2)),
      pw.SizedBox(height: 6),
      pw.Container(
        padding: const pw.EdgeInsets.all(14),
        decoration: pw.BoxDecoration(
          border: pw.Border.all(color: PdfColors.grey300),
          borderRadius: const pw.BorderRadius.all(pw.Radius.circular(6)),
        ),
        child: pw.Column(crossAxisAlignment: pw.CrossAxisAlignment.start, children: [
          pw.Text(p?.nom ?? 'N/A', style: pw.TextStyle(font: pw.Font.helveticaBold(), fontSize: 12)),
          if (p?.adresse != null) pw.Text(p!.adresse!, style: pw.TextStyle(fontSize: 10, color: PdfColors.grey700)),
          if (p?.ville != null) pw.Text(p!.ville!, style: pw.TextStyle(fontSize: 10, color: PdfColors.grey700)),
          if (p?.email != null) pw.Text(p!.email!, style: pw.TextStyle(fontSize: 10, color: PdfColors.grey700)),
          if (p?.telephone != null) pw.Text(p!.telephone!, style: pw.TextStyle(fontSize: 10, color: PdfColors.grey700)),
        ]),
      ),
    ]);
  }

  static pw.Widget _buildTable(List<LigneEcritureComptable> lignes) {
    return pw.TableHelper.fromTextArray(
      headerStyle: pw.TextStyle(font: pw.Font.helveticaBold(), fontSize: 9, color: PdfColors.blue800),
      cellStyle: pw.TextStyle(fontSize: 9, color: PdfColors.grey800),
      headerDecoration: const pw.BoxDecoration(color: PdfColors.blue50),
      cellAlignments: {
        0: pw.Alignment.centerLeft,
        1: pw.Alignment.centerRight,
        2: pw.Alignment.centerRight,
        3: pw.Alignment.centerRight,
      },
      headers: ['Produit', 'Qté', 'PU HT', 'Total HT'],
      data: lignes.map((l) => [
        l.nomProduit ?? '-',
        l.quantite.toStringAsFixed(2),
        '${l.prixUnitaireHt.toStringAsFixed(2)} CDF',
        '${l.montantHt.toStringAsFixed(2)} CDF',
      ]).toList(),
    );
  }

  static pw.Widget _buildTotals(EcritureComptable facture, double tva) {
    return pw.Container(
      alignment: pw.Alignment.centerRight,
      child: pw.Column(crossAxisAlignment: pw.CrossAxisAlignment.end, children: [
        _totalRow('Total HT', facture.montantHt),
        pw.SizedBox(height: 4),
        _totalRow('TVA', tva),
        pw.SizedBox(height: 4),
        pw.Container(
          padding: const pw.EdgeInsets.symmetric(vertical: 8, horizontal: 16),
          decoration: pw.BoxDecoration(
            color: PdfColors.blue50,
            borderRadius: const pw.BorderRadius.all(pw.Radius.circular(6)),
          ),
          child: pw.Row(mainAxisSize: pw.MainAxisSize.min, children: [
            pw.Text('Total TTC  ', style: pw.TextStyle(font: pw.Font.helveticaBold(), fontSize: 16, color: PdfColors.blue800)),
            pw.Text('${facture.montantTtc.toStringAsFixed(2)} CDF', style: pw.TextStyle(font: pw.Font.helveticaBold(), fontSize: 16, color: PdfColors.blue800)),
          ]),
        ),
        pw.SizedBox(height: 8),
        pw.Text('Payé : ${facture.montantPaye.toStringAsFixed(2)} CDF', style: pw.TextStyle(font: pw.Font.helveticaBold(), fontSize: 10, color: PdfColors.green700)),
        pw.Text('Restant : ${facture.montantRestant.toStringAsFixed(2)} CDF', style: pw.TextStyle(fontSize: 10, color: facture.montantRestant > 0 ? PdfColors.orange700 : PdfColors.green700)),
      ]),
    );
  }

  static pw.Widget _totalRow(String label, double amount) {
    return pw.Row(mainAxisSize: pw.MainAxisSize.min, children: [
      pw.Text('$label : ', style: pw.TextStyle(fontSize: 11, color: PdfColors.grey700)),
      pw.SizedBox(width: 40),
      pw.SizedBox(width: 80, child: pw.Text('${amount.toStringAsFixed(2)} CDF',
          textAlign: pw.TextAlign.right,
          style: pw.TextStyle(font: pw.Font.helveticaBold(), fontSize: 11, color: PdfColors.grey800))),
    ]);
  }

  static pw.Widget _buildPaymentInfo(EcritureComptable facture) {
    return pw.Column(crossAxisAlignment: pw.CrossAxisAlignment.start, children: [
      pw.Text('CONDITIONS DE PAIEMENT',
          style: pw.TextStyle(font: pw.Font.helveticaBoldOblique(), fontSize: 10, color: PdfColors.grey500, letterSpacing: 2)),
      pw.SizedBox(height: 6),
      pw.Text('Mode de paiement : ${facture.modePaiement}', style: pw.TextStyle(fontSize: 10)),
    ]);
  }

  static pw.Widget _buildNotes(EcritureComptable facture) {
    return pw.Column(crossAxisAlignment: pw.CrossAxisAlignment.start, children: [
      pw.Text('NOTES', style: pw.TextStyle(font: pw.Font.helveticaBoldOblique(), fontSize: 10, color: PdfColors.grey500, letterSpacing: 2)),
      pw.SizedBox(height: 6),
      pw.Container(
        padding: const pw.EdgeInsets.all(12),
        decoration: pw.BoxDecoration(
          color: PdfColors.grey50,
          borderRadius: const pw.BorderRadius.all(pw.Radius.circular(6)),
        ),
        child: pw.Text(facture.notes ?? '', style: pw.TextStyle(fontSize: 10, color: PdfColors.grey700)),
      ),
    ]);
  }

  static pw.Widget _buildFooter(String? societeNom) {
    return pw.Column(children: [
      pw.Divider(color: PdfColors.grey300),
      pw.SizedBox(height: 8),
      pw.Row(mainAxisAlignment: pw.MainAxisAlignment.spaceBetween, children: [
        pw.Text(societeNom ?? 'GS Stock', style: pw.TextStyle(fontSize: 8, color: PdfColors.grey500)),
        pw.Text('Document généré automatiquement', style: pw.TextStyle(fontSize: 8, color: PdfColors.grey500)),
      ]),
    ]);
  }

  static Future<void> download(
    EcritureComptable facture, {
    String? societeNom,
    String? logoUrl,
  }) async {
    final pdf = await generate(facture, societeNom: societeNom, logoUrl: logoUrl);
    await Printing.sharePdf(bytes: pdf, filename: 'Facture_${facture.reference}.pdf');
  }
}
