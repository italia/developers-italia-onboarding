'use strict';

const config = require('./config');
const fs = require('fs-extra');
const nodemailer = require('nodemailer');
const mustache = require('mustache');
const jwt = require('jsonwebtoken');
const key = require('./get-jwt-key')();
const validator = require('./validator');
const {VALIDATION_OK} = require('./validator-result');
const getErrorMessage = require('./validation-error-message');

module.exports = function (request, h) {
  const referente = request.payload.nomeReferente;
  const refTel = request.payload.telReferente;
  const ipa = request.payload.ipa;
  const amministrazione = request.payload.description;
  const url = request.payload.url;
  const overridePec = config.mail.overrideRecipientAddr
                   && config.mail.overrideRecipientAddr.length > 1
  const pec = overridePec ? config.mail.overrideRecipientAddr : request.payload.pec;

  const originalPec = request.payload.pec;

  // Server validation
  let validationResultUrl = validator.url(url);
  let validationResultPhone = validator.phone(refTel);
  if (validationResultUrl != VALIDATION_OK) {
    let data = {errorMsg: getErrorMessage(validationResultUrl)};
    return h.view('main-content', data, {layout: 'index'});
  } else if (validationResultPhone != VALIDATION_OK) {
    let data = {errorMsg: getErrorMessage(validationResultPhone)};
    return h.view('main-content', data, {layout: 'index'});
  }

  if (config.environment == "dev") {
    // Generate test SMTP service account from ethereal.email
    // Only needed if you don't have a real mail account for testing
    nodemailer.createTestAccount((err, account) => {
      // create reusable transporter object using the default SMTP transport
      const transporter = nodemailer.createTransport({
        host: config.smtp.hostname,
        port: config.smtp.port,
        secure: config.smtp.secure,
        auth: {
          user: account.user,
          pass: account.pass
        }
      });
      sendEmail(transporter);
    });
  } else {
    const transporter = nodemailer.createTransport({
      host: config.smtp.hostname,
      port: config.smtp.port,
      secure: config.smtp.secure,
      auth: {
        user: config.smtp.username,
        pass: config.smtp.password
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

    const destinationLink = `${config.appBaseUrl}/register-confirm?token=${token}`;

    // setup email data with unicode symbols
    const mailOptions = {
      from: config.email.from,
      to: pec, // list of receivers
      cc: config.email.cc,
      bcc: config.email.bcc,
      subject: config.email.subject,
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
