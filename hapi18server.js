'use strict';

const fs = require('fs');
const path = require('path');

async function loadLocalesDir(options){ 
	 console.log('load locales dir');
	let opts = {};
        fs.readdirSync(options.directory).forEach(function (file) {
			const local = file.split('.').slice(0, -1).join('.')
			opts[local] = JSON.parse(fs.readFileSync(path.join(options.directory, file), 'utf8'));
                    });
	console.log('fine opts');
	return opts;
}

exports.plugin = {
       	name: 'hapi18server',
	version: '0.1',

	register: async function (server, options) {
		let locales = await loadLocalesDir(options);
	console.log('loc');
	console.log(locales);
        
        server.expose('getCatalog', function getCatalog() {
            return locales;
        });

        //await someAsyncMethods();
	server.ext('onPreAuth', function (request, h) {
      		request.i18n = {};
		request.i18n.getCatalog = function (){
			var locale = request.server.plugins['hapi18server'].getCatalog();
			var param = request.query['lang']
			if (!param){
				return locale['it'];
			}

			return locale[param];
		}
      	 	return h.continue;
	    	});
    	}
}


