'use strict';
const jwt = require('jsonwebtoken');
const key = require('./get-jwt-key.js')();
const i18helper = require('./i18helper.js');

module.exports = function (request, h) {
  const token = request.query.token;
  const decoded = jwt.verify(token, key);

  const referente = decoded.referente;
  const ipa = decoded.ipa;
  const url = decoded.url;
  const pec = decoded.pec;
  const amministrazione = decoded.description;

  let data = {
    referente: referente,
    ipa: ipa,
    url: url,
    pec: pec,
    amministrazione: amministrazione
  };
  const registerConfirmCatalog = i18helper.getCatalog(request, 'register_confirm');
  const commonCatalog = i18helper.getCatalog(request, 'common');
  data.common = commonCatalog;
  data.register_confirm = registerConfirmCatalog;
  return h.view('register-confirm', data, { layout: 'index' });
};
