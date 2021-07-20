'use strict';

const fs = require('fs-extra');
const jwt = require('jsonwebtoken');
const key = require('./get-jwt-key.js')();
const low = require('lowdb');
const FileSync = require('lowdb/adapters/FileSync');

const validator = require('./validator');
const whitelistFile = 'private/data/whitelist.db.json';

module.exports = function (request, h) {

  const token = request.query.token;
  const decoded = jwt.verify(token, key);

  const referente = decoded.referente;
  const refTel = decoded.refTel;
  const ipa = decoded.ipa;
  const url = decoded.url;
  const pec = decoded.pec;
  const amministrazione = decoded.description;

  fs.ensureFileSync(whitelistFile);
  const adapter = new FileSync(whitelistFile);
  const db = low(adapter);

  // Set some defaults (required if your JSON file is empty)
  db.defaults({ registrati: [] }).write();

  if (validator.isAlreadyOnboarded(ipa, url)) {
    return h.view(
      'register-confirm',
      {
        errorMsg: 'Questo repository è già presente',
        referente,
        refTel,
        ipa,
        url,
        pec,
        amministrazione,
      },
      { layout: 'index' }
    );
  }

  // this will reload file to be more permissive
  // and allow external manipulation
  db.read();

  db.get('registrati')
    .push({
      timestamp: new Date().toJSON(),
      referente: referente,
      refTel: refTel,
      ipa: ipa,
      url: url,
      pec: pec,
    })
    .write();

  return h.view('confirmed', null, { layout: 'index' });
};
