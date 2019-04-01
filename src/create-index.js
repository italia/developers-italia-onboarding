'use strict';

const path = require('path');
const request = require('request');
const papa = require('papaparse');
const lunr = require('lunr');
const writeFileAtomicSync = require('write-file-atomic').sync;
const fs = require('fs');

const BASE_URL = 'http://www.indicepa.gov.it/public-services/opendata-read-service.php?dstype=FS&filename=';
const PUB_AMM_URL = `${BASE_URL}amministrazioni.txt`;

const AUTH_IDX_PATH = path.join(__dirname, '..', 'public', 'assets', 'data', 'authorities.index.json');
const AUTH_DB_PATH = path.join(__dirname, '..', 'public', 'assets', 'data', 'authorities.db.json');
const AMM_PATH = path.join(__dirname, '..', 'amministrazioni.txt');
const AMM_TMP_PATH = path.join('/tmp', 'amministrazioni.txt');


const COD_AMM = 0;
const DES_AMM = 1;
// const COMUNE = 2;
// const NOME_RESP = 3;
// const COGN_RESP = 4;
// const CAP = 5;
// const PROVINCIA = 6;
// const REGIONE = 7;
// const SITO_ISTITUZIONALE = 8;
// const INDIRIZZO = 9;
// const TITOLO_RESP = 10;
// const TIPOLOGIA_ISTAT = 11;
// const TIPOLOGIA_AMM = 12;
// const ACRONIMO = 13;
// const CF_VALIDATO = 14;
// const CF = 15;
const MAIL1 = 16;
const TIPO_MAIL1 = 17;
// const MAIL2 = 18;
// const TIPO_MAIL2 = 19;
// const MAIL3 = 20;
// const TIPO_MAIL3 = 22;
// const MAIL4 = 23;
// const TIPO_MAIL4 = 24;
// const MAIL5 = 25;
// const TIPO_MAIL5 = 26;
// const URL_FACEBOOK = 27;
// const URL_TWITTER = 28;
// const URL_GOOGLEPLUS = 29;
// const URL_YOUTUBE = 30;
// const LIV_ACCESSIBILI = 31;


/*
flow:
  - check if amministrazioni.txt file exists
  - check stat mtime of already converted (auth*.json) files
  - if older then 6hrs
    - no: use the cached ones
    - yes: read amministrazioni.txt file from target dir (docker volume exposed)
      - if invalid or not present download a new one in tmp dir
      - parse tmp|exposed file
      - store new auth*.json files
*/

/**
 *   checking last modified date for db files
 *   if already downloaded and parsed in last 6hrs
 *   skip the download again.
 *
 * @returns a valid Promise if data are consistent
 */
const checkFileStat = () => {
  let sixHrsInms = 1000 * 60 * 60 * 6;
  try {
    let file = fs.statSync(AUTH_DB_PATH);
    let difference = new Date() - new Date(file.mtime);
    if (difference < sixHrsInms) {
      console.log('file was generated in latest six hours');
      return new Promise((res) => {
        res();
      });
    } else {
      console.log('file is older then six hours');
      return readFile(false)
        .then((data) => {
          return parseContent(data);
        });
    }
  } catch (e) {
    console.log('no db files exists, generating...');
    return readFile(false)
      .then((data) => {
        return parseContent(data);
      })
      .catch(() => {
        return downloadFile()
          .then((data) => {
            return writeTempFile(data);
          })
          .then(() => {
            return readFile(true);
          })
          .then((data) => {
            return parseContent(data);
          });
      }).catch((m) => {
        console.log('something has failed', m);
      });
  }
};

const readFile = (isTmp) => {
  return new Promise((resolve, reject) => {
    let file = (isTmp) ? AMM_TMP_PATH : AMM_PATH;
    console.log(`reading ${file} file`);
    fs.readFile(file, 'utf8', (err, data) => {
      //TODO reject if file is invalid or empty
      err ? reject(err) : resolve(data);
    });
  });
};

const downloadFile = () => {
  return new Promise((resolve, reject) => {
    console.log(`GET: ${PUB_AMM_URL}`);
    request(PUB_AMM_URL, (err, res, data) => {
      err ? reject(err) : resolve(data);
    });
  });
};


const writeTempFile = (data) => {
  return new Promise((resolve, reject) => {
    console.log(`GET: ${PUB_AMM_URL}`);
    fs.writeFile(AMM_TMP_PATH, data, (err) => {
      err ? reject(err) : resolve('wrote tmp file');
    });
  });
};


const parseContent = (data_csv) => {
  return new Promise((resolve) => {
    console.log('converting the CSV string in an array');
    const data = papa.parse(data_csv).data;
    let arr = [];
    data.shift();
    arr[COD_AMM] = 'sebba';
    arr[DES_AMM] = 'sebba azienda';
    arr[MAIL1] = 'sebbalex@gmail.com';
    arr[TIPO_MAIL1] = 'pec';
    data.push(arr);

    console.log('index data in lunar.js format');
    let paDb = {};
    let index = lunr(function () {
      this.ref('code');
      this.field('code', {boost: 6});
      this.field('description', {boost: 3});

      data.forEach((row) => {
        this.add({
          code: row[COD_AMM],
          description: row[DES_AMM]
        });

        paDb[row[COD_AMM]] = {
          description: row[DES_AMM],
          pec: row[TIPO_MAIL1] == 'pec' ? row[MAIL1] : ''
        };
      });
    });

    console.log('WRITE: authorities.index.json');
    const serializedIndex = JSON.stringify(index);
    writeFileAtomicSync(AUTH_IDX_PATH, serializedIndex);

    console.log('WRITE: authorities.db.json');
    const serializedPaDb = JSON.stringify(paDb);
    writeFileAtomicSync(AUTH_DB_PATH, serializedPaDb);


    resolve();
  });
};

module.exports = function () {
  return checkFileStat();
};
