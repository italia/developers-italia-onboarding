'use strict';

const config = require('./config');
const appVersion = require('../package.json').version;

module.exports = function (request, h) {
  return h.view('main-content', { esUrl: config.esUrl, appVersion }, { layout: 'index' });
};
