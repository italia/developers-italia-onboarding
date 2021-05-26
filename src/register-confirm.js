'use strict';
const jwt = require('jsonwebtoken');
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

  let errorMsg = null;

  if (validator.isAlreadyOnboarded(ipa, url)) {
    errorMsg = 'Questo repository è già presente';
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
