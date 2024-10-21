'use strict';

const fs = require('fs-extra');
const low = require('lowdb');
const FileSync = require('lowdb/adapters/FileSync');

const validator = require('./validator');
const config = require('./config');
const whitelistFile = 'private/data/whitelist.db.json';
const fetch = require('cross-fetch').fetch;

module.exports = async function(request, h) {
  const referente = request.payload.nomeReferente.trim();
  const refTel = request.payload.telReferente.replace(/\s/g, '');
  const ipa = request.payload.ipa.trim();
  const amministrazione = request.payload.description;
  const url = request.payload.url.trim();
  const pec = request.payload.pec;

  fs.ensureFileSync(whitelistFile);
  const adapter = new FileSync(whitelistFile);
  const db = low(adapter);

  // Set some defaults (required if your JSON file is empty)
  db.defaults({ registrati: [] }).write();

  if (!validator.isValidCodeHostingUrl(url)) {
    return h.view('fast-onboarding-error', { errorMsg: 'Indirizzo del repository non valido', });
  }
  if (validator.isAlreadyOnboarded(ipa, url)) {
    return h.view('fast-onboarding-error', { errorMsg: 'Questo repository è già presente', });
  }

  const result = await validator.isGitHubValidated(url, request.server.app.indicePaWebsites[ipa]);
  if (result.isVerified !== true) {
    let errorDetail = null;

    if (result.error) {
      errorDetail = result.error;
    }
    if (!result.ipaWebsite) {
      errorDetail += '\nIl sito web configurato in IndicePA non è valido';
    }
    if (!result.githubWebsite) {
      errorDetail += '\nIl sito web configurato in GitHub non è valido';
    }

    return h.view(
      'fast-onboarding-error',
      {
        errorMsg: 'Questo repository non è verificato su GitHub',
        errorDetail,
      });
  }

  // this will reload file to be more permissive
  // and allow external manipulation
  db.read();

  const apiURL = config.apiURL.replace(/\/$/, '');

  try {
    const getPublisherResp = await fetch(`${apiURL}/publishers/${ipa}`, {
      method: 'GET',
      headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${config.pasetoApiToken}` },
    });

    const publisher = await getPublisherResp.json();

    switch (getPublisherResp.status) {
    case 200:
      await updateExistingPublisher(apiURL, config.pasetoApiToken, publisher.id, pec, url, publisher.codeHosting);
      break;

    case 404:
      await createPublisher(apiURL, config.pasetoApiToken, pec, amministrazione, ipa, url);
      break;

    default:
      throw `Risposta inattesa dal server: ${getPublisherResp.status} - ${getPublisherResp.statustext}`;
    }

    addToLegacyDB(db, referente, refTel, ipa, url, pec);
  } catch (err) {
    console.error(err);

    return h.view(
      'fast-onboarding-error',
      {
        errorMsg: 'Errore imprevisto nel salvataggio, riprovare più tardi',
        errorDetail: err,
      },
      { layout: 'index' }
    );
  }

  return h.view('confirmed', null, { layout: 'index' });
};

async function createPublisher(apiURL, pasetoApiToken, pec, amministrazione, ipa, url) {
  const apiPayload = {
    email: pec,
    description: amministrazione,
    codeHosting: [{
      url: url
    }],
    alternativeId: ipa,
  };

  const res = await fetch(`${apiURL}/publishers`, {
    method: 'POST',
    body: JSON.stringify(apiPayload),
    headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${pasetoApiToken}` },
  });

  const data = await res.json();

  if (!res.ok) {
    let errorText = `Risposta dall'API: ${res.status} - ${res.statusText}`;
    const errors = validationErrors(data);

    if (errors) {
      errorText += `\n${errors}`;
    }
    throw errorText;
  }
}

async function updateExistingPublisher(apiURL, pasetoApiToken, publisherID, pec, url, codeHosting) {
  const apiPayload = {
    email: pec,
    codeHosting: codeHosting.push({
      url: url
    }),
  };

  const res = await fetch(`${apiURL}/publishers/${publisherID}`, {
    method: 'PATCH',
    body: JSON.stringify(apiPayload),
    headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${pasetoApiToken}` },
  });

  const data = await res.json();

  if (!res.ok) {
    let errorText = `Risposta dall'API: ${res.status} - ${res.statusText}`;
    const errors = validationErrors(data);

    if (errors) {
      errorText += `\n${errors}`;
    }
    throw errorText;
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

function validationErrors(data) {
  return data.validationErrors?.map(error => `
        Valore non valido: <strong>${error.value}</strong> per il campo: <strong>${error.field}</strong> (<strong>${error.rule}</strong>)<br>
      `).join('') || data.detail;
}

