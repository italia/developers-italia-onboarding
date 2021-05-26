'use strict';
const { Client } = require('@elastic/elasticsearch');
const fs = require('fs-extra');
const low = require('lowdb');
const FileSync = require('lowdb/adapters/FileSync');

const whitelistFile = 'private/data/whitelist.db.json';
fs.ensureFileSync(whitelistFile);
const adapter = new FileSync(whitelistFile);
const db = low(adapter);

/**
 * Returns true if data already present
 *
 * @param {string} ipa
 * @param {string} url
 */
function isAlreadyOnboarded(ipa, url) {
  // db must be reloaded
  db.read();
  const data = db.get('registrati')
    .filter({ ipa: ipa, url: url })
    .value();

  return data.length > 0;
}

/**
 * Returns true the iPa code matches its valid PEC address, false otherwise.
 *
 * Returns null if there's a problem while checking with the remote Elasticsearch
 * server.
 *
 * @param {string} ipa The iPA code
 * @param {string} pec The PEC address
 */
async function ipaMatchesPec(ipa, pec) {
  const ipaRegex = /^[a-z0-9_]+$/i;
  const pecRegex = /^[a-z0-9@._-]+$/i;

  if (!ipa?.match(ipaRegex) || !pec?.match(pecRegex)) {
    return false;
  }

  const es = new Client({ node: 'https://elasticsearch.developers.italia.it' });
  const query = {
    index: 'indicepa_pec',
    body: {
      query: {
        constant_score: {
          filter: {
            bool: {
              must: [
                { term: { 'pec.keyword': pec } },
                { term: { 'ipa.keyword': ipa } }
              ]
            }
          }
        }
      }
    }
  };

  try {
    const res = await es.search(query);

    return res?.body?.hits?.hits?.length > 0;
  } catch (e) {
    return null;
  }
}

function isValidCodeHostingUrl(url) {
  try {
    const u = new URL(url);
    if (u.protocol != 'https:') {
      return false;
    }

    if (u.host == 'github.com' || u.host == 'gitlab.com' || u.host == 'bitbucket.org') {
      const orgsRegexp = new RegExp('^/[^/]+?/{0,1}$');

      return orgsRegexp.test(u.pathname);
    }
  } catch(_) {
    return false;
  }

  return true;
}

function isValidPhoneNumber(phone) {
  const regex = /^\+{0,1}\d{8,15}$/;

  return regex.test(phone);
}

module.exports = {
  isAlreadyOnboarded,
  ipaMatchesPec,
  isValidCodeHostingUrl,
  isValidPhoneNumber,
};
