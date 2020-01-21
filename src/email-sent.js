'use strict';

const fs = require('fs-extra');
const nodemailer = require('nodemailer');
const mustache = require('mustache');
const jwt = require('jsonwebtoken');
const key = require('./get-jwt-key.js')();
const validator = require('./validator.js');
const {VALIDATION_OK} = require('./validator-result.js');
const getErrorMessage = require('./validation-error-message.js');

module.exports = function (request, h) {
  const mailServerConfig = JSON.parse(process.argv.includes('dev') ?
    fs.readFileSync('config-dev.json').toString('utf8') :
    fs.readFileSync('config-prod.json').toString('utf8'));

  const referente = request.payload.nomeReferente;
  const refTel = request.payload.telReferente;
  const ipa = request.payload.ipa;
  const amministrazione = request.payload.description;
  const url = request.payload.url;
  const pec =
    mailServerConfig.overrideRecipient && mailServerConfig.overrideMail ?
      mailServerConfig.overrideMail.rcpt :
      request.payload.pec;

  const originalPec = request.payload.pec;
  const overridePec = (mailServerConfig.overrideRecipient && mailServerConfig.overrideMail);

  // server validation
  let validationResultUrl = validator.url(url);
  let validationResultPhone = validator.phone(refTel);
  let validationCheckDups = validator.checkDups(ipa, url);
  if (validationResultUrl != VALIDATION_OK) {
    let data = {errorMsg: getErrorMessage(validationResultUrl)};
    return h.view('main-content', data, {layout: 'index'});
  } else if (validationResultPhone != VALIDATION_OK) {
    let data = {errorMsg: getErrorMessage(validationResultPhone)};
    return h.view('main-content', data, {layout: 'index'});
  }else if (validationCheckDups != VALIDATION_OK) {
    let data = {errorMsg: getErrorMessage(validationCheckDups)};
    return h.view('main-content', data, {layout: 'index'});
  }

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
      refTel: refTel,
      ipa: ipa,
      url: url,
      description: amministrazione,
      pec: originalPec
    }, key);

    const destinationLink = `${mailServerConfig.applicationBaseURL}/register-confirm?token=${token}`;

    const from = mailServerConfig.mail && mailServerConfig.mail.from ?
      mailServerConfig.mail.from :
      '"Team Digitale" <test@teamdigitale.com>';

    const subject = mailServerConfig.mail && mailServerConfig.mail.subject ?
      mailServerConfig.mail.subject :
      'Onboarding Developers Italia';

    // setup email data with unicode symbols
    const mailOptions = {
      from: from, // sender address
      to: pec, // list of receivers
      cc: (mailServerConfig.mail.cc) ? mailServerConfig.mail.cc : '',
      bcc: (mailServerConfig.mail.bcc) ? mailServerConfig.mail.bcc : '',
      subject: subject, // Subject line
      html: mustache.render(template, {
        referente: referente,
        refTel: refTel,
        url: url,
        codiceIPA: ipa,
        amministrazione: amministrazione,
        link: destinationLink,
        originalPec: originalPec,
        overridePec: overridePec
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

  let data = {pec: originalPec};
  return h.view('email-sent', data, {layout: 'index'});
};
