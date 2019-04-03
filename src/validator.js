'use strict';
const { URL } = require('url');
const parseDomain = require('parse-domain');
const {VALIDATION_OK, VALIDATION_NOT_WHITELIST, VALIDATION_INVALID_URL} = require('./validator-result.js');

/**
 * Controlla se l'URL e' ben formata e se il nome del dominio rientra in una whitelist di url.
 *
 * @param url rappresenta l'url da controllare
 *
 * @return Un oggetto di tipo ValidatorResult
 */
function validateUrl(url) {
  const generalRegex = /^(https?):\/\/(www\.)?([a-z]+)(\.([\da-zA-Z-]+)){1,2}(\/[\da-zA-Z-]+)*\/?$/;
  if (!generalRegex.test(url)) {
    return VALIDATION_INVALID_URL;
  }
  if (!isInWhiteList(url)) {
    return VALIDATION_NOT_WHITELIST;
  }
  return VALIDATION_OK;
}

/**
 * Controlla se il dominio della URL passata rientra in una whitelist di domini
 *
 * @param url rappresenta l'url da controllare
 *
 * @return true se l'url e' presente nella whitelist, false altrimenti
 */
function isInWhiteList(url) {
  let result = false;
  const dictionary = {
    'github': /^(https?):\/\/(github\.com)\/([\da-zA-Z-_])*\/?$/,
    'bitbucket': /^(https?):\/\/(bitbucket\.org)\/([\da-zA-Z-_])*\/?$/,
    'gitlab': /^(https?):\/\/(gitlab\.com)\/([\da-zA-Z-_]+)\/?$/,
    'phabricator': /^(https?):\/\/(secure\.phabricator\.com)\/(p)\/([\da-zA-Z-_]+)\/?$/,
    'gitea': /^(https?):\/\/(try\.gitea\.io)\/([\da-zA-Z-_]+)\/?$/,
    'gogs': /^(https?):\/\/(try\.gogs\.io)\/([\da-zA-Z-_]+)\/?$/
  };

  const arrayUrl = [
    'https://github.com/',
    'https://bitbucket.org/',
    'https://gitlab.com/',
    'https://phabricator.com/',
    'https://gitea.io/',
    'https://gogs.io/'
  ];

  const urlParsed = new URL(url);
  const protocol = urlParsed.protocol;
  const hostname = urlParsed.hostname;

  const domainParsed = parseDomain(url);
  if (domainParsed != null) {
    const domain = domainParsed.domain;

    const regex = dictionary[domain];
    const isValid = regex && regex.test(url);

    let baseUrl = '';

    /*  Gli url nella forma  https://try.gogs.io/<username>/<projectname>,
                            https://try.gitea.io/<username>/<projectname>,
                            https://secure.phabricator.com/project/view/395/
        devono diventare    https://gogs.io/<username>/<projectname>,
                            https://gitea.io/<username>/<projectname>,
                            https://phabricator.com/project/view/<numProject>/
    */
    if (['gitea', 'gogs', 'phabricator'].includes(domain)) {
      baseUrl = `${protocol}//${domain}.${domainParsed.tld}/`;
    } else {
      baseUrl = `${protocol}//${hostname}/`;
    }

    result = isValid && arrayUrl.includes(baseUrl);
  }
  return result;
}

module.exports = validateUrl;
