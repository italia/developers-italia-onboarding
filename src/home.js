'use strict';

const config = require('./config');
const appVersion = require('../package.json').version;

module.exports = function (request, h) {
  return h.view(
    'main-content', {
      appVersion,
      pa: {
        esUrl: config.esUrl,
        ipa: '',
        pec: '',
        url: '',
        description: '',
        nomeReferente: '',
        telReferente: '',
      },
    }, {
      layout: 'index'
    });
};
