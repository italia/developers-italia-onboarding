'use strict';

const fs = require('fs');
const amministrazioni = require('../public/assets/data/authorities.db.json');
const nodemailer = require('nodemailer');
const mustache = require('mustache');

module.exports = function(request, reply){
    const referente = request.payload.nomeReferente;
    const ipa = request.payload.ipa;
    const url = request.payload.url;
    const pec = amministrazioni[ipa].pec;
    const amministrazione = amministrazioni[ipa].description;

    // Generate test SMTP service account from ethereal.email
    // Only needed if you don't have a real mail account for testing
    nodemailer.createTestAccount((err, account) => {
        // create reusable transporter object using the default SMTP transport
        const transporter = nodemailer.createTransport({
            host: 'smtp.ethereal.email',
            port: 587,
            secure: false, // true for 465, false for other ports
            auth: {
                user: account.user, // generated ethereal user
                pass: account.pass // generated ethereal password
            }
        });

        const template = fs.readFileSync('src/tpl/email.mst').toString('utf8');

        // setup email data with unicode symbols
        const mailOptions = {
            from: '"Team Digitale" <test@teamdigitale.com>', // sender address
            to: 'giuseppesantoro87@gmail.com', // list of receivers
            subject: 'Onboarding Developers Italia', // Subject line
            html: mustache.render(template, {
                referente: referente,
                url: url,
                amministrazione: amministrazione,
                link: `http://localhost:3000/registered?referente=${referente}&ipa=${ipa}&url=${url}    `
            })
        };

        // send mail with defined transport object
        transporter.sendMail(mailOptions, (error, info) => {
            if (error) {
                return console.log(error);
            }
            console.log('Message sent: %s', info.messageId);
            // Preview only available when sending through an Ethereal account
            console.log('Preview URL: %s', nodemailer.getTestMessageUrl(info));
        });
    });

    return `Abbiamo inviato il link con cui confermare l'iscrizione tramite email all'indirizzo ${pec}.`;
}

