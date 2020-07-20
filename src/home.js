'use strict';

const config = require('./config');

module.exports = function (request, h) {
  return h.view('main-content', { esUrl: config.esUrl }, { layout: 'index' });
};