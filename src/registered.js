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

  const apiPasetoKey = await getPasetoKey();
  const apiPayload = {
    email: pec,
    description: amministrazione,
    codeHosting: [{
      url: url
    }],
    alternativeId: ipa,
  };

  const apiURL = config.apiURL.replace(/\/$/, '');

  try {
    const getPublisherResp = await fetch(`${apiURL}/publishers/${ipa}`, {
      method: 'GET',
      headers: {'Content-Type': 'application/json', 'Authorization': `Bearer ${apiPasetoKey}`},
    });

    const publisher = await getPublisherResp.json();

    switch (getPublisherResp.status) {
    case 200:
      await updateExistingPublisher(apiURL, apiPayload, apiPasetoKey, publisher.id);
      break;

    case 404:
      await createPublisher(apiURL, apiPayload, apiPasetoKey);
      break;
    }


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
  } catch (err) {
    console.error(err);

    return h.view(
      'register-confirm',
      {
        errorMsg: 'Errore imprevisto nel salvataggio, riprovare più tardi',
        errorDetail: err,
        referente,
        refTel,
        ipa,
        url,
        pec,
        amministrazione,
        apiError: true,
        token,
      },
      {layout: 'index'}
    );
  }

  return h.view('confirmed', null, {layout: 'index'});
};

async function createPublisher(apiURL, apiPayload, apiPasetoKey) {
  const res = await fetch(`${apiURL}/publishers`, {
    method: 'POST',
    body: JSON.stringify(apiPayload),
    headers: {'Content-Type': 'application/json', 'Authorization': `Bearer ${apiPasetoKey}`},
  });

  const data = await res.json();

  if (!res.ok) {
    throw data.validationErrors?.map(error => `
        Valore non valido: <strong>${error.value}</strong> per il campo: <strong>${error.field}</strong>
        con la regola: <strong>${error.rule}</strong><br>
      `).join('') || data.detail;
  }
}

async function updateExistingPublisher(apiURL, apiPayload, apiPasetoKey, publisherID) {
  const res = await fetch(`${apiURL}/publishers/${publisherID}`, {
    method: 'PATCH',
    body: JSON.stringify(apiPayload),
    headers: {'Content-Type': 'application/json', 'Authorization': `Bearer ${apiPasetoKey}`},
  });

  const data = await res.json();

  if (!res.ok) {
    throw data.validationErrors?.map(error => `
        Valore non valido: <strong>${error.value}</strong> per il campo: <strong>${error.field}</strong>
        con la regola: <strong>${error.rule}</strong><br>
      `).join('') || data.detail;
  }
}
