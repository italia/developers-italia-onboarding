'use strict';

const fs = require('fs-extra');
const yaml = require('json2yaml');

module.exports = function (request, h) {

  const whiteList = 'private/data/whitelist.db.json';
  const listRepo = fs.readFileSync(whiteList).toString('utf8');
  const jsonList = JSON.parse(listRepo);

  if (jsonList.registrati.length > 0) {
    // removing sensible data from listing
    jsonList.registrati.forEach((element) => {
      delete element.referente;
      delete element.refTel;
    });
    const ymlText = yaml.stringify(jsonList);

    return h.response(ymlText)
      .header('cache-control', 'no-cache')
      .type('text/yaml; charset=utf-8');
  }
  return 'Lista repository vuota';
};
