'use strict';

const fs = require('fs-extra');
const jwt = require('jsonwebtoken');
const key = require('./get-jwt-key.js')();
const low = require('lowdb');
const FileSync = require('lowdb/adapters/FileSync');

const validator = require('./validator');
const config = require('./config');
const whitelistFile = 'private/data/whitelist.db.json';
const getPasetoKey = require('./api/get-paseto-key.js');
const fetch = require('cross-fetch').fetch;

module.exports = async function (request, h) {

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
  db.defaults({registrati: []}).write();

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
      {layout: 'index'}
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


  const apiPasetoKey = await getPasetoKey();
  const apiPayload = {
    email: pec,
    codeHosting: [{
      url: url
    }],
  };

  fetch(config.apiURL + '/publishers', {
    method: 'POST',
    body: JSON.stringify(apiPayload),
    headers: {'Content-Type': 'application/json', 'Authorization': 'Bearer ' + apiPasetoKey}
  }).then(res => {
    console.log(res.json());
  });


  return h.view('confirmed', null, {layout: 'index'});
};
