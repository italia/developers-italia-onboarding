'use strict';

const fs = require('fs-extra');
const low = require('lowdb');
const FileSync = require('lowdb/adapters/FileSync');
const amministrazioni = require('../public/assets/data/authorities.db.json');

const whitelistFile = 'private/data/whitelist.db.json';
fs.ensureFileSync(whitelistFile);
const adapter = new FileSync(whitelistFile);
const db = low(adapter);

// Set some defaults (required if your JSON file is empty)
db.defaults({ registrati: [] }).write()

module.exports = function(request, reply){
    const referente = request.query.referente;
    const ipa = request.query.ipa;
    const url = request.query.url;
    const pec = amministrazioni[ipa].pec;

    db.get('registrati')
    .push({
        referente: referente,  
        ipa: ipa,
        url: url,
        pec: pec
    })
    .write()

    return 'Registrazione avvenuta con successo';
}

