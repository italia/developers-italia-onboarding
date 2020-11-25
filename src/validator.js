'use strict';
const { VALIDATION_OK, VALIDATION_ALREADY_PRESENT,
  VALIDATION_INVALID_URL, VALIDATION_PHONE,
  VALIDATION_INCONSISTENT_DATA,
  VALIDATION_TEMPORARY_ERROR,
} = require('./validator-result.js');

const { Client } = require('@elastic/elasticsearch');
const fs = require('fs-extra');
const low = require('lowdb');
const FileSync = require('lowdb/adapters/FileSync');

const whitelistFile = 'private/data/whitelist.db.json';
fs.ensureFileSync(whitelistFile);
const adapter = new FileSync(whitelistFile);
const db = low(adapter);

/**
 * Check if the URL HTTP(s) and well-formed.
 *
 * @param url URL to check
 *
 * @return VALIDATION_OK or VALIDATION_INVALID_URL
 */
function validateUrl(url) {
  try {
    const u = new URL(url);
    return u.protocol === 'http:' || u.protocol === 'https:'
      ? VALIDATION_OK
      : VALIDATION_INVALID_URL;
  } catch(_) {
    return VALIDATION_INVALID_URL;
  }
}

/**
 * Controlla il formato del numero telefonico
 *
 * @param {string} phone numero telefonico da verificare
 * @return Un oggetto di tipo ValidatorResult
 */
function validatePhoneNumber(phone) {
  const phoneRegex = /^\+?[1-9]\d{1,14}$/;
  if (!phoneRegex.test(phone)) {
    return VALIDATION_PHONE;
  }
  return VALIDATION_OK;
}


/**
 * It returns VALIDATION_ALREADY_PRESENT if data already present
 * @param {string} ipa
 * @param {string} url
 */
function checkDups(ipa, url) {
  // db must be reloaded
  db.read();
  const data = db.get('registrati')
    .filter({ ipa: ipa, url: url })
    .value();

  if (data.length > 0) {
    return VALIDATION_ALREADY_PRESENT;
  } else {
    return VALIDATION_OK;
  }
}

/**
 * Returns true the iPa code matches its valid PEC address, false otherwise.
 *
 * @param {string} ipa The iPA code
 * @param {string} pec The PEC address
 */
async function ipaMatchesPec(ipa, pec) {
  const ipaRegex = /^[a-z0-9_]+$/i;
  const pecRegex = /^[a-z0-9@._-]+$/i;

  if (!ipa?.match(ipaRegex) || !pec?.match(pecRegex)) {
    return VALIDATION_INCONSISTENT_DATA;
  }

  const es = new Client({ node: 'https://elasticsearch.developers.italia.it' });
  const query = {
    index: 'indicepa_pec',
    body: {
      query: {
        constant_score: {
          filter: {
            bool: {
              must: [
                { term: { 'pec.keyword': pec } },
                { term: { 'ipa.keyword': ipa } }
              ]
            }
          }
        }
      }
    }
  };

  try {
    const res = await es.search(query);

    return (res?.body?.hits?.hits?.length > 0)
      ? VALIDATION_OK
      : VALIDATION_INCONSISTENT_DATA;
  } catch (e) {

    return VALIDATION_TEMPORARY_ERROR;
  }
}

module.exports = {
  url: validateUrl,
  phone: validatePhoneNumber,
  checkDups,
  ipaMatchesPec,
};
