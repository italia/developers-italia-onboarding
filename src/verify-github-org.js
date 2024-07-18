'use strict';

const validator = require('./validator');

module.exports = async function(request) {
  const ipa = request.payload.ipa.trim();
  const url = request.payload.url.trim().toLowerCase();

  if (!validator.isValidCodeHostingUrl(url)) {
    return { error: 'Indirizzo del repository non valido' };
  }
  if (validator.isAlreadyOnboarded(ipa, url)) {
    return { error: 'Questo repository è già presente' };
  }

  return await validator.isGitHubValidated(url, request.server.app.indicePaWebsites[ipa]);
};
