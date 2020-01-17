'use strict';
const { VALIDATION_OK, 
  VALIDATION_INVALID_URL, VALIDATION_PHONE } = require('./validator-result.js');

/**
 * Controlla se l'URL e' ben formata.
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


module.exports = {
  url: validateUrl, 
  phone: validatePhoneNumber
};
