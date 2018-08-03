'use strict';

//const fs = require('fs');
const Path = require('path');
const Hapi = require('hapi');
const Mustache = require('mustache');

const emailSentHandler = require('./src/email-sent');
const registerConfirmHandler = require('./src/register-confirm');
const registeredHandler = require('./src/registered');
const homeHandler = require('./src/home');

const server = Hapi.server({
  port: 3000,
  host: 'localhost',
  routes: {
    files: {
      relativeTo: Path.join(__dirname, 'public')
    }
  }
});

const init = async () => {
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
  console.log(`Server running at: ${server.info.uri}`);
};

process.on('unhandledRejection', (err) => {

  console.log(err);
  process.exit(1);
});


// Crea l'indice inverso e il database delle PA
require('./src/create-index.js')().then(() => {
  init();
});
