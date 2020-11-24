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
 * Validates the format of the given phone number
 *
 * @param {string} phone phone number to be validated
 * @return An object of type ValidatorResult
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
