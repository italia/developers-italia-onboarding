'use strict';
const { VALIDATION_OK, VALIDATION_ALREADY_PRESENT,
  VALIDATION_INVALID_URL, VALIDATION_PHONE } = require('./validator-result.js');
const fs = require('fs-extra');
const low = require('lowdb');
const FileSync = require('lowdb/adapters/FileSync');


const whitelistFile = 'private/data/whitelist.db.json';
fs.ensureFileSync(whitelistFile);
const adapter = new FileSync(whitelistFile);
const db = low(adapter);

/**
 * Controlla se l'URL e' ben formata. Sono supportati fino a 5 livelli di dominio.
 *
 * @param url rappresenta l'url da controllare
 *
 * @return Un oggetto di tipo ValidatorResult
 */
function validateUrl(url) {
  const generalRegex = /^(https?):\/\/(www\.)?([a-z]+)(\.([\da-zA-Z-]+)){1,5}(\/[\da-zA-Z-_]+)*\/?$/;
  if (!generalRegex.test(url)) {
    return VALIDATION_INVALID_URL;
  }
  return VALIDATION_OK;
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



module.exports = {
  url: validateUrl,
  phone: validatePhoneNumber,
  checkDups: checkDups
};
