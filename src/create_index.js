'use strict';

const path = require('path');
const request = require('request');
const papa = require('papaparse');
const lunr = require('lunr');
const writeFileAtomicSync = require('write-file-atomic').sync;

const BASE_URL = 'http://www.indicepa.gov.it/public-services/opendata-read-service.php?dstype=FS&filename='
const PUB_AMM_URL = `${BASE_URL}amministrazioni.txt`;

const COD_AMM = 0;
const DES_AMM = 1;
const COMUNE = 2;
const NOME_RESP = 3;
const COGN_RESP = 4;
const CAP = 5;
const PROVINCIA = 6;
const REGIONE = 7;
const SITO_ISTITUZIONALE = 8;
const INDIRIZZO = 9;
const TITOLO_RESP = 10;
const TIPOLOGIA_ISTAT = 11;
const TIPOLOGIA_AMM = 12;
const ACRONIMO = 13;
const CF_VALIDATO = 14;
const CF = 15;
const MAIL1 = 16;
const TIPO_MAIL1 = 17;
const MAIL2 = 18;
const TIPO_MAIL2 = 19;
const MAIL3 = 20;
const TIPO_MAIL3 = 22;
const MAIL4 = 23;
const TIPO_MAIL4 = 24;
const MAIL5 = 25;
const TIPO_MAIL5 = 26;
const URL_FACEBOOK = 27;
const URL_TWITTER = 28;
const URL_GOOGLEPLUS = 29;
const URL_YOUTUBE = 30;
const LIV_ACCESSIBILI = 31;

module.exports = function() {
console.log(`GET: ${PUB_AMM_URL}`);
    return new Promise(function(resolve, reject){
        request(PUB_AMM_URL, (err, res, csv_file) => {
            if (err) { return reject(err); }
        
            console.log('converting the CSV string in an array');
            const data = papa.parse(csv_file).data;
            data.shift();
        
            console.log('index data in lunar.js format')
            let paDb = {};
            let index = lunr(function () {
                this.ref('code');
                this.field('code', { boost: 6 });
                this.field('description', { boost: 3 });
        
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
            writeFileAtomicSync(path.join(__dirname, '..', 'public', 'assets', 'data', 'authorities.index.json'), serializedIndex);
        
            console.log('WRITE: authorities.db.json');
            const serializedPaDb = JSON.stringify(paDb);
            writeFileAtomicSync(path.join(__dirname, '..', 'public', 'assets', 'data', 'authorities.db.json'), serializedPaDb);

            resolve();
        });
    });
    
}
