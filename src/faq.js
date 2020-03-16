'use strict';

module.exports = function (request, h) {
  return h.view('faq', null, { layout: 'index' });
};