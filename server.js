'use strict';

const Path = require('path');
const Hapi = require('hapi');

const emailSentHandler = require('./src/email-sent');
const registeredHandler = require('./src/registered');
const repoHandler = require('./src/yaml-repo');

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

  server.route([{
    method: 'POST',
    path: '/email-sent',
    handler: emailSentHandler
  },{
    method: 'GET',
    path: '/registered',
    handler: registeredHandler
  },{
    method: 'GET',
    path: '/{param*}',
    handler: {
      directory: {
        path: '.',
        redirectToSlash: true,
        index: true,
      }
    }
  }, {
    method: 'GET',
    path: '/yaml-repo',
    handler: repoHandler
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
