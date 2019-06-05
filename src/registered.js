'use strict';

const fs = require('fs-extra');
const low = require('lowdb');
const FileSync = require('lowdb/adapters/FileSync');

const i18helper = require('./i18helper.js');

const whitelistFile = 'private/data/whitelist.db.json';
fs.ensureFileSync(whitelistFile);
const adapter = new FileSync(whitelistFile);
const db = low(adapter);

// Set some defaults (required if your JSON file is empty)
db.defaults({ registrati: [] }).write();

module.exports = function (request, h) {
  const referente = request.query.nomeReferente;
  const ipa = request.query.ipa;
  const url = request.query.url;
  const pec = request.query.pec;

  db.get('registrati')
    .push({
      referente: referente,
      ipa: ipa,
      url: url,
      pec: pec
    })
    .write();

  const mainCatalog = i18helper.getCatalog(request, 'main');
  const confirmedCatalog = i18helper.getCatalog(request, 'confirmed');
  let catalog = {
          "common": commonCatalog,
          "confirmed" : confirmedCatalog
  }

  return h.view('confirmed', catalog, { layout: 'index' });
};
