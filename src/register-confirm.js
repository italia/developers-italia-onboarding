'use strict';
const jwt = require('jsonwebtoken');
const getErrorMessage = require('./validation-error-message.js');
const { VALIDATION_OK } = require('./validator-result.js');
const validator = require('./validator.js');
const key = require('./get-jwt-key.js')();

module.exports = function (request, h) {
  const token = request.query.token;
  const decoded = jwt.verify(token, key);

  const referente = decoded.referente;
  const refTel = decoded.refTel;
  const ipa = decoded.ipa;
  const url = decoded.url;
  const pec = decoded.pec;
  const amministrazione = decoded.description;

  const validationCheckDups = validator.checkDups(ipa, url);
  let errorMsg = null;

  if (validationCheckDups != VALIDATION_OK) {
    errorMsg = getErrorMessage(validationCheckDups);
  }

  return h.view(
    'register-confirm',
    {
      errorMsg,
      referente,
      refTel,
      ipa,
      url,
      pec,
      amministrazione,
      token,
    },
    { layout: 'index' }
  );
};
