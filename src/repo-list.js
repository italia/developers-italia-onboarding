'use strict';

const fs = require('fs-extra');
const yaml = require('json2yaml');

module.exports = function () {
  const whiteList = 'private/data/whitelist.db.json';
  const listRepo = fs.readFileSync(whiteList).toString('utf8');
  const jsonList = JSON.parse(listRepo);

  if (jsonList.registrati.length > 0) {
    jsonList.registrati.forEach((element) => delete element.referente);
    const ymlText = yaml.stringify(jsonList);

    return ymlText;
  }
  return 'Lista repository vuota';
  
};