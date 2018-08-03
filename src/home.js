'use strict';

module.exports = function (request, h) {
  return h.view('main-content', null, { layout: 'index' });
};