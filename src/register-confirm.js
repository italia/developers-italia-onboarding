'use strict';
const jwt = require('jsonwebtoken');
const amministrazioni = require('../public/assets/data/authorities.db.json');
const key = require('./get-jwt-key.js')();

module.exports = function (request, h) {
  const token = request.query.token;
  const decoded = jwt.verify(token, key);

  const referente = decoded.referente;
  const ipa = decoded.ipa;
  const url = decoded.url;
  const pec = amministrazioni[ipa].pec;
  const amministrazione = amministrazioni[ipa].description;

  let data = {
    referente: referente,
    ipa: ipa,
    url: url,
    pec: pec,
    amministrazione: amministrazione
  };
  return h.view('register-confirm', data, { layout: 'index' });
};
