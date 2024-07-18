'use strict';

const validator = require('./validator');

module.exports = async function(request, h) {
  const refTel = request.payload.telReferente.replace(/\s/g, '');
  const ipa = request.payload.ipa.trim();
  const url = request.payload.url.trim();
  const pec = request.payload.pec;

  if (!validator.isValidCodeHostingUrl(url)) {
    let data = { errorMsg: 'Indirizzo del repository non valido', pa: request.payload };
    return h.view('main-content', data, { layout: 'index' });
  }
  if (!validator.isValidPhoneNumber(refTel)) {
    let data = { errorMsg: 'Numero di telefono non valido', pa: request.payload };
    return h.view('main-content', data, { layout: 'index' });
  }
  if (validator.isAlreadyOnboarded(ipa, url)) {
    let data = { errorMsg: 'Questo repository è già presente', pa: request.payload };
    return h.view('main-content', data, { layout: 'index' });
  }
  const ipaMatchesPec = await validator.ipaMatchesPec(ipa, pec);
  if (ipaMatchesPec === null) {
    let data = {
      errorMsg: 'Errore inaspettato nel controllo della validità dei dati, riprovare più tardi',
      pa: request.payload
    };
    return h.view('main-content', data, { layout: 'index' });
  }
  if (!ipaMatchesPec) {
    let data = { errorMsg: 'Nessun Ente con questo codice iPA e PEC', pa: request.payload };
    return h.view('main-content', data, { layout: 'index' });
  }

  const u = new URL(url);
  const fastOnboarding = (u.host == 'github.com');

  let data = { fastOnboarding, pa: request.payload };
  return h.view('fast-onboarding', data, { layout: 'index' });
};
