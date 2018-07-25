'use strict';

const fs = require('fs-extra');
const low = require('lowdb');
const FileSync = require('lowdb/adapters/FileSync');
const jwt = require('jsonwebtoken');
const amministrazioni = require('../public/assets/data/authorities.db.json');
const key = require('./get-jwt-key.js')();

const whitelistFile = 'private/data/whitelist.db.json';
fs.ensureFileSync(whitelistFile);
const adapter = new FileSync(whitelistFile);
const db = low(adapter);

// Set some defaults (required if your JSON file is empty)
db.defaults({ registrati: [] }).write();

module.exports = function (request, h) {
  const token = request.query.token;
  const decoded = jwt.verify(token, key);

  const referente = decoded.referente;
  const ipa = decoded.ipa;
  const url = decoded.url;
  const pec = amministrazioni[ipa].pec;

  db.get('registrati')
    .push({
      referente: referente,
      ipa: ipa,
      url: url,
      pec: pec
    })
    .write();

  return h.view('confirmed', null, { layout: 'index' });
};
