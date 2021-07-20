'use strict';

const config = require('./config');
const fs = require('fs-extra');
const nodemailer = require('nodemailer');
const mustache = require('mustache');
const jwt = require('jsonwebtoken');
const key = require('./get-jwt-key')();
const validator = require('./validator');

module.exports = async function (request, h) {
  const referente = request.payload.nomeReferente.trim();
  const refTel = request.payload.telReferente.replace(/\s/g,'');
  const ipa = request.payload.ipa.trim();
  const amministrazione = request.payload.description;
  const url = request.payload.url.trim();
  const overridePec = (config.email.overrideRecipientAddr
                   && config.email.overrideRecipientAddr.length > 1);
  const pec = overridePec ? config.email.overrideRecipientAddr : request.payload.pec;

  const originalPec = request.payload.pec;

  if (! validator.isValidCodeHostingUrl(url)) {
    let data = { errorMsg: 'Indirizzo del repository non valido', pa: request.payload };
    return h.view('main-content', data, { layout: 'index' });
  }
  if (! validator.isValidPhoneNumber(refTel)) {
    let data = { errorMsg: 'Numero di telefono non valido', pa: request.payload };
    return h.view('main-content', data, { layout: 'index' });
  }
  if (validator.isAlreadyOnboarded(ipa, url)) {
    let data = { errorMsg: 'Questo repository è già presente', pa: request.payload };
    return h.view('main-content', data, { layout: 'index' });
  }
  const ipaMatchesPec = await validator.ipaMatchesPec(ipa, originalPec);
  if (ipaMatchesPec === null ) {
    let data = {
      errorMsg: 'Errore inaspettato nel controllo della validità dei dati, riprovare più tardi',
      pa: request.payload
    };
    return h.view('main-content', data, { layout: 'index' });
  }
  if (! ipaMatchesPec) {
    let data = { errorMsg: 'Nessun Ente con questo codice iPA e PEC', pa: request.payload };
    return h.view('main-content', data, { layout: 'index' });
  }

  if (config.environment == 'dev') {
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
