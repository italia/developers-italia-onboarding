'use strict';

const config = require('./src/config');
const Hapi = require('@hapi/hapi');
const HapiUrl = require('hapi-url');
const Mustache = require('mustache');
const Path = require('path');

const init = async () => {
  const emailSentHandler = require('./src/email-sent');
  const registerConfirmHandler = require('./src/register-confirm');
  const registeredHandler = require('./src/registered');
  const repoHandler = require('./src/repo-list');
  const homeHandler = require('./src/home');
  const faqHandler = require('./src/faq');

  const httpPort = config.port;

  console.log(`Using API at ${config.apiURL}`);

  const server = Hapi.server({
    port: httpPort,
    routes: {
      files: {
        relativeTo: Path.join(__dirname, 'public')
      }
    }
  });

  await server.register(require('@hapi/inert'));
  await server.register(require('@hapi/vision'));

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
    method: 'GET',
    path: '/assets/js/jquery/{param*}',
    handler: {
      directory: {
        path: '../node_modules/jquery/dist/',
        redirectToSlash: true,
        index: false
      }
    }
  }, {
    method: 'GET',
    path: '/bootstrap-italia/{param*}',
    handler: {
      directory: {
        path: '../node_modules/bootstrap-italia/',
        redirectToSlash: true,
        index: false
      }
    }
  }, {
    method: 'POST',
    path: '/email-sent',
    handler: emailSentHandler
  }, {
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
    path: '/faq',
    handler: faqHandler
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
  }
  ]);

  server.events.on('response', (request) => {
    const { pathname } = HapiUrl(request);

    if (!pathname.match('^/bootstrap-italia/|^/assets/')) {
      const now = new Date(Date.now()).toISOString();

      const address = request.info.remoteAddress;
      const method = request.method.toUpperCase();
      const code = request.response.statusCode;
      const userAgent = request.headers['user-agent'];

      console.info(`${address} [${now}] "${method} ${pathname}" ${code} "${userAgent}"`);
    }
  });

  await server.start();
  console.log(`Server is running at port ${server.info.port}`);
};

process.on('unhandledRejection', (err) => {

  console.log(err);
  process.exit(1);
});

init();
