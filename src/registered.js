'use strict';

const fs = require('fs-extra');
const low = require('lowdb');
const FileSync = require('lowdb/adapters/FileSync');
const getErrorMessage = require('./validation-error-message');
const validator = require('./validator');
const { VALIDATION_OK } = require('./validator-result.js');

const whitelistFile = 'private/data/whitelist.db.json';
fs.ensureFileSync(whitelistFile);
const adapter = new FileSync(whitelistFile);
const db = low(adapter);

module.exports = function (request, h) {
  const referente = request.query.nomeReferente;
  const refTel = request.query.refTel;
  const ipa = request.query.ipa;
  const url = request.query.url;
  const pec = request.query.pec;
  const amministrazione = request.query.amministrazione;

  const validationCheckDups = validator.checkDups(ipa, url);
  if (validationCheckDups != VALIDATION_OK) {
    return h.view(
      'register-confirm',
      {
        errorMsg: getErrorMessage(validationCheckDups),
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

  // Set some defaults (required if your JSON file is empty)
  db.defaults({ registrati: [] }).write();
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
