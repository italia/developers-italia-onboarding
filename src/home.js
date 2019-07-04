'use strict';
const i18helper = require('./i18helper.js');

module.exports = function (request, h) {
	const mainCatalog = i18helper.getCatalog(request, 'main');
  const commonCatalog = i18helper.getCatalog(request, 'common');
  let catalog = {
	  "common": commonCatalog,
	  "main" : mainCatalog
  }
  return h.view('main-content', catalog, { layout: 'index' });
};
