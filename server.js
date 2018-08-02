'use strict';

const Path = require('path');
const Hapi = require('hapi');

require('./src/create-index.js')().then(() => {
  init();
});

async function init() {

  const emailSentHandler = require('./src/email-sent');
  const registeredHandler = require('./src/registered');

  const server = Hapi.server({
    port: 3000,
    host: '0.0.0.0',
    routes: {
      files: {
        relativeTo: Path.join(__dirname, 'public')
      }
    }
  });

  await server.register(require('inert'));

  server.route([{
    method: 'POST',
    path: '/email-sent',
    handler: emailSentHandler
  }, {
    method: 'GET',
    path: '/registered',
    handler: registeredHandler
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
}

process.on('unhandledRejection', (err) => {

  console.log(err);
  process.exit(1);
});
