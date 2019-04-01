'use strict';

const fs = require('fs-extra');
const nodemailer = require('nodemailer');
const mustache = require('mustache');
const jwt = require('jsonwebtoken');
const key = require('./get-jwt-key.js')();
const amministrazioni = require('../public/assets/data/authorities.db.json');
const validateUrl = require('./validator.js');
const { VALIDATION_OK, VALIDATION_NOT_WHITELIST, VALIDATION_INVALID_URL } = require('./validator-result.js');
const getErrorMessage = require('./validation-error-message.js');

module.exports = function (request, h) {
  const referente = request.payload.nomeReferente;
  const ipa = request.payload.ipa;
  const url = request.payload.url;
  const pec = amministrazioni[ipa].pec;
  const amministrazione = amministrazioni[ipa].description;

  let validationResult = validateUrl(url);
  if (validationResult != VALIDATION_OK) {
    let data = { errorMsg: getErrorMessage(validationResult) };
    return h.view('main-content', data, { layout: 'index' });
  }

  const mailServerConfig = JSON.parse(process.argv.includes('dev') ?
    fs.readFileSync('config-dev.json').toString('utf8') :
    fs.readFileSync('config-prod.json').toString('utf8'));

  if (process.argv.includes('dev')) {
    // Generate test SMTP service account from ethereal.email
    // Only needed if you don't have a real mail account for testing
    nodemailer.createTestAccount((err, account) => {
      // create reusable transporter object using the default SMTP transport
      const transporter = nodemailer.createTransport({
        host: mailServerConfig.host,
        port: mailServerConfig.port,
        secure: mailServerConfig.secure, // true for 465, false for other ports
        auth: {
          user: account.user,
          pass: account.pass
        }
      });
      sendEmail(transporter);
    });
  } else {
    const configAccountString = fs.readFileSync('smtp-account-config.json').toString('utf8');
    const accountConfig = JSON.parse(configAccountString);

    const transporter = nodemailer.createTransport({
      host: mailServerConfig.host,
      port: mailServerConfig.port,
      secure: mailServerConfig.secure, // true for 465, false for other ports
      auth: {
        user: accountConfig.user,
        pass: accountConfig.pass
      }
    });
    sendEmail(transporter);
  }

  function sendEmail(transporter) {
    const template = fs.readFileSync('src/tpl/email.mst').toString('utf8');
    const token = jwt.sign({
      referente: referente,
      ipa: ipa,
      url: url
    }, key);

    const destinationLink = JSON.parse(process.argv.includes('dev')) ?
      `http://${mailServerConfig.applicationHost}:${mailServerConfig.applicationPort}/register-confirm?token=${token}` :
      `http://${mailServerConfig.applicationHost}/register-confirm?token=${token}`;

    // setup email data with unicode symbols
    const mailOptions = {
      from: '"Team Digitale" <test@teamdigitale.com>', // sender address
      to: pec, // list of receivers
      subject: 'Onboarding Developer Italia', // Subject line
      html: mustache.render(template, {
        referente: referente,
        url: url,
        amministrazione: amministrazione,
        link: destinationLink
      })
    };

    // send mail with defined transport object
    transporter.sendMail(mailOptions, (error, info) => {
      if (error) {
        return console.error(error);
      }
      console.log('Message sent: %s', info.messageId);
      // Preview only available when sending through an Ethereal account
      console.log('Preview URL: %s', nodemailer.getTestMessageUrl(info));
    });
  }

  let data = { pec: pec };
  return h.view('email-sent', data, { layout: 'index' });
};
