import 'dart:typed_data';
import 'package:dio/dio.dart';
import 'package:pdf/pdf.dart';
import 'package:pdf/widgets.dart' as pw;
import 'package:printing/printing.dart';
import 'package:gst_stock_mobile/models/models.dart';

class TicketPdfGenerator {
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
    PosVenteResult vente, {
    String? societeNom,
    String? logoUrl,
  }) async {
    final doc = pw.Document();
    final lignes = vente.facture.lignes ?? [];
    final logo = await _loadLogo(logoUrl);

    doc.addPage(pw.Page(
      pageFormat: PdfPageFormat.roll80,
      margin: const pw.EdgeInsets.all(10),
      build: (pw.Context ctx) => pw.Column(
        crossAxisAlignment: pw.CrossAxisAlignment.stretch,
        children: [
          if (logo != null)
            pw.Center(child: pw.Image(logo, height: 44)),
          pw.Center(
            child: pw.Text(
              societeNom ?? 'GS STOCK',
              style: pw.TextStyle(fontSize: 14, fontWeight: pw.FontWeight.bold),
            ),
          ),
          pw.SizedBox(height: 2),
          pw.Center(
            child: pw.Text(
              'Ticket ${vente.facture.numeroFacture ?? vente.facture.reference}',
              style: const pw.TextStyle(fontSize: 9),
            ),
          ),
          if (vente.vendeur != null)
            pw.Center(child: pw.Text('Vendeur : ${vente.vendeur}', style: const pw.TextStyle(fontSize: 9))),
          pw.Divider(),
          ...lignes.map((l) => pw.Row(
                mainAxisAlignment: pw.MainAxisAlignment.spaceBetween,
                children: [
                  pw.Expanded(
                    child: pw.Text(
                      '${l.quantite} x ${l.nomProduit ?? ''}',
                      style: const pw.TextStyle(fontSize: 9),
                    ),
                  ),
                  pw.Text(l.montantHt.toStringAsFixed(2), style: const pw.TextStyle(fontSize: 9)),
                ],
              )),
          pw.Divider(),
          _row('Total HT', vente.facture.montantHt),
          _row('TVA', vente.facture.montantTva ?? 0),
          _row('Total TTC', vente.facture.montantTtc, bold: true),
          if (vente.facture.modePaiement != null) _row('Payé', vente.facture.montantPaye),
          pw.Divider(),
          pw.SizedBox(height: 6),
          pw.Center(child: pw.Text('Merci de votre visite !', style: const pw.TextStyle(fontSize: 9))),
        ],
      ),
    ));

    return doc.save();
  }

  static pw.Widget _row(String label, double value, {bool bold = false}) => pw.Row(
        mainAxisAlignment: pw.MainAxisAlignment.spaceBetween,
        children: [
          pw.Text(
            label,
            style: pw.TextStyle(fontSize: 9, fontWeight: bold ? pw.FontWeight.bold : pw.FontWeight.normal),
          ),
          pw.Text(
            value.toStringAsFixed(2),
            style: pw.TextStyle(fontSize: 9, fontWeight: bold ? pw.FontWeight.bold : pw.FontWeight.normal),
          ),
        ],
      );

  static Future<void> printTicket(
    PosVenteResult vente, {
    String? societeNom,
    String? logoUrl,
  }) async {
    final bytes = await generate(vente, societeNom: societeNom, logoUrl: logoUrl);
    await Printing.layoutPdf(onLayout: (format) async => bytes);
  }
}
