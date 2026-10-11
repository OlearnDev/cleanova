const { Parser } = require('json2csv');

/**
 * Convertit un tableau d'objets en CSV et l'envoie en telechargement.
 */
function sendCsv(res, filename, rows) {
  const parser = new Parser();
  const csv = rows.length ? parser.parse(rows) : '';
  res.setHeader('Content-Type', 'text/csv; charset=utf-8');
  res.setHeader('Content-Disposition', `attachment; filename=${filename}`);
  res.send('﻿' + csv); // BOM pour compatibilite Excel avec les accents
}

module.exports = { sendCsv };
