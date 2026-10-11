const PDFDocument = require('pdfkit');

/**
 * Ecrit une facture PDF simple pour une reservation dans le flux de reponse HTTP `res`.
 */
function streamInvoicePdf(res, booking) {
  res.setHeader('Content-Type', 'application/pdf');
  res.setHeader('Content-Disposition', `attachment; filename=facture-${booking.id}.pdf`);

  const doc = new PDFDocument({ margin: 50 });
  doc.pipe(res);

  doc.fontSize(20).fillColor('#15803d').text('Cleanova Solutions', { align: 'left' });
  doc.fontSize(10).fillColor('#333').text('Solutions de nettoyage professionnelles');
  doc.moveDown(1.5);

  doc.fontSize(16).fillColor('#000').text(`Facture #${booking.id}`);
  doc.fontSize(10).fillColor('#555').text(`Date d'emission: ${new Date().toLocaleDateString('fr-FR')}`);
  doc.moveDown();

  doc.fontSize(12).fillColor('#000').text('Client:', { continued: true }).fillColor('#333').text(` ${booking.client_first_name} ${booking.client_last_name}`);
  doc.fillColor('#000').text('Adresse d\'intervention:', { continued: true }).fillColor('#333').text(` ${booking.address}`);
  doc.moveDown();

  doc.fillColor('#000').fontSize(12).text('Detail de la prestation');
  doc.moveDown(0.3);
  doc.fontSize(10).fillColor('#333');
  doc.text(`Service: ${booking.service_name}`);
  doc.text(`Date prevue: ${booking.scheduled_date} a ${booking.scheduled_time}`);
  doc.text(`Statut: ${booking.status}`);
  doc.moveDown();

  doc.fontSize(12).fillColor('#000').text(`Total: ${Number(booking.total_price).toFixed(2)} $ CAD`, { align: 'right' });
  doc.fontSize(10).fillColor('#555').text(`Statut du paiement: ${booking.payment_status}`, { align: 'right' });

  doc.moveDown(2);
  doc.fontSize(9).fillColor('#888').text('Merci de faire confiance a Cleanova Solutions.', { align: 'center' });

  doc.end();
}

module.exports = { streamInvoicePdf };
