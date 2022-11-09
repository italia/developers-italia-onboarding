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

  const apiURL = config.apiURL.replace(/\/$/, '');

  try {
    const getPublisherResp = await fetch(`${apiURL}/publishers/${ipa}-${pec}`, {
      method: 'GET',
      headers: {'Content-Type': 'application/json', 'Authorization': `Bearer ${apiPasetoKey}`},
    });

    const publisher = await getPublisherResp.json();

    switch (getPublisherResp.status) {
    case 200:
      await updateExistingPublisher(apiURL, apiPasetoKey, publisher.id, pec, url, publisher.codeHosting);
      break;

    case 404:
      await createPublisher(apiURL, apiPasetoKey, pec, amministrazione, ipa, url);
      break;

    default:
      throw new Error('Risposta inattesa dal server.');
    }

    addToLegacyDB(db, referente, refTel, ipa, url, pec);

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

async function createPublisher(apiURL, apiPasetoKey, pec, amministrazione, ipa, url) {
  const apiPayload = {
    email: pec,
    description: amministrazione,
    codeHosting: [{
      url: url
    }],
    alternativeId: `${ipa}-${pec}`,
  };

  const res = await fetch(`${apiURL}/publishers`, {
    method: 'POST',
    body: JSON.stringify(apiPayload),
    headers: {'Content-Type': 'application/json', 'Authorization': `Bearer ${apiPasetoKey}`},
  });

  const data = await res.json();

  if (!res.ok) {
    throwValidationError(data);
  }
}

async function updateExistingPublisher(apiURL, apiPasetoKey, publisherID, pec, url, codeHosting) {
  const apiPayload = {
    email: pec,
    codeHosting: codeHosting.append({
      url: url
    }),
  };

  const res = await fetch(`${apiURL}/publishers/${publisherID}`, {
    method: 'PATCH',
    body: JSON.stringify(apiPayload),
    headers: {'Content-Type': 'application/json', 'Authorization': `Bearer ${apiPasetoKey}`},
  });

  const data = await res.json();

  if (!res.ok) {
    throwValidationError(data);
  }
}


function addToLegacyDB(db, referente, refTel, ipa, url, pec) {
  return db.get('registrati')
    .push({
      timestamp: new Date().toJSON(),
      referente: referente,
      refTel: refTel,
      ipa: ipa,
      url: url,
      pec: pec,
    }).write();
}

function throwValidationError(data) {
  throw data.validationErrors?.map(error => `
        Valore non valido: <strong>${error.value}</strong> per il campo: <strong>${error.field}</strong>
        con la regola: <strong>${error.rule}</strong><br>
      `).join('') || data.detail;
}

