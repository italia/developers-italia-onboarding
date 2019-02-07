'use strict';

const Path = require('path');
const Hapi = require('hapi');
const Mustache = require('mustache');
const fs = require('fs-extra');

const whiteList = 'smtp-account-config.json';

const init = async () => {
  const emailSentHandler = require('./src/email-sent');
  const registerConfirmHandler = require('./src/register-confirm');
  const registeredHandler = require('./src/registered');
  const repoHandler = require('./src/repo-list');
  const homeHandler = require('./src/home');

  const server = Hapi.server({
    port: 80,
    routes: {
      files: {
        relativeTo: Path.join(__dirname, 'public')
      }
    }
  });

  await server.register(require('inert'));
  await server.register(require('vision'));

  server.views({
    engines: {
      html: {
        compile: (template) => {
          Mustache.parse(template);

          return (context) => Mustache.render(template, context);
        }
      }
    },
    relativeTo: __dirname,
    path: 'src/tpl',
    layout: true,
    layoutPath: 'public'
  });

  server.route([{
    method: 'POST',
    path: '/email-sent',
    handler: emailSentHandler
  },{
    method: 'GET',
    path: '/repo-list',
    handler: repoHandler
  }, {
    method: 'GET',
    path: '/register-confirm',
    handler: registerConfirmHandler
  }, {
    method: 'GET',
    path: '/registered',
    handler: registeredHandler
  }, {
    method: 'GET',
    path: '/',
    handler: homeHandler
  }, {
    method: 'GET',
    path: '/{param*}',
    handler: {
      directory: {
        path: '.',
        redirectToSlash: true,
        index: true,
      }
    }
  }]);

  await server.start();
  console.log(`Server is running at port ${server.info.port}`);
};

process.on('unhandledRejection', (err) => {

  console.log(err);
  process.exit(1);
});


// Crea l'indice inverso e il database delle PA
require('./src/create-index.js')().then(() => {
  if (JSON.parse(process.argv.includes('dev')) || fs.existsSync(whiteList)) {
    init();
  } else {
    console.log('Attenzione! Creare prima un file di credenziali "smtp-account-config.json" seguendo il modello di account-config-tpl.json');
  }
});
